# FORGE-CODEFACTORY — Combined Spec v0.16
**Formerly:** CODEX (renamed by James — "CodeFactory" going forward)
**Username:** James Brooks
**Codename:** CodeFactory (visual block/module code builder, no AI runtime dependency)
**Naming note:** the Layer 0a DSL retains the name "CODEX Language" for now — a separate naming decision from the project rename; flag if that should change too.
**Governing spec:** AXIOMS v3.1 (2026-07-06)
**Protocol:** FORGE-SKILL
**Load-order prerequisites:** WARP + Jaa present (§8.3)
**Status:** Phase 0 — Orient

> **v0.16 merge note:** This document combines the FORGE-CODEFACTORY Living Doc v0.15 with the **Sigma Similarity & Evolution Engine (§2c)** addition. Per the §2c author's placement instruction, the Similarity Engine is inserted immediately after §2b (Determinism-Maximization & Reuse-First Mandate), because it is the mechanism that makes "reuse-first" compound over time — turning the catalog from a storage cabinet into an ecosystem that learns what deserves to survive. The §2c new open questions are folded into §8.

---

## 0. Session Orient (FORGE-SKILL gate)

| Check | Answer |
|---|---|
| Phase | 0 — Orient |
| Last state | New project, no prior build |
| Known bugs | N/A |
| Intent | Architect end-state spec before any build (§3.3 map before build) |
| WARP present | Required before Phase 4 |
| Jaa present | Required before Phase 4 |

No build work occurs until Phase 4. This doc is the map.

---

## 1. End-State Definition

A standalone application — **no AI at runtime** — where a user builds real, running software by connecting typed blocks, modules, and wires. Every visual artifact compiles to real, readable, version-controllable source in the target language. No proprietary binary formats. No silent stubs (§1.3). Escape to raw code always available.

**North star:** "Code like directing Claude, without Claude." The user thinks in architecture and intent; the tool handles syntax and boilerplate — but transparently, not magically.

---

## 2. Core Axiom Mapping

| CODEX concept | AXIOMS source |
|---|---|
| Block = UUID+hook+bus node | §5.1 |
| Wire = explicit event/data flow | §0.3 info never lost, §1.2 nothing silently fails |
| No proprietary block format | §1.1 nothing exists until proven / real AST |
| Module before feature | §3.3 map before build |
| Raw code escape hatch | §3.4 raw execution before interfaces |
| Build pipeline sandboxed per stage | §4.3 enterprise+military grade |
| Full project export, no patches | Output contract (full zip) |
| Dependency graph view | §10.3 competing truth layers are system failure — one source of truth: the AST |

---

## 2a. Component vs. Mod Principle (resolved v0.12)

Two tiers, not three — `tier: component | mod` — and the rule is structural, not self-declared:

- **Component**: the smallest executable unit. Runs and is complete on its own; no dependency on anything above it. A Component's registry entry has no requirement to list any producer above it.
- **Mod**: anything built *on top of* one or more Components. **A Mod cannot exist without at least one Component underneath it** — this is enforced at the registry, not just documented: a Mod-tier registry entry (§Layer 2a) is invalid unless its `producers` list contains at least one `component`-tier entry. An entry with zero Component producers cannot be registered as a Mod at all.
- What was previously "Addon" (v0.11) is now just a Mod with an additional flag — `reverse_dependents: []` required to stay empty. A Mod nothing else depends on is still a Mod; the flag just tracks that no other component has taken a hard dependency on it.

**Registry is a visual map, not just backend JSON (clarified):** the Layer 2a registry renders as a live dependency map — Components as the base layer, Mods layered visibly on top of the Component(s) they require. This is the actual mechanism for "does everything map correctly": if a node renders with no Component beneath it, that's a visible, immediate registry violation, not something you find at build time. Layer 5's Editor UI treats this map as a first-class view alongside the wiring canvas, not a debug tool bolted on afterward.

**Worked example (Memory System components, reclassified against the new rule):**

| Item | Tier | Why |
|---|---|---|
| Ring Buffer | Component | executable on its own — no other component required |
| Causal Graph | Component | same — a graph store runs standalone |
| Event Ledger | Component | same |
| Pattern Storage | Component | just a store, satisfies Memory System contract standalone |
| Signal-to-Noise Filter | Component | a standalone transform, no dependency required |
| Pattern Engine | **Mod** | cannot run without a Causal Graph/Event Ledger/Pattern Storage Component to operate on — textbook case of the rule |

