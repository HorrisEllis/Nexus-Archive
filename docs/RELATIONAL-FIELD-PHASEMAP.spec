spec:
  meta:
    name:        relational-field
    version:     0.1.0-phasemap
    status: >
      PHASEMAP — dependency-ordered, bottom-up, chunked. Written 2026-08-04 per
      §3.1 (substrate before logic before surface), §3.3 (map current-state-vs-spec
      before building) and §8.5 (map before build). NOTHING IN CHUNK B OR ABOVE IS
      BUILDABLE until Chunk A closes: every phase above the ground layer depends on
      a direction decision that cannot be made honestly on the evidence available
      today. Axioms are law throughout.
    uuid:        nexus-relational-field-phasemap-v0-0000-2026-0804-001
    supersedes:  nothing. First map of this arc.

  goal: >
    CFR (Constraint Field Runtime — gives the field its shape) and RFR2 (reads
    relation and meaning across it) CLICK TOGETHER rather than overlap, and the
    intelligence system reads through that joint rather than around it. James,
    2026-08-04: "they're not supposed to overlap"; "RFR2 is the meaning of
    things"; "basically, I made an artificial intuition."

  # ══════════════════════════════════════════════════════════════════════════
  # CURRENT STATE — measured 2026-08-04, not recalled. §0.1.
  # ══════════════════════════════════════════════════════════════════════════
  current_state:
    two_substrates: >
      meta/cfr/ (1,777 lines, 7 files) and meta/rfr2/ (4,840 lines, 18 files)
      BOTH implement a causal graph and BOTH compute sigma. CFR has 26 real
      require() sites across NEXUS; RFR2 has 4 (cortex/boot.js:895 identity,
      cortex/intelligence/mastermind.js:108 delta, cortex/intelligence/
      relational-field.js:44 causality+sigma, nexus-healer/api/index.js:86 forge).
      The overlap is concentrated in ONE file: meta/rfr2/kernel/index.js (570
      lines) is an append-only event ring carrying its own causal graph and gate
      system. That is the thing that makes RFR2 a second substrate instead of a
      reader. Everything else in RFR2 is reader-shaped.
    dark_engines: >
      12 of RFR2's 17 sub-engines have zero production consumers: kernel(570),
      query(430), enforcement(335), compress(323), version-gate(319), clip(314),
      context(298), observer(185), adapter-sandbox(194), adapter(180), time(99),
      lazy(24). Tests only. NOTE meta/rfr2/index.js exports 16 of the 17 —
      `lazy` is not exported and is reachable only transitively through delta.
    intelligence: >
      cortex/intelligence/ is 5 files, 1,554 lines. index.js (1,022 lines — the
      pattern-recognition engine) contains ZERO RFR2 code; its two RFR2 mentions
      are prose inside capability-description strings. It resolves causality
      through meta/cfr/graph.js's CausalGraph instead. intuition.js (98) and
      adversarial.js (140) contain zero. Only mastermind.js and
      relational-field.js touch RFR2 at all.
    unreachable_capability: >
      relational-field.js self-registers GET /api/intelligence/relational-field.
      cortex/boot.js does not serve that path. Nothing outside
      tests/modules/test-relational-field.js calls readFieldForFriction(). Per
      §1.1 it is a proven module with no proven consumer.
    registry_before_this_session: >
      Not one file under meta/cfr/ or meta/rfr2/ was a declared component. The
      single most important structural question in the codebase was invisible to
      the registry and therefore to the diagnostic wire scan, movement map,
      bottleneck detector, and gap-hunter.

  # ══════════════════════════════════════════════════════════════════════════
  # DONE THIS SESSION — the map, not the build. §1.1: staged ≠ built.
  # ══════════════════════════════════════════════════════════════════════════
  done_2026_08_04:
    - "loom/maps/relational-field-map.js — 31 components, 37 hooks, 55 wires, real require() edges only. Both substrates now visible to the registry side by side."
    - "BOUNDARY block + mapBoundary() — 8 endpoint components (jaa-db, self-register, nexus-bus, component-ledger, meta/causal/compound, capability-registry, copilot/system-status, meta/gap/hunter), each verified present on disk."
    - "FOUND: 11 of the observability map's 18 wires had been HARD-REJECTED by loom.wire-endpoints-exist on every bootstrap since 0.19.1 — endpoint components were never declared. 0.19.1's '9 components, 18 wires' was wrong; 8 wires landed. Among the rejected: lib/rfr2-bridge → relational-field, i.e. the one real RFR2-into-intelligence edge had never been in the registry. Now 18/18."
    - "CORRECTED: observability-map declared a relational-field → mastermind wire. relational-field.js has exactly one require() in the file. Edge removed, component ownership moved to the new map (declare() is NOT idempotent — loom.unique-id hard-rejects a second declaration, so it could not live in both)."
    - "CORRECTED: tests/modules/test-relational-field.js T-006 was ASSERTING the fabricated mastermind edge — holding the defect in place rather than catching it, the same failure mode as copilot-handshake-dispatch.test.js in 0.9.11. Rewritten, plus T-007 (every mapped edge checked against source both directions, comments and template literals stripped) and T-008 (boundary files exist). 8/8 passing."
    - "STAGED: unintegrated/2026-08-04-eravos-field-pattern/ — ERAVOS's ALK dimensions/boot/signal-vector verbatim + the Emergence field contract as observed from the consumer. 🔵 SOURCED, not built."
    - "CORRECTED: unintegrated/README.md's 2026-07-12 entry claimed Causal Nexus v6 is live at meta/causal-nexus/. That path does not exist; it was retired and rfr2's kernel/sigma/adapter/causality/forge harvested out of it."

  # ══════════════════════════════════════════════════════════════════════════
  # WHY CHUNKED — the drift protocol. Read before resuming this map.
  # ══════════════════════════════════════════════════════════════════════════
  drift_protocol: >
    This codebase's recurring failure is not bad code. It is that each working
    session — human or AI — sees a partial picture, builds something real
    against it, and declares a wire that the next session then trusts. Every
    correction listed in done_2026_08_04 is an instance: a wire declared without
    a require behind it, a test asserting the declaration instead of the source,
    a version note claiming an integration that never had a consumer, a README
    describing a path that no longer exists. SESSION-PROTOCOL.md documents the
    same pattern at whole-tree scale.

    So the chunks below are not milestones. They are CONTEXT BOUNDARIES. Each is
    sized to be completed and verified inside one working session without
    holding the rest of the map in memory, and each ends at a state where the
    tree is coherent and the next session can start from evidence on disk rather
    than from a summary of what someone believed.

    Rules that make that real:
      1. A chunk is not done until its verify block passes AS A COMMAND, run and
         its output pasted into the chunk's record. "Verified" without the
         command output is not verified (§0.1, §17.10).
      2. No chunk may declare a wire, capability, route, or registry edge whose
         consumer does not exist yet. If the consumer is in a later chunk, the
         wire belongs in that later chunk.
      3. Every chunk that changes the registry re-runs `node loom/bootstrap.js`
         from a deleted registry.json and requires exit 0 with zero FAILURES.
         Reading the summary line is not enough — 0.19.1 passed its summary line
         while a third of its wires were being rejected underneath it.
      4. A chunk that finds its own premise false STOPS and records the finding.
         A falsified premise is a result (SESSION-LOG.md, 2026-08-01 — the
         arousal hypothesis kept on purpose after being disproved).
      5. Chunk A gates everything. No phase in B, C, or D may be started early
         "while we're in here."

  # ══════════════════════════════════════════════════════════════════════════
  chunks:

    # ────────────────────────────────────────────────────────────────────────
    CHUNK_A_GROUND:
      goal: "Establish, by diff and by running code, what each substrate actually is — so the direction decision is made on evidence instead of on intent. Produces no new capability. This is the chunk that has been skipped every time."
      blocks: "everything"

      RF-1_causality_vs_graph:
        why_first: >
          unintegrated/README.md has carried this exact instruction since
          2026-06-29: causality "still needs a real diff against lib/cfr/graph.js
          before anyone decides whether it's wanted at all — copying it here
          would invite assuming the diff already happened." The diff has still
          not been done. It was copied anyway, harvested into meta/rfr2/ anyway,
          and wired into intelligence anyway. Every later confusion in this arc
          descends from that one skipped step.
        does: >
          Real behavioural diff of meta/rfr2/causality/index.js (267 lines,
          traceToRoot + createCausalStore) against meta/cfr/graph.js (284 lines,
          CausalGraph.ingest/ancestors). Same inputs, same event set, compare
          outputs. Answer three questions in writing: do they compute the same
          relation; where do they disagree; is either strictly more capable.
        axioms: "§0.1 evidence over confidence, §3.3 map current-state-vs-spec, §16.5 delete before add"
        gate: "docs/RF-CAUSALITY-DIFF-2026-08.md exists, contains the actual command output of both engines run over the SAME real event_log slice, and names which relation each computes. No prose-only comparison."

      RF-2_sigma_vs_sigma:
        why: >
          unintegrated/README.md records this as already reconciled "by
          direction, not by picking a side": meta/cfr/sigma.js stores
          permanently at write time and never recomputes; the harvested engine
          is a pure observer that never stores by design. Both survive. The
          reconciliation must be re-verified against the current tree, because
          the tree it was written about no longer exists.
        does: "Diff meta/rfr2/sigma/index.js (325, classify + REGIMES) against meta/cfr/sigma.js (189, writes sigma_records via lib/component-ledger). Confirm or falsify that they answer different questions rather than the same one twice."
        gate: "the two questions are named in one sentence each, and a real input is shown producing a real output from each."

      RF-3_kernel_overlap:
        why: >
          This is the actual overlap. rfr2/kernel is the only thing making RFR2 a
          substrate rather than a reader. If it goes, RFR2 becomes what James
          says it is.
        does: "Establish what rfr2/kernel/index.js provides that meta/cfr/ does not: append-only ring, gate system, macro projection, causal graph. For each, name the CFR equivalent or state that none exists."
        depends_on: "RF-1"
        gate: "a four-row table, each row citing the file and line that provides (or fails to provide) the equivalent."

      RF-4_sigma_live_regression:
        why: >
          A recorded decision lost its implementation silently. sigma_live was
          the live/recomputed half of the RF-2 reconciliation, written by
          meta/causal-nexus/recompute-trigger.cjs. That file no longer exists
          anywhere in the tree. sigma_live survives only as a tier declaration
          at cortex/memory/tiers.js:63. Nothing writes it. No version-log entry
          records the loss. §1.2 — this failed silently for weeks.
        does: "Decide and record: restore the recompute trigger, or formally retire sigma_live and remove its tier declaration. Not both, not neither."
        depends_on: "RF-2"
        gate: "either a real writer exists and a real row lands in sigma_live, or the tier declaration is gone and lib/version.js records the retirement. §16.5."

      RF-5_direction:
        why: "The decision every phase above depends on. It cannot be made before RF-1..RF-4 and must not be made after them by default."
        does: >
          Choose, in writing, ONE: (a) CFR is the field; RFR2's readers
          (causality, query, sigma, enforcement, clip, compress) re-point at it
          and rfr2/kernel is retired; (b) CFR feeds rfr2/kernel through
          rfr2/adapter (180 lines, dark, and shaped exactly like this job) and
          RFR2 remains the substrate; (c) the diffs falsified the premise and
          they are not the same layer at all.
        depends_on: "RF-1, RF-2, RF-3, RF-4"
        gate: "the decision is in lib/version.js's changelog with its reasoning, and the two options NOT taken are recorded with why. A decision whose alternatives aren't written down gets silently re-litigated next session — that is the loop this whole map exists to break."

      verify: |
        node loom/bootstrap.js && node tests/modules/test-relational-field.js
        test -f docs/RF-CAUSALITY-DIFF-2026-08.md

    # ────────────────────────────────────────────────────────────────────────
    CHUNK_B_SUBSTRATE:
      goal: "Make the click structural. One field producer, one reader, one adapter between them."
      depends_on: "CHUNK_A closed, RF-5 decided"

      RF-6_registry_expresses_injection:
        why: >
          cortex/boot.js:119 constructs mastermind with an INJECTED causal-graph
          class (getCausalGraphClass, boot.js:97). That is how intelligence
          actually reaches CFR today, and the registry cannot express it — its
          edge rule is require-only. So the registry's picture of the most
          important dependency in the system is structurally incapable of being
          right. This is a gap in the registry, not in the code.
        does: "Extend loom's wire schema with an edge kind for injected/DI dependencies, declared with the injection site (file:line) as evidence. Then map boot.js's injection."
        gate: "the mastermind→CFR dependency appears in registry.json with its injection site, and a test asserts the site still matches source."

      RF-7_adapter_is_the_seam:
        why: "meta/rfr2/adapter/index.js is 180 lines, dark, and its docblock describes translating foreign bus events into typed kernel events with causedBy linkage — the exact shape of a CFR→RFR2 seam."
        does: "Per RF-5's direction, either make adapter the real CFR→RFR2 translation or retire it. No third state."
        depends_on: "RF-5"
        gate: "a real CFR event goes in and a real typed event comes out, or the module is deleted and the deletion recorded."

      RF-8_retire_or_justify_kernel:
        does: "Execute RF-5 on rfr2/kernel: retire it and re-point its dependants (clip, compress, context all require it), or record in writing why two event rings are correct."
        depends_on: "RF-3, RF-5, RF-7"
        gate: "either rfr2/kernel is gone and the full suite passes, or lib/version.js carries the justification and the registry shows both rings as a declared, intentional pair."

      verify: |
        rm -f loom/data/registry.json && node loom/bootstrap.js   # exit 0, zero FAILURES
        npm run test:all

    # ────────────────────────────────────────────────────────────────────────
    CHUNK_C_READER:
      goal: "RFR2 reads the field, and something real calls it. This is where the Emergence pattern in unintegrated/ becomes applicable."
      depends_on: "CHUNK_B"

      RF-9_field_contract:
        why: >
          ERAVOS proves the shape: a read-only producer endpoint, a reader that
          ABSTAINS on absence rather than defaulting, absence stated once, and
          the field stamped at time-of-record so a later change never
          retroactively rewrites what an earlier node recorded. See
          unintegrated/2026-08-04-eravos-field-pattern/emergence-field.contract.md
          — including its §0.1 header, which marks exactly how much of that
          contract is evidence and how much is inference from one consumer.
        does: "Define CFR's field read contract in the same terms. Structural abstention: no default field, no zero vector, no neutral value."
        gate: "a reader with no field emits no edge and states the absence once — proven with the producer switched off."

      RF-10_relational_field_gets_a_consumer:
        why: "§1.1 — a capability with a declared route that boot.js does not serve and that nothing calls is not built."
        does: "Serve GET /api/intelligence/relational-field in cortex/boot.js and give readFieldForFriction one real production caller, or withdraw the self-registration."
        gate: "a live request returns a real traced root from real events; or the capability entry is gone. Not a declared route with no handler."

      RF-11_light_the_readers:
        does: "Bring query (CQL over the causal record) and enforcement (RuntimeGuard + 25 invariants) online against the field, one at a time, each with a real consumer before it is declared."
        depends_on: "RF-9, RF-10"
        gate: "one real structured question answered from real data per engine. An engine without a consumer stays dark and is recorded as dark."

      verify: |
        curl -s localhost:3748/api/intelligence/relational-field   # real trace, not 404
        npm run test:all

    # ────────────────────────────────────────────────────────────────────────
    CHUNK_D_LAYERS:
      goal: "The layered read James described: the intelligence system reading his cognitive and emotional systems, and his relation to himself and to the system, through RFR2."
      depends_on: "CHUNK_C"
      CORRECTED_2026_08_04: >
        AN EARLIER PASS OF THIS MAP SAID THE TWELVE LAYERS DO NOT EXIST. THAT
        WAS WRONG, and it was wrong in the way this codebase is always wrong —
        by searching for a name ("12 layers", "fingerprint") instead of reading
        the tree. They exist. meta/liminal/index.js, 470 lines, header line 7:
        "12 domain-agnostic gap detectors ported from Liminal v1.0.0."

        The twelve: code, assumption (universalisation, causal leaps),
        contrastive (belief-behavior gap, contradiction clusters, "fine"
        inversions), structural (presupposition loading, frame control, power
        geometry), shadow (pronoun displacement, intensity mismatch,
        over-apology), negative_space (topic orbit, avoidance trajectory,
        vocabulary field absence), relational (gaslighting layers, guilt
        induction, triangulation, contempt), oscillatory (pendulum math,
        intermittent reinforcement, approach-retreat), existential (identity
        assumption, values-behavior gap, meaning SPOF), field (oscillation,
        edges, plateaus, convergence, fractals), music, reversal.

        These read a PERSON, not a system. That is the fingerprinting layer.
        What is wrong with it is not that it is missing:

          1. IT IS COLLAPSED TO ONE FLOAT. lib/chat-logger.js:83-86 runs
             liminal.analyzeText() on every logged message and keeps
             `gaps[0].criticality` — a single number. Which detector fired, the
             gap type, the reason, the evidence: all discarded before the record
             is written to chat_log. Identical three lines, copy-pasted, at
             guardian/api-dispatch.js:240-244.
          2. BOTH CALL SITES SWALLOW SILENTLY. Both are wrapped in
             `catch(_) {}`. If the detectors throw, gapScore is null and nothing
             says so — §1.2 violated at the only two places this runs.
          3. ONLY 8 OF 12 EVER RUN ON TEXT. analyzeText() calls assumption,
             contrastive, structural, shadow, negative_space, relational,
             reversal, existential. It excludes code, music, oscillatory, field.
          4. THE TWO TIME-AXIS DETECTORS HAVE NEVER RUN. `oscillatory` and
             `field` take a numeric SERIES (analyzeField), not text — they read
             trajectory across messages rather than within one. analyzeField()
             has ZERO callers anywhere in the tree. Those two are precisely the
             ERAVOS FIELD dimension one domain over: the state he was in, not
             the moment he was in it — the thing the other eight structurally
             cannot see. This is the same shape as RF-9 and should be built
             against the same contract.
          5. COPILOT CANNOT REACH ANY OF IT. No liminal action in
             lib/agent-tools/tools/query-intelligence.js, no tool wrapper. The
             only surface is orchestrator.js:1300's POST route calling
             meta.liminal.analyze, and nothing in copilot calls it.

      RF-12_stop_discarding_the_fingerprint:
        why: "The twelve detectors run on every message and 11/12 of the result is thrown away at the call site. Nothing needs building for this to become real — it needs to stop being deleted."
        does: >
          At both call sites (lib/chat-logger.js, guardian/api-dispatch.js),
          persist the full GapSignal set — detector, GAP_TYPE, GAP_REASON,
          criticality, evidence — instead of gaps[0].criticality. Replace
          catch(_) {} with a stated failure (§1.2).
        gate: "a real chat_log row carries which detectors fired and why, and a forced detector throw produces a visible, named failure rather than a null score."

      RF-12b_the_time_axis:
        why: "oscillatory + field are the two detectors that read trajectory, and analyzeField() has never been called. Without them the fingerprint has no memory — it reads twelve properties of one moment and none of the movement between moments."
        does: "Feed analyzeField() a real series (gapScore/criticality over a session's chat_log) and wire its output where the other eight land."
        depends_on: "RF-9 (same abstention contract), RF-12"
        gate: "a real session produces a real oscillatory/field signal, and a session too short to have a trajectory ABSTAINS rather than returning a confident zero."

      RF-12c_copilot_can_read_it:
        does: "Add a liminal action to query-intelligence (or a dedicated tool) so copilot can ask the fingerprint directly, the way it can already ask patterns/mastermind/intuition."
        depends_on: "RF-12"
        gate: "copilot answers a question that requires the fingerprint, using it, in one turn."

      RF-13_alk_perception_lives_or_dies:
        why: "meta/alk-perception has had no consumer since 1.0.0. orchestrator.js:1280 reports it as available while actually reading meta.alk.VERSION — a different module. It reports healthy because it reports someone else's version."
        does: "Fix the version misreport regardless. Then either give it a real consumer or retire it (§16.5)."
        gate: "orchestrator reports alk-perception's own version, and the module either has a caller or is gone."

      RF-14_user_model_gains_depth:
        does: "Extend user-model's categories per RF-12, keeping the hypothesis discipline exactly as it is — decay, prune-to-archive, never a hard fact (§12.1–12.3)."
        depends_on: "RF-12"
        gate: "a new-category hypothesis is observed from real interaction, decays on schedule, and is visible in the editable surface. Current live data is 15 hypotheses with four at confidence 0 and one row entirely null — fix that before adding categories to it."

      RF-15_the_relation_to_self:
        why: "James: the system should read 'the relation that I have to myself in the system.' That is a relation between the user model and the system's own state — precisely the join RFR2 exists to compute, and precisely what the ERAVOS field dimension does one domain over."
        does: "Deferred. Not specifiable until RF-12 stops the fingerprint being discarded and Chunk C proves a reader can read a field at all."
        depends_on: "RF-9, RF-12, RF-14"
        gate: "none yet. Recorded as an intent, not a phase, so it is not silently treated as planned work."

    # ────────────────────────────────────────────────────────────────────────
    CHUNK_E_REGISTRY:
      goal: "The registry describes the whole system, continuously, without anyone maintaining a list."
      note: "Runs PARALLEL to A–D. Depends on nothing in this map and blocks nothing in it."

      RF-16_scanner_replaces_hand_maps:   # DONE 2026-08-04
        was: >
          Every map in loom/maps/ was a hand-authored list. The registry held 68
          components while 280 were declared across 13 registry-components.js
          files and ~860 real source files existed on disk. The only thing that
          ever declared a component into loom's driver was loom/bootstrap.js —
          no runtime path existed at all. The one sync that does exist
          (lib/hook-sync-from-component-registry.js, run every 30s by
          loom/server.js:209) converts components into HOOKS in a different
          store (lib/hook-registry.js), which is not the same thing.
        now: >
          loom/scanners/source-map.js reads the tree: 817 files scanned, 1,072
          real require()/import edges. Registry: 885 components, 1,295 hooks,
          1,172 wires, zero failures. Comments and template literals stripped
          before extraction, so the four known phantom edges stay out — pinned
          by tests/modules/test-source-map-scanner.js T-002/T-003, and T-007
          fails loudly if anyone reverts it to a curated list.
        honest_limits: >
          183 dynamic require()/import() calls are NOT captured and cannot be by
          any static reader. 82 relative specifiers resolve to nothing. Both are
          COUNTED AND PRINTED by the scan rather than rounded away, because a
          summary line that omits what it cannot see is how 11 hard-rejected
          wires survived here for weeks.
        open: "Bootstrap now takes ~75s because LoomRegistry._persist() rewrites the whole JSON on every single declare — ~3,300 writes of a growing 1.3MB file. Correct but O(n²). Not touched this session; the driver's persistence is its own change."

      RF-18_capability_consumer_graph:   # DONE 2026-08-04
        was: "The 13 registry-components.js files declared 280 capabilities with routes and wires_to consumer edges, and none of it had ever been in loom. The only sync that existed converted them into hooks in a different store."
        now: >
          loom/scanners/capability-map.js. 255 distinct capabilities (280 minus
          25 stale duplicates), 267 hooks, 9 resolved consumer wires. Kept in a
          separate id namespace from the file graph — files are nexus.*,
          capabilities keep their native ids — because a file graph and a
          capability graph answer different questions and merging them yields
          neither. Registry: 1,142 components / 1,564 hooks / 1,182 wires.
        found:
          - "16 of 255 declared capabilities are served by NOTHING. Five of them are bridge's, declared under /api/* while bridge/server.js serves /bridge/* — a prefix mismatch, not a missing feature. They get a component but no .in hook: declared is not the same as real (§1.1)."
          - "FOUR SYSTEMS DECLARE THE RAID FEEDBACK LOOP BACKWARDS. guardian.job.dispatch.complete, ollama.jobs.dispatch.complete, eravos.organism.spawn.complete and emerge.compiler.complete all wire to cortex.raid.feedback — which cortex declares as an OUT hook. A wire cannot terminate on an emitter. RAID is the decision engine and this is its return path; the four systems that feed it have all declared it pointing the wrong way."
          - "4 more consumer targets name nothing at all: copilot.prompt.receive_result, copilot.receive_result, ui.copilot.receive, ui.copilot.stream. The UI's two are the copilot streaming surface."
          - "clear-glass/seam/registry-components.js is a stale v3.0.0 copy of clear-glass/registry-components.js v3.1.0 — 25 identical ids and routes under an older version string (§5.4)."
        open: "None of the above is FIXED. RF-19."

      RF-20_declare_the_path_convention:
        why: >
          There are two route conventions and nothing says which applies where.
          Specs describe /api/<system>/... (orchestrator level);
          registry-components.js describes /api/... (system level). Both are
          real — /api/cortex/gaps is a genuine orchestrator route consumed by
          auth/client.js:439 and cli/nexus-repl-descriptors.js. But because the
          convention is undeclared, cortex, guardian and idearium show 0% spec-
          to-capability match while architect, bridge, emerge and eravos show
          100%, and NOTHING can tell which of those is a problem.
        blocks: "any automated spec-vs-registry drift check. Until this exists, such a check would emit ~100 false findings, and a checker nobody believes is worse than none."
        does: "Declare the convention — which layer owns which prefix, and how a spec states which layer it is written at. Then the join becomes computable and spec-map.js's UNJOINED bucket becomes meaningful."
        gate: "every spec states its layer; the unjoined count drops to routes that are genuinely unimplemented; T-005's guarantee can then be tightened from 'never call it drift' to 'call it drift only when the layers agree it should match'."

      RF-21_spec_duplication:
        why: "Four spec names exist in two locations. Three pairs have DIVERGED — docs/cortex.spec (260 lines) vs cortex/spec/cortex.spec (292), docs/copilot.spec (255) vs copilot/spec/copilot.spec (223), docs/bridge.spec (112) vs bridge/spec/bridge.spec (118). Three systems each have two different contracts, and nothing was reading either against the other. idearium's pair is byte-identical — pure duplication."
        does: "Per system: one canonical location, the other deleted (§16.5). For the three diverged pairs the content must be reconciled first — deleting either one silently discards whichever claims are only in it."
        gate: "one spec per system, SPEC-REGISTRY.md points at it, and the reconciliation names what each copy uniquely contained."

      RF-22_spec_registry_coverage:
        why: "§6.3 says every .spec is tracked in SPEC-REGISTRY.md. Eight are not. Two are phasemaps for arcs that shipped (raid-verification-spine, snapshot-trigger), one is explicitly superseded (nexus-tablet-v0.1.0), two are addenda."
        does: "Track all eight, or record why an addendum/superseded spec is exempt — and if exempt, say so IN the axiom rather than by omission."
        gate: "bootstrap reports 0 untracked, or §6.3 names its exemptions explicitly."

      RF-23_spec_drift_detector_is_dark:
        why: "docs/spec-drift.spec declares GET /api/spec/drift. Nothing serves it. The detector built to catch exactly the class of problem in RF-20/21/22 is itself unreachable — and its absence is why all three went unnoticed."
        does: "Serve it, or retire the spec (§16.5). Not a third state."
        gate: "a live request returns real drift findings, or the spec is gone and lib/version.js records the retirement."

      RF-19_fix_the_declarations:
        does: >
          Three separate corrections, each verified on its own:
            (a) the 16 unserved routes — for each, either implement the handler
                or delete the declaration. Bridge's five are almost certainly a
                path-prefix correction, not five missing features.
            (b) the RAID feedback direction — cortex declares an in-hook for
                feedback, or the four callers stop claiming to wire into an
                emitter. One decision, four files.
            (c) delete clear-glass/seam/registry-components.js if it is the
                stale copy it appears to be (§16.5).
        gate: "per correction: bootstrap reports one fewer unserved route / one fewer dangling wire, and the full suite still passes. Not a batch."

      RF-17_dangling_requires:
        why: >
          loom/scanners/dangling-report.js (built alongside the scanner) prints
          every relative specifier pointing at nothing. Most sit inside
          `try { } catch(_) {}` as optional dependencies, which is legitimate —
          but an optional dependency whose PATH IS SIMPLY WRONG is
          indistinguishable from one legitimately absent, because the catch
          swallows both identically, forever. Confirmed real, live, and silent:
            meta/alk/index.js:121 — require('../cortex/versionium/index'). From
              meta/alk/ that resolves to meta/cortex/..., which has never
              existed. cortex/versionium/index.js DOES exist; the path is one
              `../` short. The §VERSIONIUM pre-rewind snapshot has therefore
              never once been taken, and the catch comment ("versionium may not
              be loaded") describes a condition that is not the real one.
            orchestrator/lib/request-handler.js — same class of error against
              cortex/core/raid/snr-filter and cortex/liminal-space/index, both
              of which exist at the correct depth. The SNR filter and the
              liminal-space engine have never loaded in the request handler.
            cos/foundation/snapshot.js — './process-runner.js', real file at
              cos/compartment/process-runner.js.
        does: "Fix the paths, one at a time, each verified."
        NOT_DONE_ON_PURPOSE: >
          Correcting these makes modules load that have never loaded in this
          system's life. That is a real behavioural change, not a typo fix, and
          it must not ride along inside a registry commit (§17.10 verify before
          promote). Each one needs its own run and its own evidence.
        gate: "per fix: the module loads, the thing it was supposed to do actually happens once, and the full suite still passes."

  # ══════════════════════════════════════════════════════════════════════════
  what_this_map_deliberately_does_not_do:
    - "Does not decide between CFR and RFR2. RF-5 does, after the diffs. Deciding now would be the same confidence-over-evidence move that produced the overlap."
    - "Does not port ERAVOS's nine dimensions into NEXUS. They are browser/ESM and they measure a relationship between two people. The transferable part is the producer/reader split and the abstention discipline, not the dimensions."
    - "Does not invent the twelve layers."
    - "Does not touch WARP. WARP remains the spine; nothing here changes that (§8.3)."
