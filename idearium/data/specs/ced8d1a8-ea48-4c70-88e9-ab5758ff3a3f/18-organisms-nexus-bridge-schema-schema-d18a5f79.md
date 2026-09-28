---
chunk_uuid: d18a5f79-d59a-4951-b962-f79bdd1a2bbe
spec_uuid: ced8d1a8-ea48-4c70-88e9-ab5758ff3a3f
section: organisms-nexus-bridge-schema-schema
title: organisms/nexus-bridge/schema/schema.json
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ced8d1a8:organisms-nexus-bridge-schema-schema
contract_id: spec-contract:ced8d1a8:organisms-nexus-bridge-schema-schema:d18a5f79
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-25T20:17:11.359Z
---

{
  "schema_version": "1.0.0",
  "id": "eravos.nexus-bridge",
  "label": "NEXUS_BRIDGE",
  "icon": "⬡",
  "accent": "#00d4ff",
  "domain": ["diagnostic", "monitoring", "nexus"],
  "description": "Live status card for NEXUS NEXUS_BRIDGE (port 9999). Polling is driven by the global transport (play/stop), not its own clock. Diagnose routes through the Orchestrator.",
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