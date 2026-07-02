# NEXUS — Branching Decision Loop (Copilot → COS → LOOM → Idearium)
**Author:** James Brooks (Erosmancer) + Claude
**Generated:** 2026-07-02
**Status:** spec — no code written this session, per explicit instruction
**Scope:** "Ask Copilot something it doesn't know → pick the relevant system → contain it in COS → trial-and-error → fork multiple COS branches to simulate outcomes in parallel → pick the best or synthesize the invariants."
**Convention:** every ✓/⚠/✗ below is read from real source this session, not assumed. This spans four systems on purpose — Copilot, COS, LOOM, Idearium — none of them own this loop alone, per the correction that this is not LOOM-only.

---

## Part 1 — What Already Exists (grounded, not assumed)

| Piece | Status | Evidence |
|---|---|---|
| Filesystem-level branch/fork of a compartment | ✓ real, mature | `cos/playground/branch.js` — `BranchEngine.fork(compartment, label?)` copies the compartment's `fs.root` into an isolated `.nex/branches/{branchId}/`, writes a manifest (`id, label, parentId, forkedAt, snapshotHash`). Not marked `unintegrated`. |
| Run a branch and compare it to another | ✓ real, but pairwise only | `cos/playground/compare.js` — `_diffOutput`, `_analyseRegression`, `_verdict` all take exactly two runs (A, B). **No N-way comparison exists.** |
| Pick-the-best-of-N or synthesize-common-invariants-across-N | ✗ NOT BUILT | Confirmed by reading every function in `compare.js` — nothing there scores or ranks more than two branches, nothing extracts what's true across a set. This is real, new logic, not a wiring task. |
| Sandboxed execution of a branch | ✓ real | `cos/playground/sandbox.js`, `SandboxRunner`, referenced by both `branch.js` and `compare.js`. |
| CLI surface for branch/compare | ✓ real | `cos branch fork/list/diff/run/show/rm/checkout`, `cos playground <...>` — but this is a human-operated CLI today, not a programmatic entry point Copilot calls. |
| Event-level replay with side-effect containment | ✓ real, but a *different* layer | `unintegrated/rfr2-nexus/clip/index.js` (`snapshotRange`/`restoreClip`/`validateClipStability`) + `adapter-sandbox/index.js` (READ_ONLY/LOCAL_ONLY/FULL side-effect policy, enforced immutably at registration, nulled in replay). This operates on **event causal subgraphs**, not filesystems — complementary to COS's branch engine, not a duplicate of it. Lives under `unintegrated/`, confirming it's genuinely not wired anywhere yet (Phase 109, "Epistemic Branch Runtime," already named this exact combination — `sourced`, not built). |
| "Is this known or do I need to figure it out" gate | ⚠ PARTIAL, reusable | `copilot/lifeline.js`'s `_estimateConfidence()` — already a real heuristic that escalates below a 0.75 threshold. It answers "is Ollama confident," not "does anything in NEXUS already know this" — narrower than what's needed, but the right shape to extend, not replace. |
| Pick "the relevant system" for a question | ✓ real, reusable as-is | This is exactly what LOOM's registry (`component`/`hook` lookup, Phase 131) and the Orchestrator's federated `/api/*` surface both already do — a question about "parsing" resolves to whichever component declares parsing-shaped hooks. No new mechanism needed here. |
| Learning from outcomes across sessions | ✓ real, deliberately conservative | `lib/reflection.js` (Phase 11) — aggregates satisfaction signals, opens a gap when a pattern crosses a threshold, **never auto-mutates** RAID weights or the identity kernel directly. This session's design should inherit that same conservatism, not bypass it. |
| Durable capture of a resolved "figured it out" answer | ✓ real, unused for this purpose | `idearium/repo/index.js` + `idearium/spec-engine/index.js` — already the mechanism for turning an ephemeral resolution into a tracked idea/spec with lineage. This is the "not just LOOM, this is Idearium too" piece — LOOM's contract registry tracks the *attempt*, Idearium is where the *resolution* becomes permanent knowledge. |

**The honest read:** roughly 70% of the mechanism already exists, mature, and doesn't need to be rebuilt. The 30% that's missing is specific and small: (1) a "does anything already know this" check broader than Ollama's own confidence, (2) a programmatic N-way fork orchestrator sitting on top of `BranchEngine.fork()`, (3) N-way scoring/synthesis logic that `compare.js` doesn't have, and (4) the handoff from a resolved branch into an Idearium idea.

---

## Part 2 — Proposed Flow, System by System

