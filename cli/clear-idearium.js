#!/usr/bin/env node
'use strict';
/**
 * cli/clear-idearium.js — clear idearium's idea / spec-library / repo state.
 * UUID: nexus-clear-idearium-v1-0000-2026-0920-jamesbrooks-001
 * Version: 0.1.0
 *
 * §BUILT 2026-09-20 — James: "none of the repos in idearium right now are
 * real. clear them... empty ideas, spec library, and repos."
 *
 * Confirmed by reading the real store before writing this, not assumed:
 * every one of the 18 rows in idearium_ideas and all 34 .repository node
 * files are test fixtures that leaked into the live store — the same
 * pollution class already found and fixed once for bl7-* rows in
 * component_ledger/event_log (0.39.121). Real names found on disk:
 * mco6-auto-<ts>, promote-test-<ts>, mco2-test-repo, repo-graph-test,
 * test-repo-uuid, syn-{a..j}.js, and 16 bare nexus-id-repo-<8hex> nodes
 * with no matching row in idearium_repos at all.
 *
 * §SCOPE — exactly three surfaces, nothing else:
 *   1. The five idearium_* JAA tables in cortex's shared store.
 *   2. idearium/data/nodes/{repository,chunk}/  — the repo + chunk node files.
 *   3. idearium/data/{projects,specs}/          — materialised project trees.
 *
 * §DELIBERATELY NOT TOUCHED. idearium/data/nodes/{capability,command,
 * component,system}/ and idearium/data/node-index/ are the system's own
 * registry, not ideas or repos — 127 real node files that have nothing to
 * do with this. idearium/data/ledger/ holds component_ledger, checked
 * directly for repo-ingest/nexus-id-repo references: zero matches, so it
 * carries none of this pollution and is left alone.
 *
 * §DELETE ORDER, and why it is not cosmetic. Pass 1 goes through the live
 * jaaDB singleton's own delete(), which has the _pendingDeletes mechanism
 * (guardian/jaa-store.js §MULTI-PROCESS FIX 2026-07-18) built for exactly
 * the "don't let a scheduled flush resurrect a row this process just
 * deleted" race. Pass 2 then rewrites the files directly as the real
 * safety net for rows left by an already-exited process, which has no live
 * memory to race against. Editing the file first — the 0.39.121 bug — lets
 * a debounced 1500ms flush merge the rows straight back ~1.5s later.
 *
 * §NOT SISO. Event/Gate/Stream is the right shape for a transformation
 * pipeline; this is a bounded, one-shot delete over a fixed path list with
 * no branching and no derived state. Wrapping nine unlink loops in gates
 * would be ceremony, not architecture, and would hide the one thing that
 * actually matters here: the delete order above.
 *
 * Usage:
 *   node cli/clear-idearium.js            # dry-run report (default)
 *   node cli/clear-idearium.js --apply    # actually clear
 *   node cli/clear-idearium.js --json     # machine-readable report
 *
 * Dry-run by default, same §1.2 discipline as cli/compact.js, cli/dedup.js
 * and cli/purge-pollution.js — a delete this wide should never be one
 * argv-less invocation away from running.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// ── Surfaces ──────────────────────────────────────────────────────────────────
// Every path below was confirmed to exist on disk before being listed here.
const TABLES = [
  'idearium_ideas',
  'idearium_repos',
  'idearium_spec_manifests',
  'idearium_spec_chunks',
  'idearium_spec_chunk_events',
];

const TABLE_DIR = path.join(ROOT, 'data', 'cortex', 'memory');

const NODE_DIRS = [
  path.join(ROOT, 'idearium', 'data', 'nodes', 'repository'),
  path.join(ROOT, 'idearium', 'data', 'nodes', 'chunk'),
];

const TREE_DIRS = [
  path.join(ROOT, 'idearium', 'data', 'projects'),
  path.join(ROOT, 'idearium', 'data', 'specs'),
];

const APPLY = process.argv.includes('--apply');
const JSON_OUT = process.argv.includes('--json');

// ── Inventory ─────────────────────────────────────────────────────────────────
function readTable(name) {
  const p = path.join(TABLE_DIR, `${name}.json`);
  if (!fs.existsSync(p)) return { path: p, exists: false, rows: 0 };
  let rows = 0;
  try {
    const parsed = JSON.parse(fs.readFileSync(p, 'utf8'));
    rows = Array.isArray(parsed) ? parsed.length
         : Array.isArray(parsed?.rows) ? parsed.rows.length
         : 0;
  } catch (e) {
    return { path: p, exists: true, rows: 0, unreadable: e.message };
  }
  return { path: p, exists: true, rows };
}

function listDir(dir) {
  if (!fs.existsSync(dir)) return { path: dir, exists: false, files: [] };
  const files = fs.readdirSync(dir).filter(f => {
    try { return fs.statSync(path.join(dir, f)).isFile(); } catch { return false; }
  });
  return { path: dir, exists: true, files };
}

function listTree(dir) {
  if (!fs.existsSync(dir)) return { path: dir, exists: false, entries: [] };
  return { path: dir, exists: true, entries: fs.readdirSync(dir) };
}

function inventory() {
  return {
    tables:   TABLES.map(readTable).map((t, i) => ({ name: TABLES[i], ...t })),
    nodeDirs: NODE_DIRS.map(listDir),
    treeDirs: TREE_DIRS.map(listTree),
  };
}

// ── Pass 1 — the live jaaDB singleton ─────────────────────────────────────────
// Deleting through jaaDB first is what stops a scheduled flush from writing
// the rows back after pass 2 truncates the file. If jaaDB is genuinely
// unavailable in this process there is no in-memory copy to race against,
// so pass 2 alone is correct — reported honestly either way, never silently.
function purgeViaJaa(report) {
  let jaaDB;
  try {
    ({ jaaDB } = require(path.join(ROOT, 'cortex', 'memory', 'jaa-db.js')));
  } catch (e) {
    report.jaa = { available: false, reason: e.message };
    return;
  }
  report.jaa = { available: true, deleted: {} };
  for (const t of TABLES) {
    try {
      jaaDB.delete(t, () => true);
      report.jaa.deleted[t] = 'ok';
    } catch (e) {
      report.jaa.deleted[t] = `failed: ${e.message}`;
    }
  }
}

// ── Pass 2 — the on-disk files ────────────────────────────────────────────────
function truncateTables(report) {
  report.tables = {};
  for (const t of TABLES) {
    const p = path.join(TABLE_DIR, `${t}.json`);
    if (!fs.existsSync(p)) { report.tables[t] = 'absent'; continue; }
    try {
      fs.writeFileSync(p, '[]\n', 'utf8');
      report.tables[t] = 'emptied';
    } catch (e) {
      report.tables[t] = `failed: ${e.message}`;
    }
  }
}

function clearNodeDirs(report) {
  report.nodes = {};
  for (const dir of NODE_DIRS) {
    const key = path.relative(ROOT, dir);
    if (!fs.existsSync(dir)) { report.nodes[key] = 'absent'; continue; }
    let removed = 0; const failed = [];
    for (const f of fs.readdirSync(dir)) {
      const fp = path.join(dir, f);
      try {
        if (fs.statSync(fp).isFile()) { fs.unlinkSync(fp); removed++; }
        else { fs.rmSync(fp, { recursive: true, force: true }); removed++; }
      } catch (e) { failed.push(`${f}: ${e.message}`); }
    }
    report.nodes[key] = { removed, failed };
  }
}

function clearTreeDirs(report) {
  report.trees = {};
  for (const dir of TREE_DIRS) {
    const key = path.relative(ROOT, dir);
    if (!fs.existsSync(dir)) { report.trees[key] = 'absent'; continue; }
    let removed = 0; const failed = [];
    for (const e of fs.readdirSync(dir)) {
      try { fs.rmSync(path.join(dir, e), { recursive: true, force: true }); removed++; }
      catch (err) { failed.push(`${e}: ${err.message}`); }
    }
    // The directory itself stays — idearium's own writers expect it to exist
    // and do not all mkdir -p before writing into it.
    report.trees[key] = { removed, failed };
  }
}

// ── Report ────────────────────────────────────────────────────────────────────
function printInventory(inv) {
  console.log('\nidearium clear — inventory\n');
  console.log('  JAA tables (data/cortex/memory/)');
  for (const t of inv.tables) {
    const state = !t.exists ? 'absent'
                : t.unreadable ? `UNREADABLE — ${t.unreadable}`
                : `${t.rows} row${t.rows === 1 ? '' : 's'}`;
    console.log(`    ${t.name.padEnd(28)} ${state}`);
  }
  console.log('\n  Node files');
  for (const d of inv.nodeDirs) {
    const rel = path.relative(ROOT, d.path);
    console.log(`    ${rel.padEnd(40)} ${d.exists ? `${d.files.length} file(s)` : 'absent'}`);
  }
  console.log('\n  Materialised trees');
  for (const d of inv.treeDirs) {
    const rel = path.relative(ROOT, d.path);
    console.log(`    ${rel.padEnd(40)} ${d.exists ? `${d.entries.length} entr(y|ies)` : 'absent'}`);
  }
}

function main() {
  const before = inventory();

  if (JSON_OUT && !APPLY) { console.log(JSON.stringify({ mode: 'dry-run', before }, null, 2)); return; }

  if (!APPLY) {
    printInventory(before);
    const totalRows  = before.tables.reduce((n, t) => n + t.rows, 0);
    const totalNodes = before.nodeDirs.reduce((n, d) => n + d.files.length, 0);
    const totalTrees = before.treeDirs.reduce((n, d) => n + d.entries.length, 0);
    console.log(`\n  DRY RUN — nothing removed.`);
    console.log(`  Would clear ${totalRows} table row(s), ${totalNodes} node file(s), ${totalTrees} tree entr(y|ies).`);
    console.log(`  Re-run with --apply to actually clear.\n`);
    return;
  }

  printInventory(before);
  console.log('\n  APPLYING…\n');

  const report = { mode: 'apply', before };
  purgeViaJaa(report);   // pass 1 — live memory first, so pass 2 cannot be undone
  truncateTables(report);
  clearNodeDirs(report);
  clearTreeDirs(report);

  // Verify against the real store rather than trusting the writes.
  report.after = inventory();

  if (JSON_OUT) { console.log(JSON.stringify(report, null, 2)); return; }

  console.log('  jaaDB pass:', report.jaa.available
    ? Object.entries(report.jaa.deleted).map(([k, v]) => `${k}=${v}`).join(', ')
    : `unavailable (${report.jaa.reason}) — file pass still applied`);
  console.log('  tables:', Object.entries(report.tables).map(([k, v]) => `${k}=${v}`).join(', '));
  for (const [k, v] of Object.entries(report.nodes)) {
    console.log(`  ${k}: removed ${v.removed}${v.failed?.length ? `, FAILED ${v.failed.length}` : ''}`);
    (v.failed || []).forEach(f => console.log(`      ! ${f}`));
  }
  for (const [k, v] of Object.entries(report.trees)) {
    console.log(`  ${k}: removed ${v.removed}${v.failed?.length ? `, FAILED ${v.failed.length}` : ''}`);
    (v.failed || []).forEach(f => console.log(`      ! ${f}`));
  }

  const rowsLeft  = report.after.tables.reduce((n, t) => n + t.rows, 0);
  const nodesLeft = report.after.nodeDirs.reduce((n, d) => n + d.files.length, 0);
  const treesLeft = report.after.treeDirs.reduce((n, d) => n + d.entries.length, 0);
  const clean = rowsLeft === 0 && nodesLeft === 0 && treesLeft === 0;

  console.log(`\n  VERIFIED AFTER: ${rowsLeft} row(s), ${nodesLeft} node file(s), ${treesLeft} tree entr(y|ies) remaining.`);
  console.log(clean ? '  Clear.\n' : '  NOT CLEAN — see failures above.\n');
  if (!clean) process.exitCode = 1;
}

main();
