envelope: 1
uuid: nexus-export-gap-64cf897c-2561-41f9-b010-59ddbaa56438
type: gap
id: 64cf897c-2561-41f9-b010-59ddbaa56438
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822165
source: data/cortex/memory/gaps.json:64cf897c-2561-41f9-b010-59ddbaa56438
payload:
  uuid: bbc1664f-496d-4c4b-baf3-3b5e9e63af59
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.lib.agent-tools.tool-call-listener.export' is declared as an OUTPUT but no wire
    connects it to anything — an emit/call with no possible listener
  source: nexus.lib.agent-tools.tool-call-listener
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.lib.agent-tools.tool-call-listener
  occurrences: 1
  detectedAt: 1789169897135
  lastSeenAt: 1789169897135
  meta:
    kernelGapUuid: wire-integrity:nexus.lib.agent-tools.tool-call-listener.export
    hookId: nexus.lib.agent-tools.tool-call-listener.export
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - nexus.lib.agent-tools.tool-call-listener
  location: null
  error: null
  resourceState:
    ts: 1789169897135
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5756317696
      freeMemPct: 0.33664617430706534
      usedMemPct: 0.6633538256929347
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 80416768
      heapUsed: 30983104
      heapTotal: 60952576
      heapUsedPct: 0.5083149233922452
      external: 2090575
      uptimeSec: 60
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.lib.agent-tools.tool-call-listener
  priority: 0.3925
  id: 64cf897c-2561-41f9-b010-59ddbaa56438
