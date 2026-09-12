envelope: 1
uuid: nexus-export-gap-4637a995-edef-4a96-b1de-26fd30aca60e
type: gap
id: 4637a995-edef-4a96-b1de-26fd30aca60e
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822155
source: data/cortex/memory/gaps.json:4637a995-edef-4a96-b1de-26fd30aca60e
payload:
  uuid: c87d89a2-b73e-4db6-8e06-d838ce3fd04d
  type: system-check.missing-events
  domain: system
  body: >-
    eravos's real events layer not found under its own conventions (checked:
    D:\Backups\Downloads\nexus-v0_39_91\nexus\eravos)
  source: eravos
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::system-check.missing-events::eravos
  occurrences: 3
  detectedAt: 1789169837042
  lastSeenAt: 1789179092646
  meta:
    layer: events
    vitality: 0.5
  requested: null
  received: null
  systemsInvolved:
    - eravos
  location: eravos
  error: null
  resourceState:
    ts: 1789169837042
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7344603136
      freeMemPct: 0.42953371897041226
      usedMemPct: 0.5704662810295877
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 95498240
      heapUsed: 31119840
      heapTotal: 63619072
      heapUsedPct: 0.48915897421452487
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: null
  priority: 0.3925
  id: 4637a995-edef-4a96-b1de-26fd30aca60e
