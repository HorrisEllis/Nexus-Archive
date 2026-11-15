# Nexus 0.59.5

**0.59.5 — 2026-10-10**

| | |
|---|---|
| Built | 2026-10-10 00:40:56 → 2026-10-10 00:40:56 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.59.5 |
| Tag | `v0.59.5` → snap-0743 |
| Full file ledger | [LEDGER-0.59.5.csv](../ledger/LEDGER-0.59.5.csv) |

## Release notes — `CHANGELOG-0.59.5.md`

Copied unchanged from the build.

### 0.59.5 — 2026-10-10

James: "All I'm going to do. Is open this chat in clearglass. Then you should be able to talk to nexus right now."

#### Open the chat in Clear Glass, and the agent in it can use Nexus

No picker and no listener to set up (`clear-glass/src/page/nexus-chat.js`). On a chat page Clear Glass watches (option `nexusChat.urls`, by default Claude Code on the web, `https://claude.ai/code`):

- **Reading:** Clear Glass reads the page's text every 2 seconds, from its own process. Nothing is injected into the page.
- **Running:** a line starting with `nexus> ` that has stayed the same for two reads (so the reply is finished) runs as a Nexus command through the one command tool.
- **Answering:** the result is typed into the page's message box and sent, so the agent reads it as the next message and can carry on. It also shows in the co-pilot panel.

Guard rails, because anything printed on that page can reach the machine:
- What's on the page when it opens never runs, so a reload doesn't replay old commands.
- Each line runs once, and at most 6 commands a minute per page.
- Only read commands, plus `dump` (an idea into the Void), run here. Anything that changes Nexus is refused with how to allow it: a listener you set yourself (⦿ LISTEN → Run Nexus commands).
- Commands only you may run are refused everywhere.
- The typed answer never starts with `nexus>`, so it can't run itself.

`tests/modules/test-nexus-chat.test.js` 5/5. The page scripts that read the lines and type the answer ran for real in Clear Glass's engine.

#### Not proven yet

Claude Code's web page itself hasn't been tried; the message box and Enter-to-send are found generically (the lowest visible text box). If the answer isn't typed in, Clear Glass says so (`nexus.chat.reply.failed`) and the answer is still in the co-pilot panel.

## Ledger

### Build 0.59.5 — snap-0743 — 2026-10-10 00:40:56

- Archive: `nexus-0743_2026-10-10_v0.59.5_main-42.zip` (was `Nexus-main-42.zip`)
- SHA-256: `aef74f2d1dc7fde65565196706161ed439d111b0901b6522d418f4254965dbdd`, 15.6 MB, downloaded 2026-10-10 00:41:43
- Kind: full
- Commit: `c61d8d0f82af439384d1db5131b27894a0cb7384`, tag `snap-0743`
- Files in archive: 5550. Changes against the build before it: **59 added, 96 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 6 | 21 | 0 |
| tests | 16 | 6 | 0 |
| docs | 10 | 11 | 0 |
| clear-glass | 6 | 13 | 0 |
| guardian | 2 | 17 | 0 |
| lib | 3 | 14 | 0 |
| (root) | 11 | 1 | 0 |
| cos | 4 | 0 | 0 |
| copilot | 0 | 3 | 0 |
| loom | 0 | 3 | 0 |
| ui | 0 | 3 | 0 |
| versionium | 0 | 2 | 0 |
| cockpit | 0 | 1 | 0 |
| cortex | 0 | 1 | 0 |
| intelligence | 1 | 0 | 0 |

