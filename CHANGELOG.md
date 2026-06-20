# NEXUS Changelog

## v0.9.8 — 2026-06-20

### Bug Fixes

#### [CRITICAL] ChatGPT Console: PASSIVE badge + SEAM chunks stuck in GENERATING
**Root cause (two-part):**

1. `lib/ncp.js` — `getProviders()` exposes `claimed: client.claimed || false` on the NCP
   client object. `client.claimed` is only written in the `/heartbeat` POST handler, which
   fires every 8 s (HB_MS). For the entire first 8 s after an SSE channel opens,
   `client.claimed` is `undefined` → `false`, so `GET /providers` returns `claimed: false`
   for every new tab regardless of whether `autoClaimIfFree()` already ran and set
   `isClaimed = true` inside the userscript.

2. `guardian/server.js` `GUARDIAN_REGISTER` case — the register message carries
   `claimed: amIClaimed()` and `chatId`, but the handler only called `ncp.push(GUARDIAN_READY)`
   and emitted a bus event. It never wrote those fields into the NCP `_clients` map.
   Result: the UI badge stayed `CONNECTED · PASSIVE`, and any `GUARDIAN_JOB` dispatched
   during that window was silently dropped by `handleJob()` — causing SEAM chunks to
   stall in GENERATING and trigger seam-watchdog retries.

**Fix:**
- `lib/ncp.js`: Added `updateClient(provider, tabId, fields)` — merges `claimed`,
  `chatId`, `usage` into the live `_clients` entry. Exported in the public API.
- `guardian/server.js` `GUARDIAN_REGISTER` case: Calls `ncp.updateClient()` immediately
  when the register message arrives, so `GET /providers` reflects real claim state within
  the same 4 s polling cycle that the tab connects.

**Effect:** ChatGPT Console badge goes green-live within ≤4 s of userscript connect.
SEAM chunks no longer stall on first dispatch after page load.

#### [HIGH] Bridge exits immediately on `npm run start:all`
**Root cause:** `bridge/server.js` is a factory module — it exports `createBridgeServer()`
but has no self-start logic. When concurrently runs `node bridge/server.js`, Node loads
the file, hits `module.exports`, and exits code 0. Bridge never binds to `:9999`.

**Fix:** Added `require.main === module` guard at the bottom of `bridge/server.js` that
calls `createBridgeServer().start()`. Still importable as a factory for tests.

**Effect:** `[BRIDGE] ready on :9999` appears on boot. CFR field polling and Cortex
Bridge SSE subscription succeed.

### Version Bumps
- `package.json`: `0.9.2` → `0.9.8`
- `lib/version.js system`: `0.9.2` → `0.9.8`
- `lib/version.js services.guardian`: `3.6.0` → `3.6.1`
- `lib/version.js services.bridge`: `3.0.0` → `3.0.1`
- `lib/version.js modules['ncp']`: added at `1.1.0`
- Guardian internal version strings: `3.5.0` → `3.6.1`

---

## v0.9.7 (prior — nexus-integrated-13-v0_9_7.zip)
_(No changelog entry — see MANIFEST.json session_log for context)_
