---
chunk_uuid: 66a7c796-e30f-4c5a-90df-10b2529a0521
spec_uuid: 05c58965-3175-403a-8c3f-28ed5ad91eaf
section: runtime-model-resource-limits
title: runtime model — resource_limits
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:05c58965:runtime-model-resource-limits
contract_id: spec-contract:05c58965:runtime-model-resource-limits:66a7c796
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T20:13:43.383Z
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
  