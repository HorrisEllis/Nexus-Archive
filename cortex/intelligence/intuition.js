'use strict';
/**
 * cortex/intelligence/intuition.js
 * comp_id: nexus.cortex.intelligence.intuition
 * uuid: nexus-cortex-intuition-v1-0000-2026-0627-jamesbrooks-001
 * spec: docs/cortex-dual-cognition.spec
 *
 * INTUITION — Cortex's fast cognitive faculty.
 * Wires what already exists in Cortex into one coherent answering surface.
 * No model. No Ollama. Answers from crystallised knowledge only.
 * Falls through (returns null) if confidence < 0.8.
 *
 * Sources (all pre-existing):
 *   BEP patterns      cortex/intelligence/index.js _patternIndex
 *   SNR filter        cortex/core/raid/snr-filter.js
 *   Liminal space     cortex/liminal-space/index.js
 *   Sigma writer      lib/sigma-writer.js (sigma_records)
 *   Crystal lattice   JAA bep_patterns (crystallised=true, confidence>0.7)
 *   User model        JAA user_model_hypotheses
 *
 * Returns: { answer, confidence, source, evidence[], reasoning } | null
 */

'use strict';

const { jaaDB } = require('../memory/jaa-db');
const CONFIDENCE_THRESHOLD = 0.80;

const MODULE_ID = 'cortex/intelligence/intuition';
const VERSION   = '1.0.0';

// ── Read crystallised patterns from JAA ───────────────────────────────────────
function _getCrystals(limit = 20) {
  try {
    return jaaDB.query('bep_patterns',
      r => r.crystallised === true && (r.confidence || 0) >= 0.7, limit
    ).sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
  } catch(_) { return []; }
}

// ── Read recent sigma from JAA ────────────────────────────────────────────────
function _getRecentSigma(windowMs = 60000) {
  try {
    const cutoff = Date.now() - windowMs;
    const rows   = jaaDB.query('sigma_records', r => r.ts >= cutoff, 100);
    if (!rows.length) return null;
    const avg = rows.reduce((s, r) => s + (r.sigma || 0), 0) / rows.length;
    const max = Math.max(...rows.map(r => r.sigma || 0));
    return { avg, max, count: rows.length };
  } catch(_) { return null; }
}

// ── Read user model hypotheses ────────────────────────────────────────────────
function _getHighConfidenceHypotheses(minConf = 0.7) {
  try {
    return jaaDB.query('user_model_hypotheses',
      h => (h.status === 'active' || !h.status) && (h.confidence || 0) >= minConf, 10
    );
  } catch(_) { return []; }
}

// ── Read liminal focal points ─────────────────────────────────────────────────
function _getLiminalFocalPoints() {
  try {
    return jaaDB.query('interstitial_spaces', r => r.leverage > 1.5, 5)
      .sort((a, b) => (b.leverage || 0) - (a.leverage || 0));
  } catch(_) { return []; }
}

// ── Read fault taxonomy for known fault classes ───────────────────────────────
function _getKnownFaults() {
  try {
    return jaaDB.query('fault_taxonomy', () => true, 50);
  } catch(_) { return []; }
}

/**
 * Main INTUITION answer function.
 * @param {string} query — the question or event description
 * @param {object} context — { intent, eventType, systemId, sessionId }
 * @returns {object|null} { answer, confidence, source, evidence, reasoning } or null
 */
