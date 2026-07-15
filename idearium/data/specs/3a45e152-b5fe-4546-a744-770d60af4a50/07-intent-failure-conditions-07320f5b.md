---
chunk_uuid: 07320f5b-9ac1-4545-b10e-01ef5a852cb1
spec_uuid: 3a45e152-b5fe-4546-a744-770d60af4a50
section: intent-failure-conditions
title: intent — failure_conditions
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:3a45e152:intent-failure-conditions
contract_id: spec-contract:3a45e152:intent-failure-conditions:07320f5b
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:22:12.925Z
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
