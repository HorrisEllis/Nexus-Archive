---
chunk_uuid: 77a84c13-8fb1-499c-8579-3e17ac321705
spec_uuid: 3951dfb7-be77-4126-89b4-73204ca641c9
section: intent-failure-conditions
title: intent — failure_conditions
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:3951dfb7:intent-failure-conditions
contract_id: spec-contract:3951dfb7:intent-failure-conditions:77a84c13
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:54:37.791Z
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
