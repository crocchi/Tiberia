//. TIBERIA V.0.0.1

import { app, port, client, assistantId, bot } from './.devcontainer/config.js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();


// Oggetto per memorizzare i thread degli utenti (chatId -> threadId)
const userThreads = {};



// --- GESTIONE MESSAGGI TELEGRAM ---
bot.on('message', async (msg) => {

  // Ignora se è un messaggio di posizione o msg vuoto, gestito da 'location'
  if (msg.location || !msg.text || msg.voice) {
    return;
  }

  const chatId = msg.chat.id;
  const userInput = msg.text;

  console.log(`Messaggio ricevuto da ${chatId}: "${userInput}"`);
  await processAssistantRequest(chatId, userInput, 'text');
});

// --- GESTIONE MESSAGGI VOCALI ---
bot.on('voice', async (msg) => {
  const chatId = msg.chat.id;
  const fileId = msg.voice.file_id;
  console.log(`Messaggio vocale ricevuto da ${chatId}`);

  try {
   // await bot.sendMessage(chatId, "Sto ascoltando il tuo messaggio vocale...");
    bot.sendChatAction(chatId, 'typing');

    // 1. Ottieni il link per scaricare il file
    const fileLink = await bot.getFileLink(fileId);

    // 2. Scarica il file audio
    const response = await fetch(fileLink);
    if (!response.ok) {
      throw new Error(`Errore durante il download del file: ${response.statusText}`);
    }
    //const audioBuffer = await response.buffer();

    // 3. Trascrivi l'audio usando OpenAI Whisper
    // Nota: la libreria openai si aspetta un oggetto con nome file e stream
    const transcription = await client.audio.transcriptions.create({
      file: response, // Passa direttamente l'oggetto 'response' di fetch
      model: 'whisper-1',
    });

    const transcribedText = transcription.text;
    console.log(`Testo trascritto: "${transcribedText}"`);

    // 4. Invia il testo trascritto all'assistente
    if (transcribedText) {
      await processAssistantRequest(chatId, transcribedText, 'voice');
    } else {
      await bot.sendMessage(chatId, "Non sono riuscito a capire cosa hai detto. Prova a parlare più chiaramente.");
    }

  } catch (error) {
    console.error("Errore durante la gestione del messaggio vocale:", error);
    await bot.sendMessage(chatId, "Spiacente, si è verificato un errore durante l'elaborazione del tuo messaggio vocale.");
  }
});



// Funzione helper per processare una richiesta all'assistente
async function processAssistantRequest(chatId, inputText, responseType = 'text') {
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
          model: "tts-1",
          voice: "sage", // Puoi scegliere tra: alloy, echo, fable, onyx, nova, shale
          input: responseText,
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
  }
};


// --- GESTIONE POSIZIONE ---
bot.on('location', async (msg) => {
  const chatId = msg.chat.id;
  const { latitude, longitude } = msg.location;

  console.log(`Posizione ricevuta da ${chatId}: Lat ${latitude}, Lon ${longitude}`);
  await bot.sendMessage(chatId, "Grazie! Sto cercando cosa c'è di interessante vicino a te...");

  try {
    // 1. Reverse Geocoding con OpenStreetMap
    const geoResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
      headers: {
        'User-Agent': 'TiberiaBot/1.0 (un tuo contatto o sito web)'
      }
    });
    //console.log(geoData);
    const geoData = await geoResponse.json();

    const placeName = geoData.display_name || "una posizione specifica a Capri";
    console.log(`Posizione identificata come: ${placeName}`);

    // 2. Crea il prompt per l'assistente
    const prompt = `L'utente ha condiviso la sua posizione e si trova vicino a: "${placeName}". Descrivi i punti di interesse, le attività o le esperienze culturali nelle immediate vicinanze. Sii una guida turistica utile.`;

    // 3. Invia il prompt all'assistente
    await processAssistantRequest(chatId, prompt);

    // 4. Invia un pulsante con la mappa della posizione dell'utente
    const mapUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`;
    const options = {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Apri la tua posizione sulla mappa", url: mapUrl }]
        ]
      }
    };
    await bot.sendMessage(chatId, "Ecco la tua posizione attuale:", options);



  } catch (error) {
    console.error("Errore durante la gestione della posizione:", error);
    await bot.sendMessage(chatId, "Spiacente, non sono riuscito a identificare la tua posizione. Riprova.");
  }
});

// Endpoint di base per i controlli di salute di Render
app.get('/', (req, res) => {
  res.send('Bot Tiberia è attivo!');
});

// Avvia il server
app.listen(port, () => {
  console.log(`Bot Tiberia avviato e in ascolto sulla porta ${port}`);
});