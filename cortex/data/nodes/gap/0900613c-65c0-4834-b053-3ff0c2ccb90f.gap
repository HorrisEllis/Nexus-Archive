envelope: 1
uuid: nexus-export-gap-0900613c-65c0-4834-b053-3ff0c2ccb90f
type: gap
id: 0900613c-65c0-4834-b053-3ff0c2ccb90f
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822151
source: data/cortex/memory/gaps.json:0900613c-65c0-4834-b053-3ff0c2ccb90f
payload:
  uuid: f86394a1-7984-48fd-b622-2e1edfdf63a7
  type: system-check.missing-cli
  domain: system
  body: >-
    guardian's real cli layer not found under its own conventions (checked:
    D:\Backups\Downloads\nexus-v0_39_91\nexus\guardian)
  source: guardian
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::system-check.missing-cli::guardian
  occurrences: 3
  detectedAt: 1789169837025
  lastSeenAt: 1789179092600
  meta:
    layer: cli
    vitality: 0.8
  requested: null
  received: null
  systemsInvolved:
    - guardian
  location: guardian
  error: null
  resourceState:
    ts: 1789169837025
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7349514240
      freeMemPct: 0.42982093459340903
      usedMemPct: 0.570179065406591
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 94765056
      heapUsed: 29956048
      heapTotal: 62898176
      heapUsedPct: 0.47626258669249805
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: null
  priority: 0.4975
  id: 0900613c-65c0-4834-b053-3ff0c2ccb90f
