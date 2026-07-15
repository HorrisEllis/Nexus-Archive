---
chunk_uuid: dd65f8b0-6ae6-4970-9ad7-b2fd8e199ba2
spec_uuid: ac87dd93-d243-43b5-bc5b-46a8b7505cc9
section: runtime-model-concurrency
title: runtime model — concurrency
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ac87dd93:runtime-model-concurrency
contract_id: spec-contract:ac87dd93:runtime-model-concurrency:dd65f8b0
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:53:00.959Z
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