import express from 'express';
import OpenAI from "openai";
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

// Carica le variabili d'ambiente dal file .env
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
const vectorStoreId = process.env.VECTOR_STORE_ID; 

// --- CONFIGURAZIONE TELEGRAM ---
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  throw new Error("Il token del bot di Telegram non è stato trovato nel file .env (TELEGRAM_BOT_TOKEN)");
}

const botPolling = { polling: true } //true per sviluppo locale, false per deploy su render.com

const bot = new TelegramBot(token, botPolling );

// --- FINE CONFIGURAZIONE TELEGRAM ---

///////////SE C R E T W I TH L O V E/////////////
export const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
export const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

//////////////////////// NOMI DB - INDEX NAME///////////////////////

export const INDEX_DB_EVENTS = 'tiberia-events';
export const INDEX_DB_NEWS = 'tiberia-news';
export const INDEX_DB_WEATHER = 'tiberia-weather';
export const INDEX_DB_USER = 'tiberia-user';

export { app, port, client, assistantId, bot , vectorStoreId};