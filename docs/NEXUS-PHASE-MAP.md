# NEXUS — Complete Phase Map
**Author:** James Brooks (Erosmancer)
**Last updated:** 2026-06-27
**Status:** Living document — append-only, never shrink

This is the canonical record of everything built, everything in progress,
and everything remaining. Updated every session. §AX-10.

---

## Legend
- ✅ COMPLETE — built, tested, verified in production
- 🔄 PARTIAL — exists but has known gaps or is disconnected
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
| 4 | Component registry | 🔄 | Built, 0 entries at boot (no registry-components.js per system except Idearium) |
| 5 | Grammar engine | 🔄 | Built, 0 components to resolve against |
| 6 | CLI runtime | 🔄 | nexus-cli.js + cli-reasoning.js, Qwen 0.5b |
| 7 | Hook registry | 🔄 | 22 hook types, 47 hooks replayed, 0 live wires |
| 8 | Bridge — P2P trust relay, circuit breaker | ✅ | :9999 |

---

## INTELLIGENCE (Phases 9–15) 🔄

| Phase | Name | Status | Notes |
|-------|------|--------|-------|
| 9 | Request Handler — constitutional choke point | ✅ | Phase A/B/C/D |
| 10 | Constitutional AI | ✅ | 3/3 wiring checks at boot |
| 11 | Reflection Engine | 🔄 | Built. Not all paths score decisions |
| 12 | User Model — hypotheses not profile | 🔄 | Built. _getJaa readiness check fixed 2026-06-27 |
| 13 | Autonomous Loop — Ollama as brain | 🔄 | Built. Sigma safety check real now (sigma-writer wired) |
| 14 | Hot Module Loader | ✅ | QUARANTINE→PROVE→INTEGRATE→MONITOR |
| 15 | Grammar Engine — CLI + Component System | 🔄 | Engine built, components missing |

---

## CORTEX INTELLIGENCE (Phases 22–32) 🔄

| Phase | Name | Status | Notes |
|-------|------|--------|-------|
| 22 | Divergence Watcher + Blackbox Recorder | ✅ | |
| 23 | Stale Module Gap — named, typed, severity-graded | ✅ | §FIX-24.3 applied |
| 24 | TV Shell — floating menu root cause | ✅ | Rewritten 2026-06-27 |
| 25 | RAID Compartment Engine | ✅ | compartment-engine.js, case-library.js |
| 26 | Adversarial Integrity Layer | ✅ | adversary-suite.js, cortex harness |
| 27 | System State VM (NEX-VM/1.0) | 🔄 | Snapshot engine exists, VM not formalized |
| 28 | Build From Inside — live system editor | ⬛ | |
| 29 | Topology View | 🔄 | X-ray canvas in forge-shell, not live data |
| 30 | Time-Travel Debugging | ⬛ | Snapshot engine ready, fork not built |
| 31 | Grammar ↔ Intent structured pre-classification | ✅ | |
| 32 | Per-file sigma versioning | 🔄 | Versionium exists, file-level sigma partial |

---

## BUILD PIPELINE (Phases 33–50) 🔄

| Phase | Name | Status | Notes |
|-------|------|--------|-------|
| 33 | PID Isolation + In-memory Cache + Redundant State | ✅ | Autopilot handles PID isolation |
| 34 | API_SURFACE_FAILURE diagnosis + auto-resolution | ⬛ | |
| 36 | Dynamic CLI commands from grammar engine | 🔄 | Grammar engine ready, 0 components |
| 38 | Unified pipeline — Idearium + Repo + Spec + Architect + Emerge | 🔄 | Parts exist, not unified |
| 40 | Component Descriptor — atomic unit of reality | 🔄 | registry-components.js pattern built (Idearium model) |
| 41 | Compiler knowledge layer — six projections | 🔄 | descriptor-projector.js built |
| 42 | Blueprint — the loop closes, system reads itself | 🔄 | blueprint.js exists, not populated |
| 45 | Intent Classifier — RAID entry gate | ✅ | Qwen async classification |
| 46 | Queryable Case Library | ✅ | case-library.js, T2 compartment bridge |
| 47 | Pattern Engine — novelty-aware + self-wired | 🔄 | BEP patterns, cursor fixed 2026-06-19 |
| 48 | CFR ↔ Decision Pipeline + RAID self-stabilization | 🔴 | CFR sigma never consulted by RAID _decide() |
| 49 | Agent Reachability — self-healing connections | 🔄 | RAID health probe, not self-healing |
| 50 | Pattern Graph — event causality over static sigma | 🔄 | compound.js built, not wired to RAID |

