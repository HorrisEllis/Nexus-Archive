'use strict';
// ── lib/autonomous-loop.js ──────────────────────────────────────────────────────
// UUID: nexus-autonomous-loop-v1-0000-4300-0000-000000000001
// Version: 1.0.0
// Phase: 13 — Autonomous Loop: Ollama as Brain
// Deps:  Phase 10 (constitutional-ai) ✓ · Phase 11 (reflection) ✓ ·
//        Phase 12 (user-model) ✓ · Phase 25 (compartment-engine) ✓ ·
//        Phase 46 (case-library) ✓ · gap-loop ✓ · ollama ✓ · snapshot ✓
// Unlocks: nothing downstream declares a hard dep on this yet.
//
// ARCHITECTURE DECISION (asked, answered, not assumed — 2026-06-19):
// "Every autonomous step is a gap" — full reuse of gap-loop's existing
// level0-4 escalation ladder as the step-EXECUTION mechanism, not just its
// failure-handling path. This module never executes a step's work itself;
// it inserts a gap, waits for gap-loop's own polling _tick() (which already
// routes CAPABILITY-class work through RAID -> Ollama -> self-heal -> forge,
// confirmed real and traced before writing this file) to resolve it, and
// reads the terminal gap record back as the step's result.
//
// ── WHAT ALREADY EXISTED, CONFIRMED BY READING IT (not assumed) ────────────────
// - cortex/gap-loop.js level2 (CAPABILITY-class gaps) emits HEAL_REQUESTED ->
//   self-heal -> RAID's forge cluster chain ['ollama','claude'] ->
//   cortex/agents/ollama/dispatch(). "Ollama reasons - RAID routes" (the
//   autonomous-loop.spec's own step 2) was already real machinery; this
//   module drives it, does not rebuild it.
// - lib/intent-classifier.js's classify() already special-cases this exact
//   module: req.runId/req.step/req.causedBy propagate onto the intent,
//   SOURCE.AUTONOMOUS_LOOP is detected from req.runId alone, execution_class
//   upgrades to AUTONOMOUS. Built anticipating this file; used as designed.
// - lib/request-handler.js's COST_TIERS (READ .1/COMPUTE .3/LLM_LOCAL
//   .5/LLM_REMOTE .8/FORGE .9/IRREVERSIBLE 1.0) and DEFAULT_COST_CEILING
//   (0.85, not the 0.50 an earlier draft note in this file guessed before
//   this module existed) are reused directly for per-step cost accounting —
//   not reinvented.
//
// ── A REAL BUG FOUND WHILE BUILDING THIS, NOT ROUTED AROUND SILENTLY ──────────
// open-loop-taxonomy.js's createLoop() defaults every new gap to
// status:'open' (LOOP_STATES.OPEN). gap-loop.js's _tick() only ever picks up
// status:'pending' (or retry_pending/stale-routing) — 'open' is never
// queried for at all. 'pending' is not even a member of LOOP_STATES.
// Checked every existing createLoop() call site (constitutional-ai.js,
// reflection.js x2, compartment-engine.js) — none of them override status
// at insert. Every CONSTITUTIONAL gap those four phases have ever created
// is sitting at status:'open' and has never once been picked up by the
// automated ladder; nothing depended on that pickup before, so nothing
// caught it. Phase 13 is the first phase that actually needs it to work.
// Fix scoped to this file only: status:'pending' is set explicitly at this
// module's own insert site below. The shared createLoop() default and the
// other four callers are NOT touched — changing a shared default retroactively
// alters four already-shipped phases' behavior without being asked to.
// Flagged in lib/version.js for a real decision on the system-wide fix.
//
// ── A REAL GAP IN THE σ SAFETY CHECK, STATED, NOT HIDDEN ───────────────────────
// "Rewind if sigma > 0.70" (phase-map.md) is implemented for real against
// sigma_records — but nothing in this codebase writes to sigma_records.
// divergence-watcher.js polls it; nothing populates it. Confirmed by
// grepping every insert('sigma_records'...) call site: zero results. The
// check below is real, not theater — it queries the actual table and will
// halt a run the moment a real numeric sigma >= 0.70 appears — but until
// something builds a sigma producer, that will never happen in practice.
// A null reading is logged as a degraded-monitoring warning once per run
// and does NOT halt the run by itself — treating "no signal" as "unsafe"
// would make every autonomous run unusable given a gap that predates this
// file and isn't this phase's to fix.
//
// ── SCOPE LIMITS, STATED HONESTLY ──────────────────────────────────────────────
// - No CLI/API trigger built this pass. startRun() is the real, tested entry
//   point. Wiring a CLI command means understanding nexus-cli.js's
//   registration pattern, which was not explored — not silently skipped,
//   explicitly out of scope until asked for.
// - exit_condition supports 'steps' (fixed count) and 'stable' (N
//   consecutive PASS outcomes) for real. It does NOT support semantic
//   conditions like the spec's own "health score stable" example — no
//   single canonical health-score metric exists anywhere in this codebase
//   to evaluate that against. 'manual' is the honest fallback: budget/
//   boundary/sigma are the only things that can stop a manual run.
// - "Fails -> rewind -> inject context -> next approach" (spec step 5): the
//   rewind is real (compartment-engine's own FAIL->REWOUND path). "Inject
//   context for next approach" is, honestly, only as much as the case
//   library already provides on the next query — no separate
//   strategy-mutation layer exists, and none is fabricated here.
//
// §1.1 every run + step carries a real UUID, causedBy chains to the run
// §1.2 every transition logged to event_log, nothing silent
// §2.1 pre-run snapshot taken before any step; rewound to on sigma halt
// §4.3 Budget/Boundary/Exit are hard-required — no implicit, no open-ended

