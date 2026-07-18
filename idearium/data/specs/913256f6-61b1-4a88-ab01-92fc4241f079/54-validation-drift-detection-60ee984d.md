---
chunk_uuid: 60ee984d-2bce-469d-abe8-966a23c990e3
spec_uuid: 913256f6-61b1-4a88-ab01-92fc4241f079
section: validation-drift-detection
title: validation — drift_detection
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:913256f6:validation-drift-detection
contract_id: spec-contract:913256f6:validation-drift-detection:60ee984d
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T17:14:28.073Z
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
