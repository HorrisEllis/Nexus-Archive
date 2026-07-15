---
chunk_uuid: 2e224e0b-a268-4cee-8f38-fdcc359331dd
spec_uuid: 034dfc10-73b1-480c-b6dc-83a339579ffa
section: event-model-ring-buffer
title: event model — ring_buffer
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:034dfc10:event-model-ring-buffer
contract_id: spec-contract:034dfc10:event-model-ring-buffer:2e224e0b
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:45:06.844Z
---

<!-- imported: event model → ring_buffer -->

ring_buffer:
      max_events: 5000000
      eviction_policy: fifo
      eviction_side_effect: >
        Evicted event's edges pruned (H-1). typeIndex entry deleted. seenMap entry removed.
        system:ring:evicted emitted. If archiveEvicted() wired: moved to cold archive. Else: permanently lost.
      sample_on_snapshot: true