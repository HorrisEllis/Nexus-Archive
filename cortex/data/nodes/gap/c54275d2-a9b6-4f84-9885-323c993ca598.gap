envelope: 1
uuid: nexus-export-gap-c54275d2-a9b6-4f84-9885-323c993ca598
type: gap
id: c54275d2-a9b6-4f84-9885-323c993ca598
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822163
source: data/cortex/memory/gaps.json:c54275d2-a9b6-4f84-9885-323c993ca598
payload:
  uuid: 9466a39d-d797-45ea-a851-ccf617af3c66
  type: baseline_deviation
  domain: system
  body: baseline_deviation
  source: ollama-bridge
  severity: medium
  status: open
  causedBy: null
  dedup_key: system::baseline_deviation::ollama-bridge
  occurrences: 2
  detectedAt: 1789169841810
  lastSeenAt: 1789172744296
  meta:
    kernelGapUuid: 4eee5dfe-7f47-46bb-bbe1-c13ce9051c81
  requested: null
  received: null
  systemsInvolved:
    - ollama-bridge
  location: null
  error: null
  resourceState:
    ts: 1789169841810
    pid: 18896
    system:
      totalMem: 17099014144
      freeMem: 6184800256
      freeMemPct: 0.361705078662107
      usedMemPct: 0.638294921337893
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 86355968
      heapUsed: 19558152
      heapTotal: 50950144
      heapUsedPct: 0.3838684342089396
      external: 2218555
      uptimeSec: 5
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: null
  priority: 0.3925
  id: c54275d2-a9b6-4f84-9885-323c993ca598
