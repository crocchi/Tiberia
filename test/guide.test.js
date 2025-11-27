/**
 * Tests for Tiberia - Capri Island AI Guide
 */

const { test, describe } = require("node:test");
const assert = require("node:assert");

// Test the guide persona configuration
describe("Guide Persona", () => {
  test("should have required properties", () => {
    const guidePersona = require("../src/config/guide-persona");

    assert.ok(guidePersona.name, "Guide should have a name");
    assert.ok(guidePersona.role, "Guide should have a role");
    assert.ok(guidePersona.systemPrompt, "Guide should have a system prompt");
  });

  test("should have Italian content in system prompt", () => {
    const guidePersona = require("../src/config/guide-persona");

    assert.ok(
      guidePersona.systemPrompt.includes("Capri"),
      "System prompt should mention Capri"
    );
    assert.ok(
      guidePersona.systemPrompt.includes("Grotta Azzurra"),
      "System prompt should mention Grotta Azzurra"
    );
    assert.ok(
      guidePersona.systemPrompt.includes("Faraglioni"),
      "System prompt should mention I Faraglioni"
    );
  });
});

// Test the scheduler
describe("GuideScheduler", () => {
  test("should validate cron expressions", () => {
    const GuideScheduler = require("../src/services/scheduler");

    assert.strictEqual(
      GuideScheduler.validateCronExpression("0 9 * * *"),
      true,
      "Should validate correct cron expression"
    );
    assert.strictEqual(
      GuideScheduler.validateCronExpression("invalid"),
      false,
      "Should reject invalid cron expression"
    );
    assert.strictEqual(
      GuideScheduler.validateCronExpression("*/5 * * * *"),
      true,
      "Should validate every 5 minutes expression"
    );
  });
});

// Test the CapriGuideService class structure
describe("CapriGuideService", () => {
  test("should be a class with required methods", () => {
    const CapriGuideService = require("../src/services/capri-guide-service");

    assert.strictEqual(typeof CapriGuideService, "function", "Should be a class");

    // Check prototype methods
    assert.strictEqual(
      typeof CapriGuideService.prototype.chat,
      "function",
      "Should have chat method"
    );
    assert.strictEqual(
      typeof CapriGuideService.prototype.getGreeting,
      "function",
      "Should have getGreeting method"
    );
    assert.strictEqual(
      typeof CapriGuideService.prototype.getDailyTip,
      "function",
      "Should have getDailyTip method"
    );
    assert.strictEqual(
      typeof CapriGuideService.prototype.resetConversation,
      "function",
      "Should have resetConversation method"
    );
    assert.strictEqual(
      typeof CapriGuideService.prototype.getGuideName,
      "function",
      "Should have getGuideName method"
    );
  });

  test("should return correct guide name", () => {
    const CapriGuideService = require("../src/services/capri-guide-service");
    const service = new CapriGuideService("fake-api-key");

    assert.strictEqual(service.getGuideName(), "Marco", "Guide name should be Marco");
  });

  test("should initialize with empty conversation history", () => {
    const CapriGuideService = require("../src/services/capri-guide-service");
    const service = new CapriGuideService("fake-api-key");

    assert.deepStrictEqual(
      service.conversationHistory,
      [],
      "Conversation history should be empty on init"
    );
  });

  test("should initialize conversation with system prompt", () => {
    const CapriGuideService = require("../src/services/capri-guide-service");
    const service = new CapriGuideService("fake-api-key");

    service.initializeConversation();

    assert.strictEqual(
      service.conversationHistory.length,
      1,
      "Should have one message after init"
    );
    assert.strictEqual(
      service.conversationHistory[0].role,
      "system",
      "First message should be system role"
    );
  });
});
