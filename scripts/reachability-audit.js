#!/usr/bin/env node
'use strict';
/**
 * scripts/reachability-audit.js — what in this tree is actually reachable?
 *
 * Builds the real require()/import graph and BFS's from real entry points, so
 * "is cockpit used" is answered by edges rather than by memory. Skips
 * node_modules, data, .git and _archive by instruction.
 *
 * Honest about its own limits, because a reachability report that overstates
 * its certainty is worse than none:
 *   · dynamic require(variable) cannot be resolved and is COUNTED and reported,
 *     not silently dropped. A folder with dynamic requires is "unknown", not
 *     "orphaned".
 *   · a file reached only by tests is reported separately from one reached by
 *     production code. Tested-but-unwired is a real and different state.
 *   · spawn/fork/exec of a script by path is an edge this does NOT see, so
 *     anything launched as a child process will look orphaned. Those are
 *     listed so they can be checked by hand.
 */
const fs   = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SKIP = new Set(['node_modules', 'data', '.git', '_archive', '.claude']);

// ── Collect ──────────────────────────────────────────────────────────────────
const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(js|mjs|cjs)$/.test(e.name)) files.push(path.relative(ROOT, p));
  }
})(ROOT);

// ── Parse edges ──────────────────────────────────────────────────────────────
const RE_REQ    = /require\(\s*['"]([^'"]+)['"]\s*\)/g;
const RE_IMP    = /(?:^|\s)import\s+(?:[\s\S]*?from\s+)?['"]([^'"]+)['"]/gm;
const RE_DYN    = /require\(\s*(?!['"])/g;
const RE_SPAWN  = /(?:spawn|fork|exec|execFile)\w*\(\s*['"`]([^'"`]+)['"`]/g;

const edges   = new Map();   // file -> Set(file)
const dynamic = new Map();   // file -> count of unresolvable requires
const spawns  = new Map();   // file -> [literal targets]

function resolve(fromFile, spec) {
  if (!spec.startsWith('.')) return null;              // bare = package
  const base = path.resolve(path.dirname(path.join(ROOT, fromFile)), spec);
  const tries = [base, base + '.js', base + '.mjs', base + '.cjs',
                 path.join(base, 'index.js'), path.join(base, 'index.mjs')];
  for (const t of tries) {
    try { if (fs.statSync(t).isFile()) return path.relative(ROOT, t); } catch (_) {}
  }
  return null;
}

for (const f of files) {
  let src = '';
  try { src = fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (_) { continue; }
  const out = new Set();
  for (const re of [RE_REQ, RE_IMP]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(src))) { const r = resolve(f, m[1]); if (r) out.add(r); }
  }
  edges.set(f, out);

  RE_DYN.lastIndex = 0;
  const d = (src.match(RE_DYN) || []).length;
  if (d) dynamic.set(f, d);

  RE_SPAWN.lastIndex = 0;
  const sp = [];
  let s;
  while ((s = RE_SPAWN.exec(src))) if (/\.(js|mjs|cjs)$/.test(s[1])) sp.push(s[1]);
  if (sp.length) spawns.set(f, sp);
}

// ── Entry points ─────────────────────────────────────────────────────────────
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const entries = new Set();
const addEntry = p => { if (p && files.includes(p)) entries.add(p); };

if (pkg.main) addEntry(path.normalize(pkg.main));
for (const cmd of Object.values(pkg.scripts || {})) {
  for (const m of String(cmd).matchAll(/([\w./-]+\.(?:js|mjs|cjs))/g)) addEntry(path.normalize(m[1]));
}
// Root-level runnables and known servers are entry points by nature.
for (const f of files) {
  if (!f.includes('/') ) addEntry(f);                        // any root .js
  if (/^(guardian|orchestrator|copilot|cortex|idearium|bridge|emerge|architect|eravos|clear-glass|ollama|loom|cli|scripts|cockpit)\/.*(server|index|cli|main)\.js$/.test(f)) addEntry(f);
}

const TEST_RE = /^tests?\//;
for (const f of files) if (TEST_RE.test(f)) addEntry(f);      // tests are their own roots

// ── BFS, twice: production-only, then including tests ────────────────────────
function reach(seeds) {
  const seen = new Set();
  const q = [...seeds];
  while (q.length) {
    const f = q.pop();
    if (seen.has(f)) continue;
    seen.add(f);
    for (const n of (edges.get(f) || [])) if (!seen.has(n)) q.push(n);
  }
  return seen;
}
const prodSeeds = [...entries].filter(f => !TEST_RE.test(f));
const prodReach = reach(prodSeeds);
const allReach  = reach([...entries]);

// ── Report ───────────────────────────────────────────────────────────────────
const byDir = new Map();
for (const f of files) {
  if (TEST_RE.test(f)) continue;          // tests are seeds, not subjects
  const d = f.includes('/') ? f.split('/')[0] : '(root)';
  if (!byDir.has(d)) byDir.set(d, { total: 0, prod: 0, testOnly: 0, orphan: 0, dyn: 0, orphans: [] });
  const r = byDir.get(d);
  r.total++;
  if (dynamic.has(f)) r.dyn++;
  if (prodReach.has(f)) r.prod++;
  else if (allReach.has(f)) { r.testOnly++; r.orphans.push(f + '  [test-only]'); }
  else { r.orphan++; r.orphans.push(f); }
}

const rows = [...byDir.entries()].sort((a, b) => (b[1].orphan + b[1].testOnly) - (a[1].orphan + a[1].testOnly));
console.log('DIR                  files   prod  test-only  ORPHAN  dynReq');
console.log('-'.repeat(64));
for (const [d, r] of rows) {
  console.log(`${d.padEnd(20)} ${String(r.total).padStart(5)} ${String(r.prod).padStart(6)} ${String(r.testOnly).padStart(10)} ${String(r.orphan).padStart(7)} ${String(r.dyn).padStart(7)}`);
}
const tot = rows.reduce((a, [, r]) => ({
  total: a.total + r.total, prod: a.prod + r.prod,
  testOnly: a.testOnly + r.testOnly, orphan: a.orphan + r.orphan, dyn: a.dyn + r.dyn,
}), { total: 0, prod: 0, testOnly: 0, orphan: 0, dyn: 0 });
console.log('-'.repeat(64));
console.log(`${'TOTAL'.padEnd(20)} ${String(tot.total).padStart(5)} ${String(tot.prod).padStart(6)} ${String(tot.testOnly).padStart(10)} ${String(tot.orphan).padStart(7)} ${String(tot.dyn).padStart(7)}`);

fs.writeFileSync('/tmp/audit.json', JSON.stringify({
  byDir: Object.fromEntries(rows),
  dynamic: Object.fromEntries(dynamic),
  spawns: Object.fromEntries(spawns),
  entries: [...entries],
}, null, 1));
console.log('\nfull detail -> /tmp/audit.json');
