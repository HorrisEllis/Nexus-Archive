# NEXUS Spec Registry
**Author:** James Brooks (Erosmancer)
**Created:** 2026-06-29 (session 8)
**Status:** Living document — §6.3 (`docs/AXIOMS-v3.0.md`). Every `.spec` file
is entered here on creation. This registry is updated every time a spec is
checked for drift, not just when it's written — a spec not in this table
is unaccounted for.

**88 spec files exist in `docs/` as of this session.** Most have not been
checked against live code in this conversation — that's stated honestly
below, not glossed over. 17 have been, with real findings, across sessions
3 through 7. The other 71 are real work still ahead, not assumed clean.

## Status legend
- ✓ — checked against live code, no drift found (or drift found and closed)
- ⚠ PARTIAL — checked, some drift found, not fully resolved
- ✗ DRIFTED — checked, real drift found, open
- — not yet checked this pass — no claim either way

---

| Spec | Version | Last drift-check | Status |
|------|---------|-------------------|--------|
| `alk-perception.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `api-dispatch.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `architect.spec` | 1.0.0 | 2026-06-28 | ✗ DRIFTED — 3-way version split: spec says 2.0.0, lib/version.js says 1.0.0, service.js boot event hardcodes '3.0.0'. Not yet reconciled. |
| `auth.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `autonomous-loop.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `bda.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `behavioral-boundary.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `blueprint.spec` | 1.1.0 | — | not yet checked against live code this pass |
| `bridge.spec` | 3.0.0 | 2026-06-28 | ⚠ PARTIAL — described routes not found in live registry-components.js. Mechanical version sync applied, route drift not. |
| `builder.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `case-library.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `cfr-contract-wire.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `cfr.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `chat-logger.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `cli-reasoning.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `cli.spec` | 1.4.0 | — | not yet checked against live code this pass |
| `component-registry.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `constitutional-ai.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `context-builder.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `contract-queue.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `contracts.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `copilot-expansion.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `copilot-migration-and-new-capabilities.spec` | 1.1.0 | 2026-06-29 | ✓ filed session 6 — MIG-01 resolved, MIG-02 resolved differently than proposed, MIG-03 unverifiable (file not in tree), capability_cli_authoring built session 6. |
| `copilot.spec` | 2.0.0 | — | not yet checked against live code this pass |
| `cortex-dual-cognition.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `cortex.spec` | 3.2.0 | 2026-06-29 | ⚠ PARTIAL — version synced session 3. Phase 84/85 intelligence description overstated vs. code (session 6 finding) — not yet corrected here. |
| `cos.spec` | 1.5.0 | — | not yet checked against live code this pass |
| `diagnostic-engines.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `diagnostic-fixes.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `diagnostic-phase-map.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `diagnostic.spec` | 1.0.0 | 2026-06-28 | ✗ DRIFTED — describes a registry-components.js and handshake that don't exist in code. Flagged, not fixed (code gap, not a doc fix). |
| `emerge.spec` | 1.0.0 | 2026-06-28 | ⚠ PARTIAL — described routes not found in live registry. Mechanical sync only. |
| `eravos.spec` | 3.0.0 | 2026-06-28 | ✓ written fresh session 3 — no prior spec existed, generated from the live exported module. |
| `erosmancer.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `escalation.spec` | 1.1.0 | 2026-06-28 | ✓ mechanical version sync only, no further drift found. |
| `forge.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `gap-lifecycle.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `grammar-engine.spec` | 1.2.0 | 2026-06-28 | ✓ mechanical version sync only, no further drift found. |
| `guardian-user-understanding.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `guardian.spec` | 3.6.1 | 2026-06-28 | ✓ mechanical version sync only, no further drift found. |
| `healer.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `heartbeat.spec` | 2.0.0 | — | not yet checked against live code this pass |
| `home-ui.spec` | 1.3.0 | — | not yet checked against live code this pass |
| `hooks.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `hot-module-loader.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `idearium.spec` | 3.0.0 | 2026-06-29 | ✓ AX-008 closed session 5/7 (idearium→copilot wire built and verified) — this spec's axioms list updated to match. |
| `intelligence-bridge.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `intelligence.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `jaa-db.spec` | 6.0.0 | 2026-07-24 | ✓ CHECKED, correction — this spec governs the `JaaDB` append-only journal class (`new JaaDB({dir})`, `cortex/memory/jaa-db.js` lines 110-289), confirmed by its exact exports list. It does NOT govern `JaaStore` (`guardian/jaa-store.js`) despite the similar file/name — different class, different persistence model (JSONL append-only vs full-snapshot JSON), no shared code. My prior entry here (same date, since corrected) wrongly attributed `JaaStore`'s undocumented `skipTables` mechanism to this spec as drift. That was wrong — this spec is untouched and accurate for what it actually governs. See the new note below the table for the real, still-open finding: `JaaStore` has no spec at all. |
| `jaa-store.spec` | 1.0.0 | 2026-07-24 | ✓ NEW — first spec ever written for `guardian/jaa-store.js` (class `JaaStore`), the shared persistence layer for 9+ processes. Written from live code (§3.3), not proposed. Documents the real construction options (`tablePrefix`/`tables`/`skipTables`), the 3-way where-clause dispatch, the multi-process merge-on-flush mechanism, and the 2026-07-24b recursion fix. Two known-open issues named explicitly rather than hidden: the still-unfixed MP-001 concurrent-write race, and `stats()`'s hardcoded table list. Closes the §17.1/§8.5 gap flagged two commits ago. |
| `lib.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `liminal-space.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `liminal.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `mcp.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `meta-layer.spec` | 1.2.0 | — | not yet checked against live code this pass |
| `nexus-analysis-module-foundation.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `nexus-cli.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `nexus-copilot-recall.spec` | 1.3.0 | 2026-07-13 | ✓ LIVING — all 4 chunks complete. chunk_1 (query_recall, 5 real lanes), chunk_2 (auto-recall context injection — found and fixed 2 real bugs along the way: POST /api/recall silently dropped query/tier from the body since 2026-07-10, and pure recency was crossing the relevance threshold with zero topical signal), chunk_3 (causalPatterns action, named to avoid colliding with the existing 'patterns' action), chunk_4 (GET /api/cortex/lattice — the route query-intelligence.js's lattice action has called since 2026-07-10 and never existed; system-lattice itself was already real and fed). Every chunk verified end-to-end against real code, not asserted from the spec text. |
| `eravos-agnostic-canvas.spec` | 1.0.0 | 2026-06-29 | ✓ NEW — organism/wire/pack/transport already domain-agnostic by construction; proposes CFR field, causal graph, and component/seam map all become organism types in the existing canvas instead of four separate renderers. |
| `cortex-intelligence.spec` | 1.0.0 | 2026-06-29 | ✓ NEW — Phase 84/85 corrected: INTUITION/MASTERMIND are inline functions in cortex/boot.js, not separate files, simpler than billed. Closing-the-gap path scoped small (wiring, not building); counterfactual half is Phase 109, not a MASTERMIND patch. |
| `versionium.spec` | 1.0.0 | 2026-06-29 | ✓ NEW — no implementation exists under this name (lib/version.js is a flat string). Real shape built from primitives already proven this session: idearium's commit graph (branch/parentId bug still open), file-integrity's hashing, rfr2-nexus's compress/clip/context (diff vs replay-engine.js still undone). |
| `warp.spec` | 1.4.0 | 2026-07-24 | ✓ CHECKED — real implementation at `warp/core`, `warp/dispatch`, `warp/plugins` (13 real primitives: Event/Gate/Stream/StreamLog/Axiom + unified dispatch). Was never entered in this registry despite existing and being actively used (idearium's chunk-dispatch: `[idearium/api] WARP chunk dispatch active — exact cache in the build path`, confirmed live in the 2026-07-24 boot log) — §6.3 gap, now closed. Also moved this session from the legacy `warp/warp.spec` to the standard `warp/spec/warp.spec` layout (orchestrator's own spec-drift checker flagged it live: "◇ warp: spec at legacy path... standard is warp/spec/warp.spec"); `warp/MANIFEST.json`'s `spec` field updated to match. |
| `nexus-decomposition-architecture.spec` | 1.0.0 | 2026-06-29 | ✓ NEW — consolidates this session's full design arc (component/seam/wire/variable/UI/event/handoff/hot-swap). Status: proposed, not yet built — see build_order. |
| `nexus-improvement-roadmap.spec` | 1.0.0 | 2026-06-29 | ⚠ PARTIAL — IMP-02 corrected proposed→built (lib/file-integrity.js, verified). Other 29 items still uniformly 'proposed', not re-audited. |
| `nexus-organisms.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `nexus-shell-ui.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `nexus-system-foundation-addendum-v1.1.0.spec` | 1.1.0 | 2026-06-29 | ⚠ SUPERSEDED — folded into nexus-system-foundation.spec v1.1.0. Kept as historical record only. |
| `nexus-system-foundation.spec` | 1.1.0 | 2026-06-29 | ✓ LIVING — this is the spec governing all specs. AX-008/009 promoted in from the addendum, AX-010 added, hooks added to interaction_contract. Addendum file superseded. |
| `nexus.spec` | 2.0.0 | — | not yet checked against live code this pass |
| `ollama.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `orchestrator.spec` | 2.0.0 | — | not yet checked against live code this pass |
| `phase-map.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `raid-snr-filter.spec` | 1.1.0 | — | not yet checked against live code this pass |
| `raid.spec` | 6.2.0 | 2026-06-29 | ✓ CORE BUILT — cortex/core/raid/index.js + cortex/contract/index.js built session 7, 21/21 against pre-existing tests. Layer-2 fitness (role_confidence/topological_proximity/SNR_tier_gate) honestly stubbed — named dependencies not yet built. |
| `reflection-engine.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `replay-engine.spec` | 1.1.0 | 2026-06-29 | ⚠ PARTIAL — lib/replay-engine.js is real but has zero test coverage in this tree; a prior audit's "16/16 tests" claim actually described a different project (erosmancer-os). Comparison baseline needs re-establishing. |
| `request-handler.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `seam-component-registry.spec` | 1.1.0 | — | not yet checked against live code this pass |
| `seam-queue.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `seam.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `self-heal.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `service.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `siso.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `snapshot.spec` | 1.2.0 | 2026-06-28 | ✓ mechanical version sync only, no further drift found. |
| `spatial.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `spec-compiler.spec` | 1.1.0 | — | not yet checked against live code this pass |
| `spec-drift.spec` | 1.1.0 | — | not yet checked against live code this pass |
| `telemetry-codec.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `tests.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `topo-kernel.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `ui-location.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `ui-registry.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `ui.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `user-model.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `vector-memory.spec` | 1.0.0 | — | not yet checked against live code this pass |
| `nexus-nerve.spec` | 0.2.0 | 2026-07-01 | ✓ REGISTERED — spec written by James from-scratch (v0.1 lost, §2.1 violation noted in spec itself). Audited against live code this session. Phase 0 (pulse audit) complete — copilot/ollama heartbeats added. Phase 1 (read layer) built: `lib/nerve/index.js`, 16/16 tests passing. Phases 2+ not started. FieldMonitor/Living Glass dedup check (Phase 3) still open — see spec §E. |

