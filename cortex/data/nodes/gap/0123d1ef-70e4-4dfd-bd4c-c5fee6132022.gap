envelope: 1
uuid: nexus-export-gap-0123d1ef-70e4-4dfd-bd4c-c5fee6132022
type: gap
id: 0123d1ef-70e4-4dfd-bd4c-c5fee6132022
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822154
source: data/cortex/memory/gaps.json:0123d1ef-70e4-4dfd-bd4c-c5fee6132022
payload:
  uuid: 96a12056-1246-4321-b2c0-e8dbc2c4d96c
  type: system-check.missing-events
  domain: system
  body: >-
    diagnostic's real events layer not found under its own conventions (checked:
    D:\Backups\Downloads\nexus-v0_39_91\nexus\service)
  source: diagnostic
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::system-check.missing-events::diagnostic
  occurrences: 3
  detectedAt: 1789169837036
  lastSeenAt: 1789179092609
  meta:
    layer: events
    vitality: 0.8
  requested: null
  received: null
  systemsInvolved:
    - diagnostic
  location: service
  error: null
  resourceState:
    ts: 1789169837036
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7343960064
      freeMemPct: 0.42949611025247186
      usedMemPct: 0.5705038897475281
      cpuPct: 0.7509881422924901
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 95498240
      heapUsed: 30796952
      heapTotal: 63619072
      heapUsedPct: 0.4840836408302215
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: null
  priority: 0.4975
  id: 0123d1ef-70e4-4dfd-bd4c-c5fee6132022
