# Nexus 0.39.121

| | |
|---|---|
| Built | 2026-09-12 19:25:28 → 2026-09-12 19:25:28 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.121 |
| Tag | `v0.39.121` → snap-0564 |
| Full file ledger | [LEDGER-0.39.121.csv](../ledger/LEDGER-0.39.121.csv) |

## Ledger

### Build 0.39.121 — snap-0564 — 2026-09-12 19:25:28

- Archive: `nexus-0564_2026-09-12_v0.39.121_pollution-fix.zip` (was `nexus-v0.39.121-pollution-fix.zip`)
- SHA-256: `f0e7eee8f636dfa512f4795b3e946ceb369c07bb61edc6781e0208b35436da37`, 98.5 MB, downloaded 2026-09-12 19:36:30
- Kind: full
- Commit: `3943d12bac23dbf18f4dbb191586a95085e862a2`, tag `snap-0564`
- Left out: embedded .git (6269 files, HEAD ee344d6e0a4feaf93df34a3b646ce6851f0376bb (master))
- Left out: node_modules (53 files)
- Files in archive: 11057. Changes against the build before it: **4 added, 12 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 6 | 0 |
| lib | 1 | 3 | 0 |
| (root) | 0 | 2 | 0 |
| tests | 1 | 1 | 0 |
| cli | 1 | 0 | 0 |
| loom | 1 | 0 | 0 |

```
A cli/purge-pollution.js
M data/cortex/memory/component_ledger.json
M data/cortex/memory/event_log.json
M data/cortex/memory/tool_index.json
M data/lattice/relationship_lattice.buffer.jsonl
M data/nodes/clearglass-search-engines/search-gh.command
M data/nodes/clearglass-search-engines/search-gh.tool
M lib/agent-tools/index.js
M lib/agent-tools/tools/diagnostic/loom-scan.js
A lib/agent-tools/tools/diagnostic/stub-finder.js
M lib/version.js
A loom/scanners/stub-finder.js
M package-lock.json
M package.json
M tests/modules/_purge-test-rows.js
A tests/modules/test-stub-finder.js
```

