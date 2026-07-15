---
chunk_uuid: 1269cf1b-e0b3-4ac3-8cf1-9d666117c4f2
spec_uuid: f4232853-1ea4-4a6f-9b28-6fddd9db00fd
section: intent-failure-conditions
title: intent — failure_conditions
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:f4232853:intent-failure-conditions
contract_id: spec-contract:f4232853:intent-failure-conditions:1269cf1b
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:55:14.203Z
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
