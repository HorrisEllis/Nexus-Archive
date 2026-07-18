---
chunk_uuid: 97258893-ef54-45d8-a558-0b108c13b30a
spec_uuid: a83184e7-1073-43f9-80a5-02ea05a66d74
section: validation-static-analysis
title: validation — static_analysis
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:a83184e7:validation-static-analysis
contract_id: spec-contract:a83184e7:validation-static-analysis:97258893
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T16:22:56.540Z
---

<!-- imported: validation → static_analysis -->


    static_analysis:
      run_on: [on_patch, deploy]
      tools: [eslint, spec-lint]
      fail_on: fatal_only
