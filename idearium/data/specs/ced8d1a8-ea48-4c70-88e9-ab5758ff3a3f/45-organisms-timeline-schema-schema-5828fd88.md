---
chunk_uuid: 5828fd88-633b-4dcc-ad9f-e00097afe4bd
spec_uuid: ced8d1a8-ea48-4c70-88e9-ab5758ff3a3f
section: organisms-timeline-schema-schema
title: organisms/timeline/schema/schema.json
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ced8d1a8:organisms-timeline-schema-schema
contract_id: spec-contract:ced8d1a8:organisms-timeline-schema-schema:5828fd88
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-25T20:17:11.368Z
---

{
  "schema_version": "1.0.0",
  "id": "eravos.timeline",
  "label": "Timeline",
  "icon": "\ud83d\udcfc",
  "accent": "#00d4ff",
  "domain": [
    "music",
    "arrangement",
    "composition"
  ],
  "description": "Multi-lane audio arrangement timeline. Drag clips. Zoom. Waveform display.",
  "permissions": [
    "audio_out",
    "audio_in",
    "bus_publish",
    "bus_subscribe",
    "filesystem_read"
  ],
  "provides": [
    "capability.timeline",
    "capability.clip_store",
    "capability.seek"
  ],
  "requires": [
    "capability.audio_context"
  ],
  "hooks": [
    {
      "hook_id": "tl.hook.transport_in",
      "direction": "in",
      "event_type": "seq:play",
      "contract_version": "1.0.0"
    },
    {
      "hook_id": "tl.hook.stop_in",
      "direction": "in",
      "event_type": "seq:stop",
      "contract_version": "1.0.0"
    },
    {
      "hook_id": "tl.hook.clip_play_out",
      "direction": "out",
      "event_type": "timeline:clip_play",
      "contract_version": "1.0.0"
    }
  ],
  "params": {
    "px_per_sec": {
      "type": "float",
      "min": 20,
      "max": 400,
      "default": 80,
      "unit": "px/s"
    }
  },
  "ui": {
    "type": "horizontal_timeline",
    "lanes": "dynamic",
    "waveform": true
  }
}