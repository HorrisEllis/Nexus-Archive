---
chunk_uuid: 5aaf9599-ee29-442a-a5e1-a3177ac8f53f
spec_uuid: 9d4b9a4e-bb05-478e-a231-c9e41da42b80
section: validation-static-analysis
title: validation — static_analysis
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:9d4b9a4e:validation-static-analysis
contract_id: spec-contract:9d4b9a4e:validation-static-analysis:5aaf9599
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:55:53.078Z
---

<!-- imported: validation → static_analysis -->


    static_analysis:
      run_on: [on_patch, deploy]
      tools: [eslint, spec-lint]
      fail_on: fatal_only
