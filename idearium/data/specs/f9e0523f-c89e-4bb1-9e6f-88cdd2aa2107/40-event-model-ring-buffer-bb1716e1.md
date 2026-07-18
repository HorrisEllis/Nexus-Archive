---
chunk_uuid: bb1716e1-38ad-4743-9999-caa2c6547ae0
spec_uuid: f9e0523f-c89e-4bb1-9e6f-88cdd2aa2107
section: event-model-ring-buffer
title: event model — ring_buffer
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:f9e0523f:event-model-ring-buffer
contract_id: spec-contract:f9e0523f:event-model-ring-buffer:bb1716e1
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T20:12:26.594Z
---

<!-- imported: event model → ring_buffer -->


    ring_buffer:
      max_events: 5000000
      eviction_policy: fifo
      eviction_side_effect: >
        Evicted event's edges pruned (H-1). typeIndex entry deleted. seenMap entry removed.
        system:ring:evicted emitted. If archiveEvicted() wired: moved to cold archive. Else: permanently lost.
      sample_on_snapshot: true
