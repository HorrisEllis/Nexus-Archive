'use strict';
// ── lib/local-vector-index.js — Dependency-Free Vector Index ────────────────
// Phase 23.14 — replaces the missing 'vectra' npm dependency.
//
// James asked about topo-kernel as a replacement first. Checked it
// (lib/meta/topo-kernel/index.js, docs/topo-kernel.spec): it's an 8-gate
// signal-trust/SNR pipeline over scalar time-series values per source
// (Entropy → Variance → Consistency → Fidelity → Causality → Pattern →
// IME → Bayesian) — genuinely useful for a different problem, but it has
// no concept of embeddings, vectors, or k-nearest-neighbor search. It
// can't do what vectra's LocalIndex does; this is a different shape of
// "signal", not a smaller version of the same one.
//
// What's actually needed is much narrower than a general vector database:
// lib/vector-memory.js calls exactly 6 methods (isIndexCreated, createIndex,
// getIndexStats, getItem, insertItem, queryItems) against a few hundred to
// low thousands of 768-dim vectors on one machine. Brute-force cosine
// similarity over a flat JSON file is the honest, right-sized answer at
// that scale — not a missing dependency, not a port of topo-kernel into a
// job it wasn't built for.
//
// §1.2 — if something calls a vectra method this doesn't implement, it
// throws a named error. It does not pretend to support the full vectra API.

const fs   = require('fs');
const path = require('path');

class LocalIndex {
  constructor(dir) {
    this.dir  = dir;
    this.file = path.join(dir, 'index.json');
    this._items = null; // lazy-loaded on first access
  }

  _load() {
    if (this._items) return this._items;
    try {
      this._items = JSON.parse(fs.readFileSync(this.file, 'utf8'));
    } catch (_) {
      this._items = [];
    }
    return this._items;
  }

  _save() {
    fs.mkdirSync(this.dir, { recursive: true });
    // §2.1 — write to a temp file then rename, so a crash mid-write can't
    // leave a half-written index.json that the next boot fails to parse.
    const tmp = this.file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(this._items), 'utf8');
    fs.renameSync(tmp, this.file);
  }

  async isIndexCreated() {
    return fs.existsSync(this.file);
  }

  async createIndex(_opts = {}) {
    this._items = [];
    this._save();
    return true;
  }

  async getIndexStats() {
    return { items: this._load().length };
  }

  async getItem(id) {
    return this._load().find(i => i.id === id);
  }

  async insertItem(item) {
    const items = this._load();
    if (items.some(i => i.id === item.id)) {
      throw new Error(`item already exists: ${item.id}`);
    }
    items.push({ id: item.id, vector: item.vector, metadata: item.metadata || {} });
    this._save();
    return item;
  }

  async queryItems(queryVector, topK, filter) {
    const items = this._load();
    const filtered = filter
      ? items.filter(i => Object.entries(filter).every(([k, v]) => i.metadata?.[k] === v))
      : items;
    const scored = filtered.map(i => ({
      item:  { id: i.id, vector: i.vector, metadata: i.metadata },
      score: _cosine(queryVector, i.vector),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }
}

function _cosine(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i]*b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

module.exports = { LocalIndex, MODULE_ID: 'local-vector-index', VERSION: '1.0.0' };
