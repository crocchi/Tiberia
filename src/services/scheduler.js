/**
 * Scheduler for the Capri Island AI Guide
 * Uses node-cron for scheduling periodic tasks
 */

const cron = require("node-cron");

class GuideScheduler {
  constructor(guideService) {
    this.guideService = guideService;
    this.scheduledTasks = [];
  }

  /**
   * Schedule the daily tip job
   * Runs every day at 9:00 AM
   * @param {function} callback - Function to call with the daily tip
   */
  scheduleDailyTip(callback) {
    const task = cron.schedule(
      "0 9 * * *",
      async () => {
        console.log("[Scheduler] Generating daily tip...");
        const tip = await this.guideService.getDailyTip();
        if (callback) {
          callback(tip);
        }
        console.log(`[Daily Tip from ${this.guideService.getGuideName()}]:`);
        console.log(tip);
      },
      {
        scheduled: true,
        timezone: "Europe/Rome",
      }
    );

    this.scheduledTasks.push(task);
    console.log(
      "[Scheduler] Daily tip job scheduled for 9:00 AM (Europe/Rome)"
    );
    return task;
  }

  /**
   * Schedule a custom job
   * @param {string} cronExpression - Cron expression for scheduling
   * @param {function} job - The job function to execute
   * @param {object} options - Additional options for the cron job
   */
  scheduleCustomJob(cronExpression, job, options = {}) {
    const defaultOptions = {
      scheduled: true,
      timezone: "Europe/Rome",
      ...options,
    };

    const task = cron.schedule(cronExpression, job, defaultOptions);
    this.scheduledTasks.push(task);
    console.log(`[Scheduler] Custom job scheduled with expression: ${cronExpression}`);
    return task;
  }

  /**
   * Stop all scheduled tasks
   */
  stopAll() {
    this.scheduledTasks.forEach((task) => task.stop());
    console.log("[Scheduler] All scheduled tasks stopped");
  }

  /**
   * Validate a cron expression
   * @param {string} expression - The cron expression to validate
   * @returns {boolean} - Whether the expression is valid
   */
  static validateCronExpression(expression) {
    return cron.validate(expression);
  }
}

module.exports = GuideScheduler;
