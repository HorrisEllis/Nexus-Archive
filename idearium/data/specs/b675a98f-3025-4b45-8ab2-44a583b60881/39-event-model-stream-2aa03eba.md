---
chunk_uuid: 2aa03eba-ecd6-4604-9a0d-2bdd3fb4fcdf
spec_uuid: b675a98f-3025-4b45-8ab2-44a583b60881
section: event-model-stream
title: event model — stream
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:b675a98f:event-model-stream
contract_id: spec-contract:b675a98f:event-model-stream:2aa03eba
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:54:00.789Z
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
