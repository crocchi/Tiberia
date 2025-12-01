
// feed news capri
// https://www.capripost.it/feed/
import Parser from 'rss-parser';
import fs from 'fs/promises';
import path from 'path';
import cron from 'node-cron'; // 1. Importa node-cron
import { JSDOM } from 'jsdom'; 

const FEED_URL = 'https://www.capripost.it/feed/';
//https://www.capripost.it/wp-json/wp/v2/posts?per_page=100
const CACHE_DIR = path.join(process.cwd(), 'cache');
const NEWS_CACHE_FILE = path.join(CACHE_DIR, 'capri-news.json');

const parser = new Parser();

/**
 * Scarica le notizie dal feed RSS, le analizza e le salva in un file JSON.
 */
export async function fetchAndCacheNews() {
    console.log('Esecuzione task: aggiornamento notizie di Capri...');
    try {
        const feed = await parser.parseURL(FEED_URL);
        
        if (!feed.items || feed.items.length === 0) {
            console.log('Il feed non contiene notizie.');
            return;
        }

        // 2. Mappa le notizie usando il contenuto pulito
        const newsItems = feed.items.slice(0, 20).map(item => {
            // Usa il campo 'content:encoded' che è più ricco, e puliscilo dall'HTML
            const fullContent = getTextFromHtml(item['content:encoded'] || item.content);
            const cleanedContent = fullContent.replace(/proviene da Capri Post\./gi, '');
            return {
                title: item.title,
                link: item.link,
                pubDate: item.pubDate,
                // Crea uno snippet più lungo e pulito dal contenuto completo
                snippet: cleanedContent//.substring(0, 250) + '...'
            };
        });
        await fs.mkdir(CACHE_DIR, { recursive: true });
        await fs.writeFile(NEWS_CACHE_FILE, JSON.stringify(newsItems, null, 2));

        console.log(`Aggiornamento completato. ${newsItems.length} notizie salvate.`);
        console.log(newsItems);
    } catch (error) {
        console.error('Errore durante l\'aggiornamento delle notizie:', error);
    }
}

/**
 * Avvia il processo di aggiornamento periodico delle notizie.
 */
export function startNewsUpdater() {
    console.log('Avvio del servizio di aggiornamento notizie di Capri.');
    
    // Esegui subito la prima volta all'avvio dell'applicazione
    fetchAndCacheNews();

    // 2. Programma l'esecuzione del task ogni giorno alle 4:00 del mattino
    cron.schedule('0 4 * * *', () => {
        console.log('Esecuzione del task giornaliero programmato con node-cron.');
        fetchAndCacheNews();
    }, {
        scheduled: true,
        timezone: "Europe/Rome"
    });

    console.log('Task di aggiornamento notizie programmato per le 04:00 ogni giorno.');
}

function getTextFromHtml(htmlString) {
    if (!htmlString) return '';
    const dom = new JSDOM(htmlString);
    // Rimuovi script e stili per non includerli nel testo
    dom.window.document.querySelectorAll('script, style').forEach(el => el.remove());
    // Restituisci il testo del body, pulito da spazi extra e a capo
    return dom.window.document.body.textContent.replace(/\s\s+/g, ' ').trim();
}