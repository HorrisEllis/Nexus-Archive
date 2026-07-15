---
chunk_uuid: f0275268-f863-4a3d-851c-75fb89d19b4a
spec_uuid: f4232853-1ea4-4a6f-9b28-6fddd9db00fd
section: event-model-ring-buffer
title: event model — ring_buffer
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:f4232853:event-model-ring-buffer
contract_id: spec-contract:f4232853:event-model-ring-buffer:f0275268
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:55:14.469Z
---

<!-- imported: event model → ring_buffer -->


    ring_buffer:
      max_events: 5000000
      eviction_policy: fifo
      eviction_side_effect: >
        Evicted event's edges pruned (H-1). typeIndex entry deleted. seenMap entry removed.
        system:ring:evicted emitted. If archiveEvicted() wired: moved to cold archive. Else: permanently lost.
      sample_on_snapshot: true
