---
chunk_uuid: 2be09100-a4b0-454b-97b7-fdf7ce53e206
spec_uuid: 034dfc10-73b1-480c-b6dc-83a339579ffa
section: validation-drift-detection
title: validation — drift_detection
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:034dfc10:validation-drift-detection
contract_id: spec-contract:034dfc10:validation-drift-detection:2be09100
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:45:07.108Z
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