# What's in this zip

Read `_reference/NEXUS-PHASE-MAP-CROSSREF.md` first — it explains why each
file here is here and what phase it targets. Short version:

- `phase-27-30-109-epistemic-branch-runtime/` — the full rfr2 nexus v6.0.0
  package (minus forge/gui/loader, already redundant). Internally
  interdependent (clip needs context needs kernel needs identity/time/delta),
  so it's bundled whole rather than cherry-picked. Targets Phase 27 (System
  State VM), Phase 30 (Time-Travel Debugging), Phase 109 (Epistemic Branch
  Runtime — your own roadmap calls this "the big one").
- `phase-95-enforcement/` — RuntimeGuard + 25-invariant BoundaryIndex.
  Targets Phase 95 / OL-17 (RAID doesn't validate against axioms).
- `phase-99-query-cql/` — causal query language, two versions (v6 from rfr2,
  standalone v5 for comparison). Targets Phase 99 / OL-14 (/api/field/* —
  NEXUS's own causal-graph terminology, not human-relationship data, see
  crossref doc for the naming-collision warning).
- `phase-105-integrity-delta/` — identity (3-axis dedup) + delta (typed
  deltas), two versions each for comparison. Targets Phase 105.
- `_reference/` — both map docs plus the original Causal-Nexus v5.0.0 spec
  docx, which states outright that Causal Nexus is meant to be consumed,
  not merged in wholesale — worth reading before wiring anything below in.

None of this is wired into nexus-complete yet. It's the source material,
organized by the phase it targets, ready for review/adaptation.
