---
chunk_uuid: b718790a-2ebe-4b5f-a21a-0ff8d7e400ac
spec_uuid: 9d4b9a4e-bb05-478e-a231-c9e41da42b80
section: validation-drift-detection
title: validation — drift_detection
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:9d4b9a4e:validation-drift-detection
contract_id: spec-contract:9d4b9a4e:validation-drift-detection:b718790a
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:55:53.069Z
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
