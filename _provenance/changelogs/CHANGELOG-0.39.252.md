# Nexus 0.39.252

**NEXUS 0.39.252 — an agent's "hey nexus" is answered once, as a job**

| | |
|---|---|
| Built | 2026-09-25 17:18:29 → 2026-09-25 17:18:29 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.252 |
| Tag | `v0.39.252` → snap-0674 |
| Full file ledger | [LEDGER-0.39.252.csv](../ledger/LEDGER-0.39.252.csv) |

## Release notes — `CHANGELOG-0.39.252.md`

Copied unchanged from the build.

### NEXUS 0.39.252 — an agent's "hey nexus" is answered once, as a job

**Date:** 2026-09-25 · guardian 3.11.0 → 3.11.1 · clear-glass 3.14.0 → 3.14.1 · nexus-wake 1.0.0 → 1.1.0 · Versionium `vtm-7a5e6093` (parent `vtm-f0839dcd`, 0.39.251) · git `50a44d6`

James, with a screenshot and log: *"it sends the response the wrong location … 'NEXUS CO-PILOT: I'm here and ready to assist you. How can I help you today?' is supposed to be injected into the chat like a job. it is for the agents to talk to nexus. not me."* — *"its not voice assistance. its for the agents to talk to nexus through clearglass."*

#### What the screenshot and log showed
ChatGPT answered job `0b115a95` with `hey nexus, what's the current state of the dangling-hook failures, including the open gaps and any recent test results?`. Then:
- **`wake from chatgpt: w`.** The wake fired while the reply was still streaming, so co-pilot was asked "w".
- **An overlay for the person and text left in the composer.** The overlay (`NEXUS CO-PILOT · > w · Hello! How can I assist you today?`) was addressed to James, and the composer held the answer unsent.
- **A `/wake-reply` job that was never typed.** Job `e99bac4a` ("I'm here and ready…") was created but never dispatched. The tab was still busy with `0b115a95`, whose reply was never detected (the open ChatGPT break).
- **A second wake, also cut off.** It fired on `…including the open gaps`.

#### Mapped: three answerers for one agent wake
1. **The page.** `guardian/userscript-nexus-wake.js` `checkMessage()` runs on every mutation of a streaming reply, so it matched the first fragment. It asked co-pilot, drew the overlay and typed the answer into the composer without `submit()`. That was deliberate at the time, on the assumption that this was the person's channel.
2. **Clear Glass.** Cortex's `/api/meta/observe` is posted when the reply first **appears**, so it matched the same fragment. `clear-glass/src/copilot/wake-relay.js` answered it again as a `/wake-reply` job.
3. **Guardian.** `guardian/lib/wake-loop.js` is the right design: it reads the completed reply, skips fences and quotes, caps depth, answers once per job, asks co-pilot's tool loop, and sends a real job back. But it ran for mesh jobs only, "the userscript answers its own wakes".

#### Changed
- **`guardian/lib/wake-loop.js` answers every agent wake**, for every transport, once, from the completed reply.
  - **Pinned back to the tab that asked.** The `wake-reply` job goes to that userscript tab (`transport: 'ncp'`) unless the asking job came through the mesh.
  - **Sent, not just typed.** It is typed *and sent* like any job, so the agent receives it.
  - **Framed for the agent:** `[NEXUS] answer to your "hey nexus, <ask>"`, then the answer.
- **`userscript-nexus-wake.js` 1.1.0.** `checkMessage()` only reports whether a message addresses NEXUS. It asks nothing, renders nothing, types nothing and writes no ledger.
- **`wake-relay.js`** returns on an agent wake (`role: 'assistant'`) and logs where it went. It still answers a non-agent wake. Cortex still records every wake (`nexus_wake_events`, the REPL).

#### Depends on
- **Reply detection.** A wake is answered when its job **completes**. On ChatGPT that needs the reply to be detected, which is the open break; 0.39.251's element picker is how it gets fixed (pick the reply, assign it). Until then a ChatGPT wake gets no answer at all, instead of a wrong one in the composer.
- **Non-job chats.** A wake in a chat that was not a guardian job (a person chatting with the agent directly) has no completion, so this loop does not answer it.

