---
chunk_uuid: 335edc2f-fd37-40d8-8c9b-e078e282be11
spec_uuid: 3951dfb7-be77-4126-89b4-73204ca641c9
section: event-model-temporal-model
title: event model — temporal_model
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:3951dfb7:event-model-temporal-model
contract_id: spec-contract:3951dfb7:event-model-temporal-model:335edc2f
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:54:38.060Z
---

<!-- imported: event model → temporal_model -->

    temporal_model:
      clock: hybrid
      logical_tick: "monotone integer incremented on every kernel.ingest() call (time module)"
      ordering_axis: logical_tick
      drift_tolerance_ms: 0

  # ════════════════════════════════════════════════════════════════
  