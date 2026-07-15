---
chunk_uuid: bd2f794f-cfe0-4eba-b6e1-62633c819b13
spec_uuid: 9d4b9a4e-bb05-478e-a231-c9e41da42b80
section: runtime-model-resource-limits
title: runtime model — resource_limits
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:9d4b9a4e:runtime-model-resource-limits
contract_id: spec-contract:9d4b9a4e:runtime-model-resource-limits:bd2f794f
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:55:52.972Z
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
  