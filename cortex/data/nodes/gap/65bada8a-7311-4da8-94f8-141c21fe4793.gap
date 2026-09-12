envelope: 1
uuid: nexus-export-gap-65bada8a-7311-4da8-94f8-141c21fe4793
type: gap
id: 65bada8a-7311-4da8-94f8-141c21fe4793
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822157
source: data/cortex/memory/gaps.json:65bada8a-7311-4da8-94f8-141c21fe4793
payload:
  uuid: 6095e6d4-da82-4835-a2c5-a3d0ff4c8377
  type: system-check.missing-api
  domain: system
  body: >-
    emerge's real api layer not found under its own conventions (checked:
    D:\Backups\Downloads\nexus-v0_39_91\nexus\emerge)
  source: emerge
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::system-check.missing-api::emerge
  occurrences: 3
  detectedAt: 1789169837055
  lastSeenAt: 1789179092685
  meta:
    layer: api
    vitality: 0.3
  requested: null
  received: null
  systemsInvolved:
    - emerge
  location: emerge
  error: null
  resourceState:
    ts: 1789169837055
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7334825984
      freeMemPct: 0.4289619227301342
      usedMemPct: 0.5710380772698658
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 95805440
      heapUsed: 32013312
      heapTotal: 63922176
      heapUsedPct: 0.5008169934640523
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: null
  priority: 0.3225
  id: 65bada8a-7311-4da8-94f8-141c21fe4793
