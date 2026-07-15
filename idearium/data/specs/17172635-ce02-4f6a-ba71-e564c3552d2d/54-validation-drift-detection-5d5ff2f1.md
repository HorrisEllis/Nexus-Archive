---
chunk_uuid: 5d5ff2f1-87bb-47b5-a7af-e12c058db807
spec_uuid: 17172635-ce02-4f6a-ba71-e564c3552d2d
section: validation-drift-detection
title: validation — drift_detection
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:17172635:validation-drift-detection
contract_id: spec-contract:17172635:validation-drift-detection:5d5ff2f1
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T07:37:23.128Z
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
