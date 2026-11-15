# Nexus 0.39.223

**NEXUS 0.39.223 — Clear Glass owns accounts; login portals; sealed vaults; Settings rebuilt**

| | |
|---|---|
| Built | 2026-09-23 03:12:28 → 2026-09-23 03:12:28 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.223 |
| Tag | `v0.39.223` → snap-0654 |
| Full file ledger | [LEDGER-0.39.223.csv](../ledger/LEDGER-0.39.223.csv) |

## Release notes — `CHANGELOG-0.39.223.md`

Copied unchanged from the build.

### NEXUS 0.39.223 — Clear Glass owns accounts; login portals; sealed vaults; Settings rebuilt

**Date:** 2026-09-23 · **Author:** James Brooks · clear-glass 3.9.0 → 3.10.0

James: *"login portals like apppassword login to each provider, with a plus to add multiple, which hook into the cookie vault, and create a accountid per account. agent mesh and suite, macros, erosmanceros, all of it"* — then *"yes clearglass"*, deciding which system owns accounts.

#### Decided
- **D3 (mesh-first phasemap): Clear Glass is the one account authority.** Guardian no longer keeps its own account list for dispatch; it asks Clear Glass.

#### Built
| Piece | Where |
|---|---|
| Per-provider default account, dispatch resolution (never auto-creates), per-account session records | `clear-glass/src/options/store.js` |
| `GET :7702/accounts/resolve`, `GET :7702/accounts` | `clear-glass/src/main/index.js` |
| Guardian asks Clear Glass; ladder falls back to NCP with `account_authority_unreachable` if it's down | `guardian/lib/cg-account-authority.js`, `agent-registry.js`, `dispatch-ladder.js`, `server.js` |
| Login portal: sign-in in `persist:mesh-<provider>-<accountId>` (the mesh's own partition), capture → CookieVault `{provider, accountId}`, identity link, saved sign-in pre-fill (never submits), sign-out | `clear-glass/src/accounts/login-portal.js` |
| OS-sealed vault keys (Electron safeStorage) with legacy read fallback | `clear-glass/src/security/vault-key.js` |
| 15 new IPC channels (accounts default/resolve, 8 portal, vault status, macro create/delete/schema) | `ipc/bridge.js`, `preload/index.js`, `registry-components.js` (79 → 94) |
| Settings rebuilt: shell + one file per area, CSP `script-src 'self'` | `renderer/settings.html`, `renderer/settings/` |

Settings sections: Accounts & sign-in · Provider tabs · Browser fingerprint · Agent mesh · Automation · Macros (step builder) · ErosmancerOS · Agent suite · General · Autofill & answers · Privacy & data · Connections · Co-pilot · Diagnostics.

#### Fixed (found while wiring)
- **Saved sessions never restored.** CookieVault's file-store branch (the real one — `better-sqlite3` isn't a dependency) wrote named-account cookies and never read them back. Every mesh `vault.restore()` returned `[]`.
- **Snapshots:** same unread-file bug; `_nextVersion` also reset to 1 after restart and overwrote `<agent>-1.json`.
- **Preload `macros` declared twice** — last key wins, so BrainOS's `macros.run(name, {})` sent `{}` as the agentId.
- **Fingerprint "Apply" was a no-op** — wrote `fingerprintOverride`, read by nothing. Now calls `context:switchFingerprint`.

#### Tests
- `tests/modules/test-cg-accounts-portal-settings.test.js` — **38/38** (new, registered). Mutation-checked: file-store read removed → 3 fail; ladder ignoring the authority → 2; portal partition changed → 1; identity pre-check removed → 1.
- Regression green: version-sync-and-registry 30/30 · clear-glass-screen-qa-ui 27/27 (3 checks re-pointed at the new section file) · dispatch-ladder 18/18 · account-registry 13/13 · job-correlation 60/60 · library-ui 24/24 · agent-mesh drainer/hostile/coverage · brainos app/panel · clear-glass bus/watchdog/phase2/downloads/userscripts.
- Pre-existing, identical on 0.39.222: clear-glass `network-install` 4 fail, `test-registration-shape` 3 fail.

