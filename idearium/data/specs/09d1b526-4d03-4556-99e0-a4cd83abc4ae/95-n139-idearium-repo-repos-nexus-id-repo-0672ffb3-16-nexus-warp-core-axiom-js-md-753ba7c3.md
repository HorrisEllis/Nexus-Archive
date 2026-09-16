---
chunk_uuid: 753ba7c3-678c-485c-9bd1-d6f3ddf10d6a
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-repo-repos-nexus-id-repo-0672ffb3-16-nexus-warp-core-axiom-js-md
title: n139/idearium/repo/repos/nexus-id-repo-0672ffb3/16-nexus-warp-core-axiom-js.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-16-nexus-warp-core-axiom-js-md
contract_id: spec-contract:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-16-nexus-warp-core-axiom-js-md:753ba7c3
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:18:25.065Z
---

'use strict';
/**
 * Axiom — an enforced invariant, same standing as Gate.
 *
 * This is the primitive the SISO paper doesn't have. Its constraints
 * (immutability, purity, single-responsibility) are prose above the code —
 * nothing in Gate.transform() stops a violation. An Axiom does: it's a
 * predicate the Stream runs against every transform. A hard violation
 * rejects the transform outright — logged, never silently completed.
 */
// v1.4 — "axiom cost weighting." hard axioms weight 1.0, soft weight 0.3
// by default (spec's declared values). The weight is NOT used to skip
// hard axioms under any condition — that would contradict Axiom's own
// stated purpose ("a hard violation rejects the transform outright,
// logged, never swallowed") a few lines above. What weight actually
// gates, in dispatch/index.js's evaluation loop, is: (a) evaluation
// order — highest weight first, so a cheap hard-axiom short-circuit
// doesn't wait behind an expensive soft one — and (b) whether a SOFT
// axiom may be skipped when this exact digest already passed it before
// (skip_if_cache_verified). Hard axioms always run, every time, full
// stop.
const DEFAULT_WEIGHTS = { hard: 1.0, soft: 0.3 };

class Axiom {
  constructor(id, { check, severity = 'hard', version = '1.0.0', weight = null } = {}) {
    if (!id || typeof id !== 'string') {
      throw new Error('[warp/Axiom] id must be a non-empty string');
    }
    if (typeof check !== 'function') {
      throw new Error(`[warp/Axiom:${id}] check must be a function`);
    }
    if (severity !== 'hard' && severity !== 'soft') {
      throw new Error(`[warp/Axiom:${id}] severity must be 'hard' or 'soft'`);
    }
    this.id = id;
    this.check = check; // (event, gate, streamState) -> bool. true = passes.
    this.severity = severity;
    this.version = version; // NEW — changing check logic bumps this so
                             // cached results under the old rule invalidate
                             // instead of silently surviving a rule change.
    this.weight = weight !== null ? weight : DEFAULT_WEIGHTS[severity];
  }
}

module.exports = { Axiom, DEFAULT_WEIGHTS };