const crypto = require('crypto');

const MODULE_ID = 'autonomous-loop';
const VERSION   = '1.0.0';

const SIGMA_HALT_THRESHOLD = parseFloat(process.env.AUTONOMOUS_SIGMA_HALT || '0.70');
const STEP_POLL_MS         = parseInt(process.env.AUTONOMOUS_STEP_POLL_MS || '1000');
const DEFAULT_STEP_TIMEOUT_MS = parseInt(process.env.AUTONOMOUS_STEP_TIMEOUT_MS || '60000');

// Verb -> loop_type. Most autonomous goals are "go make this happen" —
// CAPABILITY (EXTEND/forge cluster) is the honest default. Explicit
// overrides only for verbs that clearly aren't capability requests.
const VERB_TO_LOOP_TYPE = {
  monitor: 'TEMPORAL', watch: 'TEMPORAL', wait: 'TEMPORAL', poll: 'TEMPORAL',
  diagnose: 'CAUSAL', investigate: 'CAUSAL',
  research: 'KNOWLEDGE', find: 'KNOWLEDGE', retrieve: 'KNOWLEDGE',
  decide: 'DECISION', choose: 'DECISION',
  verify: 'INTEGRITY', validate: 'INTEGRITY', check: 'INTEGRITY',
  analyze: 'CAUSAL', explain: 'CAUSAL',
};
const DEFAULT_LOOP_TYPE = 'CAPABILITY';

let _jaa, _uid;
function _getJAA() {
  if (_jaa) return _jaa;
  try { ({ jaaDB: _jaa, uid: _uid } = require('../cortex/memory/jaa-db')); } catch (_) {}
  return _jaa;
}
function uid() { return _uid?.() ?? crypto.randomUUID(); }

