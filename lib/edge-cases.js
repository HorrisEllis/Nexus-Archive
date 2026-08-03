'use strict';
/**
 * lib/edge-cases.js — OB11 of the observability/tablet phasemap
 * UUID: nexus-edge-cases-v1-0000-2026-0730-001
 *
 * §PHASEMAP OB11 (docs/nexus-observability-tablet-phasemap.spec). Maps EDGE CASES
 * per component/system — the known failure modes, boundary conditions, and "this
 * breaks when X" that diagnostics should recognize. Extends the CA2 tool-guide
 * edge-note pattern (lib/agent-tools/tool-guide.js) from tools to loom components
 * + systems. When a fault hits a KNOWN edge case, OB2 gap-detection diagnoses it
 * BY NAME rather than as an unknown fault. §13.4 — a fault hitting an UNMAPPED
 * edge case is logged as a coverage gap, so the map grows from real failures.
 * §8.6 — same pattern as CA2; editable cortex rows (schema-registry pattern).
 */

const EDGE_TABLE = 'edge_cases';

// Seeded known edge cases per system (grows from real failures). Each: a name,
// the trigger condition, and what it looks like when hit.
const SEED = {
  guardian: [
    { name: 'provider_disconnect', when: 'an AI provider tab drops mid-job', looks: 'job stalls, ncp.isConnected false' },
    { name: 'single_instance_lock', when: 'a second clear-glass instance boots', looks: 'crash-loop on the single-instance lock' },
  ],
  cortex: [
    { name: 'schema_drift_flood', when: 'many writes with an unregistered shape', looks: 'schema_drift rows spike' },
    { name: 'gap_backlog', when: 'gaps filed faster than closed', looks: 'open gap count climbs monotonically' },
  ],
  bridge: [
    { name: 'circuit_open', when: 'a target system fails repeatedly', looks: 'inter-system requests rejected, circuit breaker open' },
  ],
  copilot: [
    { name: 'ollama_offline', when: 'the local model is unreachable', looks: 'lifeline escalates or offers, confidence null' },
    { name: 'low_confidence_loop', when: 'repeated sub-threshold answers', looks: 'repeated lifeline offers on the same prompt' },
  ],
  loom: [
    { name: 'unregistered_component', when: 'a wire references an unregistered component', looks: 'dangling wire, registry consistency error' },
  ],
};

function _jaa() { try { return require('../cortex/memory/jaa-db'); } catch { return null; } }

/**
 * edgeCasesFor(system) — the known edge cases for a system (seed + any recorded).
 */
function edgeCasesFor(system) {
  const seeded = SEED[system] || [];
  let recorded = [];
  try {
    const j = _jaa();
    if (j) recorded = (j.jaaDB.query(EDGE_TABLE, r => r.system === system, 100) || [])
      .map(r => ({ name: r.name, when: r.when, looks: r.looks, source: 'recorded' }));
  } catch { /* seed-only */ }
  return [...seeded.map(e => ({ ...e, source: 'seed' })), ...recorded];
}

/**
 * matchEdgeCase(system, faultSignal) — does a fault match a KNOWN edge case?
 * Returns the matched edge case (diagnosed by name) or null (an unmapped fault →
 * OB2 should log it as a coverage gap, §13.4).
 * @param faultSignal a string describing the fault (type/detail).
 */
function matchEdgeCase(system, faultSignal = '') {
  const f = faultSignal.toLowerCase();
  for (const ec of edgeCasesFor(system)) {
    // match on the edge-case name tokens or its "looks" description.
    const tokens = [ec.name.replace(/_/g, ' '), ec.looks].join(' ').toLowerCase();
    const nameHit = ec.name.split('_').some(t => t.length > 3 && f.includes(t));
    const looksHit = ec.looks && ec.looks.toLowerCase().split(/\W+/).some(w => w.length > 4 && f.includes(w));
    if (nameHit || looksHit) return { ...ec, matched: true };
  }
  return null;
}

/**
 * recordEdgeCase(system, name, when, looks) — add a newly-discovered edge case so
 * the next occurrence is recognized by name (§13.4 coverage grows from failures).
 */
function recordEdgeCase(system, name, when, looks) {
  try {
    const j = _jaa();
    if (!j) return { error: 'cortex unavailable' };
    const row = { uuid: j.uid ? j.uid() : `edge-${Date.now()}`, kind: 'edge_case', system, name, when, looks, ts: Date.now() };
    j.jaaDB.insert(EDGE_TABLE, row);
    return row;
  } catch (e) { return { error: e.message }; }
}

/**
 * coverageGap(system, faultSignal) — for an UNMAPPED fault: the payload OB2 files
 * as a coverage gap so the edge-case map grows (§13.4 drift is data).
 */
function coverageGap(system, faultSignal) {
  return { type: 'edge_case_coverage_gap', system, body: `unmapped fault on ${system}: ${faultSignal}`, severity: 'low', source: 'edge-cases/OB11' };
}

module.exports = { edgeCasesFor, matchEdgeCase, recordEdgeCase, coverageGap, SEED, MODULE_ID: 'edge-cases', VERSION: '1.0.0' };
