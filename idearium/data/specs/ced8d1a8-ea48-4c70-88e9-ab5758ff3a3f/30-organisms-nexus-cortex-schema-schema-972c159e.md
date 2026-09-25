---
chunk_uuid: 972c159e-7796-4b61-ba10-d5ea772e9bdc
spec_uuid: ced8d1a8-ea48-4c70-88e9-ab5758ff3a3f
section: organisms-nexus-cortex-schema-schema
title: organisms/nexus-cortex/schema/schema.json
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ced8d1a8:organisms-nexus-cortex-schema-schema
contract_id: spec-contract:ced8d1a8:organisms-nexus-cortex-schema-schema:972c159e
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-25T20:17:11.363Z
---

{
  "schema_version": "1.0.0",
  "id": "eravos.nexus-cortex",
  "label": "NEXUS_CORTEX",
  "icon": "🧠",
  "accent": "#00ff88",
  "domain": ["diagnostic", "monitoring", "nexus"],
  "description": "Live status card for NEXUS NEXUS_CORTEX (port 3748). Polling is driven by the global transport (play/stop), not its own clock. Diagnose routes through the Orchestrator.",
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