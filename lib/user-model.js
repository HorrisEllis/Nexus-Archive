'use strict';
// ── lib/user-model.js ─────────────────────────────────────────────────────────
// UUID: nexus-user-model-v1-0000-4000-0000-000000000001
// Version: 1.0.0
// Phase: 12 — User Model: Hypotheses, Not Profile
// Deps:  Phase 10 ✓ · Phase 11 ✓ · bda ✓ · jaa ✓
// Unlocks: Phase 13 (Autonomous Loop)
//
// A hypothesis store, not a profile. Nothing about the person is ever stored
// as settled fact — every belief carries its own confidence and the count of
// evidence that produced it. Profiles assert; hypotheses are held loosely and
// can be wrong. This module never lets that distinction collapse.
//
// ── WHAT IT TRACKS (per spec) ──────────────────────────────────────────────────
//   preferences          — provider choice, prompt style
//   pace                 — how fast responses are consumed (gap between turns)
//   communication_style  — technical depth, verbosity
//
// ── WHERE THE EVIDENCE COMES FROM ───────────────────────────────────────────────
// chat-logger.js already writes provider, contentLength, ts, and bdaSignals
// (valence/certainty/openness/tension/selfref from lib/meta/bda's stateless
// extract()) onto every chat_log row. That data is already flowing — this
// module reads it rather than re-deriving sentiment itself. Two unrelated BDA
// surfaces exist in this codebase (lib/meta/bda/index.js's stateless extract,
// and lib/meta/bda/kernel.js's stateful singleton that Phase 11 feeds). This
// module reads from chat_log (populated via the former); it does not touch
// the kernel singleton at all — that would be reading the wrong BDA.
//
// ── DECAY (§ spec: confidence -0.1/day without reinforcement) ──────────────────
// Decay is a view-time transform, not a background mutation. Stored confidence
// is the actual evidence-derived value; effectiveConfidence() computes what it
// has decayed to as of "now" without ever overwriting the stored number. This
// keeps the stored value auditable — you can always see what the evidence
// actually supported, separately from how stale it's become.
//
// ── NEVER SHARED EXTERNALLY (per spec) ──────────────────────────────────────────
// This module has no network-facing export. Every function here operates on
// local JAA data only. Nothing in this file makes an outbound call.
//
// §1.1  Every observation has a UUID — nothing stored as fact without evidence
// §4.3  confidence + evidence count on every belief, never inferred silently

const crypto = require('crypto');

const MODULE_ID = 'user-model';
const VERSION   = '1.0.0';

const TABLE = 'user_model_hypotheses';
const DECAY_PER_DAY = parseFloat(process.env.USER_MODEL_DECAY_PER_DAY || '0.1');
const MIN_CONFIDENCE = 0.05; // never decay fully to zero — a hypothesis with some history still has some weight
const PACE_WINDOW_N  = 10;   // turns considered when computing a pace hypothesis

const CATEGORY = {
  PREFERENCE:           'preference',
  PACE:                 'pace',
  COMMUNICATION_STYLE:  'communication_style',
};

// ── Lazy-load dependencies (never block boot) ─────────────────────────────────
let _jaa, _uid, _taxonomy;

function _getJAA() {
  if (_jaa) return _jaa;
  try { ({ jaaDB: _jaa, uid: _uid } = require('../cortex/memory/jaa-db')); } catch (_) {}
  return _jaa;
}
function uid() { return _uid?.() ?? crypto.randomUUID(); }

function _getTaxonomy() {
  if (_taxonomy) return _taxonomy;
  try { _taxonomy = require('./open-loop-taxonomy'); } catch (_) {}
  return _taxonomy;
}

// ── Decay (view-time, never mutates the stored row) ────────────────────────────
function effectiveConfidence(hypothesis, now = Date.now()) {
  if (!hypothesis) return 0;
  const daysSince = Math.max(0, (now - (hypothesis.last_seen || now)) / (24 * 60 * 60 * 1000));
  const decayed = hypothesis.confidence - daysSince * DECAY_PER_DAY;
  return Math.max(MIN_CONFIDENCE, Math.min(1, decayed));
}

