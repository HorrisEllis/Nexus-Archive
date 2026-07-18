---
chunk_uuid: 236652a9-90dc-491c-a837-c20f15fb52c7
spec_uuid: aaa8dfea-3970-492c-8ebd-13bc2fd9edf6
section: intent-failure-conditions
title: intent — failure_conditions
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:aaa8dfea:intent-failure-conditions
contract_id: spec-contract:aaa8dfea:intent-failure-conditions:236652a9
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T17:12:42.865Z
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
