//. TIBERIA V.0.0.2

import { app, port, client, assistantId, bot } from './.devcontainer/config.js';
import { botOnMsg,botOnVoice,botOnLocation } from './telegram.js';


// --- GESTIONE EVENTI TELEGRAM ---
bot.on('message', botOnMsg);
bot.on('voice', botOnVoice);
bot.on('location', botOnLocation);


// Endpoint di base per i controlli di salute di Render
app.get('/', (req, res) => {
  res.send('<h2>Bot Tiberia è attivo!</h2>');
});

// Avvia il server
app.listen(port, () => {
  console.log(`Bot Tiberia avviato e in ascolto sulla porta ${port}`);
});

//fetchFerryTime();