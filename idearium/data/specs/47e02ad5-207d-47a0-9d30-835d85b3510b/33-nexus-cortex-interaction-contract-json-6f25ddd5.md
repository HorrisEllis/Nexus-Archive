---
chunk_uuid: 6f25ddd5-6e14-4ae0-906f-d5074c3cfe82
spec_uuid: 47e02ad5-207d-47a0-9d30-835d85b3510b
section: nexus-cortex-interaction-contract-json
title: nexus/cortex/interaction-contract.json
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:47e02ad5:nexus-cortex-interaction-contract-json
contract_id: spec-contract:47e02ad5:nexus-cortex-interaction-contract-json:6f25ddd5
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-15T20:05:16.081Z
---

{
  "id": "cortex-v1",
  "version": "3.2.0",
  "namespace": "cortex",
  "ports": {
    "http": 3748
  },
  "uuid": "cortex-contract-v1-0000-2026-0702-jamesbrooks-001",
  "role": "Memory, CFR truth substrate, RAID routing, intelligence layer",
  "health": {
    "method": "GET",
    "path": "/health",
    "returns": {
      "ok": true
    }
  },
  "routes": [
    {
      "method": "GET",
      "path": "/health",
      "description": "Health check"
    },
    {
      "method": "GET",
      "path": "/cfr/field",
      "description": "Live CFR field state"
    },
    {
      "method": "POST",
      "path": "/cfr/field",
      "description": "Update CFR field"
    },
    {
      "method": "GET",
      "path": "/hooks/summary",
      "description": "Hooks and wire graph"
    },
    {
      "method": "GET",
      "path": "/nerve/snapshot",
      "description": "Nerve attention layer snapshot"
    },
    {
      "method": "POST",
      "path": "/api/event",
      "description": "Emit event to ledger"
    },
    {
      "method": "GET",
      "path": "/api/events",
      "description": "Recent events"
    },
    {
      "method": "GET",
      "path": "/api/gaps",
      "description": "Open gaps"
    },
    {
      "method": "GET",
      "path": "/api/memory",
      "description": "Memory recall"
    },
    {
      "method": "POST",
      "path": "/api/memory/insert",
      "description": "Memory insert"
    },
    {
      "method": "GET",
      "path": "/api/intelligence/status",
      "description": "Intelligence layer status"
    },
    {
      "method": "POST",
      "path": "/api/intelligence/intuition",
      "description": "Fast intuition path"
    },
    {
      "method": "POST",
      "path": "/api/intelligence/mastermind",
      "description": "Deep causal analysis"
    },
    {
      "method": "POST",
      "path": "/api/intelligence/mastermind/patterns",
      "description": "Recurring causal-shape detection (RFR2 delta engine \u2014 wired 2026-07-09, exposed 2026-07-11)"
    },
    {
      "method": "GET",
      "path": "/api/raid/decide",
      "description": "RAID routing decision"
    },
    {
      "method": "GET",
      "path": "/api/raid/status",
      "description": "RAID status"
    }
  ],
  "axioms": [
    "\u00a72.1",
    "\u00a72.3",
    "\u00a75.7",
    "LAW_II"
  ]
}