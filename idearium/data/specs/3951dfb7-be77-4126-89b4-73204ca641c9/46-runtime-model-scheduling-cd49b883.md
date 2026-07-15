---
chunk_uuid: cd49b883-3c1b-4011-8d36-f682b9824a1a
spec_uuid: 3951dfb7-be77-4126-89b4-73204ca641c9
section: runtime-model-scheduling
title: runtime model — scheduling
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:3951dfb7:runtime-model-scheduling
contract_id: spec-contract:3951dfb7:runtime-model-scheduling:cd49b883
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:54:38.090Z
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
