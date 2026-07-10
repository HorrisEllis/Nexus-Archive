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

---

## PART 18 — Guardian's ask endpoint built; a regression I caused found and fixed; a pre-existing RAID bug exposed

**`guardian/ask.js` + `POST /api/copilot/prompt` — Guardian's missing synchronous ask, built.** `copilot/lifeline.js`'s escalation path has called this exact endpoint (with a RAID-selected provider, wired and tested earlier this session) into the void. Guardian had zero working synchronous ask endpoints: this one was absent, and `/chatgpt-mode/query` 503s because `guardian/agents/chatgpt-mode.js` doesn't exist.

**Deliberately did NOT build `chatgpt-mode.js`.** That path implies a second browser-tab agent — Guardian already has one (NCP job machinery, with RAID selection already in `/command`'s raw path). Building a parallel agent would create exactly the competing-truth-layers duplication this session repeatedly found and undid. `ask.js` is an honest synchronous facade over the real `createJob → dispatchJob → NCP → poll` pipeline. It cannot make an async job synchronous, only wait for it — and it says so:
- **Fail-fast** when no NCP provider is connected (0ms, not a 90s poll into a vague timeout).
- **Real timeout** names the jobId so the work is retrievable via `GET /jobs`, never silently lost.
- **Reads both `responseText` and `result`** — Guardian genuinely stores completion text under different names on different code paths. An honest patch over a real inconsistency, explicitly not a fix to Guardian.
- **"Complete but no text" is reported as the anomaly it is**, never an empty success.
Six paths tested standalone with injected deps before wiring.

**A real bug in my own wiring, caught before shipping.** The first version passed `provider: 'auto'` straight to `createJob`. But `createJob` stores the provider verbatim and `dispatchJob` enqueues to `pendingQueue['auto']` — a bucket no real provider ever drains. That would create a permanently-stuck job only the timeout would release. `/command` resolves `auto` via RAID *before* `createJob`; so must this. Fixed via an injected `resolveProvider` (keeping `ask.js` sovereign), and verified: **zero jobs created** when no resolver is supplied, rather than one stuck job.

**A REGRESSION I INTRODUCED EARLIER THIS SESSION, found by finally booting Guardian.** `const server = http.createServer(...)` was deleted during the dead-TLS/WSS/dropzone cleanup. The removal was clean enough that `node --check` still passed — but `server.listen()` and `server.listeners('request')` both referenced an undefined variable, so **guardian/server.js could not boot at all**, and had been shipped that way in every package since. Restored faithfully as the 404 fallback handler that `_origListeners` is designed to capture (all 41 real routes live in `handleExtendedRoutes`, consulted first). **The lesson, recorded rather than quietly patched: a syntax check is not a boot check.** Every prior "verified" claim about Guardian this session rested on reading code, not running it.

**A PRE-EXISTING bug exposed by that boot.** `/command`'s raw dispatch calls `_raid.decide(...)`. RAID exports `_decide`, not `decide` — and its real signature is `_decide({prompt, context:{cfrRegime, cfrSigmaFloor}})`, not `(prompt, {preferredAgent, cfrCtx})`. Both the name and the argument shape were wrong. Because the call sits inside a try/catch, it threw silently on **every raw dispatch** and fell through to the `'chatgpt'` fallback. **RAID has therefore never once actually routed a raw job in Guardian**, and the `[guardian] RAID → ...` log line has never printed. Fixed, minimally and faithfully.

**`RoutingIR` got its first production consumer.** Built and tested earlier this session with zero real callers, it now resolves the provider for `/api/copilot/prompt` — reporting honest `rule_based` vs `competitive` mode. Verified live against booted Guardian: `auto` → RoutingIR → `claude` (LAW_III unconditional reserve) → fail-fast in 17ms with the resolved provider named.

**Regression check:** Guardian now boots (loads 3,227 real event_log rows, 81 jobs, 207 gaps). `/health` serves. Loom's real suite still 18/18. `verify-wires.js` reports no remaining copilot or guardian-ask candidates. All four touched files pass `node --check`.

---

## PART 19 — Fixing the verification process, not just the bugs

Two critiques were levelled at Part 18's postmortem, and both were correct. Acting on them changed the tooling, not just the code.

**Critique 1: "I can't honestly tell you anything is working" was overbroad.** Evidence is a ladder, not a binary. Collapsing the rungs is precisely what let a non-booting Guardian ship. `scripts/verify-boot.js` now makes the rungs explicit and never asserts one it did not observe:

`PARSES < BOOTS < SERVING < HEALTHY < CONTRACT`

A service can PARSE and be dead. It can BOOT and never listen. It can SERVE and return 500s. Each rung is earned separately. **Not an end-to-end test** — reaching CONTRACT proves the process is alive and answering, nothing about business behavior.

**Critique 2: "swap the order if orphaned hooks can prevent startup."** Tested rather than accepted. Four files load the registry at runtime, but nothing enumerates routes — an *undeclared* route cannot throw. Cortex and Copilot both boot today with 69 orphans present. **Ordering stands: boot verification first**, because every claim above it depends on it.

**First real boot run — the first runtime proof this session of anything:**

| service | tier | note |
|---|---|---|
| cortex | CONTRACT | v3.0.0 |
| guardian | CONTRACT | v3.6.1 — proves the restored `createServer` fix is real |
| copilot | CONTRACT | v3.1.0 |
| orchestrator | CONTRACT | — |
| architect | CONTRACT | v3.0.0 |
| ollama | **HEALTHY** | `/health` 2xx but `ok:false` |

The tool then earned its keep by making me *check* rather than assume: ollama's `ok:false` is **not a bug** — the Ollama daemon at `:11434` isn't running in this sandbox, and the server correctly reports degraded instead of lying (§1.2 working as designed). The tier ladder distinguished "serving" from "healthy" exactly as intended.

**`verify-wires.js` now runs bidirectionally.** The original proved only *"every declared hook has code."* It could not prove the converse, *"every implemented route has a declaration"* — different properties. A one-way checker is blind in exactly the direction its author is blind.

**The reverse scan's first run: 69 implemented routes with no declared hook**, against 65 declared routes total. **The registry describes roughly half the real HTTP surface.** Guardian 34, Cortex 30, Copilot 3, Ollama 2. Reported as *candidates*, not verdicts — some are near-duplicates (`/jobs` vs `/jobs/`) and some may be intentional internals. This is a systemic §5.1 finding, far larger than my own contribution to it.

**Six of them were mine, and are now registered** (`/api/copilot/prompt`, `/api/jobs/tools`, `/api/snapshot/rollback`, `/api/bus/stats`, `/api/push`, `/api/recall`). Registry: 82 → 88 hooks. Reverse orphans: 69 → 64 — exactly **five**, not six, because `/api/bus/stats` was never in the reverse list: orchestrator segment-routes it (`sub==='bus' && seg[2]==='stats'`), a blind spot the tool documents rather than hides. The arithmetic being explainable is the point.

**Regression after touching the hooks files** (Cortex loads the registry at boot — a real risk): cortex, copilot, guardian all still reach CONTRACT. Forward scan flags none of the six new hooks as missing.

**Still not done, and named:** Clear Glass is not wired as an NCP provider. `guardian/ask.js` was built around "a browser tab connects," and `clear-glass/` contains no NCP client while `guardian/server.js` contains zero references to it. That assumption is now embedded in user-facing text ("no browser tab available") — an architectural assumption that became part of the product's contract. It is remediation #3, deliberately after a verified runtime exists to integrate against.

---

## PART 20 — Clear Glass wired as a real NCP provider; the ask chain proven end to end

**Remediation #3, done — and it produced the first genuine end-to-end proof in this session.**

**The architectural point, which I had wrong.** `guardian/ask.js` was built around "a browser tab connects via NCP" without asking *which* browser. Clear Glass is a browser: it drives claude.ai or chatgpt.com. It therefore connects under those **same provider names** (`claude`, `chatgpt`) — RAID's vocabulary, the job queue, and `pendingQueue` keys all stay exactly as they are. No new provider concept was invented; doing so would have been another competing truth layer. What changes is *who holds the tab*: a sovereign Electron browser instead of a userscript in someone else's Chrome.

**`clear-glass/ncp-client.js`** implements Guardian's real NCP protocol, read from `guardian/lib/ncp.js` rather than guessed:
1. `GET /channel?provider=X&tabId=Y` → SSE, first frame `NCP_READY`
2. Server pushes `{type:'GUARDIAN_JOB', jobId, prompt, content}`
3. Client posts `/result {type:'GUARDIAN_COMPLETE', provider, jobId, text}`

**It refuses to fabricate.** `answer(prompt, job)` is injected and required — the constructor throws rather than connect a provider that cannot actually answer. An answerer returning nothing posts `GUARDIAN_ERROR`, never an empty success. §1.3: a canned default string would be a production stub that silently poisons every downstream reader of `job.responseText`. Reconnect uses capped exponential backoff, respecting the real "flickering" race `ncp.js` §23.12 documents.

**END-TO-END, a rung above CONTRACT.** With Clear Glass connected as provider `claude`, `POST /api/copilot/prompt {provider:'auto'}` returned in **574ms**:

```
{"ok":true, "jobId":"401dfdca…", "provider":"claude",
 "text":"Four. (answered by the Clear Glass provider…)", "modelUsed":"claude"}
```

Every link exercised, none inferred: RoutingIR resolved `auto`→`claude` (its first production use) → `createJob` → `dispatchJob` → NCP SSE push → Clear Glass answered → `POST /result` → `askSync` polled → synchronous text. This simultaneously validates the restored `createServer`, the `auto`-resolution bug fix, `askSync`'s poll loop, and RoutingIR — four things previously proven only in isolation.

**A user-facing message corrected, because it was a contract.** `ask.js` said *"no browser tab available to answer."* That encoded an unverified assumption into the product's interface. It now reads: *"no provider connected on NCP channel 'X' — start a Clear Glass provider (clear-glass/ncp-client.js) or another NCP client for it."* The condition it names is the real one, and it says what satisfies it.

**Regressions:** Loom 18/18. Guardian and Copilot both still reach CONTRACT.

**Evidence-tier note:** this run reached a rung the boot verifier does not itself assert — `END-TO-END`. `verify-boot.js` deliberately stops at CONTRACT ("the process is alive and answering") and claims nothing about business behavior. That claim was earned here separately, by exercising the real path, and is recorded as such rather than folded into the tool's output.

---

## PART 21 — Merging the parallel 07-07 branch (nexus-wired-v6)

**First, a correction to what I told you last turn.** I reported a list of files "missing from my tree." That list was produced before the working tree was re-synced between turns, and it is now false: 68 files carry a post-sync mtime, my `snr-filter.js` is byte-identical to theirs, and `roleConfidence` was already real. **I cannot explain the mechanism.** Every claim below is re-derived from observed state now, not from that earlier diff.

**The three duplicates I predicted were already resolved by the sync, in favor of theirs, with zero dangling references:**
- `run_command` (theirs) canonical; my `run_cockpit_command` gone. `agent-tools` registers `read_file` + `run_command`.
- `componentDistance()` (theirs) canonical; my `componentProximity()` gone.
- `cortex/boot.js`'s `_mastermindAnalysis` is now a one-line delegation to `cortex/intelligence/mastermind.js`. No duplicate logic.

My own work survived intact: `intents.js`, `stream-digest.js`, `personas.js`, `ask.js`, `clear-glass/ncp-client.js`, `verify-boot.js`, the reverse wire scan, and the restored `createServer`.

**Their tree does not boot.** `guardian/server.js` there is missing `const server = http.createServer(...)` and dies with `ReferenceError: server is not defined`. Same regression, consistent with a shared ancestor. My restored server is the only fix in either branch.

**Their work is real, not claimed — I ran it.** RAID's three fitness stubs are genuinely closed (`snr-filter.js`, `tunables.js`, `roleConfidence` reading RAID's own `_weights`), backed by 16 passing tests. `cortex/intelligence/{intuition,mastermind,adversarial}.js` is the node-per-file decomposition, with 26 tests. Plus `system-lattice.js` and a 60+ test suite my branch entirely lacked.

