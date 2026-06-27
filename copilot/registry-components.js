'use strict';
// 2026-06-27 FIX: all 4 components were failing registration — confirmed via
// lib/component-registry.js's validate(): REQUIRED_FIELDS includes
// 'namespace', 'name', 'version' at the component level (not just the
// module-level systemId/version above), and none of the 4 entries below had
// them. Same exact bug, same fix, as ollama/registry-components.js — both
// new sovereign systems were missing fields that eravos's (which registered
// successfully, 8/8) already had. Confirmed against the boot log:
// "system:copilot registered 0 components (4 failed)" — every single one.
module.exports = {
  systemId:'copilot', version:'2.0.0', port:3750,
  label:'COPILOT', purpose:'Sovereign co-pilot. Continuous stream of consciousness.',
  components:[
    { id:'copilot.prompt', namespace:'copilot', name:'copilot.prompt', version:'2.0.0',
      uuid:'nexus-copilot-comp-prompt-v2-001',
      grammar:['ask','copilot','cp'],
      route:{ method:'POST', path:'/api/prompt' },
      description:'Primary entry. All co-pilot interactions.',
      hooks:{
        in:[{ id:'copilot.prompt.receive',
              intent:['ask','build','diagnose','navigate','note','tool','action'],
              contract:'nexus-interaction-contract-v1::copilot',
              tags:['copilot','user-intent','entry-point'] }],
        out:[
          { id:'copilot.prompt.to-ollama',     wires_to:['ollama.jobs.dispatch.receive'],    tags:['model'] },
          { id:'copilot.prompt.to-cortex',     wires_to:['cortex.memory.chat_log.write'],   tags:['persist'] },
          { id:'copilot.prompt.reply',          wires_to:['ui.copilot.receive'],              tags:['response'] },
        ]
      }
    },
    { id:'copilot.stream.query', namespace:'copilot', name:'copilot.stream.query', version:'2.0.0',
      uuid:'nexus-copilot-comp-stream-v2-001',
      grammar:['stream','copilot stream','cs'],
      route:{ method:'GET', path:'/api/stream' },
      description:'Query the continuous event stream' },
    { id:'copilot.stream.ingest', namespace:'copilot', name:'copilot.stream.ingest', version:'2.0.0',
      uuid:'nexus-copilot-comp-ingest-v2-001',
      grammar:['stream ingest'],
      route:{ method:'POST', path:'/api/stream/ingest' },
      description:'Push events into co-pilot stream from any system' },
    { id:'copilot.sessions', namespace:'copilot', name:'copilot.sessions', version:'2.0.0',
      uuid:'nexus-copilot-comp-sessions-v2-001',
      grammar:['copilot sessions'],
      route:{ method:'GET', path:'/api/sessions' },
      description:'Active co-pilot sessions' },
  ],
  events:{
    emits:['copilot.booted','copilot.prompt.received','copilot.context.assembled',
           'copilot.answered','copilot.stream.event'],
    handles:['ollama.job.complete','cortex.pattern.crystallized',
             'guardian.gap.opened','orchestrator.shutdown'],
  },
};
