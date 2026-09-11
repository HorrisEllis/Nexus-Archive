envelope: 1
uuid: nexus-export-tool-call_system.b248c699-4111-4053-b770-ba67f2bec63b
type: tool
id: call_system.b248c699-4111-4053-b770-ba67f2bec63b
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862724952
source: lib/agent-tools
payload:
  name: call_system
  description: >-
    Call any registered NEXUS system. Give an `intent` (natural-language capability, resolved via
    the registry) OR an explicit `system` + `path`. Returns the system's response. Use to reach a
    capability you do not have a dedicated tool for.
  parameters:
    type: object
    properties:
      intent:
        type: string
        description: >-
          Natural-language capability to resolve via the registry, e.g. "crystallised patterns" or
          "open gaps".
      system:
        type: string
        description: Explicit system id (e.g. "cortex", "guardian", "loom") — alternative to intent.
      method:
        type: string
        description: HTTP method (default GET).
      path:
        type: string
        description: Route path when using explicit system, e.g. "/api/gaps".
      body:
        type: object
        description: Optional request body for POST/PUT.
    required: []