**Four suites failed against the merged tree. Each was diagnosed, not patched away:**

1. **`lifeline-fluid-routing`** — their `extractExplicitAgent()` ("talk to chatgpt" → route straight there) didn't exist in my lifeline. Ported. It composes with my RAID wiring rather than bypassing it: `_tryGuardian` only consults RoutingIR when no provider was named.

2. **T-005 encoded a decision that is now wrong.** It asserted `_tryGuardian` must post to `/command`, "not the dead `/api/copilot/prompt`." That was true on 07-07. I then *made that endpoint real*. Verified empirically against a booted Guardian rather than argued: `POST /command` returns `{ok, jobId, status, provider}` — **no text at all** — so their `_tryGuardian` (which reads `result || text`) returns `null` on every call, silently. Worse, `/command` **500s** on their payload, because its raw path calls `parseCommand(body.raw)` and they never send `raw`. **The old test asserted only that `_post` was called with `/command`; it never checked the outcome — so it passed while the feature could not work.** Rewrote T-004/T-005 to assert the endpoint that returns real text, with the reasoning recorded in the test file.

3. **A real bug of mine, found by their test.** My `_tryGuardian` reported `provider: 'guardian'` when the response named no model — masking which agent actually answered. Guardian is the router, never the answerer. Their branch reported the dispatched agent and was right. Fixed to fall back to the resolved provider, which is always known.

4. **T-006 taught me a distinction I had conflated.** Their `_tryGuardian` pre-checks `/providers`; mine relied on Guardian's server-side fail-fast. Adopted theirs as an early-out — the server stays authoritative — but split two conditions my first attempt merged: `/providers` answered and the provider is not positively connected → **fail closed** (an unlisted provider is not connected, not "unknown"); `/providers` itself unreachable → **fail open**, defer to the server rather than block on a check that may be the broken thing.

5. **`copilot-adversarial-*`** — ported `_resolveIntuitionResponse` (a pure, testable decision function that surfaces a contradiction rather than hiding it) and `_queryCortexAdversarial`, and replaced my `copilot/adversarial.js` with theirs after confirming by function-name diff that theirs is a strict superset with nothing of mine lost.

**`copilot.test.js` (7 failures) is stale in BOTH trees** — it requires `guardian/agents/co-pilot`, deleted when Copilot was split out of Guardian. Not a merge casualty. Left failing rather than faked.

**Merged baseline, all verified by running it:**
- **191 passed, 7 failed** (the 7 being the stale suite above). Loom's production suite 18/18.
- cortex, copilot, guardian, architect all reach **CONTRACT**.
- **END-TO-END re-proven post-merge**: Clear Glass connected as provider `claude`, `POST /api/copilot/prompt {provider:'auto'}` returned real text in **516ms**.

---

## PART 22 — Three real bugs from a live console, and the actual self-heal root cause

A running-system console log is worth more than any static audit. Three bugs, all traced to root cause and fixed.

**1. `[cortex] system-lattice feed failed: _buildRecentCausalGraph is not defined`** — firing every 60s in production. The helper was inline in `cortex/boot.js` until the 07-07 split moved it into `cortex/intelligence/mastermind.js`. The helper moved; the caller at line 837 did not. It's already exposed on the mastermind instance, so the fix is to call `_mastermind.buildRecentCausalGraph()` — reuse, not a second copy of the same graph builder. Proven: builds a real 4-node/4-edge graph from actual event_log rows, and `system-lattice.ingestCFRGraph()` accepts it.

**2. The `cfr/sigma` warning was lying about who caused it.** Every one of the 600 occurrences reported `Caller: at _warnCoercion (...sigma.js:36)` — the warner naming itself. Its stack filter tests `l.includes('cfr/sigma.js')` with forward slashes, but V8 frames use the platform separator; on Windows every frame reads `meta\cfr\sigma.js`, so **none of the skip filters ever matched**. 600 warnings, each pointing at the warning function. Fixed by normalizing separators before filtering. Verified: the repaired diagnostic now names the real upstream caller.

**3. …which then exposed the real bug.** `orchestrator/lib/sigma-writer.js` subscribed as `bus.on('*', (eventType, payload) => …)`. But `nexus-bus.js:72` emits `super.emit('*', event)` — a **single** event object. So `eventType` was the entire event and `payload` was always `undefined`. `computeSigma()` received `{type:{…}}`, coerced it, and **every `sigma_record` written since §P106 stored a type of `[object Object]` and scored against an empty payload.** The warnings were the symptom; the listener signature was the disease. Fixed and proven: a real bus event now writes `type: "guardian.job.complete"`. The historical records are unrecoverable — the true type was never persisted. (`nexus-heal-loop.js` uses the correct single-object signature; it was never affected.)

**4. SELF-HEAL: I was wrong, and the truth is more specific.** I previously told James self-heal "genuinely doesn't exist." It does. `nexus-heal-loop.js` is real, correctly written, subscribes with the correct `bus.on('*', ev => …)` signature, and has its own §1.2 shape check that rejects malformed gaps. It boots — the console proves it: `[heal-loop] listening on bus for gap events`.

**It has never fired on a real gap, and here is exactly why.** heal-loop is required by `orchestrator.js:130`, so it listens on the **orchestrator's in-process EventEmitter bus**. Every real gap is produced in a *different process*:
- `guardian/userscript-*.js` emit `cortex.gap.found` on **guardian's** bus.
- `service/nexus-diagnostic.js` (:7825) detects gaps and calls `broadcast({type:'gap.found'})` — its own SSE clients and its own ledger.

Orchestrator's only SSE consumer, `connectBridgeRelay()`, pipes bridge events into `broadcast()` — orchestrator's SSE fan-out to *its* clients — **never into `bus.emit()`**. Nothing has ever carried a gap across the process boundary. heal-loop has been listening, correctly, to a bus on which no gap was ever emitted.

**`lib/gap-relay.js` is that missing wire, and only that wire.** It does not re-implement healing. Three real loop-safety guards, each tested: only gap-shaped types cross; a relayed event is tagged `_relayed` and never re-relayed (no amplification storm); the same gap from two sources is deduped within a window and healed once.

**A bug in my own relay, caught before shipping.** heal-loop matches `ev.type.includes('.gap.found')` — with a **leading dot**. Diagnostic emits a bare `'gap.found'`, which fails that check. Relaying it verbatim would have produced this session's dominant bug for the umpteenth time: a wire that is declared, connected, and does nothing. The relay now normalizes the bare form to `nexus.gap.detected`, heal-loop's exact-match type. Prefixed types pass through unchanged, preserving origin.

**Proven on the real bus:** both `cortex.gap.found` (guardian) and `nexus.gap.detected` (diagnostic, normalized) now reach heal-loop's filter *and* pass its shape check. Wired into `orchestrator.js` beside `attachToBus`. Orchestrator and cortex both still reach CONTRACT; Loom 18/18.

**Still open:** 64 implemented routes with no declared hook (§5.1); RFR2 bridge works but only 2 of 13 modules exercised; Clear Glass's NCP client is proven but idle — nothing in the Electron app constructs a `ClearGlassProvider` with a real `answer()` yet.

---

## PART 23 — The Clear Glass vault picker: why no provider could ever answer

The `guardian-vault-picker-expansion` zip is Clear Glass, and it closes the loop on the live console — but not the way I expected. It also proves I built a duplicate.

