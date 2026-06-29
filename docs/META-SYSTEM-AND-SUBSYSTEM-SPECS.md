# NEXUS Meta System — Brainstorm Capture & Subsystem Specs
**Author:** James Brooks (Erosmancer)
**Date:** 2026-06-29 (session 6)
**Status:** 🟡 BRAINSTORMING — rfr2 standing by, not yet uploaded, nothing here
is committed architecture. This doc exists so none of it gets lost before
rfr2 lands, not to lock decisions in early.

---

## Part 1 — Meta System wishlist (raw capture, unedited)

Everything from the original ask, kept as a checklist so nothing drops:

- [ ] Map interactions between everything, rfr2-assisted (pending upload)
- [ ] Complete hook, component, wire registry — visual
- [ ] CFR map for visual debugging
- [ ] Diagnostic tool with an engine per system
- [ ] Status and health indicators
- [ ] Memory systems with diagnostic + maintenance tools
- [ ] File system + hashes with sigma monitoring and health scoring
- [ ] Network performance + decision tree (RAID routing, visualised)
- [ ] Versionium + "build from inside the system"
- [ ] Custom command system UI — map CLI to components
- [ ] Event ledger per system + per-component state tracking per event
- [ ] Dual cognition monitoring — track a request's status as it moves through NEXUS

## Part 2 — New this round

- [ ] **Dynamic BEP + ring buffer per system**, mapped to each system's event
  ledger. (Existing BEP pattern engine — Phase 47, 367 patterns seeded — lives
  in `lib/causal/compound.js`/cortex's pattern code, not a standalone `bep.js`.
  A real ring-buffer pattern already exists at `emerge/compiler/ring-buffer.js`
  — scoped to Emerge's compiler only today, not per-system.)
- [ ] **Full UI interaction telemetry** — every click, every typed input,
  everything that fails to load. Across all channels, not just one.
- [ ] **Toast system for tv-ui** — sovereign module, same shape as
  `ui/tv-shell/spotlight/` (own JS/CSS, public API, HTTP endpoint so co-pilot
  or any system can trigger one). Toasts exist today, but ad-hoc: at least 6
  different HTML files (`control-panel`, `idearium`, `forge-shell`, `builder`,
  `blueprint-builder`, and one more) each reinvent their own `#toast` div and
  show/hide logic. This would be a real consolidation, not a new idea from
  nothing — same problem `ui/tv-shell/DECOMP.md` already names for Spotlight.

## Part 3 — Risk and sequencing notes (carried forward, not re-litigated)

1. rfr2's source isn't in this workspace yet — nothing below assumes it.
2. Prior audit (`docs/NEXUS-INTEGRATION-MAP.md`) already flagged `clip`/
   `context`/`observer` as "needs a diff against `replay-engine.js`/SISO
   first" — that diff still hasn't happened. Five other rfr2 pieces (CQL
   query engine, hot-module loader, `.nex` version-gate, the enforcement/
   invariant layer, adapter-sandbox) were cleared as clean additions, no
   diff needed.
3. Read-only observability (status, ledgers, CFR/hook/component maps, file
   hashes) and active control ("build from inside," CLI↔component mapping
   UI) have different blast radii. Keep them architecturally separate; gate
   the write-capable half through `constitutional-ai.check()` like every
   other consequential action.
4. Dual-cognition / full-request tracing across 9–10 independent services
   needs a correlation ID threaded through every hop. Real sub-project, not
   a checkbox.
5. Boundary that doesn't move: "map interactions" = hooks/components/CFR/
   events, system-level. Not rfr2's people-modeling category (`resonance`,
   `irs.js`, `kernel-alk/relational.js`) — still itemize-only, no blanket yes.

---

## Part 4 — Subsystem specs (current state, code-grounded)

Each section below reflects what's actually in the tree as of this session —
not the aspirational version. Drift from the phase map is called out where
found; that's the same discipline as every other doc in `docs/`.

### 4.1 — Component / Seam / Hook / Wire System

**What's real:**
- `lib/component-registry.js` — `register()`/`registerBatch()`, JAA-backed,
  emits `component.registered`/`component.updated`. Auto-runs
  `descriptor-projector.project()` on every registration (Phase 40 T1.5) and
  stores the result in `component_projections`.
- `lib/descriptor-projector.js` — one descriptor → six projections, zero-LLM:
  `.comp` `.cli` `.grammar` `.ui` `.config` `.seam` `.doc`.
- `lib/grammar-engine.js` — rebuilds its trie live on `component.registered`/
  `component.updated` SSE. Confirmed wired, not aspirational.
