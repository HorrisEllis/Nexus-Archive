---
chunk_uuid: ee3396e0-9372-4a46-8394-ac8ec6a45d2d
spec_uuid: aaa8dfea-3970-492c-8ebd-13bc2fd9edf6
section: event-model-ring-buffer
title: event model — ring_buffer
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:aaa8dfea:event-model-ring-buffer
contract_id: spec-contract:aaa8dfea:event-model-ring-buffer:ee3396e0
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T17:12:52.182Z
---

<!-- imported: event model → ring_buffer -->


    ring_buffer:
      max_events: 5000000
      eviction_policy: fifo
      eviction_side_effect: >
        Evicted event's edges pruned (H-1). typeIndex entry deleted. seenMap entry removed.
        system:ring:evicted emitted. If archiveEvicted() wired: moved to cold archive. Else: permanently lost.
      sample_on_snapshot: true
