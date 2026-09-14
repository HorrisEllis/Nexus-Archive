envelope: 1
uuid: nexus-export-tool-run_pipeline.625f73ad-cf56-410e-8210-e69d4554afbc
type: tool
id: run_pipeline.625f73ad-cf56-410e-8210-e69d4554afbc
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862027
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862027
lastSeenAt: 1789332862027
fingerprint: null
payload:
  name: run_pipeline
  description: >-
    Run the NEXUS autonomous execution pipeline (build → sandbox-verify → compare-to-golden →
    governed promote). Actions: "run" (start a pipeline from a spec — requires specPath; optional
    outputDir, provider, testCommand), "status" (get one pipeline by id — requires id), "list"
    (recent pipeline runs). The pipeline self-gates: unproven output is never promoted.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - run
          - status
          - list
        description: run | status | list
      specPath:
        type: string
        description: Absolute path to the .spec file to build (required for run)
      outputDir:
        type: string
        description: Where to write the build output (optional)
      provider:
        type: string
        description: 'Build provider: ollama (default), chatgpt, claude'
      testCommand:
        type: string
        description: Optional test command run inside the sandbox verify stage
      id:
        type: string
        description: Pipeline id (required for status)
    required:
      - action
