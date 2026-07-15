---
chunk_uuid: 1597d4b8-113a-4c4c-a330-d99e9964be15
spec_uuid: f4232853-1ea4-4a6f-9b28-6fddd9db00fd
section: validation-drift-detection
title: validation — drift_detection
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:f4232853:validation-drift-detection
contract_id: spec-contract:f4232853:validation-drift-detection:1597d4b8
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:55:14.746Z
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
