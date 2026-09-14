envelope: 1
uuid: nexus-export-tool-macro.3f6c2ac4-51b8-4935-971a-8f5b89a98501
type: tool
id: macro.3f6c2ac4-51b8-4935-971a-8f5b89a98501
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862062
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862062
lastSeenAt: 1789332862062
fingerprint: null
payload:
  name: macro
  description: >-
    Define, store, and replay a named, real sequence of steps against a URL pattern — for repeatable
    multi-step web flows (filling and submitting a form, a recurring multi-page task). Each step
    normally runs through browser_action, but a step can instead set engine:"erosmancer" to run
    through ErosmancerOS's real behavior-modeled execution pipeline (human-like timing/variance,
    adaptive learning) for its natively supported actions
    (click/type/hover/scroll/evaluate/navigate/screenshot) — those steps need a real targetUuid (a
    resolved node identity from erosmancer's own registry), not a CSS selector. IMPORTANT: for
    erosmancer's navigate/type/evaluate specifically, data is the RAW payload value directly (a URL
    string, text string, or JS expression string) — NOT an object like browser_action's
    {url:...}/{selector:...} shape; erosmancer coerces the whole data field with String(data).
    Actions: "create" (name, steps:[{action,data} or {engine:"erosmancer",action,targetUuid,data}],
    urlPattern?, params?:[string], profile?:"precise"|"cautious"|"exploratory"|"turbo",
    description?), "list", "get" (name), "delete" (name), "run" (name, agentId, params?:{},
    skipSnapshot?) — checks the real current URL against the macro's pattern, applies the macro's
    real erosmancer profile if it has any erosmancer steps, takes a real rewind snapshot first
    (rollback point) unless skipSnapshot, then runs every step, stopping at the first real failure.
    "bookmark" (agentId, label) — a real, named state snapshot via the rewind engine. "openBookmark"
    (agentId, label) — navigates back to a bookmark's real, captured URL and restores its
    cookies/storage/scroll state on top; picks the most recent snapshot if the label was bookmarked
    more than once. Step data can use {{paramName}} placeholders, substituted from run's own params
    at execution time.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - create
          - list
          - get
          - delete
          - bookmark
          - openBookmark
          - run
      name:
        type: string
        description: macro name — required for create/get/delete/run
      agentId:
        type: string
        description: which real browser session — required for run/bookmark
      label:
        type: string
        description: required for bookmark
      profile:
        type: string
        enum:
          - precise
          - cautious
          - exploratory
          - turbo
        description: >-
          for create — erosmancer's real behavior profile, applied once per run to any
          erosmancer-engine steps
      urlPattern:
        type: string
        description: >-
          for create — a glob pattern ("*" wildcard) the macro requires the current page to match
          before running
      steps:
        type: array
        description: for create — [{action, data}], each action a real, valid browser_action name
      params:
        description: >-
          for create: string[] of required param names. for run: {name: value} to substitute into
          step data.
      description:
        type: string
        description: optional, for create
      skipSnapshot:
        type: boolean
        description: for run — skip the pre-run rewind snapshot (faster, no rollback point)
    required:
      - action
