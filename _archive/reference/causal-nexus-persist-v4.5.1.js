/**
 * @module       persist
 * @uuid         fde4fdbd-4c51-4e92-a5d2-fca39a348762
 * @project      causal-nexus
 * @project-uuid eecaa718-c6a6-4433-b02a-11ecbefd4740
 * @version      1.0.0
 * @file         modules/persist/persist.js
 *
 * @description
 *   Persistence layer for Causal Nexus. Events survive kernel.reset()
 *   and process restart.
 *
 *   Three storage tiers:
 *
 *   HOT  — kernel ring buffer (in-memory, O(1), bounded by ringCap)
 *   WARM — WAL (write-ahead log): append-only, one entry per ingest batch
 *          Written synchronously. On restart: replay WAL → fresh kernel.
 *          Cleared when a full snapshot is flushed to disk.
 *   COLD — event archive: evicted ring events moved here instead of discarded
 *          Queryable by type, time range, contentHash.
 *          Never written to the hot ring. Read-only from the kernel's perspective.
 *
 *   In the browser context (no fs access) the store uses IndexedDB as the
 *   WAL and archive backends. In Node.js it uses the filesystem.
 *   The API is identical — the constructor detects the environment.
 *
 *   Design laws:
 *   - The kernel ring buffer is never modified by persist — read-only projection
 *   - Archive events are immutable once written
 *   - WAL is append-only — existing entries never overwritten
 *   - Recovery ingests via kernel.ingest() with replayOf set — dedup applies
 *   - No causal edges are inferred from archive data — edges are replayed as-is
 *
 * @hooks
 * @hook 0a729534-56d1-4884-b47a-a738359deca4  createStore      kind:factory
 * @hook 9b61f864-491d-49c0-8a85-b6a5d29096f4  flushStore       kind:function
 * @hook df1e5b04-d887-4a1d-ae05-b40645fe8e26  recoverStore     kind:function
 * @hook 6c3e50dc-64f3-4850-8092-09738c38adbc  archiveEvicted   kind:function
 * @hook 31be7ae8-e365-4773-b0a0-53cc1ca2819c  queryArchive     kind:function
 * @hook 17d5158f-3ac2-4cf1-9431-ce0a2645b84a  StoreConfig      kind:constant
 */

'use strict';

// ── Default configuration ─────────────────────────────────────────────────────

// @hook 17d5158f-3ac2-4cf1-9431-ce0a2645b84a  persist:StoreConfig  kind:constant
export const StoreConfig = {
  defaults: {
    walFlushEvery:      100,      // flush WAL after this many ingested events
    snapshotEvery:      10_000,   // full snapshot after this many events
    archiveMaxBytes:    50_000_000, // 50MB cold archive cap
    archiveCompact:     true,     // compress archive entries with snapshot encoding
    backend:            'auto',   // 'auto' | 'indexeddb' | 'filesystem' | 'memory'
    walKey:             'causal-nexus:wal',
    archiveKey:         'causal-nexus:archive',
    snapshotKey:        'causal-nexus:snapshot',
  },
};

// ── Backend detection ─────────────────────────────────────────────────────────

function detectBackend(preference) {
  if (preference === 'memory')     return 'memory';
  if (preference === 'indexeddb')  return typeof indexedDB !== 'undefined' ? 'indexeddb' : 'memory';
  if (preference === 'filesystem') return typeof process !== 'undefined' && process.versions?.node ? 'filesystem' : 'memory';
  // auto
  if (typeof indexedDB !== 'undefined') return 'indexeddb';
  if (typeof process !== 'undefined' && process.versions?.node) return 'filesystem';
  return 'memory';
}

// ── Memory backend (universal fallback, used in tests) ────────────────────────

function createMemoryBackend(config) {
  const wal      = [];   // [{ batchId, events: Event[] }]
  const archive  = [];   // Event[] (immutable, append-only)
  let   snapshot = null; // latest full snapshot blob

  return {
    name: 'memory',
    async appendWAL(batchId, events) {
      wal.push({ batchId, ts: Date.now(), events: events.map(e => ({ ...e })) });
    },
    async readWAL() {
      return wal.flatMap(b => b.events);
    },
    async clearWAL() {
      wal.length = 0;
    },
    async writeSnapshot(snap) {
      snapshot = JSON.parse(JSON.stringify(snap));
    },
    async readSnapshot() {
      return snapshot ? JSON.parse(JSON.stringify(snapshot)) : null;
    },
    async appendArchive(events) {
      for (const e of events) archive.push(Object.freeze({ ...e }));
    },
    async queryArchiveRaw({ type, tsStart, tsEnd, contentHash, limit = 1000 }) {
      let results = archive;
      if (type)        results = results.filter(e => e.type === type);
      if (tsStart)     results = results.filter(e => e.ts >= tsStart);
      if (tsEnd)       results = results.filter(e => e.ts <= tsEnd);
      if (contentHash) results = results.filter(e => e.contentHash === contentHash);
      return results.slice(0, limit);
    },
    async archiveSize() {
      return archive.length;
    },
    stats() {
      return { walBatches: wal.length, archiveEvents: archive.length, hasSnapshot: !!snapshot };
    },
  };
}

