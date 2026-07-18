---
chunk_uuid: fb2de2a9-0394-4046-9af9-1e7a4503eea1
spec_uuid: 1dceaca3-622e-4f87-a9da-c46c298d5c81
section: intent-failure-conditions
title: intent — failure_conditions
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:1dceaca3:intent-failure-conditions
contract_id: spec-contract:1dceaca3:intent-failure-conditions:fb2de2a9
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T21:01:46.708Z
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
