"use strict";

const fs = require("fs");
const path = require("path");

/**
 * Bot Configuration Manager
 * Handles loading and validation of bot configurations
 */
class BotConfigManager {
  constructor(configPath, logger) {
    this.configPath = configPath || path.join(__dirname, "../config/bots.json");
    this.logger = logger || console;
    this.config = null;
    this.loadConfig();
  }

  /**
   * Load bot configuration from file
   */
  loadConfig() {
    try {
      if (!fs.existsSync(this.configPath)) {
        this.logger.warn(`Bot config file not found: ${this.configPath}`);
        this.config = { bots: {}, defaultSettings: {} };
        return;
      }

      const configData = fs.readFileSync(this.configPath, "utf8");
      this.config = JSON.parse(configData);
      this.validateConfig();
      this.logger.info(`Bot configuration loaded: ${Object.keys(this.config.bots).length} bots configured`);
    } catch (error) {
      this.logger.error("Failed to load bot configuration:", error.message);
      this.config = { bots: {}, defaultSettings: {} };
    }
  }

  /**
   * Validate configuration structure
   */
  validateConfig() {
    if (!this.config.bots || typeof this.config.bots !== "object") {
      throw new Error("Invalid config: 'bots' section missing or invalid");
    }

    if (!this.config.defaultSettings) {
      this.config.defaultSettings = {};
    }

    // Validate each bot configuration
    for (const [botKey, bot] of Object.entries(this.config.bots)) {
      if (!bot.id || !bot.name) {
        this.logger.warn(`Bot ${botKey} missing required fields (id, name)`);
      }
    }
  }

  /**
   * Get all available bots
   */
  getAllBots() {
    return Object.entries(this.config.bots).map(([key, bot]) => ({
      key,
      ...bot,
      url: this.getBotUrl(bot.id)
    }));
  }

  /**
   * Get enabled bots only
   */
  getEnabledBots() {
    return this.getAllBots().filter(bot => bot.enabled !== false);
  }

  /**
   * Get specific bot by key
   */
  getBot(botKey) {
    const bot = this.config.bots[botKey];
    if (!bot) return null;

    return {
      key: botKey,
      ...bot,
      url: this.getBotUrl(bot.id)
    };
  }

  /**
   * Get bot by ID
   */
  getBotById(botId) {
    const botEntry = Object.entries(this.config.bots).find(([, bot]) => bot.id === botId);
    if (!botEntry) return null;

    const [key, bot] = botEntry;
    return {
      key,
      ...bot,
      url: this.getBotUrl(bot.id)
    };
  }

  /**
   * Get primary bot (highest priority enabled bot)
   */
  getPrimaryBot() {
    const enabledBots = this.getEnabledBots();
    if (enabledBots.length === 0) return null;

    return enabledBots.sort((a, b) => (a.priority || 999) - (b.priority || 999))[0];
  }

  /**
   * Check if bot exists and is enabled
   */
  isValidBot(botId) {
    const bot = this.getBotById(botId);
    return bot && bot.enabled !== false;
  }

  /**
   * Get default settings
   */
  getDefaultSettings() {
    return { ...this.config.defaultSettings };
  }

  /**
   * Get bot timeout (bot-specific or default)
   */
  getBotTimeout(botKey) {
    const bot = this.getBot(botKey);
    return bot?.timeout || this.config.defaultSettings.timeout || 120000;
  }

  /**
   * Get bot prompt (bot-specific or fallback)
   */
  getBotPrompt(botKey, fallbackPrompt) {
    const bot = this.getBot(botKey);
    return bot?.defaultPrompt || fallbackPrompt || "Provide news updates.";
  }

  /**
   * Generate bot URL
   */
  getBotUrl(botId) {
    const hostname = this.config.defaultSettings.hostname || "chatbots.stadtulm.de";
    return `https://${hostname}/bot/${botId}/chat`;
  }

  /**
   * Reload configuration from file
   */
  reload() {
    this.logger.info("Reloading bot configuration...");
    this.loadConfig();
  }

  /**
   * Get configuration stats
   */
  getStats() {
    const allBots = this.getAllBots();
    const enabledBots = allBots.filter(bot => bot.enabled !== false);
    
    return {
      total: allBots.length,
      enabled: enabledBots.length,
      disabled: allBots.length - enabledBots.length,
      categories: [...new Set(allBots.map(bot => bot.category).filter(Boolean))]
    };
  }
}

module.exports = BotConfigManager;