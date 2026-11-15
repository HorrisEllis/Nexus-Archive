# Nexus 0.60.135

**0.60.135 — 2026-10-17**

| | |
|---|---|
| Built | 2026-10-17 12:39:16 → 2026-10-17 12:39:16 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.60.135 |
| Tag | `v0.60.135` → snap-0761 |
| Full file ledger | [LEDGER-0.60.135.csv](../ledger/LEDGER-0.60.135.csv) |

## Release notes — `CHANGELOG-0.60.135.md`

Copied unchanged from the build.

### 0.60.135 — 2026-10-17

James: "use the axioms in the docs for each disicio nthat doesn't show my competence"

He said it after a day of questions handed to him that the axioms already answered. The rule is now in `docs/CLAUDE.md`:
- A technical decision is the coder's to make by `docs/AXIOMS-v3.1.md`. It is recorded with the axioms that decide it, as
  the coder's decision and never as his.
- What stays his (USER_AUTONOMY): what he meant by his words, the direction, and any call he has said is his.
- He can overturn any decision, by a dated addendum that quotes both (§0.3).

The test the coder uses: a decision is his when the answer depends on what he wants (intent, priority, taste, meaning). It
is the axioms' when they already say which way to go.

#### Decided by the axioms (`docs/2026-10-17-decisions-by-the-axioms.spec`)

| # | Was | Decision | Axioms |
|---|---|---|---|
| D1 | DB0a / IM0d | `lib/` is the kernel, mounted read-only into every compartment. Anything in it that has its own state or lifecycle moves to its system | §5.9, §0.5, §16.7, §10.1, §5.14 |
| D2 | DB0b | Between systems, the routes and the CLI, in his words. Inside one system, in-process. One contract and one handshake either way | §5.10, §5.11, §5.14, §5.9 |
| D3 | DB0c | The ratchet | §0.4, §1.2, §3.1 |
| D4 | IM0a | State out of git. The generated projections go first, because they regenerate at boot. Any other data file goes only after a backup exists outside git, because untracking deletes the file on his next pull | §10.2, §10.3, §0.3, §2.2 |
| D5 | IM0b | The CHANGELOGs move to `docs/changelogs/`. The release reads both places | FILES_WITH_THEIR_SYSTEM, §0.3, §0.5 |
| D6 | IM0c | A system's tests go with it as it migrates. Tests of a contract between systems stay central | §5.9, SOVEREIGN_FOLDER, §4.1 |
| D7 | IM0e | A primitive has no state, no lifecycle and no data type of its own. The bus, the connector, siso, warp's core and the hook map are primitives. RAID, CFR, gap and baseline are capabilities. RFR2 is split module by module | §5.9, §10.1, §5.1, §8.3, §9.1 |
| D8 | PC0a | Pieces are built against declared interfaces. His answer was "[No preference]". This serves his "It's not linear. Like a torrent downloads." | §5.10, §5.14, §3.1 |
| D9 | PC0b | The first piece kinds are the ones Nexus already makes. His answer was "[No preference]" | §16.4, §0.5 |

#### Still his

- PC0c, who writes the manifest. He said "thats on me".
- Every reading of his words marked "to confirm".
- What comes next.

#### What it changes

The status in each owning map now reads "DECIDED … by the axioms (the coder)" and points at the record:
- the drawbridge map, DB0a-c;
- the migration map, IM0a-e;
- the pieces map, PC0a-b.

IM2 can now run, under D4, D5 and D6. IM4 can now run, under D1 and D7. PC1 still waits on PC0c, which is his.

No code changed.

## Ledger

### Build 0.60.135 — snap-0761 — 2026-10-17 12:39:16

- Archive: `nexus-0761_2026-10-17_v0.60.135.zip` (was `nexus-0.60.135.zip`)
- SHA-256: `56b079f79d2dcef64ed3b5f80043a8746288369194795fa427ac59d144daa3d1`, 24 MB, downloaded 2026-10-17 12:46:05
- Kind: full
- Commit: `61c98c22d6cc1e2eac7b30066f012b669e227bd1`, tag `snap-0761`
- Redacted: `tests/modules/test-cookie-vault-jaa.test.js (1 x sk-key)`
- Files in archive: 6103. Changes against the build before it: **31 added, 59 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| (root) | 11 | 2 | 0 |
| tests | 8 | 5 | 0 |
| lib | 6 | 5 | 0 |
| docs | 3 | 8 | 0 |
| cos | 1 | 6 | 0 |
| loom | 1 | 5 | 0 |
| idearium | 0 | 6 | 0 |
| clear-glass | 0 | 5 | 0 |
| intelligence | 0 | 4 | 0 |
| guardian | 0 | 2 | 0 |
| cortex | 0 | 2 | 0 |
| copilot | 0 | 2 | 0 |
| versionium | 0 | 2 | 0 |
| contracts | 1 | 0 | 0 |
| architect | 0 | 1 | 0 |
| nexus-healer | 0 | 1 | 0 |
| ollama | 0 | 1 | 0 |
| orchestrator | 0 | 1 | 0 |
| diagnostic | 0 | 1 | 0 |

