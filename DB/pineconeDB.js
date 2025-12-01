import { Pinecone } from '@pinecone-database/pinecone';
import { generateEmbedding } from '../utility/embeddings.js';
import { PINECONE_API_KEY } from '../.devcontainer/config.js';
import { INDEX_DB_NEWS, INDEX_DB_EVENTS } from '../.devcontainer/config.js';

/**
 * Inizializza il client di Pinecone e restituisce un riferimento all'indice specificato.
 */
export async function getPineconeIndex(indexDBName=INDEX_DB_EVENTS) {
    const pc = new Pinecone({
        apiKey: PINECONE_API_KEY,
    });
    // Il nome dell'indice che hai creato nella dashboard di Pinecone

    //newscapri altro index db
    return pc.index(indexDBName);
}


/**
 * Processa un array di dati, genera gli embeddings e li salva (upsert) su Pinecone.
 * @param {Array<Object>} items L'array di notizie o altri dati da processare.
 * @param {(item: Object) => string} textExtractor Funzione per estrarre il testo da ogni item.
 */
export async function processAndSaveToPinecone(items, textExtractor,indexDBName=INDEX_DB_EVENTS) {
    if (!items || items.length === 0) {
        console.log('Nessun dato di input fornito. Processo interrotto.');
        return;
    }

    try {
        const index = await getPineconeIndex(indexDBName);
        console.log(`Processo ${items.length} items per il salvataggio su Pinecone...`);

        for (const item of items) {
            const textToEmbed = textExtractor(item);
            const embedding = await generateEmbedding(textToEmbed);

            if (embedding) {
                // Prepara i dati per Pinecone
                const vector = {
                    id: item.link, // L'ID deve essere una stringa unica. Il link della notizia è perfetto.
                    values: embedding, // Il vettore numerico
                    metadata: { // Dati aggiuntivi che vuoi poter recuperare
                        title: item.title,
                        snippet: item.snippet,
                        pubDate: item.pubDate
                    }
                };

                // 'upsert' aggiorna il vettore se l'ID esiste già, altrimenti lo inserisce.
                await index.upsert([vector]);
            }
        }
        console.log(`Salvataggio su Pinecone completato per ${items.length} items.`);

    } catch (error) {
        console.error("Errore durante il salvataggio su Pinecone:", error);
    }
}