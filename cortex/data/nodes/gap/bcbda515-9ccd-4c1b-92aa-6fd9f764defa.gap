envelope: 1
uuid: nexus-export-gap-bcbda515-9ccd-4c1b-92aa-6fd9f764defa
type: gap
id: bcbda515-9ccd-4c1b-92aa-6fd9f764defa
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822155
source: data/cortex/memory/gaps.json:bcbda515-9ccd-4c1b-92aa-6fd9f764defa
payload:
  uuid: 0e97166b-3007-4b12-bacd-41fd38f5939d
  type: system-check.missing-cli
  domain: system
  body: >-
    architect's real cli layer not found under its own conventions (checked:
    D:\Backups\Downloads\nexus-v0_39_91\nexus\architect)
  source: architect
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::system-check.missing-cli::architect
  occurrences: 3
  detectedAt: 1789169837039
  lastSeenAt: 1789179092610
  meta:
    layer: cli
    vitality: 0.5
  requested: null
  received: null
  systemsInvolved:
    - architect
  location: architect
  error: null
  resourceState:
    ts: 1789169837039
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7343898624
      freeMemPct: 0.42949251706285974
      usedMemPct: 0.5705074829371403
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 95498240
      heapUsed: 30895024
      heapTotal: 63619072
      heapUsedPct: 0.4856251911376513
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: null
  priority: 0.3925
  id: bcbda515-9ccd-4c1b-92aa-6fd9f764defa
