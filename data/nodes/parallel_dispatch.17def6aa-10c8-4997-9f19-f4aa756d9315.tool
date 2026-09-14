envelope: 1
uuid: nexus-export-tool-parallel_dispatch.17def6aa-10c8-4997-9f19-f4aa756d9315
type: tool
id: parallel_dispatch.17def6aa-10c8-4997-9f19-f4aa756d9315
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862103
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862103
lastSeenAt: 1789332862103
fingerprint: null
payload:
  name: parallel_dispatch
  description: >-
    Real concurrent multi-agent dispatch — DIFFERENT jobs to DIFFERENT agents at the same time, each
    independently RAID-governed, concurrency-capped (default 3, set maxConcurrent). Needs jobs —
    array of {agent, prompt} (agent or hat name). Returns every real result, including real failures
    and real governance denials — never fabricates one "final answer" from independent jobs. Use for
    genuinely independent work (agent A researches X while agent B drafts Y), not for one question
    everyone should answer (that's agent_council) and not for steps that depend on each other
    (that's run_chain).
  parameters:
    type: object
    properties:
      jobs:
        type: array
        items:
          type: object
        description: '[{agent, prompt, label?}, ...]'
      maxConcurrent:
        type: number
        description: default 3 — real cap on how many run at once
    required:
      - jobs
