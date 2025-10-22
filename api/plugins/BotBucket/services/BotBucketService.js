// api/plugins/BotBucket/services/BotBucketService.js
"use strict";

const uuid = require("uuid");
const BotHttpClient = require("./BotHttpClient");
const PuppeteerScraper = require("./PuppeteerScraper");
const NewsParser = require("./NewsParser");
const BotConfigManager = require("./BotConfigManager");

// Singleton für Plugin-Lifetime
let _globalService = null;

/**
 * BotBucket Service - Manages bot interactions and news processing
 */
class BotBucketService {
  constructor(config, logger) {
    this.config = config || {};
    this.logger = logger || console;

    // Bot Configuration Manager
    this.botConfig = new BotConfigManager(null, this.logger);

    // Subsystems
    this.httpClient = new BotHttpClient(this.config, this.logger);
    this.scraper = new PuppeteerScraper(this.config, this.logger);

    // In-Memory History (fallback when DB unavailable)
    this.scrapingHistory = [];

    // Default settings from config
    this.defaultSettings = this.botConfig.getDefaultSettings();
  }

  /**
   * Get all available bots
   */
  getAllBots() {
    return this.botConfig.getAllBots();
  }

  /**
   * Get enabled bots only
   */
  getEnabledBots() {
    return this.botConfig.getEnabledBots();
  }

  /**
   * Get specific bot configuration
   */
  getBotConfig(botKey) {
    return this.botConfig.getBot(botKey);
  }

  /**
   * Get bot by ID
   */
  getBotById(botId) {
    return this.botConfig.getBotById(botId);
  }

  /**
   * Get primary bot
   */
  getPrimaryBot() {
    return this.botConfig.getPrimaryBot();
  }

  /**
   * Validate bot ID
   */
  isValidBot(botId) {
    return this.botConfig.isValidBot(botId);
  }

  /**
   * Get default question for bot or fallback
   */
  getDefaultQuestion(botKey = null) {
    if (botKey) {
      return this.botConfig.getBotPrompt(botKey);
    }
    // Fallback: verwende Primary Bot defaultPrompt, falls vorhanden
    const primary = this.getPrimaryBot();
    if (primary?.defaultPrompt) return primary.defaultPrompt;
    // Letzter Fallback: statischer Prompt aus Env/Config
    return (
      this.config.BOTBUCKET_DEFAULT_QUESTION ||
      "Berichte ausfuehrlich ueber die neuesten Newsbeitraege seit dem 01.01.2024. Antworte auf deutsch. Format newsFlashTitle=title newsFlashContent=content newsFlashDate=date newsFlashID=InterviewID"
    );
  }

  /**
   * HTTPS: News from specific bot
   */
  async fetchNewsFromBot(botId, question = null, botKey = null) {
    // Validate bot
    if (!this.isValidBot(botId)) {
      throw new Error(`Bot with ID ${botId} not found or disabled`);
    }

    const bot = this.getBotById(botId);
    const finalQuestion = question || this.getDefaultQuestion(bot.key);
    const timeout = this.botConfig.getBotTimeout(bot.key);

    this.logger.info(`Fetching news from bot: ${bot.name} (${botId})`);
    
    return this.httpClient.fetchNewsFromBot(botId, finalQuestion, finalQuestion, timeout);
  }

  /**
   * Parser für Bot-Response → Newsobjekte
   */
  parseNewsFromResponse(response) {
    const answer = response?.answer || "";
    this.logger.debug(`[BotBucketService] parseNewsFromResponse: Antwort hat ${answer.length} Zeichen`);
    const newsObjects = NewsParser.parseFromAnswer(answer);
    this.logger.debug(`[BotBucketService] parseNewsFromResponse: ${newsObjects.length} News-Objekte extrahiert`);
    return newsObjects;
  }

  /**
   * Puppeteer: News scraping with configurable bot
   */
  async scrapeNewsWithPuppeteer(question = null, botKey = null, options = {}) {
    const finalQuestion = question || this.getDefaultQuestion(botKey);
    this.logger.info(`Starting Puppeteer scraping with question: "${finalQuestion.substring(0, 100)}..."`);

    const overrideUrl = options?.overrideUrl || null;

    const result = await this.scraper.scrapeNews(finalQuestion, this.getDefaultQuestion(), overrideUrl, {
      debugDump: options?.debugDump === true,
      debugScreenshot: options?.debugScreenshot === true
    });

    const items = Array.isArray(result) ? result : (result?.items || []);
    const debug = Array.isArray(result) ? null : (result?.debug || null);

    this.logger.info(`Puppeteer scraping completed: ${items.length || 0} news items found`);
    
    return { items, debug };
  }

  /**
   * Get configuration statistics
   */
  getConfigStats() {
    return this.botConfig.getStats();
  }

  /**
   * Reload bot configuration
   */
  reloadBotConfig() {
    this.botConfig.reload();
  }

