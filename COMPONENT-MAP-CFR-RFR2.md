# NEXUS component map — CFR, RFR2, and the full system overview
Built 2026-07-02. Every ID, hook UUID, and wire below is read from the
actual source files, not inferred — where a system had a bug or a gap,
it's named as one, not smoothed over.

---

## CFR-Ω — coherence/friction/resonance field (`lib/cfr/`)
**Status: live, wired, load-bearing.** This is the truth substrate every
other system's event stream writes through.

| Module | ID (UUID) | Summary |
|---|---|---|
| `index.js` | `nexus-cfr-index-v1-0000-4000-0000-000000000001` | Single entry point — swaps in as a drop-in replacement for the older `createEventLedger`. |
| `sigma.js` | `nexus-cfr-sigma-v1-0000-4000-0000-000000000001` | Divergence scorer. Scores every event 0.0 (expected) to 1.0 (extreme anomaly) across structural/temporal/contextual axes. Stored permanently at write time, never recomputed. |
| `field.js` | `nexus-cfr-field-v1-0000-4000-0000-000000000001` | The field itself — 4 continuous dimensions (coherence, friction, resonance, entropy), each 0..1. Regime (`stable`/`resonant`/etc.) is derived from these. Snapshotted, frozen, at every ledger entry. |
| `delta.js` | `nexus-cfr-delta-v1-0000-4000-0000-000000000001` | Transition physics between two consecutive ledger entries — tension, friction, slope. Stored at write time alongside sigma. |
| `graph.js` | `nexus-cfr-graph-v1-0000-4000-0000-000000000001` | Causal graph — every ledger entry is a node, edges from `causedBy`/`sessionId`/`jobId`/temporal proximity. Powers replay and root-cause traversal. |
| `ledger.js` | `nexus-cfr-ledger-v1-0000-4000-0000-000000000001` | **The truth substrate.** Every write: sigma + delta + frozen field snapshot + graph update, in that order, before the event emits (§LAW II). Append-only JSONL, never mutated. |
| `contract-verifier.js` | `nexus-cfr-contract-verifier-v1-0000-4000-0000-000000000001` | Subscribes to each system's own CFR ledger stream, checks real behavior against that system's declared `interaction-contract.json`. A violation becomes a gap in cortex. |

**Hooks (HTTP, mounted at `/cfr/*` on whichever kernel owns the ledger):**
`GET /cfr/health` · `GET /cfr/state` · `GET /cfr/field` · `GET /cfr/nodes` ·
`GET /cfr/deltas` · `GET /cfr/compound` · `GET /cfr/compound/:id` ·
`GET /cfr/stream` (SSE) · `POST /cfr/emit` · `GET /cfr/replay`

**Wires — 9 real consumers found by grep, not assumed:**
`idearium/index.js` · `guardian/server.js` · `orchestrator.js` ·
`architect/service.js` · `bridge/index.js` · `bridge/causal/graph.js` ·
`service/nexus-diagnostic.js` · `cli/cfr-debug.js` (CLI tool) ·
`tests/brutal.test.js`

**Seams:** none dedicated — CFR is infrastructure every system writes
through, not something that gets SEAM-queued itself.

---

## RFR2 — causal kernel toolkit (`unintegrated/rfr2-nexus/`)
**Status: built, real, zero live consumers.** Every module below is
production-quality code with its own UUID and documented `@hook` per
export — this was clearly built to be integrated, then parked. The
directory name is the whole story: `grep`ing the entire codebase for
anything requiring `rfr2-nexus` returns nothing outside its own folder.

