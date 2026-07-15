---
chunk_uuid: 4fb2e254-38aa-4e91-b515-5633a1645178
spec_uuid: 1da21c43-b7e0-4703-93f5-7aed4825dd38
section: modules-query
title: modules — query
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:1da21c43:modules-query
contract_id: spec-contract:1da21c43:modules-query:4fb2e254
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:31:52.732Z
---

<!-- imported: modules → query -->

query:
      id:           query
      uuid:         aa000006-qury-4000-0000-000000000000
      layer:        analytics
      status:       active
      owner:        james-brooks
      version:      5.0.2
      file_ref:     modules/query/index.js
      created_at:   2025-01-01T00:00:00Z
      last_modified: 2026-05-24T04:00:00Z
      purpose: >
        CQL (Causal Query Language) execution engine. One-shot queries against the kernel
        ring. Uses kernel._typeIndex for O(1) type-equality root conditions (TRDE-002).
        Supports FIND, WHERE, LIMIT, ORDER BY, traceToRoot.
      inputs:
        - id: IN-query-001
          name: cql_string
          type: string
          required: true
          source: caller
          description: CQL query string. e.g. "FIND events WHERE type = 'command:success' LIMIT 10"
        - id: IN-query-002
          name: kernel_ref
          type: KernelInstance
          required: true
          source: caller
          description: Kernel instance to query. Accesses _typeIndex directly (TRDE-002).
      outputs:
        - id: OUT-query-001
          name: query_result
          type: "KernelEvent[]"
          destination: caller
          description: Matching events from the ring.
      dependencies:
        internal:
          - module_id: kernel
            why: "_typeIndex access for O(1) type queries (TRDE-002 documented coupling)."
            coupling: data
        external: []
      hooks_in: []
      hooks_out: []
      failure_modes:
        - id: FAIL-query-001
          scenario: "_typeIndex accessed after kernel.reset() — stale index returns wrong events."
          impact: recoverable
          probability: low
          detection: query must take defensive copy of _typeIndex at query start.
          mitigation: Defensive copy on every query execution. H-3 invariant.
          recovery: Re-execute query on fresh kernel reference.
          emits_gap: false
      state_model:
        type: stateless
        state_vars: []
        hot_path: none
        truth_layer: none
      performance:
        poll_interval_ms: 0
        latency_budget_ms: 10
        throughput_target: "10k queries/s"
        memory_budget_mb: 8
        notes: O(1) type lookup via _typeIndex. WHERE filters are O(n) over the type set.
      security:
        trust_level: trusted
        data_sensitivity: internal
        attack_surface:
          - vector: CQL injection via malformed query string.
            risk: Unexpected ring scan behavior or parser crash.
            mitigated_by: CQL parser validates syntax before execution.
      behavioral_contract:
        summary: "CQL query engine. O(1) type queries via _typeIndex."
        success: "FIND events WHERE type = X LIMIT 10 returns correct events from ring."
        failure: Stale _typeIndex returns events already evicted from ring.
        sla_ms: 10
        invariant_refs: []
      cobalt:
        reads: []
        writes: []
        cli: []