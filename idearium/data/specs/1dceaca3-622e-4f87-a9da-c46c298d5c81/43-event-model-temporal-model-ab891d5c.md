---
chunk_uuid: ab891d5c-af0f-4ded-8582-a1030121131f
spec_uuid: 1dceaca3-622e-4f87-a9da-c46c298d5c81
section: event-model-temporal-model
title: event model — temporal_model
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:1dceaca3:event-model-temporal-model
contract_id: spec-contract:1dceaca3:event-model-temporal-model:ab891d5c
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T21:02:11.385Z
---

<!-- imported: event model → temporal_model -->


    temporal_model:
      clock: hybrid
      logical_tick: "monotone integer incremented on every kernel.ingest() call (time module)"
      ordering_axis: logical_tick
      drift_tolerance_ms: 0

  # ════════════════════════════════════════════════════════════════
  