---
chunk_uuid: 07e2123f-b478-46f9-bd23-7fa3a0569163
spec_uuid: 3a45e152-b5fe-4546-a744-770d60af4a50
section: event-model-stream
title: event model — stream
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:3a45e152:event-model-stream
contract_id: spec-contract:3a45e152:event-model-stream:07e2123f
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:22:13.209Z
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
