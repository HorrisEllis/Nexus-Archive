# NEXUS — Complete Phase Map
**Author:** James Brooks (Erosmancer)
**Last updated:** 2026-06-28 (session 3 — consolidation)
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
| 7 | Hook registry | 🔄 | 164 hooks replayed at boot. 0 live wires still. |
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
| 36 | Dynamic CLI commands from grammar engine | 🔄 | Grammar engine ready, components now feeding it |
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
| 61 | Backfill hooks/*.hooks.js — full SEAM coverage | ⬛ | |
| 62 | One registry, not three — decision gate | ✅ | 82+ components registered at boot |
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
| OL-12 | Cortex intelligence not via HTTP | INTUITION/MASTERMIND not queryable | MEDIUM | 🔴 OPEN — Phase 98 unbuilt; Phase 109 (which depends on it) is 🔵 SOURCED |
| OL-13 | Counterfactual engine not built | counterfactual.js spec exists | MEDIUM | 🔴 OPEN |
| OL-14 | Relational field query surface | /api/field/* not built | MEDIUM | 🔴 OPEN — Phase 99 is 🔵 SOURCED, see crossref. Naming note: "relational field" = CFR graph terminology, not people-data |
| OL-15 | Capability registry | co-pilot can't discover all NEXUS can do | MEDIUM | 🔴 OPEN |
| OL-16 | Contract progress tracking | fulfillment check not built | MEDIUM | 🔴 OPEN |
| OL-17 | RAID first-principles reinforcement | RAID doesn't validate against axioms | MEDIUM | 🔴 OPEN — Phase 95 is 🔵 SOURCED (`rfr2/.../enforcement` — RuntimeGuard + BoundaryIndex, 25 invariants). Runtime-layer check, complementary to constitutional-ai.js's request-layer check, not overlapping |
| OL-18 | Sigma capped at 0.05 in practice | autonomous loop halt never fires | HIGH | 🔴 OPEN |
| OL-19 | Co-pilot not in userscripts | userscripts still use Guardian co-pilot | MEDIUM | 🔴 OPEN |
| OL-20 | guardian/agents/co-pilot/index.js deprecated | 996 lines, still proxied | LOW | 🔴 OPEN |
| OL-21 | NCP ollama-ncp tab reconnects every 2s | SSE error loop, RECONNECT_MS=3000 | MEDIUM | 🔄 MITIGATED — log rate-limited |
| OL-22 | Co-pilot timeout on long prompts | No streaming, polls for result | MEDIUM | 🔴 OPEN |
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

### Phase 97 — CFR → RAID Wire (OL-2) ⬛
RAID _decide() reads CFR sigma per (cluster × componentId). High sigma = penalize.
**Deps:** Phase 96 ✅ (done — componentIds now available)

### Phase 98 — HTTP Routes for Cortex Intelligence (OL-12) ⬛
GET /api/intelligence/intuition, /mastermind, /predict, /confidence, /dedup/check.
Co-pilot calls Cortex instead of duplicating the logic.

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

### Phase 103 — Session Continuity ⬛
Inject last N chat_log entries on session start. Co-pilot remembers.

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
audited corpus. Depends on Phase 98 (OL-12) for the Cortex-HTTP half. Not yet integrated.

### Phase 110 — Dual Cognition Full Wire ⬛
Cortex INTUITION/MASTERMIND via HTTP. Co-pilot calls Cortex, not its own copies.
RAID uses INTUITION for fast routing. Adversarial pings Cortex, not co-pilot.
**Deps:** Phase 98

### Phase 111 — Spec Drift Repair (OL-10) ⬛
Fix 7 drifted specs. Write 9 missing ones.

### Phase 112 — Streaming Co-pilot Responses (OL-22) ⬛
SSE stream from copilot/server.js on prompt response.
Token-by-token delivery. Removes timeout risk on long analyses.

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

**Highest leverage right now (Phase 96 done — next priorities):**

1. **Phase 97** — CFR → RAID wire. Now unblocked. Routing becomes causal-aware.
2. **Phase 106** — Sigma investigation. Autonomous loop safety check becomes real. Critical.
3. **Phase 98** — Cortex intelligence via HTTP. Co-pilot stops duplicating.
4. **Phase 102** — Action-intent wiring. Co-pilot can actually DO things.
5. **Phase 113** — NCP reconnection backoff. Terminal noise reduction.
6. **Phase 112** — Streaming responses. Co-pilot timeout eliminated.
7. **Phase 94** — Meta Observer Layer. Full system visibility.
8. **Phase 109** — Epistemic Branch Runtime. The big one.

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
