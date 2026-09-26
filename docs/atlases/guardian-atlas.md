# guardian — The AI Engine of NEXUS

> **v3.6.2 (active)** · port 7820 · the only system that touches AI providers — everything else requests work through it

**Author:** James Brooks (Erosmancer) · rheon.world

---

## What It Is

Guardian is NEXUS's sole point of contact with AI providers. No other system holds API keys or makes external inference calls — everything routes through Guardian's NCP (browser-tab) connections or its local Ollama bridge. Its own spec states the boundary plainly: *"No API keys. No external inference calls. Browser tabs only."* SEAM compresses intent before sending, so a request never reaches a provider un-shaped.

---

## Quick Start

Not confirmed this session — `guardian/server.js` not read directly.

---

## File Structure

```
guardian/
  spec/
    guardian.spec              real, read in full this session
  lib/
    node-registry.js             real, read in full — the source watcher.js (architecture-spec) generalizes from
    jobs.js                        real per-file existence (referenced in NODE-TAXONOMY.md); internals not read
    response-sink.js                 real per-file existence; internals not read
  data/
    nodes/
      tool/ agent/ command/ event/ intent/ response/
                                        GUARDIAN_NODE_TYPES — real, watched folders per node-registry.js
```

| Path | Node kind it holds | Contains |
|---|---|---|
| `data/nodes/<type>/` | tool, agent, command, event, intent, response | one JSON file per node, live-watched, JAA-indexed, per-type ledgered |

---

## Architecture

### Spine

Not confirmed — no WARP binding evidence read this session for guardian specifically.

### Governing axioms

| Name | Statement | Rationale |
|---|---|---|
| `AX-001`, `AX-002`, `AX-007` | per guardian.spec's `core.axioms` | not individually stated in the excerpt read this session |

### Boundaries (documentation clarity)

| Term | Definition | Distinguished from |
|---|---|---|
| Guardian | dispatch — routes intent to a provider and returns the result | `copilot` — intelligence: assembles context, classifies intent, can answer from Cortex memory alone if Guardian is down. Guardian's own spec: *"Guardian is dispatch. Co-pilot is intelligence. They are separate."* |

### Seams (cut points)

Not confirmed — no seam declarations read this session for guardian specifically. `GUARDIAN_NODE_TYPES` folder boundaries (`tool/agent/command/event/intent/response`) are plausible seam candidates but not declared as such in source.

### Sovereignty (cross-system contract)

| Other system | May read | May never write | Enforced by |
|---|---|---|---|
| any | Guardian's own dispatch/job results | `data/nodes/` directly — must go through Guardian's own registry write path | folder-watcher + validation, per `node-registry.js`; not independently verified as process-isolated |

### Pulse (liveness)

`NCP_HB_MS: 8000` — NCP (browser-tab provider) heartbeat interval. `NCP_RECONNECT_MS: 3000` — reconnect attempt interval. Real constants from `guardian.spec`'s own `core.constants`.

### Self-diagnostics (structural strain)

