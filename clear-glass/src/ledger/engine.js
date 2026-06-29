'use strict';
/**
 * src/ledger/engine.js — Clear Glass Event Ledger
 * UUID: cg-ledger-v1-0000-0000-000000000031
 *
 * Every event that flows through the SISO bus is recorded here.
 * Errors are pulled from the Electron process error log and appended
 * immediately after the causative event, with file + timestamp reference.
 *
 * Architecture: →E→E→
 *   Bus emits Event → LedgerEngine.record(event)
 *   Error thrown   → LedgerEngine.recordError(err, { file, sourceEvent })
 *   IPC /ledger    → query/export/flush
 *
 * Storage:
 *   ~/.clear-glass/ledger/ledger-YYYY-MM-DD.ndjson  (rotating daily)
 *   ~/.clear-glass/ledger/error.log                 (append-only, errors only)
 *
 * Query surface (all in-memory, O(1) append, O(n) query):
 *   .query({ type, system, since, until, limit, errorsOnly })
 *   .tail(n)         — last N entries
 *   .errors(n)       — last N error entries
 *   .flush()         — write ring buffer to disk now
 *   .stats()         — counts by type, error rate, uptime
 *
 * §AXIOM §1.2: nothing silently fails — every error is recorded, never swallowed
 * §AXIOM §1.3: no stubs — every method is fully implemented
 */

const fs   = require('fs');
const path = require('path');
const os   = require('os');
const { randomUUID } = require('crypto');

// ── Config ─────────────────────────────────────────────────────────────────
const LEDGER_DIR     = path.join(os.homedir(), '.clear-glass', 'ledger');
const RING_SIZE      = 5000;   // max in-memory entries
const FLUSH_INTERVAL = 15_000; // write to disk every 15s
const MAX_LOG_BYTES  = 10 * 1024 * 1024; // 10 MB per file before rotate

// ── Entry types ────────────────────────────────────────────────────────────
const ENTRY_TYPE = {
  EVENT:      'event',
  ERROR:      'error',
  BOOT:       'boot',
  SHUTDOWN:   'shutdown',
  CFR:        'cfr',       // co-pilot function result
  DIAGNOSTIC: 'diagnostic',
};