- `hooks/index.js` + 10 `hooks/<system>.hooks.js` files (all 10 sovereign
  systems covered as of session 5) — **78 hooks, 21 SEAM-tracked.** This is
  a declarative registry: it documents wires, it does not drive runtime
  dispatch. Services still call each other directly over HTTP. The one
  exception is the idearium→copilot SSE wire built session 5 (§AX-008).
- 185 components registered at boot, verified by direct recount session 3.

**What Meta would add:** a live visual graph of all of the above — components
as nodes, hooks as edges, SEAM-tracked ones highlighted, sourced from
`hooks/index.js`'s `summary()`/`seamManifest()` and `component-registry`'s
live index. This is mostly aggregation, not new primitives — the data
already exists, nothing currently visualizes it.

### 4.2 — Co-pilot

Sovereign, `:3750`. `copilot/server.js` is the entry point. Confirmed wired
this session: 7-layer sensing (`lib/copilot-context.js`, P73), session
continuity (`_injectSessionHistory`, P103), dual cognition half (queries
Cortex `/api/intelligence/mastermind` before Ollama dispatch, P110 — co-pilot
side only, RAID/adversarial side not confirmed), streaming (`/api/prompt/
stream`, P112), idearium stream ingestion (AX-008, session 5).
`module-builder.js` does map→spec→QC→build, with a `scope:'cli'` short-circuit
added session 5 (Phase 36) for commands that don't need the full pipeline.
Faculties: `intuition.js` (fast path), `analysis.js` (7-layer, now delegates
to `copilot-context.js` rather than its own old 5-layer assembler — its
docstring is stale and still claims "7-layer" itself, worth a one-line fix
whenever someone's in that file), `adversarial.js` (writes results to
Cortex, doesn't query it first — the other open half of P110).

### 4.3 — TV-UI (`ui/tv-shell/`) and Spotlight

Already has a real decomposition spec: `ui/tv-shell/DECOMP.md`. Current
monolith: `ui/home/index.html`, ~4000 lines, fully coupled — "the system
cannot tell the UI to do anything." The decomposition plan already on file
turns it into a thin shell (`shell.js`/`shell.css`) plus sovereign modules per
channel, each independently callable over HTTP — `ui/copilot/`, `ui/spotlight/`,
`ui/channels/*`. `menu.js` is one of the sovereign modules already built this
way (`window.NexusMenu`, zero coupling, routes through copilot). `spotlight.js`
is the most mature example: `Spotlight.on/off/step/tension/execute/navigate`,
plus an HTTP surface (`POST /api/ui/spotlight/on|off|step|tension`) so any
system can direct the UI without touching HTML. **A toast system, built the
same way, slots directly into this existing pattern** — it isn't a new
architecture, it's the third sovereign module after menu and spotlight.

### 4.4 — RAID Engine — ⚠️ load-bearing gap found this session

`docs/raid.spec` (v6.2.0) describes a real dispatch model: layer-1 deny-only
constraints (`_agentAvailable()`, fail tracking, role violations) then
layer-2 fitness ranking (`SNR_tier_gate × role_confidence × health ×
topological_proximity`), invariants `LAW_I` (Ollama always first) and
`LAW_III` (Claude always last, reserve only). `lib/request-handler.js`
already has the §P97 CFR-sigma-floor consultation written and ready —
`_cfrInfluence.getSigmaFloor()`/`getState()`, threaded into a `raidIntent`
object, passed to `raid._decide(raidIntent, raid._health, raid._weights)`.

**That call can never succeed.** `_getRAID()` does
`require('../cortex/core/raid/index')` inside a try/catch — and
`cortex/core/raid/` does not exist anywhere in this tree. `tests/full.test.js`
expects the exact same path and the exact same exports
(`{ _decide, _cluster, _health, _weights }`) — so this isn't a stale
reference on one side only, both the production code and the test suite
agree on where RAID should live. It just isn't there.

**Effect:** every request that reaches the RAID-routing branch in
`request-handler.js` silently falls through — `raid` resolves to `undefined`,
the `if (raid?._decide...)` guard never passes, no routing decision ever
gets made by RAID, full stop. Not "CFR isn't wired in yet" (the original
Phase 97/OL-2 framing) — RAID's own core engine doesn't exist as an
importable module at all. The CFR-wiring code is real and waiting for a
RAID to wire into.

Also noted: `docs/raid.spec`'s own `topological_proximity` term is itself
"blocked on `docs/cfr.spec` `_byComponent` edge — not yet built," per the
spec's own text. So even a from-scratch build can't fully satisfy layer-2
fitness yet — that dependency would need scoping too.

### 4.5 — Intelligence System (Cortex INTUITION / MASTERMIND)

Phase map (Phase 84/85) describes these as `cortex/intelligence/intuition.js`
and `cortex/intelligence/mastermind.js`. Neither file, nor the
`cortex/intelligence/` directory, exists. The real implementations are
`_intuitionAnswer(prompt)` and `_mastermindAnalysis(prompt, contextSnippet)`
— local functions inside `cortex/boot.js` itself, called directly by the
`/api/intelligence/intuition` and `/api/intelligence/mastermind` route
handlers (confirmed live and queried by copilot, session 4). Both are
real but simple: `_intuitionAnswer` is keyword-rule matching over the live
CFR field state and JAA gap counts; `_mastermindAnalysis` composes a few
lines of field-state + open-gap summary, no actual causal reasoning beyond
that yet. Not wrong, just smaller than the phase map's framing and the
"MASTERMIND — causal, prediction, counterfactual" billing in Phase 85's row
implies. Worth a phase-map correction on its own, separate from this doc.

---

## Part 5 — Open questions (need your call, not guessed at)

1. **RAID core engine** — ✅ resolved 2026-06-29, built and test-verified
   (21/21 against the pre-existing test suites — see `NEXUS-PHASE-MAP.md`
   Phase 97). Layer-2 fitness stays honestly partial; not a question anymore.
2. **Intelligence system framing** — correct the phase map's Phase 84/85
   description to match what's actually there (simpler than billed), or is
   there a fuller `intuition.js`/`mastermind.js` build planned that just
   hasn't landed yet and the phase map was describing the target, not current
   state? *(still open)*
3. Toast system: build now as the third sovereign tv-ui module (small, clear
   pattern to follow), independent of the bigger Meta question? *(still open)*

---

## Part 6 — Session 7 additions

### 6.1 — Clear-glass auto-ingestion pipeline

"Listen for downloads from agent chats — artifacts, code, thinking — pull
them to Cortex automatically, queue for system integration. Use clear-glass
as an interface to build the system."

Concrete and well-scoped. Shape, before any code:
- Clear-glass already hosts every provider tab and already has a
  `src/providers/host.js` (v2) with per-provider status tracking and a
  userscript-injection point. A download/artifact listener is a natural
  extension of that, not a new architecture.
- "Download" needs defining precisely per provider — Claude's artifacts,
  ChatGPT's code-interpreter outputs, and a provider's own download events
  (Chrome's `downloads` API, or DOM-level detection of an artifact panel)
  are three different signal sources, not one.
- Target: Cortex, not Guardian — Cortex already has `/api/memory`,
  JAA-backed, and is where chat_log/artifacts already land per
  `copilot-context.js`'s Layer 5. A new JAA table (`ingested_artifacts` or
  similar) is probably right, not reusing `chat_log`.
  "Queue for system integration" — this is `lib/contract-queue.js`'s job
  (disk-first, every request a contract) or `module-builder.js`'s map→spec
  pipeline if the artifact is code meant to become a component. Needs a
  decision: does an ingested artifact automatically attempt
  `module-builder.build()`, or land in a holding queue for a human (or
  co-pilot, conversationally) to decide what to do with it? Auto-build is a
  write-capable action — same blast-radius question as "build from inside"
  in Part 3 §3.
- Not built yet. Real next step once scoped: a `clear-glass/src/ingest/`
  module, same shape as `providers/host.js` — own status map, own HTTP call
  to Cortex, no coupling to the rest of clear-glass beyond the provider tabs
  it's already watching.

### 6.2 — Idearium brainstorm section

"I want to be able to brainstorm like this inside idearium's brainstorm
section" — referring to free-form exploratory writing (the archaeology
document is the example), as opposed to idearium's existing idea→spec
pipeline (`idea-store`, `phases: [seed, expanding, tensioned, specced,
building, complete]`).

