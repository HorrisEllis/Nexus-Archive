---
chunk_uuid: 55c2a944-e37e-452a-8add-4b6147fb2f8c
spec_uuid: 1f29c762-332e-4fa1-b562-460c9c0058c8
section: runtime-model-lifecycle
title: runtime model — lifecycle
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:1f29c762:runtime-model-lifecycle
contract_id: spec-contract:1f29c762:runtime-model-lifecycle:55c2a944
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T16:49:25.584Z
---

<!-- imported: runtime model → lifecycle -->


    lifecycle:
      startup_sequence:
        - phase: 0
          name: Node version check
          type: hard
          description: Node >= 18.0.0. crypto.randomUUID available. ES modules supported.
          on_failure: abort
        - phase: 1
          name: Foundation import
          type: hard
          description: identity, time modules imported. UUID + clock functional.
          on_failure: abort
        - phase: 2
          name: Causality import
          type: hard
          description: causality, projection, lazy modules imported. Edge taxonomy ready.
          on_failure: abort
        - phase: 3
          name: Kernel construction
          type: hard
          description: createKernel() called. BoundaryIndex attached. Built-in gates registered.
          on_failure: abort
        - phase: 4
          name: Persist + analytics
          type: soft
          description: createStore() if persistence enabled. version-gate, delta, query ready.
          on_failure: degrade
        - phase: 5
          name: AI layer (optional)
          type: soft
          description: forge, loader if Anthropic API accessible. ledger if dual-ledger enabled.
          on_failure: degrade
        - phase: 6
          name: Ready
          type: soft
          description: First event ingested. kernel.subscribe() active.
          on_failure: continue

      shutdown_sequence:
        - step: 1
          name: Flush WAL
          module_id: persist
          timeout_ms: 5000
          on_timeout: force_kill
        - step: 2
          name: Archive pending evictions
          module_id: persist
          timeout_ms: 2000
          on_timeout: force_kill
        - step: 3
          name: Snapshot kernel state
          module_id: compress
          timeout_ms: 3000
          on_timeout: escalate

      health_check:
        enabled: false
        endpoint: ""
        interval_ms: 0
        failure_threshold: 0
        recovery_threshold: 0

      crash_recovery:
        strategy: checkpoint
        max_restarts: 0
        restart_window_s: 0
        backoff: "n/a — library, not a process"
        crash_report: false
