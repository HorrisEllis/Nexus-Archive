envelope: 1
uuid: nexus-export-gap-c3dcfcc5-cd3b-45e8-a291-4d7cbe54f0ff
type: gap
id: c3dcfcc5-cd3b-45e8-a291-4d7cbe54f0ff
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822145
source: data/cortex/memory/gaps.json:c3dcfcc5-cd3b-45e8-a291-4d7cbe54f0ff
payload:
  uuid: 099a237e-f925-4508-8077-2031a816a364
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.lib.agent-tools.user-guide-generator.import' is declared as an INPUT but no wire
    ever targets it — dead code, or a caller that was never wired
  source: nexus.lib.agent-tools.user-guide-generator
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.lib.agent-tools.user-guide-generator
  occurrences: 1
  detectedAt: 1789169836969
  lastSeenAt: 1789169836969
  meta:
    kernelGapUuid: wire-integrity:nexus.lib.agent-tools.user-guide-generator.import
    hookId: nexus.lib.agent-tools.user-guide-generator.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.lib.agent-tools.user-guide-generator
  location: null
  error: null
  resourceState:
    ts: 1789169836969
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7313084416
      freeMemPct: 0.42769041269938607
      usedMemPct: 0.5723095873006139
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 101699584
      heapUsed: 51935408
      heapTotal: 71483392
      heapUsedPct: 0.726538102724616
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.lib.agent-tools.user-guide-generator
  priority: 0.3925
  id: c3dcfcc5-cd3b-45e8-a291-4d7cbe54f0ff