```
1. COPILOT receives the question.
   owns: intent, initial confidence check (extends lifeline.js's existing
   _estimateConfidence — same function, broader input than just Ollama's
   own response text).

2. If unknown: LOOM REGISTRY resolves "which component/system is this
   actually about" — a lookup against already-declared components/hooks,
   not a new mechanism. Returns a component_id (or a short ranked list
   if ambiguous — ambiguity itself is useful signal, not an error).

3. LOOM CONTRACTS opens ONE contract for that component_id, bound to a
   BASE COS compartment. This is the container the exploration happens
   inside — nothing outside this compartment is touched while unknown.
   (Phase 156, already built, already tested — reused as-is.)

4. For N candidate approaches (N decided by Copilot/RAID, not fixed):
   COS BRANCH ENGINE forks the base compartment N times — cos/playground/
   branch.js's fork(), called N times in a loop. Each branch is isolated
   per COS-4 ("branches never share memory — only file content").
   THIS is the "different COS forking multiple choices at once" —
   mechanically already possible today, just never called this way.

5. Each branch trials its one approach via SandboxRunner — this is the
   "trial and error." Real execution, contained, per-branch.

6. NEW WORK (does not exist today): an N-way scorer/synthesizer sitting
   above compare.js's pairwise verdict(). Two honest options, not a
   false choice — same as the Lattice Path A/B decision earlier this
   session:
     (a) BEST-OF-N — score every branch, promote the winner, discard
         the rest (RECYCLED, same as a failed compartment — see COS's
         real terminal-RECYCLED behavior, confirmed last session).
     (b) SYNTHESIZE — where multiple branches independently arrive at
         the same invariant (same file shape, same passing assertion,
         same output for a given input), that agreement IS the answer,
         even if no single branch is "best" end to end. This is closer
         to what Reflection Engine already does philosophically
         (evidence accumulation before any write), just applied to
         parallel branches instead of sequential sessions.
   These are not mutually exclusive — (a) is the fallback when nothing
   converges, (b) is preferred when it's available. Which one fires
   should be a real decision, not silently defaulted.

7. LOOM CONTRACTS closes the contract: 'pass' with the winning/
   synthesized branch's produced hooks (registers into the shared
   registry, Phase 131/156 path, unchanged) or 'fail' if nothing
   converged and nothing scored acceptably (writes nothing, per 156's
   existing guarantee).

8. IDEARIUM captures the resolution as a durable idea/spec via
   RepoLayer/spec-engine — this is what makes "figuring it out" once
   mean not having to figure it out again. LOOM's contract record is
   the attempt's audit trail; Idearium's idea is the institutional
   memory. Different jobs, both needed — this is the piece phase 156
   didn't cover, because it's not LOOM's job to own permanently.

9. REFLECTION ENGINE observes the outcome (win/synthesize/fail) the
   same way it observes any other decision outcome today — no new
   write path into it, it already consumes exactly this shape of
   event.
```

---

## Part 3 — What Genuinely Needs Building (spec-level, not code)

Four pieces, none of them large, none of them "rebuild something that exists":

1. **Broadened "is this known" check** — extend `lifeline.js`'s confidence gate to also query LOOM's registry/Idearium's ideas before falling back to Ollama's own uncertainty. Small, additive.
2. **N-way fork orchestrator** — a thin loop calling `BranchEngine.fork()` N times against one base compartment, tracked by one LOOM contract per branch (or one contract with N sub-attempts logged as handoffs — this is a real design choice to make explicitly, not default silently).
3. **N-way scorer/synthesizer** — new logic, sits beside `compare.js`, doesn't replace it (pairwise diff is still useful for showing *why* branches differ, even when the decision is made by the N-way layer above it).
4. **Idearium handoff** — one call from a passed LOOM contract into `RepoLayer`/`spec-engine`, turning the resolution into a tracked idea.

## Part 4 — Open Questions (blocking, per your own "ask" instinct — not deciding these for you)

**Q1 — Best-of-N vs synthesize: does one take priority, or does the question itself decide which applies?** My read: synthesis when branches converge, best-of-N as fallback — but that's my judgment, not yours yet.

**Q2 — Per-branch contract, or one contract with N tracked attempts?** Phase 156's contract model was built assuming one compartment per component. N branches of the *same* component muddies that — worth deciding before building the orchestrator, not after.

**Q3 — Does RFR2's clip/adapter-sandbox (event-level, side-effect-policy-enforced replay) belong in v1, or is COS's filesystem-level branching sufficient to start?** My read: start with COS alone — RFR2's piece adds real safety (guaranteed no side effects during replay) but is still `unintegrated`, and Phase 109 already tracks wiring it in as a separate, later step.

Nothing above gets built until these are answered — that's the actual meaning of "spec first."
