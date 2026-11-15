# Nexus 0.39.244

**NEXUS 0.39.244 — repo jobs reach their own tab; the Agent tab shows the provider tab live**

| | |
|---|---|
| Built | 2026-09-25 14:35:22 → 2026-09-25 14:35:22 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.244 |
| Tag | `v0.39.244` → snap-0669 |
| Full file ledger | [LEDGER-0.39.244.csv](../ledger/LEDGER-0.39.244.csv) |

## Release notes — `CHANGELOG-0.39.244.md`

Copied unchanged from the build.

### NEXUS 0.39.244 — repo jobs reach their own tab; the Agent tab shows the provider tab live

**Date:** 2026-09-25 · guardian 3.9.4 → 3.9.5 (userscripts: chatgpt, gemini, perplexity, deepseek 10.4.0 · claude 10.5.0) · copilot 3.5.0 → 3.5.1 · idearium 4.3.0 → 4.3.1

James, with a screenshot of the Agent tab showing "you: hello" and then, at once, "agent — failed · guardian unavailable or returned no real response":
- *"it immedietly failed, the cli in the agents tab in idearium."*
- *"the cli in the agents tab needs to have a live feed of the dom mutation/node anchor"*

#### 1. Why "hello" failed instantly
The request path is: Agent tab → idearium `repo-agent` (`agentId repo-<uuid>`) → copilot `backend:'guardian'` → guardian → **that repo's own provider tab**. Guardian's dispatcher opens that tab itself: `lib/dispatcher.js` `_awaitAgentTab` waits up to 60 s, then falls back to the shared tab.

Two checks upstream of the dispatcher refused the job first, because the *shared* chatgpt tab wasn't connected:
- **copilot/lifeline.js `_tryGuardian`** asked guardian's `/providers`. If `chatgpt` wasn't listed as connected, it returned a bare `null`. The job was never created, and no reason was passed on.
- **guardian/ask.js** failed fast on the same condition.

copilot then turned the `null` into its generic "guardian unavailable or returned no real response".

