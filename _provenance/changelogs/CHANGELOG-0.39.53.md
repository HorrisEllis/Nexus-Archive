# Nexus 0.39.53

| | |
|---|---|
| Built | 2026-09-06 10:08:30 → 2026-09-06 16:32:26 |
| Builds on the main line | 3 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.53, 0.39.57 |
| Tag | `v0.39.53` → snap-0514 |
| Full file ledger | [LEDGER-0.39.53.csv](../ledger/LEDGER-0.39.53.csv) |

## Ledger

### Build 0.39.53-r1 — snap-0512 — 2026-09-06 10:08:30

- Archive: `nexus-0512_2026-09-06_v0.39.53-r1.zip` (was `nexus-v0_39_53.zip`)
- SHA-256: `b1eb6f1f35606203524bbab9fe2ef828c11065f037b3cfe055055e3a6971f6bc`, 98 MB, downloaded 2026-09-06 10:10:08
- Kind: full
- Commit: `54d9116d818b0e39b632994e59aec6e0cde21b12`, tag `snap-0512`
- Identical copy: `nexus-0512_2026-09-06_v0.39.53-r1_1_dup1.zip` (was `nexus-v0_39_53 (1).zip`)
- Left out: embedded .git (4243 files, HEAD 18311db2128f82752e6b715023c07213367c88f3 (master))
- Left out: node_modules (39 files)
- Files in archive: 4021. Changes against the build before it: **0 added, 3 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| (root) | 0 | 2 | 0 |
| lib | 0 | 1 | 0 |

```
M lib/version.js
M package-lock.json
M package.json
```

### Build 0.39.53-r2 — snap-0513 — 2026-09-06 12:01:20

- Archive: `nexus-0513_2026-09-06_v0.39.53-r2.zip` (was `nexus-v0.39.53.zip`)
- SHA-256: `8fbb5f2b9a4f28e397a915018cd085403897eb07b56986b1ad09820406ae4947`, 67.6 MB, downloaded 2026-09-06 12:05:41
- Kind: full
- Commit: `7bbd6e361c7a8717fc02884c79fce145d512ba61`, tag `snap-0513`
- Left out: embedded .git (4301 files, HEAD 2e6f93f5bfb273bea20852b6970d3e003366745c (master))
- Files in archive: 3671. Changes against the build before it: **60 added, 54 modified, 410 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 1 | 17 | 385 |
| cortex | 53 | 2 | 14 |
| tests | 4 | 9 | 5 |
| clear-glass | 0 | 6 | 2 |
| lib | 1 | 3 | 1 |
| idearium | 0 | 3 | 1 |
| (root) | 0 | 3 | 0 |
| _archive | 0 | 0 | 2 |
| ui | 0 | 2 | 0 |
| copilot | 0 | 2 | 0 |
| architect | 0 | 2 | 0 |
| eravos | 0 | 1 | 0 |
| loom | 0 | 1 | 0 |
| ollama | 0 | 1 | 0 |
| service | 0 | 1 | 0 |
| docs | 0 | 1 | 0 |
| emerge | 1 | 0 | 0 |

```
M architect/service.js
M autopilot.js
M blueprint-index.json
M clear-glass/renderer/browser.html
M clear-glass/renderer/browser.js
D clear-glass/renderer/mesh-picker.js
M clear-glass/src/mesh/agent-mesh.js
M clear-glass/src/network/install.js
D clear-glass/src/network/pulse-registry.js
M clear-glass/src/network/routes.js
M clear-glass/src/providers/gm-shim.js
M copilot/module-builder.js
M copilot/server.js
M cortex/core/raid/contract-intake.js
M docs/2026-09-05-observability-sovereignty-and-agent-mesh-phasemap.spec
A emerge/consumer.js
M eravos/server.js
A lib/seam/cos-seam-parser.js
M lib/seam/index.js
M lib/seam/queue.js
D lib/system-registry.js
M lib/version.js
M ollama/config.js
M package-lock.json
M service/nexus-diagnostic.js
A tests/lib/cos-seam-artifact-staging.test.js
A tests/lib/cos-seam-parser.test.js
M tests/modules/contract-intake-dependency-graph.test.js
A tests/modules/contract-intake-tangible-file.test.js
A tests/modules/copilot-provider-toggle.test.js
M tests/modules/raid-retry-escalation.test.js
M tests/modules/run-all.js
M tests/modules/test-am1-intent-contract.js
D tests/modules/test-architect-pulse-migration.js
M tests/modules/test-b1-synthesize-contract.js
D tests/modules/test-emerge-direct-compile.js
D tests/modules/test-eravos-pulse-migration.js
D tests/modules/test-gm-shim-sse-streaming.js
M tests/modules/test-node-schemas.js
M tests/modules/test-raid-officiator.js
M tests/modules/test-raid-processnext-am1-gate.js
D tests/modules/test-system-registry.js
M tests/verify-ncp-agents.js
M ui/orchestrator/index.html
M ui/tv-shell/index.html
```

479 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.39.53-r3 — snap-0514 — 2026-09-06 16:32:26