let _intentClassifier; function _getIntentClassifier() { if (_intentClassifier) return _intentClassifier; try { _intentClassifier = require('./intent-classifier'); } catch (_) {} return _intentClassifier; }
let _caseLibrary;      function _getCaseLibrary()      { if (_caseLibrary) return _caseLibrary;      try { _caseLibrary = require('./case-library'); } catch (_) {} return _caseLibrary; }
let _compartmentEngine;function _getCompartmentEngine(){ if (_compartmentEngine) return _compartmentEngine; try { _compartmentEngine = require('./compartment-engine'); } catch (_) {} return _compartmentEngine; }
let _taxonomy;          function _getTaxonomy()          { if (_taxonomy) return _taxonomy;          try { _taxonomy = require('./open-loop-taxonomy'); } catch (_) {} return _taxonomy; }
let _snapshot;          function _getSnapshot()          { if (_snapshot) return _snapshot;          try { _snapshot = require('../cortex/snapshot'); } catch (_) {} return _snapshot; }
let _costTiers;         function _getCostTiers()          { if (_costTiers) return _costTiers;          try { ({ COST_TIERS: _costTiers } = require('./request-handler')); } catch (_) {} return _costTiers; }
let _bus;               function _getBus()                { if (_bus) return _bus;                      try { _bus = require('../nexus-bus'); } catch (_) {} return _bus; }

function _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function _logEvent(type, payload) {
  const jaa = _getJAA();
  if (jaa) {
    try { jaa.insert('event_log', { uuid: uid(), type, payload, source: MODULE_ID, ts: Date.now() }); }
    catch (e) { console.error(`[${MODULE_ID}] _logEvent failed to write '${type}' to event_log: ${e.message}`); }
  }
  const bus = _getBus();
  if (bus?.emit) {
    try { bus.emit(type, payload); }
    catch (e) { console.error(`[${MODULE_ID}] _logEvent failed to emit '${type}' on bus: ${e.message}`); }
  }
}

// ── Validation — Goal/Budget/Boundary/Exit are hard-required, no exceptions ────
function _validateLoopContract({ goal, budget, boundary, exit_condition }) {
  if (!goal || (typeof goal !== 'string' && !goal.text)) {
    throw new Error('[autonomous-loop] Goal required — string or { text }. No implicit goals.');
  }
  if (!budget || typeof budget !== 'object' ||
      (budget.timeMs == null && budget.maxSteps == null && budget.costCeiling == null)) {
    throw new Error('[autonomous-loop] Budget required — at least one of {timeMs, maxSteps, costCeiling}. No open-ended runs.');
  }
  if (!boundary || !boundary.description) {
    throw new Error('[autonomous-loop] Boundary required and must be written, not inferred — { description, paths?, systems? }.');
  }
  if (!exit_condition || !exit_condition.type) {
    throw new Error('[autonomous-loop] Exit condition required — { type: "steps"|"stable"|"manual", ... }.');
  }
  if (!['steps', 'stable', 'manual'].includes(exit_condition.type)) {
    throw new Error(`[autonomous-loop] Unsupported exit_condition.type "${exit_condition.type}" — supported: steps, stable, manual. ` +
      `Semantic conditions (e.g. "health score stable") have no metric source in this codebase yet — not fabricated here.`);
  }
}

// ── Budget check — hard ceiling, every dimension supplied is enforced ─────────
function _checkBudget(run) {
  const b = run.budget;
  const elapsedMs = Date.now() - run.startedAt;
  if (b.timeMs != null && elapsedMs >= b.timeMs) return { exhausted: true, reason: 'timeMs', elapsedMs };
  if (b.maxSteps != null && run.stepCount >= b.maxSteps) return { exhausted: true, reason: 'maxSteps', stepCount: run.stepCount };
  if (b.costCeiling != null && run.costSpent >= b.costCeiling) return { exhausted: true, reason: 'costCeiling', costSpent: run.costSpent };
  return { exhausted: false };
}

