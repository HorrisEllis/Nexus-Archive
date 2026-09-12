envelope: 1
uuid: nexus-export-gap-36edd488-4d37-4d12-98e4-15dffb6d76b9
type: gap
id: 36edd488-4d37-4d12-98e4-15dffb6d76b9
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822150
source: data/cortex/memory/gaps.json:36edd488-4d37-4d12-98e4-15dffb6d76b9
payload:
  uuid: dd8cea29-d6d0-4db4-9a61-bdf1fdeeba3c
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.clear-glass.test.userscripts-manifest.test.import' is declared as an INPUT but no
    wire ever targets it — dead code, or a caller that was never wired
  source: nexus.clear-glass.test.userscripts-manifest.test
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.clear-glass.test.userscripts-manifest.test
  occurrences: 1
  detectedAt: 1789169837014
  lastSeenAt: 1789169837014
  meta:
    kernelGapUuid: wire-integrity:nexus.clear-glass.test.userscripts-manifest.test.import
    hookId: nexus.clear-glass.test.userscripts-manifest.test.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.clear-glass.test.userscripts-manifest.test
  location: null
  error: null
  resourceState:
    ts: 1789169837014
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7341862912
      freeMemPct: 0.42937346271371096
      usedMemPct: 0.5706265372862891
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 93921280
      heapUsed: 29199832
      heapTotal: 62373888
      heapUsedPct: 0.46814192503119256
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.clear-glass.test.userscripts-manifest.test
  priority: 0.3925
  id: 36edd488-4d37-4d12-98e4-15dffb6d76b9
