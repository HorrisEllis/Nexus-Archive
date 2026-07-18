---
chunk_uuid: b520240e-3702-4073-8684-3f547fe7a9f7
spec_uuid: 913256f6-61b1-4a88-ab01-92fc4241f079
section: runtime-model-concurrency
title: runtime model — concurrency
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:913256f6:runtime-model-concurrency
contract_id: spec-contract:913256f6:runtime-model-concurrency:b520240e
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T17:14:24.459Z
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
