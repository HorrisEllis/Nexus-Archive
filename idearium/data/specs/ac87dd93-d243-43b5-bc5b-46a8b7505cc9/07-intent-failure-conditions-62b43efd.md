---
chunk_uuid: 62b43efd-3680-4ed0-9ace-b3bfef7e6374
spec_uuid: ac87dd93-d243-43b5-bc5b-46a8b7505cc9
section: intent-failure-conditions
title: intent — failure_conditions
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ac87dd93:intent-failure-conditions
contract_id: spec-contract:ac87dd93:intent-failure-conditions:62b43efd
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:53:00.678Z
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