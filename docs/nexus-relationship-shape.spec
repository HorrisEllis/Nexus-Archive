spec:
  meta:
    name:        nexus-relationship-shape
    version:     0.1.0
    status:      proposed
    uuid:        nexus-relationship-shape-v1-0000-2026-0701-jamesbrooks-001
    axioms:      [§5.7, §2.3, §12.6]
    depends_on:  [lib/cfr/field.js, lib/cfr/graph.js, lib/cfr/sigma.js,
                  unintegrated/rfr2-nexus/delta, unintegrated/rfr2-nexus/observer,
                  nexus-query-surface]
    purpose: >
      CFR (Coherence-Friction-Resonance-Entropy) and RFR2 together define the
      shape of any interaction — not just NEXUS internal system relationships,
      but any two things that interact: systems, people, ideas, sessions.

      This spec answers: what does it mean for a relationship to have a shape,
      what can you read from that shape, and what the query surface exposes
      when asked about a relationship rather than a single system.

  what_a_shape_is:
    cfr_field: >
      The CFR field is a four-dimensional snapshot of a relationship's
      current state:
        coherence:  how aligned the two sides are right now (0=chaos, 1=perfect alignment)
        friction:   how much resistance exists in the interaction (0=frictionless, 1=blocked)
        resonance:  how much the two sides amplify each other (0=dampening, 1=full resonance)
        entropy:    how much disorder is accumulating in the interaction (0=stable, 1=degrading)
      These four numbers ARE the shape. A relationship with high coherence and
      low friction looks different from one with low coherence and high resonance.
      Both are "working" — they work differently.

    sigma: >
      Sigma is the scalar derived from the CFR field — how stressed the shape is
      overall. It's not a separate concept; it's the field compressed to one
      number for threshold comparison. Sigma > 0.5 = stressed shape.
      Sigma > 0.7 = autonomous loop halts. The shape is the cause; sigma is
      the measurement.

    rfr2_delta: >
      RFR2's delta module measures change in the shape over time. computeEventDelta()
      compares two field snapshots and returns what moved and by how much.
      compressToL1() extracts the dominant change signal. detectFractals() finds
      repeating patterns in the delta history — the same shape change happening
      repeatedly is a structural issue, not a random fluctuation.
      RFR2 doesn't judge the shape (that's sigma's job) — it measures its history.

    causal_graph: >
      lib/cfr/graph.js tracks which events caused which changes in the field.
      ancestors() and descendants() walk the causal chain. A shape change that
      has no clear ancestors in the graph is genuinely novel. A shape change
      that has many ancestors is a known pattern — the same causal chain firing again.

  what_you_can_read_from_a_shape:
    is_this_working: >
      Not "is this running" (that's health checks) but "is this relationship
      producing what it's supposed to?" A guardian→cortex relationship with
      coherence 0.8 and friction 0.1 is working well. The same relationship
      with coherence 0.3 and friction 0.7 is technically running but producing
      a stressed output. Sigma tells you the number; the field tells you why.

    is_this_changing: >
      RFR2's delta over the last N field snapshots shows whether the shape
      is improving (coherence rising), degrading (entropy rising), or stable.
      A shape that's been drifting toward high friction for 3 hours is a
      different situation from a shape that spiked and recovered in 10 minutes.
      The trajectory matters, not just the current reading.

    what_caused_this: >
      The causal graph's ancestors() walk backward from a shape change to the
      event that started it. "Guardian's friction spiked at 18:34" → ancestors()
      returns the NCP disconnect event at 18:33 → whose parent is the chatgpt
      tab reload at 18:32 → whose parent is the Cloudflare interstitial at 18:31.
      That's not a guardian bug. That's a browser event that propagated through
      three systems before expressing as a sigma reading.

    is_this_a_pattern: >
      detectFractals() in RFR2's delta module finds repeated sequences in the
      shape's history. "Guardian's friction spikes every ~45 minutes for ~3 minutes
      then recovers" is a fractal pattern — something on a 45-minute cycle is
      causing it. Without fractal detection, each spike looks novel. With it,
      they're one structural issue with a period.

    what_is_the_relationship_between_two_things: >
      Any two queryable entities can have their shared field shape computed:
      guardian↔cortex, copilot↔ollama, user↔system (via co-pilot's
      conditioning_log), idea↔spec (via idearium + Versionium). The query
      surface returns this as `field: CFRFieldShape` when two subjects are
      compared. The shape is the answer to "how are these two things doing?"

  people_and_ideas_as_subjects:
    motivation: >
      RFR2 is agnostic of domain. The interaction space it measures doesn't
      have to be two software systems. It can be:
        user ↔ system: the conditioning_log is the delta record. Co-pilot's
          response quality over time defines coherence. User frustration events
          (repeated rephrasing, "that's wrong" signals) define friction.
        idea ↔ spec: how well a spec captures the idea's intent. Divergence
          between the idea's `tensioned` state and the spec's scope is friction.
        session ↔ baseline: how different this session's interactions are from
          the established baseline (event-ledger's learned norms). High delta
          = novel session. Low delta = routine.
    constraint: >
      People are never reduced to a sigma score. The conditioning_log tracks
      what co-pilot learned about the *interaction*, not a model of the person.
      §1.3 applies strongly here: the system knows what happened in interactions,
      not what the person is like. These are different things and must be stored
      differently.

  query_surface_integration:
    when_subject_is_a_relationship: >
      GET /api/cortex/query?about=guardian+cortex (two subjects)
      → query surface computes field shape for that pair:
          { from: 'guardian', to: 'cortex',
            field: { coherence: 0.4, friction: 0.6, resonance: 0.3, entropy: 0.5 },
            sigma: 0.58,
            regime: 'stressed',
            trajectory: 'degrading',  # rising friction over last 3h
            causal_root: { event_id: '...', type: 'ncp.disconnect', ts: ... },
            fractal: { detected: true, period_ms: 2700000, occurrences: 4 },
            narrative: "..." }

    when_subject_is_a_single_system: >
      The field shape is computed for every *relationship* that system participates
      in, ranked by sigma. The highest-sigma relationship is the one to look at
      first. The query surface returns all of them, ranked, so the diagnostic view
      shows not just "guardian is stressed" but "guardian's relationship with cortex
      is the source — coherence dropped 0.4 points in the last hour."

  build_order:
    - "1. nexus-query-surface (prerequisite — exposes field shape in QueryResult)"
    - "2. Relationship query support — extend query surface to accept two subjects"
    - "3. Wire RFR2's computeEventDelta() to cfr/field.js snapshots — diff between
         consecutive field states for a given relationship"
    - "4. detectFractals() integration — run over the last N delta records for
         each relationship, surface in the query result"
    - "5. Causal root tracing — ancestors() walk from a field change to the
         originating event, surface in the query result"
    - "6. People/session shape tracking — conditioning_log as RFR2 delta source
         for user↔system relationship shape"
