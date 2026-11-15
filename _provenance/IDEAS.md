# Nexus — ideas, roadmaps and deferred work across versions

Roadmaps, proposals, backlogs and 'next / deferred / not built' notes found in the archived builds, and when each first appeared.

## Ideas for this archive (not done)

- **Import the embedded git histories.** 379 archives carry a real `.git` directory, and two (`nexus-git-part1/2`) are nothing else. Their HEAD commits are listed in EXCLUSIONS.md; the actual commits could be grafted in as a second line of history.
- **Link to the live repository.** Archives named `Nexus-main-*` are GitHub downloads of an existing repository. Its commits from 0.39.262 onward could be cross-referenced to the matching `snap-NNNN` tags.
- **Split runtime data from source.** `data/`, `cortex/data/` and the ledgers account for a large share of every diff. A filtered branch without them would make the code history easier to read.
- **Store the excluded large files** (Versionium `.nex` snapshots, event baselines) with Git LFS or a release asset if they are wanted online.


## Documents, by first appearance

| First seen | Version | Document | Title |
|---|---|---|---|
| snap-0052 2026-06-11 | 0.0.48 | `docs/roadmap/NEXUS-ROADMAP.md` | NEXUS ROADMAP |
| snap-0077 2026-06-14 | 0.4.0 | `erosmancer/erosmancer-os/ROADMAP.md` | ErosmancerOS — Roadmap |
| snap-0140 2026-06-20 | 0.9.8 | `nexus-integrated-13/docs/roadmap/NEXUS-ROADMAP.md` | NEXUS ROADMAP |
| snap-0140 2026-06-20 | 0.9.8 | `nexus-integrated-13/erosmancer/erosmancer-os/ROADMAP.md` | ErosmancerOS — Roadmap |
| snap-0140 2026-06-20 | 0.9.8 | `nexus-v0_9_8/docs/roadmap/NEXUS-ROADMAP.md` | NEXUS ROADMAP |
| snap-0140 2026-06-20 | 0.9.8 | `nexus-v0_9_8/erosmancer/erosmancer-os/ROADMAP.md` | ErosmancerOS — Roadmap |
| snap-0221 2026-07-01 | 0.9.8 | `docs/NEXUS-LATTICE-COGNITION-ROADMAP-v0_1.md` | NEXUS — Lattice / Nerve / Cognition Roadmap v0.1 |
| snap-0251 2026-07-06 | 0.9.10 | `docs/NEXUS-VISION-SPEC-2026-07-06.md` | NEXUS — Full Orchestration End State |
| snap-0257 2026-07-10 | 0.9.10 | `docs/NEXUS-COPILOT-ROADMAP-2026-07-10.md` | Copilot-as-NEXUS — Feature Roadmap (2026-07-10) |
| snap-0342 2026-08-08 | 0.39.0 | `_archive/superseded-docs-2026-08-09/NEXUS-COPILOT-ROADMAP-2026-07-10.md` | Copilot-as-NEXUS — Feature Roadmap (2026-07-10) |
| snap-0342 2026-08-08 | 0.39.0 | `_archive/superseded-docs-2026-08-09/NEXUS-VISION-SPEC-2026-07-06.md` | NEXUS — Full Orchestration End State |
| snap-0362 2026-08-14 | 0.39.0 | `_archive/unintegrated/2026-08-14-uploaded-batch/spatial-components/spatial/docs/Roadmap.md` | NEXUS — Master Phase Map |
| snap-0404 2026-08-22 | 0.39.0 | `docs/roadmap/2026-08-22-copilot-end-state-vision.md` | NEXUS End-State Vision — Co-pilot as the Interface |
| snap-0438 2026-08-27 | 0.39.0 | `ARCHITECTURE-BRAINSTORM-SYNTHESIS-2026-08-25.md` | Architecture brainstorm — organized against what's real, 2026-08-25 |
| snap-0533 2026-09-11 | 0.39.75 | `ARCHITECTURE-BRAINSTORM-SYNTHESIS-2026-09-10.md` | Architecture brainstorm — organized against what's real, 2026-09-10 (v2) |
| snap-0533 2026-09-11 | 0.39.75 | `_archive/root-docs-consolidated-2026-09-10/ARCHITECTURE-BRAINSTORM-SYNTHESIS-2026-08-25.md` | Architecture brainstorm — organized against what's real, 2026-08-25 |
| snap-0742 2026-10-09 | 0.55.1 | `docs/roadmap-triage.md` | Roadmap triage — first pass, by map |
| snap-0781 2026-10-24 | 0.60.250 | `clear-glass/erosmancer/erosmancer-os/ROADMAP.md` | ErosmancerOS — Roadmap |
| snap-0787 2026-10-28 | 0.60.285 | `ROADMAP.md` | ErosmancerOS — Roadmap |
| snap-0788 2026-10-29 | 0.60.295 | `clear-glass/docs/gigs/ideas/2026-10-29-market-brainstorm.md` | Fiverr gig ideas from the market — 2026-10-29 |

## Recorded in release notes and handoffs, by version

Sections lifted verbatim (trimmed) from changelog, handoff and session files at the snapshot where each file first appeared.

### snap-0031 — v0.0.29 — 2026-06-03

**Idea log (not yet built, in priority order)** — `docs/HANDOFF.md`

> 1. **COS compartment orchestration** — COS kernel + manager replaces `_bootSystems()`. Each NEXUS system (bridge, cortex, guardian, idearium, emerge) becomes a COS compartment: `C = (Axioms, Conditions, Synthesis, Context)`. Born in sandbox, earns bus connections through 7 birth gates. Failure = recycled, not crashed. This is the right architecture — the pieces exist, just needs wiring.
> 
> 2. **Guardian CLI ↔ userscript shared ledger** — `cortex-v2.js` and the Claude userscript currently talk to different JAA tables. One shared `event_log.jsonl` means CLI `nexus> ledger guardian` shows what the userscript actually did in real time.
> 
> 3. **Spec file picker in Forge** — drag-drop `.spec` into chu …

**How to build next session (FORGE protocol)** — `docs/HANDOFF.md`

> Before any build:
> 1. Ask: what session is this?
> 2. Ask: what's the last stable state? (run tests)
> 3. Ask: what are we building?
> 4. Ask: are SISO and JAA present in scope?
> 5. Ask: is this bottom-up?
> 
> Build phases: 0=Orient, 1=Brainstorm, 2=Hostile Review, 3=Spec, 4=Build, 5=Test, 6=UI, 7=Hostile Verify
> 
> Version bumps +0.1 per phase. Full zip output only. No patches.

### snap-0052 — v0.0.48 — 2026-06-11

**How to Start Next Session** — `docs/SESSION-CHANGELOG.md`

> ```
> 1. cd D:\Backups\Downloads\nexus-patched-5\nexus-work
> 2. node orchestrator.js
>    (waits for all 5 systems to boot)
> 3. node cli/session.js
>    (renders SESSION.md — read this first)
> 4. Install/update Tampermonkey userscripts:
>    - guardian/userscript-claude.js → Claude.ai tabs
>    - guardian/userscript-chatgpt.js → ChatGPT tabs
> 5. Ask the 5 FORGE-SKILL orienting questions
> 6. Then build
> ```
> 
> **Test the fix worked:**
> 1. Open ChatGPT in browser with new userscript installed
> 2. Wait for Guardian tab widget to show ACTIVE (or click PASSIVE → claim)
> 3. In NEXUS UI → Guardian → Dispatch: provider=ChatGPT, command=code, prompt="test"
> 4. Should see status "streaming · poll N" and ChatGPT respond
> 5.  …

**PHASE 1 — SOLIDIFY (next, urgent)** — `docs/roadmap/NEXUS-ROADMAP.md`

> **Goal: system survives everything. nothing is lost.**

**IDEAS HOLDING (not phased yet)** — `docs/roadmap/NEXUS-ROADMAP.md`

> - Video game style code builder (different skin on block canvas)
> - Using a DAW to code — sound → constraint field → SEAM
> - Voice input → SEAM grammar → dispatch
> - SFT (Spatial Field Tracker) re-integration
> - People module / relational field analytics
> - ALK (Associative Lattice Kernel) full integration
> - Bridge OS adversarial test suite expansion
> - Mobile app (Guardian as a native app, not just mobile web)
> 
> ---

### snap-0169 — v0.9.8-r29 — 2026-06-26

**Next Phases** — `CHANGELOG-SESSION.md`

> | Phase | Name | Ready |
> |-------|------|-------|
> | 41 | Compiler Knowledge Layer | Unblocked (40 done) |
> | 43 | Architect as UI Builder | Unblocked (40, 42 done) |
> | 29 | Topology View: Live System Graph | Unblocked |
> | 48 | CFR ↔ Decision Pipeline | Unblocked |
> | 71.4 | Full self-heal controller rebuild | Architecture defined |
> | ERAVOS | Nexus component → canvas hook bridge | NexusBridge ready |

### snap-0225 — v0.9.8-r79 — 2026-07-02

**Part 2 — Proposed Flow, System by System** — `session-specs/NEXUS-BRANCHING-DECISION-LOOP-SPEC-v0_1.md`

