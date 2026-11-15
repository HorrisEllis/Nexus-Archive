# Nexus 0.39.253

**NEXUS 0.39.253 — Idearium's agent backend is a three-way switch; Ollama's models are a dropdown**

| | |
|---|---|
| Built | 2026-09-25 17:45:34 → 2026-09-25 17:45:34 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.253 |
| Tag | `v0.39.253` → snap-0675 |
| Full file ledger | [LEDGER-0.39.253.csv](../ledger/LEDGER-0.39.253.csv) |

## Release notes — `CHANGELOG-0.39.253.md`

Copied unchanged from the build.

### NEXUS 0.39.253 — Idearium's agent backend is a three-way switch; Ollama's models are a dropdown

**Date:** 2026-09-25 · idearium 4.5.0 → 4.6.0 · copilot 3.5.1 → 3.5.2 · Versionium `vtm-8b55aba2` (parent `vtm-7a5e6093`, 0.39.252)

James: *"i want the cli in idearium to be like the 3 way cli in the floating menu cli in the tv ui. that way it doesn't use check box. also have ollamas models to choose from in a drop down menu for the agent tab."*

#### Mapped
- **The TV shell's switch.** `#cp-backend-toggle` has three buttons (ollama · copilot · guardian), and shows a dropdown only when guardian needs an agent picked.
- **Idearium's checkbox could express only two of three states.** The compartment setting already had three: `ollama`, `auto`, and a guardian agent. The guardian on/off checkbox and its agent dropdown, in Settings → Agents, could not show `auto` — which is exactly what the TV's copilot button sends.
- **The model was dropped on the way to Ollama.** Copilot's Ollama call already accepted a model, but `/api/prompt`'s Ollama branch dropped `body.model`, so no caller could choose one.

#### Changed
- **The switch.** The Agent tab's CLI and Settings → Agents render one control: ollama · copilot · guardian. The dropdown shows only where there is a choice:
  - **guardian:** its agents.
  - **ollama:** Ollama's installed models, plus "default (<bridge default>)". A stored model that is no longer installed is labelled so, and an unreachable bridge is stated rather than guessed.
  - Settings that fail to load show "backend unknown", never a guessed position.
- **`lib/repo-agent.js`:**
  - `backendOf` and `settingsView.backend` give the switch position; copilot = `auto`.
  - The per-compartment `ollamaModel` is refused if the model is not installed, or if the installed list cannot be read.
  - It is sent as `model` on Ollama dispatches only. When unset, nothing is sent, as before.
- **idearium API:**
  - `GET /api/ollama/models` goes through nexus-client to the bridge's `/api/models`. When Ollama is unreachable it answers 502 with the reason.
  - `POST /agent/settings` accepts `ollamaModel`.
  - Both are in the registry and contract.
- **CLI:** `/model [name|default]`. On its own it lists the installed models and marks this compartment's.
- **Copilot 3.5.2:** `/api/prompt` passes `body.model` to Ollama and returns `model_used`.

#### Tests
- `test-repo-agent-provider` 60/60, 18 cases new or rewritten:
  - the switch positions;
  - model validation;
  - the real dispatch sending the chosen model, no model on default, and never one on a guardian job;
  - the model list against a stub bridge on :3749, and with no bridge;
  - the checkbox is gone;
  - copilot passes the model.
- `version-sync` 30, `record-discipline` 9.
- The tree was diffed against 0.39.252 after the tests; no test wrote any data.

#### Not done
- **A Chromium click-through of the switch** was not run. The page finds its API through `API_CANDIDATES` + `/health`, so a probe must serve the idearium UI and fake those routes.
- **`copilot/spec/copilot.spec` is still not valid YAML.** This is pre-existing (line 89).

## Ledger

### Build 0.39.253 — snap-0675 — 2026-09-25 17:45:34

- Archive: `nexus-0675_2026-09-25_v0.39.253.zip` (was `Nexus_v0_39_253.zip`)
- SHA-256: `0b8d0d6b164d54cb28865552db56997795e9fd3b11c8bfaecb5ee2a94842469f`, 145 MB, downloaded 2026-09-25 17:45:34
- Kind: full
- Commit: `84b5a822315e1bc7287ec79aecffddc76283843d`, tag `snap-0675`
- Left out: embedded .git (1934 files, HEAD 66f633cfe44d2a1b48166acb8f43266be674dc4d (main))
- Left out: node_modules (9706 files)
- Left out (50 MB or more): `versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)`
- Left out (50 MB or more): `versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)`
- Files in archive: 5376. Changes against the build before it: **2 added, 22 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 0 | 8 | 0 |
| data | 0 | 4 | 0 |
| (root) | 1 | 2 | 0 |
| docs | 1 | 2 | 0 |
| copilot | 0 | 2 | 0 |
| lib | 0 | 2 | 0 |
| tests | 0 | 2 | 0 |

```
A CHANGELOG-0.39.253.md
M copilot/server.js
M copilot/spec/copilot.spec
M data/cortex/memory/event_log.json
M data/versionium/versionium_branches.json
M data/versionium/versionium_calendar.json
M data/versionium/versionium_commits.json
A docs/2026-09-26-handoff.md
M docs/atlases/copilot-atlas.md
M docs/atlases/idearium-atlas.md
M idearium/api/index.js
M idearium/index.js
M idearium/interaction-contract.json
M idearium/package.json
M idearium/registry-components.js
M idearium/spec/idearium.spec
M idearium/ui/index.html
M idearium/ui/js/app.js
M lib/repo-agent.js
M lib/version.js
M package-lock.json
M package.json
M tests/modules/test-repo-agent-provider.js
M tests/modules/version-sync-and-registry.test.js
```

