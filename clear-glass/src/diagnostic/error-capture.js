'use strict';
/**
 * src/diagnostic/error-capture.js — Clear Glass Error Capture
 * UUID: cg-error-capture-v1-0000-2026-0630-001
 *
 * §fix 2026-06-30 — built because the actual gap was found, not assumed:
 * diagnostic/engine.js is a Playwright-style TEST RUNNER (scripted
 * assertion sequences, only reports failures from tests you explicitly
 * trigger). It has zero passive error-catching. lib/error-log.js
 * (referenced in an earlier session's notes as "universal error logging")
 * doesn't exist anywhere in this tree and nothing in clear-glass ever
 * referenced it. Every error this session — the bridge handshake failures,
 * the crash loop, all of it — only ever existed as scattered console.error
 * calls, visible only if someone was staring at the right terminal at the
 * right moment. This is the actual error-capture layer that should have
 * existed from the start: catches uncaught exceptions/rejections in the
 * main process, accepts renderer-process errors via IPC, logs every one
 * with full context to a real file, and pushes them live over SSE so the
 * UI (or co-pilot) can show them as they happen instead of never.
 */

const fs   = require('fs');
const path = require('path');

class ErrorCapture {
  constructor({ sse, logDir, gapField } = {}) {
    this.sse      = sse || null;
    this.logDir   = logDir || path.join(process.env.HOME || process.env.USERPROFILE || '.', '.clear-glass', 'errors');
    this.recent   = []; // ring buffer, last 200 — UI can ask for this on connect
    this.MAX_RECENT = 200;
    this._installed = false;
    // §R8 2026-08-12 — James: "co-pilot should be able to use clear-glass
    // to understand where the user is accessing the system and what isn't
    // working." Optional, mirroring the existing `sse` pattern exactly
    // (same constructor shape, same fire-and-forget discipline) — a real
    // caught error now ALSO reaches gap-field, not just this file's local
    // log + SSE, which had zero connection to anything else in NEXUS until
    // now.
    this.gapField = gapField || null;
  }

  init() {
    try { fs.mkdirSync(this.logDir, { recursive: true }); } catch (_) {}
  }

  // ── Install global handlers — call once, from main/index.js's bootstrap ──
  installMainProcessHandlers() {
    if (this._installed) return; // idempotent — safe to call more than once
    this._installed = true;

    process.on('uncaughtException', (err) => {
      this.capture({ source: 'main-process', type: 'uncaughtException',
        message: err.message, stack: err.stack, code: err.code, name: err.name });
      // §1.2 — log it, don't crash silently, but don't re-throw either;
      // an uncaught exception handler that itself throws defeats the point.
    });

    process.on('unhandledRejection', (reason, promise) => {
      const err = reason instanceof Error ? reason : new Error(String(reason));
      this.capture({ source: 'main-process', type: 'unhandledRejection',
        message: err.message, stack: err.stack, code: err.code, name: err.name });
    });

    console.log(`[${new Date().toISOString()}] [clear-glass/src/diagnostic/error-capture.js] [ErrorCapture] main-process handlers installed`);
  }

  // ── Renderer-process errors arrive here via IPC (see ipc/bridge.js) ──────
  captureFromRenderer(payload) {
    return this.capture({ source: 'renderer', type: payload.type || 'rendererError',
      message: payload.message, stack: payload.stack, url: payload.url, agentId: payload.agentId });
  }

  // ── Explicit capture — for known failure points to call directly, like
  //    the bridge handshake failures this was built in response to. Doesn't
  //    require an uncaught exception; a caught-and-handled error is still
  //    worth surfacing, not just thrown ones. ────────────────────────────
  capture({ source, type, message, stack, code, name, url, agentId, extra }) {
    const row = {
      id: `err-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ts: Date.now(),
      isoTime: new Date().toISOString(),
      source, type, message, stack, code, name, url, agentId, extra,
    };

    this.recent.push(row);
    if (this.recent.length > this.MAX_RECENT) this.recent.shift();

    try {
      const file = path.join(this.logDir, `${new Date().toISOString().slice(0, 10)}.jsonl`);
      fs.appendFileSync(file, JSON.stringify(row) + '\n');
    } catch (_) { /* §1.2 — logging failure shouldn't crash the app; the
                      in-memory ring buffer + SSE push below still work */ }

    console.error(`[${row.isoTime}] [ErrorCapture] [${source}:${type}] ${message}`);

    if (this.sse) {
      try { this.sse.emit('error.captured', row); } catch (_) {}
    }

    if (this.gapField) {
      try {
        this.gapField.report({
          type: 'clear-glass.renderer-error', body: message || 'unlabeled error',
          source: source || 'clear-glass', domain: 'system',
          severity: type === 'uncaughtException' ? 'high' : 'medium',
          error: stack || message, location: url || null,
          meta: { code, name, agentId, extra },
        });
      } catch (_) { /* §1.2 — same discipline as the sse push above: a gap-report failure must never break error capture itself */ }
    }

    return row;
  }

  getRecent(n = 50) {
    return this.recent.slice(-n);
  }
}

module.exports = { ErrorCapture };
