envelope: 1
uuid: nexus-export-tool-module_builder.49f65891-0cc3-4059-a652-8f5df8facc21
type: tool
id: module_builder.49f65891-0cc3-4059-a652-8f5df8facc21
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862724942
source: lib/agent-tools
payload:
  name: module_builder
  description: >-
    Build a new NEXUS module from a natural-language description, running the full spec → QC → build
    pipeline. Returns the build result. Use when the user wants to CREATE a new component or
    capability.
  parameters:
    type: object
    properties:
      description:
        type: string
        description: What the module should do, in plain language.
    required:
      - description
