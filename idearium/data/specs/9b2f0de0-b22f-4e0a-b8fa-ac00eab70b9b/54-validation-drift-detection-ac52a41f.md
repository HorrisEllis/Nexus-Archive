---
chunk_uuid: ac52a41f-4a4b-4bbe-8d42-cfbfe156ebda
spec_uuid: 9b2f0de0-b22f-4e0a-b8fa-ac00eab70b9b
section: validation-drift-detection
title: validation — drift_detection
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:9b2f0de0:validation-drift-detection
contract_id: spec-contract:9b2f0de0:validation-drift-detection:ac52a41f
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:55:56.106Z
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
