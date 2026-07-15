---
chunk_uuid: a2250317-3fa2-4957-a75c-c858f340eed9
spec_uuid: 9d4b9a4e-bb05-478e-a231-c9e41da42b80
section: event-model-ring-buffer
title: event model — ring_buffer
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:9d4b9a4e:event-model-ring-buffer
contract_id: spec-contract:9d4b9a4e:event-model-ring-buffer:a2250317
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:55:52.892Z
---

<!-- imported: event model → ring_buffer -->


    ring_buffer:
      max_events: 5000000
      eviction_policy: fifo
      eviction_side_effect: >
        Evicted event's edges pruned (H-1). typeIndex entry deleted. seenMap entry removed.
        system:ring:evicted emitted. If archiveEvicted() wired: moved to cold archive. Else: permanently lost.
      sample_on_snapshot: true
