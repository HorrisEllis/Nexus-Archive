'use strict';
/**
 * lib/agent-tools/tools/diagnostic/diagnostic-engines.js — diagnostic_engines tool
 * UUID: nexus-tool-diagnostic-engines-v1-0000-2026-0815-jamesbrooks-001
 *
 * §WIRED 2026-08-15 — found while checking docs/diagnostic-engines.spec for
 * prior art before writing LS2's new-system spec (the check that should
 * have happened before that spec's first draft, not after). lib/diagnostic-
 * engines.js is real, built 2026-06-15 — weeks before this session — 631
 * lines, 12 real cross-domain diagnostic methods, runAllEngines() as a
 * real single entry point. Zero agent-tool coverage, confirmed by grep,
 * until now.
 */
const engines = require('../../../diagnostic-engines.js');

const ACTIONS = {
  run_all: (a) => ({ ok: true, ...engines.runAllEngines({ events: a.events || [], systemStates: a.systemStates || {} }) }),
  causal_chain:    (a) => ({ ok: true, result: engines.causalChainTrace(a.events || [], a.failureType || 'error') }),
  invariants:      (a) => ({ ok: true, result: engines.scanInvariants(a.events || []) }),
  circuit_breaker: (a) => ({ ok: true, result: engines.circuitBreakerAnalysis(a.events || []) }),
  temporal:        (a) => ({ ok: true, result: engines.temporalAnalysis(a.events || [], a.windowMs) }),
  cascade_risk:    (a) => ({ ok: true, result: engines.cascadePrediction(a.systemStates || {}) }),
  entropy_rate:    (a) => ({ ok: true, result: engines.entropyRateAnalysis(a.events || [], a.windowSize) }),
  snr_floor:       (a) => ({ ok: true, result: engines.snrNoiseFloor(a.events || []) }),
  memory_pressure: (a) => ({ ok: true, result: engines.memoryPressureEstimate(a.events || [], a.timeWindowMs) }),
  fingerprint:     (a) => ({ ok: true, result: engines.behavioralFingerprint(a.events || [], a.windowSize) }),
  fault_tree:      (a) => ({ ok: true, result: engines.faultTreeEvaluate(a.systemStates || {}) }),
  homeostasis:     (a) => ({ ok: true, result: engines.homeostasisScore(a.events || []) }),
  correlation:     (a) => ({ ok: true, result: engines.crossSystemCorrelation(a.systemStates || {}) }),
};

module.exports = {
  name: 'diagnostic_engines',
  description:
    'Run one or all of 12 real cross-domain diagnostic analysis methods over a set of events and/or ' +
    'system states: causal chain tracing, invariant scanning, circuit-breaker analysis, temporal gap ' +
    'analysis, cascade-failure prediction, entropy-rate monitoring, SNR noise-floor detection, memory-' +
    'pressure estimation, behavioral fingerprinting, fault-tree evaluation, homeostasis scoring, and ' +
    'cross-system correlation. "run_all" runs every engine and returns a composite health score plus any ' +
    'high/medium alerts; the individual actions run just one. This is analysis over data you already ' +
    'have — it does not fetch events itself, pass them in.',
  parameters: {
    type: 'object',
    properties: {
      action:       { type: 'string', enum: Object.keys(ACTIONS) },
      events:       { type: 'array', description: 'array of event objects — required by most actions' },
      systemStates: { type: 'object', description: 'map of system -> state — required by cascade_risk, fault_tree, correlation' },
      failureType:  { type: 'string', description: 'for "causal_chain", default "error"' },
      windowMs:     { type: 'integer', description: 'for "temporal"' },
      windowSize:   { type: 'integer', description: 'for "entropy_rate"/"fingerprint"' },
      timeWindowMs: { type: 'integer', description: 'for "memory_pressure"' },
    },
    required: ['action'],
  },
  async execute(args = {}) {
    const fn = ACTIONS[args.action];
    if (!fn) return { error: `unknown action "${args.action}" — one of: ${Object.keys(ACTIONS).join(', ')}` };
    try { return await fn(args); }
    catch (e) { return { error: `diagnostic_engines ${args.action} failed: ${e.message}` }; }
  },
};
