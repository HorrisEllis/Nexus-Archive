# Changelog — this session

31 real files, changed or newly created, listed below by task. Every item
was verified by actually running it (real host/server/CLI invocations,
not code review alone) — see inline `§BUGFIX`/`§VERIFIED` comments in
each file for exact evidence.

## 1. Schema split (`lib/schemas/`)
`lib/node-schemas.js` split from one 275-line file into 16 per-type files
under `lib/schemas/` + `lib/schemas/index.js` as the aggregator.
`node-schemas.js` kept as a thin, signature-compatible `get/list/checkPayload`
API — no consumer changes needed. Verified: `tests/modules/test-node-schemas.js`
12/12 passing before and after.

`lib/schemas/cos.js` was further corrected mid-session: originally
documented `cos/kernel.js`'s unused, playgrounds-only `Compartment` class.
Now documents the real, live `SnapshotEngine` NexSnapshot shape (the one
`cos create`/vault/blueprint/archetype actually use).

## 2. `.cos` compartment export/import (`cos/host/export.js` + wiring)
New: `exportCompartment()`/`importCompartment()`, composing
`SnapshotEngine` (existing) + `lib/node-export.js` (existing), same
pattern as `.hat`'s `exportHat()`/`importHat()`. Wired via two new gates
(`cos/host/gates/compartment.js`: `ExportCompartmentGate`/
`ImportCompartmentGate`) registered in `cos/host/index.js`, plus two new
CLI commands (`cos/cli/commands/export.js`/`import.js`) wired into
`cos/cli/index.js`.

Two real bugs found and fixed along the way (not pre-existing-and-ignored):
- `cos/foundation/snapshot.js`'s `SnapshotEngine.take()` crashed the
  entire snapshot ("circular structure to JSON") whenever a
  `host:compartment:create` event — which legitimately carries live
  `store`/`sysmap` refs — sat in its event-tail window. Fixed with a
  `_safeEventPayload()` guard: one bad event degrades to a marker, never
  takes the whole snapshot down.
- My own `importCompartment()`: retargeting onto a different existing
  compartment needed to preserve the target's own identity/fs and only
  adopt the imported config's other fields — fixed before landing.

Verified: real `createHost()` session, `create → export → import into a
different compartment → status`, full round trip, both via direct gate
calls and via the actual CLI command functions. `cos/test/test.js`:
153/157 both before and after (same 4 pre-existing, unrelated
Stream/StreamLog failures, files never touched this session).

## 3. BrainOS route-graph data layer (`brainos/route-graph.js`, new)
`buildRouteGraph()` — one real node per live endpoint from
idearium's `GET /api/contract/live` (booted the real server, curled it —
72 real endpoints) and clear-glass's `GET /cli/commands` (shape confirmed
from source, not live-tested — Electron app, no display in this
environment). `ollama`/`guardian`/`bridge` get one honest
`not_yet_indexed` node each, traced to `docs/command-index-per-system.spec`'s
real, current phase status — never a fabricated placeholder route.

`persistNodeToCanvas()`/`persistRouteGraphToCanvas()` — persists the
graph to the real canvas-persistence layer.

**Correction made mid-session**: first pointed at
`guardian:7820/mesh/canvas/*` — wrong. `mesh/README.md` (same day, prior
session) records the whole mesh subsystem was relocated to
`clear-glass/src/network/`, served at `/network/*` on clear-glass's own
port (7702), and `guardian/routes/mesh.js` was removed from guardian's
dispatch as part of that same move. Fixed to target the real, current
location.

## 4. Two more real bugs found in `clear-glass/src/network/` (pre-existing,
not introduced this session — confirmed present in the original
`guardian/routes/mesh.js` too, carried over from the original BrainOS
port, never caught before because nothing exercised the path end-to-end):

- `routes.js`'s canvas branch stripped `'canvas'` off `parts` before
  calling `canvas-persistence.js`'s `handle()`, which itself checks
  `parts[0] !== 'canvas'` — so the check always failed and every real
  `/network/canvas/*` request silently 404'd.
- `canvas-persistence.js`'s `handle()` called `readBody(req)` itself, but
  its caller (`clear-glass/src/main/index.js`'s `_wireServer`) already
  fully drains `req`'s body stream before calling `routes.handle()` —
  so `readBody()` awaited events that had already fired and hung forever
  on every real POST/PUT/PATCH/DELETE.

Fixed both. Verified end-to-end with a real HTTP server built from the
actual `clear-glass/src/network/{install,routes,canvas-persistence}.js`
and `src/core/bus.js` files (not mocked), faithfully reproducing
`main/index.js`'s real body-consumption pattern: `route-graph.js`'s
`persistRouteGraphToCanvas()` → real POST → real GET confirms all 5 nodes
landed on disk correctly.

## 5. `docs/brainos-live-control-panel.spec` — expanded
Added ~10 new `data_sources` entries (scheduler, macros, tool
index/forge, hat forge, frameworks, contracts, compartment
export/import, "recursive" compartments, hats-as-routing-unit) and 4 new
entries to `open_gaps_this_spec_surfaced` — every claim grounded in a
real file, real gaps named explicitly rather than assumed solved.

## Known open items, not done this session
- No CLI command exists yet for the *other* seven `cos/cli/commands/*`
  subsystems (`vault`, `snapshot`, `archetype`, `blueprint`, `plugin`,
  `playground`, `vaultd`) — each has a working `run*Command()` router,
  but `cos/cli/index.js` never dispatches to them. Found, not fixed.
- `BrainOS-main.zip`'s agent/orchestration layer (`agent-registry.js`,
  `agent-factory.js`, `intent-router.js`, `routing-engine.js`,
  `workflow-engine.js`, etc.) was investigated and should **not** be
  ported — `mesh/README.md` already made and documented that exact call
  in a prior session, for real, sound reasons (nexus already has a
  larger, more developed equivalent: RAID, `guardian/lib/jobs.js`,
  `orchestrator/`). Re-porting it would create a second, competing
  orchestration layer.
- The two BrainOS HTML canvases (`BrainOS.html`, `BrainOS-v2.html`) were
  flagged in that same README as "worth a dedicated pass if the canvas
  visualization itself is wanted" — genuinely still open, and the
  closest real match to what BrainOS's live control panel needs next.
