# NEXUS — What-If Loop
**Every new piece (ASE, full ALK, resonance, IRS, affect, the epistemic-branch
cluster, CQL, kern-v2-as-cross-project) crossed against every existing system.**
Stopped when ideas stopped being grounded in something real about the system
and started being filler — that happened around #50, so this is the real list.

Format: **What if** → why it's not just a word-collision, what it'd actually do.

---

## Orchestrator (:9000)

1. **What if orchestrator ran its own `affect.js`, one level up?** Every sovereign
   system already has a local CFR field. An orchestrator-level field that's a
   weighted aggregate of all of them gives you one number for "is NEXUS as a
   whole settled or strained" instead of having to check 9 dashboards.
2. **What if NEXUS_STATE snapshots used Causal-Nexus's `compress.js` delta
   encoding** instead of raw JSON? It's already built for exactly this —
   type dictionary, payload deltas, 3-15x smaller. Free win, no new design.
3. **What if `/api/contract` answered in natural language via CQL** — "why
   did bridge open its circuit breaker last night" translated to a CQL query
   over the causal graph, not a manual log read. This is the single most
   copilot-relevant use of the query engine from two sessions ago.
4. **What if kern-v2's grammar-intersection handshake became the federation
   primitive** for multiple independent NEXUS instances (different people,
   different orchestrators) discovering what capabilities they share? This
   is the one that actually matters if "my own social media" ever federates.

## Bridge (:9999)

5. **What if relay requests got an ASE signature instead of art getting one?**
   Same engine, same code, pointed at request *types* instead of posts —
   does retrying this kind of request ever actually help (`deepening` trust)
   or does it keep failing the same way (`dissolving`)? Bridge currently
   just retries blindly up to REPLAY_LIMIT; this would tell it which request
   shapes are worth retrying at all.
6. **What if bridge is the pilot system for the epistemic-branch cluster**
   (clip/context/adapter-sandbox)? It's small, self-contained, and a circuit
   breaker decision is exactly a clone-state-simulate-compare problem — try
   reopening the circuit in a `ReplayContext` before actually doing it live.

## Cortex (:3748)

7. **What if RAID watched its own learning curve with the S-curve analysis
   template?** Routing-success-rate over time, classified into
   lag/acceleration/inflection/saturation — RAID literally reporting "I've
   plateaued on this provider" instead of you having to notice it.
8. **What if a confirmed INVERSION became a first-class crystal-lattice
   entry** — "the system was wrong about X, here's how" stored as its own
   memory type instead of the old hypothesis just getting quietly overwritten?
   That's a different kind of memory than a success pattern — worth keeping
   separately, the same way SYSTEM-MAP keeps "missing" as a typed status.
9. **What if copilot could ask cortex "show me every time my confidence
   about a hypothesis dropped right after I gave advice based on it"?**
   That's a CQL query over user-model's own decay history — a literal,
   queryable conscience, not a metaphor.

## Guardian (:7820)

10. **What if SEAM retries got their own tiny `affect.js`?** Not copilot's
    state — a per-job one. Attempt 3 with accumulated "strain" gets a
    different prompt strategy than attempt 1, instead of literally the same
    retry three times and giving up.
11. **What if ASE tracked prompt *phrasings* as works instead of posts?**
    Which phrasing of a SEAM instruction deepens success rate vs. dissolves
    it, across many jobs — a style guide that emerges from data instead of
    being hand-written and going stale.

## Idearium (:4800)

12. **What if idearium's lattice — which already calls itself
    "resonance-weighted" in its own spec — actually used the resonance
    engine instead of just borrowing the word?** This is the cleanest,
    most direct fit in the entire list. The spec already describes exactly
    what the engine does; they're just not connected yet.
13. **What if an idea's phase transitions got ASE's trajectory model?**
    Ideas as works — "this idea is dissolving" as a gentle signal when one's
    been stuck in `tensioned` for weeks, instead of it silently rotting with
    no signal at all. Pairs directly with closing idearium's AX-008 gap
    (zero `wires_to` — the worst violation found last session) — this would
    be a real, useful first wire to add.

## Architect (:3747)

14. **What if architect ran the S-curve template on itself** — detecting
    when its own spec-drift checker should flag a system as actively
    drifting (regime: accelerating-away-from-spec) instead of binary
    synced/not-synced? Would have caught the three-way architect version
    drift from last session as a trend, not just a snapshot mismatch.
15. **What if `architect.hooks.graph` answered "show me every hook within N
    hops of copilot" as a CQL query?** Turns AX-008 auditing from a manual
    grep (what I did, by hand, last session) into a standing query anyone
    can run.

## Emerge (:4242)

16. **What if `.eg` files could declare an `analysis_module:` block directly?**
    Closes the loop between module-builder's spec generation and emerge's
    compiler for the analysis-template family specifically — writing an
    S-curve detector becomes a normal `.eg` compile, not a special case.
