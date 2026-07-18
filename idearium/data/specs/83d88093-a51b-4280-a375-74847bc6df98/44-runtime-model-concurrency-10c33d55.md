---
chunk_uuid: 10c33d55-3c79-4fcf-b2e8-83b2a2851eec
spec_uuid: 83d88093-a51b-4280-a375-74847bc6df98
section: runtime-model-concurrency
title: runtime model — concurrency
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:83d88093:runtime-model-concurrency
contract_id: spec-contract:83d88093:runtime-model-concurrency:10c33d55
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:39:51.218Z
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