## Intelligence Layer (2026-07-01)

| Spec | Version | Date | Status |
|---|---|---|---|
| `nexus-query-surface.spec` | 0.1.0 | 2026-07-01 | proposed — Phase 2 in build order. Prerequisite for everything else in the intelligence layer. |
| `copilot-system-programmer.spec` | 0.1.0 | 2026-07-01 | proposed — Phase 4. Depends on query surface. |
| `nexus-project-flow.spec` | 0.1.0 | 2026-07-01 | proposed — Phase 5. Depends on query surface + co-pilot programmer. |
| `nexus-relationship-shape.spec` | 0.1.0 | 2026-07-01 | proposed — Phase 3. Extends query surface with two-subject support + RFR2 delta wiring. |
| `nexus-optimization-service.spec` | 0.1.0 | 2026-07-01 | proposed — Phase 6. Depends on all prior phases. |
| `NEXUS-INTELLIGENCE-LAYER-INDEX.md` | 0.1.0 | 2026-07-01 | master index — dependency order, real vs proposed, what it looks like when running. |
| `NEXUS-LATTICE-COGNITION-ROADMAP-v0_1.md` | 0.2.0 | 2026-07-01 | living roadmap — v0.2 corrects RFR2 mischaracterization and Versionium/snapshot confusion. |

