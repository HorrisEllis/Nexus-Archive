---
chunk_uuid: cb2c5726-d708-481b-b4af-71904cfde9dd
spec_uuid: ced8d1a8-ea48-4c70-88e9-ab5758ff3a3f
section: organisms-acid-synth-schema-schema
title: organisms/acid-synth/schema/schema.json
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ced8d1a8:organisms-acid-synth-schema-schema
contract_id: spec-contract:ced8d1a8:organisms-acid-synth-schema-schema:cb2c5726
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-25T20:17:11.376Z
---

{
  "schema_version": "1.0.0",
  "id": "eravos.acid-synth",
  "label": "Acid Synth",
  "icon": "\u26a1",
  "accent": "#00ff88",
  "domain": [
    "music",
    "synthesis",
    "acid",
    "303"
  ],
  "description": "303-style resonant sawtooth with filter envelope. Accent and glide modes.",
  "permissions": [
    "audio_out",
    "bus_publish",
    "bus_subscribe"
  ],
  "provides": [
    "capability.audio_out"
  ],
  "requires": [
    "capability.audio_context"
  ],
  "hooks": [
    {
      "hook_id": "acid.hook.trig_in",
      "direction": "in",
      "event_type": "pad:trigger",
      "contract_version": "1.0.0"
    },
    {
      "hook_id": "acid.hook.audio_out",
      "direction": "out",
      "event_type": "audio:signal",
      "contract_version": "1.0.0"
    }
  ],
  "params": {
    "pitch": {
      "type": "int",
      "min": 24,
      "max": 96,
      "default": 45,
      "unit": "MIDI note"
    },
    "cutoff": {
      "type": "float",
      "min": 80,
      "max": 8000,
      "default": 300,
      "unit": "Hz"
    },
    "res": {
      "type": "float",
      "min": 0,
      "max": 30,
      "default": 6,
      "unit": ""
    },
    "env": {
      "type": "float",
      "min": 0,
      "max": 1,
      "default": 0.4,
      "unit": ""
    },
    "decay": {
      "type": "float",
      "min": 0.01,
      "max": 2,
      "default": 0.3,
      "unit": "seconds"
    },
    "accent": {
      "type": "bool",
      "default": false
    },
    "glide": {
      "type": "bool",
      "default": false
    },
    "wave": {
      "type": "enum",
      "values": [
        "sawtooth",
        "square"
      ],
      "default": "sawtooth"
    }
  },
  "ui": {
    "type": "synth_scope",
    "accent_glide_toggles": true
  }
}