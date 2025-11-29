//. TIBERIA V.0.0.1

import { app, port, client, assistantId, bot } from './.devcontainer/config.js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();




// Endpoint di base per i controlli di salute di Render
app.get('/', (req, res) => {
  res.send('Bot Tiberia è attivo!');
});

// Avvia il server
app.listen(port, () => {
  console.log(`Bot Tiberia avviato e in ascolto sulla porta ${port}`);
});