## RAID / Intelligence / COS Simulation (2026-07-01)

| Spec | Version | Date | Status |
|---|---|---|---|
| `raid-simulation-engine.spec` | 0.1.0 | 2026-07-01 | proposed — Phase 5 in build order. New module `cortex/core/raid/simulation.js`, wraps _decide() without modifying it. Completes RAID Layer 2 fitness (role_confidence, topological_proximity, snrTierGate become real values). |
| `rfr2.spec` | 1.0.0 | 2026-07-24 | ✓ DONE — Job 1 (9 modules, commit 9cff74a), Job 2 (harvested causality/sigma/adapter/kernel — 4 modules, not the originally-scoped 3 — then converted clip/compress/context), and Job 2b (harvested `forge` too, the ONE real live external consumer causal-nexus actually has — the 2026-07-21 audit's "2 consumers" claim was itself imprecise, checked directly: the "loom scanner" was a caveat comment, not a real require(); true count was 1, nexus-healer, migrated to the new path) all complete. rfr2 is 14/14 real CJS, zero remaining ESM, all verified by functional execution. Two real converter bugs found and fixed by testing the actual output, not trusting a clean grep: `import {X as Y}` producing invalid CJS destructuring, and `export async function` not being matched at all (silently dropping 4 of forge's 5 exports on the first pass). Real, unresolved version drift flagged (9 modules @5.0.0, 5 harvested @5.0.2) — not silently normalized. `meta/causal-nexus` still holds ledger/persist/projection/loader with zero consumers anywhere outside itself — confirmed dead weight from the rest of the system's view, but retiring the tree is still a real decision, not executed unilaterally from a grep. Suite: 31 rfr2-specific tests (up from 14), 806 total passed / 0 failed. |
| `nexus-intelligence-system.spec` | 0.1.0 | 2026-07-01 | proposed — master spec for the 7-layer intelligence stack. Names the three genuine gaps and the dependency-ordered 8-phase build path to close them. |

| `alk-gl-intelligence-canvas.spec` | 0.1.0 | 2026-07-01 | proposed — new driver module `canvas-intelligence.js` reading from intelligence system instead of audio. ALK-GL, canvas-cfr pattern, Eravos organisms all unchanged. One new data source. Phase 1-6 build order inside. |

## Session 2026-07-20/21 — organs, spine, consolidation (§6.3 entries on creation)

