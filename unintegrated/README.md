# unintegrated/

Source code that's been sourced/audited and is referenced by a real,
named phase in `docs/NEXUS-PHASE-MAP.md` — but has not been wired into
the live tree. Nothing in here runs. Nothing in here is required by
anything else in the repo. It's staged, not installed.

Per §1.1 (nothing exists until proven): a phase marked 🔵 SOURCED means
"the candidate code exists and was checked," not "this is built." That
distinction is the entire purpose of this folder existing separately from
the rest of the tree.

## rfr2-nexus/

From `relational-field-reader-v0_2_0.zip`'s `packages/nexus` (v5.0.1).
**Same project as `Causal-Nexus.zip`** — confirmed by matching Project UUID
(`eecaa718-c6a6-4433-b02a-11ecbefd4740`) in both, 2026-06-29. Only the
modules actually cited by a phase are here — not the whole package
(`causality`, `forge`, `loader`, `persist`, `projection`, `lazy`, `sigma`,
`kernel`, `adapter` were not copied; none are referenced by name in any
sourced phase, and `causality` specifically still needs a real diff against
`lib/cfr/graph.js` before anyone decides whether it's wanted at all — copying
it here would invite assuming the diff already happened).

| Folder | Cited by | What it's for |
|--------|----------|----------------|
| `compress/` | Phase 27 | `snapshot()`/`restore()` — full state serialize/restore |
| `context/` | Phase 27, 30, 109 | `createLiveContext`/`createReplayContext` — suspend↔resume |
| `time/` | Phase 27 | kernel-local clocks |
| `clip/` | Phase 30, 109 | `snapshotRange()`/`restoreClip()` — bounded subgraph fork primitive |
| `enforcement/` | Phase 95 | `RuntimeGuard` + `BoundaryIndex` — 25 continuously-monitored invariants |
| `query/` | Phase 99 | CQL — query language over a causal graph |
| `identity/` | Phase 105 | 3-axis dedup/integrity model (id/contentHash/replayOf) |
| `delta/` | Phase 105 | named delta types, kinematic delta engine |
| `adapter-sandbox/` | Phase 109 | READ_ONLY/LOCAL_ONLY/FULL side-effect policy, null adapters |
| `observer/` | Phase 109 | typed event bus — still needs a diff against SISO's bus, not assumed non-redundant |
| `version-gate/` | (general) | `.nex` artifact validation + migration — no existing NEXUS equivalent found |

## Before anything here gets integrated

Per the same caution already on the books for `observer` (vs SISO's bus)
and `causality` (vs `lib/cfr/graph.js`): check for redundancy with what
NEXUS already has before wiring any of these in. `compress`/`clip`/`context`
already prompted the `lib/replay-engine.js` comparison in session 6 — that
comparison still hasn't been done; the file in this folder is not pre-cleared
just because it's organized now.
