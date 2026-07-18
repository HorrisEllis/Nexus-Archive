---
chunk_uuid: 6f105b1f-0338-433b-958d-5293d96e6b30
spec_uuid: b393637b-c65d-4dec-86cb-521958e4ac14
section: runtime-model-concurrency
title: runtime model — concurrency
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:b393637b:runtime-model-concurrency
contract_id: spec-contract:b393637b:runtime-model-concurrency:6f105b1f
agent: import
model: import:.spec
status: complete
completed_at: 2026-07-18T14:47:13.461Z
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
