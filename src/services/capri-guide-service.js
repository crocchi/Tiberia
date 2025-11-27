/**
 * OpenAI Service for the Capri Island AI Guide
 * Handles communication with OpenAI API
 */

const OpenAI = require("openai");
const guidePersona = require("../config/guide-persona");

class CapriGuideService {
  constructor(apiKey) {
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
    this.conversationHistory = [];
  }

  /**
   * Initialize conversation with the guide's system prompt
   */
  initializeConversation() {
    this.conversationHistory = [
      {
        role: "system",
        content: guidePersona.systemPrompt,
      },
    ];
  }

  /**
   * Send a message to the AI guide and get a response
   * @param {string} userMessage - The user's message
   * @returns {Promise<string>} - The guide's response
   */
  async chat(userMessage) {
    if (this.conversationHistory.length === 0) {
      this.initializeConversation();
    }

    this.conversationHistory.push({
      role: "user",
      content: userMessage,
    });

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: this.conversationHistory,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const assistantMessage = response.choices[0].message.content;

    this.conversationHistory.push({
      role: "assistant",
      content: assistantMessage,
    });

    return assistantMessage;
  }

  /**
   * Get a greeting message from the guide
   * @returns {Promise<string>} - A greeting message
   */
  async getGreeting() {
    return this.chat(
      "Presentati e dai il benvenuto a un nuovo visitatore dell'isola di Capri."
    );
  }

  /**
   * Get a daily tip about Capri
   * @returns {Promise<string>} - A daily tip
   */
  async getDailyTip() {
    this.initializeConversation();
    return this.chat(
      "Dammi un consiglio del giorno per chi visita Capri oggi, includendo un suggerimento su cosa vedere o fare."
    );
  }

  /**
   * Reset the conversation history
   */
  resetConversation() {
    this.initializeConversation();
  }

  /**
   * Get the guide's name
   * @returns {string} - The guide's name
   */
  getGuideName() {
    return guidePersona.name;
  }
}

module.exports = CapriGuideService;
