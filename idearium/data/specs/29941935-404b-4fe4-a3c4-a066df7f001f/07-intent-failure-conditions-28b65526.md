---
chunk_uuid: 28b65526-03d0-4926-af1f-15bed09e3085
spec_uuid: 29941935-404b-4fe4-a3c4-a066df7f001f
section: intent-failure-conditions
title: intent — failure_conditions
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:29941935:intent-failure-conditions
contract_id: spec-contract:29941935:intent-failure-conditions:28b65526
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:56:06.636Z
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