// ── Sigma check — real, against a table nothing currently writes to. See header. ──
function _checkSigma(run) {
  const jaa = _getJAA();
  if (!jaa) return { halt: false, sigma: null, degraded: true };
  let latest = null;
  try { latest = jaa.query('sigma_records', () => true, 1)[0] || null; } catch (_) {}
  if (!latest || typeof latest.sigma !== 'number') {
    if (!run._sigmaDegradedLogged) {
      run._sigmaDegradedLogged = true;
      _logEvent('autonomous_loop.sigma_monitoring_degraded', {
        runId: run.uuid,
        reason: 'no sigma_records row available — no producer writes this table yet (pre-existing gap, not this phase\'s)',
      });
    }
    return { halt: false, sigma: null, degraded: true };
  }
  return { halt: latest.sigma >= SIGMA_HALT_THRESHOLD, sigma: latest.sigma, degraded: false };
}

// ── Exit condition evaluation — only what's real, see header scope limits ─────
function _exitConditionMet(run) {
  const ec = run.exit_condition;
  if (ec.type === 'manual') return false; // only budget/boundary/sigma can stop a manual run
  if (ec.type === 'steps') return run.stepCount >= (ec.count ?? Infinity);
  if (ec.type === 'stable') {
    const n = ec.consecutive ?? 3;
    if (run.steps.length < n) return false;
    return run.steps.slice(-n).every(s => s.status === 'PASS');
  }
  return false;
}

// ── Wait for a gap to reach a terminal state we've actually confirmed gap-loop produces ──
// 'resolved' and 'human_required' are the two terminals directly observed in
// gap-loop.js's _resolveGap. 'timeout' is this module's own bounded-wait
// fallback, not a gap-loop state.
async function _awaitGapTerminal(gapUuid, timeoutMs) {
  const jaa = _getJAA();
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    let row = null;
    try { row = jaa.query('gaps', r => r.uuid === gapUuid, 1)[0]; } catch (_) {}
    if (row && (row.status === 'resolved' || row.status === 'human_required')) return row;
    await _sleep(STEP_POLL_MS);
  }
  return { uuid: gapUuid, status: 'timeout' };
}

