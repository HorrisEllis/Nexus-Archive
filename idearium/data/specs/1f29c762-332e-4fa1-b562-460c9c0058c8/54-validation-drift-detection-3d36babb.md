---
chunk_uuid: 3d36babb-323b-4f68-b6d6-eec376493a9d
spec_uuid: 1f29c762-332e-4fa1-b562-460c9c0058c8
section: validation-drift-detection
title: validation — drift_detection
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:1f29c762:validation-drift-detection
contract_id: spec-contract:1f29c762:validation-drift-detection:3d36babb
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T16:49:27.354Z
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
