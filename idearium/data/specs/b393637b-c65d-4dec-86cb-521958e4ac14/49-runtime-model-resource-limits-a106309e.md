---
chunk_uuid: a106309e-1d4e-4d3a-b3f2-d087ad233836
spec_uuid: b393637b-c65d-4dec-86cb-521958e4ac14
section: runtime-model-resource-limits
title: runtime model — resource_limits
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:b393637b:runtime-model-resource-limits
contract_id: spec-contract:b393637b:runtime-model-resource-limits:a106309e
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:47:14.478Z
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
  