# NEXUS master map — ports, components, CLI, hooks, wires, registry, schemas
Built 2026-07-02 by reading the actual files, not restating filenames. Every
number below came from running code against the real data in this checkout.

## 1. Ports — the canonical map (`nexus-connect.js`)
```
bridge          9999
orchestrator    9000
cortex          3748
guardian        7820
idearium        4800
architect       3747
emerge          4242
diagnostic      7825
ollama          11434
ollama-bridge   3749
copilot         3750
eravos          3751   (in blueprint-index.json, not in nexus-connect.js's PORTS map — see gap below)
clear-glass     7701   (SSE port, not an HTTP API port — see gap below)
```
Health check paths (`HEALTH_PATHS`): cortex/guardian/idearium `/health`,
emerge `/status`, orchestrator `/health`, ollama `/api/tags`. Any new
system should pick a real, unused port and add itself to both maps here —
`nexus-connect.js`'s `_req()` looks up `PORTS[system]` and returns a clean
`unknown system` error if it's missing, it doesn't silently fail.

**Gap found while building this:** `eravos` (3751) and `clear-glass` (7701)
appear in `blueprint-index.json` but not in `nexus-connect.js`'s `PORTS`
object — meaning `nc.req('eravos', ...)`-style calls would fail cleanly,
not route. Worth reconciling before a new system assumes both maps agree.

## 2. Components — two registries, not one, and they disagree
This is worth knowing before you register a new system's components.

**Legacy: `blueprint-index.json`** (used by copilot's `systems`/`components`
handlers, built via `guardian`'s blueprint indexer)
```
11 systems, 135 total components, 135 CLI entries, 12 SEAM hooks
  guardian      33 components
  copilot       15
  ollama         7
  bridge        11
  emerge         9
  architect     17
  eravos        12
  clear-glass   31
  orchestrator   0   ← stale, orchestrator has real components
  cortex         0   ← stale
  idearium       0   ← stale
```
The three zeros are real staleness, not real zero-component systems — this
file hasn't been rebuilt since those systems grew. Copilot's own
self-awareness answers ("what components do you see") are reading this
file, so they're currently undercounting by at least those three systems'
worth. Worth a rebuild pass (there's a `POST /api/blueprint/index` on the
orchestrator per copilot's own fallback message) before trusting it for a
new system's own awareness.

**Current: `loom/data/registry.json`** (the system that replaced this,
built starting phase ~121, fixed for cross-instance staleness at phase 157)
```
component: 20    hook: 26    wire: 27    seam: 0 (not yet used)
```
Much smaller — LOOM is new, most of the codebase hasn't been migrated into
it yet. This is the one that's actually being read/written correctly
right now (disk-first, re-read on every op per phase 157's fix). **A new
system's components should register here, via `loom/schema/registry.js`,
not into the legacy blueprint-index** — that one only gets rebuilt
on-demand and isn't the live source of truth anymore.

## 3. CLI — `blueprint-index.json`'s `allCLI` (135 entries)
Each entry: `{ command, method, path, systemId, description, usage }`.
This is genuinely comprehensive for whatever was true when the index was
last built — same staleness caveat as above applies to command counts for
orchestrator/cortex/idearium specifically.

## 4. Hooks — three places, different purposes
- **`hooks/*.hooks.js`** (10 files) — declarative per-system hook manifests,
  consumed by the orchestrator's hook registry at boot. This is what a new
  system's own `<system>.hooks.js` should follow the shape of.
- **`blueprint-index.json`'s `allSEAM`** (12 entries) — SEAM-specific hooks
  (co-pilot's spec-build queue chunking), narrower than the full hook set.
- **`loom/data/registry.json`'s `hook`** (26 entries) — the current live
  count of hooks actually wire-declared into LOOM.

## 5. Wires — `docs/WIRES.md` + `loom/data/registry.json`'s `wire` (27)
LOOM's wire count is the live, current cross-component connection graph —
same one that let two independently-built components in different COS
compartments (phase 156's test) discover they relate, without either
compartment knowing about the other directly.

## 6. Registry — `loom/schema/registry.js`
Disk-first, four kinds: `component`, `seam`, `hook`, `wire`. Load-on-
construct, write-on-every-mutation, re-reads from disk before every read
(the phase-157 fix — two processes pointed at the same `dataDir` now see
each other's writes). This is the one to register a new system into.

## 7. Cortex / JAA data schemas — `docs/SCHEMA.md` + `jaa/schema.sql`
28 JAA tables, documented field-by-field in `docs/SCHEMA.md` (`event_log`,
`artifacts`, `gaps`, and 25 more). `jaa/schema.sql` and `jaa/schema-full.sql`
are the concrete reference. JAA itself is schema-flexible at the storage
layer (`lib/jaa-store.js` — generic named tables, no fixed `CREATE TABLE`)
— the "schema" is convention, enforced by what each system actually reads
and writes, not by the storage engine. A new system can open new tables
freely; document them in `SCHEMA.md` so they're not invisible to everyone else.

## 8. API channels / anything hookable — `contracts/SYSTEM-CONTRACTS.js`
1099 lines, the deepest reference in this kit. Real sections: `SYSTEMS`,
`EVENTS`, `GAPS`, `FAULTS`, `EDGES` (14 declared system-to-system edges —
this is where the stale `EMERGE_OLLAMA`/`GUARDIAN_OLLAMA` entries were
found and fixed earlier this session), `DELTAS`, `DIVERGENT`,
`BOTTLENECKS`, `LEDGERS`, `INTERACTION_CONTRACTS`, `VERIFICATION_CONTRACTS`,
`CAUSAL_PHYSICS`, `SELF_AWARENESS`. A new system's edges belong in `EDGES`,
its event names in `EVENTS` — both are `Object.freeze`d, so add-not-mutate.

## What a genuinely new system needs to touch, in order
1. Pick a port, add it to `nexus-connect.js`'s `PORTS` (+ `HEALTH_PATHS` if
   it has a health endpoint).
2. Write its `.spec` file following `docs/guides/tutorial-build-first-spec.guide`.
3. Register its edges in `contracts/SYSTEM-CONTRACTS.js`'s `EDGES`.
4. Register components/hooks/wires into `loom/data/registry.json` via
   `loom/schema/registry.js` — not the legacy blueprint index.
5. Write its `<system>.hooks.js` in `hooks/`, matching the existing 10.
6. Document any new JAA tables it opens in `docs/SCHEMA.md`.
7. Add an entry to the phase map (`phase-map/nexus_complete_phase_map_10.html`)
   once it's real, so the next system doesn't duplicate it.
