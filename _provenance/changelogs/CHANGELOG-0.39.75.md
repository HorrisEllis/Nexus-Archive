# Nexus 0.39.75

| | |
|---|---|
| Built | 2026-09-10 20:17:58 → 2026-09-11 00:04:58 |
| Builds on the main line | 3 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.75 |
| Tag | `v0.39.75` → snap-0533 |
| Full file ledger | [LEDGER-0.39.75.csv](../ledger/LEDGER-0.39.75.csv) |

## Ledger

### Build 0.39.75-r1 — snap-0531 — 2026-09-10 20:17:58

- Archive: `nexus-0531_2026-09-10_v0.39.75-r1.zip` (was `nexus-v0.39.75.zip`)
- SHA-256: `0d485699ae1ab3b1386da98d86f2c93d704bfa55731a8d1dccf1cecdcba9541f`, 75.4 MB, downloaded 2026-09-10 20:46:18
- Kind: full
- Commit: `75161ac803abe7cc78dc5321b846d3e99894d94c`, tag `snap-0531`
- Left out: embedded .git (5014 files, HEAD 05fd02d5c9414dbce82799fabb39f085e7a7e9b5 (master))
- Files in archive: 4233. Changes against the build before it: **96 added, 12 modified, 90 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| lib | 1 | 2 | 90 |
| data | 90 | 1 | 0 |
| tests | 4 | 1 | 0 |
| clear-glass | 0 | 2 | 0 |
| copilot | 0 | 2 | 0 |
| (root) | 0 | 1 | 0 |
| contracts | 0 | 1 | 0 |
| docs | 1 | 0 | 0 |
| ollama | 0 | 1 | 0 |
| ui | 0 | 1 | 0 |

```
M clear-glass/renderer/guardian-picker.js
M clear-glass/src/ipc/bridge.js
M contracts/nexus-interaction-contract.js
M copilot/cli.js
M copilot/server.js
A docs/2026-09-11-sovereign-node-architecture-phasemap.spec
M lib/agent-tools/generate-tool-nodes.js
A lib/node-index-watcher.js
M lib/version.js
M ollama/config.js
M package.json
A tests/modules/guardian-picker-answer-roundtrip.test.js
A tests/modules/guardian-picker-cookies-wiring.test.js
A tests/modules/nexus-cli-switch.test.js
A tests/modules/node-index-watcher.test.js
M tests/modules/run-all.js
M ui/tv-shell/menu.js
```

181 more (mostly data, logs and archived files) are in the ledger file.

### Build 0.39.75-r2 — snap-0532 — 2026-09-10 23:13:58

- Archive: `nexus-0532_2026-09-10_v0.39.75-r2_merged.zip` (was `nexus-v0_39_75-merged.zip`)
- SHA-256: `1acfc26726f97929b357f3041430553c8dc6546dc7ddc66c74bd8f6c7d28d5c3`, 75.4 MB, downloaded 2026-09-10 23:32:02
- Kind: full
- Commit: `df93e1f1c067b5f89c689d808c0ce9daf4fa5c57`, tag `snap-0532`
- Left out: embedded .git (5024 files, HEAD 9418a6cdfd27deef8daa2a4f7b0486469324d12a (master))
- Files in archive: 4233. Changes against the build before it: **0 added, 3 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| copilot | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |
| ui | 0 | 1 | 0 |

```
M copilot/server.js
M tests/modules/copilot-provider-toggle.test.js
M ui/tv-shell/menu.js
```

### Build 0.39.75-r3 — snap-0533 — 2026-09-11 00:04:58

