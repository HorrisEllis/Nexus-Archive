---
chunk_uuid: 6684594e-6a23-4bda-b8cd-debbc0c4adc9
spec_uuid: f4232853-1ea4-4a6f-9b28-6fddd9db00fd
section: interfaces-internal
title: interfaces — internal
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:f4232853:interfaces-internal
contract_id: spec-contract:f4232853:interfaces-internal:6684594e
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:55:14.698Z
---

<!-- imported: interfaces → internal -->


    internal:
      - id: INT-001
        name: kernel → causality (edge ops)
        from_module: kernel
        to_module: causality
        type: function_call
        mechanism: createEdge(), pruneEdgesFor(), createCalltoMap() APIs
        contract: Synchronous in ingest pipeline steps 4 and H-1. Returns immutable edge records.
        failure_contract: causality throws on diamond. kernel catches and emits system:diamond:rejected.
        latency_budget_ms: 2
        mock_available: true

      - id: INT-002
        name: kernel → enforcement (BoundaryIndex)
        from_module: kernel
        to_module: enforcement
        type: event
        mechanism: kernel.subscribe() — BoundaryIndex attaches on createKernel()
        contract: BoundaryIndex receives every event synchronously before subscriber callbacks. 29 checks per event.
        failure_contract: InvariantViolationError thrown on hard invariant. Hard stop — never caught.
        latency_budget_ms: 1
        mock_available: false

      - id: INT-003
        name: persist → compress (dynamic import)
        from_module: persist
        to_module: compress
        type: function_call
        mechanism: dynamic import() at flush/recover time (TRDE-003)
        contract: Never imported at load time. compress provides snapshot(), restore() for flush/recover.
        failure_contract: "Dynamic import failure: { ok: false, error: 'compress_unavailable' }."
        latency_budget_ms: 10
        mock_available: true

      - id: INT-004
        name: version-gate → context (hydration)
        from_module: version-gate
        to_module: context
        type: function_call
        mechanism: kernel.createReplayContext(migratedArtifact)
        contract: validate() → migrate() → createReplayContext(). Always in this order. CI-1..CI-6 isolated.
        failure_contract: GateValidationError stops hydration. createReplayContext never called on invalid.
        latency_budget_ms: 5
        mock_available: true

      - id: INT-005
        name: ledger → observer (events)
        from_module: ledger
        to_module: observer
        type: event
        mechanism: ledger.on() / ledger.emit() — typed event subscription
        contract: Emits idea:recorded, idea:promoted, upgrade:committed, bottleneck. Zero bus coupling.
        failure_contract: If no observer wired — events silently dropped. Ledger continues normally.
        latency_budget_ms: 1
        mock_available: true
