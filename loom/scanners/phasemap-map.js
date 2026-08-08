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

const PHASE_RE = /^\s{2,6}([A-Z]{1,3}\d+[A-Za-z0-9_]*):(.*)$/;   // P1_, AP1_, RR1_, SS0_, LP1_

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
  const low = text.toLowerCase();
  const hits = SYSTEMS.filter(s => low.includes(s));
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
      const status = /←\s*DONE|COMPLETE|✓\s*DONE/i.test(near) ? 'done'
                   : /IN PROGRESS|STARTED|partial/i.test(near) ? 'in-progress'
                   : 'pending';
      // gather a few lines of the phase body for system tagging.
      const body = lines.slice(i, i + 8).join(' ');
      const dep = (body.match(/depends_on:\s*\[?([^\]\n]+)/) || [])[1] || '';
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

module.exports = { loadAll, forSystem, summary, MODULE_ID: 'loom-phasemap-map', VERSION: '1.0.0' };
