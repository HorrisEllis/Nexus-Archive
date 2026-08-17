spec:
  name: ls3-direct-test
  uuid: 0cfd7481-9b5e-44b6-82bf-3496a0ec97a5
  version: 0.1.0
  type: system
  phase: 40
  status: complete
  agent: ollama
  completed_at: 2026-08-17T03:52:43.851Z

# document — meta

<!-- imported: document → meta -->

spec:
  meta:
    name:        diagnostic-engine
    version:     0.1.0
    status:      PROPOSED — not built. See docs/session-2026-08-14-and-15-living-schema-phasemap.spec, LS2.
    foundation:  nexus-system-foundation@1.0.0
    port:        null  # undecided — see LS4's own open question: does this run
                        # as its own boot-phase system, or stay a cortex substrate?
    uuid:        nexus-diagnostic-engine-v0-1-0-0000-2026-0815-jamesbrooks-001
    purpose: >
      A living, per-system schema of what each real system is supposed to
      do end-to-end — {produces, consumes, healthSignal, expectedLatency}
      per expectation — with a confidence value on each expectation that
      intelligence's already-real lift-adjusted scoring adjusts from real
      outcomes, not a hand-tuned or second statistics engine. Exists so a
      diagnosis can name a SPECIFIC expectation violation instead of a
      generic error string, and so fault_taxonomy — real, schema'd, and
      still zero rows as of this spec's writing — finally has a real writer.


---

# document — core

<!-- imported: document → core -->


  core:
    schemas:
      - SystemExpectation: "{ uuid, system, kind: produces|consumes|healthSignal|latency, statement, confidence, lastCheckedAt, lastOutcome }"
      - ExpectationViolation: "{ uuid, expectationUuid, system, observed, expected, severity, ts }"
        # Written to the REAL fault_taxonomy table — not a new table. §8.6
        # reuse before build: fault_taxonomy's schema and write authority
        # (lib/fault-log.js) already exist; this spec's only job is to
        # become fault_taxonomy's first real writer, not to build a second
        # one next to it.
    axioms:
      - "§1.1 Nothing Exists Until Proven — an expectation with confidence 0 is honestly unproven, not silently assumed true."
      - "§1.2 Nothing Pretends to Work, Nothing Silently Fails — an expectation violation is a first-class written row, never a swallowed exception."
      - "§2.3 All State Must Be Observable — every expectation's current confidence must be queryable, not buried in a running process's memory."
    depends_on_real:
      - "cortex/intelligence/index.js's _scanMetaPatterns (lift-adjusted scoring, meta_noise_source detection) — the confidence-update mechanism this spec reuses, does not reinvent."
      - "lib/fault-log.js — real write authority for fault_taxonomy, currently zero real writers into it."
      - "lib/tool-index.js — same shape precedent: a real schema+writer pair (register/record) that sat with zero callers for the tool-usage signal until this session's own AB1 fix. This spec is explicitly the SAME failure mode not being allowed to happen twice."
      - >
        §CORRECTION 2026-08-15 — lib/diagnostic-engines.js (docs/diagnostic-
        engines.spec, v1.0.0, real, 631 lines, built 2026-06-15 — WEEKS
        before this spec's first draft) was not checked before this spec
        was originally written. Not a duplicate on inspection: its 12
        methods (causalChainTrace, scanInvariants, circuitBreakerAnalysis,
        cascadePrediction, homeostasisScore, crossSystemCorrelation, etc.)
        take generic {events, systemStates} and analyze them — they are the
        ANALYSIS layer. This spec's SystemExpectation schema is the missing
        layer ABOVE that: what should be true per system, so those 12 real
        methods have a structured expectation to check events against
        instead of only raw pattern-mining. LS2 should call INTO
        diagnostic-engines.js, not build a second analysis layer beside it.
        Separately, real and worth its own small fix regardless of LS2's
        fate: lib/diagnostic-engines.js has ZERO agent-tool coverage right
        now (checked lib/agent-tools/, zero hits) — 631 lines of real,
        already-built diagnostic methods no agent can currently call.
    open_questions:
      - "Does this run inside cortex (like intelligence/RAID do today) or as its own boot-phase system? Same undecided question as LS4 — this spec deliberately does not answer it, per §3.3 map before build."
      - "How does an expectation's confidence DECAY when unchecked for a long time, versus when actively disconfirmed? Named as an honest_risk in the parent phasemap (LS2), not yet designed here."
      - "Who writes the INITIAL expectation set per system — hand-authored per system (like this spec is hand-authored), or generated from loom's already-real component/wire graph (nexus_map's real data)? Generating from loom is the more §8.6-aligned answer but is not decided here."


---

# document — honest_risks

<!-- imported: document → honest_risks -->


  honest_risks:
    - "A schema that goes stale silently is worse than no schema at all — this is the LS2 risk this system exists to manage FOR OTHER systems; it must not be exempt from the same discipline about itself."
    - "This spec's own confidence/decay design is explicitly unfinished — see open_questions. Do not build LS2 from this spec alone; it needs its own dedicated design pass first, same as the parent phasemap already says."
