---
chunk_uuid: 8bc5ba38-0ecb-444d-b47d-78fd13c8508a
spec_uuid: ac87dd93-d243-43b5-bc5b-46a8b7505cc9
section: validation-static-analysis
title: validation — static_analysis
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ac87dd93:validation-static-analysis
contract_id: spec-contract:ac87dd93:validation-static-analysis:8bc5ba38
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:53:01.093Z
---

<!-- imported: validation → static_analysis -->

    static_analysis:
      run_on: [on_patch, deploy]
      tools: [eslint, spec-lint]
      fail_on: fatal_only