envelope: 1
uuid: nexus-export-tool-clear_glass_dom_archaeology.4254c806-066a-473c-8ad4-e12f8c806f6d
type: tool
id: clear_glass_dom_archaeology.4254c806-066a-473c-8ad4-e12f8c806f6d
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862725023
source: lib/agent-tools
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