// ── Observe — record or reinforce a hypothesis ──────────────────────────────────
// Never overwrites a claim as settled fact. Reinforcing an existing hypothesis
// raises confidence (capped at 1) and increments evidence_count; it does not
// reset confidence to 1 outright — repeated, consistent evidence earns trust
// gradually, the same way the rest of this system treats trust everywhere else.
function observe({ category, claim, source, confidenceDelta = 0.15 }) {
  const jaa = _getJAA();
  if (!jaa) return null;
  if (!Object.values(CATEGORY).includes(category)) {
    throw new Error(`[user-model] unknown category "${category}". Must be one of: ${Object.values(CATEGORY).join(', ')}`);
  }
  if (!claim) throw new Error('[user-model] observe() requires a claim');

  let existing = [];
  try { existing = jaa.query(TABLE, r => r.category === category && r.claim === claim, 1); } catch (_) {}

  const now = Date.now();

  if (existing.length) {
    const row = existing[0];
    const newConfidence = Math.max(MIN_CONFIDENCE, Math.min(1, row.confidence + confidenceDelta));
    const patch = {
      confidence:     newConfidence,
      evidence_count: (row.evidence_count || 0) + 1,
      last_seen:      now,
    };
    try { jaa.update(TABLE, row.uuid, patch); } catch (_) {}
    return { ...row, ...patch };
  }

  const record = {
    uuid: uid(),
    category,
    claim,
    confidence: Math.max(MIN_CONFIDENCE, Math.min(1, confidenceDelta)),
    evidence_count: 1,
    last_seen: now,
    source: source || 'unknown',
    createdAt: now,
  };
  try { jaa.insert(TABLE, record); } catch (_) {}
  return record;
}

// ── Derive hypotheses from chat_log evidence ────────────────────────────────────
// Reads recent chat_log rows (already populated by chat-logger.js with
// provider/contentLength/ts/bdaSignals) and turns observable patterns into
// hypotheses via observe(). This is the only place evidence becomes belief —
// callers never write directly into the confidence field.
function deriveFromChatLog(limit = 50) {
  const jaa = _getJAA();
  if (!jaa) return { derived: 0, reason: 'jaa-unavailable' };

  let rows = [];
  try { rows = jaa.query('chat_log', r => r.role === 'user', limit); } catch (_) { rows = []; }
  if (!rows.length) return { derived: 0, reason: 'no-chat-log-rows' };

  rows.sort((a, b) => a.ts - b.ts);
  let derived = 0;

  // ── Preference: provider choice ─────────────────────────────────────────────
  const providerCounts = new Map();
  for (const r of rows) {
    if (!r.provider) continue;
    providerCounts.set(r.provider, (providerCounts.get(r.provider) || 0) + 1);
  }
  if (providerCounts.size) {
    const [topProvider, topCount] = Array.from(providerCounts.entries()).sort((a, b) => b[1] - a[1])[0];
    if (topCount >= 3) {
      observe({
        category: CATEGORY.PREFERENCE,
        claim: `prefers provider: ${topProvider}`,
        source: 'chat_log:provider_distribution',
        confidenceDelta: Math.min(0.3, topCount * 0.05),
      });
      derived++;
    }
  }

  // ── Pace: gap between consecutive user turns ────────────────────────────────
  const recentTurns = rows.slice(-PACE_WINDOW_N);
  if (recentTurns.length >= 3) {
    const gaps = [];
    for (let i = 1; i < recentTurns.length; i++) {
      gaps.push(recentTurns[i].ts - recentTurns[i - 1].ts);
    }
    const avgGapMs = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const avgGapSec = avgGapMs / 1000;
    let paceClaim = null;
    if (avgGapSec < 15)       paceClaim = 'fast pace — responses consumed quickly, short gaps between turns';
    else if (avgGapSec > 120) paceClaim = 'slow/deliberate pace — long gaps between turns';
    if (paceClaim) {
      observe({ category: CATEGORY.PACE, claim: paceClaim, source: 'chat_log:turn_gap_analysis', confidenceDelta: 0.15 });
      derived++;
    }
  }

  // ── Communication style: verbosity + technical depth ────────────────────────
  const lengths = rows.map(r => r.contentLength || 0).filter(Boolean);
  if (lengths.length >= 3) {
    const avgLen = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const styleClaim = avgLen > 300
      ? 'verbose communication style — longer messages, more context provided per turn'
      : avgLen < 60
        ? 'terse communication style — short messages, minimal context per turn'
        : null;
    if (styleClaim) {
      observe({ category: CATEGORY.COMMUNICATION_STYLE, claim: styleClaim, source: 'chat_log:message_length', confidenceDelta: 0.15 });
      derived++;
    }
  }

  // bdaSignals.certainty (already extracted by chat-logger via lib/meta/bda's
  // stateless extract()) — high average certainty across recent turns suggests
  // a direct, low-hedging communication style.
  const certainties = rows.map(r => r.bdaSignals?.certainty).filter(c => typeof c === 'number');
  if (certainties.length >= 3) {
    const avgCertainty = certainties.reduce((a, b) => a + b, 0) / certainties.length;
    if (avgCertainty > 0.7) {
      observe({
        category: CATEGORY.COMMUNICATION_STYLE,
        claim: 'direct communication style — low hedging, high stated certainty',
        source: 'chat_log:bdaSignals.certainty',
        confidenceDelta: 0.15,
      });
      derived++;
    }
  }

  return { derived, rowsConsidered: rows.length };
}

