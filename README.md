# Tiberia

AI-powered virtual tour guide for the Island of Capri 🏝️

## Description

Tiberia is an intelligent chatbot that acts as a virtual tour guide for the beautiful Island of Capri. Using OpenAI's GPT models, the AI guide named "Marco" provides visitors with information about:

- Historical sites (Villa Jovis, Grotta Azzurra)
- Natural landmarks (I Faraglioni, Monte Solaro)
- Local cuisine and restaurants
- Hidden gems and local secrets
- Daily tips for visitors

## Requirements

- Node.js 18.0.0 or higher
- OpenAI API key

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/crocchi/Tiberia.git
   cd Tiberia
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your OpenAI API key:
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   ```

## Usage

### Interactive Chat Mode

Start an interactive conversation with your Capri guide:

```bash
npm start
```

### Scheduler Mode

Run the daily tip scheduler (sends tips at 9:00 AM Rome time):

```bash
npm run scheduler
```

### Available Commands in Chat

- Type any question about Capri
- `reset` - Start a new conversation
- `exit` - Quit the application

## Project Structure

```
Tiberia/
├── index.js                    # Main entry point
├── src/
│   ├── config/
│   │   └── guide-persona.js    # AI guide personality configuration
│   └── services/
│       ├── capri-guide-service.js  # OpenAI chat service
│       └── scheduler.js        # Cron job scheduler
├── .env.example                # Environment variables template
└── package.json
```

## Features

- 🗣️ Natural conversation in Italian and English
- 📅 Scheduled daily tips via node-cron
- 🧠 Context-aware responses with conversation history
- 🏛️ Rich knowledge of Capri's history and culture

## License

ISC
