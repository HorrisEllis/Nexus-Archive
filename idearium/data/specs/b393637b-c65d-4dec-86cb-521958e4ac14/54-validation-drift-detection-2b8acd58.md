---
chunk_uuid: 2b8acd58-5db1-435b-bfe6-560c59f6880c
spec_uuid: b393637b-c65d-4dec-86cb-521958e4ac14
section: validation-drift-detection
title: validation — drift_detection
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:b393637b:validation-drift-detection
contract_id: spec-contract:b393637b:validation-drift-detection:2b8acd58
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:47:15.465Z
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
