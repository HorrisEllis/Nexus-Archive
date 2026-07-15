---
chunk_uuid: 428a0c68-0941-4a6c-a121-9a5e7c9aaf11
spec_uuid: d9ee9fa1-eb73-47a2-a867-38ddffc2a46e
section: runtime-model-concurrency
title: runtime model — concurrency
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:d9ee9fa1:runtime-model-concurrency
contract_id: spec-contract:d9ee9fa1:runtime-model-concurrency:428a0c68
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T08:06:57.591Z
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
