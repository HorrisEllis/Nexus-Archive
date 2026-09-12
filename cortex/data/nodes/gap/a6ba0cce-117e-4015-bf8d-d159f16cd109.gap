envelope: 1
uuid: nexus-export-gap-a6ba0cce-117e-4015-bf8d-d159f16cd109
type: gap
id: a6ba0cce-117e-4015-bf8d-d159f16cd109
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822164
source: data/cortex/memory/gaps.json:a6ba0cce-117e-4015-bf8d-d159f16cd109
payload:
  uuid: c078d259-55c9-4db6-b161-5d4598a54665
  type: baseline_deviation
  domain: system
  body: baseline_deviation
  source: clear-glass
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::baseline_deviation::clear-glass
  occurrences: 2
  detectedAt: 1789169842512
  lastSeenAt: 1789172744785
  meta:
    kernelGapUuid: d1cfbd76-5f2f-401e-b77c-22d13eb4f892
  requested: null
  received: null
  systemsInvolved:
    - clear-glass
  location: null
  error: null
  resourceState:
    ts: 1789169842512
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 6190149632
      freeMemPct: 0.36201792570433705
      usedMemPct: 0.637982074295663
      cpuPct: 0.298771676300578
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 86454272
      heapUsed: 20805400
      heapTotal: 51212288
      heapUsedPct: 0.4062579668379589
      external: 2247531
      uptimeSec: 6
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: null
  priority: 0.3925
  id: a6ba0cce-117e-4015-bf8d-d159f16cd109
