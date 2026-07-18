---
chunk_uuid: 75cbf564-52d0-4450-b6ee-d5e896b8baf7
spec_uuid: fd6be92e-8d77-4686-8f93-c17959911727
section: validation-drift-detection
title: validation — drift_detection
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:fd6be92e:validation-drift-detection
contract_id: spec-contract:fd6be92e:validation-drift-detection:75cbf564
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T17:22:07.665Z
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
