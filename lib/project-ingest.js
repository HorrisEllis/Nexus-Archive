'use strict';
// lib/project-ingest.js — §NEW 2026-09-13
//
// James: "I want nexus to be able to do what you do when I upload a
// project... the work surface is for working on any codebase, system,
// component, any project." This generalizes work-surface-query.cos away
// from loom's own 1841-component registry (NEXUS-specific) to ANY real
// directory — exactly the first real step I take on any uploaded zip
// this whole session: unzip, real file tree, real git log if present,
// then chunk real files on demand rather than reading everything.
//
// §HONEST LIMIT, stated plainly rather than overclaimed — this covers
// the INGEST half of "what you do" (file tree + git history + chunking),
// not the VERIFY half (running tests, checking requires resolve,
// cross-referencing claims against real code) — that's real, separate,
// next work, named as an open block in cos/contracts/project-
// onboarding.cos rather than silently skipped.
//
// §LANGUAGE SCOPE, also stated plainly — lib/component-chunker.js's
// boundary regex is JS/TS-shaped (function/class/const-arrow). This
// ingests and file-trees ANY project regardless of language; it only
// CHUNKS files whose extension matches CHUNKABLE_EXT below. A Python or
// Rust project gets a real file tree and git summary, and its .js/.ts
// files (if any) get real chunks — its .py/.rs files get listed, not
// chunked, until component-chunker.js grows per-language boundaries.
// That is a real, named gap, not a silent one.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
// §CORRECTED 2026-09-15 — originally called this file's own lib/
// component-chunker.js, before the real, shipped lib/work-surface.js
// (MCO20, already wired into Copilot's tools and into project-
// compartment.js's real truncation fix) was found and directly compared
// against it on an external test project. work-surface.js's line-based
// chunking correctly handled a .py file; component-chunker.js's JS-only
// boundary regex would have refused it outright — confirmed live, not
// assumed. Switched to avoid shipping a tool that quietly depends on
// the one already agreed to be discarded.
const { createWorkSurface } = require('./work-surface.js');

const EXCLUDE_DIRS = new Set(['.git', 'node_modules', '.svn', '__pycache__', 'dist', 'build', '.next', 'venv', '.venv']);
// §WIDENED 2026-09-15 — work-surface.js chunks by line count, not
// syntax, so it's genuinely language-agnostic (confirmed live against a
// real .py file). This is no longer "which languages can we parse" — it's
// "which extensions are real text, not binary." Still a real, named
// limit: a text-like extension with genuinely binary content (a corrupt
// file, a misnamed asset) will hit fs.readFileSync's own real utf8
// decode and surface AS a real per-file error in chunkedFiles below
// (never silently skipped, never silently garbled) — that's
// createWorkSurface's own "refuses, not throws" contract carrying
// through, not a new failure mode invented here.
const CHUNKABLE_EXT = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.py', '.rb', '.go', '.rs',
  '.java', '.c', '.cpp', '.h', '.hpp', '.cs', '.php', '.swift', '.kt',
  '.md', '.txt', '.json', '.yaml', '.yml', '.toml', '.sh', '.html', '.css',
]);
const MAX_FILES = 20000; // real cap — a runaway walk on a huge tree fails closed, not silently hangs

/**
 * walkTree(rootDir) — real, recursive file walk. Returns a flat list of
 * { relPath, sizeBytes, ext } for every real file, excluding the real,
 * well-known noise directories above. Throws if rootDir doesn't exist —
 * never silently returns an empty tree for a typo'd path.
 */
function walkTree(rootDir) {
  if (!fs.existsSync(rootDir)) throw new Error(`project-ingest: ${rootDir} does not exist`);
  const files = [];
  const stack = [rootDir];
  while (stack.length) {
    const dir = stack.pop();
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { continue; } // real permission errors: skip that dir, don't crash the whole walk
    for (const entry of entries) {
      if (entry.name.startsWith('.') && entry.name !== '.gitignore') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!EXCLUDE_DIRS.has(entry.name)) stack.push(full);
      } else if (entry.isFile()) {
        if (files.length >= MAX_FILES) throw new Error(`project-ingest: exceeded MAX_FILES (${MAX_FILES}) — this tree is too large to ingest whole; scope to a subdirectory`);
        let sizeBytes = 0;
        try { sizeBytes = fs.statSync(full).size; } catch (e) { /* real race: file deleted mid-walk, skip its size, still list it */ }
        files.push({ relPath: path.relative(rootDir, full), sizeBytes, ext: path.extname(entry.name) });
      }
    }
  }
  return files;
}

