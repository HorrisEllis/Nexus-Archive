envelope: 1
uuid: nexus-export-gap-2d13306f-c73d-42a6-9379-2e2da2865a10
type: gap
id: 2d13306f-c73d-42a6-9379-2e2da2865a10
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822162
source: data/cortex/memory/gaps.json:2d13306f-c73d-42a6-9379-2e2da2865a10
payload:
  uuid: 087484fe-775e-4360-b5e6-d438e2c98510
  type: baseline_deviation
  domain: system
  body: baseline_deviation
  source: eravos
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::baseline_deviation::eravos
  occurrences: 2
  detectedAt: 1789169841768
  lastSeenAt: 1789172744289
  meta:
    kernelGapUuid: 951f6ce5-7099-4d27-a5e3-7c5b232803f7
  requested: null
  received: null
  systemsInvolved:
    - eravos
  location: null
  error: null
  resourceState:
    ts: 1789169841768
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 6194245632
      freeMemPct: 0.3622574716784795
      usedMemPct: 0.6377425283215206
      cpuPct: 0.6774952671434582
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 86339584
      heapUsed: 18907888
      heapTotal: 50950144
      heapUsedPct: 0.3711056832341828
      external: 2216355
      uptimeSec: 5
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: null
  priority: 0.3925
  id: 2d13306f-c73d-42a6-9379-2e2da2865a10
