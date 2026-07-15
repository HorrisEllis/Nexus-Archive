---
chunk_uuid: 65cd7232-c252-4e23-ad92-9f1c10b0d94e
spec_uuid: a851a5dc-8344-4269-b2e1-a2d72dc348db
section: causal-map-adapter-bridge
title: causal map — adapter.bridge
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:a851a5dc:causal-map-adapter-bridge
contract_id: spec-contract:a851a5dc:causal-map-adapter-bridge:65cd7232
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:41:37.547Z
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