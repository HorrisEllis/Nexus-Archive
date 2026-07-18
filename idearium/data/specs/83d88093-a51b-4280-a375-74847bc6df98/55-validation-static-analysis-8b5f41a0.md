---
chunk_uuid: 8b5f41a0-1e72-40c8-aac4-c99b3f831bbd
spec_uuid: 83d88093-a51b-4280-a375-74847bc6df98
section: validation-static-analysis
title: validation — static_analysis
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:83d88093:validation-static-analysis
contract_id: spec-contract:83d88093:validation-static-analysis:8b5f41a0
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:39:53.381Z
---

<!-- imported: validation → static_analysis -->


    static_analysis:
      run_on: [on_patch, deploy]
      tools: [eslint, spec-lint]
      fail_on: fatal_only
