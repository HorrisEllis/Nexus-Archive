---
chunk_uuid: c5a5e348-1dda-4aea-bbe7-1ae339c1a636
spec_uuid: 17172635-ce02-4f6a-ba71-e564c3552d2d
section: runtime-model-concurrency
title: runtime model — concurrency
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:17172635:runtime-model-concurrency
contract_id: spec-contract:17172635:runtime-model-concurrency:c5a5e348
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T07:37:22.876Z
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
