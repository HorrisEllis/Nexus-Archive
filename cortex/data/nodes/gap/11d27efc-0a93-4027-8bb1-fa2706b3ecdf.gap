envelope: 1
uuid: nexus-export-gap-11d27efc-0a93-4027-8bb1-fa2706b3ecdf
type: gap
id: 11d27efc-0a93-4027-8bb1-fa2706b3ecdf
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822151
source: data/cortex/memory/gaps.json:11d27efc-0a93-4027-8bb1-fa2706b3ecdf
payload:
  uuid: b3e296e2-59b4-4650-a08e-86abb3f04083
  type: system-check.missing-events
  domain: system
  body: >-
    orchestrator's real events layer not found under its own conventions (checked:
    D:\Backups\Downloads\nexus-v0_39_91\nexus)
  source: orchestrator
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::system-check.missing-events::orchestrator
  occurrences: 3
  detectedAt: 1789169837023
  lastSeenAt: 1789179092598
  meta:
    layer: events
    vitality: 0.8
  requested: null
  received: null
  systemsInvolved:
    - orchestrator
  location: .
  error: null
  resourceState:
    ts: 1789169837024
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7353917440
      freeMemPct: 0.43007844651561217
      usedMemPct: 0.5699215534843878
      cpuPct: 0.7530364372469636
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 94765056
      heapUsed: 29908920
      heapTotal: 62898176
      heapUsedPct: 0.4755133121825345
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: null
  priority: 0.448
  id: 11d27efc-0a93-4027-8bb1-fa2706b3ecdf
