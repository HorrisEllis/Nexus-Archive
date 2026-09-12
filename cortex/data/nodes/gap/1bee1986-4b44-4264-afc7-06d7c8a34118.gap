envelope: 1
uuid: nexus-export-gap-1bee1986-4b44-4264-afc7-06d7c8a34118
type: gap
id: 1bee1986-4b44-4264-afc7-06d7c8a34118
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822157
source: data/cortex/memory/gaps.json:1bee1986-4b44-4264-afc7-06d7c8a34118
payload:
  uuid: 4cedaf13-82b1-4daa-8a4e-306f6e4e6732
  type: system-check.missing-cli
  domain: system
  body: >-
    emerge's real cli layer not found under its own conventions (checked:
    D:\Backups\Downloads\nexus-v0_39_91\nexus\emerge)
  source: emerge
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::system-check.missing-cli::emerge
  occurrences: 3
  detectedAt: 1789169837054
  lastSeenAt: 1789179092685
  meta:
    layer: cli
    vitality: 0.3
  requested: null
  received: null
  systemsInvolved:
    - emerge
  location: emerge
  error: null
  resourceState:
    ts: 1789169837054
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7334850560
      freeMemPct: 0.42896336000597907
      usedMemPct: 0.571036639994021
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 95805440
      heapUsed: 31922568
      heapTotal: 63922176
      heapUsedPct: 0.4993973922289504
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: null
  priority: 0.3225
  id: 1bee1986-4b44-4264-afc7-06d7c8a34118
