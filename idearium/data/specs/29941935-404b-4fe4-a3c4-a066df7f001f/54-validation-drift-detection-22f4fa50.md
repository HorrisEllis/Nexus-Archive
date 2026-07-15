---
chunk_uuid: 22f4fa50-f633-44e7-abf0-d8a2757daaea
spec_uuid: 29941935-404b-4fe4-a3c4-a066df7f001f
section: validation-drift-detection
title: validation — drift_detection
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:29941935:validation-drift-detection
contract_id: spec-contract:29941935:validation-drift-detection:22f4fa50
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:56:07.028Z
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
