spec:
  meta:
    name:        rfr2
    version:     1.0.0
    status:      written-from-live-code
    uuid:        nexus-rfr2-v1-0000-2026-0724-jamesbrooks-001
    axioms:      [§0.1, §3.3, §5.4, §6.3, §8.5, §17.1]
    written_because: >
      Found unspecced 2026-07-24 while auditing the ESM→CJS conversion
      (Job 1, commit 9cff74a) against §8.5 ("do not build anything
      without creating a spec file first") — the conversion landed
      before this existed, a real process violation. Written after the
      fact as a map of what already exists, not a design proposal.
    purpose: >
      "RFR2 Causal Toolkit" — 13 modules for identity, timing, querying
      (CQL), delta/bottleneck analysis, invariant enforcement, and
      version gating over causal event graphs. Entry point:
      meta/rfr2/index.js, a lazy-getter CJS barrel.

  file: meta/rfr2/index.js
  submodule_dir: meta/rfr2/<name>/index.js
  all_modules_at: "@version 5.0.0 (consistent across all 13 — verified, no drift, §5.4)"

  job_1_converted_2026_07_24:
    status: DONE — commit 9cff74a
    modules: [identity, lazy, time, observer, adapter-sandbox, query, enforcement, version-gate, delta]
    what: >
      Mechanical ESM→CJS: `export function/const/class` → single
      `module.exports = {...}` per file; `import{}from` → `require()`.
      No logic changed. 61 exports total, all verified present after
      conversion by exact count match against a pre-computed expected
      list, not just "it loaded."
    why_it_mattered: >
      meta/rfr2/index.js already had a CJS lazy-getter barrel
      (`get delta() { return require('./delta/index.js'); }` etc.) but
      it was SILENTLY BROKEN for every submodule before this — Node's
      require() throws on `export` syntax. The only thing that could
      ever load these 9 modules was lib/rfr2-bridge.js's async dynamic
      import(). Confirmed the bridge still works unchanged against the
      now-CJS files (Node's import() can load CJS) — no existing
      consumer (cortex/boot.js, cortex/intelligence/mastermind.js,
      hooks/cortex.hooks.js, meta/lattice/associative-lattice.js,
      lib/consent.js, lib/agent-tools/tools/query-intelligence.js)
      broke.
    functional_proof: >
      Not just syntax-verified. parseQuery("FIND events WHERE type =
      'gap.found'") produced a correct AST and computeDeltaStream() ran
      its real 4-argument signature (events, findById, edgeMeta,
      getChildren) through the converted files via plain require(), for
      the first time.
    pinned_by: tests/modules/test-rfr2-cjs.js (14 tests, registered in run-all.js)

  job_2_not_started:
    status: DECIDED, not yet executed
    decision_source: >
      Already decided by James, 2026-07-21, docs_out/nexus-full-audit.md
      Finding 2 — NOT an open question. My own first-draft entry here
      (2026-07-24, since corrected) wrongly said "decision not yet
      made." That was wrong — the audit had already resolved rfr2 vs
      causal-nexus as a §10.3 competing-truth case: same UUIDs on
      delta/observer/query/identity/clip/context/enforcement/lazy/time/
      version-gate/adapter-sandbox across both trees. Read by consumer
      count: rfr2 has 8 real consumers (cortex/boot, mastermind, hooks,
      lattice, agent-tools, rfr2-bridge — same list this spec's
      consumers_confirmed_live section already names); causal-nexus/
      modules has 2 (a loom scanner + nexus-healer). Decision: rfr2 is
      CANONICAL. Harvest what's missing from causal-nexus, then retire
      causal-nexus. Not decided here — just correctly recorded here for
      the first time.
    modules: [clip, compress, context]
    still_esm: true
    precise_scope_verified_2026_07_24: >
      The 2026-07-21 audit named "7 modules rfr2 dropped: causality,
      forge, kernel, ledger, persist, projection, sigma" as the harvest
      set. Checked directly against clip/compress/context's actual
      import statements (not assumed): the real blocking set is THREE
      modules — kernel, sigma, adapter — not seven, and NOT the same
      three the audit implies. `adapter` (imported by compress/index.js
      as `../adapter/index.js`) is absent from the audit's list
      entirely — a different module from `adapter-sandbox`, which rfr2
      already has, already converted, already working. Grepped every
      one of rfr2's 13 modules for causality/forge/ledger/persist/
      projection/loader (the audit's other 5 named modules, plus
      `loader`, a 6th real causal-nexus module the audit didn't name at
      all): zero references anywhere in rfr2. Those modules are real
      causal-nexus capability that nothing in rfr2 currently asks for —
      genuinely separate from what's blocking Job 2, not a discrepancy
      to paper over. Confirmed present in meta/causal-nexus/modules/:
      adapter, adapter-sandbox, causality, clip, compress, context,
      delta, enforcement, forge, identity, kernel, lazy, ledger, loader,
      observer, persist, projection, query, sigma, time, version-gate
      (21 total dirs + index.js).
    the_actual_remaining_work: >
      Harvest exactly 3 modules (kernel, sigma, adapter) from
      meta/causal-nexus/modules/ into meta/rfr2/, convert them to CJS
      alongside Job 1's 9 (check their module system first — not
      assumed to already be CJS), then convert clip/compress/context
      themselves. "Retire causal-nexus" is a SEPARATE, bigger decision
      not to fold into this — causal-nexus/modules holds 6 real modules
      (causality, forge, ledger, persist, projection, loader) with real
      UUIDs that nothing currently imports; retiring the tree loses
      that capability outright unless someone confirms it's genuinely
      dead weight first, not just unreferenced today. Flagged, not
      executed — the harvest-the-3 piece is a small, mechanical,
      low-risk next step; the retire-the-tree piece is not.

  barrel_index:
    file: meta/rfr2/index.js
    pattern: "lazy getters — get <name>() { return require('./<name>/index.js'); }"
    all_13_present: true
    live_consequence: >
      Accessing rfr2.clip, rfr2.compress, or rfr2.context today still
      throws (ESM export syntax under require()) — same failure mode
      Job 1 fixed for the other 9, just not yet addressed for these 3.

  consumers_confirmed_live:
    - "cortex/boot.js"
    - "cortex/intelligence/mastermind.js"
    - "hooks/cortex.hooks.js"
    - "meta/lattice/associative-lattice.js"
    - "lib/consent.js"
    - "lib/agent-tools/tools/query-intelligence.js"
    - "lib/rfr2-bridge.js — the async ESM bridge; still functional post-Job-1, now largely redundant for the 9 converted modules but not removed (§16.5 flagged, not acted on — removing it or migrating its callers to plain require() is a separate decision, not bundled into this spec)"
    - "tests/modules/mastermind-fractals.test.js — exercises rfr2-bridge → delta, one functional test (fractal pattern detection), not adversarial coverage"

  known_test_gap: >
    No module in rfr2 — converted or not — has §12.1-grade "brutal"
    adversarial coverage (hostile/malformed input, null/undefined,
    unicode, concurrent access, corrupted files). test-rfr2-cjs.js
    verifies the CONVERSION (loads, exports resolve, one real CQL parse,
    one real delta computation) but is not a substitute for that.
    Flagged, not built here — real scope, not bundled into this pass.
