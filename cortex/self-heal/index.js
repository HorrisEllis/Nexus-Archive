'use strict';
/**
 * cortex/self-heal/index.js — Self-Heal Organ
 * UUID: nexus-cortex-self-heal-v1-0000-2026-0720-001
 * Version: 1.0.0
 *
 * The 5-level escalation ladder from docs/self-heal.spec, subscribing
 * HEAL_REQUESTED (same real event escalation.js already listens to —
 * SISO fan-out: one event, multiple independent gate consumers, exactly
 * like anomaly.detected already has two consumers in liminal-space and
 * escalation).
 *
 * Level selection: docs/escalation.spec's per-level friction deltas
 * (0.10/0.20/0.35/0.50) describe a ladder that escalates across repeated,
 * separate failures over time — not five attempts inside one request. The
 * fault_taxonomy row's own `count` field (Phase 1, cortex/self-heal/fault-taxonomy.js)
 * already tracks exactly that: how many times this fault class has been
 * recorded. Level = min(count, 3); FAILURE_MODE is checked and handled
 * before level selection, as the ladder's actual level 4.
 *
 * §1.1/§1.3 — every level below does a real thing against real data
 * (forge_patches, fix_map, the 12-engine diagnostic pack) or honestly
 * reports it found nothing, never a stub pretending to have acted.
 *
 * Levels (docs/self-heal.spec):
 *   0  Known fix replay — forge_patches (successRate>0.5) + fix_map token match
 *   1  Safe fix — the 8 KNOWN_FAULT_CLASSES patterns (fault-taxonomy.js)
 *   2  Snapshot + Forge — propose-only, writes forge_patches status:'proposed',
 *      never 'verified' (never auto-applied — matches spec exactly)
 *   3  Deep scan — all 12 engines (lib/diag-engines/index.js#runAll, fed via
 *      lib/nexus-expansion-boot.js#buildDiagSnapshot — both already exist,
 *      confirmed fully implemented, just not previously wired here)
 *   4  Failure mode — human action item, no more auto-attempts. Written to
 *      the same `failure_modes` table service/nexus-diagnostic.js already
 *      writes gap status transitions into (§10.1 — one write authority per
 *      table would be violated if this file duplicated that logic instead
 *      of reusing the existing shape).
 *
 * SEMANTIC_GAP_TYPES — gap types this organ must never touch. Inferred, not
 * found defined anywhere else in the codebase (tests/nexus-full-audit.js
 * only checks the constant's *name* exists, not its contents) — reasoned
 * from §7.2 (Ideas Cannot Affect Runtime): a gap that's interpretive/
 * cognitive rather than a mechanical fault belongs to the Idea Ledger, and
 * auto-"healing" it would let a non-authoritative cognition-layer artifact
 * mutate runtime state. Flagged as a judgment call, not a confirmed spec.
 */

const escalation = require('./escalation');
const faultTaxonomy = require('./fault-taxonomy');
const fixMap = require('../memory/fix-map');
const { jaaDB, uid } = require('../memory/jaa-db');

const MODULE_ID = 'cortex/self-heal';
const VERSION = '1.0.0';

const SEMANTIC_GAP_TYPES = Object.freeze([
  'semantic_drift', 'spec_ambiguity', 'idea_unresolved', 'documentation_gap',
]);

let _bus = null;
let _diagEngines = null; // lazy — level 3 only, avoid the cost when never reached

function _getDiagEngines() {
  if (_diagEngines !== null) return _diagEngines;
  try {
    _diagEngines = require('../../lib/diag-engines');
  } catch (e) {
    console.warn(`[${MODULE_ID}] lib/diag-engines not available: ${e.message}`);
    _diagEngines = false;
  }
  return _diagEngines;
}

function _levelFor(gapType) {
  const existing = faultTaxonomy.getFaultClass(gapType);
  if (!existing) return { level: 0, existing: null, band: 'NOMINAL' };
  const band = faultTaxonomy.bandFor(existing.friction);
  return { level: Math.min(existing.count || 0, 3), existing, band };
}

