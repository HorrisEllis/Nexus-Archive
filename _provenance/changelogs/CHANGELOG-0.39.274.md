# Nexus 0.39.274

**NEXUS 0.39.274: the Clear Glass co-pilot pane uses Ollama or Guardian, never an API**

| | |
|---|---|
| Built | 2026-09-27 21:33:54 → 2026-09-28 13:49:00 |
| Builds on the main line | 2 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.274 |
| Tag | `v0.39.274` → snap-0705 |
| Full file ledger | [LEDGER-0.39.274.csv](../ledger/LEDGER-0.39.274.csv) |

## Release notes — `CHANGELOG-0.39.274.md`

Copied unchanged from the build.

### NEXUS 0.39.274: the Clear Glass co-pilot pane uses Ollama or Guardian, never an API

**Date:** 2026-09-27 · base: 0.39.273 · clear-glass 3.18.0 → 3.18.1

James, looking at the pane after sending "go to google.com":

> NEXUS copilot offline. No fallback API key configured — set one in NEXUS Settings.

His reply: *"nexus settings are depreciated. fix it. copilot, is either ollama or guardian. no api"*.

#### What was wrong

- **The pane only knew one backup.** It sent every message to the copilot service (:3750). If that failed, the only fallback was a direct call to Anthropic's paid API with a key stored in Clear Glass settings. With no key saved, the pane gave that message, which pointed at a settings page that no longer exists.
- **`ollamaGenerate()` was broken.** It posted to `:3749/api/generate`, a route the NEXUS ollama service does not serve, so every call got a 404.
- **The greeting claimed "Co-pilot online"** before anything had answered.

#### What changed (`clear-glass/src/copilot/bridge.js`)

**Where a message goes**

1. The copilot service (:3750) first, unless "Route through NEXUS co-pilot" is off.
2. If copilot is unreachable, the pane answers directly through the same two backends copilot would have used:
   - **Ollama**, through `ollama/ollama-runtime.js` (the same runtime every other NEXUS system uses). The model is the new Clear Glass setting `copilotOllamaModel`, or NEXUS's default model when that is empty.
   - **A Guardian agent** on :7820. The pane sends the prompt to `/command`, then checks `/jobs?id=` until the reply lands.

**Which backend goes first**

- When the pane's route is guardian, the Guardian agent is tried first, then Ollama.
- Otherwise Ollama is tried first, then Guardian.
- When a reply includes tool calls, the pane runs them and sends the results back to the same backend that answered.

**When nothing answers**, the reply lists all three backends and why each failed. For example: `copilot :3750 — ECONNREFUSED`, `ollama — …`, `guardian :7820 (claude) — …`.

**The API fallback is removed**

- No code path calls an external API any more.
- The settings keys `fallbackApiKey`, `fallbackModel` and `fallbackEndpoint` are gone. A key saved by an older build is deleted when settings load, and ignored if anything tries to save one.
- The "Offline fallback" settings pane is replaced by "When the co-pilot service is down", which has a single field: the Ollama model.

**Other fixes**

- `ollamaGenerate()` now goes through the Ollama runtime instead of the 404 route.
- The greeting no longer claims the co-pilot is online.

#### Tests

- New: `tests/modules/test-cg-copilot-no-api.test.js` (NA-001..NA-006, registered in `run-all.js`).
  - With copilot down, Ollama answers, and so does Guardian.
  - Each backend covers for the other, and when all three are down the reply names them.
  - With routing off, copilot is never called.
  - A tool-results follow-up stays on the backend that answered.
  - The retired key fields are dropped and never exposed.
- Existing suites unchanged: `clear-glass-agent-surface` 16/16, `test-cg-accounts-portal-settings` 40/40.

#### Registry and specs

- **Loom:** `clear-glass/src/copilot/bridge.js` is scanned, not hand-mapped. Its new dependency on `ollama/ollama-runtime.js` is a plain `require()`, so the source scanner wires it on its own.
- **Spec:** there is an addendum in `clear-glass/spec/clear-glass.spec`.

## Ledger

### Build 0.39.274-r1 — snap-0704 — 2026-09-27 21:33:54

- Archive: `nexus-0704_2026-09-27_v0.39.274-r1.zip` (was `nexus v0.39.274.zip`)
- SHA-256: `a601802362a6c5cb15dbea0bd9c7c829bfbff5af9b953eb6e018639270bfd7db`, 11.2 MB, downloaded 2026-09-27 21:34:44
- Kind: full
- Commit: `48c764b848d7ff7413714cca1abb2bbe01a272dc`, tag `snap-0704`
- Left out: node_modules (203 files)
- Files in archive: 2987. Changes against the build before it: **2 added, 11 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 0 | 8 | 0 |
| (root) | 1 | 1 | 0 |
| tests | 1 | 1 | 0 |
| lib | 0 | 1 | 0 |

```
A CHANGELOG-0.39.274.md
M clear-glass/package.json
M clear-glass/renderer/browser.html
M clear-glass/renderer/settings/sections/connections.js
M clear-glass/renderer/settings/sections/copilot.js
M clear-glass/renderer/settings/sections/diagnostics.js
M clear-glass/spec/clear-glass.spec
M clear-glass/src/api/settings.js
M clear-glass/src/copilot/bridge.js
M lib/version.js
M package.json
M tests/modules/run-all.js
A tests/modules/test-cg-copilot-no-api.test.js
```

### Build 0.39.274-r2 — snap-0705 — 2026-09-28 13:49:00

- Archive: `nexus-0705_2026-09-28_v0.39.274-r2_6.zip` (was `nexus-6.zip`)
- SHA-256: `24a7d3256ab7a7865784537c018ff705611f6808611e5132ead90790b194bd39`, 11.2 MB, downloaded 2026-09-28 13:53:13
- Kind: full
- Commit: `6e0b0e3c111d686eaef69e4d6c9628f608796da9`, tag `snap-0705`
- Left out: node_modules (203 files)
- Files in archive: 2989. Changes against the build before it: **2 added, 1 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| docs | 2 | 1 | 0 |

```
A docs/2026-09-28-graph-build-context-settings-memory-phasemap.spec
A docs/2026-09-28-staging-self-heal-phasemap.spec
M docs/SPEC-REGISTRY.spec
```

