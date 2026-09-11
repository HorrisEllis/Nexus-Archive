# THE NEXUS ENCYCLOPEDIA
### A Complete Guide to the NEXUS Orchestration Ecosystem
**System version 0.9.10 · Compiled 2026-07-07 · Source: the live codebase, not aspiration**

> *"Peace cannot be achieved by force, but by understanding."*

---

## HOW TO READ THIS DOCUMENT

NEXUS has a documented history of specs describing things that don't exist yet, phase-maps claiming "complete" for code that was never written, and modules built in perfect isolation with no path connecting them to anything real. This encyclopedia was written the way NEXUS itself insists everything be written: **checked against the tree, not assumed.**

Every entry below carries one of four status tags. Trust the tag more than the prose around it.

| Tag | Meaning |
|---|---|
| 🟢 **REAL & WIRED** | Code exists, is called by something real, and has been exercised (by a test or a live run). |
| 🟡 **REAL, UNWIRED** | Code exists, is correct in isolation, but nothing in production actually calls it yet. |
| 🟠 **PARTIAL** | Part of the feature is real; part is a hardcoded stub or placeholder standing in for something unbuilt. |
| ⚪ **SPEC ONLY** | Described in a `.spec` or design document; no corresponding code exists yet. |

This document is organized as a set of concentric rings, each one zooming out from the last:

1. **Introduction** — what NEXUS is, and the philosophy that shapes it
2. **Meet the Co-pilot** — the system you actually talk to
3. **Architecture at a glance** — the whole machine in one picture
4. **The Substrate** — the three primitives everything else is built on
5. **The System Encyclopedia** — every service, in detail, alphabetically cross-referenced
6. **The Meta Intelligence Suite** — the 13 measurement modules that watch NEXUS think
7. **The Causal Physics Stack** — how NEXUS models its own behavior as a physical system
8. **The UI Layer** — what a human actually sees and clicks
9. **Memory & the Ledger** — where everything lives, and the rule that governs it
10. **Command & Control** — the registry, the hooks, the grammar
11. **What's Next** — the build-order roadmap to the vision end-state
12. **Glossary & Index** — every term, alphabetically, in one place

---

# PART I — INTRODUCTION

## 1.1 What NEXUS Is

NEXUS is a sovereign, multi-service AI orchestration ecosystem — not a wrapper around a single AI API, but a purpose-built runtime that treats every AI interaction, every file change, every decision, and every failure as a first-class, causally-linked event in a system that is designed to observe, remember, and eventually heal itself.

It has one architect: James Brooks (also known by his project handle, Erosmancer). Unlike almost every other piece of software of comparable scope, NEXUS is not built by a team — every one of its ~30 subsystems and hundreds of files is designed, specified, and iterated on by one person working session-by-session with AI collaborators (principally Claude), who read the actual codebase each time rather than working from memory or assumption.

