---
chunk_uuid: 84f1efcb-30cd-40d0-9cff-cb6f866ac322
spec_uuid: ced8d1a8-ea48-4c70-88e9-ab5758ff3a3f
section: organisms-wobble-bass-schema-schema
title: organisms/wobble-bass/schema/schema.json
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ced8d1a8:organisms-wobble-bass-schema-schema
contract_id: spec-contract:ced8d1a8:organisms-wobble-bass-schema-schema:84f1efcb
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-25T20:17:11.366Z
---

{
  "schema_version": "1.0.0",
  "id": "eravos.wobble-bass",
  "label": "Wobble Bass",
  "icon": "\ud83d\udd0a",
  "accent": "#ff2266",
  "domain": [
    "music",
    "synthesis",
    "bass",
    "dubstep"
  ],
  "description": "Detuned sawtooth through LFO-swept resonant lowpass with distortion. Continuous or one-shot.",
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
      "hook_id": "wobble.hook.trig_in",
      "direction": "in",
      "event_type": "pad:trigger",
      "contract_version": "1.0.0"
    },
    {
      "hook_id": "wobble.hook.audio_out",
      "direction": "out",
      "event_type": "audio:signal",
      "contract_version": "1.0.0"
    }
  ],
  "params": {
    "freq": {
      "type": "float",
      "min": 20,
      "max": 220,
      "default": 110,
      "unit": "Hz"
    },
    "cutoff": {
      "type": "float",
      "min": 80,
      "max": 4000,
      "default": 600,
      "unit": "Hz"
    },
    "res": {
      "type": "float",
      "min": 0.5,
      "max": 20,
      "default": 8,
      "unit": ""
    },
    "rate": {
      "type": "float",
      "min": 0.1,
      "max": 16,
      "default": 4,
      "unit": "Hz"
    },
    "depth": {
      "type": "float",
      "min": 0,
      "max": 2000,
      "default": 600,
      "unit": "Hz"
    },
    "drive": {
      "type": "float",
      "min": 0,
      "max": 1,
      "default": 0.4,
      "unit": ""
    },
    "waveform": {
      "type": "enum",
      "values": [
        "sawtooth",
        "square",
        "triangle"
      ],
      "default": "sawtooth"
    }
  },
  "ui": {
    "type": "filter_scope",
    "continuous_mode": true
  }
}