
import { client, assistantId, bot } from './.devcontainer/config.js';

// Set per tenere traccia degli utenti che hanno una richiesta in corso
export const busyUsers = new Set();
// Oggetto per memorizzare i thread degli utenti (chatId -> threadId)
export const userThreads = {};

// Funzione helper per processare una richiesta all'assistente
export async function processAssistantRequest(chatId, inputText, responseType = 'text') {
  
   // 1. Controlla se l'utente è già "occupato"
  if (busyUsers.has(chatId)) {
    console.log(`Richiesta in attesa per ${chatId} perché una è già in corso.`);
    while(busyUsers.has(chatId)) {
      await new Promise(resolve => setTimeout(resolve, 800));
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
      const thread = await client.beta.threads.create();
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
    const run = await client.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    });

    // 4. Attendi il completamento della run
    let currentRun = await client.beta.threads.runs.retrieve(threadId, run.id);
    while (currentRun.status !== 'completed' && currentRun.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      currentRun = await client.beta.threads.runs.retrieve(threadId, run.id);
    }

    if (currentRun.status === 'failed') {
      throw new Error(`La Run è fallita: ${currentRun.last_error?.message}`);
    }

    const messages = await client.beta.threads.messages.list(threadId);
    const assistantResponse = messages.data.find(m => m.role === 'assistant');

    if (assistantResponse && assistantResponse.content[0].type === 'text') {
      const responseText = assistantResponse.content[0].text.value;

      if (responseType === 'voice') {
        // Genera e invia una risposta audio
        console.log("Generazione risposta audio...");
        const mp3 = await client.audio.speech.create({
          model: "gpt-4o-mini-tts",//"tts-1",
          voice: "nova", // Puoi scegliere tra: alloy, echo, fable, onyx, nova, shale
          input: responseText,
          instructions: "Tiberia is the ideal tour assistant and customer support professional, speaking impeccable Southern Italian accent with a persuasive yet warm tone. She reacts swiftly to any query, combining empathy and precision to instantly build trust. Her confident yet friendly approach ensures clients feel valued, making every interaction both efficient and engaging.",
        });
        const audioBuffer = Buffer.from(await mp3.arrayBuffer());
        await bot.sendVoice(chatId, audioBuffer,{}, {
            filename: 'response.mp3',
            contentType: 'audio/mpeg',
        });

        console.log(`Risposta audio inviata a ${chatId}.`);
      } else {
        // Invia una risposta testuale
        await bot.sendMessage(chatId, responseText);
        console.log(`Risposta testuale inviata a ${chatId}.`);
      }
    } else {
      await bot.sendMessage(chatId, "Spiacente, non ho ricevuto una risposta valida.");
    }
  } catch (error) {
    console.error("Errore durante l'elaborazione della richiesta:", error);
    await bot.sendMessage(chatId, "Spiacente, si è verificato un errore. Riprova più tardi.");
  } finally{
    // 3.Sblocca l'utente
    busyUsers.delete(chatId);
  }
};