# Nexus 0.39.272

**NEXUS 0.39.272: copilot can do everything Clear Glass can, and learns from it**

| | |
|---|---|
| Built | 2026-09-27 19:37:50 → 2026-09-27 19:37:50 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.272 |
| Tag | `v0.39.272` → snap-0702 |
| Full file ledger | [LEDGER-0.39.272.csv](../ledger/LEDGER-0.39.272.csv) |

## Release notes — `CHANGELOG-0.39.272.md`

Copied unchanged from the build.

### NEXUS 0.39.272: copilot can do everything Clear Glass can, and learns from it

**Date:** 2026-09-27 · base: 0.39.271 · clear-glass 3.17.0 → 3.18.0 · map: `docs/2026-09-27-clearglass-whole-copilot-learning-phasemap.spec`

James: *"i want copilot completely aware of clearglass, hooked in completely. all of it … automate job applications, fiverr … idearium agents should be able to find the context easily"* · *"this is the current CLEARglass … expand it as much as possible. also have him learn."*

#### Clear Glass, whole, for copilot

**New routes on :7702**

| Route | What it does |
|---|---|
| `POST /cli/driver` | Runs the driver action and returns its result in the response. It used to return `{emitted}`, with the result going out on SSE only. |
| `POST /cli/page/read` | Returns the page text, headings and links, every field with its label and a selector, and every button. |
| `GET /cli/state` | Returns every tab with its url and title, plus accounts, autofill profiles, macros, userscripts, extensions and downloads. A source that can't be read is named, never shown as empty. |
| `GET/POST /cli/invoke` | Reaches **every one of Clear Glass's 172 IPC channels by name**: window control, settings, login portal, plugins, WebExtensions, macros and recording, selectors, custom agents, errors, opening a download. It calls the same handler the window uses (`ipc/handler-registry.js`). |

Saving credentials is refused by name.

**Driver:** new actions `readPage`, `setValue`, `select`, `check`, `pressKey` and `upload` (a real file, through CDP).

**Tools**
- **`clearglass.browser.tool`:** `state`, `read`, `act`, `sequence`, `tabs`, `autofill`, `questions`, `channels` and `invoke`.
- **`clear_glass_command_index`:** fixed. Every `/cli` call went to :7704, which has no `/cli` routes, and 404'd.