---

## SYSTEMS (Phases 60–73) 🔄

| Phase | Name | Status | Notes |
|-------|------|--------|-------|
| 60 | Retire ui-map.json stub — query Architect blueprint API | ⬛ | |
| 61 | Backfill hooks/*.hooks.js — full SEAM coverage | ⬛ | |
| 62 | One registry, not three — decision gate | 🔄 | Component registry exists, not populated |
| 63 | kg-builder nodes resolve to registry component IDs | ⬛ | |
| 64 | Grammar engine reads unified registry hooks | ⬛ | |
| 66 | .spec container import — Idearium spec library + CI/CD | ✅ | |
| 67 | MCP Tool Bridge | ✅ | :7821, 17 tools |
| 68 | Co-pilot — sovereign, stream-of-consciousness | 🔄 | :3750, lifeline wired 2026-06-27 |
| 71 | Causal Event Graph Kernel — gap map formalization | ✅ | CFR-Ω, CausalGraph, compound.js |
| 73 | T2 Compartment Bridge — cross-project chunk reuse | ✅ | nexus-phase73-t2-compartment-bridge |

---

## S-SERIES PROPOSED (from session roadmap)

| Phase | Name | Status | Notes |
|-------|------|--------|-------|
| S1 | Co-pilot independence — extract from Guardian | ✅ | :3750 sovereign, 2026-06-27 |
| S2 | Component registry coverage — every module hooks to co-pilot | 🔴 | Root cause: no registry-components.js per system |
| S3 | Synthesis layer — one reconstruction view over causal graph + snapshots + ledgers | ⬛ | |
| S4 | Action-intent wiring | 🔄 | co-pilot classifies 'action', nothing dispatches |
| S5 | Uniform session ledger — every co-pilot input logged | 🔄 | chat_log to Cortex, not uniform |
| S6 | lib/causal/compound.js — formal adoption | ✅ | compound.js built, ripple/wave/tidal |
| S7 | Dual cognition — INTUITION + MASTERMIND | 🔄 | Built in Cortex, not fully wired |

---

## NEW — BUILT 2026-06-27

### Sovereign Systems

| # | Name | Status | Location | Notes |
|---|------|--------|----------|-------|
| 74 | ERAVOS sovereign system | ✅ | eravos/ :3751 | Moved from ui/eravos/, organisms + wires + audio |
| 75 | Ollama Bridge sovereign system | ✅ | ollama/ :3749 | Isolated from Guardian, queue + health monitor |
| 76 | Co-pilot sovereign system | ✅ | copilot/ :3750 | Separated from Guardian, continuous stream |

### Co-pilot Modules

| # | Name | Status | Location | Notes |
|---|------|--------|----------|-------|
| 77 | INTUITION faculty | ✅ | copilot/intuition.js | Fast path, patterns + crystals + sigma |
| 78 | ANALYSIS faculty | ✅ | copilot/analysis.js | 7-layer context assembly |
| 79 | ADVERSARIAL faculty | ✅ | copilot/adversarial.js | Ping-pong probe every 60s |
| 80 | LIFELINE router | ✅ | copilot/lifeline.js | Ollama primary, Guardian fallback on confidence < 0.75 |
| 81 | AXIOM MANAGER | ✅ | copilot/axiom-manager.js | Add/remove/list/freeze axioms, 3 tiers |
| 82 | MODULE BUILDER | ✅ | copilot/module-builder.js | Co-pilot builds its own modules, QC pipeline |
| 83 | CLI axiom | ✅ | cli/axiom.js | nexus axiom list/add/remove/freeze/check |

### Cortex Intelligence

| # | Name | Status | Location | Notes |
|---|------|--------|----------|-------|
| 84 | INTUITION faculty (Cortex) | ✅ | cortex/intelligence/intuition.js | Reads BEP patterns, sigma, fault taxonomy, liminal |
| 85 | MASTERMIND faculty | ✅ | cortex/intelligence/mastermind.js | Bidirectional causal, sigma trajectory, prediction, counterfactual |
| 86 | DEDUP engine | ✅ | cortex/intelligence/dedup.js | Reference-based, original has cause/effect/reason |

### Infrastructure

| # | Name | Status | Location | Notes |
|---|------|--------|----------|-------|
| 87 | CONTRACT QUEUE | ✅ | lib/contract-queue.js | Every inter-system request is a contract, disk-first |
| 88 | CONTRACT POLLER | ✅ | lib/contract-poller.js | Meta-system, scans input/output folders every 15s |
| 89 | CORTEX WRITE-THROUGH | ✅ | lib/cortex-write.js | All writes to Cortex, buffer to disk if offline |
| 90 | TV SHELL rename | ✅ | ui/tv-shell/ | Home shell + spotlight module + menu module |
| 91 | THEMES folder | ✅ | ui/themes/ | nexus-dark.css + nexus-light.css |
| 92 | SPOTLIGHT sovereign | ✅ | ui/tv-shell/spotlight/ | spotlight.js + spotlight.css, HTTP API planned |
| 93 | MENU sovereign | ✅ | ui/tv-shell/menu.js | Floating menu as module, CLI → co-pilot :3750 |

### Bug Fixes

| # | Fix | Status |
|---|-----|--------|
| F1 | diagnostic: `sys is not defined` crash | ✅ |
| F2 | user-model: `jaa.query is not a function` | ✅ |
| F3 | ollama-bridge: `ERR_INVALID_URL: 0.0.0.0:11434` | ✅ |
| F4 | eravos + copilot: 0 components registered | ✅ |
| F5 | co-pilot: `_ensureProfile is not defined` | ✅ |
| F6 | forge-shell.html missing redirect | ✅ |
| F7 | delta tension false 0.82 on dom_map | ✅ |
| F8 | assumption gap flood from bullet density | ✅ |
| F9 | diagnostic escalation spam for optional systems | ✅ |

---

## OPEN LOOPS (carried forward — must be named, not forgotten)

| # | Loop | Blocking | Priority |
|---|------|----------|----------|
| OL-1 | Component registry 0 entries — no registry-components.js for guardian/cortex/architect/emerge/bridge | Nothing can route to components. Grammar trie empty. Blueprint empty. | CRITICAL |
| OL-2 | CFR sigma → RAID _decide() not wired | RAID never penalizes high-sigma components. Sigma is computed but ignored by routing. | HIGH |
| OL-3 | Compartment engine not sovereign module | Referenced everywhere, no standalone compartment-engine.js as a service | HIGH |
| OL-4 | RAID routes to providers not components | Decision is {agent} not {agent, componentId, hookId}. Component routing impossible until OL-1 fixed. | HIGH |
| OL-5 | UI channels not sovereign HTML | index.html still 4000+ lines. Channels are divs not iframes with own documents. | MEDIUM |
| OL-6 | Co-pilot session continuity | Each session starts cold. No chat_log history injected on boot. | MEDIUM |
| OL-7 | ui/eravos/ still exists as copy | Can delete after confirming eravos:3751 works | LOW |
| OL-8 | guardian/ui/index.html is old Forge IDE | 3677 lines, superseded, not served, not deleted | LOW |
| OL-9 | guardian/New folder/ dead code | Should be deleted | LOW |
| OL-10 | Spec drift: 7 systems drifted, 9 unspecced | cortex, guardian, architect, escalation, snapshot, grammar-engine, replay-engine | MEDIUM |
| OL-11 | action-intent wiring (S4) | Co-pilot classifies 'action' intent correctly, nothing dispatches it anywhere | HIGH |
| OL-12 | cortex/intelligence modules not exposed via HTTP | INTUITION, MASTERMIND, DEDUP built but no HTTP routes in admin-server | MEDIUM |
| OL-13 | Counterfactual engine not built | cortex/intelligence/counterfactual.js — spec written, not built | MEDIUM |
| OL-14 | Relational field query surface | GET /api/field/nodes, /edges, /new-pathways — not built | MEDIUM |
| OL-15 | Capability registry | lib/capability-registry.js — co-pilot needs to know every NEXUS capability | MEDIUM |
| OL-16 | Contract progress tracking + fulfillment check | Phase 6 of copilot-expansion.spec — not built | MEDIUM |
| OL-17 | First-principles logic reinforcement in RAID | RAID routes by intent cluster, not first-principles validation | MEDIUM |
| OL-18 | Sigma capped at 0.05 in practice | 6,012 readings, max ever 0.05. computeSigma() or sigma-writer needs investigation | HIGH |
| OL-19 | Co-pilot not integrated into userscripts | Guardian userscripts don't talk to co-pilot :3750 | MEDIUM |
| OL-20 | guardian/agents/co-pilot/index.js still 996 lines | Deprecated but not removed. Guardian still proxies to it. | LOW |

---

## PENDING PHASES (everything still to build)

### Phase 94 — Meta Observer Layer
**What:** One layer above Orchestrator. Full system diagnostics, controls per system,
event ledgers per system, snapshots, health, performance metrics, recent activity.
Reads from everything, controls everything, owned by nothing.
**Location:** `meta/` sovereign system, new port (proposed: :9001)
**UI:** `ui/meta/index.html` — disposable, reads from meta API
**Includes:**
- Full system diagnostics (all systems, all subsystems)
- Per-system controls (restart, pause, drain queue)
- Per-system event ledgers (live + historical)
- Snapshot browser + one-click rollback
- Health matrix (all systems × all subsystems)
- Performance metrics (sigma trajectory, delta types, latency)
- Recent activity feed (last 100 events across all systems)
- CFR graph viewer (live relational field)
- Contract queue viewer (all pending + stuck contracts)

### Phase 95 — RAID First-Principles Reinforcement
**What:** RAID validates every routing decision against first principles before dispatch.
Not just intent cluster weights — axiom compliance check, architecture alignment,
constitutional gate. SNR filter already does invariant-first but RAID's _decide()
doesn't re-validate the output against axioms.
**Files:** cortex/core/raid/index.js + cortex/core/raid/snr-filter.js
**Adds:**
- Post-decision axiom check before dispatch (constitutional-ai.check())
- First-principles validation: does this decision follow §AX-1..§AX-14?
- Reject routing if it would violate immutable laws
- Log every validation to constitution_decisions JAA table

### Phase 96 — Registry-Components for All Systems (ROOT CAUSE FIX)
**What:** Every system declares its components on boot. This is OL-1.
Single most impactful phase — fixes grammar trie, blueprint, RAID component routing,
co-pilot capability discovery, all at once.
**Files:** guardian/registry-components.js, cortex/registry-components.js,
architect/registry-components.js, emerge/registry-components.js,
bridge/registry-components.js
**Unlocks:** OL-1, OL-2, OL-4, S2, Phase 15

### Phase 97 — CFR → RAID Wire (OL-2)
**What:** RAID _decide() reads CFR sigma per (cluster × componentId).
High sigma = penalize routing to that component.
**File:** cortex/core/raid/index.js
**Deps:** Phase 96 (need componentIds to key sigma by)

### Phase 98 — HTTP Routes for Cortex Intelligence
**What:** INTUITION, MASTERMIND, DEDUP exposed via cortex admin-server.
Co-pilot reads these instead of doing its own context assembly.
**Routes:**
- GET /api/intelligence/intuition?q=text
- GET /api/intelligence/mastermind?q=text
- GET /api/intelligence/predict
- GET /api/intelligence/confidence?q=text
- GET /api/intelligence/dedup/check

### Phase 99 — Cortex Intelligence: Counterfactual + Relational Field
**What:** cortex/intelligence/counterfactual.js + relational field query surface.
What-if / if-then prediction. Bidirectional causal chain walk.
GET /api/field/nodes, /edges, /new-pathways.
**Deps:** Phase 98

### Phase 100 — Capability Registry
**What:** lib/capability-registry.js — every NEXUS capability indexed with description,
examples, when-to-use. Co-pilot reads this to know what it can do.
POST /api/build → module-builder checks capability-registry first.
**Deps:** Phase 96

### Phase 101 — Contract Progress Tracking + Fulfillment Check
**What:** contracts carry full progress state. On recovery, check if already fulfilled.
Last-interaction map: fromSystem → toSystem, why, ts, progress.
**Files:** lib/contract-queue.js (extend), lib/contract-poller.js (extend)

### Phase 102 — Action-Intent Wiring (S4)
**What:** Co-pilot classifies 'action' intent. Nothing dispatches it.
Wire: action intent → module-builder → contract → relevant system.
**File:** copilot/server.js + copilot/module-builder.js

### Phase 103 — Session Continuity (co-pilot)
**What:** On session start, inject last N chat_log entries as context.
Co-pilot remembers prior conversation.
**File:** copilot/server.js session-manager

### Phase 104 — Co-pilot in Userscripts
**What:** Guardian userscripts route to co-pilot :3750 not Guardian internal co-pilot.
Enable: diagnose, repair, learn from NCP delivery stream.
**Files:** guardian/userscript-claude.js, guardian/userscript-chatgpt.js

### Phase 105 — File Integrity + Delta Types
**What:** lib/cfr/integrity.js — boot-time hash check of all .js files vs baseline.
Delta types: FILE_MODIFIED, FILE_ADDED, FILE_DELETED, HASH_MISMATCH, LATENCY_SPIKE,
THROUGHPUT_DROP, PATTERN_BROKEN, INVARIANT_DRIFT, NEW_PATHWAY, PATHWAY_LOST.
**Files:** lib/cfr/integrity.js

### Phase 106 — Sigma Investigation (OL-18)
**What:** 6,012 sigma readings, max ever 0.05. Should reach 0.15 threshold.
Investigate computeSigma() in lib/cfr/sigma.js and what sigma-writer feeds it.
**Files:** lib/cfr/sigma.js, lib/sigma-writer.js

### Phase 107 — UI Channels as Sovereign HTML (OL-5)
**What:** Each TV shell channel is its own HTML document loaded in iframe.
index.html shrinks from 4000+ lines to <200.
**Phases:** Per DECOMP.md — extract, then sovereign, then shell shrinks

### Phase 108 — Spotlight HTTP API
**What:** POST /api/ui/spotlight/on { target: 'guardian' }
Any system can direct the UI without touching HTML.
Orchestrator receives, broadcasts via SSE, spotlight.js subscribes.
**Files:** orchestrator.js + ui/tv-shell/spotlight/spotlight.js

### Phase 109 — Epistemic Branch Runtime (EBR)
**What:** The cognitive CI/CD pipeline from the session document.
Clone system state → apply hypothesis → run simulation → compare → crystallize only if passes.
Maps to: snapshot engine (branch) + module-builder (mutate) + adversarial (evaluate).
**This is the architecture for how co-pilot proves ideas before they become real.**
**Deps:** Phase 96, 98, 99

### Phase 110 — Dual Cognition Full Wire
**What:** Cortex INTUITION and MASTERMIND exposed properly.
Co-pilot uses Cortex intelligence API instead of its own copies.
Adversarial pings both from Cortex, not co-pilot.
RAID uses INTUITION for fast routing decisions.
**Deps:** Phase 98

### Phase 111 — Spec Drift Repair (OL-10)
**What:** Fix the 7 drifted specs + write the 9 missing ones.
cortex, guardian, architect, escalation, snapshot, grammar-engine, replay-engine.
Plus: gap-finder, divergence-watcher, macro-compiler, ncp, grammar-fallback,
mutation-contract, open-loop-taxonomy, loop-topology, gap-loop.

---

## BUILD ORDER (bottom-up, §3.1)

**Right now, highest leverage:**

1. **Phase 96** — registry-components.js per system. One act fixes OL-1, OL-2, OL-4, S2, Phase 15. 150 components registered. Grammar trie populated. Blueprint compiled.
2. **Phase 97** — CFR → RAID wire. Routing becomes causal-aware.
3. **Phase 98** — HTTP routes for Cortex intelligence. Co-pilot stops duplicating.
4. **Phase 106** — Sigma investigation. Autonomous loop safety check becomes real.
5. **Phase 94** — Meta observer layer. Full system visibility.
6. **Phase 95** — RAID first-principles reinforcement.
7. **Phase 109** — Epistemic Branch Runtime (the big one).

**Financial leverage (demonstrable, portfolio-worthy):**
- Phase 94 (meta observer) — visual proof the system governs itself
- Phase 109 (EBR) — self-testing cognitive architecture, nothing like it exists
- Phase 80/LIFELINE + Phase 83/axiom CLI — co-pilot that manages its own laws

---

## CHANGELOG (this session — 2026-06-27)

### Added
- `eravos/server.js` + `eravos/registry-components.js` — ERAVOS sovereign :3751
- `ollama/server.js` + `ollama/registry-components.js` — Ollama Bridge sovereign :3749
- `copilot/server.js` + `copilot/registry-components.js` — Co-pilot sovereign :3750
- `copilot/intuition.js` — INTUITION fast path
- `copilot/analysis.js` — ANALYSIS 7-layer context
- `copilot/adversarial.js` — ADVERSARIAL probe + ping-pong
- `copilot/lifeline.js` — Ollama primary, Guardian fallback on confidence < 0.75
- `copilot/axiom-manager.js` — add/remove/list/freeze axioms, 3 tiers
- `copilot/module-builder.js` — co-pilot builds its own modules, QC pipeline
- `cli/axiom.js` — CLI surface for axiom management
- `cortex/intelligence/intuition.js` — Cortex INTUITION faculty
- `cortex/intelligence/mastermind.js` — Cortex MASTERMIND faculty (bidirectional causal, prediction, counterfactual)
- `cortex/intelligence/dedup.js` — deduplication engine, reference-based
- `lib/contract-queue.js` — every inter-system request is a contract, disk-first
- `lib/contract-poller.js` — meta-system poller, stuck contracts → gap → re-dispatch
- `lib/cortex-write.js` — write-through adapter, buffer to disk if Cortex offline
- `ui/tv-shell/menu.js` — floating menu as sovereign module
- `ui/tv-shell/spotlight/spotlight.js` + `spotlight.css` — sovereign spotlight
- `ui/themes/nexus-dark.css` + `nexus-light.css` — CSS variable system
- `docs/cortex-dual-cognition.spec` — dual cognition architecture spec
- `docs/copilot-expansion.spec` — co-pilot expansion spec
- `docs/contract-queue.spec` — contract queue + progress tracking spec
- `docs/ollama.spec` — Ollama sovereign system spec
- `docs/copilot.spec` — co-pilot sovereign system spec
- `docs/ui-location.spec` — UI location architecture spec
- `skills/james-brooks/SKILL.md` — updated with financial context, 14 axioms, session close protocol
- `skills/nexus-session-changelog/SKILL.md` — changelog generation skill

### Changed
- `autopilot.js` — eravos, ollama-bridge, copilot added to kernel set
- `orchestrator.js` — new systems + proxy routes + contract-poller started
- `guardian/server.js` — bullet density threshold 0.5→0.75, /guardian-ui/ route
- `lib/cfr/delta.js` — dom_map tension dampened
- `service/nexus-diagnostic.js` — optional flag for emerge/forge-shell, sys→name fix
- `lib/user-model.js` — _getJaa readiness check, _ensureProfile defined
- `cortex/boot.js` — buffer import phase 4.5 added
- `ui/tv-shell/index.html` — menu.js + spotlight.js loaded, comp_id comments, theme linked
- `ui/home/index.html` — synced with tv-shell

### Fixed (see Bug Fixes table above)

### Open Loops
See OPEN LOOPS table above — 20 named loops, numbered, carried forward.

### Compounding Summary
NEXUS now has three fully sovereign systems (ERAVOS, Ollama, Co-pilot) that can survive
individual system failures. Co-pilot has dual cognition (INTUITION fast path + ANALYSIS
with LIFELINE), adversarial self-testing, the ability to manage its own axioms via CLI,
and the scaffold to build its own modules with QC gates. Every inter-system request is
now a contract written to disk before dispatch. Cortex INTUITION and MASTERMIND read
from crystallised patterns and causal chains to answer questions without model calls.

### Next Phase
**Phase 96: registry-components.js per system.**
This is the root cause of OL-1 through OL-4. Build guardian/registry-components.js first
(it has the most capabilities and drives the most routing). Then cortex, emerge, architect,
bridge. Each file is ~50 lines following the Idearium model. One session fixes
the component registry, grammar trie, blueprint, and unblocks RAID component routing.
