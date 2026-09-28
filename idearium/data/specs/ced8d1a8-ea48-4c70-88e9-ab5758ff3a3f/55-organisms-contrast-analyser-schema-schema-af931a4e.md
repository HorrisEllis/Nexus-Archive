---
chunk_uuid: af931a4e-bbe2-4e06-8e9f-21f915eb0634
spec_uuid: ced8d1a8-ea48-4c70-88e9-ab5758ff3a3f
section: organisms-contrast-analyser-schema-schema
title: organisms/contrast-analyser/schema/schema.json
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ced8d1a8:organisms-contrast-analyser-schema-schema
contract_id: spec-contract:ced8d1a8:organisms-contrast-analyser-schema-schema:af931a4e
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-25T20:17:11.371Z
---

{
  "schema_version": "1.0.0",
  "id": "eravos.contrast-analyser",
  "label": "Contrast Analyser",
  "icon": "\u27fa",
  "accent": "#00d4ff",
  "domain": [
    "music",
    "analysis",
    "mixing"
  ],
  "description": "Three-mode audio contrast analyser. FREQUENCY: clash score. DYNAMIC: RMS comparison. RHYTHMIC: transient grid with tension arcs.",
  "permissions": [
    "audio_in",
    "bus_publish",
    "bus_subscribe"
  ],
  "provides": [
    "capability.audio_analysis"
  ],
  "requires": [],
  "hooks": [
    {
      "hook_id": "ca.hook.slot_a_in",
      "direction": "in",
      "event_type": "audio:buffer",
      "contract_version": "1.0.0"
    },
    {
      "hook_id": "ca.hook.slot_b_in",
      "direction": "in",
      "event_type": "audio:buffer",
      "contract_version": "1.0.0"
    },
    {
      "hook_id": "ca.hook.analysis_out",
      "direction": "out",
      "event_type": "contrast:analysis",
      "contract_version": "1.0.0"
    }
  ],
  "params": {
    "mode": {
      "type": "enum",
      "values": [
        "frequency",
        "dynamic",
        "rhythmic"
      ],
      "default": "frequency"
    },
    "bpm": {
      "type": "int",
      "min": 60,
      "max": 220,
      "default": 128,
      "unit": "BPM"
    },
    "sensitivity": {
      "type": "float",
      "min": 0,
      "max": 1,
      "default": 0.3,
      "unit": ""
    }
  },
  "ui": {
    "type": "dual_slot_analyser",
    "modes": 3,
    "canvas_driven": true
  }
}