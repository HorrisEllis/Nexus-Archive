---
chunk_uuid: a37637cb-5d97-46a1-a12d-9bd3c956e7c3
spec_uuid: 9d4b9a4e-bb05-478e-a231-c9e41da42b80
section: causal-map-ledger-promoteidea
title: causal map — ledger.promoteIdea
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:9d4b9a4e:causal-map-ledger-promoteidea
contract_id: spec-contract:9d4b9a4e:causal-map-ledger-promoteidea:a37637cb
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:55:52.869Z
---

<!-- imported: causal map → ledger.promoteIdea -->


    ledger.promoteIdea:
      id: ledger.promoteIdea
      type: mutation
      description: >
        The cognition gate (L-4). An idea exits IdeaLedger and becomes UpgradeEntry in
        UpgradeLedger. The ONLY path between speculative and authoritative. Throws LedgerError
        if entry type invalid or ledgers are mixed.
      source: ledger
      critical_path: false
      invariant_refs: [INV-L2, INV-L4]
      causes:
        - target: ledger
          mechanism: direct
          latency: "immediate"
          certainty: always
          condition: null
          description: UpgradeEntry appended to upgradeLog. idea:promoted emitted.
        - target: observer
          mechanism: direct
          latency: "immediate"
          certainty: always
          condition: null
          description: idea:promoted observer event fires with { idea, upgrade }.
      affects:
        - target: ideaLog
          nature: modifies
          reversible: false
          description: Idea status set to PROMOTED. Entry closed.
        - target: upgradeLog
          nature: creates
          reversible: false
          description: UpgradeEntry appended. Append-only after commit.
      risks:
        - id: RISK-CAUSAL-004
          description: Forged validation result passed to promoteIdea() to bypass L-4 gate.
          probability: rare
          severity: critical
          mitigated_by: UPGRADE_TYPE enum frozen. LedgerError on any invalid type.
      blast_radius:
        modules: [ledger, observer, enforcement]
        tables: []
        interfaces: []
        invariants: [INV-L2, INV-L4]
        max_depth: 2
        recomputed_at: 2026-05-24T04:00:00Z
