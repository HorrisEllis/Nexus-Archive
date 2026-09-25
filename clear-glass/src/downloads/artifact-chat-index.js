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
 *   index-jaa/items.json      — JAA (guardian/jaa-store.js, pure JS, the
 *                               store every NEXUS system runs on). Queryable
 *                               index OVER the .response files. Disposable
 *                               and regenerable — never the only copy of
 *                               anything. (Was index.db / better-sqlite3
 *                               until 0.39.241 — James: "use jaa for the
 *                               database". better-sqlite3 needs a C++
 *                               toolchain his machine doesn't have, so the
 *                               index never existed there at all.)
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

// §JAA 0.39.241 — James: "use jaa for the database". The index is a JaaStore
// table (guardian/jaa-store.js: zero native dependencies, better-sqlite3's call
// shapes, cross-process flush locking). One store per root per process.
const INDEX_TABLE = 'items';
const _stores = new Map();   // indexDir -> JaaStore
function _store(p) {
  let st = _stores.get(p.indexDir);
  if (!st) {
    const { JaaStore } = require('../../../guardian/jaa-store.js');
    st = new JaaStore(p.indexDir, { tables: [INDEX_TABLE], settings: false });
    _stores.set(p.indexDir, st);
  }
  return st;
}
function _row(e) {
  return {
    id: e.id, kind: e.kind, provider: e.provider || null, chat_id: e.chat_id || null,
    agent_id: e.agent_id || null, job_id: e.job_id || null, captured_at: e.captured_at || 0,
    content_hash: e.content_hash, response_path: e.response_path, artifact_path: e.artifact_path || null,
    status: e.status || 'ok',
  };
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

/**
 * defaultRoot() — 0.39.239. THE one place the index's root is resolved: the
 * COS compartment 'clearglass-downloads-index', created on first use. Guardian's
 * writer (guardian/lib/code-artifact.js), Clear Glass's download capture and the
 * Library's read routes all call this, so they cannot drift onto different
 * folders. Cached per process; a failure throws with the reason.
 */
let _defaultRoot = null;
function defaultRoot() {
  if (_defaultRoot) return _defaultRoot;
  const { createHost } = require('../../../cos/host/index.js');
  const c = ensureCompartment(createHost());
  const root = c.fs?.root || c.root;
  if (!root) throw new Error(`compartment '${COMPARTMENT_NAME}' has no root`);
  return (_defaultRoot = root);
}

function _paths(root) {
  return {
    root,
    indexDir: path.join(root, 'index-jaa'),   // 0.39.241 — JAA; an old index.db beside it is left untouched
    responsesDir: path.join(root, 'responses'),
    artifactsDir: path.join(root, 'artifacts'),
  };
}

function _ensureDirs(p) {
  fs.mkdirSync(p.responsesDir, { recursive: true });
  fs.mkdirSync(p.artifactsDir, { recursive: true });
}

function sha256(s) { return crypto.createHash('sha256').update(s).digest('hex'); }
// 0.39.239 — a .response written before agent_id/job_id were fields still carries them in raw.
const _agentOf = (r) => (r && (r.agent_id || (r.raw && r.raw.agentId))) || null;
const _jobOf   = (r) => (r && (r.job_id   || (r.raw && r.raw.jobId)))   || null;

/**
 * recordResponse(root, { kind, provider, chatId, raw, artifactBuffer, artifactFileName })
 * — the one real write path. Order matters: the .response file (source
 * of truth) is written and fsynced BEFORE the index row, so a crash
 * between the two leaves an orphaned-but-recoverable .response file
 * (rebuildIndexFromResponses() picks it up), never an index row
 * pointing at a .response that doesn't exist.
 */
function recordResponse(root, { kind, provider, chatId, agentId, jobId, raw, artifactBuffer, artifactFileName }) {
  if (kind !== 'chat' && kind !== 'artifact') throw new Error(`recordResponse: kind must be 'chat' or 'artifact', got ${kind}`);
  const p = _paths(root);
  _ensureDirs(p);

  const id = crypto.randomUUID();
  const capturedAt = Date.now();
  // 0.39.239 — who the response belongs to is a field, not something to dig out of raw.
  const agent = agentId || (raw && raw.agentId) || null;
  const job   = jobId   || (raw && raw.jobId)   || null;
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
    agent_id: agent, job_id: job,
    captured_at: capturedAt, content_hash: contentHash,
    artifact_path: artifactPath, raw,
  };
  const responseRelPath = path.join('responses', `${id}.response`);
  const responseAbsPath = path.join(root, responseRelPath);
  const fd = fs.openSync(responseAbsPath, 'w');
  fs.writeSync(fd, JSON.stringify(responseFile, null, 2));
  fs.fsyncSync(fd); // real durability — this file is the source of truth, not a best-effort write
  fs.closeSync(fd);

  // §FIXED 2026-09-20 — this block used to throw on any index failure,
  // AFTER the .response file above had already been written and fsync'd.
  // That contradicted this module's own stated design in two ways: the
  // header says the .response file is the SOURCE OF TRUTH and index.db
  // is "disposable and regenerable — never the only copy of anything,"
  // and rebuildIndexFromResponses() exists precisely to recreate it.
  // Losing a successful capture because a disposable accelerator was
  // unavailable is the accelerator deciding the outcome.
  //
  // Not hypothetical: better-sqlite3 has been an OPTIONAL dependency
  // since 0.39.153 (its node-gyp build needs a C++ toolchain James's
  // Windows box does not have — that entry's own root-cause fix), and it
  // is genuinely absent in this checkout. So on the real target machine
  // every single recordResponse() call threw, and the whole index was
  // unusable, while the .response files it wrote were sitting on disk
  // perfectly intact.
  //
  // Now: the source of truth is written and kept; the index is attempted
  // and its failure is REPORTED, never swallowed and never fatal.
  // `indexed` is the honest flag — a caller that needs to know can ask.
  // The source of truth is written and kept; the index is attempted and its
  // failure REPORTED, never fatal (§FIXED 2026-09-20). Flushed at once, not on
  // JaaStore's 1.5 s debounce: the readers (Clear Glass, idearium) are other
  // processes, and the Agent tab polls for exactly this row.
  let indexed = false;
  let indexError = null;
  try {
    const st = _store(p);
    st.insert(INDEX_TABLE, _row({ id, kind, provider, chat_id: chatId, agent_id: agent, job_id: job, captured_at: capturedAt,
      content_hash: contentHash, response_path: responseRelPath, artifact_path: artifactPath }));
    st.flushAll();
    indexed = true;
  } catch (e) {
    indexError = e.message;
    console.warn(`[${MODULE_ID}] recordResponse: the .response file is written and durable at ${responseRelPath}, but indexing it failed (${e.message}) — rebuildIndexFromResponses() recovers this`);
  }

  return { id, kind, agentId: agent, jobId: job, capturedAt, contentHash, responsePath: responseRelPath, artifactPath, indexed, indexError };
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

  const st = _store(p);
  let recovered = 0, unreadable = 0;
  {
    const files = fs.existsSync(p.responsesDir) ? fs.readdirSync(p.responsesDir).filter(f => f.endsWith('.response')) : [];
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
          agent_id: _agentOf(parsed), job_id: _jobOf(parsed),
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
          id, kind: 'chat', provider: null, chat_id: null, agent_id: null, job_id: null, captured_at: 0,
          content_hash: rawHash, response_path: relPath, artifact_path: null, status: 'unreadable',
        });
        unreadable++;
        console.warn(`[${MODULE_ID}] rebuild: ${file} failed to parse (${e.message}) — indexed as unreadable, bytes untouched on disk`);
      }
    }
    // Replace, not merge: the index is exactly what responses/ holds, nothing more.
    st.delete(INDEX_TABLE, () => true);
    for (const e of entries) st.insert(INDEX_TABLE, _row(e));
    st.flushAll();
  }
  return { recovered, unreadable, total: recovered + unreadable };
}

