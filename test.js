//. TIBERIA V.0.0.1
import OpenAI from "openai";
import { Agent, Runner, setDefaultOpenAIClient } from '@openai/agents';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
dotenv.config();

//OPENAI CONFIG ACCESS
//OPENAI CONFIGURATION
const client = new OpenAI({
 // organization: process.env.ORGANIZATION_ID_OPENAI,
  apiKey: process.env.API_KEY_OPENAI

});
setDefaultOpenAIClient(client);

// --- CONFIGURAZIONE TELEGRAM ---
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  throw new Error("Il token del bot di Telegram non è stato trovato nel file .env (TELEGRAM_BOT_TOKEN)");
}
const bot = new TelegramBot(token, { polling: true });
// --- FINE CONFIGURAZIONE TELEGRAM ---





const PROMPT=`You are a tour assistant guiding a user through places of interest, activities, routes, or cultural experiences specifically in Capri.

Provide detailed and relevant information about tourist attractions, including historical context, visiting tips, and how to make the best out of the experience.

Your response should be engaging, informative, and clearly address what the user might need to know or find useful when visiting the place.

# Steps

1. **Understand User Needs**: Identify the specific place, type of activity, or information the user is asking for.
2. **Background Information**: Provide historical or cultural context for the location, making it more intriguing for the visitor.
3. **Key Locations and Events**: Mention specific attractions in the area, including the best times to visit them, notable landmarks, or events.
4. **Practical Tips**: Include crucial details such as recommended times to visit, entry fees, transportation methods, or any other important logistics.
5. **Enhanced Experience Tips**: Suggest less-known attractions, local events, restaurants, or other ways to enrich the user's journey and make the most out of their visit.
6. **Telegram Communication**: Communicate with the user via Telegram chat.
`

// --- DEFINIZIONE TOOL DI RICERCA ---
const busTool = new Tool({
  name: 'Bus schedule lookup',
  description: 'Performs a bus schedule lookup to find up-to-date information on bus routes, timings.',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query to find information on the web.',
      },
    },
    required: ['query'],
  },
  async function({ query }) {
    console.log(`[Tool: tavily_search] searching for: "${query}"`);
    const searchResult = await tavilyClient.search(query, { maxResults: 5 });
    // Formatta i risultati per l'agente
    return JSON.stringify(searchResult.results);
  },
});


const agent = new Agent({
  name: 'TIBERIA',
  instructions: PROMPT,
  model: 'gpt-4.1',
  // modelSettings
  // tools: [getWeather],
});


agent.on('agent_start', (ctx, agent) => {
  console.log(`[${agent.name}] started`);
});
agent.on('agent_end', (ctx, output) => {
  console.log(`[agent] produced:`, output);
});

// You can pass custom configuration to the runner
const runner = new Runner();

const result = await runner.run(
  agent,
  'Write a haiku about recursion in programming.',
);
console.log(result.finalOutput);

/*
for await (const event of result) {
  // these are the raw events from the model
  if (event.type === 'raw_model_stream_event') {
    console.log(`${event.type} %o`, event.data);
  }
  // agent updated events
  if (event.type === 'agent_updated_stream_event') {
    console.log(`${event.type} %s`, event.agent.name);
  }
  // Agent SDK specific events
  if (event.type === 'run_item_stream_event') {
    console.log(`${event.type} %o`, event.item);
  }
}
  */

// Code within the code,
// Functions calling themselves,
// Infinite loop's dance.


// --- GESTIONE MESSAGGI TELEGRAM ---
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userInput = msg.text;

  // Ignora messaggi non testuali
  if (!userInput) {
    return;
  }

  console.log(`Messaggio ricevuto da ${chatId}: "${userInput}"`);

  try {
    // Invia un messaggio di attesa
    //await bot.sendMessage(chatId, 'Tiberia sta elaborando la tua richiesta...');

    // Esegue l'agente con l'input dell'utente
    const result = await runner.run(agent, userInput);

    // Invia la risposta finale all'utente
    await bot.sendMessage(chatId, result.finalOutput);
    console.log(`Risposta inviata a ${chatId}.`);

  } catch (error) {
    console.error("Errore durante l'elaborazione della richiesta:", error);
    await bot.sendMessage(chatId, "Spiacente, si è verificato un errore. Riprova più tardi.");
  }
});
