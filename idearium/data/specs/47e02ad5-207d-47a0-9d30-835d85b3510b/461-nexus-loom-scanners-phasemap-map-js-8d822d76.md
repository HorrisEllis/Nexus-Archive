---
chunk_uuid: 8d822d76-64d4-4123-b95a-2c32224f1e68
spec_uuid: 47e02ad5-207d-47a0-9d30-835d85b3510b
section: nexus-loom-scanners-phasemap-map-js
title: nexus/loom/scanners/phasemap-map.js
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:47e02ad5:nexus-loom-scanners-phasemap-map-js
contract_id: spec-contract:47e02ad5:nexus-loom-scanners-phasemap-map-js:8d822d76
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-15T20:08:27.922Z
---

'use strict';
/**
 * loom/scanners/phasemap-map.js — the PHASEMAP layer of loom's self-model
 * comp_id: nexus.loom.scanners.phasemap-map
 * UUID: nexus-loom-scanner-phasemap-v1-0000-2026-0808-001
 *
 * James: "consolidate all the phasemaps, split them by system, add it as an
 * entire section in loom."
 *
 * loom already knows what the system IS:
 *   capability-map — what it can do (served routes)
 *   spec-map       — what it's supposed to be (specs)
 * This adds what the system is BECOMING:
 *   phasemap-map   — the roadmap (docs/*phasemap*.spec), split by system.
 *
 * Reads every phasemap spec, extracts each phase (id, title, done/pending,
 * depends_on), and tags it with the SYSTEM it concerns (parsed from the phase
 * body + reuse lines). So "what is cortex becoming / what's left for guardian"
 * is answerable from loom. §8.6 mirrors the spec-map scanner pattern.
 */

const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const DOCS = path.join(ROOT, 'docs');

// Systems phases get tagged to (matched against phase text, case-insensitive).
const SYSTEMS = ['cortex', 'guardian', 'bridge', 'orchestrator', 'loom', 'copilot',
  'clear-glass', 'idearium', 'emerge', 'architect', 'raid', 'intelligence',
  'gemini', 'agent', 'tablet', 'diagnostic', 'chunk', 'replay', 'snapshot'];

const PHASE_RE = /^\s{2,6}([A-Z]{1,3}\d+_[A-Za-z0-9_]*):(.*)$/;   // P1_, AP1_, RR1_, SS0_, LP1_ — the underscore is load-bearing
// §BUGFIX 2026-08-08 — same investigation as the _tagSystem fix above. The
// prior regex (`[A-Za-z0-9_]*` — zero-or-more, no underscore required)
// matched copilot-awareness-routing-phasemap.spec's drift_watch dict (bare
// `CA5:`, `CA6:`, `CA7:` entries describing what KIND of drift to watch for,
// not phases) as if they were pending phases, alongside the REAL
// `CA5_intent_routing` etc. a few lines below — inflating every roadmap
// query with fake pending entries. Checked across all 16 phasemap files
// before tightening: every genuine phase declaration has an underscore
// suffix; the drift dict was the only bare match anywhere in the corpus.

function _phasemapFiles() {
  let out = [];
  try {
    for (const f of fs.readdirSync(DOCS)) {
      if (/phase-?map.*\.spec$/.test(f) || /phase-map\.spec$/.test(f)) out.push(path.join(DOCS, f));
    }
  } catch (_) {}
  return out;
}

function _tagSystem(text) {
  // §BUGFIX 2026-08-08 — found while answering "show me every phase left for
  // co-pilot": 'copilot' never matched because this codebase spells it
  // "co-pilot" everywhere in prose (only the file/namespace form is
  // unhyphenated). CA7_constant_autonomy's own does: line says "co-pilot
  // runs CONSTANTLY" and was silently tagged cortex/raid/intelligence/agent
  // instead — a real, done phase invisible to its own system's roadmap.
  // Strip hyphens from both sides of the match so "co-pilot" and "copilot"
  // (and any other system name someone hyphenates in prose) match the same.
  const low = text.toLowerCase().replace(/-/g, '');
  const hits = SYSTEMS.filter(s => low.includes(s.replace(/-/g, '')));
  return hits.length ? hits : ['general'];
}

/**
 * loadAll() — every phase across every phasemap, tagged + status'd.
 * @returns { phases:[{id,title,map,status,systems,dependsOn}], maps, bySystem }
 */
