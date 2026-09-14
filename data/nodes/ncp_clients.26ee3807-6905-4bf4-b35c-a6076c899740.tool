envelope: 1
uuid: nexus-export-tool-ncp_clients.26ee3807-6905-4bf4-b35c-a6076c899740
type: tool
id: ncp_clients.26ee3807-6905-4bf4-b35c-a6076c899740
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
  name: ncp_clients
  description: >-
    Real, non-lossy list of every connected NCP client for one provider (tabId, claimed,
    lastHeartbeat, chatId) plus which single tab dispatcher.js's real selection logic would actually
    dispatch the next job to. Use this to diagnose a provider that seems connected but jobs keep
    timing out — it surfaces the real multi-tab conflict (several tabs open for the same provider,
    none claimed) that a plain "connected: true" from ncp_status cannot show.
  parameters:
    type: object
    properties:
      provider:
        type: string
        description: the provider to inspect — e.g. claude, chatgpt, gemini
    required:
      - provider
