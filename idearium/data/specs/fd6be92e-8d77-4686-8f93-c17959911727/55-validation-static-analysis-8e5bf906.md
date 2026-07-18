---
chunk_uuid: 8e5bf906-33ab-4106-9f76-f959eea5d63e
spec_uuid: fd6be92e-8d77-4686-8f93-c17959911727
section: validation-static-analysis
title: validation — static_analysis
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:fd6be92e:validation-static-analysis
contract_id: spec-contract:fd6be92e:validation-static-analysis:8e5bf906
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T17:22:08.284Z
---

<!-- imported: validation → static_analysis -->


    static_analysis:
      run_on: [on_patch, deploy]
      tools: [eslint, spec-lint]
      fail_on: fatal_only
