---
chunk_uuid: 082ab2e9-36f0-458b-a2b5-52e364130759
spec_uuid: a83184e7-1073-43f9-80a5-02ea05a66d74
section: validation-drift-detection
title: validation — drift_detection
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:a83184e7:validation-drift-detection
contract_id: spec-contract:a83184e7:validation-drift-detection:082ab2e9
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T16:22:56.167Z
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
