---
chunk_uuid: a779a440-f993-4ca9-bc28-2ddb2304e8cb
spec_uuid: 1da21c43-b7e0-4703-93f5-7aed4825dd38
section: runtime-model-scheduling
title: runtime model — scheduling
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:1da21c43:runtime-model-scheduling
contract_id: spec-contract:1da21c43:runtime-model-scheduling:a779a440
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:31:52.926Z
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