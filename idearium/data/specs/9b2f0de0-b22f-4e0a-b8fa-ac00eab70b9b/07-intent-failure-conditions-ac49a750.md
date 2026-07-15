---
chunk_uuid: ac49a750-d914-4b2e-9663-33aecad37f10
spec_uuid: 9b2f0de0-b22f-4e0a-b8fa-ac00eab70b9b
section: intent-failure-conditions
title: intent — failure_conditions
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:9b2f0de0:intent-failure-conditions
contract_id: spec-contract:9b2f0de0:intent-failure-conditions:ac49a750
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:55:55.612Z
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
