---
chunk_uuid: 840108d2-0812-44ef-8b9b-5552c6498ec6
spec_uuid: f9e0523f-c89e-4bb1-9e6f-88cdd2aa2107
section: event-model-stream
title: event model — stream
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:f9e0523f:event-model-stream
contract_id: spec-contract:f9e0523f:event-model-stream:840108d2
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T20:12:26.048Z
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
