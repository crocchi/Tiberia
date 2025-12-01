//. TIBERIA V.0.0.3

import { app, port, client, assistantId, bot } from './.devcontainer/config.js';
import { botOnMsg,botOnVoice,botOnLocation } from './telegram.js';
import { fetchAndCacheNews } from './utility/capri-news.js';
import cron from 'node-cron';
import { fetchAndIndexEvents } from './utility/capri-events.js';


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
//startNewsUpdater()

/**
 * Avvia il processo di aggiornamento periodico degli eventi.
 */
function startEventsUpdater() {
    console.log('Avvio del servizio di aggiornamento eventi di Capri.');

    // Esegui subito all'avvio
    fetchAndIndexEvents([3,4,7],'newscapri','2025/11/15','2025/12/01');//init DB

    // Programma l'esecuzione ogni ora per catturare nuovi eventi durante il giorno
    cron.schedule('30 23 * * *', () => {
        console.log('Esecuzione del task orario per gli eventi.ore 23:30');
        fetchAndIndexEvents([6],'tiberia-news'); //fetchano eventi del giorno
        fetchAndIndexEvents([3,4,7],'newscapri'); //fetchano newsgenerali
    }, {
        scheduled: true,
        timezone: "Europe/Rome"
    });

    console.log('Task di aggiornamento eventi programmato ogni ora.');
}

startEventsUpdater()