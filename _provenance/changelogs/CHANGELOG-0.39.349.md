# Nexus 0.39.349

**0.39.349 — 2026-10-05**

| | |
|---|---|
| Built | 2026-10-05 13:24:24 → 2026-10-05 13:24:24 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.349 |
| Tag | `v0.39.349` → snap-0734 |
| Full file ledger | [LEDGER-0.39.349.csv](../ledger/LEDGER-0.39.349.csv) |

## Release notes — `CHANGELOG-0.39.349.md`

Copied unchanged from the build.

### 0.39.349 — 2026-10-05

James: "the code tab the agent tab, work surface, like full activity, enterprise grade?" · "its just the code tab is meaningless. what about uncommited changes?"

CT3 done: the Code tab is the work surface (`idearium/ui/js/code-surface.js`, `css/code-surface.css`). It is built from what already existed; it stores nothing.

- **Left: the files.**
  - States come from the Files tab's own check (`file-manage.js`, `GET …/files/state`): modified and new files are marked, a file that exists only as a proposal is greyed, and a file with a change waiting has a dot.
  - "changed only" shows just what differs from the last version.
- **Middle: the file.**
  - Its lines, with each chunk marked where it starts (`code-api` outline). Click a line number to pick it; shift-click widens the pick.
  - The agent's change to the file sits above it as a diff, with Apply / Reject (`work-surface.js` cards and actions). With no file open, every change the agent made is listed.
  - Search by meaning or exact text stays.
- **Right: the chunk card and the agent.**
  - A chunk's card shows what it uses, what uses it, and its tests.
  - The agent is docked. It names the model copilot's door would choose, through the new `GET /api/repos/:uuid/agent/route`. A provider set in Settings shows as pinned, and the door is not asked.
  - Any other hop can be picked. It is sent with its backend and model (`agent/prompt` now passes `model`), with the open file and picked lines as context. The reply says which model answered.
- **Bottom: activity.** One strip that folds: the agent's tool calls (failures in red) and the changes.
- **Moved, not lost.**
  - The old `renderRepoCode`, `codeRunSearch` and `codeOpenChunk` in `app.js` are replaced by `code-surface.js`.
  - Manage reads the Code tab's search from `CS`.
  - `work-surface.js` tells the Code tab after Apply, Reject, Revert and Promote.
- **Pushback, built that way.** The Agent tab stays. Its history, late replies, approvals and settings are a whole surface. The docked agent asks the same agent through the same route.
- **Tests.** `test-code-tab` 8/8:
  - CT-01 and CT-02 go through idearium's real router against a stand-in copilot.
  - CT-10 to CT-15 are driven in Clear Glass, covering the greyed and marked files, the diffs, Apply, the chunk card, the docked agent's pick and context, and activity.

  Unchanged and passing: work-surface 16/16, model-door 8/8, repo-settings-ui 7/7, route-contracts 4/4, interaction-contract 39/39, build-surface 3/3, and the manage-workbench probe 13/13.

  The build-surface probe's BS10 (environment rows) fails the same way without this change.
- **Loom.** `code-surface.js` is mapped with its three wires (`loom/maps/build-surface-map.js`). The map now declares an export hook for a dependency the scan gave none, which also resolved two older wires there. Still unresolved: 113 → 112.
- **Next.** CT4: the Ollama check in Settings.

## Ledger

### Build 0.39.349 — snap-0734 — 2026-10-05 13:24:24

- Archive: `nexus-0734_2026-10-05_v0.39.349_main-31.zip` (was `Nexus-main-31.zip`)
- SHA-256: `28e09396ecfbcbc75954ffb36dbf1c4f0566933cbf615786da8bcaad95567b62`, 14.7 MB, downloaded 2026-10-05 13:30:44
- Kind: full
- Commit: `0eb79d3939c638dfe6274d04c15759f951e86aac`, tag `snap-0734`
- Files in archive: 5304. Changes against the build before it: **14 added, 25 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 2 | 8 | 0 |
| docs | 4 | 3 | 0 |
| tests | 2 | 5 | 0 |
| (root) | 5 | 1 | 0 |
| lib | 1 | 3 | 0 |
| loom | 0 | 3 | 0 |
| clear-glass | 0 | 1 | 0 |
| copilot | 0 | 1 | 0 |

```
A CHANGELOG-0.39.345.md
A CHANGELOG-0.39.346.md
A CHANGELOG-0.39.347.md
A CHANGELOG-0.39.348.md
A CHANGELOG-0.39.349.md
M clear-glass/src/main/compartment-window.js
M copilot/server.js
M docs/2026-09-30-idearium-coding-flow-phasemap.spec
M docs/2026-10-01-routing-registry-genesis-phasemap.spec
A docs/2026-10-05-code-tab-and-one-router-phasemap.spec
A docs/2026-10-05-failure-reproduction-phasemap.spec
A docs/2026-10-05-idea-to-spec-workshop-phasemap.spec
A docs/2026-10-05-spec-workshop-rebuild-phasemap.spec
M docs/SPEC-REGISTRY.spec
M idearium/api/index.js
M idearium/interaction-contract.json
M idearium/registry-components.js
M idearium/spec-engine/chunk-dispatch.js
A idearium/ui/css/code-surface.css
M idearium/ui/index.html
M idearium/ui/js/app.js
A idearium/ui/js/code-surface.js
M idearium/ui/js/file-manage.js
M idearium/ui/js/work-surface.js
A lib/model-door.js
M lib/pipeline-routing.js
M lib/repo-agent.js
M lib/version.js
M loom/data/events.json
M loom/data/registry.json
M loom/maps/build-surface-map.js
M package.json
M tests/modules/run-all.js
A tests/modules/test-code-tab.test.js
M tests/modules/test-compartment-window.test.js
A tests/modules/test-model-door.test.js
M tests/modules/test-pipeline-routing.test.js
M tests/probe/build-surface-ui-chromium.js
M tests/probe/manage-workbench-chromium.js
```

