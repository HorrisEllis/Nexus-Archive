---
chunk_uuid: 4275e03a-8ff4-4507-a084-f66cf30d03e9
spec_uuid: b675a98f-3025-4b45-8ab2-44a583b60881
section: validation-gates
title: validation — gates
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:b675a98f:validation-gates
contract_id: spec-contract:b675a98f:validation-gates:4275e03a
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:54:04.048Z
---

<!-- imported: validation → gates -->

# BLOCK 9 — VALIDATION
  # ════════════════════════════════════════════════════════════════
  validation:
    gates:
      - id: GATE-001
        name: no-circular-imports
        type: schema
        scope: full_spec
        trigger: on_patch
        severity: fatal
        enforces: [CONS-001]
        description: >
          Validates that no module imports from a higher layer. Foundation has zero imports.
          Causality imports only from foundation. Static analysis of import statements.
        check_logic: validation/no-circular-imports.js
        on_failure:
          action: rollback
          message_template: >
            LAYER VIOLATION: {module} in {layer} imports from {target_layer} (higher layer). DAG broken.
          log_to: [failures]

      - id: GATE-002
        name: ingest-pipeline-order
        type: invariant
        scope: continuous
        trigger: continuous
        severity: fatal
        enforces: [INV-I1, INV-I2, INV-C4, INV-A2]
        description: >
          Continuously verifies: gates fire before listeners (C-4), no gate calls ingest() (A-2),
          every event has UUID v4 (I-1), contentHash stable for same payload (I-2).
          BoundaryIndex monitors all on every ingest.
        check_logic: modules/enforcement/index.js (BoundaryIndex)
        on_failure:
          action: halt
          message_template: "INVARIANT VIOLATION {invariantId}: {message}. Hard stop."
          log_to: [failures, law_violations]

      - id: GATE-003
        name: causal-edge-declaration
        type: invariant
        scope: continuous
        trigger: continuous
        severity: fatal
        enforces: [INV-C1, INV-C2, INV-C3]
        description: >
          Monitors C-1 (edgeType declared), C-2 (no macro:detected as kernel event),
          C-3 (traceToRoot uses only causal/* edges). BoundaryIndex on every event.
        check_logic: modules/enforcement/index.js (BoundaryIndex)
        on_failure:
          action: halt
          message_template: "CAUSAL INVARIANT {invariantId}: {message}. edgeType: {edgeType}."
          log_to: [failures, law_violations]

      - id: GATE-004
        name: hostile-hardening-bounds
        type: invariant
        scope: continuous
        trigger: continuous
        severity: error
        enforces: [INV-H1, INV-H6]
        description: >
          H-1: edge graph bounded (edges <= ringCap * 2 after every eviction).
          H-6: seenMap bounded at MAX_SEEN_MAP=10,000. BoundaryIndex on every ingest and eviction.
        check_logic: modules/enforcement/index.js (BoundaryIndex)
        on_failure:
          action: alert
          message_template: "MEMORY BOUND VIOLATION {invariantId}: edges={edgeCount} seenMap={seenMapSize}."
          log_to: [failures]

      - id: GATE-005
        name: test-suite-green
        type: coherence
        scope: full_spec
        trigger: on_patch
        severity: fatal
        enforces: [INV-I1, INV-I2, INV-C1, INV-C2, INV-C3, INV-C4, INV-A2, INV-H1, INV-H6]
        description: >
          All 195 tests must pass after any patch. node test/runner.js exit code 0 required.
          Cross-domain invariant suite must be green.
        check_logic: test/runner.js
        on_failure:
          action: rollback
          message_template: "TEST SUITE FAILED: {failedCount}/195 failing after patch {patchId}. Rolled back."
          log_to: [failures]

      - id: GATE-006
        name: version-bump-semantic
        type: schema
        scope: patch_only
        trigger: on_patch
        severity: fatal
        enforces: [INV-VM1]
        description: >
          Every patch must include correct version bump: MAJOR for intent/invariant/interface changes,
          MINOR for new modules/invariants, PATCH for docs/notes.
        check_logic: validation/version-bump-semantic.js
        on_failure:
          action: rollback
          message_template: "VERSION BUMP MISMATCH: {change_type} requires {required_bump} not {actual_bump}."
          log_to: [failures]

      - id: GATE-007
        name: nex-artifact-validation
        type: invariant
        scope: affected_blocks
        trigger: on_patch
        severity: fatal
        enforces: [INV-VM1, CONS-004]
        description: >
          All .nex artifact hydration call sites must call versionGate.validate() first.
          Static analysis of restore, recoverStore, createReplayContext, clip.restore calls.
        check_logic: validation/nex-artifact-validation.js
        on_failure:
          action: rollback
          message_template: "VM-1 VIOLATION: {file}:{line} calls {hydrationFn} without version-gate. Rejected."
          log_to: [failures, law_violations]

      - id: GATE-008
        name: ledger-separation
        type: invariant
        scope: continuous
        trigger: continuous
        severity: fatal
        enforces: [INV-L2, INV-L4, CONS-005]
        description: >
          L-2: UpgradeLedger and IdeaLedger never mixed. L-4: ideas promoted only via
          promoteIdea(). validateSeparation() after every promoteIdea(). LedgerError on violation.
        check_logic: modules/ledger/index.js (validateSeparation + promoteIdea gate)
        on_failure:
          action: halt
          message_template: "LEDGER INVARIANT {invariantId}: {message}. Truth ledger compromised. Halt."
          log_to: [failures, law_violations]
