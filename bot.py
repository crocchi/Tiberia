"""
Tiberia - Telegram Bot with AI Integration

This bot allows users to interact with AI through Telegram messages.
"""

import os
import logging
from dotenv import load_dotenv
from telegram import Update
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    ContextTypes,
    filters,
)
from openai import OpenAI

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Initialize OpenAI client
_openai_api_key = os.getenv("OPENAI_API_KEY")
if not _openai_api_key:
    raise ValueError("OPENAI_API_KEY environment variable is required")
openai_client = OpenAI(api_key=_openai_api_key)

# Store conversation history per user
conversation_history: dict[int, list] = {}


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a welcome message when the /start command is issued."""
    user = update.effective_user
    await update.message.reply_html(
        f"Ciao {user.mention_html()}! 👋\n\n"
        "Sono Tiberia, il tuo assistente AI. "
        "Puoi parlarmi in italiano o in qualsiasi lingua e ti risponderò.\n\n"
        "Usa /help per vedere i comandi disponibili."
    )


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message with available commands."""
    help_text = """
🤖 *Comandi disponibili:*

/start - Avvia il bot
/help - Mostra questo messaggio di aiuto
/reset - Resetta la conversazione

📝 *Come usare il bot:*
Scrivi semplicemente un messaggio e l'AI ti risponderà!
    """
    await update.message.reply_text(help_text, parse_mode="Markdown")


async def reset_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Reset the conversation history for the user."""
    user_id = update.effective_user.id
    if user_id in conversation_history:
        conversation_history[user_id] = []
    await update.message.reply_text("🔄 Conversazione resettata! Possiamo iniziare da capo.")


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle incoming text messages and respond using AI."""
    user_id = update.effective_user.id
    user_message = update.message.text

    # Initialize conversation history for new users
    if user_id not in conversation_history:
        conversation_history[user_id] = []

    # Add user message to history
    conversation_history[user_id].append({
        "role": "user",
        "content": user_message
    })

    # Keep only last 20 messages to manage context length
    if len(conversation_history[user_id]) > 20:
        conversation_history[user_id] = conversation_history[user_id][-20:]

    try:
        # Send typing action while processing
        await update.message.chat.send_action("typing")

        # Create chat completion with OpenAI
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "Sei Tiberia, un assistente AI amichevole e utile. "
                               "Rispondi in modo naturale e conversazionale. "
                               "Puoi rispondere in italiano o nella lingua usata dall'utente."
                }
            ] + conversation_history[user_id],
            max_tokens=1000,
            temperature=0.7
        )

        # Extract the AI response
        ai_response = response.choices[0].message.content
        if ai_response is None:
            ai_response = "Mi dispiace, non ho potuto generare una risposta."

        # Add AI response to history
        conversation_history[user_id].append({
            "role": "assistant",
            "content": ai_response
        })

        # Send the response
        await update.message.reply_text(ai_response)

    except Exception as e:
        logger.error(f"Error processing message: {e}")
        await update.message.reply_text(
            "Mi dispiace, si è verificato un errore. Riprova più tardi. 😔"
        )


async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Log errors caused by updates."""
    logger.error(f"Update {update} caused error {context.error}")


def main() -> None:
    """Start the bot."""
    # Get the token from environment
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not token:
        logger.error("TELEGRAM_BOT_TOKEN not found in environment variables!")
        return

    # Create the Application
    application = Application.builder().token(token).build()

    # Add handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("reset", reset_command))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    # Add error handler
    application.add_error_handler(error_handler)

    # Start the bot
    logger.info("Starting Tiberia bot...")
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
