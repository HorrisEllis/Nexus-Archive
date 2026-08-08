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

---

## 2026-07-branch-a-additions/

§2026-07-11 — this tree (`nexus-full-5` baseline) turned out to be one of at
least two divergent branches under active development. 20 additional zips
(`nexus-full` through `nexus-full-5`, `nexus-merged`, `nexus-merged__1_`,
`nexus-v9-cli-unified`) were checked; `cortex.spec`'s own version number
(3.2.0 in this tree vs 3.3.0 in `nexus-merged`) plus explicitly dated docs
(`SESSION-MANIFEST-2026-07-07.md`, `CHANGELOG-SESSION-2026-07-08.md`,
`RFR2-SUBENGINE-WIRING-MAP-2026-07-09.md`) confirm `nexus-merged` is later
than this tree, not a variant of it. `nexus-v9-cli-unified` is a strict
subset of `nexus-merged` (checked: empty diff of files unique to v9 vs
merged) — merged is the furthest point on this branch across everything
uploaded.

Files below exist in `nexus-merged` and do not exist anywhere in this tree.
Copied here, not wired — same rule as everything else in this folder.

| File | What it is | Note |
|------|------------|------|
| `lib/autonomous-loop.js` + `orchestrator-lib/autonomous-loop.js` | First live caller of `compartment-engine.spawn()` — intent-classifier → case-library → spawn → execute | Per its own session manifest: "verified previously: cold-tier PASS, 3 repeated failures → real negative crystal, 4th attempt genuinely blocked." Not re-verified here — that claim is carried, not re-proven. |
| `lib/compartment-engine.js` + `tests/modules/compartment-engine.test.js` | A real, tested compartment engine — spawn/execute lifecycle | Likely the concrete implementation of the `cos/kernel.js` "K-15 Compartment Kernel" concept already in this tree (`C = (A,K,S,X)` — Axioms, Conditions, Synthesis, Context). **Redundancy against `cos/kernel.js` not checked** — do that before wiring either in. |
| `tests/modules/idearium-warp-dispatch.test.mjs` | Idearium ↔ WARP dispatch integration test | Relevant to this session's spec-engine work — worth running before any further idearium changes. |
| `clear-glass/ncp-client.js` | NCP client-side counterpart | This tree only has the NCP server side documented (guardian's NCP channel). |
| `agent-tools/run-cockpit-command.js` | Agent tool for issuing cockpit commands | Ties to `cockpit/` (real in this tree — `core.js`/`pipeline.js`/`cli.js`, confirmed substantial two sessions ago). |
| `docs/SESSION-MANIFEST-2026-07-07.md`, `CHANGELOG-SESSION-2026-07-08.md` | Real session logs — what was wired, what was verified, against what base | Primary source for provenance of everything else in this batch. |
| `docs/RFR2-SUBENGINE-WIRING-MAP-2026-07-09.md` | Per-sub-engine consumer audit for `meta/rfr2/`'s 11 sub-engines (0 live consumers before this doc) | Conclusion: wire `delta` first (mastermind can use `detectFractals`/`detectBottlenecks` directly) — rest deferred, each with a stated reason (redundant, needs a kernel owner, etc). Directly answers the "RFR2 is the single largest built-never-connected surface" finding from `NEXUS-PHASE-MAP.md` — this is the wiring plan for it, not yet executed even in `nexus-merged`. |
| `docs/NEXUS-ENCYCLOPEDIA.md`, `NEXUS-PLAIN-ENGLISH.md` | Reference documentation, not checked for accuracy against this tree | Read before trusting; not audited this pass. |
| `docs/docs-level-genesis.spec` | A **different** genesis.spec — lives at `docs/`, not `idearium/spec-engine/templates/genesis.spec` (the one this session's templates work uses) | Two files, same name, different scope — do not conflate. Not diffed against each other yet. |
| `docs/nexus-selfdiag-registry-interface.spec` | Self-diagnostic registry interface spec | Not cross-checked against `registry-components.js` in this tree. |
| `ui/consent/`, `ui/home/`, `ui/toast/`, `ui/tutorial/`, `ui/build-channel/` | Five real UI pieces (consent gate, home shell, toast system, tutorial, build channel) with no equivalent anywhere in this tree | Front-end only — no server-side wiring checked or assumed. |

## 2026-07-branch-b-cortex-v2/

A **second, separate divergent branch** — `nexus-master`/`nexus-master__1_`
(identical to each other) plus 13 numbered snapshots `nexus-system-12`
through `nexus-system-24` (chronological — file counts climb 661→751 across
them; `nexus-integrated-5` through `nexus-integrated-13`, checked
separately, are this same branch's earlier history, same flat top-level
shape, file counts 775 down to 667 continuing the same lineage backwards).
This branch restructures cortex entirely differently from Branch A above —
neither branch contains the other's work. `nexus-system-24` is the
furthest point found on it.

This branch is where the "signal/trajectory/memory layer" I reported as
lost two turns ago actually lives — correction already delivered in full
then; files staged here for real this time:

| File | Corresponds to (old Mastevos v8.0 spec name) | Verified |
|------|------|------|
| `cortex/cortex-v2.js` | — (new, no v8.0 equivalent) | Real, 1356 lines, CLI hitting `/api/memory?table=crystals\|bep_patterns\|lattice_nodes` |
| `cortex-intelligence-index.js` (from `cortex/intelligence/index.js`) | `crystalball/bep-engine.js` | Real — `jaaDB.insert('bep_patterns', p)` at line 321, confirmed by grep |
| `cortex/liminal-space/index.js` | `crystalball/mcl.js` | Real — `jaaDB.insert('crystals', crystal)` at line 338 |
| `cortex/versionium/index.js` + `causality.js` | `versionium/causality.js` (NEXUS-VERSIONIUM.spec) | Real, matches the spec's description closely |
| `lib/meta/topo-kernel/*` | `foundation/topo-wire.js`, `core/signal/signal-topology.js` | Real module (index/bus/snr + 2 JSON schemas), not one file |
| `lib/meta/spatial/*` | `core/trajectory/attractor-landscape.js` | Real — matches this tree's own `cortex.spec` module description ("Sigma engine + resonance lattice") |
| `lib/meta/telemetry-codec/latent-model.js` | `core/signal/latent-model.js` | Exact filename match, just relocated — **but broken as shipped**: `node --check` fails. Its own `export const DIM = ...` (line 23) and `export class ServiceLatentModel {` (line 59) are both commented out in the source, while the class body and every `DIM.MOMENTUM`-style reference below them are not — a bare constructor sitting outside any class wrapper. Confirmed this is in the original file, not introduced by copying it here. Needs those two lines uncommented before it's even syntactically valid, let alone wired. |

**Not found as dedicated files anywhere, in either branch** — `fix-map.js`,
`seam.js` (as a memory primitive), `suppression-score.js`,
`trajectory-recorder.js` as standalone files. Content-grep suggests these
concepts are folded into `cortex/self-heal/index.js`, `cortex/healer/index.js`,
and `cortex/memory/jaa-db.js` rather than living separately — not confirmed
as full reimplementations, flagged as the next thing to actually trace
rather than assumed either way.

**Before integrating anything from this section**: Branch A and Branch B
restructured cortex independently and disagree with each other, not just
with this tree. Merging either one in means resolving that disagreement
first — this folder holds both sides staged, not a recommendation for
which one wins.

## CORRECTION 2026-07-12 — most of this section is unnecessary

Checked properly before doing any "reconciliation" work: this tree (Branch A)
already has its own real, tested, **wired** implementation of nearly
everything staged below, independently developed, not a stale catch-up
branch:

| Staged here (Branch B) | This tree's own equivalent | Status |
|---|---|---|
| `cortex/liminal-space/index.js` (crystal writer) | `meta/crystal-lattice.js` | real, wired via `lib/compartment-engine.js` |
| `cortex-intelligence-index.js` (BEP writer) | `cortex/intelligence/mastermind.js`'s `_crystallizeBEPPatterns` (built 2026-07-12) | real, tested |
| `lib/meta/spatial/*` | `meta/spatial/*` (1134 lines — larger than Branch B's) | real, wired into `cortex/boot.js` + `idearium/api/index.js`, 2 test files |
| `lib/meta/topo-kernel/*` | `meta/topo-kernel/*` (same name) | real, already wired |
| `cortex/versionium/causality.js` | `meta/cfr/graph.js` | real, wired into cortex/RAID/spatial, has its own CLI (`cli/cfr-debug.js`), 5 test files |

**Genuinely still absent from both branches**, checked one more time
before concluding: `fix-map.js`, `suppression-score.js`,
`trajectory-recorder.js`, `attractor-landscape.js` as dedicated files.
`seam` as a general architectural concept is extensively built elsewhere
(`lib/seam/`, `seams/seam-contracts.js`, `emerge/seams/`) — but not as the
specific memory-primitive Mastevos v8.0 described.

The files under `cortex/` and `lib/meta/` in this folder can be treated as
reference-only from here — kept for provenance, not a to-do list.
`cortex-v2.js` (the CLI) may still be worth a look on its own terms as an
alternate interface, but not as something this tree is missing underneath.

A **second, separate divergent branch** — `nexus-master`/`nexus-master__1_`
(identical to each other) plus 13 numbered snapshots `nexus-system-12`
through `nexus-system-24` (chronological — file counts climb 661→751 across
them; `nexus-integrated-5` through `nexus-integrated-13`, checked
separately, are this same branch's earlier history, same flat top-level
shape, file counts 775 down to 667 continuing the same lineage backwards).
This branch restructures cortex entirely differently from Branch A above —
neither branch contains the other's work. `nexus-system-24` is the
furthest point found on it.

This branch is where the "signal/trajectory/memory layer" I reported as
lost two turns ago actually lives — correction already delivered in full
then; files staged here for real this time:

| File | Corresponds to (old Mastevos v8.0 spec name) | Verified |
|------|------|------|
| `cortex/cortex-v2.js` | — (new, no v8.0 equivalent) | Real, 1356 lines, CLI hitting `/api/memory?table=crystals\|bep_patterns\|lattice_nodes` |
| `cortex-intelligence-index.js` (from `cortex/intelligence/index.js`) | `crystalball/bep-engine.js` | Real — `jaaDB.insert('bep_patterns', p)` at line 321, confirmed by grep |
| `cortex/liminal-space/index.js` | `crystalball/mcl.js` | Real — `jaaDB.insert('crystals', crystal)` at line 338 |
| `cortex/versionium/index.js` + `causality.js` | `versionium/causality.js` (NEXUS-VERSIONIUM.spec) | Real, matches the spec's description closely |
| `lib/meta/topo-kernel/*` | `foundation/topo-wire.js`, `core/signal/signal-topology.js` | Real module (index/bus/snr + 2 JSON schemas), not one file |
| `lib/meta/spatial/*` | `core/trajectory/attractor-landscape.js` | Real — matches this tree's own `cortex.spec` module description ("Sigma engine + resonance lattice") |
| `lib/meta/telemetry-codec/latent-model.js` | `core/signal/latent-model.js` | Exact filename match, just relocated — **but broken as shipped**: `node --check` fails. Its own `export const DIM = ...` (line 23) and `export class ServiceLatentModel {` (line 59) are both commented out in the source, while the class body and every `DIM.MOMENTUM`-style reference below them are not — a bare constructor sitting outside any class wrapper. Confirmed this is in the original file, not introduced by copying it here. Needs those two lines uncommented before it's even syntactically valid, let alone wired. |

**Not found as dedicated files anywhere, in either branch** — `fix-map.js`,
`seam.js` (as a memory primitive), `suppression-score.js`,
`trajectory-recorder.js` as standalone files. Content-grep suggests these
concepts are folded into `cortex/self-heal/index.js`, `cortex/healer/index.js`,
and `cortex/memory/jaa-db.js` rather than living separately — not confirmed
as full reimplementations, flagged as the next thing to actually trace
rather than assumed either way.

**Before integrating anything from this section**: Branch A and Branch B
restructured cortex independently and disagree with each other, not just
with this tree. Merging either one in means resolving that disagreement
first — this folder holds both sides staged, not a recommendation for
which one wins.



## CORRECTION 2026-07-12

Two entries under `2026-07-branch-a-additions/` above — `lib/compartment-engine.js`
and `lib/autonomous-loop.js` (+ its orchestrator counterpart) — were staged
as "missing from this branch, found in nexus-merged." That was wrong. Both
files already existed in this tree, byte-identical to the nexus-merged
copies (confirmed by diff). The comparison that flagged them as missing was
run against a stale local copy of this package, not the true source tree.

They are genuinely real and live here already:
- `meta/crystal-lattice.js` — real crystallization writer, wired via
  `lib/compartment-engine.js`'s `updateOnExecution()` calls on PASS/FAIL/DELETE.
- `cortex/boot.js` already had a real reader for the `crystals` table
  (`_buildPatterns()`), waiting on exactly that writer.

The two staged copies under `2026-07-branch-a-additions/lib/` can be
deleted — they are duplicates of files this tree already has, not additions.

## 2026-07-12 — Causal Nexus v6 brought in (meta/causal-nexus/), not staged here

This is NOT staged in unintegrated/ — it's live at `meta/causal-nexus/`.
Noted here only so this file stays the map of what's where. The real,
tested URCK kernel (`createKernel`) that `meta/rfr2/compress|clip|context|
version-gate` were built against — confirmed genuinely absent from
everywhere in this tree and from this very unintegrated/ folder two turns
ago — was found in a fresh upload (causal-nexus-v6_0_0_1_.zip) and verified
by running its real test suite: 722/722 passing across kernel, causality,
sigma, clip, compress, context, ledger, version-gate, adapter-sandbox,
observer-enforcement, modules, loader-context, and cross-domain invariants.

Real, confirmed, deliberate conflict with the already-live `meta/cfr/`:
both compute "sigma" and both build a causal graph, but on opposite
philosophies — `meta/cfr/sigma.js` stores permanently at write time and
never recomputes; the new engine is a pure observer that never stores by
design. Resolved by direction, not by me picking a side: the new engine's
live/recomputed reading is now the one to trust for "what is the regime
right now," triggered on two real events (a source file changing, or a new
high-sigma entry landing in the old permanent record) — see
`meta/causal-nexus/recompute-trigger.cjs`. It writes to a new table,
`sigma_live`, and does not touch or replace `sigma_records` — every
existing consumer of the old permanent record (RAID, cortex health checks)
is unaffected.
