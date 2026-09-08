envelope: 1
uuid: nexus-export-tool-emergence.5bce4687-07e4-4c2b-83f1-e805235d7e6c
type: tool
id: emergence.5bce4687-07e4-4c2b-83f1-e805235d7e6c
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862725049
source: lib/agent-tools
payload:
  name: emergence
  description: >-
    Real axioms + end-state -> iteratively propose, verify in an isolated real branch (safe_apply),
    and refine. If the SAME method fails repeatedly (pivotAfter, default 3), the next prompt
    explicitly asks for a genuinely different approach instead of another refinement — "innovate the
    problem, or if that fails, innovate the method." Needs targetDir (mirrored into a fresh
    compartment), axioms (array of real constraints), endState (what acceptable means), files
    (starting content), agent (who proposes candidates), entryFile (the real check — usually the
    changed file itself).
  parameters:
    type: object
    properties:
      targetDir:
        type: string
        description: real directory to mirror for isolated attempts
      axioms:
        type: array
        items:
          type: string
      endState:
        type: string
      files:
        type: object
        description: '{ "relative/path": "starting content" }'
      agent:
        type: string
        description: ollama/claude/chatgpt/gemini/mistral/perplexity, or a forged hat name
      entryFile:
        type: string
        description: real file to run as the check each attempt
      maxIterations:
        type: number
      pivotAfter:
        type: number
        description: default 3 — consecutive same-method failures before the method itself is asked to change
    required:
      - targetDir
      - axioms
      - endState
      - files
      - agent
      - entryFile
