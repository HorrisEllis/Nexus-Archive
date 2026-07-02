# NEXUS build kit — everything needed to start a new system
Assembled 2026-07-02 from the live nexus-consolidated__36 checkout.

## Start here, in order

1. **`docs/AXIOMS-v3.0.md`** — the actual constitution. Immutable laws
   (marked §) are non-negotiable for any new system; flexible principles
   bend to the problem. v1.0/v2.0 are kept for history, superseded by v3.0.
2. **`docs/guides/tutorial-build-first-spec.guide`** — walks through writing
   your first `.spec` file, the format every system in NEXUS is authored in.
3. **`docs/SPEC-REGISTRY.md`** — the index of all 93 existing `.spec` files
   and their drift-check status. Check this BEFORE naming a new system or
   component — this is where "RAID" and "diagnostic" naming collisions
   would have been caught earlier if checked first.
4. **`docs/SCHEMA.md`** — the shared data schema conventions a new system's
   spec needs to conform to.
5. **`contracts/SYSTEM-CONTRACTS.js`** — the real edge list: which systems
   talk to which, over what protocol, on what port. A new system needs an
   entry here before it's real, not after.

## What's in this kit

- **`docs/`** — full docs tree from the live checkout: all 93 `.spec` files
  (one per existing system/component — use as templates), architecture docs
  (`ARCHITECTURE.md`, `NEXUS-SYSTEM.md`, `SYSTEM-MAP.md`, `WIRES.md`),
  interaction contracts (`INTERACTION_CONTRACTS.md`), the phase map
  cross-reference (`NEXUS-PHASE-MAP-CROSSREF.md`), and `docs/roadmap/` +
  `docs/specs/` subdirectories with per-system deep-dive specs.
- **`contracts/`** — `SYSTEM-CONTRACTS.js` (system-to-system edges),
  `nexus-interaction-contract.js`, `orchestrator-contract.json`.
- **`hooks/`** — the 10 `*.hooks.js` declarative hook manifests currently
  registered — the pattern a new system's own hooks file should follow.
- **`session-specs/`** — `NEXUS-BRANCHING-DECISION-LOOP-SPEC-v0.1.md`, the
  most recent spec-first design doc (2026-07-02, not yet built). Useful as
  a worked example of the "spec first, no code" convention in practice.
  (`NEXUS-LATTICE-COGNITION-ROADMAP-v0.1.md`, the other recent one, is
  already inside `docs/` from the live checkout.)
- **`phase-map/`** — `nexus_complete_phase_map_10.html`, the current
  184-entry tracker. Check this for what already exists — a large fraction
  of "new system" ideas turn out to be 70% built already (see the
  branching-decision-loop spec's own finding) once checked against this.
- **`MANIFEST.json`, `MANIFEST.md`, `SYSTEM-MAP.md`, `README.md`, `START.md`**
  — top-level orientation docs from the repo root.

## One honest caveat, carried over from `SPEC-REGISTRY.md` itself

Most `.spec` files in this kit have **not been checked against live code**
recently — the registry says so plainly (17 of 93 checked as of last pass,
with real drift found in some). Treat every `.spec` here as "what was
intended," not "what is guaranteed to be true right now." If a new system
needs to depend on another system's exact current behavior, verify against
the actual source, not just its spec.
