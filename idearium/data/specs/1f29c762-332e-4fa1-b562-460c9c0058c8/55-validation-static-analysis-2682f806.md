---
chunk_uuid: 2682f806-98e8-470e-bbfc-70c7edc151c2
spec_uuid: 1f29c762-332e-4fa1-b562-460c9c0058c8
section: validation-static-analysis
title: validation — static_analysis
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:1f29c762:validation-static-analysis
contract_id: spec-contract:1f29c762:validation-static-analysis:2682f806
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T16:49:27.600Z
---

<!-- imported: validation → static_analysis -->


    static_analysis:
      run_on: [on_patch, deploy]
      tools: [eslint, spec-lint]
      fail_on: fatal_only
