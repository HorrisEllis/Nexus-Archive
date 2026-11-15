# Nexus 0.39.172

**NEXUS 0.39.170 — version bump + commit message for 165–169**

| | |
|---|---|
| Built | 2026-09-20 05:14:08 → 2026-09-20 05:14:08 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.172 |
| Tag | `v0.39.172` → snap-0620 |
| Full file ledger | [LEDGER-0.39.172.csv](../ledger/LEDGER-0.39.172.csv) |

## Release notes — `CHANGELOG-0.39.172.md`

Copied unchanged from the build.

### v0.39.172

#### Eravos — v3-17 catalog swap + organism → mod rename

- App layer replaced wholesale with the uploaded v3-17 standalone catalog
  export: `mods/` (was `organisms/`), `runtime/`, `specs/`, `kernel/`,
  `behaviors/`, `workspace/`, `index.html`, `manifest.json`. 8 new mods
  added: `macro-automation`, `master-fx`, `photo-editor`, `serial-bridge`,
  `sidechain-compressor`, `supersaw`, `video-editor`, `webhook-automation`.
- `server.js`, `config.js`, `registry-components.js`, `data/` (including
  eravos's own per-system ledger), and the nexus-taxonomy schemas
  (`schema.component`/`system`/`node`/`hook`/`capability`/`command`) were
  **not** replaced — the standalone catalog has no concept of these; they
  are Nexus's integration layer around the app, not the app itself.
- Corrected an assumption made mid-session: initially believed the catalog
  had no equivalent for the 7 `nexus-*` bridge mods (`nexus-idearium`,
  `nexus-guardian`, `nexus-cortex`, `nexus-orchestrator`, `nexus-architect`,
  `nexus-diagnostic`, `nexus-bridge`). It does — byte-identical apart from
  the rename, and more complete (root's `nexus-idearium` was a 2-file stub;
  the catalog's has `data/` and `tests/` too). Diffed before discarding
  anything; no data lost.
- `organism` → `mod` renamed everywhere in this system: paths, filenames,
  identifiers, comments, spec text. 0 residual `organism` references in
  either the catalog or the root tree (was 476 catalog / 1525 root).
  `eravos.spec` bumped 3.0.0 → 3.17.0 to reflect the catalog version.

#### Ledger — per-system ownership (root cause found, not just piled-up)

- Diagnosed the "piling up fast" complaint against the actual data: the
  flat `data/ledger/event_log.jsonl` (8.5MB / 13,556 lines / 3.5 days) was
  NOT growing at an abnormal rate — measured ~0.044 events/sec average,
  ~1 pulse per system per 5 minutes, which is sane. The real problem was
  architectural: `orchestrator/orchestrator.js` opened exactly ONE
  `createCFRLedger` instance (`data/ledger/`, systemId `'orchestrator'`)
  and every event crossing the bus, from any of the 15 real systems, was
  written into that single shared sink, forever, with no split and no
  rotation.
- **Backfilled**: the existing 13,556 lines were split into
  `data/<system>/event_log.jsonl` per system, resolved by
  `payload.systemId` for pulse-type events and `source` for everything
  else (the `_system` field itself was useless for this — it was always
  `"orchestrator"`, the relaying process, not the true origin). Verified
  13,556 in → 13,556 out, zero duplicate UUIDs against pre-existing
  per-system data.
- **Patched** `orchestrator/orchestrator.js`: `_eventLedger` (one shared
  CFR ledger instance) replaced with `_getEventLedger(system)`, a lazily-
  created per-system CFR ledger instance at `data/<system>/ledger/cfr/`
  — the exact pattern `guardian/server.js` already used correctly for its
  own CFR ledger (`data/guardian/ledger/cfr/`). Each system's coherence /
  tension / sigma is now computed over only its own events, not a blended
  global stream. Both real write call sites (`ledgerWrite()` and the
  `_bootSystems` event callback) now route through the resolved system's
  own instance. The admin/debug endpoints that were already scoped to
  `systemId: 'orchestrator'` (`handleCFRRoute`, `getAllBaselines`,
  `getAllStats`, `scanInvariants`) are unaffected — kept as an alias to
  orchestrator's own instance, since they report on orchestrator itself.
- **Not yet touched**: `_ledgerFd` / `LEDGER_FILE`
  (`data/ledger/orchestrator.jsonl`) — a second, separate raw-append sink
  that persists orchestrator's own in-memory `LEDGER[system]` ring
  (already correctly per-system in memory, just journaled to one flat
  file on disk). Left alone this pass since it's orchestrator's own
  operational replay journal, not the cross-system event stream — flagging
  it as the same shape of problem if it turns out to matter.

#### Intelligence — "2 rows loading" traced, not yet fixed

- Could not find the literal string in `intelligence/`. Traced it to
  `guardian/jaa-store.js:474`'s `[jaa] Loaded ${tbl.size} rows — ${name}`,
  used by `intelligence/lib/domain-nodes.js`'s node-index store. That
  construction is memoized within a process (`_indexStore()` — confirmed
  only one `new JaaStore()` call site in `intelligence/`), and `JaaStore`
  itself already has a prior fix (`§FIX 2026-07-24b`) for exactly this
  "fires on every call" failure mode. The only way this line repeats in
  autopilot's output is if intelligence's process is restarting — each
  restart is a fresh process, fresh memoization, so it reprints
  `[jaa] Loaded 2 rows — <table>` on every boot. **Not fixed**: the visible
  symptom is a crash-restart loop, not a chatty log line, and muting the
  line would hide that signal. Needs autopilot's supervisor/restart-count
  log checked before deciding whether to fix the log or the restart.
- Data-folder migration for the intelligence system: not started.

#### Guardian — routes/interaction-contract hardening

- Not started. Confirmed the shape of the problem: `guardian/
  interaction-contract.json`'s own reconciliation note documents real
  drift between itself, `contracts/nexus-interaction-contract.js`, and
  `guardian/server.js`'s actual routes, including a live 404 bug
  (`/memory/ledger`, `/memory/artifacts`, `/memory/stats` are called by
  real client code with no server handler). ~25 files across cortex,
  orchestrator, loom, copilot, and every UI shell hardcode their own
  fetch calls to Guardian's port/routes instead of going through one
  client — which is why a Guardian change breaks unrelated callers.

## Ledger

### Build 0.39.172 — snap-0620 — 2026-09-20 05:14:08

- Archive: `nexus-0620_2026-09-20_v0.39.172_vnamed-0.39.172.zip` (was `nexus_v0.39.172.zip`)
- SHA-256: `21e4e1aac8b8c311fbb44c8d2de9b2da9c41950fada11ab301b14210e5237535`, 123.4 MB, downloaded 2026-09-20 05:15:27
- Kind: full
- Commit: `18a543a7d3a50282cc158a112432bc09efeb0039`, tag `snap-0620`
- Left out: embedded .git (5468 files, HEAD babc971794413721a78fa509a3b492559a3090c7 (master))
- Left out: node_modules (256 files)
- Left out (50 MB or more): `versionium/data/snapshots/290059be-cd3d-4307-9f39-b1f5c0c83aa6.nex (52 MB)`
- Left out (50 MB or more): `versionium/data/snapshots/6d0042f5-a795-499a-94a7-8cb7ac420343.nex (52 MB)`
- Files in archive: 4653. Changes against the build before it: **84 added, 33 modified, 55 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| eravos | 71 | 28 | 55 |
| data | 12 | 3 | 0 |
| (root) | 1 | 1 | 0 |
| orchestrator | 0 | 1 | 0 |

```
A CHANGELOG-0.39.172.md
M eravos/registry-components.js
M eravos/server.js
M eravos/spec/eravos.node-taxonomy.md
M eravos/spec/eravos.spec
M eravos/ui/bridge/nexus-bridge.js
M eravos/ui/catalog/catalog-ui.js
M eravos/ui/catalog/catalog.js
M eravos/ui/index.html
M eravos/ui/kernel/kernel.js
M eravos/ui/manifest.json
A eravos/ui/mods/acid-synth/acid-synth.engine.js
A eravos/ui/mods/acid-synth/schema/schema.json
A eravos/ui/mods/bass-drop-builder/bass-drop-builder.engine.js
A eravos/ui/mods/bass-drop-builder/schema/schema.json
A eravos/ui/mods/channel/channel.engine.js
A eravos/ui/mods/channel/schema/schema.json
A eravos/ui/mods/contrast-analyser/contrast-analyser.engine.js
A eravos/ui/mods/contrast-analyser/schema/schema.json
A eravos/ui/mods/edm-lab/edm-lab.engine.js
A eravos/ui/mods/edm-lab/schema/schema.json
A eravos/ui/mods/lfo/lfo.engine.js
A eravos/ui/mods/lfo/schema/schema.json
A eravos/ui/mods/macro-automation/macro-automation.engine.js
A eravos/ui/mods/macro-automation/schema/schema.json
A eravos/ui/mods/master-fx/master-fx.engine.js
A eravos/ui/mods/master-fx/schema/schema.json
A eravos/ui/mods/nexus-architect/nexus-architect.engine.js
A eravos/ui/mods/nexus-architect/schema/schema.json
A eravos/ui/mods/nexus-bridge/nexus-bridge.engine.js
A eravos/ui/mods/nexus-bridge/schema/schema.json
A eravos/ui/mods/nexus-cortex/nexus-cortex.engine.js
A eravos/ui/mods/nexus-cortex/schema/schema.json
A eravos/ui/mods/nexus-diagnostic/nexus-diagnostic.engine.js
A eravos/ui/mods/nexus-diagnostic/schema/schema.json
A eravos/ui/mods/nexus-guardian/nexus-guardian.engine.js
A eravos/ui/mods/nexus-guardian/schema/schema.json
A eravos/ui/mods/nexus-idearium/nexus-idearium.engine.js
A eravos/ui/mods/nexus-idearium/schema/schema.json
A eravos/ui/mods/nexus-orchestrator/nexus-orchestrator.engine.js
A eravos/ui/mods/nexus-orchestrator/schema/schema.json
A eravos/ui/mods/nexus-shared/nexus-node-core.js
A eravos/ui/mods/pads/pads.engine.js
A eravos/ui/mods/pads/schema/schema.json
A eravos/ui/mods/photo-editor/photo-editor.engine.js
A eravos/ui/mods/photo-editor/schema/schema.json
A eravos/ui/mods/reese-bass/reese-bass.engine.js
A eravos/ui/mods/reese-bass/schema/schema.json
A eravos/ui/mods/sample-player/sample-player.engine.js
A eravos/ui/mods/sample-player/schema/schema.json
A eravos/ui/mods/sequencer/schema/schema.json
A eravos/ui/mods/sequencer/sequencer.engine.js
A eravos/ui/mods/serial-bridge/schema/schema.json
A eravos/ui/mods/serial-bridge/serial-bridge.engine.js
A eravos/ui/mods/sidechain-compressor/schema/schema.json
A eravos/ui/mods/sidechain-compressor/sidechain-compressor.engine.js
A eravos/ui/mods/supersaw/schema/schema.json
A eravos/ui/mods/supersaw/supersaw.engine.js
A eravos/ui/mods/timeline/schema/schema.json
A eravos/ui/mods/timeline/timeline.engine.js
A eravos/ui/mods/video-editor/schema/schema.json
A eravos/ui/mods/video-editor/video-editor.engine.js
A eravos/ui/mods/webhook-automation/schema/schema.json
A eravos/ui/mods/webhook-automation/webhook-automation.engine.js
A eravos/ui/mods/wobble-bass/schema/schema.json
A eravos/ui/mods/wobble-bass/wobble-bass.engine.js
A eravos/ui/mods/xy-pad/schema/schema.json
A eravos/ui/mods/xy-pad/xy-pad.engine.js
D eravos/ui/organisms/acid-synth/acid-synth.engine.js
D eravos/ui/organisms/acid-synth/schema/schema.json
D eravos/ui/organisms/bass-drop-builder/bass-drop-builder.engine.js
D eravos/ui/organisms/bass-drop-builder/schema/schema.json
D eravos/ui/organisms/channel/channel.engine.js
D eravos/ui/organisms/channel/schema/schema.json
D eravos/ui/organisms/contrast-analyser/contrast-analyser.engine.js
D eravos/ui/organisms/contrast-analyser/schema/schema.json
D eravos/ui/organisms/edm-lab/edm-lab.engine.js
D eravos/ui/organisms/edm-lab/schema/schema.json
D eravos/ui/organisms/lfo/lfo.engine.js
D eravos/ui/organisms/lfo/schema/schema.json
D eravos/ui/organisms/nexus-architect/nexus-architect.engine.js
D eravos/ui/organisms/nexus-architect/schema/schema.json
D eravos/ui/organisms/nexus-bridge/nexus-bridge.engine.js
D eravos/ui/organisms/nexus-bridge/schema/schema.json
D eravos/ui/organisms/nexus-cortex/nexus-cortex.engine.js
D eravos/ui/organisms/nexus-cortex/schema/schema.json
D eravos/ui/organisms/nexus-diagnostic/nexus-diagnostic.engine.js
D eravos/ui/organisms/nexus-diagnostic/schema/schema.json
D eravos/ui/organisms/nexus-guardian/nexus-guardian.engine.js
D eravos/ui/organisms/nexus-guardian/schema/schema.json
D eravos/ui/organisms/nexus-idearium/nexus-idearium.engine.js
D eravos/ui/organisms/nexus-idearium/schema/schema.json
D eravos/ui/organisms/nexus-orchestrator/nexus-orchestrator.engine.js
D eravos/ui/organisms/nexus-orchestrator/schema/schema.json
D eravos/ui/organisms/nexus-shared/nexus-node-core.js
D eravos/ui/organisms/pads/pads.engine.js
D eravos/ui/organisms/pads/schema/schema.json
D eravos/ui/organisms/reese-bass/reese-bass.engine.js
D eravos/ui/organisms/reese-bass/schema/schema.json
D eravos/ui/organisms/sample-player/sample-player.engine.js
D eravos/ui/organisms/sample-player/schema/schema.json
D eravos/ui/organisms/sequencer/schema/schema.json
D eravos/ui/organisms/sequencer/sequencer.engine.js
D eravos/ui/organisms/timeline/schema/schema.json
D eravos/ui/organisms/timeline/timeline.engine.js
D eravos/ui/organisms/wobble-bass/schema/schema.json
D eravos/ui/organisms/wobble-bass/wobble-bass.engine.js
D eravos/ui/organisms/xy-pad/schema/schema.json
D eravos/ui/organisms/xy-pad/xy-pad.engine.js
M eravos/ui/pack/pack-loader.js
M eravos/ui/runtime/alk-gl.js
M eravos/ui/runtime/canvas-cfr.js
M eravos/ui/runtime/master-transport.js
A eravos/ui/runtime/mod-factory.js
D eravos/ui/runtime/organism-factory.js
M eravos/ui/runtime/wire-system.js
M eravos/ui/specs/ERAVOS.kernel.spec
M eravos/ui/specs/eravos.genomes-ecosystems-behaviors.spec
A eravos/ui/specs/eravos.mod.pads.spec
A eravos/ui/specs/eravos.mod.sample-player.spec
A eravos/ui/specs/eravos.mod.sequencer.spec
A eravos/ui/specs/eravos.mod.timeline.spec
M eravos/ui/specs/eravos.nexus.build-contract.spec
D eravos/ui/specs/eravos.organism.pads.spec
D eravos/ui/specs/eravos.organism.sample-player.spec
D eravos/ui/specs/eravos.organism.sequencer.spec
D eravos/ui/specs/eravos.organism.timeline.spec
M eravos/ui/specs/eravos.pack.format.spec
M orchestrator/orchestrator.js
M package.json
```

42 more (mostly data, logs and archived files) are in the ledger file.