#### Tests
- **`test-guardian-wake`** 16/16:
  - WK-012 rewritten: ncp and unpinned jobs are answered once and pinned back.
  - WK-017 new: the full request reaches co-pilot, and the reply is framed.
  - WK-018 new: the real relay, fed the exact event cortex emits for an agent, makes no co-pilot call, no guardian job and no overlay.
  - WK-011 now expects the framed prompt and `transport: null` for mesh.
  - WK-020 retitled to what it proves (a non-agent wake).
- **`test-nexus-wake`** NW-027 and NW-030 rewritten: `checkMessage()` has no side effects, run against the exact fragment from the log.
  - NW-020, NW-033 and NW-034 fail identically at 0.39.251. They predate this and are untouched.
- **Mutation checks:** each of the following was reverted in turn, and each reversion failed its test:
  - mesh-only again
  - the relay answering agent wakes again
  - the 0.39.251 page code
  - no framing
- **Regression:** version-sync 30, record-discipline 9, wake-relay-real-endpoint 8, userscripts-manifest 6, repo-agent-provider 41, agent-mesh-guardian-coverage 7, cg-selector-assign 10.
- **Fixed in 0.39.251's own test.** SA-06 compared guardian-picker against git `HEAD`, which contains the line once 0.39.251 is committed, so it could only pass uncommitted. It is now pinned to the 0.39.250 picker (`43c3f62`).

#### Found, not changed
- **Guardian's version claims have drifted:** `guardian/interaction-contract.json` says 3.5.0 and `guardian/server.js` hardcodes 3.6.1 (boot event, `/version`), against the canonical 3.11.1.
- **Page-path composer intercept.** When a person types `hey nexus, …` and presses Enter, `onKeyDown` still intercepts the turn and answers in the overlay. James said the channel is the agents', not his. Left as it was pending his word.
- **`tests/modules/run-all.js` writes real data.** Six of its suites write outside `data/` (`intelligence/data/`, `versionium/data/snapshots/`, `bridge/data/`) as well as into it. Running it during this release polluted the tree; everything was restored from the verified 0.39.251 tree and diffed to zero.

## Ledger

### Build 0.39.252 — snap-0674 — 2026-09-25 17:18:29

- Archive: `nexus-0674_2026-09-25_v0.39.252.zip` (was `Nexus_v0_39_252.zip`)
- SHA-256: `27cd33cc4d03b01dc45505b7715eecc23779cbcdac3fcc79963e61a18ac39bfe`, 144.4 MB, downloaded 2026-09-25 17:18:29
- Kind: full
- Commit: `94306d2fbbb54abd5253a5c410312f6374dd39f2`, tag `snap-0674`
- Left out: embedded .git (1900 files, HEAD 66f633cfe44d2a1b48166acb8f43266be674dc4d (main))
- Left out: node_modules (9706 files)
- Left out (50 MB or more): `versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)`
- Left out (50 MB or more): `versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)`
- Files in archive: 5374. Changes against the build before it: **1 added, 24 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 0 | 6 | 0 |
| guardian | 0 | 5 | 0 |
| data | 0 | 4 | 0 |
| tests | 0 | 4 | 0 |
| (root) | 1 | 2 | 0 |
| docs | 0 | 2 | 0 |
| lib | 0 | 1 | 0 |

```
A CHANGELOG-0.39.252.md
M clear-glass/interaction-contract.json
M clear-glass/package.json
M clear-glass/registry-components.js
M clear-glass/spec/clear-glass.spec
M clear-glass/src/copilot/wake-relay.js
M clear-glass/src/main/index.js
M data/cortex/memory/event_log.json
M data/versionium/versionium_branches.json
M data/versionium/versionium_calendar.json
M data/versionium/versionium_commits.json
M docs/atlases/clear-glass-atlas.md
M docs/atlases/guardian-atlas.md
M guardian/lib/wake-loop.js
M guardian/registry-components.js
M guardian/spec/guardian.spec
M guardian/userscript-nexus-wake.js
M guardian/userscripts.yaml
M lib/version.js
M package-lock.json
M package.json
M tests/modules/test-cg-selector-assign.test.js
M tests/modules/test-guardian-wake.js
M tests/modules/test-nexus-wake.js
M tests/modules/version-sync-and-registry.test.js
```

