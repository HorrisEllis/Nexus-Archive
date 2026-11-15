# Nexus 0.60.68

**0.60.68 — 2026-10-15**

| | |
|---|---|
| Built | 2026-10-15 15:33:14 → 2026-10-15 15:33:14 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.60.68 |
| Tag | `v0.60.68` → snap-0754 |
| Full file ledger | [LEDGER-0.60.68.csv](../ledger/LEDGER-0.60.68.csv) |

## Release notes — `CHANGELOG-0.60.68.md`

Copied unchanged from the build.

### 0.60.68 — 2026-10-15

James: "Use the templates. The genesis by default."

(After "So it can spec now?" — I had said a compiled spec came out as the spec compiler's generic TypeScript package,
nothing like a Nexus system.)

#### Read first

Genesis was already Idearium's default system template: `speceng.create` starts a system spec from it (GN1, 0.39.286).
Its file tree is the nexus-system skeleton (SB31). And `lib/file-tree-plan.js plan({ slot })` already slots components
into that skeleton: `slotIn` writes a registry entry plus component, capability, command, event, route and hook nodes
for each one. The spec pipeline ignored all of it. Now it uses it; nothing was built beside it.

#### What changed

- **A collected spec is laid out from a template.** The template is chosen in this order: the request, then the
  spec's own `meta.template`, then the setting `specs.default_template`, which defaults to **genesis**.
- **Genesis**: the nexus-system skeleton (server, CLI, config, registry, interaction contract, event taxonomy, JAA
  store, node index, listener, heartbeat, handoff, modules, tests), with the spec's modules slotted in:
  - each module is a component: a registry entry, plus component, capability, command, event, route and hook nodes;
  - each export (`append(entry) → Receipt`) is one of its commands;
  - each component's own `lib/` file is listed **to build**, with what it must export, and is not stubbed. Genesis's
    rule: "nothing pretends to work".
- **Other templates still work**: `compiler` (the TypeScript scaffold, the old default) and any file-tree template
  (`cos-archetype:…`, `cos-blueprint:…`, an eravos mod). An unknown one is refused by name.
- **The spec framework tells the agent** its spec is laid out on genesis: name only the modules the system adds, and
  set `meta.template: genesis`. If your blocks were saved under 0.60.66, that stored text follows the new default; your
  own edit is kept.
- **Everywhere it shows**: the route, `repo compile-spec --template`, and the Agent tab's compile button say which
  template was used and what's left to build.

#### Proof

`tests/modules/test-spec-pipeline.test.js` 12/12:
- SP-08: genesis by default — the skeleton's server, CLI, registry, contract, taxonomy and JAA store proposed; the module
  slotted in (component node, a command node per export, its events, the registry entry); its lib file listed to build
  with `append(args, ctx), read(args, ctx)`; an existing package.json not overwritten; nothing written until applied.
- SP-08b: `compiler` by request or by `meta.template`; genesis when none is named; an unknown template refused.
- SP-08c: the framework carries the genesis line; a stored 0.60.66 copy follows the new default, his own edit stays.

#### To confirm

I read "use the templates" as: lay the spec out from Idearium's template catalog, genesis first. The other reading is
that the agent should fill in a template document's sections. Tell me if that's what you meant.

## Ledger

### Build 0.60.68 — snap-0754 — 2026-10-15 15:33:14

- Archive: `nexus-0754_2026-10-15_v0.60.68_claude-brave-cori-eczug1.zip` (was `Nexus-claude-brave-cori-eczug1.zip`)
- SHA-256: `902cf2de2334f9a794d22497210fd865b65ccc1294dd3b97aad53ab02941dc83`, 17.1 MB, downloaded 2026-10-15 15:38:15
- Kind: full
- Commit: `06f010947a72818955c598effb8a4d51e3131b82`, tag `snap-0754`
- Files in archive: 5824. Changes against the build before it: **84 added, 103 modified, 1 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 18 | 38 | 0 |
| lib | 17 | 14 | 0 |
| (root) | 21 | 1 | 1 |
| tests | 17 | 6 | 0 |
| docs | 9 | 8 | 0 |
| idearium | 0 | 13 | 0 |
| loom | 1 | 8 | 0 |
| guardian | 0 | 8 | 0 |
| copilot | 0 | 4 | 0 |
| cos | 0 | 1 | 0 |
| intelligence | 0 | 1 | 0 |
| orchestrator | 0 | 1 | 0 |
| scripts | 1 | 0 | 0 |

