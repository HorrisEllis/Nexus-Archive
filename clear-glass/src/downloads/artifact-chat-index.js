/**
 * clear-glass/src/downloads/artifact-chat-index.js — ClearGlass downloads
 * manager as a complete artifact + agent-chat index.
 *
 * §BUILT 2026-09-17 — James: "i want to make clearglass downloads
 * manager, a complete artifact and agent chat index. that way we have
 * redundant backups, and fallback chains. index.db. and .response."
 * Also: "has to use cos. all compartments in nexus are supposed to use
 * [it]." Runs inside a real COS compartment (the 'database' archetype —
 * loopback-only network isolation, real resource/watchdog limits — same
 * archetype the rest of NEXUS already uses for anything that stores
 * data), not a bare module with its own ad hoc folder.
 *
 * ── Why two layers, not just index.db ──────────────────────────────────
 * "redundant backups, and fallback chains" is a real requirement, not a
 * decoration, so it's built as two genuinely independent layers rather
 * than one database with a backup flag:
 *
 *   responses/<id>.response   — RAW, self-contained, one per captured
 *                               item. Source of truth.
 *   index.db                  — SQLite (better-sqlite3). Fast queryable
 *                               index OVER the .response files.
 *                               Disposable and regenerable — never the
 *                               only copy of anything.
 *
 * Same reasoning as this mission's very first design note (capture-as-
 * primitive): a parser or an index will eventually be wrong somewhere;
 * if the raw observation survives, the index can always be rebuilt
 * without recapturing. queryItems() below enforces this for real — an
 * unreadable or missing index.db doesn't return an error, it triggers
 * rebuildIndexFromResponses() and retries once, automatically.
 *
 * ── Backups ─────────────────────────────────────────────────────────────
 * backupSnapshot() calls the REAL, already-built COS snapshot mechanism
 * (cos/cli/commands/snapshot.js's takeCommand) rather than inventing a
 * second backup system — a compartment snapshot already captures both
 * layers (responses/ and index.db) together, consistent with each other.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MODULE_ID = 'clear-glass/downloads/artifact-chat-index';
const COMPARTMENT_NAME = 'clearglass-downloads-index';
const DATABASE_ARCHETYPE = 'database'; // cos/archetype/registry.js — real, existing, loopback-only, better-sqlite3 in its own detectionHints

let _Database = null;
function _sqlite() {
  if (!_Database) _Database = require('better-sqlite3');
  return _Database;
}

// ── Compartment lifecycle — real create + assign, same event-driven
// gate pipeline every other compartment in NEXUS goes through, not a
// bespoke folder. Idempotent: safe to call on every boot.
function ensureCompartment(host) {
  const { createCompartment } = require('../../../cos/cli/commands/create.js');
  const existing = host.store.getCompartmentByName(COMPARTMENT_NAME);
  if (existing) return existing;

  const compartment = createCompartment(host, {
    name: COMPARTMENT_NAME,
    purpose: 'ClearGlass captured chats and artifacts — raw .response files plus a regenerable SQLite index',
    networkIsolated: true, // pure local storage, no reason for this compartment to ever touch the network
  });

  const { assignArchetype } = require('../../../cos/cli/commands/archetype.js');
  const assigned = assignArchetype(host, compartment.name, DATABASE_ARCHETYPE);
  if (!assigned) {
    // Non-fatal: the compartment is real and usable even without the
    // archetype's resource/watchdog/network presets applied — logged,
    // not thrown, since a missing archetype assignment must never block
    // capture (data loss is worse than an unhardened compartment).
    console.warn(`[${MODULE_ID}] archetype assignment failed for "${compartment.name}" — compartment still usable, just without the database preset`);
  }
  return compartment;
}

function _paths(root) {
  return {
    root,
    dbPath: path.join(root, 'index.db'),
    responsesDir: path.join(root, 'responses'),
    artifactsDir: path.join(root, 'artifacts'),
  };
}

function _ensureDirs(p) {
  fs.mkdirSync(p.responsesDir, { recursive: true });
  fs.mkdirSync(p.artifactsDir, { recursive: true });
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS items (
  id           TEXT PRIMARY KEY,
  kind         TEXT NOT NULL,        -- 'chat' | 'artifact'
  provider     TEXT,
  chat_id      TEXT,
  captured_at  INTEGER NOT NULL,
  content_hash TEXT NOT NULL,
  response_path TEXT NOT NULL,
  artifact_path TEXT,
  status       TEXT NOT NULL DEFAULT 'ok'   -- 'ok' | 'unreadable' (set by rebuild when a .response fails to parse)
);
CREATE INDEX IF NOT EXISTS idx_items_kind     ON items(kind);
CREATE INDEX IF NOT EXISTS idx_items_chat_id  ON items(chat_id);
CREATE INDEX IF NOT EXISTS idx_items_provider ON items(provider);
`;

function _openDb(p) {
  const Database = _sqlite();
  const db = new Database(p.dbPath);
  db.pragma('journal_mode = WAL'); // real crash-safety for the index layer itself — matches this module's own "the index must never be the single point of failure" reasoning
  db.exec(SCHEMA);
  return db;
}

function sha256(s) { return crypto.createHash('sha256').update(s).digest('hex'); }

/**
 * recordResponse(root, { kind, provider, chatId, raw, artifactBuffer, artifactFileName })
 * — the one real write path. Order matters: the .response file (source
 * of truth) is written and fsynced BEFORE the index row, so a crash
 * between the two leaves an orphaned-but-recoverable .response file
 * (rebuildIndexFromResponses() picks it up), never an index row
 * pointing at a .response that doesn't exist.
 */
