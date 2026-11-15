# Nexus 0.39.247

**NEXUS 0.39.244 — repo jobs reach their own tab; the Agent tab shows the provider tab live**

| | |
|---|---|
| Built | 2026-09-25 15:46:28 → 2026-09-25 15:46:28 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.247 |
| Tag | `v0.39.247` → snap-0672 |
| Full file ledger | [LEDGER-0.39.247.csv](../ledger/LEDGER-0.39.247.csv) |

## Release notes — `CHANGELOG-0.39.247.md`

Copied unchanged from the build.

### NEXUS 0.39.247 — agents reply: one tab, one job at a time, every reply back

**Date:** 2026-09-25 · guardian 3.9.5 → 3.10.0 · userscripts (chatgpt, claude, gemini, perplexity, deepseek) busy guard

James: *"repo-agent jobs must use ONE ChatGPT tab"* · *"the agents are the ones writing code..."*

#### The root cause: listeners that never heard anything
guardian's bus (`SISOStream`, server.js) calls every `bus.on` listener with an envelope `{ type, data }`. Some listeners read `ev.data` (correct). Others destructured the payload directly, got `undefined`, and did nothing — in production only; tests use a plain EventEmitter, which passes the payload itself, so they passed.
- **`dispatch-pool-bridge.js`** — the ONLY code that frees a provider slot. It never did. At the old cap of 3, ChatGPT stopped receiving jobs after the third completed one, until guardian restarted.
- **`dispatcher.js`** completion watch (`guardian.job.complete`, `.chunk`, `.confirmed`) — finished jobs were never cleared from it; after 15 minutes the watch could re-mark a completed job queued and resend it (likely, not proven live).
- **`dispatcher.js`** `guardian.provider.disconnected` and **server.js** wake loop — read nothing.
**Fixed:** one `_payload()` helper accepts both shapes; all five listeners use it.

#### One tab
- **Per-repo tab routing removed** (0.39.237/TR1: `_awaitAgentTab`, `_requestAgentTab`, `_fallBackToSharedTab`, the cold-start `spawnProviderTab`). That path is what produced two windows: the repo tab missed its 60 s window, the job fell back to the shared tab, and the repo tab kept opening. Every job now goes to the provider's one active tab (`pushActive`). The job keeps its `agentId`, so the reply is still filed under the repo that asked.
- **One job per tab at a time.** Browser providers are capped at 1 in `dispatch-pool.js` (ollama keeps 8). A second job arriving mid-reply used to overwrite the userscript's `currentJobId`, killing the first job's reply watcher.
- **Userscript busy guard (all five).** A job arriving while another is being answered is refused with `GUARDIAN_ERROR` (`gate: tab_busy`) and the reason, never overwriting the running one.

#### Pool fixes (each invisible at cap 3, fatal at cap 1)
- **Waiting jobs were dropped.** A freed slot called `_flush(provider)` with no dispatch function; the job was shifted off the queue and emitted as `dispatch-ready`, which nothing listens to. Each waiting job now keeps its own dispatch function.
- **Job stealing removed.** It moved the slot to another provider while the job still went to the original (full) tab: cap bypassed, borrowed slot never released.
- **Undelivered jobs held their slot.** No tab connected / stale socket → the job went back on `pendingQueue` still holding its slot, then waited on itself when the tab connected. `pool.release()` now returns it; `_requeueOrFail` releases too, and a job that exhausts its retries now emits `guardian.job.error` so a waiting caller learns it failed.

#### Proof
- **`test-one-tab-e2e` 8/8** (new): the REAL `guardian/server.js`, booted from an isolated copy on scratch ports; one tab speaking real NCP (channel, register, ping ack, complete, busy guard); Clear Glass's `/cli/downloads` over the real `DownloadsStore`. Three repo jobs sent at once through `POST /api/copilot/prompt` (copilot's route): each gets its own reply; answered one at a time, none refused; no second tab opened; three `<jobId>.response` entries, filed under their repos, files inside the isolated copy holding the right reply. Before the listener fix, job 1 completed and jobs 2–3 never reached the tab — that run is what found the bus bug.
- Updated: `test-guardian-job-correlation` 120/120 (two checks now assert the one-tab rule). Removed: `tests/dispatcher-agent-tab-trigger.test.js` (tested the removed routing).
- Green: alk 34, provider-host-one-tab 7, agent-feed 19, chat-sync-agent-routing 8, ncp-hostile 5, response-downloads 9, response-sink 9, repo-agent-late 17.

#### Open
- `chat-sync` still targets a repo's own tab by `agentId`; with one tab it reports "no live tab" for repo syncs. Needs a decision on what "sync a repo's chat" means with one shared tab.
- A new conversation per job (clean context per chunk, as with the Ollama idea) is not built; jobs share the tab's current conversation.
- Not yet confirmed on your machine with the real ChatGPT page.

## Ledger

### Build 0.39.247 — snap-0672 — 2026-09-25 15:46:28

- Archive: `nexus-0672_2026-09-25_v0.39.247_vnamed-0.39.247.zip` (was `Nexus_v0_39_247.zip`)
- SHA-256: `0facf43df869f05e727705095907e13722e05f7b986e9db3b776aa4143dd052d`, 137.4 MB, downloaded 2026-09-25 15:46:28
- Kind: full
- Commit: `6b66aa4c78599a0e8868950d3baa8039958f0b6b`, tag `snap-0672`
- Left out: embedded .git (1294 files, HEAD 66f633cfe44d2a1b48166acb8f43266be674dc4d (main))
- Left out: node_modules (9706 files)
- Left out (50 MB or more): `versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)`
- Left out (50 MB or more): `versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)`
- Files in archive: 5358. Changes against the build before it: **2 added, 14 modified, 1 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| guardian | 0 | 10 | 0 |
| tests | 1 | 2 | 1 |
| (root) | 1 | 1 | 0 |
| lib | 0 | 1 | 0 |

```
A CHANGELOG-0.39.247.md
M guardian/lib/dispatch-pool-bridge.js
M guardian/lib/dispatch-pool.js
M guardian/lib/dispatcher.js
M guardian/registry-components.js
M guardian/server.js
M guardian/userscript-chatgpt.js
M guardian/userscript-claude.js
M guardian/userscript-deepseek.js
M guardian/userscript-gemini.js
M guardian/userscript-perplexity.js
M lib/version.js
M package.json
D tests/dispatcher-agent-tab-trigger.test.js
M tests/modules/run-all.js
M tests/modules/test-guardian-job-correlation.js
A tests/modules/test-one-tab-e2e.test.js
```

