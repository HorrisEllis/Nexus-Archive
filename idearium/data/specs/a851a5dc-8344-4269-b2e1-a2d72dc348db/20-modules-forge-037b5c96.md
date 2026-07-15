---
chunk_uuid: 037b5c96-b329-4d7f-9d46-b0c1427ac9fe
spec_uuid: a851a5dc-8344-4269-b2e1-a2d72dc348db
section: modules-forge
title: modules — forge
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:a851a5dc:modules-forge
contract_id: spec-contract:a851a5dc:modules-forge:037b5c96
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:41:37.427Z
---

<!-- imported: modules → forge -->

forge:
      id:           forge
      uuid:         0091ce2c-0000-4000-0000-000000000010
      layer:        ai
      status:       active
      owner:        james-brooks
      version:      5.0.2
      file_ref:     modules/forge/index.js
      created_at:   2025-01-01T00:00:00Z
      last_modified: 2026-05-24T04:00:00Z
      purpose: >
        AI-powered self-modification of causal-nexus modules via Anthropic API.
        Four operations: forgeModule (full rewrite), forgePatch (targeted patch),
        forgeGate (gate function generation), forgeHook (hook addition).
        Produces ES module source strings — loader.loadModule() evaluates them.
      inputs:
        - id: IN-forge-001
          name: module_source
          type: string
          required: true
          source: loader
          description: Current module source. Context for AI rewriting.
        - id: IN-forge-002
          name: patch_description
          type: string
          required: true
          source: caller
          description: Natural language description of the desired change.
      outputs:
        - id: OUT-forge-001
          name: patch_record
          type: PatchRecord
          destination: loader
          description: "{ ok, src, durationMs, tokensUsed, laws[] }. src is modified ES module source."
      dependencies:
        internal:
          - module_id: loader
            why: Evaluation of produced source via loadModule(). Hot reload via hotReload().
            coupling: runtime
        external:
          - name: anthropic-api
            version: "claude-sonnet-4-20250514"
            why: AI code generation. No local fallback (TRDE-004).
            optional: false
      hooks_in: []
      hooks_out: []
      failure_modes:
        - id: FAIL-forge-001
          scenario: Anthropic API returns non-200 or rate-limit error.
          impact: recoverable
          probability: medium
          detection: fetch() response.ok === false.
          mitigation: "Return { ok: false, error }. Caller decides to retry or skip."
          recovery: Wait for rate limit window. Retry with exponential backoff.
          emits_gap: false
        - id: FAIL-forge-002
          scenario: forge produces syntactically invalid ES module source.
          impact: recoverable
          probability: low
          detection: "loader.loadModule() returns { ok: false } with parse error."
          mitigation: "Return { ok: false, error }. Source discarded."
          recovery: Retry forgeModule with more specific description.
          emits_gap: false
      state_model:
        type: stateless
        state_vars: []
        hot_path: none
        truth_layer: none
      performance:
        poll_interval_ms: 0
        latency_budget_ms: 30000
        throughput_target: "1 forge operation at a time"
        memory_budget_mb: 8
        notes: Latency dominated by Anthropic API round-trip (3-30s). Operator-invoked only.
      security:
        trust_level: untrusted
        data_sensitivity: sensitive
        attack_surface:
          - vector: Prompt injection via malicious module source sent to forge.
            risk: AI produces adversarial code loaded into runtime.
            mitigated_by: loader.loadModule() runs tests before returning. Human review recommended.
      behavioral_contract:
        summary: Produces valid, loadable ES module patches from natural language descriptions.
        success: "forgePatch() returns { ok: true, src } where src passes loader.loadModule() >= 80% of the time."
        failure: forgePatch() returns ok:true but src fails loader evaluation.
        sla_ms: 30000
        invariant_refs: []
      cobalt:
        reads: []
        writes: []
        cli: []