// ── IndexedDB backend (browser) ───────────────────────────────────────────────

function createIndexedDBBackend(config) {
  const DB_NAME    = config.walKey || 'causal-nexus';
  const DB_VERSION = 1;
  let   _db        = null;

  async function getDB() {
    if (_db) return _db;
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('wal'))      db.createObjectStore('wal', { keyPath: 'batchId' });
        if (!db.objectStoreNames.contains('archive'))  db.createObjectStore('archive', { autoIncrement: true });
        if (!db.objectStoreNames.contains('snapshot')) db.createObjectStore('snapshot', { keyPath: 'id' });
      };
      req.onsuccess = e => { _db = e.target.result; resolve(_db); };
      req.onerror   = e => reject(e.target.error);
    });
  }

  async function txn(store, mode, fn) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx  = db.transaction(store, mode);
      const obj = tx.objectStore(store);
      const req = fn(obj);
      req.onsuccess = () => resolve(req.result);
      req.onerror   = () => reject(req.error);
    });
  }

  async function getAll(store) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx    = db.transaction(store, 'readonly');
      const obj   = tx.objectStore(store);
      const req   = obj.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror   = () => reject(req.error);
    });
  }

  return {
    name: 'indexeddb',
    async appendWAL(batchId, events) {
      await txn('wal', 'readwrite', s => s.put({ batchId, ts: Date.now(), events }));
    },
    async readWAL() {
      const batches = await getAll('wal');
      batches.sort((a, b) => a.ts - b.ts);
      return batches.flatMap(b => b.events);
    },
    async clearWAL() {
      await txn('wal', 'readwrite', s => s.clear());
    },
    async writeSnapshot(snap) {
      await txn('snapshot', 'readwrite', s => s.put({ id: 'latest', snap, ts: Date.now() }));
    },
    async readSnapshot() {
      try {
        const rec = await txn('snapshot', 'readonly', s => s.get('latest'));
        return rec?.snap || null;
      } catch { return null; }
    },
    async appendArchive(events) {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const tx  = db.transaction('archive', 'readwrite');
        const obj = tx.objectStore('archive');
        for (const e of events) obj.add(e);
        tx.oncomplete = resolve;
        tx.onerror    = () => reject(tx.error);
      });
    },
    async queryArchiveRaw({ type, tsStart, tsEnd, contentHash, limit = 1000 }) {
      const all = await getAll('archive');
      let results = all;
      if (type)        results = results.filter(e => e.type === type);
      if (tsStart)     results = results.filter(e => e.ts >= tsStart);
      if (tsEnd)       results = results.filter(e => e.ts <= tsEnd);
      if (contentHash) results = results.filter(e => e.contentHash === contentHash);
      return results.slice(0, limit);
    },
    async archiveSize() {
      const all = await getAll('archive');
      return all.length;
    },
    stats() { return { backend: 'indexeddb' }; },
  };
}

// ── Filesystem backend (Node.js) ──────────────────────────────────────────────

function createFilesystemBackend(config) {
  // Lazy-require fs/path only in Node context
  let fs, path;
  try {
    fs   = require('fs');
    path = require('path');
  } catch {
    // Not in Node — fall back to memory
    return createMemoryBackend(config);
  }

  const base      = config.storePath || (path.join(process.cwd(), '.causal-nexus'));
  const walPath   = path.join(base, 'wal.jsonl');
  const snapPath  = path.join(base, 'snapshot.json');
  const archPath  = path.join(base, 'archive.jsonl');

  try { fs.mkdirSync(base, { recursive: true }); } catch {}

  function appendLine(file, obj) {
    fs.appendFileSync(file, JSON.stringify(obj) + '\n', 'utf8');
  }

  function readLines(file) {
    try {
      return fs.readFileSync(file, 'utf8').trim().split('\n')
        .filter(Boolean).map(l => JSON.parse(l));
    } catch { return []; }
  }

  return {
    name: 'filesystem',
    async appendWAL(batchId, events) {
      appendLine(walPath, { batchId, ts: Date.now(), events });
    },
    async readWAL() {
      return readLines(walPath).flatMap(b => b.events || []);
    },
    async clearWAL() {
      try { fs.writeFileSync(walPath, '', 'utf8'); } catch {}
    },
    async writeSnapshot(snap) {
      fs.writeFileSync(snapPath, JSON.stringify(snap), 'utf8');
    },
    async readSnapshot() {
      try { return JSON.parse(fs.readFileSync(snapPath, 'utf8')); }
      catch { return null; }
    },
    async appendArchive(events) {
      for (const e of events) appendLine(archPath, e);
    },
    async queryArchiveRaw({ type, tsStart, tsEnd, contentHash, limit = 1000 }) {
      let results = readLines(archPath);
      if (type)        results = results.filter(e => e.type === type);
      if (tsStart)     results = results.filter(e => e.ts >= tsStart);
      if (tsEnd)       results = results.filter(e => e.ts <= tsEnd);
      if (contentHash) results = results.filter(e => e.contentHash === contentHash);
      return results.slice(0, limit);
    },
    async archiveSize() {
      return readLines(archPath).length;
    },
    stats() {
      const hasWal  = fs.existsSync(walPath);
      const hasSnap = fs.existsSync(snapPath);
      const hasArch = fs.existsSync(archPath);
      return { backend: 'filesystem', base, hasWal, hasSnap, hasArch };
    },
  };
}

