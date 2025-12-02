import { generateEmbedding } from './embeddings.js';
import { getPineconeIndex } from '../DB/pineconeDB.js';
import { INDEX_DB_USER } from '../.devcontainer/config.js';
import { getDateTime } from './time.js';
import cron from 'node-cron';

export async function saveUserThreadEmbedding(userinfo, messages, indexName = INDEX_DB_USER, threadId = null) {
    const { chatId, userFirstName, userUsername } = userinfo;
    const { inputText, responseText } = messages;

    const threadText = `User[${chatId}] Msg:[${inputText}] - [Tiberia]: Msg:${responseText}`;
    console.log(`Salvataggio embedding per utente ${chatId} nel DB ${indexName}`);
    const embedding = await generateEmbedding(threadText);
    const index = await getPineconeIndex(indexName);

    await index.upsert([{
        id: `${chatId}@${userUsername}[${getDateTime()}]`, // ID unico per ogni messaggio

        values: embedding,
        metadata: { lastUpdate: Date.now(), threadText , threadID: threadId }
    }]);
}

function analyzeUser(messages) {
    // Esempio: crea un riassunto/opinione
    const total = messages.length;
    const lastMsg = messages[total - 1] || "";
    return {
        totalMessages: total,
        lastMessage: lastMsg,
        opinion: total > 10 ? "Utente molto attivo e socievole!" : "Utente poco attivo.",
    };
}


// Timer giornaliero alle 00:00
/*
cron.schedule('0 0 * * *', async () => {
    console.log("Analisi social utenti a mezzanotte...");
    const socialArray = [];

    for (const [telegramId, messages] of Object.entries(userMessages)) {
        const socialInfo = analyzeUser(messages);
        socialArray.push({
            telegramId,
            ...socialInfo
        });

        // Salva/vettorializza la storia utente
        await saveUserThreadEmbedding(telegramId, messages);
    }

    // Qui puoi salvare socialArray su file, DB, o usarlo per statistiche
    console.log("Social info utenti:", socialArray);
}, {
    timezone: "Europe/Rome"
});
*/