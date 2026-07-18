---
chunk_uuid: c5055da9-c7cf-4e0a-a148-3611f1a094f3
spec_uuid: 1dceaca3-622e-4f87-a9da-c46c298d5c81
section: event-model-ring-buffer
title: event model — ring_buffer
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:1dceaca3:event-model-ring-buffer
contract_id: spec-contract:1dceaca3:event-model-ring-buffer:c5055da9
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T21:02:09.258Z
---

<!-- imported: event model → ring_buffer -->


    ring_buffer:
      max_events: 5000000
      eviction_policy: fifo
      eviction_side_effect: >
        Evicted event's edges pruned (H-1). typeIndex entry deleted. seenMap entry removed.
        system:ring:evicted emitted. If archiveEvicted() wired: moved to cold archive. Else: permanently lost.
      sample_on_snapshot: true
