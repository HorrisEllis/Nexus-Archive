---
chunk_uuid: 06299c0c-b492-4624-b9db-4795626b0ec3
spec_uuid: 3a45e152-b5fe-4546-a744-770d60af4a50
section: runtime-model-concurrency
title: runtime model — concurrency
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:3a45e152:runtime-model-concurrency
contract_id: spec-contract:3a45e152:runtime-model-concurrency:06299c0c
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:22:13.288Z
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
