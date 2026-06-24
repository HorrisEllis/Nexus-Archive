'use strict';
// ── lib/local-vector-index.js — native LocalIndex, zero external dependencies
// UUID: nexus-local-vector-index-v1-0000-0000-0000-000000000001
// Version: 1.0.0
//
// Replaces vectra's LocalIndex. lib/vector-memory.js is the only caller in
// this codebase (checked — grepped for `require('vectra')` and `LocalIndex`
// across the whole tree, one call site) and it uses exactly five methods:
// new LocalIndex(dir), isIndexCreated(), createIndex({version}),
// insertItem({id, vector, metadata}), queryItems(vector, topK, filter).
// This implements those five and nothing else — not a general-purpose
// vector database, not a port of vectra's full surface, the actual surface
// one real caller needs.
//
// Storage: a single JSON file per index directory (index.json), holding
// {version, items: [{id, vector, metadata}]}. Brute-force cosine similarity
// on query — appropriate at the scale this is actually used for (event_log
// entries, gaps, artifacts, ideas, patterns — thousands, not millions, of
// items per NEXUS's own embed() call sites, checked in vector-memory.js's
// own header comment listing what gets embedded). An ANN index (HNSW etc.)
// would be the right answer past roughly 100k+ vectors; that's a real,
// separate, larger build if NEXUS ever needs it, not assumed needed here.
//
// §1.2  Every write is atomic — temp file + rename, never a partial file
//       on disk if the process dies mid-write.
// §2.1  Disk before behavior — insertItem() persists before returning.
// §1.1  Nothing claimed without being run — see
//       tests/modules/local-vector-index.test.js for the real numbers.

const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');

const MODULE_ID = 'local-vector-index';
const VERSION   = '1.0.0';
const INDEX_FILE = 'index.json';

function _cosineSimilarity(a, b) {
  if (a.length !== b.length) {
    throw new Error(`[${MODULE_ID}] vector length mismatch: ${a.length} vs ${b.length}`);
  }
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function _matchesFilter(metadata, filter) {
  if (!filter) return true;
  for (const key of Object.keys(filter)) {
    if (metadata?.[key] !== filter[key]) return false;
  }
  return true;
}

class LocalIndex {
  constructor(dir) {
    if (!dir) throw new Error(`[${MODULE_ID}] LocalIndex requires a directory path`);
    this.dir = dir;
    this.indexPath = path.join(dir, INDEX_FILE);
    this._cache = null; // lazy-loaded on first read
  }

  async isIndexCreated() {
    return fs.existsSync(this.indexPath);
  }

  async createIndex({ version = 1 } = {}) {
    if (!fs.existsSync(this.dir)) fs.mkdirSync(this.dir, { recursive: true });
    const data = { version, items: [] };
    this._writeAtomic(data);
    this._cache = data;
    return true;
  }

  _load() {
    if (this._cache) return this._cache;
    if (!fs.existsSync(this.indexPath)) {
      throw new Error(`[${MODULE_ID}] index not created yet at ${this.indexPath} — call createIndex() first`);
    }
    const raw = fs.readFileSync(this.indexPath, 'utf8');
    this._cache = JSON.parse(raw);
    return this._cache;
  }

  _writeAtomic(data) {
    // §1.2 — temp file + rename, never a half-written index.json on disk
    const tmpPath = `${this.indexPath}.${crypto.randomBytes(6).toString('hex')}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(data), 'utf8');
    fs.renameSync(tmpPath, this.indexPath);
  }

  async insertItem({ id, vector, metadata } = {}) {
    if (!id) throw new Error(`[${MODULE_ID}] insertItem requires id`);
    if (!Array.isArray(vector) || vector.length === 0) {
      throw new Error(`[${MODULE_ID}] insertItem requires a non-empty vector array`);
    }
    const data = this._load();
    const existingIdx = data.items.findIndex(it => it.id === id);
    const record = { id, vector, metadata: metadata || {} };
    if (existingIdx >= 0) {
      // vectra's real behavior: inserting an existing id throws (the caller
      // in vector-memory.js already catches this and treats it as
      // "item may already exist under a different ID" — same contract here,
      // not silently overwriting, which would hide a duplicate-embed bug.
      throw new Error(`[${MODULE_ID}] item with id "${id}" already exists`);
    }
    data.items.push(record);
    this._writeAtomic(data); // §2.1 — disk before returning
    return record;
  }

  // §FIX — missed on the first pass, found by grepping every _index.* call
  // site in lib/vector-memory.js rather than trusting the first three I
  // happened to read. Used at line ~189 to skip re-embedding an already-
  // indexed uuid. Returns the stored item, or undefined if not found —
  // matching vectra's real contract (vector-memory.js's call site does
  // `if (existing) return true`, so undefined/falsy is the correct miss
  // signal, not an empty object).
  async getItem(id) {
    const data = this._load();
    return data.items.find(it => it.id === id);
  }

  async queryItems(queryVector, topK = 10, filter = undefined) {
    if (!Array.isArray(queryVector) || queryVector.length === 0) {
      throw new Error(`[${MODULE_ID}] queryItems requires a non-empty query vector`);
    }
    const data = this._load();
    const scored = [];
    for (const item of data.items) {
      if (!_matchesFilter(item.metadata, filter)) continue;
      if (item.vector.length !== queryVector.length) continue; // skip mismatched dims rather than throw mid-scan
      const score = _cosineSimilarity(queryVector, item.vector);
      scored.push({ item, score });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  // §FIX — also found by the same full-grep, used at two call sites
  // (init() logging, status()). Real vectra shape is {items: N}, not the
  // {itemCount, version, path} I'd guessed before checking every call
  // site — fixed to match what's actually read (stats.items), not assumed.
  async getIndexStats() {
    const data = this._load();
    return { items: data.items.length, version: data.version };
  }
}

module.exports = { LocalIndex, MODULE_ID, VERSION };
