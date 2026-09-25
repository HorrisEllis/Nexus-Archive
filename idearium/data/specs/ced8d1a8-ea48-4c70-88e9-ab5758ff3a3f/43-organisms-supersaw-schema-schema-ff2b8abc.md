---
chunk_uuid: ff2b8abc-e8ee-4191-8b8a-569b156e7e59
spec_uuid: ced8d1a8-ea48-4c70-88e9-ab5758ff3a3f
section: organisms-supersaw-schema-schema
title: organisms/supersaw/schema/schema.json
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ced8d1a8:organisms-supersaw-schema-schema
contract_id: spec-contract:ced8d1a8:organisms-supersaw-schema-schema:ff2b8abc
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-25T20:17:11.367Z
---

{
  "schema_version": "1.0.0",
  "id": "eravos.supersaw",
  "label": "Supersaw",
  "icon": "🌟",
  "accent": "#ffd400",
  "domain": ["music", "synthesis", "lead", "edm"],
  "description": "7-voice detuned sawtooth unison lead/pluck synth. The classic EDM supersaw stack — wide, bright, festival-lead sound. One-shot trigger or sustained hold.",
  "permissions": ["audio_out", "midi_in", "bus_publish", "bus_subscribe"],
  "provides": ["capability.audio_out", "capability.lead_voice"],
  "requires": ["capability.audio_context"],
  "dependencies": {
    "runtime": ["kernel/kernel.js"],
    "browser_apis": ["Web Audio API (OscillatorNode, GainNode, BiquadFilterNode)"],
    "external_libs": []
  },
  "hooks": [
    { "hook_id": "supersaw.hook.trig_in",   "direction": "in",  "event_type": "pad:trigger",  "contract_version": "1.0.0" },
    { "hook_id": "supersaw.hook.midi_in",   "direction": "in",  "event_type": "midi:note",    "contract_version": "1.0.0" },
    { "hook_id": "supersaw.hook.audio_out", "direction": "out", "event_type": "audio:signal", "contract_version": "1.0.0" }
  ],
  "params": {
    "pitch":    { "type": "int",   "min": 24,  "max": 96,   "default": 60,   "unit": "MIDI note" },
    "voices":   { "type": "int",   "min": 3,   "max": 7,    "default": 7,    "unit": "" },
    "detune":   { "type": "float", "min": 0,   "max": 50,   "default": 18,   "unit": "cents" },
    "spread":   { "type": "float", "min": 0,   "max": 1,    "default": 0.6,  "unit": "" },
    "cutoff":   { "type": "float", "min": 200, "max": 12000,"default": 5000, "unit": "Hz" },
    "attack":   { "type": "float", "min": 0,   "max": 1,    "default": 0.01, "unit": "s" },
    "decay":    { "type": "float", "min": 0.05,"max": 3,    "default": 0.6,  "unit": "s" }
  }
}