// Elimina una riga dal dataset dato l'indice

// Express route per visualizzare il file JSONL del dataset di training
import fs from 'fs';
import path from 'path';
import express from 'express';

const router = express.Router();
const DATASET_FILE = '/cro/user_ai_dataset.jsonl';

router.get('/training', (req, res) => {
    if (!fs.existsSync(DATASET_FILE)) {
        return res.status(404).send('Nessun dataset trovato.');
    }
    const content = fs.readFileSync(DATASET_FILE, 'utf8');
    res.type('text/plain').send(content);
});

router.get('/training/json', (req, res) => {
    if (!fs.existsSync(DATASET_FILE)) {
        return res.json([]);
    }
    const lines = fs.readFileSync(DATASET_FILE, 'utf8').split('\n').filter(Boolean);
    const data = lines.map(line => JSON.parse(line));
    res.json(data);
});

router.post('/training/delete', (req, res) => {
    const { index } = req.body;
    if (typeof index !== 'number') return res.status(400).json({ error: 'Indice mancante' });
    try {
        const lines = fs.readFileSync(DATASET_FILE, 'utf8').split('\n').filter(Boolean);
        if (index < 0 || index >= lines.length) return res.status(400).json({ error: 'Indice fuori range' });
        lines.splice(index, 1);
        fs.writeFileSync(DATASET_FILE, lines.join('\n') + (lines.length ? '\n' : ''));
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Errore eliminazione riga' });
    }
});

router.post('/training/update', express.json(), (req, res) => {
    const { index, newRow } = req.body;
    if (!fs.existsSync(DATASET_FILE)) return res.status(404).send('File non trovato');
    let lines = fs.readFileSync(DATASET_FILE, 'utf8').split('\n').filter(Boolean);
    lines[index] = JSON.stringify(newRow);
    fs.writeFileSync(DATASET_FILE, lines.join('\n') + '\n', 'utf8');
    res.send('OK');
});

export default router;
