import { getPineconeIndex } from './pineconeDB.js';
import { INDEX_DB_USER } from '../.devcontainer/config.js';
import { userThreads } from '../openai.js';

export async function loadUserThreadsFromVectorDB() {
    const index = await getPineconeIndex(INDEX_DB_USER);

    // Recupera tutti i record (puoi usare un filtro o paginazione se sono tanti)
    const queryResponse = await index.query({
        topK: 1000, // o il numero massimo che ti serve
        vector: Array(1536).fill(0), // Dummy vector, serve solo per query globale
        includeMetadata: true,
        filter: { threadID: { "$exists": true } } // Nessun filtro, prendi tutti
    });

    if (queryResponse.matches) {
        queryResponse.matches.forEach(match => {
            const cleaned = match.id.replace(/@.*?(?=\[]|$)/, '');
            const chatId = cleaned;
            const threadId = match.metadata.threadID;
            if (chatId && threadId) {
                userThreads[chatId] = threadId;
            }
        });
        console.log("userThreads popolato da Pinecone:", userThreads);
        return userThreads;
    }

    /*
    
    ID: 585151280@Crocchii

lastUpdate: 1764641623094

threadID: "thread_0Jnev3ga9pbMZHEmSOXqWi48"

threadText: "User[585151280] Msg:[[02/12/2025 03:13:29] Domani che tempo che fa'?] - [Tiberia]: Msg:Per domani a Capri è previsto sole! 🌞 Temperature tra 13.8°C e 15.2°C, vento leggero e praticamente niente pioggia. Giornata perfetta per esplorare l’isola! 😉"

 */
}