- Archive: `nexus-0533_2026-09-11_v0.39.75-r3_merged-1.zip` (was `nexus-v0_39_75-merged-1.zip`)
- SHA-256: `ecbfe8fa59d8e4bc6a006cf1c151580f035197f57b90e8825874874ddce70be2`, 74.8 MB, downloaded 2026-09-11 00:52:02
- Kind: full
- Commit: `deb7d3c28aa0a25fb74dd1bcb1412bd67bb8980f`, tag `snap-0533`
- Left out: embedded .git (5050 files, HEAD 31f24c6a77eb4916b51377db8deca10c530476d3 (master))
- Files in archive: 4233. Changes against the build before it: **23 added, 7 modified, 23 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| _archive | 22 | 0 | 0 |
| (root) | 1 | 4 | 14 |
| docs | 0 | 2 | 8 |
| cli | 0 | 1 | 0 |
| guardian | 0 | 0 | 1 |

```
M .gitignore
D ARCHITECTURE-BRAINSTORM-SYNTHESIS-2026-08-25.md
A ARCHITECTURE-BRAINSTORM-SYNTHESIS-2026-09-10.md
M CHANGELOG.md
D CLEAR-GLASS-CAPABILITY-BREAKDOWN-2026-08-23.md
D CONFIRM-BUILD.md
D CONSOLIDATION-NOTES.md
D GUARDIAN-ARCHIVE-MINING-2026-08-23.md
D HANDOFF-2026-07-11.md
D HANDOFF-2026-08-24.md
D MANIFEST.md
D PATCH-NOTES.md
M README.md
D SESSION-MANIFEST-2026-07-07.md
M START.md
D TUTORIAL.md
D VERIFICATION-LOG.md
A _archive/root-docs-consolidated-2026-09-10/ARCHITECTURE-BRAINSTORM-SYNTHESIS-2026-08-25.md
A _archive/root-docs-consolidated-2026-09-10/CLEAR-GLASS-CAPABILITY-BREAKDOWN-2026-08-23.md
A _archive/root-docs-consolidated-2026-09-10/CONFIRM-BUILD.md
A _archive/root-docs-consolidated-2026-09-10/CONSOLIDATION-NOTES.md
A _archive/root-docs-consolidated-2026-09-10/GUARDIAN-ARCHIVE-MINING-2026-08-23.md
A _archive/root-docs-consolidated-2026-09-10/HANDOFF-2026-07-11.md
A _archive/root-docs-consolidated-2026-09-10/HANDOFF-2026-08-24.md
A _archive/root-docs-consolidated-2026-09-10/MANIFEST.md
A _archive/root-docs-consolidated-2026-09-10/PATCH-NOTES.md
A _archive/root-docs-consolidated-2026-09-10/README.md
A _archive/root-docs-consolidated-2026-09-10/SESSION-MANIFEST-2026-07-07.md
A _archive/root-docs-consolidated-2026-09-10/TUTORIAL.md
A _archive/root-docs-consolidated-2026-09-10/VERIFICATION-LOG.md
A _archive/superseded-docs-2026-09-10/NEXUS-ENCYCLOPEDIA.md
A _archive/superseded-docs-2026-09-10/NEXUS-PHASE-MAP-CROSSREF.md
A _archive/superseded-docs-2026-09-10/NEXUS-PHASE-MAP.md
A _archive/superseded-docs-2026-09-10/NEXUS-PLAIN-ENGLISH.md
A _archive/superseded-docs-2026-09-10/NEXUS-SPEC.md
A _archive/superseded-docs-2026-09-10/NEXUS-SYSTEM.md
A _archive/superseded-docs-2026-09-10/NEXUS.md
A _archive/superseded-docs-2026-09-10/README.md
A _archive/superseded-docs-2026-09-10/phase-map.spec
M cli/session.js
D docs/NEXUS-ENCYCLOPEDIA.md
D docs/NEXUS-PHASE-MAP-CROSSREF.md
D docs/NEXUS-PHASE-MAP.md
D docs/NEXUS-PLAIN-ENGLISH.md
D docs/NEXUS-SPEC.md
D docs/NEXUS-SYSTEM.md
D docs/NEXUS.md
M docs/SPEC-REGISTRY.spec
M docs/nexus.spec
D docs/phase-map.spec
D guardian/powershell.exe
D powershell.exe
D writeback-failures.jsonl
```

