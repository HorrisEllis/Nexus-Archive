---
chunk_uuid: b2a44ad5-9742-4af2-9be6-e6342a19e47d
spec_uuid: a83184e7-1073-43f9-80a5-02ea05a66d74
section: runtime-model-resource-limits
title: runtime model — resource_limits
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:a83184e7:runtime-model-resource-limits
contract_id: spec-contract:a83184e7:runtime-model-resource-limits:b2a44ad5
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T16:22:54.543Z
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
  