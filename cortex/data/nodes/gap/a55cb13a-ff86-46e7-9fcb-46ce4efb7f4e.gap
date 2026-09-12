envelope: 1
uuid: nexus-export-gap-a55cb13a-ff86-46e7-9fcb-46ce4efb7f4e
type: gap
id: a55cb13a-ff86-46e7-9fcb-46ce4efb7f4e
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822145
source: data/cortex/memory/gaps.json:a55cb13a-ff86-46e7-9fcb-46ce4efb7f4e
payload:
  uuid: 53949cf0-4260-43fe-ae73-8b71a3dfab0b
  type: dangling-hook
  domain: system
  body: >-
    hook 'cortex.intelligence.intuition.answer' is declared as an OUTPUT but no wire connects it to
    anything — an emit/call with no possible listener
  source: cortex.intelligence.intuition
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::cortex.intelligence.intuition
  occurrences: 1
  detectedAt: 1789169836971
  lastSeenAt: 1789169836971
  meta:
    kernelGapUuid: wire-integrity:cortex.intelligence.intuition.answer
    hookId: cortex.intelligence.intuition.answer
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - cortex.intelligence.intuition
  location: null
  error: null
  resourceState:
    ts: 1789169836971
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7314472960
      freeMemPct: 0.4277716187846204
      usedMemPct: 0.5722283812153797
      cpuPct: 0.5727272727272728
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 101904384
      heapUsed: 52113248
      heapTotal: 71483392
      heapUsedPct: 0.7290259533291313
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: cortex.intelligence.intuition
  priority: 0.3925
  id: a55cb13a-ff86-46e7-9fcb-46ce4efb7f4e
