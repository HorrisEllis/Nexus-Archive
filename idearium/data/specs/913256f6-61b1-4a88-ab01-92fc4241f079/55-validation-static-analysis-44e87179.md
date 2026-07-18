---
chunk_uuid: 44e87179-6dae-4331-a239-706a317a561d
spec_uuid: 913256f6-61b1-4a88-ab01-92fc4241f079
section: validation-static-analysis
title: validation — static_analysis
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:913256f6:validation-static-analysis
contract_id: spec-contract:913256f6:validation-static-analysis:44e87179
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T17:14:28.380Z
---

<!-- imported: validation → static_analysis -->


    static_analysis:
      run_on: [on_patch, deploy]
      tools: [eslint, spec-lint]
      fail_on: fatal_only
