spec:
  meta:
    name:        diagnostic-engine
    version:     0.2.0
    status:      BUILT v0.2.0 (real v1) — 2026-08-15. See docs/session-2026-08-14-and-15-living-schema-phasemap.spec, LS2.
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
    open_questions_RESOLVED_2026_08_15:
      - "In cortex or own boot phase? RESOLVED: neither — built as a plain lib/ module with no process of its own, deliberately not pre-deciding LS4 (still HOLD)."
      - "Confidence decay? RESOLVED: exact reuse of user-model.js's proven numbers (initial 0.5, +0.10 confirm, -0.10/day decay toward 0), plus one real addition — a VIOLATION costs -0.15, asymmetric and sharper than a confirm, since a broken expectation is stronger evidence than an unconfirmed one."
      - "Who writes the initial expectation set? RESOLVED, and corrected mid-build: generated from loom's real graph as planned, but from hooks/wires, not produces/consumes — checked live, 0 of 1501 real components had those fields populated, ever. 1803 real expectations generated from 1804 real hooks."
      - "§CORRECTION found by testing, not assumed: this spec's own line above ('this spec's only job is to become fault_taxonomy's first real writer') was imprecise. lib/fault-log.js's logFault() writes unconditionally to the real fault_log table (confirmed: real rows exist now) but only additionally reaches fault_taxonomy if given one of KNOWN_FAULT_CLASSES' 8 closed values. 'expectation-violation' isn't one of them — extending that taxonomy is a real, separate decision, not made unilaterally here. This build's honest, verified accomplishment is fault_log's first real writer from this module, not fault_taxonomy's."

  honest_risks:
    - "A schema that goes stale silently is worse than no schema at all — this is the LS2 risk this system exists to manage FOR OTHER systems; it must not be exempt from the same discipline about itself."
    - "This spec's own confidence/decay design is explicitly unfinished — see open_questions. Do not build LS2 from this spec alone; it needs its own dedicated design pass first, same as the parent phasemap already says."
