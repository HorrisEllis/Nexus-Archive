---
chunk_uuid: 93c10230-0450-4556-b97f-f8f841e62e24
spec_uuid: ced8d1a8-ea48-4c70-88e9-ab5758ff3a3f
section: organisms-macro-automation-schema-schema
title: organisms/macro-automation/schema/schema.json
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ced8d1a8:organisms-macro-automation-schema-schema
contract_id: spec-contract:ced8d1a8:organisms-macro-automation-schema-schema:93c10230
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-25T20:17:11.364Z
---

{
  "schema_version": "1.0.0",
  "id": "eravos.macro-automation",
  "label": "Macro Automation",
  "icon": "⏺",
  "accent": "#ffaa00",
  "domain": ["automation", "control", "recording"],
  "description": "Records every parameter change made to a chosen organism in real time — turning any knob, toggle, or select is captured with its exact timing — then plays the whole macro back, re-driving that organism's parameters at the original timing. Loopable, speed-adjustable. This is in-app automation: it drives other ERAVOS organisms over the bus, not anything outside the sandbox.",
  "permissions": ["bus_publish", "bus_subscribe"],
  "provides": ["capability.automation_record", "capability.automation_playback"],
  "requires": [],
  "dependencies": {
    "runtime": ["kernel/kernel.js", "KERNEL.registry (to list target organisms)"],
    "browser_apis": ["performance.now()"],
    "external_libs": []
  },
  "hooks": [
    { "hook_id": "macro.hook.drive_out", "direction": "out", "event_type": "ui:config_change", "contract_version": "1.0.0" }
  ],
  "params": {
    "targetInstanceId": { "type": "string", "default": null },
    "loop":  { "type": "bool",  "default": true },
    "speed": { "type": "float", "min": 0.25, "max": 4, "default": 1 }
  }
}