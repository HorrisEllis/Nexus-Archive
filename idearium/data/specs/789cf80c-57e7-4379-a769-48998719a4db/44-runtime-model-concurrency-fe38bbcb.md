---
chunk_uuid: fe38bbcb-4738-49ef-b305-d751fc05291a
spec_uuid: 789cf80c-57e7-4379-a769-48998719a4db
section: runtime-model-concurrency
title: runtime model — concurrency
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:789cf80c:runtime-model-concurrency
contract_id: spec-contract:789cf80c:runtime-model-concurrency:fe38bbcb
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:52:21.133Z
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
