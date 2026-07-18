---
chunk_uuid: 43a37ec7-827e-4f53-a188-38d3b840af17
spec_uuid: a83184e7-1073-43f9-80a5-02ea05a66d74
section: event-model-stream
title: event model — stream
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:a83184e7:event-model-stream
contract_id: spec-contract:a83184e7:event-model-stream:43a37ec7
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T16:22:51.467Z
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