```
A CHANGELOG-0.60.125.md
A CHANGELOG-0.60.126.md
A CHANGELOG-0.60.127.md
A CHANGELOG-0.60.128.md
A CHANGELOG-0.60.129.md
A CHANGELOG-0.60.130.md
A CHANGELOG-0.60.131.md
A CHANGELOG-0.60.132.md
A CHANGELOG-0.60.133.md
A CHANGELOG-0.60.134.md
A CHANGELOG-0.60.135.md
M VERSION
M architect/service.js
M clear-glass/src/cookies/vault.js
M clear-glass/src/downloads/artifact-chat-index.js
M clear-glass/src/main/index.js
M clear-glass/src/passwords/vault.js
M clear-glass/src/storage/jaa.js
A contracts/drawbridge-baseline.json
M copilot/lib/inject-config.js
M copilot/server.js
M cortex/boot.js
M cortex/memory/jaa-db.js
M cos/archetype/genesis-catalog.js
A cos/archetype/nexus-system/lib/boundary.js
M cos/archetype/nexus-system/lib/heartbeat.js
M cos/archetype/nexus-system/lib/system.js
M cos/archetype/nexus-system/registry-components.js
M cos/archetype/nexus-system/server.js
M cos/archetype/nexus-system/tests/skeleton.test.js
M diagnostic/nexus-diagnostic.js
M docs/2026-09-11-sovereign-node-architecture-phasemap.spec
M docs/2026-10-10-design-surface-phasemap.spec
M docs/2026-10-15-gate-held-work-phasemap.spec
A docs/2026-10-17-decisions-by-the-axioms.spec
A docs/2026-10-17-infrastructure-migration-phasemap.spec
M docs/2026-10-17-pieces-not-order-phasemap.spec
A docs/2026-10-17-system-drawbridge-phasemap.spec
M docs/CLAUDE.md
M docs/PROOF-OF-COMPETENCY.md
M docs/SPEC-REGISTRY.spec
M docs/architecture-spec/architecture-spec.spec
M guardian/jaa-store.js
M guardian/server.js
M idearium/api/index.js
M idearium/cli/route-commands.js
M idearium/spec-engine/templates/architecture-spec.template.yaml
M idearium/spec-engine/templates/genesis.spec
M idearium/ui/js/phases.js
M idearium/ui/js/plan-panel.js
M intelligence/lib/domain-nodes.js
M intelligence/registry-components.js
M intelligence/routes.js
M intelligence/server.js
A lib/drawbridge-registry.js
A lib/jaa-store.js
M lib/ledger-store.js
M lib/node-index.js
A lib/node-registry.js
A lib/phase-deps-gate.js
A lib/system-boundary.js
M lib/system-nodes.js
M lib/system-registry.js
A lib/system-store.js
M lib/version.js
M loom/maps/build-surface-map.js
M loom/maps/run-state-map.js
M loom/registry-components.js
M loom/scanners/capability-map.js
M loom/server.js
A loom/templates/cos-compartment.js
M nexus-healer/api/index.js
M ollama/server.js
M orchestrator/orchestrator.js
M package.json
M tests/modules/run-all.js
M tests/modules/test-artifact-index-jaa.test.js
M tests/modules/test-cookie-vault-jaa.test.js
A tests/modules/test-cos-compartment-template.test.js
A tests/modules/test-drawbridge-registry.test.js
M tests/modules/test-genesis-and-architecture-spec.test.js
A tests/modules/test-node-registry-system.test.js
M tests/modules/test-one-idearium-phases-nodes.test.js
A tests/modules/test-phase-deps-gate.test.js
A tests/modules/test-sovereign-systems.test.js
A tests/modules/test-system-boundary.test.js
A tests/modules/test-system-node-relations.test.js
A tests/modules/test-system-tunnel.test.js
M versionium/lib/store.js
M versionium/server.js
```

