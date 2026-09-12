envelope: 1
uuid: nexus-export-gap-76fec2d3-4e7d-4208-b3fa-6d9eb64f2a83
type: gap
id: 76fec2d3-4e7d-4208-b3fa-6d9eb64f2a83
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822154
source: data/cortex/memory/gaps.json:76fec2d3-4e7d-4208-b3fa-6d9eb64f2a83
payload:
  uuid: 8b447137-410f-42b8-8995-d7cb2d45db4b
  type: system-check.missing-ui
  domain: system
  body: >-
    diagnostic's real ui layer not found under its own conventions (checked:
    D:\Backups\Downloads\nexus-v0_39_91\nexus\service)
  source: diagnostic
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::system-check.missing-ui::diagnostic
  occurrences: 3
  detectedAt: 1789169837038
  lastSeenAt: 1789179092610
  meta:
    layer: ui
    vitality: 0.8
  requested: null
  received: null
  systemsInvolved:
    - diagnostic
  location: service
  error: null
  resourceState:
    ts: 1789169837038
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7345557504
      freeMemPct: 0.4295895331823874
      usedMemPct: 0.5704104668176126
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 95498240
      heapUsed: 30834088
      heapTotal: 63619072
      heapUsedPct: 0.48466736515741693
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: null
  priority: 0.4975
  id: 76fec2d3-4e7d-4208-b3fa-6d9eb64f2a83
