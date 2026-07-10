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


### Phase D visual upgrade — DONE 2026-07-06 (same pass as the engine)
The tutorial now literally shows, not narrates: `tutorial.css` (all
colors derived from spotlight.css's own --cp-focus/--ac/--cp-tension —
Spotlight stays the single palette producer) + engine upgrades:
- **Co-pilot cursor** (#tut-cursor) — an animated pointer that glides to
  each step's target element, with a click animation for click actions.
- **Element-level targets** — steps carry a `target` CSS selector +
  `action` (click/type); the target's borders pulse (.tut-pulse), inputs
  breathe (.tut-input-focus), regions can flash (.tut-flash), everything
  else dims (.tut-dimmed under body.tut-active).
- **Ghost-typing** — for type actions, the suggested text types itself
  character-by-character into the input's placeholder; never fills the
  real value (the user does the doing, copilot does the showing).
- **CFR → nerve/CSS root wire** (`startFieldWire()`) — polls the real
  /cfr/field every 3s and sets root-level --cp-tension from
  (friction+entropy)/2 scaled by regime. spotlight.css declared the
  variable at :root but only ever wrote it per-tile; now the whole
  visual layer (cursor glow, pulse radius) breathes with the live field.
- **Honest failure surface** — a target selector matching nothing emits
  `tutorial.target.missing` into copilot's stream, not a silent skip.
Detection core untouched — 5/5 tests still pass, 97/97 baseline clean.

### NEW PHASE (spec'd, not built): Copilot-as-NEXUS — the copilot OS
Per 2026-07-06 direction: copilot in complete control of a whole UI —
tv-ui as the shell, Nerve on top, Spotlight in variable-driven CSS,
clear-glass (NEXUS's own browser, for the system + userscripts) at
copilot's full discretion. Ask it anything: diagnose parts of the
system, status, intuition/analysis, move data, programmable.
What's already real toward this (checked): tool intent (run_command +
read_file via ollama's real tool loop), intuition/mastermind/adversarial
endpoints, spotlight ui{} blocks in copilot responses, the tutorial's
CP.exec + failure-event loop, AX-008 streams (bridge/diagnostic wired).
What's genuinely missing, in build order: (1) copilot `diagnose` and
`move-data` verbs as tools (diagnostic :7825 endpoints + cortex
push/recall as run_command-style tools); (2) copilot's remaining 3
declared intents (navigate/note/action); (3) clear-glass control
surface for copilot (open/steer/inject userscripts); (4) the copilot
control-panel UI itself (vision spec §H, deliberately last). Phases
68/69/164/176 from the 260+ map all land inside this umbrella.


### Execution pipeline + three-way merge — DONE 2026-07-07
**Built (continuing the copilot-as-NEXUS build order item 1):**
- `lib/agent-tools/tools/diagnose.js` — the "diagnose" verb as a real
  tool over the diagnostic service's verified routes (status/gaps/
  friction/summary/tension/heal). Unreachable service = error result,
  never fabricated health. Test T-007 caught a real flaw (load-time URL
  freeze) — both tools now resolve their service URL at call time.
- `lib/agent-tools/tools/move-data.js` — push/recall/read/insert over
  Cortex's verified memory routes. **No delete exposed, deliberately** —
  "nothing lost, ever" enforced at the tool boundary itself.
- Copilot's coarse TOOL_INTENT_RE extended for the new verbs
  (diagnose/check/recall/remember/store + system/gaps/memory/cortex).
- 7/7 tests against live fake diagnostic/cortex servers.

**Merged (three parallel branches reconciled, v6 as base):**
- From nexus-wired-v6 (descends from this tree's updated-2 export):
  `lib/autonomous-loop.js` (first live caller of compartment-engine.
  spawn(): classify → case-library → spawn → execute, negative-crystal
  blocking real), copilot's **redundant conversation ledger** (every
  chat_log write mirrors to event_log with causedBy chained per session)
  + **POST /api/rewind** (walks the chain, re-injects history — branches
  the timeline, never deletes), lifeline's conditioning_log
  (system-learning item 5), cortex's `/api/cortex/query` read surface,
  guardian liminal wiring, bridge CFR centralization.
- From nexus-merged (a LOSSY 07-09 merge — it had dropped v6's AX-008
  streams, tool intent, and rewind injection; only its unique modules
  were taken): `copilot/intents.js` (the four missing intents —
  navigate/note/tool/action — strictly additive routing), `cortex/
  personas.js` (personalities as data, persona systemPrompt now prepends
  context at all three entry points), `copilot/stream-digest.js`
  (forge.spec's continuous stream — normalizes the live buffer to plain
  text, durable Cortex digest every 60s), `guardian/ask.js` (synchronous
  ask facade over the real async job machinery), `clear-glass/
  ncp-client.js` (clear-glass as a sovereign NCP provider — the "which
  browser" answer for guardian/ask), boot-verification scripts.
- Kept from this tree (ahead of both): tutorial visual upgrade
  (tutorial.css + cursor/ghost-typing/field-wire engine), agent-tools
  registry with all four tools.
- Docs adopted: NEXUS-PIPELINE-SPEC-2026-07-07, NEXUS-PLAIN-ENGLISH,
  NEXUS-ENCYCLOPEDIA, v6's SESSION-MANIFEST.
97/97 baseline + all 8 touched suites green post-merge.


### Grand merge + execution pipeline — DONE 2026-07-07
Merged the v0.9.9 "nexus-merged" tree (a parallel branch that combined
this session's exports with the userscript/NCP/jaa-db-performance
session) into the working tree. Its additions adopted: copilot/intents.js
(all 4 missing intents — navigate/note/tool/action — wired into
/api/prompt, registry-sourced, injectable), cortex/personas.js
(forge.spec's personalities, JAA-backed), copilot/stream-digest.js
(continuous-stream normalizer + Cortex digest), clear-glass/ncp-client.js,
lib/diagnostic-contract.js, gemini/perplexity userscript GM-migrations,
jaa-db O(1) indexed lookups. My newer deltas preserved over it: tutorial
visual upgrade (cursor/ghost-typing/CFR field wire + tutorial.css),
tv-shell launcher, ollama registry-derived tool prompt, expansion map.
My _tryToolIntent dropped as redundant — intents.js's tool route covers
it through the same ollama /api/jobs/tools endpoint.
**Execution pipeline completed**: diagnose + move_data tools arrived
built but UNREGISTERED (no model could call them) — registered both.
diagnose → :7825's real status/gaps/friction/summary/tension/self-heal;
move_data → cortex push/recall/read/insert, with /api/memory/forget
deliberately NOT exposed (nothing-lost law at the tool boundary).
7/7 tool tests, 97/97 baseline, all key suites green on the merged tree.
Docs adopted: NEXUS-PIPELINE-SPEC-2026-07-07, NEXUS-PLAIN-ENGLISH,
NEXUS-ENCYCLOPEDIA.




### Intelligence + orphan wiring sweep — 2026-07-09
Orphan audit (real consumer counts, not assumed) found the deep
intelligence modules unwired despite the 3 cortex faculties being fully
reachable. Closed the genuine, defensible wires; flagged the rest rather
than fake-wire:
- **run_pipeline tool** — lib/execution-pipeline.js (full autonomous
  build→verify→compare→promote loop) had ZERO callers though
  expectation-watcher already listened for its events. Now an agent-tool;
  copilot/ollama can trigger the whole closed loop. 5/5 tests.
- **causal.anomaly** — real classifier (missing_event/timeout/
  state_violation/causal_gap/path_mismatch), init()'d at cortex boot with
  real jaaDB+bus; classify() verified emitting anomaly.detected.
- **causal.compound** — ripple/wave/tidal engine, wired via its real
  createCompoundEngine(graph) factory against mastermind's causal graph.
- **reflection.js + BDA** — the learning loop (scores decision_log,
  opens gaps on repeated dissatisfaction) init()'d at cortex boot; ONE
  wire also activates meta/bda (Behavioral Drift Analyzer) which
  reflection feeds via observeSignal. validateWiring() confirms
  {jaa,bus,taxonomy,bda} all true. Conservative by design — never
  auto-mutates RAID/identity, only opens gaps for review.
- **Specs moved per-system** — 13 system specs → <system>/spec/;
  spec-drift teaches to read them (precedence spec/ > flat > docs/).
- **Versions bumped** — cortex 3.3.0, copilot 3.2.0, bridge 3.2.0,
  orchestrator 2.2.0, idearium 3.1.0, with real changelog fragments.
HONESTLY STILL UNWIRED (flagged, not faked): meta/rfr2's 11 sub-engines
(delta/clip/context/compress/query/…) — real but ESM, need the
rfr2-bridge consumed and a genuine use per sub-engine, its own dedicated
build; meta/alk-perception (1 consumer). Wiring these hollowly would be
the exact "it's connected!" theatre this project avoids.

### Grand consolidation — 2026-07-09 (17 uploads reconciled, nothing lost)
Surveyed all uploads by content signature, not filename (names misled:
"nexus-autonomous-v8" was OLDER than my tree on my features). Findings:
- nexus-merged-v7__1_ = my own last export re-uploaded (diff 0). Base.
- nexus-autonomous-v8: older on my work but had REAL unique files —
  adopted: lib/{execution-pipeline,build-pipeline,consent}.js,
  copilot/lib/expectation-watcher.js, ui/{home,channels,consent,toast}.
- files__9_: real sigma.js Windows-path caller-trace fix (forward-slash-
  only frame matching never matched on Windows → every one of 600+ spam
  warnings pointed at itself). Its boot.js was OLDER (would have deleted
  my lattice fix) — took only sigma.js. Superseded by cf6's newer sigma.
- changed-files-5 == changed-files-6 (dup). cf6 was a superset built ON
  my exports (contained my tool-intent, fluid routing, faculty split,
  lattice fix, diagnose/move-data). Adopted 80 files; kept mine on
  raid/index.js (I was ahead — 12 tunables markers vs their 7). cf6
  brought the sigma-writer ROOT fix (nexus-bus wildcard emits one object,
  not two args — the actual source of the non-string event.type spam),
  plus new: warp-bus.js, gap-relay.js, run-cockpit-command.js,
  nexus-client.js, RFR2-KERNEL-CONTRACT.md, and the clear-glass
  vault-picker changes (guardian-vault-picker-expansion fully subsumed).
- MERGE COLLISION CAUGHT: cf6's graph.js dropped my componentDistance
  (BFS hop count) while adding their componentProximity (0..1 score) —
  different real methods. Restored mine alongside theirs; 7 component-
  distance + 2 raid-fitness tests went red then green again. Nothing lost.
Result: 97/97 baseline, 535 module-tests passing (the 53 fails are the
same pre-existing jaa-db/mutation-contract ones flagged all session, not
from this merge). Both sigma fixes (Windows-path + wildcard-object root
cause) now in — the boot-log spam should be gone AND correctly traced.

### Live-boot fixes — 2026-07-09 (from a real running instance + screenshot)
Two real bugs, both caught from actual runtime, both fixed + tested:
1. **system-lattice feed regression (mine)** — the faculty split moved
   _buildRecentCausalGraph into mastermind.js; cortex's boot-time lattice
   feed still called the deleted top-level name, so it logged
   "_buildRecentCausalGraph is not defined" and silently fed the lattice
   nothing every tick (try/catch swallowed it). Fixed to call
   _mastermind.buildRecentCausalGraph() — verified: returns a real
   20-node graph.
2. **Bridge dropped the co-pilot answer** — the tv-shell co-pilot bar
   showed the bare {ok,uuid,status:"fulfilled"} envelope instead of a
   human reply. Root cause: bridge/router.js's ResultGate captured the
   target's real HTTP body (copilot's {ok:true,text:"..."}) all the way
   to the resolve() call, then discarded it — resolved with only
   {ok,uuid,status}. A prior comment in copilot claimed "ResultGate wraps
   it exactly once"; it never did. Fixed: ResultGate now parses the body
   and includes it as `response`, so the UI unwrap
   (data.result?.response ?? ...) finds the real .text. This is why
   co-pilot wasn't "talking like a human" — the answer existed, Bridge
   threw it away. End-to-end test through the real router: PASS.
Not code, flagged from the same boot/screenshot for the user: EMERGE
offline (not in start list), Guardian 0 providers (GUARDIAN_DIR unset →
userscripts don't inject), sigma non-string event.type spam (real,
upstream event-shape bug at meta/cfr/sigma.js:36), phantom
divergence-watcher/macro-compiler version stubs (the known-fictional
components still self-registering a version).

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
