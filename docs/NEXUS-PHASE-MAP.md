# NEXUS — Complete Phase Map
**Author:** James Brooks (Erosmancer)
**Last updated:** 2026-06-30 (session 11 — Clear Glass debugging, tree-sync verification, phase-map document audit)
**Status:** Living document — append-only, never shrink. As of session 3,
this is the **only** living changelog/phase-map document. `SESSION-CHANGELOG.md`
and the session's `MASTER-SESSION-SPEC.md` are folded in below and retired —
see CHANGELOG (session 3) at the bottom.

This is the canonical record of everything built, everything in progress,
and everything remaining. Updated every session. §AX-10.

---

## Legend
- ✅ COMPLETE — built, tested, verified in production
- 🔄 PARTIAL — exists but has known gaps or is disconnected
- 🔵 SOURCED — external source code identified that matches the spec; not yet integrated
- 📋 SPEC — specced, not yet built
- 🔴 OPEN LOOP — identified gap, needs investigation before build
- ⬛ PENDING — on the roadmap, not yet started

---

## FOUNDATION (Phases 0–8) ✅

| Phase | Name | Status | Notes |
|-------|------|--------|-------|
| 0 | Kernel — bus, JAA, boot-sequence, auth, contracts, version | ✅ | 28 JAA tables, 3 tiers |
| 1 | Persistence — vector-memory, chat-logger, event-ledger, spec-drift | ✅ | sigma-writer wired |
| 2 | Organs — gap-finder, healer, self-heal, escalation, orion, RAID, heartbeat, intelligence, behavioral-boundary | ✅ | All boot-verified |
| 3 | Meta layer — topo-kernel, telemetry-codec, liminal, bda, spatial, alk-perception | ✅ | Library only, not a service |
| 4 | Component registry | ✅ | Built + populated 2026-06-27. **185** components at boot — recounted 2026-06-28 directly from the 9 sovereign systems' `registry-components.js` files (`_c`/`_comp` entries, one per file, summed). Supersedes both "82" (this doc's session-2 figure) and "160" (a separate phase-map widget snapshot) — neither matched a direct count. |
| 5 | Grammar engine | 🔄 | Engine built. Components now feeding it via registry-components.js |
| 6 | CLI runtime | 🔄 | nexus-cli.js + cli-reasoning.js, Qwen 0.5b |
| 7 | Hook registry | 🔄 | 78 hooks declared across all 10 sovereign systems (was 6 of 10 — backfilled 2026-06-29), 21 SEAM-tracked. "164" was stale and didn't match this registry when recounted directly. "Live wire" in the runtime-dispatch sense is still mostly aspirational — services hardcode their own HTTP calls rather than dispatching through hooks/index.js. One concrete exception now: idearium→copilot (§AX-008, below) is a real wire this session built and verified against actual code, not just declared. |
| 8 | Bridge — P2P trust relay, circuit breaker | ✅ | :9999 |

---

## INTELLIGENCE (Phases 9–15) 🔄

| Phase | Name | Status | Notes |
|-------|------|--------|-------|
| 9 | Request Handler — constitutional choke point | ✅ | Phase A/B/C/D |
| 10 | Constitutional AI | ✅ | 3/3 wiring checks at boot |
| 11 | Reflection Engine | 🔄 | Built. Not all paths score decisions |
| 12 | User Model — hypotheses not profile | 🔄 | Built. _getJaa readiness check fixed 2026-06-27 |
| 13 | Autonomous Loop — Ollama as brain | 🔄 | Built. Sigma safety check real now |
| 14 | Hot Module Loader | ✅ | QUARANTINE→PROVE→INTEGRATE→MONITOR |
| 15 | Grammar Engine — CLI + Component System | 🔄 | Components now declared. Grammar trie populating. |

---

## CORTEX INTELLIGENCE (Phases 22–32) 🔄

| Phase | Name | Status | Notes |
|-------|------|--------|-------|
| 22 | Divergence Watcher + Blackbox Recorder | ✅ | |
| 23 | Stale Module Gap — named, typed, severity-graded | ✅ | §FIX-24.3 applied |
| 24 | TV Shell — floating menu root cause | ✅ | Rewritten 2026-06-27 |
| 25 | RAID Compartment Engine | ✅ | compartment-engine.js, case-library.js |
| 26 | Adversarial Integrity Layer | ✅ | adversary-suite.js, cortex harness |
| 27 | System State VM (NEX-VM/1.0) | 🔵 | SOURCED 2026-06-28 — `rfr2/packages/nexus/src/{kernel,compress,context,time}`. `compress.snapshot()`/`restore()` is full state serialize/restore; `context.createLiveContext/createReplayContext` is suspend↔resume. Not yet integrated. See `NEXUS-PHASE-MAP-CROSSREF.md`. |
| 28 | Build From Inside — live system editor | ⬛ | |
| 29 | Topology View | 🔄 | X-ray canvas in forge-shell, not live data |
| 30 | Time-Travel Debugging | 🔵 | SOURCED 2026-06-28 — `rfr2/packages/nexus/src/{clip,context}`. `clip.snapshotRange()`/`restoreClip()` is the fork primitive — bounded subgraph extraction + replay + stability validation. Not yet integrated. See `NEXUS-PHASE-MAP-CROSSREF.md`. |
| 31 | Grammar ↔ Intent structured pre-classification | ✅ | |
| 32 | Per-file sigma versioning | 🔄 | Versionium exists, file-level sigma partial |

---

## BUILD PIPELINE (Phases 33–50) 🔄

| Phase | Name | Status | Notes |
|-------|------|--------|-------|
| 33 | PID Isolation + In-memory Cache + Redundant State | ✅ | Autopilot handles PID isolation |
| 34 | API_SURFACE_FAILURE diagnosis + auto-resolution | ⬛ | |
| 36 | Dynamic CLI commands from grammar engine | 🔄 | Built 2026-06-29 — `module-builder.map()` now classifies scope:'cli' vs scope:'module'; cli scope short-circuits straight to `componentRegistry.register()`, skipping spec/QC/build. Code-verified (calls real functions with matching signatures), not runtime-verified — this sandbox can't boot the full multi-service stack. |
| 38 | Unified pipeline — Idearium + Repo + Spec + Architect + Emerge | 🔄 | Parts exist, not unified |
| 40 | Component Descriptor — atomic unit of reality | ✅ | registry-components.js pattern built, all systems declared |
| 41 | Compiler knowledge layer — six projections | 🔄 | descriptor-projector.js built |
| 42 | Blueprint — the loop closes, system reads itself | 🔄 | blueprint.js exists, now has data to work with |
| 45 | Intent Classifier — RAID entry gate | ✅ | Qwen async classification |
| 46 | Queryable Case Library | ✅ | case-library.js, T2 compartment bridge |
| 47 | Pattern Engine — novelty-aware + self-wired | 🔄 | BEP patterns. 367 patterns seeded. |
| 48 | CFR ↔ Decision Pipeline + RAID self-stabilization | 🔴 | CFR sigma never consulted by RAID _decide() |
| 49 | Agent Reachability — self-healing connections | 🔄 | RAID health probe, not self-healing |
| 50 | Pattern Graph — event causality over static sigma | 🔄 | compound.js built, not wired to RAID |

---

## SYSTEMS (Phases 60–73) 🔄

