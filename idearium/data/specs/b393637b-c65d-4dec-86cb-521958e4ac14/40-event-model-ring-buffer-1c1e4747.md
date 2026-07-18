---
chunk_uuid: 1c1e4747-6651-4a8a-b46a-20d8288ac62f
spec_uuid: b393637b-c65d-4dec-86cb-521958e4ac14
section: event-model-ring-buffer
title: event model — ring_buffer
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:b393637b:event-model-ring-buffer
contract_id: spec-contract:b393637b:event-model-ring-buffer:1c1e4747
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:47:12.644Z
---

<!-- imported: event model → ring_buffer -->


    ring_buffer:
      max_events: 5000000
      eviction_policy: fifo
      eviction_side_effect: >
        Evicted event's edges pruned (H-1). typeIndex entry deleted. seenMap entry removed.
        system:ring:evicted emitted. If archiveEvicted() wired: moved to cold archive. Else: permanently lost.
      sample_on_snapshot: true