17. **What if hot-loaded modules accumulated their own strain score** across
    repeated QUARANTINE→ROLLBACK cycles? A module rolled back four times
    this week is a different kind of problem than one rolled back once —
    chronic-strain modules get flagged for a human, not endlessly retried.

## Diagnostic (:7825)

18. **What if closing diagnostic's missing-registry-components.js gap (found
    last session) is paired with ASE applied to *recurring gaps* instead of
    posts?** Same trajectory model — "this gap pattern is deepening" (keeps
    getting worse despite fixes) vs. "dissolving" (fixes are sticking) —
    turns the open/closed binary into an actual trend line.

## Copilot (:3750)

19. **What if `affect.js`'s regime gates module-builder's autonomy?** In
    `adrift` or `strained`, automatically drop `MAX_ITER` and require human
    confirmation before auto-fixing a spec — copilot's own state literally
    changing how much it's allowed to do alone, not just how it talks.
20. **What if an INVERSION candidate triggers copilot to ask about it,
    instead of just logging it?** "I keep getting surprised by X — can I
    ask you about that?" at a natural pause — copilot acting on its own
    uncertainty in conversation, not just storing it for later.

## Eravos (:3751)

21. **What if ASE's trajectory view is a literal organism on the canvas?**
    Drag it on, wire it to a content stream via the existing
    `organism.spawn`/`wire.connect`, watch resonance trajectories move in
    real time — no new UI framework needed, just a new organism type.
22. **What if `wire.connect` used grammar-intersection to suggest only
    compatible hook pairs** when you're about to wire two organisms,
    instead of letting you wire anything and finding out it's broken later?

## Ollama (:11434)

23. **What if a model's output quality got the sigma/delta drift treatment
    mid-session** — the same shape as divergence-watcher, but per-model,
    proactively suggesting a context reset when local output starts
    degrading instead of waiting for a downstream failure to notice?

## The full ALK + resonance + ASE + IRS combination, specifically for the social platform

24. **The cleanest, most unambiguously good use of the full behavior-detector
    ALK: platform integrity, not interpersonal reading.** The same 9
    detectors that *could* read relational dynamics between two people can
    instead watch for coordinated inauthentic behavior — bot networks,
    brigading, vote manipulation. Same machinery, pointed at the platform
    defending itself instead of reading its users. Worth building this
    application *first*, since it's the version with no consent question
    attached at all.
25. **IRS's identity-scale INVERSION as account-security, not psychology.**
    "This account suddenly writes very differently" (ASE signature drift on
    a *person's* posting pattern, not a single post) is the actual
    mechanism behind soft account-takeover detection — flag for the
    account owner's own review, never a public label. This is a genuinely
    good use of identity-scale reading that's beneficial almost by
    construction — it's security, not surveillance, because the only
    person who sees the flag is the account holder themselves.
26. **What if resonance-distance matching deliberately surfaces some "far
    field" connections, not just close matches?** The prototype currently
    uses resonance distance to find people worth connecting with — all
    pointed toward similarity. A platform that only ever shows you your
    closest matches is a filter bubble with better branding. Occasionally
    surfacing a "different wavelength" connection on purpose, labeled as
    such, is a small design choice that fights that by default instead of
    needing a separate feature later to fix it.
27. **What if the private relational-pattern signal (rupture/repair,
    escalation) is delivered *by copilot*, in copilot's own voice, instead
    of as a cold system flag?** "This thread's been escalating — want help
    thinking through a response?" keeps one consistent, legible voice
    behind every sensitive signal on the platform, rather than mystery
    automation nobody can ask follow-up questions of. Ties directly back
    to `affect.js` — copilot noticing this in a conversation is exactly the
    kind of event that should nudge its own `uncertainty`/`strain`, since
    it's now holding something delicate.

---

## Where it stopped being grounded

Round two started generating things like "what if guardian's NCP providers
had ASE signatures" (a provider isn't a work, nothing resonates with it,
this is just keyword reuse) and "what if the hook registry had a mood"
(architect's hooks aren't a population anyone is having repeat encounters
with — there's no audience for the affect model to track). That's the
signal to stop: when the same four words start getting bolted onto a system
that has no actual analog of "repeat encounter," "audience," or "regime
change," it's pattern-matching the vocabulary, not the architecture.

## If you want a next concrete build, the strongest three are:

- **#12 — wire resonance into idearium's lattice.** Already half-described
  in idearium's own spec. Smallest gap between "what if" and "already true."
- **#24 — full ALK as platform-integrity detector.** No consent question
  attached, immediately useful, and validates the ported kernel before
  pointing it at anything more sensitive.
- **#25 — identity-scale INVERSION as account security.** Same — clean,
  beneficial, no third-party-modeling question to resolve first.