/**
 * gitSummary(rootDir) — real `git log` calls, exactly the same commands
 * used by hand throughout this whole session to characterize an upload.
 * Returns { hasGit: false } honestly if rootDir isn't a real git repo —
 * never fabricates commit history for a plain directory.
 */
function gitSummary(rootDir) {
  try {
    execSync('git rev-parse --is-inside-work-tree', { cwd: rootDir, stdio: 'pipe' });
  } catch (e) {
    return { hasGit: false };
  }
  // §BUGFIX, caught before shipping — the original version ran plain
  // `git log` with no path scope, so ingesting a SUBDIRECTORY (e.g.
  // "./cortex/self-heal") silently returned the WHOLE REPO's commit
  // count and date range instead of commits that actually touched that
  // subdirectory. Confirmed by testing: a 4-file subdir reported 894
  // commits and identical first/last dates — obviously wrong. `-- .`
  // scopes every git log call below to rootDir's own real history.
  const gitRoot = execSync('git rev-parse --show-toplevel', { cwd: rootDir }).toString().trim();
  const isScopedSubdir = path.resolve(rootDir) !== path.resolve(gitRoot);
  const pathScope = isScopedSubdir ? '-- .' : '';
  const commitCount = parseInt(execSync(`git rev-list --count HEAD ${pathScope}`, { cwd: rootDir, shell: '/bin/bash' }).toString().trim(), 10) || 0;
  let firstCommitDate = null, lastCommitDate = null;
  if (commitCount > 0) {
    firstCommitDate = execSync(`git log --reverse --format=%ad --date=short -1 ${pathScope}`, { cwd: rootDir, shell: '/bin/bash' }).toString().trim() || null;
    lastCommitDate = execSync(`git log -1 --format=%ad --date=short ${pathScope}`, { cwd: rootDir, shell: '/bin/bash' }).toString().trim() || null;
  }
  const authorCounts = commitCount > 0
    ? execSync(`git log --format=%an ${pathScope}`, { cwd: rootDir, shell: '/bin/bash' }).toString().trim().split('\n')
        .reduce((acc, name) => { acc[name] = (acc[name] || 0) + 1; return acc; }, {})
    : {};
  return {
    hasGit: true, scopedToSubdir: isScopedSubdir, commitCount, firstCommitDate, lastCommitDate,
    authors: Object.entries(authorCounts).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count })),
  };
}

/**
 * ingest(rootDir, opts) — the real, combined entry point. opts.chunk
 * (default true) controls whether chunkable files are actually chunked
 * (real work — proportional to project size) or just listed (fast, for
 * a first-pass inventory before deciding what's worth reading in full).
 */
function ingest(rootDir, opts = {}) {
  const doChunk = opts.chunk !== false;
  const files = walkTree(rootDir);
  const git = gitSummary(rootDir);

  const byExt = {};
  for (const f of files) byExt[f.ext || '(none)'] = (byExt[f.ext || '(none)'] || 0) + 1;

  const chunkable = files.filter(f => CHUNKABLE_EXT.has(f.ext));
  let chunkedFiles = null;
  if (doChunk) {
    chunkedFiles = chunkable.map(f => {
      const abs = path.join(rootDir, f.relPath);
      const result = createWorkSurface(abs, opts.chunkLines ? { chunkLines: opts.chunkLines } : {});
      if (!result.ok) return { relPath: f.relPath, absPath: abs, error: result.reason }; // real per-file failure, never aborts the whole ingest
      // §FIX 2026-09-15 — caught by actually chaining ingest_project's
      // real output into get_work_surface_chunk, not assumed correct:
      // get_work_surface_chunk requires the EXACT same absolute path
      // used at creation (its own real, current-content-hash re-check
      // depends on it). Returning only relPath forced a caller to
      // reconstruct path.join(rootDir, relPath) itself — real friction,
      // and a real place to get subtly wrong (separators, a caller that
      // doesn't retain rootDir). absPath is the exact string to pass to
      // get_work_surface_chunk next, no reconstruction required.
      return { relPath: f.relPath, absPath: abs, uuid: result.uuid, chunkCount: result.chunkCount, lineCount: result.lineCount, totalBytes: result.byteCount };
    });
  }

  return {
    rootDir,
    totalFiles: files.length,
    byExtension: byExt,
    git,
    chunkableFileCount: chunkable.length,
    chunkedFiles, // null if opts.chunk === false — an honest "not requested," not an empty array pretending nothing was chunkable
  };
}

module.exports = { walkTree, gitSummary, ingest, EXCLUDE_DIRS, CHUNKABLE_EXT };
