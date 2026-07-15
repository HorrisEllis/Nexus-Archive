---
chunk_uuid: 69e0665a-dbd8-470c-b3c0-23f694162a8b
spec_uuid: 9b2f0de0-b22f-4e0a-b8fa-ac00eab70b9b
section: runtime-model-scheduling
title: runtime model — scheduling
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:9b2f0de0:runtime-model-scheduling
contract_id: spec-contract:9b2f0de0:runtime-model-scheduling:69e0665a
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:55:55.988Z
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