// ── createStore() — main factory ──────────────────────────────────────────────

// @hook 0a729534-56d1-4884-b47a-a738359deca4  persist:createStore  kind:factory
/**
 * Create a persistence store for a kernel instance.
 *
 * The store wires into the kernel via two hooks:
 *   1. kernel.subscribe() — every ingest is accumulated for WAL flushing
 *   2. Returned `archiveEvicted` — caller passes evicted events to cold storage
 *
 * @param {object}  kernel
 * @param {object}  [opts]   — merged with StoreConfig.defaults
 * @returns {Store}
 */
export function createStore(kernel, opts = {}) {
  const config  = { ...StoreConfig.defaults, ...opts };
  const backend = (() => {
    const name = detectBackend(config.backend);
    if (name === 'indexeddb')  return createIndexedDBBackend(config);
    if (name === 'filesystem') return createFilesystemBackend(config);
    return createMemoryBackend(config);
  })();

  let   _batchId    = 0;
  let   _since      = 0;   // kernel version at last flush
  let   _sinceSnap  = 0;   // kernel version at last snapshot
  const _pending    = [];   // events accumulated since last flush

  // Accumulate events via subscription
  const _unsub = kernel.subscribe(ev => {
    _pending.push(ev);
    if (_pending.length >= config.walFlushEvery) {
      flushStore(kernel, store).catch(() => {});
    }
  });

  const store = {
    backend,
    config,
    get pendingCount() { return _pending.length; },
    get batchId()      { return _batchId; },

    // Internal: drain pending to WAL
    async _drain() {
      if (!_pending.length) return;
      const batch = _pending.splice(0);
      _batchId++;
      await backend.appendWAL(String(_batchId), batch);
      _since = kernel.version;
    },

    // Check if snapshot is due
    _snapshotDue() {
      return (kernel.version - _sinceSnap) >= config.snapshotEvery;
    },

    // Mark snapshot written
    _snapshotWritten() {
      _sinceSnap = kernel.version;
    },

    // Destroy — unsubscribe from kernel
    destroy() {
      _unsub();
    },
  };

  return store;
}

// @hook 9b61f864-491d-49c0-8a85-b6a5d29096f4  persist:flushStore  kind:function
/**
 * Flush accumulated events to WAL. If snapshot is due, write full snapshot
 * and clear the WAL.
 *
 * @param {object} kernel
 * @param {Store}  store
 * @returns {Promise<{ walEntries: number, snapshotWritten: boolean }>}
 */
export async function flushStore(kernel, store) {
  await store._drain();

  let snapshotWritten = false;
  if (store._snapshotDue()) {
    // Dynamic import of compress — avoid circular deps at module load time
    try {
      const { snapshot } = await import('../compress/compress.js');
      const snap = snapshot(kernel);
      await store.backend.writeSnapshot(snap);
      await store.backend.clearWAL();
      store._snapshotWritten();
      snapshotWritten = true;
    } catch (e) {
      // Snapshot failed — WAL is still intact, no data loss
      kernel.ingest('nexus:persist:snapshot:failed', { error: e.message }, { source: 'persist:flushStore' });
    }
  }

  kernel.ingest('nexus:persist:flushed', {
    batchId:         store.batchId,
    pending:         0,
    snapshotWritten,
    backend:         store.backend.name,
  }, { source: 'persist:flushStore' });

  return { walEntries: store.batchId, snapshotWritten };
}

