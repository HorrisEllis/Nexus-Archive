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

---

## PART 10 — Closing forge.spec's three named gaps: two real, tested advances, one honestly deferred

**Gap 1 (RAID → routing) — traced deeper than expected, fixed what's fixable from this side.** Wiring RAID into "ollama's dispatch" turned out to be based on an imprecise premise — `ollama/server.js` only ever talks to the local daemon, it doesn't route between providers. The real undecided choice lives in `copilot/lifeline.js`'s escalation step, which still had the exact bug found many turns ago: `provider: opts.provider || 'auto', // RAID picks best available` — a comment claiming something that called nothing. Wired the real `buildRoutingIR()` call in. **But tracing the receiving side surfaced something more fundamental**: Guardian has zero working synchronous ask endpoints. `/api/copilot/prompt` doesn't exist. The one real alternative, `/chatgpt-mode/query`, is correctly built but 503s always — its own required file, `guardian/agents/chatgpt-mode.js`, doesn't exist either. RAID's decision now flows correctly (tested: `selected: 'claude'`, real LAW_III reasoning) — it just terminates at a broken endpoint on Guardian's side, which isn't fixable from lifeline.js. Named precisely rather than left as a vague "still doesn't work."

**Gap 2 (agent-tools loop) — finished and proven end to end.** Built `read_file` (real path-containment check, tested against the exact traversal strings proven dangerous elsewhere this session, plus nonexistent-file and directory-not-file cases). Built the real `_callOllamaChatWithTools()` using Ollama's actual `/api/chat` with `tools` declared (not `/api/generate`, which has no tools param). Added `POST /api/jobs/tools` as a separate endpoint from `/api/jobs` — a tool-enabled request has a different cost/latency profile, a caller opts in rather than getting a silent mode-switch. **Full loop tested with a mock model**: requested `read_file` on turn 1, received real file content (not fabricated — confirmed the actual string `runToolLoop` was in the returned content), used it correctly in turn 2's final answer. Caught and fixed a real self-inflicted bug during this same build: a `str_replace` edit consumed `_callOllamaRaw`'s function-declaration line while leaving its body orphaned — caught by `node --check` immediately, not left for a runtime surprise.

**Gap 3 (self-heal) — correctly still deferred, not attempted at the tail end of an already very long session.** `lib/diagnostic-engines.js` computes real diagnoses and calls nothing downstream. This is real new engineering, not wiring — the same honest distinction made throughout this document between "connect what's real" and "build what's genuinely missing."

---

## PART 11 — Full connection map: copilot gaps (exhaustive), CFR/RFR2 consumer graphs, lib/ folder audit

**Copilot — every one of its 20 declared hooks checked, not sampled.** 15 have a real HTTP path to verify; all 15 checked directly against `copilot/server.js`. **The gap is exactly and only the 3 axiom endpoints** (`/api/axioms`, `/api/axioms/add`, `/api/axioms/remove` — `copilot/axiom-manager.js` exists, real, separate, never wired into the HTTP API). Every other declared copilot hook — `/api/prompt`, `/api/stream`, `/api/stream/ingest`, `/api/sessions`, `/api/lifeline/health`, `/api/build`, `/api/diagnose`, `/api/diagnose/list`, `/api/prompt/fulfill`, `/api/prompt/stream`, `/health`, `/contract` — is real. Copilot is not broadly gapped; it has one precise, bounded gap.

**CFR — 11 real production consumers**, confirmed by direct grep: `architect/service.js`, `bridge/causal/graph.js`, `bridge/index.js`, `cli/cfr-debug.js`, `cortex/boot.js`, `guardian/server.js`, `idearium/index.js`, `meta/causal/compound.js`, `meta/index.js`, `orchestrator.js`, `orchestrator/lib/sigma-writer.js`. Genuinely load-bearing infrastructure, not a stub.

