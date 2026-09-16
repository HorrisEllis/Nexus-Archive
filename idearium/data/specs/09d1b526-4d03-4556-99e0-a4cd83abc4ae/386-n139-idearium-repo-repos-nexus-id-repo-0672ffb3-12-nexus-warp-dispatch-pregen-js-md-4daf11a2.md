---
chunk_uuid: 4daf11a2-6004-41d1-a10f-ddf5546c35ef
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-repo-repos-nexus-id-repo-0672ffb3-12-nexus-warp-dispatch-pregen-js-md
title: n139/idearium/repo/repos/nexus-id-repo-0672ffb3/12-nexus-warp-dispatch-pregen-js.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-12-nexus-warp-dispatch-pregen-js-md
contract_id: spec-contract:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-12-nexus-warp-dispatch-pregen-js-md:4daf11a2
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:23:52.733Z
---

'use strict';
/**
 * pregen.js — v1.4 "pre-generation filter layer."
 *
 * Placement matters: this runs AFTER the exact-cache miss (step 1) and
 * BEFORE cascade generation (step 3), not before step 1. The spec patch
 * described it as avoiding generation when a "structurally equivalent"
 * solution already exists — that's necessarily fuzzy (similarityScore,
 * not digest equality), so it can only ever be a step *down* from the
 * exact cache, never a replacement for it. Fuzzy-reusing content-bearing
 * output is a correctness trade, not a free win, so:
 *
 *   - it is OFF by default (opts in via unifiedDispatch({ preGeneration }))
 *   - a reuse never bypasses axiom checks — the reused output still runs
 *     through the axiom gate before being returned, same as generated
 *     output. "Faster" never means "less verified."
 *   - every reuse is logged with its similarity score, so a false-positive
 *     reuse is traceable after the fact instead of an invisible cache
 *     poison.
 */
const { similarityScore } = require('./canonicalize');

const DEFAULT_THRESHOLD = 0.87;

/**
 * check({ eventData, population, gateClass, threshold, log })
 * -> { action: 'reuse', variant, score } | { action: 'proceed', bestScore }
 */
function preGenerationCheck({ eventData, population, gateClass, threshold = DEFAULT_THRESHOLD, log = null }) {
  const candidates = population.variantsFor ? population.variantsFor(gateClass) : [];
  let best = null;
  let bestScore = 0;

  for (const variant of candidates) {
    if (variant.sourceEventData === undefined) continue; // no stored sample to compare shape against
    const score = similarityScore(eventData, variant.sourceEventData);
    if (score > bestScore) {
      bestScore = score;
      best = variant;
    }
  }

  if (best && bestScore >= threshold) {
    log?.record({ step: 'pre-generation-filter', result: 'reuse', gateClass, score: bestScore, digest: best.digest });
    return { action: 'reuse', variant: best, score: bestScore };
  }

  log?.record({ step: 'pre-generation-filter', result: 'proceed', gateClass, bestScore });
  return { action: 'proceed', bestScore };
}

module.exports = { preGenerationCheck, DEFAULT_THRESHOLD };