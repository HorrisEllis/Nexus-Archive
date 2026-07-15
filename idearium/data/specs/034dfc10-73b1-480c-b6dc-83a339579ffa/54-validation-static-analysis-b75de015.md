---
chunk_uuid: b75de015-eda6-4d28-b2d6-127bdd0de8f0
spec_uuid: 034dfc10-73b1-480c-b6dc-83a339579ffa
section: validation-static-analysis
title: validation — static_analysis
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:034dfc10:validation-static-analysis
contract_id: spec-contract:034dfc10:validation-static-analysis:b75de015
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:45:07.116Z
---

<!-- imported: validation → static_analysis -->

static_analysis:
      run_on: [on_patch, deploy]
      tools: [eslint, spec-lint]
      fail_on: fatal_only