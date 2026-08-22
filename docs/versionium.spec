spec:
  meta:
    name:        versionium
    version:     2.0.0
    status:      specified          # §17.2 Draft → SPECIFIED → Implemented → Verified
    uuid:        nexus-versionium-v2-0000-2026-0822-jamesbrooks-001
    supersedes:  versionium.spec@1.0.0  (archived: _archive/superseded-specs/)
    owner:       versionium         # §17.1 exactly one authority
    purpose: >
      Versionium is the rewind engine. A sovereign system (§5.9) owning snapshots,
      timelines, calendars, branches, clips, freeze/thaw, and reconstruction from
      .nex — for EVERY system, not for itself.

      Promoted out of cortex/versionium/ because it stopped being a cortex organ:
      cortex owns memory, versionium owns TIME OVER memory. Different write
      authorities (§10.1).

  current_state:
    verified_2026_08_22: >
      §3.3 — every capability below ALREADY EXISTS, built five separate times,
      sharing no primitive. 3,695 lines across 5 systems. This spec does not add a
      sixth. It defines the contract the existing five satisfy. §17.7: a repeated
      implementation indicates a missing primitive, not a missing feature.

    existing_implementations:
      - path:  cortex/versionium/index.js
        lines: 149
        gives: "sigma-gated auto-commit (>0.7); versionium_commits/_branches/_calendar"
        bug: >
          §BUG-V1 — branch is HARDCODED to 'main' in _autoCommit. parentId does
          correctly read the declared branch's headCommitId, so the DAG SHAPE is
          right; but no second branch can ever be created, so branching does not
          exist in practice. NOTE: spec v1.0.0 recorded a different bug
          ("parentId ignores branch"). That one was fixed. This is its successor,
          verified by reading the code on 2026-08-22 — not carried forward on trust.
      - path:  cortex/versionium/causality.js
        lines: 133
        gives: "ancestors/descendants/causalChain, delegating to intelligence/cfr/graph"
        preserve: >
          Its documented distinction survives into v2: causedBy answers WHY a
          version exists; parentId answers WHAT CAME BEFORE it. Two questions, two
          answers, deliberately not merged into one edge.
      - { path: cortex/snapshot/index.js,            lines: 196, gives: "snapshot/rollback over JAA, .nex writer" }
      - { path: intelligence/snapshot-trigger.js,    lines: 126, gives: "snapshot on sigma detection" }
      - { path: cos/foundation/snapshot.js,          lines: 355, gives: "compartment freeze/restore" }
      - { path: clear-glass/src/rewind/engine.js,    lines: 264, gives: "session time-machine: interval snapshots, cookie vault, DOM+storage, walk-back-N" }
      - { path: intelligence/meta/rfr2/{clip,delta,compress,context,causality}, lines: 1658, gives: "NEX-CLIP format, bounded causal subgraph extraction, replay, delta streams" }
      - { path: intelligence/meta/rfr2/{version-gate,enforcement}, lines: 654, gives: ".nex validation + migration" }
      - { path: lib/agent-tools/tools/sandbox/rewind-replay.js, lines: 94 }

    excluded_deliberately:
      - path:   intelligence/meta/rfr2/forge/index.js
        reason: >
          §EXCLUDED. forge is "AI-powered self-modification — calls the Anthropic
          API to rewrite, patch, generate gates, or add hooks to LIVE MODULES."
          That is a code-writing engine with network egress that mutates running
          code, not a blueprint engine. "Reconstruct from blueprint" and "let a
          model rewrite the running system" must never sit behind one call (§16.3).

  lift_from_causal_nexus:
    reviewed: "Causal-Nexus v4.5.1 (202 files) + Causal-Nexus v5.0.0 Spec, 2026-08-22"
    relationship: >
      Causal-Nexus is the ANCESTOR of intelligence/meta/rfr2 — near-identical module
      names. rfr2 is the newer branch and is already in the tree, with clip, context,
      sigma, version-gate and adapter-sandbox that Causal-Nexus lacks. So the useful
      question was not "what can we take" but "what did rfr2 LOSE on the way".
    take:
      - module: persist
        lines:  527
        why:    >
          NOT in rfr2. The HOT/WARM/COLD tier model is the only correct answer to
          pre-sigma capture, and rfr2 dropped it. This is the single highest-value
          thing in either upload.
      - module: "v5.0.0 §5 .nex format"
        why:    "three magic types (SNAP/BP/CLIP), type dictionary, edge codes — formalises what rfr2/clip half-implements"
      - module: "v5.0.0 Axis T determinism rule"
        why:    "eventTs vs ts separation — the exact failure mode a rewind engine cannot survive"
    leave:
      - { module: lazy,       reason: "rfr2 already has it" }
      - { module: forge,      reason: "rfr2 has it AND v5.0.0 removed it: 'extracted to its own project. Forge imports Causal Nexus. It is not a component.' Independent confirmation of §EXCLUDED above." }
      - { module: gui,        reason: "v5.0.0 removed it — 'the kernel has no UI'. §5.12 agrees." }
      - { module: failure,    reason: "v5.0.0 merged it into enforcement. Do not resurrect a module its own author retired." }
      - { module: loader,     reason: "Causal-Nexus module loading; versionium uses NEXUS's own component registry" }
      - { module: projection, reason: "§10.2 projections are cortex's, not versionium's to own" }
      - { module: runtime,    reason: "kernel runtime — rfr2/kernel covers it" }
      - { module: spine,      reason: "60 L of wiring specific to Causal-Nexus's own module graph" }

  core:
    port:        3753
    transport:   http + sse
    persistence: cortex               # §10.1 cortex owns the STORE; versionium owns these TABLES
    owns_tables:
      - versionium_commits            # commitId, parentId, branch, causedBy, message, scope, ts
      - versionium_branches           # branch, headCommitId, forkedFrom, forkPoint, createdAt
      - versionium_calendar           # per-system per-day roll-up (PROJECTION)
      - versionium_clips              # NEX-CLIP refs, bounded ranges, stability profile
      - versionium_snapshots          # scope, ref, sizeBytes, engine, integrity hash
      - versionium_config             # per-system snapshot policy
    reads_tables: [shape_samples, event_log, component_ledger]
    never_writes: "any table it does not own — §10.2, a direct projection write is ROGUE_WRITE"

  events:                             # §14.1 every gate is event → gate → event
    emitted:
      versionium.snapshot.requested:  { payload: [scope, reason, causedBy] }
      versionium.snapshot.captured:   { payload: [ref, scope, engine, sizeBytes, ms] }
      versionium.snapshot.failed:     { payload: [scope, error, engine], severity: error }
      versionium.snapshot.skipped:    { payload: [scope, reason], note: "§1.2 a skip is EMITTED, never silent" }
      versionium.commit.created:      { payload: [commitId, parentId, branch, causedBy, scope] }
      versionium.branch.forked:       { payload: [branch, forkedFrom, forkPoint] }
      versionium.restore.requested:   { payload: [ref, scope, requestedBy] }
      versionium.restore.completed:   { payload: [ref, scope, ms, restoredKeys] }
      versionium.restore.failed:      { payload: [ref, scope, error], severity: error }
      versionium.clip.created:        { payload: [clipId, fromTs, toTs, scope, stability] }
      versionium.clip.replayed:       { payload: [clipId, outcome, driftDetected] }
      versionium.delta.computed:      { payload: [scope, window, magnitude, regime] }
      versionium.timeline.marked:     { payload: [scope, ts, band, sigma] }
      versionium.freeze.engaged:      { payload: [scope, reason] }
      versionium.freeze.released:     { payload: [scope, heldMs] }
    consumed:
      sigma.event.halt_risk:          "→ snapshot.requested (reason: sigma)"
      sigma.event.warning:            "→ snapshot.requested (reason: sigma)"
      anomaly.detected:               "→ timeline.marked"
      cortex.orion.classified:        "→ correlate classification onto the timeline band"
    loop_guard: >
      §14.4 every gate calls wasProcessedBy() before claiming an event it could
      re-emit. A snapshot must never trigger a sigma that triggers a snapshot.
    ledger: >
      §14.5 every event is written to the event ledger BEFORE any subscriber runs.
      Each row carries type, eventTs (§3.2 logical time), relation (causedBy),
      and context (scope, regime) — §13.1 all three, or the row is incomplete.

  config:
    server:
      file:       versionium/config.js
      port:       3753
      env_prefix: VERSIONIUM_
    per_system:
      table: versionium_config
      shape:
        system:          "the sovereign system this policy governs"
        enabled:         boolean
        interval_ms:     "number | null — null means event-only, never timed"
        on_sigma:        boolean
        sigma_threshold: "number, default 0.7 (matches SIGMA_THRESH already in use)"
        engine:          "jaa | compartment | session | file"
        retention_days:  number
        max_snapshots:   "hard cap; pruned by VALUE not age"
      defaults:
        cortex:       { interval_ms: 5000, on_sigma: true,  engine: jaa }
        guardian:     { interval_ms: 5000, on_sigma: true,  engine: jaa }
        intelligence: { interval_ms: 5000, on_sigma: true,  engine: jaa }
        clear-glass:  { interval_ms: 5000, on_sigma: false, engine: session }
        cos:          { interval_ms: null, on_sigma: true,  engine: compartment }
      rationale: >
        §0.5 — a 5s interval on a system that changes hourly is 720 identical
        snapshots an hour. interval_ms:null is a FIRST-CLASS value, not a disabled
        state: cos snapshots on compartment transition, which is when its state
        actually changes.
      pressure_gate: >
        §MEMORY — admission reuses lib/work-queue's thresholds. Under critical free
        memory a capture is DEFERRED and emitted as skipped, never silently dropped.
        A backup engine that OOMs the system it protects has inverted its purpose.

  # ── §PRE-SIGMA CAPTURE — the three-tier buffer ─────────────────────────────
  # Lifted from Causal-Nexus v4.5.1 modules/persist/persist.js (527 L), which
  # rfr2 does NOT have. rfr2 kept clip/delta/compress/context and dropped the
  # persistence tiers; this is the piece that went missing.
  storage_tiers:
    problem: >
      "Snapshot just before the sigma event" cannot be done by reacting to sigma.
      By the time sigma fires the pre-spike state is already gone. The only way is
      a buffer that is ALWAYS capturing and always discarding, which is FROZEN when
      sigma fires — the frame wanted is already in it.
    hot:
      what:   "in-memory ring buffer, bounded by ringCap, O(1)"
      holds:  "the last N frames per system, continuously overwritten"
      blind:  >
        §CRITICAL — the ring MUST NOT know what sigma is. Causal-Nexus v5.0.0 §1:
        "The kernel is semantically blind. It never knows 'instability', 'bad', or
        'threshold breach'. It only knows transitions in a constrained state space."
        The ring keeps N frames blindly (§14.2 pure). Versionium watches sigma and
        PROMOTES the frame at T-1 out of the ring into a durable commit. Mechanism
        and policy stay separate; a ring that knew about sigma would be a gate with
        hidden state.
    warm:
      what:   "WAL — append-only, one entry per capture batch, written synchronously"
      file:   "data/versionium/<system>.wal"          # your "cached in a file per system"
      clears: "when a full snapshot flushes to cold"
      restart: "replay WAL → rebuild the ring. §2.2 the device is the source of truth."
    cold:
      what:   "archive — evicted ring frames MOVED here, never discarded"
      file:   "data/versionium/<system>/<day>.nex"
      law:    "§0.3 nothing is lost. Eviction from HOT is relocation, not deletion."
      query:  "by type, time range, contentHash"
    invariants:
      - "the ring is never modified by the persist layer — read-only projection"
      - "archive frames are immutable once written"
      - "WAL is append-only — existing entries never overwritten"
      - "recovery re-ingests with replayOf set, so dedup applies"
      - "no causal edges are INFERRED from archive data — edges replay as-is (§1.1)"
    per_system_config:
      ring_frames:   "number — HOT depth. Default 12 (60s at a 5s cadence)"
      pre_sigma_lag: "number — how many frames BEFORE the spike to promote. Default 1"
      rationale: >
        pre_sigma_lag is a real tunable, not a constant. A slow-building drift wants
        a deeper reach-back than a step change. Default 1 is stated, not assumed
        correct — §12.4, the right value crystallises from evidence.

  # ── .nex — three formats, one envelope ─────────────────────────────────────
  nex_format:
    source: "Causal-Nexus v5.0.0 §5 — self-describing JSON envelope with a magic header"
    types:
      NEX-SNAP:  "compressed full-fidelity kernel state. Exact round-trip restore."
      NEX-BP:    "BLUEPRINT — captures GRAMMAR, not data. 'A tends to cause B.' Compiles to a seed module."
      NEX-CLIP:  "bounded causal subgraph — a timeline selection. Replayable, parametric, stability-validated."
    compression:
      - "type dictionary — event type strings stored once, referenced by index"
      - "edge type codes — single char (x/r/a/o) instead of full strings"
    clip_validation: >
      The stability profile IS the validation contract. On instantiation into a new
      session, live delta measurements are compared against meanGap / sigmaGap /
      delta bounds. A clip that does not hold is REFUSED, not replayed anyway (§16.3).
    determinism_rule: >
      §CRITICAL, from v5.0.0 Axis T — eventTs and ts are separate and must never be
      mixed. "If ts is ever used in a gate window, the session diverges between live
      and replayed runs." This is §3.2 already, restated because replay is exactly
      where violating it is invisible until a rewind produces different output.

  # ── cos — reused, not reimplemented ────────────────────────────────────────
  cos_integration:
    compartment_adapter: >
      cos/foundation/snapshot.js (355 L, SnapshotEngine + SNAP_SCHEMA_VERSION) becomes
      versionium's `compartment` engine adapter. Not rewritten (§16.5) — wrapped.
    restore_as_compartment: >
      A restore is spawned INTO a compartment before it is applied to the live system.
      cos/kernel.js already gives: 7 birth gates (axiom_integrity → identity_persistence),
      a STATE machine (SANDBOX → GATING → INTEGRATED | RECYCLED | AXIOM_FAULT), and
      rollback on failure. A restored state that fails a birth gate is RECYCLED
      instead of integrated — so a bad rewind cannot reach the running system.
    friction_measurement: >
      Run a candidate restore in a compartment, survey gap tension before and after
      (intelligence/gap-tension.frictionDelta), and report relieved/worsened/introduced.
      A rewind that fixes one system and destabilises three still "succeeds" against a
      boolean gate. Only the delta sees it.

  timeline:
    per_system: true
    bands:
      - { band: stable,     sigma: "< 0.3",     colour: "#5DCAA5" }
      - { band: drifting,   sigma: "0.3-0.7",   colour: "#F9CB42" }
      - { band: deviating,  sigma: "0.7-0.9",   colour: "#E8833A" }
      - { band: critical,   sigma: ">= 0.9",    colour: "#E24B4A" }
      - { band: unmeasured, sigma: "null",      colour: "#5a5a68",
          note: "§1.2 UNMEASURED is its own band. A sampling gap must never render as stable." }
    colour_rule: >
      §17.11 — colour encodes ONE measured axis (sigma). Never a blend of sigma,
      delta and error-count into one hue: a colour nobody can decompose is a
      bundled multiplier wearing a different coat.
    markers: { commit: "▲", clip: "▬", freeze: "❚❚", restore: "↺" }

  calendar:
    per_system: true
    grain:      day
    cell:       { peak_sigma: number, commits: number, snapshots: number, band: "derived from peak_sigma" }
    note:       "§10.2 a PROJECTION — derived, never written directly"

  deltas:
    purpose: "monitor system performance over time"
    source:  intelligence/meta/rfr2/delta
    axes_reported_separately:
      - { name: state_delta, unit: "changed keys / snapshot" }
      - { name: rate,        unit: "changes / minute" }
      - { name: sigma_delta, unit: "ratio vs previous window" }
    never: >
      §17.11 the three axes are NOT multiplied into one performance score. Different
      units. A rank may be offered for ordering and always ships beside its components.

  modules:                            # §3.4 raw → library → api → cli → automation → ui
    - { id: versionium.contract, file: versionium/lib/contract.js, layer: raw,
        gives: "capture(scope) / restore(ref) / diff(a,b) / list(scope) — THE missing primitive" }
    - { id: versionium.adapters, file: versionium/lib/adapters/, layer: raw,
        gives: "jaa | compartment | session | file — each wraps an EXISTING engine, none rewritten" }
    - { id: versionium.commits,  file: versionium/lib/commits.js, layer: library, gives: "commit DAG, fork; fixes §BUG-V1" }
    - { id: versionium.timeline, file: versionium/lib/timeline.js, layer: library }
    - { id: versionium.calendar, file: versionium/lib/calendar.js, layer: library }
    - { id: versionium.clips,    file: versionium/lib/clips.js, layer: library, gives: "NEX-CLIP via rfr2/clip" }
    - { id: versionium.policy,   file: versionium/lib/policy.js, layer: library, gives: "per-system config, gating, pressure deferral" }
    - { id: versionium.api,      file: versionium/api/index.js, layer: api }
    - { id: versionium.cli,      file: versionium/cli/index.js, layer: cli }
    - { id: versionium.server,   file: versionium/server.js, layer: automation }
    - { id: versionium.ui,       file: versionium/ui/, layer: ui, note: "§5.12 DISPOSABLE — removing it must not affect execution" }

  routes:
    - { method: GET,  path: /health,                comp: versionium.health }
    - { method: GET,  path: /contract,              comp: versionium.contract }
    - { method: GET,  path: /sse,                   comp: versionium.stream }
    - { method: GET,  path: /api/timeline,          comp: versionium.timeline,   params: [system, from, to] }
    - { method: GET,  path: /api/calendar,          comp: versionium.calendar,   params: [system, month] }
    - { method: GET,  path: /api/commits,           comp: versionium.commits,    params: [branch, limit] }
    - { method: POST, path: /api/commits,           comp: versionium.commit,     permissions: [user, system] }
    - { method: GET,  path: /api/branches,          comp: versionium.branches }
    - { method: POST, path: /api/branches/fork,     comp: versionium.fork,       permissions: [user] }
    - { method: GET,  path: /api/snapshots,         comp: versionium.snapshots,  params: [system, limit] }
    - { method: POST, path: /api/snapshots/capture, comp: versionium.capture,    permissions: [user, system] }
    - { method: POST, path: /api/snapshots/restore, comp: versionium.restore,    permissions: [user] }
    - { method: POST, path: /api/freeze,            comp: versionium.freeze,     permissions: [user] }
    - { method: POST, path: /api/freeze/release,    comp: versionium.thaw,       permissions: [user] }
    - { method: GET,  path: /api/clips,             comp: versionium.clips }
    - { method: POST, path: /api/clips,             comp: versionium.clipCreate, permissions: [user] }
    - { method: POST, path: /api/clips/:id/replay,  comp: versionium.clipReplay, permissions: [user] }
    - { method: GET,  path: /api/deltas,            comp: versionium.deltas,     params: [system, window] }
    - { method: GET,  path: /api/config,            comp: versionium.config }
    - { method: PUT,  path: /api/config/:system,    comp: versionium.configSet,  permissions: [user] }

  handshake:                          # §5.11
    on_connect:
      - "identity: system declares name + version"
      - "versions: spec version negotiated; mismatch REFUSES, never proceeds optimistically"
      - "capabilities: which engine this scope requires (jaa|compartment|session|file)"
      - "permissions: restore is user-gated; capture may be system-initiated"
      - "health: the target must answer /health before a restore is attempted"
    restore_gate:
      - "§17.10 a restore NEVER bypasses verification — integrity hash checked before apply"
      - "§16.3 a failed integrity check REFUSES. It is not logged and passed through."
      - "a pre-restore snapshot is captured FIRST — rewinding must itself be rewindable"

  agent_access:
    permitted: [guardian, clear-glass]
    forbidden: [anthropic_api, openai_api, any_direct_model_call]
    rationale: >
      Versionium reaches models only through the two systems that already own that
      boundary and its auth. A backup engine holding its own network egress is a
      security surface with no reason to exist (§4.3).

  ui:
    disposable: true                  # §5.12
    surfaces:
      - { view: timeline, reads: "GET /api/timeline", note: "colour-coded by sigma band" }
      - { view: calendar, reads: "GET /api/calendar" }
      - { view: branches, reads: "GET /api/branches" }
      - { view: clips,    reads: "GET /api/clips" }
    errors: "toasts (§8.5); every interaction gated and ledgered"

  build_order:                        # §3.1 bottom-up, §3.4 raw first
    - "1. lib/contract.js — the primitive. Nothing else can be built before it."
    - "2. lib/ring.js — HOT ring buffer, semantically BLIND. Port persist's tier model."
    - "3. lib/wal.js — WARM append-only per-system file + replay-on-restart."
    - "4. lib/adapters/ — wrap the EXISTING engines (jaa, cos SnapshotEngine, clear-glass session, file). Zero rewrites (§16.5)."
    - "5. lib/commits.js — fix §BUG-V1 before anything depends on branching."
    - "6. lib/policy.js — per-system config, sigma promotion, pressure gate."
    - "7. timeline / calendar / clips / deltas."
    - "8. api → cli → server.js + config.js."
    - "9. interaction-contract.json + handshake."
    - "10. ui LAST."
    - "11. shims at every old path; delete only when the last consumer moves (§16.5, §0.3)."

  open_questions:                     # §0.1 named, not guessed
    - "§BUG-V1 fix — does fork() need a fork POINT recorded at creation, or is
       parentId-at-fork-time sufficient? v1.0.0 asserted the former. UNVERIFIED."
    - "hooks/cortex.hooks.js:573 declares sideEffects jaa.insert('versionium_commits')
       — a SECOND write path into a table versionium claims sole authority over.
       §10.1 conflict. MUST be resolved before versionium claims that table."
    - "Does clear-glass's session engine become an adapter, or stay sovereign with
       versionium only indexing its refs? Leaning index-only: its snapshots hold
       cookies, which versionium should not be able to read (§4.3)."
