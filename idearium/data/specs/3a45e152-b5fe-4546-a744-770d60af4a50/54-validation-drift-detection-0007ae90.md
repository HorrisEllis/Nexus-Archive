---
chunk_uuid: 0007ae90-d811-4846-917a-b437135dc1d4
spec_uuid: 3a45e152-b5fe-4546-a744-770d60af4a50
section: validation-drift-detection
title: validation — drift_detection
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:3a45e152:validation-drift-detection
contract_id: spec-contract:3a45e152:validation-drift-detection:0007ae90
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:22:13.548Z
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
