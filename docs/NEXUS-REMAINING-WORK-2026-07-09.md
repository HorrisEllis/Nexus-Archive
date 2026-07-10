# NEXUS — Remaining Work
### As of 2026-07-09, after the consolidation + intelligence-wiring + WARP-spine session
This is an honest ledger: what's genuinely done (verified, tested), and
what still needs doing (with why, and how big). Nothing here is aspirational
padding — each open item was confirmed against real source.

---

## ✅ Done and verified this session
- **Consolidation** — 17 uploads reconciled into one tree by content (not
  filename), nothing lost. 97/97 baseline, 544 module tests passing.
- **Bridge response-drop fixed** — co-pilot now returns human text, not the
  `{ok,uuid,status:fulfilled}` envelope. Real end-to-end test.
- **Both sigma fixes** — wildcard-object root cause + Windows-path caller trace.
- **Intelligence wiring** (the genuinely-wireable ones, tested):
  - execution-pipeline → `run_pipeline` agent-tool (was 0 callers)
  - `causal.anomaly` + `causal.compound` init'd at cortex boot
  - `reflection.js` + `BDA` activated (one wire, both)
  - `mastermind.detectRecurringPatterns()` via rfr2 `delta.detectFractals`
    (rfr2-bridge's first real consumer)
- **WARP as build spine** — `t2-gate` (the execution pipeline's build stage)
  now routes through WARP's cache/population/axiom-gate cascade instead of
  direct-to-SEAMQueue. Idearium chunk-dispatch already did (earlier). Opt-out
  via `T2_DISABLE_WARP`.
- **Specs moved per-system** — 13 specs → `<system>/spec/`; drift detector
  reads them (precedence spec/ > flat > docs/). Root-path bug found+fixed;
  synced count 35→41.
- **Versions + changelogs + addendums** — 6 changed systems (cortex, copilot,
  bridge, orchestrator, idearium, emerge) bumped with real changelog fragments
  and "what changed" addendums in their specs.
- **Stub sweep** — no hidden stubs in wired paths. The 2 real stubs
  (`detectBottlenecks`, `clusterByAnomaly` in rfr2/delta) are `@deprecated`
  and honestly labeled; my wire uses only the real `detectFractals`.
- **AXIOMS-v3.1 held** in `docs/AXIOMS-v3.1.md` as governing law.
- **Execution pipeline hardened** — verified the full chain is real end-to-end
  (build → cos/playground BranchEngine.fork → SandboxRunner → CompareEngine →
  golden-promote; all real modules, 446/238/324 lines, no stubs). Added §2.1
  JAA persistence for run records (were in-memory only — a copilot-triggered
  run vanished on restart); golden-branch history was already disk-persisted.
  Records now survive restart, verified. 6/6 run-pipeline tests.

---


- **Copilot full tool access + confidence fix** (2026-07-10) — merged the
  copilot-full-tool-access upload: nexus_intelligence tool (direct one-action
  access to events/intuition/mastermind/cfr/lattice/patterns/rca — was only
  reachable bundled inside a full diagnosis), run_cockpit_command wired to the
  live ForgeCLI at boot (was inert — registered but no instance injected).
  Confidence heuristic fixed: tool-grounded answers get a real floor (0.7-0.8,
  verifiable > guessed) and correctly explaining an error no longer gets
  wrongly penalized/escalated (the old blanket -0.2 for "error"/"failed"
  forced needless escalation on correct debugging answers). 8 tools total now.
- **Closed loop built** (2026-07-10) — run_closed_loop tool chains the real
  spec→populate→repo stages (create manifest → WARP-backed chunk populate loop
  → repo) into one copilot-callable action. All stages were real, nothing
  chained them. Map: docs/NEXUS-CLOSED-LOOP-MAP-2026-07-10.md. Proven
  end-to-end against a fake idearium (4/4). Hand-off to run_pipeline for
  build→verify→promote.
- **Stub sweep (enterprise-grade)** — no hidden stubs. The 4 real stubs
  (rfr2 detectBottlenecks/clusterByAnomaly, guardian dbGet/dbAll) are honestly
  labeled deprecated/shims. emerge compiler "not implemented" strings are
  GENERATED scaffolding (template literals), not stubs in NEXUS. My new code:
  0 stubs.

- **Merge (nexus-full-6 + genesis.spec, 2026-07-10)** — my live tree was newest
  (had expectation-watcher wire, closed-loop, self-diag map); full-6 was an older
  branch with 8 real unique files, all adopted: idearium spec-engine TEMPLATES
  (templates.js + templates/, 5 templates — spec scaffolding, orphan/unwired),
  warp-devkit-addendum-v1.4.1.spec, IDEARIUM-PHASE-MAP, hook-generator +
  methodless-route-analyzer scripts. Merged full-6's real §1.2 fix into
  expectation-watcher (construction-time validation so a malformed expectation
  fails at declaration, not inside the bus handler where it would poison event
  ingestion). Kept mine on lifeline/t2-gate/bridge-router (I was ahead).
  genesis.spec adopted (canonical devkit spec, WARP-as-spine). full-6's
  warp-compounding test un-registered: T-003/4/5 assert instant exact-caching,
  but real WARP needs 3 retentions to promote — wrong assumption, annotated.
  97/97, 559 module tests.

## 🔲 Still needs doing

### 1. Config-not-code (from the live boot log — quick, user-side)
- **EMERGE offline** — add `emerge/server.js` to the autopilot supervised
  start list (it's not in it). Shows OFFLINE on the TV-shell tile.
- **Guardian 0 providers** — set `GUARDIAN_DIR` env var so Clear-Glass
  injects the userscripts; without it, provider tabs open but register 0
  scripts. Config only.

### 2. AX-008 — RESOLVED 2026-07-09 (was misdiagnosed here)
The original claim ("architect emits nothing") was WRONG — architect
already POSTs every event to cortex `/api/event`. The real gap was deeper
and worse: copilot's `_connectCortexStream()` subscribes to cortex
`/events`, but **cortex had no `/events` SSE endpoint at all** (only
`/api/events`, a query route). Copilot's entire cortex stream had been
reconnect-looping against a 404 — not just missing architect, missing
everything. Fixed: added the real `/events` SSE endpoint to cortex + made
`/api/event` re-broadcast ingested events to it. Now architect (and every
system POSTing to `/api/event`) reaches copilot's live stream. Proven
end-to-end (cortex-sse-broadcast.test.js, 2/2). emerge has no server at
all (emerge/ is compiler libs) — nothing to emit from; not a gap.

### 3. Deeper rfr2 sub-engines (real, but wait for a real consumer)
- `query`, `compress`, `context`, `clip`, `enforcement` are real but have no
  live consumer that isn't redundant with what cortex/mastermind already do.
  Per the wiring map (`docs/RFR2-SUBENGINE-WIRING-MAP-2026-07-09.md`): wire
  each ONLY when a feature needs it, against a real caller — not preemptively.
  Forcing them now would be capability theatre.
- `detectBottlenecks` / `clusterByAnomaly` (rfr2/delta) are **stubs** — if a
  feature needs bottleneck detection, these must be implemented, not wired.

### 4. Copilot-as-NEXUS UI (large, the headline vision)
Spec'd in the expansion map. What's real: tool/diagnose/move-data/run_pipeline
tools, the 3 intelligence faculties, spotlight `ui{}` blocks, AX-008 streams,
the tutorial with CFR-driven visuals. What's missing:
- The copilot control-panel UI itself (vision spec §H) — deliberately last.
- clear-glass as copilot's own steerable surface (open/inject/drive at its
  discretion) — the hooks exist, the copilot-side control does not.
- Personalities surfaced in the UI (the data layer `cortex/personas.js` is
  real; no picker).

### 5. Per-system spec addendums for the OTHER systems (small, finite)
6 systems got addendums this session (the ones that changed). Guardian,
architect, eravos, loom, ollama, cli, siso, erosmancer have per-system specs
but no recent-change addendum because they didn't change materially. Add
addendums as/when they change — not busywork now.

### 6. Pre-existing test failures (not from this work — real, worth a look)
- `jaa-db.test.js` — 52 failures, "JaaDB is not a constructor". Pre-dates
  this entire session. Likely a test-harness/import mismatch, not a runtime
  bug (jaa-db works in the live system). Worth fixing so the suite is clean.
- `test-mutation-contract.js` — 1 failure. Same category.

### 7. Ollama-bridge has no spec (drift detector flags it)
- `ollama-bridge` (code@1.0.0) → needs a `docs/ollama-bridge.spec` or
  `ollama/spec/`. The only remaining "no spec" drift after this session's work.

---

## Honest notes on scope
- Items 1, 5, 7 are small/finite.
- Item 2 is a clean medium task (two emitters).
- Item 3 is correctly *deferred* — doing it now would violate the
  "no hollow wiring" discipline that's held all session.
- Item 4 is genuinely large — it's the product vision, not a fix.
- Item 6 is real cleanup on pre-existing (not-mine) failures.
