'use strict';
/**
 * cortex/core/raid/simulation.js — RAID Pre-Commit Simulation Engine
 * UUID: nexus-raid-simulation-v1-0000-2026-0702-jamesbrooks-001
 * Spec: docs/raid-simulation-engine.spec
 *
 * Sits between _decide() and dispatch. Runs the proposed routing decision
 * through a COS sandbox compartment, scores via delta+sigma, checks
 * enforcement invariants, classifies any faults, recommends action.
 *
 * Never modifies _decide(). Never blocks on inconclusive. Never overrides
 * constitutional law (LAW_I, LAW_III). Per the spec: simulation is
 * advisory within the constitutional space, not a replacement for it.
 */

const crypto = require('crypto');

// ── Lazy-loaded deps (all optional — simulation degrades gracefully) ───────────
let _CosCompartment, _cosLoaded = false;
let _computeSigma, _sigmaLoaded = false;
let _BoundaryIndex, _enforceLoaded = false;

function _loadCOS() {
  if (_cosLoaded) return !!_CosCompartment;
  _cosLoaded = true;
  try {
    const { Compartment, STATE } = require('../../../cos/kernel.js');
    _CosCompartment = Compartment;
    _CosSTATE       = STATE;
    return true;
  } catch(_) { return false; }
}

function _loadSigma() {
  if (_sigmaLoaded) return !!_computeSigma;
  _sigmaLoaded = true;
  try {
    _computeSigma = require('../../../meta/cfr/sigma.js').computeSigma;
    return true;
  } catch(_) { return false; }
}

// CJS wrapper for ESM enforcement module
function _loadEnforcement() {
  if (_enforceLoaded) return !!_BoundaryIndex;
  _enforceLoaded = true;
  try {
    // enforcement/index.js is ESM — use a synchronous inline check instead
    // that reproduces the key invariant checks without the ESM import barrier
    _BoundaryIndex = { check: _inlineInvariantCheck };
    return true;
  } catch(_) { return false; }
}

/** Inline invariant check — reproduces the BoundaryIndex critical invariants
 *  without requiring ESM import of meta/rfr2/enforcement/index.js */
function _inlineInvariantCheck(event) {
  const violations = [];
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  // I-1: event ID must be UUID v4
  if (!UUID_RE.test(event.id || ''))
    violations.push({ id: 'I-1', detail: `non-UUID event id: ${event.id}` });

  // C-1: causedBy events need edgeType
  if (event.causedBy && !event.edgeType)
    violations.push({ id: 'C-1', detail: 'causedBy present but edgeType missing' });

  // T-1: timestamp present and sane
  const now = Date.now();
  if (!event.ts || event.ts > now + 5000 || event.ts < now - 86400000)
    violations.push({ id: 'T-1', detail: `ts out of range: ${event.ts}` });

  // H-1: source must be present
  if (!event.source)
    violations.push({ id: 'H-1', detail: 'event.source missing' });

  return { ok: violations.length === 0, violations };
}

let _CosSTATE;

// ── Minimal ALKKernel stub COS compartment needs ──────────────────────────────
function _makeMinimalKernel() {
  const _events = [];
  return {
    emit: (type, data, meta) => {
      _events.push({ type, data, meta, ts: Date.now() });
    },
    getAll: () => _events,
  };
}

// ── Simulation ─────────────────────────────────────────────────────────────────

/**
 * simulate(decision, context, options) → SimulationResult
 *
 * @param {object} decision  — from _decide(): { agent, cluster, reason }
 * @param {object} context   — live context at decision time:
 *                             { cfrSigmaFloor, cfrField, callShape, conditioning }
 * @param {object} options   — { dry_run: bool, timeout: ms }
 */
