---
chunk_uuid: 6fe0c33f-d778-4876-835b-d4629d93275f
spec_uuid: 3951dfb7-be77-4126-89b4-73204ca641c9
section: validation-drift-detection
title: validation — drift_detection
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:3951dfb7:validation-drift-detection
contract_id: spec-contract:3951dfb7:validation-drift-detection:6fe0c33f
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:54:38.199Z
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
