---
chunk_uuid: 2841bbd8-80ce-40bd-8c74-cb6328bdd08e
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-repo-repos-nexus-id-repo-0672ffb3-146-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-14-brainos-main-bus-js-d6afabda-md-md
title: n139/idearium/repo/repos/nexus-id-repo-0672ffb3/146-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-14-brainos-main-bus-js-d6afabda-md.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-146-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-14-brainos-main-bus-js-d6afabda-md-md
contract_id: spec-contract:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-146-nexus-idearium-data-specs-a434ae13-9e53-4e45-be1b-7d31929df2d4-14-brainos-main-bus-js-d6afabda-md-md:2841bbd8
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:21:46.400Z
---

---
chunk_uuid: d6afabda-6cf9-4cd6-800d-296bb0035ca3
spec_uuid: a434ae13-9e53-4e45-be1b-7d31929df2d4
section: brainos-main-bus-js
title: BrainOS-main/bus.js
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:a434ae13:brainos-main-bus-js
contract_id: spec-contract:a434ae13:brainos-main-bus-js:d6afabda
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-03T10:26:54.575Z
---

/**
 * bus.js — BrainOS Event Bus
 * UUID: brainos-bus-module-v5000-0000-000000000001
 * Hook: brainos.bus:bus-v5:b0001
 *
 * SISO-native typed event bus. All BrainOS modules communicate
 * exclusively through this bus. No direct function calls between modules.
 *
 * Architecture: Event → Gate → Stream (SISO pattern)
 * - Typed events with UUID IDs
 * - Wildcard subscriptions (*) supported
 * - Replay buffer (last N events per type)
 * - Signature collision is a hard error
 * - Everything fails loudly — no silent swallowing
 */

'use strict';

const MODULE_UUID = 'brainos-bus-module-v5000-0000-000000000001';
const MODULE_VERSION = '5.0.0';

// ── Tiny uid (no deps) ────────────────────────────────────────────────────────
function uid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

// ── Log levels (mirrors SISO StreamLog) ──────────────────────────────────────
const LOG_LEVELS = { OFF: 0, EVENTS: 1, DEEP: 2, DATA: 3 };

class BusLog {
  constructor(level = 'EVENTS') {
    this.level = level;
    this.entries = [];
    this.seq = 0;
    this.maxEntries = 10000;
  }

  record(entry) {
    const lvl = LOG_LEVELS[this.level] || 0;
    if (lvl === 0) return;
    const e = { seq: this.seq++, ts: Date.now(), type: entry.type, claimed: entry.claimed };
    if (lvl >= 2) e.eventId = entry.eventId;
    if (lvl >= 3) e.data = entry.data;
    this.entries.push(e);
    if (this.entries.length > this.maxEntries) this.entries.shift();
  }

  sample() { return { level: this.level, count: this.entries.length, entries: [...this.entries] }; }
  clear() { this.entries = []; this.seq = 0; }
}

// ── BusEvent (SISO Event equivalent) ─────────────────────────────────────────
class BusEvent {
  constructor(type, data = {}, meta = {}) {
    this.id = uid();
    this.type = type;
    this.data = data;
    this.ts = Date.now();
    this.source = meta.source || 'unknown';
  }
}

// ── EventBus ─────────────────────────────────────────────────────────────────
class EventBus {
  constructor(options = {}) {
    this.uuid = MODULE_UUID;
    this.version = MODULE_VERSION;
    this._handlers = new Map();       // type → Set<{id, fn}>
    this._wildcards = new Set();      // { id, fn }
    this._replayBuffer = new Map();   // type → BusEvent (last N)
    this._replaySize = options.replaySize || 1;
    this._log = new BusLog(options.logLevel || 'EVENTS');
    this._auditLog = [];
    this._errorHandlers = new Set();
    this._stats = { emitted: 0, claimed: 0, pending: 0, errors: 0 };
  }

  /**
   * Subscribe to a specific event type (or '*' for all).
   * Returns an unsubscribe function.
   * Fails loudly if fn is not a function.
   */
  on(type, fn, meta = {}) {
    if (typeof fn !== 'function') {
      this._fail('BUS.on', `Handler for '${type}' must be a function, got ${typeof fn}`);
      throw new Error(`BUS: Handler for '${type}' must be a function`);
    }
    const id = uid();
    const entry = { id, fn, source: meta.source || 'unknown', once: false };

    if (type === '*') {
      this._wildcards.add(entry);
    } else {
      if (!this._handlers.has(type)) this._handlers.set(type, new Set());
      this._handlers.get(type).add(entry);
    }

    // Replay last event of this type to new subscriber
    if (type !== '*' && this._replayBuffer.has(type)) {
      try { fn(this._replayBuffer.get(type)); } catch (e) { this._fail('BUS.on.replay', e.message); }
    }

    return () => this._off(type, id);
  }

  /**
   * Subscribe once — auto-unsubscribes after first event.
   */
  once(type, fn, meta = {}) {
    const id = uid();
    const entry = { id, fn, source: meta.source || 'unknown', once: true };
    if (type === '*') {
      this._wildcards.add(entry);
    } else {
      if (!this._handlers.has(type)) this._handlers.set(type, new Set());
      this._handlers.get(type).add(entry);
    }
    return () => this._off(type,