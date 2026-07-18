---
chunk_uuid: ff0d2d2d-cd6f-4f36-a00b-4773ee51a0d9
spec_uuid: b393637b-c65d-4dec-86cb-521958e4ac14
section: intent-failure-conditions
title: intent — failure_conditions
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:b393637b:intent-failure-conditions
contract_id: spec-contract:b393637b:intent-failure-conditions:ff0d2d2d
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:47:06.138Z
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
