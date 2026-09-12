# Node type → system map — Intelligence

The richest system checked so far — it has its own real, comprehensive local
schema file, `intelligence/schemas.js` ("James: 'schemas for each type of
data it stores. the rest is probabilistic and fluid.'"), same spirit as
guardian's `schemas/index.js`.

## Legend
WRITES / READS / VIA LOOM / PARTICIPATES / NOT USED — same as Guardian/Versionium.

| Type | Status | Grounding |
|---|---|---|
| `pat` | WRITES — second real source found | `intelligence/schemas.js`'s own `bep_patterns` JAA table (behavioral/crystallised patterns) is a second, real, independently-documented pattern shape alongside `lib/case-library.js`'s `pattern_signature` (`schema.pat`'s original grounding). Not unified — same fragmentation class as guardian's ledger/gap findings. |
| `gap` | WRITES | `intelligence/schemas.js`'s own `gaps` table, plus a full local subsystem: `intelligence/gap/hunter.js`, `ledger.js`, `index.js`, `predicate.js`. |
| `event` | WRITES | `intelligence/schemas.js`'s own `event_log` table — the same shared jaaDB table `schema.event` is grounded in. |
| `capability` | WRITES | `intelligence/registry-components.js`. |
| `spec` | WRITES | `intelligence/spec/intelligence.spec`. |
| `component` | NOT USED — real, confirmed gap | Checked `capability-map.js`'s `SYSTEMS` map directly: `intelligence` is **not** in it, despite having a real `registry-components.js`. Same class of gap already found for versionium. |
| `hook` | NOT USED — same confirmed gap | Same reasoning as `component`. |
| `wire` | NOT USED — same confirmed gap | Same reasoning as `component`. |
| `node` | NOT USED — same confirmed gap | Same reasoning as `component`. |
| `fault` | READS/ADJACENT | `intelligence/schemas.js` documents `fault_taxonomy`, but per guardian's own schema index, `cortex/self-heal/fault-taxonomy.js` is sole write authority — intelligence documents it, doesn't own writing it. |
| `failure_mode` | STILL NOT FOUND | `fault_taxonomy` is the closest real thing anywhere in the codebase to this still-`OPEN` type, and it isn't the same shape — didn't force a match. |
| `system` | IS ONE | `intelligence` is a real, named system in `NEXUS_MAP.md`'s top-level list. |

## The 4 esoteric excluded types — confirmed to belong here

`vector`, `resonance_crystal`, `relationship_edge`, `interstitial_space` were
excluded from the central 32 earlier this session as "belonging to other
subsystems." Mapping intelligence directly confirms it: `resonance_crystal`
← `intelligence/liminal-space/index.js`, `relationship_edge` ←
`intelligence/lattice/associative-lattice.js`. Real, but intelligence's own
separate taxonomy — not orphaned, just not part of guardian's central 32.

## One drift found, not chased further

`guardian/lib/gap-hunter.js`'s own header says its canonical replacement is
`meta/gap/hunter.js`. No `meta/gap/` directory exists in this snapshot — the
real file is at `intelligence/gap/hunter.js`, whose own internal header
still says `guardian/lib/gap-hunter.js` (a copy-paste artifact). Comment
drift, flagged, not resolved.
