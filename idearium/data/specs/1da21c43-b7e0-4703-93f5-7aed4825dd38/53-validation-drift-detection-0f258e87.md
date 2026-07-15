---
chunk_uuid: 0f258e87-a26a-4ba8-8012-17d5900b4ada
spec_uuid: 1da21c43-b7e0-4703-93f5-7aed4825dd38
section: validation-drift-detection
title: validation — drift_detection
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:1da21c43:validation-drift-detection
contract_id: spec-contract:1da21c43:validation-drift-detection:0f258e87
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:31:53.148Z
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