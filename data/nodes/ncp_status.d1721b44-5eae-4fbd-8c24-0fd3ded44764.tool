envelope: 1
uuid: nexus-export-tool-ncp_status.d1721b44-5eae-4fbd-8c24-0fd3ded44764
type: tool
id: ncp_status.d1721b44-5eae-4fbd-8c24-0fd3ded44764
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862112
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862112
lastSeenAt: 1789332862112
fingerprint: null
payload:
  name: ncp_status
  description: >-
    Check which real agent providers (claude, chatgpt, gemini, perplexity, ollama) are actually
    connected right now via NCP — guardian's real, heartbeat-verified connection map (GET
    /providers), the same live data DA1's Guardian-first dispatch gate already checks before
    routing. Optional provider filters to just one; omit for the full real map.
  parameters:
    type: object
    properties:
      provider:
        type: string
        description: optional — check just this one provider instead of the full map
    required: []
