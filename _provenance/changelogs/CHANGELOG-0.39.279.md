# Nexus 0.39.279

**NEXUS 0.39.279: agents in Clear Glass, Gemini and DeepSeek whole, "hey nexus" from any chat, branches and desktops, a settings console, staging S0 + S1**

| | |
|---|---|
| Built | 2026-09-29 04:16:46 → 2026-09-29 04:16:46 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.279 |
| Tag | `v0.39.279` → snap-0711 |
| Full file ledger | [LEDGER-0.39.279.csv](../ledger/LEDGER-0.39.279.csv) |

## Release notes — `CHANGELOG-0.39.279.md`

Copied unchanged from the build.

### NEXUS 0.39.279: agents in Clear Glass, Gemini and DeepSeek whole, "hey nexus" from any chat, branches and desktops, a settings console, staging S0 + S1

**Date:** 2026-09-29 · base: 0.39.278 · MINOR: new routes (below)

James: *"can you fix gemini and deepseek. i want the agents to be able to use clearglass. i also want to be able to have
copilot interact on clearglass using a virtual input through erosmanceros, nexus nerve, spotlight injected css into web
pages, and a interaction field for xyz coords to help the agents see and navigate the ui in clearglass. I really need to
get a job, and i want to be able to automate as much as possible."* · *"i want to have agents be able to retrieve the
context with agent tools, not injected each time. have only necessities injected, and everything else available with
the tool layers. i want the agents to be able to use hey nexus, its detected but the response from nexus isnt injected
as a job."* · *"I was thinking we could have cos create the vm envirement, and each new repo, if applicable could create
a branch of the original, to save resources, can you also make it so once its generated, you can open it like a desktop
envirement?"* · *"can you have a full enterprise grade settings menu that encompassed all the idearium compartment and
agent settings. and if you have more, can you work on the self heal contract"*

#### Gemini and DeepSeek read the whole conversation

- guardian/userscript-gemini.js: user-query / model-response turns (AI Studio: ms-chat-turn) in page order, thinking
  (model-thoughts, opened by the chat-stream prelude's "Show thinking") apart from the reply.
- guardian/userscript-deepseek.js: every .ds-message; a reply carries .ds-markdown outside the thinking
  (.ds-think-content). Chat id = the session id of /a/chat/s/<id>.
- A page without turns falls back to the newest reply, marked partial, as before. Perplexity is unchanged.
- Proof: tests/probe/gemini-deepseek-reader-chromium.js 11/11 on pages built to those shapes. **Not checked against
  the live gemini.google.com / chat.deepseek.com DOM from here.**

#### "hey nexus" is answered from any chat, as a job

- guardian/lib/wake-loop.js handleTranscript: the settled transcript's newest turn, when it is the agent's and starts a
  line with a wake, is answered as a wake-reply job typed into THAT chat (createJob chatUrl; the dispatcher resumes
  it). Once per turn; never while generating; depth = the run of [NEXUS] answers just sent. The job path and the
  transcript path defer to each other once, so a wake both see is answered once. guardian/server.js listens to
  guardian.ncp.transcript.
- Repo agents now know they can ask: a one-line 'wake' prompt block (browser agents).
- Proof: tests/modules/test-guardian-wake.js 21/21 (WK-040…WK-044 new).

#### Context by tools; only necessities injected

- lib/repo-prompt-blocks.js 1.2.0: memory, context-atlas and context-directory are OFF by default; a 'context-tools'
  block names nexus.context.tool, and 'wake' is added. Reset now restores each block's default on/off (it used to
  switch every block on). Memory is recalled only when its block is on (dispatch and preview).
- The harness first message stays under 3,000 characters (RH-006) with both new lines: the layer tools are named once.
- Fixed: 0.39.278 listed the chat-stream prelude as an agent provider ("chat-stream"); lib/agent-providers.js excludes it.
- Proof: test-composed-prompt 20/20 (CP-101 was already failing on 0.39.277 — it predated voice and context-map-off),
  test-agent-memory 9/9, test-registry-harness 7/7, test-repo-agent-provider 60/60 (was failing on 0.39.277).

#### Clear Glass: the interaction field, a virtual pointer, a spotlight

- clear-glass/src/page/field.js: field (every interactive element numbered, with box, centre x/y and z = layers
  covering it; optional drawn overlay + labelled grid, pointer-events:none), at(x,y), spotlight (injected CSS ring +
  label), describe() (a text map a small model reads), pointerPath().
