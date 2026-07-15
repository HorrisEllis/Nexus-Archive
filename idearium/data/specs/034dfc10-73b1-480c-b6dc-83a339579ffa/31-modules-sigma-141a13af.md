---
chunk_uuid: 141a13af-c2e9-4f2a-85ec-f201e284a7dd
spec_uuid: 034dfc10-73b1-480c-b6dc-83a339579ffa
section: modules-sigma
title: modules — sigma
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:034dfc10:modules-sigma
contract_id: spec-contract:034dfc10:modules-sigma:141a13af
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:45:06.747Z
---

<!-- imported: modules → sigma -->

sigma:
      id:           sigma
      uuid:         aa000010-sigm-4000-0000-000000000000
      layer:        analytics
      status:       active
      owner:        james-brooks
      version:      5.0.2
      file_ref:     modules/sigma/index.js
      created_at:   2025-01-01T00:00:00Z
      last_modified: 2026-05-24T04:00:00Z
      purpose: >
        Statistical classifier for ring event streams. Computes distribution signatures
        (sigma profiles) over event type frequencies, latency histograms, and causal
        depth. Used to detect anomalies and drift in event behavior over time.
      inputs:
        - id: IN-sigma-001
          name: kernel_events
          type: KernelEvent
          required: true
          source: kernel
          description: All events. sigma maintains rolling statistical windows.
      outputs:
        - id: OUT-sigma-001
          name: sigma_profile
          type: SigmaProfile
          destination: caller
          description: "{ typeFrequencies, latencyP50/P95/P99, causalDepthMean, anomalyScore }."
      dependencies:
        internal:
          - module_id: kernel
            why: Subscribes to all kernel events for statistical profiling.
            coupling: event
        external: []
      hooks_in:
        - event: "*"
          handler: onAnyEvent
          description: Updates rolling statistics on every ingest.
      hooks_out: []
      failure_modes:
        - id: FAIL-sigma-001
          scenario: Rolling window overflows available memory.
          impact: degraded
          probability: low
          detection: Window size monitor alerts at 80% of memory_budget_mb.
          mitigation: Evict oldest window bucket. Recompute from remaining buckets.
          recovery: Reduce window size or increase memory_budget_mb.
          emits_gap: false
      state_model:
        type: stateful
        state_vars:
          - name: windowBuckets
            type: "RingBuffer<StatBucket>"
            persistence: memory
            description: Rolling statistical windows. Bounded at configurable window count.
        hot_path: in-memory ring
        truth_layer: none
      performance:
        poll_interval_ms: 0
        latency_budget_ms: 2
        throughput_target: "100k stat updates/s"
        memory_budget_mb: 32
        notes: O(1) per event. Window compaction is O(buckets) — infrequent.
      security:
        trust_level: trusted
        data_sensitivity: internal
        attack_surface: []
      behavioral_contract:
        summary: "Rolling statistical profiler for ring event stream. Detects behavioral drift."
        success: "getSigmaProfile() returns accurate P50/P95/P99 latency for the window."
        failure: Profile lags reality by > 2 window periods.
        sla_ms: 2
        invariant_refs: []
      cobalt:
        reads: []
        writes: []
        cli: []