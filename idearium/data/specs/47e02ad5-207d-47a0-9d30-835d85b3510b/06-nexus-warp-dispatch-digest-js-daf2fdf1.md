---
chunk_uuid: daf2fdf1-6345-418f-84b6-429c84bf5bf3
spec_uuid: 47e02ad5-207d-47a0-9d30-835d85b3510b
section: nexus-warp-dispatch-digest-js
title: nexus/warp/dispatch/digest.js
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:47e02ad5:nexus-warp-dispatch-digest-js
contract_id: spec-contract:47e02ad5:nexus-warp-dispatch-digest-js:daf2fdf1
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-15T20:05:11.959Z
---

'use strict';
const crypto = require('crypto');
const { canonicalize } = require('./canonicalize');

/**
 * digest.js — content-addressable cache key. Bazel/Buck2's exact pattern:
 * hash(gate signature + versioned axiom set + canonicalized event content)
 * -> deterministic digest.
 *
 * v1.0.1 fix: the original version hashed Object.keys(event.data) only —
 * shape, not content. Two events with identical keys but different values
 * ("label: Submit" vs "label: Cancel") produced the same digest and would
 * wrongly cache-hit with the wrong output. Confirmed by direct code read,
 * not theoretical — fixed here by canonicalizing full content, recursively,
 * with sorted keys at every level so key-order never affects the hash.
 *
 * v1.4: canonicalization now delegates to dispatch/canonicalize.js (the
 * "canonicalization pipeline" from the spec patch) instead of a private
 * local copy, so the exact-cache digest and the fuzzy structural-similarity
 * check in pregen.js are guaranteed to agree on what "the same shape"
 * means. _canonicalize is kept exported under its old name for anything
 * that imported it directly from here.
 */
function computeDigest({ gateSignature, axioms = [], eventData }) {
  // axioms: array of Axiom instances or {id, version} — versioned so a
  // changed axiom (different check logic) invalidates old cache entries
  // instead of silently reusing output verified under an old rule.
  const axiomKeys = axioms
    .map(a => `${a.id}@${a.version || '1.0.0'}`)
    .sort();

  const canonical = JSON.stringify({
    g: gateSignature,
    a: axiomKeys,
    d: canonicalize(eventData),
  });
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

module.exports = { computeDigest, _canonicalize: canonicalize };