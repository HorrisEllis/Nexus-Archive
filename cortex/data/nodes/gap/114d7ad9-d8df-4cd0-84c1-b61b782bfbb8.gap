envelope: 1
uuid: nexus-export-gap-114d7ad9-d8df-4cd0-84c1-b61b782bfbb8
type: gap
id: 114d7ad9-d8df-4cd0-84c1-b61b782bfbb8
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822147
source: data/cortex/memory/gaps.json:114d7ad9-d8df-4cd0-84c1-b61b782bfbb8
payload:
  uuid: 6774dc45-5c18-4aa2-99e9-8da2081e766b
  type: dangling-hook
  domain: system
  body: >-
    hook 'copilot.introspect.verdict' is declared as an OUTPUT but no wire connects it to anything —
    an emit/call with no possible listener
  source: copilot.introspect.examine
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::copilot.introspect.examine
  occurrences: 1
  detectedAt: 1789169836983
  lastSeenAt: 1789169836983
  meta:
    kernelGapUuid: wire-integrity:copilot.introspect.verdict
    hookId: copilot.introspect.verdict
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - copilot.introspect.examine
  location: null
  error: null
  resourceState:
    ts: 1789169836983
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7321575424
      freeMemPct: 0.42818699150378337
      usedMemPct: 0.5718130084962166
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 102412288
      heapUsed: 52648712
      heapTotal: 71483392
      heapUsedPct: 0.7365167002707426
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: copilot.introspect.examine
  priority: 0.3925
  id: 114d7ad9-d8df-4cd0-84c1-b61b782bfbb8
