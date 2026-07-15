---
chunk_uuid: b5ec3a2b-252f-46d2-be0e-b8f6acce0661
spec_uuid: 9d4b9a4e-bb05-478e-a231-c9e41da42b80
section: runtime-model-scheduling
title: runtime model — scheduling
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:9d4b9a4e:runtime-model-scheduling
contract_id: spec-contract:9d4b9a4e:runtime-model-scheduling:b5ec3a2b
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:55:52.946Z
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
