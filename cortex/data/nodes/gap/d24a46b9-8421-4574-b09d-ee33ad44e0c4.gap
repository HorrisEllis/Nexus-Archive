envelope: 1
uuid: nexus-export-gap-d24a46b9-8421-4574-b09d-ee33ad44e0c4
type: gap
id: d24a46b9-8421-4574-b09d-ee33ad44e0c4
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822162
source: data/cortex/memory/gaps.json:d24a46b9-8421-4574-b09d-ee33ad44e0c4
payload:
  uuid: 014ba9be-35e0-4f72-b944-e673973f4ed3
  type: baseline_deviation
  domain: system
  body: baseline_deviation
  source: loom
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::baseline_deviation::loom
  occurrences: 2
  detectedAt: 1789169841798
  lastSeenAt: 1789172744809
  meta:
    kernelGapUuid: 70d9f34a-b89b-4ede-9cb0-c039fd5fc7e8
  requested: null
  received: null
  systemsInvolved:
    - loom
  location: null
  error: null
  resourceState:
    ts: 1789169841798
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 6180102144
      freeMemPct: 0.3614303194297656
      usedMemPct: 0.6385696805702343
      cpuPct: 0.33096085409252674
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 86339584
      heapUsed: 19136848
      heapTotal: 50950144
      heapUsedPct: 0.37559948800144705
      external: 2216726
      uptimeSec: 5
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: null
  priority: 0.3925
  id: d24a46b9-8421-4574-b09d-ee33ad44e0c4