// ── Query — for request-handler Phase B context injection ──────────────────────
// Returns hypotheses with decay already applied, filtered to a minimum
// effective confidence so stale, unreinforced beliefs don't leak into context
// injection as if they were still strong signal. Never returns the raw stored
// confidence without decay applied — that would silently misrepresent how
// current a belief actually is.
function getHypotheses({ category = null, minConfidence = 0.3, limit = 20 } = {}) {
  const jaa = _getJAA();
  if (!jaa) return [];

  let rows = [];
  try { rows = jaa.query(TABLE, r => !category || r.category === category, 500); } catch (_) { rows = []; }

  const now = Date.now();
  return rows
    .map(r => ({ ...r, effectiveConfidence: effectiveConfidence(r, now) }))
    .filter(r => r.effectiveConfidence >= minConfidence)
    .sort((a, b) => b.effectiveConfidence - a.effectiveConfidence)
    .slice(0, limit);
}

// Convenience: a short context-injection string for request-handler Phase B.
// Never includes raw chat content — only the hypothesis claims themselves,
// each clearly marked with its confidence so a consumer (human or LLM) can
// weigh it appropriately rather than treat it as fact.
function buildContextSummary(opts = {}) {
  const hyps = getHypotheses(opts);
  if (!hyps.length) return '';
  return hyps
    .map(h => `[${h.category}] ${h.claim} (confidence: ${h.effectiveConfidence.toFixed(2)}, evidence: ${h.evidence_count})`)
    .join('\n');
}

// ── Conflicting hypothesis detection ────────────────────────────────────────────
// Two hypotheses in the same category that look contradictory should not just
// sit side by side silently — that's exactly the CONFLICT loop type this
// codebase already has a taxonomy for. Heuristic only (string-pair based);
// false positives are cheap (a flagged-but-fine pair), false negatives just
// mean no flag — never auto-resolved either way.
const _CONTRADICTION_PAIRS = [
  ['fast pace', 'slow/deliberate pace'],
  ['verbose communication style', 'terse communication style'],
];

function checkContradictions() {
  const jaa = _getJAA();
  const taxonomy = _getTaxonomy();
  if (!jaa) return [];

  const all = getHypotheses({ minConfidence: 0 });
  const flagged = [];

  for (const [a, b] of _CONTRADICTION_PAIRS) {
    const matchA = all.find(h => h.claim.includes(a));
    const matchB = all.find(h => h.claim.includes(b));
    if (matchA && matchB && matchA.effectiveConfidence > 0.3 && matchB.effectiveConfidence > 0.3) {
      flagged.push({ a: matchA, b: matchB });
      if (taxonomy) {
        try {
          const loop = taxonomy.createLoop({
            loop_type: 'CONFLICT',
            source: MODULE_ID,
            path: `user-model/${matchA.category}`,
            body: `Contradictory hypotheses both hold meaningful confidence: "${matchA.claim}" vs "${matchB.claim}".`,
            evidence: [`${matchA.claim} (confidence ${matchA.effectiveConfidence.toFixed(2)})`, `${matchB.claim} (confidence ${matchB.effectiveConfidence.toFixed(2)})`],
            closure_condition: 'Further evidence resolves which hypothesis is more accurate, or both are reclassified as context-dependent rather than contradictory.',
          });
          jaa.insert('gaps', { uuid: uid(), ...loop, createdAt: Date.now() });
        } catch (_) {}
      }
    }
  }

  return flagged;
}

function validateWiring() {
  const checks = { jaa: !!_getJAA(), taxonomy: !!_getTaxonomy() };
  const online = Object.values(checks).filter(Boolean).length;
  console.log(`[${MODULE_ID}] wiring: ${online}/${Object.keys(checks).length} systems reachable`);
  return checks;
}

module.exports = {
  observe, deriveFromChatLog, getHypotheses, buildContextSummary,
  checkContradictions, effectiveConfidence, validateWiring,
  CATEGORY, MODULE_ID, VERSION,
};
