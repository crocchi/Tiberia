// Express route per visualizzare il file JSONL del dataset di training
import fs from 'fs';
import path from 'path';
import express from 'express';

const router = express.Router();
const DATASET_FILE = path.join(process.cwd(), 'info tiberia', 'user_ai_dataset.jsonl');

router.get('/training', (req, res) => {
    if (!fs.existsSync(DATASET_FILE)) {
        return res.status(404).send('Nessun dataset trovato.');
    }
    const content = fs.readFileSync(DATASET_FILE, 'utf8');
    res.type('text/plain').send(content);
});

export default router;
