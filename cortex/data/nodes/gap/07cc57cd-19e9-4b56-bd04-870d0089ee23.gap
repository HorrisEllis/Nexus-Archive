envelope: 1
uuid: nexus-export-gap-07cc57cd-19e9-4b56-bd04-870d0089ee23
type: gap
id: 07cc57cd-19e9-4b56-bd04-870d0089ee23
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822148
source: data/cortex/memory/gaps.json:07cc57cd-19e9-4b56-bd04-870d0089ee23
payload:
  uuid: c416557b-114f-4350-af90-3c8d764b9e63
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.guardian.lib.dispatcher.export' is declared as an OUTPUT but no wire connects it to
    anything — an emit/call with no possible listener
  source: nexus.guardian.lib.dispatcher
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.guardian.lib.dispatcher
  occurrences: 1
  detectedAt: 1789169836993
  lastSeenAt: 1789169836993
  meta:
    kernelGapUuid: wire-integrity:nexus.guardian.lib.dispatcher.export
    hookId: nexus.guardian.lib.dispatcher.export
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - nexus.guardian.lib.dispatcher
  location: null
  error: null
  resourceState:
    ts: 1789169836993
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7325167616
      freeMemPct: 0.42839707332310634
      usedMemPct: 0.5716029266768936
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 102731776
      heapUsed: 52945656
      heapTotal: 71483392
      heapUsedPct: 0.7406707281042287
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.guardian.lib.dispatcher
  priority: 0.3925
  id: 07cc57cd-19e9-4b56-bd04-870d0089ee23
