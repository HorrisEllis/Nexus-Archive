# Archived 2026-08-09 — superseded docs, kept per §0.3

Eleven docs moved here from `docs/` in a cleanup pass. None deleted — every
one is preserved verbatim, `git mv`'d (history intact), per §0.3 ("archive
with a stated reason, don't delete") and the same conservative pattern the
existing `_archive/duplicate-docs/` folder already used.

**How this list was built:** every candidate was checked for live references
(code, other docs, `docs/SPEC-REGISTRY.md`) before being moved — not archived
on filename appearance alone. `docs/PHASE-MAP-TEMP.md` was on the initial
"looks stale" list purely from its name and was **not** archived: a real test
(`tests/modules/test-health-authority.js`, HA-008) reads it and asserts it
still contains a specific historical correction record. A misleading name
isn't evidence of being safe to move.

Two live-code docblock comments (`lib/agent-tools/tools/run-closed-loop.js`,
`ui/tv-shell/tutorial/tutorial.js`) referenced files on this list — both
updated to point here instead of leaving a dangling path. One live doc
(`docs/NEXUS-PHASE-MAP.md`) had a prose reference, also updated. Historical
citations in `CHANGELOG.md` and `docs/AXIOMS-PHASE-MAP.md` were **left
untouched** — a changelog entry describing where a file was *at the time*
is an accurate historical record, not a stale link, and rewriting it would
violate §0.3's "corrections extend, never overwrite" itself.

| File | Why archived |
|---|---|
| `AXIOMS-v3.1-superseded-2026-07-19.md` | Named superseded by its own author; the current AXIOMS v3.1 is `docs/AXIOMS-v3.1.md`-equivalent (uploaded fresh 2026-08-08). |
| `nexus-tablet-v0.1.0-superseded.spec` | Named superseded; successor is `docs/nexus-tablet.spec`, which still points back at this one intentionally — that reference is fine left as-is (a current doc citing its own predecessor). |
| `NEXUS-VISION-SPEC-2026-07-06.md` | Self-described as "draft for review, not a build log." Superseded by the per-system `*-phasemap.spec` files this repo now uses. |
| `NEXUS-STATE-SPEC-2026-07-06.md` | Self-described as a point-in-time snapshot ("what's actually true right now") with its own stated expectation of going stale: "if a per-system spec and this doc disagree, one of them is wrong." It disagreed; the per-system specs won, as designed. |
| `NEXUS-PIPELINE-SPEC-2026-07-07.md` | Zero live references; content superseded by later pipeline work. |
| `NEXUS-REMAINING-WORK-2026-07-09.md` | Zero live references; a work-tracking snapshot, superseded by the living phasemaps. |
| `NEXUS-COPILOT-ROADMAP-2026-07-10.md` | Zero live references; superseded by `docs/copilot-*-phasemap.spec` and `docs/nexus-live-mind-phasemap.spec`. |
| `NEXUS-CLOSED-LOOP-MAP-2026-07-10.md` | Referenced only from a docblock comment (updated), superseded by the per-feature phasemap convention. |
| `NEXUS-EXPANSION-MAP-2026-07-06.md` | Referenced only from a docblock comment (updated), superseded the same way. |
| `SESSION-2026-06-24.md` | An early session log — transient by nature, referenced only as historical citation elsewhere (left untouched, see above). |
| `SOVEREIGN-SPEC-AUDIT-2026-06-28.md` | A point-in-time audit; referenced once from `docs/NEXUS-PHASE-MAP.md` (updated to point here). |

**Not touched, deliberately left for a separate pass:** `docs/NEXUS-PHASE-MAP.md`
itself (the old monolithic phase map, phases 0-125, last touched 2026-07-19) —
referenced by three other docs and large enough (1287 lines) to warrant its
own careful read rather than a quick archive-on-suspicion in this pass.
