"use strict";

async function findInputHandle(ctx) {
  const preferred = '.MuiInputBase-input.MuiInput-input.MuiInputBase-inputMultiline.MuiAutocomplete-input.MuiAutocomplete-inputFocused';
  const selectors = [
    preferred,
    'textarea',
    'input[type="text"]',
    'input:not([type])',
    'div[role="textbox"]',
    '[contenteditable="true"]'
  ];
  for (const sel of selectors) {
    try {
      const handle = await ctx.$(sel);
      if (handle) return { handle, selector: sel };
    } catch {}
  }
  return { handle: null, selector: null };
}

async function typeIntoHandle(ctx, handle, text) {
  try {
    await handle.focus();
  } catch {}

  const isContentEditable = await ctx.evaluate((el) => !!el.getAttribute('contenteditable'), handle).catch(() => false);
  if (isContentEditable) {
    await ctx.evaluate((el, value) => {
      el.focus();
      // Set text content and dispatch input
      el.textContent = value;
      el.dispatchEvent(new InputEvent('input', { bubbles: true }));
    }, handle, text);
  } else {
    // Try to type, fallback to set value + input event for React/MUI
    try {
      await handle.type(text, { delay: 10 });
    } catch {
      await ctx.evaluate((el, value) => {
        const setVal = Object.getOwnPropertyDescriptor(el.__proto__, 'value');
        if (setVal && setVal.set) setVal.set.call(el, value);
        else el.value = value;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }, handle, text);
    }
  }
}

async function clickSendIfPresent(ctx) {
  const buttonSelectors = [
    'button[type="submit"]',
    'button[aria-label*="send" i]',
    'button[aria-label*="senden" i]',
    'button.MuiButtonBase-root'
  ];
  for (const sel of buttonSelectors) {
    const btn = await ctx.$(sel);
    if (btn) {
      try { await btn.click(); return { clicked: true, selector: sel }; } catch {}
    }
  }
  return { clicked: false, selector: null };
}

async function sendQuestionInContext(ctx, text, logger = console) {
  const { handle, selector } = await findInputHandle(ctx);
  if (!handle) return { ok: false, via: 'not-found', selector: null, clicked: false };
  await typeIntoHandle(ctx, handle, text);
  // Try Enter submit
  try { await ctx.keyboard.press('Enter'); } catch {}
  const { clicked, selector: btnSel } = await clickSendIfPresent(ctx);
  return { ok: true, via: 'input', selector, clicked, button: btnSel };
}

async function sendQuestion(page, text, logger = console) {
  // 1) Try main page
  let res = await sendQuestionInContext(page, text, logger);
  if (res.ok) return { ...res, frame: null };

  // 2) Try frames (e.g., embedded chat UIs)
  for (const frame of page.frames()) {
    try {
      res = await sendQuestionInContext(frame, text, logger);
      if (res.ok) return { ...res, frame: frame.url() };
    } catch {}
  }

  // 3) Fallback: postMessage
  try {
    await page.evaluate((msg) => {
      window.postMessage({ type: 'questionToAsk', message: msg }, '*');
      window.dispatchEvent(new MessageEvent('message', { data: { type: 'questionToAsk', message: msg }, origin: window.location.origin }));
    }, text);
    return { ok: true, via: 'postMessage', selector: null, clicked: false };
  } catch (e) {
    logger.warn('sendQuestion fallback postMessage failed:', e?.message);
  }

  return { ok: false, via: 'failed', selector: null, clicked: false };
}

module.exports = {
  sendQuestion
};