**I had Clear Glass's architecture wrong, twice.** I wrote `clear-glass/ncp-client.js` as a sovereign NCP provider. But Clear Glass *already had one*: `ProviderHost` injects **Guardian's own userscripts** (`guardian/userscript-<agent>.js`, "the exact unmodified file") into its webviews, and those connect to `/channel`. My client was a competing truth layer with zero production consumers. **Resolved by picking the canonical one:** the userscript path stays; my client moved to `tests/helpers/clear-glass-ncp-provider.js`, which is what it honestly is — the test double that proved the ask chain end to end. Re-verified after the move: 514ms, real text.

**Two real, stacked production blockers, both visible in the console, neither previously understood:**

1. **`[ProviderHost] no guardianDir configured` → `[Userscripts] 0 scripts loaded`.** `clear-glass/src/main/index.js` deliberately removed its hardcoded `../../../guardian` fallback ("not supposed to be baked in") and requires `GUARDIAN_DIR` explicitly — but nothing ever set it. So the four provider tabs boot and none of them ever connects to Guardian's NCP channel. Guardian therefore has no answerer, and every ask fails fast. Fixed in `autopilot.js`: the supervisor knows where guardian lives, so it now passes `env: { GUARDIAN_DIR: path.join(ROOT, 'guardian') }`. Verified the path resolves to a directory containing 7 real userscripts, and that `ProviderHost` selects them by explicit `def.userscriptFile` rather than a `readdir` — so the two `.deprecated` files are never injected.

2. **`[ProviderHost] claude — loaded https://claude.ai/login`.** The tab was sitting on a **login page**. The expansion's own comment names the cause: *"nothing here ever called `vault.restore()`"* — the same declared-but-never-invoked pattern that has run through this entire session. `AgentMesh` now restores the CookieVault session on spawn. Verified the wire is real, not declared: `main/index.js:636` constructs `new AgentMesh({ ..., vault })`, `vault` is a real `CookieVault` (line 529), and `CookieVault.restore({agentId, accountId, ses})` matches the call site's signature exactly.

Together these explain the whole failure: no userscript → no NCP connection; and even with one, a logged-out tab could never produce an answer. Applied all 5 expansion files after confirming by function-name diff that they are a strict superset (nothing of mine lost). All syntax-check clean.

**`guardian/ask.js`'s error message corrected a second time.** It now names the real conditions — Clear Glass booted with `GUARDIAN_DIR`, and the provider tab holding a restored session rather than a login page. A message is a contract; twice now mine encoded an assumption I hadn't verified.

**From `nexus-merged-v7.zip`:** that snapshot is my earlier package and is *behind* this tree (no gap-relay, no sigma-writer fix). It did contain two real agent tools I lacked — `diagnose.js` and `move-data.js` — now merged and registered. Their suite failed 5/7 until the diagnostic service was actually running, then passed **7/7**: `diagnose` hits the real `:7825` endpoint by design. Environmental, not broken — verified rather than "fixed". Note for CI: that suite requires `:7825` up.

**Merged baseline:** 198 passed, 7 failed (the stale `copilot.test.js`, broken in every branch). Loom 18/18. Orchestrator, guardian, cortex all CONTRACT. End-to-end ask chain 514ms.

---

## PART 24 — Sovereignty: the orphaned routes and the hardwiring are one problem

James stated the intent: *"no hardwiring. I need to be able to remove any system and swap in another. They use the API and the orchestrator as a hub for each connection."* Measured against the code, the intent was not implemented — and **I was the one violating it.**

**Twelve direct cross-system `require()` calls existed** — one sovereign system reaching into another's filesystem. Six were mine, written this session: `routing-ir.js` required from both guardian and copilot; `cortex/personas.js` and `cortex/memory/jaa-db.js` required straight out of copilot. A `require()` across a system boundary is the hardest possible wire: it couples file layout, module system, and process. **Cortex cannot be swapped while anything requires its files.**

**The two tasks turned out to be one finding.** Cortex already *exposes* these capabilities as real HTTP APIs — `/api/raid/decide`, `/api/intelligence/adversarial`, `/api/memory/insert`. Every one appears in verify-wires' orphaned-route list. **They are orphaned precisely because callers reach around them with `require()`.** The 64 undeclared routes and the hardwiring are the same disease seen from two directions.

**The hub already existed, locked in a drawer.** `orchestrator.js` has a `SYS` map and `sysReq(systemId, method, path, body)` — a caller names a *system* and a *path*, never a port. But it lives inside `orchestrator.js`, unusable by any other process, so every other system reinvented a hardcoded port.

**`lib/nexus-client.js`** is that indirection, extracted and shared. `call(systemId, method, path, body)`. No host. No port. A caller that cannot name a port cannot hardwire one. An unknown systemId is a loud error, never a guessed default (§1.2) — guessing a port is how you get two sources of truth.

**The config was itself an orphan.** `orchestrator.config.json`'s `ports` block existed, was hot-reloadable via `nexus-config.onChange/watch`, and **nothing in the codebase read `ports.*`.** It was also wrong: it said `ollama: 11434` (the daemon) while orchestrator's `SYS` map said `3749` (the bridge) — two sources of truth, disagreeing. Nothing read it, so nothing broke. Corrected and completed (copilot/loom/eravos/diagnostic added) *before* anything started depending on it, and it is now the single authority.

**Hotswap proven, not asserted.** Booted a *different implementation* of cortex on :3999, edited one config line, and — with no restart and no code change — a caller asking for system `'cortex'` reached the replacement: `{"ok":true,"impl":"replacement-cortex"}`.

**Personas became an API before anything consumed it** (CLI/API first, as specified): `GET/POST /api/personas` on cortex. Copilot no longer opens cortex's database.

**Refactored, all six of my violations:**
- `copilot/server.js` — personas + jaa-db requires → `nx.get('cortex','/api/personas')`; also a hardcoded `port: 3749` → `nx.post('ollama', …)`.
- `copilot/lifeline.js` — RoutingIR require → `nx.post('cortex','/api/raid/decide')`.
- `guardian/server.js` — RoutingIR require → the same real API.

**Two bugs caught inside this refactor.** (1) `resolveProvider` became async, but `ask.js` called it unawaited — `resolved` would have been a Promise and every job would enqueue to `pendingQueue['[object Promise]']`. Awaited. (2) A real regression I introduced: when cortex is unreachable, provider falls back to `'auto'`, which **skipped the connectivity pre-check entirely** and dispatched blindly. Now `'auto'` checks whether *any* provider is connected — unresolved does not mean unchecked. Same fail-closed-on-evidence rule.

**Verified:** end-to-end 508ms through NCP. Notably, RAID consulted over its real API now picks `ollama` first (LAW_I cheap-first, health=100) rather than the `claude` reserve — routing behaviour that was invisible while everyone bypassed the API. Loom 18/18. cortex/guardian/copilot all CONTRACT. `lifeline-fluid-routing` 6/6 after fixing my regression.

**Remaining hardwiring (pre-existing, not mine):** `guardian/api-dispatch.js` ×2, `guardian/server.js` `/command` path ×2, `copilot/adversarial.js` ×1 — all reaching into `cortex/core/raid` or `cortex/intelligence`. Each has a real cortex API to call instead.

**Not deleted:** `/chatgpt-mode/query`. I was about to remove it as dead. In a non-linear system a route is an *affordance*; its missing module is a gap to fill, not proof the surface should die. Deleting it would collapse optionality the architecture is designed to hold open.

---

## PART 25 — Architecture questions, answered with evidence; and why RFR2 really has no consumers

**"The hub is either cortex or orchestrator" — it is both, on different planes, and merging them would break hotswap.** Orchestrator is the *control* plane: the `SYS` map, registration, `sysReq`, contract polling. Cortex is the *data + intelligence* plane: memory, CFR, RAID, the faculties. "Cortex is the brain, copilot is the mind" matches the code exactly — cortex holds memory and faculties; copilot composes them into reasoning. But connections route through orchestrator.

**"All data stores in cortex, each system a redundant backup" — today is the inverse, and I'd push back on the proposed direction.** Guardian owns `guardian/memory_store/` with its own `artifacts`, `chat_log`, `event_log`, `cfr_state`. Each system is primary; there is no central copy. Making cortex primary would make it a single point of failure and would break the sovereignty and hotswap just established — a system that cannot boot without cortex is not sovereign. The pattern that delivers both goals is **local primary, cortex mirror**, which is precisely what `bridge/ledger.js` was changed to earlier this session (it was the only system writing nothing to Cortex).

**Memory subsystems, measured by real consumers:** `crystal-lattice` 13 (genuinely load-bearing), `chat-logger` 3, `vector-memory` 1, `context-builder` 1, `replay-engine` 1. **`versionium` is spec-only — `docs/specs/VERSIONIUM.spec.md`, zero code.**

### The RFR2 root cause: it is not neglect, it is impossible

9 of 12 RFR2 modules load and work standalone. Three do not: **`clip`, `compress`, `context`** — all three fail on `import { createKernel } from '../kernel/index.js'`, and **`meta/rfr2/kernel/` does not exist.** Not in the tree, not in `unintegrated/`, not in any uploaded zip.

Those three are exactly the modules the phase-map crossref maps the architecture's biggest phases onto: **Phase 27** (System State VM → `compress.snapshot/restore`), **Phase 30** (Time-Travel Debugging → `clip.snapshotRange/restoreClip`, called *"the most direct one-to-one match in the whole corpus"*), and **Phase 109** (Epistemic Branch Runtime, called *"the big one"*). Every one of the VM-snapshot / replay-engine / epistemic-branching capabilities requested routes through them.

