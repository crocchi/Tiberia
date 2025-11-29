import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import fs from 'fs/promises'; // Usiamo il modulo File System di Node.js
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), 'cache');
const CACHE_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 giorni in millisecondi

// Mappatura per costruire gli URL corretti
const tratteMap = {
    "capri-napoli": "capri/napoli",
    "napoli-capri": "napoli/capri",
    "capri-sorrento": "capri/sorrento",
    "sorrento-capri": "sorrento/capri",
    "capri-ischia": "capri/ischia",
    "ischia-capri": "ischia/capri"
};

async function getFerryDataFromCache(trattaKey) {
    try {
        const filePath = path.join(CACHE_DIR, `${trattaKey}.json`);
        const data = await fs.readFile(filePath, 'utf8');
        const cache = JSON.parse(data);

        // Controlla se la cache è scaduta
        const isExpired = (Date.now() - cache.timestamp) > CACHE_DURATION_MS;
        if (isExpired) {
            console.log(`Cache scaduta per ${trattaKey}.`);
            return null;
        }

        console.log(`Dati caricati dalla cache per ${trattaKey}.`);
        return cache.data;
    } catch (error) {
        // Se il file non esiste o c'è un errore di lettura, la cache è invalida
        console.log(`Nessuna cache valida trovata per ${trattaKey}.`);
        return null;
    }
}

async function saveFerryDataToCache(trattaKey, data) {
    try {
        await fs.mkdir(CACHE_DIR, { recursive: true }); // Crea la cartella se non esiste
        const filePath = path.join(CACHE_DIR, `${trattaKey}.json`);
        const cacheContent = {
            timestamp: Date.now(),
            data: data
        };
        await fs.writeFile(filePath, JSON.stringify(cacheContent, null, 2));
        console.log(`Cache salvata per ${trattaKey}.`);
    } catch (error) {
        console.error(`Errore durante il salvataggio della cache per ${trattaKey}:`, error);
    }
}

export async function fetchFerryTime(trattaKey) {
    const path = tratteMap[trattaKey];
    if (!path) {
        return JSON.stringify({ error: "Tratta non valida. Usa una delle seguenti: " + Object.keys(tratteMap).join(', ') });
    }

    // 1. Prova a leggere dalla cache
    const cachedData = await getFerryDataFromCache(trattaKey);
    if (cachedData) {
        return JSON.stringify(cachedData);
    }

    // 2. Se la cache è vuota o scaduta, fai la richiesta web
    console.log(`Fetching dati live da web per ${trattaKey}...`);
    const url = `https://www.naplesbayferry.com/it/t/${path}`;

    try {
        const response = await fetch(url);
        const text = await response.text();
        const dom = new JSDOM(text);
        
        const orarioNodes = dom.window.document.querySelectorAll(".td.time .value");
        
        if (orarioNodes.length === 0) {
            return JSON.stringify({ tratta: trattaKey, message: "Nessun orario trovato per oggi." });
        }

        const ferryInfo = Array.from(orarioNodes).map(node => {
            const row = node.closest('tr');
            return {
                orario: node.textContent.trim(),
                compagnia: row.querySelector(".td.company .value .company-name")?.textContent.trim(),
                durata: row.querySelector(".td.duration .value")?.textContent.trim(),
                porto: row.querySelector(".td.seaport .value span")?.textContent.trim(),
                prezzo: row.querySelector(".td.price .value")?.textContent.trim()
            };
        });
        
        // 3. Salva i nuovi dati nella cache prima di restituirli
        await saveFerryDataToCache(trattaKey, ferryInfo);

        return JSON.stringify(ferryInfo);

    } catch (error) {
        console.error("Error fetching ferry times:", error);
        return JSON.stringify({ error: "Impossibile recuperare gli orari dei traghetti." });
    }
}

//booking 
//https://www.naplesbayferry.com/it/ferry-booking?from=capri&to=sorrento&
// ferry_group=capri&one_way_date=29%2F11%2F2025&radio_way_type=on

/*
//capripost 
//esecuzione ogni 24h
//https://www.capripost.it/feed/


//ferry
//capri-napoli
//https://www.capritourism.com/en/t/capri/napoli
//https://www.capritourism.com/en/t/napoli/capri


//https://www.facebook.com/InfoCollegamentiMarittimiEMeteo


*/