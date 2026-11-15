# Nexus 0.39.119

| | |
|---|---|
| Built | 2026-09-12 18:50:00 → 2026-09-12 18:50:00 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.119 |
| Tag | `v0.39.119` → snap-0563 |
| Full file ledger | [LEDGER-0.39.119.csv](../ledger/LEDGER-0.39.119.csv) |

## Ledger

### Build 0.39.119 — snap-0563 — 2026-09-12 18:50:00

- Archive: `nexus-0563_2026-09-12_v0.39.119_ping-gate.zip` (was `nexus-v0.39.119-ping-gate.zip`)
- SHA-256: `45a284d4f786d07cd62cbd2edaff1b1ada058cfbce14d6e9718cf1e0bcc5b315`, 98.2 MB, downloaded 2026-09-12 18:54:21
- Kind: full
- Commit: `09d0aa9b7abc9a41804a397938dbec56ffa956b3`, tag `snap-0563`
- Left out: embedded .git (6237 files, HEAD 98943d9b08581703382e1fe5b8a8ec3fc012e1ee (master))
- Left out: node_modules (53 files)
- Files in archive: 11053. Changes against the build before it: **3 added, 30 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 0 | 10 | 0 |
| guardian | 0 | 8 | 0 |
| ui | 0 | 5 | 0 |
| lib | 1 | 2 | 0 |
| tests | 1 | 2 | 0 |
| (root) | 0 | 2 | 0 |
| cli | 1 | 0 | 0 |
| copilot | 0 | 1 | 0 |

```
A cli/semantic-dedup.js
M copilot/tool-runtime.js
M data/alk/decisions.jsonl
M data/cortex/memory/cfr_tension_history.json
M data/cortex/memory/tool_index.json
M data/guardian/ledger/boot/events.ndjson
M data/guardian/ledger/cfr/event_log.jsonl
M data/guardian/memory/settings.json
M data/lattice/relationship_lattice.buffer.jsonl
M data/nodes/clearglass-search-engines/search-gh.command
M data/nodes/clearglass-search-engines/search-gh.tool
M data/vector-index/index.json
M guardian/lib/dispatcher.js
M guardian/lib/ncp-handler.js
M guardian/server.js
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M guardian/userscript-deepseek.js
M guardian/userscript-gemini.js
M guardian/userscript-perplexity.js
M lib/local-vector-index.js
A lib/semantic-dedup.js
M lib/version.js
M package-lock.json
M package.json
A tests/dispatcher-ping-gate.test.js
M tests/dispatcher-stale-socket.test.js
M tests/modules/test-dispatcher-deepseek-ncp.js
M ui/copilot/copilot.js
M ui/copilot/copilot.test.js
M ui/home/index.html
M ui/lib/api.js
M ui/tv-shell/index.html
```

