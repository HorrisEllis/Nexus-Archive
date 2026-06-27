spec:
  meta:
    name:        escalation
    version:     1.1.0
    foundation:  nexus-system-foundation@1.0.0
    uuid:        nexus-escalation-v1-0000-2026-0615-jamesbrooks-001
    purpose: >
      The friction ledger and escalation logic. Every failed attempt adds friction to the fault class (0.10/0.20/0.35/0.50 per level). Friction persists in fault_taxonomy across sessions. At 1.0 → failure mode, no more auto-attempts.

  changelog:
    - version: 1.1.0
      date:    2026-06-27
      change: "Spec was stale at 1.0.0. lib/version.js's registry had already moved to 1.1.0 (named+typed stale_module gaps, gapLabel in all logs) but cortex/self-heal/escalation.js's own internal VERSION constant had never been bumped to match its own registry entry. Fixed both the spec and the file's own constant together — registry was the one correct layer of the three."
      evidence: "boot log 2026-06-27T08:57:45Z (escalation: spec@1.0.0 ≠ code@1.1.0); lib/version.js modules.escalation"

  friction_thresholds:
    NOMINAL:      0.0
    ELEVATED:     0.4
    HIGH:         0.7
    FAILURE_MODE: 1.0
  levels:
    0: "Known fix replay — forge_patches history, successRate > 0.5"
    1: "Safe fix — 8 patterns: stale_module, timeout, api_degraded, queue_saturated, memory_pressure, bottleneck, circuit_breaker, import_error"
    2: "Snapshot + Forge — T3 propose-only, never auto-apply"
    3: "Deep scan — all 12 engines, full evidence → fault_taxonomy"
    4: "Failure mode — human action item, no more auto-attempts"
