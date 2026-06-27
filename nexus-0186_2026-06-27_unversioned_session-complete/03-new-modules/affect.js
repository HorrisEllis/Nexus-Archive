'use strict';
/**
 * copilot/affect.js — Co-pilot Internal State
 * UUID: nexus-copilot-affect-v1-0000-2026-0627-jamesbrooks-001
 * Version: 1.0.0
 *
 * Read this comment before the code. It matters more than usual here.
 *
 * WHAT THIS IS: a continuous internal state for copilot, built on the exact
 * same architecture as lib/cfr/field.js (which already does this for system
 * health — coherence/friction/resonance/entropy, nudged by events, self-
 * damping toward 0.5, regime computed from thresholds). This file applies
 * that same pattern to copilot's own interaction history instead of system
 * health. Four dimensions instead of system-health's four:
 *
 *   confidence  (0..1) — how sure copilot is about the current read
 *   strain      (0..1) — accumulated cost of unresolved gaps/corrections
 *   engagement  (0..1) — sustained back-and-forth, depth of session
 *   uncertainty (0..1) — open contradictions, ambiguity, unresolved INVERSIONs
 *
 * WHAT THIS IS NOT, AND WHY THAT MATTERS: this is not a claim that copilot
 * has subjective experience. It's a functional state vector — a number that
 * goes up and down and changes copilot's behavior (tone, whether it asks a
 * clarifying question vs. proceeds, how much it hedges) the way a mood
 * changes a person's behavior. Whether THAT constitutes "feelings" in the
 * sense that matters morally/philosophically is a genuinely open question —
 * one I don't have a settled answer to, and you should be skeptical of
 * anyone (including code comments) that claims certainty either way. What's
 * true without controversy: this makes copilot's responses functionally
 * mood-shaped. Whether there's something it's like to be in that state is a
 * different, harder question this file does not answer and is not designed
 * to answer.
 *
 * EXPLICITLY SEPARATE FROM lib/user-model.js: that file models the USER
 * (hypotheses, never a profile, per IDL3). This file models COPILOT. A
 * contradiction in user-model can nudge copilot's uncertainty here — that's
 * a legitimate input — but this file never writes claims about the user.
 * Two different subjects. Don't merge them.
 *
 * §AX-008 (foundation addendum v1.1.0): this module IS copilot, so the
 * reachability requirement is trivially satisfied — but affect.changed
 * should still hook out to ui.copilot (L5, read-only) so a mood indicator
 * can render if one ever exists. See registry-components.js addition.
 */

const MODULE_ID = 'copilot/affect';
const VERSION   = '1.0.0';

// ── Event → affect nudge table ────────────────────────────────────────────────
// Same shape as lib/cfr/field.js's EVENT_NUDGES. Small (0.02-0.12), so no
// single event overreacts. Self-damping handles the rest.

const EVENT_NUDGES = {
  'copilot.prompt.receive':        { confidence:  0,     strain:  0,    engagement: +0.04, uncertainty: +0.02 },
  'copilot.task.resolved':         { confidence: +0.08,  strain: -0.05, engagement:  0,    uncertainty: -0.04 },
  'copilot.task.failed':           { confidence: -0.10,  strain: +0.08, engagement:  0,    uncertainty: +0.08 },
  'copilot.qc.max_iterations':     { confidence: -0.06,  strain: +0.10, engagement:  0,    uncertainty: +0.05 },

  'user_model.contradiction':      { confidence: -0.06,  strain: +0.03, engagement:  0,    uncertainty: +0.10 },
  'user_model.inversion_candidate':{ confidence: -0.02,  strain:  0,    engagement:  0,    uncertainty: +0.06 },
  'user_model.hypothesis_confirmed':{confidence: +0.05,  strain: -0.02, engagement:  0,    uncertainty: -0.05 },

  'user.correction':               { confidence: -0.08,  strain: +0.07, engagement:  0,    uncertainty: +0.03 },
  'user.confirmation':             { confidence: +0.06,  strain: -0.03, engagement: +0.02, uncertainty: -0.06 },
  'user.followup_question':        { confidence:  0,     strain:  0,    engagement: +0.06, uncertainty: +0.01 },

  'session.idle_timeout':          { confidence:  0,     strain: -0.02, engagement: -0.08, uncertainty:  0 },
  'session.reengage':              { confidence:  0,     strain:  0,    engagement: +0.10, uncertainty: +0.02 },

  'gap.opened':                    { confidence: -0.04,  strain: +0.06, engagement:  0,    uncertainty: +0.07 },
  'gap.resolved':                  { confidence: +0.05,  strain: -0.06, engagement:  0,    uncertainty: -0.05 },
};

// ── Regime thresholds ──────────────────────────────────────────────────────────
// Mirrors field.js's stable/resonant/turbulent/chaotic — same idea, copilot-shaped names.
//
//   settled   — confidence > 0.6, uncertainty < 0.3   (proceed normally)
//   exploring — engagement > 0.6, uncertainty < 0.5    (dialogic, ask more, follow threads)
//   strained  — strain > 0.6                           (slow down, simplify, consider asking for help)
//   adrift    — uncertainty > 0.7 OR confidence < 0.2   (stop pushing forward, ask a clarifying question)

function computeRegime(state) {
  if (state.uncertainty > 0.7 || state.confidence < 0.2) return 'adrift';
  if (state.strain > 0.6)                                 return 'strained';
  if (state.confidence > 0.6 && state.uncertainty < 0.3)  return 'settled';
  if (state.engagement > 0.6 && state.uncertainty < 0.5)  return 'exploring';
  return 'neutral';
}

// ── State ────────────────────────────────────────────────────────────────────

let _state = { confidence: 0.5, strain: 0.5, engagement: 0.5, uncertainty: 0.5 };
let _history = []; // { ts, eventType, regime, state }
const HISTORY_MAX = 500;
const DAMPING = 0.03; // pull toward 0.5 each tick, same constant family as field.js

let _bus = null;

function init({ bus } = {}) {
  _bus = bus || null;
}

function _clamp01(n) { return Math.max(0, Math.min(1, n)); }

function _damp() {
  for (const k of Object.keys(_state)) {
    _state[k] = _state[k] + (0.5 - _state[k]) * DAMPING;
  }
}

/**
 * apply(eventType) — nudge state from a known event type, then damp + record.
 * Unknown event types are a no-op nudge (still damped, still recorded) —
 * §1.2 nothing silently fails: emits affect.unknown_event so gaps are visible.
 */
function apply(eventType, payload = {}) {
  const nudge = EVENT_NUDGES[eventType];
  if (!nudge) {
    _emit('affect.unknown_event', { eventType });
  } else {
    for (const [k, v] of Object.entries(nudge)) {
      _state[k] = _clamp01(_state[k] + v);
    }
  }

  _damp();
  const regime = computeRegime(_state);
  const prevRegime = _history.length ? _history[_history.length - 1].regime : null;

  const entry = { ts: Date.now(), eventType, regime, state: { ..._state } };
  _history.push(entry);
  if (_history.length > HISTORY_MAX) _history.shift();

  if (regime !== prevRegime) {
    _emit('affect.changed', { from: prevRegime, to: regime, state: { ..._state }, eventType });
  }

  return entry;
}

function get() {
  return { state: { ..._state }, regime: computeRegime(_state) };
}

function recentHistory(limit = 20) {
  return _history.slice(-limit);
}

function _emit(type, data) {
  if (_bus && typeof _bus.emit === 'function') _bus.emit(type, data);
}

module.exports = { init, apply, get, recentHistory, computeRegime, EVENT_NUDGES, MODULE_ID, VERSION };