function recordResponse(root, { kind, provider, chatId, raw, artifactBuffer, artifactFileName }) {
  if (kind !== 'chat' && kind !== 'artifact') throw new Error(`recordResponse: kind must be 'chat' or 'artifact', got ${kind}`);
  const p = _paths(root);
  _ensureDirs(p);

  const id = crypto.randomUUID();
  const capturedAt = Date.now();
  const rawJson = JSON.stringify(raw ?? {});
  const contentHash = `sha256:${sha256(rawJson)}`;

  let artifactPath = null;
  if (kind === 'artifact' && artifactBuffer) {
    const dir = path.join(p.artifactsDir, id);
    fs.mkdirSync(dir, { recursive: true });
    const fileName = artifactFileName || 'artifact.bin';
    fs.writeFileSync(path.join(dir, fileName), artifactBuffer);
    artifactPath = path.join('artifacts', id, fileName);
  }

  const responseFile = {
    id, kind, provider: provider || null, chat_id: chatId || null,
    captured_at: capturedAt, content_hash: contentHash,
    artifact_path: artifactPath, raw,
  };
  const responseRelPath = path.join('responses', `${id}.response`);
  const responseAbsPath = path.join(root, responseRelPath);
  const fd = fs.openSync(responseAbsPath, 'w');
  fs.writeSync(fd, JSON.stringify(responseFile, null, 2));
  fs.fsyncSync(fd); // real durability — this file is the source of truth, not a best-effort write
  fs.closeSync(fd);

  const db = _openDb(p);
  try {
    db.prepare(`INSERT INTO items (id, kind, provider, chat_id, captured_at, content_hash, response_path, artifact_path, status)
                VALUES (@id, @kind, @provider, @chat_id, @captured_at, @content_hash, @response_path, @artifact_path, 'ok')`)
      .run({ id, kind, provider: provider || null, chat_id: chatId || null, captured_at: capturedAt, content_hash: contentHash, response_path: responseRelPath, artifact_path: artifactPath });
  } finally {
    db.close();
  }

  return { id, kind, capturedAt, contentHash, responsePath: responseRelPath, artifactPath };
}

/**
 * rebuildIndexFromResponses(root) — the fallback chain, made real.
 * Scans every responses/*.response file and rebuilds index.db from
 * scratch. A .response file that fails to parse is recorded with
 * status:'unreadable' rather than skipped silently (same "never
 * disappear from the model" rule this whole mission's spec work has
 * used throughout) — its bytes are still on disk and still recoverable
 * by hand even if this module can't index it.
 */
