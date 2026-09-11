envelope: 1
uuid: nexus-export-tool-propose_idea.d9e7a1fe-1b67-44f4-a4d7-1f4fc76a49ff
type: tool
id: propose_idea.d9e7a1fe-1b67-44f4-a4d7-1f4fc76a49ff
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1788862724969
source: lib/agent-tools
payload:
  name: propose_idea
  description: >-
    Propose an improvement to NEXUS, to yourself, to the user's process — it lands in idearium as a
    reviewable idea tagged with its provenance, so a machine proposal is never confused with one the
    user had. Actions: "vocabulary" (the required tags and an example — read this first), "propose",
    "pending" (the review queue), "list" (filter by origin/status/about/system), "stats", "reject"
    (with a mandatory note). You CANNOT accept — only a user can. Evidence is mandatory: say what
    you observed and where it can be checked.
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - vocabulary
          - propose
          - pending
          - list
          - stats
          - reject
          - accept
      idea:
        type: object
        description: >-
          { text, about, system?, effort?, evidence:[{kind,detail,where}] } — see action
          "vocabulary"
      origin:
        type: string
        description: 'filter: user | agent | system'
      status:
        type: string
        description: 'filter: proposed | accepted | rejected | built | superseded'
      about:
        type: string
        description: 'filter: nexus | self | user | process'
      system:
        type: string
      slug:
        type: string
        description: for reject
      note:
        type: string
        description: required reason when rejecting
      reviewer:
        type: string
    required:
      - action
