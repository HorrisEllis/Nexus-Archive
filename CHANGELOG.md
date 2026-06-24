# NEXUS Changelog

## 2026-06-21 — auto-generated from spec version bumps

- **seam-queue** — new spec, v1.0.0. SEAM queue — chunked spec dispatch to a browser-tab provider.

## 2026-06-21 — auto-generated from spec version bumps

- **cli**: v1.3.0 → v1.4.0. Command-line tools for NEXUS operation, diagnosis, and boot.

## 2026-06-21 — auto-generated from spec version bumps

- **copilot** — new spec, v1.0.0. Full-context assistant: continuous bus listener + RAID-gated CLI tool
- **raid**: v6.1.0 → v6.2.0. Provider routing. Ollama always first. Claude always last. Weight table learns from outcomes. _decide() is a pure function — same inputs always produce same decision.

## v0.9.8 (session) — 2026-06-21

### New: living changelog mechanism
- `lib/changelog.js` — diffs `docs/*.spec` versions against a snapshot,
  prepends a dated section to this file when something real changed.
  Wired as a SOFT boot phase in `orchestrator.js`, same pattern as
  `spec-drift.js`. 5/5 tests passing. Snapshot seeded at this session's
  end state — future boots only report genuinely new changes, not a
  retroactive dump of all 72 existing specs.

### New: `.spec` container format, verified round-trip
- `nexus-system.spec` — full repo (695 files) as one self-contained file:
  YAML header (fast-parseable, same regex `spec-drift.js` already uses)
  + file-block manifest + embedded base64 archive. Verified: decoded
  archive's SHA-256 matches the source zip exactly; `unzip -t` passes.
- `scripts/import-spec.js` — real, tested CLI to extract one back into a
  directory tree. Verifies `archive_sha256` before writing anything
  (refuses partial/corrupt extraction). Round-tripped successfully
  against the actual repo.

### Fixed
- **home-ui's `asSend()` discarded RAID's real routing decision.** A
  conversational prompt with no grammar match correctly got routed by
  RAID to an agent (`{source:'raid', agent, ...}`), but the UI only
  checked for `result.componentId` (grammar match) or non-RESOLVED
  outcomes — a RAID decision satisfied neither, was silently thrown
  away, and the function re-dispatched with `provider` hardcoded to
  `'ollama'` regardless of what RAID picked. Now uses `hr.result.agent`.
- **`nexus-repl.js`'s `snapshot` command 404'd silently, every time.**
  POSTed to `cortex/api/snapshot` (singular) — cortex only serves
  `/api/snapshots/create` (plural). Fixed the URL.
- **ChatGPT console's chunk ladder showed `RETRYING`/`ESCALATED` states
  with no way to act on them.** Wired a real `FORCE RETRY` button to
  guardian's existing `/seam/retry` — only on rungs that are actually
  the queue's current active chunk (checked the endpoint's real
  constraint first; `ESCALATED` rungs get an honest note instead of a
  button that would silently 404).
- **ChatGPT console's `PASSIVE` badge didn't reflect queue state.** Now
  shows `N QUEUED` when there's real pending work for the provider,
  distinct from idle. (Note: a deeper, earlier fix for `claimed` timing
  — `ncp.updateClient()` — already exists above this entry; this is
  complementary, not a duplicate.)

### Added: real proxy routes, real registrations
- `orchestrator.js` — new `/api/diagnostic/*` proxy block. Diagnostic
  (`:7825`) had zero generic proxy before this; verified
  `POST /gaps/:uuid/fix` is real against `service/nexus-diagnostic.js`.
- `cli/nexus-repl-descriptors.js` — `forge`, `heal`, `snapshot` now
  registered into `component-registry` (was just `forge`). `heal`'s
  route has a documented limitation: path-parameter substitution doesn't
  exist anywhere in the generic dispatcher yet, so it's discoverable but
  not yet remotely dispatchable that way — `nexus-repl`'s own direct
  call still works.
- `ui/agents/chatgpt/index.html` — **IMPORT FROM IDEARIUM** button,
  real round-trip against `GET /api/idearium/specs` (list) and
  `GET /api/idearium/specs/:uuid/export` (compiled markdown — checked
  this was the right endpoint, not `.show`, before using it).

### Phase 31 — closed, not "pending" (roadmap was wrong)
- Confidence scoring, the `>0.8` threshold, and demotion-event logging
  were already built before this session touched anything — checking
  the live code first caught that before redundant work happened. The
  one real gap (case-library misfires → 3-strike Idearium escalation)
  is now `lib/grammar-misfire-tracker.js`. 6/6 tests passing.

### Phase 35 — backend built, frontend still pending
- `lib/quick-notes.js` — create/list/delete, broadcasts over the
  existing `/events` SSE (not a new channel), tag-to-idea via the
  verified `/api/idearium/ideas` proxy. 7/7 tests passing. No UI panel
  renders this yet.

### Roadmap
- Phase 65 (`cli.js: Unified User-Interaction Console`) and Phase 66
  (`.spec Container Import: Idearium Spec Library + Push/Pull CI/CD`)
  added — both requested this session, both real and scoped, neither
  built yet.

---

## v0.9.8 — 2026-06-20

### Bug Fixes

