---
chunk_uuid: 1aa9b09f-575d-4578-ba01-076f34f1ff50
spec_uuid: 05c58965-3175-403a-8c3f-28ed5ad91eaf
section: runtime-model-concurrency
title: runtime model — concurrency
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:05c58965:runtime-model-concurrency
contract_id: spec-contract:05c58965:runtime-model-concurrency:1aa9b09f
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T20:13:40.705Z
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
