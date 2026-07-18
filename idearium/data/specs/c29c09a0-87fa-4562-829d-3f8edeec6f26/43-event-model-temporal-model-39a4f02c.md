---
chunk_uuid: 39a4f02c-246e-4347-a08e-8bb00cd1fba2
spec_uuid: c29c09a0-87fa-4562-829d-3f8edeec6f26
section: event-model-temporal-model
title: event model — temporal_model
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:c29c09a0:event-model-temporal-model
contract_id: spec-contract:c29c09a0:event-model-temporal-model:39a4f02c
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:51:41.138Z
---

<!-- imported: event model → temporal_model -->


    temporal_model:
      clock: hybrid
      logical_tick: "monotone integer incremented on every kernel.ingest() call (time module)"
      ordering_axis: logical_tick
      drift_tolerance_ms: 0

  # ════════════════════════════════════════════════════════════════
  