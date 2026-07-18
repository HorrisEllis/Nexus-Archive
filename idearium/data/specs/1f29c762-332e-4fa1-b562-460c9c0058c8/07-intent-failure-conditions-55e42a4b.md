---
chunk_uuid: 55e42a4b-80ce-4b0c-946a-100c70841fdb
spec_uuid: 1f29c762-332e-4fa1-b562-460c9c0058c8
section: intent-failure-conditions
title: intent — failure_conditions
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:1f29c762:intent-failure-conditions
contract_id: spec-contract:1f29c762:intent-failure-conditions:55e42a4b
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T16:49:15.790Z
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