**Fixed:**
- **Pre-check skipped for repo jobs.** Neither check runs for a job that carries `agentId`. Guardian decides with real evidence (the tab opening, or the fallback).
- **The reason reaches the tab.** `_tryGuardian` returns `{ ok:false, error, jobId }`: guardian's own reason, the pre-check's evidence, or the exception text. Every caller already treated `!result || !result.ok` as failure.
- **copilot's 502 carries `jobId`.** idearium now knows whether guardian created a job.
- **`awaitLate` needs a real job.** `repo-agent` sets it only when a job exists (or when idearium's own wait timed out), and carries the `jobId`. `findLate` then matches exactly by job.

**Also fixed (my 0.39.241 bug):**
- The Agent tab's `api()` throws on `ok:false`, and it was throwing the response body away, `awaitLate` included. So on a real failure the late-reply watch never started. My test had stubbed `api()` and missed it.
- The error now keeps the body (`e.data`), and `agentSend` uses it.

#### 2. The live feed
The pieces already existed: the userscript's MutationObserver, its `GUARDIAN_CHUNK` stream, guardian's `/events`, idearium's `guardian-stream.cjs`, and the tab's SSE connection. The gaps were:
- **guardian's `/events` sent no payload.** Every frame was `{seq,type,ts,claimed}`. So idearium's "live `guardian.job.complete/.error` subscription" read `ev.data.jobId`, got `undefined`, and never did anything; only its boot sweep ever resolved chunks.
  - **Fixed:** `_feedFrame` gives each `guardian.job.*` frame a compact payload and adds the job's `agentId`, looked up once at this choke point instead of at 30 emit sites.
  - A chunk frame carries the delta plus the running length (`fullLen`), never the whole reply again.
- **No node anchor.** The page never said which node it was reading.
  - **Fixed:** each of the five provider userscripts (chatgpt, claude, gemini, perplexity, deepseek) now has `_nexusAnchor(el)`: a short CSS path plus `data-message-id`, `data-message-author-role`, `data-testid` and `data-is-streaming`, with child count and text length.
  - It rides on every `GUARDIAN_CHUNK` and on `reply-started`, together with the mutation count.
  - A `dom` progress pulse goes out at most once a second while the page is mutating, with `generating`.
  - The counters reset per job. `ncp-handler.js` passes these fields through.
- **idearium relays them.** `guardian-stream` `onFeed` takes `guardian.job.*` frames whose `agentId` is `repo-…` and passes them to `os.broadcast('idearium.repo.agent.feed', …)`. That's a new SSE-only broadcast: not ledgered, not on the SISO stream, because these are several-per-second observations, not state.
- **The Agent tab shows them.** A "live · provider tab" panel sits above the CLI. It shows:
  - generating or idle, the job, the provider, the mutation count and the reply length
  - the anchor path and attributes
  - a stage log: queued (awaiting agent tab), dispatched, submitted, reply-started, fallback, complete, error
  - the reply text streaming in
  - It is painted in place on each frame, never by re-rendering the tab.
  - `dom` pulses update the header without adding log rows.
  - Feed frames skip the global event log.

#### Proof
- **`test-agent-feed` 19/19** (new):
  - **The instant failure**, against a stub guardian whose `/providers` says chatgpt is down:
    - an `agentId` job is dispatched and answered
    - without `agentId` it's refused, with the reason
    - guardian's own reason and `jobId` travel up
    - copilot's 502 carries `jobId`
    - guardian `askSync` creates the `agentId` job despite the shared tab
  - **The feed:**
    - `_feedFrame` (verbatim from `server.js`) adds `agentId`, keeps chunks compact, and leaves non-job events alone
    - `ncp-handler` passes the anchor through
    - `guardian-stream` against a stub `/events` relays only repo-agent job frames
    - idearium wires it SSE-only
    - the tab's feed code (verbatim from `app.js`) keeps the anchor and mutations from pulses without log rows, streams the text, and resets on a new job
    - each of the five userscripts: `_nexusAnchor` run in jsdom produces `main#m > div.thread.x > article.turn:nth-of-type(2) > div.markdown.prose` with the message attributes; the chunk, `reply-started`, the throttled pulse and the reset are wired
- **Mutation checks:** each of the following was put back in turn:
  - the lifeline shared-tab pre-check: AF-01 to AF-03 fail
  - guardian's fail-fast: AF-05 fails
- **`test-repo-agent-late` 17/17**, including two new cases:
  - LR-01b: a refusal with no job doesn't wait, and its reason reaches the tab
  - LR-07b: with a `jobId` the match is exact
  - The watcher is proven to query by `jobId`, and the tab keeps the refusal body.
- **Updated to new contracts:**
  - `test-guardian-job-correlation` 120: its sandbox stubs the anchor helper
  - `test-lifeline-guardian-timeout` 5: a timeout is now `{ ok:false, error }`, not `null`
- **Full `run-all`, per suite, against 0.39.241:** nothing new fails. `copilot-provider-toggle` (19/20) and `lifeline-fluid-routing` (4/6) fail identically on 0.39.240.

#### What you'll see
- **"hello" with the shared chatgpt tab down:**
  - the feed shows `queued awaiting_agent_tab`, then `dispatched`, `progress:submitted`, the anchor and the mutation count climbing, and the text streaming in
  - if the repo's tab can't open, `agent_tab_fallback` with guardian's reason
- **If it still fails,** the transcript line now says why, in guardian's words.
- **If copilot stops waiting but guardian's job lives,** the line becomes "copilot stopped waiting — watching the Responses index", and the reply is adopted when it lands.

#### Needs a reload
Clear Glass loads guardian's userscripts into provider tabs. Tabs already open keep the old script until they reload; a restart of `start:all` covers it.

## Ledger

### Build 0.39.244 — snap-0669 — 2026-09-25 14:35:22

- Archive: `nexus-0669_2026-09-25_v0.39.244_patched.zip` (was `Nexus_v0_39_244_patched.zip`)
- SHA-256: `0c4eb60c7c0e73d72b6fc10b5aad3d90609e341ac6ed06f9ce562bc9341b2ac7`, 137.8 MB, downloaded 2026-09-25 14:36:19
- Kind: full
- Commit: `6bc9a438a6a6e49152ce8ba4cd9c57a84abf6423`, tag `snap-0669`
- Left out: embedded .git (1294 files, HEAD 53b8e385bc820954d39c1eb9bc4d870fcca385d2)
- Left out: node_modules (9706 files)
- Left out (50 MB or more): `versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)`
- Left out (50 MB or more): `versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)`
- Files in archive: 5342. Changes against the build before it: **1542 added, 50 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| data | 727 | 0 | 0 |
| idearium | 678 | 9 | 0 |
| intelligence | 135 | 4 | 0 |
| guardian | 0 | 11 | 0 |
| tests | 1 | 5 | 0 |
| copilot | 0 | 5 | 0 |
| (root) | 1 | 3 | 0 |
| architect | 0 | 2 | 0 |
| cortex | 0 | 2 | 0 |
| lib | 0 | 2 | 0 |
| loom | 0 | 2 | 0 |
| diagnostic | 0 | 1 | 0 |
| docs | 0 | 1 | 0 |
| eravos | 0 | 1 | 0 |
| ollama | 0 | 1 | 0 |
| versionium | 0 | 1 | 0 |

```
A CHANGELOG-0.39.244.md
M blueprint-index.json
M copilot/compartment.json
M copilot/lifeline.js
M copilot/server.js
M copilot/spec/copilot.spec
M docs/CHANGELOG.md
M guardian/ask.js
M guardian/lib/ncp-handler.js
M guardian/registry-components.js
M guardian/server.js
M guardian/spec/guardian.spec
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M guardian/userscript-deepseek.js
M guardian/userscript-gemini.js
M guardian/userscript-perplexity.js
M idearium/api/index.js
M idearium/index.js
M idearium/lib/guardian-stream.cjs
M idearium/package.json
A idearium/repo/repos/nexus-id-repo-af2180cf/.idearium-sources.json
A idearium/repo/repos/nexus-id-repo-af2180cf/atlas.json
A idearium/repo/repos/nexus-id-repo-af2180cf/graph.json
A idearium/repo/repos/nexus-id-repo-af2180cf/index.html
A idearium/repo/repos/nexus-id-repo-af2180cf/indexes/chunks.json
A idearium/repo/repos/nexus-id-repo-af2180cf/indexes/files.json
A idearium/repo/repos/nexus-id-repo-af2180cf/indexes/symbols.json
A idearium/repo/repos/nexus-id-repo-af2180cf/kernel/intake.js
A idearium/repo/repos/nexus-id-repo-af2180cf/kernel/kernel.js
A idearium/repo/repos/nexus-id-repo-af2180cf/manifest.json
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/acid-synth/acid-synth.engine.js
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/acid-synth/schema/schema.json
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/bass-drop-builder/bass-drop-builder.engine.js
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/bass-drop-builder/schema/schema.json
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/channel/channel.engine.js
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/channel/schema/schema.json
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/contrast-analyser/contrast-analyser.engine.js
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/contrast-analyser/schema/schema.json
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/edm-lab/edm-lab.engine.js
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/edm-lab/schema/schema.json
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/lfo/lfo.engine.js
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/lfo/schema/schema.json
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/macro-automation/macro-automation.engine.js
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/macro-automation/schema/schema.json
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/master-fx/master-fx.engine.js
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/master-fx/schema/schema.json
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/nexus-architect/nexus-architect.engine.js
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/nexus-architect/schema/schema.json
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/nexus-bridge/nexus-bridge.engine.js
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/nexus-bridge/schema/schema.json
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/nexus-cortex/nexus-cortex.engine.js
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/nexus-cortex/schema/schema.json
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/nexus-diagnostic/nexus-diagnostic.engine.js
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/nexus-diagnostic/schema/schema.json
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/nexus-guardian/nexus-guardian.engine.js
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/nexus-guardian/schema/schema.json
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/nexus-idearium/nexus-idearium.engine.js
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/nexus-idearium/schema/schema.json
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/nexus-orchestrator/nexus-orchestrator.engine.js
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/nexus-orchestrator/schema/schema.json
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/nexus-shared/nexus-node-core.js
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/pads/pads.engine.js
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/pads/schema/schema.json
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/photo-editor/photo-editor.engine.js
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/photo-editor/schema/schema.json
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/reese-bass/reese-bass.engine.js
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/reese-bass/schema/schema.json
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/sample-player/sample-player.engine.js
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/sample-player/schema/schema.json
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/sequencer/schema/schema.json
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/sequencer/sequencer.engine.js
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/serial-bridge/schema/schema.json
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/serial-bridge/serial-bridge.engine.js
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/sidechain-compressor/schema/schema.json
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/sidechain-compressor/sidechain-compressor.engine.js
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/supersaw/schema/schema.json
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/supersaw/supersaw.engine.js
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/timeline/schema/schema.json
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/timeline/timeline.engine.js
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/video-editor/schema/schema.json
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/video-editor/video-editor.engine.js
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/webhook-automation/schema/schema.json
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/webhook-automation/webhook-automation.engine.js
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/wobble-bass/schema/schema.json
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/wobble-bass/wobble-bass.engine.js
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/xy-pad/schema/schema.json
A idearium/repo/repos/nexus-id-repo-af2180cf/organisms/xy-pad/xy-pad.engine.js
A idearium/repo/repos/nexus-id-repo-af2180cf/project.json
A idearium/repo/repos/nexus-id-repo-af2180cf/runtime/alk-gl.js
A idearium/repo/repos/nexus-id-repo-af2180cf/runtime/canvas-cfr.js
A idearium/repo/repos/nexus-id-repo-af2180cf/runtime/canvas-wm.js
A idearium/repo/repos/nexus-id-repo-af2180cf/runtime/master-transport.js
A idearium/repo/repos/nexus-id-repo-af2180cf/runtime/organism-factory.js
A idearium/repo/repos/nexus-id-repo-af2180cf/runtime/precision-clock.js
A idearium/repo/repos/nexus-id-repo-af2180cf/runtime/precision-clock.worklet.js
A idearium/repo/repos/nexus-id-repo-af2180cf/runtime/wire-system.js
A idearium/repo/repos/nexus-id-repo-af2180cf/specs/ERAVOS.kernel.spec
A idearium/repo/repos/nexus-id-repo-af2180cf/specs/eravos.genomes-ecosystems-behaviors.spec
A idearium/repo/repos/nexus-id-repo-af2180cf/specs/eravos.nexus.build-contract.spec
A idearium/repo/repos/nexus-id-repo-af2180cf/specs/eravos.organism.pads.spec
A idearium/repo/repos/nexus-id-repo-af2180cf/specs/eravos.organism.sample-player.spec
A idearium/repo/repos/nexus-id-repo-af2180cf/specs/eravos.organism.sequencer.spec
A idearium/repo/repos/nexus-id-repo-af2180cf/specs/eravos.organism.timeline.spec
A idearium/repo/repos/nexus-id-repo-af2180cf/specs/eravos.pack.format.spec
A idearium/repo/repos/nexus-id-repo-af2180cf/verification.json
A idearium/repo/repos/nexus-id-repo-af2180cf/verification.lazy.json
M idearium/spec-engine/index.js
M idearium/spec-engine/templates/genesis.spec
M idearium/spec/idearium.spec
M idearium/ui/js/app.js
M lib/repo-agent.js
M lib/version.js
M package-lock.json
M package.json
M tests/modules/run-all.js
A tests/modules/test-agent-feed.test.js
M tests/modules/test-guardian-job-correlation.js
M tests/modules/test-lifeline-guardian-timeout.test.js
M tests/modules/test-repo-agent-late.test.js
M tests/modules/version-sync-and-registry.test.js
```

1471 more (mostly data, logs and archived files) are in the ledger file.

