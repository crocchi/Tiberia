//. TIBERIA V.0.0.1
import OpenAI from "openai";
import TelegramBot from 'node-telegram-bot-api';
import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();


// --- CONFIGURAZIONE EXPRESS ---
const app = express();
// Render fornisce la porta tramite la variabile d'ambiente PORT
const port = process.env.PORT || 3000; 
app.use(express.json());

// --- CONFIGURAZIONE OPENAI ---
const client = new OpenAI({
  apiKey: process.env.API_KEY_OPENAI
});
const assistantId = process.env.ASSISTANT_ID;
if (!assistantId) {
  throw new Error("L'ID dell'assistente non è stato trovato nel file .env (ASSISTANT_ID)");
}

// --- CONFIGURAZIONE TELEGRAM ---
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  throw new Error("Il token del bot di Telegram non è stato trovato nel file .env (TELEGRAM_BOT_TOKEN)");
}
const bot = new TelegramBot(token, { polling: true });
// --- FINE CONFIGURAZIONE TELEGRAM ---





// --- GESTIONE MESSAGGI TELEGRAM ---
bot.on('message', async (msg) => {

    // Ignora se è un messaggio di posizione o msg vuoto, gestito da 'location'
  if (msg.location || !msg.text ) {
    return;
  }

  const chatId = msg.chat.id;
  const userInput = msg.text;

  console.log(`Messaggio ricevuto da ${chatId}: "${userInput}"`);
  await processAssistantRequest(chatId, userInput);
});




// Funzione helper per processare una richiesta all'assistente
async function processAssistantRequest(chatId, inputText) {
  await bot.sendChatAction(chatId, 'typing');

  try {
    const thread = await client.beta.threads.create();
    await client.beta.threads.messages.create(thread.id, {
      role: "user",
      content: inputText,
    });

    const run = await client.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
    });

    let currentRun = await client.beta.threads.runs.retrieve(thread.id, run.id);
    while (currentRun.status !== 'completed' && currentRun.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      currentRun = await client.beta.threads.runs.retrieve(thread.id, run.id);
    }

    if (currentRun.status === 'failed') {
      throw new Error(`La Run è fallita: ${currentRun.last_error?.message}`);
    }

    const messages = await client.beta.threads.messages.list(thread.id);
    const assistantResponse = messages.data.find(m => m.role === 'assistant');

    if (assistantResponse && assistantResponse.content[0].type === 'text') {
      const responseText = assistantResponse.content[0].text.value;

      await bot.sendMessage(chatId, responseText);
      console.log(`Risposta inviata a ${chatId}.`);
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
        const geoResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,{
          headers: {
                'User-Agent': 'TiberiaBot/1.0 (un tuo contatto o sito web)'
            }
        });
        console.log(geoData);
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