---
chunk_uuid: ddf6e469-3a4d-4306-87d6-3c250ecef2fb
spec_uuid: 05c58965-3175-403a-8c3f-28ed5ad91eaf
section: intent-failure-conditions
title: intent — failure_conditions
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:05c58965:intent-failure-conditions
contract_id: spec-contract:05c58965:intent-failure-conditions:ddf6e469
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T20:13:20.461Z
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
