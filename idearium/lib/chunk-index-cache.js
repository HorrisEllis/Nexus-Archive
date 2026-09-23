/**
 * idearium/lib/chunk-index-cache.js
 *
 * Three real call sites in idearium/api/index.js (repo.chunks.list,
 * repo.chunks.get, the post-pipeline chunk-count read) each did a
 * synchronous full readFileSync + JSON.parse of chunks/index.json on
 * every call, and repo.chunks.get additionally did a linear .find()
 * over the whole array to locate one chunk by id — its own comment
 * calls this route "§MINIMUM-SURFACE... so a large repo never has to
 * be loaded into model context to edit one function," but the index
 * read itself was doing exactly the full-repo-scale read the route
 * was named to avoid.
 *
 * §FIXED 2026-09-23 — first version of this file used CommonJS
 * require()/module.exports and silently exported nothing, because
 * idearium/package.json has "type": "module" — every .js file here is
 * real ESM. Caught by testing the module directly before wiring it
 * into any route, not by assuming the syntax was fine.
 *
 * mtime-based invalidation: never serves stale data silently — if the
 * file's mtime differs from what's cached, that's a real cache miss,
 * not a TTL guess. A byId Map is built once per real parse, turning
 * repo.chunks.get's per-request linear scan into an O(1) lookup.
 */
import fs from 'fs';

const _cache = new Map(); // idxPath -> { mtimeMs, chunks, byId }

/**
 * getChunkIndex(idxPath) -> { chunks, byId } | null
 * Returns null if the file doesn't exist (matches every real call
 * site's existing fs.existsSync-then-404 pattern — this function
 * doesn't change that contract, only the cost of a cache hit).
 */
export function getChunkIndex(idxPath) {
  let stat;
  try { stat = fs.statSync(idxPath); }
  catch (_) { _cache.delete(idxPath); return null; }

  const cached = _cache.get(idxPath);
  if (cached && cached.mtimeMs === stat.mtimeMs) return cached;

  const chunks = JSON.parse(fs.readFileSync(idxPath, 'utf8'));
  const byId = new Map(chunks.map(c => [c.id, c]));
  const entry = { mtimeMs: stat.mtimeMs, chunks, byId };
  _cache.set(idxPath, entry);
  return entry;
}

/** Explicit invalidation for a writer that knows it just changed the file. */
export function invalidateChunkIndex(idxPath) {
  _cache.delete(idxPath);
}
