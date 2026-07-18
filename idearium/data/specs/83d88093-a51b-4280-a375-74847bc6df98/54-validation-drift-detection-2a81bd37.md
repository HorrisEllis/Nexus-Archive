---
chunk_uuid: 2a81bd37-bda5-432c-a61b-8163880c41ff
spec_uuid: 83d88093-a51b-4280-a375-74847bc6df98
section: validation-drift-detection
title: validation — drift_detection
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:83d88093:validation-drift-detection
contract_id: spec-contract:83d88093:validation-drift-detection:2a81bd37
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:39:53.203Z
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
