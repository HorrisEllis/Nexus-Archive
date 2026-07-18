---
chunk_uuid: 15f5848a-fc7b-4004-bb69-d4c76adc417c
spec_uuid: fd6be92e-8d77-4686-8f93-c17959911727
section: runtime-model-resource-limits
title: runtime model — resource_limits
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:fd6be92e:runtime-model-resource-limits
contract_id: spec-contract:fd6be92e:runtime-model-resource-limits:15f5848a
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T17:22:04.651Z
---

<!-- imported: runtime model → resource_limits -->


    resource_limits:
      memory_mb: 512
      cpu_cores: 1.0
      disk_mb: 6000
      open_files: 32
      network:
        allowed_hosts: ["api.anthropic.com"]
        allowed_ports: [443]

  # ════════════════════════════════════════════════════════════════
  