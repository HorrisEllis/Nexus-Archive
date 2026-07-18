---
chunk_uuid: 37d6e2f3-d87a-4f64-82c3-fcb4f240c08a
spec_uuid: 789cf80c-57e7-4379-a769-48998719a4db
section: intent-failure-conditions
title: intent — failure_conditions
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:789cf80c:intent-failure-conditions
contract_id: spec-contract:789cf80c:intent-failure-conditions:37d6e2f3
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:52:12.830Z
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
