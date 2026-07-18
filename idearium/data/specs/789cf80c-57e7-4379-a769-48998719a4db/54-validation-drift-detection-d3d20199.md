---
chunk_uuid: d3d20199-7324-47d9-9043-bef052167b77
spec_uuid: 789cf80c-57e7-4379-a769-48998719a4db
section: validation-drift-detection
title: validation — drift_detection
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:789cf80c:validation-drift-detection
contract_id: spec-contract:789cf80c:validation-drift-detection:d3d20199
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:52:23.505Z
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
