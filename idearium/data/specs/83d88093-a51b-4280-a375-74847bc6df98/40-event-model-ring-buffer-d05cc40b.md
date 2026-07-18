---
chunk_uuid: d05cc40b-4978-4243-a9c1-77dae3403563
spec_uuid: 83d88093-a51b-4280-a375-74847bc6df98
section: event-model-ring-buffer
title: event model — ring_buffer
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:83d88093:event-model-ring-buffer
contract_id: spec-contract:83d88093:event-model-ring-buffer:d05cc40b
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:39:50.453Z
---

<!-- imported: event model → ring_buffer -->


    ring_buffer:
      max_events: 5000000
      eviction_policy: fifo
      eviction_side_effect: >
        Evicted event's edges pruned (H-1). typeIndex entry deleted. seenMap entry removed.
        system:ring:evicted emitted. If archiveEvicted() wired: moved to cold archive. Else: permanently lost.
      sample_on_snapshot: true
