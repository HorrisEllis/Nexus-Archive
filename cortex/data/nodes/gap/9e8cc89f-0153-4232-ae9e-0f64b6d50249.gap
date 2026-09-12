envelope: 1
uuid: nexus-export-gap-9e8cc89f-0153-4232-ae9e-0f64b6d50249
type: gap
id: 9e8cc89f-0153-4232-ae9e-0f64b6d50249
context: real, live jaaDB row migrated from data/cortex/memory/gaps.json
intent: null
summary: null
system: cortex
tags: []
exported_at: 1789252822135
source: data/cortex/memory/gaps.json:9e8cc89f-0153-4232-ae9e-0f64b6d50249
payload:
  uuid: fe1b9356-49a6-43d1-8b44-eadfa9f19d27
  type: intent.low_confidence
  domain: system
  body: 'Intent parsed with confidence 0.343 (threshold: 0.45). verb="unknown" domain="general" raw=""'
  source: intent-classifier
  severity: medium
  status: open
  causedBy: 908f716c-acc9-44c1-ab89-06c578d8e342
  dedup_key: system::intent.low_confidence::intent-classifier
  occurrences: 566
  detectedAt: 1789169842579
  lastSeenAt: 1789179646690
  meta:
    causedBy: 908f716c-acc9-44c1-ab89-06c578d8e342
    path: intent-classifier/confidence
  requested: null
  received: null
  systemsInvolved:
    - intent-classifier
  location: null
  error: null
  resourceState:
    ts: 1789169842580
    pid: 19684
    system:
      totalMem: 17099014144
      freeMem: 6198681600
      freeMemPct: 0.36251689996847575
      usedMemPct: 0.6374831000315242
      cpuPct: null
      loadavg:
        - 0
        - 0
        - 0
      cpuCount: 16
      platform: win32
    process:
      rss: 61751296
      heapUsed: 15297568
      heapTotal: 21372928
      heapUsedPct: 0.715745077136834
      external: 2203434
      uptimeSec: 5
    pressure:
      level: ok
      reasons: []
      spawnSafe: true
  why: null
  component: null
  priority: 0.3925
  id: 9e8cc89f-0153-4232-ae9e-0f64b6d50249
