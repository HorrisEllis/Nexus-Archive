# Nexus 0.39.327

**0.39.327 — 2026-10-05**

| | |
|---|---|
| Built | 2026-10-05 04:57:02 → 2026-10-05 04:57:02 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.327 |
| Tag | `v0.39.327` → snap-0729 |
| Full file ledger | [LEDGER-0.39.327.csv](../ledger/LEDGER-0.39.327.csv) |

## Release notes — `CHANGELOG-0.39.327.md`

Copied unchanged from the build.

### 0.39.327 — 2026-10-05

James: "i though we switched to heartbeat and pulse system". He had pasted `[diagnostic] 'idearium' missed its /health probe but registered 8s ago — treating as ONLINE`.

- `diagnostic/nexus-diagnostic.js` read the pulse first only for clear-glass (`preferHeartbeat: true`). Every other system was HTTP-probed first. A system still booting missed the probe, and the registry rescued it a moment later. That rescue is the line he pasted.
- The pulse is now read first for every system. Each system sends `createPulse` → POST `/api/heartbeat` every 10 s, and orchestrator watches for missed pulses. The `/health` probe is the fallback for a system orchestrator has not heard from: no pulse yet, or orchestrator itself down. `preferHeartbeat: false` opts a system out.
- What a pulse does not prove, said plainly: that the system's own server is answering requests. It proves the process is alive and reaching orchestrator. A blocked event loop stops both, so in practice they fail together.
- `test-health-authority` HA-009 is new (9/9). diagnostic-heal-path, system-registry and boot-log-fixes are unchanged and pass.

## Ledger

### Build 0.39.327 — snap-0729 — 2026-10-05 04:57:02

- Archive: `nexus-0729_2026-10-05_v0.39.327_main-26.zip` (was `Nexus-main-26.zip`)
- SHA-256: `df935f3c1c2c85f8a65e9c705899575ff687d87fc80ffef36f1b63649afd4743`, 14.5 MB, downloaded 2026-10-05 05:22:12
- Kind: full
- Commit: `59c90ea9f211a17243c8f179534ad7732b5f4c09`, tag `snap-0729`
- Files in archive: 5245. Changes against the build before it: **4 added, 15 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 0 | 6 | 0 |
| (root) | 3 | 1 | 0 |
| tests | 1 | 3 | 0 |
| loom | 0 | 2 | 0 |
| diagnostic | 0 | 1 | 0 |
| docs | 0 | 1 | 0 |
| idearium | 0 | 1 | 0 |

```
A CHANGELOG-0.39.325.md
A CHANGELOG-0.39.326.md
A CHANGELOG-0.39.327.md
M diagnostic/nexus-diagnostic.js
M docs/2026-10-05-build-from-the-spec-phasemap.spec
M idearium/api/index.js
M lib/agent-tools/tools/idearium/repo-chunks.js
M lib/registry-harness.js
M lib/repo-agent.js
M lib/repo-hat.js
M lib/repo-prompt-blocks.js
M lib/version.js
M loom/data/events.json
M loom/data/registry.json
M package.json
M tests/modules/run-all.js
A tests/modules/test-agent-context-always.test.js
M tests/modules/test-health-authority.js
M tests/modules/test-repo-chunks-tool.js
```