async function simulate(decision, context = {}, options = {}) {
  const start  = Date.now();
  const simId  = `sim-${crypto.randomUUID()}`;
  const timeout = options.timeout || 150; // ms — simulation is fast
  _loadSigma();
  _loadEnforcement();

  // ── Step 1: Construct synthetic event ─────────────────────────────────────
  const syntheticEvent = {
    id:        crypto.randomUUID(),
    type:      `raid.dispatch.predicted.${decision.agent}`,
    source:    'raid-simulation',
    causedBy:  context.originEventId || null,
    edgeType:  context.originEventId ? 'causal' : null,
    ts:        Date.now(),
    payload: {
      agent:       decision.agent,
      cluster:     decision.cluster,
      reason:      decision.reason,
      sigmaFloor:  context.cfrSigmaFloor || 0,
      tightened:   context.tightened || false,
      simId,
    },
  };

  // ── Step 2: COS sandbox (ephemeral compartment) ───────────────────────────
  let compartment = null;
  let cosAvailable = _loadCOS();

  if (cosAvailable && _CosCompartment) {
    try {
      compartment = new _CosCompartment({
        id:       simId,
        name:     `sim:${decision.agent}:${decision.cluster}`,
        axioms:   [
          'LAW_I must hold — local-first ordering preserved',
          'LAW_III must hold — unconditional last resort preserved',
          `sigma_floor:${context.cfrSigmaFloor || 0}`,
        ],
        llmConfig: {},
        kernel:    _makeMinimalKernel(),
        jaaDB:     null,
      });
      // Compartment is born in SANDBOX — never earns bus connections (simulation)
    } catch(e) {
      cosAvailable = false;
      compartment  = null;
    }
  }

  // ── Step 3: Delta scoring (S-field + C-field) ─────────────────────────────
  // CJS-compatible delta: S-field as latency z-score, C-field as depth z-score
  // RFR2 delta is ESM; use inline computation matching its schema
  const historicalRate = context.conditioning?.avgResponseRate || 1.0;
  const currentRate    = context.callShape?.urgency || 1.0;
  const sField = historicalRate > 0
    ? Math.abs(currentRate - historicalRate) / historicalRate
    : 0;
  const causalDepth   = context.callShape?.causalDepth || 1;
  const baselineDepth = context.conditioning?.avgCausalDepth || 1;
  const cField = baselineDepth > 0
    ? Math.abs(causalDepth - baselineDepth) / baselineDepth
    : 0;

  // ── Step 4: Sigma scoring ─────────────────────────────────────────────────
  let sigma = { score: 0, axes: { structural: 0, temporal: 0, contextual: 0 }, deviating: false };
  if (_computeSigma) {
    try {
      const baseline = context.baseline || { mean: 0, stddev: 0.1, count: 1 };
      const cfrState = context.cfrField || {};
      const raw = _computeSigma(syntheticEvent, baseline, cfrState, 0);
      if (raw && typeof raw.score === 'number') sigma = raw;
    } catch(_) {}
  } else {
    // Without sigma module: estimate from S+C fields
    sigma.score = Math.min(1, (sField + cField) / 2);
    sigma.deviating = sigma.score > 0.35;
  }

  // ── Step 5: Enforcement invariant check ───────────────────────────────────
  let enforced  = true;
  let enfViolations = [];
  try {
    const result = _inlineInvariantCheck(syntheticEvent);
    enforced     = result.ok;
    enfViolations = result.violations;
  } catch(_) {}

  // ── Step 6: Axiom check against compartment ───────────────────────────────
  let axiomFault = null;
  if (compartment) {
    try {
      const violation = compartment.checkAxioms(`dispatch to ${decision.agent} for ${decision.cluster}`);
      if (violation) {
        axiomFault = violation;
        enforced   = false;
        enfViolations.push({ id: 'AXIOM_FAULT', detail: `compartment axiom violated: ${violation}` });
      }
    } catch(_) {}
  }

  // ── Step 7: Fault classification ──────────────────────────────────────────
  const faults = classifyFault(sigma, sField, cField, enfViolations, decision, context);

  // ── Step 8: Recommendation ────────────────────────────────────────────────
  const recommendation = _recommend(sigma, faults, enforced, options);

  // ── Recycle compartment (simulation only, never integrates) ───────────────
  if (compartment && _CosSTATE) {
    try { compartment._state = _CosSTATE.RECYCLED; } catch(_) {}
  }

  const simulationMs = Date.now() - start;

  return Object.freeze({
    simId,
    decision,
    prediction:     `${decision.agent} would handle ${decision.cluster}: ${decision.reason}`,
    sigma,
    delta:          { sField: +sField.toFixed(4), cField: +cField.toFixed(4) },
    faults,
    enforced,
    recommendation,
    confidence:     _confidence(sigma, sField, cField, cosAvailable),
    cosUsed:        cosAvailable && compartment !== null,
    simulationMs,
  });
}

