envelope: 1
uuid: nexus-export-tool-clear_glass_dom_mutate.791ac8b0-957e-4ce7-b577-9a156437439b
type: tool
id: clear_glass_dom_mutate.791ac8b0-957e-4ce7-b577-9a156437439b
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862098
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862098
lastSeenAt: 1789332862098
fingerprint: null
payload:
  name: clear_glass_dom_mutate
  description: >-
    Real DOM mutation on a live ClearGlass browser tab — sets text/html/value/style/attrs on one
    element, or removes it, via the same window.__cgDomMesh.mutate() the DOM Archaeology panel
    itself uses. Needs providerId and either cgId (from a prior clear_glass_dom_archaeology result)
    or a CSS selector, plus a mutation object ({text, html, value, style, attrs, remove}). Honestly
    fails — with a specific reason (no live window, element not found) — rather than fabricating
    success.
  parameters:
    type: object
    properties:
      providerId:
        type: string
        description: which real agent tab — e.g. claude, chatgpt, gemini
      cgId:
        type: string
        description: the target element's cgId, if already known from a query
      selector:
        type: string
        description: a CSS selector to resolve to an element, if cgId is not known
      mutation:
        type: object
        description: 'what to change: {text, html, value, style, attrs, remove} — any subset'
    required:
      - providerId
      - mutation
