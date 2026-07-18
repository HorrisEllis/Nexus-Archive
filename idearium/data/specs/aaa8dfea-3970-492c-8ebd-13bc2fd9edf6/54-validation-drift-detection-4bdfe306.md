---
chunk_uuid: 4bdfe306-4a19-4f50-b790-05a40dc087b2
spec_uuid: aaa8dfea-3970-492c-8ebd-13bc2fd9edf6
section: validation-drift-detection
title: validation — drift_detection
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:aaa8dfea:validation-drift-detection
contract_id: spec-contract:aaa8dfea:validation-drift-detection:4bdfe306
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T17:12:56.370Z
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