/**
 * classifyFault(sigma, sField, cField, enfViolations, decision, context)
 * Maps simulation findings to open-loop-taxonomy fault classes.
 */
function classifyFault(sigma, sField, cField, enfViolations, decision, context) {
  const faults = [];

  // CONSTITUTIONAL — enforcement invariant violations / axiom faults
  if (enfViolations.length > 0) {
    faults.push({
      class:          'CONSTITUTIONAL',
      source:         'enforcement',
      invariants:     enfViolations.map(v => v.id),
      sigma:          sigma.score,
      agent:          decision.agent,
      recommendation: 'reject',
    });
  }

  // INTEGRITY — sigma above halt threshold
  if (sigma.score >= 0.7) {
    faults.push({
      class:          'INTEGRITY',
      source:         'sigma',
      sigma:          sigma.score,
      agent:          decision.agent,
      recommendation: sigma.score >= 0.9 ? 'escalate' : 'fallback',
    });
  }

  // CAPABILITY — agent has poor role_confidence for this cluster
  const roleConf = _getRoleConfidence(decision.agent, decision.cluster, context);
  if (roleConf < 0.4) {
    faults.push({
      class:          'CAPABILITY',
      source:         'conditioning_log',
      roleConfidence: roleConf,
      agent:          decision.agent,
      cluster:        decision.cluster,
      recommendation: 'fallback',
    });
  }

  // KNOWLEDGE — high structural deviation (C-field)
  if (cField > 0.8 && !context.conditioning?.hasCluster?.[decision.cluster]) {
    faults.push({
      class:          'KNOWLEDGE',
      source:         'delta',
      cField,
      agent:          decision.agent,
      cluster:        decision.cluster,
      recommendation: 'fallback',
    });
  }

  return faults;
}

/**
 * Layer 2 fitness values — role_confidence from conditioning_log.
 * In Phase 1 of simulation integration these are honest stubs that will
 * fill in as conditioning_log accumulates real outcome data.
 * Per the spec: "role_confidence = conditioning_log success rate per
 * (agent, cluster) pair" — the data exists once co-pilot starts writing
 * conditioning_log entries (copilot-system-programmer.spec Phase 4).
 */
function _getRoleConfidence(agent, cluster, context) {
  const log = context.conditioning?.outcomes || {};
  const key = `${agent}:${cluster}`;
  if (log[key]) {
    const { successes = 0, total = 0 } = log[key];
    return total > 0 ? successes / total : 0.5; // no data = neutral
  }
  return 0.5; // honest: unknown until data accumulates
}

function _recommend(sigma, faults, enforced, options) {
  if (options.dry_run) return 'dry_run'; // explicit dry run — never commit

  const constitutional = faults.find(f => f.class === 'CONSTITUTIONAL');
  if (constitutional)                          return 'escalate';
  if (faults.find(f => f.class === 'INTEGRITY' && sigma.score >= 0.9)) return 'escalate';
  if (faults.length > 0)                       return 'fallback';
  if (sigma.score >= 0.6)                      return 'fallback';
  if (sigma.score >= 0.3)                      return 'commit'; // with warning
  return 'commit';
}

function _confidence(sigma, sField, cField, cosAvailable) {
  // Higher sigma / delta = less confident prediction
  const base = 1 - Math.min(1, (sigma.score * 0.6 + sField * 0.2 + cField * 0.2));
  // COS compartment adds structural validation confidence
  return +(base * (cosAvailable ? 1.0 : 0.85)).toFixed(3);
}

/**
 * scoreOutcome(result, actualOutcome) → updated layer-2 fitness data
 * Called by RAID after the real dispatch completes to close the feedback loop.
 */
function scoreOutcome(result, actualOutcome) {
  const success = actualOutcome?.ok !== false && !actualOutcome?.error;
  return {
    simId:       result.simId,
    agent:       result.decision.agent,
    cluster:     result.decision.cluster,
    predicted:   result.recommendation,
    actual:      success ? 'success' : 'failure',
    predCorrect: (result.recommendation === 'commit') === success,
    sigmaPredicted: result.sigma.score,
    ts:          Date.now(),
  };
}

module.exports = { simulate, classifyFault, scoreOutcome };
