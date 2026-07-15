---
chunk_uuid: e1ff70f8-6d60-46a6-aeec-f9fec8d1fec9
spec_uuid: 9d4b9a4e-bb05-478e-a231-c9e41da42b80
section: runtime-model-lifecycle
title: runtime model — lifecycle
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:9d4b9a4e:runtime-model-lifecycle
contract_id: spec-contract:9d4b9a4e:runtime-model-lifecycle:e1ff70f8
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:55:52.954Z
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
