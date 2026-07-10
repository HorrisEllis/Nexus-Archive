# NEXUS Closed Loop — spec → repo → chunk → populate → verify
### Map, 2026-07-10 (map-first per AXIOMS; orchestrator built after)

## The vision (user, 2026-07-10)
"Import a spec → build a repository automatically → start chunking it and
populating it → closed loop." Every spec = a compressed compartment, as a
repository, with CI/CD and UI access. This is the thing that makes it all
worth something.

## What already exists (real, verified against source — NOT assumed)
Every stage of the loop has a real entry point. The gap is that nothing
chains them into ONE call:

| Stage | Real entry point | Status |
|---|---|---|
| 1. Spec import → manifest | `spec-engine/index.js` `createSpec({name,type,description})` → `POST /api/spec-engine/specs` (`speceng.create`) | real |
| 2. Spec → chunk sections | spec-engine SECTION_IDS (intent/api/hooks/cli/schemas/gap_contract/failure_modes/tests/phase_map) | real |
| 3. Chunk → populate | `dispatchChunkWithVerification` (chunk-dispatch.js), routed through WARP (`warp-build-dispatch.js`) via `speceng.build` — one chunk per call, verified on disk | real, WARP-backed |
| 4. Repo from spec | `POST /api/repos` (`repo.ingest`) — builds a repo record from files | real |
| 5. Build → verify → promote | `execution-pipeline.js` `startPipeline({specPath})` — build→sandbox→compare→golden-promote, now JAA-persisted | real |
| spec-as-compressed-container | `idearium/lib/spec-container.js` — `.spec` header read/verify/decode; wired to `idearium/repo/watcher.js` | real (114 lines — smaller than the phase map implied) |

## The real gap
No single orchestrator chains 1→2→3→4→5. Today a human (or copilot)
must: create the spec, then trigger build per-chunk in a loop, then
ingest a repo, then start the pipeline — four separate calls with manual
glue. The "import a spec and have it build a repository automatically and
start chunking and populating" is exactly this chain, unautomated.

## Plan — `idearium/spec-engine/closed-loop.js`
One real orchestrator, `runClosedLoop({ specText | specPath })`:
1. `createSpec` from the imported spec (stage 1) — real.
2. Drive `speceng.build` in a loop until `{done:true}` (stage 3, WARP-
   backed populate) — reuse the exact driver logic the UI's
   `driveChunkBuild` already proved, server-side.
3. On populate complete, `repo.ingest` the populated chunk tree into a
   repo record (stage 4) — real.
4. `startPipeline` on the assembled spec for build→verify→promote
   (stage 5) — real, fire-and-forget, streams pipeline.* events.
5. Emit `closed-loop.*` events at each transition (same dual-emit
   pattern as execution-pipeline) so copilot's stream + the UI see it.
6. Expose as: (a) a `run_closed_loop` agent-tool so copilot can trigger
   the whole thing from "build me a repo from this spec"; (b) an HTTP
   route for the UI's "import spec" button.

## Honest boundaries
- Each stage already degrades honestly on its own; the orchestrator adds
  no new failure-swallowing — a stage failure is a terminal
  `closed-loop.failed` with the stage name (§1.2).
- The orchestrator ORCHESTRATES real stages; it reimplements none of
  them. If a stage is unavailable, the loop reports where it stopped.
- WARP remains the build spine for stage 3 (populate) and stage 5's
  t2-gate builds — already wired.