// ── Level 0 — known fix replay ─────────────────────────────────────────────────
function _attemptLevel0(gapType, gapUuid, body) {
  const verified = jaaDB.query('forge_patches',
    r => r.faultClass === gapType && r.status === 'verified' && (r.successRate || 0) > 0.5, 5);
  const tokenMatches = fixMap.lookupFix(body || gapType, 3).filter(m => m.confidence > 0.5);

  const candidate = verified[0]
    ? { source: 'forge_patches', uuid: verified[0].uuid, successRate: verified[0].successRate }
    : tokenMatches[0]
      ? { source: 'fix_map', signature: tokenMatches[0].signature, fix: tokenMatches[0].fix, confidence: tokenMatches[0].confidence }
      : null;

  if (candidate) {
    if (_bus) _bus.emit('cortex.self-heal.fix_staged', { gapType, gapUuid, level: 0, candidate });
    return { level: 0, outcome: 'staged', candidate };
  }
  escalation.recordAttemptOutcome(gapType, 0, false, { gapUuid, reason: 'no known fix found' });
  return { level: 0, outcome: 'no_known_fix' };
}

// ── Level 1 — safe fix, the 8 known patterns ──────────────────────────────────
function _attemptLevel1(gapType, gapUuid, modulePath) {
  if (faultTaxonomy.KNOWN_FAULT_CLASSES.includes(gapType)) {
    if (_bus) _bus.emit('cortex.self-heal.remediation_requested', {
      gapType, gapUuid, level: 1, pattern: gapType, modulePath,
      message: `Safe-fix pattern '${gapType}' requested for ${modulePath || 'unknown module'}`,
    });
    return { level: 1, outcome: 'requested', pattern: gapType };
  }
  escalation.recordAttemptOutcome(gapType, 1, false, { gapUuid, reason: 'not a known safe-fix pattern' });
  return { level: 1, outcome: 'no_safe_pattern' };
}

// ── Level 2 — snapshot + forge, propose-only (never auto-applied) ─────────────
function _attemptLevel2(gapType, gapUuid, body) {
  const proposal = {
    uuid: uid(), faultClass: gapType, status: 'proposed', // never 'verified' from here
    // §CAUSAL WIRE (ported from v44) — the gap that triggered this patch IS its
    // causal parent. gapUuid was captured but never written to causedBy, so the
    // gap → proposed-fix chain wasn't walkable. Now it is (§16.5).
    causedBy: gapUuid || null,
    body: body || null, successRate: 0, ts: Date.now(), proposedBy: MODULE_ID, gapUuid,
  };
  try {
    jaaDB.insert('forge_patches', proposal);
  } catch (e) {
    console.warn(`[${MODULE_ID}] level 2 propose write failed: ${e.message}`);
    escalation.recordAttemptOutcome(gapType, 2, false, { gapUuid, reason: 'propose write failed' });
    return { level: 2, outcome: 'propose_failed' };
  }
  if (_bus) _bus.emit('cortex.self-heal.fix_proposed', { gapType, gapUuid, level: 2, proposal });
  return { level: 2, outcome: 'proposed', proposal };
}

// ── Level 3 — deep scan, all 12 engines ────────────────────────────────────────
function _attemptLevel3(gapType, gapUuid) {
  const diag = _getDiagEngines();
  if (!diag) {
    escalation.recordAttemptOutcome(gapType, 3, false, { gapUuid, reason: 'diag-engines unavailable' });
    return { level: 3, outcome: 'engines_unavailable' };
  }
  let snapshot;
  try {
    const { buildDiagSnapshot } = require('../../lib/nexus-expansion-boot');
    snapshot = buildDiagSnapshot(jaaDB, _bus);
  } catch (e) {
    snapshot = {};
  }
  const result = diag.runAll(snapshot);
  if (result.critical.length) {
    if (_bus) _bus.emit('cortex.self-heal.deep_scan_findings', {
      gapType, gapUuid, level: 3, critical: result.critical, composite: result.composite,
    });
    return { level: 3, outcome: 'findings', critical: result.critical };
  }
  escalation.recordAttemptOutcome(gapType, 3, false, { gapUuid, reason: 'deep scan found nothing critical' });
  return { level: 3, outcome: 'no_findings' };
}

