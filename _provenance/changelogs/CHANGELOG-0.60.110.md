# Nexus 0.60.110

**0.60.110 — 2026-10-16 (built on the branch as 0.60.104; renumbered at the merge with main, which used 0.60.104–0.60.109)**

| | |
|---|---|
| Built | 2026-10-16 12:48:42 → 2026-10-16 12:48:42 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.60.110 |
| Tag | `v0.60.110` → snap-0759 |
| Full file ledger | [LEDGER-0.60.110.csv](../ledger/LEDGER-0.60.110.csv) |

## Release notes — `CHANGELOG-0.60.110.md`

Copied unchanged from the build.

### 0.60.110 — 2026-10-16 (built on the branch as 0.60.104; renumbered at the merge with main, which used 0.60.104–0.60.109)

James: "can you do the code tab changes?"

He sent a screenshot of the Code tab showing three problems:
- a pending `lib/intent-chain.js` from the agent, whose body is `// Placeholder implementation` and a `resolve()` that
  returns nulls, credited to a run marked `contract-complete`;
- `TL0_find_the_loss` building at attempt 9, 20 steps, 0 changed;
- the old layout, with every region open at once.

#### 1. A placeholder is not the work (the code.write gate)

- **What was wrong.** A brick's check (`lib/phase-plan.js checkChunk`) only looked for the export names its plan named.
  The stub exported `resolve`, so it passed, and the contract went complete.
- **What changed.** The one door every proposal passes (`lib/repo-inject.js` `_screen` and `land`) runs the code.write
  gate, and the gate node (`lib/step-gates/code.write.step_gate`) gains `not-a-placeholder` (a new check kind,
  `no_placeholder`, in `lib/step-gate.js`). A file an agent writes is refused when:
  - a comment on a line it adds calls the file a placeholder or a stub (the phrases are in the node; extend them there);
  - a line it adds throws "not implemented".
  The refusal names the line.
- **What it never judges:**
  - a person's file;
  - a line the file already had;
  - the same words inside a string or a name.
- `lib/stub-scanner.js` stays the broad advisory scan (TODO, hack, for now). This check is its narrow, hard subset.

#### 2. The Code tab, one view at a time, made solid (TB5)

- 0.60.103 split the tab into files, changes, plans, runs and COS, and left 7 of `test-code-tab`'s checks red. They were
  written for the old all-at-once layout. Each now opens the view it tests.
- **The Runs tab's live badge now updates from any view.** Before, it changed only on a full repaint, so a call running
  while you were in files did not show on the tab.
- **A draft in the agent box survives a view switch.** CT-31 was rewritten to check it.
- CT-22's own race is fixed: its first event's delayed reload landed after the stub had changed.

#### 3. TL0 is a question for him, not a build

- TL0 asked which screen and log lost the 17 chunks. Only he has that, so an agent searched the repo for 9 attempts and
  changed nothing.
- It was moved, whole, under `decisions:` of `docs/2026-10-16-durable-work-timeline-phasemap.spec` (addendum c). Entries
  there are kind `decision`, which no build picks. TL1 no longer waits on it.

#### Proof

- `test-inject-screen` 14/14. IS-10 is the screenshot's file.
- `test-step-gate` 18/18, `test-repo-inject` 83/83.
- `test-code-tab` 16/16 (was 9/16; driven in Clear Glass, never Playwright), `test-code-tab-expand` 8/8, `test-code-tab-merge` 8/8.

#### Not done, said

- The pending `lib/intent-chain.js` on his machine is still waiting for Apply. Reject it: IH1's real build waits on his
  answer to IH0a (one intent list with aliases, or three).
- "copilot gave no route: timed out after 5000ms" in the agent pane was not looked into.
- TB2/TB3a/TB4a (save every tool call, recall exact repeats first) and TB7 (the runs graph with zoom) are still open.

## Ledger

### Build 0.60.110 — snap-0759 — 2026-10-16 12:48:42

- Archive: `nexus-0759_2026-10-16_v0.60.110_named-0.60.11.zip` (was `nexus-0.60.11.zip`)
- SHA-256: `7b8091da910635dc5d35a9d49c749548df2039654378d3355ef06c037a821a4d`, 23.9 MB, downloaded 2026-10-16 12:49:49
- Kind: full
- Commit: `749efd77252af9573b723431d0cb7be2abfa8c72`, tag `snap-0759`
- Files in archive: 6018. Changes against the build before it: **311 added, 81 modified, 4 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| cos | 262 | 4 | 0 |
| clear-glass | 13 | 15 | 4 |
| docs | 8 | 19 | 0 |
| tests | 10 | 9 | 0 |
| (root) | 11 | 5 | 0 |
| lib | 3 | 12 | 0 |
| idearium | 2 | 11 | 0 |
| loom | 0 | 4 | 0 |
| erosmancer | 1 | 2 | 0 |
| .claude | 1 | 0 | 0 |

