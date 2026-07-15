---
chunk_uuid: 2c4d5040-b8ec-47e1-a854-1ed98f41c536
spec_uuid: ac87dd93-d243-43b5-bc5b-46a8b7505cc9
section: runtime-model-scheduling
title: runtime model — scheduling
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ac87dd93:runtime-model-scheduling
contract_id: spec-contract:ac87dd93:runtime-model-scheduling:2c4d5040
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:53:00.977Z
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