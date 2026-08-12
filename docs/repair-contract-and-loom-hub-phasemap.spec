spec:
  meta:
    name:        repair-contract-and-loom-hub
    version:     0.1.0-phasemap
    status:      PHASEMAP 2026-08-12. Mapped, not built. §3.3 — map before build.
    uuid:        nexus-repair-loom-hub-v0-0000-2026-0812-001
    author:      James Brooks
    intent: >
      NEXUS debugs and repairs itself: a detected gap gets a real repair
      contract (what was requested, what was received, what the friction is
      and why, every system involved, resource-manager state, code location,
      the error, enriched by the intelligence system and lifeline if needed),
      attempted through the existing verified spine, never applied without
      passing. And loom becomes what it was meant to be — the one hub that
      actually knows the map, the history, and the state of every other
      piece, instead of a registry sitting next to five other real systems
      it has never once queried.

  MAJOR_8.6_FINDING:
    - "copilot/repair-on-prompt.js — diagnose → raid.verify (P7 spine: constitution → isolate → sigma/drift → compare → rewind-on-fail) → apply ONLY on pass. Correctly designed, dependency-injected, REAL. Referenced by nothing but its own test. Zero production callers."
    - "lib/component-ledger.js — per-component, per-system, physically-partitioned ledger files + a queryable component_ledger table (15,472 real rows, 12+ real systems, a month of history) + wired to the pattern engine. James's own spec, already built. loom/*.js has ZERO references to it."
    - "lib/gap-field.js — the unified detect layer, 6 producers, real, tested, wired into loom (/api/gaps) THIS session."
    - "lib/diagnostic-causal.js + cortex/intelligence/relational-field.js — the causal 'why' layer, RFR2 causality.traceToRoot + sigma.classify, real, tested."
    - "lib/resource-monitor.js — sample()/classify() for real CPU/memory pressure state. Real, already used by autopilot's own health loop."
    - "loom's own registry (driver.registry.graph()) — the exact node/edge hierarchy James described wanting to visualize (NEXUS → 12 systems → 1372 components → 1712 hooks → 1341 wires) already exists as live, queryable data."
    - "GAP, confirmed missing not just disconnected: cortex/snapshot/index.js — create/rollback/verifySnapshotIntegrity/checkChainIntegrity. Never built. Breaks 3 real tests (snapshot-integrity, compartment-engine, autonomous-loop). repair-on-prompt.js's own header assumes a real snapshotId exists for rewind-on-fail — this is a BLOCKING prerequisite, not a nice-to-have."
    - "DATA QUALITY: a batch of component_ledger rows have a session/branch id ('bl7-<timestamp>') in the systemId field instead of a real system name — found while checking ledger coverage, not yet fixed."
    - "lib/schema-registry.js — CONFIRMED ALREADY REAL, James's 'make sure schemas are persistent' is already true. Schemas live as EDITABLE rows in cortex's real 'schemas' table (7 rows confirmed live), fluid not rigid — deviation recorded as drift, never blocks a write. docs/cortex-schema-registry-phasemap.spec P1-P3 already done. Nothing to build here."
    - "cortex/self-heal/fault-taxonomy.js — REAL, a real fault_taxonomy cortex table, real friction thresholds, six real readers already. But /tension's own require('../cortex/healer/index') points at a directory that never existed, and scoreTension() is genuinely undefined under EITHER name, verified by direct search — not a rename-drift bug like gap-finder's was, the function was called speculatively and never built. See R7."
    - "ui/tv-shell/nerve/nerve.js + ui/tv-shell/spotlight/spotlight.js — BOTH REAL, both already sovereign/HTTP-callable/hotswap-consistent, neither invented this session. Spotlight's Spotlight.navigate()/execute() IS already 'co-pilot navigates the UI with the user' — built, not proposed."
    - "clear-glass/src/diagnostic/error-capture.js — REAL, catches renderer-process (dev console) errors via IPC, real file log, live SSE push. Zero references to gap-field/jaaDB/cortex anywhere in the file — genuinely isolated, every error it's ever caught has stayed local. See R8."
    - "no UI design philosophy document exists anywhere in docs/ — genuinely absent, not just disconnected. See R9."
    So this whole phasemap is composition, not invention, with exactly one real gap at the bottom of the dependency chain (R2). Everything else is wiring loom to systems that already exist and are already correct.

  governing_axioms:
    - "§3.3 map first, this file. §8.6 compose repair-on-prompt + component-ledger + gap-field + diagnostic-causal + loom's registry — build nothing that already exists correctly."
    - "§1.1 nothing exists until proven — a repair is applied only after it passes the real verify spine, never on diagnosis alone."
    - "§2.1 no mutation before pass — R2 (real snapshots) must exist before R3 (autonomous repair) is trusted, because the verify spine's rewind-on-fail has always assumed a real snapshotId and never had one."
    - "§0.3 information must never be lost — the repair contract and loom hub both ADD visibility onto real history, never replace or discard it."
    - "§RAID governs every repair attempt — no exception for autonomous triggers vs prompted ones."

  build_convention:   # James 2026-08-12 — applies to EVERY phase below, not a new rule, an existing one made explicit
    order: "JS backend first -> CLI -> API -> relevant config files -> cortex persistence -> THEN the UI. Never UI-first."
    ui_contract: >
      Not new architecture — contracts/nexus-interaction-contract.js's own
      axiom, already real: "CLI = UI = API — same commands, same shapes,
      same ports." Any UI built in R5/R6 reads this contract rather than
      declaring its own shape.
    handshake: >
      TWO real things with this name, checked so they aren't conflated.
      orchestrator/lib/contract-handshake.js is REAL and BUILT — boot-time,
      "is this system's declared API contract actually reachable" (trust
      states UNVERIFIED/VERIFIED/DEGRADED/MISMATCH/UNREACHABLE). docs/
      handshake-ledger.spec is SPEC ONLY, unchanged since 2026-07-20 (found
      earlier this same session too) — PER-HANDOFF signed receipts, "did
      THIS data handoff between two systems actually succeed," not boot-
      time. James's "handshake verification for handoffs" means the second
      one — still unbuilt, a real dependency any R3/R4 handoff-heavy work
      should use once it exists, not invent a third mechanism for.
    status_indicators: "every UI panel shows real state, not assumed state — same discipline as gap-field's honest '?' in the rewind UI screenshot, never a fake success."
    hotswap: "hotswap: true is already a standard field in every system's own .spec (checked: cortex.spec, idearium.spec, guardian.spec, orchestrator.spec all declare it) — not new, a real existing requirement any R5/R6 UI panel must declare like every other panel does."
    persistence: "cortex, not files-only — a phase's real state lives in a jaaDB table, the .spec file is the human-authored intent, not the live record (see R0 below, which is this principle applied to the phasemap system itself)."

  repair_contract_schema:   # James's own spec, verbatim structure, not yet built
    requested: "what was asked for — the original prompt/trigger/intent that led here"
    received:  "what actually happened — the real output, or the real failure"
    friction:  "what the friction/gap actually is (reuses gap-field's type+body+severity)"
    why:       "the causal explanation — sourced from diagnostic-causal.explainFinding() / relational-field's RFR2 trace, not re-derived"
    systems_involved: "every system that touched this request, not just gap-field's single `source` — a list, ordered"
    resource_state:   "lib/resource-monitor.sample()+classify() AT THE TIME of the failure — cpu/mem/pressure, real numbers, not estimated after the fact"
    location:  "file + line, when known — from the error stack or the causal trace's origin"
    error:     "the real error text/stack, structured, not folded into a prose body string"
    enrichment: "OPTIONAL — if the above isn't enough to diagnose, the intelligence system (RFR2 causality) or lifeline (with a real lifeline-contracts.js intent, e.g. 'diagnose') can be consulted for more. Not automatic on every gap — only when the cheap sources are insufficient (§0.5 complexity earns its existence)."

  phases:
    R0_phasemap_history_in_cortex:   # ← DONE 2026-08-12. loom/scanners/phasemap-map.js's persistHistory()+historyFor(), wired into GET /api/phasemap (fire-and-forget) + new GET /api/phasemap/history/:map/:phaseId. Real bug caught before shipping: the phase's own id collided with jaaDB's reserved `id` field across phasemap files that reuse generic phase-ids (P5/P6 in two different maps) — renamed to phaseId, verified idempotent (0 changed on repeat calls) and correctly diff-detecting (seeded-prior-state test). 12 tests (was 8), all passing. This session's own 8 commits also logged into component-ledger as the first real instance of "log everything you do."
      depends_on: []
      does: >
        James: "loom should already have a phasemap system? I want all this
        logged into loom, maybe using cortex to log the phase maps." Checked:
        loom/scanners/phasemap-map.js does a LIVE FILE SCAN every call — real,
        working, but stateless. There is no history of when a phase moved
        pending -> done, no persisted record if a .spec file's status line
        changes twice in one day, nothing to query "what did the phasemap
        say last Tuesday." This phase makes phasemap-map.js's output ALSO
        write to a real cortex table (phasemap_history) on every scan,
        append-only, diffed against the prior scan so a state CHANGE is a
        real, timestamped row, not just an overwritten current value.
      gate: "after a real phase flips from pending to done in a .spec file and loom re-scans, cortex has a real, queryable row recording that exact transition with a timestamp — not just an updated 'current status' snapshot."
      reuse: "the exact write pattern gap-field.js already established (report/dedup/occurrences) — a phase's status is structurally the same kind of thing as a gap: a state, observed over time, worth a real history. Do not invent a second persistence pattern."
      priority_note: >
        James: "maybe have this moved up to the top?" Genuine answer, not
        deference: yes. This phase is cheap (one write path added to an
        already-real scanner) and it's the thing that makes every other
        phase's own progress durable and auditable going forward — R1
        through R6 all benefit from R0 existing before they're built, the
        same way R2 benefits from existing before R3. Moved to R0, ahead of
        R1, in the dependency order below.
      axioms: ["§8.6", "§0.3", "§3.3"]
      addendum_2026_08_12: >
        Two small, real additions found by checking rather than mapping a
        new phase, per James's own "check nexus first" — folded in here
        rather than creating an R10, since both are small and this phase
        already owns "persistent, updates over time."
        (1) James: "utilizes the git commit history?" — real git log is
        already exactly the persistent, ordered, real record this phase
        wants; phasemap_history's rows should carry the real commit hash
        that produced each state transition where one exists (git log -1
        --format=%H against the .spec file at scan time), not just a
        timestamp — turns "when did this change" into "and here's the
        actual commit," which git already has and nothing here reads yet.
        (2) James: "a revision system, dropzone for old archives, date and
        time as source of truth if versions are absent." Checked first:
        loom/ingest/index.js + loom/ui/index.html's Iterations dropzone are
        BOTH real and already wired — sha256 identity, real unzip listing,
        real diff against the prior revision, disk-first persistence
        (Phase 144, already done). The one real gap: no fallback ordering
        when a dropped archive has no explicit version string — this phase
        adds it, using each entry's real mtime from the zip listing
        (unzip -l already reports this) as the tiebreaker/fallback truth
        source James named, not a new archive system.

    R1_repair_contract_schema:   # ← DONE 2026-08-12. lib/gap-field.js's report() gains requested/received/systemsInvolved/location/error (all optional, additive) + auto-populated resourceState (real resource-monitor.sample()+classify(), cheap so it's on by default) + explainWhy(uuid) for on-demand causal enrichment via diagnostic-causal (not run automatically — real work, only when asked). Full backward compat verified — the original 10 tests pass unchanged. 8 new tests (R1-001..008), one real bug in my own test caught and fixed before shipping (wrong field name assertion). 18/18.
      depends_on: []
      does: "extend lib/gap-field.js's report() to optionally carry the full repair_contract_schema above, not just type/body/source/severity. A gap can still be reported minimally (existing callers unaffected); a repair-eligible gap carries the richer shape."
      gate: "a gap reported with the full contract shape round-trips through openGaps()/asFindings() with every field intact, and diagnostic-causal's explainFinding() output can populate the `why` field automatically, not by hand."
      reuse: "gap-field.js's existing dedup/domain/severity machinery — this is an ADDITIVE schema, not a new table or a new writer."
      axioms: ["§8.6", "§0.3"]

    R2_real_snapshot_rollback:
      depends_on: []
      does: "build the actual cortex/snapshot/index.js — create(opts), rollback(snapId, opts), verifySnapshotIntegrity(), checkChainIntegrity(). The real API 3 existing tests already assume, and the real API repair-on-prompt's own header already assumes exists ('the failure is replayable, P6 snapshotId')."
      gate: "snapshot-integrity.test.js, compartment-engine.test.js, and autonomous-loop.test.js all pass against the REAL module, not a test-side mock. A repair applied and then rewound leaves the target byte-identical to its pre-repair state, verified, not assumed."
      reuse: "lib/replay-engine.js exists with an adjacent but DIFFERENT API (snapshot/logDecision/replay) — check whether replay-engine's underlying snapshot storage can be reused under this shape before building new storage from zero (§16.5 — delete/reuse before you add)."
      axioms: ["§1.1", "§2.1", "§16.5"]
      addendum_2026_08_12: >
        RESHAPED, not replaced — James: "look at versionium... timeline that
        each system has... sigma and file hashes to snapshot each file
        change... branch, debug, deltas for bottlenecks, sigma for
        anomalies." docs/versionium.spec ALREADY specs almost exactly this,
        status:proposed, never built, from an earlier session's own careful
        analysis — and it already named this exact R2 blocking question
        independently: "diff rfr2-nexus's compress/clip/context against
        lib/replay-engine.js — still undone, blocking everything else here."
        Two real things checked and confirmed, not assumed from the spec's
        own summary: lib/file-integrity.js already computes sigma FROM
        content-hash drift (0.0 no drift -> 0.9 critical) and already opens
        a gap on drift — more built than the spec's own text implied,
        checked directly. And _archive/unintegrated/rfr2-nexus/ genuinely
        exists — identity, enforcement, query, clip, delta, version-gate,
        observer — a real, staged, never-integrated toolkit sized almost
        exactly for this phase. versionium's own real build order (verified
        against real files, not re-derived): (1) fix idearium's snapshot
        commit-graph — parentId reportedly ignores declared branch, a
        linear chain wearing a branch label, not a real DAG (NOT YET
        independently verified this session — check before trusting it);
        (2) the compress/clip/context-vs-replay-engine diff named above;
        (3) extend file-integrity's ALREADY-REAL per-system hash to
        per-file, using each component's real `file` field; (4) sigma-gated
        auto-commit, last, depends on 1-3. R2 in this phasemap now MEANS
        "integrate versionium," not "build cortex/snapshot from an empty
        file" — the target module name can be cortex/snapshot/index.js or
        can be versionium's own namespace; that's a real naming decision,
        not yet made, noted rather than silently picked.
      real_consumer_already_built_and_honest: >
        ui/tv-shell/index.html's "SYSTEM REWIND" panel (confirmed live in a
        real screenshot, not described secondhand) — a real timeline
        scrubber, sigma-colored (low/mid/high), delta magnitude, calls
        ${B.orch}/api/cortex/snapshots and /rollback. Checked: that route
        exists NOWHERE — not in orchestrator.js, not in cortex/boot.js, not
        in cortex-v2.js. The UI's own stat tiles show '?' via `sn.totalRows
        ?? '?'` — an HONEST fallback for data that's never arrived, not a
        fake zero. This is the single clearest piece of evidence in this
        entire phasemap that R2 is real, wanted, already has a UI waiting
        for it, and is worth doing before R3-R6, not after.

    R3_autonomous_repair_trigger:
      depends_on: [R1, R2]
      does: "wire copilot/repair-on-prompt.js's real pattern to fire from a CA2 trigger (or CA7's constant-autonomy loop) when gap-field reports something repair-eligible, instead of firing only from a typed user prompt. diagnose() is populated from R1's contract (already has the why, the systems, the resource state — nothing re-derived); raidVerify/applyRepair use R2's real snapshots for genuine rewind-on-fail."
      gate: "the exact scenario already proven live this session (inject drift → detect → autonomous fix) but through the REAL verify spine instead of a direct revertSetting call — confirm/deny still gates it, a denied or failed-verify repair leaves the target untouched, proven by a real before/after check, not a mocked one."
      reuse: "lib/triggers.js (CA2) for the detect→fire wire, exactly as proven live earlier this session with the config-drift scenario. No new trigger mechanism."
      axioms: ["§RAID", "§1.2", "§2.1"]

    R4_loom_ledger_awareness:
      depends_on: []
      does: "loom reads lib/component-ledger.js's real, existing component_ledger table (15,472 rows already there) and exposes it — /api/history or similar, same has/get shape as every other loom route this session. Along the way: find and fix the bl7-<session-id> data-quality issue in the systemId field."
      gate: "loom/api/history returns real historical entries for a real system, live, matching what component-ledger.js's own query would return directly — loom is reading the existing ledger, not creating a second one."
      reuse: "component-ledger.js's existing query surface entirely — this is a read-only proxy/index, same principle as /api/friction and /api/tension proxying the diagnostic kernel rather than recomputing."
      axioms: ["§8.6", "§10.3 — one source of truth, loom indexes it, does not duplicate it"]
      addendum_2026_08_12: >
        James: "a ledger to log each system change to a ledger in cortex...
        each system has its own timeline, nexus has its own." component-
        ledger.js's own header, in James's own words from an earlier
        session, is already this: "a ledger per component, per system, per
        day or session" — per-system timelines are the file partition
        scheme it already uses (data/ledger/{system}/{component}/{day-or-
        session}.jsonl), and the queryable component_ledger table is the
        NEXUS-wide aggregate view over all of them. This phase doesn't need
        to invent per-system timelines — it needs to make loom actually
        show the ones that already exist. R2's per-file sigma/hash
        versioning (once real) becomes another real writer into this same
        ledger, not a parallel history.

    R5_loom_visual_map:
      depends_on: [R4]
      does: "the zoomable node graph — NEXUS as one node, zoom to 12 systems, zoom into a system for its real components/hooks/wires (driver.registry.graph() is already this exact hierarchy), gaps/friction/tension colored onto the real nodes they belong to, history (R4) reachable per-node. 'Look at architect' as the literal first test case — it must correctly show deprecated-for-hook-writes/active-for-SNR-scan, not flatten it."
      gate: "opening the architect node shows its real, current, nuanced state — the exact thing that was wrong in hooks/architect.hooks.js before it got fixed this session — sourced live, not from a cached snapshot that could drift the same way that file did."
      reuse: "loom's existing /api/phasemap, /api/gaps, /api/friction, /api/tension, /api/graph, plus R4's new /api/history. A rendering layer over six live sources, not a seventh source of truth."
      axioms: ["§3.3", "§10.3"]

    R6_living_documentation:
      depends_on: [R4, R5]
      does: "technical + plain-language documentation, GENERATED from R5's aggregated live view (map + ledger + phasemap + gaps), not hand-maintained prose that can drift the way lib/version.js's architect comment drifted this session. Hand-written prose only where the data genuinely can't say the 'why' — narrative, not facts the map already states."
      gate: "regenerating the docs after a real change (e.g., this session's own architect fix) produces a correct doc with zero manual edit — the same test loom's map already has to pass in R5, one layer up."
      reuse: "everything above. This phase adds no new data source, only a rendering/writing pass over R4+R5."
      axioms: ["§0.3", "§3.3"]

    R7_fault_taxonomy_reconnection:
      depends_on: []
      does: >
        James: "each interaction gated with an event ledger for failure modes
        or faults to log in the failure mode and fault taxonomy in cortex."
        Checked first, per James's own instruction this turn — cortex/self-
        heal/fault-taxonomy.js is REAL: a real fault_taxonomy cortex table,
        real friction thresholds (NOMINAL/ELEVATED/HIGH/FAILURE_MODE) from
        docs/self-heal.spec + docs/escalation.spec, six real readers already
        (raid/snr-filter, intelligence, orchestrator/request-handler, lib/
        constitutional-ai, lib/replay-engine). But service/nexus-diagnostic.
        js's /tension route requires 'cortex/healer/index' for a
        scoreTension() function — that directory doesn't exist ANYWHERE
        (confirmed: cortex/self-heal/ is the real one, cortex/healer/ never
        existed), and scoreTension() isn't defined under either name,
        verified by direct search, not assumed missing. This is not a
        rename-drift bug like gap-finder's stale export was — the function
        genuinely was never built, only ever called speculatively. This
        phase: fix the require path to cortex/self-heal, and build a real
        scoreTension(gap) using fault-taxonomy's own FRICTION_THRESHOLDS
        instead of the silent fallback (gap.severity==='high' ? 2 : 1) that
        has been running in its place this whole time.
      gate: "/tension's real output changes from the silent severity-based fallback to fault-taxonomy's real friction bands, verified by comparing both outputs against the same real gap set before/after."
      reuse: "fault-taxonomy.js's existing FRICTION_THRESHOLDS entirely — no new scoring model invented."
      axioms: ["§0.1 — derive from real data, don't invent", "§8.6"]

    R8_ui_diagnostic_surfaces_wired_together:
      depends_on: [R1]
      does: >
        James: "nexus nerve for diagnostics. spotlight for co-pilot to
        navigate the ui channels with the user... co-pilot should be able to
        use clear-glass to understand where the user is accessing the system
        and what isn't working when interacting using nerve and the gated
        interactions. Also the errors in the dev console?" Checked first,
        four real things found, none currently wired to each other or to
        gap-field:
          ui/tv-shell/nerve/nerve.js — REAL, CFR field (sigma/coherence/
            friction/entropy) rendered onto nodes+wires, live-polled from
            Guardian/Cortex, not a stub.
          ui/tv-shell/spotlight/spotlight.js — REAL, co-pilot already sends
            it ui{} instructions over HTTP (Spotlight.navigate/execute/on) —
            this IS "co-pilot navigates the UI with the user," already built.
          clear-glass/src/diagnostic/error-capture.js — REAL, catches main-
            process AND renderer-process (the actual dev console) errors,
            logs to a real file, pushes live over SSE. But ZERO references
            to gap-field, jaaDB, or cortex anywhere in the file — it's a
            real, working, ISOLATED system. Every dev-console error it's
            ever caught has stayed local, never reached the unified gap
            field.
        This phase wires all three together: nerve's live friction/sigma
        state and error-capture's real caught errors both report through
        R1's repair contract schema (not a fourth ad-hoc logging path), and
        spotlight becomes the mechanism co-pilot uses to SHOW the user where
        a wired-in fault actually is, live, on the real UI they're looking
        at — "gated interactions" means every spotlight-driven interaction
        step reports its own outcome the same way.
      gate: "a real renderer error caught by error-capture produces a real, findable gap-field entry, not just a local file write — and spotlight can point at the exact UI element a real, currently-open gap concerns, verified against a real triggered error, not simulated."
      reuse: "gap-field.js's report() as the single sink for all three sources — no new table, no new writer pattern."
      axioms: ["§8.6", "§10.3", "§0.3"]

    R9_ui_design_philosophy:
      depends_on: []
      does: >
        James: "ui has a design philosophy." Checked, genuinely absent —
        no docs/*design-philosophy* file, no design_philosophy section
        found anywhere in docs/. Every other real thing named this session
        (nerve, spotlight, error-capture, the rewind panel) already shares
        real, consistent conventions by observation — sovereign modules,
        HTTP-callable, CFR/sigma-driven color and pulse, honest '?' for
        missing data, hotswap:true — but nothing states them as a named,
        governing philosophy a new UI surface (R5, R6, R8's own wiring)
        would be checked against. This phase is writing that document from
        the REAL patterns already observed across nerve/spotlight/rewind/
        error-capture, not inventing new taste.
      gate: "a new UI surface built after this phase (e.g., R5's map) can be checked against a real, named document for whether it follows the established conventions, the same way a build gets checked against a spec."
      reuse: "the real conventions already found in nerve.js, spotlight.js, the rewind panel, and every system .spec's hotswap:true field — described, not invented."
      axioms: ["§0.1 — derive from what's real", "§3.3"]

  first_build: "R0 first — cheap, and every other phase's progress becomes durable once it exists. Then R1, R2, R7, and R9 in parallel — none of the four depend on each other, all are pure foundation. R3 cannot be trusted until R1+R2 are real. R4 can start any time. R5 waits on R4. R8 waits on R1. R6 is last."

  open_questions_not_yet_resolved:
    - "R2: CONFIRMED — idearium/index.js line 713: `parentId: os.db.snapshots[0]?.uuid || null`. Always picks the most recently created snapshot, ignores any declared branch entirely. A linear chain wearing a branch label, exactly as versionium.spec claimed — independently verified this session, not taken on trust. Real dependency for R2's build order (fix this before layering real branching on top of it)."
    - "R2: does lib/replay-engine.js's underlying storage genuinely fit under cortex/snapshot's expected API, or is a real design decision needed first? versionium.spec independently names the same open question. Not yet checked at the implementation level."
    - "R2: naming — does the real module live at cortex/snapshot/index.js (what the 3 existing tests assume) or under versionium's own namespace? Not yet decided, not silently picked."
    - "R3: should EVERY gap-field report be repair-eligible, or only certain types/severities? Unbounded autonomous repair-attempting on every gap risks the same 'try them all' cost conversation as CA6/CA7 build-fallback — probably wants the same kind of explicit boundary that conversation reached, not assumed silently."
    - "R5: what renders the graph — a new UI surface in loom/ui/index.html, or a separate visualization app? Not decided. ui/tv-shell/index.html's real SYSTEM REWIND panel is a strong existing-pattern candidate to extend rather than a reason to build a second UI surface — worth checking before deciding."