function loadAll() {
  const phases = [];
  const maps = [];
  for (const file of _phasemapFiles()) {
    const name = path.basename(file, '.spec');
    maps.push(name);
    let lines;
    try { lines = fs.readFileSync(file, 'utf8').split('\n'); } catch (_) { continue; }
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(PHASE_RE);
      if (!m) continue;
      const id = m[1];
      const rest = m[2] || '';
      // status: a "DONE" marker on the phase line or the next few lines.
      const near = [rest, lines[i + 1] || '', lines[i + 2] || ''].join(' ');
      // §FIXED 2026-08-13 — this test was /←\s*DONE|COMPLETE|✓\s*DONE/i:
      // case-INSENSITIVE and unanchored, so the ordinary word "complete" or
      // "completely" appearing anywhere in a phase's first three lines marked
      // that phase DONE. Found the moment three genuinely-pending phases were
      // added whose `why:` quoted the instruction "completely break down and
      // rebuild" — all three reported as shipped. A status parser that reads
      // prose as a completion marker will mark pending work done and nobody
      // will see it (§1.2). Real markers in these files are uppercase and
      // carry a glyph or a comment prefix, so match them case-SENSITIVELY as
      // markers rather than as words.
      const status = /←\s*DONE\b|✓\s*DONE\b|#\s*DONE\b|\bCOMPLETE\b/.test(near) ? 'done'
                   : /IN PROGRESS|STARTED|\bpartial\b/i.test(near) ? 'in-progress'
                   : 'pending';

      // gather the phase's REAL full body for system tagging + depends_on —
      // §BUGFIX 2026-08-23, found while asking "what's next" against a
      // real phasemap whose status: blocks run well past 8 lines (this
      // session's own evidence-heavy documentation style, not unusual
      // prose): a fixed lines.slice(i, i+8) window silently truncated
      // BEFORE reaching a real depends_on: line that existed at line 13,
      // reporting a real, written dependency as if it were absent —
      // "what's next" would have recommended a phase whose own real
      // prerequisite hadn't actually finished. Real fix: scan forward to
      // the ACTUAL next phase header (or end of file), not an arbitrary
      // line count — matches how a person reading the file would find
      // the real boundary. Capped at 60 lines as an honest safety limit
      // (a single phase entry this long is itself worth a real look, not
      // silently unbounded scanning) rather than removed entirely.
      let bodyEnd = i + 1;
      while (bodyEnd < lines.length && bodyEnd < i + 60 && !PHASE_RE.test(lines[bodyEnd])) bodyEnd++;
      const body = lines.slice(i, bodyEnd).join(' ');
      // §FIXED 2026-08-13 — the regex below stops at a newline ([^\]\n]+),
      // which was correct, but `body` above joins with a SPACE, so there were
      // no newlines left to stop at and the match ran on greedily through the
      // rest of the phase body. Measured on the real tree: the longest
      // dependsOn was 566 characters of swallowed `does:`/`reuse:` YAML. The
      // dependency graph this feeds was reading whole paragraphs as dependency
      // names. Match against a newline-preserving join; `body` keeps its
      // space-join because _tagSystem() genuinely wants one flat string.
      const bodyLines = lines.slice(i, bodyEnd).join('\n');
      const dep = (bodyLines.match(/depends_on:\s*\[?([^\]\n]+)/) || [])[1] || '';
      phases.push({
        id, map: name,
        title: id.replace(/_/g, ' '),
        status,
        systems: _tagSystem(body),
        dependsOn: dep.trim().replace(/[\[\]]/g, '') || null,
      });
    }
  }
  // group by system (LP2 — split by system).
  const bySystem = {};
  for (const p of phases) for (const s of p.systems) (bySystem[s] = bySystem[s] || []).push({ id: p.id, map: p.map, status: p.status });
  return { phases, maps, bySystem, total: phases.length };
}

/**
 * forSystem(system) — the roadmap for one system: what's done, what's pending.
 */
function forSystem(system) {
  const all = loadAll();
  const list = all.bySystem[system] || all.bySystem[system.toLowerCase()] || [];
  return {
    system,
    total: list.length,
    done: list.filter(p => p.status === 'done').length,
    pending: list.filter(p => p.status === 'pending').length,
    phases: list,
  };
}

/**
 * summary() — the whole roadmap at a glance (for the loom section UI/API).
 */
function summary() {
  const all = loadAll();
  const done = all.phases.filter(p => p.status === 'done').length;
  const inprog = all.phases.filter(p => p.status === 'in-progress').length;
  return {
    maps: all.maps.length,
    phases: all.total,
    done, inProgress: inprog, pending: all.total - done - inprog,
    systems: Object.keys(all.bySystem).length,
    text: `${all.total} phases across ${all.maps.length} phasemaps, ${Object.keys(all.bySystem).length} systems: ${done} done, ${inprog} in progress, ${all.total - done - inprog} pending.`,
  };
}

