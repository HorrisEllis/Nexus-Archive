envelope: 1
uuid: nexus-export-gap-96ecaf3b-3e1d-4c7b-9672-4eeccb19605b
type: gap
id: 96ecaf3b-3e1d-4c7b-9672-4eeccb19605b
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822156
source: data/cortex/memory/gaps.json:96ecaf3b-3e1d-4c7b-9672-4eeccb19605b
payload:
  uuid: 642c6654-432f-4712-923b-a2c39d9b0299
  type: system-check.missing-events
  domain: system
  body: >-
    ollama-bridge's real events layer not found under its own conventions (checked:
    D:\Backups\Downloads\nexus-v0_39_91\nexus\ollama)
  source: ollama-bridge
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::system-check.missing-events::ollama-bridge
  occurrences: 3
  detectedAt: 1789169837044
  lastSeenAt: 1789179092648
  meta:
    layer: events
    vitality: 0.5
  requested: null
  received: null
  systemsInvolved:
    - ollama-bridge
  location: ollama
  error: null
  resourceState:
    ts: 1789169837044
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7344398336
      freeMemPct: 0.4295217416717051
      usedMemPct: 0.5704782583282949
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 95498240
      heapUsed: 31271496
      heapTotal: 63619072
      heapUsedPct: 0.4915427876722251
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: null
  priority: 0.3925
  id: 96ecaf3b-3e1d-4c7b-9672-4eeccb19605b
