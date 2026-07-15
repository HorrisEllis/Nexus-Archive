---
chunk_uuid: 198596f7-4f42-44c5-8b30-2fe4336a7623
spec_uuid: a851a5dc-8344-4269-b2e1-a2d72dc348db
section: event-model-temporal-model
title: event model — temporal_model
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:a851a5dc:event-model-temporal-model
contract_id: spec-contract:a851a5dc:event-model-temporal-model:198596f7
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:41:37.617Z
---

<!-- imported: event model → temporal_model -->

temporal_model:
      clock: hybrid
      logical_tick: "monotone integer incremented on every kernel.ingest() call (time module)"
      ordering_axis: logical_tick
      drift_tolerance_ms: 0

  # ════════════════════════════════════════════════════════════════