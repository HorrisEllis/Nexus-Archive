---
chunk_uuid: 3bf33d18-6865-4963-ba92-1910db3e4707
spec_uuid: a851a5dc-8344-4269-b2e1-a2d72dc348db
section: validation-drift-detection
title: validation — drift_detection
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:a851a5dc:validation-drift-detection
contract_id: spec-contract:a851a5dc:validation-drift-detection:3bf33d18
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:41:37.783Z
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