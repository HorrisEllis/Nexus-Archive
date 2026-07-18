---
chunk_uuid: e3f56f8d-d6fb-4194-ab3f-1b8efdafa4b1
spec_uuid: b675a98f-3025-4b45-8ab2-44a583b60881
section: intent-failure-conditions
title: intent — failure_conditions
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:b675a98f:intent-failure-conditions
contract_id: spec-contract:b675a98f:intent-failure-conditions:e3f56f8d
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:53:53.668Z
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
