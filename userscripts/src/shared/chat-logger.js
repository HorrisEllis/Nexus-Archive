'use strict';
/**
 * userscripts/src/shared/chat-logger.js — the message-logging half of
 * NEXUS wiring, extracted from guardian/userscript-claude.js's
 * _nexusLogMessage (real function, real behavior, not reimplemented).
 * UUID: nexus-userscripts-shared-chat-logger-v1-0000-2026-0815-jamesbrooks-001
 *
 * §CORRECTED 2026-08-15 — James, direct: "it's clear glass for a fact...
 * a browser made specifically for AI." Checked before this correction:
 * clear-glass/src/providers/host.js's _inject() reads the userscript,
 * wraps it, and injects via win.webContents.executeJavaScript(code) —
 * no Tampermonkey extension involved anywhere, confirmed live in the
 * code, not assumed. gm-shim.js's GM_xmlhttpRequest was ALREADY just
 * fetch() underneath. Since ClearGlass is the only real consumer, the
 * GM_* pretense is dropped entirely here — native fetch(), no shim layer
 * to inject first, no compatibility convention nothing actually needs.
 */

/**
 * logMessage(msg, ctx) — msg: {role, text}. ctx: everything the caller's
 * own scope needs to supply, explicitly (same reasoning as before —
 * claude's original reached into five outer-scope names that don't exist
 * the same way across four different provider scripts):
 *   cortexUrl   — real Cortex base URL (e.g. CORTEX_URL in each userscript)
 *   sessionId   — this tab's real session id
 *   provider    — 'claude' | 'chatgpt' | 'gemini' | 'perplexity'
 *   onSignals   — optional callback(signals) — caller-side state (claude/
 *                 chatgpt push to their own _nexus.signals and re-render)
 *   onGapRegime — optional callback(role, regime, gapCount) — DOM
 *                 annotation is caller-side, not this module's job
 */
async function logMessage(msg, ctx) {
  if (!ctx || !ctx.cortexUrl) {
    throw new Error('chat-logger.logMessage: ctx.cortexUrl is required');
  }
  try {
    const res = await fetch(ctx.cortexUrl + '/api/meta/observe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: msg.role,
        text: msg.text,
        sessionId: ctx.sessionId,
        source: ctx.provider,
      }),
    });
    const d = await res.json();
    if (d && d.result && d.result.signals) {
      if (ctx.onSignals) ctx.onSignals({ ...d.result.signals, role: msg.role, ts: Date.now() });
      if (d.result.pendulum && d.result.pendulum.regime && d.result.pendulum.regime !== 'STABLE') {
        if (ctx.onGapRegime) ctx.onGapRegime(msg.role, d.result.pendulum.regime, (d.result.gaps || []).length);
      }
    }
  } catch (_) { /* network failure or malformed response — logging must not break the chat, §1.2 */ }
}

module.exports = { logMessage, MODULE_ID: 'userscripts-chat-logger', VERSION: '0.2.0' };
