envelope: 1
uuid: nexus-export-gap-bfcbb205-85d1-49e6-9fb2-57a3d2e40473
type: gap
id: bfcbb205-85d1-49e6-9fb2-57a3d2e40473
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822157
source: data/cortex/memory/gaps.json:bfcbb205-85d1-49e6-9fb2-57a3d2e40473
payload:
  uuid: 983abea3-90b9-4201-be9b-b3e1d0cea7ff
  type: system-check.missing-events
  domain: system
  body: >-
    loom's real events layer not found under its own conventions (checked:
    D:\Backups\Downloads\nexus-v0_39_91\nexus\loom)
  source: loom
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::system-check.missing-events::loom
  occurrences: 3
  detectedAt: 1789169837053
  lastSeenAt: 1789179092684
  meta:
    layer: events
    vitality: 0.5
  requested: null
  received: null
  systemsInvolved:
    - loom
  location: loom
  error: null
  resourceState:
    ts: 1789169837053
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7333703680
      freeMemPct: 0.4288962871332192
      usedMemPct: 0.5711037128667809
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 95805440
      heapUsed: 31876296
      heapTotal: 63922176
      heapUsedPct: 0.4986735119905805
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: null
  priority: 0.3925
  id: bfcbb205-85d1-49e6-9fb2-57a3d2e40473
