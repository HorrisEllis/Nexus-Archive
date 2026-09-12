envelope: 1
uuid: nexus-export-gap-dfc12332-7a90-49e5-9d6c-70cd885e5d61
type: gap
id: dfc12332-7a90-49e5-9d6c-70cd885e5d61
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822150
source: data/cortex/memory/gaps.json:dfc12332-7a90-49e5-9d6c-70cd885e5d61
payload:
  uuid: 2a83dbc7-9e43-4066-8a69-e180a6fc2eaf
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.clear-glass.test.network-install.test.import' is declared as an INPUT but no wire
    ever targets it — dead code, or a caller that was never wired
  source: nexus.clear-glass.test.network-install.test
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.clear-glass.test.network-install.test
  occurrences: 1
  detectedAt: 1789169837012
  lastSeenAt: 1789169837012
  meta:
    kernelGapUuid: wire-integrity:nexus.clear-glass.test.network-install.test.import
    hookId: nexus.clear-glass.test.network-install.test.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.clear-glass.test.network-install.test
  location: null
  error: null
  resourceState:
    ts: 1789169837012
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7344623616
      freeMemPct: 0.42953491670028293
      usedMemPct: 0.5704650832997171
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 93921280
      heapUsed: 29125368
      heapTotal: 62373888
      heapUsedPct: 0.4669480921247045
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.clear-glass.test.network-install.test
  priority: 0.3925
  id: dfc12332-7a90-49e5-9d6c-70cd885e5d61