That constraint — one person, many sessions, a codebase that has to explain itself to whichever model opens it next — is why NEXUS looks the way it does. It is aggressively self-documenting (over 140 `.spec` files), aggressively honest about its own gaps (state-spec documents that read like an engineer's confession rather than a marketing brochure), and built bottom-up on the theory that nothing should be assumed real until it's been proven real by running code.

## 1.2 The Philosophy

NEXUS's tagline, stated at the top of its founding vision documents, is:

> **"Peace cannot be achieved by force, but by understanding."**

This is not decoration. It is the design principle behind the whole project: NEXUS exists to build tools that help a person (and eventually, people generally) understand themselves, their own patterns, and the systems around them — by building a system that models its *own* internal behavior with the same rigor a scientist would apply to any other complex system. The causal physics stack (Part VII), the behavioral-pattern detectors in the meta intelligence suite (Part VI), and the Relational Field Reader lineage in `meta/rfr2/` all descend from this same root idea: you can't understand a relationship, a decision, or a failure after the fact unless you were honestly recording what actually happened while it happened.

## 1.3 What Makes It Different

Three things distinguish NEXUS from a typical multi-service application, or from "an app that calls an LLM":

**1. Nothing is just logged — it's modeled.** Most systems write a log line and move on. NEXUS's Causal Physics Stack (§7) computes a numeric field for every event — coherence, friction, resonance, entropy — and classifies how effects *propagate* through the system (ripple / wave / tidal, see §7.3), the same vocabulary you'd use to describe energy moving through a physical medium. A "gap" (something wrong) isn't just flagged; the system tracks how far a real event deviated from a learned baseline (sigma scoring, §7.2) and can trace a failure back through its causal ancestry.

**2. The architect insists nothing is real until it's proven.** NEXUS's foundational axioms (§10 has the full list) begin with "Nothing exists until proven" and "Nothing silently fails." In practice, this means every session that touches the codebase produces an honest accounting of what got built, what was already there, what's still a stub, and — critically — what was *claimed* complete in an earlier document but isn't. The `docs/NEXUS-STATE-SPEC-2026-07-06.md` document this encyclopedia draws from is itself a case study: it corrects its own session's overclaims in real time, more than once.

**3. It is genuinely composed of sovereign systems, not a monolith with feature flags.** Guardian, Cortex, Copilot, Ollama, Idearium, Architect, Loom, Eravos, and Clear Glass are each independent processes with their own port, their own local data store, and their own `/health` and `/contract` endpoints. They talk to each other over real HTTP and a real message bus (Bridge), not shared memory or direct imports. This is a deliberate, repeatedly-reaffirmed architectural decision (see §4 and §9) — the cost is more wiring work; the benefit is that any one system can go down without silently corrupting another, and any one system can, in principle, be understood on its own.

## 1.4 What NEXUS Can Fully Do Today

Stripped of aspiration, here is what a person can actually do with NEXUS as it exists right now, verified against the running code:

- Talk to a sovereign co-pilot (`:3750`) that assembles a seven-layer context window from live system state, session history, and Cortex memory before answering — and that keeps answering from memory even if the dispatch layer underneath it (Guardian) is unavailable.
- Route every AI request through RAID, a real (if partially-stubbed) provider-fitness router that prefers the local Ollama model first, and only escalates to Claude or ChatGPT when justified.
- Capture, chunk, and dispatch AI-authored code changes through a real SEAM pipeline with verification gates, from three different systems (Guardian's prose-based SEAMQueue, the newer backend-agnostic `lib/seam/`, and Loom's component/hook/wire registry).
- Turn a raw idea into a spec, a spec into a gap, and a gap into a build task inside Idearium, with a tension-scoring engine that ranks ideas by contradiction, novelty, and resource cost.
- Watch a live visual field (CFR) of the system's own coherence, friction, resonance, and entropy — a genuine, load-bearing subsystem with eleven real production consumers across the codebase.
- Query a unified memory API (Cortex's `push()`/`recall()`) that does real lexical and recency-ranked retrieval today, with three more retrieval "lanes" (semantic, causal, behavioral) specified and pending.
- Spawn an audio-visual "organism" onto a canvas in Eravos and wire it to other organisms — a genuinely playful, sovereign creative-systems layer sitting alongside the more utilitarian engineering tools.
- Browse the web through Clear Glass, a custom Electron shell that hosts AI provider tabs directly and can inject Guardian's userscripts into them.

## 1.5 What's Explicitly Not There Yet

In the same spirit of honesty, the things most often assumed to exist but that do not, as of this writing:

- A single unified "meta" control panel that visualizes every component, hook, wire, and CFR reading in one screen — this is Part VI/VII of the Vision Spec (§11), the single largest missing user-facing piece.
- Full self-healing — `lib/diagnostic-engines.js` computes real diagnoses today but calls nothing downstream to act on them.
- RFR2 (the causal/interaction-space toolkit) — thirteen real, tested submodules with **zero production consumers**, the largest "built but never connected" surface in the entire codebase.
- A declarative, single-format workflow/scheduler engine — there is no scheduler in the codebase at all today (confirmed by direct search).

---

# PART II — MEET THE CO-PILOT

If NEXUS has a face, it's the Co-pilot. This is the sovereign system a person actually talks to.

## 2.1 What the Co-pilot Is

🟢 **REAL & WIRED** — `copilot/server.js`, port **3750**.

The Co-pilot was deliberately split out of Guardian into its own sovereign process. The reasoning, taken directly from its own spec:

> *"Guardian is dispatch. Co-pilot is intelligence. They are separate. If Guardian goes down, the co-pilot can still answer from Cortex memory."*

That's the whole design in one sentence. Guardian is the plumbing that gets a prompt into a browser tab running Claude or ChatGPT and gets a response back out. The Co-pilot is the layer that decides *what context to assemble*, *whether it even needs to ask an external model at all*, and *how to keep a conversation coherent across many turns and many channels* — and it's built so that a Guardian outage degrades it gracefully rather than taking it down entirely.

## 2.2 How the Co-pilot Thinks: Seven Layers of Context

Before the Co-pilot ever sends a prompt anywhere, `lib/copilot-context.js` assembles up to **seven layers of context** (`CONTEXT_LAYERS: 7` is a literal constant in its spec):

1. Live system/UI state (`uiState` — a snapshot of what the browser's front end currently shows)
2. Session continuity (recent exchanges in this conversation)
3. Cortex intelligence queries (`/api/intelligence/mastermind`, `/api/intelligence/intuition`)
4. Grammar/intent matching against the component registry
5. Idearium stream ingestion (live idea-stream events, wired session 5)
6. Chat-log / memory-index recall
7. Field state (the live CFR coherence/friction/resonance/entropy reading)

This is genuinely wired, not aspirational — confirmed directly against `copilot/server.js` this session, along with session continuity (`_injectSessionHistory`) and the streaming endpoint (`/api/prompt/stream`).

## 2.3 Dual Cognition

The Co-pilot is designed around **three cognitive faculties**, deliberately modeled as separate modules rather than one function with branches:

- **`intuition.js`** — the fast path. Keyword/pattern matching against live crystallized patterns (see Crystal-Lattice, §6.12) for an instant, cheap answer when one is available.
- **`analysis.js`** — the slow, careful path. Assembles the full seven-layer context described above and reasons over it.
- **`adversarial.js`** — a self-critical pass that writes its findings back to Cortex.

🟡 The "dual cognition" framing (intuition consulting Cortex before dispatch) is confirmed real on the Co-pilot side; the RAID/adversarial side of that same loop is **not yet confirmed wired** — flagged honestly in the system's own state-tracking rather than assumed complete.

## 2.4 What Makes the Co-pilot Different from "Just Calling an LLM"

- It **checks its own memory before asking anyone else** — the `TOKEN_FIRST_THRESHOLD` constant (0.6) means a sufficiently-confident grammar/intent match skips the model call entirely.
- It **tags every exchange with provenance** — `componentId`, `hookId`, and `modelUsed` on every response, so any answer can be traced back to exactly which component and which hook produced it, not just "the AI said so."
- It **degrades gracefully** rather than failing hard — because it's a sovereign system with its own Cortex-memory fallback, a Guardian outage doesn't mean silence.
- One precise, bounded, currently-known gap: three declared axiom endpoints (`/api/axioms`, `/api/axioms/add`, `/api/axioms/remove`) exist as real code in `copilot/axiom-manager.js` but aren't yet wired into the live HTTP API. Every other declared Co-pilot route (`/api/prompt`, `/api/stream`, `/api/sessions`, `/api/lifeline/health`, `/api/build`, `/api/diagnose`, and more) is real and checked, not sampled.

---

# PART III — ARCHITECTURE AT A GLANCE

## 3.1 The Whole Machine, One Picture

```
                              ┌─────────────────────────┐
                              │   ORCHESTRATOR  :9000    │   ← root kernel, unified API, SSE bus
                              │   boots everything first │
                              └────────────┬─────────────┘
                                           │
                              ┌────────────▼─────────────┐
                              │      BRIDGE  :9999        │   ← trust relay, boots first of the "real" systems
                              │  identity·routing·queue   │
                              └───┬─────┬─────┬─────┬─────┘
              ┌───────────────────┘     │     │     └───────────────────┐
              │                         │     │                        │
      ┌───────▼───────┐      ┌──────────▼──┐ ┌▼──────────┐   ┌─────────▼────────┐
      │  CORTEX :3748  │      │ GUARDIAN     │ │ IDEARIUM   │   │  COPILOT :3750   │
      │  memory · CFR  │      │  :7820/7821  │ │  :4800     │   │  intelligence    │
      │  RAID router   │      │  AI dispatch │ │  idea OS   │   │  layer over all  │
      └────────────────┘      └──────────────┘ └────────────┘   └──────────────────┘

      ┌────────────────┐  ┌─────────────┐  ┌────────────┐  ┌────────────────┐
      │ ARCHITECT :3747 │  │ OLLAMA :3749│  │ LOOM :3752 │  │  EMERGE :4242   │
      │ intent/gap/     │  │ local model  │  │ component/ │  │  .spec compiler │
      │ tension extract │  │ job queue    │  │ hook/wire  │  │  (optional)     │
      └─────────────────┘  └─────────────┘  └────────────┘  └─────────────────┘

      ┌────────────────┐  ┌────────────────────┐
      │  ERAVOS :3751   │  │ CLEAR GLASS :7701   │
      │  sovereign canvas│  │ sovereign Electron  │
      │  organisms/wires │  │  browser shell       │
      └─────────────────┘  └─────────────────────┘

   Underneath everything, no port of its own:
   ┌───────────────────────────────────────────────────────────┐
   │  meta/   — 13-module intelligence suite (CFR, RFR2, gap,   │
   │            topo-kernel, telemetry, liminal, ALK, ALK-      │
   │            perception, spatial, BDA, causal, crystal-      │
   │            lattice, adversary-suite)                       │
   │  warp/   — content-addressable cache + cascade + the       │
   │            Event/Gate/Stream/Axiom primitives              │
   │  lib/    — 67+ shared modules: component-registry, RAID,   │
   │            request-handler, self-heal, seam, agent-tools   │
   └───────────────────────────────────────────────────────────┘
```

## 3.2 Port Map

| Port | System | Role |
|---|---|---|
| 3747 | Architect | Intent/gap/tension extraction, hook registry, topology scanner |
| 3748 | Cortex | Memory substrate, source of truth, CFR field, RAID router |
| 3749 | Ollama (bridge wrapper) | Local model job queue |
| 3750 | Copilot | Sovereign co-pilot, dual cognition, lifeline routing |
| 3751 | Eravos | Sovereign canvas — organisms, wires, audio/spatial transport |
| 3752 | Loom | Component/hook/wire/seam registry, scaffold engine |
| 4242 | Emerge | `.spec` → knowledge-graph compiler (optional service) |
| 4800 | Idearium | Idea lattice, spec-chunk engine |
| 7701 | Clear Glass | Sovereign Electron browser shell (SSE) |
| 7799 | Autopilot status | `autopilot.js --status-port` |
| 7800 | Rheon IDE | Seam-language IDE (historical) |
| 7820 | Guardian | HTTP — AI job dispatch, SEAM queue |
| 7821 | Guardian WSS | Legacy WebSocket surface — **confirmed dead**, superseded by NCP |
| 7822 | Guardian Dropzone | File server (LAN) |
| 7823 | Guardian Memory | JAA query surface (LAN) |
| 7825 | Diagnostic | 12-engine diagnostic suite |
| 9000 | Orchestrator | Root coordinator, unified API, contract verification |
| 9999 | Bridge | Cross-system trust relay, circuit breaker |
| 11434 | Ollama | External local LLM daemon |

## 3.3 Boot Order

Systems come up in a specific, load-bearing sequence — a later system assumes an earlier one is already alive:

**0. Orchestrator** (root process, starts everything else) → **1. Bridge** (trust relay — must exist before anything can safely cross a system boundary) → **2. Cortex** (memory) → **3. Guardian** (AI dispatch) → **4. Idearium** (idea OS) → **5. Emerge** (optional compiler).

This ordering is enforced in code (`NEXUS_SUPERVISED` env guard in `orchestrator.js`), a fix for a real historical bug (`EADDRINUSE` double-spawn collision, where `orchestrator.js` and `autopilot.js` both tried to boot the same processes independently).

---

# PART IV — THE SUBSTRATE

Three primitives sit underneath every sovereign system in NEXUS. Understanding these three is understanding the whole grammar of the codebase.

## 4.1 SISO — the Event Bus

**S**ingle-**I**nput **S**ingle-**O**utput. This is the foundational event-bus pattern, originating from the architect's own mentor, and it appears, in one form or another, in nearly every subsystem:

- **`Event`** — `{type, data, uuid, ts}`. Every event carries its own identity and timestamp.
- **`Gate`** — `{signature, transform()}`. A pure function that takes an event and either passes it through (possibly transformed) or blocks it.
- **`Stream`** — the dispatcher. O(1) event dispatch to registered gates.
- **`StreamLog`** — the audit trail. Every event that passes through is logged.

🟠 **PARTIAL/in transition.** As of the current state-spec, there are actually **two competing implementations** of this pattern in the tree: the original plain inline SISO copy (still used by 14+ files including `bridge/router.js`, `bridge/identity.js`, `bridge/ledger.js`, and two entirely separate SISO copies under `emerge/siso/` and `cos/siso/`) and WARP's newer, richer core (§6, below), which is a genuine superset — it adds `Axiom`-based validation, `.matches()` predicates, and schema-checked output. The architectural decision has been made (WARP replaces plain SISO going forward) but the migration is **2 of 16 files complete** as of the last full audit. This is named explicitly rather than glossed over, because it's exactly the kind of "declared complete, actually partial" gap the system's own axioms exist to catch.

## 4.2 JAA — Persistence

Every module writes state through JAA (append-only, JSON-based storage), never through ad-hoc files or in-memory-only state. JAA tables come in three retention tiers:

- **Working** — evicts after 2 hours, wipes entirely on restart (e.g., `active_traces`, `working_memory`).
- **Short** — evicts after 24 hours but survives a restart (e.g., `gaps`, `artifacts`, `event_log`, `sigma_records`).
- **Long** — never evicts (e.g., `crystals`, `memory_index`, `versionium_commits`, `failures`, `law_violations`).

One deliberately protected invariant: the `requests` table is a **projection** of Bridge's own ledger — it is never written to directly. `POST /api/table/insert` rejects any attempt to write it with an explicit 400. This is the concrete enforcement of a broader rule stated in the axioms: *"Projections are derived, not written. Competing truth layers are a system failure."*

Cortex alone runs 28 of these tables. Guardian runs 15 (snapshot-JSON style rather than append-only JSONL). Idearium/Cockpit-era work used a 25-table IndexedDB-backed variant.

## 4.3 Bridge — the Trust Relay

Bridge (`:9999`) is the single write authority for every cross-system request in NEXUS. Nothing is supposed to cross a system boundary without passing through it first.

Its own router is a genuine little state machine:

```
ResolveGate → CircuitGate → RouteOpenGate → DispatchGate → ResultGate | HoldGate
```

A request's lifecycle: `pending → dispatched → fulfilled | failed | held | cancelled | quarantined`. Route depth is bounded (`MAX_ROUTE_DEPTH = 3`), and every hop appends to a `routeHistory` so a request's actual path through the system is always reconstructable after the fact — a direct, practical expression of the causal-provenance philosophy described in Part I.

Fallback chains are explicit and named: if Guardian is offline, requests fall back to Ollama; if Cortex is offline, they fall back to Orchestrator; if Idearium is offline, there is deliberately **no fallback** — the request is held rather than silently rerouted somewhere that can't actually serve it.

🟢 **REAL & WIRED.** Notably, Bridge itself was — until this session's fixes — the only system in the entire ecosystem writing *zero* events to Cortex, meaning the system responsible for routing everything had no visibility into its own behavior from memory. This has since been fixed via a mirror pattern (`lib/cortex-write.js`) that every other system now also uses.

---

# PART V — THE SYSTEM ENCYCLOPEDIA

Every sovereign system, alphabetically. Each entry: what it is, how it works, what's genuinely novel about it, and its honest current status.

## 5.1 Architect — `:3747`

**What it is:** The intent-extraction front door. Turns raw human language into structured `Constraint` / `Gap` / `Tension` objects with real confidence scores, and hosts a topology scanner plus a hook registry.

**Why it matters:** Architect is the system that turns "I want X" into something the rest of NEXUS can act on programmatically, rather than every downstream system having to parse free text itself.

**Status:** 🟢 Real, running, with two real browser UIs (`/ui/spec-builder`, `/ui/arch-builder`). Its intake pipeline suffered a dramatic, fully-traced failure this session: **928 real calls, 928 failures, zero exceptions thrown** — a silent-failure bug of exactly the kind NEXUS's own axioms are designed to prevent. Root cause: `nexus-heal-loop.js`'s bus listener matched incoming events by *name substring* only, never checked event *shape*. Guardian's userscripts were emitting a single batched, plural event (`{jobId, gaps: [...], source}`) where Architect's classifier expected one gap object at a time — every field it looked for was silently absent from every one of 928 calls, and nothing ever threw. Both sides were fixed: the listener now checks shape before processing, and the userscripts now emit one correctly-shaped event per real issue. This is preserved here specifically as a case study in why "no exceptions" does not mean "working."

## 5.2 Bridge — `:9999`

See §4.3 above for the mechanism. As a system: the very first "real" service booted, and the backbone every other cross-system call is supposed to route through.

## 5.3 Clear Glass — `:7701`

**What it is:** A custom Electron-based browser shell, purpose-built to host AI provider tabs (Claude, ChatGPT, and others) directly inside NEXUS's own window chrome, and to inject Guardian's Tampermonkey-style userscripts into those tabs via `executeJavaScript`.

**Why it's novel:** Rather than NEXUS reaching *out* to a browser extension in a general-purpose browser, Clear Glass *is* the browser — a `ProviderHost` class manages dedicated webviews per AI provider, and a `NexusOptions` store manages its own settings, entirely inside a purpose-built shell with its own titlebar controls. This closes a gap that plagues most browser-automation approaches: there's no separate extension lifecycle to manage, because the host and the automation surface are the same application.

**Status:** 🟢 Real, running (`src/providers/host.js` v2, per-provider status tracking). One concretely-scoped, not-yet-built extension exists as a live proposal: an **auto-ingestion pipeline** that would listen for downloads/artifacts appearing in a hosted provider tab (Claude's artifacts, ChatGPT's code-interpreter outputs) and pull them automatically into Cortex, queued for system integration — scoped in detail (including the open question of whether ingestion should auto-attempt a build or land in a human-reviewed holding queue) but ⚪ not yet built.

## 5.4 Cortex — `:3748`

**What it is:** The memory substrate and, by design intent, the single source of truth for the entire ecosystem. Hosts 28 JAA tables, the CFR field engine, the RAID provider-routing engine, self-heal, versioning (Versionium), and the file-content-addressed store.

**How it's supposed to work, end-state:** every system's conversation/event writes flow through Cortex's `push()`, with each system additionally maintaining a redundant local buffer that Cortex polls and auto-imports on reconnect — so a network blip doesn't lose data, and Cortex never becomes a single point of *loss*, only a single point of *truth*.

**How it actually works today:** `lib/cortex-write.js` genuinely implements this write-through-with-buffer pattern — but `cortex/boot.js` never calls the corresponding `importBufferedData()` function on boot, so the buffer-recovery half of the design is unexercised in production. 🟠 Guardian and Eravos, in particular, run **fully independent** local data stores that never touch Cortex at all — the "single source of truth" is, today, a partial truth, and six Cortex JAA schemas still need to be added before the migration can be completed system-wide.

**The Unified API (`push`/`recall`):** described in the spec as a five-lane retrieval system (lexical, recency, semantic, causal/failure, BEP-pattern). 🟠 Two of five lanes are real (lexical + recency); the other three need infrastructure (a real causal-graph query surface, a real behavioral-event-pattern index) that doesn't exist yet. This was built essentially from scratch this session — the endpoint previously existing was a raw, unvalidated `{table, row}` passthrough, and an adversarial test during that build caught and fixed a real un-bounded input (a 10MB payload was silently accepted; a 256KB ceiling now exists, tested at the exact boundary in both directions).

**Self-heal:** the real, wired mechanism is `nexus-heal-loop.js` — bounded and severity-gated deliberately, because of a prior incident where an earlier self-healing loop ran away unchecked. `cortex/self-heal/escalation.js` is a related but broken dependency (its level-3.5 step was calling a nonexistent Guardian provider tab — fixed this session by routing it directly to `ollama-runtime.js`'s `streamGenerate` instead).

## 5.5 Co-pilot — `:3750`

Covered in full in Part II.

## 5.6 Emerge — `:4242` (optional)

**What it is:** A domain-specific language and compiler (`.eg`/`.spec` files) with its own grammar — 595 keywords across constructs like `input`/`output`/`invariant`/`compartment`/`if-then`/`what-ifs`/`loops`/`integrity`/`fidelity`/`SignalS`/`polarity`/`oscillate` — and its own SNR (signal-to-noise) gate that a spec must pass before being treated as valid.

**Why it exists:** the architect's own working theory is that a spec written in a constrained, checkable grammar is a better contract between a human's intent and an AI's implementation than free-form prose. Emerge is the proof that this idea actually compiles: `runtime.spec` genuinely self-compiles into a real knowledge graph (52 modules parsed, a real dispatched/skipped/persisted distribution reproduced identically across multiple runs).

**Status:** 🟢 Real as a compiler. ⚪ Historically, an earlier, more ambitious framing of the project (preserved in the superseded root `README.md`) imagined the *entire* NEXUS codebase written exclusively in `.eg` files — that never happened; zero `.eg`-exclusive architecture exists in the live system, and this is explicitly flagged in the README itself so nobody mistakes the historical vision for the current reality.

## 5.7 Eravos — `:3751`

**What it is:** A sovereign, browser-based audio/visual "organism" system. Each organism is an independently spawnable window/canvas element, governed by a kernel following ten stated axioms (K-1 through K-10), registered into the system via a simple `reg(id, {...})` call in `organism-factory.js`. Transport (play/stop, timing) is driven by a global `MasterTransport` shared across every organism on the canvas.

**Why it's genuinely different from the rest of NEXUS:** almost everything else in this document is utilitarian engineering infrastructure. Eravos is the deliberately playful, generative-art layer — organisms can be wired to each other (`POST /api/wires`), spawned and removed live, and packaged into installable `.zip` "packs." Seven of its organisms are dedicated NEXUS monitors — one per subsystem — meaning the same organism framework used for generative audio-visual play is also used to render live system health as a first-class citizen of the canvas.

**Status:** 🟢 Real, running, since Phase 74. Notably, until this session, `docs/eravos.spec` didn't exist at all despite Eravos being a real service with its own port for weeks — the spec now in the tree was written directly from `eravos/registry-components.js`'s actual exports, not inferred.

## 5.8 Guardian — `:7820` / `:7821` (WSS, dead) / `:7822` (Dropzone) / `:7823` (Memory)

**What it is:** The largest single system in NEXUS (13,000+ lines even after this session's cleanup), responsible for AI job dispatch, the SEAM chunking/verification pipeline, and provider management across ChatGPT, Claude, and Ollama.

**How AI dispatch actually works:** Guardian doesn't call a chat API directly for the browser-based providers. It uses **NCP** (a custom transport: Server-Sent Events server→client, plain `fetch` POST client→server, which fully replaced an earlier WebSocket-based design) together with **userscripts** injected into live browser tabs — the same pattern Clear Glass's `ProviderHost` also leans on. A prompt is injected into the actual Claude or ChatGPT web tab as if a person typed it; the response is scraped back out.

**The SEAM pipeline:** spec → chunk → inject → verify → `stable | failed | retry`. Every chunk is written to a `seam_records` JAA table, giving a full audit trail of every piece of AI-authored content that ever passed through Guardian.

**Notable fixes this session (illustrative of the system's general health-maintenance discipline):** an inline dropzone `autoUpload()` function threw an uncaught `TypeError` on *every single job completion that produced a code artifact*, because it called into a method (`registry.autoUpload`) that was never defined on the stub object it was called against — with zero try/catch anywhere in the path. Fixed by extracting the real, working logic into `guardian/artifact-upload.js` and deleting a 278-line broken duplicate. Also removed this session: dead TLS/cert-generation code referencing constants that were never defined, and a 756-line duplicate memory server file that was a complete, unreferenced copy of the live one already running inline in `guardian/server.js`. Net effect: `guardian/server.js` shrank from 4,275 to 3,959 lines with zero functional loss — dead code removal, not feature removal.

**Status:** 🟢 Real and heavily used, but — per its own spec — has **zero working synchronous "ask" endpoints** as of the last audit: `/api/copilot/prompt` doesn't exist, and the one real alternative (`/chatgpt-mode/query`) always returns a 503 because its own required backing file doesn't exist either. This is a genuine, currently-open gap that blocks Co-pilot's lifeline-escalation path from ever succeeding on Guardian's side, even though the routing *decision* that leads there (via RAID) is itself real and correctly reasoned.

## 5.9 Idearium — `:4800`

**What it is:** The Idea Operating System — the place a raw idea becomes a spec, a spec becomes a gap, and a gap becomes a build task. Built CLI-first, with the API layer explicitly a *projection* of CLI state, not the other way around (§10.2's rule about projections applied at the architecture level).

**The Tension Engine:** every idea is scored 0–1 on gap density, contradiction, novelty, and resource cost — a genuinely quantitative way of asking "is this idea worth pursuing right now, and why." An SNR (signal-to-noise) rolling window tracks overall system signal quality over time, and a "Vortex log" preserves snapshot history so nothing is ever silently overwritten — per the system's own stated rule, "nothing ever deleted, archive only."

**A real, dramatic failure and its fix:** the path for dispatching an idea-chunk to ChatGPT or Claude was a genuine dead end — `buildChunkWithAgent()`'s own source comment said *"return jobId so caller can poll,"* but nothing anywhere ever actually polled it. A chunk routed this way would sit in a `BUILDING` state forever. This was traced to root cause and fixed by building a real poller against Guardian's actual job-listing endpoint (there is no single-job lookup endpoint, so the poller works against the list), tested three separate ways including against a genuine field-naming inconsistency in Guardian itself (`responseText` in one code path, `result` in another).

**Status:** 🟢 Real, running; the dispatch dead-end above is fixed, though `CHUNK_STATES` still lacks the real multi-strategy retry and verification-gate behavior that Guardian's own `SEAMQueue` has — a shared state vocabulary between the two systems now exists (`lib/seam/chunk-lifecycle.js`), but that's translation, not behavioral parity.

## 5.10 Loom — `:3752`

**What it is:** A component/hook/wire/seam registry with a scaffold engine and an "iteration archive." Conceptually the closest thing in NEXUS to a formal package/module registry — every discrete unit of code is meant to be describable, addressable, and wireable through Loom.

**Status:** 🟢 Real, tested library code (its production test suite passes 18/18) — but until this session it had **zero HTTP endpoints**, meaning genuinely working code with no way for anything else in the ecosystem to actually reach it over the network. This session gave it real endpoints: `POST /api/ingest` and `/api/ingest-upload` for real binary zip uploads (specifically built to handle real drag-and-drop, since browsers never expose actual filesystem paths for dropped files — a detail the fix accounts for explicitly), plus `/api/templates` and `/api/scaffold` for its scaffolding engine. Its console UI was deliberately forked from Idearium's existing, working UI rather than designed from scratch.

## 5.11 Ollama (bridge) — `:3749` / Ollama daemon `:11434`

**What it is:** `ollama/server.js` is a sovereign HTTP wrapper and job queue around the actual local Ollama daemon (which runs separately on `:11434`). The routing law here (§LAW_I in the axioms) is explicit: local-first — Ollama is tried before any cloud provider, always.

**Genuinely novel piece:** this is the first and, as of this session, only production caller of WARP's dispatch layer (§6.3). Every dispatch runs through `unifiedDispatch`, backed by WARP's `FlatFileCrystallizer` and `PopulationStore` — meaning identical requests build up "population evidence" the first few times and are then served from cache. This was proven, not assumed: three identical dispatches genuinely built up cache evidence, and the fourth+ genuinely served from cache with zero further model calls.

**A real bug caught and fixed in that same layer:** WARP's `axiom-gate` was checking every candidate output against the *same, fixed* request event rather than each candidate's own actual output — meaning the validation gate was structurally incapable of distinguishing a good candidate from a bad one. Fixed so each candidate now carries its own event with its own output.

## 5.12 Orchestrator — `:9000`

**What it is:** The root kernel. Boots every other system in the correct order, proxies essentially every route in the ecosystem so a single client only ever needs to know about one address, and runs a unified Server-Sent-Events bus that every UI subscribes to.

**Status:** 🟢 Real, running, and the single place where all seven of the meta intelligence suite's real production entry points converge (see Part VI) — though it's worth noting that of the meta suite's 13 modules, Orchestrator is genuinely their **only** consumer, and touches just 3 of the 13 in practice.

---

# PART VI — THE META INTELLIGENCE SUITE

`meta/` is a library, not a service — it has no port of its own. It's a set of 13 sovereign, domain-agnostic modules, each of which "measures, detects, classifies, or scores," in the words of its own header, without any knowledge of what NEXUS actually *is*. Any system is meant to consume these over their own public API, never by direct import of another sovereign system's internals.

| Module | What it does | Status |
|---|---|---|
| **cfr** | The truth substrate — coherence, friction, resonance, entropy. See Part VII. | 🟢 Genuinely load-bearing: 11 real production consumers across the codebase (`architect/service.js`, `bridge/index.js`, `cortex/boot.js`, `guardian/server.js`, `idearium/index.js`, `orchestrator.js`, and more), confirmed by direct grep — not a stub. |
| **rfr2** | Causal/interaction-space toolkit: a Relational Field Reader lineage — measurement, replay, and enforcement of interaction patterns, descended from earlier work reading relationship structure through behavioral/linguistic/field metrics. 13 real, built submodules (identity, enforcement, lazy, query, clip, delta, version-gate, observer, time, compress, context, adapter-sandbox). | 🟡 **Zero production consumers, confirmed completely** — not one file anywhere in the codebase requires `meta/rfr2/*`. This is, by a wide margin, the single largest "fully built, never connected" surface in all of NEXUS — larger even than the rest of the meta suite's partial wiring. |
| **gap** | Gap detection — an 8-type "hunter," plus predicate/closure logic and a gap ledger. | 🟢 Wired into Guardian's live completion path; a byte-identical duplicate of this module (`guardian/lib/gap-hunter.js`) was found and consolidated this session — the Guardian copy is now a one-line forwarding shim to this canonical version. |
| **topo-kernel** | An 8-gate signal-to-noise pipeline. | 🟡 Real, minimally consumed. |
| **telemetry-codec** | Slope, stability, oscillation, and confidence engines over event streams. | 🟡 Real, unwired outside status checks. |
| **liminal** | 12 domain-agnostic "interstitial space" detectors — crystallization and forward-inference over patterns that live *between* clean states. | 🟡 Real, currently consumed only by orchestrator status checks — not yet consulted anywhere in a live decision path, despite being named as a Guardian-completion-path target in the vision spec. |
| **alk** | The decision lattice — records `causedBy` chains and supports rewinding a decision to see what led to it. | 🟡 Real, minimal wiring. |
| **alk-perception** | A behavioral-state classifier. | 🟡 Real, minimal wiring. |
| **spatial** | Sigma (entropy/regime classification) plus a resonance-weighted lattice. | 🟢 Feeds the CFR field regimes described in Part VII. |
| **bda** | The Behavioral Drift Analyzer — tracks how a user's or a system's behavior shifts over time. Ledger-replay-safe; gained a third tracked "role" (reflection) this session. | 🟢 Real, wired into reflection scoring. |
| **causal** | Anomaly engine and compounding-effects modeling — this is where `compound.js`'s ripple/wave/tidal classification (Part VII) actually lives. | 🟢 Real and load-bearing. |
| **crystal-lattice** | Pattern crystallization — `(domain, verb, outcome)` triples that accumulate into named, confidence-scored "crystals," plus lattice-edge success-rate tracking. | 🟢 The one module of the 13 with a real, confirmed, tested consumer path: Co-pilot's `intuition.js` reads its crystal table for fast-path answers. This connection was itself broken until this session — `intuition.js` had been querying a completely different, wrong-shaped endpoint (a crude event-type tally) for an unknown period, silently rendering `undefined → undefined (NaN%)` on every real use without ever throwing a runtime error. Found, traced to the correct real module, rewired, and proven with an actual inserted-and-verified test crystal. |
| **adversary-suite** | Six real attack classes for testing a system's own resilience — syntax, logic, edge-case, state, cross-domain, and stress, intensity-scaled by a configurable risk level, plus a QA/QC layer. | 🟢 Real; the "state" class is the literal source of the `frame_violation` classification that routes into a compartment's `DELETE` outcome. |

**Why this matters as a whole:** the meta suite is the clearest illustration in all of NEXUS of the system's own most common failure pattern — modules built correctly, in isolation, tested on their own terms, and then never actually wired into anything's live decision path. The state-spec calls this out directly as *"the dominant bug category"* found across an entire session of auditing, and treats "confirmed real, not yet connected" as its own honest status category, distinct from both "broken" and "done."

---

# PART VII — THE CAUSAL PHYSICS STACK

This is the part of NEXUS most directly downstream of its founding philosophy: rather than just logging what happened, NEXUS computes a genuine numeric model of how its own behavior is propagating, using vocabulary borrowed directly from physics.

## 7.1 Layer 1 — Structural Causality (`lib/cfr/graph.js`)

A `CausalGraph` with five real, distinct edge types: causal, session, job, temporal, and type-sequence. Every event in the system carries a `causedBy` UUID, so ancestry, lineage, full dependency trees, and job chains are all genuinely queryable, not reconstructed after the fact from timestamps.

**The CFR Field itself** — Coherence, Friction, Resonance, entropy — is read out into four named **regimes**:

| Regime | Condition | What it signals |
|---|---|---|
| **stable** | coherence > 0.6, entropy < 0.3 | Healthy flow |
| **resonant** | coherence > 0.4, entropy < 0.3 | Cyclic signal — something repeating in a structured way |
| **turbulent** | friction > 0.65 OR resonance > 0.7 | A loop or deadlock forming |
| **chaotic** | entropy > 0.7 OR coherence < 0.25 | Something-went-wrong (a block, an error cascade) |

## 7.2 Layer 2 — Residual Causality (Sigma Scoring)

How far a given event deviates from a *learned baseline*, scored across structural, temporal, and contextual axes. This is what powers the `divergence-watcher`, which polls sigma readings every 5 seconds and fires when a reading crosses 0.65, or spikes by 0.20 within a single window — with a 90-second cooldown to prevent alert storms. On a genuine divergence, the system captures a synchronous state snapshot, a "blackbox" recording of the preceding ten minutes, and schedules a matching "post" recording 30 seconds later — the same instinct that motivates a flight recorder, applied to a software system's own internal state.

## 7.3 Layer 3 — Propagation Dynamics (Ripple / Wave / Tidal)

The most distinctive piece of the whole stack. Every high-sigma event gets a computed **CausalImpulse**:

```
magnitude        = sigma × (1 + entropy × 0.5)
branchingFactor  = varies by event type (a contract violation branches at 3.5×; a collapse at 4.0×; a routine completion barely branches at 0.5×)
resistance       = coherence × 0.6 − entropy × 0.4
decayRate        = coherence × 0.7 − tension × 0.3   (bounded 0.05–0.85)
E(N)             = magnitude × branchingFactor^N × (1 − decayRate)^N × (1 / (1 + resistance))
```

The resulting energy value at increasing "distance" N through the graph determines the classified regime:

- **Ripple** — energy stays low (E(3) < 0.2). One downstream effect. Normal flow. Not even written to the log — this is the "nothing to see here" case, deliberately not over-recorded.
- **Wave** — E(3) ≥ 0.2, or two-plus downstream events. Spreading. Written to `event_log`.
- **Tidal** — E(6) ≥ 0.4, or a chaotic regime combined with cross-system reach. This automatically opens a gap — the system doesn't wait for a human to notice a cascading failure; it recognizes the shape of one and flags it itself.

Seven named "compounding factors" feed into this model: sigma amplification, retry cascades, cross-system propagation, unresolved gap chains, contract-violation amplification, tension escalation, and backpressure release.

**Why this is genuinely novel rather than decorative:** most systems have alerting thresholds on individual metrics. NEXUS's causal-physics stack instead asks *how a disturbance would propagate through the graph of everything the system knows about itself*, and only escalates when the propagated, decayed, branching-adjusted energy of an event crosses a threshold — which is a meaningfully different (and harder to false-positive) test than "did any one number cross a line."

---

# PART VIII — THE UI LAYER

## 8.1 TV-Shell and the Sovereign-Module Pattern

The current front-end entry point (`ui/home/index.html`) is, by the system's own admission, a roughly 4,000-line monolith — "the system cannot tell the UI to do anything," in the words of its own decomposition spec (`ui/tv-shell/DECOMP.md`).

The decomposition already underway follows a clear pattern: a thin shell (`shell.js`/`shell.css`) plus independently callable "sovereign modules," each with its own HTTP surface, one per UI channel. Two are already built this way:

- **`menu.js`** — `window.NexusMenu`, zero coupling to the rest of the UI, routes everything through Co-pilot.
- **`spotlight.js`** — the most mature example. A real public API (`Spotlight.on/off/step/tension/execute/navigate`) plus a matching HTTP surface (`POST /api/ui/spotlight/on|off|step|tension`), so *any* system in NEXUS can direct what the UI highlights without ever touching raw HTML.

A **toast notification system** is explicitly proposed as the third module in this pattern — not a new architecture, just the next thing that fits the established shape. It's needed because, as of today, toasts are ad hoc: at least six different HTML files (the control panel, Idearium's UI, the forge shell, the builder, the blueprint builder, and one more) each independently reinvented their own `#toast` div and show/hide logic.

## 8.2 The Forge IDE

`guardian/ui/index.html` is the primary hands-on build interface — a universal file loader (any file type: `.js .ts .md .yaml .spec .eg .json .txt .py .html .css .sql .toml .sh`), which chunks loaded content through SEAM, auto-generates test contracts, and exposes Guardian's own CLI commands (`/code /spec /ask /file /multi`) as clickable buttons. It syncs live to Orchestrator, Cortex, and Idearium, and surfaces a ledger panel, an artifact viewer, a gap tracker, and a provider selector (Claude / ChatGPT / Ollama / Gemini) in one screen.

## 8.3 The Missing Piece: One Meta Control Panel

The single clearest gap in the entire UI layer, named explicitly in the Vision Spec (Part XI's source document): there is no one screen today that shows a live wiring map (which systems actually talk to which, sourced from real bus subscriptions rather than a manual grep), a unified ledger viewer, a Co-pilot/Ollama personality and tool-permission control panel, and a workflow/contract editor, all in one place. Every piece of *data* this panel would need already exists somewhere in the system (the component registry, the hooks registry, the CFR field, the Bridge ledger) — building the panel is genuinely aggregation and visualization work, not new primitive invention. It's deliberately scheduled last in the build order (§11) precisely because building it before the underlying shapes stabilize would mean rebuilding it every time something underneath changes.

---

# PART IX — MEMORY & THE LEDGER

## 9.1 The Governing Rule

> *"Every cause is as important as the conditions of its effect. The codebase is a materialised view of the Upgrade Ledger."*

Concretely: nothing in NEXUS is supposed to be true unless it's written somewhere durable, and every data type is supposed to have **exactly one write authority.** The Bridge-ledger/Cortex-projection relationship for the `requests` table (§4.2, §4.3) is the sharpest concrete example of this rule being enforced in code rather than just stated in a document.

## 9.2 Named Fault Classes

NEXUS's architecture document names 21 specific fault classes it watches for — not generic "bugs," but named, recurring shapes of failure the architect has actually seen happen more than once: `silent_failure`, `phantom_write`, `dual_truth`, `rogue_bypass`, `replay_double`, `ghost_call`, `stub_in_production`, `scope_escape`, `missing_provenance`, `token_expiry`, `circuit_deadlock`, `held_starvation`, `context_loss`, `hash_drift`, `monolith_growth`, `boot_order_violation`, `version_drift`, `ledger_orphan`, `contract_drift`, `cfr_collapse`, `invariant_break`.

Naming a failure mode before it recurs is itself a design principle here — the AXIOMS v3.1 addition (§17.7, quoted in the state-spec) states it directly: *"never fix the symptom twice — the third occurrence promotes to architecture."* This session's own audit found exactly that pattern in itself: five separate "declared wire, not implemented" bugs, each fixed as an isolated patch, without ever building the missing verification primitive underneath all five — which is precisely why `scripts/verify-wires.js` (below) got built.

## 9.3 Wire Verification

`scripts/verify-wires.js` is the concrete answer to that pattern: it uses the real 82-entry hook registry (`hooks/index.js`) to check every *declared* cross-system endpoint against the *receiving* system's actual source code, rather than tracing individual threads by hand one at a time. Its first run surfaced 19 candidate mismatches; two were the tool's own false positives (corrected honestly rather than hidden), and the rest were hand-verified, surfacing three genuinely new findings in one automated pass — including Co-pilot's three unwired axiom endpoints (§2.4) and a case where Cortex's real snapshot/self-heal routes had silently drifted in *name* from what the registry declared, while the underlying functionality was actually present under different endpoint names.

---

# PART X — COMMAND & CONTROL

## 10.1 The Component Registry

`lib/component-registry.js` is the canonical mechanism for wiring subsystems together — the stated architectural rule, reinforced repeatedly, is that meta-system components (`meta/`, `lib/`, and the CFR/RFR2 subsystems) should connect to each other through APIs and hooks registered here, rather than through direct `require()` calls that create hidden, unmanaged coupling.

Every registration automatically triggers `lib/descriptor-projector.js`, which turns one component descriptor into **six separate projections** with zero LLM involvement: a CLI command shape, a grammar-engine entry, a UI descriptor, a config schema, a SEAM contract, and a documentation stub — all generated mechanically from one source of truth, rather than hand-maintained in six places that inevitably drift apart.

`lib/grammar-engine.js` rebuilds its live command-matching trie automatically every time a component is registered or updated — confirmed wired to the real Server-Sent-Events stream, not aspirational.

## 10.2 The Hook Registry

`hooks/index.js` plus ten per-system `hooks/<system>.hooks.js` files (one for each of the ten sovereign systems) hold **78 declared hooks, 21 of them SEAM-tracked**. It is important to understand precisely what this registry *is* and *is not*: it is a **declarative documentation layer** — it records that a wire between two systems is supposed to exist. It does **not**, by itself, drive runtime dispatch; the sovereign systems still call each other directly over real HTTP in almost every case. The one confirmed exception, as of this session, is a real SSE wire from Idearium to Co-pilot.

## 10.3 The Unified CLI

`cli/nexus-cli.js` reads its entire command grammar live off the component registry — there are, deliberately, no hardcoded commands. A component registering itself is sufficient for it to become callable from the CLI, the browser UI, and (per the Vision Spec's proposed `run_command` tool) a model, all through the exact same dispatch path, rather than three separate hand-written implementations that could silently diverge.

---

# PART XI — WHAT'S NEXT: THE VISION AND THE BUILD ORDER

The system's own Vision Spec (`NEXUS-VISION-SPEC-2026-07-06.md`) is explicit that almost every primitive the end-state design needs **already exists somewhere in the tree** — the work remaining is connective tissue and coverage, not new invention. Its stated build order, each phase depending only on what's already stable above it:

1. **Finish the universal tool layer + registry coverage.** Extend `lib/agent-tools/` with `run_command`, `call_api`, `run_userscript`, and `parse_file` tools, all dispatching through the same registry the CLI already reads — one execution path, three entry points (CLI, UI, model), never three separate implementations.
2. **Finish the unified ledger.** Replicate Bridge's now-working Cortex-mirror pattern to Guardian, Co-pilot, Ollama, and Idearium (today, only Bridge does this), and complete push/recall's remaining three retrieval lanes.
3. **Build the continuous ingestion/streaming layer** (`lib/ingest-stream.js`, proposed but not yet built) — a thin layer subscribing to the bus, normalizing every system's events to plain text, and streaming them into a live context window Co-pilot and Ollama always have open.
4. **Integration passes** for Co-pilot and Guardian — tool parity between the two, fixing Co-pilot's `lifeline.js` (which currently hardcodes its own provider list instead of querying RAID), and wiring the Liminal detectors (§6) into Guardian's real completion path.
5. **Build the scheduler and a single declarative contract format.** No scheduler exists anywhere in the codebase today (confirmed by direct search) — this is named as genuinely new infrastructure, not wiring.
6. **The meta control panel** (§8.3) — deliberately last, because it's a viewer/editor sitting on top of everything above it.

## 11.1 Open Questions the Architect Has Flagged, Not Yet Decided

- Should a Co-pilot "personality" be able to restrict which tools/systems it's allowed to touch, or is scope purely per-conversation?
- Is ledger retention meant to be truly unbounded ("nothing lost, ever"), or should there be a decay/archive tier, given the real storage cost of unbounded growth across every system's events?
- If a scheduled workflow's first step fails, should the whole workflow abort, retry, or continue partially?
- Does the eventual meta control panel need its own authentication/permission layer, given that it would be able to reconfigure live systems?

---

# PART XII — GLOSSARY & INDEX

**Adversary Suite** — meta-suite module; six real attack classes (syntax, logic, edge-case, state, cross-domain, stress) used to test system resilience. See §6.

**ALK / ALK-Perception** — meta-suite modules; decision-lattice (causedBy chains, rewind) and behavioral-state classification, respectively. See §6.

**Architect** — the intent/gap/tension extraction front door, `:3747`. See §5.1.

**AXIOMS** — the governing rule documents (v1 through v3.1) the architect expects every session to follow strictly, especially "Map Before Build" (produce a written artifact before touching code) and "state must be persisted via JAA."

**BDA (Behavioral Drift Analyzer)** — meta-suite module tracking how behavior shifts over time. See §6.

**Bridge** — the cross-system trust relay and single write authority for requests, `:9999`. See §4.3.

**BEP** — a pattern engine referenced across several docs (367 seeded patterns as of Phase 47); its logic lives inside `lib/causal/compound.js` and Cortex's pattern code rather than a standalone file.

**Causal Physics Stack** — the three-layer model (structural / residual / propagation) NEXUS uses to simulate its own behavior. See Part VII.

**CFR** — Coherence / Friction / Resonance (+ entropy). The truth substrate underlying the Causal Physics Stack. See §6, §7.

**Clear Glass** — the sovereign Electron browser shell hosting AI provider tabs, `:7701`. See §5.3.

**Co-pilot** — the sovereign intelligence/conversation layer, `:3750`. See Part II.

**Compound Engine** — `lib/causal/compound.js` / `meta/causal/`; classifies event propagation as ripple, wave, or tidal. See §7.3.

**Cortex** — the memory substrate and intended single source of truth, `:3748`. See §5.4.

**Crystal-Lattice** — meta-suite module; pattern crystallization into named, confidence-scored "crystals." The one meta module with a real, tested consumer (Co-pilot's `intuition.js`). See §6.

**Emerge** — the `.eg`/`.spec` compiler and DSL, `:4242`. See §5.6.

**Eravos** — the sovereign audio-visual "organism" canvas system, `:3751`. See §5.7.

**Forge IDE** — Guardian's primary hands-on build interface (`guardian/ui/index.html`). See §8.2.

**Gap** — a detected problem, contradiction, or unresolved item; 19 named gap types exist in the system's contract vocabulary (e.g., `unresolved`, `contradiction`, `missing_link`, `boundary_gap`, `contract_mismatch`, `trust_violation`).

**Gap Hunter** — the 8-type gap-detection module inside `meta/gap/`. See §6.

**Guardian** — the AI dispatch, SEAM-pipeline, and job-queue system, `:7820`. See §5.8.

**Hooks Registry** — `hooks/index.js` + per-system hook files; 78 declared hooks, 21 SEAM-tracked. Declarative, not dispatch-driving. See §10.2.

**Idearium** — the Idea Operating System (seed → spec → gap → build), `:4800`. See §5.9.

**JAA** — the append-only, tiered persistence layer used across every system. See §4.2.

**Ledger** — the durable, append-only record of events for a given system; governed by the "one write authority per data type" rule. See Part IX.

**Liminal** — meta-suite module; 12 domain-agnostic "interstitial space" detectors. See §6.

**Loom** — the component/hook/wire/seam registry and scaffold engine, `:3752`. See §5.10.

**MQL** — the multi-lane query language behind Cortex's `recall()`; five lanes total (lexical, recency, semantic, causal/failure, BEP-pattern), two currently real. See §5.4.

**NCP** — Guardian's custom browser-tab transport (SSE server→client, `fetch` POST client→server), which fully replaced an earlier WebSocket design.

**Ollama** — the local LLM daemon (`:11434`) and its sovereign wrapper/job-queue (`:3749`). See §5.11.

**Orchestrator** — the root kernel and unified API/SSE bus, `:9000`. See §5.12.

**Push/Recall** — Cortex's Unified Memory API. See §5.4.

**RAID** — the provider-fitness routing engine (health × role-confidence × topological-proximity × SNR-tier-gate). Enforces LAW_I (Ollama first) and LAW_III (Claude last, reserve only). Partially stubbed: only the health term is fully real as of the last audit.

**RFR2 (Relational Field Reader 2)** — the causal/interaction-space measurement toolkit; 13 real submodules, zero production consumers. See §6.

**Ripple / Wave / Tidal** — the three propagation-energy regimes of the Causal Physics Stack. See §7.3.

**SEAM** — a structured build-contract chunking and verification protocol; exists in at least three forms across the codebase (Guardian's prose-based `SEAMQueue`, the newer backend-agnostic `lib/seam/`, and Loom's registry-based version) — a known, named, and only partially reconciled duplication.

**Sigma** — the residual-causality deviation score (structural + temporal + contextual axes) used to trigger the divergence-watcher and gate the compound-propagation engine. See §7.2.

**SISO** — the foundational Event/Gate/Stream event-bus pattern used across nearly every subsystem, currently mid-migration to WARP's richer implementation. See §4.1.

**Spotlight** — the most mature "sovereign UI module" in the TV-Shell decomposition; a public JS API plus a matching HTTP surface so any system can direct what the UI highlights. See §8.1.

**Topo-Kernel** — meta-suite module; an 8-gate signal-to-noise pipeline. See §6.

**Versionium** — Cortex's internal versioning subsystem (commits, branches, file index, calendar, objects) — its own miniature version-control system, living entirely inside Cortex's JAA tables.

**WARP** — the content-addressable cache, cascade-dispatch, and (as of this session) canonical Event/Gate/Stream/Axiom primitive layer, positioned to replace plain SISO across the codebase. See §4.1, §5.11.

---

*This document was compiled directly against the live codebase (`nexus-updated-2-1.zip`), the architect's own `.spec`/state-spec documents, and `lib/version.js`'s canonical version registry — not from the historical/superseded README or any single aspirational design document. Where a claim could not be verified against real code, it is marked accordingly. Treat any part of this document that contradicts a fresher state-spec the same way the system treats its own internal contradictions: check which one is wrong, fix it, don't average them.*