/**
 * queryItems(root, { kind, provider, chatId, agentId, jobId, limit }) — newest first.
 * The fallback chain is enforced HERE:
 *   1. the JAA index, reloaded from disk first (the writer is guardian, another process);
 *   2. if it doesn't hold exactly what responses/ holds (never built, a write lost,
 *      files copied in by hand), it is rebuilt from responses/ and read again;
 *   3. if JAA itself fails, responses/ is read directly — slower, and correct.
 */
function queryItems(root, { kind, provider, chatId, agentId, jobId, limit = 100 } = {}) {
  const p = _paths(root);
  const where = {};
  if (kind)     where.kind = kind;
  if (provider) where.provider = provider;
  if (chatId)   where.chat_id = chatId;
  if (agentId)  where.agent_id = agentId;
  if (jobId)    where.job_id = jobId;
  try {
    const st = _store(p);
    st.reloadTable(INDEX_TABLE);
    let onDisk = 0;
    try { onDisk = fs.readdirSync(p.responsesDir).filter(n => n.endsWith('.response')).length; } catch (_) { /* no responses/ yet */ }
    if (st.count(INDEX_TABLE) !== onDisk) {
      const r = rebuildIndexFromResponses(root);
      console.log(`[${MODULE_ID}] index rebuilt from responses/ — ${r.recovered} indexed${r.unreadable ? `, ${r.unreadable} unreadable` : ''}`);
    }
    return st.all(INDEX_TABLE, where, { orderBy: 'captured_at', order: 'DESC', limit });
  } catch (e) {
    console.warn(`[${MODULE_ID}] queryItems: JAA index unavailable (${e.message}) — reading responses/ directly`);
    return _scanResponses(p, { kind, provider, chatId, agentId, jobId, limit });
  }
}

