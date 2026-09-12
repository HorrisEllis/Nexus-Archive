envelope: 1
uuid: nexus-export-gap-48baaa1f-cfb0-4907-a3ed-8eeb6557d72c
type: gap
id: 48baaa1f-cfb0-4907-a3ed-8eeb6557d72c
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822151
source: data/cortex/memory/gaps.json:48baaa1f-cfb0-4907-a3ed-8eeb6557d72c
payload:
  uuid: 1f7e493a-d796-484e-8f74-e06095d1f24a
  type: system-check.missing-cli
  domain: system
  body: >-
    diagnostic's real cli layer not found under its own conventions (checked:
    D:\Backups\Downloads\nexus-v0_39_91\nexus\service)
  source: diagnostic
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::system-check.missing-cli::diagnostic
  occurrences: 3
  detectedAt: 1789169837031
  lastSeenAt: 1789179092606
  meta:
    layer: cli
    vitality: 0.8
  requested: null
  received: null
  systemsInvolved:
    - diagnostic
  location: service
  error: null
  resourceState:
    ts: 1789169837032
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7334158336
      freeMemPct: 0.428922876736349
      usedMemPct: 0.571077123263651
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 94892032
      heapUsed: 30484520
      heapTotal: 63352832
      heapUsedPct: 0.4811863816916661
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: null
  priority: 0.4975
  id: 48baaa1f-cfb0-4907-a3ed-8eeb6557d72c
