envelope: 1
uuid: nexus-export-tool-clear_glass_dom_archaeology.37c00d52-496d-4c7f-a193-11628b1af0ba
type: tool
id: clear_glass_dom_archaeology.37c00d52-496d-4c7f-a193-11628b1af0ba
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862095
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862095
lastSeenAt: 1789332862095
fingerprint: null
payload:
  name: clear_glass_dom_archaeology
  description: >-
    Real DOM inspection for a live ClearGlass browser tab — the exact same window.__cgDomMesh the
    DOM Archaeology panel itself uses, not a separate mechanism. Needs providerId (which real agent
    tab — e.g. "claude", "chatgpt"). Optional query: omitted returns the real, current page tree
    (depth 3); a real query string searches it. Honestly fails — with a specific reason — if
    ClearGlass is not running, the named tab does not exist, or the page has not loaded the DOM mesh
    yet, rather than returning an empty or fabricated result.
  parameters:
    type: object
    properties:
      providerId:
        type: string
        description: which real agent tab — e.g. claude, chatgpt, gemini
      query:
        type: string
        description: optional — a real search query against the live DOM; omit for the full tree
    required:
      - providerId
