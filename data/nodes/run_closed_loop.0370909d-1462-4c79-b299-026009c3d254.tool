envelope: 1
uuid: nexus-export-tool-run_closed_loop.0370909d-1462-4c79-b299-026009c3d254
type: tool
id: run_closed_loop.0370909d-1462-4c79-b299-026009c3d254
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862031
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862031
lastSeenAt: 1789332862031
fingerprint: null
payload:
  name: run_closed_loop
  description: >-
    Import a spec and automatically build a repository from it: create the spec manifest, chunk it,
    and populate every chunk via the WARP build spine, then create a repo. Params: name (required
    unless repoUuid given), description (the spec intent), type (component|service|library, default
    component), agent (ollama default), repoUuid (optional — build INTO an existing repo, e.g. one
    just created by the Import Project screen, instead of starting from an empty spec). Returns the
    spec id, populate progress, and repo id. Use run_pipeline afterward to build→verify→promote from
    the spec path.
  parameters:
    type: object
    properties:
      name:
        type: string
        description: Spec/repo name (required unless repoUuid given)
      description:
        type: string
        description: >-
          What the spec should build (the intent) — ignored when repoUuid is given, the imported
          repo IS the intent
      type:
        type: string
        description: component | service | library (default component)
      agent:
        type: string
        description: >-
          Build agent: ollama (default), chatgpt, claude, gemini, deepseek — passed through to
          spec-engine unchanged, not validated against a whitelist here (see spec-drift.js /
          provider-routing.js for what guardian actually accepts)
      repoUuid:
        type: string
        description: >-
          Optional — an existing repo (e.g. from Import Project) to build against. When given, stage
          1 resolves that repo's real specUuid instead of creating a new empty spec, and stage 3 is
          skipped (the build writes into the same repo, no duplicate created).
    required: []