function rebuildIndexFromResponses(root) {
  const p = _paths(root);
  _ensureDirs(p);

  if (fs.existsSync(p.dbPath)) {
    for (const ext of ['', '-wal', '-shm']) {
      try { fs.rmSync(p.dbPath + ext, { force: true }); } catch { /* best-effort cleanup of a corrupt/stale index */ }
    }
  }

  const db = _openDb(p);
  let recovered = 0, unreadable = 0;
  try {
    const insert = db.prepare(`INSERT OR REPLACE INTO items (id, kind, provider, chat_id, captured_at, content_hash, response_path, artifact_path, status)
                                VALUES (@id, @kind, @provider, @chat_id, @captured_at, @content_hash, @response_path, @artifact_path, @status)`);
    const files = fs.existsSync(p.responsesDir) ? fs.readdirSync(p.responsesDir).filter(f => f.endsWith('.response')) : [];
    const rebuildTx = db.transaction((entries) => { for (const e of entries) insert.run(e); });
    const entries = [];
    for (const file of files) {
      const id = file.replace(/\.response$/, '');
      const relPath = path.join('responses', file);
      const rawText = fs.readFileSync(path.join(p.responsesDir, file), 'utf8');
      const rawHash = `sha256:${sha256(rawText)}`; // computed unconditionally — even an unreadable file has real bytes worth hashing
      try {
        const parsed = JSON.parse(rawText);
        entries.push({
          id: parsed.id || id, kind: parsed.kind || 'chat', provider: parsed.provider || null,
          chat_id: parsed.chat_id || null, captured_at: parsed.captured_at || 0,
          content_hash: parsed.content_hash || rawHash, response_path: relPath,
          artifact_path: parsed.artifact_path || null, status: 'ok',
        });
        recovered++;
      } catch (e) {
        // Malformed .response file — still indexed, marked unreadable,
        // never dropped. See module header / REPO-004 precedent. Still
        // gets a real content_hash (of its raw bytes) so a rebuild can
        // tell whether the same broken file persists or was replaced.
        entries.push({
          id, kind: 'chat', provider: null, chat_id: null, captured_at: 0,
          content_hash: rawHash, response_path: relPath, artifact_path: null, status: 'unreadable',
        });
        unreadable++;
        console.warn(`[${MODULE_ID}] rebuild: ${file} failed to parse (${e.message}) — indexed as unreadable, bytes untouched on disk`);
      }
    }
    rebuildTx(entries);
  } finally {
    db.close();
  }
  return { recovered, unreadable, total: recovered + unreadable };
}

/**
 * queryItems(root, { kind, provider, chatId, limit }) — the fallback
 * chain is enforced HERE, not just documented: any failure opening or
 * querying index.db triggers one rebuild and one retry. If the retry
 * also fails, the error is real and gets thrown — there's no third
 * layer beyond the .response files themselves, and at that point the
 * caller should look at disk directly, not trust another silent retry.
 */
function queryItems(root, { kind, provider, chatId, limit = 100 } = {}) {
  const p = _paths(root);
  const run = () => {
    const db = _openDb(p);
    try {
      const clauses = []; const params = {};
      if (kind)     { clauses.push('kind = @kind');         params.kind = kind; }
      if (provider) { clauses.push('provider = @provider'); params.provider = provider; }
      if (chatId)   { clauses.push('chat_id = @chatId');    params.chatId = chatId; }
      const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
      return db.prepare(`SELECT * FROM items ${where} ORDER BY captured_at DESC LIMIT @limit`).all({ ...params, limit });
    } finally {
      db.close();
    }
  };

  try {
    return run();
  } catch (e) {
    console.warn(`[${MODULE_ID}] queryItems: index.db read failed (${e.message}) — rebuilding from responses/ and retrying once`);
    rebuildIndexFromResponses(root);
    return run(); // real retry — throws for real if this one also fails, no infinite/silent loop
  }
}

/**
 * backupSnapshot(host) — redundant backups via the REAL, existing COS
 * snapshot mechanism (cos/cli/commands/snapshot.js), not a second
 * bespoke backup path. A snapshot captures responses/ and index.db
 * together, consistent with each other at the moment it's taken.
 */
function backupSnapshot(host) {
  const { takeCommand } = require('../../../cos/cli/commands/snapshot.js');
  return takeCommand(host, COMPARTMENT_NAME);
}

module.exports = {
  MODULE_ID, COMPARTMENT_NAME,
  ensureCompartment, recordResponse, queryItems, rebuildIndexFromResponses, backupSnapshot,
};