- Archive: `nexus-0514_2026-09-06_v0.39.53-r3_declared-0.39.57.zip` (was `nexus-v0_39_57.zip`)
- SHA-256: `603a259a970fc60e2b6d90e033c4ab52847181c5624ddf8412240da7bf2f7e93`, 161.2 MB, downloaded 2026-09-06 16:39:42
- Kind: full
- Claimed version: 0.39.57 (registry 0.39.57, file name 0.39.57); filed under 0.39.53 to keep the line in order
- Commit: `c26ae3d3093850607e31e3a2a1460d3db7d61b7c`, tag `snap-0514`
- Identical copy: `nexus-0514_2026-09-06_v0.39.53-r3_1_dup1_declared-0.39.57.zip` (was `nexus-v0_39_57 (1).zip`)
- Left out: embedded .git (4243 files, HEAD 18311db2128f82752e6b715023c07213367c88f3 (master))
- Left out: node_modules (39 files)
- Files in archive: 4208. Changes against the build before it: **612 added, 88 modified, 75 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 405 | 39 | 0 |
| cortex | 169 | 2 | 53 |
| tests | 12 | 12 | 4 |
| clear-glass | 2 | 7 | 12 |
| _archive | 14 | 0 | 0 |
| lib | 4 | 4 | 1 |
| ui | 5 | 2 | 0 |
| (root) | 0 | 5 | 0 |
| docs | 0 | 4 | 0 |
| idearium | 1 | 3 | 0 |
| nexus | 0 | 0 | 4 |
| architect | 0 | 2 | 0 |
| guardian | 0 | 2 | 0 |
| copilot | 0 | 2 | 0 |
| emerge | 0 | 0 | 1 |
| loom | 0 | 1 | 0 |
| ollama | 0 | 1 | 0 |
| service | 0 | 1 | 0 |
| eravos | 0 | 1 | 0 |

```
M architect/service.js
M autopilot.js
M blueprint-index.json
M clear-glass/renderer/browser.html
M clear-glass/renderer/browser.js
A clear-glass/renderer/mesh-picker.js
M clear-glass/src/main/index.js
M clear-glass/src/mesh/agent-mesh.js
D clear-glass/src/network/canvas-persistence.js
D clear-glass/src/network/config.js
D clear-glass/src/network/crypto-engine.js
D clear-glass/src/network/daemons.js
D clear-glass/src/network/ddns.js
D clear-glass/src/network/dns-server.js
D clear-glass/src/network/firewall.js
D clear-glass/src/network/host-rotation.js
M clear-glass/src/network/install.js
D clear-glass/src/network/key-manager.js
D clear-glass/src/network/network-snr-filter.js
D clear-glass/src/network/port-registry.js
A clear-glass/src/network/pulse-registry.js
D clear-glass/src/network/reverse-proxy.js
M clear-glass/src/network/routes.js
M clear-glass/src/providers/gm-shim.js
M copilot/module-builder.js
M copilot/server.js
M cortex/core/raid/contract-intake.js
M docs/2026-09-05-observability-sovereignty-and-agent-mesh-phasemap.spec
M docs/brainos-live-control-panel.spec
M docs/command-index-per-system.spec
M docs/nexus-nerve-design-philosophy.spec
D emerge/consumer.js
M eravos/server.js
M guardian/config.js
M guardian/server.js
M lib/agent-tools/index.js
A lib/agent-tools/tools/agent-mesh/route.js
A lib/agent-tools/tools/guardian/dispatch.js
A lib/agent-tools/tools/ncp/status.js
D lib/seam/cos-seam-parser.js
M lib/seam/index.js
M lib/seam/queue.js
A lib/system-registry.js
M lib/version.js
D nexus/ui/brainos/brainos-canvas.js
D nexus/ui/brainos/brainos-interaction-contract.json
D nexus/ui/brainos/brainos.css
D nexus/ui/brainos/brainos.js
M ollama/config.js
M package-lock.json
M package.json
M service/nexus-diagnostic.js
D tests/lib/cos-seam-artifact-staging.test.js
D tests/lib/cos-seam-parser.test.js
M tests/modules/brainos-canvas.test.js
M tests/modules/brainos-panel-canvas-integration.test.js
M tests/modules/brainos-panel.test.js
M tests/modules/contract-intake-dependency-graph.test.js
D tests/modules/contract-intake-tangible-file.test.js
D tests/modules/copilot-provider-toggle.test.js
M tests/modules/raid-retry-escalation.test.js
M tests/modules/run-all.js
A tests/modules/test-agent-mesh-view-endpoint.js
M tests/modules/test-am1-intent-contract.js
A tests/modules/test-architect-pulse-migration.js
M tests/modules/test-b1-synthesize-contract.js
A tests/modules/test-brainos-canvas-agent-mesh.js
A tests/modules/test-brainos-dynamic-mesh-canvas.js
A tests/modules/test-brainos-real-access-path.js
A tests/modules/test-copilot-tools-guardian-ncp-mesh.js
A tests/modules/test-emerge-direct-compile.js
A tests/modules/test-eravos-pulse-migration.js
A tests/modules/test-gm-shim-sse-streaming.js
A tests/modules/test-guardian-data-sovereignty.js
A tests/modules/test-network-infra-retired.js
M tests/modules/test-node-schemas.js
M tests/modules/test-raid-officiator.js
M tests/modules/test-raid-processnext-am1-gate.js
A tests/modules/test-system-registry.js
M tests/verify-ncp-agents.js
A ui/brainos/brainos-canvas.js
A ui/brainos/brainos-interaction-contract.json
A ui/brainos/brainos.css
A ui/brainos/brainos.js
A ui/brainos/index.html
M ui/orchestrator/index.html
M ui/tv-shell/index.html
```

688 more (mostly data, logs and archived files) are in the ledger file.

