spec:
  meta:
    name:        context-atlas
    version:     1.0.0
    uuid:        nexus-lib-context-atlas-v1-0000-2026-0927-jamesbrooks-001
    status:      active
    since:       0.39.259
    purpose: >
      One door to every memory system and graph NEXUS keeps, so an agent that does not know where something is
      remembered can still find it. James, 2026-09-27: "idearium agents should be able to find the context easily
      when talking to them, all of the memory systems, graphs, etc."

  components:
    - comp_id: nexus.lib.context-atlas
      path: lib/context-atlas.js
      provides: [directory(), search(query, opts), get(source, id), block(query, opts), directoryBlock()]
    - comp_id: nexus.agent-tools.context      # nexus.context.tool — directory | search | get
      path: lib/agent-tools/tools/query/context-atlas.js
    - comp_id: idearium.context               # GET /api/context/{directory,search,get}, GET /api/repos/:uuid/context
      path: idearium/api/index.js
    - comp_id: copilot.routes.context         # GET /api/context/{directory,search,get} on :3750
      path: copilot/routes/opportunity.js
    - comp_id: nexus.lib.repo-prompt-blocks   # 1.1.0: context-memory {memory}, context-directory {directory}
      path: lib/repo-prompt-blocks.js

  sources:
    jaa:        every table in cortex's JAA store (described ones say what they are and which tool reads them deeper)
    repo-graph: <repoDir>/graph.json — imports / imported-by (repo agents: automatic)
    blueprint:  blueprint-index.json — every system's components, CLI commands, routes
    spec:       every *.spec in the tree (not node_modules, data, _archive, repos)
    changelog:  CHANGELOG-*.md at the root
    vector:     lib/vector-memory.js — only where it is initialised in the calling process (needs Ollama)

  invariants:
    - Read-only. No model, no network in the default path: works with Ollama down.
    - Every hit carries source + id; get(source, id) returns the whole record (spec/changelog paths are root-contained).
    - Telemetry tables (event_log, sigma_*, ledgers, …) are skipped by default and listed in `skipped`; naming one in
      sources opts it in. Heavy idearium spec tables are opt-in.
    - Identifiers (id/uuid/*Id/*Uuid and uuid-shaped values) are not searched and not shown in snippets.
    - A repo-scoped search (repoUuid) includes only that repo's repo_hat_memory / repo_agent_log rows, boosted; its graph
      is boosted equally. Prose is weighted below a direct record match.
    - The repo agent's {memory}/{directory} are blocks James can edit or switch off; switched off = no search runs.
    - nexus.context.tool is always in a repo agent's scope (ALWAYS_IN_SCOPE in lib/repo-agent.js), including hats forged
      before it existed.

  not_done:
    - Ranking is keyword-based; semantic recall only where vector memory is initialised.
    - guardian's own JaaStore (artifacts/gaps/ledger in guardian's data dir) is not a separate source; cortex's copy
      of gaps is searched.

  tests: tests/modules/test-context-atlas.test.js (10)
