---
chunk_uuid: 4872d492-a143-4423-ade2-12fbd96be6e7
spec_uuid: 034dfc10-73b1-480c-b6dc-83a339579ffa
section: runtime-model-resource-limits
title: runtime model — resource_limits
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:034dfc10:runtime-model-resource-limits
contract_id: spec-contract:034dfc10:runtime-model-resource-limits:4872d492
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:45:06.984Z
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