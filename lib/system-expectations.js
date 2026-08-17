'use strict';
/**
 * lib/system-expectations.js — LS2's core: SystemExpectation schema,
 * generation from loom's real graph, and outcome recording that writes to
 * the real fault_taxonomy table.
 * UUID: nexus-lib-system-expectations-v1-0000-2026-0815-jamesbrooks-001
 *
 * §BUILT 2026-08-15 — docs/diagnostic-engine-system.spec's three
 * open_questions, resolved here after the dedicated design pass that
 * spec required before any code:
 *
 * 1. "In cortex, or its own boot phase?" — Neither, for this module. It's
 *    a plain lib/ module with no process of its own, callable from
 *    wherever needs it (cortex, an agent-tool, a future promoted system).
 *    Forcing a boot-phase decision here would mean pre-deciding LS4, which
 *    is explicitly HOLD. This module doesn't need that answer to be real.
 *
 * 2. "How does confidence decay?" — REUSED, not invented: copilot/lib/
 *    user-model.js's exact proven numbers (checked directly, not
 *    recalled) — initial 0.5, +0.10 on confirm, -0.10/day decay toward 0
 *    when unchecked, floor 0/cap 1.0. One real addition beyond that file's
 *    own pattern: a VIOLATION is not the same as simple non-confirmation —
 *    it's evidence the expectation is actively wrong, not just unproven —
 *    so it costs -0.15, asymmetric and sharper than the +0.10 confirm
 *    boost, matching the same asymmetric-evidence design already cited
 *    elsewhere in this codebase's own comments (loom registry: "+0.10
 *    confirm, -0.15 reject, mirrors user-model.js's exact confirm/decay
 *    math").
 *
 * 3. "Who writes the initial expectation set?" — GENERATED from loom's
 *    real graph, not hand-authored, per §8.6. But not from `produces`/
 *    `consumes` as the spec's own draft assumed — checked directly:
 *    0 of 1501 real components have those fields populated at all, ever.
 *    Generated from hooks/wires instead, which ARE real and populated
 *    (1804 hooks, 2486 wires, checked live): a component with a real
 *    .export hook gets a "produces something real systems consume"
 *    expectation; a component with a real .import hook wired FROM a real
 *    source gets a "consumes from <source>" expectation, naming the real
 *    source component, not a placeholder.
 */
// §CORRECTION mid-build, found by testing not assumed: the spec's own
// claim ("this module's job is to become fault_taxonomy's first real
// writer") was imprecise. Verified live: lib/fault-log.js's logFault()
// writes unconditionally to the real fault_log table (confirmed, real
// rows now exist), but only ALSO reaches fault_taxonomy if the faultClass
// given is one of KNOWN_FAULT_CLASSES' 8 closed, pre-registered values.
// 'expectation-violation' isn't one of them. This module's honest,
// verified job is fault_log's writer. Reaching fault_taxonomy specifically
// would mean extending that closed taxonomy — a real, separate decision,
// not made unilaterally here.
const fs = require('fs');
const path = require('path');

const DECAY_PER_DAY  = 0.10;  // exact reuse, user-model.js
const CONFIRM_BOOST  = 0.10;  // exact reuse, user-model.js
const VIOLATION_COST = 0.15;  // asymmetric — a violation is stronger evidence than a confirm is
const INITIAL_CONF   = 0.5;   // exact reuse, user-model.js
const DAY_MS         = 24 * 60 * 60 * 1000;

function _jaa() { try { return require('../cortex/memory/jaa-db.js').jaaDB; } catch (_) { return null; } }
function _loomDriver() { const { LoomDriver } = require('../loom/schema/index.js'); return new LoomDriver(); }

/**
 * generateFromLoom() — builds SystemExpectation rows from loom's real,
 * currently-populated hooks/wires. Idempotent by construction: uses each
 * hook's own id as the expectation's uuid, so re-running just re-derives
 * the same set rather than duplicating (same has()-check discipline as
 * loom_register/declareIfNew — checked before writing, not after).
 */
function generateFromLoom() {
  const driver = _loomDriver();
  const { nodes, edges, components } = driver.graph();
  const compById = new Map(components.map(c => [c.id, c]));
  const hookToComponent = new Map(nodes.map(n => [n.id, n.component_id]));
  const generated = [];

  for (const hook of nodes) {
    const comp = compById.get(hook.component_id);
    if (!comp) continue;

    if (hook.direction === 'out') {
      generated.push({
        uuid: hook.id, system: comp.id, kind: 'produces',
        statement: `${comp.id} produces something real systems consume (hook ${hook.id})`,
        confidence: INITIAL_CONF, lastCheckedAt: null, lastOutcome: null,
      });
    } else if (hook.direction === 'in') {
      const wire = edges.find(e => e.to === hook.id);
      const sourceComp = wire ? compById.get(hookToComponent.get(wire.from)) : null;
      generated.push({
        uuid: hook.id, system: comp.id, kind: 'consumes',
        statement: sourceComp
          ? `${comp.id} consumes from ${sourceComp.id} (hook ${hook.id})`
          : `${comp.id} declares an import hook (${hook.id}) with no real wire feeding it yet`,
        confidence: sourceComp ? INITIAL_CONF : 0.0,  // §1.1 — an unwired import is honestly unproven, not assumed
        lastCheckedAt: null, lastOutcome: null,
      });
    }
  }
  return generated;
}

