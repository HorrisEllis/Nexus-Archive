# PHASE-ID MIGRATION — 2026-08-14

`docs/*phasemap*.spec` phase IDs were not unique. `P1`–`P5` were each declared by
**eight** different phasemaps; `CA1`–`CA7` by two; `SS1`–`SS2` by two. 20 of 104
unique tokens collided across 165 declared phases.

This was not cosmetic. Two consequences are on the record already:

- `repair-contract-and-loom-hub-phasemap.spec`'s R0 note documents a real bug it
  caused: *"the phase's own id collided with jaaDB's reserved `id` field across
  phasemap files that reuse generic phase-ids (P5/P6 in two different maps)"* —
  fixed there by renaming the column to `phaseId`, which worked around the symptom
  while leaving the collision itself in place.
- Commit `9f9d54d` is titled *"Merge P4 session onto real history"*. Which P4 —
  one of eight — is not recoverable from the subject line alone.

After migration: **165 declared phases, 165 unique IDs, 0 collisions.**

## Why these prefixes

`loom/scanners/phasemap-map.js`'s `PHASE_RE` is `^\s{2,6}([A-Z]{1,3}\d+_[A-Za-z0-9_]*):`
— a prefix of **three letters maximum** is a hard constraint, not a style choice.
Every prefix below is two letters and does not collide with the families that were
already unique: `AM AP CA LP NC OB R RR SB SS UM`.

`copilot-awareness-routing` KEEPS `CA`; `copilot-autonomous` moved to `AU`. That
direction was chosen because live code cites the awareness map by name —
`lib/agent-router.js`'s header reads *"§PHASEMAP CA5 (docs/copilot-awareness-routing-phasemap.spec, CHUNK C)"*.
Renaming that one would have broken a real, correct code reference.

## The table

| Phasemap | Old | New | Range | Count |
|---|---|---|---|---|
| `docs/copilot-full-capability-phasemap.spec` | `P<n>` | `FC<n>` | `P1`–`P11` → `FC1`–`FC11` | 11 |
| `docs/copilot-omniscience-phasemap.spec` | `P<n>` | `OM<n>` | `P1`–`P7` → `OM1`–`OM7` | 7 |
| `docs/cortex-schema-registry-phasemap.spec` | `P<n>` | `CS<n>` | `P1`–`P5` → `CS1`–`CS5` | 5 |
| `docs/gemini-multiagent-coding-phasemap.spec` | `P<n>` | `GM<n>` | `P1`–`P5` → `GM1`–`GM5` | 5 |
| `docs/nexus-architecture-rebuild-phasemap.spec` | `P<n>` | `AR<n>` | `P1`–`P22` → `AR1`–`AR22` | 22 |
| `docs/nexus-live-mind-phasemap.spec` | `P<n>` | `LM<n>` | `P1`–`P6` → `LM1`–`LM6` | 6 |
| `docs/raid-verification-spine-phasemap.spec` | `P<n>` | `VS<n>` | `P1`–`P7` → `VS1`–`VS7` | 7 |
| `docs/raid-warp-verification-phasemap.spec` | `P<n>` | `WV<n>` | `P1`–`P11` → `WV1`–`WV11` | 11 |
| `docs/copilot-autonomous-phasemap.spec` | `CA<n>` | `AU<n>` | `CA1`–`CA7` → `AU1`–`AU7` | 7 |
| `docs/snapshot-trigger-phasemap.spec` | `SS<n>` | `SN<n>` | `SS1`–`SS2` → `SN1`–`SN2` | 2 |

Unchanged, already unique: `AM1-AM10` (agent-model-and-user-continuity), 
`AP1-AP5` (agent-intelligence-loop), `CA1-CA7` (copilot-awareness-routing), 
`LP1-LP3` (loom-phasemap-section), `NC1-NC7` (ncp-agent-connection), 
`OB1-OB11` (observability-tablet), `R0-R10` (repair-contract-and-loom-hub), 
`RR1-RR7` (raid-routing-fidelity), `SB1-SB9` (self-build-pipeline), 
`SS0-SS7` (system-standardization), `UM1-UM4` (cortex-schema-registry).

## Reading historical references

Git history, code comments, and `lib/version.js` release notes written before
2026-08-14 use the OLD ids and were **deliberately not rewritten** — commit messages
cannot be, and rewriting a code comment's historical account of what happened would
be falsifying a record to match a rename. Use the table above to resolve them.

Resolution requires knowing which map a reference meant. Where the commit or comment
does not name the map, it may be genuinely ambiguous — that ambiguity is the thing
being fixed going forward, and it cannot be retroactively removed from the past.

## Not fixed here

`loom/scanners/phasemap-map.js` matches a phase declaration by INDENTATION and a
trailing underscore, with no check that the line sits under `phases:`. So
`copilot-omniscience-phasemap.spec`'s `corrections_2026_08_14:` block, whose one
entry is `OM4_gate_never_actually_verified:`, parses as a 166th phase — a pending
phase with no gate that does not exist. This is the same class as the scanner's own
§BUGFIX 2026-08-08 (bare `CA5:`/`CA6:` drift-dict keys parsed as phases); the
underscore heuristic added then narrowed it without closing it. Verified live:
`loadAll()` returns 166 phases against 165 real declarations. Left alone — it is a
scanner change, not an id change, and it was true before this migration too.
