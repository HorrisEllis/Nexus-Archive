---
chunk_uuid: d355c4cc-f62b-45d1-887e-b4572c41596f
spec_uuid: ced8d1a8-ea48-4c70-88e9-ab5758ff3a3f
section: organisms-lfo-schema-schema
title: organisms/lfo/schema/schema.json
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ced8d1a8:organisms-lfo-schema-schema
contract_id: spec-contract:ced8d1a8:organisms-lfo-schema-schema:d355c4cc
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-25T20:17:11.372Z
---

{
  "schema_version": "1.0.0",
  "id": "eravos.lfo",
  "label": "LFO",
  "icon": "\u3030",
  "accent": "#aa44ff",
  "domain": [
    "music",
    "modulation",
    "control"
  ],
  "description": "Low-frequency oscillator. Publishes mod:signal globally. BPM sync mode.",
  "permissions": [
    "bus_publish",
    "bus_subscribe"
  ],
  "provides": [
    "capability.lfo",
    "capability.mod_signal"
  ],
  "requires": [],
  "hooks": [
    {
      "hook_id": "lfo.hook.mod_out",
      "direction": "out",
      "event_type": "mod:signal",
      "contract_version": "1.0.0"
    }
  ],
  "params": {
    "shape": {
      "type": "enum",
      "values": [
        "sine",
        "triangle",
        "square",
        "sawtooth",
        "S&H"
      ],
      "default": "sine"
    },
    "rate": {
      "type": "float",
      "min": 0.01,
      "max": 32,
      "default": 4,
      "unit": "Hz"
    },
    "depth": {
      "type": "float",
      "min": 0,
      "max": 1,
      "default": 0.5,
      "unit": ""
    },
    "phase": {
      "type": "float",
      "min": 0,
      "max": 360,
      "default": 0,
      "unit": "degrees"
    },
    "bipolar": {
      "type": "bool",
      "default": true
    },
    "sync": {
      "type": "bool",
      "default": false
    }
  },
  "ui": {
    "type": "oscilloscope_interactive"
  }
}