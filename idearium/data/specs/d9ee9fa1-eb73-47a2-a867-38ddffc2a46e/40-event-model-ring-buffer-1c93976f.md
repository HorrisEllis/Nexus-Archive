---
chunk_uuid: 1c93976f-337b-4a67-b883-b385cc6405ed
spec_uuid: d9ee9fa1-eb73-47a2-a867-38ddffc2a46e
section: event-model-ring-buffer
title: event model — ring_buffer
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:d9ee9fa1:event-model-ring-buffer
contract_id: spec-contract:d9ee9fa1:event-model-ring-buffer:1c93976f
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T08:06:57.546Z
---

<!-- imported: event model → ring_buffer -->


    ring_buffer:
      max_events: 5000000
      eviction_policy: fifo
      eviction_side_effect: >
        Evicted event's edges pruned (H-1). typeIndex entry deleted. seenMap entry removed.
        system:ring:evicted emitted. If archiveEvicted() wired: moved to cold archive. Else: permanently lost.
      sample_on_snapshot: true
