---
chunk_uuid: 51d5f0a0-70fb-4275-b779-7efa0d4fe49c
spec_uuid: c29c09a0-87fa-4562-829d-3f8edeec6f26
section: validation-static-analysis
title: validation — static_analysis
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:c29c09a0:validation-static-analysis
contract_id: spec-contract:c29c09a0:validation-static-analysis:51d5f0a0
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:51:43.686Z
---

<!-- imported: validation → static_analysis -->


    static_analysis:
      run_on: [on_patch, deploy]
      tools: [eslint, spec-lint]
      fail_on: fatal_only
