---
chunk_uuid: 455dadd8-4e40-4c7f-9510-5eec150c997d
spec_uuid: b675a98f-3025-4b45-8ab2-44a583b60881
section: runtime-model-concurrency
title: runtime model — concurrency
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:b675a98f:runtime-model-concurrency
contract_id: spec-contract:b675a98f:runtime-model-concurrency:455dadd8
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:54:01.972Z
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
