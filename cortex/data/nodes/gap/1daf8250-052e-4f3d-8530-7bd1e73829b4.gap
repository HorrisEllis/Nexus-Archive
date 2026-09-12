envelope: 1
uuid: nexus-export-gap-1daf8250-052e-4f3d-8530-7bd1e73829b4
type: gap
id: 1daf8250-052e-4f3d-8530-7bd1e73829b4
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822156
source: data/cortex/memory/gaps.json:1daf8250-052e-4f3d-8530-7bd1e73829b4
payload:
  uuid: b920fe71-968f-4f27-8ce9-735fa156f876
  type: system-check.missing-cli
  domain: system
  body: >-
    copilot's real cli layer not found under its own conventions (checked:
    D:\Backups\Downloads\nexus-v0_39_91\nexus\copilot)
  source: copilot
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::system-check.missing-cli::copilot
  occurrences: 3
  detectedAt: 1789169837045
  lastSeenAt: 1789179092649
  meta:
    layer: cli
    vitality: 0.5
  requested: null
  received: null
  systemsInvolved:
    - copilot
  location: copilot
  error: null
  resourceState:
    ts: 1789169837045
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7344259072
      freeMemPct: 0.4295135971085843
      usedMemPct: 0.5704864028914157
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 95502336
      heapUsed: 31353424
      heapTotal: 63619072
      heapUsedPct: 0.4928305775978625
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: null
  priority: 0.3925
  id: 1daf8250-052e-4f3d-8530-7bd1e73829b4
