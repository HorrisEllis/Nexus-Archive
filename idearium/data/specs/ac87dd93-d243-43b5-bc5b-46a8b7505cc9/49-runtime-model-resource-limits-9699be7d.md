---
chunk_uuid: 9699be7d-9358-4e16-9d59-a78f3d36164a
spec_uuid: ac87dd93-d243-43b5-bc5b-46a8b7505cc9
section: runtime-model-resource-limits
title: runtime model — resource_limits
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ac87dd93:runtime-model-resource-limits
contract_id: spec-contract:ac87dd93:runtime-model-resource-limits:9699be7d
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:53:01.006Z
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