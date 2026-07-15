---
chunk_uuid: 2cd8e5ac-e379-4e3a-b84c-ee0507f7b8bf
spec_uuid: 3a45e152-b5fe-4546-a744-770d60af4a50
section: meta
title: meta
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:3a45e152:meta
contract_id: spec-contract:3a45e152:meta:2cd8e5ac
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:22:12.840Z
---

<!-- imported block: meta -->

# BLOCK 1 — META
  # ════════════════════════════════════════════════════════════════
  meta:
    name:           causal-nexus
    version:        6.0.0
    author:         james-brooks
    created_at:     2025-01-01T00:00:00Z
    last_modified:  2026-05-24T04:00:00Z
    status:         complete
    uuid:           spec-causal-nexus-eecaa718c6a644330b0211ecbefd4740
    checksum:       7f3a1c9b4e2d0f8a6c5e3b1d9f7a2c0e4b8d6f1a3c7e5b2d0f4a8c6e3b9d1f
    target_os:      [linux, mac, windows, container]
    execution_mode: hybrid
    paradigm:       [modular, event-driven, reactive]
    language_stack: [javascript, typescript]
    runtime_deps:
      - name:     node
        version:  ">=18.0.0"
        required: true
        purpose:  ES module runtime. EventEmitter, crypto.
      - name:     guardian-extension
        version:  "5.0.0"
        required: false
        purpose:  Browser-side bridge. Injects causal events from DOM, AI tabs, callto elements.
    constraints:
      - id: CONS-001
        description: >
          No circular imports across module layers. Foundation modules (identity, time) have
          zero imports and must remain so. DAG must be acyclic at the layer level.
        type: hard
        source: Architecture DAG — stated in barrel export and README.
        enforced_by: [GATE-001]
      - id: CONS-002
        description: >
          Gates return GateOutput[] — they never call kernel.ingest() directly (A-2).
          Gate output is collected atomically and ingested after gate phase completes.
        type: hard
        source: Law A-2.
        enforced_by: [GATE-002]
      - id: CONS-003
        description: >
          macro:detected events are never kernel events — projection-only (C-2).
          No component may emit macro:detected via kernel.ingest().
        type: hard
        source: Law C-2.
        enforced_by: [GATE-003]
      - id: CONS-004
        description: >
          Version Gate Axiom (VM-1): all .nex artifacts must be validated by version-gate
          before parsing, migration, or hydration. No component bypasses this gate.
        type: hard
        source: version-gate module — VM-1.
        enforced_by: [GATE-007]
      - id: CONS-005
        description: >
          Ledger Separation (L-2): UpgradeLedger and IdeaLedger must never be mixed.
          Idea entries have zero enforcement surface — cannot affect runtime state (L-3).
        type: hard
        source: ledger module — invariants L-1..L-4.
        enforced_by: [GATE-008]
    supersedes:     ""
    notes: >
      v6.0.0 adds: ledger (dual upgrade/idea), enforcement (29 invariants BoundaryIndex),
      observer, sigma, clip, adapter-sandbox, context (CI-1..CI-6), version-gate (VM-1..VM-6).
      Total 21 modules. Guardian extension (v5.0.0) is an optional external bridge.
      nexus-topo (SISO/SNR) is a related standalone signal-filtering package — not a dependency.

  # ════════════════════════════════════════════════════════════════
  