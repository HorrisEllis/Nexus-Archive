---
chunk_uuid: 7bfcc4ea-3603-4b31-b632-c9384d63827e
spec_uuid: a851a5dc-8344-4269-b2e1-a2d72dc348db
section: runtime-model-concurrency
title: runtime model — concurrency
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:a851a5dc:runtime-model-concurrency
contract_id: spec-contract:a851a5dc:runtime-model-concurrency:7bfcc4ea
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-15T05:41:37.625Z
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