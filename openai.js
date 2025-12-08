
import { client, assistantId, bot, vectorStoreId } from './.devcontainer/config.js';
import { fetchFerryTime } from './utility/fetchFerry.js';
import { findSimilarItems } from './DB/pineconeDBsearch.js';
import { getDateTime } from './utility/time.js';
import { INDEX_DB_EVENTS, INDEX_DB_NEWS, INDEX_DB_WEATHER, INDEX_DB_USER } from './.devcontainer/config.js';
import { getWeather } from './utility/getWeather.js';
import { saveUserThreadEmbedding } from './utility/social.js';
import fetch from 'node-fetch';

// Set per tenere traccia degli utenti che hanno una richiesta in corso
export const busyUsers = new Set();
// Oggetto per memorizzare i thread degli utenti (chatId -> threadId)
export const userThreads = {};


// Funzione helper per processare una richiesta all'assistente
export async function processAssistantRequest(chatId, inputText, responseType = 'text', userinfo = null) {
  let userFirstName, userUsername;
  if (userinfo) {
    ({ userFirstName, userUsername } = userinfo);
  }
  inputText = `[${getDateTime()}] ${inputText}`
  // 1. Controlla se l'utente è già "occupato"
  if (busyUsers.has(chatId)) {
    console.log(`Richiesta in attesa per ${chatId} perché una è già in corso.`);
    // bot.sendMessage(chatId, "Sto ancora elaborando la tua ultima richiesta. Attendi un momento, per favore...");
    /*while (busyUsers.has(chatId)) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }*/ //troppi msg ..se nn è disponibile nn ti rip è basta...
    //altrimenti ti manda un msg ogni 3 secondi x tutti i msg ricevuti...
    return
  }
  // 2. Blocca l'utente
  busyUsers.add(chatId);

  // Invia azione di "sta scrivendo o vocale" ogni 4 secondi
  let typeOfResponse = responseType;
  typeOfResponse = typeOfResponse === 'voice' ? 'record_voice' : 'typing';
  let typingInterval = setInterval(() => {
    bot.sendChatAction(chatId, typeOfResponse);
  }, 4500);


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

      await bot.sendMessage(chatId, `Tool richiesti: ${toolCalls.map(tc => tc.function.name).join(', ')}. Query:Sto recuperando le informazioni...`);
      console.log("Tool calls:", toolCalls);
      /*Tool calls: [
  {
    id: 'call_sotiSiiuw6WOM0M0gfYgkiNc',
    type: 'function',
    function: {
      name: 'searchNews',
      arguments: '{"queryText":"news Capri 8 dicembre 2025"}'
    }
  }
] */
      //gestisci tutte le chiamate ai tool
      const toolOutputs = await handleToolCalls(toolCalls);

      console.log("Tool outputs ottenuti:", toolOutputs);

      // Invia i risultati del tool all'assistente
      run = await client.beta.threads.runs.submitToolOutputs(threadId, run.id, {
        tool_outputs: toolOutputs,
      });

      // Gestione ciclica di run.status
      while (true) {
        if (['queued', 'in_progress', 'cancelling'].includes(run.status)) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          run = await client.beta.threads.runs.retrieve(threadId, run.id);
        } else if (run.status === 'requires_action') {
          const toolCalls = run.required_action.submit_tool_outputs.tool_calls;
          const toolOutputs = await handleToolCalls(toolCalls);

          run = await client.beta.threads.runs.submitToolOutputs(threadId, run.id, {
            tool_outputs: toolOutputs,
          });
        } else {
          break;
        }
      }
    }


    // Se la run è completata, estrai la risposta finale
    if (run.status === 'completed') {
      const messages = await client.beta.threads.messages.list(threadId);
      const assistantResponse = messages.data.find(m => m.role === 'assistant');
      // Cerca attachment/file nella risposta
      //const fileContent = assistantResponse.content.find(c => c.type === 'file');


      if (assistantResponse && assistantResponse.content[0].type === 'text') {
        const responseText = assistantResponse.content[0].text.value;
        console.log(`Risposta dell'assistente per ${chatId}: ${responseText}`);

        // Salva l'embedding della conversazione dell'utente
       // saveUserThreadEmbedding({ chatId, userFirstName, userUsername }, { inputText, responseText }, INDEX_DB_USER, threadId, "test-fine-tunning");

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
        } /*if (fileContent) {
          console.log("Risposta contiene un file, preparazione invio...");
          const fileId = fileContent.file_id;
          // Scarica il file da OpenAI
          const file = await client.files.retrieve(fileId);
          const fileUrl = file.download_url; // oppure usa file.content se disponibile

          // Scarica il file come buffer
          const response = await fetch(fileUrl);
          const fileBuffer = await response.buffer();
          // Invia il file su Telegram
          await bot.sendDocument(chatId, fileBuffer, {}, { filename: 'output.pdf' });
        }*/ else {
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
    // Quando hai finito:
    clearInterval(typingInterval);
    busyUsers.delete(chatId);
  }
};

async function handleToolCalls(toolCalls) {
  const toolOutputs = [];
  let toolUsedForTunning = [];

  for (const toolCall of toolCalls) {
    const functionName = toolCall.function.name;
    const args = JSON.parse(toolCall.function.arguments);
    let output;

    console.log(`Esecuzione tool ${functionName} con argomenti:`, args);
    if (functionName === 'getFerryTimes') {
      //toolUsedForTunning[]
      output = await fetchFerryTime(args.trattaKey);
    } else if (functionName === 'searchNews') {
      const searchResults = await findSimilarItems(args.queryText, 3, INDEX_DB_NEWS);
      output = JSON.stringify(searchResults);
    } else if (functionName === 'searchEvent') {
      const searchResults = await findSimilarItems(args.queryText, 3, INDEX_DB_EVENTS);
      output = JSON.stringify(searchResults);
    } else if (functionName === 'getWeather') {
      const weatherMsg = await getWeather(args.location);
      output = weatherMsg || "Impossibile ottenere il meteo al momento.";
    } else if (functionName === 'searchWeather') {
      const searchResults = await findSimilarItems(args.queryText, 3, INDEX_DB_WEATHER);
      output = JSON.stringify(searchResults);
    } else if (functionName === 'code_interpreter') {
      console.log("Esecuzione di code_interpreter, nessun output da restituire.");
      // Qui non devi fare nulla: la risposta viene gestita direttamente da OpenAI
      // Puoi semplicemente restituire un oggetto vuoto o loggare l'evento
      output = ""; // oppure output = null;
    } else {
      output = `<${functionName}>`;
    }

    if (output) {
      toolOutputs.push({
        tool_call_id: toolCall.id,
        output: output,
      });
    }
  }
  return toolOutputs;
}