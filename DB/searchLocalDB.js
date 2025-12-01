import fs from 'fs/promises';
import path from 'path';
import { generateEmbedding } from '../utility/embeddings.js';

/**
 * Calcola la similarità del coseno tra due vettori.
 * @param {number[]} vecA Il primo vettore.
 * @param {number[]} vecB Il secondo vettore.
 * @returns {number} Un valore tra -1 e 1. Più vicino a 1, più sono simili.
 */
function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let magA = 0;
    let magB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        magA += vecA[i] * vecA[i];
        magB += vecB[i] * vecB[i];
    }
    magA = Math.sqrt(magA);
    magB = Math.sqrt(magB);

    if (magA === 0 || magB === 0) {
        return 0; // Evita la divisione per zero
    }
    return dotProduct / (magA * magB);
}

/**
 * Cerca gli elementi più simili a una query all'interno di un database di embeddings.
 * @param {string} queryText La domanda dell'utente.
 * @param {string} dbFilePath Il percorso del file JSON del database di embeddings.
 * @param {number} topN Il numero di risultati più pertinenti da restituire.
 * @returns {Promise<Array<Object>>} Un array di oggetti, ciascuno con l'elemento originale e il suo punteggio di similarità.
 */
export async function findSimilarItems(queryText, dbFilePath, topN = 3) {
    console.log(`Ricerca per: "${queryText}" in ${dbFilePath}`);

    try {
        // 1. Genera l'embedding per la query dell'utente
        const queryEmbedding = await generateEmbedding(queryText);
        if (!queryEmbedding) {
            throw new Error("Impossibile generare l'embedding per la query.");
        }

        // 2. Carica il database di embeddings
        const dbFileContent = await fs.readFile(dbFilePath, 'utf8');
        const dbItems = JSON.parse(dbFileContent);

        // 3. Calcola la similarità per ogni elemento nel database
        const scoredItems = dbItems.map(item => ({
            ...item,
            similarity: cosineSimilarity(queryEmbedding, item.embedding)
        }));

        // 4. Ordina gli elementi per similarità (dal più alto al più basso)
        scoredItems.sort((a, b) => b.similarity - a.similarity);

        // 5. Restituisci i primi 'topN' risultati
        return scoredItems.slice(0, topN);

    } catch (error) {
        console.error("Errore durante la ricerca nel database vettoriale:", error);
        return []; // Restituisci un array vuoto in caso di errore
    }
}







// --- Esempio di utilizzo (esegui questo script da terminale per testare la ricerca) ---
const isDirectRun = process.argv[1] === new URL(import.meta.url).pathname;

if (isDirectRun) {
    (async () => {
        const dbPath = path.join(process.cwd(), 'cache', 'news-embeddings.json');
        const userQuery = "ci sono notizie sui lavori al porto di Capri?";
        
        const results = await findSimilarItems(userQuery, dbPath, 3);

        if (results.length > 0) {
            console.log(`\nI ${results.length} risultati più pertinenti per "${userQuery}":\n`);
            results.forEach((result, index) => {
                console.log(`${index + 1}. Titolo: ${result.title}`);
                console.log(`   Similarità: ${(result.similarity * 100).toFixed(2)}%`);
                console.log(`   Link: ${result.link}\n`);
            });
        } else {
            console.log("\nNessun risultato pertinente trovato.");
        }
    })();
}