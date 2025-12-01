//import { Pinecone } from '@pinecone-database/pinecone';
import { generateEmbedding } from '../utility/embeddings.js';
import { getPineconeIndex } from './pineconeDB.js';
import { INDEX_DB_NEWS, INDEX_DB_EVENTS } from '../.devcontainer/config.js';



/**     
 *    Definiamo come estrarre il testo  da un oggetto notizia
      const newsTextExtractor = (item) => `${item.title}. ${item.snippet}`;

 * Cerca gli elementi più simili a una query interrogando un indice Pinecone.
 * @param {string} queryText La domanda dell'utente.
 * @param {number} topN Il numero di risultati più pertinenti da restituire.
 * @returns {Promise<Array<Object>>} Un array di oggetti risultato.
 */
export async function findSimilarItems(queryText, topN = 3, indexDBName = INDEX_DB_EVENTS) {
    console.log(`Ricerca su Pinecone per: "${queryText}" nell'indice "${indexDBName}"`);

    try {
        const index = await getPineconeIndex(indexDBName);

        // 1. Genera l'embedding per la query
        const queryEmbedding = await generateEmbedding(queryText);
        if (!queryEmbedding) {
            throw new Error("Impossibile generare l'embedding per la query.");
        }

        // 2. Interroga l'indice di Pinecone
        const queryResponse = await index.query({
            topK: topN,
            vector: queryEmbedding,
            includeMetadata: true, // Chiediamo di includere i metadati (titolo, snippet, etc.)
        });

        // 3. Formatta e restituisci i risultati
        if (queryResponse.matches && queryResponse.matches.length > 0) {
            return queryResponse.matches.map(match => ({
                ...match.metadata, // I dati originali
                link: match.id,    // Il link che abbiamo usato come ID
                similarity: match.score // Il punteggio di similarità calcolato da Pinecone
            }));
        }
        return [];

    } catch (error) {
        console.error("Errore durante la ricerca su Pinecone:", error);
        return [];
    }
}