**RFR2 — zero real consumers, confirmed completely.** Not one file anywhere requires `meta/rfr2/*`. 13 real, built submodules (identity, enforcement, lazy, query, clip, delta, version-gate, observer, time, compress, context, adapter-sandbox) sitting unconnected. Matches every RFR2 finding across this entire session — this is the single largest "built, never connected" surface in the codebase, larger than the whole `meta/` intelligence suite's partial wiring.

**`lib/` folder — every top-level file, real consumer count, not estimated:**

| File | Consumers | Note |
|---|---|---|
| `cli-map.js` | 0 | Phase 40.5 CLI map generator — unverified further, worth checking |
| `contract-registry-writer.js` | 0 | unverified further |
| `engine-ledger.js` | 0 | unverified further |
| `loop-topology.js` | 0 | unverified further |
| `nano-ws.js` | 0 | **expected** — zero-dependency WebSocket server for guardian's old WSS surface (port 7821), already confirmed dead and superseded by NCP earlier this session. Not a gap. |
| `nexus-expansion-boot.js` | 0 | unverified further |
| `system-manifest.js` | 0 | "One System → One Manifest" — real, plausible, unwired infrastructure parallel to `component-registry.js`'s "One Registry" philosophy |
| `open-loop-taxonomy.patch.js` | 0 | **expected** — this is a bug-description file, not meant to be required; documents a real, specific status-field mismatch, already known |
| `ledger-writer.js` | 3 | **this session's own work** — was 0 consumers when found six turns ago (confirmed unused), now wired into `cortex/boot.js`, `copilot/server.js`'s lifeline catch, and read by `service/nexus-diagnostic.js`'s fixed failure-detection loop |

Everything else in `lib/` has real consumers, from 1 (narrow, single-purpose) to 9 (`component-registry.js`). Not re-listing the ~30 files with real, unremarkable consumer counts — the map is complete, this is what's actually notable in it.

**Net finding, stated plainly:** copilot's gap is small and precise (3 endpoints). CFR is solid. RFR2 is the real, large, confirmed-empty surface — the single biggest "built and disconnected" system found this entire session, bigger than the `meta/` suite's partial wiring, bigger than the six individually-diagnosed instance bugs combined.

---

## PART 12 — RFR2's first real consumer, ever

**Found the exact, already-specified path rather than inventing one.** `docs/raid-simulation-engine.spec` names precisely what this session's map confirmed by grep: RFR2 has real, built modules and zero consumers, and states the exact reason — an ESM/CJS module-system mismatch — plus its own build order's step 2: "Wire `computeEventDelta()` from rfr2/delta — needs the ESM→CJS adapter (same integration needed for all rfr2 modules, do it once here)."

**Built that bridge once, generically, not as a one-off for `delta` alone.** `lib/rfr2-bridge.js`'s `loadRFR2Module(name)` dynamic-imports any of the 13 real `meta/rfr2/*` submodules by name and caches the result — reusable for `enforcement`, `clip`, `compress`, or any of the other 12, not just the one tested.

**Proven with a real call, not just a successful import.** Loaded `rfr2/delta`, called the real (confirmed non-stubbed) `computeEventDelta()` with meaningful synthetic data — a 180ms gap against a ~100ms recent-gap baseline — and got back real statistics: `latencyImpact: 16.481` (correctly flags this as a genuine outlier), `structuralDeviation: 1.732`. Confirmed the cache returns the same reference on a second call rather than re-importing.

