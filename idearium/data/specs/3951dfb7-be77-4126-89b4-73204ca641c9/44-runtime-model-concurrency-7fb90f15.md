---
chunk_uuid: 7fb90f15-3cd4-48fc-9597-d3b0587ccf1b
spec_uuid: 3951dfb7-be77-4126-89b4-73204ca641c9
section: runtime-model-concurrency
title: runtime model — concurrency
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:3951dfb7:runtime-model-concurrency
contract_id: spec-contract:3951dfb7:runtime-model-concurrency:7fb90f15
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:54:38.071Z
---

<!-- imported: runtime model → concurrency -->

# BLOCK 7 — RUNTIME MODEL
  # ════════════════════════════════════════════════════════════════
  runtime_model:
    concurrency:
      model: async
      max_concurrency: 1
      isolation: none
      async_model: >
        Node.js single-threaded event loop. Kernel ingest is synchronous (no await in hot path).
        Persist WAL flush and forge API calls are async. No worker threads in core.
