---
chunk_uuid: 3e68aa25-435c-4f3e-b62d-8bec5f6d3a8c
spec_uuid: d9ee9fa1-eb73-47a2-a867-38ddffc2a46e
section: event-model-temporal-model
title: event model — temporal_model
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:d9ee9fa1:event-model-temporal-model
contract_id: spec-contract:d9ee9fa1:event-model-temporal-model:3e68aa25
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T08:06:57.580Z
---

<!-- imported: event model → temporal_model -->


    temporal_model:
      clock: hybrid
      logical_tick: "monotone integer incremented on every kernel.ingest() call (time module)"
      ordering_axis: logical_tick
      drift_tolerance_ms: 0

  # ════════════════════════════════════════════════════════════════
  