  /**
   * Deutsches Datum nach Epoch (ms)
   * Unterstützt: "DD.MM.YYYY", "DD.MM.YYYY HH:mm", "DD.MM.YYYY HH:mm:ss"
   */
  parseGermanDateToEpoch(dateStr) {
    if (typeof dateStr !== "string") return null;
    const m = dateStr
      .trim()
      .match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
    if (!m) return null;
    const [, d, mo, y, HH = "00", MM = "00", SS = "00"] = m;
    const dd = String(d).padStart(2, "0");
    const mm = String(mo).padStart(2, "0");
    const h = String(HH).padStart(2, "0");
    const min = String(MM).padStart(2, "0");
    const s = String(SS).padStart(2, "0");
    const isoLocal = `${y}-${mm}-${dd}T${h}:${min}:${s}`;
    const ms = new Date(isoLocal).getTime();
    return Number.isNaN(ms) ? null : ms;
  }

  /**
   * Beliebiges Datum nach Epoch (ms)
   * Unterstützt:
   *  - Deutsch: "DD.MM.YYYY", "DD.MM.YYYY HH:mm", "DD.MM.YYYY HH:mm:ss"
   *  - ISO:     "YYYY-MM-DD HH:mm[:ss]", "YYYY-MM-DDTHH:mm[:ss][Z]"
   */
  parseAnyDateToEpoch(dateStr) {
    if (typeof dateStr !== "string") return null;
    const s = dateStr.trim();

    // 1) Deutsch
    const de = this.parseGermanDateToEpoch(s);
    if (de !== null) return de;

    // 2) ISO "YYYY-MM-DD HH:mm[:ss]"
    let m = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/);
    if (m) {
      const [, y, mm, dd, HH, MM, SS = "00"] = m;
      const isoLocal = `${y}-${mm}-${dd}T${HH}:${MM}:${SS}`;
      const ms = new Date(isoLocal).getTime();
      if (!Number.isNaN(ms)) return ms;
    }

    // 3) ISO mit 'T' und evtl. 'Z' (oder Offset)
    //    -> Date kann das direkt parsen
    if (!Number.isNaN(Date.parse(s))) {
      const ms = new Date(s).getTime();
      if (!Number.isNaN(ms)) return ms;
    }

    return null;
  }

  /**
   * News in Datenbank speichern
   * Erwartet DB-Interface mit readNews(query, cb) und writeNews(obj, cb)
   * - Duplikatsprüfung über (title + publishDate)
   * - publishDate immer als valide Millisekunden (Fallback: now) verwenden
   */
  async saveNewsToDatabase(newsObjects, database) {
    const savedNews = [];
    if (!Array.isArray(newsObjects) || !newsObjects.length) return savedNews;
    if (!database) return savedNews;

    for (const newsItem of newsObjects) {
      try {
        // robustes Datum → Epoch (ms), Fallback: now
        const now = Date.now();
        const tsParsed = this.parseAnyDateToEpoch(newsItem.date);
        const publishDateMs = Number.isFinite(tsParsed) ? tsParsed : now;

        // Duplikatsprüfung nach (title, publishDate)
        this.logger.debug(`Prüfe Duplikat für: "${newsItem.title}" mit PublishDate: ${new Date(publishDateMs).toISOString()}`);
        const exists = await new Promise((resolve) => {
          // Legacy-DB erwartet 'date' als String und bildet daraus publishDate (ms)
          const query = { title: newsItem.title, date: newsItem.date || '' };
          database.readNews(query, (result) => {
            try {
              resolve(result.fetchAll().length > 0);
            } catch {
              resolve(false);
            }
          });
        });

        if (exists) {
          this.logger.debug(`News bereits vorhanden: ${newsItem.title} (PublishDate: ${new Date(publishDateMs).toISOString()})`);
          continue;
        }

        const insertObject = {
          id: uuid.v4(),
          title: newsItem.title,
          news: newsItem.content,
          created: now,
          publishDate: publishDateMs,
          ...(newsItem.interviewId ? { interview_id: String(newsItem.interviewId) } : {})
        };

        await new Promise((resolve) => {
          database.writeNews(insertObject, (result) => resolve(result));
        });

        savedNews.push(insertObject);
        this.logger.info(`News gespeichert: ${newsItem.title}`);
      } catch (error) {
        this.logger.error(`Fehler beim Speichern der News "${newsItem.title}":`, error);
      }
    }

    return savedNews;
  }

  /**
   * History-Eintrag in Datenbank speichern
   */
  async saveHistoryToDatabase(entry, database) {
    if (!database) return;
    
    try {
      const historyRecord = {
        id: entry.id,
        timestamp: Date.now(),
        method: entry.method,
        chatbotId: entry.chatbotId || null,
        question: entry.question,
        newsCount: entry.newsCount,
        saved: entry.saved,
        status: entry.status,
        error: entry.error || null,
        newsData: JSON.stringify(entry.newsData || [])
      };

      await new Promise((resolve) => {
        database.writeScrapingHistory(historyRecord, (result) => resolve(result));
      });

      this.logger.debug(`History in DB gespeichert: ${entry.id}`);
    } catch (error) {
      this.logger.error(`Fehler beim Speichern der History:`, error);
    }
  }


  /**
   * History-Eintrag hinzufügen (mit Datenbank-Support)
   */
  async addHistoryEntry(method, chatbotId, question, newsCount, saved, status = "success", error = null, newsData = [], database = null) {
    const computedCount = (Array.isArray(newsData) && newsData.length) ? newsData.length : (Number.isFinite(newsCount) ? newsCount : 0);
    const computedSaved = Number.isFinite(saved) ? saved : 0;
    const entry = {
      id: uuid.v4(),
      timestamp: new Date().toISOString(),
      method,
      chatbotId,
      question: question || this.getDefaultQuestion(),
      newsCount: computedCount,
      saved: computedSaved,
      status,
      error,
      newsData: newsData || []
    };

    // In-Memory History (Fallback)
    this.scrapingHistory.unshift(entry);
    if (this.scrapingHistory.length > 50) {
      this.scrapingHistory = this.scrapingHistory.slice(0, 50);
    }

    // Datenbank-History
    if (database) {
      await this.saveHistoryToDatabase(entry, database);
    }

    this.logger.info(`History entry added: ${method} - ${status}`);
    return entry;
  }

  // Hilfsfunktion INSIDE der Klasse BotBucketService (z.B. direkt unter den parse*-Methoden)
