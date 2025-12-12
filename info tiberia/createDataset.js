// Script per aggiungere domande/risposte a un file JSONL per fine-tuning OpenAI
import fs from 'fs';
import path from 'path';

const OUTPUT_FILE = path.join(process.cwd(), 'info tiberia', 'user_ai_dataset.jsonl');

/**
 * Aggiunge una domanda e risposta al file JSONL
 * @param {string} userQuestion - Domanda dell'utente
 * @param {string} aiAnswer - Risposta dell'AI
 */
export function addTrainingFile(userQuestion, aiAnswer) {
    const entry = {
        messages: [
            { role: 'user', content: userQuestion },
            { role: 'assistant', content: aiAnswer }
        ]
    };
    fs.appendFileSync(OUTPUT_FILE, JSON.stringify(entry) + '\n', 'utf8');
    console.log('Esempio aggiunto:', entry);
}

// Esempio di utilizzo:
// addExample('Qual è la capitale d\'Italia?', 'La capitale d\'Italia è Roma.');