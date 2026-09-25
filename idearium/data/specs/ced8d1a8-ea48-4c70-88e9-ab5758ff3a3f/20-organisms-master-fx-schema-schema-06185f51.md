---
chunk_uuid: 06185f51-31c4-43b8-a938-6e35f2755cf4
spec_uuid: ced8d1a8-ea48-4c70-88e9-ab5758ff3a3f
section: organisms-master-fx-schema-schema
title: organisms/master-fx/schema/schema.json
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ced8d1a8:organisms-master-fx-schema-schema
contract_id: spec-contract:ced8d1a8:organisms-master-fx-schema-schema:06185f51
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-25T20:17:11.360Z
---

{
  "schema_version": "1.0.0",
  "id": "eravos.master-fx",
  "label": "Master FX",
  "icon": "🎛",
  "accent": "#00ff88",
  "domain": ["music", "mixing", "master", "fx"],
  "description": "Control surface for the kernel's shared master bus: reverb send (procedurally generated impulse response, size + decay + mix), delay send (time + feedback + mix), and the final master compressor (threshold/ratio/attack/release). Every organism's audio.send() call routes through this bus.",
  "permissions": ["audio_out", "bus_publish", "bus_subscribe"],
  "provides": ["capability.master_fx_control"],
  "requires": ["capability.audio_context"],
  "dependencies": {
    "runtime": ["kernel/kernel.js"],
    "browser_apis": ["Web Audio API (ConvolverNode, DelayNode, DynamicsCompressorNode)"],
    "external_libs": []
  },
  "hooks": [],
  "params": {
    "reverbMix":   { "type": "float", "min": 0,    "max": 1,    "default": 0.35,  "unit": "" },
    "reverbTime":  { "type": "float", "min": 0.2,  "max": 6,    "default": 2.4,   "unit": "s" },
    "reverbDecay": { "type": "float", "min": 0.5,  "max": 8,    "default": 3.2,   "unit": "" },
    "delayMix":    { "type": "float", "min": 0,    "max": 1,    "default": 0.28,  "unit": "" },
    "delayTime":   { "type": "float", "min": 0.02, "max": 1.5,  "default": 0.32,  "unit": "s" },
    "delayFB":     { "type": "float", "min": 0,    "max": 0.92, "default": 0.35,  "unit": "" },
    "compThresh":  { "type": "float", "min": -60,  "max": 0,    "default": -24,   "unit": "dB" },
    "compRatio":   { "type": "float", "min": 1,    "max": 20,   "default": 12,    "unit": ":1" }
  }
}