safeParseNewsData(value) {
  try {
    if (value == null) return [];
    // X DevAPI kann JSON bereits als Objekt liefern
    if (typeof value === "object") return value;
    if (typeof value === "string" && value.trim() === "") return [];
    if (typeof value === "string") return JSON.parse(value);
    // Fallback: unbekannter Typ -> in Array packen, damit nichts verloren geht
    return [value];
  } catch (e) {
    this.logger.warn("Konnte newsData nicht parsen, gebe leeres Array zurück:", e?.message);
    return [];
  }
}


// komplette getHistory()-Methode ersetzen
async getHistory(limit = 10, database = null) {
  if (database) {
    try {
      return await new Promise((resolve) => {
        database.readScrapingHistory(limit, (result) => {
          try {
            const rows = result.fetchAll();

            // Erwartete Spaltenreihenfolge:
            // id(0), timestamp(1), method(2), chatbotId(3), question(4),
            // newsCount(5), saved(6), status(7), error(8), newsData(9)
            const history = rows.map((row) => {
              const rawTs = row[1];
              // timestamp kommt als BIGINT (ms). Sicher in Number casten:
              const tsMs = typeof rawTs === "number" ? rawTs : Number(rawTs);
              const iso = Number.isFinite(tsMs) ? new Date(tsMs).toISOString() : new Date().toISOString();

              return {
                id: row[0],
                timestamp: iso,
                method: row[2],
                chatbotId: row[3],
                question: row[4],
                newsCount: row[5],
                saved: row[6],
                status: row[7],
                error: row[8],
                newsData: this.safeParseNewsData(row[9])
              };
            });

            resolve(history);
          } catch (error) {
            this.logger.warn('Fehler beim Abrufen der DB-History, verwende Memory-Fallback:', error);
            resolve(this.scrapingHistory.slice(0, limit));
          }
        });
      });
    } catch (error) {
      this.logger.warn('DB-History nicht verfügbar, verwende Memory-Fallback:', error);
    }
  }

  // Fallback: Memory
  return this.scrapingHistory.slice(0, limit);
}


  /**
   * Browser schließen (delegiert an Scraper)
   */
  async closeBrowser() {
    await this.scraper.closeBrowser();
  }

  /**
   * History leeren (Memory + optional DB)
   */
  async clearHistory(database = null) {
    const before = this.scrapingHistory.length;
    this.scrapingHistory = [];
    let deleted = 0;
    if (database && typeof database.clearScrapingHistory === 'function') {
      deleted = await new Promise((resolve) => {
        database.clearScrapingHistory((result) => {
          try {
            resolve(result?.deleted || 0);
          } catch {
            resolve(0);
          }
        });
      });
    }
    this.logger.info(`History geleert: memoryBefore=${before}, dbDeleted=${deleted}`);
    return { memoryCleared: before, dbDeleted: deleted };
  }
}

/**
 * Singleton-Helper für Plugin
 */
function getOrCreateService(config, logger) {
  if (!_globalService) {
    _globalService = new BotBucketService(config, logger);
  }
  return _globalService;
}

function getGlobalService() {
  return _globalService;
}

module.exports = {
  BotBucketService,
  getOrCreateService,
  getGlobalService
};
