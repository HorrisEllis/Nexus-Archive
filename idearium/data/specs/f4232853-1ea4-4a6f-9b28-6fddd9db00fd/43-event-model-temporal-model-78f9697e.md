---
chunk_uuid: 78f9697e-6a6a-4901-ae5d-14705bfdb7f6
spec_uuid: f4232853-1ea4-4a6f-9b28-6fddd9db00fd
section: event-model-temporal-model
title: event model — temporal_model
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:f4232853:event-model-temporal-model
contract_id: spec-contract:f4232853:event-model-temporal-model:78f9697e
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:55:14.577Z
---

<!-- imported: event model → temporal_model -->


    temporal_model:
      clock: hybrid
      logical_tick: "monotone integer incremented on every kernel.ingest() call (time module)"
      ordering_axis: logical_tick
      drift_tolerance_ms: 0

  # ════════════════════════════════════════════════════════════════
  