envelope: 1
uuid: nexus-export-tool-raid_submit_contract.0286ceb4-17ea-42db-88c7-c1b792a92951
type: tool
id: raid_submit_contract.0286ceb4-17ea-42db-88c7-c1b792a92951
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
  name: raid_submit_contract
  description: >-
    Submit a real contract into RAID's queue (cortex's POST /api/raid/submit) — the same real
    pipeline every contract in this system goes through (queued -> handshake -> processing ->
    output). Set executionSurface to "browser" to run this contract against a live ClearGlass
    browser tab instead of the default internal compartment; when doing that, domSteps (an ordered
    array of {action:"query"|"mutate", providerId, selector, cgId, mutation}) runs real page
    interaction instead of dispatching a chat prompt. Returns the real queueId to track it with (GET
    /api/raid/queue). Honestly refuses — with the real reason — bad input (no content, an invalid
    executionSurface) rather than fabricating a queued contract.
  parameters:
    type: object
    properties:
      content:
        type: string
        description: the real contract text/prompt
      source:
        type: string
        description: optional — who/what this contract is from; defaults to "api"
      forAgent:
        type: string
        description: optional — target agent, e.g. claude, chatgpt, gemini
      intention:
        type: string
        description: 'optional — a real verb: build, write, analyze, query, dispatch, etc.'
      dir:
        type: string
        description: optional — real working directory this contract touches
      system:
        type: string
        description: optional — which system this contract concerns
      dependsOn:
        type: array
        description: optional — queueIds this contract requires to PASS first
      executionSurface:
        type: string
        description: '"internal" (default) or "browser" — see description'
      domSteps:
        type: array
        description: >-
          optional, only meaningful with executionSurface:"browser" — ordered [{action, providerId,
          selector, cgId, mutation}]
    required:
      - content
