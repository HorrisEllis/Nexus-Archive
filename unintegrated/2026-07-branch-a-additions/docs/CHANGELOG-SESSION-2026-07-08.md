# NEXUS — Session Changelog: Build Execution Pipeline
**Date:** 2026-07-07 → 2026-07-08
**Session type:** New capability — closed-loop build execution, autonomous wiring, homepage decomposition
**By:** Claude (chat session, working against `nexus-updated-2.zip` → `nexus-wired-v5.zip` → this)

This is additive to `CHANGELOG.md` (auto-generated from `.spec` version bumps)
and `CHANGELOG-SESSION.md` (the prior architecture-completion session) —
neither of those files was touched. Everything below is new work layered
on top of both.

---

## Summary

| | |
|---|---|
| New files | 16 |
| Modified files | 3 (`orchestrator.js`, `copilot/lib/user-model.js`, `orchestrator/lib/autonomous-loop.js`) |
| New orchestrator routes | 11 |
| Existing subsystems wired together for the first time | `emerge/compiler/t2-gate.js`, `cos/playground/{branch,sandbox,compare}.js`, `orchestrator/lib/mutation-contract.js`, `orchestrator/lib/hot-loader.js`, `nexus-bus.js`, `orchestrator/lib/autonomous-loop.js` |
| Verification method | `node --check` on every touched file + `require()`-load against the real tree (not mocks) + one live functional smoke test of `expectation-watcher.js` against the real `nexus-bus.js` |
| Not yet tested | A real `.spec` has not been run through the full loop against live Guardian + Ollama |

---

## Patch 1 — Build pipeline front door
**Files:** `lib/build-pipeline.js` (new), `orchestrator.js`

`emerge/compiler/t2-gate.js`'s `run()` already did the whole compile→
KnowledgeGraph→tier-decide→T0/T1/T2-dispatch→verify→disk loop — it had
no HTTP or UI in front of it, confirmed by grep (nothing else in the
tree required it).

- `startBuild()` / `getBuild()` / `listBuilds()` — tracks a `buildId`
  per run, wraps `t2-gate.run()`'s `onProgress` callback, re-emits every
  stage on both the SSE broadcast and `nexus-bus`
- Routes: `POST /api/build/start`, `GET /api/build/:id`, `GET /api/build/list`

## Patch 2 — Consent registry + RFR2 people-modeling gate
**Files:** `lib/consent.js` (new), `copilot/lib/user-model.js` (modified), `orchestrator.js`

Per `docs/NEXUS-PHASE-MAP-CROSSREF.md`'s own standing note: RFR2's
people-modeling category needs an explicit per-item yes, not a bundled
phase-map pretext. This is that yes/no, made real.

- `setConsent()` / `getConsent()` / `isGranted()` — disk-first
  (`data/consent.json`), same re-read-before-read pattern as
  `loom/schema/registry.js`; never hard-deletes a decision, keeps history
- `user-model.js`: new `getRelationalSignal(kind)` — the only place in
  the codebase allowed to call RFR2's relational modules against real
  user data; refuses with `consent-not-granted` until the key is set
- **Honest gap documented in the code itself:** the specifically
  people-modeling-named RFR2 submodules (`resonance`, `irs.js`,
  `relational.js`) don't exist on disk in this checkout (confirmed —
  grepped the whole tree, twice, across two zip versions). Gated the
  three that do exist and are the closest fit (`observer`, `context`,
  `query`, via the existing `lib/rfr2-bridge.js`) behind the identical
  key, so nothing changes here once those three are actually authored.
- Routes: `POST /api/consent/rfr2`, `GET /api/consent/rfr2`

## Patch 3 — Copilot expectation watcher (gated interaction listeners)
**Files:** `copilot/lib/expectation-watcher.js` (new), `orchestrator.js`

"Co-pilot tracks errors from expected events and gated interaction
event listeners" — declares trigger→expected-followup pairs with a
timeout; on a miss or an explicit `.error`/`.failed` follow-up, emits
`copilot.error.detected`.

- Attaches once, at orchestrator boot, to the real `nexus-bus.js`
  EventEmitter (`bus.on('*', ...)`) — every system's events already fan
  through there
- Five expectations registered: build-node dispatch→result,
  build-started→terminal, idearium chunk queued→complete, and (added in
  Patch 8) pipeline-started→build-complete, pipeline-build-complete→terminal
- Live-tested against the real `nexus-bus.js`: simulated a full success
  sequence, confirmed zero false positives and the pending list correctly
  empties

## Patch 4 — Toast layer
**Files:** `ui/toast/toast.js`, `ui/toast/toast.css` (both new)

Guardian's "toast on every failure" law existed in the codebase before
this with no UI consumer anywhere in the tree (confirmed by grep — the
only prior `toast` hit was an unrelated string in `tv-shell/tutorial.js`).

- Subscribes to SSE, renders a dismissible toast for `copilot.error.detected`
  and any `*.error`/`*.failed` frame
- `Toast.mount()` / `Toast.show()` / `Toast.attachToSSE()` / `Toast.connect()`
  exposed on `window.Toast` for any other module to call directly

## Patch 5 — Consent gate UI
**Files:** `ui/consent/consent-gate.html`, `consent-gate.js`, `consent-gate.css` (all new)

The actual prompt: shown once on first homepage visit, remembered,
revocable. Backed by Patch 2's `/api/consent/rfr2`.

