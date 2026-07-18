---
chunk_uuid: be6bbc5a-5cf1-4598-9c15-7664ab6364ba
spec_uuid: c29c09a0-87fa-4562-829d-3f8edeec6f26
section: intent-failure-conditions
title: intent — failure_conditions
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:c29c09a0:intent-failure-conditions
contract_id: spec-contract:c29c09a0:intent-failure-conditions:be6bbc5a
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:51:33.392Z
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
