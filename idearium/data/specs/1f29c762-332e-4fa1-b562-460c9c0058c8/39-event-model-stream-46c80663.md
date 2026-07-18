---
chunk_uuid: 46c80663-3baa-429c-8216-4427b80ebdc9
spec_uuid: 1f29c762-332e-4fa1-b562-460c9c0058c8
section: event-model-stream
title: event model — stream
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:1f29c762:event-model-stream
contract_id: spec-contract:1f29c762:event-model-stream:46c80663
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T16:49:23.686Z
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
