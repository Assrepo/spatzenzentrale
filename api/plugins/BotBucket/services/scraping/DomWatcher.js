"use strict";

async function waitForStableAnswer(page, { timeoutMs = 60000, settleMs = 2000, logger = console } = {}) {
  const start = Date.now();
  let lastLen = 0;
  let stableSince = 0;
  while (Date.now() - start < timeoutMs) {
    const info = await extractTextWithSource(page);
    logger.debug(`[puppeteer] DOM len=${info.len}, hasToken=${info.hasToken}, source=${info.source}`);
    if (info.hasToken) {
      if (info.len === lastLen) {
        if (stableSince === 0) stableSince = Date.now();
        if (Date.now() - stableSince >= settleMs) return info.text; // stable
      } else {
        stableSince = 0;
      }
    }
    lastLen = info.len;
    await new Promise((r) => setTimeout(r, 800));
  }
  return '';
}

async function extractTextWithSource(page) {
  return page.evaluate(() => {
    const sels = [
      'li.MuiListItem-root .MuiListItemText-root',
      '.bb-chat-container',
      '.bb-common-text',
      '#root'
    ];
    for (const sel of sels) {
      const nodes = Array.from(document.querySelectorAll(sel));
      if (nodes.length) {
        const t = nodes.map(n => n.textContent || '').join('\n\n');
        return { text: t, len: (t || '').length, hasToken: /newsFlashTitle\s*=/.test(t || ''), source: sel };
      }
    }
    const bodyText = document.body?.innerText || '';
    return { text: bodyText, len: (bodyText || '').length, hasToken: /newsFlashTitle\s*=/.test(bodyText || ''), source: 'body' };
  });
}

module.exports = {
  waitForStableAnswer,
  extractTextWithSource
};

