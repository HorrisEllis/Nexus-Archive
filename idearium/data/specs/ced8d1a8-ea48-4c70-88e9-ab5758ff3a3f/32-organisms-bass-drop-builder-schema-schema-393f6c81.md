---
chunk_uuid: 393f6c81-9c7d-497c-857c-46764c3505ad
spec_uuid: ced8d1a8-ea48-4c70-88e9-ab5758ff3a3f
section: organisms-bass-drop-builder-schema-schema
title: organisms/bass-drop-builder/schema/schema.json
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ced8d1a8:organisms-bass-drop-builder-schema-schema
contract_id: spec-contract:ced8d1a8:organisms-bass-drop-builder-schema-schema:393f6c81
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-25T20:17:11.363Z
---

{
  "schema_version": "1.0.0",
  "id": "eravos.bass-drop-builder",
  "label": "Bass Drop Builder",
  "icon": "\ud83d\udd3b",
  "accent": "#ff2266",
  "domain": [
    "music",
    "production",
    "bass",
    "drop"
  ],
  "description": "Horizontal timeline with draggable stage boundaries TENSION-SLOPE-BUILD-DROP. Vocal clip lane. Full synthesis sequence on FIRE.",
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
      "hook_id": "drop.hook.fire",
      "direction": "in",
      "event_type": "ui:fire",
      "contract_version": "1.0.0"
    },
    {
      "hook_id": "drop.hook.vocal_in",
      "direction": "in",
      "event_type": "audio:buffer",
      "contract_version": "1.0.0"
    },
    {
      "hook_id": "drop.hook.stage_out",
      "direction": "out",
      "event_type": "bass-drop:stage",
      "contract_version": "1.0.0"
    }
  ],
  "params": {
    "bpm": {
      "type": "int",
      "min": 60,
      "max": 220,
      "default": 128,
      "unit": "BPM"
    },
    "tension_dur": {
      "type": "float",
      "min": 0.5,
      "max": 8,
      "default": 4.0,
      "unit": "seconds"
    },
    "slope_dur": {
      "type": "float",
      "min": 0.5,
      "max": 4,
      "default": 2.0,
      "unit": "seconds"
    },
    "build_dur": {
      "type": "float",
      "min": 0.5,
      "max": 8,
      "default": 4.0,
      "unit": "seconds"
    },
    "freq": {
      "type": "float",
      "min": 20,
      "max": 220,
      "default": 55,
      "unit": "Hz"
    },
    "drive": {
      "type": "float",
      "min": 0,
      "max": 1,
      "default": 0.6,
      "unit": ""
    },
    "vocal_stage": {
      "type": "enum",
      "values": [
        "tension",
        "slope",
        "build",
        "drop",
        "after"
      ],
      "default": "drop"
    },
    "vocal_offset": {
      "type": "float",
      "min": -2,
      "max": 4,
      "default": 0,
      "unit": "seconds"
    }
  },
  "ui": {
    "type": "horizontal_stage_timeline",
    "vocal_lane": true,
    "stage_count": 4
  }
}