**Honest about scope:** this is the bridge and one proven call, not the full 8-step `simulation.js` the spec describes (synthetic dispatch construction, sigma scoring, `BoundaryIndex` enforcement, COS sandbox lifecycle, Vault writes, wiring into RAID's real dispatch path). Those remain real, named, unbuilt steps — but the one precise blocker named by the spec (the ESM/CJS bridge, explicitly meant to unblock all 13 modules at once) is now closed, tested, and reusable.

---

## PART 13 — Phase-map cross-reference found real, already-mapped RFR2 targets — one important boundary respected, one second module proven

**`docs/NEXUS-PHASE-MAP-CROSSREF.md` maps 6 real, named phases directly onto specific RFR2 submodules** — this had already been done, not discovered fresh: Phase 27 (System State VM) → `rfr2/{kernel,compress,context,time}`; Phase 30 (Time-Travel Debugging) → `rfr2/{clip,context}`, called "the most direct one-to-one match in the whole corpus"; Phase 109 (Epistemic Branch Runtime) → `rfr2/{clip,context,adapter-sandbox,observer}`, called "the big one"; Phase 95/OL-17 (RAID doesn't validate against axioms) → `rfr2/enforcement`; Phase 99/OL-14 (relational field query) → `rfr2/query`; Phase 50 (Pattern Graph) → **already covered by `lib/causal/compound.js`, explicitly no gap**.

**One explicit boundary in that same document, respected, not crossed:** *"rfr2's `resonance`, `irs.js`, `relational.js` — people-modeling category, still needs your explicit per-item yes, not bundled under a phase-map pretext."* Not touched this session.

**Second RFR2 module proven through the same bridge, confirming genuine reusability, not a coincidence:** `enforcement` — all 25 real invariants loaded correctly (identity/causality/time/arch/hostile/context/exec-model groups), `createRuntimeGuard()` and `getInvariant()` both real and working.

**Honest limit found, not glossed over:** `checkKernelInvariants(kernel, boundaryIndex, opts)` needs an actual RFR2 kernel object — these 25 invariants check RFR2's *own* event/replay system's internal correctness, not RAID's routing decisions directly. Meaningfully exercising them requires the fuller `simulation.js` build (synthetic dispatch construction, COS sandbox lifecycle) already scoped out of this session — proven the bridge and the module's basic API, not a deeper integration that isn't real yet.

---

## PART 14 — The workflow/command layer: mostly already built (cockpit), one real new tool added and tested

**Before speccing "create and schedule workflows/tasks/commands" as new, checked — and most of it already exists, wired.** `cockpit/pipeline.js` is a real node-based workflow engine (trigger/condition/transform/api_call/agent_call/store/emit/loop node types; cron/schedule/webhook/event triggers) and `cockpit/cli.js` is a real CLI contract ("CLI = UI = same contract", commands for pipeline/seam/idea/gap). Both are **already required by guardian/server.js**. "Schedule workflows and tasks" is not a gap — it's cockpit, real and connected.

**What was genuinely missing — the keyword→command bridge — is now built and tested.** `lib/agent-tools/tools/run-cockpit-command.js` lets a model resolve plain intent to a real cockpit command and execute it through the actual `ForgeCLI.exec()`. Three real behaviors proven:
- **Drift-proof by construction** — the tool's advertised command list is read from cockpit's own `INTERACTION_CONTRACT`, never hand-copied. This directly prevents the single most common bug class of the entire session (a declared surface drifting from its real implementation). If cockpit's commands change, the tool reflects it automatically.
- **Real execution** — ran `forge pipeline list` against a live `ForgeCLI` with a real registry, got real structured output (`{type:'list', items:[]}`), not a mock.
- **Hallucination guard** — a made-up command (`forge delete-everything now`) is refused against the real contract, not blindly executed.

Registered into `lib/agent-tools/` alongside `read_file`; both advertise valid schemas. The live `ForgeCLI` is injected via `wireCockpit()` by the owner (guardian), not constructed in the tool — same dependency-injection discipline as everything real this session.

**forge.spec extended** with the four genuinely-new pieces, each grounded in what's already real: the command/keyword layer (now partially built), the continuous stream (pieces proven, loop unbuilt), personalities (data-not-code, on Cortex's real storage, smallest real gap), and copilot's navigate/note/tool/action intents (the connective tissue, still copilot's only precise gap).

