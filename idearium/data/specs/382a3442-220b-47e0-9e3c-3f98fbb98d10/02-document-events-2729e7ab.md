---
chunk_uuid: 2729e7ab-1395-4154-98aa-bc267a2792ad
spec_uuid: 382a3442-220b-47e0-9e3c-3f98fbb98d10
section: document-events
title: document — events
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:382a3442:document-events
contract_id: spec-contract:382a3442:document-events:2729e7ab
agent: import
model: import:.spec
status: complete
completed_at: 2026-09-06T00:03:56.150Z
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
