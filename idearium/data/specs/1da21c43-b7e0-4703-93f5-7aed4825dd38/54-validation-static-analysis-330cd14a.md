---
chunk_uuid: 330cd14a-d25c-4272-b697-00bdeb90b0c3
spec_uuid: 1da21c43-b7e0-4703-93f5-7aed4825dd38
section: validation-static-analysis
title: validation — static_analysis
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:1da21c43:validation-static-analysis
contract_id: spec-contract:1da21c43:validation-static-analysis:330cd14a
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:31:53.175Z
---

<!-- imported: validation → static_analysis -->

static_analysis:
      run_on: [on_patch, deploy]
      tools: [eslint, spec-lint]
      fail_on: fatal_only