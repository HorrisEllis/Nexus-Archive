'use strict';
/**
 * lib/repo-context.js -- dispatch-time retrieval for a compartment agent.
 * UUID: nexus-lib-repo-context-v1-0000-2026-0921-jamesbrooks-001
 *
 * This exists for small models (0.6B-3B on James's 4 GB GPU). A small model is weakest at planning a
 * multi-step lookup, so the agent is not asked to. Before the prompt is sent, this reads the repo's OWN
 * chunk index, picks the few chunks that match the question, and puts their real text in the prompt with
 * a hard character budget. Scoping to the agent's repo is by construction: it only ever reads the repoDir
 * it is handed.
 *
 * Deterministic, no model, no network. Ranking is keyword/symbol/path scoring, not semantic: it finds
 * what the question NAMES. It will miss a question that names nothing in the code, and says so by
 * returning no chunks, never by inventing some. Stale runtime proof is labelled stale.
 */

const fs = require('fs');
const path = require('path');

const DEFAULTS = Object.freeze({
  maxChunks: parseInt(process.env.REPO_CONTEXT_MAX_CHUNKS || '4', 10),
  maxChars: parseInt(process.env.REPO_CONTEXT_MAX_CHARS || '3000', 10),      // ~750 tokens: fits a 1-3B model's window with room to answer
  maxCharsPerChunk: parseInt(process.env.REPO_CONTEXT_MAX_CHARS_PER_CHUNK || '1200', 10),
});
const STOP = new Set(('the and for are but not you all can had her was one our out has have how why what when where which this that with from into '
  + 'does did use using make made need want please show tell about them then than there here will would could should just like get got set').split(/\s+/));
const TEST_RE = /(?:(?:^|\/)(?:tests?|__tests__)\/)|(?:\.(?:test|spec)\.[cm]?[jt]sx?$)/i;

const readJson = (p, fb = null) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (_) { return fb; } };

function tokens(message) {
  const out = new Set();
  for (const m of String(message || '').matchAll(/[A-Za-z_][A-Za-z0-9_]{2,}/g)) {
    const w = m[0]; const lw = w.toLowerCase();
    if (!STOP.has(lw)) out.add(lw);
    // fooBarBaz / foo_bar -> foo, bar, baz, so "the poll handler" finds pollHandler
    for (const part of w.replace(/([a-z0-9])([A-Z])/g, '$1 $2').split(/[\s_]+/)) { const p = part.toLowerCase(); if (p.length > 2 && !STOP.has(p)) out.add(p); }
  }
  return [...out];
}

function score(chunk, text, toks, wantsTests) {
  let s = 0; const file = (chunk.file || '').toLowerCase(); const base = path.basename(file);
  const syms = (chunk.symbols || []).map(x => String(x.name || x).toLowerCase());
  const body = text.toLowerCase();
  for (const t of toks) {
    if (syms.includes(t)) s += 6; else if (syms.some(x => x.includes(t))) s += 3;
    if (base.includes(t)) s += 3; else if (file.includes(t)) s += 2;
    let n = 0, i = -1; while (n < 3 && (i = body.indexOf(t, i + 1)) !== -1) n++;
    s += n;
  }
  if (TEST_RE.test(file)) {
    // tests are context, but rarely THE answer unless the question asks about tests, and then they must lead
    if (!wantsTests) s *= 0.7; else if (s > 0) s = s * 1.5 + 12;
  }
  return s;
}

/**
 * retrieve({ repoDir, message, maxChunks, maxChars, maxCharsPerChunk })
 * -> { chunks:[{id,file,range,symbols,proof,score,text}], block:string, chars, dropped, reason? }
 */
function retrieve({ repoDir, message, maxChunks = DEFAULTS.maxChunks, maxChars = DEFAULTS.maxChars, maxCharsPerChunk = DEFAULTS.maxCharsPerChunk } = {}) {
  const none = (reason) => ({ chunks: [], block: '', chars: 0, dropped: 0, reason });
  if (!repoDir || !fs.existsSync(repoDir)) return none('no repo directory');
  const index = readJson(path.join(repoDir, 'chunks', 'index.json'), null);
  if (!Array.isArray(index) || !index.length) return none('repo has no chunk index yet');
  const toks = tokens(message);
  if (!toks.length) return none('the question names nothing searchable');
  const wantsTests = /\btests?\b|\bspec\b|\bcoverage\b/i.test(message);

  const proof = readJson(path.join(repoDir, 'proof.json'), null);
  const proofBy = new Map(((proof && proof.chunks) || []).map(c => [c.chunkId, c]));
  const fileCache = new Map();
  const linesOf = (rel) => {
    if (fileCache.has(rel)) return fileCache.get(rel);
    let lines = null;
    try { const abs = path.resolve(repoDir, rel); if (abs.startsWith(path.resolve(repoDir) + path.sep) && fs.statSync(abs).size < 1e6) lines = fs.readFileSync(abs, 'utf8').split('\n'); } catch (_) { lines = null; }
    fileCache.set(rel, lines); return lines;
  };

  const scored = [];
  for (const c of index) {
    const lines = linesOf(c.file); if (!lines || !c.range) continue;
    const text = lines.slice(Math.max(0, c.range.start_line - 1), c.range.end_line).join('\n');
    const s = score(c, text, toks, wantsTests);
    if (s > 0) scored.push({ c, text, s });
  }
  scored.sort((a, b) => b.s - a.s || (a.c.file < b.c.file ? -1 : 1) || a.c.range.start_line - b.c.range.start_line);
  if (!scored.length) return none('no chunk matches what the question names');

  const picked = []; let used = 0; let dropped = 0;
  for (const { c, text, s } of scored) {
    if (picked.length >= maxChunks) { dropped++; continue; }
    let body = text.length > maxCharsPerChunk ? text.slice(0, maxCharsPerChunk) + '\n// ... (chunk cut for size)' : text;
    if (used + body.length > maxChars) { dropped++; continue; }
    const p = proofBy.get(c.id);
    const label = !p ? 'none recorded' : (p.hashAtRun !== ((c.hash && c.hash.content) || null) ? 'stale' : p.proof);
    picked.push({ id: c.id, file: c.file, range: c.range, symbols: (c.symbols || []).map(x => x.name || x), proof: label, score: Math.round(s * 10) / 10, text: body });
    used += body.length;
  }
  const block = picked.length ? [
    '## Code from this project that matches your question',
    '(Retrieved for you from this project\'s own index. Rely on it; do not guess at what is in these files.)',
    '',
    ...picked.map(p => `[${p.file}:${p.range.start_line}-${p.range.end_line}${p.symbols.length ? ' · ' + p.symbols.join(', ') : ''} · runtime proof: ${p.proof}]\n\`\`\`\n${p.text}\n\`\`\``),
  ].join('\n') : '';
  return { chunks: picked, block, chars: block.length, dropped };
}

module.exports = { retrieve, tokens, DEFAULTS };
