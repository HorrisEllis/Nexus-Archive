---
chunk_uuid: 8faf0a3e-6c90-447e-bf8d-160900e9e14e
spec_uuid: f9e0523f-c89e-4bb1-9e6f-88cdd2aa2107
section: causal-map-ring-eviction
title: causal map — ring.eviction
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:f9e0523f:causal-map-ring-eviction
contract_id: spec-contract:f9e0523f:causal-map-ring-eviction:8faf0a3e
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T20:12:24.426Z
---

<!-- imported: causal map → ring.eviction -->


    ring.eviction:
      id: ring.eviction
      type: mutation
      description: >
        Ring buffer at capacity. Oldest event evicted. H-1: pruneEdgesFor() called immediately.
        system:ring:evicted emitted. Application must intercept and pass evicted object to archiveEvicted().
      source: kernel
      critical_path: false
      invariant_refs: [INV-H1]
      causes:
        - target: causality
          mechanism: direct
          latency: "immediate"
          certainty: always
          condition: null
          description: pruneEdgesFor(evictedEvent.id) called. Edge graph stays bounded.
        - target: persist
          mechanism: conditional
          latency: "immediate"
          certainty: possible
          condition: Application wired archiveEvicted() to system:ring:evicted.
          description: Evicted event archived to cold storage.
        - target: query
          mechanism: indirect
          latency: "next query"
          certainty: always
          condition: null
          description: Evicted event no longer in typeIndex. Cold queries must use queryArchive().
      affects:
        - target: typeIndex
          nature: modifies
          reversible: false
          description: Event id removed from typeIndex[type] Set on eviction.
        - target: causal_graph
          nature: modifies
          reversible: false
          description: All edges for evicted event pruned. Ancestors become tombstones.
        - target: seenMap
          nature: modifies
          reversible: false
          description: Evicted event's dedupKey removed from seenMap LRU.
      risks:
        - id: RISK-CAUSAL-003
          description: High eviction rate. archiveEvicted() not wired. Evicted events permanently lost.
          probability: medium
          severity: major
          mitigated_by: Monitor system:ring:evicted rate. Alert > 1% of ingest. Wire archiveEvicted() in production.
      blast_radius:
        modules: [kernel, causality, persist, query, compress]
        tables: []
        interfaces: []
        invariants: [INV-H1]
        max_depth: 2
        recomputed_at: 2026-05-24T04:00:00Z
