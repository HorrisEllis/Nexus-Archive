---
chunk_uuid: e334ab2c-2132-4bd9-acaf-2e4483f3b845
spec_uuid: b675a98f-3025-4b45-8ab2-44a583b60881
section: validation-drift-detection
title: validation — drift_detection
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:b675a98f:validation-drift-detection
contract_id: spec-contract:b675a98f:validation-drift-detection:e334ab2c
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:54:04.281Z
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
