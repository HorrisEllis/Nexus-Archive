---
chunk_uuid: 17db7cde-22d5-41bc-9f7a-f32f6a23cf61
spec_uuid: ced8d1a8-ea48-4c70-88e9-ab5758ff3a3f
section: manifest
title: manifest.json
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ced8d1a8:manifest
contract_id: spec-contract:ced8d1a8:manifest:17db7cde
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-25T20:17:11.378Z
---

{
  "manifest_version": "1.0.0",
  "pack_id": "eravos.core",
  "pack_version": "3.0.0",
  "pack_type": "organism_pack",
  "label": "ERAVOS Core",
  "icon": "🎛",
  "description": "ERAVOS kernel + 28 organisms. Drop-in zip. Opens as file://.",
  "author": "James Brooks",
  "kernel_target": "3.0.0",
  "status": "canonical",

  "permissions": [
    "audio_out", "audio_in",
    "midi_in", "midi_out",
    "bus_publish", "bus_subscribe",
    "filesystem_read",
    "network_fetch",
    "serial_access"
  ],

  "provides": [
    "capability.audio_context",
    "capability.pad_trigger",
    "capability.sequencer",
    "capability.timeline",
    "capability.sample_source",
    "capability.lfo",
    "capability.audio_out",
    "capability.channel_strip",
    "capability.lead_voice",
    "capability.sidechain_duck",
    "capability.master_fx_control",
    "capability.image_edit",
    "capability.image_export",
    "capability.video_edit",
    "capability.video_export",
    "capability.serial_io",
    "capability.hardware_control",
    "capability.automation_record",
    "capability.automation_playback",
    "capability.external_automation"
  ],

  "requires": [],
  "dependencies": [],

  "contents": {
    "manifest": "manifest.json",
    "shell": "index.html",
    "kernel": [
      "kernel/kernel.js",
      "kernel/intake.js"
    ],
    "runtime": [
      "runtime/canvas-wm.js",
      "runtime/organism-factory.js"
    ],
    "organisms": [
      {
        "id": "eravos.pads",
        "label": "Drum Machine",
        "engine": "organisms/pads/pads.engine.js"
      },
      {
        "id": "eravos.sequencer",
        "label": "Sequencer",
        "engine": "organisms/sequencer/sequencer.engine.js"
      },
      {
        "id": "eravos.timeline",
        "label": "Timeline",
        "engine": "organisms/timeline/timeline.engine.js"
      },
      {
        "id": "eravos.sample-player",
        "label": "Sample Player",
        "engine": "organisms/sample-player/sample-player.engine.js"
      },
      {
        "id": "eravos.lfo",
        "label": "LFO",
        "engine": "organisms/lfo/lfo.engine.js"
      },
      {
        "id": "eravos.wobble-bass",
        "label": "Wobble Bass",
        "engine": "organisms/wobble-bass/wobble-bass.engine.js"
      },
      {
        "id": "eravos.acid-synth",
        "label": "Acid Synth",
        "engine": "organisms/acid-synth/acid-synth.engine.js"
      },
      {
        "id": "eravos.reese-bass",
        "label": "Reese Bass",
        "engine": "organisms/reese-bass/reese-bass.engine.js"
      },
      {
        "id": "eravos.channel",
        "label": "Channel",
        "engine": "organisms/channel/channel.engine.js"
      },
      {
        "id": "eravos.xy-pad",
        "label": "XY Controller",
        "engine": "organisms/xy-pad/xy-pad.engine.js"
      },
      {
        "id": "eravos.edm-lab",
        "label": "EDM Lab",
        "engine": "organisms/edm-lab/edm-lab.engine.js"
      },
      {
        "id": "eravos.contrast-analyser",
        "label": "Contrast Analyser",
        "engine": "organisms/contrast-analyser/contrast-analyser.engine.js"
      },
      {
        "id": "eravos.bass-drop-builder",
        "label": "Bass Drop Builder",
        "engine": "organisms/bass-drop-builder/bass-drop-builder.engine.js"
      },
      {
        "id": "eravos.nexus-cortex",
        "label": "Nexus Cortex",
        "engine": "organisms/nexus-cortex/nexus-cortex.engine.js"
      },
      {
        "id": "eravos.nexus-guardian",
        "label": "Nexus Guardian",
        "engine": "organisms/nexus-guardian/nexus-guardian.engine.js"
      },
      {
        "id": "eravos.nexus-bridge",
        "label": "Nexus Bridge",
        "engine": "organisms/nexus-bridge/nexus-bridge.engine.js"
      },
      {
        "id": "eravos.nexus-orchestrator",
        "label": "Nexus Orchestrator",
        "engine": "organisms/nexus-orchestrator/nexus-orchestrator.engine.js"
      },
      {
        "id": "eravos.nexus-diagnostic",
        "label": "Nexus Diagnostic",
        "engine": "organisms/nexus-diagnostic/nexus-diagnostic.engine.js"
      },
      {
        "id": "eravos.nexus-architect",
        "label": "Nexus Architect",
        "engine": "organisms/nexus-architect/nexus-architect.engine.js"
      },
      {
        "id": "eravos.nexus-idearium",
        "label": "Nexus Idearium",
        "engine": "organisms/nexus-idearium/nexus-idearium.engine.js"
      },
      {
        "id": "eravos.supersaw",
        "label": "Supersaw",
        "engine": "organisms/supersaw/supersaw.engine.js"
      },
      {
        "id": "eravos.sidechain-compressor",
        "label": "Sidechain",
        "engine": "organisms/sidechain-compressor/sidechain-compressor.engine.js"
      },
      {
        "id": "eravos.master-fx",
        "label": "Master FX",
        "engine": "organisms/master-fx/master-fx.engine.js"
      },
      {
        "id": "eravos.photo-editor",
        "label": "Photo Editor",
        "engine": "organisms/photo-editor/photo-editor.engine.js"
      },
      {
        "id": "eravos.video-editor",
        "label": "Video Editor",
        "engine": "organisms/video-editor/video-editor.engine.js"
      },
      {
        "id": "eravos.serial-bridge",
        "label": "Serial Bridge",
        "engine": "organisms/serial-bridge/serial-bridge.engine.js"
      },
      {
        "id": "eravos.macro-automation",
        "label": "Macro Automation",
        "engine": "organisms/macro-automation/macro-automation.engine.js"
      },
      {
        "id": "eravos.webhook-automation",
        "label": "Webhook Automation",
        "engine": "organisms/webhook-automation/webhook-automation.engine.js"
      }
    ],
    "specs": [
      "specs/ERAVOS.kernel.spec",
      "specs/eravos.organism.pads.spec",
      "specs/eravos.organism.sequencer.spec",
      "specs/eravos.organism.timeline.spec",
      "specs/eravos.organism.sample-player.spec",
      "specs/eravos.pack.format.spec",
      "specs/eravos.nexus.build-contract.spec"
    ]
  },

  "auto_mount": ["eravos.pads"],

  "install_behavior": {
    "spawn_at_drop_position": true,
    "audio_files": "spawn_sample_player",
    "midi_files":  "spawn_sequencer",
    "zip_files":   "install_pack"
  }
}