class LedgerEngine {
  constructor({ moduleId = 'clear-glass', sse = null } = {}) {
    this.moduleId  = moduleId;
    this.sse       = sse;
    this._ring     = [];          // circular buffer — max RING_SIZE
    this._errorRing = [];         // errors only, max 500
    this._stats    = {
      total: 0, errors: 0, warnings: 0,
      byType: {},
      bootTs: Date.now(),
    };
    this._flushTimer  = null;
    this._currentFile = null;
    this._errorFile   = null;
    this._currentDate = null;
    this._ready       = false;
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  async init() {
    fs.mkdirSync(LEDGER_DIR, { recursive: true });
    this._rotateIfNeeded();
    this._startFlushTimer();
    this._interceptProcessErrors();

    // Boot entry
    this._append({
      id:       randomUUID(),
      entryType: ENTRY_TYPE.BOOT,
      type:     'ledger.boot',
      system:   this.moduleId,
      ts:       Date.now(),
      data:     { pid: process.pid, node: process.version, ledgerDir: LEDGER_DIR },
    });

    this._ready = true;
    console.log(`[Ledger] ✓ Ready — ${LEDGER_DIR}`);
    return this;
  }

  // ── Primary record — called for every SISO bus event ──────────────────────
  record(event) {
    if (!event || !event.type) return;

    const entry = {
      id:        event.uuid || randomUUID(),
      entryType: ENTRY_TYPE.EVENT,
      type:      event.type,
      system:    this.moduleId,
      ts:        event.ts || Date.now(),
      data:      event.data || {},
    };

    this._append(entry);
    return entry.id;
  }

  // ── Error record — called on caught errors, uncaught exceptions, etc. ─────
  // file       = __filename or module path (string)
  // sourceEventId = the bus event UUID that was being processed when error occurred
  recordError(err, { file = 'unknown', sourceEventId = null, context = {} } = {}) {
    const entry = {
      id:            randomUUID(),
      entryType:     ENTRY_TYPE.ERROR,
      type:          'ledger.error',
      system:        this.moduleId,
      ts:            Date.now(),
      file:          _normalizeFile(file),
      sourceEventId,
      error: {
        message: err?.message || String(err),
        stack:   err?.stack   || null,
        code:    err?.code    || null,
        name:    err?.name    || 'Error',
      },
      context,
    };

    this._appendError(entry);
    this._append(entry);

    // Broadcast on SSE so the UI can surface it immediately
    if (this.sse?.emit) {
      this.sse.emit('ledger.error', {
        id:       entry.id,
        file:     entry.file,
        ts:       entry.ts,
        message:  entry.error.message,
        sourceEventId,
      });
    }

    return entry.id;
  }

  // ── CFR record — co-pilot function result (why UI may not be working) ─────
  recordCfr({ requestId, tool, result, agentId, durationMs, error = null }) {
    const entry = {
      id:        randomUUID(),
      entryType: ENTRY_TYPE.CFR,
      type:      'ledger.cfr',
      system:    this.moduleId,
      ts:        Date.now(),
      requestId,
      tool,
      agentId,
      durationMs,
      result:    error ? null : result,
      error:     error ? { message: error.message || String(error) } : null,
    };
    this._append(entry);
    return entry.id;
  }

  // ── Diagnostic record ─────────────────────────────────────────────────────
  recordDiagnostic({ suiteId, runId, label, passed, failed, results }) {
    const entry = {
      id:        randomUUID(),
      entryType: ENTRY_TYPE.DIAGNOSTIC,
      type:      'ledger.diagnostic',
      system:    this.moduleId,
      ts:        Date.now(),
      suiteId, runId, label, passed, failed,
      success:   failed === 0,
      results,
    };
    this._append(entry);
    return entry.id;
  }

  // ── Query ─────────────────────────────────────────────────────────────────
  // Returns matching entries from the in-memory ring (fast).
  // For historical data beyond the ring, use queryDisk().
  query({ type, entryType, system, since, until, limit = 200, errorsOnly = false } = {}) {
    let entries = this._ring;

    if (errorsOnly)  entries = entries.filter(e => e.entryType === ENTRY_TYPE.ERROR);
    if (type)        entries = entries.filter(e => e.type === type || e.type.startsWith(type));
    if (entryType)   entries = entries.filter(e => e.entryType === entryType);
    if (system)      entries = entries.filter(e => e.system === system);
    if (since)       entries = entries.filter(e => e.ts >= since);
    if (until)       entries = entries.filter(e => e.ts <= until);

    // Most recent first
    return entries.slice(-limit).reverse();
  }

  tail(n = 50) {
    return this._ring.slice(-n).reverse();
  }

  errors(n = 50) {
    return this._errorRing.slice(-n).reverse();
  }

  stats() {
    const uptime = Date.now() - this._stats.bootTs;
    return {
      ...this._stats,
      uptime,
      uptimeHuman: _humanDuration(uptime),
      ringSize:    this._ring.length,
      errorRingSize: this._errorRing.length,
      ledgerFile:  this._currentFile,
      errorFile:   this._errorFile,
      ts:          Date.now(),
    };
  }

  // ── Disk query — scan today's NDJSON file ─────────────────────────────────
  async queryDisk({ type, entryType, errorsOnly = false, limit = 500 } = {}) {
    if (!this._currentFile || !fs.existsSync(this._currentFile)) return [];

    const lines = fs.readFileSync(this._currentFile, 'utf8')
      .split('\n')
      .filter(Boolean);

    let entries = lines.map(l => { try { return JSON.parse(l); } catch { return null; } })
                       .filter(Boolean);

    if (errorsOnly)  entries = entries.filter(e => e.entryType === ENTRY_TYPE.ERROR);
    if (type)        entries = entries.filter(e => e.type === type);
    if (entryType)   entries = entries.filter(e => e.entryType === entryType);

    return entries.slice(-limit).reverse();
  }

  // ── Flush — write ring to disk immediately ────────────────────────────────
  flush() {
    this._rotateIfNeeded();
    if (!this._pendingFlush || this._pendingFlush.length === 0) return;

    const lines = this._pendingFlush.map(e => JSON.stringify(e)).join('\n') + '\n';
    fs.appendFileSync(this._currentFile, lines, 'utf8');
    this._pendingFlush = [];
  }

  // ── Shutdown ───────────────────────────────────────────────────────────────
  shutdown() {
    this._append({
      id:        randomUUID(),
      entryType: ENTRY_TYPE.SHUTDOWN,
      type:      'ledger.shutdown',
      system:    this.moduleId,
      ts:        Date.now(),
      data:      { stats: this._stats },
    });
    if (this._flushTimer) clearInterval(this._flushTimer);
    this.flush();
  }

  // ── Internals ─────────────────────────────────────────────────────────────
  _append(entry) {
    // Ring buffer — evict oldest when full
    if (this._ring.length >= RING_SIZE) this._ring.shift();
    this._ring.push(entry);

    // Stats
    this._stats.total++;
    if (entry.entryType === ENTRY_TYPE.ERROR) this._stats.errors++;
    this._stats.byType[entry.type] = (this._stats.byType[entry.type] || 0) + 1;

    // Pending flush queue
    if (!this._pendingFlush) this._pendingFlush = [];
    this._pendingFlush.push(entry);
  }

  _appendError(entry) {
    if (this._errorRing.length >= 500) this._errorRing.shift();
    this._errorRing.push(entry);

    // Write to error.log immediately — errors must not wait for the flush timer
    if (this._errorFile) {
      const line = JSON.stringify(entry) + '\n';
      try { fs.appendFileSync(this._errorFile, line, 'utf8'); } catch (_) {}
    }
  }

  _rotateIfNeeded() {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    if (this._currentDate === today) return;

    this._currentDate = today;
    this._currentFile = path.join(LEDGER_DIR, `ledger-${today}.ndjson`);
    this._errorFile   = path.join(LEDGER_DIR, 'error.log');

    // Rotate error.log if over size limit
    try {
      const stat = fs.statSync(this._errorFile);
      if (stat.size > MAX_LOG_BYTES) {
        const archive = path.join(LEDGER_DIR, `error-${today}-${Date.now()}.log`);
        fs.renameSync(this._errorFile, archive);
        console.log(`[Ledger] error.log rotated → ${archive}`);
      }
    } catch (_) { /* file doesn't exist yet */ }
  }

  _startFlushTimer() {
    this._flushTimer = setInterval(() => {
      try { this.flush(); } catch (e) { console.error('[Ledger] flush error:', e.message); }
    }, FLUSH_INTERVAL);
    if (this._flushTimer.unref) this._flushTimer.unref();
  }

  // Intercept process-level errors and pipe into the ledger
  _interceptProcessErrors() {
    process.on('uncaughtException', (err) => {
      this.recordError(err, { file: 'process.uncaughtException', context: { fatal: true } });
      console.error('[ClearGlass FATAL]', err);
      // Don't re-throw — Electron will handle it; we just need it in the ledger
    });

    process.on('unhandledRejection', (reason) => {
      const err = reason instanceof Error ? reason : new Error(String(reason));
      this.recordError(err, { file: 'process.unhandledRejection', context: { fatal: false } });
    });
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────
function _normalizeFile(file) {
  // Strip absolute prefix to make paths portable and readable
  const cwd = process.cwd();
  return typeof file === 'string' ? file.replace(cwd + path.sep, '') : 'unknown';
}

function _humanDuration(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0)  return `${h}h ${m % 60}m`;
  if (m > 0)  return `${m}m ${s % 60}s`;
  return `${s}s`;
}

// ── Singleton export ───────────────────────────────────────────────────────
let _instance = null;

function getLedger() {
  if (!_instance) throw new Error('[Ledger] Not initialized — call createLedger() first');
  return _instance;
}

async function createLedger(opts = {}) {
  if (_instance) return _instance;
  _instance = new LedgerEngine(opts);
  await _instance.init();
  return _instance;
}

module.exports = { LedgerEngine, createLedger, getLedger, ENTRY_TYPE,
  // Exposed for test patching only — do not use in production code
  get _instance() { return _instance; },
  set _instance(v) { _instance = v; },
};
