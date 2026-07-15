---
chunk_uuid: 22bcf004-a3a8-4064-af4f-fa93090f9bd5
spec_uuid: d9ee9fa1-eb73-47a2-a867-38ddffc2a46e
section: validation-drift-detection
title: validation — drift_detection
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:d9ee9fa1:validation-drift-detection
contract_id: spec-contract:d9ee9fa1:validation-drift-detection:22bcf004
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T08:06:57.864Z
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
