envelope: 1
uuid: nexus-export-tool-ncp_status.fc2072b5-7db8-4456-8518-a3e5a1c58163
type: tool
id: ncp_status.fc2072b5-7db8-4456-8518-a3e5a1c58163
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862725068
source: lib/agent-tools
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