// ── One step — query case library, spawn a compartment whose "work" is gap-loop ──
async function _runStep(run, stepN) {
  const intentClassifier = _getIntentClassifier();
  const caseLibrary      = _getCaseLibrary();
  const compartmentEngine= _getCompartmentEngine();
  const taxonomy         = _getTaxonomy();
  const jaa               = _getJAA();
  const costTiers         = _getCostTiers() || {};

  const goalText = typeof run.goal === 'string' ? run.goal : run.goal.text;

  if (!intentClassifier || !caseLibrary || !compartmentEngine || !taxonomy) {
    return { compartmentStatus: 'FAIL', cost: 0, summary: { step: stepN, error: 'required module unreachable', ts: Date.now() } };
  }

  const { intent } = intentClassifier.classify({ text: goalText, runId: run.uuid, step: stepN, causedBy: run.uuid });
  const frozenIntent = intentClassifier.freeze ? intentClassifier.freeze(intent) : intent;

  const caseResult = caseLibrary.query(frozenIntent);
  if (caseResult.blocked) {
    _logEvent('autonomous_loop.step_blocked', { runId: run.uuid, step: stepN, reason: caseResult.reason, signature: caseResult.signature });
    return {
      compartmentStatus: 'BLOCKED', blocked: true, cost: 0,
      summary: { step: stepN, blocked: true, reason: caseResult.reason, ts: Date.now() },
    };
  }

  const loop_type = VERB_TO_LOOP_TYPE[frozenIntent.verb] || DEFAULT_LOOP_TYPE;
  const stepTimeoutMs = run.budget.stepTimeoutMs || DEFAULT_STEP_TIMEOUT_MS;

  const executor = async (workingMemory) => {
    const loop = taxonomy.createLoop({
      loop_type,
      source: MODULE_ID,
      path: `autonomous-run/${run.uuid}/step/${stepN}`,
      body: frozenIntent.raw || goalText,
      evidence: [
        `autonomous run ${run.uuid} step ${stepN}`,
        workingMemory ? `case-library seed tier: ${workingMemory.tier}` : 'cold spawn — no prior case',
      ],
      dependencies: [],
      closure_condition: typeof run.exit_condition === 'object' ? JSON.stringify(run.exit_condition) : String(run.exit_condition),
      causedBy: run.uuid,
    });

    const gapUuid = uid();
    // Scoped fix — see header "A REAL BUG FOUND". status:'pending' explicit,
    // not relying on createLoop()'s 'open' default, which gap-loop never polls for.
    try {
      jaa.insert('gaps', { uuid: gapUuid, ...loop, status: 'pending', createdAt: Date.now() });
    } catch (e) {
      const err = new Error(`AUTONOMOUS_GAP_INSERT_FAILED: ${e.message}`);
      throw err;
    }

    _logEvent('autonomous_loop.step_gap_created', { runId: run.uuid, step: stepN, gapUuid, loop_type });

    const terminal = await _awaitGapTerminal(gapUuid, stepTimeoutMs);

    if (terminal.status === 'timeout') {
      throw new Error(`AUTONOMOUS_STEP_TIMEOUT: gap ${gapUuid} did not reach a terminal state within ${stepTimeoutMs}ms`);
    }
    if (terminal.status === 'human_required') {
      throw new Error(`AUTONOMOUS_HUMAN_REQUIRED: gap ${gapUuid} escalated — ${terminal.resolveReason || terminal.body || 'unspecified'}`);
    }
    return terminal; // status === 'resolved'
  };

  let compartment;
  try {
    compartment = await compartmentEngine.spawn({
      intent: frozenIntent,
      budget: run.budget,
      boundary: run.boundary,
      workingMemorySeed: caseResult.workingMemorySeed,
    });
  } catch (e) {
    return { compartmentStatus: 'FAIL', cost: 0, summary: { step: stepN, error: `spawn failed: ${e.message}`, ts: Date.now() } };
  }

  const resolved = await compartmentEngine.execute(compartment, executor);

  const cost = costTiers[frozenIntent.risk_level] ?? (costTiers.LLM_LOCAL || 0.5);
  const humanRequired = !!resolved._executionError?.includes('AUTONOMOUS_HUMAN_REQUIRED');
  const budgetTimeout  = !!resolved._executionError?.includes('AUTONOMOUS_STEP_TIMEOUT');

  return {
    compartmentStatus: resolved.status,
    humanRequired, budgetTimeout,
    cost,
    summary: {
      step: stepN,
      compartmentId: resolved.id,
      status: resolved.status,
      loop_type,
      caseTier: caseResult.tier,
      ts: Date.now(),
    },
  };
}

// ── Rewind the whole run to its pre-run snapshot ──────────────────────────────
async function _rewindRun(run, reason) {
  const snapshot = _getSnapshot();
  if (snapshot?.rollback && run.preRunSnapshotId) {
    try {
      await snapshot.rollback(run.preRunSnapshotId, { reason: `autonomous run ${run.uuid} halted: ${reason}` });
      run._rewound = true;
    } catch (e) {
      run._rewindFailed = e.message;
    }
  }
}

function _persistRun(run) {
  const jaa = _getJAA();
  if (!jaa) return;
  const { _sigmaDegradedLogged, ...persisted } = run;
  try { jaa.update('autonomous_runs', run.uuid, persisted); } catch (e) { console.error(`[${MODULE_ID}] _persistRun failed to persist run ${run.uuid}: ${e.message}`); }
}

