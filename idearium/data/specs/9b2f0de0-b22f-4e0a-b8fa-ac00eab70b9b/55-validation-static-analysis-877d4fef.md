---
chunk_uuid: 877d4fef-a34e-4fb6-b26d-4c825852ba5f
spec_uuid: 9b2f0de0-b22f-4e0a-b8fa-ac00eab70b9b
section: validation-static-analysis
title: validation — static_analysis
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:9b2f0de0:validation-static-analysis
contract_id: spec-contract:9b2f0de0:validation-static-analysis:877d4fef
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:55:56.115Z
---

<!-- imported: validation → static_analysis -->


    static_analysis:
      run_on: [on_patch, deploy]
      tools: [eslint, spec-lint]
      fail_on: fatal_only
