---
chunk_uuid: 79f7ade6-1f53-4434-af61-e776003b0d4c
spec_uuid: f9e0523f-c89e-4bb1-9e6f-88cdd2aa2107
section: runtime-model-concurrency
title: runtime model — concurrency
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:f9e0523f:runtime-model-concurrency
contract_id: spec-contract:f9e0523f:runtime-model-concurrency:79f7ade6
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T20:12:28.972Z
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
