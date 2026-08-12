'use strict';
/**
 * src/core/bounded-queue.js — Bounded, optionally-coalescing event queue
 * UUID: cg-core-bounded-queue-v1-0000-000000000030
 *
 * §PERF 2026-08-12 — built to fix the unbounded-growth pattern found in
 * siso/index.js's Stream.pending array and src/dom/archaeology.js's
 * in-page `mesh` Map: high-frequency listeners (DOM mutations, cookie
 * changes) were doing synchronous work (serialize → broadcast) on every
 * single firing, with nothing capping how much could pile up between
 * drains, and nothing capping how much could accumulate if a consumer
 * fell behind.
 *
 * A BoundedQueue separates "an event happened" (push, always O(1), always
 * cheap) from "we did something with it" (drain, called on a timer).
 * Two modes:
 *   - plain (coalesceKey omitted): FIFO, capped at `max`. Once full,
 *     oldest entries are evicted — bounded loss under sustained overload,
 *     instead of unbounded growth until the process falls over. `dropped`
 *     makes that loss visible instead of silent.
 *   - coalescing (coalesceKey provided): only the latest event per key is
 *     kept. Use this where intermediate states don't matter (e.g. "this
 *     DOM node changed" — you want its current state, not every step).
 *     Do NOT use coalescing where every discrete event matters (forensic
 *     replay, audit logs) — use plain mode with a cap instead, so nothing
 *     is silently merged away, only evicted when truly overloaded.
 */

class BoundedQueue {
  constructor({ max = 500, coalesceKey = null, name = 'queue' } = {}) {
    this.max = max;
    this.name = name;
    this.coalesceKey = coalesceKey;
    this._items = coalesceKey ? new Map() : [];
    this.dropped = 0;      // evicted for being over `max` (plain mode only)
    this.coalesced = 0;    // overwritten by a newer event with the same key
  }

  push(event) {
    if (this.coalesceKey) {
      const key = this.coalesceKey(event);
      if (this._items.has(key)) this.coalesced++;
      this._items.set(key, event); // last-write-wins per key
      return;
    }
    if (this._items.length >= this.max) {
      this._items.shift();
      this.dropped++;
    }
    this._items.push(event);
  }

  drain() {
    if (this.coalesceKey) {
      const out = [...this._items.values()];
      this._items = new Map();
      return out;
    }
    const out = this._items;
    this._items = [];
    return out;
  }

  get size() {
    return this.coalesceKey ? this._items.size : this._items.length;
  }

  stats() {
    return { name: this.name, size: this.size, dropped: this.dropped, coalesced: this.coalesced };
  }
}

module.exports = { BoundedQueue };
