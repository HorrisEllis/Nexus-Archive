---
chunk_uuid: c6f657b2-9df2-4c94-9b6d-6c12aee815ac
spec_uuid: 1da21c43-b7e0-4703-93f5-7aed4825dd38
section: intent-failure-conditions
title: intent — failure_conditions
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:1da21c43:intent-failure-conditions
contract_id: spec-contract:1da21c43:intent-failure-conditions:c6f657b2
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:31:52.509Z
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