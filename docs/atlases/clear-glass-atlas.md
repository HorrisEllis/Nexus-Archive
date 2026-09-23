# clear-glass — Sovereign NEXUS Browser

> **v3.10.0 (active, 2026-09-23)** · 94 real components · account authority for NEXUS · Electron + Chromium + Firefox fingerprint + TLS JA4 + ErosmancerOS wire (SISO-native)

**Author:** James Brooks (Erosmancer) · rheon.world

---

## What It Is

Clear-glass is NEXUS's sovereign browser shell — one of the most actively developed subsystems in the codebase, per its own spec, despite not having had a `.spec` written until 2026-09-01. Its own spec was written *from* the live `registry-components.js` contract rather than from scratch: *"This spec is written FROM that live registry-components.js contract... §8.6 reuse-before-build, applied to spec authorship itself."* — the same discipline `architecture-spec.spec` used for itself, confirmed here as a real, repeated house convention rather than a one-off.

---

## Quick Start

Not confirmed this session.

---

## Architecture

### Governing axioms

| Name | Statement |
|---|---|
| `AX-001` | validate all inputs at boundary |
| `AX-002` | no silent failures — bus event on error |
| `AX-004` | self-describing — `registry-components.js` served at `/contract` |
| `AX-010` | sovereign transport — no cross-system `require()` into this tree |

### Boundaries (documentation clarity)

| Term | Definition | Distinguished from |
|---|---|---|
| clear-glass's "routes" | `ipcMain.handle()` channels — `{method: 'IPC', path: <channel name>}` | HTTP method/path pairs. Its own spec is explicit: *"a spec claiming HTTP method/path pairs for these would misrepresent the transport"* — clear-glass is an Electron shell, not a web server |

### Sovereignty (cross-system contract)

Real, multi-port surface: `ipc: 7702` (orchestrator polls `/contract` here), `sse: 7701`, `tls: 7703`, `wire: 7704`.

---

## The Modules

---

### registry-components

