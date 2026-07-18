---
chunk_uuid: 15aa5d66-4783-43cb-80e7-8db2e913df2f
spec_uuid: 05c58965-3175-403a-8c3f-28ed5ad91eaf
section: validation-drift-detection
title: validation — drift_detection
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:05c58965:validation-drift-detection
contract_id: spec-contract:05c58965:validation-drift-detection:15aa5d66
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T20:13:46.079Z
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