#### Not verified / open
- A real sign-in → save session → mesh dispatch against live provider sites (needs Electron on James's machine). Google sign-in (Gemini) is the most likely friction point.
- `lib/account-registry.js` (copilot / agent-router, credentialRef keychain) is a **third** account list — not folded into the Clear Glass authority this pass.
- Guardian's local `addAccount` list remains for authority-less callers (tests); unused when Clear Glass is wired.

## Ledger

### Build 0.39.223 — snap-0654 — 2026-09-23 03:12:28

- Archive: `nexus-0654_2026-09-23_v0.39.223_1.zip` (was `Nexus_v0_39_223-1.zip`)
- SHA-256: `8e2412406301e384873cfbc1d5e3b9a3d934e5e80de70ec1babf3241f81305f8`, 96.4 MB, downloaded 2026-09-23 03:15:07
- Kind: full
- Commit: `c156b0722ba688ea6b81267d1b338f44ec96d609`, tag `snap-0654`
- Identical copy: `nexus-0654_2026-09-23_v0.39.223_dup1.zip` (was `Nexus_v0_39_223.zip`)
- Left out: embedded .git (532 files, HEAD c6549af05c583265abd3600bbaa67b6a0ef85c93 (master))
- Left out (50 MB or more): `versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)`
- Left out (50 MB or more): `versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)`
- Files in archive: 4551. Changes against the build before it: **19 added, 25 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 12 | 11 | 0 |
| docs | 1 | 4 | 0 |
| guardian | 1 | 3 | 0 |
| tests | 1 | 3 | 0 |
| (root) | 1 | 2 | 0 |
| data | 2 | 0 | 0 |
| loom | 1 | 1 | 0 |
| lib | 0 | 1 | 0 |

```
A CHANGELOG-0.39.223.md
M clear-glass/interaction-contract.json
M clear-glass/package.json
M clear-glass/registry-components.js
M clear-glass/renderer/settings.html
A clear-glass/renderer/settings/boot.js
A clear-glass/renderer/settings/core.js
A clear-glass/renderer/settings/sections/accounts.js
A clear-glass/renderer/settings/sections/browser.js
A clear-glass/renderer/settings/sections/macros.js
A clear-glass/renderer/settings/sections/mesh.js
A clear-glass/renderer/settings/sections/providers.js
A clear-glass/renderer/settings/sections/suite.js
A clear-glass/renderer/settings/sections/system.js
A clear-glass/renderer/settings/settings.css
M clear-glass/spec/clear-glass.spec
A clear-glass/src/accounts/login-portal.js
M clear-glass/src/cookies/vault.js
M clear-glass/src/ipc/bridge.js
M clear-glass/src/main/index.js
M clear-glass/src/options/store.js
M clear-glass/src/passwords/vault.js
M clear-glass/src/preload/index.js
A clear-glass/src/security/vault-key.js
A data/cortex/memory/cfr_tension_history.json
A data/guardian/memory/settings.json
M docs/2026-09-19-guardian-mesh-first-dispatch-phasemap.spec
M docs/2026-09-22-clear-glass-tab-per-repo-and-ui-expansion-phasemap.spec
A docs/2026-09-23-handoff.md
M docs/atlases/clear-glass-atlas.md
M docs/atlases/guardian-atlas.md
M guardian/lib/agent-registry.js
A guardian/lib/cg-account-authority.js
M guardian/lib/dispatch-ladder.js
M guardian/server.js
M lib/version.js
M loom/bootstrap.js
A loom/maps/accounts-authority-map.js
M package-lock.json
M package.json
M tests/modules/clear-glass-screen-qa-ui.test.js
M tests/modules/run-all.js
A tests/modules/test-cg-accounts-portal-settings.test.js
M tests/modules/version-sync-and-registry.test.js
```

