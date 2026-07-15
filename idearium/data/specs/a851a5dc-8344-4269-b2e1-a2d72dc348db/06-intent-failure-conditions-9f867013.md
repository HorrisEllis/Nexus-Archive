---
chunk_uuid: 9f867013-2f23-4e38-b837-e0722085bd2d
spec_uuid: a851a5dc-8344-4269-b2e1-a2d72dc348db
section: intent-failure-conditions
title: intent — failure_conditions
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:a851a5dc:intent-failure-conditions
contract_id: spec-contract:a851a5dc:intent-failure-conditions:9f867013
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:41:37.344Z
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