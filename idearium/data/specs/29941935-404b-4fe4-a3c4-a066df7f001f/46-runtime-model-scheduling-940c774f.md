---
chunk_uuid: 940c774f-232c-47e1-b054-ec6d493aa974
spec_uuid: 29941935-404b-4fe4-a3c4-a066df7f001f
section: runtime-model-scheduling
title: runtime model — scheduling
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:29941935:runtime-model-scheduling
contract_id: spec-contract:29941935:runtime-model-scheduling:940c774f
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:56:06.924Z
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
