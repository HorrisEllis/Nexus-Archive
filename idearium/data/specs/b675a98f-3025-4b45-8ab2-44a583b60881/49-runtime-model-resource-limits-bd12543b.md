---
chunk_uuid: bd12543b-6092-4c96-b818-1272d06253d3
spec_uuid: b675a98f-3025-4b45-8ab2-44a583b60881
section: runtime-model-resource-limits
title: runtime model — resource_limits
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:b675a98f:runtime-model-resource-limits
contract_id: spec-contract:b675a98f:runtime-model-resource-limits:bd12543b
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:54:03.130Z
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
  