Not confirmed — no friction/tension equivalent found for guardian specifically this session (distinct from `cortex`'s own per-gap friction score — see `cortex` below).

### Config layers

Not confirmed.

### Phases

Not confirmed — no phasemap read for guardian specifically this session.

### Component status

Not confirmed.

---

## The Modules

---

### node-registry

**id:** `guardian.node-registry`
**path:** `guardian/lib/node-registry.js`

**What it does**

Watches `data/nodes/<type>/` for six real node types (`tool`, `agent`, `command`, `event`, `intent`, `response`), validates on drop, indexes in memory, and writes to both a flat per-type ledger (`_ledger.jsonl`) and a live jaaDB table (`nodes_<type>`) plus a per-type ledger table. This is the real, original source `architecture-spec`'s own `watcher.js` and `api.js` generalize — built 2026-09-12, quoting James directly in its own comments: *"using a Jaa database for each node type and using tables for an index of each node... a ledger for tracking history and movement."*

**How it works internally**

See `architecture-spec-atlas.md`'s `registry-watcher` entry — the generalized version documents the same real mechanism this file implements natively for guardian.

**Commands / How to use it**

Not re-documented here — identical mechanism to `architecture-spec`'s `registry-watcher`, this is the original.

**What it connects to**

- Six node-type folders it exclusively owns

**Bus events emitted**

- `guardian.node.removed` — confirmed real, fired on file deletion

---

### seam-dispatch (SEAM / NCP / RAID routing)

**id:** `guardian.seam-dispatch`

**What it does**

Compresses intent into token-budgeted chunks (`SeamChunk`) and routes them to whichever of five real NCP providers (Claude, ChatGPT, Gemini, Perplexity, Ollama) fits the RAID cluster the request was classified into.

**How it works internally**

Real constants from `guardian.spec`: `SEAM_MAX_CHUNK_TOKENS: 800`, `SEAM_MAX_T3_TOKENS: 2000`. Nine real RAID clusters, each with a declared provider fallback chain — Ollama always tried first, Claude always last (reserve, highest quality):

| Cluster | Chain |
|---|---|
| code | ollama → chatgpt → claude |
| spec | ollama → claude |
| data | ollama → chatgpt → claude |
| diagnostic | ollama → chatgpt → claude |
| analysis | ollama → chatgpt → claude |
| vision | gemini → claude |
| research | perplexity → chatgpt → claude |
| hostile | chatgpt → claude |
| forge | not read this session |

Five real providers, each with declared strengths (from `guardian.spec`):

| Provider | Access | Strengths |
|---|---|---|
| claude | browser tab, userscript v10.1.0 | complex reasoning, code quality, nuance, long context |
| chatgpt | browser tab, userscript v9.1.0 | token efficiency, grounded, hostile testing, structured output |
| gemini | browser tab, v1.0.0 | vision, UI analysis, multimodal, speed |
| perplexity | browser tab, v1.0.0 | real-world facts, citations, web search, research |
| ollama | local, no tab needed | local, private, free, code, spec — models: `qwen2.5-coder:1.5b` (seam), `mistral:7b-instruct-q4_K_M` (general) |

**Commands / How to use it**

Not read this session.

**HTTP routes**

Not read this session — `guardian.spec`'s `routes:`/`modules:`/`handshake:` sections were not pulled beyond `core`/`events`/`ncp_providers`/`raid_routing`.

**What it connects to**

- `cortex` — handles `cortex.raid.decided` to know which provider to dispatch to
- `cortex` — `HEAL_REQUESTED` → `forge.patch if applicable`

**Bus events emitted**

`guardian.booted`, `guardian.job.queued`, `guardian.job.dispatched`, `guardian.job.complete`, `guardian.job.failed`, `guardian.ncp.connected`, `guardian.ncp.disconnected`, `guardian.tab.needed`, `guardian.seam.chunk_sent`, `guardian.seam.chunk_passed`, `guardian.seam.chunk_failed`, `guardian.artifact.captured`, `guardian.artifact.refused`, `guardian.response.captured`, `guardian.blocks.captured` — all real, from `guardian.spec`'s own `events.emits`.

---

## Accounts come from Clear Glass (2026-09-23)

`lib/agent-registry.js` stays the source of truth for **agents** (selectors, repairs, health). **Accounts** are resolved by Clear Glass: the registry is built with `accountAuthority` (`lib/cg-account-authority.js` → `GET :7702/accounts/resolve`) and the dispatch ladder awaits `resolveAccountAsync`. Unknown explicit account → job fails (`unknown_account`); Clear Glass unreachable → NCP fallback with reason `account_authority_unreachable`.

## Jobs are files (2026-09-23)

A job's `.job` envelope in `data/guardian/jobs/` (override: `GUARDIAN_JOBS_DIR`) is written **before** the job is accepted — if it cannot be written the job is refused, because a job that cannot survive a restart is not a job guardian can promise. Later status writes stay non-fatal: the job already exists and may be mid-flight, and killing live work over a status write loses more than it protects.

Recovery and redelivery already existed and were **not** rebuilt: `lib/jobs.js loadPersistedJobs()` hydrates the in-memory Map at `createJobStore`, and `server.js _redispatchRecoveredJobs` (2026-09-11) requeues `dispatched` → `pending` — the tab that held it is provably gone in a fresh process — then dispatches each pending job once, leaving `complete`/`error` as history. Gate proven by `tests/modules/test-guardian-job-persistence.js` (15/15) with a real second store over the same directory.

**Not built:** Clear Glass watching this directory and adding each `.job` to its intake. The mesh queue is already idempotent by jobId and NCP already delivers these jobs; a second delivery route without deciding which one *owns* delivery would create the duplicate dispatch it is meant to prevent.

---

## A quiet job says where it stopped (2026-09-23)

`submit()` in each of the five userscripts returns `{ ok, how: 'button'|'enter-key' }` or `{ ok:false, error }`. A prompt typed but never sent fails immediately with that reason and the response watch never starts. The watch emits `GUARDIAN_PROGRESS` `reply-started` (with a character count) the first time it sees text that is not the stale baseline — placed before the baseline guard, so *"the guard skipped it"* and *"the page produced nothing"* are different observations. `lib/ncp-handler.js` routes it to `guardian.job.progress`; `server.js` logs one line per stage with the chat url.

Separates four silences that used to look identical: never sent · sent but nothing rendered · rendered but never settled · returned.

---

## Modules Not Yet Built

Not determined — `guardian.spec`'s own `modules:`/`gaps:` sections not read this session.

---

## Build & Run Reference

Not confirmed.

---

## Version History

**Source:** NOT CONFIRMED EITHER WAY — whether guardian reports to Versionium wasn't checked this session (distinct from confirmed absent). Flagged as a real open question, not assumed hand-maintained by default.

---

## Copyright

Copyright © 2026 James Brooks (Erosmancer). Part of the rheon.world / NEXUS ecosystem.

## Jobs are claimed before Clear Glass takes them (3.8.0, v0.39.227)

The dispatch ladder takes a `claim` dependency and calls it before any mesh send. `server.js` wires it to a **required** `.job` write: `transport: mesh`, `claimedBy: clear-glass`, `status: dispatched`. A failed claim sends nothing and falls back to NCP (`mesh_claim_failed`). When the ladder falls back to NCP, the dispatcher clears `claimedBy` — a `.job` never names two owners. Clear Glass's intake refuses any job it can't find claimed through `GET /jobs?id=`. `updateJob(id, patch, { required })` — the opt-in is used only for the claim; status updates stay non-fatal.


## A repo job goes to its own tab, or waits for it (3.9.0, v0.39.237)

A job carrying an `agentId` (idearium's repo agent) is delivered only to the tab that registered under `tabId=agentId`. If that tab isn't connected, the job is queued with the reason "waiting for `<agentId>`'s own `<provider>` tab", Clear Glass is asked to open it hidden, and the ordinary `flushQueuedJobs()` on connect delivers it. From a cold start the repo tab is what gets opened, not the shared window.

Before this, a repo job with no tab yet went to the **shared** tab while the repo tab was opened "for next time" — the job ran in one window, the other sat idle, and James saw two ChatGPT instances from one job (2026-09-25 log).

The shared tab still serves a repo job when there's evidence the repo tab isn't coming: Clear Glass says it can't open it or can't be reached, or it hasn't connected within `GUARDIAN_AGENT_TAB_WAIT_MS` (60 s). That fallback is logged, emitted as `guardian.job.agent_tab_fallback`, and written to the `.job` as `transportFallbackReason`.

`GUARDIAN_REPLAY` no longer completes a job. It used to mark the named job complete with no response; the userscripts no longer send it.

**Open:** the ping gate still pings the provider's active client, not the repo tab the job is aimed at.

## A reply watcher is never silent (3.9.1, v0.39.238)

When a userscript's `findResponseEl()` finds no reply element, the watch now reports a `no-reply-element` progress stage after 15 s and fails the job loudly at the no-reply deadline, naming selector drift. It used to poll forever with nothing in the log — the "submitted, then silence" of the 2026-09-25 run. ChatGPT's `findResponseEl()` returns the streaming element, else the last assistant message; it used to return the first `:last-child` match or nothing.

## One selector map per provider (3.11.0, v0.39.249)

Where a provider's input box, send button and reply live is one map, held by `lib/agent-registry.js` and served by `lib/selector-map.js`. Every NCP connect pushes `GUARDIAN_SELECTORS` to that tab; every change (`POST /api/agents/:id/selectors`) is pushed to all of that provider's open tabs, so the next job uses it. A key counts as **verified** only when its last change came from a live-checked source (the Clear Glass element picker, archaeology) with evidence; copilot may propose, never verify. `userscript-chatgpt.js` 10.5.0 uses a verified value first, then its own built-in lookup, then the unverified seed. Versionium: 0.39.248 `vtm-eebbc621`, 0.39.249 `vtm-a91834dc`.
