# Archived 2026-09-10 — stale, session-dated docs consolidated from project root

Twelve files `git mv`'d from the project root — the move the root
`README.md` and `CHANGELOG.md` banners referenced but hadn't actually
done yet. Every candidate was checked for live references before
moving, same discipline as `_archive/superseded-docs-2026-09-10/`
(the `docs/` overview-doc pass, same session): a reference in another
file's comment, JSON description, or prose citation was left as-is if
it was historical/explanatory (nothing reads the referenced file by
path at runtime); anything that looked like it might be a functional
pointer was opened and checked directly, not assumed either way.

| File | Why archived |
|---|---|
| `HANDOFF-2026-07-11.md` | Session handoff, 2026-07-11→12, system v0.9.11→0.9.12. Cited once, in `CHANGELOG.md` — a frozen historical narrative line ("Full session handoff written: ..."), accurate at the time, left as-is. |
| `HANDOFF-2026-08-24.md` | Session handoff, 2026-08-24. Zero references found anywhere. |
| `SESSION-MANIFEST-2026-07-07.md` | Session manifest, 2026-07-07, describing that session's two specific changes. Zero references found. |
| `CLEAR-GLASS-CAPABILITY-BREAKDOWN-2026-08-23.md` | Capability breakdown/mining report, 2026-08-23. Five references, all docblock comments or plugin `manifest.json` descriptions in `clear-glass/` citing it as the source of a design decision (e.g. `clear-glass/plugins/captcha-pause/manifest.json`) — explanatory provenance, not a functional load; none `require()` or read the file. |
| `GUARDIAN-ARCHIVE-MINING-2026-08-23.md` | Archive-mining report, 2026-08-23. Three references, same pattern as above — `clear-glass/plugins/guardian-listeners/` docblocks and manifest citing it as the source report for a ported feature. Explanatory, left as-is. |
| `ARCHITECTURE-BRAINSTORM-SYNTHESIS-2026-08-25.md` | Prior architecture brainstorm synthesis, 2026-08-25 — superseded by the 2026-09-10 synthesis now at project root. Zero references found. |
| `PATCH-NOTES.md` | "NEXUS-080 — patch notes (this integration pass)" — one specific pass's patch notes. One reference: `docs/SYSTEM-MAP.md` lists it as a doc-type example in a convention description, not a functional pointer. |
| `CONSOLIDATION-NOTES.md` | Notes from consolidating two specific zip exports (`nexus-v4-complete` + `nexus-copilot-complete-1`) into one tree — a one-time merge record. Zero references found. |
| `VERIFICATION-LOG.md` | "as of commit `5fe2294`" point-in-time verification checklist, 2026-07-14. One reference: `scripts/run-verification-manifest.cjs`'s header comment calls itself "the machine-readable half of VERIFICATION-LOG.md" — a conceptual pairing in a comment, not a path the script actually opens (confirmed: no `require`/`readFile` of the filename anywhere in that script). |
| `MANIFEST.md` | "NEXUS v0.9.9 — Complete Project Package" — a whole-tree package manifest from a specific export, long superseded by current v0.39.75. Four references, all docblock comments in `guardian/lib/` citing it as where "not-yet-done work" was tracked at the time — explanatory, left as-is. |
| `TUTORIAL.md` | End-to-end onboarding tutorial. Zero references found, and confirmed stale on read: walks through booting `Bridge` (retired 2026-09-06) as a live, expected component and references a `.nex` file format not used by any current convention in this tree. |
| `CONFIRM-BUILD.md` | "Confirm the build — 2 minutes," a specific 12-point verification note from one pass. `scripts/confirm-build.mjs`, the script it names, still exists and still runs — but the note itself is a one-time confirmation snapshot, not living documentation, same genre as `VERIFICATION-LOG.md`. |

**Deliberately NOT moved, despite being root-level and older than most
of the above — checked individually, not swept in by vintage alone:**

- `CHANGELOG-SESSION.md` — looks like a candidate by name, but it's a
  live, still-growing append target: `skills/nexus-session-changelog/
  SKILL.md` documents it as one of the two real destinations session
  entries get appended to (alongside `CHANGELOG.md`), and its own tail
  content reads as current, not archival.
- `SYSTEM-MAP.md` (root) — self-declared `Status: Living document —
  append-only, never delete` in its own header. Its `docs/SYSTEM-MAP.md`
  counterpart makes the same "Active — updated every session" claim.
  Neither carries a superseded banner despite one being referenced
  elsewhere as if it might; not touched on the strength of a header
  that says exactly the opposite of stale.
- `SESSION-PROTOCOL.md` — reads as a standing workflow protocol
  ("commit real increments," "export `.git` with the code, not just
  the working tree" — the exact discipline this cleanup pass itself
  followed), not a dated report. Left live rather than archived on the
  strength of its age alone.

**Count note:** the root `README.md`/`CHANGELOG.md` banners both say
"fourteen." This pass found twelve that were safe to move and three
with real reasons to stay (above) — twelve is what's reflected here.
Whether the original count included one or two files no longer present
in this tree, or counted differently, wasn't independently
re-derivable from what's on disk; left as an honest discrepancy rather
than forced to match.
