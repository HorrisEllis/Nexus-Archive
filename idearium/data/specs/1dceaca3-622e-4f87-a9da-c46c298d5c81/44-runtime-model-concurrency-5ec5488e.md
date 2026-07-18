---
chunk_uuid: 5ec5488e-82b1-47ed-920c-53dab8ae9be0
spec_uuid: 1dceaca3-622e-4f87-a9da-c46c298d5c81
section: runtime-model-concurrency
title: runtime model — concurrency
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:1dceaca3:runtime-model-concurrency
contract_id: spec-contract:1dceaca3:runtime-model-concurrency:5ec5488e
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T21:02:12.139Z
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
