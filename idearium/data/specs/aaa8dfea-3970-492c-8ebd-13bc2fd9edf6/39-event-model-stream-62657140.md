---
chunk_uuid: 62657140-9b77-4eb0-8782-bb756b624075
spec_uuid: aaa8dfea-3970-492c-8ebd-13bc2fd9edf6
section: event-model-stream
title: event model — stream
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:aaa8dfea:event-model-stream
contract_id: spec-contract:aaa8dfea:event-model-stream:62657140
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T17:12:51.891Z
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
