# Nexus 0.60.12

**0.60.12 — 2026-10-13**

| | |
|---|---|
| Built | 2026-10-13 02:42:28 → 2026-10-13 02:42:28 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.60.12 |
| Tag | `v0.60.12` → snap-0750 |
| Full file ledger | [LEDGER-0.60.12.csv](../ledger/LEDGER-0.60.12.csv) |

## Release notes — `CHANGELOG-0.60.12.md`

Copied unchanged from the build.

### 0.60.12 — 2026-10-13

James: "the logins for the agent providers needs to be all the same. the accounts and sign in, isn't wired into the provider tabs in clearglass. fix that please."

**What was wrong.** One login lived in three cookie jars. Accounts & sign-in signs in to `persist:mesh-<provider>-<id>` and saves to the vault; the provider tabs run in `persist:ncp-<provider>`; only guardian's per-job routing copied one into the other. A tab could open signed out beside an account that said "Signed in".

**What changed.** A provider tab runs as the provider's default account (starred, else oldest).
- `clear-glass/src/providers/account-switch.js` 1.1.0: `sync(provider)` puts the account's saved sign-in in the tab; a sign-in the tab holds that the account has not saved is saved to it, never overwritten. `signedOut()` signs the tab out when its account is signed out.
- `clear-glass/src/providers/host.js`: `beforeLoad` hook, awaited before the first load, bounded to 8 s, fail-soft. `src/main/index.js` sets it and serves `POST /providers/:id/account/sync` and `POST /providers/account/sync`.
- `src/ipc/bridge.js`: save session, star and sign out follow through to the tab and return `tab` (what was done). `providers:account` and `providers:syncAccount` for the Provider tabs page.
- Accounts page: says what happened to the tab. Provider tabs page: shows the account the tab really runs as, with a "Use … sign-in" button.
- `idearium/cli/route-commands.js`: `glass signin [provider]` so agents have the same action.

**Proof.** `clear-glass/test/provider-account-sync.test.js` 9/9 (restore into a signed-out tab, no-op when aligned, adopt rather than overwrite, switch on star, sign-out propagation, wiring present). Broken on purpose once to confirm it fails. `test-accounts-picker-cos` 40/40.

**Not proven.** Not run inside Electron. The real cookie restore and the two pages still need a look in Clear Glass. Four older tests (`copilot-cli`, `userscripts-manifest`, `userscripts-dedupe`, `gig-file`) fail the same way on the untouched 0.60.11 zip.

## Ledger

### Build 0.60.12 — snap-0750 — 2026-10-13 02:42:28

- Archive: `nexus-0750_2026-10-13_v0.60.12_10.zip` (was `nexus-10.zip`)
- SHA-256: `e6e95ab26c07f86b82dafc4af3c2c97f7ab7296e2502bcd892e4ed8b2beb5cfe`, 16.1 MB, downloaded 2026-10-13 02:45:30
- Kind: full
- Commit: `88f93b1f8b3b77f0fcb76143660fdc8db180a453`, tag `snap-0750`
- Files in archive: 5585. Changes against the build before it: **2 added, 15 modified, 63 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| architect | 0 | 0 | 57 |
| clear-glass | 1 | 10 | 0 |
| _archive | 0 | 0 | 4 |
| .claude | 0 | 0 | 2 |
| (root) | 1 | 1 | 0 |
| docs | 0 | 2 | 0 |
| idearium | 0 | 1 | 0 |
| lib | 0 | 1 | 0 |

```
D .claude/settings.local.json
D .claude/skills/james-brooks
A CHANGELOG-0.60.12.md
D _archive/2026-10-09-declutter/scripts/_register-session-hooks.js
D _archive/2026-10-09-declutter/ui/pipeline-tutorial.js
D _archive/2026-10-09-declutter/ui/ui-pulse.js
D _archive/README-v5.1.0-superseded-2026-10-11.md
D architect/compile-route.js
D architect/config.js
D architect/data/event_log.jsonl
D architect/data/gaps.jsonl
D architect/data/node-index/nodes_capability.json
D architect/data/node-index/nodes_capability_ledger.json
D architect/data/node-index/nodes_command.json
D architect/data/node-index/nodes_command_ledger.json
D architect/data/node-index/nodes_system.json
D architect/data/node-index/nodes_system_ledger.json
D architect/data/node-index/settings.json
D architect/data/nodes/capability/architect.blueprint.diff.capability
D architect/data/nodes/capability/architect.blueprint.history.capability
D architect/data/nodes/capability/architect.blueprint.list.capability
D architect/data/nodes/capability/architect.blueprint.route.capability
D architect/data/nodes/capability/architect.blueprint.scan.capability
D architect/data/nodes/capability/architect.contract.capability
D architect/data/nodes/capability/architect.health.capability
D architect/data/nodes/capability/architect.hook.deprecate.capability
D architect/data/nodes/capability/architect.hook.get.capability
D architect/data/nodes/capability/architect.hook.register.capability
D architect/data/nodes/capability/architect.hook.update.capability
D architect/data/nodes/capability/architect.hook.wire.capability
D architect/data/nodes/capability/architect.hooks.check.capability
D architect/data/nodes/capability/architect.hooks.graph.capability
D architect/data/nodes/capability/architect.hooks.list.capability
D architect/data/nodes/capability/architect.hooks.validate.capability
D architect/data/nodes/capability/architect.map.capability
D architect/data/nodes/component/architect.blueprint.list.component
D architect/data/nodes/component/architect.blueprint.scan.component
D architect/data/nodes/component/architect.health.component
D architect/data/nodes/component/architect.hook.get.component
D architect/data/nodes/component/architect.hook.update.component
D architect/data/nodes/component/architect.hooks.validate.component
D architect/data/nodes/component/architect.map.component
D architect/data/topology_maps.jsonl
D architect/interaction-contract.json
D architect/output/.gitkeep
D architect/package.json
D architect/registry-components.js
D architect/schemas/index.js
D architect/schemas/schema.capability
D architect/schemas/schema.command
D architect/schemas/schema.component
D architect/schemas/schema.hook
D architect/schemas/schema.node
D architect/schemas/schema.system
D architect/schemas/schema.wire
D architect/service.js
D architect/spec/architect.node-taxonomy.md
D architect/spec/architect.spec
D architect/src/spec/Blueprint.js
D architect/src/ui/alk-lattice.html
D architect/src/ui/arch-builder.html
D architect/src/ui/architect_universe.svg
D architect/src/ui/layered-snr-gates-axioms.svg
D architect/src/ui/spec-builder.html
M clear-glass/package.json
M clear-glass/registry-components.js
M clear-glass/renderer/settings/sections/accounts.js
M clear-glass/renderer/settings/sections/providers.js
M clear-glass/src/accounts/login-portal.js
M clear-glass/src/ipc/bridge.js
M clear-glass/src/main/index.js
M clear-glass/src/preload/index.js
M clear-glass/src/providers/account-switch.js
M clear-glass/src/providers/host.js
A clear-glass/test/provider-account-sync.test.js
M docs/2026-10-12-browser-providers-and-work-phasemap.spec
M docs/PROOF-OF-COMPETENCY.md
M idearium/cli/route-commands.js
M lib/version.js
M package.json
```

