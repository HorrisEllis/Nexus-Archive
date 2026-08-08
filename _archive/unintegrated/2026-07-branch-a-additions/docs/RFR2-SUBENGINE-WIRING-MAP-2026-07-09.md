# RFR2 Sub-Engine Wiring Map — 2026-07-09
Status: **map** (nothing wired by existing here). Per AXIOMS: map first,
then wire the ones with a real consumer, then confirm and update.

## The situation
`meta/rfr2/` has 11 real sub-engines. All load through the `meta/index.js`
barrel; **none is called by any live system** (orphan audit, 0 consumers).
They are ESM; `lib/rfr2-bridge.js`'s `loadRFR2Module(name)` is the real
async ESM→CJS loader (dynamic `import()`, cached) — itself with 0 callers.

## Per-engine consumer analysis (real, not aspirational)

| Sub-engine | Real API | Genuine consumer in the live system? | Verdict |
|---|---|---|---|
| **delta** | `detectFractals`, `detectBottlenecks`, `computeEventDelta`, `clusterByAnomaly` | **YES** — mastermind already builds a causal graph from event_log and traces ancestry. `detectFractals` = "has this causal shape recurred" — a real, additive question mastermind can't currently answer. `detectBottlenecks` = "where does causal flow stall". | **WIRE** — first, strongest. |
| **query** | `parseQuery`, `execQuery`, `createQueryIndex` | Partial — cortex has `jaaDB.query` for tables; rfr2 `query` is over an event *graph*. Overlaps mastermind's graph traversal. Real but redundant with what mastermind already does. | defer — no unique need yet |
| **compress** | `snapshot`, `restore`, `blueprint`, `compile` | Partial — cortex already has `.nex` snapshots (`cos/foundation/snapshot.js`). rfr2 compress is kernel-scoped, a different granularity. Two snapshot systems already flagged (Versionium). | defer — would add a 3rd snapshot path |
| **context** | `createLiveContext`, `createReplayContext` | Only if something maintains a live rfr2 kernel. Cortex doesn't run one. | defer — needs a kernel owner first |
| **clip** | `snapshotRange`, `restoreClip`, `computeStabilityProfile` | Needs a live kernel + sigma regime feed. | defer |
| **enforcement** | `createRuntimeGuard`, `checkKernelInvariants` | Real invariant guard, but for an rfr2 kernel — none live. | defer |
| **observer / time / identity** | bus/clock/uuid primitives | Infrastructure the other engines use internally; not standalone consumers. | n/a — internal |

## STATUS: delta WIRED 2026-07-09
mastermind.detectRecurringPatterns() loads delta via rfr2-bridge (its
first real consumer), runs detectFractals over the causal graph. Verified
end-to-end: detects A→B→C recurring ×3. Two real bugs caught in wiring
(occurrenceCount field name; type-sequence edges polluting the walk).
4/4 tests. detectBottlenecks confirmed a stub (return []) — NOT wired,
flagged. rfr2-bridge proven (was 0 consumers, now 1).

## Decision
Wire **delta** into mastermind — it's the one with a real, unique,
non-redundant question it answers ("has this failure pattern recurred as
a causal shape") that mastermind genuinely cannot answer today. Load it
through the real rfr2-bridge (proving the bridge too — its first caller).

The rest stay flagged, honestly, as "real but no live consumer yet."
Wiring them without a feature that needs them would be capability theatre.
When a feature needs rfr2 query/compress/context, wire it then, against a
real caller — not preemptively.

## Wire plan for delta (the one real wire)
1. mastermind gets an optional `detectRecurringPatterns()` method.
2. It loads `delta` via `rfr2-bridge.loadRFR2Module('delta')` (async,
   cached) — the bridge's first real consumer.
3. Feeds the recent event_log stream (same rows mastermind already pulls)
   into `detectFractals` / `detectBottlenecks`.
4. Surfaces recurring-pattern findings in mastermind's analysis output,
   additively — never replacing the causal trace, augmenting it.
5. Honest degrade: if the ESM import fails (bridge unavailable), the
   method returns null and mastermind's existing output is unchanged.
