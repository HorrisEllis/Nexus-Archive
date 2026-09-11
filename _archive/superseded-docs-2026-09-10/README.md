# Archived 2026-09-10 — docs/, monolithic overview docs, kept per §0.3

Eight docs moved here from `docs/` — the "separate, more careful pass" that
`_archive/superseded-docs-2026-08-09/README.md` explicitly deferred
(`docs/NEXUS-PHASE-MAP.md` was too large and too cross-referenced to
archive on a quick read at the time). Same rules applied: `git mv`'d
(history intact), every candidate checked for live references first — not
archived on filename/vintage appearance alone. This batch is `docs/`'s
monolithic, pre-per-system-phasemap-convention overview docs specifically —
the `docs/*-phasemap.spec` files (dozens, dated, each scoped to one system
or feature) are a *different*, still-current convention and were not
touched by this pass.

**One live functional reference found and fixed, not just a citation:**
`cli/session.js` (the `SESSION.md` renderer, live-run output) told every
user to "Read `docs/NEXUS-SPEC.md` for full system context" and
"Read `docs/AXIOMS-v1.0.md` for governing laws" — both stale (AXIOMS
governance moved to v3.1 per `CLAUDE.md` itself: "AXIOMS-v3.1 governs").
Updated in place to point at `CLAUDE.md`, `docs/nexus.spec`, and
`docs/AXIOMS-v3.1.md` — the actual current equivalents.

| File | Why archived | Where the real answer lives now |
|---|---|---|
| `NEXUS.md` | v2.0 "Complete System Documentation," post-build session, 484 lines. Predates the per-system spec convention. Cited only as historical prose in 2 other now-superseded docs and 1 spec. | `docs/nexus.spec`, per-system `docs/<system>.spec` files |
| `NEXUS-SPEC.md` | "Day 1 — First principles" living spec, 882 lines. The one live functional pointer to it (`cli/session.js`) was repointed above; its other 3 references were prose citations in now-also-archived docs (`NEXUS-SYSTEM.md`, `SESSION-CHANGELOG.md`) or the frozen `MANIFEST.json` (already self-marked superseded, left as-is — a frozen doc citing its own contemporaneous spec is accurate). | `docs/nexus.spec` |
| `NEXUS-SYSTEM.md` | v3.0.0 "Full System Document," 2026-06-11, 504 lines. Cited only from the now-also-archived `SESSION-CHANGELOG.md`. | `docs/nexus.spec` |
| `NEXUS-ENCYCLOPEDIA.md` | System v0.9.10-era "Complete Guide," 602 lines. Zero live references found. | per-system `docs/<system>.spec` files, `docs/HISTORY-BOOKSHELF.md` for lineage |
| `NEXUS-PLAIN-ENGLISH.md` | Explicitly "a companion to the full Encyclopedia" — archived alongside it since its subject moved. Zero live references. | needs a fresh plain-English companion if still wanted — real gap, not fabricated here |
| `NEXUS-PHASE-MAP.md` | The old monolithic phase map (1287-1315 lines, phases 0-125), explicitly deferred from the 2026-08-09 pass. Its own header claimed to be "the only living changelog/phase-map document" as of session 3 (2026-06-28) — since superseded by the dozens of dated `docs/*-phasemap.spec` files plus `docs/SPEC-REGISTRY.spec` as the living index. Referenced from `guardian/routes/settings.js` (docblock citation of "the smallest of the 67 real..." — historical, left as-is), `docs/META-SYSTEM-AND-SUBSYSTEM-SPECS.md` and `docs/copilot-migration-and-new-capabilities.spec` (both citing specific historical phase numbers — accurate at the time, left as-is), and `docs/SPEC-REGISTRY.spec`'s own narrative log of the 2026-08-09 pass (historical record of a past decision, left as-is — rewriting it would misrepresent what was true then). | `docs/SPEC-REGISTRY.spec` (the live index), per-system `docs/*-phasemap.spec` files |
| `NEXUS-PHASE-MAP-CROSSREF.md` | A 56-line audit cross-referencing the two docs above against then-current source trees (`kern-v2`, `Causal-Nexus.zip`, `rfr2`, `nexus-v0_53_1`) — same vintage, same fate. Referenced from `lib/consent.js` (docblock citation, historical, left as-is) and two other now-historical docs. | superseded, no successor needed — its subject (those two docs) is itself archived |
| `phase-map.spec` | Explicitly named "a dead, pre-v3.0-axiom ancestor (stops at phase 6, no AX-numbering)" by `docs/META-SYSTEM-AND-SUBSYSTEM-SPECS.md` itself, "superseded by `NEXUS-PHASE-MAP.md`" (also archived in this same pass). Checked against `loom/test/phasemap-map.test.js` before moving — that test's own comment already anticipates this file "may [no longer be] present" and asserts only a soft floor (`>= 13` maps), not an exact count naming this file; safe regardless. `loom/data/registry.json` has a live entry for it (`spec.docs.phase-map`) — that registry is explicitly not git-tracked and regenerates fresh from a real `loom/bootstrap.js` scan (confirmed via `_archive/root-docs-consolidated-2026-09-10/HANDOFF-2026-08-24.md`), so it will self-correct on next boot rather than dangling. | `docs/SPEC-REGISTRY.spec`, per-system `docs/*-phasemap.spec` files |

**Not touched, deliberately left for a separate pass:** the remaining
~180 files in `docs/` — the per-system `.spec` files, the dozens of dated
`*-phasemap.spec` files (a genuinely still-current, accumulating
convention, not loose docs), `AXIOMS-v1.0/2.0/3.0.md` (a real version
history, arguably worth its own archive-or-keep decision but not rushed
here), and `docs/SESSION-CHANGELOG.md` / `docs/SYSTEM-MAP.md` (both
already self-mark as superseded in-place with a banner and stayed in
`docs/` rather than `_archive/` in the 2026-08-09 pass — left consistent
with that precedent rather than re-decided here).
