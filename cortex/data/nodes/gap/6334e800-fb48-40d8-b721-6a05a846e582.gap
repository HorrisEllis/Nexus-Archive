envelope: 1
uuid: nexus-export-gap-6334e800-fb48-40d8-b721-6a05a846e582
type: gap
id: 6334e800-fb48-40d8-b721-6a05a846e582
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822156
source: data/cortex/memory/gaps.json:6334e800-fb48-40d8-b721-6a05a846e582
payload:
  uuid: bf95bd9a-8549-4c02-9550-6ea6954e7762
  type: system-check.missing-cli
  domain: system
  body: >-
    ollama-bridge's real cli layer not found under its own conventions (checked:
    D:\Backups\Downloads\nexus-v0_39_91\nexus\ollama)
  source: ollama-bridge
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::system-check.missing-cli::ollama-bridge
  occurrences: 3
  detectedAt: 1789169837042
  lastSeenAt: 1789179092647
  meta:
    layer: cli
    vitality: 0.5
  requested: null
  received: null
  systemsInvolved:
    - ollama-bridge
  location: ollama
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
      heapUsed: 31165376
      heapTotal: 63619072
      heapUsedPct: 0.48987473441926344
      external: 1947901
      uptimeSec: 0
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: null
  priority: 0.3925
  id: 6334e800-fb48-40d8-b721-6a05a846e582
