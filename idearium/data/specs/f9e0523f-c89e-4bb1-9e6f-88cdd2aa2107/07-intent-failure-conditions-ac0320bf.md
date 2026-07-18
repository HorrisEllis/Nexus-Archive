---
chunk_uuid: ac0320bf-1823-4757-aa26-86b98c6cd380
spec_uuid: f9e0523f-c89e-4bb1-9e6f-88cdd2aa2107
section: intent-failure-conditions
title: intent — failure_conditions
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:f9e0523f:intent-failure-conditions
contract_id: spec-contract:f9e0523f:intent-failure-conditions:ac0320bf
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T20:12:09.891Z
---

<!-- imported: intent → failure_conditions -->


    failure_conditions:
      - InvariantViolationError thrown during normal operation (any invariant group).
      - Ring eviction does not call pruneEdgesFor — edge graph grows unbounded (H-1 violated).
      - query module accesses stale typeIndex after kernel.reset() without defensive copy (H-3 violated).
      - forge produces syntactically invalid ES module output that fails loader evaluation.
      - recoverStore() returns ok:false with errors for a WAL produced by a clean shutdown.
      - version-gate allows a major-version mismatched artifact to hydrate silently (VM-1 violated).
      - promoteIdea() succeeds without a valid entry type — unvalidated idea enters UpgradeLedger.
