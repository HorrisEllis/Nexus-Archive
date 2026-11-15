# Nexus 0.39.243

**NEXUS 0.39.243 — the cookie vault runs on JAA; better-sqlite3 is gone**

| | |
|---|---|
| Built | 2026-09-25 13:29:16 → 2026-09-25 13:29:16 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.243 |
| Tag | `v0.39.243` → snap-0668 |
| Full file ledger | [LEDGER-0.39.243.csv](../ledger/LEDGER-0.39.243.csv) |

## Release notes — `CHANGELOG-0.39.243.md`

Copied unchanged from the build.

### NEXUS 0.39.243 — the cookie vault runs on JAA; better-sqlite3 is gone

**Date:** 2026-09-25 · clear-glass 3.13.1 → 3.13.2

James: *"yes jaa"*, answering 0.39.242's offer to move the cookie vault to JAA as well.

#### Before
- `clear-glass/src/cookies/vault.js` tried better-sqlite3 (`vault.db`) first.
- better-sqlite3 was missing on every real install, so a loose-file store ran instead:
  - `account-<agent>-<account>.json` for each saved sign-in
  - `<agent>-<n>.json` for each snapshot

#### Now
- **Storage is a JaaStore at `<vault>/jaa/`** (`guardian/jaa-store.js`), with two tables:
  - `cookie_snapshots` — `id: '<agent>:<version>'`, agent, version, time, label, data
  - `account_cookies` — `id: '<agent>|<account>|<domain>'`, agent, account, domain, data, count, updated
- **Still encrypted.** `data` is the same encrypted blob as before (`security/vault-key.js`). The test checks every file in the vault folder, and none holds a cookie value in the clear.
- **Your existing records come across, and the files stay where they are:**
  - Snapshot files are imported when the vault opens. Numbering continues after them, so nothing is overwritten.
  - An account file is imported the first time that account is read, by its exact file name. A name like `account-repo-nexus-id-…-work.json` can't be split back into agent and account when either contains a dash, so no bulk import tries to guess.
  - Importing twice duplicates nothing.
- **Deletes stick.** Deleting an account also removes its old file, so it can't be re-imported on the next start.
- **Saving an account again with the same domain** replaces the row. The newest save is the one that restores.
- **No code requires better-sqlite3 now.** It's dropped from the root `optionalDependencies`, and npm regenerated the lockfile: better-sqlite3 and `node-addon-api` are removed, and nothing else changes. `npm install` no longer attempts a native build that can't succeed on your machine.

#### Proof
- **`test-cookie-vault-jaa` 7/7** (new):
  - no SQLite left
  - two JAA tables, encrypted on disk
  - old snapshot files imported, readable by version, numbering continues
  - an old account file with a dashed agent id imported on first read
  - a restart duplicates nothing
  - delete removes the old file, and a fresh vault doesn't bring it back
  - re-saving replaces
- **Mutation checks:** each of the following was removed in turn, and each removal made its own test fail:
  - the old-file removal on delete
  - the import on first read
- **The vault's existing tests CV-01 to CV-04 pass unchanged** (sign-in round trip, meta without decrypting, a legacy-key file surviving the key upgrade, snapshots across a restart). `test-cg-accounts-portal-settings` is 37/38; its UI-05 fails identically on 0.39.240.
- **Regression:**
  - test-artifact-index-jaa 9
  - test-mco3-repo-snapshot 38
  - version-sync 30
  - record-discipline 9

#### Left as is
- **An old `vault.db`** (only created where better-sqlite3 was installed, so not on your machine) is not read.
- **`cos/archetype/registry.js`** still lists `better-sqlite3` among its database-detection hints. That's for recognising other projects' databases, not something NEXUS uses.

## Ledger

### Build 0.39.243 — snap-0668 — 2026-09-25 13:29:16

- Archive: `nexus-0668_2026-09-25_v0.39.243_overlay.zip` (was `Nexus_v0_39_243_overlay.zip`)
- SHA-256: `c16933535d842a9a01ff5c94dcdd6c3d33118ed9b22f8e4f739e40434568ff7b`, 0.3 MB, downloaded 2026-09-25 13:29:46
- Kind: overlay (a patch laid over the build before it)
- Commit: `2cdac49ee7d95f1ba6bfddd109045f21d4b8cd5e`, tag `snap-0668`
- Redacted: `tests/modules/test-cookie-vault-jaa.test.js (1 x sk-key)`
- Files in archive: 21. Changes against the build before it: **4 added, 17 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| clear-glass | 0 | 7 | 0 |
| tests | 2 | 3 | 0 |
| (root) | 2 | 2 | 0 |
| guardian | 0 | 4 | 0 |
| lib | 0 | 1 | 0 |

```
A CHANGELOG-0.39.242.md
A CHANGELOG-0.39.243.md
M clear-glass/interaction-contract.json
M clear-glass/package.json
M clear-glass/registry-components.js
M clear-glass/spec/clear-glass.spec
M clear-glass/src/cookies/vault.js
M clear-glass/src/downloads/artifact-chat-index.js
M clear-glass/src/main/index.js
M guardian/jaa-store.js
M guardian/lib/code-artifact.js
M guardian/registry-components.js
M guardian/spec/guardian.spec
M lib/version.js
M package-lock.json
M package.json
M tests/modules/run-all.js
A tests/modules/test-artifact-index-jaa.test.js
A tests/modules/test-cookie-vault-jaa.test.js
M tests/modules/test-repo-agent-late.test.js
M tests/modules/version-sync-and-registry.test.js
```

