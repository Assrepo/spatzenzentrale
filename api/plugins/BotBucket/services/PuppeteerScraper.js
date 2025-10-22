"use strict";

const puppeteer = require('puppeteer');
const NewsParser = require('./NewsParser');
const { DEFAULT_UA, normalizeWhitespace } = require('./utils');
const { attachRequestInterception, clickConsentPopup, writeDebugDump } = require('./scraping/PageUtils');
const { waitForStableAnswer, extractTextWithSource } = require('./scraping/DomWatcher');
const { sendQuestion } = require('./scraping/Interactor');

class PuppeteerScraper {
  constructor(config, logger) {
    this.config = config || {};
    this.logger = logger || console;
  }

  async initBrowser() {
    if (this.browser) return this.browser;
    
    this.browser = await puppeteer.launch({
        headless: true,
        ignoreHTTPSErrors: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--ignore-certificate-errors'
        ]
    });
    
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * - lädt die Seite
   * - sendet Nachricht über postMessage (Embedding API)
   * - wartet auf Bot-Antwort (newsFlashTitle=...)
   * - parst Tokens zu Newsobjekten via NewsParser
   */
  async scrapeNews(question, defaultQuestion, overrideUrl = null, opts = {}) {
    const browser = await this.initBrowser();
    const page = await browser.newPage();

    // Be generous with timeouts in CI/servers and avoid hanging on SPA navigations
    page.setDefaultNavigationTimeout(150000);
    page.setDefaultTimeout(90000);

    // waitForStableAnswer is provided by scraping/DomWatcher

    try {
      this.logger.info("Starte Puppeteer-Scraping...");

      await page.setUserAgent(DEFAULT_UA);
      await page.setViewport({ width: 1280, height: 720 });

      // Block heavy assets to reduce flakiness and speed load
      await attachRequestInterception(page);

      const remoteUrl = overrideUrl || this.config.BOT_URL ||
        "https://chatbots.stadtulm.de/bot/a43b3038-423e-47ab-8226-a8714418c88f/chat/undecorated";

      this.logger.info(`Lade Bot-Seite: ${remoteUrl}`);
      await page.goto(remoteUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await clickConsentPopup(page, this.logger);

      // On remote page try to inject question and wait for answer
      const finalQuestion = question || defaultQuestion;
      // kurze Wartezeit auf Input-Render; Fehler ignorieren
      try { await page.waitForSelector('.MuiInputBase-input.MuiInput-input.MuiInputBase-inputMultiline.MuiAutocomplete-input.MuiAutocomplete-inputFocused', { timeout: 5000 }); } catch {}
      this.logger.info(`📤 Sende Frage in UI: "${finalQuestion.substring(0, 80)}..."`);
      const sent = await sendQuestion(page, finalQuestion, this.logger);
      if (sent.ok) {
        this.logger.info(`✅ Frage gesendet via ${sent.via}${sent.selector ? ` (${sent.selector})` : ''}${sent.frame ? ` in frame=${sent.frame}` : ''}${sent.clicked ? ' + click' : ''}`);
      } else {
        this.logger.warn(`❗ Konnte Eingabe-UI nicht finden; wechsle auf Fallback (${sent.via})`);
      }

      // Wait for tokens to appear and become stable
      this.logger.info("⏳ Warte, bis die Antwort vollständig erscheint...");
      const stableText = await waitForStableAnswer(page, { timeoutMs: 90000, settleMs: 2500, logger: this.logger });
      if (!stableText) {
        this.logger.warn("Konnte keinen stabilen Antwort-Text mit Tokens finden. Fahre mit aktuellem DOM-Text fort.");
      }

      // Extract text (use the stableText if available)
      const rawInfo = await extractTextWithSource(page);
      const rawText = stableText || rawInfo.text || '';
      const preview = (rawText || '').slice(0, 300).replace(/[\n\r]+/g, ' ');
      this.logger.debug(`Antwort-Preview: ${preview}`);

      const cleaned = normalizeWhitespace(rawText || '');
      const newsObjects = NewsParser.parseFromAnswer(cleaned);

      // Ensure fields exist; if parser yields nothing try best-effort single item from DOM
      if (!newsObjects.length) {
        const lastItem = await page.evaluate(() => {
          const items = Array.from(document.querySelectorAll('li.MuiListItem-root'));
          const last = items.at(-1);
          return last ? (last.textContent || '') : '';
        });
        const fallbackClean = normalizeWhitespace(lastItem || '');
        const fallbackParsed = NewsParser.parseFromAnswer(fallbackClean);
        if (fallbackParsed.length) newsObjects.push(...fallbackParsed);
      }

      this.logger.info(`${newsObjects.length} News-Artikel via Puppeteer gescraped`);
      if (newsObjects.length) {
        const list = newsObjects
          .map((obj, i) => `${i + 1}. ${obj.title}\n   date: ${obj.date}\n   id: ${obj.interviewId || ''}`)
          .join('\n');
        this.logger.info(`\n📰 Gefundene Artikel:\n${list}\n`);
      }

      // DOM immer in Datei schreiben (mindestens Text). Optional: HTML/Screenshot per Flags
      const envTrue = (v) => /^(1|true|yes)$/i.test(String(v || ''));
      const debugDumpEnabled = opts?.debugDump || envTrue(process.env.BOTBUCKET_DEBUG_DUMP) || envTrue(process.env.DEBUG_DUMP);
      const debugScreenshotEnabled = opts?.debugScreenshot || envTrue(process.env.BOTBUCKET_DEBUG_SCREENSHOT);

      let debug = { remoteUrl, source: rawInfo.source, preview };
      try {
        const dump = await writeDebugDump(
          page,
          rawText,
          {
            usedFallback: false,
            loadedUrl: remoteUrl,
            source: rawInfo.source,
            screenshot: debugScreenshotEnabled,
            onlyText: !debugDumpEnabled
          },
          this.logger
        );
        debug = { ...debug, ...dump };
      } catch (e) {
        this.logger.warn('Konnte Debug-Dumps nicht schreiben:', e?.message);
      }

      // Rückgabe: entweder nur Items oder Items + Debug-Info
      if (debugDumpEnabled || opts?.debugInline) return { items: newsObjects, debug };
      return newsObjects;

    } catch (error) {
      this.logger.error("Puppeteer-Scraping Fehler:", error);
      // Versuche, auch im Fehlerfall einen Text-Dump zu schreiben
      try {
        const errText = await (async () => {
          try { return await (await extractTextWithSource(page)).text; } catch { return ''; }
        })();
        await writeDebugDump(
          page,
          `[ERROR] ${error?.message || String(error)}\n\n` + (errText || ''),
          { usedFallback: false, loadedUrl: (overrideUrl || this.config.BOT_URL || 'unknown'), source: 'error', screenshot: false, onlyText: true },
          this.logger
        );
      } catch (e) {
        this.logger.warn('Fehler-Dump fehlgeschlagen:', e?.message);
      }
      throw error;
    } finally {
      try { 
        await page.close(); 
      } catch (e) {
        this.logger.warn("Fehler beim Schließen der Seite:", e.message);
      }
    }
  }
}

module.exports = PuppeteerScraper;
