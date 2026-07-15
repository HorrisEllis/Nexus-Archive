---
chunk_uuid: 1f38ca1b-81d6-4d3f-aeb3-5559d883b7b4
spec_uuid: 3a45e152-b5fe-4546-a744-770d60af4a50
section: validation-static-analysis
title: validation — static_analysis
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:3a45e152:validation-static-analysis
contract_id: spec-contract:3a45e152:validation-static-analysis:1f38ca1b
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:22:13.559Z
---

<!-- imported: validation → static_analysis -->


    static_analysis:
      run_on: [on_patch, deploy]
      tools: [eslint, spec-lint]
      fail_on: fatal_only