function answer(query = '', context = {}) {
  const lower = (query || '').toLowerCase().trim();
  const evidence = [];
  let confidence = 0;
  let answer = null;
  let source = null;
  let reasoning = '';

  // ── 1. Check crystallised patterns ────────────────────────────────────────
  const crystals = _getCrystals(20);
  if (crystals.length) {
    // Does this query match a known pattern signature?
    const match = crystals.find(c => {
      const sig = (c.signature || c.precursor || '').toLowerCase();
      return sig && lower.includes(sig.slice(0, 20));
    });
    if (match) {
      confidence = Math.max(confidence, match.confidence || 0.75);
      evidence.push({ type: 'crystal', pattern: match.signature, confidence: match.confidence, count: match.count });
      answer = `Pattern match: "${match.signature}" — observed ${match.count}× with ${Math.round((match.confidence||0)*100)}% confidence. ${match.outcome ? 'Outcome: ' + match.outcome : ''}`;
      source = 'bep_patterns';
      reasoning = `Crystallised BEP pattern matched on "${match.signature}"`;
    }
  }

  // ── 2. Check sigma state ──────────────────────────────────────────────────
  const sigma = _getRecentSigma();
  if (sigma) {
    evidence.push({ type: 'sigma', avg: sigma.avg, max: sigma.max, count: sigma.count });
    if (sigma.max >= 0.7) {
      // High sigma — this is a direct answer if query is about system state
      if (/sigma|diverge|unstable|drift|health|state/.test(lower)) {
        const conf = 0.9;
        confidence = Math.max(confidence, conf);
        answer = `System sigma CRITICAL: max=${sigma.max.toFixed(3)} avg=${sigma.avg.toFixed(3)} (${sigma.count} records last 60s). System diverging — autonomous actions halted.`;
        source = 'sigma_records';
        reasoning = 'High sigma detected in rolling window — autonomous halt threshold breached';
      }
    } else if (sigma.avg < 0.2 && !answer) {
      // Low sigma — system nominal
      if (/status|health|ok|fine|good|stable|nominal/.test(lower)) {
        confidence = Math.max(confidence, 0.85);
        answer = `System sigma nominal: avg=${sigma.avg.toFixed(3)} (${sigma.count} readings last 60s). No divergence detected.`;
        source = 'sigma_records';
        reasoning = 'Low rolling sigma — system within normal operating range';
      }
    }
  }

  // ── 3. Check known fault classes (invariant coverage) ────────────────────
  const faults = _getKnownFaults();
  if (faults.length && !answer) {
    const matchedFault = faults.find(f => {
      const fc = (f.faultClass || '').toLowerCase();
      return fc && lower.includes(fc);
    });
    if (matchedFault && matchedFault.friction >= 0.7) {
      confidence = Math.max(confidence, 0.82);
      answer = `Known fault class: "${matchedFault.faultClass}" — friction=${matchedFault.friction.toFixed(2)}, seen ${matchedFault.count || 1}× in taxonomy. ${matchedFault.fix || ''}`;
      source = 'fault_taxonomy';
      reasoning = `Fault taxonomy match on "${matchedFault.faultClass}"`;
      evidence.push({ type: 'fault', faultClass: matchedFault.faultClass, friction: matchedFault.friction });
    }
  }

  // ── 4. Check user model for personalized context ──────────────────────────
  const hyps = _getHighConfidenceHypotheses();
  if (hyps.length) {
    evidence.push({ type: 'user_model', count: hyps.length, top: hyps[0]?.claim });
  }

  // ── 5. Check liminal focal points (leverage > 1.5 = high-impact boundary) ─
  const focal = _getLiminalFocalPoints();
  if (focal.length && /focal|leverage|bottleneck|critical|most important/.test(lower)) {
    const top = focal[0];
    confidence = Math.max(confidence, 0.85);
    answer = `Highest leverage focal point: "${top.loop_type || top.name || '?'}" (leverage: ${top.leverage?.toFixed(2)}). ${top.description || ''} Affects ${top.loopsAffected || '?'} loops.`;
    source = 'interstitial_spaces';
    reasoning = 'Liminal space focal point matched — highest leverage boundary condition';
    evidence.push({ type: 'focal', leverage: top.leverage, loop_type: top.loop_type });
  }

  // ── Confidence gate ───────────────────────────────────────────────────────
  if (!answer || confidence < CONFIDENCE_THRESHOLD) {
    // Log that INTUITION fell through
    return null; // → MASTERMIND takes over
  }

  return {
    answer,
    confidence,
    source,
    evidence,
    reasoning,
    faculty: 'INTUITION',
    version: VERSION,
    ts: Date.now(),
  };
}

/**
 * Get the current confidence score for a topic without producing an answer.
 * Used by co-pilot to decide whether to ask the user for more context.
 */
function confidenceScore(query = '') {
  const result = answer(query, {});
  return result ? result.confidence : 0;
}

/**
 * Status — what INTUITION knows right now.
 */
function status() {
  const crystals = _getCrystals(5);
  const sigma    = _getRecentSigma();
  const hyps     = _getHighConfidenceHypotheses();
  const focal    = _getLiminalFocalPoints();
  return {
    crystals: crystals.length,
    topCrystal: crystals[0]?.signature,
    sigma: sigma?.avg?.toFixed(3),
    hypotheses: hyps.length,
    focalPoints: focal.length,
    threshold: CONFIDENCE_THRESHOLD,
    version: VERSION,
  };
}

module.exports = { answer, confidenceScore, status, MODULE_ID, VERSION, CONFIDENCE_THRESHOLD };
