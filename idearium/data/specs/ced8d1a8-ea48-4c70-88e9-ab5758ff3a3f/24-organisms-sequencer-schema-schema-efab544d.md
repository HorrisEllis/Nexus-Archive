---
chunk_uuid: efab544d-86ca-472f-8c5c-e5ecd0351c03
spec_uuid: ced8d1a8-ea48-4c70-88e9-ab5758ff3a3f
section: organisms-sequencer-schema-schema
title: organisms/sequencer/schema/schema.json
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ced8d1a8:organisms-sequencer-schema-schema
contract_id: spec-contract:ced8d1a8:organisms-sequencer-schema-schema:efab544d
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-25T20:17:11.361Z
---

{
  "schema_version": "1.0.0",
  "id": "eravos.sequencer",
  "label": "Sequencer",
  "icon": "\u2b1b",
  "accent": "#00d4ff",
  "domain": [
    "music",
    "rhythm",
    "pattern"
  ],
  "description": "16/32-step probabilistic sequencer. 16 tracks. Swing. Record mode. BPM clock source.",
  "permissions": [
    "audio_out",
    "bus_publish",
    "bus_subscribe"
  ],
  "provides": [
    "capability.sequencer",
    "capability.clock_source"
  ],
  "requires": [
    "capability.audio_context"
  ],
  "hooks": [
    {
      "hook_id": "seq.hook.fire_out",
      "direction": "out",
      "event_type": "seq:fire",
      "contract_version": "1.0.0"
    },
    {
      "hook_id": "seq.hook.play_out",
      "direction": "out",
      "event_type": "seq:play",
      "contract_version": "1.0.0"
    },
    {
      "hook_id": "seq.hook.stop_out",
      "direction": "out",
      "event_type": "seq:stop",
      "contract_version": "1.0.0"
    },
    {
      "hook_id": "seq.hook.bank_in",
      "direction": "in",
      "event_type": "pad:bank-change",
      "contract_version": "1.0.0"
    }
  ],
  "params": {
    "bpm": {
      "type": "int",
      "min": 40,
      "max": 240,
      "default": 128,
      "unit": "BPM"
    },
    "steps": {
      "type": "int",
      "min": 16,
      "max": 32,
      "default": 16,
      "unit": "steps"
    },
    "swing": {
      "type": "bool",
      "default": false
    }
  },
  "ui": {
    "type": "step_grid",
    "tracks": 16,
    "steps": 32
  },
  "nexus_build_hints": {
    "engine_pattern": "clock_driven_grid",
    "bpm_sync": true
  }
}