**Why this matters for NEXUS hookup:** unchanged in spirit from v0.11 — a NEXUS subsystem onboards as a Mod against one or more CodeFactory Components, and the registry map makes that dependency visible immediately rather than needing bespoke integration tracking per subsystem.

---

## 2b. Determinism-Maximization & Reuse-First Mandate

A cross-cutting rule, not another layer — this governs how every layer above gets built and prioritized. Two mandates:

### Deterministic-before-AI, formalized
§Layer 0b already gates AI to three narrow triggers. This adds a **check that runs before any of those triggers can fire**: when the compiler hits an inference gap, it queries Pattern Storage (§7a) for a matching pattern *first*. A high-confidence Pattern Engine match resolves the gap deterministically — no AI invocation at all. AI-assist (trigger #1 in §Layer 0b) only fires when Pattern Storage has no match, or confidence is below threshold. This means every AI-assisted inference, once accepted, *becomes* a stored pattern — the system gets more deterministic over time, not statically so. AI usage should trend toward zero on a mature project as Pattern Storage fills in, not stay constant.

### Compiler passes, made explicit (not aspirational)
The Component Compiler (§7c) runs a fixed pipeline of deterministic passes before anything else is considered: **type-check → capability-check (§Layer 0a `CAPABILITIES`/`DENY`) → seam-validate (§Layer 2a acceptance criteria) → dead-code-eliminate → pattern-match (above) → [AI-assist only if still unresolved]**. Naming this pipeline explicitly is itself high-leverage: every layer that touches a Component routes through the same fixed sequence, so improving one pass improves every Component that ever compiles, retroactively.

### Reuse-First ingestion (Layer 3, elevated to a mandate, not just one more source)
"Existing NEXUS/MASTERMIND subsystem" is added as a **first-checked** Catalog ingestion source (§Layer 3), ahead of OpenAPI/CLI/npm ingestion, not alongside them. Before authoring any new CodeFactory Component or Mod, the build process checks: does a NEXUS/MASTERMIND subsystem already fulfill this Seam contract? This session is the proof of concept — `emerge`, `guardian`, `ClearGlass`, `seam-block.spec`, `blueprint-index`, `loom`, and CFR/sigma were all reused, not invented, and every one of those reuses was higher-leverage than building fresh would have been.

### Build order by leverage, not just by layer number
§5's Phase Plan is bottom-up by layer, which is correct for dependency order — but *within* Phase 4, leverage should override strict layer-number order: the Component Compiler, Registry (§Layer 2a), and Seam contracts are the highest-leverage build targets, since every other Component and Mod routes through them. Editor UI polish (§Layer 5) is correctly last not just because it's numbered last, but because it's the lowest-leverage layer — nothing else depends on it.

---

## 2c. Sigma Similarity & Evolution Engine (NEW — merged from the §2c addition)

> Placed here per the §2c author's instruction: immediately after §2b, because it is the mechanism that makes "reuse-first" actually compound over time. It touches Catalog, Pattern Engine, Decomposition, and Ollama — a cross-cutting subsystem, not another layer.

A cross-cutting intelligence layer governing pattern discovery, component similarity, catalog deduplication, and evolutionary promotion.

Sigma is extended from measuring system *drift* (§2a) into measuring structural *relationships* between artifacts.

- The existing **Sigma Drift** model answers: *"How much did this system change?"* (current state → baseline).
- The **Similarity Engine** answers: *"How much does this discovered artifact resemble something already known?"* (artifact A ↔ artifact B).

**These are separate measurements and MUST NOT share the same scalar.**

### Sigma Similarity Vector

Every decomposed Blueprint, Component, Module, or external artifact receives a similarity fingerprint.

```json
{
  "artifact_uuid": "",
  "comparison_target": "",
  "sigma": {
    "structure": 0.0,
    "interface": 0.0,
    "behavior": 0.0,
    "dependency": 0.0,
    "semantic": 0.0,
    "usage": 0.0
  },
  "combined_score": 0.0,
  "confidence": 0.0,
  "timestamp": ""
}
```

| Dimension | Purpose |
|---|---|
| σ_structure | AST/IR/component topology similarity |
| σ_interface | Socket, hook, seam, and contract similarity |
| σ_behavior | Test behavior, guarantees, runtime outcomes |
| σ_dependency | Dependency graph similarity |
| σ_semantic | Intent/guarantee similarity from Blueprint and CODEX Language |
| σ_usage | Frequency and recurrence across observed systems |

### Similarity Calculation — weighted by purpose (no universal weight)

**Duplicate Detection** — *"Is this probably the same thing?"*
```
σ_behavior 35%  σ_interface 30%  σ_structure 20%  σ_dependency 10%  σ_semantic 5%
```

**Module Promotion** — *"Has this pattern appeared enough to become reusable?"*
```
σ_usage 35%  σ_interface 25%  σ_semantic 20%  σ_structure 10%  σ_behavior 10%
```

**Architecture Discovery** — *"What larger design patterns exist?"*
```
σ_semantic 30%  σ_dependency 25%  σ_interface 20%  σ_usage 15%  σ_structure 10%
```

### Catalog Evolution Pipeline

External artifacts do not enter the trusted catalog directly. They follow a promotion path:

```
External Artifact → Decomposition Engine → Candidate Blueprint → Sigma Similarity Scan
   → Existing Match?  ── Yes → Merge
                      └─ No  → Create Candidate → Pattern Storage → Evidence Accumulation → Catalog Promotion
```

### Promotion States

| State | Meaning | Example evidence |
|---|---|---|
| Observed | Found externally | 1 repository |
| Candidate | Decomposed but unverified | — |
| Pattern | Repeated structure detected | 12 repositories |
| Component | Verified reusable unit | tested + seam validated |
| Module | Proven composition of components | reused successfully |

Promotion requires **evidence**, not just similarity.

### Pattern Discovery Loop

The local model is **not** responsible for discovery. The deterministic pipeline finds candidates; Ollama performs bounded synthesis only.

```
Decomposition Engine → Sigma Similarity Engine → High-confidence clusters
   → Ollama Analysis → Blueprint proposal → Human/system validation → Catalog update
```

Ollama receives: existing patterns, the candidate cluster, seam contracts, guarantees. It does **not** receive the entire internet or repository universe. (This composes with §Layer 0b chunking + cascade order — smallest/most-sovereign model first.)

### Similarity Cluster Storage (Pattern Storage extension)

```json
{
  "pattern_uuid": "",
  "members": ["artifact_uuid"],
  "sigma_centroid": { "structure": 0.0, "interface": 0.0, "behavior": 0.0, "semantic": 0.0 },
  "occurrence_count": 0,
  "promotion_state": "observed|pattern|component|module"
}
```

The catalog gains memory of *why* something became reusable.

### Anti-Generalization Guard

Similarity does not imply equivalence. A merge requires **all four**: (1) interface compatibility, (2) guarantee compatibility, (3) seam validation, (4) behavioral evidence.

Worked example — two `validateUser()` components with `σ_structure = 0.95`, `σ_semantic = 0.30` → **do not merge.** Shape similarity without intent similarity is rejected.

### Relationship to Existing Sigma Drift (keep strictly separate)

| | Drift Sigma | Similarity Sigma |
|---|---|---|
| Measures | Current State → Baseline | Artifact A ↔ Artifact B |
| Used for | registry changes, topology changes, system stability | deduplication, clustering, pattern discovery, catalog growth |

> **NEXUS cross-reference (v0.16):** this drift-vs-similarity split maps onto NEXUS's OB10 sigma-role insight — one `computeSigma` score serves multiple roles depending on the consuming component's declared intent. CodeFactory's two sigmas are the same principle: one computation, interpreted by purpose. A NEXUS component's `sigma_intent` declaration is where it would state which reading it means.

---

## 3. System Architecture (Bottom-Up, §3.1)

```
Layer 0: AST Core Engine
Layer 0a: CODEX Language — semantic DSL, third view of the IR
Layer 0b: AI Minimization Pattern — bounded, optional, never load-bearing
Layer 1: Language Backend Plugins (codegen + parse, per language)
Layer 2: Block/Wire/Hook Runtime (the visual object model)
Layer 2a: Component & Consumer Registry + Sigma Drift Detection
Layer 3: Universal Component Catalog & Index
Layer 3.5: Module & Template Library (built on the Catalog)
Layer 4: Build/Test/Package Pipeline
Layer 5: Editor UI (canvas, inspector, code-sync view, catalog browser)
Layer 6: Project/Workspace Shell (files, git, settings)
Layer 7: Systems Layer — multi-service orchestration
```

Scope: CODEX is no longer "one project, one language." End-state is **full-system builds** — multiple services, multiple languages, infra, deployment — all wired from one canvas, all sourced from one searchable catalog. Build order follows this stack strictly — data/schema/infra before UI (NEXUS FORGE axiom: builder first gate).

---

## 4. Layer Specs

### Layer 0 — AST Core Engine
- Central, language-agnostic intermediate representation (IR). All blocks ultimately resolve to IR nodes.
- Bidirectional: text edits reparse into IR → blocks update; block edits regenerate text.
- IR is the single source of truth (§10.3) — blocks and text are two views, never two states.

### Layer 0a — CODEX Language (Semantic DSL)

A third representation, sitting between blocks and target source: **not human syntax like Python, not raw AST — a small, semantic intermediate language.** Blocks ⇄ CODEX Language ⇄ Target Code are three synchronized views of the same IR (§Layer 0), not three separate systems.

**Role boundary:** CODEX Language is written directly by a human, generated by the block canvas, *or* emitted by an optional small LLM acting as a planner. All three are equally valid clients of the same parser → IR pipeline. The no-AI path (blocks or hand-written DSL) remains fully sufficient on its own — an LLM is a bonus producer of this text, never a required one. Any AI involvement here is governed by the minimization contract in §Layer 0b.

**The 13 primitives** (everything else is composition — no grammar growth beyond this set without a Phase 2 Hostile Review):

| Primitive | Meaning | Maps to |
|---|---|---|
| `THING` | An entity/model | Component/module Block, IR kind=class |
| `HAS` | An attribute | Socket/field on a Block |
| `CAN` | A capability/action | Callable Block, IR kind=function |
| `STATE` | Something stateful | Stateful Block (e.g. Session) |
| `EVENT` | Something that happens | Hook bus topic |
| `ON` | Event → response binding | Wire from Event to Flow |
| `FLOW` | An ordered sequence of steps | Composition of Blocks, IR children |
| `RULE` | A constraint | Constraint on a Wire or socket type |
| `REQUIRE` | A precondition | Wire that must resolve before Flow proceeds |
| `HANDLE` | Compiler-enforced failure branch | Required alternate Wire for a REQUIRE |
| `LINK` | A relationship between THINGs | Wire between component Blocks |
| `SERVICE` | A module/system boundary | Module Block (3.5) or Systems node (Layer 7) |
| `TEST` | An assertion | Layer 4 test-stage entry |

**Exhaustiveness is language-enforced:** any `REQUIRE` without a matching `HANDLE` is a compile-time error (§1.2, enforced at the grammar level).

**Temporal semantics (resolved, Hostile Review v0.6):** TIME is not a 14th primitive. Scheduling, expiration, retry/backoff, and leases are constraints on when a FLOW is valid to run or a STATE is valid to hold — a `RULE` subtype, not a new grammar category:
```
RULE Expire(Session, after: 30m)
RULE Retry(Payment, backoff: exponential)
RULE Schedule(ReportJob, every: 1h)
```

**Semantic IR constraint (hard rule):** IR nodes must represent *intent and guarantees*, not reconstructed syntax. `function verifyUser()` is a failure; `Guarantee: User identity verified before payment execution` is correct. Every Layer 0a primitive must compile to a guarantee-shaped IR node — a Phase 2 Hostile Review gate.

**Capability budgets on `SERVICE`:** declared authority, compiler-enforced at wire-connect time:
```
SERVICE Payment
CAPABILITIES
    network.external
    database.write
    secret.access
DENY
    filesystem.root
```
Ties into Layer 3's `sandbox_requirements` and Layer 4's per-stage sandboxing. A block exceeding its `SERVICE`'s budget is a compile-time rejection.

**Inference scoping (bounded, not "full magic"):** the compiler infers schema/routes/validation only where convention is unambiguous. Anything ambiguous requires an explicit annotation block rather than a guess — wrong inference is worse than no inference (§1.2).

**Persistence:** CODEX Language source is a first-class artifact — `.codex/lang/*.codex` files, git-diffable, parsed into IR like target source.

### Layer 0b — AI Minimization Pattern (precedent: NEXUS `emerge`/`guardian`)

**Governing principle:** the AI provider, if used at all, is a lossy transform function. The deterministic system — parser, compiler, IR, catalog — is the state machine and the source of truth. AI never gets write access to the IR directly; its output is untrusted input that must pass validation before it becomes a Block, Wire, or IR node.

**Three legitimate AI triggers:** (1) filling a bounded-inference gap flagged by the compiler — AI suggests, user confirms, never auto-applies; (2) optional planner emitting CODEX Language text — never target source directly, always through the same parser; (3) ingestion assist — output passes the same typed-socket validation as any manifest.

**Chunking discipline (from `emerge/chunk`):** AI never gets a whole project/service/module — one unit, one block's worth of scope, hard token budget, direct dependencies only, never transitive closure.

**Reply validation (from `emerge/compiler/reply-engine.js`):** AI output is schema-validated against IR/Block/Wire schemas before acceptance; malformed output triggers retry-by-shrinking, not a bigger prompt.

**Cascade order (from ClearGlass):** smallest/most-sovereign model first, escalating only on failure — local/small primary, larger as secondary, never the reverse.

**Visible status, no silent invocation; exchange audit trail:** every AI call surfaces start/end status; every prompt/response pair persists to the event log (§7.4) regardless of validation outcome (§0.3 — even failed attempts are evidence).

**Chunk budget is per-provider:**

| Provider | Chunk budget |
|---|---|
| ChatGPT | 900 tokens (hard cap) |
| Claude | Higher — larger context tolerance |
| Gemini | Effectively unlimited — long-context native |

Chunking is *scope-first* (one unit); the token budget is a secondary ceiling. A larger window means more headroom for the same scope, not more scope.

**Runtime discipline:** lazy boot (on first need, never eager); process-level zero-access sandbox; serial invocation (one call in flight per provider); warm sessions are an optimization never a dependency; named failure not silent hang.

### Layer 1 — Language Backend Plugins
- Each language = a plugin exposing `parse(text) → IR`, `generate(IR) → text`, `lint(IR)`, `typecheck(IR)`.
- v1 target set: JS/TS, Python, Rust, Go. Others as plugins, not core rewrites.
- Plugin contract is versioned and UUID-tracked.

### Layer 2 — Block/Wire/Hook Runtime
- **Block**: typed node with input/output sockets, a UUID, an IR-generation template, a hook table.
- **Wire**: the *space* data travels through between component hooks — a channel with capacity/latency/protocol, hard-typed at both ends (§1.2 — type mismatch is a rejection, never silent coercion).

**Wire taxonomy:**

| Category | Wire type | Tier | Notes |
|---|---|---|---|
| Storage | Database | Mod | SQL/NoSQL adapters |
| Storage | DOM storage | Mod | browser-context |
| Storage | Device storage | Mod | local filesystem |
| Network | API | Mod | REST/GraphQL/gRPC — also a Layer 3 ingestion source |
| Entry Point | CLI | Core contract, Mod impl | see handshake |
| Entry Point | GUI (HTML/Electron) | Core contract, Mod impl | see handshake |

**Entry Point handshake:** an Entry Point Wire isn't "open" until a capability-exchange handshake completes — ties into `SERVICE CAPABILITIES/DENY`. An entry point with no completed handshake is inert by construction.

- **Hook**: named lifecycle/event attachment points (onMount, onError, onChange, custom), publishing to the global bus — the visual "nervous system" lane.
- **Bus lane**: a dedicated canvas view showing all cross-module hook→event traffic live.

**This bus is WARP, not a parallel design:**

| CODEX concept | WARP primitive |
|---|---|
| `EVENT` primitive / Hook publish | Event |
| `REQUIRE`/`HANDLE` checkpoint | Gate |
| `RULE` (including TIME subtype) | Axiom |
| §7.4 persisted event log | Stream |

CODEX implements this shape zero-dependency, native to CODEX (not a runtime import). *(Gate/Axiom semantics inferred from NEXUS context — confirm before Phase 2 locks.)*

### Layer 2a — Component & Consumer Registry + Seam Contracts + Sigma Drift Detection (v0.13)

Answers three questions Layer 2 can't: *does everything map correctly*, *what's guaranteed at each boundary*, *how do we know when it stops*. Adopts NEXUS integrity/sigma and the **Seam Block spec** directly.

**Registry entry (v0.13 — one-write-authority fix):**
```json
{
  "component_uuid",
  "type": "block | service | catalog_entry | interface",
  "tier": "component | mod",
  "hooks_published": ["hook_uuid"],
  "hooks_subscribed": ["hook_uuid"],
  "consumers": ["component_uuid"],
  "producers": ["component_uuid"],
  "last_verified": "timestamp"
}
```
Wires are queried *from* the separate Wire Registry (owns all edges exclusively), never stored on the component entry. `type: interface` = CLI/REPL/admin/debug surfaces: registered, never a canvas drag target.

**Seam — the deterministic boundary contract (from `seam-block.spec`):**
```json
{
  "seam_uuid", "boundary_name",
  "side_a": "component_uuid", "side_b": "component_uuid",
  "acceptance_criterion", "mock_ref",
  "contract_version", "fault_codes": []
}
```
**Recommendation:** adopt `seam-block.spec` as canonical, with a `seam-block.codefactory.spec` derivative — same relationship `seam-block.nexus.spec` has to canonical. Avoids a second, incompatible seam schema. Fault taxonomy: canonical defines SEAM_001–015; CodeFactory needs a derivative range (SEAM_1xx) — TBD Phase 3.

**Capability model discrepancy (flagged):** §Layer 0a specs allow-list + deny-list; established `comp_inter` convention is deny-only (default allow). A real tradeoff, resolve before lock.

**Consistency enforcement (compile-time):** dangling wire → error; unregistered hook → error; consumer/producer symmetry required or registry is corrupt (flagged, never auto-fixed); **mod-requires-component** (zero component producers on a mod = invalid, cannot register); seam acceptance criterion unmet → build-blocking.

**Sigma — drift measurement (NEXUS-derived starting values):**

| Change type | Sigma |
|---|---|
| No drift | 0.0 |
| Single component/block content change | 0.2 |
| Registry change | 0.5 |
| Wire topology change | 0.72 |
| Both registry and wire topology changed | 0.90 |

Thresholds: gap open >0.70, regime collapse <0.25, delta tension (rate of change) >0.75. Baseline-before-diff (§2.1): snapshot writes before any sigma diff is acted on. Regime classification: `stable`/`degraded`/`collapsing`/`oscillatory` (the last catches add/remove churn that reads as low net drift but high oscillation). *(Numbers inherited from NEXUS, not re-derived for CODEX — confirm before Phase 2.)*

### Layer 3 — Universal Component Catalog & Index

The single searchable index of everything CODEX knows how to wire in. Every entry UUID-tracked with a consistent schema.

**Catalog entry schema:**
```
{ uuid, name, category, source_type, version,
  input_sockets[], output_sockets[], hooks[],
  ir_codegen_template, docs_ref, sandbox_requirements }
```

**Categories:** language primitives, components & modules, CLI tools, APIs, infra primitives, deployment targets, third-party packages.

**Ingestion pipelines:**

| Source | Method | Output |
|---|---|---|
| OpenAPI/Swagger/GraphQL | Schema parse → typed sockets | One block per endpoint |
| CLI tool | `--help`/man parse or manifest | One block per subcommand |
| npm/PyPI/crates.io | Package introspection | One block per public export |
| Docker/Compose/K8s | Manifest parse | Infra/deployment block |
| Existing user project | Reverse-scan via Layer 1 parser | User functions become catalog blocks |
| Manual manifest | Hand-written schema | Author-flagged entry |

**Rules:** nothing enters without a resolved socket type (§1.1); ingested entries versioned against source (§1.2); wrappers execute in the Layer 4 sandbox only (§4.3); catalog browser supports search/tag/category/used-in-project filtering at any scale.

### Layer 3.5 — Module & Template Library
Atomic blocks; component blocks; module blocks (pre-wired subsystems, editable never opaque); project templates (full running scaffolds, placeholders flagged never silently stubbed §1.3); user-authored blocks (schema-defined — self-extending).

### Layer 4 — Build/Test/Package Pipeline
Stages **Builder → Compiler → Test Env**, each sandboxed independently. Live compile-on-drag. Every build error surfaces as a user-facing prompt tied to the offending block/wire (§1.2). Dependency graph view generated from IR.

### Layer 5 — Editor UI
Canvas (blocks + wires), Inspector, Code-Sync pane (live editable source). Visual theme editor for UI targets. CLI panel for CLI-native toolchains.

### Layer 6 — Project/Workspace Shell
Git-native (every mutation a diffable IR/text unit). Full-project export only. Living docs auto-updated.

### Layer 7 — Systems Layer (multi-service orchestration)
Service canvas (each project → a service node, wires = real HTTP/MQ/DB/gRPC contracts). Cross-language wiring via typed API contract blocks. Infra-as-code generation (Docker Compose/Terraform/K8s, IR-backed). System-level dependency graph. Per-service → system-level deployment pipeline, sandboxed per stage.

---

## 5. Phase Plan (FORGE-SKILL)

| Phase | Deliverable |
|---|---|
| 0 — Orient | This doc |
| 1 — Brainstorm | Block taxonomy draft, language plugin priority, UI wireframes |
| 2 — Hostile Review | Six Lenses on IR design, wire-type-safety, plugin contract |
| 3 — Spec | Formal IR schema, block schema, hook/bus contract, plugin API |
| 4 — Build | Layer 0 → 0a → 1 → 2 → 3 → 3.5 → 4 → 5 → 6 → 7, strict order, WARP+Jaa loaded |
| 5 — Test | Per-layer suite; IR round-trip (text→IR→text idempotency) is the critical suite |
| 6 — UI | Canvas/inspector/theme polish |
| 7 — Hostile Verify | Six Lenses on full system; adversarial wiring attempts |

---

## 6. Six Lenses — Pre-Build Pass (Phase 2 placeholder)

1. **Structural** — does the IR cover all target languages without lossy semantic compression?
2. **Failure** — malformed wire, circular dependency, plugin crash mid-generate?
3. **Security** — sandboxing boundary between Builder/Compiler/Test Env; no arbitrary execution outside sandbox.
4. **Sovereignty** — user always owns exportable, non-lock-in source.
5. **Persistence** — every block/wire/hook UUID-tracked and crash-recoverable (§2.1)?
6. **Clarity** — does the bus lane make cross-module flow legible, or become its own black box at scale?

---

## 7. Persistence & Memory Architecture

Persistence is the golden rule (§2.1). Every layer reads/writes through this substrate; nothing lives only in memory.

### 7.1 Storage Philosophy — hybrid, JSON as truth
Flat JSON files = source of truth (human-readable, git-diffable). Embedded SQLite = derived index, never authoritative (rebuildable from JSON; if they disagree, JSON wins, full rebuild §10.3). Same principle as JaaDB.

### 7.2 Memory Tiers

| Tier | Scope | Lives in | Persisted? |
|---|---|---|---|
| Working Memory | Open canvas, live IR, undo buffer | RAM | No — rebuilt on load |
| Project Memory | One project's blocks/wires/hooks/refs/file-map | `.codex/` JSON | Yes — git-tracked |
| Catalog Memory | Global component index | JSON + SQLite, user dir | Yes — versioned separately |
| System Memory (L7) | Service canvas, cross-service contracts | `.codex-system/` JSON | Yes — git-tracked |

### 7.3 Core Schemas
**Block**, **Wire**, **IR Node**, **Catalog Entry**, **Project Manifest** — as defined in the layer specs above. The IR Node schema is the codegen-critical one that must round-trip losslessly (`text → IR → text` idempotency = Phase 5 critical test).

### 7.4 Event Log — versioning & history
Every mutation is an append-only event (Event/Gate/Axiom/Stream shape). Gives undo/redo (replay-to-point), time-travel debugging, full audit of ingestion-vs-hand-wired, diffable history. Snapshots are periodic compactions of the log — log is the ledger, JSON is the checkpoint.

### 7.5 Disk Layout
```
my-project/
  .codex/
    manifest.json
    canvases/main.canvas.json
    events/2026-07-30.log.jsonl
    ir-cache/<ir_uuid>.json
    catalog-refs.json
  src/                # generated real source — normal repo, normal git diffs
```
`src/` is always the real compilable project; `.codex/` is recoverable metadata alongside it. Deleting `.codex/` loses editability but never the working software (§0.3).

### 7.6 Database Layer
SQLite: zero-infra, fast indexed queries, crash recovery. Tables mirror JSON 1:1, rebuilt via replay on version mismatch/corruption. Catalog at 10k+ entries leans on SQLite FTS + tag index; JSON stays the portable truth.

---

## 7a. Foundational Core Components (v0.12 tier labels)

**Memory System** (contract, not itself a component/mod): the shape any data structure must satisfy to plug into persistence.

**Causal Components (tier: Component):** Ring Buffer, Causal Graph (same shape as the §2a registry), Event Ledger (§7.4's log is an Event Ledger instance).

**Pattern Engine + Pattern Storage (the textbook tier split):** Pattern Storage (Component — just a store); Pattern Engine (Mod — detects recurring structure across a Causal Graph/Event Ledger; §2a `oscillatory` regime is a Pattern Engine detection; feeds Catalog promotion suggestions; **cannot exist without a Component to operate on**).

**Signal-to-Noise Filter (tier: Component):** sits in front of Pattern Engine + Layer 0b's AI chunk builder; filters raw events before surfacing (operationalizes CFR coherence/entropy). Everything still persists (§0.3) — it controls what's *surfaced*, not what's retained.

## 7b. Playground
Sandboxed surface for trying component combinations before committing. Ephemeral (Working Memory) unless promoted. Friction/tension tracking (CFR dimensions, in-the-moment, distinct from Sigma which needs a baseline). Promotion path: a clean-testing combination promotes into a real canvas and starts accumulating a Sigma baseline. **Seam-mock testing:** a Component can be tried against a Seam's `mock_ref` instead of the real `side_b` — test boundary behavior before the counterpart exists.

## 7c. Decomposition, Blueprint & Compiler + Rewind Engine

Adopts the real `component-registry → blueprint-index → loom` pipeline, generalized. Loom is already §Layer 2a's registry.

**Decomposition Engine (Component):** takes existing code / a running registry / unstructured input → one Blueprint per detected unit. Runs both directions (reverse: decompose; forward: author).

**Blueprint (spec format, from `blueprint_descriptors.jsonl`):**
```json
{ "blueprint_uuid", "component_ref": "component_uuid | null",
  "descriptor": { "intent", "inputs", "outputs", "constraints", "seam_refs": [] },
  "source": "decomposed | authored | ingested", "version", "root_hash" }
```
A Blueprint is not yet a Component — it's the descriptor the Compiler turns into one.

**Component Compiler (Blueprint → executable):** Blueprint → CODEX Language or IR → Layer 1 backend → real source. A Blueprint is the standard unit the Compiler accepts, whatever its source (still validated the same way, §Layer 0b).

**Blueprint Index (Mod — requires Catalog + Compiler):** derived, cross-project, searchable index of every Blueprint, auto-built on registry change. Feeds Catalog search + registry map with descriptor-level detail.

**Rewind Engine (Mod — requires the Event Ledger Component):** every committed snapshot gets a `root_hash` (content-addressing). `rewindTo(root_hash)` replays the Event Ledger to that hash. **Sigma interaction:** a rewind is a deliberate large-magnitude change — it must log as its own event type, not scored as organic drift, or the `oscillatory` detector misreads it as instability (Phase 3 Spec, explicit).

---

## 8. Open Questions (carry into Phase 1)

**From the base doc:**
- Which language plugin ships first — JS/TS or Python?
- Does the bus lane need its own zoom/filter model at >50 modules?
- How deep does component-block nesting go before a collapse view is needed?
- Standalone desktop (Electron) vs. web app?
- Catalog scale ranking/relevance model (partially answered §7.6 — SQLite FTS; ranking still open).
- Cross-language contract format at Layer 7 — OpenAPI-only, or also Protobuf/gRPC/MQ schemas?
- CLI ingestion: trust `--help` as authoritative, or require a stricter manifest for sandbox-touching tools?
- Event log growth: compaction/pruning policy, or full history retained (§0.3)?
- CODEX grammar lock: is 13 primitives sufficient (TIME resolved as RULE subtype)? Further additions need Phase 2 Hostile Review.
- WARP mapping confirmation (Event/Gate/Axiom/Stream) against WARP's real spec vs inferred context.
- Capability budget granularity (`network.external` grain vs per-endpoint/per-table).
- NEXUS subsystem onboarding: first real Mod integration test — `emerge` or `cortex`?
- Adopt `seam-block.spec` as canonical directly, or fold Component/Mod tiering back into canonical first?
- Capability model: allow+deny vs deny-only (`comp_inter`) — resolve before Phase 2.
- CodeFactory's SEAM_1xx fault-code derivative range — Phase 3 Spec.
- Rewind scope: single-Component, whole-Project, or both — and what happens to components added after the rewind point?
- Decomposition confidence: score or human-review gate before a decomposed Blueprint reaches the Compiler?
- Pattern-match confidence threshold (§2b): what score resolves an inference gap deterministically vs falling to AI-assist?
- Inference boundary: enumerated table of "unambiguous convention" cases before Phase 3.
- AI minimization tuning: does "scope-by-unit floor, token budget ceiling" hold, or do some providers need a scope cap too?
- Sigma re-derivation: validate the drift bands (0.2/0.5/0.72/0.90) and thresholds (0.70/0.25/0.75) against CODEX's actual shape.

**From the §2c Similarity Engine merge:**
- Should Similarity Sigma use fixed weights or **learned** weights from successful promotions?
- What minimum evidence count promotes an Observed pattern into a reusable Component?
- Should **failed merges be stored as negative patterns** to prevent repeating bad abstractions?
- Should similarity fingerprints be generated from IR only, or also include runtime traces/tests?
- Can Sigma clusters become training data for local Pattern Engine improvement **without** external AI?

---

## 9. Gap Closure Note (§16.1)

Nearest gap: no IR schema exists yet. Phase 1 starts there — block taxonomy and IR schema are prerequisite to everything else in Layer 0. The catalog entry schema (§Layer 3) is second-nearest. The CODEX Language 13-primitive grammar (§Layer 0a) is third — it must lock in Phase 2 Hostile Review before Phase 3 Spec, since the DSL, block schema, and IR schema must agree on the same concepts or §10.3 triggers between them.

The §2c Similarity Engine adds no new *nearest* gap — it's cross-cutting intelligence that only becomes active once the Decomposition Engine (§7c) and Catalog (§Layer 3) exist to feed it, so it sequences naturally after those, not before.
