---
chunk_uuid: 6542018b-860d-41d6-8d50-d571572d3b4e
spec_uuid: fd6be92e-8d77-4686-8f93-c17959911727
section: runtime-model-concurrency
title: runtime model — concurrency
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:fd6be92e:runtime-model-concurrency
contract_id: spec-contract:fd6be92e:runtime-model-concurrency:6542018b
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T17:22:01.646Z
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
