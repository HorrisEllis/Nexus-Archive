---
chunk_uuid: 9e796cca-26c8-4e0d-bf5f-b3da496fedb5
spec_uuid: 3951dfb7-be77-4126-89b4-73204ca641c9
section: validation-static-analysis
title: validation — static_analysis
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:3951dfb7:validation-static-analysis
contract_id: spec-contract:3951dfb7:validation-static-analysis:9e796cca
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:54:38.207Z
---

<!-- imported: validation → static_analysis -->

    static_analysis:
      run_on: [on_patch, deploy]
      tools: [eslint, spec-lint]
      fail_on: fatal_only
