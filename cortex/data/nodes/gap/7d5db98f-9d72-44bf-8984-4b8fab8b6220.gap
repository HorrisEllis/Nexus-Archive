envelope: 1
uuid: nexus-export-gap-7d5db98f-9d72-44bf-8984-4b8fab8b6220
type: gap
id: 7d5db98f-9d72-44bf-8984-4b8fab8b6220
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822156
source: data/cortex/memory/gaps.json:7d5db98f-9d72-44bf-8984-4b8fab8b6220
payload:
  uuid: 9427325b-9899-4ce7-8b67-13e1105495ae
  type: system-check.missing-ui
  domain: system
  body: >-
    ollama-bridge's real ui layer not found under its own conventions (checked:
    D:\Backups\Downloads\nexus-v0_39_91\nexus\ollama)
  source: ollama-bridge
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::system-check.missing-ui::ollama-bridge
  occurrences: 3
  detectedAt: 1789169837045
  lastSeenAt: 1789179092649
  meta:
    layer: ui
    vitality: 0.5
  requested: null
  received: null
  systemsInvolved:
    - ollama-bridge
  location: ollama
  error: null
  resourceState:
    ts: 1789169837045
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 7344390144
      freeMemPct: 0.4295212625797568
      usedMemPct: 0.5704787374202431
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 95502336
      heapUsed: 31310216
      heapTotal: 63619072
      heapUsedPct: 0.49215141019347153
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: null
  priority: 0.3925
  id: 7d5db98f-9d72-44bf-8984-4b8fab8b6220
