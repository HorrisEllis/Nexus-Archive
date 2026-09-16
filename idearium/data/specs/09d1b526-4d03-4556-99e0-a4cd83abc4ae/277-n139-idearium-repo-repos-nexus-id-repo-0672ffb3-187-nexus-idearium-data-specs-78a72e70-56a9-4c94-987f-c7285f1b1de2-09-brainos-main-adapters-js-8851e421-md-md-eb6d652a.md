---
chunk_uuid: eb6d652a-4680-441e-a4f1-ec6b2d46f57d
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-repo-repos-nexus-id-repo-0672ffb3-187-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-09-brainos-main-adapters-js-8851e421-md-md
title: n139/idearium/repo/repos/nexus-id-repo-0672ffb3/187-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-09-brainos-main-adapters-js-8851e421-md.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-187-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-09-brainos-main-adapters-js-8851e421-md-md
contract_id: spec-contract:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-187-nexus-idearium-data-specs-78a72e70-56a9-4c94-987f-c7285f1b1de2-09-brainos-main-adapters-js-8851e421-md-md:eb6d652a
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:21:33.929Z
---

---
chunk_uuid: 8851e421-ef53-4c4a-b49f-581e1feb4e5c
spec_uuid: 78a72e70-56a9-4c94-987f-c7285f1b1de2
section: brainos-main-adapters-js
title: BrainOS-main/adapters.js
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:78a72e70:brainos-main-adapters-js
contract_id: spec-contract:78a72e70:brainos-main-adapters-js:8851e421
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-03T10:27:34.724Z
---

/**
 * NEXUS Playwright Adapters v2
 * Sends messages to AI providers via persistent Chromium sessions.
 *
 * Fixes applied:
 *   [6]  getContext wraps require('playwright') in try/catch — graceful error
 *   [7]  contextPool has max-size and evicts stale contexts on account removal
 *   [8]  humanType uses evaluate() to clear contenteditable — page.fill() doesn't work on divs
 *   [9]  waitForFunction uses pollingInterval: 500ms — reduces CPU hammering
 *   [10] Multi-turn messages use conversation injection via new chat pages
 */

'use strict';

const { profilePath, markActive, getProviderConfig } = require('./account-manager');

// ─── Chromium Pool (Fix #6, #7) ───────────────────────────────────────────────

const MAX_POOL_SIZE = 20;
const contextPool   = new Map(); // key: "provider/accountId" → { ctx, createdAt, lastUsed }

function getChromium() {
  let chromium;
  try {
    ({ chromium } = require('playwright'));
  } catch {
    throw new Error(
      'Playwright not installed.\n' +
      'Run: npm install playwright && npx playwright install chromium\n' +
      'Then restart the bridge server.'
    );
  }
  return chromium;
}

async function getContext(provider, accountId) {
  const key   = `${provider}/${accountId}`;
  const pPath = profilePath(provider, accountId);
  const entry = contextPool.get(key);

  if (entry) {
    entry.lastUsed = Date.now();
    return entry.ctx;
  }

  // Evict LRU if at capacity (Fix #7)
  if (contextPool.size >= MAX_POOL_SIZE) {
    let oldest = null, oldestKey = null;
    for (const [k, v] of contextPool) {
      if (!oldest || v.lastUsed < oldest.lastUsed) { oldest = v; oldestKey = k; }
    }
    if (oldestKey) {
      try { await oldest.ctx.close(); } catch { /* ignore */ }
      contextPool.delete(oldestKey);
      console.log(`[Adapters] Evicted context: ${oldestKey}`);
    }
  }

  const chromium = getChromium();
  const ctx = await chromium.launchPersistentContext(pPath, {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-infobars',
      '--disable-dev-shm-usage',  // prevents crashes in low-memory environments
      '--disable-gpu',
    ],
    ignoreDefaultArgs: ['--enable-automation'],
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  });

  // Inject stealth on every new page
  ctx.on('page', async page => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      window.chrome = { runtime: {} };
    }).catch(() => {});
  });

  contextPool.set(key, { ctx, createdAt: Date.now(), lastUsed: Date.now() });
  return ctx;
}

async function closeContext(provider, accountId) {
  const key   = `${provider}/${accountId}`;
  const entry = contextPool.get(key);
  if (entry) {
    try { await entry.ctx.close(); } catch { /* ignore */ }
    contextPool.delete(key);
  }
}

async function closeAllContexts() {
  for (const [key, entry] of contextPool) {
    try { await entry.ctx.close(); } catch { /* ignore */ }
    contextPool.delete(key);
  }
}

// ─── Human Typing (Fix #8) ───────────────────────────────────────────────────
// page.fill() does NOT work on contenteditable divs (Claude, Gemini).
// Must use evaluate() to clear + keyboard.type() to fill.

async function humanType(page, selector, text, opts = {}) {
  const { minDelay = 15, maxDelay = 45 } = opts;

  await page.waitForSelector(selector, { timeout: 10_000 });
  await page.click(selector);
  await page.waitForTimeout(100 + Math.random() * 100);

  // Clear existing content — works for both input/textarea AND contenteditable
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.value = '';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      // contenteditable
      el