# NEXUS Expansion Map — 2026-07-06
Status: **proposed** (this document is the map; nothing below is built by
virtue of being written here). Per AXIOMS-v3.1: map first, build second,
update this spec only after comparing real output against what's written
here and confirming it matches. Every real/stub/missing claim below was
checked against actual source this session — see the running state spec
and component maps for the underlying evidence trail; this document
doesn't re-derive it, it organizes it into one causal map and phase order.

---

## Part 1 — Why CFR/RFR2 are the mapping substrate, not a new one

Two real things already do exactly the job this map needs, so this map
reuses them instead of inventing a third notation:

- **CFR** (`meta/cfr/`) — real, wired, load-bearing. Every event gets
  sigma/delta/field scoring and a causal-graph edge, live, today. This is
  the *condition* substrate: what state something was in, what it
  transitioned to, how anomalous the transition was.
- **RFR2** (`meta/rfr2/`) — real, built, **still zero functional
  consumers** (reconfirmed this session: only `meta/index.js`'s barrel
  re-export touches it). This is the *causality* substrate: bounded
  subgraph extraction, replay, fractal/compound-effect detection —
  reasoning about *why* a condition arose, not just that it did.

So "map conditions and causality" isn't a new exercise — it's naming,
for each piece below, which CFR field/edge type would observe its
*condition* and which RFR2 primitive would explain its *causality*, then
using that to order the phases (a phase whose causality can't yet be
observed shouldn't be built before the observation it needs exists).

---

## Part 2 — Causal map, piece by piece

### 2.1 WARP as build logic
- **Condition (CFR)**: real — every `unifiedDispatch()` call already
  produces a real fitness score, cache hit/miss, and (once wired)
  a causal edge from the triggering event to the dispatch outcome.
- **Causality (RFR2)**: not yet consumed. `detectFractals` could answer
  "does this chunk's build pattern recur across specs" — nothing calls
  it today.
- **Status**: **real** — `idearium/spec-engine/warp-build-dispatch.js`,
  built this session, 5/5 tests, wired as default with an escape hatch.
- **Dependency**: none blocking. Already the foundation everything below
  reasoning about "did this build actually work" sits on.

### 2.2 Fluid agent routing ("I want to talk to chatgpt")
- **Status**: **DONE — 2026-07-06, 6/6 tests, confirmed against real output.**
- **Correction to this document's own original claim**: Part 2.2 originally
  said "the routing mechanism itself already exists, only the extraction
  is missing." Checked `route()`'s real body while building this —
  that was wrong. `route()` always tried Ollama first, unconditionally;
  there was no bypass at all.
- **A second, bigger, real bug surfaced while fixing this**:
  `_tryGuardian()` posted to `${GD_URL}/api/copilot/prompt` — a route
  Guardian's own source says was removed ("sovereign copilot service at
  :3750 handles these"). Every Guardian escalation from lifeline has
  been silently failing since whenever that removal happened. Fixed by
  replicating the real, currently-working handshake+dispatch pattern
  already proven in `copilot/server.js`'s fulfillment path (`GET
  /providers` then `POST /command`), not invented a second way.
- **Built**: `extractExplicitAgent()` (regex over `talk to|use|switch
  to|ask` + known agent names) + a bypass in `route()` that dispatches
  straight to the named agent when connected, falls back to the normal
  cascade honestly when it isn't.
- **Condition/Causality**: now real — a `chatgpt`/`claude` dispatch via
  this path produces a real event Guardian's own CFR ledger already
  scores (the `handoff.copilot_to_guardian` event in `copilot/server.js`
  was already wired; `lifeline.js`'s path now reaches the same real
  `/command` endpoint, same causal visibility).

### 2.3 Copilot learning from each successful step
- **Condition**: `lib/reflection.js` (Phase 11, real) — aggregates
  satisfaction signals, opens a gap when a pattern crosses a threshold.
  This already *is* "learn from outcomes," deliberately conservative
  (never auto-mutates RAID weights or the identity kernel directly).
- **Causality**: RFR2's `detectFractals` is the natural fit — "this
  sequence of successful steps recurs" — still zero consumers.
- **Status**: **partially real**. The learning substrate
  (`reflection.js`) exists and is conservative by design; it is not
  currently fed by the *new* intelligence faculties built this session
  (intuition/mastermind/adversarial, `system-lattice`, or WARP's own
  population/crystallizer). Wiring those as new reflection inputs is
  real, additive work, not a rebuild.
- **Dependency**: 2.1 (WARP) should land first — its population/
  crystallizer already accumulate exactly the "successful pattern"
  signal reflection.js would want to consume.

### 2.4 End-state reasoning (bidirectional gap-bridging via COS)
- **Condition**: `NEXUS-BRANCHING-DECISION-LOOP-SPEC` (real, dated
  2026-07-02) already maps this almost exactly — COS's `BranchEngine.
  fork()` (real), `compare.js` (real, pairwise only), LOOM contracts
  (real), `lifeline.js`'s confidence gate (real, extend not replace).
- **Causality**: RFR2's `clip`/`context` (bounded subgraph replay,
  suspend/resume) is the piece this spec's own Q3 flags as possibly
  needed for v1 and possibly deferrable — still unconsumed either way.
- **Status**: **~70% real per that spec's own honest accounting**. Four
  named gaps: broadened confidence check, N-way fork orchestrator, N-way
  scorer/synthesizer, Idearium handoff. **That spec explicitly blocks
  all four behind three open questions it left for you, not me**
  (best-of-N vs. synthesize priority; per-branch vs. shared LOOM
  contract; whether RFR2's replay layer is in v1). Unchanged since
  written — still unanswered.
- **Dependency**: hard-blocked on those three answers. This is the
  correct place in the phase order to stop and ask, not guess.

### 2.5 Intelligence faculties (intuition/mastermind/adversarial)
- **Condition/Causality**: this session's own work — real, generalized,
  tested (46 new tests across the thread). `compare({left,right})` is
  domain-agnostic; two real callers exist (Cortex's own faculties,
  copilot's).
- **Status**: **real**, further along than anything else in this map.
- **Dependency**: none remaining to build; the open item is *adoption* —
  Guardian/RAID/LOOM don't call it yet (no natural claim-vocabulary
  designed for their domains).

### 2.6 Guided tutorial (toast + Spotlight + Nerve + Copilot detection)
- **Condition**: Nerve (`lib/nerve/index.js`, real, Phase 1) already
  exposes `getSnapshot()`/`onChange()` — the "is this expected" read
  layer. Spotlight (real) already reacts to a `ui{}` block. Toasts
  (real, `ui/idearium/index.html`'s `toast()`) already fire.
- **Causality**: none of the three currently talk to each other in
  sequence — no orchestrator exists.
- **Status**: **missing** — all three primitives real individually,
  zero orchestration. This is a real state machine to design (tutorial
  step → expected Nerve/CFR state → toast/spotlight cue → Copilot
  compares expected vs. actual via the new Adversarial engine, which is
  the actual right tool for "detect when it's not working," not a new
  detector).
- **Dependency**: benefits from 2.5 (Adversarial) existing, which it
  does. Otherwise independent — buildable in parallel with 2.4.

### 2.7 Repo population UI (chunk-dispatch progress, visible)
- **Real finding that changes this phase's scope**: Idearium has **two
  separate, unlinked "spec" systems**, confirmed by reading both handlers
  directly, not assumed from naming similarity:
  - `/api/specs` (`spec.*`) — Idearium's own idea-derived specs, shown in
    today's Spec Library UI. "compile / build" on this record calls
    `spec.build` → `compileIdeariumSpec()`, a **deterministic Tier 0/1
    structural compiler**. No AI generation, no chunks.
  - `/api/spec-engine/specs` (`speceng.*`) — a **separate manifest**,
    created via `createSpec({name, type, description, agent})` — no
    linking field to an idea/spec at all. Its chunk sections (`intent,
    api_callto, module_hooks, cli_spec, schemas, gap_contract,
    failure_modes, tests, phase_map`) are the *same* `SECTION_IDS` the
    regular Spec Library already uses — clearly meant to be the AI-
    generated counterpart of the same content a human fills in by hand
    in the builder textarea — but nothing currently connects the two
    records. `speceng.build` dispatches **one chunk per call**, not the
    whole manifest; the caller polls/loops until `{done: true}`.
- **Design, decided before writing code**: `spec.update`'s handler
  merges `body` generically into the spec's `fields` (confirmed —
  `os.emit('idearium.spec.update', {uuid, fields: body})`) — so a real,
  server-persisted `specEngineUuid` link is possible via the existing
  `PATCH /api/specs/:uuid`, not a client-only/localStorage stand-in.
  Chosen over the alternative (no link, spec-engine manifests float
  free) because this session's own discipline (§2.1/§2.2) treats
  client-only state as not really existing.
- **Build plan**: (1) "Generate via AI" button in the existing spec-
  builder view; first click creates a spec-engine manifest from the
  current spec's name/description if `spec.specEngineUuid` isn't set
  yet, then `PATCH`es that uuid onto the spec record; (2) a loop that
  calls `speceng.build` and awaits either the SSE `chunk.complete`/
  `.queued` event or the synchronous `{done:true}` response to advance;
  (3) a real progress view — chunk list, which section, which agent,
  live-updated from the same SSE connection the rest of this UI already
  uses (`openSSE()`/`refreshOnEvent()`), not a new connection.
- **Status**: **DONE — 2026-07-06**, built exactly to the plan above.
  `generateViaAI()` creates the manifest and persists `specEngineUuid`
  server-side on first use; `driveChunkBuild()` loops `speceng.build`,
  polling real chunk state (not a guessed delay) between calls;
  `renderChunkProgress()` shows per-section status/agent; the existing
  SSE connection now also refreshes progress live on
  `chunk.complete`/`.queued`, independent of whichever tab is driving
  the build loop. Both inline `<script>` blocks re-verified syntax-clean,
  no duplicate function declarations, 97/97 backend baseline unaffected
  (frontend-only change).

---

## Part 3 — Phase order (bottom-up, dependencies resolved left to right)

| Phase | Piece | Blocked by | Real work required |
|---|---|---|---|
| **A** | Fluid agent routing (2.2) | Nothing | Small — extractor + wire into existing `preferAgent` |
| **B** | Repo population UI (2.7) | Nothing | Medium — subscribe UI to already-real events |
| **C** | Reflection fed by WARP's population/crystallizer (2.3) | A (none really, but sequenced after the two zero-dependency wins) | Medium |
| **D** | Tutorial orchestrator (2.6) | Benefits from Adversarial (already real) | Large — new state machine |
| **E** | End-state reasoning (2.4) | **Hard-blocked** on your three answers to that spec's Q1–Q3 | Large, and not startable until unblocked |

Nothing in Phase E gets built until Q1–Q3 are answered — same rule that
spec stated for itself, restated here so this map doesn't quietly
re-authorize skipping it.

---

## Part 5 — Autonomy thread (added 2026-07-06, after the full phase-map read)

Phase map read in full (`nexus_complete_phase_map_11.html`). Copilot
phases: 68 (custom commands, pending), 69 (live mirror chat, pending),
164 (empty-state proactivity, sourced), 169/AX-008 (reachability,
partially real), 176 (self-expansion, sourced), 183 (analysis-module
template, sourced). Plus forge.spec's four (keyword layer, continuous
stream, personalities, the 4 missing intents).

**Autonomy dependency order: AX-008 first** — copilot can't be
autonomous about systems it can't see; Phase 164 and the continuous
stream both consume that visibility.

### AX-008 — DONE for the wireable half, 2026-07-06
- Phase map's live check (bridge/idearium/architect/emerge/diagnostic
  unwired) was one system stale: idearium was fixed 06-29.
- **Wired this pass**: bridge (:9999 `/events`) and diagnostic (:7825
  `/events`) — both verified to expose real SSE before wiring. One
  generic `_connectSSEStream()` instead of a 4th and 5th copy of the
  same function. Integration-tested: a bridge-tagged event provably
  lands in copilot's live stream buffer via the real `/api/stream`
  endpoint.
- **Honestly not wired, and why**: architect and emerge broadcast
  nothing at all (checked — no `text/event-stream` anywhere in either).
  That's an emission gap on their side, not a subscription gap in
  copilot. Next real step for full AX-008: give each an emitter, or
  have them push into copilot's existing `POST` ingest.


### Phase D (2.6) tutorial orchestrator — DONE 2026-07-06
`ui/tv-shell/tutorial/tutorial.js` + launcher in tv-shell. Real state
machine: per-step toast + Spotlight (via window.CP's real exec/CSS-var
interface) + a machine-checkable `expected` condition (real endpoint +
checkFn, or DOM predicate). Failures POST `tutorial.step.failed` with
expected-vs-observed into copilot's real stream ingest — detection is
data in the stream copilot reads, not narration. Nerve's
attention-non-truth invariant respected: presence only ever affects
display, never pass/fail. First tutorial: the idea→spec→AI-generation
flow built this session, every expectation a real endpoint. 5/5 tests
on the detection core. Also this pass: copilot's `tool` intent wired
(action prompts → ollama /api/jobs/tools → read_file/run_command),
ollama's stale tool system-prompt now derives from the registry.
Note: clear-glass is NEXUS's own browser (for the system + userscripts)
— relevant future home for tutorial/userscript integration.

### Lifeline merge, same pass
Parallel session's 07-07 lifeline wired RAID's RoutingIR for escalation
provider selection but kept the dead `/api/copilot/prompt` transport,
declaring it unfixable from lifeline's side. This session's `/command`
fix was the missing third option. Merged: their provider selection,
this session's real transport. 6/6 fluid-routing tests still pass.

---

## Part 4 — What this map does not claim
This document does not assert anything above is complete by being
described here. Per the instruction this responds to: build happens
after this map, output gets compared against what's written here, and
*then* this file gets updated to reflect confirmed reality — not before.
