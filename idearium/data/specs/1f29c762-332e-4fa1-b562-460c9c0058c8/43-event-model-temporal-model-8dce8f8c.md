---
chunk_uuid: 8dce8f8c-dc16-4630-a1b6-bebc22708ba7
spec_uuid: 1f29c762-332e-4fa1-b562-460c9c0058c8
section: event-model-temporal-model
title: event model — temporal_model
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:1f29c762:event-model-temporal-model
contract_id: spec-contract:1f29c762:event-model-temporal-model:8dce8f8c
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T16:49:24.620Z
---

<!-- imported: event model → temporal_model -->


    temporal_model:
      clock: hybrid
      logical_tick: "monotone integer incremented on every kernel.ingest() call (time module)"
      ordering_axis: logical_tick
      drift_tolerance_ms: 0

  # ════════════════════════════════════════════════════════════════
  