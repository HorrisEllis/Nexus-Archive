---
chunk_uuid: 6da4f6a9-2ccf-438b-8cb2-51724983fe52
spec_uuid: f4232853-1ea4-4a6f-9b28-6fddd9db00fd
section: modules-ledger
title: modules — ledger
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:f4232853:modules-ledger
contract_id: spec-contract:f4232853:modules-ledger:6da4f6a9
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:55:14.284Z
---

<!-- imported: modules → ledger -->


    ledger:
      id:           ledger
      uuid:         a9b0c1d2-e3f4-4a5b-6c7d-8e9f0a1b2c3d
      layer:        ai
      status:       active
      owner:        james-brooks
      version:      1.0.0
      file_ref:     modules/ledger/index.js
      created_at:   2026-05-24T03:42:00Z
      last_modified: 2026-05-24T04:24:00Z
      purpose: >
        Dual Ledger — UpgradeLedger (authoritative truth) and IdeaLedger (cognition/speculation).
        UpgradeLedger: append-only after commit. Replay reconstructs everything (§7.6).
        IdeaLedger: mutable, speculative, never affects runtime (L-3).
        Ideas become upgrades only via promoteIdea() cognition gate (L-4).
      inputs:
        - id: IN-ledger-001
          name: idea_entry
          type: IdeaEntry
          required: false
          source: forge
          description: Speculative hypothesis. Mutable until promoted or closed.
        - id: IN-ledger-002
          name: validation_result
          type: ValidationResult
          required: false
          source: loader
          description: Test result or proven diff. Required for promoteIdea().
      outputs:
        - id: OUT-ledger-001
          name: upgrade_entry
          type: UpgradeEntry
          destination: caller
          description: >
            Verified upgrade record. Types: passing_test | proven_diff | measurable_result |
            config_change | module_addition | bug_fix | phase_complete | feature | refactor |
            security_fix.
        - id: OUT-ledger-002
          name: ledger_events
          type: LedgerEvent
          destination: observer-bus
          description: idea:recorded, idea:closed, idea:promoted, upgrade:committed, bottleneck.
      dependencies:
        internal:
          - module_id: observer
            why: Emits ledger events to observer bus. Zero coupling via ledger.on() API.
            coupling: event
        external: []
      hooks_in: []
      hooks_out:
        - event: "idea:recorded"
          trigger: IdeaLedger.record() called.
          description: Fires with { idea }.
        - event: "idea:promoted"
          trigger: promoteIdea() gate passes.
          description: Fires with { idea, upgrade }. Idea moves to UpgradeLedger.
        - event: "upgrade:committed"
          trigger: UpgradeLedger.commit() called.
          description: Fires with { upgrade }. Authoritative record created.
        - event: "bottleneck"
          trigger: Unresolved idea count > BOTTLENECK_THRESHOLD=5.
          description: Fires with { metrics }. Operator alert.
      failure_modes:
        - id: FAIL-ledger-001
          scenario: promoteIdea() bypass attempted — idea promoted without validation gate.
          impact: fatal
          probability: rare
          detection: promoteIdea() validates entry.type against UPGRADE_TYPE enum. LedgerError on miss.
          mitigation: LedgerError is hard throw. Never caught silently.
          recovery: Fix entry type. Retry promoteIdea() with valid validation evidence.
          emits_gap: false
        - id: FAIL-ledger-002
          scenario: IdeaLedger entry committed to UpgradeLedger directly (L-2 bypass).
          impact: fatal
          probability: rare
          detection: validateSeparation() catches cross-contamination. LedgerError thrown.
          mitigation: Type-tagged entries. LedgerError on wrong-ledger commit.
          recovery: Remove contaminated entry. Reconstruct UpgradeLedger from clean entries.
          emits_gap: false
      state_model:
        type: stateful
        state_vars:
          - name: ideaLog
            type: "IdeaEntry[]"
            persistence: memory
            description: Mutable speculative ideas.
          - name: upgradeLog
            type: "UpgradeEntry[]"
            persistence: memory
            description: Append-only after commit. Source of truth for system evolution.
        hot_path: in-memory arrays
        truth_layer: upgradeLog
      performance:
        poll_interval_ms: 0
        latency_budget_ms: 5
        throughput_target: "100 ledger operations/s"
        memory_budget_mb: 16
        notes: Not a hot path. Operator-triggered or AI-triggered only.
      security:
        trust_level: trusted
        data_sensitivity: internal
        attack_surface:
          - vector: Forged validation result to bypass L-4 gate.
            risk: Unvalidated idea enters UpgradeLedger.
            mitigated_by: UPGRADE_TYPE enum frozen. LedgerError on any mismatch.
      behavioral_contract:
        summary: Dual ledger separating speculative ideas from verified upgrades. Gate-enforced promotion.
        success: Ideas in IdeaLedger (mutable). Upgrades in UpgradeLedger (append-only). promoteIdea() is the only path.
        failure: Any idea in UpgradeLedger without passing promoteIdea() (L-4), or ledger type mixing (L-2).
        sla_ms: 5
        invariant_refs: [INV-L2, INV-L4]
      cobalt:
        reads: []
        writes: []
        cli: []
