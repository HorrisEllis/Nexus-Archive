---
chunk_uuid: 8d701de9-fe7f-4687-9f97-c543fdfbeb6e
spec_uuid: c29c09a0-87fa-4562-829d-3f8edeec6f26
section: architecture-structure
title: architecture — structure
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:c29c09a0:architecture-structure
contract_id: spec-contract:c29c09a0:architecture-structure:8d701de9
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:51:34.042Z
---

<!-- imported: architecture → structure -->


    structure:
      layers:
        - id: foundation
          order: 1
          purpose: UUID, hashing, dedup, clocks. Zero external imports.
          modules: [identity, time]
          may_import_from: []
          may_not_import_from: [causality, kernel-layer, analytics, ai]

        - id: causality
          order: 2
          purpose: Edge taxonomy, causal graph, CalltoMap, projection views.
          modules: [causality, projection, lazy]
          may_import_from: [foundation]
          may_not_import_from: [kernel-layer, analytics, ai]

        - id: kernel-layer
          order: 3
          purpose: Ring buffer, gate system, macro projection, adapter, enforcement.
          modules: [kernel, adapter, adapter-sandbox, observer, enforcement]
          may_import_from: [foundation, causality]
          may_not_import_from: [analytics, ai]

        - id: analytics
          order: 4
          purpose: Delta, CQL query, compress/snapshot, persist/WAL, version-gate, context, clip, sigma.
          modules: [delta, query, compress, persist, version-gate, context, clip, sigma]
          may_import_from: [foundation, causality, kernel-layer]
          may_not_import_from: [ai]

        - id: ai
          order: 5
          purpose: AI self-modification (forge), hot module loading (loader), dual ledger.
          modules: [forge, loader, ledger]
          may_import_from: [foundation, causality, kernel-layer, analytics]
          may_not_import_from: []

      entry_points:
        - id: kernel-ingest
          type: event
          description: kernel.ingest(type, payload, meta) — primary event ingestion.
        - id: adapter-handle
          type: event
          description: adapter.handle(bridgeType, payload) — bridge bus translation from Guardian.
        - id: cql-query
          type: api
          description: query(cqlString, kernel) — one-shot CQL execution against the ring.
        - id: forge-api
          type: api
          description: forgeModule/forgePatch/forgeGate/forgeHook — AI self-modification.

      exit_points:
        - id: subscriber-callbacks
          type: event
          description: kernel.subscribe(fn) callbacks. Fire after gate phase (C-4).
        - id: gate-outputs
          type: event
          description: GateOutput[] ingested atomically after gate phase.
        - id: persist-wal
          type: file
          description: "WAL file. Backend: memory | indexeddb | filesystem | auto."
        - id: snapshot-artifact
          type: file
          description: .nex artifact (SNAP/BP/CLIP). Validated by version-gate on restore.
        - id: forge-patch
          type: api
          description: Patch source string returned by forge. Loaded via loader.loadModule().
        - id: ledger-events
          type: event
          description: idea:recorded, idea:promoted, upgrade:committed, bottleneck.
