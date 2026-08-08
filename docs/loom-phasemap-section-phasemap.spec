spec:
  meta:
    name:        loom-phasemap-section
    version:     0.1.0-phasemap
    status:      PHASEMAP 2026-08-08. Mapped (ask #1); ask #2 built same turn.
    uuid:        nexus-loom-phasemap-section-v0-0000-2026-0808-001
    author:      James Brooks
    intent: >
      Consolidate ALL phasemaps in NEXUS (13 docs/*phasemap*.spec + James's
      consolidated HTML of 141 entries) into one model, split the phases by the
      SYSTEM/FEATURE they belong to, and add it as an entire SECTION in loom — so
      loom (the self-awareness layer) knows not just what the system IS, but what
      it is BECOMING (its roadmap), per system.

  the_two_asks:
    ask1_this_spec: "consolidate phasemaps → split by system → loom section (MAPPED here)."
    ask2_built:     "integrity hashes + sigma + replay revert loop — BUILT this turn as lib/integrity-revert.js."

  existing_phasemaps:   # 13 in the tree, to consolidate
    - agent-intelligence-loop · copilot-awareness-routing · copilot-omniscience
    - cortex-schema-registry · diagnostic-phase-map · gemini-multiagent-coding
    - nexus-live-mind · nexus-observability-tablet · phase-map · raid-routing-fidelity
    - raid-verification-spine · raid-warp-verification · snapshot-trigger
    plus James's nexus-phase-map-consolidated.html (141 entries across all sources).

  substrate:   # §8.6 — loom already scans specs
    - "loom/scanners/spec-map.js — scans docs/*.spec, checks against capability/source. The MODEL for a phasemap scanner."
    - "loom/maps/ — observability-map, warp-map. A phasemap-map joins these."
    - "docs/SPEC-REGISTRY.md — the registry every spec is listed in."

  phases:
    LP1_phasemap_scanner:   # ← DONE 2026-08-08. loom/scanners/phasemap-map.js — 95 phases across 15 maps, tagged by system.
      does: "loom/scanners/phasemap-map.js — read every docs/*phasemap*.spec, extract phases (id, does, gate, status done/pending, depends_on), tag each with its SYSTEM (cortex/guardian/raid/copilot/loom/clear-glass/gemini-agents/...) parsed from the phase content + reuse lines."
      reuse: "spec-map scanner pattern."
      gate:  "the scanner returns every phase across all 13 maps, each tagged with its system + done/pending status."
    LP2_split_by_system:   # ← DONE 2026-08-08. bySystem grouping + forSystem() roadmap.
      depends_on: LP1
      does: "group the consolidated phases by system/feature — so 'what is cortex becoming', 'what is raid becoming', etc. is answerable."
      gate:  "phases grouped by system; each system's roadmap (done + pending) is listable."
    LP3_loom_section:
      depends_on: LP2
      does: "add it as a SECTION in loom: a loom/maps/phasemap-map.js + a loom UI/API surface so the roadmap-per-system is part of loom's self-model alongside components + specs."
      gate:  "loom exposes the per-system phasemap section; clicking/querying a system shows its roadmap."

  first_build: "LP1 — the phasemap scanner. Reads all 13 maps, tags by system."

---
## LP1+LP2 COMPLETE 2026-08-08 — the phasemap section is in loom
loom/scanners/phasemap-map.js reads all 15 docs/*phasemap*.spec, extracts every
phase (id, status done/pending/in-progress, depends_on), and tags each by the
SYSTEM it concerns. loom now knows what each system is BECOMING, not just what it
is: 95 phases across 15 maps, 19 systems, 48 done / 45 pending. loadAll() +
forSystem(sys) + summary(). In loom's graph alongside capability-map + spec-map.
5 tests. REMAINING: LP3 — a loom UI/API surface for the section (the scanner + data
layer is done; this is presentation).