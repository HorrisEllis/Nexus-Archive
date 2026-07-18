---
chunk_uuid: da051f76-f81e-4044-b4da-bb755b0e6aea
spec_uuid: b675a98f-3025-4b45-8ab2-44a583b60881
section: validation-static-analysis
title: validation — static_analysis
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:b675a98f:validation-static-analysis
contract_id: spec-contract:b675a98f:validation-static-analysis:da051f76
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:54:04.550Z
---

<!-- imported: validation → static_analysis -->


    static_analysis:
      run_on: [on_patch, deploy]
      tools: [eslint, spec-lint]
      fail_on: fatal_only