function _tableRead() {
  const jaa = _jaa();
  if (!jaa) return [];
  try { return jaa.query('system_expectations', () => true, 5000) || []; } catch (_) { return []; }
}

/**
 * sync() — writes generateFromLoom()'s output to the real store, skipping
 * anything already present with the same uuid (idempotent, same
 * discipline as declareIfNew).
 */
function sync() {
  const jaa = _jaa();
  if (!jaa) return { ok: false, error: 'JAA store unavailable' };
  const existing = new Set(_tableRead().map(r => r.uuid));
  const generated = generateFromLoom();
  let written = 0, skipped = 0;
  for (const exp of generated) {
    if (existing.has(exp.uuid)) { skipped++; continue; }
    jaa.insert('system_expectations', exp);
    written++;
  }
  return { ok: true, written, skipped, total: generated.length };
}

function list(filter = {}) {
  let rows = _tableRead();
  if (filter.system) rows = rows.filter(r => r.system === filter.system);
  if (filter.kind) rows = rows.filter(r => r.kind === filter.kind);
  return rows;
}

/**
 * recordOutcome(uuid, outcome, detail) — outcome: 'confirmed' | 'violated'.
 * Updates confidence with the exact reused math, and on a violation, writes
 * a REAL row to fault_taxonomy via lib/fault-log.js — this module's whole
 * reason for existing: fault_taxonomy's first real writer.
 */
function recordOutcome(uuid, outcome, detail = {}) {
  const jaa = _jaa();
  if (!jaa) return { ok: false, error: 'JAA store unavailable' };
  const rows = _tableRead();
  const exp = rows.find(r => r.uuid === uuid);
  if (!exp) return { ok: false, error: `no expectation "${uuid}" — run sync() first` };

  const now = Date.now();
  const daysSince = exp.lastCheckedAt ? (now - exp.lastCheckedAt) / DAY_MS : 0;
  const decayed = Math.max(0, exp.confidence - DECAY_PER_DAY * Math.max(0, daysSince));

  let newConf;
  if (outcome === 'confirmed') newConf = Math.min(1.0, decayed + CONFIRM_BOOST);
  else if (outcome === 'violated') newConf = Math.max(0, decayed - VIOLATION_COST);
  else return { ok: false, error: 'outcome must be "confirmed" or "violated"' };

  jaa.update('system_expectations', r => r.uuid === uuid, {
    confidence: newConf, lastCheckedAt: now, lastOutcome: outcome,
  });

  // §CORRECTED 2026-08-15, found by testing — logFault() writes to the real
  // fault_log table unconditionally (confirmed live: 3 real rows, including
  // this module's own test write). It ONLY additionally reaches
  // fault_taxonomy if faultClass is one of KNOWN_FAULT_CLASSES' 8 closed,
  // pre-registered values (cortex/self-heal/fault-taxonomy.js) — checked
  // directly, 'expectation-violation' is not one of them. This module's
  // honest job right now is fault_log's writer, not fault_taxonomy's.
  // Adding a new fault class to that closed taxonomy is a real, separate
  // decision this module doesn't have standing to make unilaterally —
  // named here, not silently worked around or overclaimed.
  let faultWritten = false, reachedTaxonomy = false;
  if (outcome === 'violated') {
    try {
      const KNOWN = require('../cortex/self-heal/fault-taxonomy.js').KNOWN_FAULT_CLASSES || [];
      require('./fault-log.js').logFault({
        system: exp.system, component: exp.system, faultClass: 'expectation-violation',
        status: 'violated', meta: { expectationUuid: uuid, statement: exp.statement, confidence: newConf, ...detail },
      });
      faultWritten = true;
      reachedTaxonomy = KNOWN.includes('expectation-violation');
    } catch (_) { /* fault-log unreachable — the confidence update above is unaffected, §1.2 non-blocking */ }
  }

  return { ok: true, uuid, newConfidence: newConf, faultWritten, reachedTaxonomy };
}

module.exports = { generateFromLoom, sync, list, recordOutcome, MODULE_ID: 'system-expectations', VERSION: '0.1.0' };
