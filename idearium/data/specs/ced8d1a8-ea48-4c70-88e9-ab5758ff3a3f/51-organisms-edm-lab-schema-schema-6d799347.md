---
chunk_uuid: 6d799347-15c8-4865-b9de-278f39a19430
spec_uuid: ced8d1a8-ea48-4c70-88e9-ab5758ff3a3f
section: organisms-edm-lab-schema-schema
title: organisms/edm-lab/schema/schema.json
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ced8d1a8:organisms-edm-lab-schema-schema
contract_id: spec-contract:ced8d1a8:organisms-edm-lab-schema-schema:6d799347
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-25T20:17:11.370Z
---

{
  "schema_version": "1.0.0",
  "id": "eravos.edm-lab",
  "label": "EDM Lab",
  "icon": "\u26a1",
  "accent": "#ff2266",
  "domain": [
    "music",
    "synthesis",
    "bass",
    "electronic"
  ],
  "description": "Three concurrent engines: Bass filter visualiser, Rhythm density canvas, Tension dissonance dial. Drop trigger fires all.",
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
      "hook_id": "edm.hook.audio_out",
      "direction": "out",
      "event_type": "audio:signal",
      "contract_version": "1.0.0"
    },
    {
      "hook_id": "edm.hook.drop_out",
      "direction": "out",
      "event_type": "edm:drop-fired",
      "contract_version": "1.0.0"
    },
    {
      "hook_id": "edm.hook.step_out",
      "direction": "out",
      "event_type": "edm:rhythm-step",
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
    "bass_freq": {
      "type": "float",
      "min": 20,
      "max": 220,
      "default": 55,
      "unit": "Hz"
    },
    "bass_cutoff": {
      "type": "float",
      "min": 80,
      "max": 4000,
      "default": 600,
      "unit": "Hz"
    },
    "lfo_rate": {
      "type": "float",
      "min": 0.1,
      "max": 16,
      "default": 4,
      "unit": "Hz"
    },
    "tension": {
      "type": "float",
      "min": 0,
      "max": 100,
      "default": 0,
      "unit": "%"
    }
  },
  "ui": {
    "type": "three_column_lab",
    "sections": [
      "bass_engine",
      "rhythm_engine",
      "tension_engine"
    ]
  },
  "nexus_build_hints": {
    "engine_pattern": "multi_engine_lab",
    "engines": 3
  }
}