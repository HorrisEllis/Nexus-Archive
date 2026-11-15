# Nexus 0.39.360

**0.39.360 — 2026-10-06**

| | |
|---|---|
| Built | 2026-10-05 23:47:54 → 2026-10-05 23:47:54 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.360 |
| Tag | `v0.39.360` → snap-0738 |
| Full file ledger | [LEDGER-0.39.360.csv](../ledger/LEDGER-0.39.360.csv) |

## Release notes — `CHANGELOG-0.39.360.md`

Copied unchanged from the build.

### 0.39.360 — 2026-10-06

James: "the daw is a test. fuck the daw. were building capacity to build the daw, not the daw" · "yeah we need to fix all o that. expanding using the specs, then phased, then chunked, then coded. look at the nexus repo. skeletons need to be greyed out until they're coded."

The nexus repo already grows this way. A phasemap `.spec` in `docs/` names, for each phase, the files it builds. The phases manager then builds each phase: a snapshot first, the escalation ladder, and a check that every named file comes back. Changes land greyed until they are committed.

A skeleton repo from 0.39.359 had none of this once it was made. Its components were slotted in once, at creation. It now grows the same way as the nexus repo. Mapped and built as SB42–SB45 (build-from-the-spec 1.21.0).

#### Expanded from the spec (SB42)
There is a new route, **`POST /api/repos/:uuid/expand`** `{ feature, ask }`, and a **+ expand** button on the repo's Phases tab. It only works on a skeleton repo, meaning its `registry-components.js` has the slot. The steps:
1. **A Versionium snapshot is taken first.**
2. **The agent plans only the new components.** It sees the system's own components and is asked for the new ones, under the same slot rules as before:
   - files only under `lib/`, `tests/` or `ui/`;
   - each component has a capability and commands;
   - each component says what it uses.

   You can also pass `components` directly instead of an `ask`.
3. **The spec grows before any code.** `lib/repo-expand.js` slots the components in:
   - registry entries, appended to `registry-components.js`;
   - the living spec's `components` list;
   - every component, capability, command, event, route and hook node.

   A component already in the system is refused, with the reason.

#### Phased (SB43)
The expansion writes **`docs/<date>-<feature>-phasemap.spec`** into the repo, in Nexus's own phasemap shape. Each component gets one phase:
- **Numbered in build order.** A phase comes after the components it uses. Phase keys never reuse one the repo's maps already hold.
- **Its files:** the component and its test.
- **What it must do:** export each command as `<verb>(args, ctx)`, and reach other components only through `ctx`.
- **Its proof:** the component's test.

