---
chunk_uuid: 8d3b2176-4152-43df-b9b1-48d8dd2e09f9
spec_uuid: 29941935-404b-4fe4-a3c4-a066df7f001f
section: validation-static-analysis
title: validation — static_analysis
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:29941935:validation-static-analysis
contract_id: spec-contract:29941935:validation-static-analysis:8d3b2176
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:56:07.038Z
---

<!-- imported: validation → static_analysis -->


    static_analysis:
      run_on: [on_patch, deploy]
      tools: [eslint, spec-lint]
      fail_on: fatal_only
