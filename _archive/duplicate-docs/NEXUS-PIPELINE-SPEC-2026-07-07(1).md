# NEXUS — Full Execution Pipeline
### Copilot → Brainstorm → Idea → Spec → Idearium Repo → Contract/RAID → SEAM Queue → Agent → COS-Verify → Repo
Planning document. Checked against the actual tree in `nexus-updated-2-1.zip` (uploaded 2026-07-07), not assumed. Read alongside `NEXUS-VISION-SPEC-2026-07-06.md` — that doc maps the *substrate* (Ollama/Copilot/Guardian programmability). This doc maps one specific *flow* through it: a conversation becoming a verified, tagged commit.

---

## 0. The pipeline, restated

```
Copilot UI  →  Brainstorm  →  Idea  →  Spec  →  Idearium Repo
   →  Contract + RAID  →  SEAM Chunk Queue  →  Agent  →  Verify  →  Repo (tagged)
        ↑___________________________ loop back on FAILED/RETRYING _________________|
```

Every hop already has a real home in the codebase. Nothing below is invented — each stage names the file that does it today, and is marked **real**, **partial**, or **missing** rather than assumed working. The small-LLM optimization isn't a separate feature — it's a property of how stages 6–9 already route generation (WARP's cache→seed→cascade) and how the compiler already tiers token spend (T0–T3). Section 2 makes that explicit.

---

## 1. Stage-by-stage map

### Stage 1 — Copilot UI: getting to know each other, persistent memory, rewind

| Need | Real today | File | Status |
|---|---|---|---|
| One entry point, all channels | `POST /api/prompt` | `copilot/server.js` :3750 | **real** |
| Full context per turn | 7-layer context assembly (L0 bus, L1 telemetry, L2 provider health, L3 gaps+SEAM, L4 CFR-Ω, L5 memory+artifacts, L6 predictive intent) | `copilot/lib/copilot-context.js` (supersedes the old 5-layer `analysis.js` assembler — confirmed live import in `copilot/server.js`) | **real** |
| Every conversation stored | `chat_log` write per exchange | `copilot/server.js`, `cortex/boot.js` | **real** |
| Session start remembers last N | P103 — "last N chat_log injected at session start" | `copilot/server.js` line ~365 | **real, code-confirmed** |
| Real recall (not just recent) | `push()`/`recall()` — lexical + recency lanes scored for real | `cortex/push-recall.js` | **partial — 2 of 5 lanes** (causal, failure, bep lanes not built; need kernel causal graph, fix_map, bep_patterns table) |
| "All memory stays," redundant ledger | Every conversation turn also written to the append-only event ledger with `causedBy` chaining, so chat_log being cleared/corrupted can't lose history | `docs/copilot-system-programmer.spec` build order item 4 | **spec'd, not built** — this is the literal mechanism "all memory stays" needs and it's currently a proposal, not code |
| System-learning across sessions ("knowing this system," not just "remembering this chat") | `conditioning_log` entries written after every response involving a system | same spec, build order item 5 | **spec'd, not built** |
| **Rewind** | No dedicated rewind command on Copilot. The *pattern* exists elsewhere — Orchestrator's `GET /api/recall` is a read-only, filterable JSONL ledger replay (`orchestrator.js` :9000) | n/a | **missing on Copilot specifically** — closing this is straightforward once item 4 above lands: rewind = replay the redundant conversation ledger back to a given event ID and re-inject it as session context, same mechanism `/api/recall` already proves out for the orchestrator |

**Net for Stage 1:** the "get to know each other" loop (talk → stored → recalled next session) is real for the last-N-turns case. "Rewind to any point" and "system genuinely learns you over time, not just this chat" are both real gaps with a spec already written (`copilot-system-programmer.spec`) — build order items 4–5 are the two things to close first, because everything downstream (brainstorm quality, idea framing) depends on Copilot actually remembering *why* an idea came up.

### Stage 2 — Brainstorm

- `copilot/intuition.js` (fast faculty — reads Cortex patterns/crystals/sigma) and `cortex/intelligence/mastermind.js` (strategic faculty) are the two "voices" a brainstorm conversation actually draws on — **real**.
- `cortex/intelligence/adversarial.js` — probe + ping-pong, already run every 60s in production — is the honest stress-test step: an idea gets contested by a second faculty before it's taken seriously. **real**.
- `copilot/module-builder.js`'s `map()` step is the formalization boundary: it turns free-text ("I want copilot to do X") into a structured capability description, checking the capability-registry for "does this already exist" before anything gets built. **real.**

This stage is conversational by design — it's the one hop in the pipeline that's *supposed* to stay unstructured. It ends the moment `map()` (or an equivalent manual decision) produces a shape worth tracking.

### Stage 3 — Idea

- Idearium is literally the idea-tracking system: `idearium/index.js` (IdeaOS), ideas move through phases `seed → ... → building → complete` with causal ancestry between ideas. **real, mature.**
- `idea add "text"` on the CLI or the equivalent Copilot-side call creates the row. **real** (`idearium/cli/index.js`).

### Stage 4 — Spec

- `idearium/spec-engine/index.js` generates the `.spec` from an idea. **real.**
- The deterministic compiler that will eventually turn that `.spec` into code is `emerge/compiler/*` + `spec-compiler.spec` — see Section 2, this is the piece that makes small-LLM optimization possible at all.
- **CC-001** ("query Cortex before emitting; if it exists, skip") means a spec doesn't even get built if the capability's already there — checked against `cortex-query` module. **real, axiom-enforced.**

### Stage 5 — Idearium Repo

- `idearium/repo/index.js` (`RepoLayer`) — a spec + file tree becomes a tracked repo *idea*, with fork lineage (`parent` field). Old repos are archived, never deleted (§7.4). **real.**
- `idearium/repo/watcher.js` — watches `data/drop/` for zip drops or `.spec`-container drops, verifies SHA-256 before trusting a `.spec` container, ingests via `RepoLayer.ingest()`. **real**, including the fixed bug where corrupt `.spec` archives fail loud instead of partially ingesting.

### Stage 6 — Contract + RAID

- `lib/contract-queue.js` + `lib/contract-poller.js` — the declarative dispatch record and the 15s-tick poller that catches stuck contracts. **real.**
- `cortex/core/raid/index.js` v6.3.0 — two-layer routing: **Layer 1** (deny-only constraints: agent availability, `LAW_I` ollama-first for non-specialist clusters, `LAW_III` claude-API unconditional last resort) and **Layer 2** (fitness ranking: health, role-confidence from real recorded outcomes, topological proximity via CFR causal graph when wired). **real, no stubs** — confirmed against the file's own header, which is unusually explicit about what's real vs. neutral-default.
- This is the stage that decides *which* provider a SEAM chunk goes to before the chunk queue does anything — RAID is upstream of dispatch, not part of it.

### Stage 7 — SEAM Chunking Queue

- `lib/seam/queue.js` (`SEAMQueue`/`QueueCompartment`) — the canonical state machine: `QUEUED → INJECTING → GENERATING → DETECTING → VERIFIED | RETRYING → ESCALATED | FAILED`. Multi-strategy retry ladder + Detector-based verification. **real, this is Guardian's own chunk path.**
- `lib/seam/gates.js` v2.0.0 — five composable WARP-core gates: `RegistryGate → ClassifyGate → AxiomGate → CascadeGate → PersistGate`. Migrated onto WARP's real `Event`/`Gate`/`Stream` primitives this session (async-transform support added and test-regressed, 18/18 Loom tests + 4 new). **real.**
- `idearium/spec-engine/chunk-dispatch.js` — wraps Idearium's own chunk-build call (previously one-shot, no retry, no quality check) inside the same `QueueCompartment` retry ladder Guardian uses. **real, closed a genuine gap** (a chunk could get marked `queued` and silently abandoned in `BUILDING` state forever before this — zero callers of the completion endpoint existed anywhere in the codebase, confirmed by grep).
- `lib/seam/chunk-lifecycle.js` — Idearium's own `CHUNK_STATES` (`pending/building/verifying/complete/failed/escalated`) and SEAMQueue's canonical states are **two real, still-separate state machines**, bridged by a translation table so cross-system reporting works. The deeper merge (giving Idearium's cruder attempt-counter the same escalation ladder natively, not through a wrapper) is **flagged as open, not done.**

### Stage 8 — Agent

- `idearium/agent-suite/index.js`'s `buildChunkWithAgent()` is the actual network call — dispatches to whichever provider RAID/the queue selected. **real.**
- Provider priority follows the LIFELINE pattern: Ollama (local, sovereign, zero cost) first, Guardian NCP (claude/chatgpt/mistral/gemini) as fallback on low confidence or failure — `copilot/lifeline.js`, same pattern reused. **real for Copilot's own dispatch; Idearium's chunk dispatch reuses the same priority order via the two dispatch adapters below, not a separate implementation.**

### Stage 9 — Verify → Repo, tracked and tagged

This is the stage that most needed checking, because "COS verifies" is not literally true today.

- **What's real:** `lib/seam/gates.js`'s `ClassifyGate`/`AxiomGate` + the Detector-based verification in `chunk-dispatch.js` — an agent's output is checked against hard axiom gates and a heuristic Detector *before* it's marked `VERIFIED`, not trusted on arrival. This is the actual "does the output pass" gate, and it already runs in the pipeline (Stage 7).
- **What's real for tracking/tagging:** **Versionium** — confirmed live, not just conceptual: `cortex` exposes `POST /api/versionium/commit`, `GET /api/versionium/log`, `POST /api/versionium/snapshot`; `emerge/cortex-query/writeback.js` does one Versionium commit per compiler run; Orchestrator's `nexus push "message"` CLI command triggers "snapshot + versionium." `spec-compiler.spec`'s own axiom **CC-005** ("every emitted file registered with Cortex via versionium after write") is implemented, not aspirational.
- **What's NOT real:** **Compartment OS (COS) itself is standalone and not integrated** — this is stated plainly in its own spec: *"status: current: standalone — not integrated into NEXUS services"*, *"future: may be merged as a compartment/sandboxing layer in NEXUS v0.7+."* COS's actual value-add for this stage would be running the newly-generated chunk inside an isolated compartment (sandboxed exe-runner/ai-agent archetype) — i.e. *executing* the code to verify it behaves, not just pattern-checking the text — and that capability has no wire into the SEAM/Idearium path today.

**Honest summary of Stage 9 today:** verify-then-commit is real (Detector + Versionium). Verify-by-*sandboxed-execution* (what "COS verifies" implies) is not — COS exists as a mature, tested, standalone system (157/157 tests) with zero live integration. Treat "agent → COS verify → repo" as the target state, and "agent → Detector/axiom-gate verify → Versionium-tagged repo write" as what's actually running right now.

---

## 2. Small-LLM optimization — the real mechanism, not a plan

This isn't something to add on top. It's already how Stages 4, 7, and 8 spend tokens, and the discipline comes from two places: the spec-compiler's tiering and WARP's dispatch cascade.

### 2.1 Spec-compiler tiering (`emerge/compiler/*`, `spec-compiler.spec`)

```
T0  Structure emission     — 0 tokens.  Deterministic tree/files/exports from the spec alone.
T1  Scaffold emission      — 0 tokens.  Typed stubs, gate wiring, test skeletons. Open Cortex gaps
                              become GAP comments in the file — the model sees exactly what's
                              missing, nothing else.
T2  Logic gap fill         — max 800 tokens.  One KGNode = one chunk = one node. Model:
                              qwen2.5-coder:1.5b (small, local, GTX 1650-class hardware).
T3  Complex reasoning      — max 2000 tokens.  Multiple KGNodes, broader context. Model:
                              mistral:7b-instruct-q4_K_M or an NCP provider — only reached when
                              T2's narrow context genuinely isn't enough.
```

Two axioms make this a real constraint, not a guideline: **CC-003** (chunk token budget enforced, hard ceiling per tier) and **CC-004** (one chunk = one node, no flooding — a small model is never handed more context than one node's worth). The compiler literally cannot ask a small model to do a large model's job; it escalates tier, not context size, when T2 fails.

### 2.2 WARP's unified dispatch (`warp/dispatch/*`, `idearium/spec-engine/warp-build-dispatch.js`)

Before any model call, three cheaper options are tried in order:

```
1. exact_cache     digest = hash(gate signature + active axioms + event shape).
                    Hit = zero-cost reuse, no model call at all. Content-addressable,
                    Bazel/Buck2-style — provable match, not fuzzy similarity.
2. population_seed No exact digest, but a scored archive of prior variants for this
                    gate-class exists. The fittest variant is passed as an analogue/seed
                    — never copied verbatim — so the small model isn't generating cold.
3. cascade_generate Cheapest capable model attempts first. Output must conform to the
                    gate's declared structured schema (the single largest lever on
                    rework-token cost, per WARP's own spec notes).
```

`idearium/spec-engine/warp-build-dispatch.js` wires this directly into Idearium's chunk builds (previously it went straight to Guardian's agent suite with zero caching). One real correction worth keeping in mind: the exact-cache isn't populated after a single success — `warp/dispatch/population.js`'s `DEFAULT_PROMOTE_THRESHOLD` is 3. A chunk has to be independently regenerated and pass a fitness floor three times before it crystallizes into an instant cache hit — real evolutionary retention (AlphaEvolve pattern), not simple memoization.

### 2.3 What this means for the pipeline as a whole

A chunk that reaches Stage 7 goes: **cache check → population-seed check → small local model (T2, ≤800 tok) → escalate to larger model only on repeated failure (T3, ≤2000 tok) → NCP fallback only if T3 also fails.** Every step before "small local model" costs zero tokens. The only way a chunk reaches an expensive model is if a cheap one already tried and the Detector rejected the result — escalation is earned, not default.

---

## 3. End-to-end trace — one idea through all nine stages

1. **Copilot UI** — you describe something in conversation. 7-layer context is assembled from Cortex; the exchange writes to `chat_log`.
2. **Brainstorm** — Intuition + Mastermind respond; Adversarial optionally contests it. `module-builder.map()` checks the capability-registry — does this already exist?
3. **Idea** — if genuinely new, `idearium/index.js` creates an Idea row, phase `seed`.
4. **Spec** — `idearium/spec-engine/index.js` generates the `.spec`. CC-001 queries Cortex first; if the capability's already built, this stage is skipped entirely.
5. **Idearium Repo** — the spec + any tree becomes a tracked repo via `RepoLayer.ingest()`, fork lineage recorded.
6. **Contract + RAID** — a build contract is written (`lib/contract-queue.js`); RAID's two-layer engine picks a provider — constraint-filtered, then fitness-ranked, Ollama-first by `LAW_I`, claude-API as unconditional last resort by `LAW_III`.
7. **SEAM Chunk Queue** — the spec is broken into chunks (one KGNode each). Each chunk enters `QUEUED`, WARP's dispatch checks cache → population seed → cascade before any real generation happens.
8. **Agent** — `buildChunkWithAgent()` actually calls the chosen provider (small local model first, per RAID + WARP's cascade).
9. **Verify → Repo** — the Detector/axiom-gate checks the output (`DETECTING` state); on pass, `VERIFIED`, and a Versionium commit tags the write with a real, queryable version record. On fail, `RETRYING` against the ladder, then `ESCALATED` to a bigger model or a human, never silently dropped.

---

## 4. Gap map — what to actually build, dependency-ordered

Ordered so each item only needs what's above it, same discipline as the Vision Spec's build order:

1. **Redundant conversation ledger** (Stage 1, `copilot-system-programmer.spec` build item 4) — every chat_log write also lands in the event ledger with `causedBy` chaining. This is the prerequisite for real rewind and is small: one additional write path, no new subsystem.
2. **Rewind command on Copilot** — once (1) exists, rewind is "replay the ledger to event ID N, re-inject as session context" — the exact pattern `orchestrator.js`'s `/api/recall` already proves works, just needs a Copilot-side route and a UI affordance.
3. **conditioning_log / system-learning** (Stage 1, build item 5) — makes Copilot's memory about *systems*, not just *conversations*. Needed before Stage 2's brainstorm quality can meaningfully improve session over session.
4. **chunk-lifecycle deep merge** (Stage 7) — SEAMQueue and Idearium's `CHUNK_STATES` still duplicate the same state machine behind a translation shim. Real merge means Idearium gets SEAMQueue's full escalation ladder natively, not through a wrapper — a multi-hour refactor touching two working systems, scope it as its own pass.
5. **COS integration** (Stage 9) — the biggest real gap in this whole pipeline. Two honest options: (a) accept Detector+Versionium as "verification" permanently and drop the COS framing, or (b) actually wire COS's compartment/sandbox model in as an execution-verification stage — run the generated chunk in an isolated `ai-agent`/`exe-runner` compartment before it's marked `VERIFIED`, not just pattern-check it. Option (b) is the only way "COS verifies" becomes literally true; it's also the largest single piece of new integration work in this document. COS's own spec already flags this as its intended future ("may be merged as a compartment/sandboxing layer in NEXUS v0.7+") — this pipeline is the concrete use case that would justify doing it now rather than later.

---

## 5. Open questions

- **Rewind scope:** rewind the conversation only, or rewind conversation + any Idea/Spec/Repo state that conversation caused? The ledger's `causedBy` chains make the second version possible, not just the first — worth deciding before building (1)/(2) above, since it changes what "replay" has to touch.
- **COS integration depth:** does every chunk get sandboxed execution, or only chunks above some risk/complexity threshold (mirroring RAID's own tiered fitness model)? Sandboxing everything is safest and slowest; a threshold reintroduces the "trust a pattern-check" gap this section exists to close, just for a smaller set of chunks.
- **Cache staleness across the promote threshold:** WARP's population store requires 3 independent successes before a chunk crystallizes. If an axiom set changes between those 3 attempts, does the count reset? (`warp.spec`'s digest already includes the active axiom set, so a genuine axiom change produces a new digest and starts a fresh count — worth confirming this is the actual behavior, not the intended one, before relying on it at scale.)

---

*Checked directly against the uploaded tree (`nexus-updated-2-1.zip`, `guardian-server_1_.js`, `NEXUS-VISION-SPEC-2026-07-06.md`) on 2026-07-07. Where a claim above isn't marked real/partial/missing with a file path, treat it as unverified.*
