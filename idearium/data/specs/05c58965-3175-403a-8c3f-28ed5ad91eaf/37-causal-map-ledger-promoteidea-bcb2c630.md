---
chunk_uuid: bcb2c630-16e1-4e4d-a137-d0864fe445b9
spec_uuid: 05c58965-3175-403a-8c3f-28ed5ad91eaf
section: causal-map-ledger-promoteidea
title: causal map — ledger.promoteIdea
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:05c58965:causal-map-ledger-promoteidea
contract_id: spec-contract:05c58965:causal-map-ledger-promoteidea:bcb2c630
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T20:13:36.958Z
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
