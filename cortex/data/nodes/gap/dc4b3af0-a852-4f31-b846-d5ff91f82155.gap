envelope: 1
uuid: nexus-export-gap-dc4b3af0-a852-4f31-b846-d5ff91f82155
type: gap
id: dc4b3af0-a852-4f31-b846-d5ff91f82155
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822155
source: data/cortex/memory/gaps.json:dc4b3af0-a852-4f31-b846-d5ff91f82155
payload:
  uuid: 4f6440ac-c989-4f74-a18a-bba33b96bcdf
  type: system-check.missing-ui
  domain: system
  body: >-
    architect's real ui layer not found under its own conventions (checked:
    D:\Backups\Downloads\nexus-v0_39_91\nexus\architect)
  source: architect
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::system-check.missing-ui::architect
  occurrences: 3
  detectedAt: 1789169837040
  lastSeenAt: 1789179092629
  meta:
    layer: ui
    vitality: 0.5
  requested: null
  received: null
  systemsInvolved:
    - architect
  location: architect
  error: null
  resourceState:
    ts: 1789169837040
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7340982272
      freeMemPct: 0.42932196032927034
      usedMemPct: 0.5706780396707296
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 95498240
      heapUsed: 31008392
      heapTotal: 63619072
      heapUsedPct: 0.48740717249066445
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: null
  priority: 0.3925
  id: dc4b3af0-a852-4f31-b846-d5ff91f82155
