//. TIBERIA V.0.0.3
import path from 'path';
import express from 'express';
import { app, port, client, assistantId, bot,INDEX_DB_NEWS, INDEX_DB_EVENTS } from './.devcontainer/config.js';
import { botOnMsg,botOnVoice,botOnLocation } from './telegram.js';
import cron from 'node-cron';
import { fetchAndIndexEvents } from './utility/capri-events.js';
import { loadUserThreadsFromVectorDB } from './DB/loadThreadsID.js';
import ejs from 'ejs';



// --- GESTIONE EVENTI TELEGRAM ---
bot.on('message', botOnMsg);
bot.on('voice', botOnVoice);
bot.on('location', botOnLocation);


// Endpoint di base per i controlli di salute di Render
app.get('/t', (req, res) => {
  res.send('<h2>Bot Tiberia è attivo!</h2>');
});

// Avvia il server
app.listen(port, () => {
  console.log(`Bot Tiberia avviato e in ascolto sulla porta ${port}`);
});

//fetchFerryTime();
//startNewsUpdater()


// Imposta EJS come view engine
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));

// Esempio endpoint che usa EJS
app.get('/tiberia', (req, res) => {
  res.render('hello', { name: 'Tiberia' });
});


/**
 * Avvia il processo di aggiornamento periodico degli eventi.
 */
function startEventsUpdater() {
    console.log('Avvio del servizio di aggiornamento eventi di Capri.');
    //aggionra le news per queste date
    const updateStart='2025/12/01';
    const updateEnd='2025/12/02';

    // inizializza il DB VECTOR startup
   //  fetchAndIndexEvents([3,4,5,7],INDEX_DB_NEWS,updateStart,updateEnd,80);//init DB
    //fetchAndIndexEvents([6], INDEX_DB_EVENTS, updateStart,updateEnd,100);//init DB
    //fetchAndIndexEvents(categorie scelte,database name,data start, data end, quantita);//init DB eventi odierni

    // Carica i thread esistenti dal DB vettoriale
    loadUserThreadsFromVectorDB()

    // Programma l'esecuzione ogni ora per catturare nuovi eventi durante il giorno
    cron.schedule('00 00 * * *', () => {
        console.log('Esecuzione del task orario per gli eventi.ore 23:30');
        fetchAndIndexEvents([6], INDEX_DB_EVENTS); //fetchano eventi del giorno
        fetchAndIndexEvents([3,4,7], INDEX_DB_NEWS); //fetchano newsgenerali
    }, {
        scheduled: true,
        timezone: "Europe/Rome"
    });

    console.log('Task di aggiornamento eventi programmato ogni ora.');
}

startEventsUpdater()