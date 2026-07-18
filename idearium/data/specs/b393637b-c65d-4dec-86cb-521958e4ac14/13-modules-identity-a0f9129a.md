---
chunk_uuid: a0f9129a-37e1-4328-9015-8d1c03f63fb3
spec_uuid: b393637b-c65d-4dec-86cb-521958e4ac14
section: modules-identity
title: modules — identity
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:b393637b:modules-identity
contract_id: spec-contract:b393637b:modules-identity:a0f9129a
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:47:07.324Z
---

<!-- imported: modules → identity -->

# BLOCK 4 — MODULES
  # ════════════════════════════════════════════════════════════════
  modules:

    identity:
      id:           identity
      uuid:         fabbc95c-0000-4000-0000-000000000001
      layer:        foundation
      status:       active
      owner:        james-brooks
      version:      5.0.2
      file_ref:     modules/identity/index.js
      created_at:   2025-01-01T00:00:00Z
      last_modified: 2026-05-24T04:00:00Z
      purpose: >
        UUID v4 generation, FNV-1a content hashing, and dedup key construction.
        Zero imports. Every other module that needs identity primitives imports from here.
      inputs:
        - id: IN-identity-001
          name: payload
          type: object
          required: true
          source: kernel
          description: Raw event payload passed to contentHash().
      outputs:
        - id: OUT-identity-001
          name: eventId
          type: string
          destination: kernel
          description: UUID v4 event identifier. Never deterministic. (I-1)
        - id: OUT-identity-002
          name: contentHash
          type: string
          destination: kernel
          description: FNV-1a hash of payload. Same payload = same hash, different id. (I-2)
      dependencies:
        internal: []
        external: []
      hooks_in: []
      hooks_out: []
      failure_modes:
        - id: FAIL-identity-001
          scenario: crypto.randomUUID() not available (Node < 14.17 or restricted env).
          impact: fatal
          probability: rare
          detection: TypeError thrown on first kernel.ingest().
          mitigation: Runtime check at module load. Emit clear error with Node version.
          recovery: Upgrade to Node >= 18. No in-process recovery.
          emits_gap: false
      state_model:
        type: stateless
        state_vars: []
        hot_path: none
        truth_layer: none
      performance:
        poll_interval_ms: 0
        latency_budget_ms: 1
        throughput_target: "1M ids/s"
        memory_budget_mb: 1
        notes: UUID v4 is the hot path. Must be < 1µs per call.
      security:
        trust_level: trusted
        data_sensitivity: internal
        attack_surface:
          - vector: Deterministic UUID injection via mocked crypto.
            risk: I-1 violation. Dedup breaks.
            mitigated_by: enforcement.BoundaryIndex monitors I-1 on every event.
      behavioral_contract:
        summary: Produces cryptographically random unique event IDs and deterministic content hashes.
        success: newEventId() returns different UUID v4 on every call. contentHash() same for same payload.
        failure: Duplicate IDs produced, or contentHash() varies for identical payloads.
        sla_ms: 1
        invariant_refs: [INV-I1, INV-I2]
      cobalt:
        reads: []
        writes: []
        cli: []
