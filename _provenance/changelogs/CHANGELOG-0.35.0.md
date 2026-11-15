# Nexus 0.35.0

| | |
|---|---|
| Built | 2026-08-08 09:27:40 → 2026-08-08 09:27:40 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.35.0 |
| Tag | `v0.35.0` → snap-0337 |
| Full file ledger | [LEDGER-0.35.0.csv](../ledger/LEDGER-0.35.0.csv) |

## Ledger

### Build 0.35.0 — snap-0337 — 2026-08-08 09:27:40

- Archive: `nexus-0337_2026-08-08_v0.35.0_11.zip` (was `nexus (11).zip`)
- SHA-256: `b11c4aac2c145081b00a62dc0ddf0e26ca716a9cc738349e8c48681cc90cbf11`, 38 MB, downloaded 2026-08-08 09:30:23
- Kind: full
- Commit: `d59915615dda0e17192c34ecf5daea8058204963`, tag `snap-0337`
- Left out: embedded .git (6293 files, HEAD 5d611df0578b4e2aece0ac8b0c8e0baea2893b8b (master))
- Files in archive: 3699. Changes against the build before it: **54 added, 55 modified, 69 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 48 | 5 |
| _archive | 48 | 0 | 0 |
| unintegrated | 0 | 0 | 48 |
| idearium | 0 | 0 | 12 |
| docs | 4 | 1 | 0 |
| loom | 0 | 3 | 2 |
| lib | 1 | 1 | 1 |
| tests | 1 | 1 | 1 |
| cortex | 0 | 1 | 0 |

```
A docs/HISTORY-BOOKSHELF.md
M docs/SPEC-REGISTRY.md
A docs/loom-phasemap-section-phasemap.spec
A docs/nexus-system-standardization-phasemap.spec
A docs/raid-routing-fidelity-phasemap.spec
A lib/integrity-revert.js
D lib/ledger-tail.js
M lib/version.js
M loom/bootstrap.js
M loom/maps/observability-map.js
D loom/scanners/dangling-report.js
D loom/scanners/source-map.js
D tests/modules/ledger-tail.test.js
M tests/modules/run-all.js
A tests/modules/test-integrity-revert.js
D unintegrated/2026-07-branch-a-additions/agent-tools/run-cockpit-command.js
D unintegrated/2026-07-branch-a-additions/clear-glass/ncp-client.js
D unintegrated/2026-07-branch-a-additions/docs/CHANGELOG-SESSION-2026-07-08.md
D unintegrated/2026-07-branch-a-additions/docs/NEXUS-ENCYCLOPEDIA.md
D unintegrated/2026-07-branch-a-additions/docs/NEXUS-PLAIN-ENGLISH.md
D unintegrated/2026-07-branch-a-additions/docs/RFR2-SUBENGINE-WIRING-MAP-2026-07-09.md
D unintegrated/2026-07-branch-a-additions/docs/SESSION-MANIFEST-2026-07-07.md
D unintegrated/2026-07-branch-a-additions/docs/docs-level-genesis.spec
D unintegrated/2026-07-branch-a-additions/docs/nexus-selfdiag-registry-interface.spec
D unintegrated/2026-07-branch-a-additions/lib/autonomous-loop.js
D unintegrated/2026-07-branch-a-additions/lib/compartment-engine.js
D unintegrated/2026-07-branch-a-additions/orchestrator-lib/autonomous-loop.js
D unintegrated/2026-07-branch-a-additions/tests/compartment-engine.test.js
D unintegrated/2026-07-branch-a-additions/tests/idearium-warp-dispatch.test.mjs
D unintegrated/2026-07-branch-a-additions/ui/build-channel/build.css
D unintegrated/2026-07-branch-a-additions/ui/build-channel/build.html
D unintegrated/2026-07-branch-a-additions/ui/consent/consent-gate.css
D unintegrated/2026-07-branch-a-additions/ui/consent/consent-gate.html
D unintegrated/2026-07-branch-a-additions/ui/home/nexus-home.html
D unintegrated/2026-07-branch-a-additions/ui/home/shell.css
D unintegrated/2026-07-branch-a-additions/ui/toast/toast.css
D unintegrated/2026-07-branch-a-additions/ui/tutorial/tutorial.css
D unintegrated/2026-07-branch-b-cortex-v2/cortex/cortex-intelligence-index.js
D unintegrated/2026-07-branch-b-cortex-v2/cortex/cortex-v2.js
D unintegrated/2026-07-branch-b-cortex-v2/cortex/liminal-space/index.js
D unintegrated/2026-07-branch-b-cortex-v2/cortex/versionium/causality.js
D unintegrated/2026-07-branch-b-cortex-v2/cortex/versionium/index.js
D unintegrated/2026-07-branch-b-cortex-v2/lib/meta/spatial/index.js
D unintegrated/2026-07-branch-b-cortex-v2/lib/meta/spatial/lattice.js
D unintegrated/2026-07-branch-b-cortex-v2/lib/meta/spatial/sigma.js
D unintegrated/2026-07-branch-b-cortex-v2/lib/meta/telemetry-codec/latent-model.js
D unintegrated/2026-07-branch-b-cortex-v2/lib/meta/topo-kernel/bus.js
D unintegrated/2026-07-branch-b-cortex-v2/lib/meta/topo-kernel/field.schema.json
D unintegrated/2026-07-branch-b-cortex-v2/lib/meta/topo-kernel/index.js
D unintegrated/2026-07-branch-b-cortex-v2/lib/meta/topo-kernel/signal.schema.json
D unintegrated/2026-07-branch-b-cortex-v2/lib/meta/topo-kernel/snr.js
D unintegrated/README.md
D unintegrated/rfr2-nexus/adapter-sandbox/index.js
D unintegrated/rfr2-nexus/clip/index.js
D unintegrated/rfr2-nexus/compress/index.js
D unintegrated/rfr2-nexus/context/index.js
D unintegrated/rfr2-nexus/delta/index.js
D unintegrated/rfr2-nexus/enforcement/index.js
D unintegrated/rfr2-nexus/identity/index.js
D unintegrated/rfr2-nexus/observer/index.js
D unintegrated/rfr2-nexus/query/index.js
D unintegrated/rfr2-nexus/time/index.js
D unintegrated/rfr2-nexus/version-gate/index.js
```

115 more (mostly data, logs and archived files) are in the ledger file.

