---
chunk_uuid: cf9d2310-5705-40d1-ac1d-b48c56e2155b
spec_uuid: 83d88093-a51b-4280-a375-74847bc6df98
section: runtime-model-resource-limits
title: runtime model — resource_limits
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:83d88093:runtime-model-resource-limits
contract_id: spec-contract:83d88093:runtime-model-resource-limits:cf9d2310
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:39:52.150Z
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
  