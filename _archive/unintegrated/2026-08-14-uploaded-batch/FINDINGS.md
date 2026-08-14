# 2026-08-14 uploaded batch — findings

Nine zips uploaded in one turn. Checked each against the LIVE tree (not
just the old `_archive/unintegrated/README.md` audit — that led to one
real mistake, corrected below). Nothing here is wired. Nothing here should
be merged as-is. Record kept so this investigation isn't repeated blind.

## Confirmed stale — do not merge, would regress

- **`emergence-6/warp`** — v1.4.0. Live `warp/` (project root) is
  **v1.5.0**, already required by `loom/schema/*.js`, `orchestrator.js`,
  `autopilot.js`, `lib/warp-bus.js`. Merging this goes backward.

- **`telemetry-codec-components`** — checked against live
  `meta/telemetry-codec/`: loaded directly, confirmed working
  (`VERSION: '1.0.0'`, `MODULE_ID: 'telemetry-codec'`, reachable via
  `orchestrator.js`'s `/api/meta` routes right now). The upload uses ES
  `export` syntax; the live version is a correctly-converted, working
  CommonJS version. **I initially reported this as a real gap — wrong.**
  I was going off `_archive/unintegrated/README.md`'s older audit (which
  described a genuinely broken, uncommented-export version) without first
  checking whether the live tree had since fixed it. It had. Correcting
  that here rather than leaving the earlier claim standing.

- **`topo-kernel-components`** — same story: live `meta/topo-kernel/`
  loaded and confirmed working. Diffed `snr.js` directly — one cosmetic
  `require('./bus')` vs `require('./bus.js')` difference, otherwise
  identical. Not a gap.

## Structurally not the same kind of thing as NEXUS's meta/ layer

`meta/`'s modules (per `meta/index.js`'s own stated philosophy) are
small, domain-agnostic, sovereign — `meta/alk/index.js` is 232 lines of
pure logic, no UI. `meta/spatial/` is four files, ~340 lines total.

- **`ALK-components`** — has `mic.html`, `mic.css`, `demo/video-demo.html`.
  A standalone application (mic + video + cross-modal kernel), not a
  library module. Different shape entirely from live `meta/alk/`.
- **`spatial-components`** — 152 files, its own `NEXUS_MASTER_PHASEMAP.md`
  dated 2026-05-09 (six weeks before this repo's earliest commit),
  describing signal-topology/mic/ALK integration streams. Different scale
  and scope from live `meta/spatial/` (4 files, sigma + lattice only).
- **`resonance-app-components`, `resonance-engine-v5_1_0-components`,
  `rheon-voice-components`, `ase-persistent-scanner-components`** — zero
  references anywhere in the current NEXUS repo. Each is its own
  standalone `index.html` + `css` + `js` application.

**Working theory, not confirmed:** this whole batch is a separate,
earlier or parallel product — audio/voice/video/behavioral signal
analysis (the "Rheon" name shows up in one of them) — sharing an author
and some early naming lineage with NEXUS's `meta/` layer, but not a
missing piece of NEXUS itself. `spatial`'s own phasemap being titled
"NEXUS" and predating this repo by six weeks is the strongest signal for
this reading, but it's not certain from the files alone.

## What's actually real and possibly worth a second look, later

`resonance-engine-v5.1.0/engines/relational-physics.js` and
`resonance-engine-v5.1.0/engines/gap-taxonomy.js` — gap-taxonomy in
particular could genuinely overlap with NEXUS's own `cortex/gap-finder`
and `meta/gap/`. Not compared line-by-line this pass — flagged for a
real diff if this batch turns out to matter later.
