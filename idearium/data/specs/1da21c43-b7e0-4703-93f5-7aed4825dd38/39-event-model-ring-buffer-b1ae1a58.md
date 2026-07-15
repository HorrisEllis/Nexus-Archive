---
chunk_uuid: b1ae1a58-b7cb-4a30-9e3b-6cf5a5bc79cc
spec_uuid: 1da21c43-b7e0-4703-93f5-7aed4825dd38
section: event-model-ring-buffer
title: event model — ring_buffer
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:1da21c43:event-model-ring-buffer
contract_id: spec-contract:1da21c43:event-model-ring-buffer:b1ae1a58
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:31:52.869Z
---

<!-- imported: event model → ring_buffer -->

ring_buffer:
      max_events: 5000000
      eviction_policy: fifo
      eviction_side_effect: >
        Evicted event's edges pruned (H-1). typeIndex entry deleted. seenMap entry removed.
        system:ring:evicted emitted. If archiveEvicted() wired: moved to cold archive. Else: permanently lost.
      sample_on_snapshot: true