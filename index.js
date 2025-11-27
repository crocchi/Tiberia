//. TIBERIA V.0.0.1
import OpenAI from "openai";
import TelegramBot from 'node-telegram-bot-api';
import express from 'express';
import dotenv from 'dotenv';
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
  const chatId = msg.chat.id;
  const userInput = msg.text;

  if (!userInput) {
    return;
  }

  console.log(`Messaggio ricevuto da ${chatId}: "${userInput}"`);
  await bot.sendChatAction(chatId, 'typing');

  try {
    // 1. Creare un nuovo Thread per ogni conversazione
    const thread = await client.beta.threads.create();

    // 2. Aggiungere il messaggio dell'utente al Thread
    await client.beta.threads.messages.create(thread.id, {
      role: "user",
      content: userInput,
    });

    // 3. Eseguire l'Assistente sul Thread
    const run = await client.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
    });

    // 4. Attendere il completamento della Run
    let currentRun = await client.beta.threads.runs.retrieve(thread.id, run.id);
    while (currentRun.status !== 'completed' && currentRun.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Attesa di 1 secondo
      currentRun = await client.beta.threads.runs.retrieve(thread.id, run.id);
    }

    if (currentRun.status === 'failed') {
        throw new Error(`La Run è fallita: ${currentRun.last_error?.message}`);
    }

    // 5. Recuperare i messaggi della conversazione
    const messages = await client.beta.threads.messages.list(thread.id);

    // 6. Trovare l'ultima risposta dell'assistente e inviarla
    const assistantResponse = messages.data.find(m => m.role === 'assistant');
    if (assistantResponse && assistantResponse.content[0].type === 'text') {
      const responseText = assistantResponse.content[0].text.value;
      await bot.sendMessage(chatId, responseText);
      console.log(`Risposta inviata a ${chatId}. \n Testo: "${responseText}"`);
    } else {
      await bot.sendMessage(chatId, "Spiacente, non ho ricevuto una risposta valida.");
    }

  } catch (error) {
    console.error("Errore durante l'elaborazione della richiesta:", error);
    await bot.sendMessage(chatId, "Spiacente, si è verificato un errore. Riprova più tardi.");
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