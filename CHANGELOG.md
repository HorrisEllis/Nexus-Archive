# NEXUS Changelog

## v1.4.0 — 2026-06-24 — vectra removed, native replacement

- `lib/local-vector-index.js`, new — replaces vectra entirely. Checked every real call site in `lib/vector-memory.js` before building (six methods, not the five a first pass assumed — `getIndexStats()`'s real shape is `{items: N}`, caught by re-checking rather than trusting the first read). Real cosine similarity, hand-verified against known values. Atomic writes. Real persistence across fresh instances. 14/14 tests, no mocking.
- `vectra` removed from `package.json` — it was the only dependency listed; `dependencies` is now empty.
- Ran the full `vector-memory.js` pipeline end to end through the new index — real TF-IDF fallback, real ranking, correctly ordered.
- Found and corrected two false claims about `adm-zip` "being a declared dependency" — one in `idearium/repo/watcher.js`'s header, one in this session's own earlier comment in `lib/spec-container.js`. It's never been in `package.json`. Per the direction to minimize dependencies, it stays optional on purpose — the fallback chain already covers it.
- Corrected Phase 70 in the roadmap — its userscript-resume claim was stale; `guardian/userscript-chatgpt.js` already has a real, working `§70.2` localStorage resume mechanism. The other two pieces of that phase are still genuinely unbuilt, re-confirmed, not assumed.

## v1.3.0 — 2026-06-24 — drag-and-drop, backend first

- `lib/spec-container.js` gained `extractArchiveFiles()` — same 3-tier fallback the filesystem watcher already used (adm-zip → system `unzip` → opaque record), now shared instead of duplicated. `adm-zip` genuinely isn't installed in this environment, so tier 2 is what actually runs — proven with a real zip built via the CLI, not simulated.
- New route: `POST /api/repos/spec-container`, body `{content}`. Verifies SHA-256 before trusting anything — same rule the watcher already enforces, now also true for browser drops, which it wasn't before. A tampered hash is rejected and ingests nothing — tested directly.
- Found while documenting this: the `repo` resource had never been in either copy of `interaction-contract.json` at all — `repo.list`/`ingest`/`fork`/`archive`/`lineage` all predate this session, all undocumented. Added the full block, not just the new endpoint.
- Found and flagged, not fixed: `ROUTE_CAP` is declared for every action in `idearium/api/index.js` and never actually enforced anywhere — checked, no consumer exists. Added the new action to the map for consistency; didn't take on rebuilding auth enforcement as a side effect of this.
- Found and fixed, unrelated: `tests/modules/spec-container.test.js` was real, 9/9 passing, and never registered in `run-all.js`. Registered it.
- UI: one drop zone, real drag-and-drop on the existing spec list. Reads the file, POSTs to the documented endpoint, renders the result. No verification logic in the UI — that's the backend's job entirely, on purpose.

## v1.2.0 — 2026-06-24 — the file browser, wired to what already existed

- Checked before building: `idearium/api/index.js`'s `spec.build` already compiles a real, fixed `sections[]` model through `emerge/compiler`'s T0/T1 pipeline. Rather than build a second spec format, `descriptor.descriptorFromSections()` turns those same 9 fixed sections into capabilities — the new chunk system builds *into* what already worked, not around it.
- New routes: create/show a build group, build a chunk, compress, expand. A chunk PASS writes back into the spec's real section via the existing `idearium.spec.update` event — `spec.build` didn't need to change.
- Both copies of `interaction-contract.json` updated to match — confirmed identical before, kept identical after.
- `buildChunk()` upgraded from an always-throws stub to a real in-memory compartment cache. Works for the life of the process that created the build group. The restart limitation is still real, still in the error message.
- New panel in the existing Spec Library view: chunk status, intent, hook/wire tags, failure reasons, compress button. Scoped to that view, not the separate Repo tab's file-tree — that's real, separate, larger work.
- Found and stated, not fixed: `ui/idearium/index.html` and `idearium/ui/index.html` are two manually-synced, byte-identical 80K+ character files. No single source of truth. Re-synced for this change; the structural fragility is still there for the next person to hit.
- Content per chunk is still typed by hand. No Qwen, no Mistral wiring into this flow yet.

## v1.1.0 — 2026-06-24 — hooks, wires, intent, and the chunked-spec build layer

- **lib/component-descriptor.js → v1.1.0**: `capability.intent` now required. New `capability.endpoints[]` (`hook_type` ∈ api/event_bus/cli/file_watch/sse/websocket/queue, `hook_id`, `intent`) and `capability.wires[]` (`wire_type` ∈ pipeline/data_flow/handshake/interaction_contract, `wire_id`, `intent`, `from`, `to`). Deliberately not named `capability.hooks` — `component-registry.js` already owns that word for something else (lifecycle triggers). New `toCompartmentIntent(descriptor, i)` bridges a capability into the exact shape `compartment-engine.js`'s `spawn()` requires — proven by actually calling `spawn()` with it, not by inspecting the shape.
- **lib/spec-build-group.js — new**: one spec, N chunks, N real compartments. A failing chunk fails its own compartment without touching the rest — verified with two real compartments, one made to fail on purpose. Chunk content lands on real files at `data/idearium/specs/<build-uuid>/<chunk-uuid>.md`, since Idearium is genuinely flat-file and a second sync layer would just be a second source of truth. Compress/expand are explicit calls only. One real limitation found and stated, not hidden: no resume-by-id in `compartment-engine` yet, so building a chunk after process restart needs the live compartment object, not just its id.
- 28 new tests (21 + 7), all against real modules — no mocks of `compartment-engine` or `component-registry`. 657/658 full suite, the 1 failure confirmed pre-existing in the original untouched zip.

## v1.0.0 — 2026-06-24 — built and tested this session, not just claimed

Per §6.1: every line below has a passing test or a direct source check behind it. None of it was written before being verified.

- **cli/nexus-repl.js**: 3 real bugs fixed — `log()` was called ~50 times in `dispatch()`, never declared anywhere, ReferenceError on first use. `SYS_COLORS` defined but referenced as lowercase `sys_color` at 2 call sites. `gate()`'s ledger POST was fire-and-forget, could lose the race against `process.exit` in single-command mode — now awaited. Also hardened the REPL's `rl.on('line', ...)` handler with a try/catch — that gap is exactly how the `log()` bug became a process crash instead of a loud error (§1.2). Verified: `node --check` clean, all 5 fix-conditions confirmed by direct source check, 0 regressions across 3 existing test suites (32 tests).
- **cortex/core/raid/index.js**: new public `decide(prompt, opts)`, wrapping the existing pure `_decide()` (which stays pure — §1.1, unchanged). Fixes a separate bug: `guardian/server.js` called `_raid.decide()` against an export that only had `_decide`, threw `TypeError`, silently caught, hardcoded `chatgpt` regardless of RAID's actual decision — `decide()` now actually exists. ALK lattice logging (`actor:'raid'` records — previously test-fixture-only) and replay-engine snapshotting now run on every decision, real side effects extracted into `_recordRaidDecision`/`_snapshotBeforeDecision` so the internal `_tick()` poll loop and the new `decide()` wrapper share one implementation, not two. All 5 real call sites in the codebase migrated to the new path (`cortex/gap-loop.js`, `cortex/foundation/admin-server.js`, `nexus-heal-loop.js`, `lib/request-handler.js`, plus `_tick()`'s own internal call) — §5.3, every file that referenced the changed module checked and updated, not just the new code path. Verified with a real smoke test against the live `lib/alk` and `lib/replay-engine` modules (not mocked): real `actor:'raid'` records and real snapshots written and queried back out. `healer.test.js` (20/20) and `raid-approve-tool.test.js` (9/9) re-run clean after every migration step.
- **lib/component-descriptor.js** — new, Phase 40 foundation only (not the full T0–T2 compiler pipeline, which is real, separate, much larger work and is not started). Descriptor schema (blueprint-namespaced uuid, componentId, type, capabilities[], tier, resolution.max_level), real validation, and a real projection into `component-registry`'s existing shape. 14/14 tests, including two (`CD-10`, `CD-11`) that run the projected output through the actual live `component-registry.validate()` rather than asserting the shapes match by inspection.
- **docs/gap-lifecycle.spec, raid-integration.spec, nexus-roadmap-combined.html**: updated to match what's actually true above — code first, docs after, per §6.1.

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
