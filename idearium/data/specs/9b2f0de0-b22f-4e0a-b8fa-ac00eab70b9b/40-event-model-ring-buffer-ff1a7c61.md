---
chunk_uuid: ff1a7c61-de72-45d9-9df6-f42a1ba91e76
spec_uuid: 9b2f0de0-b22f-4e0a-b8fa-ac00eab70b9b
section: event-model-ring-buffer
title: event model — ring_buffer
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:9b2f0de0:event-model-ring-buffer
contract_id: spec-contract:9b2f0de0:event-model-ring-buffer:ff1a7c61
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:55:55.931Z
---

<!-- imported: event model → ring_buffer -->


    ring_buffer:
      max_events: 5000000
      eviction_policy: fifo
      eviction_side_effect: >
        Evicted event's edges pruned (H-1). typeIndex entry deleted. seenMap entry removed.
        system:ring:evicted emitted. If archiveEvicted() wired: moved to cold archive. Else: permanently lost.
      sample_on_snapshot: true
