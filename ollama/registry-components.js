'use strict';
const SYSTEM_ID = 'ollama';
const VERSION   = '1.0.0';
module.exports = {
  systemId: SYSTEM_ID, version: VERSION, port: 3749,
  label: 'OLLAMA', purpose: 'Sovereign local model bridge. Isolated from Guardian.',
  components: [
    { id:'ollama.jobs.dispatch', uuid:'nexus-ollama-comp-dispatch-v1-001',
      grammar:['ollama dispatch','od','ollama run'],
      route:{ method:'POST', path:'/api/jobs' },
      description:'Queue a job for local model execution',
      hooks:{
        in:[{ id:'ollama.jobs.dispatch.receive',
              intent:['build','ask','forge','classify','synthesize','compile'],
              contract:'nexus-interaction-contract-v1::ollama',
              tags:['dispatch','local','ollama'] }],
        out:[{ id:'ollama.jobs.dispatch.complete',
               wires_to:['cortex.raid.feedback','copilot.receive_result'],
               tags:['result','complete'] }]
      }
    },
    { id:'ollama.jobs.list',    uuid:'nexus-ollama-comp-list-v1-001',
      grammar:['ollama jobs','oj'], route:{ method:'GET', path:'/api/jobs' },
      description:'List recent jobs' },
    { id:'ollama.queue.status', uuid:'nexus-ollama-comp-queue-v1-001',
      grammar:['ollama queue','oq'], route:{ method:'GET', path:'/api/queue' },
      description:'Queue depth and running count' },
    { id:'ollama.models.list',  uuid:'nexus-ollama-comp-models-v1-001',
      grammar:['ollama models','om'], route:{ method:'GET', path:'/api/models' },
      description:'Available local models' },
    { id:'ollama.health',       uuid:'nexus-ollama-comp-health-v1-001',
      grammar:['ollama health'], route:{ method:'GET', path:'/health' },
      description:'Ollama bridge health' },
  ],
  events:{
    emits:['ollama.booted','ollama.job.queued','ollama.job.started',
           'ollama.job.complete','ollama.job.failed','ollama.health.ok','ollama.health.degraded'],
    handles:['raid.dispatch.ollama','orchestrator.shutdown'],
  },
};
