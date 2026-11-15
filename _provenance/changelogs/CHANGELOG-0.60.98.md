# Nexus 0.60.98

**0.60.98 -- 2026-10-16**

| | |
|---|---|
| Built | 2026-10-16 04:25:06 → 2026-10-16 04:25:06 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.60.98 |
| Tag | `v0.60.98` → snap-0757 |
| Full file ledger | [LEDGER-0.60.98.csv](../ledger/LEDGER-0.60.98.csv) |

## Release notes — `CHANGELOG-0.60.98.md`

Copied unchanged from the build.

### 0.60.98 -- 2026-10-16

James: "it needs to have profile or hat dependantat cookies. or compartmenrt cookies. like we need multiaccount routing. also i
cant sign into chatgpt, it closes the login evey time i clikc it" -- with two screenshots of Google's window: "Couldn't sign you
in. This browser or app may not be secure."

Context: 0.60.97 stopped the "problem with your cookie settings" error (the jar is held still during a sign-in); this is what
Google says next. 0.60.13 had made ONE cookie jar per provider (his "providers, accounts, and agent mesh all need to be using the
same cookies"), switched between accounts by swapping cookies. Multi-account routing (0.60.32 profile tabs: "each tab can beb a
compartment or different profile") needs the opposite for a second account: its own jar.

#### What changed

- **Accounts sign-in, per account.** `LoginPortal`: the provider's primary account (guardian's dispatch account) keeps
  `persist:ncp-<provider>`, exactly as before. Every other account opens, captures, reports status and signs out in
  `persist:ncp-<provider>~<account>` -- the jar its profile tab (`providers/profile-tabs.js`) already uses, same name. For those
  accounts nothing is parked, quieted, swapped or cleared on the shared jar; two accounts' windows stay open together; the profile
  jar's user agent says Chrome, not Electron. Status/capture report `ownJar`. A hat reaches its jar through the account its profile
  is linked to; no new hat -> cookie table was made.
- **"It closes the login every time I click it."** ChatGPT's Log in is a modal on chatgpt.com: the URL is not a sign-in page. When
  the click unloaded the page under the attention panel, `attention.js` read "not on a sign-in page" and hid the window. A window he
  is using, or that is mid sign-in (0.60.97 freeze), is never hidden for that now. (Read from the code, not yet seen running: the
  log line `[attention] chatgpt -- left the sign-in page (<url>)` is what confirms it.)
- Tests: `clear-glass/test/signin-profile-jar.test.js` (new, in the clear-glass script). `test-cg-accounts-portal-settings` LP-05 and
  LP-07 asserted the 0.60.13 rule ("opening B's sign-in closed A's window"); they now state the per-account-jar rule.

#### Not built

- **Getting Electron past Google's "browser may not be secure".** Google refuses sign-in in embedded browsers on purpose (it
  reads the browser's identity, not a cookie). Making Clear Glass pass means disguising it as Chrome; that is a spoof, fragile, and
  it is Google's check, so it is not here. ChatGPT does not need Google: its email sign-in (password or emailed code) works in the
  window, and ChatGPT also works signed out.

## Ledger

### Build 0.60.98 — snap-0757 — 2026-10-16 04:25:06

- Archive: `nexus-0757_2026-10-16_v0.60.98_11.zip` (was `nexus-11.zip`)
- SHA-256: `2ac0f94169b227dbad9bca0789e0f7a5bf4a2628f68f159862eb73c7cda187d4`, 17.3 MB, downloaded 2026-10-16 04:27:30
- Kind: full
- Commit: `3f1e07be08156d0445101e7b0192846684d017d1`, tag `snap-0757`
- Files in archive: 5710. Changes against the build before it: **4 added, 9 modified, 1 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 2 | 6 | 0 |
| (root) | 2 | 1 | 0 |
| .claude | 0 | 0 | 1 |
| lib | 0 | 1 | 0 |
| tests | 0 | 1 | 0 |

```
D .claude/skills/james-brooks
A CHANGELOG-0.60.97.md
A CHANGELOG-0.60.98.md
M clear-glass/package.json
M clear-glass/src/accounts/login-portal.js
M clear-glass/src/main/index.js
M clear-glass/src/providers/account-switch.js
M clear-glass/src/providers/attention.js
M clear-glass/src/providers/host.js
A clear-glass/test/signin-in-provider-tab.test.js
A clear-glass/test/signin-profile-jar.test.js
M lib/version.js
M package.json
M tests/modules/test-cg-accounts-portal-settings.test.js
```

