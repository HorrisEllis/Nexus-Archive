---
chunk_uuid: 497939c0-2158-4602-a92d-f2f8227b31f2
spec_uuid: 9d4b9a4e-bb05-478e-a231-c9e41da42b80
section: event-model-stream
title: event model — stream
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:9d4b9a4e:event-model-stream
contract_id: spec-contract:9d4b9a4e:event-model-stream:497939c0
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:55:52.885Z
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
