'use strict';
/**
 * cortex/intelligence/mastermind.js
 * comp_id: nexus.cortex.intelligence.mastermind
 * uuid: nexus-cortex-mastermind-v1-0000-2026-0627-jamesbrooks-001
 * spec: docs/cortex-dual-cognition.spec
 *
 * MASTERMIND — Cortex's strategic cognitive faculty.
 * Pattern recognition + strategy + prediction engine.
 * Uses: CFR causal graph, compound effects, bidirectional causal chains,
 *       counterfactual reasoning, confidence scoring, semantic layer.
 *
 * Returns:
 *   - Predicted next gap (from precursor patterns)
 *   - Causal chain narrative (A caused B which caused C)
 *   - Counterfactual: "if X had not happened, Y would not have occurred"
 *   - Strategic recommendation
 *   - Confidence score (0-1) with what's missing below 0.8
 *
 * Below 80% confidence → flag what's missing, ask co-pilot to query user.
 */

'use strict';

const { jaaDB }        = require('../memory/jaa-db');
const { CausalGraph }  = require('../../lib/cfr/graph');

const MODULE_ID = 'cortex/intelligence/mastermind';
const VERSION   = '1.0.0';
const CONFIDENCE_THRESHOLD = 0.80;

// ── Read precursor patterns (what reliably precedes failures) ─────────────────
function _getPrecursors(limit = 20) {
  try {
    return jaaDB.query('bep_patterns',
      r => r.is_precursor === true && (r.confidence || 0) >= 0.6, limit
    ).sort((a, b) => (b.count || 0) - (a.count || 0));
  } catch(_) { return []; }
}

// ── Read recent event sequence ────────────────────────────────────────────────
function _getRecentEvents(n = 30) {
  try {
    const cutoff = Date.now() - 300000; // last 5 min
    return jaaDB.query('event_log', r => r.ts >= cutoff, n)
      .sort((a, b) => (b.ts || 0) - (a.ts || 0));
  } catch(_) { return []; }
}

// ── Read open gaps ────────────────────────────────────────────────────────────
function _getOpenGaps(limit = 10) {
  try {
    return jaaDB.query('gaps', g => g.status === 'open', limit)
      .sort((a, b) => {
        const sev = { critical: 0, high: 1, medium: 2, low: 3 };
        return (sev[a.severity] || 2) - (sev[b.severity] || 2);
      });
  } catch(_) { return []; }
}

// ── Read sigma trajectory ─────────────────────────────────────────────────────
function _getSigmaTrajectory(windowMs = 300000) {
  try {
    const cutoff = Date.now() - windowMs;
    const rows   = jaaDB.query('sigma_records', r => r.ts >= cutoff, 200)
      .sort((a, b) => a.ts - b.ts);
    if (rows.length < 3) return null;

    // Compute slope (is sigma rising or falling?)
    const first = rows[0].sigma || 0;
    const last  = rows[rows.length - 1].sigma || 0;
    const slope = (last - first) / (rows[rows.length-1].ts - rows[0].ts);
    const trend = slope > 0.0001 ? 'rising' : slope < -0.0001 ? 'falling' : 'stable';

    return { first, last, slope, trend, count: rows.length };
  } catch(_) { return null; }
}

// ── Predict next gap from precursor patterns ──────────────────────────────────
function predictNextGap(recentEvents) {
  const precursors = _getPrecursors(20);
  if (!precursors.length || !recentEvents.length) return null;

  const recentTypes = recentEvents.map(e => e.type || '').filter(Boolean);
  const predictions = [];

  for (const pattern of precursors) {
    const precType = pattern.precursor || pattern.signature || '';
    // Check if this precursor type appears in recent events
    const matches = recentTypes.filter(t => t.includes(precType.split('.')[0])).length;
    if (matches > 0) {
      const confidence = Math.min(0.99, (pattern.confidence || 0.6) * (matches / recentTypes.length * 10));
      predictions.push({
        precursor:  precType,
        predicted:  pattern.outcome || 'failure',
        confidence,
        count:      pattern.count || 1,
        evidence:   `${matches} occurrences of "${precType}" in last ${recentEvents.length} events`,
      });
    }
  }

  return predictions.sort((a, b) => b.confidence - a.confidence)[0] || null;
}

