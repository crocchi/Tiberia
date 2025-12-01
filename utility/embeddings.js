import { client } from '../.devcontainer/config.js';

/**
 * Genera un embedding vettoriale per un dato testo usando l'API di OpenAI.
 * @param {string} text Il testo di input da trasformare in embedding.
 * @returns {Promise<number[]|null>} Una Promise che si risolve con l'array di numeri (embedding) o null in caso di errore.
 */
export async function generateEmbedding(text) {
    // Controlla che il testo non sia vuoto o non valido
    if (!text || typeof text !== 'string') {
        console.error("Input non valido: è necessario fornire una stringa di testo.");
        return null;
    }

    try {
        // Chiama l'API di OpenAI per creare l'embedding
        const response = await client.embeddings.create({
            model: "text-embedding-3-small", // Modello consigliato, efficiente e performante
            input: text.trim(), // Rimuovi spazi extra dal testo
        });

        // Estrai e restituisci il vettore di embedding
        console.log("Embedding generato:", response.data[0].embedding);
        return response.data[0].embedding;

    } catch (error) {
        console.error("Errore durante la generazione dell'embedding:", error);
        return null; // Restituisci null per indicare che l'operazione è fallita
    }
}

// --- Esempio di utilizzo (questo codice viene eseguito solo se lanci lo script direttamente) ---

// Controlla se il file è stato eseguito direttamente da Node.js
const isDirectRun = process.argv[1] === new URL(import.meta.url).pathname;

if (isDirectRun) {
    (async () => {
        const sampleText = "Le ultime notizie da Capri parlano di un nuovo evento al porto.";
        console.log(`Testo di esempio: "${sampleText}"`);

        const embedding = await generateEmbedding(sampleText);

        if (embedding) {
            console.log("\nEmbedding generato con successo!");
            console.log(`Dimensioni del vettore: ${embedding.length}`);
            console.log(`Primi 5 valori: [${embedding.slice(0, 5).join(', ')}, ...]`);
        } else {
            console.log("\nImpossibile generare l'embedding.");
        }
    })();
}