> ```
> 1. COPILOT receives the question.
>    owns: intent, initial confidence check (extends lifeline.js's existing
>    _estimateConfidence — same function, broader input than just Ollama's
>    own response text).
> 
> 2. If unknown: LOOM REGISTRY resolves "which component/system is this
>    actually about" — a lookup against already-declared components/hooks,
>    not a new mechanism. Returns a component_id (or a short ranked list
>    if ambiguous — ambiguity itself is useful signal, not an error).
> 
> 3. LOOM CONTRACTS opens ONE contract for that component_id, bound to a
>    BASE COS compartment. This is the container the exploration happens
>    inside — nothing outside this compartment is touched while unkn …

**Part 4 — Open Questions (blocking, per your own "ask" instinct — not deciding these for you)** — `session-specs/NEXUS-BRANCHING-DECISION-LOOP-SPEC-v0_1.md`

> **Q1 — Best-of-N vs synthesize: does one take priority, or does the question itself decide which applies?** My read: synthesis when branches converge, best-of-N as fallback — but that's my judgment, not yours yet.
> 
> **Q2 — Per-branch contract, or one contract with N tracked attempts?** Phase 156's contract model was built assuming one compartment per component. N branches of the *same* component muddies that — worth deciding before building the orchestrator, not after.
> 
> **Q3 — Does RFR2's clip/adapter-sandbox (event-level, side-effect-policy-enforced replay) belong in v1, or is COS's filesystem-level branching sufficient to start?** My read: start with COS alone — RFR2's piece adds real safet …

### snap-0251 — v0.9.10-r9 — 2026-07-06

**3. Proposed build order** — `docs/NEXUS-VISION-SPEC-2026-07-06.md`

> Dependency-driven, not priority-driven — each phase only needs what's above it:
> 
> 1. **Finish B (universal tools) + registry coverage in A.** Everything else calls through these; building them first means later phases wire into one stable interface instead of guessing at it.
> 2. **D's unified ledger** (replicate bridge's Cortex-mirror pattern to guardian/copilot/ollama/idearium) + finish push/recall's remaining 3 lanes. This is what makes "nothing lost" literally true, and what E/F need to actually integrate with each other.
> 3. **C, the ingestion/streaming layer.** Needs A+B to have something worth streaming, and D to have somewhere durable to land.
> 4. **E + F integration passes** (copilot too …

**4. Open questions worth deciding before building** — `docs/NEXUS-VISION-SPEC-2026-07-06.md`

> - **Personality scope:** per-conversation only, or can a personality also restrict which tools/systems it's allowed to touch? (Affects E's design now vs. later.)
> - **Ledger retention:** "nothing lost" — forever, or with a decay/archive tier like `crystal-lattice`'s existing pattern? Unbounded growth has a real storage cost across every system's events.
> - **Scheduler failure semantics:** if a scheduled workflow's first `run_command` fails, does the workflow abort, retry, or continue partially? Needs a decision before G is built, not after.
> - **Meta UI access model:** single-user control panel, or does it need its own auth/permission layer given it can reconfigure live systems?
> 
> ---
> 
> *This is  …

### snap-0362 — v0.39.0-r23 — 2026-08-14

**Open Questions (consolidated)** — `_archive/unintegrated/2026-08-14-uploaded-batch/spatial-components/spatial/docs/Roadmap.md`

> | # | Question | Affects |
> |---|---|---|
> | 1 | **Warmup length** — 5 batches (~50s). Configurable per use-case? Auto-extend if warmup variance is high? | Phases 1, 10 |
> | 2 | **Session re-baselining** — for sessions > 2 hours, should baseline optionally re-lock at midpoint? | Phase 1 |
> | 3 | **OLS local vs global slope** — expose both local (last 8 batches) and global (full session) slopes? | Phase 2 |
> | 4 | **Oscillation minimum period** — floor at 4 batches (40s) to avoid flagging normal conversational rhythm? | Phase 4 |
> | 5 | **Video topology** — separate `TopologyEngine` instance for video, or merge into one cross-modal instance? | Phase 9 |
> | 6 | **ALK kernel in index.html** — inline,  …

### snap-0533 — v0.39.75-r3 — 2026-09-11

**Part 5 — the "drag-and-drop new system" idea already has its wiring; it needs one artifact, not new code** — `ARCHITECTURE-BRAINSTORM-SYNTHESIS-2026-09-10.md`

> Checked `genesis.spec` and how it's actually used: it's real and
> carefully designed (spine=WARP, root types, per-domain schema-baseline
> axioms) but `idearium/spec-engine/index.js` is explicit that it is
> **only ever used to extract a meta header** — version, UUID, spine
> declaration. Its own comment: "there is no structural mapping from the
> DSL to the other seven sections, and inventing one would fabricate
> content." So genesis is the *ontology* of a valid sovereign system, not
> a generator that produces one.
> 
> The actual generator already exists, fully wired, one layer over from
> where we were looking: `idearium/spec-engine/templates.js`'s
> `readCompartmentTemplate()` (built 2026-08-17, GA6 — Jame …

### snap-0553 — v0.39.98-r2 — 2026-09-11

**What's next — R2 through R10, in dependency order** — `_archive/superseded-docs-2026-09-11/CHANGELOG-SESSION.md`

> - **R2** (real snapshot/rollback) — the one genuine gap in the whole map,
>   not just a disconnection. `cortex/snapshot/index.js` doesn't exist;
>   a real UI panel (`ui/tv-shell/index.html`'s SYSTEM REWIND) has been
>   waiting for it, honestly showing `?` instead of faking data. Idearium's
>   branch bug is CONFIRMED (`idearium/index.js:713`, parentId always
>   picks the most recent snapshot regardless of branch) — fix that before
>   building real branching on top of it. `versionium.spec` has the real
>   build order already worked out.
> - **R3** (autonomous repair trigger) — wire the already-correct,
>   already-built `copilot/repair-on-prompt.js` (zero production callers
>   right now) to fire from a de …

**Next Phases** — `_archive/superseded-docs-2026-09-11/CHANGELOG-SESSION.md`

> | Phase | Name | Ready |
> |-------|------|-------|
> | 41 | Compiler Knowledge Layer | Unblocked (40 done) |
> | 43 | Architect as UI Builder | Unblocked (40, 42 done) |
> | 29 | Topology View: Live System Graph | Unblocked |
> | 48 | CFR ↔ Decision Pipeline | Unblocked |
> | 71.4 | Full self-heal controller rebuild | Architecture defined |
> | ERAVOS | Nexus component → canvas hook bridge | NexusBridge ready |
> 
> 
> ---

**2026-07-20 (later) — hook registry: architect → loom migration (§10.1 ownership correction)** — `docs/CHANGELOG.md`

> James: architect "got hook duty, never intended — it's supposed to build
> architecture." Confirmed by evidence, not taken on faith: architect ran the
> hook registry (269 hooks, full CRUD, seeding, a 30s component-registry sync
> loop) while loom's boot banner had claimed "component/hook/wire/seam
> registry" since v1.1.0 with ZERO hook code behind it. And Blueprint — the
> actual architecture builder — received `hooks: registry` in its constructor
> and never called it once (grep -c: 0). The dependency was decorative.
> 
> Migration (docs/hooks-migration.spec, written first per §3.1):
> - Registry class → lib/hook-registry.js (shared, git mv, history preserved).
>   Sync module likewise → lib/hook-sync-from-c …

**2026-07-20 (later) — sigma_records compaction: the unbounded-growth item, closed** — `docs/CHANGELOG.md`

> `orchestrator/lib/sigma-compaction.js` — hourly rollups + real hard-delete,
> owned by sigma-writer's own process (§10.1; JaaStore's flush only protects
> deletes made by the deleting process, so compaction anywhere else would race
> resurrection — cortex verified to never dirty this table). Retention = the
> 24h short tier sigma_records was declared as in tiers.js all along (decay
> never actually ran on it: its tombstone update was one of the string-where
> silent no-ops fixed earlier today, and tombstones never shrank the file
> anyway). Expired rows roll into `sigma_rollups` (long tier — count, avg/max
> sigma, warn/halt counts, top types per hour) BEFORE deletion: compressed
> history, not destroyed (§0. …

### snap-0590 — v0.39.142-r1 — 2026-09-15

**Immediate next step, if continued** — `docs/2026-09-15-session-handoff.md`

> Per the merged phasemap's `build_order`: **MCO0 is done; MCO-A (register
> `schema.phase_node` + `schema.file_delta`) is next**, since MCO-B/E depend on it
> and it has no unresolved open questions blocking it.

**D7 — schema status vocabulary: `OPEN`, not the drafts' `PROPOSED`** — `docs/2026-09-15-versionium-cortex-snapshot-migration-decision.md`

> **Decision (applies to the MCO-A work that follows this migration):**
> `schema.file_delta` and `schema.phase_node` will be registered with
> `status: OPEN` (schema defined, no real writer yet), matching this
> codebase's actual, established two-value vocabulary (`REAL` / `OPEN`,
> confirmed by grepping every existing schema file — see e.g.
> `versionium/schemas/schema.system`), not the draft files' own invented
> `PROPOSED`, which appears nowhere else in the codebase.
> 
> **Axiom check:** §0.1 (reality is authority over the draft's own prior
> choice of word). §1.1 (nothing exists until proven — `OPEN` says exactly
> that: the shape is real and registered, the writer is not).

**Immediate next step, if continued** — `docs/2026-09-15-versionium-migration-and-mco-a-handoff.md`

> Per build order: **MCO1 (graph layer)** is the next MCO with no
> unresolved blockers — derive edges from data `import-pipeline.js`
> already produces, ships incrementally (imports/exports first,
> calls/callers last), unresolved edges stay explicitly unresolved (§24).
> `MCO-F` and `MCO6` are equally unblocked and could run instead/in
> parallel per the phasemap's own note.

### snap-0607 — v0.39.151 — 2026-09-19

**Full remaining list (checkable, nothing omitted that I know of)** — `docs/HANDOFF-2026-09-19-cortex-intelligence-move.md`

> **Behavioural / decisions**
> - [ ] Define "current sigma" (suggest max sigma over last N ledger entries) and expose it on the orchestrator ledger; then autonomous-loop, hot-loader (rollback >0.70) and MCP `nexus_cfr` start working. Until then they read 0 / n/a.
> - [ ] V7: pick ONE sigma-gated auto-commit trigger (versionium/lib/engine.js vs orchestrator/lib/versionium-auto-commit.js) or a shared cooldown.
> - [ ] D3: decide the rewind engine (git in lib/project-container.js vs versionium), then decide whether `cortex/snapshot` (3 in-repo consumers: orchestrator/lib/autonomous-loop.js, orchestrator/lib/request-handler.js, lib/compartment-engine.js) moves.
> - [ ] Decide whether `cortex/versionium/` …

### snap-0612 — v0.39.154 — 2026-09-19

**Must build next (Clear Glass, cannot run in the build sandbox)** — `docs/HANDOFF-2026-09-19-mesh-first-dispatch.md`

> 1. ClearDriver: resolve the agent's `<webview>` guest; delete the focused-window/`all[0]` fallback. Archaeology has its own copy of the same lookup.
> 2. `POST /agent-mesh/send` {provider,prompt,agentId,accountId,jobId,selectors,timeoutMs} -> {ok,text,chatUrl,sent,stage}. `sent` is load-bearing.
>    Stages the ladder understands: input_not_found, send_not_found, response_not_found (repairable); no_login, captcha (user); no_window, no_webview (fallback).
> 3. `POST /agent-mesh/diagnose` -> archaeology + automatic DOM mapping -> {ok,repaired,selectors,evidence}.
> 4. Picker UI listens for `GUARDIAN_PICKER_NEEDED`; deterministic agentId/contextId `mesh-<provider>-<accountId>`, partition `persist:mesh- …

### snap-0618 — v0.39.170 — 2026-09-20

**NOT done — no backend exists for these** — `CHANGELOG-0.39.165.md`

> - **CI/CD per compartment with SSH** — no CI/CD subsystem and no SSH
>   infrastructure anywhere in the tree. A real subsystem build.
> - **Push/pull repos** — `.git` is real (project-import shells out to the
>   git binary) but there is no remote config or credential path.
> - **Test env / "torture chamber"** — does not exist by that name.
>   `cos/playground/sandbox.js` is real and wireable
>   (`SandboxRunner.run(compartment, branchId, opts)`).
> - **Versionium per compartment** — cheap and real, not yet wired:
>   `engine.commit()` already takes `branch`/`system` and
>   `/api/versionium/history?system=` filters, so compartmentId maps
>   straight on via a proxy from idearium's API.
> - **TV shell block** (ed …

**NOT done this pass** — `CHANGELOG-0.39.166.md`

> Agents tab + per-repo CLI · Map tab (atlas + chunk index) · tags per chunk ·
> chunk editing on the build surface · AI-assisted IDE · Versionium tab ·
> CI/CD per compartment with SSH · Brainstorm "spacial void".
> 
> CI/CD and SSH remain the largest single item: there is no CI/CD subsystem
> and no SSH infrastructure anywhere in the tree today.

**Still not built** — `CHANGELOG-0.39.167.md`

> Agents tab + per-repo CLI · Map tab · tags per chunk · chunk editing on
> the build surface · AI-assisted IDE · Versionium tab · Brainstorm
> "spacial void" · CI triggers (`onChunkDone`/`onCommit` are accepted in
> config and stored, but nothing fires them yet — runs are on-demand only).

**Next** — `CHANGELOG-0.39.168.md`

> Key management in compartment options, per your ordering. Then: agents tab
> + per-repo CLI (both now have an agent to talk to), Map tab, chunk tags,
> chunk editing, AI IDE, Versionium tab, spacial void, CI triggers.

### snap-0622 — v0.39.178 — 2026-09-20

**Not done** — `CHANGELOG-0.39.176.md`

> Automatic commit on every repo write; restoring binary or non-UTF-8 files
> (refused whole, named); blob garbage collection; MCO-C's hook (one snapshot
> per materialized file); incremental multi-request record (a snapshot whose
> changed content exceeds 32 MiB is refused before it commits).

