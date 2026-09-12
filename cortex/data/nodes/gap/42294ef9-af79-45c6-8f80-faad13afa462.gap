envelope: 1
uuid: nexus-export-gap-42294ef9-af79-45c6-8f80-faad13afa462
type: gap
id: 42294ef9-af79-45c6-8f80-faad13afa462
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822157
source: data/cortex/memory/gaps.json:42294ef9-af79-45c6-8f80-faad13afa462
payload:
  uuid: 8e1db152-50ee-4f0a-941b-a727169e0500
  type: system-check.missing-events
  domain: system
  body: >-
    copilot's real events layer not found under its own conventions (checked:
    D:\Backups\Downloads\nexus-v0_39_91\nexus\copilot)
  source: copilot
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::system-check.missing-events::copilot
  occurrences: 3
  detectedAt: 1789169837049
  lastSeenAt: 1789179092680
  meta:
    layer: events
    vitality: 0.5
  requested: null
  received: null
  systemsInvolved:
    - copilot
  location: copilot
  error: null
  resourceState:
    ts: 1789169837049
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7340912640
      freeMemPct: 0.4293178880477099
      usedMemPct: 0.5706821119522901
      cpuPct: 0.753968253968254
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 95805440
      heapUsed: 31703224
      heapTotal: 63922176
      heapUsedPct: 0.49596596961905676
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: null
  priority: 0.3925
  id: 42294ef9-af79-45c6-8f80-faad13afa462
