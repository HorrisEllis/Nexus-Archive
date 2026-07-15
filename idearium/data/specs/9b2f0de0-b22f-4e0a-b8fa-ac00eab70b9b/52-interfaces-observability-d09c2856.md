---
chunk_uuid: d09c2856-5df2-434f-a230-6c36f97d6f3a
spec_uuid: 9b2f0de0-b22f-4e0a-b8fa-ac00eab70b9b
section: interfaces-observability
title: interfaces — observability
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:9b2f0de0:interfaces-observability
contract_id: spec-contract:9b2f0de0:interfaces-observability:d09c2856
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:55:56.087Z
---

<!-- imported: interfaces → observability -->


    observability:
      metrics:
        enabled: true
        format: custom
        endpoints: ["user-configured"]
        key_metrics:
          - name: ring_eviction_rate
            type: counter
            description: system:ring:evicted events per second. High rate = ring too small.
          - name: gate_execution_latency_ms
            type: histogram
            description: Time to run all gates per ingest. High = gate optimization needed.
          - name: invariant_violation_count
            type: counter
            description: InvariantViolationError throws per hour. Any > 0 = system failure.
          - name: forge_success_rate
            type: gauge
            description: Fraction of forge calls returning ok:true. < 0.8 = model/prompt issue.
          - name: wal_flush_latency_ms
            type: histogram
            description: WAL flush duration. > 100ms = backend I/O issue.
          - name: ledger_pending_ideas
            type: gauge
            description: Unresolved idea count. > 5 = bottleneck alert.
      tracing:
        enabled: false
        system: none
        sampling_rate: 0.0
      logging:
        format: json
        levels: [debug, info, warn, error]
        sink: [stdout]
        structured_fields:
          - ts
          - module
          - level
          - message
          - invariantId
          - eventId
      health:
        endpoint: ""
        response_schema:
          - field: ringSize
            type: number
            description: Current number of events in ring.
          - field: evictionRate
            type: number
            description: Evictions per second over last 60s.
          - field: invariantsPassing
            type: number
            description: Count of invariants passing (of 29).
          - field: ledgerPendingIdeas
            type: number
            description: Unresolved idea count.

  # ════════════════════════════════════════════════════════════════
  