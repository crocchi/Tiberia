import { client, bot } from './.devcontainer/config.js';
import { processAssistantRequest } from './openai.js';


const whois =(data)=>{
    const userFirstName = data.from?.first_name || "Utente";
    const userUsername = data.from?.username || data.from?.first_name || "Sconosciuto"; // Questo è il nickname
    const chatId = data.chat?.id || null;
    const userInput = data.text || "";
    const fileId = data?.voice?.file_id || null;
    const msgInfo=`Messaggio Ricevuto da ${userFirstName} @${userUsername} ID: ${chatId}\n Contenuto: ${userInput}`;
    return { msgInfo, userFirstName, userUsername, chatId, userInput, fileId };
}
// --- GESTIONE MESSAGGI TELEGRAM ---

//bot.on('message', async (msg) => {

export const botOnMsg = (msg) => {
    // Ignora se è un messaggio di posizione o msg vuoto, gestito da 'location'
    if (msg.location || !msg.text || msg.voice) {
        return;
    }
try{


    const { chatId, msgInfo, userInput, userFirstName, userUsername } = whois(msg);

    console.log(msgInfo);
    processAssistantRequest(chatId, userInput, 'text', { userFirstName, userUsername });
    } catch (error) {
        console.error("Errore durante la gestione del messaggio:\n", error);
    }
};




// --- GESTIONE MESSAGI VOCALI ---
export const botOnVoice = async (msg) => {
    const chatId = msg.chat.id;
    const fileId = msg.voice.file_id;
    console.log(`Messaggio vocale ricevuto da ${chatId}`);

    try {
        // await bot.sendMessage(chatId, "Sto ascoltando il tuo messaggio vocale...");

        // 1. Ottieni il link per scaricare il file
        const fileLink = await bot.getFileLink(fileId);

        // 2. Scarica il file audio
        const response = await fetch(fileLink);
        if (!response.ok) {
            throw new Error(`Errore durante il download del file: ${response.statusText}`);
        }
        //const audioBuffer = await response.buffer();

        // 3. Trascrivi l'audio usando OpenAI Whisper
        // Nota: la libreria openai si aspetta un oggetto con nome file e stream
        const transcription = await client.audio.transcriptions.create({
            file: response, // Passa direttamente l'oggetto 'response' di fetch
            model: 'whisper-1',
        });

        const transcribedText = transcription.text;
        console.log(`Testo trascritto: "${transcribedText}"`);

        // 4. Invia il testo trascritto all'assistente
        if (transcribedText) {
            processAssistantRequest(chatId, transcribedText, 'voice');
        } else {
             bot.sendMessage(chatId, "Non sono riuscito a capire cosa hai detto. Prova a parlare più chiaramente.");
        }

    } catch (error) {
        console.error("Errore durante la gestione del messaggio vocale:", error);
        bot.sendMessage(chatId, "Spiacente, si è verificato un errore durante l'elaborazione del tuo messaggio vocale.");
    }
};





// --- GESTIONE POSIZIONE ---

export const botOnLocation = async (msg) => {
    const chatId = msg.chat.id;
    const { latitude, longitude } = msg.location;

    console.log(`Posizione ricevuta da ${chatId}: Lat ${latitude}, Lon ${longitude}`);
    await bot.sendMessage(chatId, "Grazie! Sto cercando cosa c'è di interessante vicino a te...");

    try {
        // 1. Reverse Geocoding con OpenStreetMap
        const geoResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
            headers: {
                'User-Agent': 'TiberiaBot/1.0 (un tuo contatto o sito web)'
            }
        });
        //console.log(geoData);
        const geoData = await geoResponse.json();

        const placeName = geoData.display_name || "una posizione specifica a Capri";
        console.log(`Posizione identificata come: ${placeName}`);

        // 2. Crea il prompt per l'assistente
        const prompt = `L'utente ha condiviso la sua posizione e si trova vicino a: "${placeName}". Descrivi i punti di interesse, le attività o le esperienze culturali nelle immediate vicinanze. Sii una guida turistica utile.`;

        // 3. Invia il prompt all'assistente
        await processAssistantRequest(chatId, prompt);

        // 4. Invia un pulsante con la mappa della posizione dell'utente
        const mapUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`;
        const options = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Apri la tua posizione sulla mappa", url: mapUrl }]
                ]
            }
        };
        await bot.sendMessage(chatId, "Ecco la tua posizione attuale:", options);



    } catch (error) {
        console.error("Errore durante la gestione della posizione:", error);
        await bot.sendMessage(chatId, "Spiacente, non sono riuscito a identificare la tua posizione. Riprova.");
    }
};