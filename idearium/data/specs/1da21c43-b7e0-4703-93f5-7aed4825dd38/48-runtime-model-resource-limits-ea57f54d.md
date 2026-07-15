---
chunk_uuid: ea57f54d-dc5f-4617-97f6-ae9dd2fae6f0
spec_uuid: 1da21c43-b7e0-4703-93f5-7aed4825dd38
section: runtime-model-resource-limits
title: runtime model — resource_limits
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:1da21c43:runtime-model-resource-limits
contract_id: spec-contract:1da21c43:runtime-model-resource-limits:ea57f54d
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:31:52.961Z
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