'use strict';
// lib/project-compartment.js — turns a staged (and, for archives,
// expanded — see intake.js's expandArchive()) intake drop into a
// compartment's working_memory seed.
//
// §THE GAP THIS CLOSES — checked directly before writing this:
// case-library.js's query() is the only thing that has ever produced a
// workingMemorySeed for compartment-engine.spawn(), and it is scoped
// entirely to PAST COMPARTMENT PATTERN MEMORY (source_compartment_uuid,
// trace_log, prior result — see that file's own query()). There was no
// path anywhere in this codebase for external project data (an imported
// zip/repo) to become a compartment's working memory. This module is
// that path — it does not touch case-library's own semantics; see
// lib/autonomous-loop.js's projectSeed parameter for how the two are
// composed without one overwriting the other.
//
// §BOUNDED — a whole project's file contents cannot go into a prompt.
// Every limit below is real and enforced, not a soft target: maxFiles
// caps file count, maxBytesPerFile truncates any single file,
// maxTotalBytes stops adding files once the seed would be too large to
// be a reasonable prompt payload. Every omission is recorded with a
// reason — never a silent drop.

const fs   = require('fs');
const path = require('path');

const MAX_FILES           = 60;
const MAX_BYTES_PER_FILE  = 4000;
const MAX_TOTAL_BYTES     = 60000;

// Directories never worth seeding into a prompt regardless of project —
// dependency trees and VCS internals dwarf real project code and add
// cost, not signal.
const SKIP_DIRS = new Set(['node_modules', '.git', '.svn', 'dist', 'build', '__pycache__', '.next']);
const TEXT_EXT  = new Set(['.js', '.ts', '.jsx', '.tsx', '.json', '.md', '.txt', '.py', '.html', '.css', '.yml', '.yaml', '.spec', '.sh']);

function _walk(dir, base = dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) _walk(abs, base, out);
    else if (entry.isFile()) out.push(path.relative(base, abs).split(path.sep).join('/'));
  }
  return out;
}

/**
 * buildSeedFromPayload(payloadDir, opts) — real file tree + bounded file
 * contents from an on-disk project directory. Works on any directory, not
 * only intake drops — buildSeedFromDrop() below is the intake-specific
 * convenience wrapper.
 */
function buildSeedFromPayload(payloadDir, opts = {}) {
  if (!fs.existsSync(payloadDir)) return { ok: false, reason: `no such directory: ${payloadDir}` };

  const maxFiles          = opts.maxFiles || MAX_FILES;
  const maxBytesPerFile   = opts.maxBytesPerFile || MAX_BYTES_PER_FILE;
  const maxTotalBytes     = opts.maxTotalBytes || MAX_TOTAL_BYTES;

  const fileTree = _walk(payloadDir); // real, complete tree — cheap, never truncated
  const included = {};
  const omitted  = [];
  let totalBytes = 0;

  for (const rel of fileTree) {
    if (Object.keys(included).length >= maxFiles) { omitted.push({ path: rel, why: 'maxFiles reached' }); continue; }
    const ext = path.extname(rel).toLowerCase();
    if (!TEXT_EXT.has(ext)) { omitted.push({ path: rel, why: `binary/unlisted extension (${ext || 'none'})` }); continue; }
    if (totalBytes >= maxTotalBytes) { omitted.push({ path: rel, why: 'maxTotalBytes reached' }); continue; }

    let content;
    try { content = fs.readFileSync(path.join(payloadDir, rel), 'utf8'); }
    catch (e) { omitted.push({ path: rel, why: `read failed: ${e.message}` }); continue; }

    const truncated = content.length > maxBytesPerFile;
    const slice = truncated ? content.slice(0, maxBytesPerFile) : content;
    totalBytes += slice.length;
    included[rel] = { content: slice, truncated };
    // §MCO20 2026-09-13 — James: "coding massive repos autonomously."
    // Real, additive fix for exactly this truncation: a truncated file
    // ALSO gets a real work-surface reference (lib/work-surface.js) —
    // line count + full chunk plan covering the WHOLE file, not just
    // the truncated slice above. The truncated `content` field is
    // UNCHANGED (every existing caller of this function keeps getting
    // exactly what it got before); `workSurface` is a new, optional
    // field a caller can use to fetch the REST of the file one chunk at
    // a time via get_work_surface_chunk, instead of the rest being
    // silently gone. A work-surface build failure here is non-fatal —
    // the real truncated seed above still gets returned either way.
    if (truncated) {
      try {
        const { createWorkSurface } = require('./work-surface.js');
        const ws = createWorkSurface(path.join(payloadDir, rel), opts.workSurfaceOpts);
        if (ws.ok) {
          included[rel].workSurface = { uuid: ws.uuid, lineCount: ws.lineCount, chunkCount: ws.chunkCount, chunks: ws.chunks.map(c => ({ index: c.index, startLine: c.startLine, endLine: c.endLine })) };
        }
      } catch (_) { /* honest degrade — the truncated slice above is still real and returned */ }
    }
  }

  return { ok: true, payloadDir, fileCount: fileTree.length, fileTree, files: included, omitted };
}

/**
 * buildSeedFromDrop(dropId, opts) — same as above, sourced from a real
 * intake drop. Not a second source of truth for the drop's state — reads
 * dropId → payload path via intake.read(), then delegates.
 */
function buildSeedFromDrop(dropId, opts = {}) {
  const intake = require('./intake.js');
  const intakeDir = opts.intakeDir || intake.INTAKE_DIR;
  const contract = intake.read(dropId, intakeDir);
  if (!contract) return { ok: false, reason: `no staged drop "${dropId}"` };
  const payloadDir = path.join(intakeDir, dropId, 'payload');
  const seed = buildSeedFromPayload(payloadDir, opts);
  if (!seed.ok) return seed;
  return { ...seed, dropId, provenance: contract.provenance, expanded: !!contract.expanded };
}

module.exports = { buildSeedFromPayload, buildSeedFromDrop, MAX_FILES, MAX_BYTES_PER_FILE, MAX_TOTAL_BYTES };