**Net: the "programmable Ollama + system + co-pilot" end-state is closer to real than the ask assumes** — cockpit already provides the programmable workflow spine, agent-tools now provides the model's hands to drive it, and the remaining gaps (continuous stream loop, personalities, the 4 copilot intents) are each small, precise, and named — not a from-scratch build.

---

## PART 15 — Personalities built and wired: real, tested, three working defaults from first boot

**`cortex/personas.js` — the "personalities" gap from forge.spec, confirmed this session to have zero prior implementation, now real.** A persona is data: `{name, systemPrompt, allowedTools, defaultIntent}`. Considered and rejected storing these as a tier in `cortex/push-recall.js` — its tiers are for *searchable, ranked content*, and a persona is a config object fetched by exact name; mixing them would pollute content recall with objects that have no business being scored as "relevant memory." Separate module, same real JAA backing, injected not hard-required.

**Ships with three real working defaults, not an empty store:** `default` (general, all tools), `builder` (action-biased, defaults to build intent), `diagnostician` (root-cause-focused, restricted to read_file, defaults to diagnose intent). Copilot has working profiles from first boot, not a feature that only works after manual setup. Defaults seed into JAA lazily without clobbering any user-modified persona of the same name.

**Wired into copilot/server.js and tested through the real injection logic.** A `persona` param on the prompt request selects a profile whose systemPrompt prepends the assembled 7-layer context. Proven: three different persona names produce three genuinely different system prompts through the exact code now in the server. Never fails a request — unknown persona falls back to the built-in default inside get(), and the whole lookup is wrapped so a profile miss can never block a real answer.

**Full behavior tested:** seeding (3 defaults), get-by-name (real restricted-tool profile), unknown-name fallback (never null), custom create + retrieve, and validation (a persona missing a systemPrompt throws rather than storing something useless).

**Updated end-state tally for the forge.spec "programmable co-pilot" pieces:**
- Command/keyword layer → `run_cockpit_command` tool, built + tested (Part 14)
- Personalities → `cortex/personas.js`, built + wired + tested (this part)
- Continuous stream loop → pieces all proven, the always-on loop itself still unbuilt
- copilot navigate/note/tool/action intents → still copilot's only precise remaining gap; personas now give the `tool`/`action` intents real content to surface (persona-selected tool access), making that gap smaller and more concrete than before

---

## PART 16 — Continuous stream loop closed: the "nothing lost" chain proven end to end

**Checked what was already real before building — most of the continuous stream already existed.** copilot/server.js's `_stream` buffer is already fed live from Cortex's and Guardian's SSE `/events`, and already flows into context assembly (`cc.assemble({ eventBuffer: _stream })`). The listen→buffer→context path was real. Two specific things named in the end-state ask were genuinely missing, and `copilot/stream-digest.js` is only those two:

1. **Normalize** — raw events are JSON blobs; the ask says "parse into plain text." `normalizeEvent()` turns `{type:'guardian.job.complete', payload:{chars:840,ms:1200}}` into `"guardian finished a job (840 chars, 1.2s)"` — the readable shape a model actually uses well. Handles every real event type this session touched, with a safe generic fallback that never drops or throws on an unexpected shape. Consecutive-duplicate dedup so a flapping system doesn't fill the digest with 40 identical heartbeat lines.

2. **Nothing lost** — the in-memory `_stream` is bounded and dies on restart. `StreamDigest` periodically (60s) pushes the normalized recent stream into Cortex via the real `/api/push` built this session, so the live feed becomes durable, recallable history instead of RAM.

**Proven end to end, not just unit-tested:** booted real Cortex, fired a real digest, confirmed the push succeeded (`ok:true` + real id), then **recalled it back** — `FOUND durable digest in Cortex`. The complete chain works: live events → plain text → Cortex → survives → recallable. Also tested: normalization across all real types, dedup, the digest loop, and empty-stream safety (skips cleanly, never pushes garbage). Sovereign and injectable (takes `getStream()` + `pushToCortex()`), best-effort (never crashes copilot over a digest), and the timer is unref'd so it never holds the process alive.

