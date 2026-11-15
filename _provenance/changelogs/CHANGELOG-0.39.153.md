# Nexus 0.39.153

| | |
|---|---|
| Built | 2026-09-19 07:23:42 → 2026-09-19 08:05:54 |
| Builds on the main line | 3 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.153 |
| Tag | `v0.39.153` → snap-0611 |
| Full file ledger | [LEDGER-0.39.153.csv](../ledger/LEDGER-0.39.153.csv) |

## Ledger

### Build 0.39.153-r1 — snap-0609 — 2026-09-19 07:23:42

- Archive: `nexus-0609_2026-09-19_v0.39.153-r1.zip` (was `Nexus_v0_39_153.zip`)
- SHA-256: `d43caa1ecf1c8b11d64bf412f5f9f29655764f2ec270d98e2800c0988278c303`, 116.2 MB, downloaded 2026-09-19 07:24:25
- Kind: full
- Commit: `8987dba0a4082ba8e3a7a3c9eb202743ba3219df`, tag `snap-0609`
- Left out: embedded .git (5437 files, HEAD 87edf489749c6895ec57c0040eb44900d2283672 (master))
- Left out: node_modules (260 files)
- Left out (50 MB or more): `versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)`
- Left out (50 MB or more): `versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)`
- Files in archive: 4276. Changes against the build before it: **411 added, 43 modified, 17 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 334 | 31 | 0 |
| intelligence | 33 | 0 | 0 |
| cortex | 2 | 3 | 17 |
| versionium | 19 | 2 | 0 |
| (root) | 1 | 3 | 0 |
| lib | 2 | 2 | 0 |
| architect | 2 | 1 | 0 |
| copilot | 3 | 0 | 0 |
| docs | 2 | 1 | 0 |
| diagnostic | 2 | 0 | 0 |
| eravos | 2 | 0 | 0 |
| guardian | 2 | 0 | 0 |
| idearium | 2 | 0 | 0 |
| loom | 2 | 0 | 0 |
| ollama | 2 | 0 | 0 |
| tests | 1 | 0 | 0 |

```
A .npmrc
M blueprint-index.json
M cortex/boot.js
M cortex/snapshot/index.js
D cortex/versionium/causality.js
D cortex/versionium/index.js
A docs/2026-09-19-architect-blueprint-forge-idearium-phasemap.spec
A docs/2026-09-19-versionium-snapshot-and-ledger-decision.md
M docs/CHANGELOG.md
M lib/component-ledger.js
A lib/ledger-store.js
A lib/migrate-ledger-per-system.js
M lib/version.js
M package-lock.json
M package.json
A tests/modules/test-versionium-snapshot-migration.js
A versionium/lib/migrate-cortex-snapshots.js
A versionium/lib/snapshot.js
M versionium/server.js
M versionium/spec/versionium.spec
```

451 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.39.153-r2 — snap-0610 — 2026-09-19 07:57:06

- Archive: `nexus-0610_2026-09-19_v0.39.153-r2_patched.zip` (was `Nexus_v0_39_153_patched.zip`)
- SHA-256: `c6c6c162b698020085336bcb505029b242623a02bcdb05ad9749b5201c25682d`, 116.2 MB, downloaded 2026-09-19 07:59:37
- Kind: full
- Commit: `51efec9fddb14194b962a21d8baa6c2b1c443cf3`, tag `snap-0610`
- Left out: embedded .git (5437 files, HEAD 87edf489749c6895ec57c0040eb44900d2283672 (master))
- Left out: node_modules (260 files)
- Left out (50 MB or more): `versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)`
- Left out (50 MB or more): `versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)`
- Files in archive: 4277. Changes against the build before it: **1 added, 5 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 1 | 4 | 0 |
| guardian | 0 | 1 | 0 |

```
M clear-glass/src/dom/archaeology.js
M clear-glass/src/driver/index.js
M clear-glass/src/main/index.js
M clear-glass/src/mesh/agent-mesh.js
A clear-glass/src/mesh/custom-agent-driver.js
M guardian/lib/dispatcher.js
```

### Build 0.39.153-r3 — snap-0611 — 2026-09-19 08:05:54

- Archive: `nexus-0611_2026-09-19_v0.39.153-r3_patched-1.zip` (was `Nexus_v0_39_153_patched-1.zip`)
- SHA-256: `03c3ce09f1d0e4d9e9f0c2e5bb4cf507d73a379455d5a6e1fc58ddb18ba10ddd`, 116.2 MB, downloaded 2026-09-19 08:12:59
- Kind: full
- Commit: `b782c8e3e985c5670f64b8c3b474675130e1fffb`, tag `snap-0611`
- Left out: embedded .git (5437 files, HEAD 87edf489749c6895ec57c0040eb44900d2283672 (master))
- Left out: node_modules (260 files)
- Left out (50 MB or more): `versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)`
- Left out (50 MB or more): `versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)`
- Files in archive: 4277. Changes against the build before it: **0 added, 2 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 0 | 2 | 0 |

```
M clear-glass/src/main/index.js
M clear-glass/src/mesh/custom-agent-driver.js
```

