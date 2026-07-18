---
chunk_uuid: 0e8cdd91-4471-4823-90fb-5b861fc67b44
spec_uuid: 1f29c762-332e-4fa1-b562-460c9c0058c8
section: runtime-model-concurrency
title: runtime model — concurrency
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:1f29c762:runtime-model-concurrency
contract_id: spec-contract:1f29c762:runtime-model-concurrency:0e8cdd91
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T16:49:24.861Z
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
