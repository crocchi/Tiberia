/*
{"messages":[
  {"role":"user","content":"Ciao!"},
  {"role":"assistant","content":"Ciao, come posso aiutarti?"},
  {"role":"user","content":"Come si arriva ad Anacapri?"},
  {"role":"assistant","content":"Puoi prendere un bus dal porto o salire a piedi."}
]}


//sempre tutto su una una riga
{"messages":[{"role":"user","content":"Quali sono le regole per i taxi a Capri?"},{"role":"assistant","content":"Il centro di Capri è pedonale al 100 %, i taxi ti lasciano al parcheggio e bon."}]}


{"messages":[
  {"role":"user","content":"Voglio sapere i ristoranti aperti a Capri."},
  {"role":"assistant","content":"{\"name\": \"searchRestaurants\", \"arguments\": {\"location\": \"Capri\", \"openNow\": true}}"},
  {"role":"user","content":"E quelli con vista mare?"},
  {"role":"assistant","content":"{\"name\": \"searchRestaurants\", \"arguments\": {\"location\": \"Capri\", \"openNow\": true, \"seaView\": true}}"}
]}
  */

import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'info tiberia', 'fineTunningData.jsonl');

/**
 * Aggiunge un esempio di conversazione al file di log per il fine-tuning.
 * @param {Array} messages - Array di messaggi [{role, content}, ...]
 */
export function logFineTuningExample(messages) {
    const entry = { messages };
    const line = JSON.stringify(entry);
    fs.appendFileSync(LOG_FILE, line + '\n', 'utf8');
    console.log('Esempio aggiunto al file di log!');
}

// Esempio di utilizzo:
logFineTuningExample([
    { role: "user", content: "Quali sono le regole per i taxi a Capri?" },
    { role: "assistant", content: "Il centro di Capri è pedonale al 100 %, i taxi ti lasciano al parcheggio e bon." }
]);

logFineTuningExample([
    { role: "user", content: "Voglio sapere i ristoranti aperti a Capri." },
    { role: "assistant", content: "{\"name\": \"searchRestaurants\", \"arguments\": {\"location\": \"Capri\", \"openNow\": true}}" }
]);