| Module | ID (UUID) | Summary |
|---|---|---|
| `observer/index.js` | `f7a8b9c0-d1e2-4f3a-4b5c-6d7e8f9a0b1c` | Typed event subscription bus, scoped to one execution context. |
| `delta/index.js` | `7a4219d0-04a3-4276-8a52-83e7d52db10a` | Kinematic delta engine — pure measurement, no thresholds or judgment (that's deliberately left for a future sigma layer). **This is the one with the load-bearing gap — see below.** |
| `clip/index.js` | `d2e3f4a5-b6c7-4d8e-9f0a-1b2c3d4e5f6a` | Bounded causal subgraph extraction, replay, and stability validation. |
| `adapter-sandbox/index.js` | `b1c2d3e4-f5a6-4b7c-8d9e-0f1a2b3c4d5e` | Side-effect policy enforcement (READ_ONLY / LOCAL_ONLY / FULL) for adapters, enforced immutably at registration. |
| `identity/index.js` | `fabbc95c-5da4-44f0-ba14-acd13fb1e3a7` | UUID v4 generation, content hashing, dedup keys. Zero deps, no mutable state. |
| `time/index.js` | `ce9aac88-c293-4951-a2ea-0f565538c1da` | Kernel-local monotonic clocks — no global state, each kernel gets its own. |
| `query/index.js` | `e3bca332-8937-441f-a2a0-9babae81afb6` | Causal Query Language (CQL) engine. |
| `context/index.js` | `e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b` | Execution context model — two hermetically isolated worlds. |
| `compress/index.js` | `f50d7ace-fe96-4aae-995e-4534a9ad7163` | Snapshot / restore / blueprint / compile for causal-nexus kernels. |
| `enforcement/index.js` | `e2f3a4b5-c6d7-4e8f-9a0b-1c2d3e4f5a6b` | Runtime invariant enforcement, two components. |
| `version-gate/index.js` | `a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d` | Single authoritative validation pass for all `.nex` artifacts. |

**Hooks — every export in `delta.js` has a documented `@hook` UUID**
(same pattern across all 11 modules, ~40 hooks total). The two that
matter most, because they're the ones the roadmap flagged as the actual
missing piece for RAID-as-simulation:
- `@hook e3bb7a99-ec6a-4515-96a7-21e30b8bd1bd` — `detectBottlenecks(_deltas, _threshold)` → **`return []` always. Deprecated stub, UUID retained.**
- `@hook 060b1fc1-bbf7-4d27-8780-025609afd030` — `clusterByAnomaly(_events, _deltas, _ticksPerBucket)` → **`return []` always. Deprecated stub, UUID retained.**

Real, non-stubbed hooks in `delta.js`: `computeEventDelta`, `computeDeltaStream`,
`computeThroughputTimeline`, `compressToL1`, `overlayMacros`,
`detectFractals`, `createGraphBranch`, `createBranchRegistry`.

**Wires:** none. This is the honest headline finding — RFR2 is not
partially wired, it is fully built and completely disconnected.

**Seams:** none — nothing SEAM-queues into an unintegrated system.

---

## The CFR ↔ RFR2 relationship
They're not duplicates and don't compete for the same job. CFR is the
**write-path truth substrate** — every event, everywhere, gets scored and
stored through it, live, today. RFR2 is a **toolkit for reasoning about**
causal history after the fact — subgraph extraction, replay, bottleneck
detection — that nothing currently calls. The load-bearing gap named in
`NEXUS-LATTICE-COGNITION-ROADMAP-v0.1.md` (Phase 2: "RFR2 tension
classifier") is exactly `delta.js`'s two stubbed hooks above — filling
those in is real, new engineering (they're named, called by nothing, and
return `[]`), not a wiring task.

---

## Full system overview (all systems, cross-referenced against 3 sources)

**Found while building this: the "systems" list itself has three
different answers depending which file you ask** — a fourth instance of
the same pattern found earlier this session (blueprint-index vs LOOM
registry disagreeing on components).

| Source | System count | What it actually is |
|---|---|---|
| `contracts/SYSTEM-CONTRACTS.js`'s `SYSTEMS` | 7 | The oldest, most curated list — has full role/UUID/bootOrder, but missing architect, copilot, eravos, clear-glass, diagnostic entirely |
| `nexus-connect.js`'s `PORTS` | 11 | The dispatch map every `nc.req()` call actually uses — missing eravos, clear-glass |
| `blueprint-index.json`'s `systems` | 11 | Component-count view — missing loom/warp entirely (both postdate this index) |

Merged, de-duplicated view — 13 real systems:

| System | Port | Boot order | Role |
|---|---|---|---|
| orchestrator | 9000 | 0 | Command and control, source of truth for system state, proxies all routes |
| bridge | 9999 | 1 | Trust relay — identity, routing, durable request queue |
| cortex | 3748 | 2 | Append-only memory, 28 JAA tables, source of truth for all events |
| guardian | 7820 | 3 | AI orchestration, job queue, SEAM delivery, provider management |
| idearium | 4800 | 4 | Idea OS — seed → spec → gap → build lifecycle |
| emerge | 4242 | 5 | `.eg`/`.emerge` language compiler, SNR gate, Ollama AI assist |
| ollama | 11434 | 6 | Local LLM inference, primary offline provider |
| ollama-bridge | 3749 | — | Sovereign HTTP wrapper around ollama — not in `SYSTEMS`, real per this session's ollama audit |
| architect | 3747 | — | Constraint-first authoring, hook registry, SNR gate, blueprint engine |
| copilot | 3750 | — | Sovereign co-pilot — intuition/analysis dual-cognition, fixed for a crash earlier this session |
| eravos | 3751 | — | Browser-based DAW, ALK-GL WebGL particle field |
| clear-glass | 7701 (SSE) | — | Sovereign Electron browser shell |
| loom | — (in-process, no HTTP port found) | — | Component/hook/wire registry + contracts, newest system, phases 121-157 |

---

## What this confirms about the map itself
Three separate "list of systems" files disagreeing, plus two separate
"list of components" files disagreeing (from the earlier build-kit map),
plus RFR2 built-and-parked with its own real hook IDs nothing calls — the
pattern across all of it is the same one this whole session kept finding
in Clear Glass: real, well-built pieces that never got a final wiring
pass. Nothing here is vaporware. All of it needs one more pass to agree
with itself.
