# Tiberia

🤖 Bot Telegram con integrazione AI per interagire con l'intelligenza artificiale.

## Descrizione

Tiberia è un bot Telegram che permette agli utenti di interagire con l'AI (OpenAI GPT) direttamente dalla chat di Telegram. Puoi fare domande, chiedere aiuto o semplicemente conversare con l'intelligenza artificiale.

## Funzionalità

- 💬 Conversazione naturale con AI
- 🔄 Memoria della conversazione (ultimi 20 messaggi)
- 🌍 Supporto multilingua
- ⚡ Risposte in tempo reale

## Installazione

### Prerequisiti

- Python 3.10 o superiore
- Un token per il bot Telegram (ottienilo da [@BotFather](https://t.me/BotFather))
- Una chiave API OpenAI (ottienila da [OpenAI Platform](https://platform.openai.com/api-keys))

### Setup

1. Clona il repository:
```bash
git clone https://github.com/crocchi/Tiberia.git
cd Tiberia
```

2. Crea un ambiente virtuale e attivalo:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# oppure
venv\Scripts\activate  # Windows
```

3. Installa le dipendenze:
```bash
pip install -r requirements.txt
```

4. Copia il file di configurazione e inserisci le tue chiavi:
```bash
cp .env.example .env
```

5. Modifica il file `.env` con le tue chiavi API:
```
TELEGRAM_BOT_TOKEN=il_tuo_token_telegram
OPENAI_API_KEY=la_tua_chiave_openai
```

## Utilizzo

Avvia il bot:
```bash
python bot.py
```

### Comandi disponibili

- `/start` - Avvia il bot e mostra il messaggio di benvenuto
- `/help` - Mostra i comandi disponibili
- `/reset` - Resetta la cronologia della conversazione

### Interazione

Scrivi semplicemente un messaggio al bot e riceverai una risposta dall'AI!

## Struttura del progetto

```
Tiberia/
├── bot.py              # File principale del bot
├── requirements.txt    # Dipendenze Python
├── .env.example        # Template per le variabili d'ambiente
├── .gitignore          # File da ignorare in git
└── README.md           # Questa documentazione
```

## Licenza

Questo progetto è rilasciato sotto licenza MIT.