/** _scanResponses — the last link in the fallback chain. Reads the
 *  .response files themselves, newest first. A file that will not parse
 *  is reported with status:'unreadable' rather than skipped silently,
 *  the same rule rebuildIndexFromResponses() already applies. */
function _scanResponses(p, { kind, provider, chatId, agentId, jobId, limit = 100 } = {}) {
  let names;
  try { names = fs.readdirSync(p.responsesDir).filter(n => n.endsWith('.response')); }
  catch (_) { return []; }
  const out = [];
  for (const name of names) {
    const abs = path.join(p.responsesDir, name);
    let r;
    try { r = JSON.parse(fs.readFileSync(abs, 'utf8')); }
    catch (e) {
      // 0.39.241 — an unreadable file can't be attributed to an agent, job or provider,
      // so it answers only an unfiltered listing (as the JAA index does: its fields are null).
      if (kind || provider || chatId || agentId || jobId) continue;
      out.push({ id: name.replace(/\.response$/, ''), kind: null, provider: null, chat_id: null, agent_id: null, job_id: null,
        captured_at: 0, content_hash: null, response_path: path.join('responses', name),
        artifact_path: null, status: 'unreadable', error: e.message });
      continue;
    }
    if (kind && r.kind !== kind) continue;
    if (provider && r.provider !== provider) continue;
    if (chatId && r.chat_id !== chatId) continue;
    if (agentId && _agentOf(r) !== agentId) continue;
    if (jobId && _jobOf(r) !== jobId) continue;
    out.push({ id: r.id, kind: r.kind, provider: r.provider, chat_id: r.chat_id, agent_id: _agentOf(r), job_id: _jobOf(r),
      captured_at: r.captured_at, content_hash: r.content_hash,
      response_path: path.join('responses', name), artifact_path: r.artifact_path, status: 'ok' });
  }
  out.sort((a, b) => (b.captured_at || 0) - (a.captured_at || 0));
  return out.slice(0, limit);
}

/**
 * findResponseByJobId(root, jobId) — James: "verify the .response node or
 * artifact on disk using downloads manager." raw.jobId isn't an indexed
 * column (kind/provider/chat_id are the only ones index.db carries), so
 * this scans responses/*.response directly — the same real source of
 * truth _scanResponses already falls back to, not a second store. Real
 * use: a job stuck at "dispatched" (guardian's own completion signal
 * lost, e.g. to an exception in enrichment) can still be verified/
 * recovered from here, because recordResponse() already wrote this file
 * BEFORE guardian's completion emit — this is the redundant, disk-based
 * confirmation that a response genuinely arrived, independent of whether
 * the in-process signal did.
 */
function findResponseByJobId(root, jobId) {
  const p = _paths(root);
  let names;
  try { names = fs.readdirSync(p.responsesDir).filter(n => n.endsWith('.response')); }
  catch (_) { return null; }
  let best = null;
  for (const name of names) {
    let r;
    try { r = JSON.parse(fs.readFileSync(path.join(p.responsesDir, name), 'utf8')); }
    catch (_) { continue; } // unreadable — same honest skip _scanResponses uses for its own listing, but this is a targeted lookup, not a listing
    if (r?.raw?.jobId === jobId) {
      if (!best || (r.captured_at || 0) > (best.captured_at || 0)) best = r;
    }
  }
  return best; // null if genuinely never captured — never fabricates a match
}

/**
 * readItem(root, id) — 0.39.239. The full record for one item, read from its
 * .response file (the source of truth, never the index). The Library's
 * Responses view opens this to show the reply text and code blocks. The id
 * must be a plain item id: anything that could leave responses/ is refused.
 */
function readItem(root, id) {
  if (typeof id !== 'string' || !/^[A-Za-z0-9-]{1,80}$/.test(id)) return { error: 'invalid id' };
  const abs = path.join(_paths(root).responsesDir, `${id}.response`);
  let text;
  try { text = fs.readFileSync(abs, 'utf8'); } catch (_) { return null; }
  try {
    const r = JSON.parse(text);
    return { ...r, agent_id: _agentOf(r), job_id: _jobOf(r) };
  } catch (e) { return { id, status: 'unreadable', error: e.message }; }
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
  findResponseByJobId, readItem, defaultRoot,
};
