# NEXUS Changelog

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
