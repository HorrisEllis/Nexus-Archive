---
chunk_uuid: 58b5ce2d-24bf-4d56-94aa-b3b3049bc138
spec_uuid: f9e0523f-c89e-4bb1-9e6f-88cdd2aa2107
section: validation-static-analysis
title: validation — static_analysis
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:f9e0523f:validation-static-analysis
contract_id: spec-contract:f9e0523f:validation-static-analysis:58b5ce2d
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T20:12:34.700Z
---

<!-- imported: validation → static_analysis -->


    static_analysis:
      run_on: [on_patch, deploy]
      tools: [eslint, spec-lint]
      fail_on: fatal_only
