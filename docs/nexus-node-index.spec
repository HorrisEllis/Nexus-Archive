spec:
  meta:
    name:        nexus-node-index
    version:     0.1.0
    foundation:  nexus-system-foundation@1.1.0
    status:      specified
    uuid:        nexus-node-index-spec-v0-1-0000-2026-0914-jamesbrooks-001
    author:      james-brooks
    created:     2026-09-14
    governs:
      - lib/node-index.js
      - lib/node-schemas/schema.dom
      - lib/node-schemas/schema.database
      - clear-glass/lib/dom-nodes.js
      - lib/agent-tools/tools/query/query-nodes.js
    purpose: >
      Every system gets one real database. That database holds one table per node type
      it actually writes, as an append-only index of that type's history. The index is
      queryable by an agent through a real .tool, and each system's database is itself a
      real .database node, which is what gives the associative lattice something to draw
      edges between.

  # ── §3.3 MAP BEFORE BUILD ─────────────────────────────────────────────────
  # Written before a line of implementation. What follows is what a recursive
  # read (§8.6) actually found, not what was assumed to be there.
  map_before_build:
    already_real_reused_not_rebuilt:
      - id: guardian/jaa-store.js JaaStore
        finding: >
          The real database primitive, already multi-tenant. Its `tablePrefix` option was
          built 2026-07-18 for exactly this problem — "when multiple systems share one
          directory, an unprefixed instance would blindly load every .json file in the
          directory as its own table." Per-system databases do not need a new store; they
          need a store per system directory, which this already supports. §8.6, §5.5.
      - id: lib/tool-index.js
        finding: >
          The prior art for "an index table ABOUT a node type." register()/touch()
          accumulate consumers/intents/edgeCases/calls over a tool's real lifetime, with
          86 real live rows in data/cortex/memory/tool_index.json. schema.tool_index_entry
          already documents the distinction this spec generalizes: an index entry is
          metadata about a node's real usage, not the node itself.
      - id: lib/node-export.js exportToFile()
        finding: >
          The single chokepoint every node write in the repo passes through — 8 real call
          sites, verified by grep. Indexing belongs here, not at the call sites. §5.3.
      - id: intelligence/lattice/associative-lattice.js
        finding: >
          updateEdge(from, to, eventType, sigma) is real, tested, and — by its own
          honest NOT BUILT YET footer — step 8 "Event-triggered recompute" is NOT WIRED:
          "Nothing in guardian/cortex/idearium/etc calls updateEdge() yet. This module is
          real and callable; nothing calls it in production." This spec supplies the first
          real production caller.
      - id: clear-glass/src/dom/archaeology.js handlePick()
        finding: >
          The real, and only, construction site for `.dom`. Picked elements are described
          in that file's own header as "registered as named hooks" and held in a
          `this.picks` Map — in-memory, per-process, lost on restart. A named addressable
          handle onto a live page that does not survive a restart is a §2.1/§2.2 violation
          sitting in production today.
    what_was_wrong_in_the_existing_taxonomy:
      - claim: 'NODE-TAXONOMY.md: ".jaa, .dom — checked, neither built. JAA is the storage
          substrate under other node types, not a node itself. DOM queries are live and
          ephemeral, never persisted."'
        verdict: half right, and the half that is wrong is load-bearing
        detail: >
          The `.jaa` half stands and is not revisited — JAA is substrate. The `.dom` half
          was reasoning from an implementation detail to an architectural conclusion:
          DOM picks are ephemeral BECAUSE nothing persists them, not because they are
          inherently ephemeral. §0.2 — architecture is permanent, implementations are
          temporary; "the current implementation drops it" is never evidence that it
          should be dropped.

  # ── §16.7 — does this abstraction earn its existence? ─────────────────────
  # Asked before building, answered with evidence rather than intuition.
  why_this_earns_its_existence:
    trigger: >
      §17.7 — "the second occurrence of a bug promotes it to investigation, the third
      promotes it to architecture. A repeated bug indicates a missing primitive, not a
      missing patch." Hand-rolled directory-scan-and-parse is now written three separate
      times: guardian/server.js's GET /api/responses, guardian/lib/response-nodes.js's
      readResponses(), and lib/node-export.js's own queryDir(). Three occurrences of the
      same shape is precisely the axiom's threshold for a missing primitive.
    what_it_removes: >
      Every query against node history currently costs a full readdir plus a YAML parse of
      every file of that type — O(n) parse per question asked. The index answers "what
      exists, how often, first seen, last seen, by which system" without opening a single
      node file. The node files remain the source of truth (§2.2); the index is a
      projection of them (§10.2) and is never written to directly by a consumer.
    what_it_costs: >
      One JaaStore table per node type per system, and one write on the exportToFile path.
      Stated plainly rather than minimized: this is a real write amplification on every
      node creation. It is bounded by being best-effort and non-blocking — an index write
      that fails must never fail the node write it describes.
    rejected_alternatives:
      - option: Index inside node-registry.js's existing _ledger.jsonl
        rejected_because: >
          That ledger is append-only JSONL with no query surface, and node-registry only
          watches guardian's own node dirs. Extending it to every system would make
          guardian the write authority for every other system's history — a direct §5.9
          and §10.1 violation.
      - option: One global index table for all systems
        rejected_because: >
          §10.1 gives each data type exactly one write authority. A shared table means two
          sovereign systems writing the same table, which is the exact failure tablePrefix
          was built to prevent. Also makes the `.database`-per-system node meaningless.
      - option: Extend queryDir() with a cache instead of a real index
        rejected_because: >
          A cache answers the same question faster; it does not answer new questions.
          History — occurrences, firstSeenAt, lastSeenAt — is not derivable from a
          directory listing, because a re-export overwrites the file in place.
      - option: Make .dom a variant of .response
        rejected_because: >
          Different subject, different owner, different lifecycle. A `.response` is one
          moment in a job's answer arriving (guardian owns it). A `.dom` is a durable
          named handle onto an element in a live page (clear-glass owns it). Collapsing
          them would put two write authorities on one type. §10.1.

  # ── §5.10 — the contract ──────────────────────────────────────────────────
  contract:
    module: lib/node-index.js
    inputs:
      - 'forSystem(system) -> NodeIndex — one index per sovereign system, memoized per process'
      - 'record(type, id, meta) -> row — called by exportToFile, not by consumers'
      - 'query({type, system, since, limit}) -> row[]'
      - 'describe() -> the .database node payload for this system'
    outputs:
      - 'one JaaStore table per node type, named node_index_<type>, prefixed per system'
      - 'one .database node per system under <system>/data/nodes/database/'
      - 'one associative-lattice edge per cross-system node reference'
    invariants:
      - 'The index is a projection. A consumer never writes it directly (§10.2).'
      - 'An index write failure never fails the node write it describes (§1.2 — loud, not fatal).'
      - 'One system, one database, one write authority (§10.1, §5.9).'
      - 'History is append-only. A re-export bumps occurrences and lastSeenAt; it never
         overwrites firstSeenAt (§0.3).'
      - 'ts is logical ordering; wall clock is display metadata only (§3.2).'
    failure_modes:
      - id: INDEX_WRITE_FAILED
        behavior: warned to console, node write still succeeds, returns {indexed:false}
      - id: UNKNOWN_SYSTEM
        behavior: refused — an index with no owning system has no write authority (§17.1)
      - id: LATTICE_UNREACHABLE
        behavior: >
          edge skipped, index write unaffected. The lattice is a consumer of this data,
          never a gate on it.

  # ── §3.1 / §3.4 build order ───────────────────────────────────────────────
  build_order:
    - step: 1
      id: schema.dom + schema.database
      gate: both validate through node-schemas.checkPayload against a real payload
    - step: 2
      id: lib/node-index.js
      gate: writes, reads back, and bumps occurrences on re-export, against a real temp store
    - step: 3
      id: exportToFile indexes every write
      gate: an existing .response write produces an index row with no call-site change
    - step: 4
      id: clear-glass/lib/dom-nodes.js — .dom persistence for picks
      gate: a pick survives a simulated process restart
    - step: 5
      id: .database node + associative-lattice edge
      gate: updateEdge has a real production caller for the first time
    - step: 6
      id: query_nodes .tool
      gate: registered in lib/agent-tools/index.js and returns real rows
    - step: 7
      id: CLI surface
      gate: '§3.4 — exercisable from raw code, then library, then tool, then CLI'

  not_built_yet:
    - 'Cross-system index federation (one query spanning every system''s database). The
       per-system indexes are real and each is queryable; a federated reader over all of
       them is a separate, larger piece and is not pretended at here.'
    - 'Index compaction/decay. cortex/memory/table-compactor.js exists and is the right
       home for it, but no real volume threshold has been observed yet — building a
       compaction policy against an imagined volume is §16.4.'
    - 'Retro-indexing of node files that already exist on disk from before this spec. The
       index starts from the first write after it lands, and says so rather than claiming
       a completeness it does not have.'
