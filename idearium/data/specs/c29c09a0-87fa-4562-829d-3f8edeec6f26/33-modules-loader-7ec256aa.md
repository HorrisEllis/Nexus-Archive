---
chunk_uuid: 7ec256aa-f282-477d-9d2e-6b502f6a0056
spec_uuid: c29c09a0-87fa-4562-829d-3f8edeec6f26
section: modules-loader
title: modules — loader
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:c29c09a0:modules-loader
contract_id: spec-contract:c29c09a0:modules-loader:7ec256aa
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:51:39.006Z
---

<!-- imported: modules → loader -->


    loader:
      id:           loader
      uuid:         aa000011-load-4000-0000-000000000000
      layer:        ai
      status:       active
      owner:        james-brooks
      version:      5.0.2
      file_ref:     modules/loader/index.js
      created_at:   2025-01-01T00:00:00Z
      last_modified: 2026-05-24T04:00:00Z
      purpose: >
        Hot ES module loader and evaluator. loadModule(src) evaluates forge-produced source
        strings in a sandboxed eval context, runs gate tests, and returns { ok, module } or
        { ok: false, error }. hotReload() replaces live module references without restart.
      inputs:
        - id: IN-load-001
          name: module_source
          type: string
          required: true
          source: forge
          description: ES module source string produced by forge. Evaluated in sandbox.
      outputs:
        - id: OUT-load-001
          name: load_result
          type: LoadResult
          destination: forge
          description: "{ ok, module } on success. { ok: false, error } on parse or gate failure."
      dependencies:
        internal:
          - module_id: forge
            why: Receives forge-produced source. Returns load result for forge to report.
            coupling: runtime
        external: []
      hooks_in: []
      hooks_out: []
      failure_modes:
        - id: FAIL-load-001
          scenario: Forge-produced source has syntax error. Eval throws SyntaxError.
          impact: recoverable
          probability: low
          detection: Eval wrapped in try/catch. SyntaxError caught and returned as error.
          mitigation: "Return { ok: false, error }. Source discarded. forge retries."
          recovery: forge retries with refined prompt.
          emits_gap: false
        - id: FAIL-load-002
          scenario: Hot-reloaded module has different export shape than expected.
          impact: recoverable
          probability: low
          detection: hotReload() validates export shape against expected interface.
          mitigation: Reject incompatible module. Keep old module live.
          recovery: forge produces compatible export shape. hotReload() retried.
          emits_gap: false
      state_model:
        type: stateful
        state_vars:
          - name: liveModules
            type: "Map<moduleId, Module>"
            persistence: memory
            description: Currently loaded live modules. Replaced atomically on hotReload().
        hot_path: in-memory Map
        truth_layer: none
      performance:
        poll_interval_ms: 0
        latency_budget_ms: 100
        throughput_target: "10 loads/s"
        memory_budget_mb: 32
        notes: Eval cost varies by module size. Gate tests add ~50ms per load.
      security:
        trust_level: untrusted
        data_sensitivity: sensitive
        attack_surface:
          - vector: Forged module source with malicious eval payload.
            risk: Arbitrary code execution in runtime.
            mitigated_by: Eval in sandboxed context. Gate tests run before hotReload(). Human review recommended.
      behavioral_contract:
        summary: "Sandboxed ES module evaluator and hot-reloader for forge-produced source."
        success: "loadModule(validSrc) returns { ok: true, module } with correct exports."
        failure: "loadModule() returns { ok: true } but module has missing or incompatible exports."
        sla_ms: 100
        invariant_refs: []
      cobalt:
        reads: []
        writes: []
        cli: []

  # ════════════════════════════════════════════════════════════════
  