| Spec | Version | Last drift-check | Status |
|---|---|---|---|
| `hooks-migration.spec` | 1.0.0 | 2026-07-20 | ✓ Phase 1 IMPLEMENTED same session. Registry class → lib/hook-registry.js (git mv); loom = write authority (seed+sync+CRUD/wire); architect = read view + 410 pointer; orchestrator proxy reads→architect writes→loom. Blueprint's registry dep verified decorative (grep -c: 0). 6 ownership tests. |
| `registry-consolidation.spec` | 0.1.0-spec | 2026-07-21 | SPEC ONLY, no code. Maps all 3 registries + their real consumers (component: 12+, hook: 6, wire/seam: none-exists). §8.5 mandates the MISSING consumer side. 4 phases, P1 = consumer side on hook-registry (smallest, loom already owns it). Architect-fork objection recorded per §8.2/§17.3, OPEN. |
| `handshake-ledger.spec` | 0.1.0-spec | 2026-07-20 | SPEC ONLY, deliberately not built. Signed cross-system handoff receipts; bridge = sole writer (§10.1); RFR2 CQL = verification surface; 5 laws incl. no eternal 'pending'. Written spec-first so it doesn't become unspecced module #13. |
| `raid.spec` (addendum) | 6.3.0 | 2026-07-21 | ✓ UPDATED — universal_router addendum. RAID now decides TWO things on independent paths: which AI agent (existing _decide, untouched) and which SYSTEM fulfills a request (new router.js + envelope.js). Verified live vs real 217-cap registry. |
| `cortex.spec` (addendum) | 3.3.0 | 2026-07-20 | ✓ UPDATED — organs Phases 0-6 addendum, event-name corrections (deployed contract is `escalation.friction.increased`/`newFric`), foundation fixes (3 jaa-store _matches bugs at source), pressure reflex. Closes one of the 10 drift gaps. |
| `escalation.spec` (addendum) | 1.2.0 | 2026-07-20 | ✓ UPDATED — BUILT + new `nexus.resource.pressure` input → memory_pressure fault class. Oscillation damping NAMED as future work, not built. |
| `self-heal.spec` (addendum) | 1.1.0 | 2026-07-20 | ✓ UPDATED — BUILT. 5-level ladder, level from fault_taxonomy count, L2 propose-only. SEMANTIC_GAP_TYPES flagged as a §7.2 judgment call, not found spec. |
| `nexus-tablet.spec` | 0.4.0-spec | 2026-07-24 | **T1 BUILT + GATE-VERIFIED** (same day, per §8.5 spec preceded build). Read-only /ledger routes on autopilot's status server (disk-backed per the observation law; strict segment allowlist + resolved-path containment §4.3; corrupt lines counted, reported, never repaired §1.2) + `tablet/index.html` — single file, single endpoint (autopilot :7799), zero hardcoded ports, zero state, zero writes. Gate walked live against the real 462-file tree incl. hostile inputs; pinned in `test-tablet-ledger-api.js` (12 tests, registered). Honest limitation recorded: UI verified by contract, not pixels (no browser in sandbox). REST OF SPEC unchanged: container primitive, autopilot broker, observe/mutate boundary, change governance (ledger+registry+cortex), sigma/CFR/RFR2 detection. Blockers still real: B1 single-process consumers, B2 ESM/CJS (**substantially closed by today's rfr2 completion**), B3 UI unverifiable, B4 COS unwired, B5 replay-engine orphaned. T2-T3 have zero blockers, unbuilt. |
| `nexus-sentinel.spec` | 0.4.0-spec | 2026-07-24 | **NEW, SPEC ONLY** — the sovereign diagnostic-and-repair system James asked for. Written spec-first (§8.5) after a full scan (§8.4). Key framing: this is a **CONSOLIDATION of four existing surfaces**, not a greenfield build — `service/nexus-diagnostic.js` (2100 lines, supervised, live) is ~80% of it already and becomes the BASE; `cli/diagnose.js` becomes a client that keeps local checks (they work when the service is down); `nexus-healer/` is an orphaned scaffold to absorb-or-delete (§16.5); `cortex/self-heal` moves in (James's call). Building it *beside* nexus-diagnostic rather than *as* it is listed as the primary failure mode. The real gap driving the whole spec: the existing service is **poll-based and never subscribes inward** — a monitor, not a nervous system. Contains 3 scan-found hazards as first-class sections, the blocking one being **liminal-space's in-process subscription to `escalation.friction.increased`**, which a naive folder-move would kill silently. 7 laws (incl. SEN-7: a repair that did not happen cannot report success — earned from three real dead heal paths found the same day). Notifications decided: **yes in the tablet, no owned by the tablet** — the fault goes to the ledger, the notification is a projection read, so it survives a closed tab. 7 phases, S1 CLI-first. **v0.2.0 (same day):** James asked whether it uses the intelligence system and meta/ — answer was NO, a real hole. `cortex/intelligence` already maintains the pattern/failure-mode memory (bep_patterns, failures taxonomy, reuse index) and v0.1.0 would have been a SECOND pattern engine beside it, violating its own SEN-1. Added SEN-8 (never derive what you can consult), an intelligence section, explicit meta/ subsystem mapping (meta/gap as detection substrate, meta/rfr2 for causality, meta/confidence for scoring — noting EVIDENCE_LESS_DISCOUNT as §0.1 in numeric form), and phase S6b. Key finding: intelligence already has HTTP routes on cortex, so unlike self-heal it has NO cross-process hazard. Also verified: `service/nexus-diagnostic.js` references intelligence NOWHERE — an unclosed wire in live code, not just a spec gap. Name settled (James: "Sentinel is fine"), with the `nexus.organism.git-sentinel` near-collision recorded. **v0.3.0 (same day): two corrections from James, both execution-layer errors.** (a) Added SEN-9 decoupling law — bus/API/CLI/SSE only, never `require()` of another system's internals; the violator is CORTEX (`boot.js:113-119` requires the intelligence faculties in-process) while copilot correctly fetches them over HTTP. (b) **Copilot is the MIND, not cortex** — v0.2.0 prose described "asking cortex", inverting the architecture; copilot (port 3750) has its own faculties and queries cortex over HTTP, so cortex remembers and copilot thinks. Also **retracted a false claim**: v0.2.0 said intelligence "already maintains" bep_patterns/failures — it does NOT; `index.js` (933 lines) has never run, `init()` is never called, neither table has ever been created. Scoped turning it on: costs ~one line (init dry-run clean), and the decisive finding is that `copilot/intuition.js` reads `precursor/outcome/confidence` — **bep_patterns' shape** — while `_buildPatterns()` serves it from the `crystals` table, so the mind has always been asking for the core's output and getting a different engine's. **v0.4.0 (same day): James closed the loop** — contract → gated handshake → failed handshake IS a fault → every fault logged+tracked → intelligence reads ledgers AND causal graph → conditions + onset. Added `the_loop`, a universal `ledger_schema`, and phases S5b/S6c. Schema finding: **9 of the 13 requested fields already exist** in `component-ledger.write()`, so this is extend-and-enforce, not design-from-scratch. Pushback applied and recorded: **`next event` REFUSED** (append-only cannot know the future; requires mutating written rows, breaks immutability, and is derivable as `causedBy` reverse-index), **ledger file/dir as fields REFUSED** (already derived by `_partitionPath`; self-referential and drifts — the useful version is `sourceRef`), **embedded `context` REFUSED** (rows are ~303B and the tree is 9.6MB; a blob would roughly triple it — use references), **unconstrained `relation` REFUSED** until the enum types are named. Accepted: **hook + wire** (the strongest item — makes a row locatable in the architecture, recorded nowhere today), constrained `intent`, `faultId` by reference. Two REAL unclosed wires named: **intelligence reads no causal graph** (verified by grep — so "why" is temporal adjacency, not causation, though `meta/cfr/graph.js` CausalGraph with `ancestors()` is already reachable elsewhere in cortex), and **onset is recorded nowhere** — `fault_taxonomy` has `lastSeen`/`count` but no `firstSeen`, so nothing can be correlated to what changed. |

## Session 2026-07-24 — real gaps found, §17.1 (every artifact has an owner)

Two runtime files with real consumers and no dedicated governing spec — found
while auditing the JaaStore recursion fix and rfr2 CJS conversion against
AXIOMS v3.1 §8.5 ("do not build anything without creating a spec file
first"). One closed same session, one still open.

- **`guardian/jaa-store.js` (class `JaaStore`)** — CLOSED. `docs/jaa-store.spec`
  v1.0.0 written from live code (§3.3), registered above. Was mentioned only
  incidentally before this — as a byproduct of unrelated work: `cortex.spec`
  (`cortex/spec/cortex.spec`, `foundation_fixes`) records three `_matches()`
  where-clause bugs fixed at its source, and `hooks-migration.spec` mentions
  it once in passing (multi-process flush note) — neither documented its
  actual contract. NOT the same class `jaa-db.spec` governs (see that row's
  correction above).
- **`meta/rfr2/*`** — CLOSED. `docs/rfr2.spec` v1.0.0 written from live
  code, registered above. Job 1 (9 modules converted) recorded as done;
  Job 2 (clip/compress/context) recorded as an open, undecided
  harvest-vs-mark-incomplete choice — the spec existing doesn't mean
  the underlying work is finished, only that it's now honestly tracked.

## Session 2026-07-24 (cont.) — widening P0.3, real findings

James: "widen" — from the rfr2-only scope to the mind map's actual
Tier-0 item (meta/ + idearium ESM/CJS interop, "highest-leverage fix
in the system" per the 2026-07-21 full audit). Mapped current state
before touching anything (§3.3); it reframed the item substantially.

- **The ESM/CJS "fault line" is smaller than the 2026-07-21 audit's
  framing suggested, on THIS runtime.** Verified directly: Node 22.12+
  supports synchronous `require()` of real ES modules natively
  (confirmed live — `require('./meta/causal-nexus/modules/kernel/index.js')`,
  genuine `import` syntax, loads with zero conversion). The audit was
  written before this was checked against the actual installed Node
  (v22.22.2, confirmed in the 2026-07-24 boot log). `package.json`
  still declares `"engines": {"node": ">=18.0.0"}` — where this
  wouldn't work — so this is a real fact to weigh, not a green light
  to abandon conversion work: if <22.12 support genuinely matters,
  mechanical CJS conversion (Job 1's approach) or the async
  `lib/rfr2-bridge.js` remain the only portable options. Not decided
  here which floor the project actually needs — flagged for James.
- **meta/causal-nexus/ (36 of the 39 "ESM in meta/" files) should NOT
  be mechanically converted.** Already decided 2026-07-21: causal-nexus
  is the near-dead ancestor (2 consumers), rfr2 is canonical, harvest
  3 modules (kernel/sigma/adapter — see rfr2.spec's corrected Job 2
  section) then retire the tree. Converting 36 files' syntax just
  before deleting most of them would be pure waste (§0.5/§16.5).
- **A real, load-bearing bug found and fixed while mapping this.**
  `idearium/lib/event-ledger.js` and `idearium/lib/spec-container.js`
  are genuinely CJS (`require()`/`module.exports`, zero `import`/
  `export` of their own) but sat inside `idearium/`'s `"type":"module"`
  tree, so Node force-interpreted them as ES modules — every call threw
  `ReferenceError: require is not defined in ES module scope`. Caught
  by try/catch at both real call sites (`orchestrator/lib/sigma-writer.js`,
  `idearium/repo/watcher.js`), so the failure was loud at the require()
  boundary but silently absorbed one level up: `_getLedger()` had been
  permanently null forever, and every `.spec` archive ingested through
  `watcher.js` had been failing verification and never actually
  ingesting, logged as if it were a hash-mismatch/corrupt-archive
  problem — never was. Fixed by renaming both to `.cjs` (Node honors
  that extension as CommonJS regardless of an enclosing type:module) —
  not by rewriting them to real ESM, they never needed to be. All 3
  real call sites updated to the explicit `.cjs` path (a bare require()
  does not auto-resolve `.cjs`). `tests/modules/spec-container.test.js`
  existed, was orphaned (never registered in run-all.js), and would
  have crashed on its own require() if run — now registered, 9/9 pass
  for real, functional coverage (hash-mismatch rejection, truncated-
  archive detection, header parsing). New regression suite
  `test-idearium-cjs-under-esm.js` (7 tests) pins the fix and scans
  the rest of `idearium/` for the same pattern (found none — siso/ and
  meta/causal-nexus/, the other two `type:module` scopes in the repo,
  checked too, also clean). Full suite: 783 passed / 0 failed.

## Session 2026-07-24 (cont.) — cortex heartbeat gap, from a pasted boot log

James pasted a live boot log showing `[watchdog] cortex → OFFLINE`
during a busy multi-system boot window. Traced to root cause, not
patched blind: `orchestrator.js`'s `allHealth()` only flags a system
OFFLINE when BOTH the direct `/health` GET fails (3s timeout) AND the
registry's `lastSeen` is >15s stale (the fallback that should absorb a
transient miss). Checked every one of orchestrator's 3
`REQUIRED_SYSTEMS`: guardian, idearium, copilot, and ollama-bridge all
send a recurring `POST /api/heartbeat` (10s interval) that keeps
`lastSeen` fresh — cortex sent none, ever. It only had the one-time
`/api/register` at boot, so after the first 15 seconds of runtime it
ran with zero protection against any transient event-loop delay (e.g.
the synchronous multi-table JAA load every system does at boot — the
exact congestion visible in the pasted log's surrounding lines).
Confirmed this wasn't a process crash — autopilot's own "stable for
60s" fired seconds after the OFFLINE flag, meaning the process itself
was fine, only the HTTP health check briefly went unanswered.

Fixed: `cortex/boot.js` gained `_startHeartbeat()`, called once
registration succeeds, mirroring idearium's real working pattern
exactly (same interval, same payload shape, same fire-and-forget error
handling) rather than inventing something new. Pinned with
`tests/modules/test-cortex-heartbeat.js` (4 tests, including a real
HTTP round-trip against a live throwaway server proving the actual
payload arrives).

**Separate, bigger, NOT fixed here:** `tests/pipeline.test.js` — a
712-line, 10-section integration suite (heartbeat/project_registry,
gap-finder, healer, self-heal, snapshot/replay, agent-tools, full
pipeline, contract+RAID enforcement) — `require`s `../cortex/heartbeat`
at line 92, a file that does not exist anywhere in the repo. Confirmed
directly (not assumed): that require throws `MODULE_NOT_FOUND`
immediately, meaning **none of the 10 sections in this file have ever
been able to run**, not just the heartbeat one. This is a different,
larger concept than the outbound heartbeat just fixed above — the
test's own section name ("Heartbeat — project_registry population")
implies a local polling/population mechanism, not an outbound ping —
and building it blind from a test's expectations alone is exactly the
kind of real, scope-bearing decision this session has been deliberately
NOT making unilaterally. Flagged with its full blast radius quantified,
not built. Full suite (module tests only, `pipeline.test.js` is a
separate top-level suite outside `run-all.js`): 810 passed / 0 failed.



## Session 2026-07-24 (cont.) — storage direction DECIDED, first consolidation executed

James resolved the §10.3 competing-truth between his own two directives:
his 2026-07-18 "migrate all of the data nexus uses to cortex" (executed:
guardian_/idearium_ tables in the shared store) vs the 2026-07-21 mind
map's P0.1 "migrate strays to owners" (out-migration, never executed).
**His word: "1. stored in cortex." P0.1's out-migration is DEAD.** The
consolidation direction stands; remaining work is completing it, not
reversing it.

First straggler consolidated same turn: guardian's CFR ledger
(cfr_state.json / event_stats.json / event_log.jsonl — 8.7MB live).
The 2026-07-18 migration comment claimed its writer "wasn't found in
this file to migrate safely" — the writer was in the SAME FILE, ~60
lines above that comment (guardian/server.js:1606,
ledgerDir: guardian/memory_store/ — a live write target inside the
SOURCE tree, outside data/ entirely). Moved to data/guardian/ledger/cfr
(bridge's exact existing pattern). Data migrated by copy, byte-exact
verified; originals archived in place (§7.4). Functional resume proven:
30 event types + non-default CFR field (friction 0.0941, regime
resonant) loaded from the migrated files, not fresh defaults. CLI
helper paths updated (cfr-debug examples, diagnose listing). Pinned:
test-guardian-cfr-consolidation.js (5 tests incl. a repo-wide
live-reference scan). Suite: 836/0.

**Consolidation still remaining (mapped, not yet executed):** (a) the
dual ledger roots — guardian-service/diagnostic/bridge services write
data/<system>/ledger/*.ndjson while the canonical hook tree is
data/ledger/<system>/<hook>/<day>.jsonl; two truths about what
happened. (b) orchestrator's CFR ledger writes loose files at the
data/ledger TREE ROOT (event_log.jsonl, cfr_state.json,
event_stats.json, orchestrator.jsonl mixed among system dirs) —
untidy but already under the data root; lower priority than (a).
(c) ~35 assorted flat data files across architect/bridge/diagnostic/
emerge/orchestrator that never went through any migration — need
per-file writer identification before touching, same discipline as
this one.

## Session 2026-07-24 (cont.) — tablet T2/T3 built, B1 blocker closed

- **T2 container shell** — 4 routes on autopilot (contract proxy with the
  port taken from each kernel's own healthUrl so no second topology map
  exists; disk-backed JAA table reads; data subtree listing; real test
  invocation via a new `--filter` on the REAL run-all.js). Container view
  added to tablet/index.html. 14 tests. **Real flaw found and fixed at the
  class:** the test-invocation route allowed recursion — a suite filtering
  on a term matching itself makes the spawned runner re-run it, forever.
  Passed standalone (unregistered), failed the instant the full suite ran.
  Fixed both in the test AND architecturally (`NEXUS_TEST_RUN_DEPTH` guard
  on the route), because `_testRunActive` can never catch it — each nested
  run is a fresh process with its own state.
- **T3 change governance** — `lib/config-governance.js`, all five gate
  steps, deliberately thin: CFR's `record()` supplies the stamp+sigma,
  `component-ledger.write()` the canonical write+registry projection,
  `escalation.js` the friction. Emits `anomaly.detected` rather than
  computing friction, so no second truth about system health (§10.3).
  10 tests against real modules, nothing mocked; anomaly forced by
  threshold, never by a faked sigma score. **Not wired to any caller yet** —
  recorded honestly rather than claimed.
- **B1 CLOSED** — `lib/bus-subscriptions.js`. `consumer-registry.consumers()`
  read only the local EventEmitter while NEXUS runs 9+ processes, so every
  remote subscriber was invisible and `unconsumed()` called real work
  "emitted into the void." Now every process publishes its own subscription
  snapshot to the shared store and reads aggregate from disk (§5.12
  decoupling + the tablet's disk-backed observation law). **Staleness is not
  liveness:** live and stale counts are reported separately and never
  summed — a crashed process's last snapshot must not be drawn as live
  wiring. `consumers()` still returns a number for every existing caller
  (§5.14); `consumersDetailed()` adds the per-system breakdown and names its
  source. 12 tests. Two API assumptions were wrong on first attempt and are
  now pinned: JaaStore has no `find()` (it's `all()`), and `upsert()` MERGES
  — which would have kept an unsubscribed event type alive as a live edge
  forever; `insert()` with an explicit id does the required full replace.
  **T4 is now blocked only on publishers being wired into each system's
  boot** (the library is proven; no system calls `publish()` yet).

### B1 publishers wired (2026-07-24, same session)

`lib/bus-subscriptions.js` now has real producers, not just a proven library:
- **cortex** publishes from `_startHeartbeat()` — i.e. after registration
  succeeds, which is after boot wired its listeners. Publishing at module
  load would snapshot an empty bus and record cortex as consuming nothing.
- **orchestrator** publishes from `startWatchdog()` — after the server binds,
  same reasoning. It is a heavy subscriber (sigma-writer, request-handler,
  CFR influence poller) and every one of those listeners was invisible to
  other processes before this.
Both wrap the start in try/catch with a loud failure: observability must
never be the reason a system fails to boot.

**Honest scope limit — guardian CANNOT publish, and this is not an oversight.**
Its bus is a custom `_kernelEmit()` that forwards over HTTP to
orchestrator/cortex; it is not an EventEmitter and has no introspectable
subscriber set, so there is nothing to snapshot. Forcing a fake publish would
have put zeros in the map that read as "guardian consumes nothing." Recorded
rather than papered over. Any future EventEmitter-style bus in guardian can be
wired in one line.

**Store-facade compatibility fixed while wiring:** this codebase has two live
store facades — `JaaStore` (read-many = `all()`) and `cortex/memory/jaa-db.js`'s
`jaaDB` (read-many = `query()`, no `.all` on the facade). The first draft
supported only `all()`, which would have returned `observed:false` for cortex
and orchestrator — both of which hold the `jaaDB` shape — making the whole
cross-process map read as "no subscribers anywhere." Caught before wiring, not
after. Both shapes now supported and pinned (T-B1-015).

### 2026-07-24 — two standing decisions closed

- **Intelligence core SWITCHED ON** (James: "Yes to the core"). One line in
  `cortex/boot.js`'s organs array. 933 lines that had never executed — nothing
  required it, `init()` was never called, `bep_patterns`/`failures` never
  existed. Its three siblings were live, which is exactly why nobody noticed:
  the routes answered. Not a competing pattern engine — copilot reads
  `precursor/outcome/confidence`, which is `bep_patterns`' shape, so the core
  supplies what the mind was already asking for. Still open, deliberately:
  whether `_buildPatterns()` now serves `bep_patterns`.
- **`meta/causal-nexus` RETIRED** (James: "retiring causal, I don't want
  junk"). 37 files, 728K, zero code dependencies verified by require-grep,
  absent from the suite. Its useful modules were harvested into `meta/rfr2`
  earlier the same day and its one real consumer (`nexus-healer`) migrated, so
  nothing was lost with it. Git preserves the history — retired, not
  destroyed. Suite unchanged at 926 before/after removal, now 933 with the
  pinning tests.
| `docs/raid-warp-verification-phasemap.spec` | 0.2.0-phasemap | 2026-07-30 | RAID as the verification spine, governed by AXIOMS-v3.1 (87 laws parsed), new code via WARP logic (warp/core Axiom→Gate→Stream), drift accounted per phase. Supersedes raid-verification-spine v0.1.0. 11 phases (Part I verify spine + Part II co-pilot bridge): record→constitution→COS-isolate→sigma/drift→compare→rewind→one raid.verify() GateFusion; then P8 UI-as-tools, P9 gated-events-to-copilot, P10 diagnose+notify, P11 diagnose+repair-on-prompt (co-pilot as the bridge: user↔UI↔NEXUS). Connects built systems (constitutional-ai, cos/playground, replay-engine, sigma, meta/bda) through RAID. ALL 11 PHASES BUILT 2026-07-30, suite 1168/0. raid.verify() is the fused entry; copilot/assist-loop.js + repair-on-prompt.js are the bridge. |
| `docs/cortex-schema-registry-phasemap.spec` | 0.1.0-phasemap | 2026-07-30 | Schemas-per-system as expectation + integrity, living IN cortex as EDITABLE rows. FLUID not rigid: describes shape, observes writes, records deviation as drift data — NEVER blocks. Addresses "no flat" — jaaDB.insert validates nothing today. 5 phases: schema table in cortex → conformance-check lib (agnostic, lib/) → observe-on-write (non-blocking) → editable surface → expectation for consumers (makes user-model trustworthy). Builds outward from config-schema.validateConfig + SYSTEM-CONTRACTS (already names SCHEMA_VIOLATION). P1-P3 + UM1-UM4 BUILT 2026-07-30 (lib/schema-registry.js, user-model schema-observed + queried-everywhere + richer-capture + editable surface), suite 1168/0. |
| `docs/copilot-awareness-routing-phasemap.spec` | 0.1.0-phasemap | 2026-07-30 | Co-pilot self-awareness + intent routing. 7 phases: CA1 status-report (poll system+loom on "how are you"), CA2 tool self-awareness (edge cases + how-to-use), CA3 tool-first (look for a tool before fallback), CA4 capability-extend ("no is not an answer" → gap/module_builder), CA5 intent routing (perplexity=data, claude=big-code+WARP, chatgpt=optimal-900tok-chunked, gemini=coding/adversarial-secondary, claude=last), CA6 routing config (editable cortex rows), CA7 ClearGlass multi-account gear. Extends routing-ir + intent-classifier (exist). CA1 building now. |
| `docs/nexus-observability-tablet-phasemap.spec` | 0.1.0-phasemap | 2026-07-30 | Per-system tablet modules + full live diagnostics + movement mapping + real 3D visual. 9 phases / 5 chunks: E diagnostics (OB1 live diag + OB2 gap-detection), F movement (OB3 registry→CFR/ALK-GL map + OB4 bottleneck via sigma/delta/friction), G tablet (OB5 per-system modules+escalation + OB6 continuous ollama injection), H intelligence (OB7 optimization + OB8 pattern leverage ratio), H also OB10 sigma-role intent-map (sigma=deviation/performance/expectations/drift/leverage per component) + OB11 edge-case mapping. I visual (OB9 real 3D map, no mocks). Grounded in EXISTING substrate: tablet/ UI, cfr/field.js (friction/tension), sigma, capability-registry, cortex/intelligence, gap-hunter. Wiring+expansion, not greenfield. Map only. |
| `docs/component-registry.spec` (ADDENDUM 2026-07-30) | +CodeFactory | 2026-07-30 | FORGE-CodeFactory alignment: tier (component/mod, mod requires ≥1 component producer — enforced at register), seam boundary contracts (derivative of seam-block, not a second schema), similarity-sigma vs drift-sigma (two DISTINCT scalars — dedup/clustering vs baseline-drift; maps onto OB10 sigma-roles), promotion states (observed→candidate→pattern→component→module, evidence-required), anti-generalization guard (high structure + low semantic = do not merge). §10.3 stance: CodeFactory does NOT replace Architect/Eravos — loom stays registry-truth, Architect stays topology-declarer, CodeFactory Blueprint is a PRODUCER into loom. Design decision recorded, not enacted. |
| `codefactory/codefactory.spec.md` | v0.16 | 2026-07-30 | FORGE-CodeFactory combined spec (v0.15 living doc + Sigma Similarity 2c merged at its specified insertion point after 2b; 2c open questions folded into 8). Visual block/module code builder, no AI runtime dependency. 8 layers (0-7) + cross-cutting mandates 2a/2b/2c. Lives in codefactory/ folder. Registry-alignment recorded in component-registry.spec addendum. Phase 0 (Orient) — map only, no build. |

| `lib/activity-log` | 1.0.0 | 2026-08-04 | Per-system activity + error logging into cortex, riding the ledger fan-in. Full activity → event_log, errors → error_log, tagged by system, history preserved (append-only). Per-system enable/disable. |
| `lib/ledger-fanin` | 1.0.0 | 2026-08-04 | Unified event fan-in — every system emits, intelligence/autopilot/co-pilot subscribe once, see everything. coverage() names silent systems (the detection gap). |
| `CLAUDE.md` | — | 2026-08-04 | The persistent working agreement: map first, reuse first, wire the registry, addend specs, lose nothing. Read every session. Enforced by scripts/precommit-check.js. |
| `docs/nexus-live-mind-phasemap.spec` | 0.1.0 PHASEMAP | 2026-08-07 | The full vision mapped before build: P1 nervous system live (fan-in→intelligence/autopilot/copilot/logging), P2 snapshot-on-sigma, P3 diagnostic kernel (RFR2+CFR+loom+intelligence, causal conditions), P4 co-pilot system-aware (loom+diagnostic+intelligence, full toolbox), P5 co-pilot dynamic+user-aware (user-model), P6 co-pilot programmable (schedule/automate/workflows/switch-agent, RAID-governed). Dependency order P1→P6. Substrate already built this session; phases wire it. |
| `docs/gemini-multiagent-coding-phasemap.spec` | 0.1.0 PHASEMAP | 2026-08-07 | Multi-agent Gemini coding framework (James's structured-injection blueprint): P1 per-agent contracts (identity/axioms/scoped-toolbox/injected-context, extends gemini-toolbox CONTRACT + agent-router AGENT_CONSTRAINTS), P2 tree/parse/cortex-recall injection tool, P3 line/block/seam sync (extends the toolbox's line addressing), P4 structured JSON agent-to-agent, P5 autonomous multi-agent loop (via lib/autonomous-loop + RAID gate). Answers chunk-vs-seam, emerge-vs-cockpit. Dependency order P1→P5. Substrate largely exists (§8.6). |
| `docs/agent-intelligence-loop-phasemap.spec` | 0.1.0 PHASEMAP | 2026-08-07 | Wiring the multi-agent layer into NEXUS's live intelligence substrate (fan-in + RFR2 + CFR + cortex dynamic DBs + RAID) so injection strategy is LEARNED per agent, not hardcoded. James's clarified vision: push+pull context delivery, intelligence optimizing around each agent's constraints automatically, strategy as an evolving cortex database, RAID-governed. AP1 pull toolbox → AP2 agent events to intelligence → AP3 strategy dynamic DB → AP4 intelligence optimizes → AP5 autonomous build loop. Expands P3-P5 of gemini-multiagent-coding. All substrate exists (§8.6) — this is wiring, no new brain. |
| `docs/raid-routing-fidelity-phasemap.spec` | 0.1.0 PHASEMAP | 2026-08-08 | RAID as the governing routing layer: chunk→contract→RAID→best agent by signal-to-noise + fidelity. Major §8.6 finding: the SNR/fidelity gate (cortex/core/raid/snr-filter.js), per-agent token configs (agent-router), multi-account login (account-registry), and guardian↔clear-glass bridge ALREADY EXIST — ~70% wiring. Phases: RR1 verify/wire SNR-fidelity gate, RR2 contract-based token-sized chunking, RR3 per-agent config in cortex, RR4 governed handshake on handoff (+ enforcement-index.js), RR5 clear-glass accounts/features, RR6 cortex-fitness (= agent-intelligence-loop AP4 system-wide), RR7 per-system tablet dashboards (checkmk-style). Converges with agent-intelligence-loop at fitness. |
| `docs/loom-phasemap-section-phasemap.spec` | 0.1.0 PHASEMAP | 2026-08-08 | LP1+LP2+LP3 ALL DONE 2026-08-08. Consolidates all 16 phasemaps → splits phases by system → live in loom as a section. loom/scanners/phasemap-map.js (LP1+LP2) + /api/phasemap + /api/phasemap/:system in loom/server.js, registered in loom/registry-components.js v1.3.0, live view-roadmap in loom/ui/index.html (LP3). 8 tests (loom/test/phasemap-map.test.js). Verified live: 102 phases / 16 phasemaps / 19 systems, 58 done / 2 in progress / 42 pending. Spec closed. |
| `docs/nexus-system-standardization-phasemap.spec` | 0.1.0 PHASEMAP | 2026-08-08 | THE TARGET ARCHITECTURE: every system standardized — own folder, config, event-driven handshake-gated interaction contracts, full logging (error.log + event ledger + SSE to cortex), diagnostics-reads-and-fixes, dynamic commands, persistent cortex data, hashed integrity, fully decoupled via contracts/APIs. Census shows the pattern exists in fragments (guardian has config+contract, others don't) — this STANDARDIZES it. SS0 clear clutter → SS1 manifest → SS2 config → SS3 handshake contracts → SS4 logging → SS5 diagnostics-fix → SS6 dynamic/fluid → SS7 decoupling audit. The spine all other maps hang on. SS6 converges with raid-routing RR6 + agent-loop AP4. |
| `docs/copilot-autonomous-phasemap.spec` | 0.1.0 PHASEMAP | 2026-08-08 | CA1-CA5 ALL DONE 2026-08-08 (CA6/CA7 not started). CA1 scheduler, CA2 triggers/conditions, CA3 pipeline chains, CA4 http/sse connections, CA5 system control + governed clear-glass/DOM — lib/scheduler.js, lib/triggers.js, lib/chains.js, lib/connections.js, lib/system-control.js, all registered in loom/maps/observability-map.js. 43 tests total (7+10+8+8+10), all passing. Three spec assumptions checked against real code and corrected: CA3's "composes execution-pipeline" (that module is a code build/verify/promote pipeline, unrelated — built lib/chains.js fresh), CA5's "revertible via integrity-revert" (file/snapshot-grained, wrong tool for one settings row — built a right-grained undo log), and CA5's clear-glass DOM storage (already existed in clear-glass/src/driver/index.js — the real gap was a governed entry point, not DOM access). Two real bugs caught by tests before shipping: a fan-in synchronous-emit race in CA2, a null-vs-undefined prior-value bug in CA5's revert logic. CA6/CA7 remain open. |
