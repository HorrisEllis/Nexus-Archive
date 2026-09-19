# Handoff: mesh-first dispatch (v0.39.154, on top of 0.39.153)

Rebased onto the uploaded 0.39.153 (its history branched before this work; no file conflicts).

## Built (guardian side, default OFF)
- `guardian/lib/agent-registry.js` (+ seed extracted from the mesh): guardian is the source of truth for agents, selectors, accounts, repair history, health.
- `guardian/lib/dispatch-ladder.js`: mesh -> archaeology/DOM-mapping repair (once) -> userscript (NCP) -> user (picker). Loop guard, NO duplicate prompt
  (sent or timed-out never falls back to NCP), login/captcha go straight to the user, circuit breaker.
- `guardian/lib/mesh-client.js`, hook in `dispatcher.js`, wiring in `server.js`. Enable with `GUARDIAN_TRANSPORT=mesh-first`. Default `ncp-only` = unchanged.
- `guardian/lib/raid-feedback.js`: guardian's RAID feedback never reached RAID (shape mismatch). Fixed in cortex's handler too; adds per-transport stats
  (`GET /api/raid/health` -> `transports`); `needs_user` does not lower agent health. Tests: ladder 18/18, feedback 5/5, live cortex check.

## Must build next (Clear Glass, cannot run in the build sandbox)
1. ClearDriver: resolve the agent's `<webview>` guest; delete the focused-window/`all[0]` fallback. Archaeology has its own copy of the same lookup.
2. `POST /agent-mesh/send` {provider,prompt,agentId,accountId,jobId,selectors,timeoutMs} -> {ok,text,chatUrl,sent,stage}. `sent` is load-bearing.
   Stages the ladder understands: input_not_found, send_not_found, response_not_found (repairable); no_login, captcha (user); no_window, no_webview (fallback).
3. `POST /agent-mesh/diagnose` -> archaeology + automatic DOM mapping -> {ok,repaired,selectors,evidence}.
4. Picker UI listens for `GUARDIAN_PICKER_NEEDED`; deterministic agentId/contextId `mesh-<provider>-<accountId>`, partition `persist:mesh-<provider>-<accountId>`.
5. Live smoke test, then flip `GUARDIAN_TRANSPORT` to `mesh-first`.

## Open
- Decide whether unpinned jobs should get provider/account from RAID decide (route); gate stays for privileged actions only.
- The ladder's last rung (`escalateToUser`) is not yet called when the userscript path itself times out; hook it into the completion-watch exhaustion.
- `mesh._dispatchViaGuardian` must mark its jobs `source:'mesh'` (loop guard relies on it): verify `/api/copilot/prompt` passes `source` through to the job.
- Guardian still `require`s `cortex/core/raid` in-process for `_approveTool`; that RAID instance is guardian-local state (same trap class as liminal-space).
