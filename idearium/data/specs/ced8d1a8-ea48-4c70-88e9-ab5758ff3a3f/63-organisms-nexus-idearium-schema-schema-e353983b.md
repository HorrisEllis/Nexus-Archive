---
chunk_uuid: e353983b-d044-4629-b55a-a0545a08303a
spec_uuid: ced8d1a8-ea48-4c70-88e9-ab5758ff3a3f
section: organisms-nexus-idearium-schema-schema
title: organisms/nexus-idearium/schema/schema.json
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ced8d1a8:organisms-nexus-idearium-schema-schema
contract_id: spec-contract:ced8d1a8:organisms-nexus-idearium-schema-schema:e353983b
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-25T20:17:11.374Z
---

{
  "schema_version": "1.0.0",
  "id": "eravos.nexus-idearium",
  "label": "IDEARIUM",
  "icon": "💡",
  "accent": "#ffaa00",
  "domain": ["diagnostic", "monitoring", "nexus"],
  "description": "Live status card for NEXUS IDEARIUM (port 4800). Polling is driven by the global transport (play/stop), not its own clock. Diagnose routes through the Orchestrator.",
  "permissions": ["network_fetch", "bus_publish", "bus_subscribe"],
  "provides": ["capability.nexus_diagnostic"],
  "requires": [],
  "hooks": [
    { "hook_id": "nn.hook.bus_out", "direction": "out", "event_type": "org:state_sync", "contract_version": "1.0.0" }
  ],
  "params": {
    "statusPath":    { "type": "string", "default": "/api/status" },
    "snapshotsPath": { "type": "string", "default": "/snapshots" },
    "diagnosePath":  { "type": "string", "default": "/diagnose" }
  },
  "ui": { "type": "nexus_diagnostic_card" }
}