```
A CHANGELOG-0.55.2.md
A CHANGELOG-0.56.0.md
A CHANGELOG-0.57.0.md
A CHANGELOG-0.57.1.md
A CHANGELOG-0.58.0.md
A CHANGELOG-0.59.0.md
A CHANGELOG-0.59.1.md
A CHANGELOG-0.59.2.md
A CHANGELOG-0.59.3.md
A CHANGELOG-0.59.4.md
A CHANGELOG-0.59.5.md
M clear-glass/renderer/browser.css
M clear-glass/renderer/browser.html
M clear-glass/renderer/browser.js
A clear-glass/renderer/gig-panel.js
M clear-glass/renderer/guardian-picker.js
M clear-glass/spec/clear-glass.spec
A clear-glass/spec/design-surface.spec
A clear-glass/spec/guided-browser.spec
A clear-glass/src/accounts/idearium-login.js
M clear-glass/src/autofill/gig.js
M clear-glass/src/driver/index.js
M clear-glass/src/event-taxonomy.js
M clear-glass/src/ipc/agent-routes.js
M clear-glass/src/ipc/bridge.js
M clear-glass/src/main/index.js
A clear-glass/src/page/attention.js
A clear-glass/src/page/nexus-chat.js
M clear-glass/src/preload/index.js
M clear-glass/src/toolbar/commands.js
M cockpit/cli.js
M copilot/lifeline.js
M copilot/server.js
M copilot/spec/copilot.spec
M cortex/core/raid/routing-ir.js
A cos/spec/lab.spec
A cos/spec/qa-catalog.spec
A cos/spec/the-machine.spec
A cos/spec/torture-chamber.spec
M docs/2026-09-11-sovereign-node-architecture-phasemap.spec
M docs/2026-10-05-cli-data-code-phasemap.spec
M docs/2026-10-05-cos-machines-phasemap.spec
M docs/2026-10-09-hardening-pass-phasemap.spec
A docs/2026-10-10-design-surface-phasemap.spec
A docs/2026-10-10-idearium-access-phasemap.spec
A docs/2026-10-10-idearium-solid-phasemap.spec
A docs/2026-10-10-open-phases-index.spec
A docs/2026-10-10-self-awareness-phasemap.spec
A docs/2026-10-10-shape-of-nexus-phasemap.spec
A docs/2026-10-10-snapshot-compartments-phasemap.spec
M docs/SPEC-REGISTRY.spec
M docs/architecture-spec/architecture-spec.spec
M docs/guardian.spec
M docs/idearium.spec
A docs/language-routing.spec
M docs/nexstore-writers.yaml
M docs/nexus-nerve.spec
A docs/remote-access.spec
A docs/system-architecture.spec
M docs/the-path.md
M guardian/ask.js
M guardian/event-taxonomy.js
M guardian/interaction-contract.json
M guardian/lib/dispatch-ladder.js
M guardian/lib/dispatcher.js
M guardian/lib/gate-trail.js
M guardian/lib/index.js
M guardian/lib/job-retry.js
M guardian/lib/ncp-handler.js
M guardian/lib/wake-loop.js
A guardian/options.js
M guardian/routes/autonomous-loop.js
M guardian/server.js
A guardian/spec/agents-and-accounts.spec
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M guardian/userscript-deepseek.js
M guardian/userscript-gemini.js
M guardian/userscript-perplexity.js
M idearium/api/build-surface.js
M idearium/api/index.js
M idearium/cli/route-commands.js
M idearium/event-taxonomy.cjs
M idearium/idearium.config.json
M idearium/interaction-contract.json
A idearium/lib/access.cjs
M idearium/lib/config-core.cjs
M idearium/repo/snapshot.js
A idearium/spec/idea-to-spec.spec
M idearium/spec/idearium.spec
A idearium/spec/void.spec
M idearium/ui/architect.html
M idearium/ui/archive-import.html
M idearium/ui/desktop.html
M idearium/ui/index.html
A idearium/ui/js/access-guard.js
M idearium/ui/js/app.js
A idearium/ui/js/repo-card-time.js
M idearium/ui/js/repo-settings.js
M idearium/ui/js/repo-tasks.js
M idearium/ui/js/workshop.js
A idearium/ui/login.html
M idearium/ui/settings.html
M idearium/ui/spec-library.html
M idearium/ui/void.html
M idearium/ui/workshop.html
A intelligence/spec/self-awareness.spec
M lib/agent-capability-profile.js
M lib/agent-chat.js
M lib/agent-providers.js
M lib/agent-router.js
M lib/agent-tools/generate-tool-nodes.js
M lib/agent-tools/tools/nexus/command.js
M lib/economy/ledger.js
M lib/hat-seed.js
A lib/listener-commands.js
M lib/model-door.js
M lib/nerve/index.js
A lib/options.js
M lib/pipeline-routing.js
M lib/repo-agent.js
M lib/seam/adapters/warp-cascade.js
A lib/spec-census.js
M lib/version.js
M loom/maps/build-surface-map.js
M package.json
M tests/modules/run-all.js
M tests/modules/test-chat-transcripts.test.js
A tests/modules/test-field-nerve.test.js
M tests/modules/test-genesis-and-architecture-spec.test.js
A tests/modules/test-guardian-stack-sim.test.js
A tests/modules/test-idea-dump.test.js
A tests/modules/test-idearium-access.test.js
A tests/modules/test-idearium-solid.test.js
A tests/modules/test-listener-commands.test.js
M tests/modules/test-live-stream-and-gates.test.js
A tests/modules/test-nexus-chat.test.js
A tests/modules/test-options.test.js
A tests/modules/test-provider-lists.test.js
M tests/modules/test-vm-control.test.js
A tests/modules/test-workshop-nexus-specs.test.js
A tests/probe/gig-panel-glass.js
A tests/probe/guardian-picker-glass.js
A tests/probe/idearium-access-glass.js
M tests/probe/idearium-one-surface-glass.js
A tests/probe/nerve-field-glass.js
A tests/sim/fake-tab.js
A tests/sim/loop.js
M ui/tv-shell/index.html
M ui/tv-shell/menu.js
```

5 more (mostly data, logs and archived files) are in the ledger file.

