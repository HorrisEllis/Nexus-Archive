---
chunk_uuid: b36d8068-5f8e-4c5f-8657-336af39fe112
spec_uuid: 1da21c43-b7e0-4703-93f5-7aed4825dd38
section: runtime-model-concurrency
title: runtime model — concurrency
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:1da21c43:runtime-model-concurrency
contract_id: spec-contract:1da21c43:runtime-model-concurrency:b36d8068
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:31:52.907Z
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