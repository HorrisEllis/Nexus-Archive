---
chunk_uuid: 5cc27cd1-eb5e-4461-b983-b597c943cdf5
spec_uuid: 05c58965-3175-403a-8c3f-28ed5ad91eaf
section: validation-static-analysis
title: validation — static_analysis
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:05c58965:validation-static-analysis
contract_id: spec-contract:05c58965:validation-static-analysis:5cc27cd1
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T20:13:46.664Z
---

<!-- imported: validation → static_analysis -->


    static_analysis:
      run_on: [on_patch, deploy]
      tools: [eslint, spec-lint]
      fail_on: fatal_only
