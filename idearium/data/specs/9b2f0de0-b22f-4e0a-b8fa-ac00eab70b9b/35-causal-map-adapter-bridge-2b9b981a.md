---
chunk_uuid: 2b9b981a-68ed-4741-876e-4c543b8d6678
spec_uuid: 9b2f0de0-b22f-4e0a-b8fa-ac00eab70b9b
section: causal-map-adapter-bridge
title: causal map — adapter.bridge
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:9b2f0de0:causal-map-adapter-bridge
contract_id: spec-contract:9b2f0de0:causal-map-adapter-bridge:2b9b981a
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:55:55.887Z
---

<!-- imported: causal map → adapter.bridge -->


    adapter.bridge:
      id: adapter.bridge
      type: trigger
      description: >
        Guardian sends bridge bus event to adapter. Adapter translates, resolves calltoMap pairs,
        and calls kernel.ingest() with proper edgeType. Entry point for all browser-side causal events.
      source: adapter
      critical_path: true
      invariant_refs: [INV-C1]
      causes:
        - target: kernel
          mechanism: direct
          latency: "< 3ms"
          certainty: always
          condition: null
          description: Translated event ingested to kernel via kernel.ingest().
        - target: session:boundary
          mechanism: conditional
          latency: "< 5ms"
          certainty: possible
          condition: event type is page:navigated and built-in gate active.
          description: Built-in gate fires and generates session:boundary kernel event.
      affects:
        - target: calltoMap
          nature: modifies
          reversible: false
          description: callto:running adds entry; callto:resolved/error removes it.
        - target: ring
          nature: creates
          reversible: false
          description: Translated kernel event added to ring.
      risks:
        - id: RISK-CAUSAL-002
          description: Guardian disconnects mid-session. calltoMap has pending running entries.
          probability: medium
          severity: minor
          mitigated_by: calltoTtlTicks expires stale entries if enabled. query FIND command:running for orphan detection.
      blast_radius:
        modules: [adapter, kernel, causality, enforcement, persist]
        tables: []
        interfaces: [guardian-bridge]
        invariants: [INV-C1]
        max_depth: 3
        recomputed_at: 2026-05-24T04:00:00Z