```
A CHANGELOG-0.60.48.md
A CHANGELOG-0.60.49.md
A CHANGELOG-0.60.50.md
A CHANGELOG-0.60.51.md
A CHANGELOG-0.60.52.md
A CHANGELOG-0.60.53.md
A CHANGELOG-0.60.54.md
A CHANGELOG-0.60.55.md
A CHANGELOG-0.60.56.md
A CHANGELOG-0.60.57.md
A CHANGELOG-0.60.58.md
A CHANGELOG-0.60.59.md
A CHANGELOG-0.60.60.md
A CHANGELOG-0.60.61.md
A CHANGELOG-0.60.62.md
A CHANGELOG-0.60.63.md
A CHANGELOG-0.60.64.md
A CHANGELOG-0.60.65.md
A CHANGELOG-0.60.66.md
A CHANGELOG-0.60.67.md
A CHANGELOG-0.60.68.md
D VERSION
M clear-glass/package.json
M clear-glass/renderer/browser.css
M clear-glass/renderer/browser.js
M clear-glass/renderer/cos-theme.css
M clear-glass/renderer/library/sections/responses.css
M clear-glass/renderer/library/sections/responses.js
M clear-glass/renderer/settings.html
M clear-glass/renderer/settings/core.js
M clear-glass/renderer/settings/sections/accounts.css
M clear-glass/renderer/settings/sections/accounts.js
M clear-glass/renderer/settings/sections/automation.js
A clear-glass/renderer/settings/sections/chats.css
A clear-glass/renderer/settings/sections/chats.js
M clear-glass/renderer/settings/sections/fingerprint.css
M clear-glass/renderer/settings/sections/fingerprint.js
M clear-glass/renderer/settings/sections/macros.js
M clear-glass/renderer/settings/sections/mesh.js
M clear-glass/renderer/settings/sections/privacy.js
M clear-glass/renderer/settings/sections/providers.js
M clear-glass/renderer/settings/sections/sites.css
M clear-glass/renderer/settings/sections/sites.js
A clear-glass/spec/semantic-tree.spec
M clear-glass/src/accounts/login-portal.js
M clear-glass/src/automation/steps.js
M clear-glass/src/automation/templates.js
M clear-glass/src/contexts/manager.js
M clear-glass/src/cookies/session-hub.js
M clear-glass/src/copilot/bridge.js
M clear-glass/src/copilot/tools.js
M clear-glass/src/downloads/artifact-chat-index.js
M clear-glass/src/driver/index.js
M clear-glass/src/ipc/bridge.js
A clear-glass/src/macros/live-recording.js
A clear-glass/src/macros/recorder-script.js
M clear-glass/src/macros/recording.js
M clear-glass/src/main/compartment-window.js
M clear-glass/src/main/index.js
A clear-glass/src/main/window-frame.js
M clear-glass/src/mesh/automation-engine.js
A clear-glass/src/net/policy.js
A clear-glass/src/net/service.js
A clear-glass/src/net/transport-host.js
M clear-glass/src/options/store.js
A clear-glass/src/page/semantic-tree.js
M clear-glass/src/preload/index.js
M clear-glass/src/providers/account-switch.js
M clear-glass/src/providers/attention.js
M clear-glass/src/providers/host.js
A clear-glass/test/chats-settings.test.js
A clear-glass/test/dark-popups.test.js
A clear-glass/test/macros-guide.test.js
A clear-glass/test/privacy-merge.test.js
A clear-glass/test/settings-merge-render.test.js
A clear-glass/test/settings-merge.test.js
A clear-glass/test/signin-window-quiet.test.js
A clear-glass/test/window-frame.test.js
M copilot/lifeline.js
M copilot/server.js
M copilot/spec/copilot.spec
M copilot/tool-runtime.js
M cos/spec/check-catalogue.spec
M docs/2026-10-05-code-tab-and-one-router-phasemap.spec
M docs/2026-10-13-gates-that-learn-and-priorities-phasemap.spec
M docs/2026-10-15-automatic-tracking-phasemap.spec
M docs/2026-10-15-capability-specs-and-semantic-page-tree-phasemap.spec
A docs/2026-10-15-clear-glass-network-posture-phasemap.spec
A docs/2026-10-15-clear-glass-surfaces-phasemap.spec
A docs/2026-10-15-code-tab-run-state-phasemap.spec
A docs/2026-10-15-fiverr-ledger-phasemap.spec
A docs/2026-10-15-gate-held-work-phasemap.spec
A docs/2026-10-15-macro-node-recording-phasemap.spec
A docs/2026-10-15-personal-chat-import-phasemap.spec
A docs/2026-10-15-warp-builds-and-spec-framework-phasemap.spec
A docs/PHASE-CENSUS-2026-10-15.md
M docs/PROOF-OF-COMPETENCY.md
M docs/SPEC-REGISTRY.spec
M docs/spec-compiler.spec
M docs/warp.spec
M guardian/ask.js
M guardian/event-taxonomy.js
M guardian/lib/code-artifact.js
M guardian/lib/dispatcher.js
M guardian/lib/jobs.js
M guardian/lib/ncp-handler.js
M guardian/lib/response-sink.js
M guardian/server.js
M idearium/api/index.js
M idearium/cli/route-commands.js
M idearium/event-taxonomy.cjs
M idearium/lib/config-core.cjs
M idearium/repo/phases.js
M idearium/repo/roadmap.js
M idearium/spec/idearium.repo-roadmap.spec
M idearium/spec/idearium.spec
M idearium/spec/nexus-repository-system.spec
M idearium/ui/js/agent-blocks.js
M idearium/ui/js/app.js
M idearium/ui/js/phases.js
M idearium/ui/settings.html
M intelligence/gap/predicate.js
M lib/agent-tools/index.js
M lib/agent-tools/tool-guide.js
M lib/agent-tools/tools/clear-glass/browser.js
A lib/agent-tools/tools/clear-glass/net.js
A lib/build-paths.js
A lib/capability-spec.js
A lib/chat-crawl-plan.js
A lib/chat-crawl-settings.js
M lib/check-catalogue.js
A lib/checks/ck-254-surface.js
A lib/checks/ck-255-warp-builds.js
M lib/context-prereqs.js
A lib/gig-ledger-listener.js
A lib/gig-ledger.js
M lib/node-export.js
A lib/node-schemas/schema.run
A lib/phase-map-auto.js
M lib/pipeline-routing.js
A lib/reply-kind.js
M lib/repo-agent.js
M lib/repo-inject.js
M lib/repo-prompt-blocks.js
A lib/repo-prompt-blocks.previous.json
A lib/run-state.js
A lib/spec-collect.js
A lib/spec/capability-spec.spec
M lib/step-gate.js
M lib/step-gates/code.write.step_gate
```

38 more (mostly data, logs and archived files) are in the ledger file.

