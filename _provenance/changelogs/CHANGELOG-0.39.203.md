# Nexus 0.39.203

| | |
|---|---|
| Built | 2026-09-21 07:58:22 → 2026-09-21 11:55:26 |
| Builds on the main line | 2 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.203 |
| Tag | `v0.39.203` → snap-0637 |
| Full file ledger | [LEDGER-0.39.203.csv](../ledger/LEDGER-0.39.203.csv) |

## Ledger

### Build 0.39.203-r1 — snap-0636 — 2026-09-21 07:58:22

- Archive: `nexus-0636_2026-09-21_v0.39.203-r1.zip` (was `Nexus_v0_39_203.zip`)
- SHA-256: `da965bfbef459f471265f6ca781f76dd372922c17ee75bd8bd429334978df6d8`, 131.3 MB, downloaded 2026-09-21 08:53:26
- Kind: full
- Commit: `49a9c961192ff8592e062fbebf46394c406b1911`, tag `snap-0636`
- Left out: embedded .git (6151 files, HEAD a4f9bfb7bfc06ba1f31e51d608f7de55f287a14b (master))
- Left out (50 MB or more): `versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)`
- Left out (50 MB or more): `versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)`
- Files in archive: 4412. Changes against the build before it: **7 added, 18 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 2 | 5 | 0 |
| idearium | 0 | 6 | 0 |
| tests | 3 | 3 | 0 |
| cos | 2 | 2 | 0 |
| (root) | 0 | 2 | 0 |

```
A cos/compartment/guest-agent.js
M cos/compartment/qemu-runtime.js
M cos/playground/sandbox.js
A cos/testenv/index.js
M idearium/api/index.js
M idearium/interaction-contract.json
M idearium/registry-components.js
M idearium/spec-engine/index.js
M idearium/ui/index.html
M idearium/ui/js/app.js
M lib/file-tree-plan.js
M lib/node-export.js
A lib/node-schemas/schema.filetree
M lib/node-schemas/schema.inject
M lib/repo-agent.js
A lib/repo-run.js
M lib/version.js
M package.json
M run-all.js
M tests/modules/run-all.js
A tests/modules/test-cos-testenv.js
M tests/modules/test-file-tree-plan.js
A tests/modules/test-repo-agent-provider.js
A tests/modules/test-repo-run.js
M tests/modules/test-repo-toolbar-mode.js
```

### Build 0.39.203-r2 — snap-0637 — 2026-09-21 11:55:26

- Archive: `nexus-0637_2026-09-21_v0.39.203-r2_203-guardian-fix.zip` (was `nexus-203-guardian-fix.zip`)
- SHA-256: `7bb85f8dd88983106ba2719f8522fbea5867fef61de32dd626390e57931702de`, 0.1 MB, downloaded 2026-09-21 12:26:03
- Kind: overlay (a patch laid over the build before it)
- Commit: `40197b5a41cfadbe6d1dd3d766a49552e1eff137`, tag `snap-0637`
- Files in archive: 7. Changes against the build before it: **1 added, 6 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 0 | 3 | 0 |
| tests | 1 | 1 | 0 |
| cortex | 0 | 1 | 0 |
| nexus | 0 | 1 | 0 |

```
M cortex/contract/index.js
M idearium/agent-suite/index.js
M idearium/api/index.js
M idearium/spec-engine/index.js
M nexus/autopilot.js
A tests/modules/idearium-guardian-dispatch.test.js
M tests/modules/run-all.js
```

