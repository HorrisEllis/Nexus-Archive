---
chunk_uuid: f166c2e1-6176-449e-8e75-0e4aa65d85a8
spec_uuid: c29c09a0-87fa-4562-829d-3f8edeec6f26
section: validation-drift-detection
title: validation — drift_detection
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:c29c09a0:validation-drift-detection
contract_id: spec-contract:c29c09a0:validation-drift-detection:f166c2e1
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:51:43.468Z
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
