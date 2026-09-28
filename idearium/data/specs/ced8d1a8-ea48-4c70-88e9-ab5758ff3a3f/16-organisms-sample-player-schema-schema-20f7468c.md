---
chunk_uuid: 20f7468c-528e-4da9-ad20-1204e6e455e2
spec_uuid: ced8d1a8-ea48-4c70-88e9-ab5758ff3a3f
section: organisms-sample-player-schema-schema
title: organisms/sample-player/schema/schema.json
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ced8d1a8:organisms-sample-player-schema-schema
contract_id: spec-contract:ced8d1a8:organisms-sample-player-schema-schema:20f7468c
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-25T20:17:11.359Z
---

{
  "schema_version": "1.0.0",
  "id": "eravos.sample-player",
  "label": "Sample Player",
  "icon": "\ud83c\udfb5",
  "accent": "#aa44ff",
  "domain": [
    "music",
    "audio",
    "playback"
  ],
  "description": "Single-file sample player. Waveform IS the interface. Drag start/end handles. Pitch shift. Loop. Reverse.",
  "permissions": [
    "audio_out",
    "bus_publish",
    "bus_subscribe",
    "filesystem_read"
  ],
  "provides": [
    "capability.audio_out",
    "capability.sample_source"
  ],
  "requires": [
    "capability.audio_context"
  ],
  "hooks": [
    {
      "hook_id": "samp.hook.audio_out",
      "direction": "out",
      "event_type": "audio:signal",
      "contract_version": "1.0.0"
    },
    {
      "hook_id": "samp.hook.trigger_in",
      "direction": "in",
      "event_type": "pad:trigger",
      "contract_version": "1.0.0"
    }
  ],
  "params": {
    "gain": {
      "type": "float",
      "min": 0,
      "max": 2,
      "default": 1.0,
      "unit": ""
    },
    "pitch": {
      "type": "float",
      "min": -24,
      "max": 24,
      "default": 0,
      "unit": "semitones"
    },
    "start": {
      "type": "float",
      "min": 0,
      "max": 1,
      "default": 0,
      "unit": "normalized"
    },
    "end": {
      "type": "float",
      "min": 0,
      "max": 1,
      "default": 1,
      "unit": "normalized"
    },
    "loop": {
      "type": "bool",
      "default": false
    },
    "reverse": {
      "type": "bool",
      "default": false
    }
  },
  "ui": {
    "type": "waveform_full",
    "handles": [
      "start",
      "end"
    ],
    "scrub": true
  },
  "spawn_on": [
    "audio:sample"
  ]
}