Idearium today has no "brainstorm" concept at all — checked, zero matches.
The existing pipeline assumes an idea is already seed-shaped (a sentence,
tags, a phase). A brainstorm is pre-seed: unstructured, possibly long,
possibly never becomes an idea at all. Shape, before any code: a new
phase *before* `seed` — call it `loose` or `raw` — or a parallel store
entirely (`brainstorms`, not `ideas`), since forcing free-writing into the
`Idea` schema (`{uuid, text, phase, tags, specRef, gapScore, weight, ts}`)
loses the thing that makes a brainstorm useful — its length and mess. A
brainstorm could *promote* to a seed idea (or several) the same way an idea
promotes to a spec today (`idearium-spec-from-idea` hook, §4.1) — same
pattern, one phase earlier. Not built yet.

### 6.3 — The "cognitive archaeology" document — assessment

Read in full. My honest take, not just agreement:

**What's real in it:** token-streaming timing, burst/pause patterns, and
structural shifts (bulleting density, lexical variation) genuinely are
observable from a browser-injected script, and genuinely do correlate with
*something* about how a response was generated. That's not new — it's the
same category of signal Guardian's existing userscripts already capture for
NCP transport (`guardian/userscript-{claude,chatgpt,gemini,perplexity}.js`).
This would be an analysis layer on signals already being captured, not a
new interception point.

