envelope: 1
uuid: nexus-export-gap-bc13e4c6-5e90-4678-9580-c4bb4f390923
type: gap
id: bc13e4c6-5e90-4678-9580-c4bb4f390923
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822150
source: data/cortex/memory/gaps.json:bc13e4c6-5e90-4678-9580-c4bb4f390923
payload:
  uuid: 763000ed-e965-4bb9-810b-1b90c8bb303f
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.clear-glass.test.downloads-intake-bridge.test.import' is declared as an INPUT but no
    wire ever targets it — dead code, or a caller that was never wired
  source: nexus.clear-glass.test.downloads-intake-bridge.test
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.clear-glass.test.downloads-intake-bridge.test
  occurrences: 1
  detectedAt: 1789169837010
  lastSeenAt: 1789169837010
  meta:
    kernelGapUuid: wire-integrity:nexus.clear-glass.test.downloads-intake-bridge.test.import
    hookId: nexus.clear-glass.test.downloads-intake-bridge.test.import
    direction: in
  requested: null
  received: null
  systemsInvolved:
    - nexus.clear-glass.test.downloads-intake-bridge.test
  location: null
  error: null
  resourceState:
    ts: 1789169837010
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7334617088
      freeMemPct: 0.42894970588545295
      usedMemPct: 0.571050294114547
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 93855744
      heapUsed: 29044352
      heapTotal: 62373888
      heapUsedPct: 0.46564921526136066
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.clear-glass.test.downloads-intake-bridge.test
  priority: 0.3925
  id: bc13e4c6-5e90-4678-9580-c4bb4f390923
