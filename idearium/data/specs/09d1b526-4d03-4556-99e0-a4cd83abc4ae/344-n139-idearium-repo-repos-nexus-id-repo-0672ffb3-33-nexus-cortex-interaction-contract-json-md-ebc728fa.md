---
chunk_uuid: ebc728fa-f064-4a21-b666-74f2a0433675
spec_uuid: 09d1b526-4d03-4556-99e0-a4cd83abc4ae
section: n139-idearium-repo-repos-nexus-id-repo-0672ffb3-33-nexus-cortex-interaction-contract-json-md
title: n139/idearium/repo/repos/nexus-id-repo-0672ffb3/33-nexus-cortex-interaction-contract-json.md
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-33-nexus-cortex-interaction-contract-json-md
contract_id: spec-contract:09d1b526:n139-idearium-repo-repos-nexus-id-repo-0672ffb3-33-nexus-cortex-interaction-contract-json-md:ebc728fa
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-16T00:22:58.543Z
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