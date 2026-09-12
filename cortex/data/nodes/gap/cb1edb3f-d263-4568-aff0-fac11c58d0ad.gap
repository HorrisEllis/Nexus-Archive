envelope: 1
uuid: nexus-export-gap-cb1edb3f-d263-4568-aff0-fac11c58d0ad
type: gap
id: cb1edb3f-d263-4568-aff0-fac11c58d0ad
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822176
source: data/cortex/memory/gaps.json:cb1edb3f-d263-4568-aff0-fac11c58d0ad
payload:
  uuid: d4aa16fb-eed8-4e65-ab84-2d86b6912764
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.ui.brainos.brainos-canvas.export' is declared as an OUTPUT but no wire connects it
    to anything — an emit/call with no possible listener
  source: nexus.ui.brainos.brainos-canvas
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.ui.brainos.brainos-canvas
  occurrences: 1
  detectedAt: 1789169897190
  lastSeenAt: 1789169897190
  meta:
    kernelGapUuid: wire-integrity:nexus.ui.brainos.brainos-canvas.export
    hookId: nexus.ui.brainos.brainos-canvas.export
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - nexus.ui.brainos.brainos-canvas
  location: null
  error: null
  resourceState:
    ts: 1789169897190
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5749379072
      freeMemPct: 0.3362403834268681
      usedMemPct: 0.6637596165731319
      cpuPct: 0.5064935064935066
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 83283968
      heapUsed: 34921936
      heapTotal: 60952576
      heapUsedPct: 0.5729361791042269
      external: 2098767
      uptimeSec: 61
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.ui.brainos.brainos-canvas
  priority: 0.3925
  id: cb1edb3f-d263-4568-aff0-fac11c58d0ad
