'use strict';
module.exports = {
  systemId:'copilot', version:'2.0.0', port:3750,
  label:'COPILOT', purpose:'Sovereign co-pilot. Continuous stream of consciousness.',
  components:[
    { id:'copilot.prompt', uuid:'nexus-copilot-comp-prompt-v2-001',
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
    { id:'copilot.stream.query', uuid:'nexus-copilot-comp-stream-v2-001',
      grammar:['stream','copilot stream','cs'],
      route:{ method:'GET', path:'/api/stream' },
      description:'Query the continuous event stream' },
    { id:'copilot.stream.ingest', uuid:'nexus-copilot-comp-ingest-v2-001',
      grammar:['stream ingest'],
      route:{ method:'POST', path:'/api/stream/ingest' },
      description:'Push events into co-pilot stream from any system' },
    { id:'copilot.sessions', uuid:'nexus-copilot-comp-sessions-v2-001',
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