// @hook df1e5b04-d887-4a1d-ae05-b40645fe8e26  persist:recoverStore  kind:function
/**
 * Recover a kernel from persistent storage on startup.
 *
 * Recovery sequence:
 *   1. Try to read the latest snapshot → restore(snap) into kernel
 *   2. Read any WAL entries written after the snapshot
 *   3. Replay WAL events via kernel.ingest() with replayOf set
 *      (dedup prevents double-ingestion if WAL overlaps snapshot)
 *
 * @param {Store}  store
 * @param {object} kernel — fresh empty kernel to recover into
 * @returns {Promise<RecoveryResult>}
 */
export async function recoverStore(store, kernel) {
  let snapshotEvents  = 0;
  let walReplayed     = 0;
  let errors          = [];
  let recoveredFromSnapshot = false;

  // 1. Try snapshot first
  try {
    const snap = await store.backend.readSnapshot();
    if (snap) {
      const { restore } = await import('../compress/compress.js');
      const restored = restore(snap);
      // Copy events from restored kernel into our target kernel via replay
      for (const ev of restored.getAll()) {
        try {
          kernel.ingest(ev.type, ev.payload, {
            source:      ev.source,
            sessionId:   ev.sessionId,
            srcBusName:  ev.srcBusName,
            origEventTs: ev.eventTs,
            replayOf:    ev.id,
            causedBy:    ev.causedBy,
            edgeType:    ev.edgeType,
          });
          snapshotEvents++;
        } catch (e) {
          errors.push({ phase: 'snapshot', type: ev.type, error: e.message });
        }
      }
      recoveredFromSnapshot = true;
    }
  } catch (e) {
    errors.push({ phase: 'snapshot-read', error: e.message });
  }

  // 2. Replay WAL
  try {
    const walEvents = await store.backend.readWAL();
    for (const ev of walEvents) {
      try {
        kernel.ingest(ev.type, ev.payload, {
          source:      ev.source,
          sessionId:   ev.sessionId,
          srcBusName:  ev.srcBusName,
          origEventTs: ev.eventTs,
          replayOf:    ev.id,   // dedup suppresses duplicates already in snapshot
          causedBy:    ev.causedBy,
          edgeType:    ev.edgeType,
        });
        walReplayed++;
      } catch (e) {
        errors.push({ phase: 'wal', type: ev.type, error: e.message });
      }
    }
  } catch (e) {
    errors.push({ phase: 'wal-read', error: e.message });
  }

  const result = {
    ok:                   errors.length === 0,
    snapshotEvents,
    walReplayed,
    totalRecovered:       snapshotEvents + walReplayed,
    recoveredFromSnapshot,
    errors,
  };

  kernel.ingest('nexus:persist:recovered', {
    ...result,
    errorCount: errors.length,
  }, { source: 'persist:recoverStore' });

  return result;
}

// @hook 6c3e50dc-64f3-4850-8092-09738c38adbc  persist:archiveEvicted  kind:function
/**
 * Move ring-evicted events to cold archive instead of discarding them.
 *
 * Wire this up by subscribing to 'system:ring:evicted' events and calling
 * archiveEvicted with the evicted event objects. The kernel's eviction hook
 * fires before listeners, so the event is still in idIndex at that point.
 *
 * Usage:
 *   kernel.subscribe(ev => {
 *     if (ev.type === 'system:ring:evicted') {
 *       // The evicted event has already left the ring — we need to store
 *       // it before it's GC'd. Use the store's pending buffer.
 *       archiveEvicted(store, [evictedEvent]);
 *     }
 *   });
 *
 * Note: the evicted event object should be captured before the subscription
 * fires. In practice, wrap the kernel's ring push to capture evictions.
 *
 * @param {Store}    store
 * @param {Event[]}  events — evicted event objects
 * @returns {Promise<void>}
 */
export async function archiveEvicted(store, events) {
  if (!events?.length) return;
  await store.backend.appendArchive(events);
}

// @hook 31be7ae8-e365-4773-b0a0-53cc1ca2819c  persist:queryArchive  kind:function
/**
 * Query the cold event archive.
 *
 * The archive holds events that were evicted from the ring buffer.
 * Queries are O(n) over the archive (no secondary indexes — archive is cold).
 * For hot queries use the kernel's idIndex and typeIndex.
 *
 * @param {Store}  store
 * @param {object} filter
 *   filter.type         {string}   — exact event type match
 *   filter.tsStart      {number}   — wall-clock start (inclusive)
 *   filter.tsEnd        {number}   — wall-clock end (inclusive)
 *   filter.contentHash  {string}   — exact content hash match
 *   filter.limit        {number}   — max results (default 1000)
 * @returns {Promise<Event[]>}
 */
export async function queryArchive(store, filter = {}) {
  return store.backend.queryArchiveRaw(filter);
}
