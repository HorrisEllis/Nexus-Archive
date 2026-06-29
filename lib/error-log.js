'use strict';
/**
 * lib/error-log.js — Universal Error Log
 * UUID: nexus-error-log-v1-0000-4000-0000-000000000001
 *
 * Sibling to lib/event-ledger.js (and lib/cfr/ledger.js, which wraps it).
 * That ledger answers "what happened, in what order." This answers
 * "what broke, where, and what was happening right before it."
 *
 * §LAW II analogue for failure: an error that isn't written down didn't
 * happen as far as the rest of the system is concerned — it just becomes
 * a console line that scrolls off and a vague "the UI isn't working."
 *
 * Every system gets its own error_log.jsonl under its data dir. Every row:
 *   - ts            ms epoch
 *   - system        which kernel logged it (copilot, clear-glass, bridge…)
 *   - file / line   parsed from the *first* stack frame inside this repo
 *   - message       err.message
 *   - stack         full stack (kept, but message/file/line are what you scan)
 *   - causedBy      optional event-ledger row uuid — "what was happening
 *                   right before this broke" — pass the last record() you
 *                   got back from createEventLedger/createCFRLedger.
 *   - severity      'fatal' | 'error' | 'warn'
 *   - context       free-form extra info (request body, action name, etc.)
 *
 * Usage:
 *   const { createErrorLog } = require('../lib/error-log');
 *   const errlog = createErrorLog({ logDir, systemId: 'clear-glass' });
 *   errlog.open();
 *
 *   try { ... }
 *   catch (err) { errlog.record(err, { causedBy: lastEvent?.uuid, context: {...} }); }
 *
 *   // global safety net — put this near the top of every entrypoint:
 *   errlog.attachGlobalHandlers();
 */

const fs   = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const REPO_ROOT = path.join(__dirname, '..');

function createErrorLog({ logDir, systemId, onError = null } = {}) {
  if (!logDir)   throw new Error('ErrorLog: logDir required');
  if (!systemId) throw new Error('ErrorLog: systemId required');

  const LOG_FILE = path.join(logDir, 'error_log.jsonl');
  let _opened = false;
  let _count  = 0;

  // Synchronous, append-only. An error log that isn't guaranteed to hit
  // disk before the process that's crashing finishes dying is worthless —
  // this is the one place in the system where "slightly slower but
  // unconditionally durable" beats a buffered stream.
  function open() {
    fs.mkdirSync(logDir, { recursive: true });
    if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, '');
    _opened = true;
    return { file: LOG_FILE };
  }

  function close() {
    _opened = false;
  }

  // ── Pull the first in-repo frame out of a stack trace ───────────────────
  // node_modules frames and native frames are noise — the first frame that
  // points at *our* code is almost always where the bug actually is.
  function _locate(stack) {
    if (!stack) return { file: null, line: null };
    const lines = stack.split('\n').slice(1);
    for (const raw of lines) {
      const m = raw.match(/\(?([^()\s]+):(\d+):(\d+)\)?$/);
      if (!m) continue;
      const abs = m[1];
      if (abs.includes('node_modules') || abs.includes('node:internal')) continue;
      const rel = abs.startsWith(REPO_ROOT) ? path.relative(REPO_ROOT, abs) : abs;
      return { file: rel, line: parseInt(m[2], 10) };
    }
    return { file: null, line: null };
  }

  /**
   * Record an error. `err` can be an Error, or a plain string (wrapped).
   * opts: { causedBy, context, severity }
   */
  function record(err, opts = {}) {
    const e = (err instanceof Error) ? err : new Error(String(err));
    const { file, line } = _locate(e.stack);
    const ts = Date.now();

    if (!_opened) { try { open(); } catch (_) { /* fall through, still return row */ } }

    const row = {
      uuid:     randomUUID(),
      ts,
      system:   systemId,
      severity: opts.severity || 'error',
      message:  e.message,
      file,
      line,
      stack:    e.stack || null,
      causedBy: opts.causedBy || null,
      context:  opts.context || null,
    };

    try { fs.appendFileSync(LOG_FILE, JSON.stringify(row) + '\n'); } catch (_) { /* disk gone — still surface to stdout below */ }
    _count++;

    // Always also surface to stdout with the file:line so it's scannable
    // live without tailing the file — same info, two places.
    const where = file ? `${file}:${line}` : 'unknown location';
    console.error(`[${systemId}] §error ${where} — ${e.message}`);

    onError?.(row);
    return row;
  }

  /**
   * Wrap an async function — any rejection is logged with this call's
   * context before being re-thrown, so call sites don't have to remember
   * a try/catch every single time.
   */
  function wrap(fn, contextLabel) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (err) {
        record(err, { context: { label: contextLabel, args: _safeArgs(args) } });
        throw err;
      }
    };
  }

  function _safeArgs(args) {
    try { return JSON.parse(JSON.stringify(args)); } catch (_) { return '[unserializable]'; }
  }

  /**
   * Catch the failures that would otherwise vanish: anything that escapes
   * every try/catch in the process. This is the difference between
   * "premature close, no idea why" and an error_log row with a file:line.
   */
  function attachGlobalHandlers() {
    process.on('uncaughtException', (err) => {
      record(err, { severity: 'fatal', context: { kind: 'uncaughtException' } });
    });
    process.on('unhandledRejection', (reason) => {
      record(reason, { severity: 'fatal', context: { kind: 'unhandledRejection' } });
    });
  }

  function tail(n = 20) {
    if (!fs.existsSync(LOG_FILE)) return [];
    const lines = fs.readFileSync(LOG_FILE, 'utf8').split('\n').filter(Boolean).slice(-n);
    return lines.map(l => { try { return JSON.parse(l); } catch (_) { return null; } }).filter(Boolean);
  }

  function count() { return _count; }

  return { open, close, record, wrap, attachGlobalHandlers, tail, count, LOG_FILE };
}

module.exports = { createErrorLog };
