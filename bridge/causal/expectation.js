'use strict';
/**
 * bridge/causal/expectation.js — Phase 71.1/71.2: State Reducer + Expectation Engine
 * UUID: nexus-bridge-causal-expectation-v1-0000-2026-0625-jamesbrooks-001
 * Version: 1.0.0
 *
 * 71.1 — State Reducer: pure (state, event) => newState for SEAM queues.
 *   Replaces scattered seam_1/seam_2 flag logic across handlers.
 *   One function. Same input, same output. No side effects.
 *
 * 71.2 — Expectation Engine: declares expected_path at queue creation,
 *   validates every seam.end event against it, fires anomaly immediately
 *   instead of waiting for a watchdog timeout.
 *   Direct fix for the chunk-1 stall — silent dispatch failures now surface.
 *
 * §1.1 Nothing exists until proven — expected_path declared before dispatch
 * §1.2 Nothing silently fails — mismatch fires anomaly immediately
 * §2.3 All state observable — reducer state queryable
 */

const crypto = require('crypto');

const MODULE_ID = 'causal/expectation';
const VERSION   = '1.0.0';

// ── Phase 71.1: SEAM State Reducer ───────────────────────────────────────────
// Pure function. (state, event) => newState.
// State shape mirrors seam-queue.spec §3.2 modes.

const SEAM_STATES = {
  IDLE:       'idle',
  INTAKE:     'intake',
  BUFFERING:  'buffering',
  READY:      'ready',
  EXECUTING:  'executing',
  ERROR:      'error',
  HEALING:    'healing',
  COMPLETE:   'complete',
};

const INITIAL_SEAM_STATE = {
  mode:       SEAM_STATES.IDLE,
  seam_1:     false,   // first chunk delivered
  seam_2:     false,   // second chunk delivered
  chunkCount: 0,
  errorCount: 0,
  provider:   null,
  sessionId:  null,
  startedAt:  null,
  lastEventAt:null,
  path:       [],      // actual event sequence (for expectation comparison)
};

/**
 * reduce — pure state reducer for SEAM queue.
 * @param {object} state  - current SEAM state (from INITIAL_SEAM_STATE shape)
 * @param {object} event  - { type: string, payload: object, ts: number }
 * @returns {object}       new state (never mutates input)
 */
function reduce(state = INITIAL_SEAM_STATE, event) {
  const s = { ...state, lastEventAt: event.ts || Date.now() };
  const type = event.type || '';
  const payload = event.payload || {};

  // Track actual path for expectation comparison
  s.path = [...(s.path || []), type];

  switch (true) {
    // Intake: session started
    case /seam\.session\.open|seam\.start|seam\.intake/.test(type):
      return { ...s, mode: SEAM_STATES.INTAKE, sessionId: payload.sessionId || s.sessionId,
        provider: payload.provider || s.provider, startedAt: s.startedAt || event.ts };

    // Chunk 1 received
    case /seam\.chunk\.1|seam_1\.received|chunk\.1/.test(type):
      return { ...s, mode: SEAM_STATES.BUFFERING, seam_1: true, chunkCount: s.chunkCount + 1 };

    // Chunk 2 received → ready to execute
    case /seam\.chunk\.2|seam_2\.received|chunk\.2/.test(type):
      return { ...s, mode: SEAM_STATES.READY, seam_2: true, chunkCount: s.chunkCount + 1 };

    // Execution started
    case /seam\.dispatch|seam\.execute|seam\.start\.exec/.test(type):
      return { ...s, mode: SEAM_STATES.EXECUTING };

    // Complete
    case /seam\.complete|seam\.end|seam\.done/.test(type):
      return { ...s, mode: SEAM_STATES.COMPLETE };

    // Error
    case /seam\.error|seam\.failed|seam\.fail/.test(type):
      return { ...s, mode: SEAM_STATES.ERROR, errorCount: s.errorCount + 1 };

    // Healing initiated
    case /seam\.heal|self.heal\.applied|seam\.retry/.test(type):
      return { ...s, mode: SEAM_STATES.HEALING };

    // Reset
    case /seam\.reset|seam\.close|seam\.session\.close/.test(type):
      return { ...INITIAL_SEAM_STATE, sessionId: s.sessionId };

    default:
      return s; // unrecognized event — pass through unchanged
  }
}

// ── Phase 71.2: Expectation Engine ───────────────────────────────────────────
// Declares expected_path at queue creation.
// Validates on seam.end. Fires anomaly on mismatch.

class ExpectationEngine {
  constructor() {
    this._expectations = new Map(); // sessionId → expectation
    this._states       = new Map(); // sessionId → current SEAM state
    this._anomalies    = [];        // recent anomalies (ring buffer, max 100)
    this._onAnomaly    = null;      // callback: (anomaly) => void
  }

  /**
   * define — declare what's expected for a SEAM run.
   * Call at queue creation time, before dispatch.
   *
   * @param {string} sessionId
   * @param {string[]} expectedPath  - ordered event type sequence
   * @param {object} meta            - { provider, compartment, timeout_ms }
   */
  define(sessionId, expectedPath, meta = {}) {
    const expectation = {
      uuid:          crypto.randomUUID(),
      sessionId,
      expectedPath,
      declaredAt:    Date.now(),
      status:        'pending',  // pending | fulfilled | violated | timeout
      meta,
    };
    this._expectations.set(sessionId, expectation);
    this._states.set(sessionId, { ...INITIAL_SEAM_STATE, sessionId });
    return expectation;
  }

