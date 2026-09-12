envelope: 1
uuid: nexus-export-gap-fb6f1f3a-c24e-45fe-bb50-4cee6ff0cbb6
type: gap
id: fb6f1f3a-c24e-45fe-bb50-4cee6ff0cbb6
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822145
source: data/cortex/memory/gaps.json:fb6f1f3a-c24e-45fe-bb50-4cee6ff0cbb6
payload:
  uuid: ae55a5fe-3cbc-4e95-a082-a6a453214539
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.ui.forge-shell.import' is declared as an INPUT but no wire ever targets it — dead
    code, or a caller that was never wired
  source: nexus.ui.forge-shell
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.ui.forge-shell
  occurrences: 1
  detectedAt: 1789169836970
  lastSeenAt: 1789169836970
  meta:
    kernelGapUuid: wire-integrity:nexus.ui.forge-shell.import
    hookId: nexus.ui.forge-shell.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.ui.forge-shell
  location: null
  error: null
  resourceState:
    ts: 1789169836970
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7313850368
      freeMemPct: 0.4277352077965507
      usedMemPct: 0.5722647922034493
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 101765120
      heapUsed: 52038704
      heapTotal: 71483392
      heapUsedPct: 0.7279831376776301
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.ui.forge-shell
  priority: 0.3925
  id: fb6f1f3a-c24e-45fe-bb50-4cee6ff0cbb6
