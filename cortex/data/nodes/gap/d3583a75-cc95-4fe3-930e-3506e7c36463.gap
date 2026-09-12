envelope: 1
uuid: nexus-export-gap-d3583a75-cc95-4fe3-930e-3506e7c36463
type: gap
id: d3583a75-cc95-4fe3-930e-3506e7c36463
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822168
source: data/cortex/memory/gaps.json:d3583a75-cc95-4fe3-930e-3506e7c36463
payload:
  uuid: f43c8d56-6e34-4433-aafa-df080c376d07
  type: dangling-hook
  domain: system
  body: >-
    hook 'nexus.loom.schema.seam.export' is declared as an OUTPUT but no wire connects it to
    anything — an emit/call with no possible listener
  source: nexus.loom.schema.seam
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::dangling-hook::nexus.loom.schema.seam
  occurrences: 1
  detectedAt: 1789169897144
  lastSeenAt: 1789169897144
  meta:
    kernelGapUuid: wire-integrity:nexus.loom.schema.seam.export
    hookId: nexus.loom.schema.seam.export
    direction: out
  requested: null
  received: null
  systemsInvolved:
    - nexus.loom.schema.seam
  location: null
  error: null
  resourceState:
    ts: 1789169897144
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 5751599104
      freeMemPct: 0.3363702173448533
      usedMemPct: 0.6636297826551467
      cpuPct: 0
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 80474112
      heapUsed: 31697160
      heapTotal: 60952576
      heapUsedPct: 0.5200298671544251
      external: 2098767
      uptimeSec: 60
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: nexus.loom.schema.seam
  priority: 0.3925
  id: d3583a75-cc95-4fe3-930e-3506e7c36463
