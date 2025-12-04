import { client, bot} from '../.devcontainer/config.js';



export const startModelAudio = async (responseText) => {

const mp3 = await client.audio.speech.create({
            model: "gpt-4o-mini-tts",//"tts-1",gpt-realtime-mini
            voice: "shale", // Puoi scegliere tra: alloy, echo, fable, onyx, nova, shale
            input: 'Ciao io sono Spongebob, e tu? COme stai in questa bellissima giornata? Spero tutto bene!',
            instructions: "Parla con la voce simile a spongebob ",
          });
          const audioBuffer = Buffer.from(await mp3.arrayBuffer());
          // Genera la sequenza visemi dal testo
    const visemeSequence = generateVisemeSequence(responseText);

          console.log(`Risposta audio e visemi inviata a Tiberia.`);
          return {audioBuffer, visemeSequence}


        }


// Funzione placeholder per generare visemi dal testo
export const generateVisemeSequence = (responseText) => {
    const words = responseText.split(' ');
    // Simula una sequenza temporale: ogni parola dura 0.5 secondi
    return words.map((word, i) => ({
        time: i * 0.5, // tempo in secondi
        viseme: 'open', // puoi usare 'open', 'closed', 'smile', ecc.
        text: word
    }));
};