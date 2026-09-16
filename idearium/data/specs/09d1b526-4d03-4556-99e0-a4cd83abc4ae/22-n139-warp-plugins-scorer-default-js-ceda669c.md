---
chunk_uuid: ceda669c-987a-42b3-9645-387fda5696b9
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-warp-plugins-scorer-default-js
title: n139/warp/plugins/scorer-default.js
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-warp-plugins-scorer-default-js
contract_id: spec-contract:09d1b526:n139-warp-plugins-scorer-default-js:ceda669c
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:17:29.707Z
---

'use strict';
/**
 * scorer-default.js — five-axis fitness (coherence/friction/resonance/
 * entropy pattern + tokenEfficiency). Independently written — not
 * NEXUS's lib/cfr/field.js, a portable reimplementation of the idea.
 *
 * v1.1.0: tokenEfficiency added as an explicit axis, not an afterthought.
 * "Use as little tokens as possible" is now something the scorer actually
 * optimizes for, not just something a benchmark happens to measure later.
 * Fewer estimated tokens for equivalent shape-match = higher fitness.
 */
function estimateTokens(output) {
  const s = typeof output === 'string' ? output : JSON.stringify(output ?? '');
  return Math.ceil(s.length / 4); // ~4 chars/token, same rough estimate used in benchmarks
}

function scoreDefault({ axiomFailures = [], output, expectedShapeKeys = [], tokenBudget = null }) {
  const softFailures = axiomFailures.filter(f => f.severity === 'soft').length;
  const coherence = Math.max(0, 1 - softFailures * 0.15);

  let shapeMatch = 1;
  if (expectedShapeKeys.length > 0 && output && typeof output === 'object') {
    const present = expectedShapeKeys.filter(k => k in output).length;
    shapeMatch = present / expectedShapeKeys.length;
  }

  const tokens = estimateTokens(output);
  // No budget given -> neutral 0.5 rather than rewarding/punishing blind.
  // Budget given -> 1.0 at or under budget, decaying as tokens exceed it.
  const tokenEfficiency = tokenBudget
    ? Math.max(0, Math.min(1, tokenBudget / Math.max(tokens, 1)))
    : 0.5;

  const fitness = (coherence * 0.4) + (shapeMatch * 0.35) + (tokenEfficiency * 0.25);
  return Math.max(0, Math.min(1, fitness));
}

module.exports = { scoreDefault, estimateTokens };