---
chunk_uuid: 0567ecff-b963-4e11-9e5b-b800e4f82a03
spec_uuid: d9ee9fa1-eb73-47a2-a867-38ddffc2a46e
section: intent-failure-conditions
title: intent — failure_conditions
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:d9ee9fa1:intent-failure-conditions
contract_id: spec-contract:d9ee9fa1:intent-failure-conditions:0567ecff
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T08:06:57.158Z
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
