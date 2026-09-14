envelope: 1
uuid: nexus-export-tool-nexus_intelligence.ad21c543-c646-4dc0-a57f-7a84dcd9b739
type: tool
id: nexus_intelligence.ad21c543-c646-4dc0-a57f-7a84dcd9b739
context: null
intent: null
summary: null
system: null
tags: []
exported_at: 1789332862030
source: lib/agent-tools
occurrences: 1
firstSeenAt: 1789332862030
lastSeenAt: 1789332862030
fingerprint: null
payload:
  name: nexus_intelligence
  description: >-
    Query NEXUS's live intelligence and event surfaces directly, one real signal at a time — use
    this instead of a full diagnose "summary" when you only need one answer, not a whole system
    report. Actions: "events" (event ledger — optional system filter), "status" (intelligence system
    health snapshot), "patterns" (crystallized execution-outcome log — domain/verb/outcome triples),
    "causalPatterns" (recurring CAUSAL event-sequence detection over the live causal graph —
    different from "patterns"; requires enough recent event_log activity, degrades to
    patternsFound:0 honestly when there isn't), "rca" (root cause analysis entries), "intuition"
    (fast intuition answer — requires prompt), "mastermind" (causal analysis — requires prompt;
    reaches RFR2's causal toolkit internally), "cfr" (current CFR field:
    coherence/friction/entropy/regime), "lattice" (associative/causal graph neighbors for a subject
    — requires system), "stream" (live SSE liveness probe on a named system — requires system).
  parameters:
    type: object
    properties:
      action:
        type: string
        enum:
          - events
          - status
          - patterns
          - causalPatterns
          - rca
          - intuition
          - mastermind
          - cfr
          - lattice
          - stream
        description: Which intelligence surface to query
      system:
        type: string
        description: System/subject name — used by "events" (filter), "lattice", "stream"
      prompt:
        type: string
        description: Required for "intuition" and "mastermind"
      context:
        type: string
        description: Optional extra context for "mastermind"
      limit:
        type: number
        description: Row limit for "events"/"patterns"/"causalPatterns"/"rca"
      minOccurrences:
        type: number
        description: Optional, for "causalPatterns" — minimum recurrence count to count as a pattern
      minChainLen:
        type: number
        description: Optional, for "causalPatterns" — minimum causal chain length to consider
    required:
      - action
