---
chunk_uuid: 458bf2fe-5ec4-4870-bc91-38edfc54413b
spec_uuid: 1dceaca3-622e-4f87-a9da-c46c298d5c81
section: event-model-stream
title: event model — stream
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:1dceaca3:event-model-stream
contract_id: spec-contract:1dceaca3:event-model-stream:458bf2fe
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T21:02:08.516Z
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
