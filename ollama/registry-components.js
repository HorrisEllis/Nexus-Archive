'use strict';
const SYSTEM_ID = 'ollama';
const VERSION   = '1.0.0';
// 2026-06-27 FIX: same bug as copilot/registry-components.js — all 5
// components were missing namespace/name/version, which
// lib/component-registry.js's validate() requires per-component (not just
// the module-level systemId/version above). Boot log confirmed:
// "system:ollama registered 0 components (5 failed)" — every single one.
module.exports = {
  systemId: SYSTEM_ID, version: VERSION, port: 3749,
  label: 'OLLAMA', purpose: 'Sovereign local model bridge. Isolated from Guardian.',
  components: [
    { id:'ollama.jobs.dispatch', namespace:SYSTEM_ID, name:'ollama.jobs.dispatch', version:VERSION,
      uuid:'nexus-ollama-comp-dispatch-v1-001',
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
    { id:'ollama.jobs.list', namespace:SYSTEM_ID, name:'ollama.jobs.list', version:VERSION,
      uuid:'nexus-ollama-comp-list-v1-001',
      grammar:['ollama jobs','oj'], route:{ method:'GET', path:'/api/jobs' },
      description:'List recent jobs' },
    { id:'ollama.queue.status', namespace:SYSTEM_ID, name:'ollama.queue.status', version:VERSION,
      uuid:'nexus-ollama-comp-queue-v1-001',
      grammar:['ollama queue','oq'], route:{ method:'GET', path:'/api/queue' },
      description:'Queue depth and running count' },
    { id:'ollama.models.list', namespace:SYSTEM_ID, name:'ollama.models.list', version:VERSION,
      uuid:'nexus-ollama-comp-models-v1-001',
      grammar:['ollama models','om'], route:{ method:'GET', path:'/api/models' },
      description:'Available local models' },
    { id:'ollama.health', namespace:SYSTEM_ID, name:'ollama.health', version:VERSION,
      uuid:'nexus-ollama-comp-health-v1-001',
      grammar:['ollama health'], route:{ method:'GET', path:'/health' },
      description:'Ollama bridge health' },
  ],
  events:{
    emits:['ollama.booted','ollama.job.queued','ollama.job.started',
           'ollama.job.complete','ollama.job.failed','ollama.health.ok','ollama.health.degraded'],
    handles:['raid.dispatch.ollama','orchestrator.shutdown'],
  },
};