**forge.spec "programmable co-pilot" tally — 3 of 4 now built and tested:**
- Command/keyword layer → `run_cockpit_command`, built + tested (Part 14)
- Personalities → `cortex/personas.js`, built + wired + tested (Part 15)
- Continuous stream loop → `copilot/stream-digest.js`, built + wired + proven end to end (this part)
- copilot navigate/note/tool/action intents → the one remaining precise gap; now has real content behind it (personas for tool/action, cockpit commands for action, the digest stream for note) — smaller and more concrete than ever, the natural last piece

---

## PART 17 — Copilot fully closed against its own registry: four intents + three axiom endpoints, verified live

**Copilot now has zero gaps against its declared hooks.** Verified by re-running `scripts/verify-wires.js` (the tool built earlier this session for exactly this) — it reports no copilot candidates remaining. This was copilot's only outstanding gap, and it is closed.

**`copilot/intents.js` — the four missing intents (navigate/note/tool/action), built and wired.** copilot's primary hook has always declared seven intents; `ask` was hardcoded at nine separate points in `copilot/server.js`, and these four had no implementation anywhere. Each is grounded in real infrastructure built earlier this session, not invented:
- `navigate` → reads real surface→port mappings from the hook registry (drift-proof by construction, same discipline as `run_cockpit_command` reading cockpit's contract). Correctly maps architect to `/ui/spec-builder`, **not** the bare root — that root returns a real 404, the exact dashboard bug fixed earlier this session, encoded here so it cannot recur.
- `note` → pushes to Cortex's real `/api/push`. **Refuses to claim success on failure**: if the store throws or no backend is available, it reports the error rather than telling the user their note was saved. Tested both failure paths explicitly.
- `tool` / `action` → delegate to Ollama's real `/api/jobs/tools` endpoint (built this session), inheriting `run_cockpit_command`'s real hallucination guard — a command not in cockpit's own contract is refused, never executed.

**Strictly additive, and proven so.** `route()` returns `null` for ask/build/diagnose, so every pre-existing request falls through to the exact same pipeline, unchanged. Verified live: a navigate prompt returns the real architect URL; an `ask` prompt still resolves with `intent: 'ask'` through the original path. Intent classification is deterministic keyword matching, not model-based — a misroute here would silently send a request down the wrong pipeline, so an auditable rule beats an opaque probability, and routing shouldn't cost a model round-trip.

**Copilot's three axiom endpoints wired to the real, existing `axiom-manager.js`.** Found by `verify-wires.js`, confirmed by hand: the registry declared `/api/axioms`, `/api/axioms/add`, `/api/axioms/remove` as active while `axiom-manager.js` sat complete and unreferenced — the word "axioms" appeared nowhere in `copilot/server.js`. Wired and verified live: `GET /api/axioms` returns **32 real axioms** parsed from the actual AXIOMS file, first being `§1.1 "Nothing Exists Until Proven"` (IMMUTABLE, frozen). `remove` deliberately does not default `confirm` to true — a destructive call requires an explicit confirm from the caller.

**Self-caught during this build:** left an unused `runToolLoop` import after switching to delegate to Ollama's endpoint; removed rather than left as dead code. Also confirmed the delegate target (`/api/jobs/tools`) actually exists before depending on it — the precise check that this session's dominant bug class (declared wire, no implementation) exists to prevent.

**Regression check:** all 13 modified files pass `node --check`; Loom's real production suite still 18/18.

**forge.spec "programmable co-pilot" tally — 4 of 4 built and tested:**
- Command/keyword layer → `run_cockpit_command` (Part 14)
- Personalities → `cortex/personas.js` (Part 15)
- Continuous stream loop → `copilot/stream-digest.js` (Part 16)
- navigate/note/tool/action intents → `copilot/intents.js` (this part)
