---
chunk_uuid: aaff3c56-860b-4a84-850a-56626c6b5401
spec_uuid: 034dfc10-73b1-480c-b6dc-83a339579ffa
section: runtime-model-scheduling
title: runtime model — scheduling
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:034dfc10:runtime-model-scheduling
contract_id: spec-contract:034dfc10:runtime-model-scheduling:aaff3c56
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:45:06.929Z
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