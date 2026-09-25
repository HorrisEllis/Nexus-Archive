---
chunk_uuid: 1e93eadc-09aa-4b70-a485-5c65c68074e8
spec_uuid: ced8d1a8-ea48-4c70-88e9-ab5758ff3a3f
section: organisms-serial-bridge-schema-schema
title: organisms/serial-bridge/schema/schema.json
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ced8d1a8:organisms-serial-bridge-schema-schema
contract_id: spec-contract:ced8d1a8:organisms-serial-bridge-schema-schema:1e93eadc
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-25T20:17:11.361Z
---

{
  "schema_version": "1.0.0",
  "id": "eravos.serial-bridge",
  "label": "Serial Bridge",
  "icon": "🤖",
  "accent": "#00ff88",
  "domain": ["robotics", "hardware", "automation", "serial"],
  "description": "Real hardware I/O over Web Serial. Connects to GRBL/Arduino/stepper-controller style devices over USB-serial, sends raw or G-code lines, streams incoming telemetry to the bus, and can be wired (via the wire system) so any organism's output — sequencer steps, XY pad, LFO — drives a physical device. Requires a Chromium-based browser (Web Serial is not implemented in Firefox or Safari) and a user gesture to grant port access.",
  "permissions": ["serial_access", "bus_publish", "bus_subscribe"],
  "provides": ["capability.serial_io", "capability.hardware_control"],
  "requires": [],
  "dependencies": {
    "runtime": ["kernel/kernel.js"],
    "browser_apis": ["Web Serial API (navigator.serial)"],
    "external_libs": [],
    "constraints": [
      "Chromium-based browsers only (Chrome, Edge, Opera) — Web Serial has no Firefox/Safari implementation.",
      "Requires a direct user click to call navigator.serial.requestPort() — cannot be triggered programmatically.",
      "Runs over a secure context; file:// origins are treated as secure by Chromium so the packaged shell works, but confirm on the target browser version."
    ]
  },
  "hooks": [
    { "hook_id": "serial.hook.data_in",  "direction": "in",  "event_type": "mod:xy",       "contract_version": "1.0.0" },
    { "hook_id": "serial.hook.trig_in",  "direction": "in",  "event_type": "pad:trigger",  "contract_version": "1.0.0" },
    { "hook_id": "serial.hook.rx_out",   "direction": "out", "event_type": "serial:rx",    "contract_version": "1.0.0" }
  ],
  "params": {
    "baudRate":   { "type": "enum", "options": [9600, 19200, 38400, 57600, 115200, 250000], "default": 115200 },
    "lineEnding": { "type": "enum", "options": ["\n", "\r\n"], "default": "\n" },
    "mapMode":    { "type": "enum", "options": ["off", "xy_to_gcode", "trigger_to_line"], "default": "off" }
  }
}