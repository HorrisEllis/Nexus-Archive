---
chunk_uuid: 0048d127-94e6-4dc1-b582-45fd25fd956f
spec_uuid: f4232853-1ea4-4a6f-9b28-6fddd9db00fd
section: runtime-model-resource-limits
title: runtime model — resource_limits
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:f4232853:runtime-model-resource-limits
contract_id: spec-contract:f4232853:runtime-model-resource-limits:0048d127
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:55:14.646Z
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
  