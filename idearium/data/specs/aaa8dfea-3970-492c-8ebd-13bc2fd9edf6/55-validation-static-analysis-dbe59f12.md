---
chunk_uuid: dbe59f12-0643-43be-aff4-19ea07a4adfd
spec_uuid: aaa8dfea-3970-492c-8ebd-13bc2fd9edf6
section: validation-static-analysis
title: validation — static_analysis
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:aaa8dfea:validation-static-analysis
contract_id: spec-contract:aaa8dfea:validation-static-analysis:dbe59f12
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T17:12:56.640Z
---

<!-- imported: validation → static_analysis -->


    static_analysis:
      run_on: [on_patch, deploy]
      tools: [eslint, spec-lint]
      fail_on: fatal_only
