---
chunk_uuid: 112e1f7c-bf0f-41b0-b470-4d519b207ea5
spec_uuid: 1dceaca3-622e-4f87-a9da-c46c298d5c81
section: validation-static-analysis
title: validation — static_analysis
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:1dceaca3:validation-static-analysis
contract_id: spec-contract:1dceaca3:validation-static-analysis:112e1f7c
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T21:02:20.094Z
---

<!-- imported: validation → static_analysis -->


    static_analysis:
      run_on: [on_patch, deploy]
      tools: [eslint, spec-lint]
      fail_on: fatal_only
