spec:
  meta:
    name:        snapshot
    version:     1.2.0
    foundation:  nexus-system-foundation@1.0.0
    uuid:        nexus-snapshot-v1-0000-2026-0615-jamesbrooks-001
    purpose: >
      Cortex state snapshot system. Half-life decay with priority tiers. Permanent pinning available. Snapshots taken before any T2 forge patch. Replay engine reconstructs past state from event log and detects divergence.

  changelog:
    - version: 1.2.0
      date:    2026-06-27
      change: "Spec was stale at 1.0.0. lib/version.js's registry had already moved to 1.2.0 (NEX-SNAP/1.2: cortex_state_hash + prev_snapshot_hash tamper-evident chain — the Phase 26 hash-chain work) but cortex/snapshot/index.js's own internal VERSION constant had never been bumped to match. Fixed both the spec and the file's own constant together."
      evidence: "boot log 2026-06-27T08:57:45Z (snapshot: spec@1.0.0 ≠ code@1.2.0); lib/version.js modules.snapshot"

