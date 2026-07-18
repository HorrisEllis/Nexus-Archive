---
chunk_uuid: 72395423-1954-4148-8d97-95e42ce79149
spec_uuid: b393637b-c65d-4dec-86cb-521958e4ac14
section: validation-static-analysis
title: validation — static_analysis
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:b393637b:validation-static-analysis
contract_id: spec-contract:b393637b:validation-static-analysis:72395423
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:47:15.661Z
---

<!-- imported: validation → static_analysis -->


    static_analysis:
      run_on: [on_patch, deploy]
      tools: [eslint, spec-lint]
      fail_on: fatal_only
