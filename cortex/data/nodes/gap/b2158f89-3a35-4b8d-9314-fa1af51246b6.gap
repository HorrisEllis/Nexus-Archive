envelope: 1
uuid: nexus-export-gap-b2158f89-3a35-4b8d-9314-fa1af51246b6
type: gap
id: b2158f89-3a35-4b8d-9314-fa1af51246b6
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822155
source: data/cortex/memory/gaps.json:b2158f89-3a35-4b8d-9314-fa1af51246b6
payload:
  uuid: 72d6c197-8922-4649-b285-72796783214d
  type: system-check.missing-cli
  domain: system
  body: >-
    eravos's real cli layer not found under its own conventions (checked:
    D:\Backups\Downloads\nexus-v0_39_91\nexus\eravos)
  source: eravos
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::system-check.missing-cli::eravos
  occurrences: 3
  detectedAt: 1789169837041
  lastSeenAt: 1789179092629
  meta:
    layer: cli
    vitality: 0.5
  requested: null
  received: null
  systemsInvolved:
    - eravos
  location: eravos
  error: null
  resourceState:
    ts: 1789169837041
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7343960064
      freeMemPct: 0.42949611025247186
      usedMemPct: 0.5705038897475281
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 95498240
      heapUsed: 31051240
      heapTotal: 63619072
      heapUsedPct: 0.48808068121458925
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: null
  priority: 0.3925
  id: b2158f89-3a35-4b8d-9314-fa1af51246b6
