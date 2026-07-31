'use strict';
/**
 * ollama/registry-components.js
 * comp_id: nexus.ollama.registry
 * uuid: nexus-ollama-registry-v1-0000-2026-0627-jamesbrooks-001
 */
const NS='ollama',V='1.0.0';
function _c(id,method,path,desc,opts={}){
  return{id:`${NS}.${id}`,namespace:NS,name:id,version:V,
    grammar:opts.grammar||[NS+' '+id.replace(/\./g,' ')],
    route:{method,path},description:desc,
    params:opts.params||[],tags:[NS,...(opts.tags||[])],
    permissions:opts.permissions||['system'],hooks:opts.hooks||{}};
}
const components=[
  _c('jobs.dispatch','POST','/api/jobs','Queue a job for local model execution',{
    grammar:['ollama dispatch','od','ollama run'],tags:['dispatch'],
    hooks:{
      in:[{id:'ollama.jobs.dispatch.receive',intent:['build','ask','forge','classify'],contract:'nexus-interaction-contract-v1::ollama',tags:['dispatch']}],
      out:[{id:'ollama.jobs.dispatch.complete',wires_to:['cortex.raid.feedback','copilot.receive_result'],tags:['result']}]
    }
  }),
  _c('chat.tools','POST','/api/chat/tools','ONE tool-capable model turn — tools declared, tool_calls returned, no loop and no queue (ollama/chat-tools.js callChatWithTools). The model primitive a caller-owned agent loop is built from: copilot drives its own loop over this so it can own the system prompt, memory (P2) and live stream (P3); guardian does the same with its own providers at P4 without depending on copilot. Synchronous — a job id to poll would put the queue between every iteration of somebody else\'s loop. Built 2026-07-31 to close p1_open_drift: /api/jobs resolves to Ollama /api/generate, which has no tools param, so a queued job can never carry tools nor return tool_calls.',{
    grammar:['ollama chat tools','tool turn'],tags:['dispatch','agentic','primitive'],
    hooks:{
      in:[{id:'ollama.chat.tools.receive',intent:['ask','build','diagnose','tool'],contract:'nexus-interaction-contract-v1::ollama',tags:['dispatch','agentic']}],
      out:[{id:'ollama.chat.tools.complete',wires_to:['copilot.receive_result'],tags:['result']}]
    }
  }),
  _c('jobs.tools','POST','/api/jobs/tools','Tool-enabled model call — real agent-tools loop over Ollama /api/chat with tools declared (ollama/server.js:135 _dispatchWithTools). Synchronous: returns {text, iterations, toolCallLog} directly, NOT a jobId to poll — a different contract from jobs.dispatch, deliberately a separate endpoint because multiple model round-trips have a real cost/latency profile a caller opts into. Built 2026-07-07, declared 2026-07-31 (undeclared for three weeks — §10.3: an endpoint the registry cannot see cannot be reached by registry-routed dispatch, which is what P6 call_system depends on).',{
    grammar:['ollama tools','ollama tool loop','ot'],tags:['dispatch','agentic'],
    hooks:{
      in:[{id:'ollama.jobs.tools.receive',intent:['build','ask','diagnose','tool'],contract:'nexus-interaction-contract-v1::ollama',tags:['dispatch','agentic']}],
      out:[{id:'ollama.jobs.tools.complete',wires_to:['cortex.raid.feedback','copilot.receive_result'],tags:['result']}]
    }
  }),
  _c('jobs.list','GET','/api/jobs','List recent jobs',{grammar:['ollama jobs','oj']}),
  _c('jobs.get','GET','/api/jobs/:id','Get single job by id'),
  _c('jobs.cancel','DELETE','/api/jobs/:id','Cancel a queued job'),
  _c('queue.status','GET','/api/queue','Queue depth and running count',{grammar:['ollama queue','oq']}),
  _c('models.list','GET','/api/models','Available local models',{grammar:['ollama models','om']}),
  _c('health','GET','/health','Ollama bridge health',{grammar:['ollama health']}),
];
module.exports={
  systemId:NS,version:V,port:3749,
  label:'OLLAMA',purpose:'Sovereign local model bridge. Isolated from Guardian.',
  components,
  events:{
    emits:['ollama.booted','ollama.job.queued','ollama.job.started','ollama.job.complete','ollama.job.failed','ollama.health.ok','ollama.health.degraded'],
    handles:['raid.dispatch.ollama','orchestrator.shutdown'],
  },
};
