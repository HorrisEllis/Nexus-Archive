# Nexus 0.39.182

**NEXUS 0.39.179 — MCO-E: the roadmap UI**

| | |
|---|---|
| Built | 2026-09-20 15:12:20 → 2026-09-20 15:12:20 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.182 |
| Tag | `v0.39.182` → snap-0626 |
| Full file ledger | [LEDGER-0.39.182.csv](../ledger/LEDGER-0.39.182.csv) |

## Release notes — `CHANGELOG-0.39.182.md`

Copied unchanged from the build.

### v0.39.182 — idearium's spec builds become real cos compartments

Corrected course twice on this one before landing on the real shape —
recorded honestly rather than smoothed over:

1. First wrong turn: assumed cos had zero running infrastructure ("just
   two library files, never booted") — only checked `find cos -maxdepth 1`.
   Wrong. `cos/` is a large, mature system (CLI, host layer, 16 archetypes,
   11 blueprints, vault daemon, its own spec) that was simply never fully
   mapped before proposing a fix.
2. Second wrong turn: proposed building `cos/server.js` with its own port
   and HTTP API. Also wrong — `cos/spec/cos.spec` already states, in its
   own words, `port: null` — "CLI/library system, no HTTP surface of its
   own" — a deliberate design, not a gap. Building a networked cos service
   would have created a second, competing architecture next to the real
   one.
3. Real shape, confirmed by a real, already-working example
   (`lib/agent-tools/tools/sandbox/cos-compartment.js`, the same tool
   copilot already uses, dated 2026-08-12): any process calls
   `createHost()` (`cos/host/index.js`) directly, in-process. Multiple
   processes share compartment state via the same on-disk file — "COS-2:
   CLI first. COS-13: Host service is the authority." No server needed,
   none built.

#### What "idearium uses cos" actually means (confirmed with James directly)

Not: idearium itself becomes a cos compartment (would mean short-
circuiting the real SISO gate pipeline for an always-on, already-trusted
system — the gate gauntlet is built for new, untrusted, spawned work).

Is: idearium's own sub-work — spec builds, spawned compilers/workers —
becomes real cos compartments, going through the gate pipeline normally.

**Built**: `idearium/spec-engine/compiler-t0.js`'s `emitStructure()` now
creates a real cos compartment (`idearium-spec-<specUuid>`) for every spec
build that doesn't already have one passed in, via the same
`cos-compartment.js` tool copilot uses — which dispatches through
`cos/cli/commands/create.js`'s real SISO gate pipeline (confirmed: "gate
runs before emit() returns", not skipped). Non-fatal if COS is
unavailable — a build this engine already knew how to run without a
compartment must not start failing because COS is down, same honest-
default posture the existing `_seedFromCompartment()` already uses.
`compartmentName` now returned in the build result.

`idearium/compartment.json`'s `cos.axioms` set to
`["cos is the source of all compartments. nothing less."]` (James,
verbatim) — noted honestly as the axiom for a system-identity-level
compartment binding that was NOT what this pass built, kept for if/when
that's actually wanted later.

`docs/nexus.spec` gets a real `cos:` system entry — the 5th system added
this way (after intelligence/loom/versionium/clear-glass last pass),
sourced from `cos/spec/cos.spec` directly, including its own `port: null`
design note so this file doesn't misrepresent it as HTTP-reachable.

#### Test cleanup

Deleted `tests/modules/test-mco6-repo-compartment.js` — confirmed stale on
two independent grounds, not a guess: (1) it tests `compartmentId`
attachment via `bindRepo()`/`verifyBinding()`, imported from
`./compartment-binding.js`, a file confirmed not to exist anywhere in this
codebase or in the MCO7c-n182 handoff that referenced it; (2) it spawns a
real idearium server against the real, non-isolated data directory and
creates real specs named `mco6-auto-<timestamp>` with zero cleanup — the
direct cause of 30 orphaned chunk files found and deleted in
`idearium/data/nodes/chunk/` (gitignored, not tracked, cleaned via
filesystem delete).

Four other compartment-related test files
(`compartment-engine.test.js`, `idearium-phase-compartment-integration.test.js`,
`idearium-phase-compartment.test.mjs`, `mco10-compartment-dom-ledger.test.js`)
were checked and NOT deleted — they test a different mechanism
(`classify()`/`freeze()`/`spawn()`), and lacking the same data-isolation
as MCO7c's newer tests isn't itself evidence of being stale.

## Ledger

### Build 0.39.182 — snap-0626 — 2026-09-20 15:12:20

- Archive: `nexus-0626_2026-09-20_v0.39.182_vnamed-0.39.182.zip` (was `nexus_v0.39.182.zip`)
- SHA-256: `3eda257c9ca2c82a120ee2fe657bbb6784cc0a83547b81a381f11c3e26cecacc`, 126.1 MB, downloaded 2026-09-20 15:13:52
- Kind: full
- Commit: `9e058715da6194c48c5cd7f811d60c8bfe4d040d`, tag `snap-0626`
- Left out: embedded .git (5706 files, HEAD f711ab0107d18dbfbbe74d335a8c0087e8e9369f (master))
- Left out: node_modules (256 files)
- Left out (50 MB or more): `versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)`
- Left out (50 MB or more): `versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)`
- Files in archive: 4657. Changes against the build before it: **1 added, 4 modified, 31 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 0 | 2 | 30 |
| (root) | 1 | 1 | 0 |
| docs | 0 | 1 | 0 |
| tests | 0 | 0 | 1 |

```
A CHANGELOG-0.39.182.md
M docs/nexus.spec
M idearium/compartment.json
D idearium/data/nodes/chunk/mco6-auto-1789886214311.8dd90142-9909-4fba-9518-851cdd862ace.07fd9fd5-51cb-4015-8add-1acea24787c1.chunk
D idearium/data/nodes/chunk/mco6-auto-1789886214311.8dd90142-9909-4fba-9518-851cdd862ace.25abf2e5-05b8-49b5-bfe8-7e20cb62156d.chunk
D idearium/data/nodes/chunk/mco6-auto-1789886214311.8dd90142-9909-4fba-9518-851cdd862ace.2aeb0a8e-b672-44e5-a76b-bb3295c81250.chunk
D idearium/data/nodes/chunk/mco6-auto-1789886214311.8dd90142-9909-4fba-9518-851cdd862ace.70caf28c-7a08-404b-92d1-521e74653a41.chunk
D idearium/data/nodes/chunk/mco6-auto-1789886214311.8dd90142-9909-4fba-9518-851cdd862ace.82f2e416-1996-4fbf-902d-bd73acd38f1b.chunk
D idearium/data/nodes/chunk/mco6-auto-1789886214311.8dd90142-9909-4fba-9518-851cdd862ace.af5b5524-7b57-40a8-ae39-1280ccdf5de4.chunk
D idearium/data/nodes/chunk/mco6-auto-1789886214311.8dd90142-9909-4fba-9518-851cdd862ace.b782dca0-34dc-453e-bfc4-713e2ea0755b.chunk
D idearium/data/nodes/chunk/mco6-auto-1789886214311.8dd90142-9909-4fba-9518-851cdd862ace.f6eef90a-6536-44ba-85a2-d2025c155eee.chunk
D idearium/data/nodes/chunk/mco6-auto-1789886261651.68e21b5f-cdc5-4950-9f42-eb2e2b7f187a.19155b4a-5307-43d7-b6b0-bd997880e0eb.chunk
D idearium/data/nodes/chunk/mco6-auto-1789886261651.68e21b5f-cdc5-4950-9f42-eb2e2b7f187a.35834476-f89d-4781-978f-5f8a6a927c7a.chunk
D idearium/data/nodes/chunk/mco6-auto-1789886261651.68e21b5f-cdc5-4950-9f42-eb2e2b7f187a.54a0a5b5-2142-4b02-bbb3-ea08035f84c2.chunk
D idearium/data/nodes/chunk/mco6-auto-1789886261651.68e21b5f-cdc5-4950-9f42-eb2e2b7f187a.661b6052-db95-4767-ad12-40eea865b214.chunk
D idearium/data/nodes/chunk/mco6-auto-1789886261651.68e21b5f-cdc5-4950-9f42-eb2e2b7f187a.83d5bb00-2ef3-4115-bec2-3143423fb224.chunk
D idearium/data/nodes/chunk/mco6-auto-1789886261651.68e21b5f-cdc5-4950-9f42-eb2e2b7f187a.954cdc6c-b06d-45e4-b69b-986aef16eb5d.chunk
D idearium/data/nodes/chunk/mco6-auto-1789886261651.68e21b5f-cdc5-4950-9f42-eb2e2b7f187a.b52a1452-44f4-4cbf-90b1-b8e2766d024c.chunk
D idearium/data/nodes/chunk/mco6-auto-1789886275688.1f7c661f-4993-4e92-9137-d90a9a9c96f7.bad5439d-43f3-4794-9867-4867d93b28b9.chunk
D idearium/data/nodes/chunk/mco6-auto-1789886275688.1f7c661f-4993-4e92-9137-d90a9a9c96f7.e00e0864-7bee-4456-ac52-bb56ad835c74.chunk
D idearium/data/nodes/chunk/mco6-auto-1789886275688.1f7c661f-4993-4e92-9137-d90a9a9c96f7.ece4cdb8-4696-4f7f-b40f-5695a0d73602.chunk
D idearium/data/nodes/chunk/mco6-auto-1789887000228.bd0f7768-ab69-4948-8456-de817f7ef5cb.945e7afe-b05c-4931-952d-fbdc0f33cee4.chunk
D idearium/data/nodes/chunk/mco6-auto-2-1789886261787.ec6edfdc-4b6d-4c9b-a255-3c582acc39bf.10a7ba86-bd71-47d7-900f-8fb59c469d91.chunk
D idearium/data/nodes/chunk/mco6-auto-2-1789886261787.ec6edfdc-4b6d-4c9b-a255-3c582acc39bf.33f4085b-8675-4e2a-9ff1-f58a9647dd74.chunk
D idearium/data/nodes/chunk/mco6-auto-2-1789886261787.ec6edfdc-4b6d-4c9b-a255-3c582acc39bf.57bf2e75-2d9e-4acc-a008-93e307a6e9ec.chunk
D idearium/data/nodes/chunk/mco6-auto-2-1789886261787.ec6edfdc-4b6d-4c9b-a255-3c582acc39bf.af164e88-6c24-42a3-8668-6ea0c042d9aa.chunk
D idearium/data/nodes/chunk/mco6-auto-2-1789886261787.ec6edfdc-4b6d-4c9b-a255-3c582acc39bf.d12640eb-487e-4d93-93af-fd8940698606.chunk
D idearium/data/nodes/chunk/mco6-auto-2-1789886261787.ec6edfdc-4b6d-4c9b-a255-3c582acc39bf.e8c38d63-dd7c-4500-bacc-11b05f39c46b.chunk
D idearium/data/nodes/chunk/mco6-auto-2-1789886275904.f1cc8aec-c5db-4c35-9fb2-8858e15e6d64.35d5a874-a38f-4054-ba6e-ca56918f2dd3.chunk
D idearium/data/nodes/chunk/mco6-auto-2-1789886275904.f1cc8aec-c5db-4c35-9fb2-8858e15e6d64.549b4df9-2f92-45c6-9928-4385ce76188a.chunk
D idearium/data/nodes/chunk/mco6-auto-2-1789886275904.f1cc8aec-c5db-4c35-9fb2-8858e15e6d64.d62fcbb9-c0df-41bd-b296-ff8437773579.chunk
D idearium/data/nodes/chunk/mco6-auto-2-1789886275904.f1cc8aec-c5db-4c35-9fb2-8858e15e6d64.f2658f38-01cf-4644-a0e6-afd4bfe8f466.chunk
D idearium/data/nodes/chunk/mco6-auto-2-1789887000467.776d758d-dcbb-4891-aef8-78badd2b2fd5.2d3edf3a-4429-46bf-98b7-885715f5b2e1.chunk
M idearium/spec-engine/compiler-t0.js
M package.json
D tests/modules/test-mco6-repo-compartment.js
```

