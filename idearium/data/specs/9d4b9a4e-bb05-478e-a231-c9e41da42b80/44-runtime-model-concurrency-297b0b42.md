---
chunk_uuid: 297b0b42-213e-4ca0-9b5a-27da5c002d7a
spec_uuid: 9d4b9a4e-bb05-478e-a231-c9e41da42b80
section: runtime-model-concurrency
title: runtime model — concurrency
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:9d4b9a4e:runtime-model-concurrency
contract_id: spec-contract:9d4b9a4e:runtime-model-concurrency:297b0b42
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:55:52.926Z
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
