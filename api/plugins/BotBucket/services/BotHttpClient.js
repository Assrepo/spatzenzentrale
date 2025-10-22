"use strict";

const https = require("https");
const zlib = require("zlib");

class BotHttpClient {
  constructor(config, logger) {
    this.config = config || {};
    this.logger = logger || console;

    this.defaultOptions = {
      hostname: this.config.BOTBUCKET_HOSTNAME || "chatbots.stadtulm.de",
      port: 443,
      method: "POST",
      headers: {
        "Accept": "text/event-stream",
        "Accept-Encoding": "gzip, deflate, br",
        "Content-Type": "application/json",
        "User-Agent": "Spatzenzentrale-Bot/2.0"
      }
    };
  }

  /**
   * Fetch news from bot via HTTPS SSE
   * @param {string} chatbotId - Bot ID
   * @param {string} question - Question to ask
   * @param {string} defaultQuestion - Fallback question
   * @param {number} timeout - Request timeout in ms
   */
  fetchNewsFromBot(chatbotId, question, defaultQuestion, timeout = null) {
    return new Promise((resolve, reject) => {
      if (!chatbotId) return reject(new Error("ChatBot-ID erforderlich"));

      const data = {
        answerLanguage: "Deutsch",
        chat_type: "RAG",
        extra_param: "",
        history: "[]",
        password: "",
        personality_prompt: "",
        question: question || defaultQuestion,
        userConfirmedPersonalDataProcessing: true,
        username: ""
      };
      const dataString = JSON.stringify(data);
      const options = { ...this.defaultOptions, path: `/api/chatbot/${chatbotId}/chat` };

      this.logger.info(`Sending request to bot ${chatbotId}: "${(question || defaultQuestion).substring(0, 50)}..."`);

      const request = https.request(options, (response) => {
        const encoding = (response.headers["content-encoding"] || "").toLowerCase();
        let stream = response;

        if (response.statusCode < 200 || response.statusCode >= 300) {
          this.logger.error(`Bot-Response Status: ${response.statusCode}`);
          response.resume();
          return reject(new Error(`HTTP ${response.statusCode}`));
        }

        try {
          if (encoding.includes("br")) stream = response.pipe(zlib.createBrotliDecompress());
          else if (encoding.includes("gzip")) stream = response.pipe(zlib.createGunzip());
          else if (encoding.includes("deflate")) stream = response.pipe(zlib.createInflate());
        } catch (e) {
          this.logger.warn("Konnte Content-Encoding nicht dekomprimieren:", e.message);
          stream = response;
        }

        let buffer = "";
        const events = [];
        stream.setEncoding("utf8");

        stream.on("data", (chunk) => {
          buffer += chunk.replace(/\r/g, ""); // normalisieren
          let idx;
          while ((idx = buffer.indexOf("\n\n")) !== -1) {
            const rawEvent = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 2);
            const lines = rawEvent.split("\n");
            const dataLines = [];
            for (const line of lines) if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
            if (!dataLines.length) continue;
            const payload = dataLines.join("\n");
            try { events.push(JSON.parse(payload)); }
            catch { this.logger.debug("Teil-Event noch unvollständig oder kein JSON"); }
          }
        });

        stream.on("end", () => {
          if (!events.length) return reject(new Error("Keine gültige Antwort vom Bot erhalten"));
          const final = events[events.length - 1];
          this.logger.info(`Bot-Antwort erhalten: ${events.length} SSE-Events`);
          resolve(final);
        });

        stream.on("error", (error) => { this.logger.error("HTTP Stream Fehler:", error); reject(error); });
      });

      request.on("error", (error) => { this.logger.error("HTTP Request Fehler:", error); reject(error); });

      request.setHeader("Content-Length", Buffer.byteLength(dataString, "utf8"));
      const requestTimeout = timeout || parseInt(this.config.BOTBUCKET_TIMEOUT || 120000);
      request.setTimeout(requestTimeout, () => {
        request.destroy(new Error(`Bot-Anfrage Timeout nach ${requestTimeout}ms`));
      });

      request.write(dataString, "utf8");
      request.end();
    });
  }
}

module.exports = BotHttpClient;
