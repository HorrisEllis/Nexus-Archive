envelope: 1
uuid: nexus-export-tool-search-gh
type: tool
id: search-gh
context: clearglass.search_engine.tool export
intent: null
summary: null
system: clearglass
tags: []
exported_at: 1789241419233
source: clearglass.search_engine.tool:gh
payload:
  name: clearglass.search_gh.tool
  description: >-
    Search "GitHub code search" (gh) — a forged tool composing the real
    clearglass.search_engine.tool.
  parameters:
    type: object
    properties:
      query:
        type: string
        description: the real search text
    required:
      - query
  steps:
    - call: tool
      target: clearglass.search_engine.tool
      args:
        action: search
        id: gh
        query: '{$.query}'
