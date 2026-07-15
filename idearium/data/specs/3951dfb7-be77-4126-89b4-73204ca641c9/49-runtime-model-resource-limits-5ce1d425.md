---
chunk_uuid: 5ce1d425-8412-4f80-ad87-f184bbe4ad41
spec_uuid: 3951dfb7-be77-4126-89b4-73204ca641c9
section: runtime-model-resource-limits
title: runtime model — resource_limits
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:3951dfb7:runtime-model-resource-limits
contract_id: spec-contract:3951dfb7:runtime-model-resource-limits:5ce1d425
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:54:38.118Z
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
  