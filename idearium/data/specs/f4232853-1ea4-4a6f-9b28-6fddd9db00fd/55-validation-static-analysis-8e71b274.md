---
chunk_uuid: 8e71b274-bb7d-4d9d-880b-faa52b61761d
spec_uuid: f4232853-1ea4-4a6f-9b28-6fddd9db00fd
section: validation-static-analysis
title: validation — static_analysis
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:f4232853:validation-static-analysis
contract_id: spec-contract:f4232853:validation-static-analysis:8e71b274
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:55:14.754Z
---

<!-- imported: validation → static_analysis -->


    static_analysis:
      run_on: [on_patch, deploy]
      tools: [eslint, spec-lint]
      fail_on: fatal_only
