'use strict';
/**
 * living-glass/src/event-ledger.js
 * UUID: living-glass-ledger-v1-0000-0000-000000000005
 *
 * Living Glass's own ledger. Separate from the per-system ledgers.
 * Records: fires opened/diagnosed/resolved, gaps ingested, system state changes.
 * NDJSON rotating daily. In-memory ring (2000 entries).
 */

const fs   = require('fs');
const path = require('path');
const os   = require('os');
const { randomUUID } = require('crypto');

const RING_SIZE = 2000;

class EventLedger {
  constructor({ dir, moduleId = 'living-glass' }) {
    this._dir      = dir;
    this._moduleId = moduleId;
    this._ring     = [];
    this._errors   = [];
    this._file     = null;
    this._date     = null;
    this._pending  = [];
    this._timer    = null;
  }

  init() {
    fs.mkdirSync(this._dir, { recursive: true });
    this._rotate();
    this._timer = setInterval(() => this._flush(), 15_000);
    if (this._timer.unref) this._timer.unref();
    this.record({ type: 'living-glass.ledger.boot', data: { pid: process.pid } });
  }

  record(ev) {
    const entry = {
      id:     ev.uuid || randomUUID(),
      type:   ev.type,
      system: this._moduleId,
      ts:     ev.ts || Date.now(),
      data:   ev.data || {},
    };
    if (this._ring.length >= RING_SIZE) this._ring.shift();
    this._ring.push(entry);
    this._pending.push(entry);
    return entry.id;
  }

  recordError(err, { file = 'unknown', context = {} } = {}) {
    const entry = {
      id:     randomUUID(),
      type:   'living-glass.error',
      system: this._moduleId,
      ts:     Date.now(),
      file:   file.replace(process.cwd() + path.sep, ''),
      error:  { message: err?.message || String(err), stack: err?.stack || null, code: err?.code || null },
      context,
    };
    if (this._errors.length >= 200) this._errors.shift();
    this._errors.push(entry);
    if (this._ring.length >= RING_SIZE) this._ring.shift();
    this._ring.push(entry);
    this._pending.push(entry);

    // Write errors immediately
    try {
      fs.appendFileSync(path.join(this._dir, 'error.log'), JSON.stringify(entry) + '\n', 'utf8');
    } catch (_) {}
    return entry.id;
  }

  tail(n = 50) {
    return this._ring.slice(-n).reverse();
  }

  errors(n = 20) {
    return this._errors.slice(-n).reverse();
  }

  shutdown() {
    if (this._timer) clearInterval(this._timer);
    this._flush();
  }

  _rotate() {
    const today = new Date().toISOString().slice(0, 10);
    if (this._date === today) return;
    this._date = today;
    this._file = path.join(this._dir, `ledger-${today}.ndjson`);
  }

  _flush() {
    this._rotate();
    if (!this._pending.length) return;
    const lines = this._pending.splice(0).map(e => JSON.stringify(e)).join('\n') + '\n';
    try { fs.appendFileSync(this._file, lines, 'utf8'); } catch (_) {}
  }
}

module.exports = { EventLedger };