| Phase | Name | Status | Notes |
|-------|------|--------|-------|
| 60 | Retire ui-map.json stub — query Architect blueprint API | ⬛ | |
| 61 | Backfill hooks/*.hooks.js — full SEAM coverage | ✅ | Closed 2026-06-29. emerge/copilot/eravos/ollama generated by projecting their already-audited registry-components.js (Phase 96) embedded hooks.in/hooks.out into the hooks/ schema — not hand-invented. hooks/index.js's SYSTEMS map now lists 10, was 6. |
| 62 | One registry, not three — decision gate | ✅ | 185 components registered at boot (corrected session 3, see Phase 4) |
| 63 | kg-builder nodes resolve to registry component IDs | ⬛ | |
| 64 | Grammar engine reads unified registry hooks | 🔄 | Components declared, wires not yet |
| 66 | .spec container import — Idearium spec library + CI/CD | ✅ | |
| 67 | MCP Tool Bridge | ✅ | :7821, 17 tools |
| 68 | Co-pilot — sovereign, stream-of-consciousness | ✅ | :3750, lifeline wired, dual cognition |
| 71 | Causal Event Graph Kernel — gap map formalization | ✅ | CFR-Ω, CausalGraph, compound.js |
| 73 | T2 Compartment Bridge — cross-project chunk reuse | ✅ | nexus-phase73-t2-compartment-bridge |

---

## S-SERIES PROPOSED (from session roadmap)

| Phase | Name | Status | Notes |
|-------|------|--------|-------|
| S1 | Co-pilot independence — extract from Guardian | ✅ | :3750 sovereign |
| S2 | Component registry coverage — every module hooks to co-pilot | ✅ | All systems now declare components on boot |
| S3 | Synthesis layer — one reconstruction view over causal graph + snapshots + ledgers | ⬛ | |
| S4 | Action-intent wiring | 🔄 | co-pilot classifies 'action', nothing dispatches |
| S5 | Uniform session ledger — every co-pilot input logged | 🔄 | chat_log to Cortex, not uniform |
| S6 | lib/causal/compound.js — formal adoption | ✅ | compound.js built, ripple/wave/tidal |
| S7 | Dual cognition — INTUITION + MASTERMIND | 🔄 | Built in Cortex + co-pilot, not fully wired |

---

## BUILT 2026-06-27 (session 1)

### Sovereign Systems
| # | Name | Status | Location | Notes |
|---|------|--------|----------|-------|
| 74 | ERAVOS sovereign system | ✅ | eravos/ :3751 | Moved from ui/eravos/ |
| 75 | Ollama Bridge sovereign system | ✅ | ollama/ :3749 | Isolated from Guardian |
| 76 | Co-pilot sovereign system | ✅ | copilot/ :3750 | Separated from Guardian |

### Co-pilot Modules
| # | Name | Status | Location | Notes |
|---|------|--------|----------|-------|
| 77 | INTUITION faculty | ✅ | copilot/intuition.js | Fast path |
| 78 | ANALYSIS faculty | ✅ | copilot/analysis.js | 7-layer context |
| 79 | ADVERSARIAL faculty | ✅ | copilot/adversarial.js | Ping-pong every 60s |
| 80 | LIFELINE router | ✅ | copilot/lifeline.js | Ollama primary, Guardian fallback |
| 81 | AXIOM MANAGER | ✅ | copilot/axiom-manager.js | 3 tiers, add/remove/freeze |
| 82 | MODULE BUILDER | ✅ | copilot/module-builder.js | QC pipeline, bottom-up |
| 83 | CLI axiom | ✅ | cli/axiom.js | nexus axiom list/add/remove/freeze/check |

### Cortex Intelligence
| # | Name | Status | Location | Notes |
|---|------|--------|----------|-------|
| 84 | INTUITION faculty (Cortex) | ✅ | cortex/intelligence/intuition.js | BEP + sigma + fault taxonomy |
| 85 | MASTERMIND faculty | ✅ | cortex/intelligence/mastermind.js | Causal, prediction, counterfactual |
| 86 | DEDUP engine | ✅ | cortex/intelligence/dedup.js | Reference-based, original preserved |

### Infrastructure
| # | Name | Status | Location | Notes |
|---|------|--------|----------|-------|
| 87 | CONTRACT QUEUE | ✅ | lib/contract-queue.js | Disk-first, every request a contract |
| 88 | CONTRACT POLLER | ✅ | lib/contract-poller.js | Stuck detection every 15s |
| 89 | CORTEX WRITE-THROUGH | ✅ | lib/cortex-write.js | Buffer if Cortex offline |
| 90 | TV SHELL rename | ✅ | ui/tv-shell/ | + spotlight module + menu module |
| 91 | THEMES folder | ✅ | ui/themes/ | nexus-dark.css + nexus-light.css |
| 92 | SPOTLIGHT sovereign | ✅ | ui/tv-shell/spotlight/ | js + css |
| 93 | MENU sovereign | ✅ | ui/tv-shell/menu.js | CLI → co-pilot :3750 |

---

## BUILT 2026-06-27 (session 2)

### Phase 96 — Registry-Components (ROOT CAUSE FIX) ✅
| File | Components | Notes |
|------|-----------|-------|
| guardian/registry-components.js | 33 | Jobs, SEAM, NCP, artifacts, gaps, co-pilot proxy |
| cortex/registry-components.js | 39 | Memory, CFR, intelligence, RAID, snapshots, search |
| architect/registry-components.js | 17 | Hooks, blueprint, wires |
| emerge/registry-components.js | 9 | Compile, hot-load, codegen |
| bridge/registry-components.js | 11 | Relay, nodes, trust, circuit |
| nexus-connect.js | — | components[] param added to registerWithOrchestrator() |

**Result:** 82 components registered at boot (verified in live log). Grammar trie populating. OL-1 closed. S2 closed.

### Additional Builds (session 2)
| # | Name | Status | Location | Notes |
|---|------|--------|----------|-------|
| 94a | RECURSIVE DIAGNOSE | ✅ | copilot/recursive-diagnose.js | Fractal, writes to file in real-time |
| 94b | CONTROL PANEL | ✅ | ui/control-panel/index.html | Toggle switches, dropdowns, values per system |
| F10 | NCP connected spam | ✅ | guardian/server.js | Rate-limited to once per 30s per tab |
| F11 | Co-pilot → lifeline in analysis path | ✅ | copilot/server.js | Was calling Ollama directly, now uses lifeline |

### Bug Fixes (session 1)
| # | Fix | Status |
|---|-----|--------|
| F1 | diagnostic: `sys is not defined` | ✅ |
| F2 | user-model: `jaa.query is not a function` | ✅ |
| F3 | ollama-bridge: `ERR_INVALID_URL: 0.0.0.0:11434` | ✅ |
| F4 | eravos + copilot: 0 components registered | ✅ |
| F5 | co-pilot: `_ensureProfile is not defined` | ✅ |
| F6 | forge-shell.html missing redirect | ✅ |
| F7 | delta tension false 0.82 on dom_map | ✅ |
| F8 | assumption gap flood from bullet density | ✅ |
| F9 | diagnostic escalation spam for optional systems | ✅ |

---

## OPEN LOOPS (updated — carried forward)

| # | Loop | Blocking | Priority | Status |
|---|------|----------|----------|--------|
| OL-1 | Component registry 0 entries | — | CRITICAL | ✅ CLOSED — 82 components at boot |
| OL-2 | CFR sigma → RAID _decide() not wired | RAID routing not causal-aware | HIGH | 🔴 OPEN |
| OL-3 | Compartment engine not sovereign module | — | HIGH | 🔴 OPEN |
| OL-4 | RAID routes to providers not components | Needs OL-1 first | HIGH | 🔄 UNBLOCKED — OL-1 done |
| OL-5 | UI channels not sovereign HTML | index.html 4000+ lines | MEDIUM | 🔴 OPEN |
| OL-6 | Co-pilot session continuity | Cold start each time | MEDIUM | 🔴 OPEN |
| OL-7 | ui/eravos/ still exists as copy | — | LOW | 🔴 OPEN |
| OL-8 | guardian/ui/index.html old Forge IDE | — | LOW | 🔴 OPEN |
| OL-9 | guardian/New folder/ dead code | — | LOW | 🔴 OPEN |
| OL-10 | Spec drift: 10 unspecced modules | — | MEDIUM | 🔴 OPEN |
| OL-11 | action-intent wiring (S4) | Nothing dispatches 'action' | HIGH | 🔴 OPEN |
| OL-12 | Cortex intelligence not via HTTP | INTUITION/MASTERMIND not queryable | MEDIUM | ✅ CLOSED 2026-06-29 — `/api/intelligence/{intuition,mastermind,...}` live in `cortex/boot.js`, queried by `copilot/server.js` (§P110). Was wrongly still marked open. |
| OL-13 | Counterfactual engine not built | counterfactual.js spec exists | MEDIUM | 🔴 OPEN |
| OL-14 | Relational field query surface | /api/field/* not built | MEDIUM | 🔴 OPEN — Phase 99 is 🔵 SOURCED, see crossref. Naming note: "relational field" = CFR graph terminology, not people-data |
| OL-15 | Capability registry | co-pilot can't discover all NEXUS can do | MEDIUM | 🔴 OPEN |
| OL-16 | Contract progress tracking | fulfillment check not built | MEDIUM | 🔴 OPEN |
| OL-17 | RAID first-principles reinforcement | RAID doesn't validate against axioms | MEDIUM | 🔴 OPEN — Phase 95 is 🔵 SOURCED (`rfr2/.../enforcement` — RuntimeGuard + BoundaryIndex, 25 invariants). Runtime-layer check, complementary to constitutional-ai.js's request-layer check, not overlapping |
| OL-18 | Sigma capped at 0.05 in practice | autonomous loop halt never fires | HIGH | 🔴 OPEN |
| OL-19 | Co-pilot not in userscripts | userscripts still use Guardian co-pilot | MEDIUM | 🔴 OPEN |
| OL-20 | guardian/agents/co-pilot/index.js deprecated | 996 lines, still proxied | LOW | 🔴 OPEN |
| OL-21 | NCP ollama-ncp tab reconnects every 2s | SSE error loop, RECONNECT_MS=3000 | MEDIUM | 🔄 MITIGATED — log rate-limited |
| OL-22 | Co-pilot timeout on long prompts | No streaming, polls for result | MEDIUM | ✅ CLOSED 2026-06-29 — `POST /api/prompt/stream` SSE endpoint live in `copilot/server.js` (§P112), `_streamOllamaJob` token-by-token. Was wrongly still marked open. |
| OL-23 | Control panel settings not hot-applied | /api/settings route not on systems | LOW | 🔴 OPEN |
| OL-24 | Ollama contract unreachable | /contract route returns 404 on ollama | LOW | 🔴 OPEN |

---

## PENDING PHASES (everything still to build)

### Phase 94 — Meta Observer Layer ⬛
One layer above Orchestrator. Full system diagnostics, controls per system,
event ledgers, snapshots, health matrix, performance metrics, recent activity.
`meta/` sovereign system :9001. UI: `ui/meta/index.html` — disposable, reads meta API.
**Note:** Control panel (94b) built as lightweight version. Meta Observer is the full sovereign system.

### Phase 95 — RAID First-Principles Reinforcement 🔵 SOURCED 2026-06-28
Post-decision axiom check before dispatch. constitutional-ai.check() on every routing decision.
Reject routing that violates immutable laws. Log to constitution_decisions JAA table.
**Source found:** `rfr2/packages/nexus/src/enforcement` — `RuntimeGuard` + `BoundaryIndex`,
25 continuously-monitored invariants, hard stop on violation. This is a runtime-layer
check; `constitutional-ai.js` is request-layer — complementary, not a duplicate. Not
yet integrated. See `NEXUS-PHASE-MAP-CROSSREF.md`.

### Phase 97 — CFR → RAID Wire (OL-2) 🔄 built 2026-06-29 — core engine real, layer-2 fitness honestly partial
**Built:** `cortex/core/raid/index.js` + `cortex/contract/index.js` did not exist;
both do now. `_decide`/`_cluster` verified against the exact pre-existing test
contracts (`tests/full.test.js` §6, 12/12 passing) and `_approveTool`/
`_toolHealthSnapshot` against `tests/modules/raid-approve-tool.test.js`
(9/9 passing) — these tests existed before this session and were testing a
module that wasn't there; nothing here was guessed, everything is checked
against pinned behavior. `lib/request-handler.js`'s `_getRAID()` require now
actually resolves. The `§P97` CFR-sigma-floor code that was already written
and waiting now has an engine to attach to — confirmed: tightened
`consecutiveFails` threshold (3→1) when `cfrRegime !== 'stable'`. The
outcome-feedback block (D3) that logged `user.satisfied` but never called
back into RAID now calls `recordOutcome()`, closing "weight table learns
from outcomes" for real. Health poll wired into `cortex/boot.js`'s listen
callback — its own boot log has claimed "raid active" since before this
existed.
**Honestly partial:** layer-2 fitness's `role_confidence`/`topological_proximity`/
`SNR_tier_gate` terms are stubbed at neutral (1.0) — each has a named,
currently-unbuilt dependency (role-drift tracking; CFR's `_byComponent` edge,
planned per `docs/cfr.spec` but not present; `docs/raid-snr-filter.spec`'s own
pre-gate not wired into this layer). Faking these would be worse than leaving
them neutral. "Specialist clusters" (where LAW_I wouldn't apply) are named in
`docs/raid.spec` but never enumerated — all four current clusters treated as
non-specialist. Full detail in `docs/META-SYSTEM-AND-SUBSYSTEM-SPECS.md` §4.4.
**Deps:** Phase 96 ✅ (done — componentIds now available)

### Phase 98 — HTTP Routes for Cortex Intelligence (OL-12) ✅ 2026-06-29 — built, undocumented until now
GET/POST `/api/intelligence/{status,context,intuition,mastermind,patterns,rca,...}`,
live in `cortex/boot.js`, all 11 routes registered in `cortex/registry-components.js`.
Co-pilot calls `/api/intelligence/mastermind` before Ollama dispatch (§P110) instead
of duplicating the logic — confirmed in `copilot/server.js`'s `_queryCortexMastermind()`.
Doc had this ⬛ PENDING; code has carried it since at least the `copilot/server.js`
rewrite dated 2026-06-28. Found while auditing the copilot-migration spec.

### Phase 99 — Counterfactual + Relational Field 🔵 SOURCED (query/CQL half) 2026-06-28
cortex/intelligence/counterfactual.js + GET /api/field/nodes, /edges, /new-pathways.
**Source found:** `rfr2/packages/nexus/src/query` (CQL) wraps `lib/cfr/graph.js`'s
`CausalGraph` (currently only ancestors/descendants/jobChain) with an actual query
language — gives `/api/field/nodes`, `/edges`, `/new-pathways` for free. Counterfactual
half still unsourced. **Naming note:** "Relational Field" here is CFR's own
coherence/friction/resonance/entropy graph terminology — not human-relationship data.
No consent question applies to this finding. Not yet integrated.

### Phase 100 — Capability Registry (OL-15) ⬛
lib/capability-registry.js. Every NEXUS capability indexed. Co-pilot reads it.
**Deps:** Phase 96 ✅

### Phase 101 — Contract Progress Tracking (OL-16) ⬛
Full progress state per contract. Fulfillment check on recovery.
Last-interaction map: fromSystem → toSystem → why → ts → progress.

### Phase 102 — Action-Intent Wiring (S4, OL-11) ⬛
Wire action intent → module-builder → contract → relevant system.

### Phase 103 — Session Continuity ✅ 2026-06-29 — built, undocumented until now
`_injectSessionHistory()` in `copilot/server.js` (§P103) — fetches last 8 `chat_log`
rows from Cortex on a session's first exchange, injects the last 5 as U/A pairs
into context. Wired at both the streaming and non-streaming prompt handlers.
Doc had this ⬛ PENDING. Found while auditing the copilot-migration spec.

### Phase 104 — Co-pilot in Userscripts (OL-19) ⬛
Guardian userscripts route to :3750. Diagnose + repair from NCP stream.

### Phase 105 — File Integrity + Delta Types 🔵 SOURCED 2026-06-28 (and partly built)
lib/cfr/integrity.js. Boot-time hash check. Named delta types.
**Source found:** `Causal-Nexus.zip`'s `identity.js` + `delta.js`, cross-referenced
against `rfr2`'s `{identity,delta}` (rfr2's `delta.js` is 600 lines vs the standalone
zip's 455 — likely more named types). `identity.js`'s 3-axis model (id/contentHash/
replayOf) is the dedup-and-integrity primitive this phase wants. **Already partly
built independently:** `lib/file-integrity.js` does FNV-1a content hashing of every
system's `registry-components.js` on boot — that's the boot-time hash-check half of
this phase, live in code now, separate from this sourcing finding. Named delta types
from either external source are still not integrated.

### Phase 106 — Sigma Investigation (OL-18) ⬛
Max sigma ever = 0.05. computeSigma() + sigma-writer need reading before fixing.

### Phase 107 — UI Channels as Sovereign HTML (OL-5) ⬛
index.html shrinks to <200 lines. Channels become iframes.

### Phase 108 — Spotlight HTTP API ⬛
POST /api/ui/spotlight/on. Any system directs UI without HTML.

### Phase 109 — Epistemic Branch Runtime (EBR) 🔵 SOURCED 2026-06-28
Clone state → apply hypothesis → simulate → compare → crystallise only if passes.
The cognitive CI/CD pipeline. Snapshot engine (branch) + module-builder (mutate) + adversarial (evaluate).
**Source found:** `rfr2/packages/nexus/src/{clip,context,adapter-sandbox,observer}`.
Clone = `clip.snapshotRange`. Simulate = `context.createReplayContext`, hermetically
isolated via `adapter-sandbox`'s READ_ONLY/LOCAL_ONLY/FULL policy. Compare =
`clip.validateClipStability`. Called "the big one" — most direct match in the whole
audited corpus. Depends on Phase 98 ✅ (done 2026-06-29 — Cortex-HTTP half of the
dependency is satisfied; EBR itself still not integrated). Not yet integrated.

### Phase 110 — Dual Cognition Full Wire 🔄 2026-06-29 — partial, undocumented until now
Co-pilot↔Cortex half is built: `_queryCortexMastermind()` (§P110 in `copilot/server.js`)
queries `/api/intelligence/mastermind` before every Ollama dispatch — confirmed wired,
not duplicated. Two parts of the original spec are **not** confirmed: RAID querying
`/api/intelligence/intuition` for fast routing (no reference found in any RAID file),
and "adversarial pings Cortex" — `adversarial.js` only writes results *to* cortex
(`/api/memory/insert`), it doesn't query Cortex's faculties first. Doc had this ⬛
PENDING; the co-pilot half alone earns 🔄, not ✅.
**Deps:** Phase 98 ✅

### Phase 111 — Spec Drift Repair (OL-10) ⬛
Fix 7 drifted specs. Write 9 missing ones.

### Phase 112 — Streaming Co-pilot Responses (OL-22) ✅ 2026-06-29 — built, undocumented until now
`POST /api/prompt/stream` SSE endpoint live in `copilot/server.js` (§P112).
`_streamOllamaJob()` delivers token-by-token. Timeout risk on long analyses
eliminated. Doc had this ⬛ PENDING. Found while auditing the copilot-migration spec.

### Phase 113 — NCP Reconnection Backoff (OL-21) ⬛
Exponential backoff in userscripts. RECONNECT_MS starts at 3s, backs off to 30s.
Reduces SSE reconnection flood from ollama-ncp tab.

### Phase 114 — /api/settings Hot-Apply (OL-23) ⬛
Each system implements POST /api/settings to accept runtime config from control panel.
Guardian: ncp_log_rate_ms, seam thresholds. Cortex: sigma thresholds, gap batch.
Co-pilot: lifeline confidence, stream size. Ollama: max_concurrent, timeout.

### Phase 115 — S3 Synthesis Layer ⬛
One unified reconstruction view over: causal graph + snapshots + ledgers + patterns.
Single query: "what happened between T1 and T2?" → complete causal narrative.

### Phase 116 — Per-Concern File Splitting + Component→File Mapping ⬛
**Map done 2026-06-29, plan corrected by what it found.** guardian/server.js
is 4,263 lines, ~96 route handlers, only 4 matches for any CLI-parsing
logic — it's almost entirely API surface, not a cli.js+api.js mix. The
original framing doesn't fit this file. Real split for guardian: by
*domain* (jobs, providers, NCP, organism-queue, ...), not cli-vs-api.
Also found: route-matching style is inconsistent within the file
(`method === 'GET'` in 18 places, `method==='GET'` in 46 more) — any
automated split needs to handle both, not assume one.
**Corrected next step:** prove the cli.js/api.js split pattern on a smaller
system that actually has both concerns mixed, before touching guardian —
splitting the busiest, most load-bearing file first, without room to
verify nothing broke, is the one place "small and verified" doesn't apply.
**Deps:** none for the proof system; guardian itself waits for full room.

### Phase 117 — Seam / Role-Confidence Tracker ⬛
`docs/seam-component-registry.spec`'s confirmed→drifting→violated state machine —
schema real, zero code anywhere. Tracks per-component outcomes the way RAID's
`_health` tracks per-agent outcomes today. Spec layer: `seam`.
**Deps:** Phase 116 (needs a file to attribute outcomes to).

### Phase 118 — Hot-Swap Watcher ⬛
Nothing calls `lib/hot-loader.js`'s `load()` automatically today — the mechanism
(quarantine→prove→integrate→monitor→rollback) is real and complete (Phase 14);
only the trigger is missing. Drop-folder or drag-and-drop target, resolves via
Phase 116's mapping, calls `load()` with the component's declared invariants.
**Deps:** Phase 116.

### Phase 119 — UI Component Folder Decomposition ⬛
Every UI component gets its own `.html` alongside the `.js`/`.css` Spotlight and
Menu already prove. Apply to the 8 channels `DECOMP.md` already planned
(causal, log, diagnose, rewind, overview, conversations, guardian, cortex, idearium,
bridge) — none built past Menu/Spotlight. `ui/themes/` already exists (Phase 91).
**Deps:** Phase 116 (UI components use the same `file`/`dir` field, pointing at a folder).

### Phase 120 — Dual-Sided Handoff Events ⬛
One event row per handoff carrying both sides' variables at the moment of
crossing — RAID's `agent/cluster/cfrSigmaFloor/reason` and guardian's
`connected/jobId/queuePosition` in a single causally-chained row, not two
separately-correlated logs. Wire into the RAID→guardian path built this session.
**Deps:** none — the path it wires into already exists and is tested.

### Phase 121 — Idearium-as-GitHub Hardening ⬛
Two real gaps found this session: `branch` field doesn't fork — `parentId`
always points at the most recent snapshot regardless of declared branch, so
it's a label on a linear chain, not a DAG. And "Versionium" (causal version
control, temporal replay, sigma-gated auto-commit) has no implementation —
`lib/version.js` is a flat version string, not that.
**Deps:** none, but resolve the Cortex/Idearium/file-integrity write-authority
question (§10.3) first — same shape as the unresolved `cortex_memory`/`event_log`
dual-ownership from session 8.

### Phase 122 — Clear-Glass Auto-Ingestion Pipeline ⬛
Listen for downloads/artifacts/code/thinking across hosted provider tabs, land
in Cortex (new JAA table, not `chat_log`), queue via `lib/contract-queue.js`.
Open question carried from when this was scoped: auto-attempt
`module-builder.build()` on ingestion, or hold for a human/co-pilot decision —
auto-build is write-capable, same blast-radius question as build-from-inside.

### Phase 123 — Idearium Brainstorm Section ⬛
A pre-seed phase (or parallel `brainstorms` store) for free-form exploration,
distinct from idearium's `seed→expanding→tensioned→specced→building→complete`
pipeline — forcing raw brainstorming into the `Idea` schema loses the length
and mess that makes it useful. Promotes to a seed idea the same way an idea
promotes to a spec today (one phase earlier in the same pattern).

### Phase 124 — Variable-Level Causal Tracer ⬛
A general tool (AST walker, not a registry projector) producing the
variable→function→component→system trace proven by hand this session for
`_cfr.sigma`. That trace found the dead-link bug a system-level map couldn't
see. Separate undertaking from the file/component decomposition work — named
so it isn't lost, not yet scoped as a build.

### Phase 125 — CFR as Universal Relational Field ⬛
Generalize CFR's sigma/regime/coherence-friction-resonance-entropy substrate —
already proven twice this session (Spotlight's tile tension, clear-glass's
provider pressure) — to every relationship in NEXUS, UI included.
**Unblocked 2026-06-29** — rfr2 uploaded, real, staged at `unintegrated/rfr2-nexus/` (11 modules, see its README for which phase cites which folder). Major correction:
`rfr2/packages/nexus` and `Causal-Nexus.zip` share the exact same Project
UUID (`eecaa718-c6a6-4433-b02a-11ecbefd4740`) — they're the same project, not
two sources needing a diff. Every "needs a diff between rfr2 and Causal-Nexus"
caveat on Phases 27/30/95/99/105/109 had a false premise. The six folders
those phases cite (clip/context/adapter-sandbox/observer/enforcement/query)
are all real — confirmed present. Still not integrated, and `lib/cfr/graph.js`
vs this package's `causality` module still needs a real diff (that one IS
two different things). package.json says v5.0.1, Project.spec.md claims
1.0.0 — another version drift, consistent with the pattern.

---

## IMP-SERIES (improvement roadmap, summary only — full detail in `nexus-improvement-roadmap.spec` + `NEXUS-IMPROVEMENT-MAP.md`)

30 items total, organized by leverage tier. Status field in the spec was uniformly
`proposed` for all 30 until this session. One corrected on direct evidence:

- **IMP-02** (spec-vs-code structural diff) — ✅ **built**. `lib/file-integrity.js`
  does this independently of the spec's original `maps_to`. Corrected 2026-06-28.

The other 29 — including IMP-05 (unbuilt-idea ledger), IMP-07 (component registry
as MCP), IMP-20 (universal CLI autocomplete coverage) — are **not** re-audited here.
A separate phase-map snapshot claimed partial progress on IMP-07/IMP-20; that claim
is not verified against code in this pass and should not be treated as confirmed
until it is. Don't carry it forward as fact.

---

## BUILD ORDER (bottom-up, §3.1)

**Carried over from before this session, still real priorities:**
1. **Phase 106** — Sigma investigation. Autonomous loop safety check becomes real. Critical.
2. **Phase 102** — Action-intent wiring. Co-pilot can actually DO things.
3. **Phase 113** — NCP reconnection backoff. Terminal noise reduction.
4. **Phase 109** — Epistemic Branch Runtime. The big one. Unblocked, Phase 98 confirmed done.
5. **Phase 110 (remainder)** — wire RAID→`/api/intelligence/intuition` and adversarial→Cortex-query.

**This session's decomposition arc — bottom-up per its own spec, small proof set before generalizing:**
6. **Phase 116** — Component→file mapping. Everything below depends on this.
7. **Phase 117** — Seam/role-confidence tracker.
8. **Phase 118** — Hot-swap watcher.
9. **Phase 119** — UI component folder decomposition, starting with Spotlight.
10. **Phase 120** — Dual-sided handoff events (small, wires into already-tested code).

**Captured this session, not yet sequenced against the above — real, just not urgent:**
- **Phase 121** — Idearium-as-GitHub hardening (branch/DAG fix, Versionium).
- **Phase 122** — Clear-glass auto-ingestion.
- **Phase 123** — Idearium brainstorm section.
- **Phase 124** — Variable-level causal tracer (general tool).
- **Phase 125** — CFR as universal field (blocked on rfr2's actual source).

**Already done this session, struck from prior lists:**
- ~~Phase 97~~ ✅ RAID core engine built, 21/21 against pre-existing tests.
- ~~Phase 98 / Phase 112~~ ✅ done, found already built.
- ~~Phase 61 / Phase 36~~ ✅ hooks backfill, CLI-authoring shortcut.
- ~~Phase 94 (partial)~~ — scope grew substantially via `META-SYSTEM-AND-SUBSYSTEM-SPECS.md`; not closed, just better specified.

**Financial leverage:**
- Phase 94 (meta observer) — visual proof of self-governance
- Phase 109 (EBR) — self-testing cognitive architecture, nothing like it exists
- Phase 68/LIFELINE combination — co-pilot that manages its own laws + escalates intelligently

---

## CHANGELOG (session 2 — 2026-06-27)

### Added
- `guardian/registry-components.js` — 33 components declared
- `cortex/registry-components.js` — 39 components declared
- `architect/registry-components.js` — 17 components declared
- `emerge/registry-components.js` — 9 components declared
- `bridge/registry-components.js` — 11 components declared
- `copilot/recursive-diagnose.js` — fractal diagnosis, writes to file in real-time
- `ui/control-panel/index.html` — runtime control panel with toggles/values per system

### Changed
- `nexus-connect.js` — components[] param added to registerWithOrchestrator()
- `guardian/server.js` — NCP connected log rate-limited (30s per tab), registry-components wired
- `cortex/boot.js` — registry-components wired to registration
- `architect/service.js` — registry-components wired to registration
- `bridge/index.js` — registry-components wired to registration
- `emerge-ide.js` — registry-components wired to registration
- `copilot/server.js` — analysis path now uses lifeline (Ollama→Guardian), recursive-diagnose routes added
- `orchestrator.js` — contract-poller started, control panel noted

### Fixed
- F10: NCP connected spam — rate-limited to once per 30s per tab
- F11: Co-pilot analysis bypassed lifeline — fixed, now routes through Ollama→Guardian

### Open Loops Updated
- OL-1 ✅ CLOSED — 82 components registered at boot
- S2 ✅ CLOSED — all systems declare components
- OL-4 🔄 UNBLOCKED — was blocked on OL-1
- OL-21 🔄 MITIGATED — NCP log rate-limited, root cause (SSE reconnect loop) still exists
- OL-22, OL-23, OL-24 NEW — identified this session

### Compounding Summary
The component registry has data for the first time. 82 components registered at boot
(verified in live log). Grammar trie is populating. Blueprint has content to compile.
RAID can now route to components not just providers — the decision schema upgrade
(Phase 97) is the next step to make this real. Co-pilot's analysis now routes through
LIFELINE properly (Ollama → Guardian if low confidence). The control panel gives runtime
control over all six systems without restart. Recursive diagnosis writes fractal analysis
to disk in real-time so long-running diagnoses don't time out.

### Next Phase
**Phase 97: CFR → RAID wire.**
RAID _decide() needs to read CFR sigma per (cluster × componentId).
Now unblocked — componentIds exist in the registry.
High sigma component → routing penalty → system routes around failures automatically.
This closes the feedback loop: events → sigma → routing decisions → better outcomes.

---

## CHANGELOG (session 3 — 2026-06-28): Consolidation

This session closed the gap between "supposed to be a living changelog/phasemap/
specs in docs/" and what was actually there: three competing documents at three
staleness levels, a full prior session's audit sitting unmerged in an uploaded
zip, and a phase-map snapshot (HTML widget) that had drifted ahead of this file
in some places and behind the live code in others. Resolution below.

### `SESSION-CHANGELOG.md` and `MASTER-SESSION-SPEC.md` — retired
Per decision: this file (`NEXUS-PHASE-MAP.md`) is now the **only** living
changelog/phase-map. `SESSION-CHANGELOG.md` is left in place as a historical
artifact with a superseded-pointer banner, not edited further. `MASTER-SESSION-
SPEC.md` was never added to `docs/` as its own file — its content is folded in
here instead, so there's one fewer document doing the same job.

**Carried forward from `SESSION-CHANGELOG.md`'s open-gaps table** (the rest were
checked against live code this session and are resolved, not just assumed):
- GAP-SEAM (SEAM not working with new userscripts) — 🔴 still open, requires a
  live test with an ACTIVE tab claimed. Not statically verifiable.
- GAP-004 (Guardian→Cortex realtime bridge not validated) — 🔴 still open,
  requires both systems running. Not statically verifiable.
- F010/F011/F012 (old userscripts: simpleHash/localStorage/no context injection)
  — ✅ resolved. Userscripts are now v10.1–10.2 (`guardian/userscript-{claude,
  chatgpt,gemini,perplexity}.js`); none reference simpleHash or localStorage.
- GAP-001 (no unified `nexus` CLI binary) — ✅ resolved. `cli/nexus.js` exists.
- GAP-002 (idearium ESM boot) — ✅ resolved. `idearium/package.json` has
  `"type": "module"`.
- GAP-003 (.eg files — keep or deprecate) — ✅ resolved by absence. No `.eg`
  files exist anywhere in the tree; deprecation appears to have happened
  without ever being logged as a decision.
- GAP-FIELD-RESTORE, GAP-NODE-LEDGER-SEED — ✅ both resolved, confirmed in
  code: `lib/cfr/field.js`'s `restore()` sets dimensions directly (comment
  cites "§1.2"), `lib/node-ledger.js`'s `seed()` updates `_index` (comment
  cites "§1.2 fix" verbatim against the gap description).

### Merged into `docs/` this session
- **12 sovereign-system spec fixes + new `eravos.spec`** from a prior session's
  audit (`sovereign-system-specs-fixed.zip`, delivered inside
  `NEXUS-SESSION-COMPLETE-1.zip`). Full audit trail preserved as
  `docs/SOVEREIGN-SPEC-AUDIT-2026-06-28.md`. Headline findings: `architect`
  had a three-way version drift across `lib/version.js` (1.0.0), its own old
  spec (2.0.0, describing an unbuilt v2), and a hardcoded `'3.0.0'` string in
  `service.js`'s boot event — a drift `spec-drift.js` itself can't see, since
  it only diffs two of those three sources. `bridge.spec` and `emerge.spec`
  described routes that don't exist in the real `registry-components.js` at
  all. `diagnostic` has no `registry-components.js` and no handshake in code,
  despite its spec describing one — flagged as a code gap, not papered over.
  `idearium` has zero `hooks.out` anywhere (AX-008 violation). `eravos` had no
  spec file; written fresh from its exported module. 6 systems got mechanical
  version syncs only (cortex, guardian, escalation, snapshot, grammar-engine,
  replay-engine).
- **`NEXUS-INTEGRATION-MAP.md`, `NEXUS-PHASE-MAP-CROSSREF.md`** — source audit
  against four external uploads (`kern-v2`, `Causal-Nexus.zip`, `rfr2`,
  `nexus-v0_53_1`). Real matches: Phase 27/30/109 cluster (rfr2's clip/context/
  adapter-sandbox/observer), Phase 95/OL-17 (rfr2's enforcement), Phase 99/OL-14
  (rfr2's query/CQL — confirmed CFR's own graph terminology, not people-data),
  Phase 105 (Causal-Nexus's identity/delta). A retraction is recorded in the
  same source: Phase 14 (Hot Module Loader) was initially flagged as needing
  Causal-Nexus's `loader.js` ported in — wrong, `lib/hot-loader.js` already
  exists and is better (targets Node services; `loader.js` targets browser
  blob-URL imports). Corrected before being acted on.
- **`nexus-system-foundation-addendum-v1.1.0.spec`** — two new requirements:
  AX-008 (every component's hook graph must reach `copilot.*` within N hops —
  mechanism exists, just not universal yet) and L4-EXTERNAL (a second
  handshake path for known-but-foreign sovereign projects, kern-v2's Ed25519 +
  grammar-intersection, re-scoped from "untrusted mesh peer" — explicitly not
  a replacement for `bridge/identity.js`).
- **`nexus-analysis-module-foundation.spec`** — specialization of the base
  foundation spec for time-series-shape modules (S-curves, regime changes,
  divergence). `module-builder.js`'s `generateSpec()` should route here for
  anything whose purpose mentions trend/curve/growth/saturation/regime.
- Phase-table status updates above: Phases 27, 30, 95, 99 (query/CQL half),
  105 (sourcing half), 109 marked 🔵 SOURCED with pointers to the crossref doc.
  Phase 4 / OL-1's component count corrected to **185**, recounted directly
  from the 9 sovereign systems' `registry-components.js` files — neither this
  doc's prior "82" nor a separate phase-map-widget snapshot's "160" matched a
  direct count.
- **`nexus-improvement-roadmap.spec`'s IMP-02** corrected from `proposed` to
  `built` — `lib/file-integrity.js` does this independently, confirmed by
  direct code read. The other 29 IMP-* entries were left untouched; they're
  still uniformly `proposed` and weren't re-audited this pass.

### Explicitly NOT merged this session
- **`relational-private-signal/relational.js`** (ALK rupture/repair detector,
  third-party relationship modeling) — a prior session's `MASTER-SESSION-SPEC.md`
  §6 already flagged this as "still itemized, not bundled under 'add
  everything' — needs a yes per item." Asked again this session. Answer:
  still itemize-only. Not integrated, not discarded — stays itemized.
- **`affect.js`, `ase.js` + their `registry-components-*.js`** — confirmed not
  present anywhere in the live tree. Deferred, not declined; no decision made
  either way this session.
- **`files-4.zip`** (loose `clear-glass` exports: `index.js`, `browser.html`,
  `engine.js`, `archaeology.js`) — checked against live code. Two files were
  byte-identical (`archaeology.js`, `driver/index.js`, not flagged as an
  issue). The other two were **older** snapshots: `index.js` was 262 lines vs
  live `main/index.js`'s 1001 — missing the `providers/host.js` v2 auto-boot
  wiring already in the live tree. `browser.html` was 968 vs 2313 live lines.
  Discarded as stale; merging either would have been a regression.
- **`06-copilot-migration/copilot-migration-and-new-capabilities.spec`** and
  the two `NEXUS-WHAT-IF-LOOP*.md` brainstorm docs — not part of either
  approved batch this session. Left pending, not merged, not discarded.
  Worth noting: this spec's MIG-01 item is exactly the `cli/co-pilot.js` fix
  already live in code (the `§MIG-01` comment dated 2026-06-28) — the fix
  landed before the spec that explains it did. The spec itself is still
  unfiled.

---

## CHANGELOG (session 4 — 2026-06-29): copilot-migration spec filed, four-phase drift found

Filed `copilot-migration-and-new-capabilities.spec` into `docs/`, version
bumped 1.0.0 → 1.1.0, status `proposed` → `partially-resolved`. Verified each
item against live code rather than filing it as-is:

- **MIG-01** (cli/co-pilot.js dead proxy route) — ✅ resolved, already known
  from session 3.
- **MIG-02** (lib/copilot-context.js "orphaned") — resolved, but not orphaned
  as the spec claimed. `copilot/server.js`'s own header documents it: "P73–73.6
  — copilot-context.js now wires all 7 sensing layers into every prompt (was
  using bespoke 5-layer assembler in analysis.js)." Required by 3 files, not 0.
- **MIG-03** (Nexus-Chat standalone prototype) — unverifiable, that file isn't
  in the source tree. Left open, not assumed fixed or broken.
- **capability_cli_authoring** — confirmed still genuinely unbuilt. The
  pipeline pieces it needs (`descriptor-projector.js`'s `.cli` projection,
  module-builder's map→spec→QC→build) exist; the focused-intent short-circuit
  in `module-builder.map()` for "just a CLI command" does not.
- **capability_settings_change** (Phase 114 / OL-23) — confirmed still
  genuinely unbuilt. `cortex/boot.js`'s `/api/settings` is GET-only and
  explicitly commented "deprecated path"; `clear-glass/src/api/settings.js`
  is the Electron app's own connection config, unrelated. No system has a
  POST `/api/settings` accepting runtime config.

**Reading MIG-02 meant reading `copilot/server.js`'s full header**, which
documented three more migrations the phase map had no record of:

- **Phase 98** (HTTP Routes for Cortex Intelligence, OL-12) — doc said ⬛
  PENDING / 🔴 OPEN. Actually ✅ built: 11 `/api/intelligence/*` routes live
  in `cortex/boot.js`, all registered in `cortex/registry-components.js`,
  queried by `copilot/server.js`. **OL-12 closed.**
- **Phase 103** (Session Continuity) — doc said ⬛ PENDING. Actually ✅ built:
  `_injectSessionHistory()`, wired at both prompt handlers.
- **Phase 110** (Dual Cognition Full Wire) — doc said ⬛ PENDING. Actually 🔄
  partial: the co-pilot↔Cortex mastermind-query half is built and confirmed
  wired before every Ollama dispatch. The RAID↔intuition and
  adversarial↔Cortex-query halves are not — checked directly, no reference
  in any RAID file, and `adversarial.js` only writes to Cortex, never queries
  it first. Marked partial, not complete, on that distinction.
- **Phase 112** (Streaming Co-pilot Responses, OL-22) — doc said ⬛ PENDING /
  🔴 OPEN. Actually ✅ built: `POST /api/prompt/stream` SSE endpoint,
  token-by-token via `_streamOllamaJob()`. **OL-22 closed.**

**Root cause, same pattern as MIG-01:** `copilot/server.js` carries UUID
`v3...2026-0628`, meaning it was rewritten on 2026-06-28 — the same day as
session 3's consolidation pass — and its own header comment documents P73,
P103, P110, P112 as already wired at boot (`console.log` literally prints
"P73/P103/P110/P112 wired"). Session 3 corrected the phase map for everything
known at the time but didn't independently re-read every server file's own
header; this rewrite's self-documentation was sitting right there. Code
shipped, the doc describing it wasn't told — third time this exact gap has
shown up this week (MIG-01, the sovereign-spec version drifts, now this).
That's a process gap worth naming on its own, not just a content gap: nothing
currently forces a phase-map update when a sovereign system's own UUID/header
changes. No fix proposed here, just flagged — same discipline as everything
else in this file, named rather than papered over.

---

## CHANGELOG (session 5 — 2026-06-29): hook backfill, AX-008 wire, CLI authoring

Three real builds this session, all code-verified against existing patterns,
none runtime-tested (this sandbox can't boot NEXUS's multi-service stack —
flagged per item below, not glossed over).

### §AX-008 closed — idearium was invisible to copilot by construction
`copilot/server.js` had an `IDR_URL` constant declared since at least v3,
never connected to anything — scoped, never wired. `idearium/index.js`'s
`_broadcast()` already pushes every `os.emit()` to SSE clients on `GET /sse`
(idea created/updated/phased, spec created, gap opened, ...) — same shape as
Cortex/Guardian's `/events`, different path. Added `_connectIdeariumStream()`,
same retry/reconnect pattern as the two existing stream connectors, wired
into copilot's boot sequence at +4s. Added `hooks/idearium.hooks.js`'s 4th
entry (`idearium-to-copilot`, seam-tracked) so the wire is registry-visible,
not just code. `docs/idearium.spec`'s axioms list now includes AX-008.

### Phase 61 closed — hooks/*.hooks.js backfilled for all 10 sovereign systems
`hooks/index.js`'s `SYSTEMS` map only had 6 of 10 systems with a
`registry-components.js` (guardian, cortex, orchestrator, idearium, architect,
bridge — orchestrator isn't one of the 9, so really 5 of 9 covered).
`emerge`, `copilot`, `eravos`, `ollama` had none. Generated their
`hooks/*.hooks.js` files by **projecting each system's own already-audited
`registry-components.js`** (Phase 96) — specifically its embedded
`hooks.in`/`hooks.out.wires_to[]` declarations, which already existed but
weren't surfaced at the `hooks/` level — into the same schema
`hooks/idearium.hooks.js` uses. Nothing fabricated: every inbound hook is a
real route from the registry, every outbound hook is a real `wires_to` entry
the registry already declared. Wrote a one-off generator
(`generate-hooks.js`, not part of the shipped tree) to do the transform
mechanically rather than hand-transcribing ~40 entries, then registered all
4 in `hooks/index.js`.

Running the real `hooks/index.js` against the result: **78 hooks across 10
systems, 21 SEAM-tracked.** This doesn't match Phase 7's old "164" figure —
that number is stale and didn't survive a direct recount, same pattern as the
82/160/185 component-count discrepancy from session 3. Phase 7's other claim
("0 live wires") is still mostly true in the strict sense — most systems
still hardcode their own HTTP calls instead of dispatching through
`hooks/index.js` — except for the idearium→copilot wire above, which is a
real, newly-built, verified exception, not just a registry entry.

### Phase 36 / capability_cli_authoring — built
`module-builder.js`'s `map()` now asks a 6th classification question —
`scope: 'cli' | 'module'`, defaulting toward `'module'` when ambiguous so this
stays the narrow case. `build()` checks `plan.scope` right after `map()`
resolves; if `'cli'`, calls the new `registerCliCommand()` instead of
`generateSpec`/`runQC`/`build` — registers a minimal component directly via
`componentRegistry.register()`. That function already auto-projects
(`.cli`/`.grammar`, Phase 40 T1.5) and emits `component.registered`, and
`grammar-engine.js` already rebuilds its trie live on that event — both
pre-existing, confirmed by direct code read before building on top of them.
The new command's route points at copilot's own `/api/prompt` with the
original description as the default param, since "just a CLI command" is a
saved shortcut, not new logic.

**Verification boundary, stated plainly:** all three builds above are
syntax-checked and call only real, already-existing functions with shapes
matching their actual signatures. None have been exercised in a live NEXUS
boot — that would require running all 10 sovereign systems together, which
this sandbox can't do. Treat as code-complete, not as field-tested.

### Bottom-up queue, updated
Closed this session: Phase 61, §AX-008, Phase 36 (code-complete).
Still queued, in stable bottom-up order: Phase 97 (CFR→RAID wire) → Phase 106
(sigma investigation) → Phase 102 (action-intent wiring) → Phase 113 (NCP
backoff) → Phase 94 (meta observer) → Phase 109 (EBR) → Phase 110 remainder
(RAID↔intuition, adversarial↔Cortex) → everything else in OPEN LOOPS not yet
touched (OL-3, 5, 6, 7, 8, 9, 13, 15, 16, 18, 19, 20) → S3/S4/S5 → IMP-series
re-audit (29 untouched items).

---

## CHANGELOG (session 6 — 2026-06-29): Meta brainstorm captured, RAID gap found

Meta-system brainstorm (hooks/CFR/wire visualization, diagnostics, file/memory/
network monitoring, build-from-inside, dual-cognition tracing, BEP+ring-buffer
per system, UI interaction telemetry, toast system) plus current-state specs
for the component/seam/hook/wire system, co-pilot, tv-ui/spotlight, RAID, and
the Cortex intelligence faculties — captured in full at
`docs/META-SYSTEM-AND-SUBSYSTEM-SPECS.md`. Marked brainstorming, not committed
architecture — rfr2 is standing by, not yet uploaded, nothing there assumes it.

**Reading RAID's real code path to write that doc surfaced the actual #1
blocker behind Phase 97, and it's bigger than the prior framing.** Phase 97/
OL-2 said "CFR sigma never consulted by RAID `_decide()`" — implying
`_decide()` exists and just isn't sigma-aware yet. Untrue: `lib/request-
handler.js` already has the full CFR-sigma-floor consultation written
(`§P97` comment, `nexus-cfr-influence.js`'s `getSigmaFloor()`/`getState()`,
threaded into a `raidIntent` object) — it's calling
`require('../cortex/core/raid/index')` inside a try/catch, and that path
doesn't exist anywhere in this tree. `tests/full.test.js` expects the exact
same path and exports (`_decide, _cluster, _health, _weights`), so this isn't
a one-sided stale reference — RAID's core engine module is just missing.
Every request that reaches RAID-routing in `request-handler.js` silently
falls through; no request has ever actually been RAID-routed in this tree.
Phase 97 isn't "wire CFR in" — it's "build RAID's engine from `docs/raid.spec`
(v6.2.0 — layer-1 constraints, layer-2 fitness, `LAW_I`/`LAW_III`), then the
CFR wire that's already written has something to attach to." Full detail and
the open question (build now vs. hold for rfr2/enforcement) is in the new doc.

Also found, smaller: Phase 84/85 describe `cortex/intelligence/intuition.js`
and `mastermind.js` as separate files. Neither exists — the real
implementations are `_intuitionAnswer()`/`_mastermindAnalysis()`, local
functions inside `cortex/boot.js`, simpler than the phase map's framing
("MASTERMIND — causal, prediction, counterfactual"). Logged, not yet
corrected in the phase table above — flagged as an open question in the new
doc rather than silently rewritten, since it's possible the phase map was
describing a planned fuller build, not misdescribing the current one.

---

## CHANGELOG (session 7 — 2026-06-29): RAID engine built, foundation spec v1.1.0

**Phase 97 — RAID core engine, built and verified.** `cortex/core/raid/
index.js` and `cortex/contract/index.js` did not exist; both do now, built
directly against two pre-existing test suites that were testing a module
that wasn't there (`tests/full.test.js` §6 — 12/12 passing; `tests/modules/
raid-approve-tool.test.js` — 9/9 passing; 21/21 total, nothing in either
suite was modified to make this true). `lib/request-handler.js`'s
`_getRAID()` require now resolves. The §P97 CFR-sigma-floor consultation
that was already written now has an engine to attach to — implemented as a
tightened `consecutiveFails` threshold (3→1) when `cfrRegime !== 'stable'`.
The outcome-feedback block that logged `user.satisfied` but never called
back into RAID now calls `recordOutcome()`. Health poll wired into
`cortex/boot.js`'s boot sequence — its own log line has claimed "raid
active" since before the file existed.

Left honestly partial: layer-2 fitness's `role_confidence`/
`topological_proximity`/`SNR_tier_gate` terms are stubbed at neutral (1.0).
Each names a real, currently-unbuilt dependency rather than faking a number.
"Specialist clusters" (where LAW_I wouldn't apply) are referenced in
`docs/raid.spec` but never enumerated anywhere — treated all four current
clusters as non-specialist, flagged rather than assumed.

**Foundation spec promoted to v1.1.0.** `docs/nexus-system-foundation-
addendum-v1.1.0.spec` is now superseded (banner added, kept as historical
record) — AX-008 (copilot reachability) and AX-009 (foreign-sovereign
handshake) are promoted into the base spec verbatim, one fewer doc doing the
same job, same pattern as session 3's changelog consolidation. Added AX-010:
spec-vs-code drift accounting as the system's own standing discipline, not
just this conversation's — directly names what sessions 3-7 kept finding by
hand (component counts, phase statuses, a missing RAID engine). Added
`hooks` to `interaction_contract.required_fields` — the hook/wire/seam
registry (Phase 61, 78 hooks, 10 systems) existed as a system unto itself;
it's part of the same self-description envelope as routes/events/components
now, not a second one.

**Captured, not yet built** (`docs/META-SYSTEM-AND-SUBSYSTEM-SPECS.md` §6):
clear-glass auto-ingestion of chat artifacts/code/thinking into Cortex with
a build queue; an idearium "brainstorm" section/phase distinct from its
seed→complete pipeline; an honest assessment of the pasted "cognitive
archaeology" Tampermonkey concept — real signal in the streaming/timing
layer, real risk in the "hypothesis" layer (the document's own caveat, kept
prominent rather than buried), and a note that no actual script was in what
got pasted, only a description of one.

---

## CHANGELOG (session 8 — 2026-06-29): Axioms consolidated, spec registry, adaptive fulfillment

**Found `docs/AXIOMS-v1.0.md` and `AXIOMS-v2.0.md`** — the real canonical
axiom system (§1.1, §2.1, §LAW_I etc., referenced throughout the actual
codebase) is a different, broader document than `nexus-system-foundation.
spec`'s AX-00X numbering (which governs system *shape* specifically — L0-L5
layers). The two are complementary, not competing — confirmed by reading
both in full before touching either. v2.0 was already mostly a superset of
v1.0 (added Bridge/Identity, Truth Layers, Causal Physics, Testing &
Verification, Multidimensional Systems Thinking, SISO groups 9-14).
Consolidated into **`docs/AXIOMS-v3.0.md`** — same § numbering preserved
throughout (nothing renumbered, so `AXIOMS-PHASE-MAP.md`'s existing
mappings still hold), plus:
- §3.3 (Map Before Build), §6.3 (every spec tracked in a registry),
  §12.6 (every system/component has a diagnostic engine) — individual new
  laws naming things this conversation kept doing by hand.
- **Group 15 — Adaptive Fulfillment** (§15.1-15.3): co-pilot iterates to
  fulfillment using RAID + the fault taxonomy + the reflection engine,
  bounded, traceable, and cumulative across requests. v1.0 and v2.0 banner-
  marked superseded, kept as historical record.

**Built `docs/SPEC-REGISTRY.md`** — every one of the 88 `.spec` files in
`docs/`, with real drift-check status. 17 have been checked against live
code across sessions 3-8, with actual findings recorded (architect's 3-way
version split, replay-engine's misattributed test claim, raid.spec's core
now built, etc.). The other 71 are stated as not yet checked — not assumed
clean. This is the living artifact §6.3 requires to exist.

**Schemas and memory mapping** — landed in `docs/META-SYSTEM-AND-SUBSYSTEM-
SPECS.md` §6.4-6.5 rather than new files: a real (not designed-from-scratch)
table of which JAA tables/memory pattern each sovereign system actually
uses, with two genuine findings (`cortex_memory`/`event_log` owned by both
cortex and guardian — possible §10.3 violation, unresolved; copilot owns no
table of its own at all) — plus the component/system addition schema,
which already existed in `nexus-system-foundation.spec` and just needed
pointing at, not rebuilding.

**Built `copilot/adaptive-fulfillment.js`** — Group 15 made real, not just
written down. `fulfill(prompt, dispatchFn, opts)`: RAID picks an agent,
dispatchFn tries it, `lib/reflection.js` scores the attempt, failures route
through `lib/open-loop-taxonomy.js`'s `classify()`, RAID's `recordOutcome()`
persists the result so the *next* request benefits too, every attempt fires
an event, the iteration budget is bounded and exhaustion is a loud, specific
failure. Verified end-to-end against a mock dispatcher, 9/9: re-routes away
from a failing agent, classifies the fault, succeeds on retry, exhausts
loudly when nothing works. Wired into `copilot/server.js` as
`POST /api/prompt/fulfill` — stated honestly: the dispatch function this
endpoint provides only knows how to reach Ollama; routing to claude/chatgpt
through Guardian's NCP is not wired here, and the endpoint says so in its
response rather than pretending. New component registered
(`copilot.prompt.fulfill`) and hooked (`hooks/copilot.hooks.js`, +2 entries,
registry now 80 hooks across 10 systems, was 78).

---

## CHANGELOG (session 11 — 2026-06-30): Clear Glass debugging, phase-map document audit

**Clear Glass UI fixes** — full trace, not patches. `Health: 100` and
`Cookies: 0` were both stubs (hardcoded / wrong-method-discarded-result
respectively); both fixed for real and test-covered (13 new tests,
`clear-glass-indicators.test.js`). Bridge handshake's "Premature close" was
chased 5 layers deep through correct code before the actual bug surfaced —
`fetch()`'s `timeout` option doesn't exist on the spec, was silently dead;
replaced with `AbortController`. ChatGPT NCP flapping confirmed environmental
(tab genuinely reconnecting every few seconds), not a code bug — ruled out
both the flap-detector and the client reconnect logic by direct simulation
and code trace before concluding that. One real architectural lesson logged:
never `Proxy` a `contextBridge`-exposed object directly — frozen property
descriptors make that throw; copy into an owned plain object first, proxy
that instead. Full detail: `docs/META-SYSTEM-AND-SUBSYSTEM-SPECS.md` §9.

**Tree-sync verified, not assumed.** A 3-fix sync package was checked
file-by-file against a freshly re-uploaded tree before applying anything —
2 of 3 fixes were already present and byte-identical, only
`clear-glass/siso/package.json` was genuinely missing. Applied, then proven
by loading the real modules end-to-end (`idearium/index.js`'s actual import
chain), not just confirming file existence. All 50 prior-session tests
reran clean against the new tree first.

**Phase-map document audit — consolidation requested, findings below.**
Five phase-map-shaped files exist in `docs/`. Read every one before
touching anything:
- `phase-map.spec` — dead ancestor, stops at phase 6, predates AX-
  numbering. Superseded by this file. Left in place untouched as historical
  record (same pattern as `SESSION-CHANGELOG.md`'s superseded banner),
  not deleted, not merged further — there's nothing in it not already
  captured here in a more current form.
- `diagnostic-phase-map.spec` — different category, one service's
  detect→remediate pipeline (`service/nexus-diagnostic.js`), not a
  build/feature map. Correctly out of scope, left untouched.
- `AXIOMS-PHASE-MAP.md` — legitimate sibling document (axiom-to-phase
  compliance, not duplicate phase content). Not a merge target.
- An uploaded HTML phase-map widget was checked against this file's
  current state and confirmed stale — still showed Phases 113 and 120 as
  pending, both already closed as of session 9-10. Needs regenerating
  *from* this document, not merged *into* it; doing so was out of scope
  this pass since the underlying data (this file) is what's authoritative.
- Foundation specs (`nexus-system-foundation.spec` + its addendum +
  the analysis-module specialization) were checked and confirmed already
  correctly consolidated as of session 8 — AX-008/009/010 present in the
  base spec, addendum carries its superseded banner, specialization is a
  clean non-overlapping `extends:`. Nothing further to merge; confirmed
  clean rather than assumed clean, since "looks done" and "verified done"
  are different claims and this session has been about not conflating them.

---

## CHANGELOG (session 12 — 2026-06-30): Health/Cookies still-static root cause, missing timestamps

A new screenshot showed `Health: 100` and `Cookies: 0` still frozen despite
session 11's fix. Traced precisely rather than re-guessed:

**Real bug, found and fixed:** session 11's fix only ever *wrote* to
`statusHealth` inside the `nexus.status` SSE event handler — correct when
the event arrives, but the event requires orchestrator to be running. The
attached boot log showed `[ClearGlass §AXIOM] orchestrator offline —
running standalone` — meaning the event genuinely never fires in this
exact session, and the indicator was permanently stuck at the **raw HTML's
hardcoded `Health: 100`**, looking confidently correct while being entirely
fake. Same root shape as the original bug, just one layer further back —
fixed the *symptom* (writing real data when it arrives) without fixing the
*default* (what to show when it doesn't). Fixed: initial markup now reads
`Health: —` / `Cookies: —` (honest unknown, not a fake number), and an 8s
timeout flips both the health text and the NEXUS status dot to an explicit
"offline" state with a tooltip explaining why, if no event arrives.

**Second real bug, same screenshot:** `updateCookieCount()` had exactly one
call site, inside `did-stop-loading`/`did-navigate` handlers — meaning a
tab that opens at `about:blank` and is never explicitly navigated (the
default "New tab" case, exactly what the screenshot shows) never calls it
at all, ever. Fixed: an initial call now fires on boot when there's no
`initialUrl` to load, instead of relying solely on a navigation event that
may never come.

**Third finding, not a bug — a missing diagnostic.** The pasted log showed
~90 "Handshake failed: bridge not listening yet — retry in 10s" lines with
**no timestamps at all**, making it look like a tight spam loop. Checked
the retry code directly: genuinely `setTimeout(..., 10000)`, confirmed
correct both call sites. The "spam" appearance was an artifact of
`clear-glass/src/copilot/bridge.js` never having gotten the per-file
timestamping treatment session 11 applied to `providers/host.js` — fixed,
all 5 log lines in that file now timestamped and source-tagged the same
way. The underlying behavior (retry every 10s while bridge is down) was
correct the whole time; it just wasn't legible in the log.

**Honest assessment on "should this be rebuilt":** every bug found this
round and session 11 was a real, traceable, fixable defect in specific
functions — not a structural problem with the architecture. The component/
hook/wire registry, RAID's core engine, the pressure system, the tab
system, the preload bridge — all independently test-verified and working.
What's been recurring is a narrower pattern: UI code paths that only get
exercised when the full NEXUS stack is running, silently doing nothing
useful when run standalone (which is how Clear Glass is being tested here).
That's a real gap worth naming as its own thing — standalone-mode behavior
hasn't had the same test discipline as the rest of this build — not a
case for starting over.

---

## CHANGELOG (session 13 — 2026-06-30): The actual crash, found

Every prior session's UI debugging assumed Clear Glass was a live, connected
process showing stale data. **A full `npm run start:all` boot log proved
that assumption wrong.** The real state: `[clear-glass] exited code=0
signal=null — crashes in window: 1/6` through `6/6`, circuit breaker
tripped, app not running at all. Every screenshot debugged in sessions
11-12 was very likely a cached/stale window, not a live one — explains why
fixes that tested correct in isolation never visibly changed anything.

**Root cause, traced to one line:** `clear-glass/src/main/index.js`'s
`if (!app.requestSingleInstanceLock()) { app.quit(); process.exit(0); }` —
zero logging before exit. A lock failure is indistinguishable in any log
from a real crash, except there's no error anywhere because there isn't
one; Electron is doing exactly what that line says. The actual mechanism:
autopilot's exponential backoff (1s → 2s → 4s → 8s → 16s) is uniform across
all 11 supervised kernels, but Electron's OS-level process teardown on
Windows measurably lags a plain `node` process's exit — the previous failed
instance's lock file hadn't released before the next restart attempt fired,
so every restart immediately self-terminated against its own predecessor.
Faster backoff intervals failed faster; the circuit breaker tripped on
schedule, every time, by design — not randomly.

**Fixed two ways, not one:**
- `requestSingleInstanceLock()` failure now logs loudly (timestamped,
  source-tagged) and exits with code 1, not silent code 0 — this alone
  ensures the *next* time this fires, the log says why instead of leaving
  a 6-line mystery.
- `autopilot.js` gained a per-kernel `minRestartDelay` floor, applied to
  clear-glass specifically (3000ms) — `Math.max(kernel.minRestartDelay,
  s.backoffMs)`, only ever raises the delay, never shortens the normal
  exponential curve once backoffMs naturally exceeds the floor. Addresses
  the actual race instead of just diagnosing it better.

6 new tests (`autopilot-restart-delay.test.js`) reproduce the real backoff
sequence from the log (`[1000, 2000, 4000, 8000, 16000]`) and prove the
fixed delays never drop below the floor, plus a falsy-zero edge case
(`minRestartDelay: 0` must mean "no floor," not "floor of zero" — a subtle
bug shape that would have looked like it worked while doing nothing). 56/56
tests passing across 6 suites.