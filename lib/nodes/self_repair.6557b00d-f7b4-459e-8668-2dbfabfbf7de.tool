envelope: 1
uuid: nexus-export-tool-self_repair.6557b00d-f7b4-459e-8668-2dbfabfbf7de
type: tool
id: self_repair.6557b00d-f7b4-459e-8668-2dbfabfbf7de
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862725002
source: lib/agent-tools
payload:
  name: self_repair
  description: >-
    Real, three-stage self-repair pipeline. "propose" (needs name, targetFile, newContent) copies
    the real live file into a compartment, takes a real snapshot (a genuine rewind point), then
    writes the proposed content — the live project is never touched at this stage. "test" (needs
    name, entryFile) spawns a real process inside the compartment and returns real exit
    code/stdout/stderr. "promote" (needs name, targetFile, testResult) ONLY succeeds if
    testResult.passed is true — copies the edited file back to the live project, then logs a real
    change to cortex and checks loom registration, loud about anything not auto-completed (like a
    spec addendum), never silent.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - propose
          - test
          - promote
      name:
        type: string
        description: compartment name for this repair
      targetFile:
        type: string
        description: real path relative to the project root
      newContent:
        type: string
        description: for "propose" — the real, full proposed new content
      entryFile:
        type: string
        description: for "test" — a real file path inside the compartment to run, e.g. the test file itself
      runtimeId:
        type: string
        description: for "test" — default "node"
      entryArgs:
        type: array
        description: for "test" — optional real args passed to the entry file
      timeoutMs:
        type: number
        description: for "test" — default 30000
      testResult:
        type: object
        description: for "promote" — the real object returned by a prior "test" call
      description:
        type: string
        description: for "promote" — a real, short description of what changed and why
    required:
      - action
