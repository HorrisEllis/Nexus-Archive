---
chunk_uuid: 02b7e664-e55d-4f57-93c0-044a13f76262
spec_uuid: ac87dd93-d243-43b5-bc5b-46a8b7505cc9
section: event-model-temporal-model
title: event model — temporal_model
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ac87dd93:event-model-temporal-model
contract_id: spec-contract:ac87dd93:event-model-temporal-model:02b7e664
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:53:00.950Z
---

<!-- imported: event model → temporal_model -->

    temporal_model:
      clock: hybrid
      logical_tick: "monotone integer incremented on every kernel.ingest() call (time module)"
      ordering_axis: logical_tick
      drift_tolerance_ms: 0

  # ════════════════════════════════════════════════════════════════