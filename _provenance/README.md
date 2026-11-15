# Nexus Archive — provenance of this history

This repository was reconstructed on 2026-11-14 from 938 zip archives of Nexus saved between 2026-05-28 and 2026-10-30. Each unique archive became one commit, in the order the builds were made. The original archives were not altered, only renamed.

## What is here

| File | What it holds |
|---|---|
| `MANIFEST.csv` | Every original file: original name, new name, SHA-256, size, dates, version, kind, commit, tag. |
| `VERSIONS.md` | The shelf: one row per version, oldest first, linking to its changelog and ledger. |
| `changelogs/CHANGELOG-<version>.md` | One per version: the build's own release notes copied unchanged, then a ledger of every archive filed under that version with its source, hash, and file changes. |
| `ledger/LEDGER-<version>.csv` | Every file added, modified or deleted in that version, with blob ids. |
| `CHANGELOG.md` | Every snapshot in order, grouped by version, with files added / modified / deleted and the systems touched. |
| `DIFFMAP.csv` | The same diff counts as a table, one row per commit. |
| `DECISIONS.md` | Decisions: the ones behind this reconstruction, decision documents by first appearance, and decision sections from release notes. |
| `IDEAS.md` | Roadmaps, proposals and "next / deferred / not built" notes by first appearance. |
| `EXCLUSIONS.md` | What was left out of git or redacted, and where. |
| `rename-map.csv`, `undo-rename.ps1` | The archive rename and how to reverse it. |
| `tools/` | The scripts that built all of this. |

## Where the archives are on disk

The zips are not in git. On the machine that built this they sit beside the repository under `archives/`, one folder per declared version series (`v0.39/`, `v0.60/` …), with `unversioned/`, `_duplicates/` (byte-identical copies) and `_empty/` (empty or `.git`-only archives). The `folder` column of `MANIFEST.csv` gives each file's place; `undo-rename.ps1` moves and renames everything back.

## Numbers

- 938 archives, 792 unique by SHA-256 (146 byte-identical copies).
- 698 full builds and 53 patch overlays on `main` (751 commits); 16 side bundles on `artifacts`.
- 10 archives had a tree identical to the snapshot before them, 13 were empty and 2 held only a `.git` directory. None of these has a commit; all are in the manifest.
- 288 versions, from 0.0.1 (2026-05-28) to 0.60.320 (2026-10-30).

## How to read the history

- **Branches.** `main` is the line of builds, oldest first, with this `_provenance` folder added by the last commit. `artifacts` holds the side bundles, each in its own folder.
- **Versions.** Every build sits on one line that only goes up, from 0.0.1 to 0.60.320. Several builds of one version are `-r1`, `-r2` … in build order. DECISIONS.md says how the line was made and what happened to builds whose own number went backwards.
- **Tags.** `snap-NNNN` marks every committed snapshot. `vX.Y.Z` marks the last build of each version and carries a short note.
- **Where it meets the Nexus repository.** `HorrisEllis/Nexus` begins on 2026-09-26 with "Import Nexus v0.39.258 source", which matches `snap-0680` here. The 680 builds before that are Nexus's pre-history; the 112 after it overlap commits Nexus already has.
- **Dates.** Author and committer dates are the content date of the archive, so `git log` reads as the real timeline.
- **Commit trailers.** Each commit names its source: `Source-Archive`, `Renamed-To`, `Source-SHA256`, `Archive-Mtime`, `Content-Date`, `Version-Internal`, `Version-Filename`, `Duplicate-Archive`, and what was excluded or redacted.
- **Diffs.** `git diff snap-0411 snap-0412` is the exact difference between two builds. `DIFFMAP.csv` has the counts.

## How to verify a commit

1. Find the snapshot in `MANIFEST.csv` and take its `sha256` and `new_name`.
2. Hash the archive (`Get-FileHash <new_name> -Algorithm SHA256`) and compare.
3. Unzip it, drop `node_modules`, `.git` and files of 50 MB or more, strip the wrapper folder named in the commit's `Archive-Root` trailer, and compare with `git checkout snap-NNNN`. Files listed under that snapshot or an earlier one in `EXCLUSIONS.md` will differ by their redactions.

## Limits

- **Order between parallel sessions is by timestamp.** Where two sessions worked at once, their builds interleave on `main`, and some diffs show work appearing, vanishing and returning. The archives themselves say nothing about which build descended from which.
- **Patch overlays are applied to whatever was current.** A patch made against an older build is still laid over the snapshot before it in time.
- **Runtime data is in the tree.** Ledgers, memory indexes and logs that were inside the archives are in the history. Keep the repository private unless they are filtered out.
- **Titles and quotes** are copied from each build's own `CHANGELOG-<version>.md`, and the per-version changelogs copy those notes whole. Builds without one have a ledger only.
- **Decisions and ideas are harvested, not judged.** Sections were picked by heading (decision, why, next, deferred, not built …) from release notes and handoffs when each file first appeared.
