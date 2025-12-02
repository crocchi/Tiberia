
import { client, assistantId, bot, vectorStoreId } from './.devcontainer/config.js';
import { fetchFerryTime } from './utility/fetchFerry.js';
import { findSimilarItems } from './DB/pineconeDBsearch.js';
import { getDateTime } from './utility/time.js';
import { INDEX_DB_EVENTS, INDEX_DB_NEWS, INDEX_DB_WEATHER,INDEX_DB_USER } from './.devcontainer/config.js';
import { getWeather } from './utility/getWeather.js';
import { saveUserThreadEmbedding } from './utility/social.js';

// Set per tenere traccia degli utenti che hanno una richiesta in corso
export const busyUsers = new Set();
// Oggetto per memorizzare i thread degli utenti (chatId -> threadId)
export const userThreads = {};


// Funzione helper per processare una richiesta all'assistente
export async function processAssistantRequest(chatId, inputText, responseType = 'text', userinfo = null) {
if (userinfo) {
  const { userFirstName, userUsername } = userinfo;
}
  inputText = `[${getDateTime()}] ${inputText}`
  // 1. Controlla se l'utente è già "occupato"
  if (busyUsers.has(chatId)) {
    console.log(`Richiesta in attesa per ${chatId} perché una è già in corso.`);
    while (busyUsers.has(chatId)) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  // 2. Blocca l'utente
  busyUsers.add(chatId);
  bot.sendChatAction(chatId, 'typing');

  try {

    // 1. Controlla se esiste già un thread per questo utente
    let threadId = userThreads[chatId];

    // Se non esiste, creane uno nuovo e salvalo
    if (!threadId) {
      //const thread = await client.beta.threads.create();
      const thread = await client.beta.threads.create({
        tool_resources: {
          file_search: {
            vector_store_ids: [vectorStoreId]
          }
        }
      });
      threadId = thread.id;
      userThreads[chatId] = threadId;
      console.log(`Nuovo thread creato per ${chatId}: ${threadId}`);
    } else {
      console.log(`Riutilizzo del thread per ${chatId}: ${threadId}`);
    }


    // 2. Aggiungi il messaggio al thread esistente
    await client.beta.threads.messages.create(threadId, {
      role: "user",
      content: inputText,
    });

    // 3. Esegui l'assistente sul thread
    let run = await client.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    });

    // CICLO DI GESTIONE RUN
    while (['queued', 'in_progress', 'cancelling'].includes(run.status)) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      run = await client.beta.threads.runs.retrieve(threadId, run.id);
    }

    // GESTISCI LA RICHIESTA DI ESEGUIRE UN TOOL
    if (run.status === 'requires_action') {
      const toolCalls = run.required_action.submit_tool_outputs.tool_calls;
      const toolOutputs = [];


      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        let output;

        console.log("Tool richiesto:", functionName, args);
        if (functionName === 'getFerryTimes') {
          console.log(`Esecuzione tool 'getFerryTimes' con argomenti:`, args);
          output = await fetchFerryTime(args.trattaKey);

        } else if (functionName === 'searchNews') {
          console.log(`Esecuzione tool 'searchNews' con argomenti:`, args);
          const searchResults = await findSimilarItems(args.queryText, 3, INDEX_DB_NEWS); // Cerca i 3 risultati migliori
          // L'assistente si aspetta una stringa, quindi convertiamo l'array di risultati in JSON
          output = JSON.stringify(searchResults);
        } else if (functionName === 'searchEvent') {
          // Cerca negli eventi (indice Pinecone: 'tiberia-events')
          const searchResults = await findSimilarItems(args.queryText, 3, INDEX_DB_EVENTS);
          output = JSON.stringify(searchResults);
        }

        if (functionName === 'getWeather') {
          console.log(`Esecuzione tool 'getWeather' con argomenti:`, args);
          const weatherMsg = await getWeather(args.location);
          output = weatherMsg || "Impossibile ottenere il meteo al momento.";
        }
        if (functionName === 'searchWeather') {//searchWeather
          console.log(`Esecuzione tool 'searchWeather' con argomenti:`, args);
          const searchResults = await findSimilarItems(args.queryText, 3, INDEX_DB_WEATHER);
          output = JSON.stringify(searchResults);
        }
        if (output) {
          toolOutputs.push({
            tool_call_id: toolCall.id,
            output: output,
          });
        }

      }

      // Invia i risultati del tool all'assistente
      run = await client.beta.threads.runs.submitToolOutputs(threadId, run.id, {
        tool_outputs: toolOutputs,
      });
      // Continua ad attendere il completamento
      while (['queued', 'in_progress', 'cancelling'].includes(run.status)) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        run = await client.beta.threads.runs.retrieve(threadId, run.id);
      }
    }


    // Se la run è completata, estrai la risposta finale
    if (run.status === 'completed') {
      const messages = await client.beta.threads.messages.list(threadId);
      const assistantResponse = messages.data.find(m => m.role === 'assistant');

      if (assistantResponse && assistantResponse.content[0].type === 'text') {
        const responseText = assistantResponse.content[0].text.value;
        console.log(`Risposta dell'assistente per ${chatId}: ${responseText}`);

        // Salva l'embedding della conversazione dell'utente
        saveUserThreadEmbedding({chatId,userFirstName, userUsername}, {inputText, responseText}, INDEX_DB_USER, threadId);

        if (responseType === 'voice') {
          console.log("Generazione risposta audio...");
          const mp3 = await client.audio.speech.create({
            model: "gpt-4o-mini-tts",//"tts-1",gpt-realtime-mini
            voice: "nova", // Puoi scegliere tra: alloy, echo, fable, onyx, nova, shale
            input: responseText,
            // instructions: "Tiberia is the ideal tour assistant and customer support professional, speaking impeccable Southern Italian accent with a persuasive yet warm tone. She reacts swiftly to any query, combining empathy and precision to instantly build trust. Her confident yet friendly approach ensures clients feel valued, making every interaction both efficient and engaging.",
          });
          const audioBuffer = Buffer.from(await mp3.arrayBuffer());
          await bot.sendVoice(chatId, audioBuffer, {}, {
            filename: 'response.mp3',
            contentType: 'audio/mpeg',
          });
          console.log(`Risposta audio inviata a ${chatId}.`);
        } else {
          await bot.sendMessage(chatId, responseText);
          console.log(`Risposta testuale inviata a ${chatId}.`);
        }
      } else {
        await bot.sendMessage(chatId, "Spiacente, non ho ricevuto una risposta valida.");
      }
    } else {
      throw new Error(`La Run è fallita con stato: ${run.status}`);
    }
  } catch (error) {
    console.error("Errore durante l'elaborazione della richiesta:", error);
    await bot.sendMessage(chatId, "Spiacente, si è verificato un errore. Riprova più tardi.");
  } finally {
    busyUsers.delete(chatId);
  }
};