**id:** `clear-glass.registry-components`
**path:** `clear-glass/registry-components.js:1` — [open](clear-glass/registry-components.js#L1)

**What it does**

The real, live self-description contract — served at `GET /contract`
on the IPC server (`:7702`), verified by orchestrator's
contract-handshake on boot. **Stale-data correction, this pass:** an
earlier version of this atlas cited "67 components across 11
families" from `clear-glass.spec` (v3.1.0, 2026-09-01). The real file
as of `v0.39.214` is **v3.9.0, 79 components** — re-extracted directly
this pass, not assumed current from the earlier read. `clear-glass.spec`
itself is now stale relative to its own source.

**Every real component, addressed by file:line — not a family summary**

| id | IPC channel | file:line | tags |
|---|---|---|---|
| `cg.health` | `GET /health` | [`registry-components.js:42`](clear-glass/registry-components.js#L42) | health |
| `cg.status` | `GET /status` | [`registry-components.js:43`](clear-glass/registry-components.js#L43) | health |
| `cg.contract` | `GET /contract` | [`registry-components.js:44`](clear-glass/registry-components.js#L44) | health |
| `cg.events` | `GET /events` (SSE) | [`registry-components.js:45`](clear-glass/registry-components.js#L45) | stream |
| `cg.driver.exec` | `POST /cmd` | [`:48`](clear-glass/registry-components.js#L48) | driver, automation — typecode `CG-DRV-001` |
| `cg.dom.query` | `POST /cmd` | [`:53`](clear-glass/registry-components.js#L53) | dom — `CG-DOM-001` |
| `cg.dom.mutate` | `POST /cmd` | [`:54`](clear-glass/registry-components.js#L54) | dom — `CG-DOM-002` |
| `cg.dom.pick` | `POST /cmd` | [`:55`](clear-glass/registry-components.js#L55) | dom, seam — `CG-DOM-003` |
| `cg.dom.tokens` | `POST /cmd` | [`:56`](clear-glass/registry-components.js#L56) | dom, archaeology |
| `cg.context.create` | `POST /cmd` | [`:59`](clear-glass/registry-components.js#L59) | context — `CG-CTX-001` |
| `cg.context.switch` | `POST /cmd` | [`:60`](clear-glass/registry-components.js#L60) | context — `CG-CTX-001` |
| `cg.context.list` | `GET /contexts` | [`:61`](clear-glass/registry-components.js#L61) | context |
| `cg.context.fp.switch` | `POST /cmd` | [`:62`](clear-glass/registry-components.js#L62) | context, fingerprint — `CG-CTX-002` |
| `cg.cookie.save` | `POST /cmd` | [`:65`](clear-glass/registry-components.js#L65) | cookie — `CG-CKI-001` |
| `cg.cookie.restore` | `POST /cmd` | [`:66`](clear-glass/registry-components.js#L66) | cookie — `CG-CKI-002` |
| `cg.copilot.message` | `POST /cmd` | [`:69`](clear-glass/registry-components.js#L69) | copilot — `CG-CPL-001` |
| `cg.mesh.spawn` | `POST /cmd` | [`:74`](clear-glass/registry-components.js#L74) | mesh — `CG-MSH-001` |
| `cg.mesh.send` | `POST /cmd` | [`:75`](clear-glass/registry-components.js#L75) | mesh — `CG-MSH-002` |
| `cg.mesh.route` | `POST /cmd` | [`:76`](clear-glass/registry-components.js#L76) | mesh, raid — `CG-MSH-003` |
| `cg.mesh.list` | `GET /agents` | [`:77`](clear-glass/registry-components.js#L77) | mesh |
| `cg.url.listen` | `POST /cmd` | [`:80`](clear-glass/registry-components.js#L80) | listener — `CG-URL-001` |
| `cg.url.listen.list` | `GET /listeners` | [`:81`](clear-glass/registry-components.js#L81) | listener |
| `cg.diag.run` | `POST /cmd` | [`:84`](clear-glass/registry-components.js#L84) | diagnostic — `CG-DGN-001` |
| `cg.diag.nexus` | `POST /cmd` | [`:85`](clear-glass/registry-components.js#L85) | diagnostic — `CG-DGN-002` |
| `cg.window.open` | `POST /cmd` | [`:88`](clear-glass/registry-components.js#L88) | window — `CG-WIN-001` |
| `cg.window.close` | `POST /cmd` | [`:89`](clear-glass/registry-components.js#L89) | window — `CG-WIN-002` |
| `cg.wire.health` | `GET /wire/health` | [`:92`](clear-glass/registry-components.js#L92) | wire |
| `cg.wire.eros.proxy` | `POST /eros/*` | [`:93`](clear-glass/registry-components.js#L93) | wire, eros |
| `cg.wire.driver.bridge` | `POST /bridge/driver` | [`:94`](clear-glass/registry-components.js#L94) | wire, driver |
| `cg.wire.hostile` | `POST /hook/hostile` | [`:95`](clear-glass/registry-components.js#L95) | wire, security |
| `cg.wire.behavior` | `POST /hook/behavior` | [`:96`](clear-glass/registry-components.js#L96) | wire, intelligence |
| `cg.calltos.list` | IPC `calltos:list` | [`:107`](clear-glass/registry-components.js#L107) | guardian, callto |
| `cg.calltos.forUrl` | IPC `calltos:forUrl` | [`:108`](clear-glass/registry-components.js#L108) | guardian, callto |
| `cg.calltos.remove` | IPC `calltos:remove` | [`:109`](clear-glass/registry-components.js#L109) | guardian, callto |
| `cg.downloads.listListeners` | IPC `downloads:listListeners` | [`:112`](clear-glass/registry-components.js#L112) | downloads, listener |
| `cg.downloads.registerListener` | IPC `downloads:registerListener` | [`:113`](clear-glass/registry-components.js#L113) | downloads, listener |
| `cg.downloads.updateListener` | IPC `downloads:updateListener` | [`:114`](clear-glass/registry-components.js#L114) | downloads, listener |
| `cg.downloads.removeListener` | IPC `downloads:removeListener` | [`:115`](clear-glass/registry-components.js#L115) | downloads, listener |
| `cg.siteSettings.get` | IPC `site-settings:get` | [`:118`](clear-glass/registry-components.js#L118) | site-settings |
| `cg.siteSettings.getAll` | IPC `site-settings:getAll` | [`:119`](clear-glass/registry-components.js#L119) | site-settings |
| `cg.siteSettings.set` | IPC `site-settings:set` | [`:120`](clear-glass/registry-components.js#L120) | site-settings |
| `cg.siteSettings.deleteKey` | IPC `site-settings:deleteKey` | [`:121`](clear-glass/registry-components.js#L121) | site-settings |
| `cg.siteSettings.clear` | IPC `site-settings:clear` | [`:122`](clear-glass/registry-components.js#L122) | site-settings |
| `cg.siteSettings.listOrigins` | IPC `site-settings:listOrigins` | [`:123`](clear-glass/registry-components.js#L123) | site-settings |
| `cg.history.list` | IPC `history:list` | [`:126`](clear-glass/registry-components.js#L126) | history |
| `cg.history.delete` | IPC `history:delete` | [`:127`](clear-glass/registry-components.js#L127) | history |
| `cg.history.clear` | IPC `history:clear` | [`:128`](clear-glass/registry-components.js#L128) | history |
| `cg.extensions.list` | IPC `extensions:list` | [`:131`](clear-glass/registry-components.js#L131) | extensions |
| `cg.extensions.load` | IPC `extensions:load` | [`:132`](clear-glass/registry-components.js#L132) | extensions |
| `cg.extensions.unload` | IPC `extensions:unload` | [`:133`](clear-glass/registry-components.js#L133) | extensions |
| `cg.extensions.pickDirectory` | IPC `extensions:pickDirectory` | [`:134`](clear-glass/registry-components.js#L134) | extensions |
| `cg.bookmarks.addWithState` | IPC `bookmarks:addWithState` | [`:137`](clear-glass/registry-components.js#L137) | bookmarks, rewind |
| `cg.bookmarks.openWithState` | IPC `bookmarks:openWithState` | [`:138`](clear-glass/registry-components.js#L138) | bookmarks, rewind |
| `cg.rewind.list` | IPC `rewind:list` | [`:141`](clear-glass/registry-components.js#L141) | rewind |
| `cg.rewind.snapshot` | IPC `rewind:snapshot` | [`:142`](clear-glass/registry-components.js#L142) | rewind |
| `cg.rewind.restore` | IPC `rewind:restore` | [`:143`](clear-glass/registry-components.js#L143) | rewind |
| `cg.rewind.clear` | IPC `rewind:clear` | [`:144`](clear-glass/registry-components.js#L144) | rewind |
| `cg.passwords.list` | IPC `passwords:list` | [`:147`](clear-glass/registry-components.js#L147) | passwords, security |
| `cg.passwords.delete` | IPC `passwords:delete` | [`:148`](clear-glass/registry-components.js#L148) | passwords, security |
| `cg.speech.available` | IPC `speech:available` | [`:151`](clear-glass/registry-components.js#L151) | speech |
| `cg.speech.transcribeBuffer` | IPC `speech:transcribeBuffer` | [`:152`](clear-glass/registry-components.js#L152) | speech |
| `cg.macros.list` | IPC `macros:list` | [`:155`](clear-glass/registry-components.js#L155) | macros |
| `cg.macros.get` | IPC `macros:get` | [`:156`](clear-glass/registry-components.js#L156) | macros |
| `cg.macros.run` | IPC `macros:run` | [`:157`](clear-glass/registry-components.js#L157) | macros |
| `cg.bgtab.open` | IPC `bgtab:open` | [`:160`](clear-glass/registry-components.js#L160) | bgtab |
| `cg.bgtab.close` | IPC `bgtab:close` | [`:161`](clear-glass/registry-components.js#L161) | bgtab |
| `cg.bgtab.list` | IPC `bgtab:list` | [`:162`](clear-glass/registry-components.js#L162) | bgtab |
| `cg.autofill.listProfiles` | IPC `autofill:profile:list` | [`:173`](clear-glass/registry-components.js#L173) | autofill |
| `cg.autofill.getProfile` | IPC `autofill:profile:get` | [`:174`](clear-glass/registry-components.js#L174) | autofill |
| `cg.autofill.createProfile` | IPC `autofill:profile:create` | [`:175`](clear-glass/registry-components.js#L175) | autofill |
| `cg.autofill.updateProfile` | IPC `autofill:profile:update` | [`:176`](clear-glass/registry-components.js#L176) | autofill |
| `cg.autofill.deleteProfile` | IPC `autofill:profile:delete` | [`:177`](clear-glass/registry-components.js#L177) | autofill |
| `cg.autofill.detect` | IPC `autofill:detect` | [`:178`](clear-glass/registry-components.js#L178) | autofill |
| `cg.autofill.fill` | IPC `autofill:fill` | [`:179`](clear-glass/registry-components.js#L179) | autofill |
| `cg.screenQa.detect` | IPC `screen-qa:detect` | [`:183`](clear-glass/registry-components.js#L183) | screen-qa |
| `cg.screenQa.answer` | IPC `screen-qa:answer` | [`:184`](clear-glass/registry-components.js#L184) | screen-qa |
| `cg.screenQa.inject` | IPC `screen-qa:inject` | [`:185`](clear-glass/registry-components.js#L185) | screen-qa |
| `cg.screenQa.elementAt` | IPC `screen-qa:element-at` | [`:186`](clear-glass/registry-components.js#L186) | screen-qa |
| `cg.screenQa.deriveQuestion` | IPC `screen-qa:derive-question` | [`:187`](clear-glass/registry-components.js#L187) | screen-qa |

**Real, dated context worth carrying forward verbatim** — this file's
own comment on the autofill/screen-qa rows (added 2026-09-22, the same
day as this pass): *"loom component registry... Real, already-shipped
IPC surface... with zero entries here — the same 'backend real,
registry never touched' gap this file's own downloads/macros/bgtab
entries exist to close, just never closed for these two."* This is the
exact same registry-drift failure class this whole session's node/
registry/watcher pattern was built to catch structurally instead of
by periodic manual audit.

**What it connects to**

- `orchestrator` — verifies this contract on boot
- `cortex` — handles `cortex.raid.decide` (real, `events.handles`)
- `guardian` — handles `guardian.job.dispatch.receive` (real, `events.handles`)

**Bus events emitted**

`clear-glass.boot.complete`, `clear-glass.window.opened`,
`clear-glass.registered`, `clear-glass.shutdown`,
`eros.hostile.detected`, `eros.behavior.plan`, `lifecycle.ready`,
`nexus.status` — real, from this file's own `module.exports.events.emits`.

---

## Accounts, login portals, vaults, Settings (3.10.0, 2026-09-23)

**Clear Glass is the account authority** (James: "yes clearglass" — D3 of the mesh-first phasemap). One account = one options-store uuid; that uuid is the `accountId` everywhere downstream.

| Path | What |
|---|---|
| `src/options/store.js` | accounts, `accountDefaults`, `resolveAccountForDispatch`, `recordSession` |
| `src/main/index.js` | `GET :7702/accounts/resolve` — what guardian's ladder asks (`guardian/lib/cg-account-authority.js`) |
| `src/accounts/login-portal.js` | sign-in window in `persist:mesh-<provider>-<accountId>`; capture → CookieVault `{agentId: provider, accountId}` |
| `src/security/vault-key.js` | safeStorage-sealed data key for both vaults, legacy-key read fallback |
| `renderer/settings.html` + `renderer/settings/` | Settings shell + `core.js` + one file per area under `sections/` |

End to end: **+** → account uuid → **Sign in** (portal, same partition the mesh uses) → **Save session** (vault) → guardian dispatch resolves the account from Clear Glass → mesh `spawn()` opens that partition and restores that vault entry.

## Modules Not Yet Built

Real, from the spec's own `gaps`: `loom/scanners/spec-map.js`'s `SPEC_DIRS` allowlist does not include `clear-glass/spec` — this spec was not picked up by loom's own coverage scanner as of its last read (§SM1). Same real gap class as `loom.spec`'s own SM2 and `architecture-spec.spec`'s AS2 — three independent real systems with the identical unfixed gap.

## In Progress: TR1 (repo-derived agentId in dispatch)

**Phase node:** `clear-glass.TR1` · **status:** active — real chain fully patched, but deeper unresolved than originally diagnosed

Full real chain traced and patched this pass, five files, not one:

1. [`lib/repo-agent.js:322`](lib/repo-agent.js#L322) — builds `payload.agentId = repo-${repo.uuid}` (0.1.0→0.2.0)
2. [`copilot/server.js:2347`](copilot/server.js#L2347) — forwards `body.agentId` to `dispatchToNcpAgent`
3. [`copilot/lifeline.js`](copilot/lifeline.js) `_tryGuardian` — includes `agentId` in the real POST to guardian's `/api/copilot/prompt`
4. [`guardian/server.js:2898`](guardian/server.js#L2898) — forwards `body.agentId` into `askSync`'s opts
5. [`guardian/ask.js:181`](guardian/ask.js#L181) — passes `opts.agentId` into `createJob()`, whose real schema (`guardian/lib/jobs.js`) already had an `agentId` field, unused until now

**Logic-simulated end to end, all five hops' real transformation logic, not mocked behavior:** two different repos produce distinct final `job.agentId` values (`repo-repo-A` vs `repo-repo-B`); ollama-routed dispatch correctly carries none.

**The real, deeper gap this pass found, not assumed fixed:** the original phasemap diagnosis said *"guardian's own NCP dispatch resolves that agentId to a real clear-glass background tab."* Searched all of `guardian/` for any window/tab-selection mechanism (`BrowserWindow`, `tabPool`, `windowFor`, `selectWindow`) — **zero matches anywhere**, including `guardian/lib/ncp-handler.js` itself, which has no reference to clear-glass, its port `7702`, or its DOM IPC bridge at all. A job can now carry the correct `agentId` all the way to creation and still have nowhere real to be used — NCP dispatch has no per-window routing logic to consult it against. Closing TR1 for real needs new dispatch logic in guardian, likely using clear-glass's real `cg.window.open`/`cg.window.close` IPC components (already addressed above, `registry-components.js:88-89`), not just the field-plumbing done this pass.

---

## Version History

**Source:** hand-maintained — `clear-glass.spec`'s own `version_history`, real:

| Version | Date | Summary |
|---|---|---|
| 3.1.0 | 2026-09-01 | First real `.spec` authored, matching live code@3.1.0 exactly (no version bump required) |
| 3.1.0 | 2026-09-19 | 13 new real gates added (`mesh.workflow.*`, `mesh.list.*`) — closes a real gap: AgentMesh's own 10-method automation engine had zero gate coverage despite already backing BrainOS's UI. No version bump — same real object, same real methods, just now also reachable |
| 3.9.0 | 2026-09-22 (registry-components.js AND clear-glass.spec, confirmed) | **Correction to this atlas's own earlier claim:** an earlier pass of this atlas, built from an older snapshot, said `clear-glass.spec` was stale at v3.1.0/67 against a v3.9.0/79 `registry-components.js`. Re-checked directly against the current source: `clear-glass.spec` was already fixed the same day, its own `version_history` entry documenting the exact drift (plus `package.json` independently disagreeing too, reaching 3.8.0) and correcting all sources to 3.9.0. The lesson worth keeping, not the stale claim: this system had FOUR independent version fields disagreeing at once (`lib/version.js`, `main/index.js`'s `CG_VERSION`, `clear-glass.spec`, `package.json`) — a real, repeated pattern worth a structural fix, not just a one-time correction. |

**Whether clear-glass reports to Versionium separately** — not confirmed this session.

---

## Copyright

Copyright © 2026 James Brooks (Erosmancer). Part of the rheon.world / NEXUS ecosystem.
