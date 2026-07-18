---
chunk_uuid: 398e4c0d-a6a1-4d8f-a629-2ed67bf1f7f9
spec_uuid: 789cf80c-57e7-4379-a769-48998719a4db
section: runtime-model-resource-limits
title: runtime model — resource_limits
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:789cf80c:runtime-model-resource-limits
contract_id: spec-contract:789cf80c:runtime-model-resource-limits:398e4c0d
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:52:22.327Z
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
  