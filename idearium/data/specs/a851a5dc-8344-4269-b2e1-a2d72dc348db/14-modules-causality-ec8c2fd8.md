---
chunk_uuid: ec8c2fd8-6015-4c0d-b25e-709f6f66db43
spec_uuid: a851a5dc-8344-4269-b2e1-a2d72dc348db
section: modules-causality
title: modules — causality
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:a851a5dc:modules-causality
contract_id: spec-contract:a851a5dc:modules-causality:ec8c2fd8
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:41:37.394Z
---

<!-- imported: modules → causality -->

causality:
      id:           causality
      uuid:         32a3f387-655c-4531-87a5-1b98641a8895
      layer:        causality
      status:       active
      owner:        james-brooks
      version:      5.0.2
      file_ref:     modules/causality/index.js
      created_at:   2025-01-01T00:00:00Z
      last_modified: 2026-05-24T04:00:00Z
      purpose: >
        Causal edge taxonomy, causal graph store (DAG), and CalltoMap.
        H-1: pruneEdgesFor() on every ring eviction. C-1: edgeType declared at ingestion.
        C-3: only causal/* edges traversed in path queries.
      inputs:
        - id: IN-causality-001
          name: causedBy
          type: string
          required: false
          source: kernel
          description: Parent event ID. If provided, creates a causal edge.
        - id: IN-causality-002
          name: edgeType
          type: string
          required: true
          source: kernel
          description: >
            One of: causal/explicit | causal/rule | causal/adapter | observational.
            Required at ingestion. Never inferred. (C-1)
      outputs:
        - id: OUT-causality-001
          name: causal_edge
          type: object
          destination: kernel
          description: Immutable edge record { fromId, toId, edgeType, confidence, dtTicks }.
        - id: OUT-causality-002
          name: callto_resolution
          type: object
          destination: adapter
          description: Resolved calltoMap entry linking running→resolved/error. edgeType causal/adapter.
      dependencies:
        internal:
          - module_id: identity
            why: Uses dedupKey for CalltoMap keying.
            coupling: data
        external: []
      hooks_in: []
      hooks_out:
        - event: "system:diamond:rejected"
          trigger: DAG diamond parent detected.
          description: System event. No crash. Offending edge not stored.
      failure_modes:
        - id: FAIL-causality-001
          scenario: Diamond parent detected — event has two paths to same root.
          impact: recoverable
          probability: low
          detection: createCausalStore() checks on every addEdge(). Emits system event.
          mitigation: Reject duplicate edge. Emit system:diamond:rejected. Continue.
          recovery: Application must ensure unique causedBy chains.
          emits_gap: false
        - id: FAIL-causality-002
          scenario: pruneEdgesFor() not called on ring eviction. Edge graph grows unbounded.
          impact: fatal
          probability: rare
          detection: enforcement.BoundaryIndex monitors edge count vs ring size. H-1 alert.
          mitigation: kernel.ingest() calls pruneEdgesFor() on every eviction. H-1 guaranteed.
          recovery: Restart required if edge graph exceeds memory.
          emits_gap: true
          gap_type: H-1 hostile hardening violation
      state_model:
        type: stateful
        state_vars:
          - name: edges
            type: "Map<fromId, Set<toId>>"
            persistence: memory
            description: Causal graph. Pruned on eviction (H-1).
          - name: calltoMap
            type: "Map<calltoKey, runningEventId>"
            persistence: memory
            description: Pending callto lifecycle pairs awaiting resolution.
        hot_path: in-memory Map
        truth_layer: kernel ring (edges encoded in event meta fields)
      performance:
        poll_interval_ms: 0
        latency_budget_ms: 2
        throughput_target: "500k edges/s"
        memory_budget_mb: 64
        notes: pruneEdgesFor() is O(E) where E = edges per evicted event — typically O(1).
      security:
        trust_level: trusted
        data_sensitivity: internal
        attack_surface:
          - vector: Forged causedBy claiming evicted event ID.
            risk: Dangling edge reference. traceToRoot returns partial chain.
            mitigated_by: Evicted event IDs pruned on eviction. traceToRoot handles tombstones gracefully.
      behavioral_contract:
        summary: Maintains bounded causal DAG. Every edge has declared type. traceToRoot uses only causal/* edges.
        success: traceToRoot(ev.id, 50) returns correct ancestor chain. calltoMap correctly links pairs.
        failure: traceToRoot traverses observational edge (C-3 violation) or edge graph grows unbounded (H-1).
        sla_ms: 2
        invariant_refs: [INV-C1, INV-C3, INV-H1]
      cobalt:
        reads: []
        writes: []
        cli: []