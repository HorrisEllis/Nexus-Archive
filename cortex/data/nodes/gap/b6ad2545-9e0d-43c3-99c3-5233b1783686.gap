envelope: 1
uuid: nexus-export-gap-b6ad2545-9e0d-43c3-99c3-5233b1783686
type: gap
id: b6ad2545-9e0d-43c3-99c3-5233b1783686
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822157
source: data/cortex/memory/gaps.json:b6ad2545-9e0d-43c3-99c3-5233b1783686
payload:
  uuid: cf4e4706-f5ca-41f4-bb5d-d20d806ea4e0
  type: system-check.missing-cli
  domain: system
  body: >-
    loom's real cli layer not found under its own conventions (checked:
    D:\Backups\Downloads\nexus-v0_39_91\nexus\loom)
  source: loom
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::system-check.missing-cli::loom
  occurrences: 3
  detectedAt: 1789169837051
  lastSeenAt: 1789179092683
  meta:
    layer: cli
    vitality: 0.5
  requested: null
  received: null
  systemsInvolved:
    - loom
  location: loom
  error: null
  resourceState:
    ts: 1789169837051
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7335940096
      freeMemPct: 0.42902707923510097
      usedMemPct: 0.570972920764899
      cpuPct: 0
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 95805440
      heapUsed: 31748952
      heapTotal: 63922176
      heapUsedPct: 0.49668133950884275
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: null
  priority: 0.3925
  id: b6ad2545-9e0d-43c3-99c3-5233b1783686