  /**
   * observe — feed an event into the reducer and check expectations.
   * Call on every event that belongs to a tracked session.
   *
   * @param {string} sessionId
   * @param {object} event  - { type, payload, ts }
   * @returns {{ state, anomaly: object|null }}
   */
  observe(sessionId, event) {
    const current = this._states.get(sessionId) || { ...INITIAL_SEAM_STATE, sessionId };
    const next    = reduce(current, event);
    this._states.set(sessionId, next);

    const expectation = this._expectations.get(sessionId);
    let anomaly = null;

    // Check: is this event expected at this position?
    if (expectation && expectation.status === 'pending') {
      const pos     = next.path.length - 1;
      const expType = expectation.expectedPath[pos];

      // Mismatch: wrong event at this position
      if (expType && event.type !== expType && !_isEquivalent(event.type, expType)) {
        anomaly = this._fireAnomaly({
          kind:        'path_mismatch',
          sessionId,
          position:    pos,
          expected:    expType,
          received:    event.type,
          expectation: expectation.uuid,
          state:       next,
        });
        expectation.status = 'violated';
      }

      // Check: seam complete — validate full path
      if (next.mode === SEAM_STATES.COMPLETE) {
        const actualPath   = next.path;
        const expectedPath = expectation.expectedPath;
        const missing      = expectedPath.filter(e => !actualPath.includes(e));
        if (missing.length) {
          anomaly = this._fireAnomaly({
            kind:        'missing_steps',
            sessionId,
            missing,
            actualPath,
            expectedPath,
            expectation: expectation.uuid,
            state:       next,
          });
          expectation.status = 'violated';
        } else {
          expectation.status = 'fulfilled';
        }
      }
    }

    return { state: next, anomaly };
  }

  /**
   * checkTimeouts — call periodically (e.g. every 10s).
   * Fires anomaly for sessions stuck in non-terminal state beyond timeout.
   */
  checkTimeouts(nowMs = Date.now()) {
    for (const [sessionId, expectation] of this._expectations) {
      if (expectation.status !== 'pending') continue;
      const state   = this._states.get(sessionId);
      const timeout = expectation.meta?.timeout_ms || 60000;
      const age     = nowMs - (expectation.declaredAt || 0);
      if (age > timeout && state && state.mode !== SEAM_STATES.COMPLETE) {
        this._fireAnomaly({
          kind:      'timeout',
          sessionId,
          mode:      state?.mode,
          age_ms:    age,
          timeout_ms: timeout,
          expectation: expectation.uuid,
          state,
        });
        expectation.status = 'timeout';
      }
    }
  }

  _fireAnomaly(data) {
    const anomaly = { uuid: crypto.randomUUID(), ts: Date.now(), ...data };
    this._anomalies.push(anomaly);
    if (this._anomalies.length > 100) this._anomalies.shift();
    if (this._onAnomaly) {
      try { this._onAnomaly(anomaly); } catch(_) {}
    }
    return anomaly;
  }

  onAnomaly(fn) { this._onAnomaly = fn; return this; }

  getState(sessionId)    { return this._states.get(sessionId) || null; }
  getExpectation(sid)    { return this._expectations.get(sid) || null; }
  recentAnomalies(n=10)  { return this._anomalies.slice(-n); }

  // Clean up fulfilled/violated/timeout expectations older than 10 min
  gc(nowMs = Date.now()) {
    const KEEP_MS = 600_000;
    for (const [sid, exp] of this._expectations) {
      if (exp.status !== 'pending' && nowMs - exp.declaredAt > KEEP_MS) {
        this._expectations.delete(sid);
        this._states.delete(sid);
      }
    }
  }

  status() {
    return {
      tracked:   this._expectations.size,
      pending:   [...this._expectations.values()].filter(e => e.status==='pending').length,
      anomalies: this._anomalies.length,
      version:   VERSION,
    };
  }
}

// Equivalence: treat semantic variants as the same event type
function _isEquivalent(actual, expected) {
  const ALIASES = {
    'seam.chunk.1':    ['seam_1.received', 'chunk.1', 'seam.inject.1'],
    'seam.chunk.2':    ['seam_2.received', 'chunk.2', 'seam.inject.2'],
    'seam.complete':   ['seam.end', 'seam.done', 'seam.session.close'],
    'seam.error':      ['seam.failed', 'seam.fail'],
  };
  for (const [canonical, variants] of Object.entries(ALIASES)) {
    const set = new Set([canonical, ...variants]);
    if (set.has(actual) && set.has(expected)) return true;
  }
  return false;
}

// Singleton instance
const engine = new ExpectationEngine();

// Phase 71.3: Wire anomaly engine — expectation mismatch → formal anomaly
// Lazy-load so anomaly engine can init independently
engine.onAnomaly(signal => {
  try {
    const anomalyEngine = require('../../intelligence/meta/causal/anomaly');
    anomalyEngine.classify(signal);
  } catch(e) {
    console.warn('[causal/expectation] anomaly engine unavailable:', e.message);
  }
});

module.exports = {
  // 71.1 State Reducer
  reduce,
  SEAM_STATES,
  INITIAL_SEAM_STATE,
  // 71.2 Expectation Engine
  engine,
  ExpectationEngine,
  MODULE_ID,
  VERSION,
};
