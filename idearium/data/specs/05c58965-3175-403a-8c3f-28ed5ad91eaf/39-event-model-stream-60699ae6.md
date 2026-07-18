---
chunk_uuid: 60699ae6-93a9-498e-906a-af0f3b7e2fbd
spec_uuid: 05c58965-3175-403a-8c3f-28ed5ad91eaf
section: event-model-stream
title: event model — stream
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:05c58965:event-model-stream
contract_id: spec-contract:05c58965:event-model-stream:60699ae6
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T20:13:38.025Z
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
