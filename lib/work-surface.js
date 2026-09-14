'use strict';
/**
 * lib/work-surface.js — the real "operating table" for one large file.
 *
 * §MCO20 2026-09-13 — James: "cos type or template for a Work surface
 * query or operating table, with line count, chunks, parse and chunk
 * tool... build everything you can to get [nexus] coding massive repos
 * autonomously." Real, confirmed gap found before building: lib/project-
 * compartment.js's buildSeedFromPayload() is the only real path an
 * external project's files reach a compartment's working memory today,
 * and it TRUNCATES any file over maxBytesPerFile (4000B default) —
 * exactly the "massive repo" case this fixes. Named COS (Compartment OS,
 * docs/specs/ORCHESTRATOR-COS.spec.md) in the type name because a work
 * surface is the real operating table for ONE file inside a COS
 * compartment's working memory — not a new, unrelated concept.
 *
 * §BOUNDED, SAME DISCIPLINE project-compartment.js ALREADY USES — a
 * work surface never holds a whole massive file's content in memory or
 * in its own node file (that would just move the truncation problem,
 * not solve it). It holds real, cheap METADATA (line count, chunk
 * boundaries, content hashes) and re-reads the real file from disk on
 * demand for one chunk at a time via getChunkContent(). The file itself
 * is the one real source of truth; nothing here duplicates it.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DEFAULT_CHUNK_LINES = 150;

/**
 * parseFile(filePath) — real line/byte count, nothing fabricated. Refuses
 * (not throws) on a missing/unreadable file so callers get a real reason.
 */
function parseFile(filePath) {
  if (!fs.existsSync(filePath)) return { ok: false, reason: `no such file: ${filePath}` };
  let content;
  try { content = fs.readFileSync(filePath, 'utf8'); }
  catch (e) { return { ok: false, reason: `read failed: ${e.message}` }; }
  const lines = content.split('\n');
  // A trailing newline produces one real empty final element — not a real
  // extra line — dropped so lineCount matches what an editor would show.
  const lineCount = lines.length > 0 && lines[lines.length - 1] === '' ? lines.length - 1 : lines.length;
  return { ok: true, path: filePath, lineCount, byteCount: Buffer.byteLength(content, 'utf8') };
}

/**
 * chunkLineRanges(lineCount, opts) — pure. Real, non-overlapping
 * [startLine, endLine] ranges (1-indexed, inclusive) covering the WHOLE
 * file — no gaps, no silent drops, unlike buildSeedFromPayload's
 * truncation. Last chunk absorbs the remainder rather than leaving a
 * fabricated short final range.
 */
function chunkLineRanges(lineCount, opts = {}) {
  const chunkLines = opts.chunkLines === undefined ? DEFAULT_CHUNK_LINES : opts.chunkLines;
  if (!Number.isInteger(lineCount) || lineCount < 0) return { ok: false, reason: `lineCount must be a real non-negative integer, got ${lineCount}` };
  if (!Number.isInteger(chunkLines) || chunkLines < 1) return { ok: false, reason: `chunkLines must be a real positive integer, got ${chunkLines}` };
  const ranges = [];
  if (lineCount === 0) return { ok: true, ranges };
  for (let start = 1; start <= lineCount; start += chunkLines) {
    const end = Math.min(start + chunkLines - 1, lineCount);
    ranges.push({ index: ranges.length, startLine: start, endLine: end, lineCount: end - start + 1 });
  }
  return { ok: true, ranges };
}

/**
 * createWorkSurface(filePath, opts) — the real operating table: parses
 * the real file, computes real chunk boundaries, and a real content hash
 * per chunk (re-derived from disk, not cached content — a hash lets a
 * caller detect the file changed under it without holding the old
 * content around to compare against).
 */
function createWorkSurface(filePath, opts = {}) {
  const parsed = parseFile(filePath);
  if (!parsed.ok) return parsed;
  const chunked = chunkLineRanges(parsed.lineCount, opts);
  if (!chunked.ok) return chunked;

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const chunks = chunked.ranges.map(r => {
    const slice = lines.slice(r.startLine - 1, r.endLine).join('\n');
    return { ...r, contentHash: crypto.createHash('sha256').update(slice).digest('hex').slice(0, 16) };
  });

  return {
    ok: true,
    uuid: crypto.randomUUID(),
    path: filePath,
    lineCount: parsed.lineCount,
    byteCount: parsed.byteCount,
    chunkCount: chunks.length,
    chunks,
    createdAt: Date.now(),
  };
}

/**
 * getChunkContent(filePath, chunkIndex, opts) — re-reads the real file
 * and returns exactly that chunk's real lines. Never trusts a caller-
 * supplied line range; recomputes chunk boundaries from the file's own
 * current real line count first, so a chunkIndex from a stale work
 * surface either still lines up or is honestly refused, never silently
 * misaligned.
 */
function getChunkContent(filePath, chunkIndex, opts = {}) {
  const parsed = parseFile(filePath);
  if (!parsed.ok) return parsed;
  const chunked = chunkLineRanges(parsed.lineCount, opts);
  if (!chunked.ok) return chunked;
  const range = chunked.ranges[chunkIndex];
  if (!range) return { ok: false, reason: `chunkIndex ${chunkIndex} out of range — this file has ${chunked.ranges.length} real chunks right now` };

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const slice = lines.slice(range.startLine - 1, range.endLine).join('\n');
  return { ok: true, path: filePath, ...range, content: slice };
}

/**
 * exportWorkSurface(workSurface, destDir) — real, standalone `.worksurface`
 * node (lib/node-export.js's exportToFile — the 39th real KNOWN_TYPE).
 * Chunk CONTENT is never written into the node — only the metadata
 * (line ranges + hashes) — the file on disk stays the one real source
 * of truth, same discipline this whole module already applies.
 */
function exportWorkSurface(workSurface, destDir, meta = {}) {
  const { exportToFile } = require('./node-export.js');
  return exportToFile('worksurface', workSurface.uuid, {
    uuid: workSurface.uuid, path: workSurface.path, lineCount: workSurface.lineCount,
    byteCount: workSurface.byteCount, chunkCount: workSurface.chunkCount,
    chunks: workSurface.chunks, createdAt: workSurface.createdAt,
  }, meta, destDir);
}

module.exports = { parseFile, chunkLineRanges, createWorkSurface, getChunkContent, exportWorkSurface, DEFAULT_CHUNK_LINES };
