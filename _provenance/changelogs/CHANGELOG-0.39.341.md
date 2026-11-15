# Nexus 0.39.341

**0.39.341 — 2026-10-05**

| | |
|---|---|
| Built | 2026-10-05 08:58:52 → 2026-10-05 08:58:52 |
| Builds on the main line | 1 |
| Other archives filed here | 0 |
| Versions the builds claimed | 0.39.341 |
| Tag | `v0.39.341` → snap-0732 |
| Full file ledger | [LEDGER-0.39.341.csv](../ledger/LEDGER-0.39.341.csv) |

## Release notes — `CHANGELOG-0.39.341.md`

Copied unchanged from the build.

### 0.39.341 — 2026-10-05

James: "cos needs to be a nested compartment"
Asked where (its own system, or nested inside core), James: "Its own system (16th)"

Mapped first as SY2 in `docs/2026-10-05-cli-data-code-phasemap.spec` (1.4.0), right after SY1 (the 15 systems).

#### COS is its own system
- **`lib/nexus-self/systems.js` lists `cos`:** `dirs: ['cos']`, loom tag `cos`, no process of its own. That's the same shape as `components`, the last nested repo without a process.
- **`cos/` belongs to COS now, not core.** The glue in `lib/` that reaches COS stays core's: `lib/cos-bridge.js`, `lib/cos-run.js`, `lib/repo-run.js`.
- **The next nexus-self sync makes the nested repo `nexus/cos`** in its own compartment under `nexus`. Core re-syncs without `cos/`, so its index is rebuilt once, and an agent asked during that waits for it (SB35).
- **Phases tagged `cos` are COS's.** That covers the COS machines map (VM1–EL1) and EV0's COS part. `forSystem('cos')` answers them, which is COS's Phases tab.
- **SY1's "only the 15" becomes "only the systems in `systems.js`" (16)**, on James's answer.

#### Atlases
- **`docs/atlases/cos-atlas.md` (new).** Core atlas's `cos/` section, moved unchanged, plus its generated half: 139 files, with their routes and events from the registry.
- **`docs/atlases/core-atlas.md`** keeps a pointer where the section was. Its generated half is rewritten without `cos/`.
- **`docs/atlases/nexus-atlas.md`** gets a `cos` section, and its count is fixed: sixteen systems. It still said fourteen, which was already one short.

#### Proof
- `test-loom-phasemap` 7/7. T-006 and T-007 now pin `cos` as a system, the COS machines map as COS's, and VM1 on COS's roadmap.
- `test-nexus-atlas-refs` 53/53.
- All 17 suites that read `systems.js` are green.
- version-sync 30/30.
- Loom regenerated from scratch, with nothing lost.

## Ledger

### Build 0.39.341 — snap-0732 — 2026-10-05 08:58:52

- Archive: `nexus-0732_2026-10-05_v0.39.341_main-29.zip` (was `Nexus-main-29.zip`)
- SHA-256: `689288d81cea421146e35269de1fe86fd719a1a3e28a9e98ca3154bb74a194f8`, 14.7 MB, downloaded 2026-10-05 09:00:14
- Kind: full
- Commit: `7a2d806809123d709a362c942c46356ef0c8d887`, tag `snap-0732`
- Files in archive: 5283. Changes against the build before it: **7 added, 22 modified, 0 deleted**

| System | Added | Modified | Deleted |
|---|---|---|---|
| idearium | 2 | 7 | 0 |
| docs | 2 | 6 | 0 |
| (root) | 2 | 1 | 0 |
| loom | 0 | 3 | 0 |
| tests | 1 | 2 | 0 |
| lib | 0 | 2 | 0 |
| cos | 0 | 1 | 0 |

```
A CHANGELOG-0.39.340.md
A CHANGELOG-0.39.341.md
M cos/spec/cos.spec
M docs/2026-09-26-cos-testenv-vm-and-nexus-atlas-phasemap.spec
M docs/2026-10-01-idearium-agent-ready-master-phasemap.spec
M docs/2026-10-05-cli-data-code-phasemap.spec
A docs/2026-10-05-cos-machines-phasemap.spec
M docs/SPEC-REGISTRY.spec
M docs/atlases/core-atlas.md
A docs/atlases/cos-atlas.md
M docs/atlases/nexus-atlas.md
M idearium/api/build-surface.js
M idearium/index.js
M idearium/package.json
M idearium/spec/idearium.spec
A idearium/ui/css/desktop-setup.css
M idearium/ui/index.html
A idearium/ui/js/desktop-setup.js
M idearium/ui/js/repo-environment.js
M idearium/ui/js/repo-settings.js
M lib/nexus-self/systems.js
M lib/version.js
M loom/data/events.json
M loom/data/registry.json
M loom/maps/verified-primitives-map.js
M package.json
M tests/modules/run-all.js
A tests/modules/test-desktop-setup-popup.test.js
M tests/modules/test-loom-phasemap.js
```

