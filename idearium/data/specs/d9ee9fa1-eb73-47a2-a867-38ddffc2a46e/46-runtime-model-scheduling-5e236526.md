---
chunk_uuid: 5e236526-9a72-4554-a9df-c120a79cd82f
spec_uuid: d9ee9fa1-eb73-47a2-a867-38ddffc2a46e
section: runtime-model-scheduling
title: runtime model — scheduling
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:d9ee9fa1:runtime-model-scheduling
contract_id: spec-contract:d9ee9fa1:runtime-model-scheduling:5e236526
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T08:06:57.616Z
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