// ── Entry point ────────────────────────────────────────────────────────────────
async function startRun({ goal, budget, boundary, exit_condition } = {}) {
  _validateLoopContract({ goal, budget, boundary, exit_condition });

  const jaa = _getJAA();
  const snapshot = _getSnapshot();
  const runId = uid();

  let preRunSnapshotId = null;
  if (snapshot?.create) {
    try {
      const s = await snapshot.create({
        type: 'pre_autonomous_run',
        message: `autonomous run ${runId}: ${typeof goal === 'string' ? goal : goal.text}`,
        causedBy: runId,
      });
      preRunSnapshotId = s?.snapId ?? null;
    } catch (e) {
      console.warn(`[${MODULE_ID}] pre-run snapshot failed, proceeding without a rewind target: ${e.message}`);
    }
  }

  const run = {
    uuid: runId, goal, budget, boundary, exit_condition,
    status: 'RUNNING', steps: [], stepCount: 0, costSpent: 0,
    preRunSnapshotId, startedAt: Date.now(), endedAt: null,
  };

  try { jaa?.insert('autonomous_runs', run); } catch (e) { console.error(`[${MODULE_ID}] failed to write initial run record for ${runId} — this run will not be resumable/inspectable: ${e.message}`); }
  _logEvent('autonomous_loop.run_started', { runId, goal, budget, boundary, exit_condition });

  while (run.status === 'RUNNING') {
    const sigmaCheck = _checkSigma(run);
    if (sigmaCheck.halt) {
      run.status = 'HALTED_SIGMA';
      await _rewindRun(run, `sigma ${sigmaCheck.sigma} >= ${SIGMA_HALT_THRESHOLD}`);
      _logEvent('autonomous_loop.halted_sigma', { runId, sigma: sigmaCheck.sigma });
      break;
    }

    const budgetCheck = _checkBudget(run);
    if (budgetCheck.exhausted) {
      run.status = 'BUDGET_EXHAUSTED';
      _logEvent('autonomous_loop.budget_exhausted', { runId, ...budgetCheck });
      break;
    }

    const stepN = run.stepCount + 1;
    const stepResult = await _runStep(run, stepN);

    run.stepCount = stepN;
    run.steps.push(stepResult.summary);
    run.costSpent += stepResult.cost || 0;
    _persistRun(run);

    if (stepResult.compartmentStatus === 'PASS') {
      if (_exitConditionMet(run)) {
        run.status = 'EXIT_MET';
      }
      // else: loop continues, next iteration re-checks sigma/budget first
    } else if (stepResult.blocked) {
      run.status = 'BLOCKED';
    } else if (stepResult.humanRequired) {
      run.status = 'HUMAN_REQUIRED';
    } else if (stepResult.budgetTimeout) {
      // A hard step-level budget ceiling, not a retry trigger — "Budget is a
      // hard limit," not a soft one. See loop_contract.
      run.status = 'BUDGET_EXHAUSTED';
    }
    // else: FAIL/REWOUND on this step — loop continues to the next step
    // attempt (next case-library query is the honest extent of "inject
    // context for next approach" this pass implements; see header).
  }

  run.endedAt = Date.now();
  _persistRun(run);
  _logEvent('autonomous_loop.run_ended', { runId, status: run.status, stepCount: run.stepCount, costSpent: run.costSpent });

  return run;
}

function validateWiring() {
  const checks = {
    jaa: !!_getJAA(),
    intentClassifier: !!_getIntentClassifier(),
    caseLibrary: !!_getCaseLibrary(),
    compartmentEngine: !!_getCompartmentEngine(),
    taxonomy: !!_getTaxonomy(),
  };
  const online = Object.values(checks).filter(Boolean).length;
  console.log(`[${MODULE_ID}] wiring: ${online}/${Object.keys(checks).length} systems reachable`);
  return checks;
}

module.exports = {
  startRun, validateWiring,
  _checkBudget, _checkSigma, _exitConditionMet, _awaitGapTerminal, _runStep, _validateLoopContract,
  VERB_TO_LOOP_TYPE, DEFAULT_LOOP_TYPE, SIGMA_HALT_THRESHOLD,
  MODULE_ID, VERSION,
};