**The kernel contract is fully derivable from its three consumers** — `createKernel({ringCap})` returning `{ingest, getAll, findById, getChildren, edgeMeta, edgeCount, droppedCount, clock}` — and is now recorded in `docs/RFR2-KERNEL-CONTRACT.md`.

**It was deliberately NOT reconstructed.** The surface is determinable; the semantics are not (ring-cap eviction policy, drop accounting, whether `getAll()` guarantees causal order, clock ownership). A guessed kernel does not fail loudly — it makes `compress.snapshot()` restore to a *different* causal graph and `clip.validateClipStability()` validate an unstable clip. That is worse than absent: silent corruption of the one subsystem whose entire purpose is fidelity. §1.1 cuts against writing it from inference. The upstream path the crossref itself cites is `rfr2/packages/nexus/src/kernel` — copy it in, and three phases become buildable.

**RFR2 exercised: 2 → 5 modules**, all against real data via `lib/rfr2-bridge.js`:
- `identity.contentHash()` — stable across runs, changes with content, independent of key order. **This is the per-file versionium primitive** (Phase 32 / 105), and it works today.
- `time.causalOrder()` / `seqPrecedes()` — real causal sort over real events.
- `version-gate` — `createVersionGate`, `validate`, `migrate`.
- plus `delta` and `enforcement` from earlier.

**Consent boundary unchanged:** `resonance`, `irs.js`, `relational.js` are people-modeling, are not in `meta/rfr2/`, and are not to be pulled in under a phase-map pretext.

---

## PART 26 — Specs updated: the meaning, written down where it can't be lost

James: *"the meaning is getting lost… I don't want anything inline or hardwired that can use the api, or interaction contract, with handshake verification."*

**He is right, and the foundation spec already said it.** `nexus-system-foundation.spec` v1.1.0, L1, verbatim: *"all state changes are events. Nothing couples directly."* and *"Systems talk to each other through events, not direct HTTP calls."* Twelve cross-system `require()` calls violated it, six added by an AI assistant in a single session while "building features."

**But the interesting part is why, and it is not carelessness.** Measured: `nexus-bus.js` is `class NexusBus extends EventEmitter`. It is **in-process**. Eighty files emit onto it; every one of the twelve NEXUS processes holds its **own instance**. There is no distributed bus. There never was.

So an engineer needing a capability from another process had exactly two options — `require()` its files (couple the filesystem) or hardcode its port (couple the address) — and both violate a spec that offered no third option. **The rule wasn't ignored. It was unimplementable across the boundary, and nobody wrote that down.** The same silence is why `nexus-heal-loop` has listened faithfully, for months, to a bus on which no gap was ever emitted.

### `docs/nexus-system-foundation-addendum-v1.2.0.spec` — additive, revertible