**Not done** — `CHANGELOG-0.39.177.md`

> Automatic commit on every repo write; blob garbage collection; restoring a
> changed binary that is not source-owned; the UI does not yet say which files
> go through the source layer (the plan carries `viaSourceLayer`).

### snap-0623 — v0.39.179 — 2026-09-20

**Not done** — `CHANGELOG-0.39.179.md`

> Creating a phasemap or a phase, or editing `depends_on`, from the UI; `module_path`
> (needs MCO-D); who made an edit (a date is recorded). Duplicate-id header-shaped
> lines lower in a file (dictionary entries) are reported and not edited.

### snap-0632 — v0.39.194-r1 — 2026-09-21

**Not done** — `CHANGELOG-0.39.190.md`

> `.repo_agent` -> `.agent` (writer, schema fields, test); binding to a repo's `.intent`
> and its commands (where a repo's `.intent` node comes from is unverified); whether
> `.agent` references or absorbs `agent_model`; registering `test-repo-agent*.js` in
> `tests/modules/run-all.js` (the previous session said it was; it is not).

**Not done** — `CHANGELOG-0.39.191.md`

> Binding to a repo's `.intent`/`.command` nodes; `.agent` vs `agent_model` (referenced or
> absorbed) undecided; the `.agent` bundle is written by one repo path only (no guardian-hosted
> `.agent` nodes exist yet). Pre-existing failures untouched: `node-schemas-split` type count,
> `test-node-schemas` NS-003/NS-012.

**Not done** — `CHANGELOG-0.39.192.md`

> - No guardian tool is in the hat's scope today (the label exists; nothing uses it). Which
>   guardian tools a project agent should hold is undecided.
> - Commands are ids of registry tools, not `.command` node uuids.
> - Retrieval is agent-initiated only. Nothing pre-fetches chunks at dispatch time, which is the
>   only way to make the scoping real by construction rather than by instruction.
> - Binding to the repo's own `.intent` node is still undecided.

**Next** — `CHANGELOG-0.39.193.md`

> Put proof on the chunk (and in the `context` pack), populate `tests` from the executed-by edges, then
> call edges.

### snap-0633 — v0.39.194-r2 — 2026-09-21

**Not done / not verified** — `idearium/CHANGES-2026-09-21.md`

> - Not run against a booted Nexus, a real browser, or a real guardian/ChatGPT tab.
> - import-pipeline (repo.chunk.run) memory not measured.
> - autopilot heap cap left at its default on purpose; the machine is at the memory-pressure line.

### snap-0655 — v0.39.228 — 2026-09-25

**Not done / open** — `CHANGELOG-0.39.228.md`

> - Ownership refinements that are not pure cuts (`tuneById` sits in `agent-suite.js`).
> - DECOMP Phase 3 (iframe cut-over) — blocked on the 7 missing channel documents.
> - Live check on James's machine with services running.
> - Pre-existing, unrelated: `nexus-full-audit` "co-pilot sends uiState" fails (the string is in `ui/copilot/copilot.js`); `test-tablet-homepage` reads a missing `tablet/homepage.html`; 0.39.227's changelog says `test-cg-settings-ui-files` 6/6, the file has 5 tests.

### snap-0662 — v0.39.237 — 2026-09-25

**Not done** — `CHANGELOG-0.39.237.md`

> - The ping gate pings the provider's active client, not the repo tab the job is aimed at. That's the "ping gate did not clear … dispatching anyway" line in the log.
> - A waiting job holds a dispatch-pool slot, as every existing queued path already does.
> - `guardian/interaction-contract.json` says 3.5.0 while guardian is 3.9.0. This drift predates this release.
> - `test-ncp-handler-sr3` still writes guardian artifacts and ledgers into the real tree. 0.39.236 lists these stores as not yet sandboxed. They were restored by hand here and are not in this commit.
> - Live verification on James's machine with Clear Glass running.

### snap-0663 — v0.39.239 — 2026-09-25

**What your next log will say** — `CHANGELOG-0.39.238.md`

> - `reply-started` then `job complete`: fixed.
> - `no-reply-element`: ChatGPT's live page has no element the selector recognises. The DOM then has to be mapped from the live page (archaeology), not guessed here.

**Not done** — `CHANGELOG-0.39.238.md`

> - **Download manager.** `clear-glass/src/downloads/artifact-chat-index.js`, the "downloads manager as artifact + agent chat index" (`.response` files + `index.db`, 2026-09-17), has no caller and stores no agent or compartment id. A downloads list exists in Settings → Downloads (0.39.231), but there is no manager view that routes to a compartment. Next.

**Next** — `CHANGELOG-0.39.239.md`

> The idearium Agent tab should pick up a reply that arrives after copilot's wait has timed out, from this index by agent and job, instead of staying on "thinking…".

### snap-0670 — v0.39.245 — 2026-09-25

**Not built (filed in docs/2026-09-25-spec-engine-manifest-first-phasemap.spec)** — `CHANGELOG-0.39.245.md`

