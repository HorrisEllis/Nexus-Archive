---
chunk_uuid: 132cf32c-b6b5-4f98-8ade-2f89b685e9ee
spec_uuid: 83d88093-a51b-4280-a375-74847bc6df98
section: intent-failure-conditions
title: intent — failure_conditions
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:83d88093:intent-failure-conditions
contract_id: spec-contract:83d88093:intent-failure-conditions:132cf32c
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:39:44.637Z
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
