import express from 'express';
import OpenAI from "openai";
import TelegramBot from 'node-telegram-bot-api';

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
export const vectorStoreId = process.env.VECTOR_STORE_ID; 

// --- CONFIGURAZIONE TELEGRAM ---
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  throw new Error("Il token del bot di Telegram non è stato trovato nel file .env (TELEGRAM_BOT_TOKEN)");
}


const bot = new TelegramBot(token, { polling: true });
// --- FINE CONFIGURAZIONE TELEGRAM ---

export { app, port, client, assistantId, bot , vectorStoreId};