/**
 * persistHistory(opts) — R0 (docs/repair-contract-and-loom-hub-phasemap.spec).
 * James: "loom should already have a phasemap system? i want all this
 * logged into loom, maybe using cortex to log the phase maps."
 *
 * loadAll() is a live file scan — real, but stateless: no record of WHEN a
 * phase actually flipped pending->done, nothing queryable about what the
 * phasemap said yesterday. This writes a real, append-only row to cortex's
 * phasemap_history table, but ONLY for phases whose status actually
 * CHANGED since the last recorded snapshot — a diff, not a re-dump of
 * everything on every call, same discipline gap-field's dedup already
 * established (reused, not reinvented, per this phase's own gate).
 *
 * Each transition row also carries the real git commit that produced it,
 * where one can be found (James: "utilizes the git commit history?") —
 * `git log -1 --format=%H` against the owning .spec file at write time.
 * Best-effort: a phase changed by an uncommitted edit still gets logged,
 * just without a hash (§1.2 — a missing correlation is stated, not hidden
 * behind a fabricated one).
 */
const TABLE = 'phasemap_history';
function _jaa() { try { return require('../../cortex/memory/jaa-db').jaaDB; } catch (_) { return null; } }
function _gitHashFor(specFile) {
  try {
    const { execFileSync } = require('child_process');
    const full = path.join(DOCS, specFile + '.spec');
    const out = execFileSync('git', ['log', '-1', '--format=%H', '--', full], { cwd: ROOT, encoding: 'utf8', timeout: 3000 });
    return out.trim() || null;
  } catch (_) { return null; }
}

function persistHistory(opts = {}) {
  const jaa = opts.jaa || _jaa();
  if (!jaa) return { ok: false, reason: 'cortex unavailable' };

  const current = loadAll();
  const currentByKey = new Map(current.phases.map(p => [`${p.map}::${p.id}`, p]));

  let lastByKey = new Map();
  try {
    const rows = jaa.query(TABLE, () => true, 100000) || [];
    // most recent row per (map,phaseId) — the last known status before this scan
    const sorted = rows.slice().sort((a, b) => (a.recordedAt || 0) - (b.recordedAt || 0));
    for (const r of sorted) lastByKey.set(`${r.map}::${r.phaseId}`, r.status);
  } catch (_) { /* first run — nothing to diff against, every phase is a new record */ }

  let written = 0;
  for (const [key, p] of currentByKey) {
    const priorStatus = lastByKey.get(key);
    if (priorStatus === p.status) continue;   // no change — nothing to log
    try {
      // §BUGFIX 2026-08-12 — `id` was the row's field name for the phase's
      // own identifier, but jaaDB's store treats `id` as ITS OWN reserved
      // primary key (seen elsewhere tonight: a settings row's `id` becomes
      // its own dedup key). Many phasemaps reuse generic phase-ids like
      // P5/P6 across DIFFERENT files (raid-warp-verification-phasemap and
      // raid-verification-spine-phasemap both have a P6) — every insert
      // was silently colliding on bare `id` and overwriting a DIFFERENT
      // phase's row, regardless of `map`. Found live: two real phases kept
      // re-appearing as "changed" on every call because their writes never
      // actually landed. Renamed to `phaseId`, verified fixed below before
      // this shipped, not assumed fixed from reading the diff.
      jaa.insert(TABLE, {
        map: p.map, phaseId: p.id, title: p.title,
        status: p.status, priorStatus: priorStatus || null,
        systems: p.systems, dependsOn: p.dependsOn || null,
        commitHash: _gitHashFor(p.map),
        recordedAt: Date.now(),
      });
      written++;
    } catch (_) { /* §1.2 — one bad row must not stop the rest of the diff */ }
  }
  return { ok: true, checked: currentByKey.size, changed: written };
}

/** historyFor(map, id, opts) — every recorded transition for one phase, oldest first. */
function historyFor(map, id, opts = {}) {
  const jaa = opts.jaa || _jaa();
  if (!jaa) return [];
  try {
    return (jaa.query(TABLE, r => r.map === map && r.phaseId === id, 1000) || [])
      .sort((a, b) => (a.recordedAt || 0) - (b.recordedAt || 0));
  } catch (_) { return []; }
}

module.exports = { loadAll, forSystem, summary, persistHistory, historyFor, TABLE, MODULE_ID: 'loom-phasemap-map', VERSION: '1.0.0' };