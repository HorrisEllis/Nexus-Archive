# Handoff: mesh-first dispatch for coding whole code bases (v0.39.155)

Rule from James: **this is for coding entire code bases.** That drove every default below.
Full design + evidence: `docs/2026-09-19-guardian-mesh-first-dispatch-phasemap.spec` (`code_base_scale`, `live_smoke_required`, `known_limits`).
Flow: guardian (source of truth for agents) -> agent mesh (queue, deterministic tab, inject) -> archaeology + DOM-mapping repair -> userscript (NCP) -> user (picker).
Default `GUARDIAN_TRANSPORT=ncp-only` = unchanged behaviour. `mesh-first` enables the ladder.

## Built
Guardian: `lib/agent-registry.js` (+seed), `lib/dispatch-ladder.js`, `lib/mesh-client.js` (async job protocol, UTF-8 safe), `lib/raid-feedback.js`,
dispatcher hook + activity-aware completion watch, `ncp-handler` response cap (env, flagged).
Clear Glass: `src/mesh/page/agent-page.js` (in-page lib), `src/mesh/dom-transport.js`, `src/driver/page-resolver.js`, `agent-mesh.js`
(`sendViaDom` etc., deterministic `contextId`), `main/index.js` endpoints (`/agent-mesh/send|job|diagnose|read`, utf8 body fix).
Tests (all pass): ladder 18, raid-feedback 5, mesh-client+watch 14, agent-page 21, dom-transport 16 (jsdom needed: it is a devDependency).

## NOT VERIFIED (cannot be, without Electron and real sites)
Everything Electron/site-specific: real selectors, `<webview>` resolution, `input[type=file]` availability, provider "Continue" labels, login/captcha
heuristics, provider size limits. **Run the smoke checklist in the spec (`live_smoke_required`) before setting GUARDIAN_TRANSPORT=mesh-first.**
Safety net if it misbehaves: any pre-send failure falls back to the userscript; anything after the prompt is (or may be) sent goes to the user and is never resent.

## Env knobs
`GUARDIAN_TRANSPORT` (ncp-only|mesh-first), `GUARDIAN_MESH_TIMEOUT_MS` (1h), `GUARDIAN_COMPLETION_TIMEOUT_MS` (15 min idle, userscript path),
`GUARDIAN_MAX_RESPONSE_CHARS` (5,000,000), `CLEARGL_IPC_PORT` (7702).

## Open
- Picker UI (renderer/guardian-picker.js) must listen for `GUARDIAN_PICKER_NEEDED` / bus `guardian.picker.needed` and let the user pick the response element or paste it.
- `escalateToUser` is not yet called when the userscript path itself exhausts its retries; hook it into the completion-watch failure branch.
- `mesh._dispatchViaGuardian` must mark its jobs `source:'mesh'` (loop guard) and `/api/copilot/prompt` must pass it through: verify.
- Accounts: `registry.addAccount` exists but nothing calls it yet; wire the account manager to guardian's registry so `job.accountId` resolves.
- Consider a per-provider `inlineMax`/`maxContinues` in the registry once real limits are known from the smoke test.
- Earlier open items (sigma, V7, event_log multi-writer, cortex-side RAID instance) are in HANDOFF-2026-09-19-cortex-intelligence-move.md.
