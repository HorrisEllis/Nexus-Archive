---
chunk_uuid: 431f3288-1c94-433e-9c9b-84805f49ec76
spec_uuid: aaa8dfea-3970-492c-8ebd-13bc2fd9edf6
section: runtime-model-concurrency
title: runtime model — concurrency
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:aaa8dfea:runtime-model-concurrency
contract_id: spec-contract:aaa8dfea:runtime-model-concurrency:431f3288
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T17:12:53.362Z
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
