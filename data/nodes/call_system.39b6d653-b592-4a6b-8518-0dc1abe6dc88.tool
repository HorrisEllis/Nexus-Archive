envelope: 1
uuid: nexus-export-tool-call_system.39b6d653-b592-4a6b-8518-0dc1abe6dc88
type: tool
id: call_system.39b6d653-b592-4a6b-8518-0dc1abe6dc88
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862035
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862035
lastSeenAt: 1789332862035
fingerprint: null
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