```
A .claude/skills/james-brooks
A CHANGELOG-0.60.100.md
A CHANGELOG-0.60.101.md
A CHANGELOG-0.60.102.md
A CHANGELOG-0.60.103.md
A CHANGELOG-0.60.104.md
A CHANGELOG-0.60.105.md
A CHANGELOG-0.60.106.md
A CHANGELOG-0.60.107.md
A CHANGELOG-0.60.108.md
A CHANGELOG-0.60.109.md
A CHANGELOG-0.60.110.md
M CHANGELOG-0.60.97.md
M CHANGELOG-0.60.98.md
M CHANGELOG-0.60.99.md
M README.md
M clear-glass/package.json
M clear-glass/spec/clear-glass.spec
M clear-glass/src/accounts/login-portal.js
A clear-glass/src/contexts/google-signin.js
M clear-glass/src/contexts/manager.js
M clear-glass/src/contexts/session-headers.js
M clear-glass/src/fingerprint/engine.js
A clear-glass/src/fingerprint/firefox-version.js
M clear-glass/src/main/index.js
M clear-glass/src/net/policy.js
M clear-glass/src/net/service.js
M clear-glass/src/page/semantic-tree.js
A clear-glass/src/preload/google-signin.js
M clear-glass/src/providers/account-switch.js
M clear-glass/src/providers/attention.js
M clear-glass/src/providers/host.js
M clear-glass/src/providers/profile-tabs.js
A clear-glass/src/tls/helper.js
M clear-glass/src/tls/proxy.js
A clear-glass/test/google-signin.test.js
D clear-glass/test/provider-idle-signin.test.js
D clear-glass/test/signin-in-provider-tab.test.js
D clear-glass/test/signin-profile-jar.test.js
D clear-glass/test/signin-profile-tab-reload.test.js
A clear-glass/tls-helper/bin/SHA256SUMS
A clear-glass/tls-helper/bin/linux-amd64/cg-tls-helper
A clear-glass/tls-helper/bin/windows-amd64/cg-tls-helper.exe
A clear-glass/tls-helper/build.js
A clear-glass/tls-helper/go.mod
A clear-glass/tls-helper/go.sum
A clear-glass/tls-helper/main.go
A clear-glass/tls-helper/main_test.go
M cos/app/store.js
A cos/archetype/eravos-canvas/.template-tree
A cos/archetype/eravos-canvas/README.md
A cos/archetype/eravos-canvas/build/index-tools.mjs
A cos/archetype/eravos-canvas/build/new-tool.mjs
A cos/archetype/eravos-canvas/build/validate.mjs
A cos/archetype/eravos-canvas/canvas/index.html
A cos/archetype/eravos-canvas/canvas/kernel/intake.js
A cos/archetype/eravos-canvas/canvas/kernel/kernel.js
A cos/archetype/eravos-canvas/canvas/runtime/add-menu.js
A cos/archetype/eravos-canvas/canvas/runtime/canvas-wm.js
A cos/archetype/eravos-canvas/canvas/runtime/content-packs.js
A cos/archetype/eravos-canvas/canvas/runtime/desktop-bridge.js
A cos/archetype/eravos-canvas/canvas/runtime/eravos.css
A cos/archetype/eravos-canvas/canvas/runtime/expansion.js
A cos/archetype/eravos-canvas/canvas/runtime/history.js
A cos/archetype/eravos-canvas/canvas/runtime/organism-factory.js
A cos/archetype/eravos-canvas/canvas/runtime/organism-sdk.js
A cos/archetype/eravos-canvas/canvas/runtime/pack-editor.js
A cos/archetype/eravos-canvas/canvas/runtime/plain-errors.js
A cos/archetype/eravos-canvas/canvas/runtime/preview.css
A cos/archetype/eravos-canvas/canvas/runtime/preview.js
A cos/archetype/eravos-canvas/canvas/runtime/recipes.js
A cos/archetype/eravos-canvas/canvas/runtime/tool-settings.js
A cos/archetype/eravos-canvas/canvas/runtime/ui-kit.js
A cos/archetype/eravos-canvas/canvas/runtime/wire-menu.css
A cos/archetype/eravos-canvas/canvas/runtime/wire-system.js
A cos/archetype/eravos-canvas/canvas/runtime/workspace.js
A cos/archetype/eravos-canvas/canvas/scripts.js
A cos/archetype/eravos-canvas/index.html
A cos/archetype/eravos-canvas/schemas/category.schema.json
A cos/archetype/eravos-canvas/schemas/domain.schema.json
A cos/archetype/eravos-canvas/schemas/mode.schema.json
A cos/archetype/eravos-canvas/schemas/pack.schema.json
A cos/archetype/eravos-canvas/schemas/tool.schema.json
A cos/archetype/eravos-canvas/serve.js
A cos/archetype/eravos-canvas/templates/category/category.json
A cos/archetype/eravos-canvas/templates/domain/domain.json
A cos/archetype/eravos-canvas/templates/mode/__MODE__.mode.json
A cos/archetype/eravos-canvas/templates/pack/pack.json
A cos/archetype/eravos-canvas/templates/tool-sound/README.md
A cos/archetype/eravos-canvas/templates/tool-sound/__TOOL__.engine.js
A cos/archetype/eravos-canvas/templates/tool-sound/__TOOL__.spec
A cos/archetype/eravos-canvas/templates/tool-sound/__TOOL__.test.js
A cos/archetype/eravos-canvas/templates/tool-sound/__TOOL__.ui.js
A cos/archetype/eravos-canvas/templates/tool-sound/packs/factory/pack.json
A cos/archetype/eravos-canvas/templates/tool-sound/preview.svg
A cos/archetype/eravos-canvas/templates/tool-sound/tool.json
A cos/archetype/eravos-canvas/templates/tool/README.md
A cos/archetype/eravos-canvas/templates/tool/__TOOL__.engine.js
A cos/archetype/eravos-canvas/templates/tool/__TOOL__.spec
A cos/archetype/eravos-canvas/templates/tool/__TOOL__.test.js
A cos/archetype/eravos-canvas/templates/tool/__TOOL__.ui.js
A cos/archetype/eravos-canvas/templates/tool/packs/factory/pack.json
A cos/archetype/eravos-canvas/templates/tool/preview.svg
A cos/archetype/eravos-canvas/templates/tool/tool.json
A cos/archetype/eravos-canvas/tests/harness.js
A cos/archetype/eravos-canvas/tests/run.html
A cos/archetype/eravos-canvas/tools/index.js
A cos/archetype/eravos-domains/.template-tree
A cos/archetype/eravos-domains/dataflow/core/dataflow.js
A cos/archetype/eravos-domains/dataflow/domain.json
A cos/archetype/eravos-domains/dataflow/index.js
A cos/archetype/eravos-domains/music/content/bundles/80s/pack.json
A cos/archetype/eravos-domains/music/content/bundles/club/pack.json
A cos/archetype/eravos-domains/music/content/bundles/edm-pads/pack.json
A cos/archetype/eravos-domains/music/content/bundles/index.js
A cos/archetype/eravos-domains/music/content/bundles/seq-songs/pack.json
A cos/archetype/eravos-domains/music/core/audio-recorder.js
A cos/archetype/eravos-domains/music/core/audio.js
A cos/archetype/eravos-domains/music/core/codecs.js
A cos/archetype/eravos-domains/music/core/master-transport.js
A cos/archetype/eravos-domains/music/core/music-theory.js
A cos/archetype/eravos-domains/music/core/music.css
A cos/archetype/eravos-domains/music/core/plain-errors-music.js
A cos/archetype/eravos-domains/music/core/precision-clock.js
A cos/archetype/eravos-domains/music/core/preview-music.js
A cos/archetype/eravos-domains/music/core/sdk-music.js
A cos/archetype/eravos-domains/music/core/ui-music.js
A cos/archetype/eravos-domains/music/core/vendor/LAME-LICENSE.txt
A cos/archetype/eravos-domains/music/core/vendor/README.txt
A cos/archetype/eravos-domains/music/core/vendor/lame.min.js
A cos/archetype/eravos-domains/music/core/xen-theory.js
A cos/archetype/eravos-domains/music/domain.js
A cos/archetype/eravos-domains/music/index.js
A cos/archetype/eravos-sound-tool/.template-tree
A cos/archetype/eravos-sound-tool/README.md
A cos/archetype/eravos-sound-tool/__TOOL__.engine.js
A cos/archetype/eravos-sound-tool/__TOOL__.spec
A cos/archetype/eravos-sound-tool/__TOOL__.test.js
A cos/archetype/eravos-sound-tool/__TOOL__.ui.js
A cos/archetype/eravos-sound-tool/packs/factory/pack.json
A cos/archetype/eravos-sound-tool/preview.svg
A cos/archetype/eravos-sound-tool/tool.json
A cos/archetype/eravos-tool/.template-tree
A cos/archetype/eravos-tool/README.md
A cos/archetype/eravos-tool/__TOOL__.engine.js
A cos/archetype/eravos-tool/__TOOL__.spec
A cos/archetype/eravos-tool/__TOOL__.test.js
A cos/archetype/eravos-tool/__TOOL__.ui.js
A cos/archetype/eravos-tool/packs/factory/pack.json
A cos/archetype/eravos-tool/preview.svg
```

246 more (mostly data, logs and archived files) are in the ledger file.

