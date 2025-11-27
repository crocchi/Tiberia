/**
 * Tiberia - AI Guide for Capri Island
 * 
 * This application provides an AI-powered virtual tour guide
 * for the beautiful island of Capri, using OpenAI's GPT model.
 */

require("dotenv").config();

const CapriGuideService = require("./src/services/capri-guide-service");
const GuideScheduler = require("./src/services/scheduler");
const readline = require("readline");

// Check for API key
if (!process.env.OPENAI_API_KEY) {
  console.error("Error: OPENAI_API_KEY environment variable is not set.");
  console.error("Please create a .env file with your OpenAI API key.");
  console.error("See .env.example for reference.");
  process.exit(1);
}

// Initialize the guide service
const guideService = new CapriGuideService(process.env.OPENAI_API_KEY);
const scheduler = new GuideScheduler(guideService);

/**
 * Interactive chat mode with the Capri guide
 */
async function startInteractiveChat() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("\n===========================================");
  console.log("  Benvenuto a Capri! 🏝️");
  console.log("  Your AI Guide is ready to help you.");
  console.log("  Type 'exit' to quit, 'reset' to start over.");
  console.log("===========================================\n");

  // Get initial greeting
  console.log("Loading your guide...\n");
  
  const greeting = await guideService.getGreeting();
  console.log(`🗣️  ${guideService.getGuideName()}: ${greeting}\n`);

  const askQuestion = () => {
    rl.question("You: ", async (input) => {
      const trimmedInput = input.trim().toLowerCase();

      if (trimmedInput === "exit") {
        console.log("\nArrivederci! Enjoy your visit to Capri! 👋\n");
        scheduler.stopAll();
        rl.close();
        process.exit(0);
      }

      if (trimmedInput === "reset") {
        guideService.resetConversation();
        console.log("\n[Conversation reset]\n");
        askQuestion();
        return;
      }

      if (!input.trim()) {
        askQuestion();
        return;
      }

      try {
        const response = await guideService.chat(input);
        console.log(`\n🗣️  ${guideService.getGuideName()}: ${response}\n`);
      } catch (error) {
        console.error("\n❌ Error communicating with the guide:", error.message);
        console.log("Please try again.\n");
      }

      askQuestion();
    });
  };

  askQuestion();
}

/**
 * Run the scheduler only (for background mode)
 */
function runSchedulerMode() {
  console.log("\n===========================================");
  console.log("  Tiberia Scheduler Mode 📅");
  console.log("  Running scheduled tasks for Capri Guide");
  console.log("===========================================\n");

  // Schedule daily tip
  scheduler.scheduleDailyTip((tip) => {
    console.log("\n📌 Daily tip received:", tip);
  });

  console.log("Scheduler is running. Press Ctrl+C to stop.\n");
}

/**
 * Main entry point
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--scheduler")) {
    runSchedulerMode();
  } else if (args.includes("--help")) {
    console.log(`
Tiberia - AI Guide for Capri Island

Usage:
  node index.js              Start interactive chat with the guide
  node index.js --scheduler  Run in scheduler mode (daily tips)
  node index.js --help       Show this help message

Environment Variables:
  OPENAI_API_KEY    Your OpenAI API key (required)
    `);
  } else {
    await startInteractiveChat();
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
