---
chunk_uuid: 63beec09-9d6f-4b5a-9e82-ee7a92246f83
spec_uuid: a83184e7-1073-43f9-80a5-02ea05a66d74
section: intent-failure-conditions
title: intent — failure_conditions
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:a83184e7:intent-failure-conditions
contract_id: spec-contract:a83184e7:intent-failure-conditions:63beec09
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T16:22:41.947Z
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
