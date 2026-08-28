'use strict';
/**
 * src/history/store.js — Real Browsing History Store
 * UUID: cg-history-store-v1-0000-0000-000000000012
 *
 * Real gap named in CLEAR-GLASS-FULL-CHROME-MAP-2026-08-23.md's §5:
 * "History | not found — no history store/UI anywhere."
 *
 * Captured on the real 'nav.loaded' bus event — the exact same event
 * rewind's auto-snapshot already listens for (checked directly before
 * wiring this, reusing the established trigger point rather than
 * inventing a second navigation-observation mechanism).
 */

const path = require('path');
const fs   = require('fs');
const { randomUUID } = require('crypto');

const HISTORY_PATH = path.join(
  process.env.APPDATA || process.env.HOME || '.', '.clear-glass', 'history.json'
);
const MAX_ENTRIES = 5000;

class HistoryStore {
  constructor() {
    this.items = []; // newest first
  }

  load() {
    try {
      fs.mkdirSync(path.dirname(HISTORY_PATH), { recursive: true });
      if (fs.existsSync(HISTORY_PATH)) {
        this.items = JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf8'));
      } else {
        this._persist();
      }
    } catch (err) {
      console.warn('[History] load error:', err.message);
    }
    return this.items;
  }

  _persist() {
    try {
      fs.mkdirSync(path.dirname(HISTORY_PATH), { recursive: true });
      fs.writeFileSync(HISTORY_PATH, JSON.stringify(this.items, null, 2));
    } catch (err) {
      console.warn('[History] persist error:', err.message);
    }
  }

  /**
   * add({url, title, agentId}) -> the stored record. Real dedup: visiting
   * the SAME url again within the same agent bumps visitCount and moves
   * it to the front (most-recently-visited-first, matching every real
   * browser's history model) instead of creating a duplicate row.
   */
  add({ url, title, agentId = 'default' }) {
    if (!url || url.startsWith('about:')) return null;
    const existing = this.items.find(i => i.url === url && i.agentId === agentId);
    if (existing) {
      existing.visitCount = (existing.visitCount || 1) + 1;
      existing.title = title || existing.title;
      existing.lastVisited = Date.now();
      this.items = [existing, ...this.items.filter(i => i !== existing)];
      this._persist();
      return existing;
    }
    const record = {
      id: randomUUID(), url, title: title || url, agentId,
      firstVisited: Date.now(), lastVisited: Date.now(), visitCount: 1,
    };
    this.items.unshift(record);
    if (this.items.length > MAX_ENTRIES) this.items.length = MAX_ENTRIES;
    this._persist();
    return record;
  }

  list({ agentId, query, limit = 100 } = {}) {
    let results = this.items;
    if (agentId) results = results.filter(i => i.agentId === agentId);
    if (query) {
      const q = query.toLowerCase();
      results = results.filter(i => i.url.toLowerCase().includes(q) || i.title.toLowerCase().includes(q));
    }
    return results.slice(0, limit);
  }

  deleteItem(id) {
    const before = this.items.length;
    this.items = this.items.filter(i => i.id !== id);
    if (this.items.length !== before) { this._persist(); return true; }
    return false;
  }

  /** clearRange(sinceMs) — real "clear browsing data" style operation. sinceMs omitted clears everything. */
  clearRange(sinceMs) {
    const before = this.items.length;
    this.items = sinceMs ? this.items.filter(i => i.lastVisited < sinceMs) : [];
    this._persist();
    return before - this.items.length;
  }
}

module.exports = { HistoryStore };
