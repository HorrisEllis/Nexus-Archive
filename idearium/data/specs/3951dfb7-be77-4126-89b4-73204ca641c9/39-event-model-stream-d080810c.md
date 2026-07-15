---
chunk_uuid: d080810c-619d-4531-ad85-7f6a435bcbbc
spec_uuid: 3951dfb7-be77-4126-89b4-73204ca641c9
section: event-model-stream
title: event model — stream
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:3951dfb7:event-model-stream
contract_id: spec-contract:3951dfb7:event-model-stream:d080810c
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:54:38.025Z
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