// ── Bidirectional causal chain narrative ──────────────────────────────────────
function buildCausalNarrative(eventType, maxDepth = 4) {
  try {
    const graph = new CausalGraph();
    // Find nodes matching this event type
    const nodes = graph.getAllNodes ? graph.getAllNodes() : [];
    const match = nodes.find(n => (n.type || n.id || '').includes(eventType));
    if (!match) return null;

    // Get ancestors (what caused this) and descendants (what this caused)
    const ancestors   = graph.ancestors   ? graph.ancestors(match.id,   maxDepth) : [];
    const descendants = graph.descendants ? graph.descendants(match.id, maxDepth) : [];

    if (!ancestors.length && !descendants.length) return null;

    const lines = [];
    if (ancestors.length) {
      lines.push(`Causes (${ancestors.length}):`);
      ancestors.slice(0, 3).forEach(a => lines.push(`  ← ${a.type || a.id}`));
    }
    lines.push(`  → [${eventType}]`);
    if (descendants.length) {
      lines.push(`Effects (${descendants.length}):`);
      descendants.slice(0, 3).forEach(d => lines.push(`  → ${d.type || d.id}`));
    }
    return lines.join('\n');
  } catch(_) { return null; }
}

// ── Confidence aggregation across all evidence ────────────────────────────────
function aggregateConfidence(evidence = []) {
  if (!evidence.length) return 0;
  // Weighted average — more sources = higher confidence ceiling
  const weights = evidence.map(e => e.weight || 0.5);
  const scores  = evidence.map(e => e.score  || e.confidence || 0);
  const total   = weights.reduce((s, w) => s + w, 0);
  const weighted = scores.reduce((s, sc, i) => s + sc * weights[i], 0);
  const raw = total > 0 ? weighted / total : 0;

  // Multi-source bonus: 3+ sources → up to +10% confidence
  const multiBonus = Math.min(0.1, (evidence.length - 1) * 0.025);
  return Math.min(0.99, raw + multiBonus);
}

/**
 * Main MASTERMIND analysis function.
 * @param {string} query
 * @param {object} context — { intent, sessionId, recentEvents }
 * @returns {object} analysis result with confidence
 */