- Driver actions field / fieldOff / at / spotlight / pointer {n | x,y | selector, do, text, via}: native =
  sendInputEvent along a curved path; eros = ErosmancerOS POST /api/input (new; the behaviour engine's curvedPath over
  CDP), wired through main/index.js's tab resolver. A covered target is reported, an off-screen one refused.
- clearglass.browser.tool field / pointer / spotlight (text map, not 150 objects); the pane's DRIVER_ACTIONS and
  compact list; field.map / field.spotlight forwarded to NEXUS.
- Proof: tests/modules/test-cg-field.test.js 13/13; tests/probe/field-chromium.js 12/12. ErosmancerOS: tsc clean
  apart from its existing TS6059; its /api/input was not run against a live browser here.

#### COS workspaces: code repos as branches, a repo's VM as a desktop

- cos/workspace/index.js: branchWorkspace (the original made its own git repository, then a worktree on
  nexus/<name>; reused; uncommitted work snapshotted first), listBranches / removeBranch (the branch is kept),
  branchDisk (qcow2 overlay of the original's disk), startDesktop / desktopStatus / stopDesktop.
- cos/compartment/qemu-runtime.js: a headless VM's display is also a websocket on 5700+N; desktopPorts().
- cos/testenv/provision.js --with desktop: xfce + lightdm autologin (user nexus), graphical boot.
- idearium: the Code button's repo is a branch of the original (worktree + child compartment) unless body.branch is
  false or repos.code_repo_mode is 'copy'; the repo records branchOf/branch. /api/repos/:uuid/desktop (GET status,
  POST start, DELETE stop), /api/repos/:uuid/branches, idearium/ui/desktop.html (noVNC), an "open desktop" button.
- lib/cos-bridge.js: branchWorkspace, listBranches, desktop.
- Proof: tests/modules/test-cos-workspace.test.js 11/11 (real git; QEMU, the process and the guest agent faked).
  **No VM was booted here (no QEMU); the desktop viewer was not loaded against a real VNC websocket.**

#### The settings console

- idearium/ui/settings.html: global config (every key with its source default/file/runtime, bounds, reset) and per
  repo Agent / Prompt (every block: on/off, text, reset, live preview) / Hat / Compartment & desktop. Edits wait in a
  save bar; each goes to the route that owns it. A branch shows its original's settings read-only.
- GET /api/settings/console[/:uuid], POST /api/config/reset; config keys repos.code_repo_mode, desktop.ram_mb,
  desktop.cpus, desktop.network. ⚙ settings in idearium's top bar and each repo's settings tab.
- idearium/api/index.js exports _route (one request through the real router, for tests).
- Proof: tests/modules/test-settings-console.test.js 5/5; tests/probe/settings-console-chromium.js 10/10.

#### Staging self-heal: S0 and S1 closed

- S0 (versionium): createBranch records forkedFrom and starts the branch at the fork commit; commit({from});
  branches(), forkPoint(); GET/POST /api/versionium/branches. Closes spec gap V2.
- S1: lib/repo-inject.js status 'staged'; lib/code-edit.js 1.1.0 stage() (one versionium commit on
  repo-<uuid>@staging caused by the gap, the repo untouched, unrecorded = undone) and promote() (the one apply,
  all-or-nothing, conflicts never overwrite); code API stage:true, GET code/staged, POST code/promote.
- docs/2026-09-28-staging-self-heal-phasemap.spec: S0 and S1 CLOSED with findings, what landed and proof.
- Proof: tests/modules/test-staging-s0-s1.test.js 7/7; 12 existing versionium / code-edit / inject suites unchanged.

#### Versions

system 0.39.279 · guardian 3.17.0 · idearium 4.10.0 · versionium 3.4.0 · clear-glass 3.20.0 · ErosmancerOS 0.2.0 ·
userscript-gemini / -deepseek 10.10.0 · repo-prompt-blocks 1.2.0 · code-edit 1.1.0.

#### Not done

- Loom: the new files are wired by the source scanner through their require()s; the HTTP edges (Clear Glass → Eros
  /api/input, desktop.html → the VM websocket) are not hand-mapped yet.
- Staging S2 onward (the heal loop landing on staging, the verify gate, score, promote dial, rewind, feedback).
- Moving per-repo settings out of cortex's store into idearium's (the sovereignty map's plan) — the console reads and
  writes them where they are today.

## Ledger

### Build 0.39.279 — snap-0711 — 2026-09-29 04:16:46

- Archive: `nexus-0711_2026-09-29_v0.39.279.zip` (was `nexus-0.39.279.zip`)
- SHA-256: `424a6b2bf2dc0a956cb548fd1a12814db6297b0e4a52fdcf0f1ed9526742622e`, 12.8 MB, downloaded 2026-09-29 04:23:46
- Kind: full
- Commit: `43f4c1ad4957e07dde71a2b6d6b3ec7f28125969`, tag `snap-0711`
- Identical copy: `nexus-0711_2026-09-29_v0.39.279_1_dup1.zip` (was `nexus-0.39.279-1.zip`)
- Identical copy: `nexus-0711_2026-09-29_v0.39.279_2_dup2.zip` (was `nexus-0.39.279-2.zip`)
- Identical copy: `nexus-0711_2026-09-29_v0.39.279_3_dup3.zip` (was `nexus-0.39.279-3.zip`)
- Identical copy: `nexus-0711_2026-09-29_v0.39.279_4_dup4.zip` (was `nexus-0.39.279-4.zip`)
- Identical copy: `nexus-0711_2026-09-29_v0.39.279_5_dup5.zip` (was `nexus-0.39.279-5.zip`)
- Identical copy: `nexus-0711_2026-09-29_v0.39.279_6_dup6.zip` (was `nexus-0.39.279-6.zip`)
- Identical copy: `nexus-0711_2026-09-29_v0.39.279_7_dup7.zip` (was `nexus-0.39.279-7.zip`)
- Files in archive: 4361. Changes against the build before it: **12 added, 55 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| tests | 7 | 10 | 0 |
| guardian | 0 | 9 | 0 |
| idearium | 2 | 6 | 0 |
| lib | 0 | 8 | 0 |
| clear-glass | 1 | 6 | 0 |
| docs | 0 | 6 | 0 |
| erosmancer | 0 | 4 | 0 |
| cos | 1 | 2 | 0 |
| versionium | 0 | 3 | 0 |
| (root) | 1 | 1 | 0 |

```
A CHANGELOG-0.39.279.md
M clear-glass/package.json
M clear-glass/spec/clear-glass.spec
M clear-glass/src/copilot/bridge.js
M clear-glass/src/copilot/tools.js
M clear-glass/src/driver/index.js
M clear-glass/src/main/index.js
A clear-glass/src/page/field.js
M cos/compartment/qemu-runtime.js
M cos/testenv/provision.js
A cos/workspace/index.js
M docs/2026-09-28-staging-self-heal-phasemap.spec
M docs/atlases/clear-glass-atlas.md
M docs/atlases/guardian-atlas.md
M docs/atlases/idearium-atlas.md
M docs/atlases/versionium-atlas.md
M docs/cos.spec
M erosmancer/erosmancer-os/CHANGELOG.md
M erosmancer/erosmancer-os/package.json
M erosmancer/erosmancer-os/src/api/server.ts
M erosmancer/erosmancer-os/src/behavior/index.ts
M guardian/lib/dispatcher.js
M guardian/lib/jobs.js
M guardian/lib/wake-loop.js
M guardian/server.js
M guardian/spec/guardian.spec
M guardian/userscript-chat-stream.js
M guardian/userscript-deepseek.js
M guardian/userscript-gemini.js
M guardian/userscripts.yaml
M idearium/api/index.js
M idearium/lib/config-core.cjs
M idearium/repo/code-api.js
M idearium/repo/index.js
A idearium/ui/desktop.html
M idearium/ui/index.html
M idearium/ui/js/app.js
A idearium/ui/settings.html
M lib/agent-providers.js
M lib/agent-tools/tools/clear-glass/browser.js
M lib/code-edit.js
M lib/cos-bridge.js
M lib/repo-agent.js
M lib/repo-inject.js
M lib/repo-prompt-blocks.js
M lib/version.js
M package.json
M tests/modules/run-all.js
M tests/modules/test-agent-hat-agnostic.test.js
M tests/modules/test-agent-memory.test.js
A tests/modules/test-cg-field.test.js
M tests/modules/test-chat-ledger-stream.test.js
M tests/modules/test-chat-transcripts.test.js
M tests/modules/test-composed-prompt.test.js
A tests/modules/test-cos-workspace.test.js
M tests/modules/test-guardian-wake.js
M tests/modules/test-live-stream-and-gates.test.js
M tests/modules/test-registry-harness.test.js
M tests/modules/test-repo-agent-provider.js
A tests/modules/test-settings-console.test.js
A tests/modules/test-staging-s0-s1.test.js
A tests/probe/field-chromium.js
A tests/probe/gemini-deepseek-reader-chromium.js
A tests/probe/settings-console-chromium.js
M versionium/lib/engine.js
M versionium/routes/versionium.js
M versionium/spec/versionium.spec
```

