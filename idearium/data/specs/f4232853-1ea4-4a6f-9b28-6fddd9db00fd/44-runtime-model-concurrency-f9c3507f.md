---
chunk_uuid: f9c3507f-1cfc-460c-aaa9-f2dc2560c530
spec_uuid: f4232853-1ea4-4a6f-9b28-6fddd9db00fd
section: runtime-model-concurrency
title: runtime model — concurrency
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:f4232853:runtime-model-concurrency
contract_id: spec-contract:f4232853:runtime-model-concurrency:f9c3507f
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T06:55:14.592Z
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
