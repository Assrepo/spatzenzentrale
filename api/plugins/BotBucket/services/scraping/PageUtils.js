"use strict";

const fs = require('fs');
const path = require('path');

function attachRequestInterception(page) {
  return page.setRequestInterception(true).then(() => {
    page.on('request', (req) => {
      const type = req.resourceType();
      if (['image', 'media', 'font'].includes(type)) return req.abort();
      return req.continue();
    });
  });
}

async function clickConsentPopup(page, logger = console) {
  try {
    const clicked = await page.evaluate(() => {
      // Klick auf typische Consent/Start Buttons
      const btns = Array.from(document.querySelectorAll('button'));
      for (const b of btns) {
        const t = (b.textContent || '').trim().toLowerCase();
        if (t === 'start' || t.includes('akzept') || t.includes('einverstanden')) {
          b.click();
          return true;
        }
      }
      // Alternative: Container mit Datenschutz-Headline
      const container = Array.from(document.querySelectorAll('div')).find((d) =>
        (d.textContent || '').includes('Datenschutz:')
      );
      if (container) {
        const start = container.querySelector('button');
        if (start) { start.click(); return true; }
      }
      return false;
    });
    if (clicked) logger.info('✅ Datenschutz-Popup bestätigt');
    return clicked;
  } catch (e) {
    logger.debug('Kein oder nicht klickbares Datenschutz-Popup:', e?.message);
    return false;
  }
}

async function navigateWithFallback(page, remoteUrl, exampleHtmlAbsPath, logger = console) {
  let usedFallback = false;
  let loadedUrl = remoteUrl;
  try {
    await page.goto(remoteUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await clickConsentPopup(page, logger);
  } catch (navErr) {
    logger.warn(`Remote-Seite nicht erreichbar (${navErr.message}). Verwende example.html als Fallback.`);
    const fileUrl = 'file://' + exampleHtmlAbsPath;
    usedFallback = true;
    loadedUrl = fileUrl;
    await page.goto(fileUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  }
  return { usedFallback, loadedUrl };
}

async function writeDebugDump(page, rawText, { usedFallback, loadedUrl, source, screenshot, onlyText = false }, logger = console) {
  const debugDir = path.resolve(__dirname, '../../_debug');
  fs.mkdirSync(debugDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const textPath = path.join(debugDir, `dom-text-${ts}.txt`);
  fs.writeFileSync(textPath, rawText || '', 'utf8');
  let htmlPath = null;
  if (!onlyText) {
    htmlPath = path.join(debugDir, `dom-html-${ts}.html`);
    const html = await page.content();
    fs.writeFileSync(htmlPath, html, 'utf8');
  }
  let screenshotPath = null;
  if (!onlyText && screenshot) {
    screenshotPath = path.join(debugDir, `screenshot-${ts}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
  }
  logger.info(`📄 Debug-Dumps gespeichert: ${textPath}`);
  return { htmlPath, textPath, screenshotPath, usedFallback, remoteUrl: loadedUrl, source };
}

module.exports = {
  attachRequestInterception,
  clickConsentPopup,
  navigateWithFallback,
  writeDebugDump
};