> - P1a (LLM writes the file list) and P1c (LLM writes each file's interface) — they need the agent reply path working first.
> - N1 Ollama: new conversation per chunk, logged, referencing the previous by pointer. N2 Copilot: logged, referencing last context. N3 manage NEXUS in Idearium: run this over NEXUS itself.

### snap-0671 — v0.39.246 — 2026-09-25

**Not built** — `CHANGELOG-0.39.246.md`

> - Agent replies still need the one-tab decision (one window with a conversation per repo · one shared conversation · tab per repo, fixed).
> - Execution ↔ code and execution ↔ spec disagreements (a code edge whose target never ran) — the three graphs now exist side by side; only spec ↔ code is compared.

### snap-0673 — v0.39.251 — 2026-09-25

**Not done — waiting on you** — `CHANGELOG-0.39.248.md`

> **ChatGPT reply detection.** The job reached its one tab and was submitted, and ChatGPT opened `c/WEB:…`, but the userscript saw `reply 0ch · anchor: no reply node yet`. The reply selectors in `guardian/userscript-chatgpt.js` no longer match the live page, and it has to be mapped from that page, not guessed. In the ChatGPT tab, after it has answered something, open DevTools and run:
> 
> ```js
> [...document.querySelectorAll('[data-message-author-role]')].slice(-3).map(e=>({role:e.dataset.messageAuthorRole,id:e.dataset.messageId,len:e.innerText.length,cls:e.className.slice(0,80)}))
> ```
> 
> If that returns `[]`, run `document.querySelector('main').innerHTML.slice(-4000)` instead.

**Not done — next, in this order** — `CHANGELOG-0.39.249.md`

> 1. **The picker UI in Clear Glass.** Pick an element on a ChatGPT page, choose its role (reply / input / send), have it checked against the live page, and `POST` it with that evidence.
> 2. **Automatic repair on `no-reply-element`.** Archaeology proposes, a mechanical check verifies, and copilot may propose but never counts as verified.
> 3. **The other userscripts** (claude, gemini, perplexity, deepseek) reading the map.
> 4. **Guardian registry and contract entries** for the two new routes.
> 
> Then, from the same request: ClearDriver under Agent settings; a Copilot settings section; per-compartment agent permissions with toolScope actually enforced; the guardian picker wired to the backend; Clear  …

**Not done** — `CHANGELOG-0.39.251.md`

> - **Live proof on James's machine:** pick the reply on a real ChatGPT chat, assign it, run a job, then see the reply detected → `.response` → Library → Responses.
> - **Handoff steps 2–8** (next: automatic repair on `no-reply-element`).
> - **Loom's stored registry** predates 0.39.248. The new files aren't in it until loom's bootstrap re-scans.

### snap-0675 — v0.39.253 — 2026-09-25

**Not done** — `CHANGELOG-0.39.253.md`

> - **A Chromium click-through of the switch** was not run. The page finds its API through `API_CANDIDATES` + `/health`, so a probe must serve the idearium UI and fake those routes.
> - **`copilot/spec/copilot.spec` is still not valid YAML.** This is pre-existing (line 89).

**Next (from the 09-25 map, in order)** — `docs/2026-09-26-handoff.md`

> 2. **Auto-repair on `no-reply-element`.** Read `mesh.diagnose` in Clear Glass first.
> 3. **Other userscripts read the selector map.** Also add guardian registry and contract entries for `/api/agents/:id/selectors`.
> 4. **Settings.** ClearDriver goes under Agent settings, plus a Copilot section. Ask James: a new "Agents" section, or `providers`/`mesh`?
> 5. **Enforce `toolScope`.**
> 6. **Wire guardian-picker to the backend.** Its look stays byte-for-byte; `test-cg-selector-assign` SA-06 pins it to 0.39.250 + one line.
> 7. **Clear Glass drag/resize.** Check `-webkit-app-region` first.
> 8. **Better-looking elements.** Ask which surfaces.

### snap-0677 — v0.39.257-r2 — 2026-09-25

**Not done / known** — `CHANGELOG-0.39.254.md`

> - **Not proven live on James's machine.** Next time a chat settles, expect `[guardian/chat-transcripts] chatgpt:WEB:… v1` in the log, and the chat under Library → Responses.
> - **gemini / perplexity / deepseek readers return the last reply only** (`partial: true`), so each of their versions holds one reply.
> - **userscript-claude's reader is unverified.** Its selectors (`human-turn-content` / `assistant-turn-content` / `.font-claude-message`) were not checked against today's claude.ai.
> - **No agent reads its memory back automatically yet.** The routes exist. Wiring them into co-pilot's tools, or into the repo agent's persona (the "introspect tool" in the 09-25 handoff), is the next step.
> - **` …

**Not done / known** — `CHANGELOG-0.39.255.md`

> - **Not proven live.** On the next repo-agent job, expect these guardian lines:
>   - `[guardian/chat-transcripts] chatgpt:<id> v1 · 2 messages · repo-nexus-id-repo-af2180cf (push)`
>   - then `job cccaafb0 completed from the transcript …`
> 
>   The Agent tab should show the reply, and the next job should dispatch.
> - **If the log says `not taken yet (generating)` on an idle page,** ChatGPT's `_isGenerating()` selector (`[class*="loading"]`) is matching something else. That's a one-line selector fix, best made from a live DOM.
> - **`test-vector-memory-pipeline` deletes the real vector index;** it needs the sandbox.

**Not done / known** — `CHANGELOG-0.39.256.md`

> - **Not proven live.** Expect the Agent tab's live box to fill while ChatGPT writes, with a gate row at each step.
> - **Still to come:** 0.39.257 — every tool, enforced and listed (`/help`, `/tools`), debugging through the intelligence system, and the graph in context. 0.39.258 — learning, and COS/RAID for Run.

**Not done** — `CHANGELOG-0.39.257.md`

> - **Not proven live.**
> - **0.39.258 is still to build:** learning from outcomes and corrections; COS/RAID for Run.

### snap-0678 — v0.39.257-r3 — 2026-09-25

**Next: 0.39.258 (not started; James said "no preference", so use these defaults)** — `docs/2026-09-26b-handoff.md`

> 1. **Learning from outcomes.** Files the agent read or changed become facts; rejected injects become corrections; Run failures become pitfalls. All go through `lib/repo-hat.js` `learn()`, with evidence.
> 2. **Learning from James's corrections.** A reply starting "no," / "actually" / "that's wrong" is recorded as a correction to the previous answer.
> 3. **Run with COS and RAID.** Run under the repo's archetype limits, with snapshots before and after; keep the branch on failure; send results to RAID's officiator as a contract; stream stdout; add a `run_repo` tool so the agent can run the project itself. Start in `lib/repo-run.js`, `cos/`, and `cortex/core/raid/officiator.js`.

### snap-0680 — v0.39.258-r1 — 2026-09-25

**Not done** — `CHANGELOG-0.39.258.md`

> - **Not proven live end to end:** the new area has been proven in Chromium, but not a real ChatGPT turn through the whole stack.
> - **The learning work planned for this release moves to 0.39.259.**

### snap-0682 — v0.39.258-r3 — 2026-09-26

**Built: Idea tab, Debug tab; repos no longer "building"** — `CHANGELOG-0.39.261.md`

> - **"building" was never true:** every repo was stamped `building` at creation.
>   - Repos now start `specced`. `building` is set only by the build queue or build route when work actually runs.
>   - Existing repos, and the "Repo: x" ideas auto-created for them, are migrated once at boot.
>   - Ideas a person wrote are never touched.
> - **The idea follows its repo:** three spec→repo paths passed the originating idea as the fork `parent`, and `ingest` ignored `ideaUuid`. The idea a repo came from is now its idea.
> - **Idea tab:**
>   - The repo's idea, editable.
>   - Iterations: **improve**, **iterate** and **expand**. Each is a real IdeaOS idea, causally linked to the repo's idea, with a status: open, …

### snap-0700 — v0.39.271-r1 — 2026-09-27

**Not done** — `CHANGELOG-0.39.271.md`

> - **A test run's debugger is a report, not a stepper.** There are no breakpoints and no attach. The report points at the failing line with its code.
> - **Process runs still install nothing.** A suite with uninstalled dependencies runs in the VM.
> - **Phase builds on NEXUS still need a hand to apply them.** The agent's code arrives as injects, and applying it to the live tree is still the apply gate by hand. RAID is not in that path.
> - **Other systems' registries don't run.** Only Guardian runs a node registry (watcher, ledger and index). Architecture gap AS1 stays open for the others.
> - **Versionium on your machine.** It worked in the sandbox after these fixes. If your Versionium tab still mis …

### snap-0702 — v0.39.272 — 2026-09-27

**A spec's idea lives in its repo; the counts are yours** — `CHANGELOG-0.39.263.md`

> James: *"it says 15 ideas and 15 repos can you fix that? also ideas, once promoted to spec should move to the idea tab in the actual repo of the idea/spec?"*
> 
> **What was wrong**
> - Each of Nexus's system repos carries a "Repo: nexus/…" idea and a spec per synced version.
> - Those filled the Ideas list and the ideas and specs counts in the header.
> - An idea that became a spec also stayed in the Ideas list.
> 
> **What changed**
> - **Ideas list and ideas count:** only ideas that have no repo yet. An idea with a repo is a spec, and it lives in that repo's Idea tab.
> - **Pointer to the specs:** a line under the list says how many ideas are specs, and takes you to Repos.
> - **Specs count:** leaves out Nex …

**Not done (stated, not hidden)** — `CHANGELOG-0.39.272.md`

> - **Axiom rule 3:** no loom map for the new components yet.
> - **Axiom rule 4:** spec addenda and `SPEC-REGISTRY` entries are not written.
> - **Tests:** the context-atlas test from the first pass was not ported. It needs the `{atlas}` rename.
> - **Learning from the pane:** actions the co-pilot pane runs directly on the driver are not recorded as site memory. Only `clearglass.browser.tool` actions are.
> - **Nothing was run live:** not in an Electron window, not against the job APIs, not CDP upload.
> - **No full regression:** the full `run-all` comparison against 0.39.271 was not run for this release.

**HANDOFF — 0.39.272 → next session** — `docs/HANDOFF-0.39.272.md`

> **Base:** `nexus.zip` (0.39.272, built on James's 0.39.271). **Map:** `docs/2026-09-27-clearglass-whole-copilot-learning-phasemap.spec` (phases A1–A5, B1, C1, L1–L5, X1). **What shipped:** `CHANGELOG-0.39.272.md`. Read `docs/CLAUDE.md` first: map first, reuse first, wire the registry, addend the specs, lose nothing.

**Remaining work, in order** — `docs/HANDOFF-0.39.272.md`

> **1. Loom map, with wires (rule 3).**
> - Create `loom/maps/clearglass-whole-map.js`, mirroring `loom/maps/agent-memory-map.js`.
> - Add its FILES to `loom/bootstrap.js` in both places: the scan exclusion and the `map…(driver)` call.
> - Components and their real edges:
>   - `clear-glass/src/ipc/handler-registry.js` ← required by `clear-glass/src/ipc/bridge.js` (install) and `agent-routes.js`
>   - `clear-glass/src/ipc/agent-routes.js` ← `ipc/bridge.js`; it requires nothing, and its deps are injected
>   - `clear-glass/src/page/reader.js` ← `driver/index.js` (`_readPage`)
>   - `lib/cg-learning.js` → `cortex/memory/jaa-db` (id `nexus.cortex.jaa-db`); ← `lib/agent-tools/tools/clear-glass/browser.js`, `lea …

### snap-0703 — v0.39.273 — 2026-09-27

**HANDOFF — 0.39.273 → next session** — `docs/HANDOFF-0.39.273.md`

> **Base:** `nexus.zip` (0.39.273, built on 0.39.272).
> **Map:** `docs/2026-09-27-idearium-codebase-toolkit-phasemap.spec` (CB1–CB6, each gate with its proof).
> **Contract:** `docs/code-intel.spec`.
> **What shipped:** `CHANGELOG-0.39.273.md`.
> 
> Read `docs/CLAUDE.md` first.

**Next for the codebase toolkit, in order** — `docs/HANDOFF-0.39.273.md`

> 1. **Live, with a real small model.** On James's machine:
>    - Open a repo, and on its Agent tab ask: *"find where X happens and change it to Y, then check it"*.
>    - Watch that the agent calls `code_search`, then `code_chunk`, then `code_edit`, then `code_check`.
>    - Watch the review-mode stacking: after two edits there should be one pending inject.
>    - Nothing here was run against a real model. The tools ran against the real RepoLayer and inject trail, a real HTTP server, and a sandboxed live Idearium.
> 2. **Older hats.** A hat forged before 0.39.273 gets the eleven code tools on its next persona refresh (`toolsAdded` in the result; nothing is removed). Until that refresh, in `project` sc …

### snap-0707 — v0.39.276-r1 — 2026-09-28

**Not done** — `CHANGELOG-0.39.276.md`

> - The second option (a separate coder hat linked to the original) is not built. A coder hat with its own persona grounded in the code repo's index would need its own refresh and would drift from the original's; say if you want it.
> - The original's persona is grounded in the original repo's index. If the code repo's agent forges the original's hat (the original had none), that persona says "not indexed" until the original repo refreshes it.

### snap-0711 — v0.39.279 — 2026-09-29

**Not done** — `CHANGELOG-0.39.279.md`

> - Loom: the new files are wired by the source scanner through their require()s; the HTTP edges (Clear Glass → Eros
>   /api/input, desktop.html → the VM websocket) are not hand-mapped yet.
> - Staging S2 onward (the heal loop landing on staging, the verify gate, score, promote dial, rewind, feedback).
> - Moving per-repo settings out of cortex's store into idearium's (the sovereignty map's plan) — the console reads and
>   writes them where they are today.

### snap-0712 — v0.39.280 — 2026-09-29

**Not done / not proven here** — `CHANGELOG-0.39.280.md`

> - No real Electron window, WHPX host or VM was run in this environment; no live ChatGPT/Claude login page was checked.
> - "spec … not found" when building the ERAVOS code spec (James's screenshot) was NOT reproduced here. What was fixed is
>   around it: the failed branch (git's real reason now shown, no CRLF noise) and the provider it fell to. If it recurs,
>   the spec folder under idearium's specs root is missing for that uuid — that is the next thing to look at.
> - Staging S2 onward (the heal loop on staging) is still open in its own map.

### snap-0713 — v0.39.281-r1 — 2026-09-29

**Not built, on purpose** — `CHANGELOG-0.39.281.md`

> Three things were not built, and I told James so before mapping: making provider-chat jobs look like a person typing
> (human timing forced on every job, a mandatory semantic randomizer, injected decoy questions). Their purpose is to get
> past ChatGPT's and Claude's automated-use detection. That goes against those providers' terms, and James's own account is
> what is at risk. What already existed is left exactly as it was: the optional 'reword' prompt block (off by default) and
> `guardian/lib/eros-typist.js`. The economy's answer to the sign-outs is limits: automated load on a browser account is
> bounded, spaced, kept out of quiet hours, and visible.

**Not done / not proven here** — `CHANGELOG-0.39.281.md`

> - No live ChatGPT or Claude account was run against the limits. Whether they prevent sign-outs is untested; the limits make
>   the load visible and bounded, and nothing more is claimed.
> - Token counts are estimates (`estimate-v1`), not a vendor tokenizer. Learned limits say how many records they rest on.
> - No real ErosmancerOS or Chrome was driven here. The workbench was tested against a fake built to the shapes in
>   `server.ts`, and EC9 against a fake driver.
> - The router orders builds only after `minRecords` (20) build outcomes. Until then, the fixed chain applies.

### snap-0716 — v0.39.283 — 2026-09-29

**What to say to start the next session** — `docs/2026-09-29-handoff.md`

> > Read docs/CLAUDE.md, docs/2026-09-29-handoff.md and docs/2026-09-29-nex-node-store-phasemap.spec. Continue on branch claude/vibrant-edison-n2f9es from 0.39.283. Next: register or archive the ~66 unregistered test files (N19), then N24 (census every JSON writer → node types), then N26 (a work surface from interaction contracts). Map before build, stage explicit paths only, never commit data/**, keep the full run at 0 unregistered failures.
> 
> To import your 700 zips (N27 is built): from inside the NEXUS checkout, `node cli/import-history.js <folder of zips> --dry-run` to see the order, then the same without `--dry-run`. It prints the one merge that joins the history under your branch.

### snap-0722 — v0.39.299 — 2026-10-01

**What is not done yet (said, not hidden)** — `CHANGELOG-0.39.294.md`

> - **The old spec builders are still in place.** "Completely destroy the spec builder" will be done as retire and archive (§0.3), in UI12, once the workshop has carried real specs.
> - **The stations after the workshop are mapped, not built.** Architect (AR2), CODEX (CX0), the destroy-and-rebuild blueprint (BP1) and the one entry point (PL1) show in the workshop's station strip, dimmed.

### snap-0723 — v0.39.300 — 2026-10-02

**Mapped, not built** — `CHANGELOG-0.39.300.md`

> `docs/2026-10-02-fractal-graph-any-size-agent-phasemap.spec`:
> - FG1–FG6:
>   - one tree from system down to symbol;
>   - chunking by a token budget taken from the agent;
>   - summaries up the tree;
>   - context packed for any size of agent;
>   - recursive build;
>   - the missing graph relations, and fractals fed into the lattice.
> - WS5: the whole spec workshop, "huge, not a little fragment".
> - UV1: versioned UIs in compartments. An .html file opens in a popout, at any version.

### snap-0730 — v0.39.336 — 2026-10-05

**Not done** — `CHANGELOG-0.39.328.md`

> - **`.node` types.** The build context is not recorded as a node. `.injection` exists for exactly this ("what was prepended to a dispatch and why"), but its schema is copilot's call-model shape. A build-context record needs either a widened schema or its own type — James's call.
> - Recipes and crystallisation (MR7/MR8), the containment tree and `contextFor(node, budget)` (FG1–FG5): still mapped, not built.

**Not done, said** — `CHANGELOG-0.39.329.md`

> - `docs/2026-09-27-components-store-and-atlases-phasemap.spec` doesn't parse as YAML (line 24). This is pre-existing and unchanged here; the addendum is added in its own list.
> - `.node` types: the build context is still not recorded as a node. `.injection`'s schema is copilot's call-model shape; widening it or adding a type is James's call.

**Open questions for James** — `CHANGELOG-0.39.330.md`

> - **VP1/VP4:** what confidence counts as "proven"? The proposal is 0.8. And how many independent passes make a crystal? The proposal is 3, WARP's own rule.
> - **VP3:** may the repo lens's hypotheses about you show in Settings → Agent, or only in copilot's person model?
> - **VP6:** should every test environment be the Debian VM even when the first setup takes 10–40 minutes, or should tests use the process sandbox until it's set up?

### snap-0738 — v0.39.360 — 2026-10-05

**SB31: every new repo is the skeleton, and the idea slots in** — `CHANGELOG-0.39.359.md`

> **With the skeleton, the agent plans only the slot.** The slot is `lib/`, `tests/` and `ui/`: components, each with a capability and commands. Anything planned outside it is refused, with the reason.
> 
> **Slotting a component in needs no dispatch.** It writes:
> - the component's registry entry;
> - its component, capability, command, event, route and hook nodes.
> 
> Only the component's own code is left to build. Its purpose line names the functions it must export.
> 
> **Where the skeleton is used:**
> - **Codegen** (`POST /api/spec-engine/specs/:uuid/codegen`):
>   - If the spec has a registry, the code repo is the skeleton with that registry slotted in (`skeleton + registry`, no agent asked).
>   - Otherwi …

**Follow-up fixes in the same release (from the full run: 5503 passed, 36 known gaps, 6 new)** — `CHANGELOG-0.39.359.md`

> - **The skeleton is marked as a template.** `cos/archetype/nexus-system/.template-tree` tells Nexus's own censuses to skip it:
>   - the event-contract check: its events belong to the systems built from it;
>   - the writer census: a `docs/nexstore-writers.yaml` rule, like `loom/templates/`.
> - **Undeclared events and writers from earlier releases are now declared:**
>   - three idearium events in `idearium/event-taxonomy.cjs`: `workshop.template.saved` and `.removed` (0.39.357), and `repo.agent.tool`;
>   - the writers added since the census was last run.
> - **ICU-007 no longer flags a browser script.** `ui/js/arch-canvas.js` exports only when a `module` exists, and Node never loads it. It had failed …

**Not done** — `CHANGELOG-0.39.359.md`

> - **The workshop's bare repo is unchanged.** It is a document, not code; its code repo comes from codegen.
> - **The DAW test project isn't re-planned.** It is a from-scratch project; nothing ties it to Eravos. Run codegen on its spec again (`again: true`) to get the skeleton with the DAW's own components slotted in.
> - **`ui/` isn't generated.**

**James's latest direction (do this next)** — `docs/HANDOFF-2026-10-06.md`

> > "need to stop phase mapping and build all the idearium phases. newest ones are priority. … need to know what agents coded what. i dont know if that was gemini or who it was. nexus is supposed to learn the agents limits and strengths overtime. dynamically route."
> 
> 1. **Stop mapping and build.** Order, newest first:
>    - finish SB51 and SB50;
>    - build SB46–SB49;
>    - then the remaining OPEN phases in the idearium maps, newest map first.
> 
>    `docs/*-phasemap.spec` sorted by date gives the order. The Plan bar showed 349/928 done.
> 2. **Show who coded what.** Every `idearium_phase_runs` row already records `provider`, `rung` and `attempt` (index.js:717). They are not surfaced per file or phase …

**Follow-up, same day: the first proposal from a real phase build was destructive** — `docs/HANDOFF-2026-10-06.md`

> BL15 (`BL15_agent_tools_tree_restructure`, run dv0-bo2y) replied, and the reply became a proposal for
> `lib/agent-tools/index.js`. Its diff was `-1,648 +1,1`, meaning the whole file was replaced by one line: its own path.
> 
> **Why it got through.** The agent's code block held only `lib/agent-tools/index.js`. That parses as JS (a division),
> so the `code.write` gate let it through.
> 
> **The fix.** `lib/repo-inject.js` `_collapses` (exported as `collapses`) now refuses an agent block when either:
> - the block is only a path, or
> - it would cut an existing file of 40+ lines to under a tenth of it, and under 20 lines.
> 
> `test-repo-inject` covers it (83/83).
> 
> **James: Reject that proposal.**
> 
> **Still to d …

### snap-0739 — v0.48.0-r1 — 2026-10-07

**Proven on the code it proposed (SB52)** — `CHANGELOG-0.39.361.md`

> - **The bug.** Driving the pipeline end to end showed a phase marked *proven* while both its files on disk were empty placeholders. In review mode the code is only a proposal, and running an empty test file passes.
> - **The fix.** The proof now runs in a scratch copy of the repo, with this run's proposals laid over it (`lib/proof-overlay.js`). Your files are never touched before Apply.
> - **What the Plan says:** "✓ proven on the proposed code (2 files) — nothing is in your files until you Apply".
> - **Very large repos** (over 300 MB) are proved on disk, and the Plan says so.

**Mapped, not built** — `CHANGELOG-0.39.376.md`

> In `docs/2026-10-07-compartment-control-and-activity-phasemap.spec`, each phase reuses what already exists:
> - **UN1:** Nexus's own surfaces in the interaction field.
> - **SP1:** one spotlight.
> - **DC1:** noticing a click that did nothing.
> - **DX1:** diagnosing it.

**Not done** — `CHANGELOG-0.47.0.md`

> - A proposal card doesn't yet link to the task that wrote it, because proposals don't record a task id yet.

### snap-0741 — v0.51.0 — 2026-10-08

**Not built** — `CHANGELOG-0.51.0.md`

> - **Planning only the picked sections.** The pipeline plans the whole spec, and a replan does not carry the old map's statuses over. This is said here, not hidden.

### snap-0742 — v0.55.1 — 2026-10-09

**The shelf (later — kept, visible, not the roadmap)** — `docs/roadmap-triage.md`

> | map | open | why |
> |---|---|---|
> | 2026-09-02-nexus-vision-master | 56 | his own words on it: "some ideas to map to phasemaps. do not build." — the vision shelf |
> | 2026-09-11-sovereign-node-architecture | 29 | architecture — later |
> | 2026-09-28-graph-build-context-settings-memory | 29 | graph per project — after the loop |
> | 2026-09-01-living-model-and-autonomous-pipeline | 26 | autonomy comes after the loop works by hand |
> | 2026-09-05-observability-sovereignty-and-agent-mesh | 26 | observability — later |
> | 2026-09-19-cortex-to-intelligence-and-versionium-consolidation | 20 | consolidation — later |
> | 2026-09-29-nex-node-store | 20 | storage performance — when it hurts |
> | 2026-08-23-b …

### snap-0743 — v0.59.5 — 2026-10-10

**Not done here, said** — `CHANGELOG-0.55.2.md`

> A pinned agent (Settings → chatgpt) still has no next rung when it fails. The climb to the next agent lives in Idearium's repo agent, for the copilot position only, next to three other climbers (the build ladder, copilot's door, lifeline). Moving every climb into one place is ME5 in the one-model-engine map (RAID chooses), not a fifth patch.

**Mapped, not built** — `CHANGELOG-0.57.0.md`

> - **`docs/2026-10-10-shape-of-nexus-phasemap.spec`:**
>   - **Options everywhere** (OP1 for the other systems).
>   - **The Clear Glass interaction field** injected once per page, not once per frame (google.com).
>   - **One source of truth for the browser:** the HTML holds the structure, `browser.js` only the behaviour.
>   - **The Nexus tutorial** (copilot, spotlight, the field) and the Fiverr tutorial in the browser.
>   - **Every claim says how it's known** (epistemology).
>   - **COS as the empirical layer:** a claim is verified only by an experiment run in a compartment.
>   - **One home for every concept.**
>   - **"Explain this" anywhere.**
> - **`docs/2026-10-10-test-attack-qa-catalog.md`:** about 90 …

**A raw idea dump** — `CHANGELOG-0.59.3.md`

> `idearium dump <text>` drops an idea into the Void, verbatim. With `--lines`, it drops many at once, one per line, through `POST /api/void/ideas`. Copilot can do the same through `nexus.command`. `tests/modules/test-idea-dump.test.js` 3/3.

### snap-0744 — v0.60.0 — 2026-10-12

**Deferred (TN5)** — `CHANGELOG-0.59.11.md`

> A question that names Nexus but matches no command could give the model `context-atlas` search hits as grounding. That search walks about 70 tables on every message in Clear Glass's main process, so it needs measuring first.

### snap-0752 — v0.60.23 — 2026-10-13

**Mapped next** — `CHANGELOG-0.60.15.md`

> CT1 is dynamic chunking: a gate that's too big for its agent's context, or that failed twice, splits into child gates that are recorded in the contract.

**Noted, not done** — `CHANGELOG-0.60.20.md`

> The coder wrote a `start:lean` npm script, which he rejected ("i dont do cli"). The tool call that held it was interrupted, but it had already been written. It was removed before this commit and never shipped.

### snap-0753 — v0.60.47 — 2026-10-15

**Not done** — `CHANGELOG-0.60.30.md`

> Idearium's coder prompt doesn't read `feedback` yet. It's passed through; putting it in the prompt is RQ3's other half. The live run on his PC is still the proof that matters.

**Not done** — `CHANGELOG-0.60.31.md`

> - Splitting or asking about a low-confidence intent (CK-236).
> - The callers don't send `needs` yet, so they get only the window and readiness checks, and only when they pass a message or a size. Passing each build brick's packet size is the next small step.
> - PF1 (a tab per profile) is next.

**Not done** — `CHANGELOG-0.60.32.md`

> - **Resumed chats.** A repo agent's resumed chat belongs to the account that started it. A different account's tab can't open it. This was already true when switching accounts on one tab (since 0.60.2). The fix is to key chats by account; it isn't built.
> - **Refreshed sign-ins.** A profile tab keeps its refreshed sign-in in its own browser storage. It isn't written back to the vault.
> - **Not yet run live.** The Clear Glass half is tested with stand-ins, not driven live on your machine. That's the next proof.
> - **Not built:** compartments as profiles (TB1/HM0), and CK-241 (a check that hat, profile and tab agree).

**Not done** — `CHANGELOG-0.60.33.md`

> These checks from the catalogue's section 13 are next. All are deterministic, and each is one runner file:
> - CK-231 half-states;
> - CK-234 unhandled branches;
> - CK-235 untested surface;
> - CK-237 free-sentence conditions;
> - CK-239 dangling edges;
> - CK-245 a retry changes something.
> 
> Also not done: RQ18's test and attack intents. CK-248 doesn't read `docs/*.spec`: those are YAML with markdown addenda, not one language.

**Mapped (not built yet)** — `CHANGELOG-0.60.35.md`

> `docs/2026-10-15-one-contract-raid-releases-phasemap.spec` holds the plan, in build order. RD0 comes first because the later phases build on it.
> 
> | phase | what it does |
> |---|---|
> | RD0 | RAID runs the `.contract` (its gates before, its verdict and self-heal after) |
> | RD1 | every build goes through RAID |
> | BR1 | bricks on every path |
> | GS1 | a Versionium snapshot per gate, rewind a failed brick to its last good state, compare a gate now against what passed |
> | BR2 | splitting recursively, up to a depth limit |
> | RN1–RN3 | releases and tags in Versionium, changelogs written from the commits, a Releases view in Idearium |
> | AT1 | atlases and system specs generated from releases (they're 15 …

**Next** — `CHANGELOG-0.60.36.md`

> RD1: every build goes through RAID. Phase builds and spec-chunk builds call `runContract` instead of running the scheduler themselves.

**Next** — `CHANGELOG-0.60.38.md`

> GS1: a Versionium snapshot at each gate. A failed brick is rewound to its last good state before it retries, and you can compare a gate now against what passed.

**Next** — `CHANGELOG-0.60.39.md`

> BR2: splitting recursively, up to a depth limit.

**Not done** — `CHANGELOG-0.60.40.md`

> Splitting by an existing file's code units (lib/chunker). A step says what to do, not where in the file, so this has to wait for a planner that names the units.

**Next** — `CHANGELOG-0.60.40.md`

> RN1: releases and tags in Versionium.

### snap-0754 — v0.60.68 — 2026-10-15

**Next** — `CHANGELOG-0.60.49.md`

> - **SP2:** the userscripts' field map finds the input, send button and reply by address, with CSS as the fallback.

**Not built, said plainly** — `CHANGELOG-0.60.55.md`

> `clear-glass/src/chats/crawler.js`, the part that opens a background tab, scrolls and reads. Until it exists the switches are saved and do nothing; the Settings page says so at the top. Whether long chats load lazily, and how each provider reacts to automated visits, are unverified. Nothing here was seen in Electron.
> 
> Context read for this release: the Clear Glass atlas, `chat-ledger.js` (the DOM-mutation ledger that already exists and the crawler will feed), the window and settings code, and the person model.

**Not done (mapped in docs/2026-10-15-macro-node-recording-phasemap.spec)** — `CHANGELOG-0.60.57.md`

> MR4-MR6: the chat-listener process (list chats, open one, scroll and read) as per-provider recorded nodes and automations. That is the part of his message about "the whole process"; the coder's reading of it is marked to confirm in the map.

**Mapped, not built (NP16, docs/2026-10-15-clear-glass-network-posture-phasemap.spec)** — `CHANGELOG-0.60.59.md`

> A quarantine in front of the existing downloads pipeline: files from a protected route land in the compartment, show in the Library marked quarantined, get cheap deterministic checks, and are released by a click, a CLI verb or a rule. A folder plus checks, not a VM: stated in the map.

**The encrypted container (mapped as NP19, not built)** — `CHANGELOG-0.60.60.md`

> Worth building. It unlocks proxy credentials and makes the kill switch instant: destroy the key and the container is unreadable even if deleting the files is slow. Built from the project's own `vault-key.js` and Node's AES-256-GCM, no new cipher. One thing must differ from the existing vaults: they fall back to a **hardcoded key** when the OS keystore is unavailable. The container must refuse to open instead. It protects data at rest; it does not stop malware running as him. Details and limits are in the map.

**Next** — `CHANGELOG-0.60.65.md`

> - **MP3**: a build's first request carries this mapping as an editable prompt block, so the agent starts with the
>   context instead of finding it with tools. Needs SF1 (intent blocks).
> - **MP4**: the model mapper only for the phases left `none`.

**Next** — `CHANGELOG-0.60.66.md`

> WB0–WB2 (every build through WARP), SF4 (compile a collected spec, zero tokens), MP4 (a model only for phases nothing
> maps), IS1 (intent settings per repo).

### snap-0756 — v0.60.96 — 2026-10-16

**Not done, said** — `CHANGELOG-0.60.79.md`

> - The other in-memory jobs (phase mapping, proofs, indexing in `idearium/api/index.js`) still forget themselves at a
>   restart: TL2.
> - A spec an agent writes over many replies is still on disk only at its final write: TL1.
> - The non-contract path (`routing.contract_build: off`) still restarts its file loop at the first file. It is off by
>   default.

**Not done** — `CHANGELOG-0.60.80.md`

> - No live run against his own Idearium yet.
> - CE7 (AI editing by lines or chunk) is next in the build order. It will read this surface for its range.

**Not done (said, not hidden)** — `CHANGELOG-0.60.82.md`

> - **CE9's Clear Glass mesh mount.** The views are Idearium page scripts; mounting them in Clear Glass's renderer is
>   separate work.
> - **"Retry from step n" and "send to another provider".** They have no route yet.
> - **"Every check with its last result".** The runs panel shows the current plan step's gate bar, not the full list
>   of checks.
> - **CV5 (universal versioning)** waits on his answer to CV0. **CE11** belongs to the automatic-tracking map.
> - **No live run on his machine yet.**

**Not built yet** — `CHANGELOG-0.60.94.md`

> - **FN1:** every entry point (the Agent tab, copilot, the officiator, phase builds) goes through the funnel.
> - **FN2:** what is missing gets made first (the spec, a phase on his yes, the chunks).
> - **FN3:** each answer is saved as a node.
> - **FN4:** the screen.

### snap-0757 — v0.60.98 — 2026-10-16

**Not built** — `CHANGELOG-0.60.98.md`

> - **Getting Electron past Google's "browser may not be secure".** Google refuses sign-in in embedded browsers on purpose (it
>   reads the browser's identity, not a cookie). Making Clear Glass pass means disguising it as Chrome; that is a spoof, fragile, and
>   it is Google's check, so it is not here. ChatGPT does not need Google: its email sign-in (password or emailed code) works in the
>   window, and ChatGPT also works signed out.

### snap-0759 — v0.60.110 — 2026-10-16

**Not built** — `CHANGELOG-0.60.101.md`

> The Android and Apple compartments themselves (MB2-MB4), the linters/fuzzers/mutation tools in the matrix, tree-sitter for languages with no installed compiler.

**Not done** — `CHANGELOG-0.60.103.md`

> test-code-tab CT-11, CT-15, CT-20, CT-22, CT-31 still look for regions that moved to other views; they need csView('changes'|'runs'|'plans') before their selectors.

**His idea, and the coder's reading** — `CHANGELOG-0.60.104.md`

> The idea is his: COS holds the canvas, and each tool is a nested compartment. It fits what both sides already have.
> - COS already nests (`lib/cos-bridge.js` createCompartment with a parentId, and tree()).
> - His ERAVOS already keeps "the canvas and the tools … separate". A tool is a sealed folder with a manifest, declared
>   ports and declared permissions.
> 
> The coder's reading, to confirm: the tool's compartment is the unit Nexus **builds, versions and tests**. The tools still
> run together in the one canvas page, because audio has to stay sample-accurate.

**Not done (said, not hidden)** — `CHANGELOG-0.60.105.md`

> - **Failing before this release, not touched:**
>   - EC-05: `idearium.phase.mapped`, `idearium.repo.released` and `cos/app/controller` events are undeclared on main;
>   - CL-07 needs a running Guardian.
> - **Lessons are per phase.** A lesson per agent across phases (`lib/agent-notes.js`) is not wired.
> - **`rejectionModes` and data files.** For yaml-like data it uses the evidence's declaration list, which is not
>   meaningful there. The screen (RL3) catches those by keys before they reach him.
> - **From his log, not fixed here:**
>   - the stale guardian organism-queue node command;
>   - the RAID contract that failed with "no real repo provisioned".
> - **No live run on his machine yet.**

**Not done (said, not hidden)** — `CHANGELOG-0.60.106.md`

> - **Not proven against Google live.** Electron and Google cannot run in the build container, so his next sign-in is the
>   proof. If Google still refuses, the log says `[google-signin] Google refused the sign-in page anyway`. The next step
>   is then mapped: present as Google Chrome, with brands, through CDP `userAgentMetadata`.
> - **Clear Glass still runs with `--remote-debugging-port`.** ErosmancerOS needs it, and it cannot be switched per page.

**Not done (said, not hidden)** — `CHANGELOG-0.60.107.md`

> - **No live run on his machine yet.**
> - **Older builds have no Context card.** Only builds started from this version record their context, so the card says
>   "no build has recorded its context yet" until the next ▶ build.
> - **To confirm with James:**
>   - the Context card's parts;
>   - whether the panel should stay docked open like the sidebar.

**Not done (said, not hidden)** — `CHANGELOG-0.60.108.md`

> - **Not proven against Google live.** His next sign-in is the test. A refusal is logged as `[google-signin] Google
>   refused the sign-in page anyway`.
> - **The TLS proxy (`:7703`) is broken for every other HTTPS host.** It wraps the browser's TLS in a second TLS
>   connection. Nothing uses it today. Fixing it or archiving it is his call.
> - **Clear Glass keeps `--remote-debugging-port 9333`.** ErosmancerOS needs it. Nothing attaches to a sign-in page now.

**Not done (said, not hidden)** — `CHANGELOG-0.60.109.md`

> - **The HTTP/2 fingerprint stays Chromium's.** The helper relays h2 frames as they are.
> - **Client certificates** cannot pass local interception (rare).
> - **The Windows binary is cross-compiled and was not run here.** The Linux build of the same source is what the tests
>   ran.
> - **Not yet tried against a real bot wall from his machine.**

**Not done, said** — `CHANGELOG-0.60.110.md`

> - The pending `lib/intent-chain.js` on his machine is still waiting for Apply. Reject it: IH1's real build waits on his
>   answer to IH0a (one intent list with aliases, or three).
> - "copilot gave no route: timed out after 5000ms" in the agent pane was not looked into.
> - TB2/TB3a/TB4a (save every tool call, recall exact repeats first) and TB7 (the runs graph with zoom) are still open.

### snap-0760 — v0.60.124 — 2026-10-17

**Not done, said** — `CHANGELOG-0.60.118.md`

> - Not seen on his machine yet; the tests drive the real files in Clear Glass, not his running page.
> - Artifacts are not tied to a repo: Guardian stores them by chat.
> - A procedure replays tool calls only, not chat turns or gate moves.

**Not done, said** — `CHANGELOG-0.60.119.md`

> - Not run on his machine.
> - RA1 only orders agents that are already on the ladder; ME5 (one chooser for all of Nexus) is still open.
> - Behaviour tests (TF2) and his bad outputs, read and classified, are next.

### snap-0761 — v0.60.135 — 2026-10-17

**DG1 — a phase is not built while what it depends on is open** — `CHANGELOG-0.60.125.md`

> - **Backend:** `lib/phase-deps-gate.js` decides what counts as open.
>   - Open: a decision in the map's `decisions:` that has not been made, and a phase that is not complete.
>   - Not open: a decision that was made, a phase that is done, and a name found nowhere. A name found nowhere is said,
>     not blocking.
> - **Route:** `POST /api/repos/:uuid/phases/build` refuses with 409 `DEPS_OPEN`. The refusal names each decision by its
>   question, for example: "PC1_the_point_first waits on PC0b_first_kinds (a decision still OPEN: "which purposes are the
>   first piece kinds?")…". `anyway: true` builds it anyway, and every row of that run records the override as
>   `depsOverride`.
> - **Command:** `repo pha …

**Next (owning phases)** — `CHANGELOG-0.60.131.md`

> - **SB22 and P36:** each command, route and tool carries its events as nodes, with an event ledger per registry.
> - **DB16 and P8:** a registry for each system that has none, so its nodes can exist.
> - **The .store node (STORE_IS_A_NODE).**

**Mapped, not built: the infrastructure migration** — `CHANGELOG-0.60.132.md`

> `docs/2026-10-17-infrastructure-migration-phasemap.spec`. The target is what the architecture spec states, in the
> template's shape. The coder's reading of "first principles nexus", to confirm: measure before moving, one owner per thing,
> the registry is the door, the least depended-on first, nothing lost, and Nexus left running after each step.
> 
> **The census, measured against the template's tree:**
> - No system has the full shape. Guardian and copilot come closest, missing only their own `tests/`.
> - Five systems have no registry, and nine have no event taxonomy.
> - Every test lives in `tests/modules`; no system has its own `tests/`.
> - cortex is reached 155 times by other systems, 70 of them for …

**Not done yet** — `CHANGELOG-0.60.134.md`

> - **Moving a system in (DB11):** running its process inside its compartment, with its folder mounted read-write. Next
>   for nexus-healer, the first sealed one.
> - **`cli/compartments.js`:** writes the older `nexus.compartment/1` manifests with its own copy of the crossing scanner,
>   the third one. It is redundant now and is recorded for IM2. It is not removed here.

### snap-0766 — v0.60.167 — 2026-10-19

**Next in layer 1** — `CHANGELOG-0.60.156.md`

> - **GM4:** the node lattice, and with it the lattice row starts answering.
> - **LM0:** stable wire ids.
> - **GW5:** tool parity.
> - **QA1:** the remaining catalogue runners.
> - **RD0/RD1:** RAID's own contract and commands.

**Next in layer 1** — `CHANGELOG-0.60.157.md`

> - **LM0:** stable wire ids.
> - **GW5:** tool parity.
> - **QA1:** the rest of the catalogue: CK-234–236, 238, 240–246 and 249–251.
> - **RD0's other half, and RD1's read commands** (status, queue, decide). RD1's axiom and gate editing waits on his call,
>   `decision_axiom_edit_authority`.

**Note (for a later pass, his security question)** — `CHANGELOG-0.60.160.md`

> The route rules here are a blocklist, not a scope allowlist. The self-hardening idea we discussed — a target must be declared
> in-scope before an agent crawls or ingests it, and the `transport` path gated the same way — is not in this release; this only
> surfaces the transport that already existed.

**Next** — `CHANGELOG-0.60.163.md`

> DC1 — dynamic chunking at plan time, sized to the fitting model (using `fittingModels`), so a small local model gets a unit it can do.

**Next** — `CHANGELOG-0.60.164.md`

> AB1 — the economy-wait-then-retry James flagged (his build stuck "cancelled · economy holds chatgpt 299 s"): a rate-limit hold
> should **wait and retry** when the slot frees, not cancel. That's the resume lever, and it unblocks the currently-stuck build.

**Next** — `CHANGELOG-0.60.165.md`

> The remaining AB1 half — phase→phase auto-advance (build the next ready phase on success) — and CT1 (COS test runner).

**Next** — `CHANGELOG-0.60.166.md`

> GQ1 — the SISO quality-stream: for a built unit, fan out the covering test (run through this door, in COS) + shape + catalogue +
> lint, each a gate, residue named; then GQ2 makes the brick gate require behaviour, not just shape.

**Open (mapped next, from the same log)** — `CHANGELOG-0.60.167.md`

> Per-**chunk** retry (not just per-phase), and gating/DAG at every **gate · level · step** — James: "should be able to retry
> per chunk, not just phase. we should do the gating for the pipeline, dag on every gates, level, step?"

### snap-0769 — v0.60.180-r1 — 2026-10-20

**Not done yet** — `CHANGELOG-0.60.177.md`

> Nothing has been moved in his tree or in the repo; DL2 (the resolver) and DL3 (rewiring) come first. DL4–DL7 are specced and open.
> The readings to confirm are listed in the map: what "cortex v2 into server.js" means, the person model staying copilot's, and
> reflection → cortex.

**Not done, and said** — `CHANGELOG-0.60.178.md`

> - Electron, tor and the network are not in this sandbox, so the live path is unverified until it runs on his machine with the Clear
>   Glass driver. The Tor Project's Moat endpoint could not be reached from here either (the proxy refused it).
> - **A problem for him.** Ordinary agent windows also load their page in the default session, so route rules and personas there
>   reach the shell, not the page. Fixing that moves their cookies and sign-ins to a new session, so it is his call. Only routed
>   windows are fixed here.
> - Downloads from Snowflake windows still go to the normal Downloads folder (NP16 quarantine is open). The driver's own
>   `onBeforeRequest` blocking, when used, still replaces the …

**Not done, and said** — `CHANGELOG-0.60.179.md`

> - Electron's main process, tor, a live qBittorrent and real screen capture are not in this sandbox. Content protection, the kill switch
>   firing on a real drop, and the qBittorrent hand-off are built to their documented APIs and tested against fakes. They are unverified
>   until they run on his machine.
> - Saved Firefox passwords are not imported. They need Firefox's own key (and its primary password if one is set), and that is not
>   built; Settings → Import says so. History is not imported either.
> - Ordinary windows still load their page in the default session (the 0.60.178 problem, still his call).

**Not done, and said** — `CHANGELOG-0.60.180.md`

> - His running app is on `main` (0.60.176). 0.60.177–0.60.180 are on the branch, so none of this is in the window he is using until it is
>   merged.
> - Electron's main process and live providers are not in this sandbox. The hub is tested against the documented provider API, not a
>   live Guardian.

**3. What to look for on his next run (SP5_title, looking-glass-bundle-v0.4)** — `docs/HANDOFF-2026-10-19-verify-first-and-dag.md`

> 1. `repo dag looking-glass-bundle-v0.4 SP5_title` first — the new gate can refuse a phase whose map has a dangling depends_on.
> 2. Build SP5: expect a `verified` row for `lib/title.js` and NO "Write ONE file: lib/title.js" / "WRITE THE TEST FIRST" jobs.
>    If the test fails against title.js, the brief now carries the failing assertion; if the plan says `title() -> string` and the
>    test calls `title(' Looking Glass ')` that is the plan/test conflict AQ1–AQ3 is for (still unbuilt).
> 3. The "Gemini said tests/…" folder should move to `.nexus/archive/path-guard/…` and leave the Phases panel's "used by".
> 4. No orchestrator/Guardian EPERM exits; idearium's "node registry" line within seconds of it …

### snap-0771 — v0.60.192 — 2026-10-21

**Not done, said** — `CHANGELOG-0.60.183.md`

> - Not run in a real Electron window here; there is no display in this sandbox. To confirm in your window:
>   - the cursor IPC's point;
>   - `insertCSS` element hiding;
>   - `view-source:` opening in a tab;
>   - the first list download through `net.fetch`.
> - The ⬇ panel in your screenshot lists UUID-named "completed · 0.0 MB" rows. That was not part of this ask and is not touched here.
> - Third-party is judged on the last two labels of a host, or three under a known suffix such as co.uk. That is an approximation of the
>   public suffix list.

**Not done, said** — `CHANGELOG-0.60.184.md`

> - Not run in a real Electron window here: the system picker and Settings → Network's import buttons still need trying in your window.
> - One import is capped at 5,000 sites, because each is a condition in the window's proxy script. The rest are counted and said.

**Not done, said** — `CHANGELOG-0.60.185.md`

> - Not run in a real Electron window here. To confirm in yours:
>   - that the menu lands on the pointer on your display;
>   - Paste in the address bar (clipboard permission);
>   - the account list on a site you are signed in to.

**Not done, said** — `CHANGELOG-0.60.186.md`

> - Not run in a real Electron window here. To confirm in yours:
>   - `registerPreloadScript` on your Electron build;
>   - capture on a real sign-in;
>   - the key showing after a sign-in redirect.
> - A login form inside a cross-site frame (some single sign-on pages) is not reached: the page script runs in the top frame.

**Not done, said** — `CHANGELOG-0.60.187.md`

> - Not run on your Windows machine. To confirm there:
>   - the activity log shows the escalation as "for diagnostic.escalation", at most once per sweep and deferred while a build runs;
>   - no new "Gemini said" folders appear.

**Not done, said** — `CHANGELOG-0.60.188.md`

> - **The screen.** The census has no screen yet. It is the data for BX2/BX3's Flow view, which draws each phase's verdict. Its routes and
>   command come first, by the order of delivery.
> - **Your "5 in a row".** The census does not explain it. The run records (who started each run) will, and that trace comes next, before
>   BX5 (the node controls) and BX7 (auto-advance).
> - **The limits of "not built".** It means no record names the phase. Work done without naming its phase id cannot be seen by this
>   census.

**Not done, said** — `CHANGELOG-0.60.190.md`

> - **Approvals that skip the `change.approved` event.** The repo's auto mode and the upload answer approve through a different door.
>   Their commits still carry the entry and still emit `version.commit`.
> - **Not run on your Windows machine.** To check there:
>   - approve a proposal, then run `repo changelog <repo>`;
>   - run `ledger out`;
>   - open the orchestrator's ledger and look for `idearium.change.approved`.

**Not done, said** — `CHANGELOG-0.60.191.md`

> - **Not run on your machine.** To check there: reload a Claude tab while it is answering. The job should complete from `stream`, and the
>   activity log should say so. It should not re-send, and it should not fail with "pick the reply".

**Not done, said** — `CHANGELOG-0.60.192.md`

> - **Not run on your machine.** To check there: reload a Claude tab while it is answering. The job should complete from `chat-ledger`, and
>   your contract ledgers should now show the reply text where they said "chat-ledger (not read)".

### snap-0772 — v0.60.195 — 2026-10-21

**3. The proposed title.js really is wrong — the gate was right** — `CHANGELOG-0.60.194.md`

> - **The bug.** ChatGPT's version lowercases, splits on spaces and capitalises each word, but never trims. So `' looking glass '` comes
>   back as `' Looking Glass '`, and both tests expect `'Looking Glass'`.
> - **The gate did its job.** It refused the change because the tests pass on the current file and fail on the proposal.
> - **What to do.** Reject it with the reason (for example "trim the input first"). The agent is told and retries with what it learned
>   (RL2).

### snap-0779 — v0.60.220 — 2026-10-23

**Not done, said** — `CHANGELOG-0.60.218.md`

> - The drain's order of strategies stays fixed: retry, respawn, fallback, then diagnostic. What's set is the tries and the waits.
> - Guardian's section doesn't include "the provider host". Its controls are already in the agents hub and Providers & accounts.

### snap-0780 — v0.60.233 — 2026-10-23

**Next** — `CHANGELOG-0.60.222.md`

> SL1: a proven, landed phase closes itself (lib/phase-close.js through the one status writer). Then SL2: done by evidence, dry run first.
> SL5 (when a proven change may land without him) is his decision: A, B or C. The coder recommends B.

**Next** — `CHANGELOG-0.60.223.md`

> SL2 closes the stale backlog by evidence: the phases whose files exist, by their own tests, with a dry run first. The loop (SL4) can
> then pick from SL0's queue and close through SL1. SL5 (may a proven change land without him: A, B or C; the coder recommends B) is still
> his to decide before SL4 runs unattended.

**Open next (the learn-loop, extended off Fiverr to general job applications)** — `CHANGELOG-0.60.225.md`

> - **JA2** — a picked field saves to site-settings (`autofill.field.<key>`) under the application's origin (reuse `selector-assign`).
> - **JA3** — on a miss, the element picker pops up (reuse `renderer/selector-check.js`).
> - **JA4** — the UI, and the IPC loads `learned` from site-settings on fill.
> - **A real Clear Glass fill** on one live listing (RemoExperts or micro1 — plain SWE forms, not assessment-gated) — his login, his machine.
> 
> ---
> 
> > **0.60.225 was used twice.** The entry above is main's (the JA line, Clear Glass autofill). The entry below is from `claude/sleepy-gates-9lc085` (the SL line), built in parallel under the same number and merged in 0.60.233. Neither was renumbered (§0.3):  …

**Open next** — `CHANGELOG-0.60.226.md`

> - **JA3** — on a miss, the element picker pops up (reuse `renderer/selector-check.js` + `selector-assign`).
> - **JA4** — the UI for the learn-loop (the fill path already loads `learned`).
> - **A real Clear Glass fill** on one live listing — his login, his machine.
> 
> ---
> 
> > **0.60.226 was used twice.** The entry above is main's (the JA line, Clear Glass autofill). The entry below is from `claude/sleepy-gates-9lc085` (the SL line), built in parallel under the same number and merged in 0.60.233. Neither was renumbered (§0.3): both are kept here, as they shipped.
> 
> ---

**Not done, said** — `CHANGELOG-0.60.227.md`

> The dry run over Nexus proposes files for 295 phases and a `depends_on` for 31, in 57 maps. They were **not written**: 57 of your
> maps at once is a cost to see first. The build already uses the same mapping in memory, so nothing waits on the write. To write them,
> press the rail button or run `repo groom nexus/core --apply`.
> 
> 233 open phases can't be placed by anything deterministic. SL8 (the agent maps them at build time) is next.

**Open next** — `CHANGELOG-0.60.230.md`

> - **JA4** — the panel: after a fill, a "pick it" per unplaced type (IPC `autofill:pick`, built), and the learned fields per site
>   with a Forget (§0.3). The UI is deferred to JA4; said, not hidden.
> - The macro home (above), and **a real Clear Glass fill** on one live listing (his login, his machine).
> 
> ---
> 
> > **0.60.230 was used twice.** The entry above is main's (JA3, Clear Glass autofill). The entry below is from `claude/sleepy-gates-9lc085` (SL10), built in parallel under the same number and merged in 0.60.233. Neither was renumbered (§0.3).
> 
> ---

### snap-0781 — v0.60.250 — 2026-10-24

**Next** — `CHANGELOG-0.60.234.md`

> - Confirm the 9 homes.
> - RF2: apply one phase at a time, staged, with the census and the tests after each move, and undoable.

**Next** — `CHANGELOG-0.60.236.md`

> The 12 folders that go into `lib/`: `cockpit`, `contracts`, `hooks`, `meta`, `sentinel`, `siso`, `ui`, `emerge`, `emergence`, `warp`,
> `nexus` and `cli`.

### snap-0783 — v0.60.265 — 2026-10-26

**What is next (his delivery order)** — `CHANGELOG-0.60.253.md`

> The UI — a panel on the BrainOS Flow canvas that lists the union and runs one — is deferred to the BrainOS build (BX), said.

**Not done** — `CHANGELOG-0.60.256.md`

> The Settings pane has not been clicked through in a running Clear Glass on his machine. The jsdom render covers the pane and both
> downloads. It does not cover the real file dialog.

**Not done, said** — `CHANGELOG-0.60.257.md`

> - **The verdict route has not been run end to end.** No test runs a real Idearium build of a phase with no files through
>   `/phases/verdict`. The RAID side and the wiring are tested; the route's handler is not.
> - **IC1 itself still needs `files:` or `conditions:`.** With them, its proof can check the work without him.
> - **The plan step needs an Ollama model on the ladder.** The run said: no planner was ready.

**Not done from here** — `_archive/2026-10-26-brave-cori-records/CHANGELOG-0.60.225.md`

> No loop was started on Nexus or on any of his projects. Starting one spends agent calls, so that is his to start: ⟳ start the loop in
> the Phases tab, or `repo loop <repo> start`. On a Nexus repo, B keeps every change for him, so the loop builds and proves, and each
> phase closes when he applies it.

**Not fixed here (proposed to him; not added as phases, per his 2026-10-21 "stop adding more phases")** — `_archive/2026-10-26-brave-cori-records/CHANGELOG-0.60.226.md`

> - **A test that cannot fail proves nothing (E1, SP1).** Run the phase's own test once against its module with every export gutted. A
>   test that still passes is reported as unable to fail, and its pass is not counted as proof. This is deterministic and needs no model.
> - **A phase spec copied from another (E3).** Flag two phases whose `does:` text matches once the name is removed.
> - **The scene that fails its own schema (E6) and the README link** are that project's to fix.

**Not done: to confirm with him** — `_archive/2026-10-26-brave-cori-records/CHANGELOG-0.60.230.md`

> The table only counts the eight correctly. Dealing with them means:
> - moving each into its home (DB17): `auth/` into `orchestrator/`, `mesh/` and `jaa/` into `guardian/`, and `siso/` beside the kernel;
> - archiving the parked four, since §0.3 says archive, not delete.
> 
> erosmancer (231 files, with its own OS spec) may be his own project rather than parked code.

**Next** — `_archive/2026-10-26-brave-cori-records/CHANGELOG-0.60.235.md`

> SV1, the stack per root (`cos/services/stack.js`): fresh configuration, its own free ports, and by default only the engines that touch
> nothing outside their root.

**Next** — `_archive/2026-10-26-brave-cori-records/CHANGELOG-0.60.236.md`

> | system | ways out | what blocks it |
> |---|---|---|
> | loom | 5 | 3 data (Cortex's jaa-db), 1 nexus-connect, 1 ollama-client |
> | architect | 6 | |
> | clear-glass | 9 | |
> 
> Two files hold most systems back:
> - `cortex/memory/jaa-db.js` (data);
> - `nexus/nexus-connect.js`. It lazily requires `intelligence/lattice`, so moving it into the kernel as it stands would be an upward
>   crossing. Its lattice use has to be cut first.

**Next** — `_archive/2026-10-26-brave-cori-records/CHANGELOG-0.60.237.md`

> EW2: the compiler's four callers outside Idearium (lib/build-pipeline.js, lib/spec-collect.js, guardian/server.js, copilot/module-builder.js)
> are designed out before EW3 moves it.

**Next** — `_archive/2026-10-26-brave-cori-records/CHANGELOG-0.60.239.md`

> EW4: the Emerge IDE into Idearium.

### snap-0787 — v0.60.285 — 2026-10-28

**Mapped (not built): `docs/2026-10-24-cos-manager-phasemap.spec`** — `CHANGELOG-0.60.279.md`

> - **MG10 categories.** A category comes from an archetype or a template, carries its schema, and has members. It is made, edited
>   against its schema, renamed and removed (archived). There is a built-in "systems" category listing each system compartment. Every change
>   goes to Versionium.
> - **MG11** the category manager and editor UI.
> - **MG12** cos.exe as the full compartment manager: a category tree, and per compartment Rewind (VM1 checkpoints, CS1 versions, Clear
>   Glass session rewind to confirm), Diagnostics, Versions, Data (through its own routes only, §5.15) and Tools. CS8 is gathered into it.
> - **MG13** CLI in the exe: a console pane, and `COS.exe <command>` headless.
> - **MG14** live …

**Not built** — `CHANGELOG-0.60.281.md`

> - **CAL0 calendar.** This is his call. The recommendation is in the map.
> - **GP0 Guardian picker.** What is wrong with it is asked.

**Not built** — `CHANGELOG-0.60.284.md`

> - **PL5:** the orchestrator running pipelines with macros and agents. Its engine needs the Clear Glass port and RAID routing (AE2/AE3,
>   open since 2026-10-25). Today pipelines run in Clear Glass's engine, the one with the browser, the macros and the agents wired.

### snap-0788 — v0.60.295 — 2026-10-29

**Fiverr gig ideas from the market — 2026-10-29** — `clear-glass/docs/gigs/ideas/2026-10-29-market-brainstorm.md`

> James, 2026-10-29: "look at all top, trending, from today, and from all time, and use that data, to brainstorm some ideas for fiverr in
> clearglass." · the same day: "do everything you can, invent, expand, anything to get fiverr operational as a source of income."

### snap-0790 — v0.60.312 — 2026-10-30

**Proposed: one door for every system, the same three routes (to confirm)** — `versionium/changelogs/CHANGELOG-0.60.308.md`

> - `GET /api/<system>/pipes`: the pipes the system declares.
> - `GET /api/<system>/pipes/:name?since=c`: records out, oldest first, from a cursor.
> - `POST /api/<system>/pipes/:name`: records in, each checked against the pipe's schema. A refusal becomes a typed gap with its reason.

### snap-0792 — v0.60.320 — 2026-10-30

**Remaining (mapped — `docs/2026-10-30-portfolio-node-per-site-ui-macros-phasemap.spec`)** — `versionium/changelogs/CHANGELOG-0.60.315.md`

> PF3 (fill the Fiverr My Portfolio page from the node + the seller profile from your profile — page detection confirmed live), UM1 (UI macros — grounding first), and the routes + command + Portfolio UI (import/export buttons, the per-site picker).

**Remaining (same message, next)** — `versionium/changelogs/CHANGELOG-0.60.316.md`

> - `matchFields` to **detect** checkbox/radio/contenteditable — the fill works, but the matcher still excludes them, so the chip doesn't *offer* them yet ("expand the autofill completely to include all the relevant elements").
> - The **accessibility / Tab** fix ("accessability settings still on. tab doesn't work").
> - A **per-site keybindings** DOM tool.

