---
chunk_uuid: ea45dca6-76c6-4c4c-bd2a-5ee1555dea15
spec_uuid: 17172635-ce02-4f6a-ba71-e564c3552d2d
section: intent-failure-conditions
title: intent — failure_conditions
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:17172635:intent-failure-conditions
contract_id: spec-contract:17172635:intent-failure-conditions:ea45dca6
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T07:37:22.471Z
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
