---
chunk_uuid: 3e0fc52a-f7fc-47a5-9978-b5c9f795d833
spec_uuid: 034dfc10-73b1-480c-b6dc-83a339579ffa
section: intent-failure-conditions
title: intent — failure_conditions
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:034dfc10:intent-failure-conditions
contract_id: spec-contract:034dfc10:intent-failure-conditions:3e0fc52a
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:45:06.584Z
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