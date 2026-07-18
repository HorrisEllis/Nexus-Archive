---
chunk_uuid: 53a24abe-8d6a-43f5-bfa5-29aff736cf06
spec_uuid: b675a98f-3025-4b45-8ab2-44a583b60881
section: event-model-temporal-model
title: event model — temporal_model
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:b675a98f:event-model-temporal-model
contract_id: spec-contract:b675a98f:event-model-temporal-model:53a24abe
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:54:01.739Z
---

<!-- imported: event model → temporal_model -->


    temporal_model:
      clock: hybrid
      logical_tick: "monotone integer incremented on every kernel.ingest() call (time module)"
      ordering_axis: logical_tick
      drift_tolerance_ms: 0

  # ════════════════════════════════════════════════════════════════
  