Written to the existing addendum convention (v1.1.0's format). **Revert = delete the file and remove three comment markers.** No layer changes, no data migration, no API removal; each migrated call site records its prior state in its `§SOVEREIGNTY` comment.

- **AX-010 Sovereign Transport** — no system reaches into another's filesystem, module tree, or database. No caller names a host or port; callers name a SYSTEM and a PATH. *A caller that cannot name a port cannot hardwire one.* Records the symmetry that makes this one problem, not two: cortex already exposes `/api/raid/decide` and `/api/intelligence/adversarial`, and both sit in the 64-orphaned-route list — **orphaned precisely because callers reached around them with `require()`**. Explicit exceptions: shared `lib/` infra (L0/L1) and self-references within a system's own subtree.

- **AX-011 The Bus Does Not Span Processes** — the finding, recorded because its absence is what let the meaning get lost. L1 is a within-process spine. Across processes the sanctioned coupling is L3+L4. Existing cross-process transports are exactly two: SSE fan-out (one-way) and `lib/gap-relay.js` (gap events only). *"Do not write 'systems communicate via events' in a spec without qualifying it. That sentence is how self-heal came to listen to silence for months."*

- **AX-012 Handshake Verification Precedes Use** — a route that exists but is undeclared is not in the contract; one declared but absent is a lie. Both are violations; wiring is verified in **both** directions. Corollary: *"a one-way consistency checker is blind in exactly the direction its author is blind"* — `verify-wires.js` proved "every declared hook has code" while 64 implemented routes went undeclared, six added by the session that wrote the checker. Includes the evidence-tier ladder (`PARSES < BOOTS < SERVING < HEALTHY < CONTRACT`) and why it exists: guardian passed `node --check` for an entire session while unable to boot.

**The base spec now points at the addendum**, with an inline `⚠️ §AX-011 QUALIFIER` on the exact L1 paragraph that has been read as a cross-process promise. A spec whose correction is undiscoverable is the same failure as an orphaned route.

**Compliance is recorded in the addendum, honestly**: 4 call sites migrated, 8 remaining (each with a real cortex API waiting — a call change, not a build), AX-011 recorded-not-resolved, AX-012 reverse scan still showing 64.

### `nexus-autonomous-v8.zip` — mapped, then merged

Mapped first, as instructed. v8 predates the sovereignty work (no `nexus-client`, `gap-relay`, or `personas`) and **does not contain the RFR2 kernel**. Nine genuinely new files, merged: `lib/consent.js`, `lib/build-pipeline.js`, `lib/execution-pipeline.js`, `copilot/lib/expectation-watcher.js`, and four UI files.

`lib/consent.js` is the explicit, per-item, revocable consent registry for the rfr2 people-modeling boundary (`resonance`, `irs.js`, `relational.js`). Verified it **fails closed**: an ungranted item returns `false`, an unknown item returns `null`. A consent registry that failed open would be worse than none.

**One AX-010 violation found in the incoming code, recorded rather than silently patched:** `lib/execution-pipeline.js` requires `../orchestrator/lib/hot-loader`, `../cos/playground`, and `../emerge/compiler/t2-gate` — shared `lib/` reaching into three sovereign systems. Listed in the addendum's `compliance.remaining`.

**Regressions after merge:** Loom 18/18; cortex, guardian, copilot all CONTRACT.

---

## PART 27 — WARP as the spine: measured, attached, and made to produce the map

James: *"warp is the spine for each system, supposed to be. the system is supposed to be mapped, as it's built, updated, fixed, all mapped first."*

**Mapped first. WARP was the spine of two systems, not ten.**

| consumer | files |
|---|---|
| `loom/schema/{axioms,driver,gates}.js` | 3 |
| `lib/seam/{gates,build-contract,adapters/warp-cascade}.js` | 3 |
| `ollama/server.js` | 1 |
| guardian, cortex, copilot, orchestrator, idearium, architect, bridge, emerge | **0** |

WARP is a leaf. Their actual spine is `nexus-bus.js` — a raw `EventEmitter`. Meanwhile WARP's `Stream` has exactly the spine shape (`register / on / hook / registerAxiom / emit`) and `StreamLog` (`record / entries`) is a mapping substrate.

**`lib/warp-bus.js` attaches WARP rather than replacing nexus-bus.** Eighty files emit onto that bus; replacing it outright would be the largest possible change with the least possible evidence — the exact pattern that has hurt this codebase repeatedly. Instead every event is mirrored into a real WARP `Stream`, recorded to a real `StreamLog`, and checked against WARP `Axiom`s. No emitter changes. No listener changes. **Observe first, enforce second, replace only with evidence.**

**I guessed WARP's API wrong and the code told me.** My first draft assumed `new Axiom(name, predicate, message)` and `stream._axioms`. The real primitive is `new Axiom(id, {check, severity})`, stored on `stream.axioms`, called as `check(event, gate, sample)`, with WARP's own `hard`/`soft` severity model — which I then used instead of the ad-hoc `strict` flag I had invented. An earlier draft would have silently checked nothing.

**Four default axioms, each violated by real code in this repository.** `type-is-string` (hard) is the one `orchestrator/lib/sigma-writer.js` broke for months, writing `[object Object]` into every sigma_record. Verified directly: feeding the spine that exact malformed event returns `["type-is-string"]`. **The axiom fires.** Advisory by default — turning enforcement on over a live bus with 80 emitters on day one converts a reporting tool into an outage.

**The map is a projection, not a document.** `StreamLog` records what actually ran; `GET /api/warp/map` serves it. Proven in-process: 3 events emitted, 3 mirrored, 2 distinct types, 0 violations, correct `byType` counts. **The 64 orphaned routes exist precisely because the map was a parallel document instead of a projection of code.**

**An unplanned confirmation of AX-011.** Booting real orchestrator and querying `/api/bus/stats` after 7 seconds: `historySize: 0`, `sources: {}`, `listeners: 5`. The spine is attached and the bus is *silent*. Orchestrator's in-process event bus carries almost nothing, because all real cross-system traffic is HTTP. That is independent evidence for AX-011 — the bus was never the inter-system spine, and calling it one is what let self-heal listen to silence.

**Registry updated — a capability that isn't declared is an orphan.** Registered `orchestrator /api/warp/map`, `cortex /api/personas`, `cortex /api/raid/decide`. Hooks 88 → 91. Forward scan: all three resolve to real code. Reverse scan: cortex 29 → 28 (`/api/raid/decide` and `/api/personas` declared = −2; `/api/personas` is also newly implemented = +1). Total 65 = guardian 33 + cortex 28 + copilot 3 + ollama 1 — header and per-surface sums agree.

**Regressions:** orchestrator and cortex both reach CONTRACT after attaching the spine and editing the registry (cortex loads the registry at boot). Loom 18/18.

**Next, in the order the architecture implies:** attach the spine to guardian/cortex/copilot the same way (they are the loudest buses); then migrate the 8 remaining AX-010 violations, each of which is a call change rather than a build; then the kernel unlocks Phases 27/30/109.

---

## PART 28 — The UI entry point exists; copilot's voice was broken in two places

**Merge audit, verified not claimed.** Every uploaded zip's contents are present: v6 (RAID stubs, intelligence decomposition, 60+ tests), v7 (`diagnose`/`move-data` tools), v8 (consent, build/execution pipelines, expectation-watcher, 4 UI files), vault-picker (5 Clear Glass files). Nothing outstanding.

**The UI entry point already works.** `orchestrator.config.json` → `uiURL: http://127.0.0.1:9000`; orchestrator serves `ui/tv-shell/index.html` at `/`. Copilot is proxied — under **guardian's** namespace, which is why `ui/home` calls `/api/guardian/copilot/channel`. Verified live end-to-end: `POST :9000/api/guardian/copilot/prompt {prompt:'take me to architect'}` returned the real navigate intent with the correct `/ui/spec-builder` URL. A `note` prompt correctly **failed** (`ECONNREFUSED 3748`) rather than claiming it saved — the system refusing to lie.

*(My first probe used `/api/copilot/prompt` and got "route not found". The route at line 1674 is real but lives inside the `sub==='guardian'` block where `action=seg[2]`. Read the parser before trusting the grep.)*

### The expectation system: orphaned, then wired, then found broken again downstream

`copilot/lib/expectation-watcher.js` shipped in v8 and **nothing in `copilot/*.js` required it.** It is the event-driven expectation system: a trigger fires, the expected follow-up must arrive within `timeoutMs`, or a violation is raised.

**Copilot had no bus at all** — its events arrive as SSE from cortex/guardian into the `_stream` ring. Per §AX-011 the bus is a within-process spine, so copilot now has one, fed by the real `streamIngest()` path, fanning out `(type, event)` and `('*', event)` exactly as `nexus-bus` does.

**Two real bugs found in the incoming module:**
1. `createExpectationWatcher` accepted a malformed expectation and threw *inside the bus wildcard handler* on the first matching event — `exp.triggerMatch is not a function`. Attached to `streamIngest`, that would break event ingestion for the whole process. Now validated at construction, where it fails loudly at the point of declaration. My first validation pass was itself incomplete: `message` and `linkKey` are also called as functions. Derived from the real call sites, not guessed.
2. Verified the 5 shipped defaults pass the new validation.

**Then the wire was broken one step further downstream.** The watcher emits `copilot.error.detected` onto the local bus. `ui/toast/toast.js` line 66 already subscribes to exactly that event type. **But copilot never broadcast it to SSE clients** — a real detector, firing correctly, into a bus nobody listened to. The dominant bug of this codebase, reproduced once more. Now broadcast. Proven end to end: trigger fires → no follow-up → `reason: timeout` → `broadcast('copilot.error.detected')` → SSE → toast.

**Copilot boots to CONTRACT with 5 expectations armed. Loom 18/18.**

### What remains — mapped, in phases

**Phase A — make copilot talk (small, all wires, no builds)**
1. `ui/toast/toast.js` is loaded by **no page**. Add it to `ui/tv-shell/index.html`; it already knows how to render `copilot.error.detected`.
2. `ui/tv-shell/tutorial/tutorial.js` has **1 referencing file**. Wire it as the pipeline walkthrough — it is the natural test harness for the chain that already works end to end.
3. Spotlight (15 refs) and Nerve are built. Nerve's presence map now has `/api/bus/stats` to poll. Point it at `/api/warp/map` too — that map is a projection of what actually ran.

**Phase B — finish AX-010 (8 call changes, zero builds)**
`guardian/api-dispatch.js` ×2, `guardian/server.js` `/command` ×2, `copilot/adversarial.js`, `copilot/axiom-manager.js`, `lib/execution-pipeline.js` ×3. Each has a real cortex API waiting; each is a `require()` → `nx.post()` swap.

**Phase C — WARP spine to the loud buses**
Attach `lib/warp-bus.js` to guardian, cortex, copilot exactly as orchestrator does. Orchestrator's bus proved *silent* (`historySize: 0`); guardian's will not be.

**Phase D — the kernel**
`meta/rfr2/kernel/` unlocks `clip`/`compress`/`context`, and with them Phases 27 (System State VM), 30 (Time-Travel Debugging), 109 (Epistemic Branch Runtime). Contract recorded in `docs/RFR2-KERNEL-CONTRACT.md`. Blocked on the upstream module — not reconstructable without guessing semantics.

**Phase E — reverse scan to zero**
65 implemented routes still undeclared (guardian 33, cortex 28, copilot 3, ollama 1). Declaring them is mechanical; the *right* fix is making the registry a projection of code, the same way `/api/warp/map` is a projection of the StreamLog.

---

## PART 29 — Merge, then the registry as a projection: 65 → 27

**Mapped first. Neither zip contains the RFR2 kernel.** Phases 27/30/109 remain blocked. (`nexus-v8-rfr2-wired` contains `docs/RFR2-KERNEL-CONTRACT.md` — it is derived from this tree.)

**From `nexus-v8-rfr2-wired`, all verified by running its tests in MY tree:**
- `cortex/intelligence/mastermind.js` now genuinely consumes RFR2: `loadRFR2Module('delta')`. Confirmed superset of mine (91L → 156L, nothing lost). `mastermind-fractals` **4/4**.
- `lib/agent-tools/tools/run-pipeline.js` + `run-pipeline-tool` **5/5**.
- 10 per-system `spec/` files (cortex, guardian, orchestrator, siso, ollama, idearium, eravos, emerge, erosmancer, cli).
- **Skipped** `clear-glass/ncp-client.js` — deliberately demoted to `tests/helpers/` earlier; re-adding it would recreate the parallel NCP provider.

**From `copilot-full-tool-access`: one file taken, one refused.**
- Took `query-intelligence.js` (`nexus_intelligence` — queries cortex's faculties).
- **Refused `run-cockpit-command.js`.** Its `index.js` registered it *alongside* `run-command.js`. Both read cockpit's `INTERACTION_CONTRACT`; both execute via `ForgeCLI.exec()`. They are the same tool under two names. A model offered both picks arbitrarily and they drift. `run_command` stays canonical (it enumerates args; the other does not). **Merge duplicates by picking one and deleting the other — never by keeping both.**
- **Skipped its `copilot/server.js`** — behind this tree (no expectation-watcher) and adds nothing tool-related.

Tools registered: `read_file, run_command, diagnose, move_data, run_pipeline, nexus_intelligence`.

### `scripts/generate-hooks.js` — the registry as a projection of code

Hand-writing 65 hook entries produces exactly what already exists: a parallel document that drifts from the moment it is written. This reads the real route literals **and their real HTTP methods** out of the source and emits declarations from them. Dry-run by default; writes only on `--write` (§1.1 — run it, read it, then let it write).

**Result: reverse scan 65 → 27.** Hooks 91 → 131.

**It declared 38, not 65, and the shortfall is the honest part.** Cortex routes as `if (p === '/x')` with the method tested elsewhere, so the method is **not statically determinable at the match site**. A wrong `method` in the registry is a lie, so the generator refuses to guess and leaves those 27 (cortex 24, guardian 3) for hand entries or a real parser. Verified: **none of the 38 generated hooks appear in the forward scan's missing-wire list** — every one resolves to real code.

**The forward scan's 10 declared-but-missing wires are the mirror violation**, and one is diagnostic: `cortex-self-heal → /api/self-heal/run` is **declared with no implementation**. Also `cortex-snapshot-create`, `architect-snr-gate`, `bridge-system-register`, and six `emerge/*`.

### Stub + unwired sweep

- **10 declared-but-missing routes** (above).
- **23 explicit `not implemented` / `TODO` markers** in production code, concentrated in `emerge/compiler/*`, `loom/templates/system-scaffold.js`, `cortex/boot.js`, `guardian/server.js`.
- **Genuinely unwired modules: `lib/nano-ws.js`, `lib/system-manifest.js`** — zero consumers.
- **My first orphan list was wrong** and I corrected it: a sloppy matcher reported `consent` (3 consumers), `execution-pipeline` (3), `rfr2-bridge` (4), and `nexus-expansion-boot` (2) as orphans. Measure, then re-measure before believing a negative result.

**RFR2 status: 5 modules exercised, now with a real production consumer** — `rfr2-bridge` has 4 consumers (`mastermind`, `consent`, 2 test suites). `clip`/`compress`/`context` still blocked on the absent kernel.

**Regressions:** cortex, guardian, copilot all CONTRACT; Loom 18/18. (A `copilot EADDRINUSE` failure mid-run was a leftover process from my own earlier test, not a defect — confirmed by re-running after freeing the port. Evidence tiers matter: `PARSES` is not `CONTRACT`.)

---

## PART 30 — Reverse scan: 65 → 0, and a stub that reported success

**Hooks 91 → 161. Reverse scan 65 → 0.** Forward scan unchanged at 10 (all pre-existing). cortex, guardian, copilot, orchestrator all CONTRACT. 207 tests pass, 7 fail (the stale `copilot.test.js`, broken in every branch). Loom 18/18.

### The find: a stub that lied

```js
if (p === '/api/cli/exec') {
  json(res, 200, { ok: true, result: 'cortex cli exec — not implemented', ts: Date.now() });
}
```

**HTTP 200, `ok: true`.** Every caller checking `ok` saw success. This violates §1.2 (nothing silently fails) and §1.3 (no stubs in production) at once, and it is *worse than a missing route*: a missing route fails loudly at the call site, while this one quietly convinced every caller its command had run. Now returns **501, `ok:false`**, with a pointer to the `run_command` agent tool. Verified against a booted cortex. The route itself stays — in a non-linear system a route is an affordance and its missing implementation is a gap to fill, not proof the surface should die. It was the only stub of this shape in the codebase.

### Why the generator stopped at 38, and what the other 27 were

`scripts/generate-hooks.js` declared the 38 routes whose method appears in the conditional. The rest are written `if (p === '/x') { … }` with **no method guard anywhere** — not in the header, not in the body. **12 of 13 sampled cortex routes enforce no method at all.** A `GET` to `/api/intelligence/adversarial` runs the adversarial analysis. A `POST` to `/api/events` returns events.

**A fixed-window heuristic got this wrong**, and would have written a lie into the contract: with a 700-char window it inferred `GET` for `/api/cli/exec` (which purports to execute CLI commands) and `POST` for `/api/intelligence/status`. `scripts/analyze-methodless-routes.js` replaces the window with **brace-matched full-handler extraction**, and reports evidence rather than a guess.

**Two more errors of mine, caught before writing:**
1. The declarer initially took the *first* method literal in a block. But `/cfr/health` and `/cfr/field` share one handler that branches: `POST` updates the field, anything else returns it. Declaring only `POST` would have hidden the `GET` surface. Fixed to collect **all** methods per handler — 23 routes yielded 28 hook entries.
2. The remaining 4 orphans were **aliases**, not routes: `/cockpit` / `/cockpit/` / `/jobs/` are matched by the same conditional, as is `/api/settings.js` with `/api/settings`. Padding the registry with duplicate declarations for one handler would have been the wrong fix. **The measurement was wrong, so I fixed the measurement**: `verify-wires.js` now normalizes trailing slashes before comparing. Then declared the two genuinely distinct paths (`/cockpit` is a real UI surface; `/api/settings.js` is fetched as a script tag).

**Every hook carries `methodEnforced`.** Where the handler has no guard, the registry says so rather than implying an enforcement that does not exist. That flag is now a work queue: 20+ cortex routes accept any verb. Adding real guards is a behaviour change and belongs in its own phase, with clients checked first.

### Stub + unwired sweep (final)

- **10 declared-but-missing routes.** One is diagnostic: `cortex-self-heal → /api/self-heal/run` is declared with **no implementation** — the self-heal that has never fired now also has a hook pointing at nothing. Also `cortex-snapshot-create`, `architect-snr-gate`, `bridge-system-register`, and six `emerge/*`.
- **23 `not implemented` / `TODO` markers**, concentrated in `emerge/compiler/*`, `loom/templates/system-scaffold.js`.
- **Genuinely unwired modules: `lib/nano-ws.js`, `lib/system-manifest.js`** — zero consumers.
- **My first orphan list was wrong** — a sloppy matcher called `consent` (3 consumers), `execution-pipeline` (3), `rfr2-bridge` (4), `nexus-expansion-boot` (2) orphans. Re-measure before believing a negative result.

### Remaining, in order

1. **`methodEnforced: false` on 20+ cortex routes** — real guards, behaviour change, own phase.
2. **10 declared-but-missing wires** — either implement or delete the declaration. `/api/self-heal/run` is the interesting one.
3. **AX-010: 8 remaining hardwires** — each a `require()` → `nx.post()` swap.
4. **WARP spine to guardian/cortex/copilot.**
5. **The RFR2 kernel** — still absent, still blocking Phases 27/30/109.

---

## PART 31 — Both scans to zero, and the checker that was reading its own comments

**Forward scan 10 → 0. Reverse scan 0. Hooks 162.** Five services CONTRACT. 207 tests pass, 7 fail (stale `copilot.test.js`). Loom 18/18.

### The 10 declared-but-missing wires, triaged individually

**Three hooks pointed at the wrong surface entirely:**
- `cortex-self-heal → cortex /api/self-heal/run` — that route never existed, and its two referenced files (`cortex/healer/index.js`, `cortex/self-heal/index.js`) are **phantoms**. The real implementation is `nexus-heal-loop.js`, served at orchestrator's `POST /api/nexus/heal`. **Verified live**: it classifies a gap and returns a real `repairSpec`. So self-heal exists, runs, and builds repair specs — I have now been wrong about it twice, in both directions. Hook relocated to `orchestrator.hooks.js`.
- `architect-snr-gate` declared `ollama /api/snr/check`. Architect implements `/api/snr`. Wrong surface *and* path. Retargeted.
- `bridge-system-register` declared `/bridge/register` and referenced `bridge/server.js`. Bridge implements `/bridge/handshake`; systems register with **orchestrator** at `/api/register`. Wrong on path and premise. Retargeted.

**One capability genuinely missing, now built:** `POST /api/snapshots/create`. Declared since 2026-06-11 — *"archive full JAA table state so the system can rewind"* — and never implemented; `/api/snapshots` only ever **read** a table nothing wrote. Now real: 7 tables, per-table integrity via `rfr2 identity.contentHash()` (RFR2's **second** production consumer, and the versionium primitive), plus a `stateHash` over all of them. Verified: two consecutive snapshots of unchanged state produce identical hashes.

**A latent bug caught before it bit:** the snapshot must never hash its own output table. `snapshots.json` doesn't exist on disk *yet*, so this was invisible. The moment it appears, every snapshot would include the previous one, `stateHash` would differ on every call, and the single property the hash exists to provide — same state, same hash — would be silently destroyed. Explicitly excluded.

**One honestly refused:** `cortex-snapshot-rollback` is now `status: 'planned'`. It is **not implementable from the current snapshot**: `create` stores content *hashes* for integrity, not content, so there is nothing to restore from. Real rollback is `rfr2/compress.snapshot()/restore()` — Phase 27, blocked on the absent kernel. Declaring it `active` would be a lie.

**Six emerge hooks → `status: 'planned'`.** Emerge has no HTTP server and is not supervised by autopilot; its routes *cannot* exist. That is a roadmap entry, not a lie. `verify-wires.js` now honours `status`: only `active` hooks assert "this exists" (§1.1).

### The checker was reading its own prose

`/api/warp/map` was passing the forward scan **only because a comment above the handler mentioned it**. The literal appears nowhere in code — the route is segment-matched. A checker that reads its author's comments instead of the program is worse than no checker.

**Then I broke it fixing it.** The obvious `/\*[\s\S]*?\*\//g` matched a `/*` sequence inside a **regex literal** in `copilot/server.js` and swallowed everything to the next `*/` — **30,444 of 48,908 characters, 62% of the file** — and reported 14 live routes as missing. Measured, not guessed. Corrected to strip only comments that begin a line; verified it now removes 22–38% and preserves every route literal.

**Three distinct routing styles exist here, and substring search sees one of them:**
1. literal — `p === '/api/events'`
2. segment — `sub==='warp' && seg[2]==='map'` (orchestrator)
3. prefix+action — `startsWith('/api/blueprint')` + `action === 'scan'` (architect)
Plus path params: `startsWith('/api/jobs/')` serves `/api/jobs/:id`.

All four are now understood by the scanner. Before that, it produced false reports in **both** directions simultaneously: false *misses* from comment-matching, false *hits* on segment and prefix routes. `architect-topology-scan` and both `ollama-jobs-*` hooks were live routes wrongly accused.

### Orphans resolved

- **`lib/system-manifest.js` — wired.** It projects components + hooks + wires + APIs + CLI per system from data that already exists: literally *"the system is mapped as it's built."* Zero consumers. It was also **broken**: `buildAllManifests()` required an undocumented argument, so any no-arg call threw `systemIds is not iterable` — plausibly why nothing used it. Fixed (defaults to the config `ports` block, per-system failures isolated) and given a door: `GET /api/manifest` and `/api/manifest/<system>`. Verified live: 13 systems, cortex reporting 39 components / 44 hooks / 39 APIs.
- **`lib/nano-ws.js`** stays. It implements a real declared surface (`guardian-wss-7821`). Unwired capability, not dead code — and in a non-linear system that distinction is the whole point.

**Remaining:** the 23 `not implemented` markers (concentrated in `emerge/compiler/*`, which has no server); `methodEnforced: false` on 20+ cortex routes; 8 AX-010 hardwires; the RFR2 kernel.

---

## PART 32 — Idearium: map first, then Phase 1 shipped

Full phase map in `docs/IDEARIUM-PHASE-MAP.md`. Ground truth measured before planning (§3.1, map before build), and it corrected **two of my own earlier claims**:

- **"23 `not implemented` markers, mostly emerge/compiler" was wrong.** Those strings are **template literals** inside `emit.js` — emerge *generates* stubs into scaffolds. Real stubs across the tree: **8**. `emerge/compiler/` is ~5,600 lines of real code, which strengthens the deterministic-compiler plan.
- **The provider cascade is not backwards.** `cortex/core/raid/index.js` LAW_I already tries ollama first; LAW_III makes claude the unconditional last resort. The production path is already ollama → … → claude. The real problem is a *second* cascade in `guardian/agents/index.js` with exactly one consumer (`cli/diagnose.js`) — a competing truth layer to delete, not to fix.

**The uploaded `spec-engine/index.js` is byte-identical to the tree's.** `templateId`, `_seedChunksFromTemplate`, `listTemplates` existed nowhere. `templates.js` would have landed as an orphan the moment it arrived.

### Phase 1 shipped and proven over HTTP

`createSpec({ templateId })` — unknown id **throws**; a spec that claims a template it never used is a lie in its own manifest. `_seedMetaFromTemplate()` has **honest scope**: `genesis.spec` is a grammar (`spine WARP`, `bind kernel.boot -> Stream`), not eight markdown essays. It deterministically fills exactly **one** section — `meta`, from the real header. **9 of 10 chunks need an agent instead of 10**: a measured 10% reduction, not a promised one. `templates.js`'s comment ("pre-fill whichever chunks it can") was an unimplemented promise; it is now implemented at its true size.

Live: `GET /api/spec-engine/templates` → 5 templates, genesis with `hasSeed`. `POST /api/spec-engine/specs {templateId:'genesis'}` → `meta` complete, `agent: 'template'`, `templateId` recorded. Unknown template → 400.

**Three bugs caught inside this phase, all mine.** (1) A scripted insert silently skipped because its guard string matched a different line, so `templateId` was never recorded. (2) I set `chunk.agent = 'template'` on a **stale in-memory object** and then returned the on-disk manifest — the seeded chunk reported `agent: 'ollama'`, **claiming an LLM produced content no LLM touched**. Provenance that lies is worse than provenance absent. (3) `idearium/api` loads spec-engine as `m.default || m`, so named exports were invisible: `se.listTemplates is not a function` at runtime — found by calling the live endpoint, not by reading the file. A fourth was caught before shipping: the `speceng.templates` action had no route in `matchRoute`'s table, so no URL could reach it.

### Pushback, on the record

1. **"All data saves to cortex"** breaks sovereignty. Guardian owns its store today; cortex-primary means no system boots without cortex, which destroys the hotswap proven on :3999. Correct pattern: **local primary, cortex mirror**. Two independent copies is what "no data lost" actually means; one central store is a single point of loss wearing the costume of safety.
2. **"Utilize the rewind"** is blocked on `meta/rfr2/kernel/`, which exists in no zip. Not reconstructable — the surface is derivable, the semantics (eviction, drop accounting, causal order) are not, and a wrong kernel makes `compress.snapshot()` restore to a *different* causal graph. Silent corruption of the one subsystem whose purpose is fidelity.
3. **"Full Notion before the loop closes"** would produce the seventh orphan. Six already: expectation-watcher, system-manifest, toast, tutorial, RFR2, templates. Every subsystem built ahead of its wire became an orphan. **Phase 2 — close the thinnest loop (idea → spec → chunk → dispatch → artifact → repo) — is worth more than Phases 3–9 combined**, because after it every feature has somewhere real to attach.

Both wire scans still 0. Loom 18/18. Idearium boots and serves.

---

## PART 33 — WARP now compounds. And the module that could never load.

### The compounding gap was documented, not fixed

`warp-build-dispatch.js`'s own header said it: *"the exact-cache isn't populated after one success ... an identical chunk has to be independently re-generated and retained 3 times."* Accurate, and nobody acted on it.

**Root cause: two mechanisms sharing one write condition.** `unifiedDispatch` step 5 only calls `crystallizer.set()` when `readyToPromote` — `hits >= 3` **and** `fitness >= 0.7`.

- **Population** is *generalization*: a variant gets reused for inputs that are **similar**. Three trials is the right bar. Unchanged.
- **The exact cache** is *memoization*: `digest` is content-addressed, so a hit means the input is **identical**. Three regenerations of identical input is three times the tokens for one answer, and guarantees the cache can never make the next build cheaper than the last.

Safety verified rather than assumed: step 4 returns `{ok:false, source:'rejected'}` on any **hard** axiom failure before step 5, so every output at the retain point is already gate-validated. The new write additionally requires `cascadeResult.ok` and the same fitness floor.

**Measured: 3 identical dispatches → 3 LLM generations before, 1 after.** Sources `[generated, generated, generated]` → `[generated, crystal, crystal]`, costs `[_, 0, 0]`. **67% eliminated, and every subsequent identical build costs zero.** Opt-in (`exactCacheOnFirstSuccess`), off by default — honouring that file's own stated law: *"new behavior only activates when a caller explicitly asks for it."* WARP's 43 tests unchanged; loom 18/18.

*Caught before shipping:* my first draft referenced `DEFAULT_FITNESS_MIN` and `exactCacheOnFirstSuccess` with neither in scope — a `ReferenceError` on every dispatch. And `warp-cascade` didn't forward the flag: an opt-in nobody could opt into.

### idearium's cache key was simultaneously useless and unsafe

1. **Never hits.** `seam_uuid = ${specUuid}:${chunkIdx}` — and `digest = hash(gateSignature=seam_uuid + axioms + event)`. specUuid is unique per spec, so an identical chunk in a second spec produced a different digest. The fallback was worse: `idearium-chunk-${Date.now()}` gave **every single call** a unique key.
2. **Hits wrongly.** `warp-cascade` builds `event: { data: { seam: record.seam_id } }`, and `seam_id` here is the section **title**. The prompt was nowhere in the digest. Two different chunks both titled "Purpose" would hash identically and could return each other's output. *A wrong cache hit is worse than a miss.*

Fixed by the same move: `seam_uuid = idearium-chunk-sha256:<sha256(prompt)>`. Identical prompts share one key; different prompts never do. **Content-addressing is what makes a cache compound.**

### `warp-build-dispatch.js` could never be imported

It does `import { pollGuardianJob } from './chunk-dispatch.js'`. That module defines `_pollGuardianJob` **privately** and exports only `dispatchChunkWithVerification`. The named import is an ESM SyntaxError at load — **the file could never be imported.** It also has **zero consumers**, so nothing ever tried, and the failure stayed invisible. Its header describes test results that cannot have come from importing it.

Fixed by exporting the real poller under the expected name rather than writing a second one. It now loads. **A module with zero consumers cannot report that it is broken; absence of failure is not evidence of function (§1.1).**

### Token reduction: three sources, and they must not be conflated

- **emerge** — deterministic generation. Content produced by a compiler costs **zero** tokens. This is the 90% claim's only honest home. `emerge/compiler/` is ~5,600 real lines; the "23 not implemented markers" I reported earlier were **template literals** inside `emit.js` — emerge *generates* stubs, it isn't made of them. Real stubs tree-wide: 8.
- **WARP exact cache** — memoization. Measured 67% on a 3-build identical sequence.
- **templates** — seeding. 1 of 10 sections. 10%.

They **multiply, they do not add**, and none is 90% alone. State which mechanism a number came from, or the number means nothing.

### Documents

- `docs/warp-devkit-addendum-v1.4.1.spec` — additive, revertible (delete the file, remove two params + one pass-through).
- `docs/idearium-templates.spec` — decoupled, new capability, own spec.
- Versions bumped: `spec-engine` 1.0.0 → **1.1.0**; `warp-cascade` 1.0.0 → **1.1.0**; `warp/dispatch` versioned **1.4.1** (it had no version marker at all).
- `tests/modules/warp-compounding.test.js` — **6/6**, including T-006: a below-floor output is never frozen into the exact cache.

### The duplicate UI

`idearium/ui/index.html` and `ui/idearium/index.html` were **byte-identical 2,327-line files**. `/ui/idearium` is a URL, served by orchestrator from `idearium/ui/` — the second copy was a fallback nobody reached. Removed; the sovereign location wins, because a system owns its own UI. Verified idearium still serves `200` on `/`.

**On breaking the HTML into a stack:** agreed, and it belongs in Phase 8, *after* the loop closes. A 2,327-line file split into spec-library / options / brainstorm / IDE panels before there is a pipeline to feed them produces four orphans instead of one. Split it when each panel has a contract endpoint to render from — `speceng.templates` is the first of those, and it exists now.

---

## PART 34 — Phase 2: WARP's cache is now in the real build path

### The finding that makes the whole compounding complaint make sense

`speceng.build` — idearium's **production** build action — called `as.buildChunkWithAgent()` directly, wrapped in `dispatchChunkWithVerification`'s retry ladder. **WARP was not in that path at all.** `warp-build-dispatch.js` held the cache, had **zero consumers**, and (as Part 33 established) could not even be imported.

So the cache was not slow. **It was not there.** Every chunk paid full tokens, every time, forever.

### The wire

`createWarpChunkDispatch(as)` returns a function with the *same* `(prompt, opts) → {ok, text}` shape as `as.buildChunkWithAgent`, so it drops straight into `dispatchChunkWithVerification`'s `dispatchFn` slot. The retry ladder and Detector verification are unchanged; WARP simply answers instantly when this exact prompt has been built before.

**Fails soft.** If WARP cannot load, builds continue on the direct agent path. A caching layer must never be a single point of failure for the thing it caches.

**Proven, in a fresh process:**
- build #1, cold → `source: generated`, 1 agent call
- build #2, identical prompt → `source: crystal`, `cacheHit: true`, `cost: 0`, **still 1 agent call**
- build #3, different prompt → `generated`, no wrong-hit; digests differ
- **Re-run the whole script in a NEW process → 0 agent calls.** The crystallizer is flat-file, so the cache survives restart. That is compounding in the real sense: every build makes all future identical builds free, permanently.

### Three bugs caught inside this wire, all mine

1. **`dispatchChunkWithVerification` dropped provenance.** Its success return was a fixed `{ok, escalated, text, detection, attempts, agent}` — `source`, `cost`, `cacheHit`, `digest` were silently erased. A zero-token cache hit would have been indistinguishable from a full LLM generation in every downstream event and ledger row. **An optimisation nobody can measure is an optimisation nobody can prove.** Verification owns quality, not provenance; it now forwards what it did not produce.

2. **The lazy loader made the first build always miss.** `getWarpChunkDispatch()` returns `null` until its dynamic import resolves, so the very first `speceng.build` — the one whose output most needs to *enter* the cache — bypassed WARP entirely. Pre-warmed at startup, matching the existing `getSpecEngine(); getAgentSuite();` pattern. Verified in the boot log: `WARP chunk dispatch active — exact cache in the build path`.

3. **The WARP dispatch discarded its own provenance** before returning: `{ok:true, text, agent:'warp'}` with no `source`/`cost`. Now returns `source`, `cost`, `digest`, `cacheHit`, and the chunk-complete event records them.

### Tests

- `tests/modules/idearium-warp-cache.test.mjs` — **7/7**. T-005 specifically guards against the wrong-output cache hit that the old title-keyed digest permitted.
- `tests/modules/warp-compounding.test.js` — **6/6**.
- WARP core 12/12, v1.4 21/21, loom 18/18. Both wire scans still 0. cortex + guardian CONTRACT.

### Loop status

`idea → spec → chunk → dispatch → artifact → repo`

- **spec** — `createSpec`, with template seeding (Part 32).
- **chunk** — `SPEC_SECTIONS` → 10 chunks, `nextPendingChunk`.
- **dispatch** — ✅ **now through WARP**, cached, verified, provenance-recorded.
- **artifact** — `completeChunk` writes chunk files; `archiveSpec` compresses.
- **repo** — `repo.ingest` exists as an action; **not yet proven end-to-end with a real artifact.** That is the next link, and the last one before the loop turns.

---

## PART 34 — Phase 2: the loop closes, with zero LLM calls

**`tests/modules/idearium-loop.test.js` — 18/18.** One idea, all the way through: idea → spec → deterministic chunk → physical artifact → archive → repo compartment. **No tokens spent**, because the genesis template completes `meta` deterministically. A test that stubs the dispatcher proves the stub works; this drives the real pipeline down the one path that needs no agent.

Every link verified by observing the **filesystem**, not by trusting a return value. `createSpec` can return a manifest saying `complete` while no file exists — that is exactly the bug class this codebase keeps producing. The artifact is checked for front-matter, for its own provenance line, for content **extracted from genesis.spec** (`Spine: WARP`), and for absence of `undefined` / `[object Object]` leakage.

### Three real findings

1. **`speceng.build`'s comment claimed dispatch went through WARP. It never did.** `warp-build-dispatch.js` could not be imported at all — `pollGuardianJob` was never exported — so `getWarpChunkDispatch()` always rejected, and the "fails soft" fallback silently used the direct agent path. The comment described behaviour that could not occur. A caching layer must never be a single point of failure for the thing it caches — but *failing soft must not mean failing silent* (§1.2).

2. **Even once importable, the first build would bypass WARP.** The loader fired the dynamic import and returned `null` immediately; the import resolves a tick later. The first build is the one that must *write* the cache for anything to compound. Now awaited.

3. **"WARP is in the build path" is now a checkable claim, not a comment.** `GET /api/spec-engine/warp-status` → `{active: true, attempted: true, error: null}`, matching the boot line `[idearium/api] WARP chunk dispatch active`. `idearium/data/warp-crystals.json` holds real digest-keyed entries.

### Two things I got wrong, corrected by running the system

- I asserted the specs root was `data/idearium/specs`. It is `idearium/data/specs` (`spec-engine/index.js:45`). The test failed against my assumption; the code was right.
- **I asserted idearium's `/sse` "streams nothing"** after reading a truncated handler, and concluded copilot could never be told a build was stuck. **False.** `emit()` records to the CFR ledger *before any subscriber sees the event* (§LAW II), then `_broadcast()`s to SSE clients. Proven live: a subscriber received `idearium.ready` **and** `idearium.spec-engine.created`. So idearium → SSE → copilot → expectation-watcher is a real chain, and the `chunk-building-then-complete` expectation can genuinely fire.

Reading a file is not evidence. Twice in one phase I drew a confident conclusion from a partial read and the running system contradicted me.

**231 tests pass**, 7 fail (the stale `copilot.test.js`). Loom 18/18. Both wire scans 0.

### What Phase 2 unlocks

Every subsequent feature now attaches to a loop that turns. The UI stack (Phase 8) can be split into spec-library, options, brainstorm/braindump, IDE — **and more** — because each panel now has a real contract endpoint to render from and a real artifact to point at, rather than being a fourth orphan waiting for a pipeline.

---

## PART 35 — The crash, the closed-loop tool, and the idea→repo link

### The machine crash — root-caused and fixed

From the live Windows console: `[orchestrator] exited code=3221226505` then, on restart, `Error: spawn UNKNOWN errno: -4094`. `3221226505` = `0xC0000409` (STATUS_STACK_BUFFER_OVERRUN, Node's fatal fast-fail, usually OOM). `-4094` = UV_UNKNOWN — a spawn failing this way during a restart is resource exhaustion, since the same command spawned fine seconds earlier.

**Measured cause: `autopilot.js` spawns twelve Node processes and passed NO heap limit to any of them.** Each was free to grow to V8's default (~4GB). Add Clear Glass (Electron + four webviews) and there is no headroom. Nothing watched memory, so the first symptom was a crash — and the supervisor then restarted straight back into the exhausted machine, turning one crash into a storm.

`lib/resource-monitor.js` (zero-dep): real `os` memory/CPU sampling, delta-sampled CPU%, pure `classify()` → ok/pressure/critical + `spawnSafe`. Honest about limits: per-child RSS can't be read cross-platform without a native dep, so it's self-reported; `cpuPct` is `null` on the first sample, never a fabricated 0. Two autopilot changes: (1) every Node child gets `--max-old-space-size` (default 1024MB, per-kernel override) so an over-budget process dies with a **named JS OOM** attributable to itself instead of a Windows status code; (2) spawns are gated on real free memory and re-armed on a 15s backoff. `GET /api/perf` exposes it live (verified: level, spawnSafe, freeMem%, rss). **Stated limit: the heap cap governs V8 heap, not external/native memory (Electron webviews).**

### v9 merged

`run_closed_loop` tool — drives idea→spec→build→repo as one agent tool by calling idearium's HTTP API. This is "co-pilot can do anything nexus can." Test 4/4. Six v9 tests merged. Per-system specs (architect/copilot/bridge). **`run-cockpit-command` refused a second time** — still a byte-level duplicate of `run_command`. A prior decision isn't undone by re-uploading the file. Tools now: read_file, run_command, diagnose, move_data, run_pipeline, nexus_intelligence, run_closed_loop.

### The idea→repo link — your reported bug, closed

*"Idearium isn't importing ideas into the repository library. When you click promote idea to a repository, it needs two options, automatic using emerge or manual using the spec builder."*

**Root cause:** `repo.ingest` requires `files[]` (a drag-and-drop payload). There was **no path from a built spec to a repo** — promoting produced a spec, and nothing turned that spec into a repo artifact. The last link before the loop turns was missing.

`spec.promote` (`POST /api/spec-engine/specs/:uuid/promote`) assembles a manifest's completed chunks into a single `.spec` artifact and ingests it via `RepoLayer.ingest` (which already accepted `specText`):
- **`emerge` (automatic)** — deterministic assembly, no agent, zero tokens. **Refuses (409) if any chunk is unbuilt** rather than shipping a partial repo that looks complete.
- **`manual` (spec builder)** — allows pending chunks, marks them as TODO sections for a human to finish.

Verified end to end: auto-promote of an unfinished genesis spec → 409 listing the 9 pending sections; manual → 200 with a real `repoUuid` that **appears in `/api/repos`**. `tests/modules/spec-promote.test.mjs` 5/5.

*Bug caught inside the fix:* my first version reported `result.uuid`, but `ingest` returns `{repo, ideaUuid, specUuid}` — the id is `result.repo.uuid`. The response would have claimed success with a null id, a success message over a caller that couldn't find its repo. Now returns the real `repoUuid`, and 500s if ingest produced no repo.

### Loop status

`idea → spec → chunk → dispatch✅ → artifact → repo✅` — **the loop turns.** A genesis idea becomes a spec (meta seeded), chunks dispatch through WARP's cache, and `spec.promote` lands a real repo in the library. Both scans 0, five services CONTRACT, loom 18/18.

---

## PART 36 — Merge: my tree as base, not the uploaded merge

The upload included a `MERGE-REPORT.md` describing a completed merge that **took files by modification timestamp**. That is a real hazard: my most recent work post-dates the source zips, so a timestamp merge silently *reverts* it. Verified before trusting it — the uploaded `nexus-merged.zip` was **missing `spec.promote`** (the idea→repo fix) and **`lib/resource-monitor.js`** (the crash fix). Adopting it wholesale would have reintroduced the two bugs from the last two turns.

**So the base is MY tree, and only genuine additions were pulled in:**
- **CLI copilot fallback** (`cli/nexus-cli.js`, +51 lines) — the CLI now posts to copilot's real `/api/prompt`, so every front door reaches the same copilot with all its tools. "Same copilot everywhere, many front doors." Test 3/3.
- **`query_recall` tool** — cortex `/api/recall` (CortexPushRecall) existed with two real lanes (lexical + recency); copilot *wrote* to recall but had no *read* path. This is that path, exposed to the agent loop — "what did we decide about X". Honest scope: 3 of 5 lanes (causal/failure/bep) need the absent kernel, so the tool only offers intents whose lanes are real. Registered; endpoint verified live (`ok:true`). Decoupled spec `docs/nexus-copilot-recall.spec`.
- **loom wire-intent graph** — `loom/schema/registry.js` gained `graph()`/`contextGraph()` carrying wire intent and component consumes/produces (superset, nothing lost). `loom-context-intent` 5/5, schema regression still 18/18.

Tools now (8): read_file, run_command, diagnose, move_data, run_pipeline, nexus_intelligence, run_closed_loop, **query_recall**.

**Refused again:** `run-cockpit-command` (still a duplicate of `run_command`).

**Verified the merge reverted nothing:** `spec.promote`, `resource-monitor`, WARP compounding, and the autopilot heap gate all still present. Both wire scans 0. cortex/guardian/copilot CONTRACT. spec-promote 5/5, warp-compounding 6/6, closed-loop 4/4.

**On the MERGE-REPORT method:** taking whole files by timestamp is safe only when the two archives are strictly sequential off one base. They were not — this session advanced idearium and orchestrator *after* both zips were cut. The lesson is the one this codebase keeps teaching: verify against the running tree, never against a claim about it.