**What to be skeptical of, and the document says this itself, which is the
most valuable part of it:** the "Prompt Hypotheses" layer — labeling a
velocity dip as "context window pressure" or a bulleting shift as "mode
switch" — is pattern-matching dressed as inference. The document's own
"brutal reality check" section names this exactly: modeling *surface
dynamics*, not *internal cognition*, and the risk of over-attributing
structure that isn't there. That caveat is worth keeping prominent if this
gets built, not buried at the bottom.

**One concrete thing worth flagging:** the pasted document describes a
Tampermonkey script in detail ("here's the script... interception layer...
signal extraction...") but never actually contains the script — no code
block anywhere in what was pasted. Worth checking whether that code exists
somewhere before assuming there's something to integrate; right now there's
a detailed description of a script, not a script.

**Fits the architecture if built:** as its own sovereign-style module,
output landing in idearium's brainstorm section (§6.2) as raw material, or
in Cortex as a new event type if it's meant to run continuously rather than
per-session. Not a new category of risk — same DOM/network observation
Guardian's userscripts already do, applied to a different question.

### 6.4 — Memory systems per sovereign system (§10.1 made concrete)

§10.1 (`AXIOMS-v3.0.md`) says each data type has exactly one write authority.
This is what that resolves to in practice, checked against real JAA/db calls
this session — not a designed-from-scratch table:

| System | Owns (verified) | Pattern |
|---|---|---|
| cortex | `event_log`, `failure_modes`, `gaps`, `meta_observations`, `settings`, `snapshots` | shared JAA (`jaaDB`) |
| guardian | `agent_calls`, `artifacts`, `cortex_memory`, `event_log`, `failures`, `gap_questions`, `guardian_health`, `toasts` | shared JAA |
| architect | `blueprints`, `event_log`, `gaps`, `hook_bindings`, `hooks`, `snr_results`, `spec_wizard_sessions`, `topology_maps` | shared JAA |
| idearium | `ideas`, `specs`, `gaps`, `events`, `links`, `snapshots`, `snr` | **own in-process `this.db`**, not shared JAA — confirms §10.1's own example ("Idearium owns ideas, specs, and gaps") exactly |
| copilot | none owned directly found | writes through to Cortex via `lib/cortex-write.js` (Phase 89, buffers if Cortex offline) rather than owning tables |
| bridge, ollama, eravos, emerge | not found via direct JAA grep this pass | either in-memory only, or a different access pattern not caught — **not verified, not assumed clean** |

Two real findings from building this table, not designed in:
- `cortex_memory` and `event_log` appear under **both** cortex and guardian —
  worth checking whether that's an intentional projection (§10.2 — Cortex's
  copy should be derived, not separately written) or a second write
  authority for the same data type (§10.3 violation). Not resolved here,
  flagged for the next pass.
- copilot's "no owned table" finding is consistent with its own architecture
  (7-layer sensing reads from everywhere, P73) but means it has zero
  persistent memory of its own outside what Cortex retains on its behalf —
  worth confirming that's the intent, not a gap.

### 6.5 — Schemas for adding new components and systems

Formal shapes now live in `docs/nexus-system-foundation.spec` rather than a
separate file — that's already the canonical "what every system must
implement" contract (§5.1's cross-reference). Two additions this session:

- **New component**, minimum valid shape (enforced by
  `lib/component-registry.js`'s `validate()`, `REQUIRED_FIELDS` — checked
  against real code, not designed fresh): `id` (namespace.name, lowercase
  dots), `namespace`, `name`, `version`, `grammar` (non-empty array),
  `route` ({method, path} or null for CLI-only per Phase 36), `description`.
  `register()` auto-derives the six `descriptor-projector.js` projections —
  nothing else to declare by hand.
- **New system**: follow `nexus-system-foundation.spec`'s
  `system_spec_template` (L0 core → L1 events → L2 CLI → L3 routes →
  L4 handshake → L5 UI, in that order, §3.1) and add a `hooks/<system>.
  hooks.js` file matching the schema in `hooks/idearium.hooks.js` — required
  now, not optional, since `interaction_contract.required_fields` includes
  `hooks` as of foundation spec v1.1.0.
