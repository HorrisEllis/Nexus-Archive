---
chunk_uuid: 8cdde36a-9bd3-4f32-8d0e-8b77543a1b21
spec_uuid: a851a5dc-8344-4269-b2e1-a2d72dc348db
section: runtime-model-scheduling
title: runtime model — scheduling
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:a851a5dc:runtime-model-scheduling
contract_id: spec-contract:a851a5dc:runtime-model-scheduling:8cdde36a
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:41:37.644Z
---

<!-- imported: runtime model → scheduling -->

scheduling:
      strategy: fifo
      preemptible: false
      tick_model: >
        Event-driven, not tick-driven. Ingestion is caller-driven.
        WAL flush triggered by event count. No global timer.
      poll_phases:
        - phase: 1
          layer: foundation
          modules: [identity, time]
          start_condition: Module import resolved.
        - phase: 2
          layer: causality
          modules: [causality, projection, lazy]
          start_condition: foundation loaded.
        - phase: 3
          layer: kernel-layer
          modules: [kernel, adapter, adapter-sandbox, observer, enforcement]
          start_condition: causality loaded.
        - phase: 4
          layer: analytics
          modules: [delta, query, compress, persist, version-gate, context, clip, sigma]
          start_condition: kernel-layer loaded.
        - phase: 5
          layer: ai
          modules: [forge, loader, ledger]
          start_condition: analytics loaded.