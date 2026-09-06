---
chunk_uuid: 7dbb0f5a-00d9-474d-b9c0-00bd6d10a30d
spec_uuid: 08af9d3b-44c4-4156-8709-261d224a69e6
section: document-events
title: document — events
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:08af9d3b:document-events
contract_id: spec-contract:08af9d3b:document-events:7dbb0f5a
agent: import
model: import:.spec
status: complete
completed_at: 2026-09-06T00:17:18.292Z
---

<!-- imported: document → events -->


  events:
    emits:
      - "idearium.booted"
      - "idearium.idea.created"
      - "idearium.idea.phase_changed"
      - "idearium.project.created"
      - "idearium.project.spec_dropped"
      - "idearium.project.build_started"
      - "idearium.lattice.connected"
      - "idearium.lattice.crystallised"
    handles:
      - "guardian.job.complete → artifact.store"
      - "cortex.gap.found     → project.gap_attach"
      - "spec.compile.complete → project.build_start"