#### [CRITICAL] ChatGPT Console: badge stuck PASSIVE, SEAM chunks stall in GENERATING
**Root cause:** `client.claimed` in the NCP `_clients` map is only written via POST
`/heartbeat` (fired every 8 s). The `GUARDIAN_REGISTER` message posted immediately on
SSE connect carries `claimed: true` (after `autoClaimIfFree()` runs) but the handler
only emitted a bus event — it never wrote into the client map. So `GET /providers`
returned `claimed: false` for the first 8 s, the UI badge stayed `CONNECTED · PASSIVE`,
and any `GUARDIAN_JOB` arriving in that window was silently dropped by `handleJob()`
(`isClaimed` guard) — causing SEAM chunks to stall in GENERATING and trip watchdog retries.

**Fix:**
- `lib/ncp.js`: Added and exported `updateClient(provider, tabId, fields)` — merges
  `claimed`, `chatId`, `usage` into the live `_clients` entry without a heartbeat.
- `guardian/server.js` `GUARDIAN_REGISTER` case: Calls `ncp.updateClient()` immediately,
  so `GET /providers` reflects real claim state within the first 4 s polling cycle.

#### [HIGH] Bridge exits code 0 immediately on `npm run start:all`
**Root cause:** `package.json` `start:all` called `node bridge/server.js`, but
`bridge/server.js` is a pure factory module (`createBridgeServer()` — no self-start).
The correct entry point is `bridge/index.js`, which runs the full 7-phase boot sequence
wiring identity → registry → ledger → router → HTTP server.

**Fix:** `package.json` `start:all` and `start:core` changed from
`node bridge/server.js` → `node bridge/index.js`.

### Version Bumps
- `package.json`: `0.9.2` → `0.9.8`
- `lib/version.js system`: `0.9.2` → `0.9.8`
- `lib/version.js services.guardian`: `3.6.0` → `3.6.1`
- `lib/version.js modules['ncp']`: added at `1.1.0`
- Guardian internal version strings: `3.5.0` → `3.6.1`

---

## v0.9.9 — Phase 23.7 — Gap Lifecycle: Causal Closure
**Date:** 2026-06-24
**Operator:** James Brooks (Erosmancer)

### Core changes

**lib/gap-predicate.js** (NEW)
Predicate library, dedup key, truth floor, closure verifier, TTL sweep.
Every gap carries a checkable predicate. Closure requires predicate false AND artifact exists.
Gap dedup prevents same problem spawning multiple UUIDs.

**cortex/memory/jaa-db.js**
Added: reflection_contracts, closure_attempts, gap_predicates tables (long tier).

**lib/open-loop-taxonomy.js**
createLoop() enriches every gap with predicate, artifact_requirement, dedup_key, truth_floor, ttl_ms.

**service/nexus-diagnostic.js**
Dedup check before gap insert. Gaps marked 'investigating' on dispatch.
Sweep skips investigating/resolved/expired/blocked gaps. Kills the 300-job flood.
Predicate check before re-dispatch — if predicate is false, run closure verifier.

**cortex/gap-loop.js**
Listens for guardian.job.complete (with meta.gapUuid). Runs verifyClosure after every job.
TTL sweep every 5 minutes. Registers gap-predicate in component registry.

**guardian/server.js**
createJob() writes to JAA before dispatch (§2.1). Every state transition persisted + emitted.
job.complete carries meta.gapUuid for closure verifier. Reflection contracts polling phase (every 30s).
Human-readable log lines. RAID decision captured in job meta.

**cortex/core/raid/index.js**
Public decide() exported (was missing — caused silent chatgpt fallback on every call).
Qwen async cluster classification. Learned patterns persisted to raid-clusters.json.
_clusterReviewTick: Mistral proposes new patterns when correction rate > 40%.
getState() exposes learnedPatterns count, correctionRate.

**lib/reflection.js**
Reflection contracts queued to JAA on streak threshold. verifyClosure runs each pass.
Stale queued contracts retried. getState() exposes contract stats.

**guardian/agents/co-pilot/index.js** (v1.1)
Real system operator. Reads live state (gaps, jobs, health, providers) before every response.
Qwen classifies intent. Slash prefix → RAID-gated tool execution.
Mistral generates reply with system state as context. Honest Ollama-offline fallback.
Model priority: mistral:7b-instruct-q4_K_M → qwen2.5-coder:1.5b → fallback.

**guardian/userscript-chatgpt.js**
7-selector findResponseEl. 3-minute hard timeout. Root cause of 300-job flood fixed.

**orchestrator.js**
ui/agents/ added to hotswap watcher (was missing).

**ui/agents/mistral/index.html** (NEW)
Mistral/Ollama native console. No tab bridging. Ember accent.

**ui/home/index.html**
asSend() is now a thin shell. Everything routes through co-pilot. RAID decision shown explicitly.

### Docs added
- docs/AXIOMS-PHASE-MAP.md — every axiom mapped to every phase, compliance state
- docs/SYSTEM-MAP.md — service registry, intelligence stack, open loops table
- docs/WIRES.md — every bus event, HTTP route, JAA write, dispatch chain
- docs/SESSION-2026-06-24.md — session changelog
- docs/gap-lifecycle.spec — causal closure specification
- docs/copilot.spec — co-pilot v1.1 specification
