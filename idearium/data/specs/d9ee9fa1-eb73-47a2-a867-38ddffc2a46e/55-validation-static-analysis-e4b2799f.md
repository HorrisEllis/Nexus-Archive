---
chunk_uuid: e4b2799f-2537-4b03-bea8-dc9832b9fa4a
spec_uuid: d9ee9fa1-eb73-47a2-a867-38ddffc2a46e
section: validation-static-analysis
title: validation — static_analysis
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:d9ee9fa1:validation-static-analysis
contract_id: spec-contract:d9ee9fa1:validation-static-analysis:e4b2799f
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T08:06:57.874Z
---

<!-- imported: validation → static_analysis -->


    static_analysis:
      run_on: [on_patch, deploy]
      tools: [eslint, spec-lint]
      fail_on: fatal_only
