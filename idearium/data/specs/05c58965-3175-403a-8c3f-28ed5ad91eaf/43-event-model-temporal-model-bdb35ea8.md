---
chunk_uuid: bdb35ea8-f918-45ae-b344-00f3be5e4808
spec_uuid: 05c58965-3175-403a-8c3f-28ed5ad91eaf
section: event-model-temporal-model
title: event model — temporal_model
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:05c58965:event-model-temporal-model
contract_id: spec-contract:05c58965:event-model-temporal-model:bdb35ea8
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T20:13:40.169Z
---

<!-- imported: event model → temporal_model -->


    temporal_model:
      clock: hybrid
      logical_tick: "monotone integer incremented on every kernel.ingest() call (time module)"
      ordering_axis: logical_tick
      drift_tolerance_ms: 0

  # ════════════════════════════════════════════════════════════════
  