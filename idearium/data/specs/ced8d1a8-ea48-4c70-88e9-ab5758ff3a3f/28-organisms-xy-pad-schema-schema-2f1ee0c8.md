---
chunk_uuid: 2f1ee0c8-3f18-4d38-9092-075c89ce2937
spec_uuid: ced8d1a8-ea48-4c70-88e9-ab5758ff3a3f
section: organisms-xy-pad-schema-schema
title: organisms/xy-pad/schema/schema.json
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ced8d1a8:organisms-xy-pad-schema-schema
contract_id: spec-contract:ced8d1a8:organisms-xy-pad-schema-schema:2f1ee0c8
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-25T20:17:11.362Z
---

{
  "schema_version": "1.0.0",
  "id": "eravos.xy-pad",
  "label": "XY Controller",
  "icon": "\u271b",
  "accent": "#00d4ff",
  "domain": [
    "music",
    "modulation",
    "control",
    "performance"
  ],
  "description": "Two-axis modulation surface. Publishes mod:xy globally. Trail fades. Snap-to-center mode.",
  "permissions": [
    "bus_publish",
    "bus_subscribe"
  ],
  "provides": [
    "capability.mod_signal"
  ],
  "requires": [],
  "hooks": [
    {
      "hook_id": "xy.hook.mod_out",
      "direction": "out",
      "event_type": "mod:xy",
      "contract_version": "1.0.0"
    }
  ],
  "params": {
    "x_dest": {
      "type": "string",
      "default": "cutoff",
      "description": "Parameter name for X axis"
    },
    "y_dest": {
      "type": "string",
      "default": "depth",
      "description": "Parameter name for Y axis"
    },
    "snap_center": {
      "type": "bool",
      "default": false
    }
  },
  "ui": {
    "type": "xy_surface",
    "trail": true,
    "snap": true
  }
}