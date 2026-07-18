---
chunk_uuid: 64ee4378-53b1-4ddc-9c2a-b898aa948330
spec_uuid: f9e0523f-c89e-4bb1-9e6f-88cdd2aa2107
section: validation-drift-detection
title: validation — drift_detection
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:f9e0523f:validation-drift-detection
contract_id: spec-contract:f9e0523f:validation-drift-detection:64ee4378
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T20:12:34.187Z
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
