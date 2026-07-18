---
chunk_uuid: 21baf723-57c4-411f-af84-fe0769ed39b4
spec_uuid: 1f29c762-332e-4fa1-b562-460c9c0058c8
section: runtime-model-resource-limits
title: runtime model — resource_limits
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:1f29c762:runtime-model-resource-limits
contract_id: spec-contract:1f29c762:runtime-model-resource-limits:21baf723
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T16:49:26.077Z
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
  