function analyze(query = '', context = {}) {
  const lower = (query || '').toLowerCase();
  const recentEvents = context.recentEvents || _getRecentEvents(30);
  const openGaps     = _getOpenGaps(5);
  const sigmaTraj    = _getSigmaTrajectory();

  const evidence   = [];
  const findings   = [];
  let   confidence = 0;
  const missing    = []; // what would increase confidence

  // ── 1. Predicted next gap ────────────────────────────────────────────────
  const prediction = predictNextGap(recentEvents);
  if (prediction) {
    evidence.push({ type: 'prediction', score: prediction.confidence, weight: 0.8 });
    findings.push(`PREDICTED NEXT GAP: "${prediction.predicted}" — ${prediction.evidence} (${Math.round(prediction.confidence*100)}% confidence)`);
  } else {
    missing.push('more event history to predict next failure');
  }

  // ── 2. Sigma trajectory ──────────────────────────────────────────────────
  if (sigmaTraj) {
    const sigConf = sigmaTraj.trend === 'rising' ? 0.85 : 0.7;
    evidence.push({ type: 'sigma_trajectory', score: sigConf, weight: 0.7 });
    findings.push(`SIGMA TRAJECTORY: ${sigmaTraj.trend} (${sigmaTraj.first.toFixed(3)} → ${sigmaTraj.last.toFixed(3)}, slope=${sigmaTraj.slope.toFixed(6)})`);
    if (sigmaTraj.trend === 'rising') {
      findings.push('⚠ Rising sigma — system instability increasing. Strategic action advised.');
    }
  } else {
    missing.push('sigma history (sigma_records table needs more data)');
  }

  // ── 3. Open gaps analysis ────────────────────────────────────────────────
  if (openGaps.length) {
    evidence.push({ type: 'open_gaps', score: 0.9, weight: 0.6 });
    const critHigh = openGaps.filter(g => ['critical','high'].includes(g.severity));
    findings.push(`OPEN GAPS: ${openGaps.length} total, ${critHigh.length} critical/high. Top: "${openGaps[0]?.type || '?'}" (${openGaps[0]?.severity})`);

    // Strategic recommendation from gap pattern
    if (critHigh.length >= 3) {
      findings.push('STRATEGIC: Multiple high-severity gaps — consider pausing auto-heal and doing manual RCA.');
    }
  }

  // ── 4. Causal narrative for top gap ─────────────────────────────────────
  if (openGaps.length) {
    const topType = openGaps[0]?.type;
    if (topType) {
      const narrative = buildCausalNarrative(topType);
      if (narrative) {
        evidence.push({ type: 'causal_chain', score: 0.75, weight: 0.5 });
        findings.push(`CAUSAL CHAIN for "${topType}":\n${narrative}`);
      }
    }
  }

  // ── 5. Confidence scoring ────────────────────────────────────────────────
  confidence = aggregateConfidence(evidence);

  // ── Confidence gate ──────────────────────────────────────────────────────
  const belowThreshold = confidence < CONFIDENCE_THRESHOLD;
  let clarifyRequest = null;

  if (belowThreshold && missing.length) {
    clarifyRequest = `I'm ${Math.round(confidence*100)}% confident. To improve: ${missing.slice(0,2).join(', ')}.`;
  }

  return {
    findings,
    confidence,
    evidence,
    prediction,
    sigmaTrend:      sigmaTraj?.trend || 'unknown',
    openGaps:        openGaps.length,
    belowThreshold,
    clarifyRequest,
    missing,
    faculty:         'MASTERMIND',
    version:         VERSION,
    ts:              Date.now(),
  };
}

/**
 * Counterfactual — "if X had not happened, what would have been different?"
 */
function counterfactual(eventUuid) {
  try {
    const event = jaaDB.query('event_log', e => e.uuid === eventUuid, 1)[0];
    if (!event) return { ok: false, error: 'Event not found' };

    const graph = new CausalGraph();
    const descendants = graph.descendants ? graph.descendants(eventUuid, 5) : [];

    if (!descendants.length) {
      return { ok: true, eventType: event.type,
        counterfactual: `No downstream effects found for event "${event.type}". It may have been a terminal event.`,
        prevented: [] };
    }

    return {
      ok: true,
      eventType:      event.type,
      counterfactual: `If "${event.type}" had not occurred, ${descendants.length} downstream events would not have fired.`,
      prevented:      descendants.slice(0, 5).map(d => d.type || d.id),
      confidence:     0.7,
    };
  } catch(e) { return { ok: false, error: e.message }; }
}

function status() {
  const precursors  = _getPrecursors(5);
  const recentEvs   = _getRecentEvents(10);
  const sigmaTraj   = _getSigmaTrajectory();
  const prediction  = predictNextGap(recentEvs);
  return {
    precursors:   precursors.length,
    topPrecursor: precursors[0]?.signature,
    sigmaTrajectory: sigmaTraj?.trend || 'unknown',
    nextPrediction:  prediction?.predicted || null,
    predictionConf:  prediction?.confidence?.toFixed(2) || null,
    threshold:    CONFIDENCE_THRESHOLD,
    version:      VERSION,
  };
}

module.exports = { analyze, predictNextGap, counterfactual, aggregateConfidence, status, MODULE_ID, VERSION, CONFIDENCE_THRESHOLD };
