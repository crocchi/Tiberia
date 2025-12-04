import { client, bot} from '../.devcontainer/config.js';



export const startModelAudio = async (responseText) => {

const mp3 = await client.audio.speech.create({
            model: "gpt-4o-mini-tts",//"tts-1",gpt-realtime-mini
            voice: "shale", // Puoi scegliere tra: alloy, echo, fable, onyx, nova, shale
            input: 'Ciao io sono Spongebob, e tu? COme stai in questa bellissima giornata? Spero tutto bene!',
            instructions: "Parla con la voce simile a spongebob ",
          });
          const audioBuffer = Buffer.from(await mp3.arrayBuffer());

          console.log(`Risposta audio inviata a Tiberia.`);
          return audioBuffer;


        }