envelope: 1
uuid: nexus-export-gap-7c0a0d75-1523-49ce-9e4a-549dfb165ba6
type: gap
id: 7c0a0d75-1523-49ce-9e4a-549dfb165ba6
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822147
source: data/cortex/memory/gaps.json:7c0a0d75-1523-49ce-9e4a-549dfb165ba6
payload:
  uuid: 946d4373-c576-4f2d-8893-ec38702fc647
  type: dangling-hook
  domain: system
  body: >-
    hook 'copilot.introspect.retried' is declared as an OUTPUT but no wire connects it to anything —
    an emit/call with no possible listener
  source: copilot.introspect.retry
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::copilot.introspect.retry
  occurrences: 1
  detectedAt: 1789169836985
  lastSeenAt: 1789169836985
  meta:
    kernelGapUuid: wire-integrity:copilot.introspect.retried
    hookId: copilot.introspect.retried
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - copilot.introspect.retry
  location: null
  error: null
  resourceState:
    ts: 1789169836985
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7323013120
      freeMemPct: 0.42827107214070737
      usedMemPct: 0.5717289278592926
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 102543360
      heapUsed: 52721440
      heapTotal: 71483392
      heapUsedPct: 0.7375341114198946
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: copilot.introspect.retry
  priority: 0.3925
  id: 7c0a0d75-1523-49ce-9e4a-549dfb165ba6
