---
chunk_uuid: a42ce984-1f0c-4a31-ac99-fa8c3b9b8bf9
spec_uuid: a851a5dc-8344-4269-b2e1-a2d72dc348db
section: runtime-model-resource-limits
title: runtime model — resource_limits
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:a851a5dc:runtime-model-resource-limits
contract_id: spec-contract:a851a5dc:runtime-model-resource-limits:a42ce984
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:41:37.677Z
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