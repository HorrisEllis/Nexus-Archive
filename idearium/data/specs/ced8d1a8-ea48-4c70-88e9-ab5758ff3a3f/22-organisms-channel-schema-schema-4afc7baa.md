---
chunk_uuid: 4afc7baa-292f-40d9-b8ad-d1b8a1649da2
spec_uuid: ced8d1a8-ea48-4c70-88e9-ab5758ff3a3f
section: organisms-channel-schema-schema
title: organisms/channel/schema/schema.json
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ced8d1a8:organisms-channel-schema-schema
contract_id: spec-contract:ced8d1a8:organisms-channel-schema-schema:4afc7baa
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-25T20:17:11.360Z
---

{
  "schema_version": "1.0.0",
  "id": "eravos.channel",
  "label": "Channel Strip",
  "icon": "\ud83c\udf9a",
  "accent": "#6a88a8",
  "domain": [
    "music",
    "mixing",
    "routing"
  ],
  "description": "Audio channel strip. Gain, pan, mute, solo. VU metering. Receives audio:signal from any organism.",
  "permissions": [
    "audio_out",
    "audio_in",
    "bus_publish",
    "bus_subscribe"
  ],
  "provides": [
    "capability.channel_strip"
  ],
  "requires": [],
  "hooks": [
    {
      "hook_id": "ch.hook.audio_in",
      "direction": "in",
      "event_type": "audio:signal",
      "contract_version": "1.0.0"
    },
    {
      "hook_id": "ch.hook.bus_out",
      "direction": "out",
      "event_type": "bus:send",
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
    "pan": {
      "type": "float",
      "min": -1,
      "max": 1,
      "default": 0,
      "unit": ""
    },
    "send_rev": {
      "type": "float",
      "min": 0,
      "max": 1,
      "default": 0.2,
      "unit": ""
    },
    "send_del": {
      "type": "float",
      "min": 0,
      "max": 1,
      "default": 0,
      "unit": ""
    },
    "mute": {
      "type": "bool",
      "default": false
    },
    "solo": {
      "type": "bool",
      "default": false
    }
  },
  "ui": {
    "type": "channel_strip_vertical",
    "vu_meter": true
  }
}