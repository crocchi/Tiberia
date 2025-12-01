import fs from 'fs/promises';
import path from 'path';
import { generateEmbedding } from '../utility/embeddings.js';

// Definisce i percorsi dei file di default per le notizie
const CACHE_DIR = path.join(process.cwd(), 'cache');
const NEWS_INPUT_FILE = path.join(CACHE_DIR, 'capri-news.json');
const NEWS_EMBEDDINGS_DB_FILE = path.join(CACHE_DIR, 'news-embeddings.json');

/**
 * Genera embeddings per un array di dati e li salva in un file JSON.
 * @param {Array<Object|string>} inputData L'array di dati da processare (oggetti o stringhe).
 * @param {string} outputFilePath Il percorso del file dove salvare il database di embeddings.
 * @param {(item: Object|string) => string} textExtractor Una funzione che, dato un elemento dell'array, restituisce la stringa di testo da usare per l'embedding.
 */
export async function processAndSaveEmbeddings(inputData, outputFilePath, textExtractor) {
    if (!inputData || inputData.length === 0) {
        console.log('Nessun dato di input fornito. Processo interrotto.');
        return;
    }
    console.log(`Avvio generazione embeddings per ${outputFilePath}...`);

    const embeddingsDatabase = [];
    try {
        for (const item of inputData) {
            // Usa la funzione 'textExtractor' per ottenere il testo corretto
            const textToEmbed = textExtractor(item);
            const embedding = await generateEmbedding(textToEmbed);

            if (embedding) {
                // Salva l'oggetto originale arricchito con il suo embedding
                const dbEntry = typeof item === 'string' 
                    ? { text: item, embedding } 
                    : { ...item, embedding };
                embeddingsDatabase.push(dbEntry);
            }
        }

        await fs.mkdir(path.dirname(outputFilePath), { recursive: true });
        await fs.writeFile(outputFilePath, JSON.stringify(embeddingsDatabase, null, 2));
        console.log(`Processo completato. ${embeddingsDatabase.length} embeddings salvati in ${outputFilePath}`);

    } catch (error) {
        console.error(`Errore durante la creazione di ${outputFilePath}:`, error);
    }
}








// --- Esempio di utilizzo (esegui questo script da terminale per creare il DB) ---
const isDirectRun = process.argv[1] === new URL(import.meta.url).pathname;

if (isDirectRun) {
    (async () => {
        // ESEMPIO 1: Processare le notizie (come prima)
        try {
            console.log("--- Processo Notizie ---");
            const newsFileContent = await fs.readFile(NEWS_INPUT_FILE, 'utf8');
            const newsItems = JSON.parse(newsFileContent);
            // Definiamo come estrarre il testo da un oggetto notizia
            const newsTextExtractor = (item) => `${item.title}. ${item.snippet}`;
            await processAndSaveEmbeddings(newsItems, NEWS_EMBEDDINGS_DB_FILE, newsTextExtractor);
        } catch (e) {
            console.error("Impossibile processare le notizie. Assicurati che 'cache/capri-news.json' esista.", e.message);
        }

        console.log("\n--------------------------\n");

        // ESEMPIO 2: Processare un semplice array di stringhe (orari bus)
        console.log("--- Processo Orari Bus (Esempio) ---");
        const busSchedule = [
            "Partenza da Capri per Anacapri alle 08:00",
            "Partenza da Anacapri per Capri alle 08:15",
            "Corsa per il Faro di Punta Carena alle 09:30",
            "Ultima corsa per Marina Piccola alle 19:00"
        ];
        const busDbPath = path.join(CACHE_DIR, 'bus-schedule-embeddings.json');
        // Per un array di stringhe, l'estrattore restituisce semplicemente la stringa stessa
        const stringTextExtractor = (item) => item;
        await processAndSaveEmbeddings(busSchedule, busDbPath, stringTextExtractor);
    })();
}