**The pane co-pilot** now sees its tool results and keeps going for up to `copilotToolRounds` (default 3). It can also run any NEXUS agent tool from a ` ```tool ` block. This works with the hat, route and auto-run settings from 0.39.262.

**Copilot's chat**
- It now offers all 16 Clear Glass tools, plus the atlas, the opportunity pipeline and what it has learned.
- Its context has two new layers: L7 (Clear Glass state and learning) and L8 (opportunities).
- The tool guide covers every tool: 113 of 113.

#### Copilot learns (`lib/cg-learning.js`, `clearglass.learned.tool`)

- **Site memory.** Every browser action is recorded per site: the selector, the label it was aimed at, and whether it worked or the error. `read` returns what worked and what keeps failing on that site.
- **Self-healing selectors.** When a selector finds nothing:
  1. It first tries a selector that worked for the same label on that site.
  2. If there is none, it tries the page field or button whose label or text best matches.
  3. It retries once and records the result.
  - A tie between two equally good matches is refused rather than guessed.
- **Learned flows.** A sequence of 3 or more steps that fully worked is kept, counted each time it works again, can be replayed, and can be promoted to a Clear Glass macro. Passwords are stored as `{{password}}`, never as the value.
- **Outcomes.** Responses, interviews, offers and silence move the source and skill weights in scoring. The change is bounded to ±15 and needs at least 3 outcomes; each one says what it learned from.
- **Your voice.** Drafts you edited feed `{examples}` in the drafting templates.

#### Jobs, Fiverr, Upwork (`lib/opportunity`, `cli/opportunity.js`, copilot `/api/opportunity/*`)

- **Reuse:**
  - Your identity comes from your Clear Glass autofill profile: fields, résumé path, cover-letter and proposal templates.
  - Platform guidance comes from Clear Glass's own `autofill/proposal.js`.
- **The pipeline:** 8 job sources, explained scoring, an answer bank, `prepare` (fills the form and stops), Fiverr/Upwork replies typed into the box but never sent, follow-ups.
- **The gates:**
  - Approval is yours only.
  - Auto-submit only happens under your policy, and on LinkedIn/Indeed/Upwork/Fiverr it also needs `acknowledgeTos`.
- A Clear Glass palette command, *Capture job / gig / lead to NEXUS*, sends the page you're on to the pipeline.

#### Idearium: every memory, one door (`lib/context-atlas.js`, `nexus.context.tool`)

- **One search across:**
  - every cortex table;
  - **the download manager** (via a new `search()` in `lib/agent-memory.js`, using its own read path);
  - the repo graph, the blueprint, specs and changelogs.
- **Repo agents:** new editable blocks `{atlas}` and `{directory}` sit beside 0.39.269's `{memory}`. The agent's own exchanges stay in `{memory}` and are not repeated in `{atlas}`.
- **The Agent tab preview** now includes `{memory}` too; before, it left it out.
- **Also:** `/recall` and `/atlas` in the Agent tab, and routes under `/api/context/*`.

#### Tests

| Suite | Result | Notes |
|---|---|---|
| `clear-glass-agent-surface` | 16/16 | New; registered in run-all |
| `test-opportunity` | 27/27 | New; registered in run-all |
| `test-tool-guide` | 7/7 | T-001 was failing on 0.39.271 |
| `test-composed-prompt` | 19/20 | CP-101 fails identically on 0.39.271 |

- `lib/cg-learning.js` was run as a smoke test only: heal by label, heal by text, hints, password redaction. It has no test file yet.

#### Not done (stated, not hidden)

- **Axiom rule 3:** no loom map for the new components yet.
- **Axiom rule 4:** spec addenda and `SPEC-REGISTRY` entries are not written.
- **Tests:** the context-atlas test from the first pass was not ported. It needs the `{atlas}` rename.
- **Learning from the pane:** actions the co-pilot pane runs directly on the driver are not recorded as site memory. Only `clearglass.browser.tool` actions are.
- **Nothing was run live:** not in an Electron window, not against the job APIs, not CDP upload.
- **No full regression:** the full `run-all` comparison against 0.39.271 was not run for this release.

## Ledger

### Build 0.39.272 — snap-0702 — 2026-09-27 19:37:50

- Archive: `nexus-0702_2026-09-27_v0.39.272.zip` (was `nexus-0.39.272.zip`)
- SHA-256: `c0b8a0dd3a2770d19bdb54e3e8b9993907eeb974920862ccbf97cf06f367af7e`, 11.1 MB, downloaded 2026-09-27 20:02:01
- Kind: full
- Commit: `5444e946fdc7421a2dca92ff4f259a51ebda6158`, tag `snap-0702`
- Left out: node_modules (203 files)
- Files in archive: 2967. Changes against the build before it: **180 added, 248 modified, 1903 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 10 | 22 | 681 |
| clear-glass | 28 | 58 | 220 |
| copilot | 2 | 14 | 229 |
| intelligence | 0 | 1 | 240 |
| versionium | 0 | 7 | 131 |
| guardian | 9 | 17 | 110 |
| loom | 3 | 9 | 84 |
| tests | 44 | 26 | 8 |
| lib | 27 | 37 | 0 |
| architect | 0 | 0 | 60 |
| eravos | 0 | 1 | 44 |
| ollama | 0 | 7 | 31 |
| docs | 24 | 8 | 2 |
| emerge | 0 | 1 | 26 |
| cos | 13 | 8 | 0 |
| (root) | 12 | 7 | 1 |
| cortex | 0 | 4 | 14 |
| nexus-healer | 0 | 0 | 18 |
| ui | 1 | 7 | 0 |
| remote-desktop | 2 | 4 | 0 |
| erosmancer | 0 | 5 | 0 |
| diagnostic | 1 | 1 | 2 |
| orchestrator | 0 | 3 | 0 |
| cli | 1 | 1 | 0 |
| nexus | 0 | 0 | 2 |
| components | 1 | 0 | 0 |
| scripts | 1 | 0 | 0 |
| .claude | 1 | 0 | 0 |

```
A .claude/settings.local.json
M .gitignore
M CHANGELOG-0.39.259.md
A CHANGELOG-0.39.260.md
A CHANGELOG-0.39.261.md
A CHANGELOG-0.39.262.md
A CHANGELOG-0.39.263.md
A CHANGELOG-0.39.264.md
A CHANGELOG-0.39.266.md
A CHANGELOG-0.39.267.md
A CHANGELOG-0.39.268.md
A CHANGELOG-0.39.269.md
A CHANGELOG-0.39.270.md
A CHANGELOG-0.39.271.md
A CHANGELOG-0.39.272.md
M blueprint-index.json
M clear-glass/interaction-contract.json
M clear-glass/package.json
M clear-glass/plugins/adblocker/manifest.json
M clear-glass/plugins/guardian-listeners/manifest.json
M clear-glass/plugins/passwords/manifest.json
M clear-glass/registry-components.js
M clear-glass/renderer/browser.css
M clear-glass/renderer/browser.html
M clear-glass/renderer/browser.js
A clear-glass/renderer/copilot-cli.js
M clear-glass/renderer/library/sections/bookmarks.js
M clear-glass/renderer/settings.html
M clear-glass/renderer/settings/core.js
M clear-glass/renderer/settings/sections/accounts.js
M clear-glass/renderer/settings/sections/autofill.css
M clear-glass/renderer/settings/sections/autofill.js
M clear-glass/renderer/settings/sections/automation.css
M clear-glass/renderer/settings/sections/automation.js
M clear-glass/renderer/settings/sections/copilot.css
M clear-glass/renderer/settings/sections/copilot.js
M clear-glass/renderer/settings/sections/eros.js
M clear-glass/renderer/settings/sections/fingerprint.js
M clear-glass/renderer/settings/sections/macros.css
M clear-glass/renderer/settings/sections/macros.js
M clear-glass/renderer/settings/sections/mesh.css
M clear-glass/renderer/settings/sections/mesh.js
M clear-glass/renderer/settings/sections/plugins.css
M clear-glass/renderer/settings/sections/plugins.js
M clear-glass/renderer/settings/sections/privacy.js
M clear-glass/renderer/settings/sections/providers.js
A clear-glass/renderer/settings/sections/shortcuts.css
A clear-glass/renderer/settings/sections/shortcuts.js
A clear-glass/renderer/settings/sections/sites.css
A clear-glass/renderer/settings/sections/sites.js
M clear-glass/renderer/settings/sections/suite.css
M clear-glass/renderer/settings/sections/suite.js
M clear-glass/renderer/settings/settings.css
M clear-glass/spec/clear-glass.spec
M clear-glass/src/api/settings.js
M clear-glass/src/autofill/matcher.js
A clear-glass/src/autofill/proposal.js
M clear-glass/src/autofill/store.js
A clear-glass/src/automation/cron.js
A clear-glass/src/automation/dom.js
A clear-glass/src/automation/from-macro.js
A clear-glass/src/automation/nodes.js
A clear-glass/src/automation/routes.js
A clear-glass/src/automation/steps.js
A clear-glass/src/automation/template.js
A clear-glass/src/automation/templates.js
M clear-glass/src/bookmarks/browser.js
M clear-glass/src/bookmarks/store.js
M clear-glass/src/copilot/bridge.js
A clear-glass/src/copilot/hat.js
M clear-glass/src/copilot/tools.js
M clear-glass/src/downloads/store.js
A clear-glass/src/driver/glass-host/main.js
A clear-glass/src/driver/glass-host/package.json
A clear-glass/src/driver/glass.js
M clear-glass/src/driver/index.js
A clear-glass/src/eros/supervisor.js
M clear-glass/src/fingerprint/engine.js
M clear-glass/src/history/store.js
M clear-glass/src/ipc/agent-routes.js
M clear-glass/src/ipc/bridge.js
A clear-glass/src/ipc/handler-registry.js
A clear-glass/src/macros/recording.js
M clear-glass/src/main/index.js
M clear-glass/src/mesh/agent-mesh.js
M clear-glass/src/mesh/automation-engine.js
M clear-glass/src/options/store.js
M clear-glass/src/passwords/vault.js
A clear-glass/src/plugins/webextensions.js
M clear-glass/src/plugins/webrequest-adapter.js
M clear-glass/src/preload/index.js
M clear-glass/src/providers/registry.js
A clear-glass/src/shortcuts/registry.js
M clear-glass/src/site-settings/store.js
M clear-glass/src/sse/server.js
A clear-glass/src/storage/jaa.js
M clear-glass/src/toolbar/commands.js
A clear-glass/test/content-filter-exempt.test.js
A clear-glass/test/copilot-cli.test.js
A clear-glass/test/storage-jaa.test.js
A clear-glass/test/webextensions.test.js
M clear-glass/wire/nexus-wire.js
A cli/nodes.js
M cli/opportunity.js
A components/index.json
M copilot/adversarial.js
M copilot/analysis.js
M copilot/cli.js
M copilot/interaction-contract.json
M copilot/intuition.js
A copilot/lib/activity-recall.js
M copilot/lib/copilot-context.js
M copilot/lib/nexus-awareness.js
A copilot/lib/reword.js
M copilot/lib/self-model.js
M copilot/lifeline.js
M copilot/registry-components.js
M copilot/routes/opportunity.js
M copilot/server.js
M copilot/spec/copilot.spec
M copilot/tool-runtime.js
M cortex/core/raid/contract-intake.js
M cortex/cortex-v2.js
M cortex/registry-components.js
M cortex/spec/cortex.spec
M cos/ci/keys.js
M cos/cli/commands/create.js
M cos/compartment/qemu-runtime.js
M cos/foundation/file-browser.js
M cos/foundation/types.js
M cos/host/gates/compartment.js
A cos/runtime/preload.cjs
A cos/runtime/register.mjs
A cos/runtime/resolve-hook.mjs
A cos/runtime/run.js
A cos/runtime/syntax-check.cjs
M cos/spec/cos.spec
A cos/testenv/detect.js
A cos/testenv/host.js
M cos/testenv/index.js
A cos/testenv/installer.js
A cos/testenv/provision.js
A cos/testenv/setup-job.js
A cos/testenv/setup-vm.bat
A cos/testenv/setup-vm.sh
A cos/testenv/tar.js
M diagnostic/nexus-diagnostic.js
A diagnostic/wire-integrity.js
A docs/2026-09-26-cos-testenv-vm-and-nexus-atlas-phasemap.spec
A docs/2026-09-26-guardian-retry-novelty-and-installs-phasemap.spec
```

2181 more (mostly data, logs and archived files) are in the ledger file.

