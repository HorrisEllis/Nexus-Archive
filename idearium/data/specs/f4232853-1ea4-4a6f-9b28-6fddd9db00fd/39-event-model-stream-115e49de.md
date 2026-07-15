---
chunk_uuid: 115e49de-9bf7-4460-9741-ed0e3454565e
spec_uuid: f4232853-1ea4-4a6f-9b28-6fddd9db00fd
section: event-model-stream
title: event model — stream
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:f4232853:event-model-stream
contract_id: spec-contract:f4232853:event-model-stream:115e49de
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:55:14.458Z
---

<!-- imported: event model → stream -->

# BLOCK 6 — EVENT MODEL
  # ════════════════════════════════════════════════════════════════
  event_model:
    stream:
      type: ring_buffer
      capacity: 5000000
      ordered: true
      durable: false
      replay_enabled: true
      overflow_policy: drop_oldest
      index_type: logical_tick
