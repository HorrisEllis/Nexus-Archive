---
chunk_uuid: b6025e75-377c-4736-9f6a-02596d0fe02f
spec_uuid: ced8d1a8-ea48-4c70-88e9-ab5758ff3a3f
section: organisms-sidechain-compressor-schema-schema
title: organisms/sidechain-compressor/schema/schema.json
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ced8d1a8:organisms-sidechain-compressor-schema-schema
contract_id: spec-contract:ced8d1a8:organisms-sidechain-compressor-schema-schema:b6025e75
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-25T20:17:11.376Z
---

{
  "schema_version": "1.0.0",
  "id": "eravos.sidechain-compressor",
  "label": "Sidechain",
  "icon": "🫀",
  "accent": "#00d4ff",
  "domain": ["music", "dynamics", "sidechain", "mixing"],
  "description": "Ducks the master bus gain on every trigger from a chosen source sound (default: kick). Produces the classic EDM sidechain 'pump'. Real-time gain envelope, no external plugin.",
  "permissions": ["audio_out", "bus_publish", "bus_subscribe"],
  "provides": ["capability.sidechain_duck"],
  "requires": ["capability.audio_context"],
  "dependencies": {
    "runtime": ["kernel/kernel.js"],
    "browser_apis": ["Web Audio API (GainNode.gain automation)"],
    "external_libs": []
  },
  "hooks": [
    { "hook_id": "sidechain.hook.trig_in", "direction": "in", "event_type": "pad:trigger", "contract_version": "1.0.0" }
  ],
  "params": {
    "source":  { "type": "enum",  "options": ["kick", "808", "snare", "clap"], "default": "kick" },
    "amount":  { "type": "float", "min": 0,    "max": 1,   "default": 0.7,  "unit": "" },
    "attack":  { "type": "float", "min": 0.001,"max": 0.2, "default": 0.005,"unit": "s" },
    "release": { "type": "float", "min": 0.02, "max": 1.5, "default": 0.28, "unit": "s" },
    "enabled": { "type": "bool",  "default": true }
  }
}