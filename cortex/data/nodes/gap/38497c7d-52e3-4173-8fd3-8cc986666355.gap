envelope: 1
uuid: nexus-export-gap-38497c7d-52e3-4173-8fd3-8cc986666355
type: gap
id: 38497c7d-52e3-4173-8fd3-8cc986666355
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822140
source: data/cortex/memory/gaps.json:38497c7d-52e3-4173-8fd3-8cc986666355
payload:
  uuid: 3a6d71cd-9729-47bd-b244-26039e2d5175
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.lib.agent-tools.tools.loom-scan.export' is declared as an OUTPUT but no wire
    connects it to anything — an emit/call with no possible listener
  source: nexus.lib.agent-tools.tools.loom-scan
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.lib.agent-tools.tools.loom-scan
  occurrences: 1
  detectedAt: 1789169836959
  lastSeenAt: 1789169836959
  meta:
    kernelGapUuid: wire-integrity:nexus.lib.agent-tools.tools.loom-scan.export
    hookId: nexus.lib.agent-tools.tools.loom-scan.export
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - nexus.lib.agent-tools.tools.loom-scan
  location: null
  error: null
  resourceState:
    ts: 1789169836959
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7315386368
      freeMemPct: 0.42782503753685414
      usedMemPct: 0.5721749624631458
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 101298176
      heapUsed: 51559040
      heapTotal: 71483392
      heapUsedPct: 0.7212729916341967
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.lib.agent-tools.tools.loom-scan
  priority: 0.4387
  id: 38497c7d-52e3-4173-8fd3-8cc986666355
