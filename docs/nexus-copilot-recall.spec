spec:
  meta:
    name:        nexus-copilot-recall
    version:     1.0.0
    foundation:  nexus-system-foundation@1.0.0
    uuid:        nexus-copilot-recall-v1-0000-2026-0710-jamesbrooks-001
    status:      proposed — map only; build proceeds in chunks below, WARP as spine, drift-checked between chunks
    spine:       WARP
    governing:   AXIOMS-v3.1

# ══════════════════════════════════════════════════════════════════════════════
# COPILOT RECALL — give copilot associative memory across all past
# conversations. Map first (verified against real source), then build in chunks.
# ══════════════════════════════════════════════════════════════════════════════

ground_truth_verified:
  - "cortex GET/POST /api/recall EXISTS — CortexPushRecall.recall(intent,{query},tier), 2 real lanes (lexical token-overlap + recency), honestly 2-of-5 (causal/failure/bep need the kernel causal graph which is absent)"
  - "chat_log persists every exchange (copilot/lifeline.js cw.insert('chat_log',...))"
  - "copilot WRITES to recall (note intent -> /api/push) and logs chat_log"
  - "copilot P103 injects only last-N chat_log by POSITION (recency) at session start — it does NOT query /api/recall semantically"
  the_gap: "copilot has no ASSOCIATIVE recall — it cannot pull 'the conversation about X from last week' when X comes up now, only the literal last few messages. The read infra exists; copilot doesn't call it."

failure_modes_to_avoid:
  - "do NOT claim 5-lane recall — only 2 lanes are real. A recall wire that pretends causal/failure/bep work is a lie."
  - "do NOT let a recall query block or slow the answer — recall is best-effort context, not a hard dependency (§1.2)"
  - "do NOT inject stale/irrelevant recall — rank and threshold, or it poisons the prompt"

chunk_plan:
  spine: "each chunk is a WARP-dispatchable unit; drift check (full.test.js 97/97 + module suite) between chunks so a regression is caught at the chunk that caused it"

  chunk_1_recall_tool:
    intent: "a recall agent-tool so copilot can EXPLICITLY query past conversations (query_recall) — the deliberate 'what did we discuss about X' path"
    builds: "lib/agent-tools/tools/query-recall.js -> cortex /api/recall; honest about 2 lanes; registered as the 9th tool"
    drift_gate: "full.test.js 97/97 + tool registers + honest-degrade test"

  chunk_2_auto_recall_context:
    intent: "copilot AUTOMATICALLY pulls relevant recall into context before answering — associative memory without the user asking"
    builds: "in the prompt-context assembly (P103 region), after last-N chat_log, add a recall query keyed on the current prompt; inject top-K ranked results above a score threshold; best-effort (never blocks)"
    drift_gate: "full.test.js 97/97 + a test that a relevant past exchange surfaces and an irrelevant one does not"

  chunk_3_pattern_logging:
    intent: "log patterns across conversations (the user's 'log patterns' ask) — recurring topics/intents become queryable"
    builds: "reuse mastermind.detectRecurringPatterns (already wired, rfr2 delta) over chat_log-derived events; surface via nexus_intelligence tool. NOTE: this may already be reachable — verify before building, do not duplicate."
    drift_gate: "full.test.js 97/97"

  chunk_4_associative_lattice_link:
    intent: "the non-linear layer — associative system-lattice as the co-activation memory (what topics/systems fire together), pairing with recall's lexical/recency"
    builds: "verify system-lattice (wired this session) can be queried by association from copilot; wire only if a real non-redundant query exists. HONEST: if lexical+recency+patterns already cover it, this chunk is DEFERRED, not faked."
    drift_gate: "full.test.js 97/97"

drift_accounting:
  - "between every chunk: tests/full.test.js must stay 97/97 and the module suite must not lose a passing test"
  - "spec version bumps only after a chunk's real output is confirmed (map-first law)"
  - "if a chunk's premise proves wrong on verification (like part_3's CLI finding), the spec records the correction rather than forcing the build"
