---
chunk_uuid: 095e7cf3-05d3-4fec-aeac-07984ef0645d
spec_uuid: c29c09a0-87fa-4562-829d-3f8edeec6f26
section: event-model-stream
title: event model — stream
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:c29c09a0:event-model-stream
contract_id: spec-contract:c29c09a0:event-model-stream:095e7cf3
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:51:40.285Z
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
