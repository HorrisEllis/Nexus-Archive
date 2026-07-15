---
chunk_uuid: 101f56da-cd8d-47f5-b40f-cd6fc34fed39
spec_uuid: ac87dd93-d243-43b5-bc5b-46a8b7505cc9
section: validation-drift-detection
title: validation — drift_detection
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ac87dd93:validation-drift-detection
contract_id: spec-contract:ac87dd93:validation-drift-detection:101f56da
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:53:01.085Z
---

<!-- imported: validation → drift_detection -->

    drift_detection:
      enabled: true
      comparison_target: last_snapshot
      check_interval_s: 3600
      drift_threshold: 0.15
      auto_patch_proposal: false
      on_drift:
        below_threshold: log
        above_threshold: alert