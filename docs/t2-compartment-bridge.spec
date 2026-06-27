spec:
  meta:
    name:        t2-compartment-bridge
    version:     1.0.0
    foundation:  nexus-system-foundation@1.0.0
    uuid:        nexus-t2-compartment-bridge-v1-0000-2026-0627-jamesbrooks-001
    purpose: >
      Wires emerge/compiler/t2-gate.js's per-chunk build dispatch through
      the real compartment lifecycle (Phase 25) so every T2 chunk becomes
      a queryable, cross-project-reusable Case Library (Phase 46) entry
      instead of disappearing the moment one build finishes. Cortex holds
      it; any future project's build can query it before generating
      anything fresh. This is the torrent piece of the build pipeline:
      a chunk already built once is "already have it," not refetched.

  changelog:
    - version: 1.0.0
      date:    2026-06-27
      change: "First implementation. Closes a real, confirmed gap: t2-gate.js dispatched every chunk directly to guardian's /command route, bypassing compartment-engine entirely, so Case Library (real, working, Phase 46) never saw a single T2 chunk. Built bottom-up: (1) intent-classifier.classify() reused as-is to give each chunk a real domain/verb — no new classifier; (2) case-library.query() checked before any dispatch — 'full' tier reuses the stored result verbatim, zero Ollama cost; 'blocked' refuses to retry a known-failing pattern with a real reason, never a silent skip; (3) compartment-engine.spawn/execute/resolve wraps the existing SEAM dispatch logic as the executor — case-library indexing on PASS already fires automatically via the existing extension point, nothing new wired there. t2-gate.js's own version bumped 1.0.0 -> 1.1.0 to reflect the real capability change."
      evidence: "tests/modules/t2-compartment-bridge.test.js, 4/4 passing against real compartment-engine + case-library + adversary-suite + intent-classifier (only JAA and two crystal-lattice functions mocked, same isolation pattern as compartment-engine.test.js). Regression-checked: compartment-engine.test.js 23/23, tests/brutal.test.js 187/187 — both unchanged after this addition."

  core:
    reads:
      - "lib/intent-classifier.js — classify() — reused, not duplicated (§5.6)"
      - "lib/case-library.js — query() — checked before every dispatch"
      - "lib/compartment-engine.js — spawn(), execute(), STATUS"
    writes:
      - "Nothing directly — compartment-engine and case-library own their own tables. This module is a bridge, not a third store (§10.3)."

  contract:
    function: "buildChunk(node, parsedSpec, dispatchFn, opts) -> { ok, tier, reused, result, compartment, error }"
    tiers:
      full:     "real prior result reused verbatim, dispatchFn never called"
      skeleton: "past pattern exists, no surviving trace — seeded into working_memory, still dispatches"
      cold:     "never seen — dispatches fresh, same as before this phase existed"
      blocked:  "negative crystal hit — refuses to retry, returns a real reason, never silent"

  axioms:
    - "§1.1 — a 'full' tier hit only ever reuses content that already proved itself via a real PASS; never fabricated"
    - "§1.2 — every tier decision and every executor error reaches the caller; nothing swallowed"
    - "§5.6 — same structural intent-classification pattern every other NEXUS entry point already uses, not a new one for builds specifically"
    - "§5.7 — t2-gate.js stays unaware of compartment-engine or case-library directly; this module is the only thing that imports both on its behalf"
    - "§10.3 — does not become a sixth competing 'are these the same' mechanism; calls the one (Case Library) that already exists and already works"
    - "§12.1/§12.2 — test suite proves the actual claim (reuse skips dispatch, cold build doesn't) against real dependencies, not a trivially-passing mock"

  deps: "Phase 25 (compartment-engine) ✓ · Phase 45 (intent-classifier) ✓ · Phase 46 (case-library) ✓ · Phase 26 (adversary-suite/crystals) ✓"
  unlocks: "Cross-project component reuse for any future spec-to-repo build; the resumability half of the torrent-build idea (S6/S7 in the roadmap's session-findings tier)"
