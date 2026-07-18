---
chunk_uuid: 6f87ac2d-252c-4a89-9680-94ad96b58027
spec_uuid: c29c09a0-87fa-4562-829d-3f8edeec6f26
section: runtime-model-concurrency
title: runtime model — concurrency
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:c29c09a0:runtime-model-concurrency
contract_id: spec-contract:c29c09a0:runtime-model-concurrency:6f87ac2d
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:51:41.350Z
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
