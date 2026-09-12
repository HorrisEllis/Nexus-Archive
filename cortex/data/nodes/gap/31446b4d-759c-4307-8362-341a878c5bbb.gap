envelope: 1
uuid: nexus-export-gap-31446b4d-759c-4307-8362-341a878c5bbb
type: gap
id: 31446b4d-759c-4307-8362-341a878c5bbb
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822158
source: data/cortex/memory/gaps.json:31446b4d-759c-4307-8362-341a878c5bbb
payload:
  uuid: 06d3df78-0d76-4978-9732-e4f59d2b519c
  type: system-check.missing-events
  domain: system
  body: >-
    emerge's real events layer not found under its own conventions (checked:
    D:\Backups\Downloads\nexus-v0_39_91\nexus\emerge)
  source: emerge
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::system-check.missing-events::emerge
  occurrences: 3
  detectedAt: 1789169837056
  lastSeenAt: 1789179092686
  meta:
    layer: events
    vitality: 0.3
  requested: null
  received: null
  systemsInvolved:
    - emerge
  location: emerge
  error: null
  resourceState:
    ts: 1789169837056
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7341047808
      freeMemPct: 0.4293257930648566
      usedMemPct: 0.5706742069351434
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 95825920
      heapUsed: 32054280
      heapTotal: 63922176
      heapUsedPct: 0.5014578978037293
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: null
  priority: 0.3225
  id: 31446b4d-759c-4307-8362-341a878c5bbb