// ── Level 4 — failure mode, human action item ─────────────────────────────────
function _enterFailureMode(gapType, gapUuid, existing) {
  const entry = {
    uuid: uid(), faultClass: gapType, gapUuid, friction: existing?.friction ?? 1.0,
    enteredAt: Date.now(), source: MODULE_ID,
  };
  try { jaaDB.insert('failure_modes', entry); }
  catch (e) { console.warn(`[${MODULE_ID}] failure_modes write failed: ${e.message}`); }
  if (_bus) _bus.emit('cortex.self-heal.failure_mode', {
    gapType, gapUuid, level: 4,
    message: `'${gapType}' has exhausted all auto-attempt levels — human action required (docs/self-heal.spec level 4)`,
  });
  // §RAID-SOURCE 2026-08-29 — James: "hook... self-heal system into
  // raid." Real, honest wire: Level 4 already means "every automated
  // remediation attempt failed, this needs something NEW to happen" —
  // exactly what a RAID contract is for. Submitted alongside the
  // existing failure_modes row and bus event (not instead of — a real
  // human action item still gets recorded even if this contract never
  // gets picked up), giving self-heal a real, second path: let a real
  // agent attempt a fix before escalating purely to a human.
  //
  // No custom checkEndState — reuses contract-intake's real, default
  // seam-verdict check (the same convention BR5's own contracts already
  // use), so an agent working this contract reports SEAM VERDICT: PASS/
  // FAIL the same way any other real contract does, not a self-heal-
  // specific protocol invented here. onFail:'halt' — a self-heal
  // contract that an agent can't resolve is a genuine, real level-4
  // finding, not something to retry or silently reassign to a different
  // agent (that's fallbackAgent's job for lower-stakes contracts; this
  // one already exhausted 4 real automated levels before reaching here).
  try {
    require('../core/raid/contract-intake.js').submitContract({
      content: `A real, automated self-heal remediation attempt has exhausted all 4 levels for a real fault. faultClass="${gapType}", gapUuid="${gapUuid}". Read the relevant real code and this codebase's own real gap/event-ledger data for this fault before proposing anything (bottom-up — do not guess at a fix without reading what actually failed). If you find and make a real, verified fix, report SEAM VERDICT: PASS. If you cannot resolve it, report SEAM VERDICT: FAIL with your real findings — this becomes the actual human action item, not a placeholder.`,
      title: `self-heal level-4: ${gapType}`,
    }, { source: 'self-heal', intention: 'heal', onFail: { action: 'halt' } });
  } catch (e) {
    console.warn(`[${MODULE_ID}] could not submit level-4 fault as a real RAID contract (failure_modes row above is the real record either way): ${e.message}`);
  }
  return { level: 4, outcome: 'failure_mode' };
}

// ── HEAL_REQUESTED handler ──────────────────────────────────────────────────────
function _onHealRequested(event) {
  const { gapType, gapUuid, body, modulePath } = event?.payload || {};
  if (!gapType) return;

  if (SEMANTIC_GAP_TYPES.includes(gapType)) {
    if (_bus) _bus.emit('cortex.self-heal.skipped', { gapType, gapUuid, reason: 'semantic_gap_excluded (§7.2)' });
    return;
  }

  const { level, existing, band } = _levelFor(gapType);

  if (band === 'FAILURE_MODE') {
    _enterFailureMode(gapType, gapUuid, existing);
    return;
  }

  switch (level) {
    case 0: return _attemptLevel0(gapType, gapUuid, body);
    case 1: return _attemptLevel1(gapType, gapUuid, modulePath);
    case 2: return _attemptLevel2(gapType, gapUuid, body);
    default: return _attemptLevel3(gapType, gapUuid);
  }
}

function health() {
  return { ok: true, module: MODULE_ID, version: VERSION, busWired: !!_bus, diagEnginesLoaded: !!_getDiagEngines() };
}

function init(cfg = {}) {
  _bus = cfg.bus || null;
  if (_bus) _bus.on('HEAL_REQUESTED', _onHealRequested);
  console.log(`[${MODULE_ID}] v${VERSION} — 5-level escalation ladder active${_bus ? ' (bus-wired)' : ' (no bus — test mode)'}`);
  return { ok: true };
}

function stop() {
  if (_bus) _bus.off('HEAL_REQUESTED', _onHealRequested);
  _bus = null;
}

module.exports = {
  MODULE_ID, VERSION, SEMANTIC_GAP_TYPES,
  init, stop, health,
  _onHealRequested, // exported for direct testing, §4.1
};
