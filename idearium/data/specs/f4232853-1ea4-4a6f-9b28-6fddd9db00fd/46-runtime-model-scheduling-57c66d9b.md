---
chunk_uuid: 57c66d9b-56e1-4ccb-ab6e-afd466082b18
spec_uuid: f4232853-1ea4-4a6f-9b28-6fddd9db00fd
section: runtime-model-scheduling
title: runtime model — scheduling
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:f4232853:runtime-model-scheduling
contract_id: spec-contract:f4232853:runtime-model-scheduling:57c66d9b
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:55:14.609Z
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
