envelope: 1
uuid: nexus-export-gap-e3ac2bb9-b347-48b3-9201-4206d093b7ea
type: gap
id: e3ac2bb9-b347-48b3-9201-4206d093b7ea
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822150
source: data/cortex/memory/gaps.json:e3ac2bb9-b347-48b3-9201-4206d093b7ea
payload:
  uuid: ac9c8cb4-41e7-42af-b0d7-f985ff19f837
  type: system-check.missing-cli
  domain: system
  body: >-
    cortex's real cli layer not found under its own conventions (checked:
    D:\Backups\Downloads\nexus-v0_39_91\nexus\cortex)
  source: cortex
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::system-check.missing-cli::cortex
  occurrences: 3
  detectedAt: 1789169837016
  lastSeenAt: 1789179092588
  meta:
    layer: cli
    vitality: 1
  requested: null
  received: null
  systemsInvolved:
    - cortex
  location: cortex
  error: null
  resourceState:
    ts: 1789169837016
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7342206976
      freeMemPct: 0.4293935845755389
      usedMemPct: 0.5706064154244611
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 93933568
      heapUsed: 29316008
      heapTotal: 62373888
      heapUsedPct: 0.47000449931868926
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: null
  priority: 0.5675
  id: e3ac2bb9-b347-48b3-9201-4206d093b7ea