The Phases tab reads the map with no new code (loom's parser).

#### Chunked, then coded (SB44)
- **Each code file is a chunk from the moment it is planned.** It is pending, with no content (`planChunk` in the spec engine).
- **The existing phase build codes them.** It snapshots, climbs the ladder, and expects exactly the files the phase names.
- **Writing a file codes its chunk.**

#### Greyed until coded (SB45)
- **Uncoded files are greyed.** A file whose chunk has no code is `uncoded`. It is tagged **U** and greyed in the Files tree and the Code tab until it is written. The summary counts files "not coded".
- **An empty slot never reads as finished.** A skeleton with nothing of the idea in it (`slotOpen`) is never complete and never 100%: the slot is one more unit of its progress. Planning a file reopens a finished spec.

#### Refusals write nothing
- **409** — the repo is not a skeleton (`NOT_SKELETON`).
- **422** — nothing new slots in.
- **502** — no snapshot.

#### Proof
- **New: `test-repo-expand` passes 7/7:**
  - expansion runs against a laid-out skeleton;
  - its phasemap is read by the phases manager in build order;
  - it works through the API on a real repo, against a Versionium stub on its configured port;
  - uncoded files are greyed, and coded once written;
  - an empty slot keeps the spec open;
  - refusals write nothing;
  - the UI is wired.
- **Unchanged and passing:**

| Suite | Result |
|---|---|
| test-system-skeleton | 8/8 |
| test-file-tree-plan | 63/63 |
| test-event-contracts | 8/8 |
| test-nexstore-writers | 3/3 |
| test-route-contracts | 4/4 |
| test-idearium-codegen | 6/6 |
| test-registry-drives-build | 5/5 |
| test-genesis-and-architecture-spec | 7/7 |
| test-build-surface | 13/13 |
| test-build-surface-2 | 3/3 |
| test-moce-roadmap | 43/43 |
| test-moce-roadmap-ui | 17/17 |
| test-one-idearium-phases-nodes | 21/21 |
| test-phase-actually-builds | 6/6 |
| test-workshop-full | 10/10 |

#### Not yet
- **A phase isn't closed automatically when its files are coded and its test passes.** The prove loop and the status edit are unchanged.
- **The proof check doesn't yet verify every slotted component.** It should check that each one exports its handlers and that the system's own `tests/skeleton.test.js` passes. That is gap 1 from the last answer, not built here.

## Ledger

### Build 0.39.360 — snap-0738 — 2026-10-05 23:47:54

- Archive: `nexus-0738_2026-10-05_v0.39.360_main-35.zip` (was `Nexus-main-35.zip`)
- SHA-256: `33635dcae9480369dfba9199cd49b1fb8e85e88a72293aa0a206411bae84eb6c`, 15 MB, downloaded 2026-10-07 04:44:36
- Kind: full
- Commit: `b56cf51f57824e28d61b70183565fb8f4f859b26`, tag `snap-0738`
- Identical copy: `nexus-0738_2026-10-05_v0.39.360_main-36_dup1.zip` (was `Nexus-main-36.zip`)
- Identical copy: `nexus-0738_2026-10-05_v0.39.360_main-37_dup2.zip` (was `Nexus-main-37.zip`)
- Files in archive: 5384. Changes against the build before it: **59 added, 44 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cos | 42 | 1 | 0 |
| idearium | 1 | 23 | 0 |
| tests | 3 | 8 | 0 |
| lib | 3 | 5 | 0 |
| data | 6 | 0 | 0 |
| (root) | 3 | 1 | 0 |
| docs | 1 | 3 | 0 |
| loom | 0 | 2 | 0 |
| versionium | 0 | 1 | 0 |

```
A CHANGELOG-0.39.358.md
A CHANGELOG-0.39.359.md
A CHANGELOG-0.39.360.md
A cos/archetype/components/index.js
A cos/archetype/genesis-catalog.js
A cos/archetype/nexus-system.js
A cos/archetype/nexus-system/.template-tree
A cos/archetype/nexus-system/cli.js
A cos/archetype/nexus-system/compartment.json
A cos/archetype/nexus-system/config.js
A cos/archetype/nexus-system/contracts/handshake.js
A cos/archetype/nexus-system/data/baseline/.gitkeep
A cos/archetype/nexus-system/data/nodes/capability/{{slug}}.core.observe.capability
A cos/archetype/nexus-system/data/nodes/command/{{slug}}.nodes.command
A cos/archetype/nexus-system/data/nodes/command/{{slug}}.status.command
A cos/archetype/nexus-system/data/nodes/component/{{slug}}.core.component
A cos/archetype/nexus-system/data/nodes/event/{{slug}}.nodes.listed.event
A cos/archetype/nexus-system/data/nodes/event/{{slug}}.status.reported.event
A cos/archetype/nexus-system/data/nodes/hook/{{slug}}.core.http.hook
A cos/archetype/nexus-system/data/nodes/route/{{slug}}.nodes.route
A cos/archetype/nexus-system/data/nodes/route/{{slug}}.status.route
A cos/archetype/nexus-system/event-taxonomy.js
A cos/archetype/nexus-system/input/.gitkeep
A cos/archetype/nexus-system/interaction-contract.json
A cos/archetype/nexus-system/jaa-store.js
A cos/archetype/nexus-system/lib/atomic-write.js
A cos/archetype/nexus-system/lib/bus.js
A cos/archetype/nexus-system/lib/commands.js
A cos/archetype/nexus-system/lib/core.js
A cos/archetype/nexus-system/lib/envelope.js
A cos/archetype/nexus-system/lib/heartbeat.js
A cos/archetype/nexus-system/lib/ledger.js
A cos/archetype/nexus-system/lib/listener.js
A cos/archetype/nexus-system/lib/node-index.js
A cos/archetype/nexus-system/lib/system.js
A cos/archetype/nexus-system/output/.gitkeep
A cos/archetype/nexus-system/package.json
A cos/archetype/nexus-system/registry-components.js
A cos/archetype/nexus-system/schemas/index.js
A cos/archetype/nexus-system/server.js
A cos/archetype/nexus-system/skeleton.json
A cos/archetype/nexus-system/spec/{{slug}}.node-taxonomy.md
A cos/archetype/nexus-system/spec/{{slug}}.spec
A cos/archetype/nexus-system/tests/skeleton.test.js
A cos/archetype/nexus-system/{{slug}}.config.json
M cos/archetype/registry.js
A data/versionium/file-blobs/87/87428fc522803d31065e7bce3cf03fe475096631e5e07bbd7a0fde60c4cf25c7
A data/versionium/file-blobs/91/911169ddaaf146aff539f58c26c489af3b892dff0fe283c1c264c65ae5aa59a2
A data/versionium/file_snapshots.json
A data/versionium/versionium_branches.json
A data/versionium/versionium_calendar.json
A data/versionium/versionium_commits.json
M docs/2026-10-05-build-from-the-spec-phasemap.spec
M docs/2026-10-05-spec-workshop-rebuild-phasemap.spec
A docs/HANDOFF-2026-10-06.md
M docs/nexstore-writers.yaml
M idearium/api/build-surface.js
M idearium/api/index.js
M idearium/event-taxonomy.cjs
M idearium/index.js
M idearium/package.json
M idearium/repo/build-plan.js
M idearium/repo/file-state.js
M idearium/repo/phases.js
M idearium/repo/work-surface.js
M idearium/spec-engine/index.js
A idearium/spec-engine/templates/_archive/genesis-1.3.0.spec
M idearium/spec-engine/templates/genesis.spec
M idearium/spec/idearium.spec
M idearium/ui/css/code-surface.css
M idearium/ui/css/file-manage.css
M idearium/ui/css/work-surface.css
M idearium/ui/index.html
M idearium/ui/js/code-surface.js
M idearium/ui/js/file-manage.js
M idearium/ui/js/phases.js
M idearium/ui/js/plan-panel.js
M idearium/ui/js/work-surface.js
M idearium/ui/js/workshop.js
M idearium/ui/workshop.html
A lib/agent-record.js
M lib/event-contract-check.js
M lib/file-tree-plan.js
A lib/phase-faults.js
M lib/pipeline-routing.js
A lib/repo-expand.js
M lib/repo-inject.js
M lib/version.js
M loom/data/events.json
M loom/data/registry.json
M package.json
M tests/modules/run-all.js
A tests/modules/test-agent-record.test.js
M tests/modules/test-genesis-and-architecture-spec.test.js
M tests/modules/test-idearium-cjs-under-esm.js
M tests/modules/test-manifest-phase1.test.mjs
M tests/modules/test-registry-drives-build.test.js
A tests/modules/test-repo-expand.test.js
M tests/modules/test-repo-inject.js
A tests/modules/test-system-skeleton.test.js
M tests/modules/test-template-picker.test.js
M tests/modules/test-work-surface.test.js
M versionium/lib/files.js
```