## Patch 6 — Build channel UI
**Files:** `ui/channels/build/build.html`, `build.js`, `build.css` (all new)

The primary page — spec path in, live per-node status grid out, build
history list. Sovereign channel per `ui/home/DECOMP.md`'s own design
goal (openable standalone in a browser tab).

## Patch 7 — Decomposed homepage shell
**Files:** `ui/home/shell.js`, `shell.css`, `nexus-home.html` (all new)

Additive, not a replacement — the existing ~4,000-line `ui/home/index.html`
was left untouched. Boots: toast → consent gate → build channel →
existing `tv-shell` menu/spotlight/nerve modules (none of which were
modified). Matches `DECOMP.md`'s own migration philosophy: prove the
decomposed shape works standalone before cutting the monolith over.

## Patch 8 — Full execution pipeline
**Files:** `lib/execution-pipeline.js` (new), `orchestrator.js`,
`copilot/lib/expectation-watcher.js`, `ui/channels/build/{build.js,build.html,build.css}`

Chains four systems that already existed independently, none
reimplemented:

```
.spec → BUILD (Patch 1) → BRANCH (cos/playground/branch.js, fork) →
SANDBOX VERIFY (cos/playground/sandbox.js, real isolated child process) →
COMPARE vs last-promoted "golden" branch (cos/playground/compare.js) →
PROMOTE (branch.js checkout() + governed write via
orchestrator/lib/mutation-contract.js — never a raw overwrite)
    or ROLLBACK (working tree left untouched, failed branch stays on
    disk for inspection)
→ optional HOT-INTEGRATE (orchestrator/lib/hot-loader.js —
  quarantine→prove→60s-monitor→rollback-on-σ, opt-in only)
```

- `runPipeline()` / `startPipeline()` (fire-and-forget, returns
  `pipelineId` synchronously with no race against the async body —
  verified directly) / `getPipeline()` / `listPipelines()`
- Golden-branch pointer persisted per spec at `data/pipeline-golden.json`
  (deterministic compartment id = sha1 of the spec path, so repeated
  runs of the same spec share comparison history)
- Routes: `POST /api/pipeline/start`, `GET /api/pipeline/:id`, `GET /api/pipeline/list`
- Build channel UI: "Full pipeline" toggle (checked by default), renders
  pipeline stages as extra rows in the same node grid
- Two new expectations added to Patch 3's watcher for pipeline-specific
  stall detection

## Patch 9 — Autonomous loop wiring ("Let Copilot handle it")
**Files:** `orchestrator/lib/autonomous-loop.js` (modified), `orchestrator.js`,
`ui/channels/build/{build.js,build.html,build.css}`

- **Bug found and fixed:** `_executeTool()` routed every tool call to
  `${GD_URL}/exec` — a route that does not exist in `guardian/server.js`
  (confirmed by direct grep; only `/cli/exec` is real). Every autonomous
  run that chose a tool was silently getting a failure back with no
  visible cause.
- Added a real `run_pipeline` handler in `_executeTool()` — dispatches
  in-process to Patch 8's `runPipeline()`, no dead HTTP hop
- Threaded a `context` object through `_newRun()` / `run()` so a run
  carries real parameters (e.g. `{specPath, provider}`) to whichever
  tool the LLM picks
- System prompt now tells the model `run_pipeline` exists and what it
  does, when a spec path is present in context
- New route: `POST /api/system/autonomous/build-spec {specPath, provider}` —
  fills in Goal/Budget/Boundary/Exit automatically so a non-technical
  user only ever provides a spec path
- **Safety net:** if the LLM's run completes without ever calling
  `run_pipeline` (small local models can misfire on the `TOOL:` parse —
  the exact failure mode `orchestrator/lib/grammar-misfire-tracker.js`
  exists to catch elsewhere), the route falls back to calling
  `startPipeline()` directly, deterministically. A one-click build must
  not silently do nothing.
- UI: new "Let Copilot handle it" button on the build page, separate
  from the manual "Build" button

---

## Verification performed this session

- `node --check` on all 6 new/modified JS files: **pass**
- `require()`-loaded each against the real `nexus-v5` tree (not a mock):
  **all resolve cleanly**
- Diffed `emerge/compiler/t2-gate.js` between the version this was first
  built against and `nexus-wired-v5.zip`: **byte-identical**, confirming
  the pipeline wiring still applies correctly
- Simulated a full `pipeline.started → build-complete → complete` event
  sequence against the real `nexus-bus.js` with `expectation-watcher.js`
  attached: **zero false positives, pending list empties correctly**
- Exercised `startPipeline()`'s synchronous `pipelineId` return and
  confirmed the registry record exists immediately, no race: **confirmed**

## Not yet verified

- No real `.spec` has been run through the full loop against a live
  Guardian + Ollama stack — everything above is a code-reading/
  unit-level guarantee, not an end-to-end one
- `hooks/index.js` / `seams/seam-contracts.js` have no entries for the
  new build-pipeline/execution-pipeline/consent services — they work
  without this, but Architect's hook registry won't know about them yet
- Unified ledger write-through for build/pipeline state is in-memory
  only (`Map()`), noted in both files' own headers as a future step
- Whether `idearium/api/index.js`'s `idearium.spec-engine.chunk.*`
  events actually reach `nexus-bus` (assumed by one of Patch 3's
  expectations) was traced but not directly confirmed
