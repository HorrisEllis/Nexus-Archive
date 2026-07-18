---
chunk_uuid: 20c76162-f269-4403-874a-cce5bc097c98
spec_uuid: b393637b-c65d-4dec-86cb-521958e4ac14
section: event-model-stream
title: event model — stream
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:b393637b:event-model-stream
contract_id: spec-contract:b393637b:event-model-stream:20c76162
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:47:12.454Z
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
