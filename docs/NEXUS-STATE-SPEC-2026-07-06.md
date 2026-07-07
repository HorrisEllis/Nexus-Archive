# NEXUS — SYSTEM STATE SPEC (2026-07-06)

**What this document is:** a single, honest account of what's actually true about NEXUS right now — verified by running real code against real data, not inferred from comments or specs. Every claim below was checked this session. Where something is uncertain, it says so instead of guessing.

**What this document is not:** a description of the intended architecture (that's what the per-system `.spec` files under `docs/specs/` are for — and Part 4 below reconciles this doc against those). This is the ground truth layer underneath them.

**Standing rule going forward:** if a per-system spec and this doc disagree, one of them is wrong. Check which, fix the wrong one, don't average them.

---

## PART 1 — System inventory, real status

| System | Port | Real role | Status |
|---|---|---|---|
| `orchestrator.js` | 9000 | Root kernel, unified API, SSE bus | Real, running |
| `guardian/` | 7820 | NCP browser-tab AI orchestration, SEAMQueue dispatch | Real, largest system (13k+ lines), heavily patched this session |
| `cortex/` | 3748 | Memory substrate, CFR field, RAID engine | Real; Unified API (push/recall) built from scratch this session — was 100% spec, 0% code before |
| `bridge/` | 9999 | Cross-system P2P router, circuit breaker | Real; was the only system with zero Cortex writes, fixed this session |
| `idearium/` | 4800 | Idea lattice, spec-chunk engine | Real; chatgpt/claude dispatch path was a complete dead end (928/928 failures traced to root cause), fixed this session |
| `architect/` | 3747 | UTL intent extraction, Gap/Constraint/Tension schemas, hook registry, topology scanner | Real; intake pipeline was 928/928 total failure, traced and fixed; has two real UIs (`/ui/spec-builder`, `/ui/arch-builder`) that were unreachable from the dashboard until this session |
| `copilot/` | 3750 | Dual-cognition (intuition/analysis/adversarial), lifeline router | Real; `/bridge/deliver` double-wrap bug (silently ate every real answer) fixed this session |
| `ollama/` | 3749 | Local model job queue | Real; now the first and only production caller of WARP's dispatch layer, wired this session |
| `loom/` | 3752 | Component/hook/wire/seam registry, scaffold engine, iteration archive | Real; had zero HTTP endpoints despite tested working library code underneath — wired this session, console forked from Idearium's real UI |
| `emerge/` | 4242 (optional) | `.spec` → KnowledgeGraph compiler | Real; this is the system that actually proves `runtime.spec` self-compiles |
| `meta/` | — (library, no own port) | CFR, RFR2, BDA, gap hunter, ALK, telemetry-codec, liminal, adversary-suite (13 modules) | Real code, one real consumer (`orchestrator.js`), touching 3 of 13 modules. Unwired, not broken. |
| `warp/` | — (library) | Content-addressable cache, population store, cascade, axiom-gate, and as of this session, the core `Event`/`Gate`/`Stream`/`Axiom` primitives | Real; had zero production callers before this session; now backbone of `ollama/server.js` and `lib/seam/` |
| `lib/seam/` | — (library) | Structured build-contract chunking (distinct from Guardian's prose-based `SEAMQueue`) | Real; built this session; migrated onto WARP's core (not the plain inline SISO copy) this session |
| `raid` (`cortex/core/raid/`) | — (library) | Provider routing, health/fitness scoring | Real; fitness formula is honestly 1/4 real (`healthScore`) and 3/4 stubbed at `1.0` (`roleConfidence`, `topologicalProximity`, `snrTierGate`) |

---

## PART 2 — What's fixed this session, in causal order (each depended on the previous being real)

1. **`bridge/router.js` → `copilot/server.js` double-wrap bug.** Copilot pre-wrapped its answer in `{result:{response:{...}}}` before `ResultGate` wrapped it again — real text ended up two levels deeper than every consumer's unwrap chain expected, silently resolving to `''`. Confirmed live via a user screenshot mid-session showing the exact bare stub this predicts. Fixed, traced through the full real chain.

2. **`bridge/ledger.js` had zero Cortex writes.** The one system routing everything, with no visibility into it from memory. Mirrored via `lib/cortex-write.js`, same pattern every other system uses.

3. **Guardian's inline dropzone `autoUpload()` threw on every call.** `registry.autoUpload` was never defined on the stub registry object it called into — uncaught `TypeError` on every job completion with a code artifact, zero try/catch. Extracted the real, working part into `guardian/artifact-upload.js`; deleted the 278-line broken duplicate of `guardian/dropzone.js`.

4. **Guardian: dead TLS/cert-gen code, dead WSS stubs.** `generateCertWithNode()` referenced `KEY_FILE`/`CERT_FILE`, never defined anywhere. `ensureCert()`, its supposed caller, didn't exist. `startWSS()`/`onWss()` were no-op stubs, zero call sites. Removed. `guardian/server.js`: 4,275 → 3,959 lines.

5. **`guardian/memory.js` (756 lines) deleted** — a complete, unreferenced duplicate of the *live* inline memory server already running in `guardian/server.js` on the same port.

6. **`guardian/lab/lab.js` moved to `cos/playground/llm-lab.js`** — same category as `compare.js` (run twice, compare, log verdict), LLM-specialized instead of branch-specialized.

7. **Loom given real HTTP endpoints for real, tested library code that had none:** `LoomIngest.ingestZip()` → `/api/ingest`, `/api/ingest-upload` (real binary upload, real drag-and-drop, not a typed path — browsers never expose real filesystem paths for dropped files). `scaffoldSystem()` → `/api/templates`, `/api/scaffold`. Console at `/`, forked from Idearium's real UI (an original design was correctly rejected first).

8. **Mistral console fixed onto the real pipeline** — was POSTing straight to raw Ollama, bypassing the queue/ledger/sigma-delta scoring entirely; a second, disconnected path alongside Guardian's own existing redirect for the same provider.

9. **`lib/seam/` built from scratch** — agnostic build-contract chunking (Registry→Classify→Axiom→Cascade→Persist), distinct from Guardian's prose-based `SEAMQueue`. Adapters for WARP and Cortex are opt-in, not required by the core.

10. **`warp/dispatch/index.js`'s axiom-gate bug** — `evaluateAxioms()` closed over the fixed request event, never the candidate's actual output. Every candidate was checked against the same thing regardless of what was generated. Fixed; each candidate now gets its own event carrying its own output.

11. **WARP given its first production caller** — `ollama/server.js`'s job dispatch, previously a raw uncached call every time. Now runs through `unifiedDispatch` with WARP's own `FlatFileCrystallizer` + `PopulationStore`. Proven: 3 identical dispatches build population evidence, 4th+ serve from cache, zero model calls.

12. **Cortex's Unified API built from scratch** — `push()`/`recall()` didn't exist; the spec described them, the real endpoint was a raw `{table,row}` passthrough with no schema, no IR, no validation. Built `cortex/push-recall.js`: real lexical + recency scoring (2 of 5 lanes — causal/failure/BEP need structures that don't exist yet, said so directly rather than fake 5/5). Found via adversarial testing: no size limit (10MB accepted) — fixed, 256KB ceiling, tested at the exact boundary both directions.

13. **`RoutingIR`** (`cortex/core/raid/routing-ir.js`) — wraps RAID's real `_decide()` honestly: `mode: 'rule_based'` when LAW_I/LAW_III fire (no real competition happened, `confidence: null`, not fabricated), `mode: 'competitive'` only when a real fitness comparison occurred, with real numbers.

14. **Architect's UTL pipeline: 928 real calls, 928 failures, zero exceptions, traced to root cause.** Not Architect's bug — `nexus-heal-loop.js`'s bus listener matched events by *name* substring only (`.gap.found`), never checked *shape*. Guardian's userscripts emitted `cortex.gap.found` shaped `{jobId, gaps: [...], source}` — a plural array, none of the fields (`description`/`type`/`body`/`path`) a single-gap classifier expects. Fixed both sides: the listener now checks shape before processing; the userscripts now emit one correctly-shaped event per real issue instead of one batch that hid every one of them. Verified: real extraction now produces real `Constraint`/`Gap`/`Tension` objects with real confidence scores.

15. **Architect's dashboard entry point was a 404.** The tile's `onclick` opened the bare root (`GET / not found`, confirmed live) instead of the real, working `/ui/spec-builder` (64KB, real intent-input UI, confirmed `200`). Fixed.

16. **Idearium's chatgpt/claude dispatch path: a genuine dead end, not just unverified.** `buildChunkWithAgent()`'s own comment said "return jobId so caller can poll" — nothing ever did. Zero real callers of the one endpoint that could have closed the loop. A chunk routed to chatgpt/claude sat in `BUILDING` state permanently. Built the real poller against Guardian's actual `GET /jobs?limit=N` (no single-job endpoint exists), wired it through the same Detector verification a direct response gets. Tested three ways: mock server transitioning running→complete, the exact timeout math with a short real deadline, and the field-name inconsistency Guardian itself has (`responseText` vs `result` depending on code path) — checks both.

17. **Three real duplicate/false-alarm findings, each resolved the correct way for its own case, not uniformly:**
    - `meta/gap/hunter.js` / `guardian/lib/gap-hunter.js` — confirmed byte-identical (diff after normalizing import paths). Real duplicate. Consolidated: `guardian/lib/gap-hunter.js` is now a one-line forwarding shim to the canonical `meta/` version. Verified same function reference, not just matching shape.
    - `cortex/boot.js`'s `_intuitionAnswer()` vs `copilot/intuition.js` — **not a duplicate**, on closer read. Different faculties; `copilot/server.js` already calls both correctly, in sequence. An earlier claim in this same session overclaimed a duplicate here — corrected rather than silently acted on.
    - `SEAMQueue` vs Idearium's `CHUNK_STATES` — confirmed real (SEAMQueue's own header states the identical purpose in words). Built the safe half (`lib/seam/chunk-lifecycle.js`, a canonical cross-system state vocabulary, verified against every real state value from both live systems) without touching either system's actual persisted data — Idearium's specs on disk already have lowercase string values from past sessions, renaming them would silently break every saved spec. The deeper behavioral merge (giving Idearium's crude attempt-counter real multi-strategy retry + Detector verification) is real, scoped, and still open.

18. **WARP's core extended to genuinely replace SISO, not just be positioned to.** Checked first: WARP's own `Event`/`Gate`/`Stream` already existed as a real superset of canonical SISO (adds `Axiom`-based validation, `matches()` predicates, `validateOutput()` schema checking) — 6 real files already used it (`loom/schema/*` among them), 16 still used the plain inline copy. Found a real gap before migrating anything: WARP's `Stream.emit()` was synchronous-only, but `lib/seam/gates.js`'s `CascadeGate`/`PersistGate` are inherently async. Extended `Stream.emit()` to detect a thenable return and only go async then — checked a real current consumer (`loom/schema/driver.js`) first, confirmed a blanket `async emit()` would have silently converted its synchronous error-throwing into unhandled promise rejections. Added real `.on(type, handler)` pub/sub observation, which WARP's core genuinely lacked. Verified against Loom's actual 18-test production suite twice (18/18 both times), plus new tests for sync/async/mixed chains and the exact regression case. Migrated `lib/seam/gates.js` and `build-contract.js` onto WARP's core; re-ran the full pipeline against real `runtime.spec` — same real distribution (52 modules, 9 dispatched, 43 skipped, 52 persisted) as every prior run, now on the new backbone.

---

## PART 3 — Confirmed real, not yet connected (the dominant bug category this whole session)

These are not broken — they're built, tested where noted, and unwired. This is worth naming as its own category because it was, by far, the most common thing found: a system built correctly in isolation with no path connecting it to anything real.

- **`meta/`'s 13 intelligence modules** — one consumer, 3 modules touched, status-endpoint depth only.
- **RAID's `RoutingIR`** — built, tested, zero production callers except this session's own test scripts.
- **`lib/seam/adapters/warp-cascade.js` and `cortex-persist.js`** — same: built, demoed, not wired into Guardian/Idearium/Copilot's real dispatch paths.
- **`lib/agent-tools/`** (in progress, started this session, not finished) — sovereign tool-calling core for models, `read_file` tool designed, not yet wired to Ollama's `/api/chat` or tested against a live model.
- **`architect/src/ui/arch-builder.html`** — real file, never inspected this session for what it actually does or whether it's wired to real data.
- **RAID's fitness formula** — `roleConfidence`, `topologicalProximity`, `snrTierGate` all hardcoded `1.0`, each with a comment naming the real, unbuilt system that should compute it.

---

## PART 4 — Confirmed real problems, explicitly not yet fixed, named precisely rather than left implicit

- **The 16-file SISO→WARP migration is 2/16 done** (`lib/seam/gates.js`, `build-contract.js`). The other 14 — `bridge/router.js`, `bridge/identity.js`, `bridge/ledger.js`, `bridge/registry.js`, two entire separate SISO copies (`emerge/siso/`, `cos/siso/`, 4 files each), `clear-glass/siso/index.js`, `meta/causal/compound.js`, `cos/host/event-bus.js`, `ui/tv-shell/warp-ui/warp-browser.js` — each need the same per-consumer verification `loom/schema/driver.js` got before touching anything, not a batch find-and-replace.
- **Guardian's own job-completion inconsistency** (`responseText` in one code path, `result` in another) is the source data the Idearium poller has to work around — the poller's dual-field check is a real, honest patch over a real inconsistency in Guardian itself, not a fix to Guardian.
- **Idearium's `CHUNK_STATES` still has no real retry-strategy escalation or Detector-based verification** — `chunk-lifecycle.js` gave both systems a shared vocabulary to translate into; it did not give Idearium `SEAMQueue`'s actual behavior.
- **`arch-builder.html`** is unverified — real file, unknown real behavior.
- **The deployment gap, mentioned every time a live screenshot showed an already-fixed bug**: every fix this session lives in this sandboxed copy. Nothing is true on the user's actual running system until these files replace what's running there and the affected services restart.

---

## PART 5 — Architectural decisions made this session, stated as decisions, not discoveries

- **WARP is the backbone, replacing plain inline SISO, going forward.** Not a new direction invented this session — 6 files already did this; this session made it correct to keep doing (extended real gaps in WARP's core first, migrated 2 more files, verified against real production tests both times).
- **`lib/seam/`'s core stays backend-agnostic** — WARP, RAID, and Cortex are opt-in adapters a caller wires in, never hard dependencies of the chunking logic itself. This was tested by construction (a caller can register only `RegistryGate`+`ClassifyGate` for a read-only feed with zero LLM involvement).
- **A regression in a status flag is worse than no flag at all.** The phase-map has caught itself overclaiming completion at least three times this session (a cited file that doesn't exist, a claimed duplicate that wasn't one, a "connected via guardian job callback" that was never built) — each correction is recorded in the living document rather than silently fixed.

---

## PART 6 — Spec-vs-spec and spec-vs-reality gaps found while cross-checking this document

Checked the most session-relevant of 100+ `.spec` files against what's actually real. Not exhaustive — flagging what surfaced, not claiming full coverage.

- **`docs/raid.spec` presents the fitness formula as fully computed** (`fitness = SNR_tier_gate(task) * ...`) with no disclosure that `roleConfidence`, `topologicalProximity`, and `snrTierGate` are hardcoded `1.0` in the real code (`cortex/core/raid/index.js`) — only `healthScore` is real. The spec reads as if scoring is real; 3 of 4 terms aren't. Same "spec describes intent, code has a comment admitting the gap" pattern found in Cortex's Unified API earlier this session.

- **Two different Cortex specs exist, and neither matches what got built.** `docs/cortex.spec` (v3.2.0, YAML — `CortexMemory: {uuid, key, value, tags, source, tier, ts}`, `FaultTaxonomy`, `FailureMode`, `ChatLog` schemas) is a different document from `docs/specs/CORTEX.spec.md` (the Unified API / push-recall / 5-lane MQL spec this session worked from). `cortex/push-recall.js`'s real `{content, tags, tier}` shape doesn't match either spec's schema exactly. Not reconciled — worth a real decision on which is canonical before building further on top of either.

**Given 100+ spec files exist and only a handful were checked, this section should be treated as "confirmed problems exist in this category," not "these are the only two."** A full spec-audit is its own real task, not something this pass completed.

---

## PART 7 — Session continuation (same date, later pass): AXIOMS v3.1 held, wire-integrity tool built, intelligence-suite wiring begun

**AXIOMS v3.1 received and held.** New Group 0 (five meta-laws), Group 17 (Artifact Governance & Provenance), and two build-discipline laws extracted from WARP v1.4 itself (§17.10 verify-before-promote, §17.11 benchmark-named performance claims — both already validated by this session's own WARP cache testing, not new obligations). **§17.7 ("never fix the symptom twice — the third occurrence promotes to architecture") directly indicted this session's own pattern**: five separate "declared wire, not implemented" bugs had each been fixed as isolated patches (bridge/copilot double-wrap, Guardian's dropzone, Architect's heal-loop shape mismatch, Idearium's queued-chunk dead end, orchestrator's missing heartbeat/bus-stats routes) without ever building the missing primitive underneath all five.

**Built that primitive: `scripts/verify-wires.js`.** Uses the real 82-hook registry (`hooks/index.js`) to check every declared cross-system endpoint against the receiving system's real source, instead of tracing threads one at a time. Honest about its own limitations, not just the system's — first run surfaced 19 candidates; 2 were confirmed false positives from the tool's own blind spots (segment-based routing like `sub === 'heartbeat'` doesn't match a literal path string; a prefix-stripping bug on `/bridge/register`), corrected rather than hidden. The remaining candidates were checked by hand, not trusted blindly.

**Three new, real, previously-unknown findings from one automated pass:**
- `copilot`'s three declared axiom endpoints (`/api/axioms`, `/api/axioms/add`, `/api/axioms/remove`) don't exist anywhere in the real code — `copilot/axiom-manager.js` is real and separate, never wired into the HTTP API.
- `cortex`'s snapshot/self-heal paths have silently drifted from the registry: real code implements `/api/snapshot`, `/api/snapshots`, `/api/self-heal/status`; the registry declares `/api/snapshots/create`, `/api/snapshots/rollback`, `/api/self-heal/run`. Same functionality, different names — a caller trusting the registry 404s against working code.
- Architect's SNR gate has no receiving endpoint on Ollama at all.

**User context that reframes several earlier findings, not new bugs:** Copilot and Ollama were recently split out of Guardian into their own sovereign systems, and a separate "pattern engine" was migrated into what's now `copilot/intuition.js`. Checked `hooks/guardian.hooks.js` for stale post-split ownership claims — clean, no stale entries found.

**"Pattern engine migrated to intuition" — traced to a real, concrete, fixed gap.** `copilot/intuition.js` has called Cortex's `/api/intelligence/patterns` expecting `{precursor, outcome, count, confidence}`-shaped objects since it was written. The real function behind that endpoint was a crude event-type tally producing `{type, count, lastSeen}` instead — every field intuition actually reads has been `undefined`, meaning "Crystallised patterns" has silently rendered as `undefined → undefined (NaN%)` on every real use, never a runtime error, never noticed. The real pattern engine is `meta/crystal-lattice.js` (module 1 of the 13-module intelligence suite) — real `(domain, verb, outcome)` crystallization logic, writing to a real `crystals` JAA table. Rewired `_buildPatterns()` to read that real table. **Proven**: inserted an actual crystal record, got back exactly `guardian:dispatch → PASS (7×, 92%)` — real shape, real values, not simulated — then removed the test record.

**Traced crystal-lattice's write side, found a real bug, then found my own fix's actual scope was narrower than first claimed — corrected rather than left standing.** `orchestrator.js`'s only real trigger for the autonomous loop (`/api/autonomous`) initialized with `jaaDB: null` — same bug, independently, in the hot-loader init two lines above it. Fixed both to use the real `jaaDB` this same file already imports correctly elsewhere. But then checked `crystal-lattice.js`'s `_getJAA()` directly and found it does its own independent `require()` of the real jaaDB module, entirely bypassing whatever gets threaded through `compartment-engine`/`autonomous-loop`'s init chain — meaning crystal-lattice was **never actually blocked by that specific null**. The fix is still real and valid for whatever else depends on the injected parameter; it does not, on its own, prove crystal-lattice actually accumulates real data in production. **Still genuinely open:** whether `/api/autonomous` (which requires manually-supplied `goal/budget/boundary/exit` parameters) is ever invoked by anything besides a direct API call — not confirmed either way.

**Intelligence-suite wiring status, updated:** 1 of 13 modules (`crystal-lattice`) now has a real, tested, fixed consumer path (`intuition.js` → Cortex's patterns endpoint → real crystal table). The other ~11 (RFR2, BDA, gap hunter beyond its existing 7 consumers, ALK, ALK-perception, spatial, causal, telemetry-codec, liminal, topo-kernel, adversary-suite) are unchanged from Part 3's "confirmed real, not yet connected" status.

---

## PART 8 — "Cortex API is vital": snapshot rollback built and proven, self-heal deferred, and a real regression I introduced was caught and fixed before it compounded

**Full sweep of every hook touching Cortex (14 total, 7 checkable) confirmed 4 solid, 3 already-known-drifted.** `/api/event`, `/api/intelligence/context`, `/api/memory`, `/api/gaps` all real and correctly implemented. The other 3 (`snapshot-create`, `snapshot-rollback`, `self-heal-run`) were checked properly rather than assumed to be simple naming drift — they turned out to be **genuinely missing functionality**, not just a registry/code naming mismatch.

**Built and proved real snapshot rollback.** Cortex could create and read snapshots, but nothing ever restored state *from* one. Added `POST /api/snapshot/rollback`. Tested the actual state machine, not just the response shape: mutated the CFR field, took a snapshot, mutated further, rolled back — confirmed the field genuinely returned to the snapshotted values (`coherence: 0.1, friction: 0.9`), not just a 200 response.

**Self-heal/run deferred, honestly, rather than built carelessly.** Real trigger requires a generic bus-emit passthrough on orchestrator that doesn't exist yet — correctly identified as the dependency, not built in a rush at the end of an already-long session.

**Caught and fixed a real regression I introduced earlier this session, before building anything further on top of it.** While wiring the self-heal work, found that my own earlier fix (the `/api/heartbeat` + `/api/bus/stats` fix from several turns back) had added a *duplicate* heartbeat route that fired before — and therefore permanently shadowed — a real, richer, pre-existing heartbeat handler (`SYSTEM_REGISTRY` tracking, SSE broadcast, full health-snapshot response) that had been correct and working the entire time. My fix's actual useful line (`nexusBus.emit(...)`, which genuinely closed the Nerve `_sources` gap) was real; the separate duplicate route around it was not. Merged the one real line into the actual pre-existing handler, deleted the duplicate, re-ran the identical test from before: confirmed `/api/bus/stats` still populates correctly *and* the real handler's full health-snapshot response now fires again instead of the bare `{ok:true}` the duplicate used to return.

**Why this matters more than the fix itself:** this is exactly the class of error AXIOMS v3.1's §17.7 exists to catch — a fix that looked complete because it passed its own test, while quietly breaking something adjacent that wasn't being tested for. Caught here by re-reading the surrounding code before extending it further, not by a test failure — worth naming as a practice, not just a one-time catch.

---

## PART 9 — "What if it all uses CFR and RFR2 to map and route": not hypothetical, already the documented design for one of RAID's three stubs — built, caught a real mistake mid-build, fixed, proven

**This wasn't a new idea to evaluate — it was already written into RAID's own code as its stated, unbuilt dependency.** `topologicalProximity = 1.0; // stub — needs CFR _byComponent edge, not built (docs/cfr.spec)`. Checked the spec: `_byComponent` was already planned, described as "zero new CFR API surface, same ring-buffer pattern, fifth edge type, automatic" — meaning the mechanism to build it already existed as a pattern (5 real edge types already live in `meta/cfr/graph.js`: causal, session, job, temporal, type-sequence), just missing this one.

**Built the real edge type and a real query method, tested against four cases before touching RAID at all:** same-component (1.0), causally-adjacent via a real edge (correctly high), never-co-occurred (0), and unknown component (0) — all confirmed correct against a real constructed graph, not assumed.

**Wired into RAID's `_fitness()`, and caught a real bug in my own first version before it shipped.** The first wiring passed `dispatchName` (a provider name like `'ollama'`) directly as the target `componentId` to check proximity against. Tested it immediately rather than assume it was fine: this **always returned 0**, because a provider name like `'ollama'` never matches a real graph componentId like `'ollama.generate'` — different namespaces entirely. As written, this would have made every fitness score multiply by zero the moment a graph was supplied — a worse regression than the original neutral stub, not an improvement. Caught by testing before considering the work done, not by a later bug report.

**Fixed correctly:** `_fitness()` now requires the caller to supply an explicit `targetComponentId` — no dispatchName-to-componentId mapping is fabricated. Without that explicit mapping, it falls back to the same neutral `1.0` as "no graph supplied," rather than silently computing a wrong proximity. Tested all three real paths: no graph (neutral, unchanged from before this session), graph without explicit target (still neutral, not silently wrong), graph with a correct explicit mapping and real graph distance (real computed value, proven differentiated with a genuinely-unconnected pair producing exactly `0`).

**Honest scope of what this closes:** one of RAID's three stubbed fitness terms (`topologicalProximity`) now has a real implementation path, opt-in via dependency injection, zero regression for any existing caller. `roleConfidence` and `snrTierGate` remain honest stubs, unchanged. Nothing yet calls `_fitness()` with the new `graph`/`componentId`/`targetComponentId` options in production — this is proven-correct infrastructure, not yet a live behavioral change, matching the same honest distinction made for `RoutingIR` and the WARP-cache wiring earlier this session.
