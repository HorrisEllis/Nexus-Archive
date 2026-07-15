---
chunk_uuid: 38e59e8a-82fe-4684-bc44-6b6d452f79f6
spec_uuid: 9b2f0de0-b22f-4e0a-b8fa-ac00eab70b9b
section: runtime-model-concurrency
title: runtime model — concurrency
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:9b2f0de0:runtime-model-concurrency
contract_id: spec-contract:9b2f0de0:runtime-model-concurrency:38e59e8a
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:55:55.968Z
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
