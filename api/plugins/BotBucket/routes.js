"use strict";

const { getOrCreateService } = require("./services/BotBucketService");

module.exports = function buildRouter({ express, app, config, logger }) {
  const router = express.Router();
  const botService = getOrCreateService(config, logger);

  // POST /botbucket/fetch - News via HTTPS from specific bot
  router.post("/fetch", async (req, res) => {
    try {
      const { chatbotId, botKey, question, saveToDb = true } = req.body || {};
      
      if (!chatbotId) {
        return res.status(400).json({ success: false, error: "ChatBot-ID erforderlich" });
      }

      // Validate bot exists and is enabled
      if (!botService.isValidBot(chatbotId)) {
        return res.status(400).json({ 
          success: false, 
          error: "Bot nicht gefunden oder deaktiviert",
          availableBots: botService.getEnabledBots().map(b => ({ id: b.id, name: b.name }))
        });
      }

      const bot = botService.getBotById(chatbotId);
      logger.info(`Starte Bot-Anfrage für: ${bot.name} (${chatbotId})`);
      
      const botResponse = await botService.fetchNewsFromBot(chatbotId, question, botKey);
      const newsObjects = botService.parseNewsFromResponse(botResponse);

      let savedNews = [];
      if (saveToDb) {
        const database = app.get("database");
        if (database) {
          savedNews = await botService.saveNewsToDatabase(newsObjects, database);
        } else {
          logger.warn("Datenbank nicht verfügbar - News nicht gespeichert");
        }
      }

      const database = app.get("database");
      await botService.addHistoryEntry("API", chatbotId, question, newsObjects.length, savedNews.length, "success", null, newsObjects, database);

      return res.json({
        success: true,
        message: `${newsObjects.length} News-Artikel von ${bot.name} abgerufen`,
        bot: { id: bot.id, name: bot.name, key: bot.key },
        botResponse: { raw: botResponse.answer, parsed: newsObjects },
        saved: savedNews.length,
        data: newsObjects
      });
    } catch (error) {
      logger.error("Bot-Fetch Fehler:", error);
      const { chatbotId, question } = req.body || {};
      const database = app.get("database");
      await botService.addHistoryEntry("API", chatbotId || null, question || null, 0, 0, "error", error.message, [], database);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /botbucket/scrape - News via Puppeteer scraping
  router.post("/scrape", async (req, res) => {
    try {
      const { question, botKey, saveToDb = true, overrideUrl = null, debugDump = false, debugScreenshot = false, debugInline = false } = req.body || {};

      logger.info(`Starte Puppeteer-Scraping${botKey ? ` mit Bot-Config: ${botKey}` : ''}...`);
      const scrape = await botService.scrapeNewsWithPuppeteer(question, botKey, { overrideUrl, debugDump, debugScreenshot, debugInline });
      const newsObjects = scrape.items || [];

      let savedNews = [];
      if (saveToDb) {
        const database = app.get("database");
        if (database) {
          savedNews = await botService.saveNewsToDatabase(newsObjects, database);
        } else {
          logger.warn("Datenbank nicht verfügbar - News nicht gespeichert");
        }
      }

      const database = app.get("database");
      await botService.addHistoryEntry("Puppeteer", botKey || null, question, newsObjects.length, savedNews.length, "success", null, newsObjects, database);

      const response = {
        success: true,
        message: `${newsObjects.length} News-Artikel via Puppeteer gescraped`,
        method: "puppeteer",
        botKey: botKey || "default",
        scraped: newsObjects.length,
        saved: savedNews.length,
        data: newsObjects
      };
      if ((debugDump || debugInline) && scrape.debug) {
        response.debug = scrape.debug;
      }
      return res.json(response);
    } catch (error) {
      logger.error("Puppeteer-Scraping Fehler:", error);
      const { question } = req.body || {};
      const database = app.get("database");
      await botService.addHistoryEntry("Puppeteer", null, question || null, 0, 0, "error", error.message, [], database);
      return res.status(500).json({ success: false, error: error.message });
    } finally {
      await botService.closeBrowser();
    }
  });

  // GET /botbucket/bots - Available ChatBots from configuration
  router.get("/bots", (req, res) => {
    try {
      const { enabled_only = true } = req.query;
      const showOnlyEnabled = enabled_only === 'true' || enabled_only === true;
      
      const bots = showOnlyEnabled ? botService.getEnabledBots() : botService.getAllBots();
      const stats = botService.getConfigStats();
      
      return res.json({
        success: true,
        bots: bots.map(bot => ({
          key: bot.key,
          id: bot.id,
          name: bot.name,
          description: bot.description,
          enabled: bot.enabled,
          category: bot.category,
          priority: bot.priority,
          url: bot.url,
          timeout: bot.timeout
        })),
        stats,
        filter: { enabled_only: showOnlyEnabled }
      });
    } catch (error) {
      logger.error("Fehler beim Abrufen der Bot-Konfiguration:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /botbucket/test - Test bot connection
  router.post("/test", async (req, res) => {
    try {
      const { chatbotId, botKey } = req.body || {};
      const testQuestion = "Hallo, bist du erreichbar?";
      
      if (!chatbotId) {
        return res.status(400).json({ 
          success: false, 
          error: "ChatBot-ID erforderlich",
          availableBots: botService.getEnabledBots().map(b => ({ id: b.id, name: b.name, key: b.key }))
        });
      }

      if (!botService.isValidBot(chatbotId)) {
        return res.status(400).json({ 
          success: false, 
          error: "Bot nicht gefunden oder deaktiviert",
          availableBots: botService.getEnabledBots().map(b => ({ id: b.id, name: b.name, key: b.key }))
        });
      }

      const bot = botService.getBotById(chatbotId);
      const startTime = Date.now();
      
      const response = await botService.fetchNewsFromBot(chatbotId, testQuestion, botKey);
      const responseTime = Date.now() - startTime;
      
      return res.json({
        success: true,
        message: `Bot-Verbindung zu ${bot.name} erfolgreich`,
        bot: { id: bot.id, name: bot.name, key: bot.key },
        responseTime: `${responseTime}ms`,
        response: (response.answer || "").slice(0, 200) + "..."
      });
    } catch (error) {
      logger.error("Bot-Test Fehler:", error);
      return res.status(500).json({
        success: false,
        error: error.message,
        suggestion: "Prüfen Sie die Bot-ID und Netzwerkverbindung"
      });
    }
  });

  // GET /botbucket/bots/:botId - Get specific bot configuration
  router.get("/bots/:botId", (req, res) => {
    try {
      const { botId } = req.params;
      const bot = botService.getBotById(botId);
      
      if (!bot) {
        return res.status(404).json({ 
          success: false, 
          error: "Bot nicht gefunden",
          availableBots: botService.getAllBots().map(b => ({ id: b.id, name: b.name, key: b.key }))
        });
      }
      
      return res.json({
        success: true,
        bot: {
          key: bot.key,
          id: bot.id,
          name: bot.name,
          description: bot.description,
          enabled: bot.enabled,
          category: bot.category,
          priority: bot.priority,
          url: bot.url,
          timeout: bot.timeout,
          defaultPrompt: bot.defaultPrompt
        }
      });
    } catch (error) {
      logger.error("Fehler beim Abrufen der Bot-Details:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /botbucket/config/reload - Reload bot configuration
  router.post("/config/reload", (req, res) => {
    try {
      botService.reloadBotConfig();
      const stats = botService.getConfigStats();
      
      return res.json({
        success: true,
        message: "Bot-Konfiguration neu geladen",
        stats
      });
    } catch (error) {
      logger.error("Fehler beim Neuladen der Konfiguration:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // GET /botbucket/history - Letzte Interaktionen
  router.get("/history", async (req, res) => {
    try {
      const { limit = 10 } = req.query || {};
      const n = Math.max(1, parseInt(limit, 10) || 10);
      const database = app.get("database");
      const history = await botService.getHistory(n, database);
      return res.json({ success: true, history, total: history.length });
    } catch (error) {
      logger.error("History-Abruf Fehler:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // DELETE /botbucket/history - History löschen (Memory + DB)
  router.delete("/history", async (req, res) => {
    try {
      const { confirm } = req.query || {};
      if (!(confirm === 'true' || confirm === true)) {
        return res.status(400).json({ success: false, error: "Bestätige mit ?confirm=true" });
      }
      const database = app.get("database");
      const result = await botService.clearHistory(database);
      return res.json({ success: true, message: "History gelöscht", ...result });
    } catch (error) {
      logger.error("Fehler beim Löschen der History:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /botbucket/schedule - Schedule automatic bot runs
  router.post("/schedule", async (req, res) => {
    try {
      const { chatbotId, botKey, interval = 3600000, question } = req.body || {};
      
      if (!chatbotId) {
        return res.status(400).json({ 
          success: false, 
          error: "ChatBot-ID erforderlich",
          availableBots: botService.getEnabledBots().map(b => ({ id: b.id, name: b.name, key: b.key }))
        });
      }

      if (!botService.isValidBot(chatbotId)) {
        return res.status(400).json({ 
          success: false, 
          error: "Bot nicht gefunden oder deaktiviert",
          availableBots: botService.getEnabledBots().map(b => ({ id: b.id, name: b.name, key: b.key }))
        });
      }

      const bot = botService.getBotById(chatbotId);
      const finalQuestion = question || botService.getDefaultQuestion(bot.key);
      
      return res.json({
        success: true,
        message: `Automatischer Abruf für ${bot.name} geplant`,
        schedule: {
          chatbotId,
          botKey: bot.key,
          botName: bot.name,
          interval: `${interval / 1000}s`,
          question: finalQuestion,
          nextRun: new Date(Date.now() + interval).toISOString()
        },
        note: "Scheduling ist derzeit ein Placeholder - Implementierung mit BullMQ geplant"
      });
    } catch (error) {
      logger.error("Scheduling-Fehler:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
};
