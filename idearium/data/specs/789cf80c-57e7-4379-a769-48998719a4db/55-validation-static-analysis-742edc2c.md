---
chunk_uuid: 742edc2c-c276-4ab4-965c-bb8683b08a42
spec_uuid: 789cf80c-57e7-4379-a769-48998719a4db
section: validation-static-analysis
title: validation — static_analysis
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:789cf80c:validation-static-analysis
contract_id: spec-contract:789cf80c:validation-static-analysis:742edc2c
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:52:23.728Z
---

<!-- imported: validation → static_analysis -->


    static_analysis:
      run_on: [on_patch, deploy]
      tools: [eslint, spec-lint]
      fail_on: fatal_only
