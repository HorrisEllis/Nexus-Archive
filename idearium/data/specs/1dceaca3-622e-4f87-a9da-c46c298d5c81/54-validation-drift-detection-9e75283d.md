---
chunk_uuid: 9e75283d-90b4-457e-bab0-1f71a29b5509
spec_uuid: 1dceaca3-622e-4f87-a9da-c46c298d5c81
section: validation-drift-detection
title: validation — drift_detection
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:1dceaca3:validation-drift-detection
contract_id: spec-contract:1dceaca3:validation-drift-detection:9e75283d
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T21:02:19.384Z
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
