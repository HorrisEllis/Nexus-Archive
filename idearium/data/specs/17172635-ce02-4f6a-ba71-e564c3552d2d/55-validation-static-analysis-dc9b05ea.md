---
chunk_uuid: dc9b05ea-68c9-4e4b-97bd-3181513c6c39
spec_uuid: 17172635-ce02-4f6a-ba71-e564c3552d2d
section: validation-static-analysis
title: validation — static_analysis
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:17172635:validation-static-analysis
contract_id: spec-contract:17172635:validation-static-analysis:dc9b05ea
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T07:37:23.145Z
---

<!-- imported: validation → static_analysis -->


    static_analysis:
      run_on: [on_patch, deploy]
      tools: [eslint, spec-lint]
      fail_on: fatal_only
