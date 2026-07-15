---
chunk_uuid: 4bedce8f-7b98-4ebc-a740-d98a737b2f1d
spec_uuid: a851a5dc-8344-4269-b2e1-a2d72dc348db
section: validation-static-analysis
title: validation — static_analysis
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:a851a5dc:validation-static-analysis
contract_id: spec-contract:a851a5dc:validation-static-analysis:4bedce8f
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:41:37.791Z
---

<!-- imported: validation → static_analysis -->

static_analysis:
      run_on: [on_patch, deploy]
      tools: [eslint, spec-lint]
      fail_on: fatal_only