envelope: 1
uuid: nexus-export-gap-40229565-a196-487a-b9a3-ba68dfdbfd1d
type: gap
id: 40229565-a196-487a-b9a3-ba68dfdbfd1d
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822156
source: data/cortex/memory/gaps.json:40229565-a196-487a-b9a3-ba68dfdbfd1d
payload:
  uuid: 19cd29c1-7b8d-4f39-9d88-6722abb4531a
  type: system-check.missing-api
  domain: system
  body: >-
    ollama-bridge's real api layer not found under its own conventions (checked:
    D:\Backups\Downloads\nexus-v0_39_91\nexus\ollama)
  source: ollama-bridge
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::system-check.missing-api::ollama-bridge
  occurrences: 3
  detectedAt: 1789169837043
  lastSeenAt: 1789179092648
  meta:
    layer: api
    vitality: 0.5
  requested: null
  received: null
  systemsInvolved:
    - ollama-bridge
  location: ollama
  error: null
  resourceState:
    ts: 1789169837043
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7344529408
      freeMemPct: 0.4295294071428777
      usedMemPct: 0.5704705928571223
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 95498240
      heapUsed: 31230768
      heapTotal: 63619072
      heapUsedPct: 0.4909026022888231
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: null
  priority: 0.3925
  id: 40229565-a196-487a-b9a3-ba68dfdbfd1d
