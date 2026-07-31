'use strict';
const NS='copilot',V='2.0.0';
function _c(id,method,path,desc,opts={}){
  return{id:`${NS}.${id}`,namespace:NS,name:id,version:V,
    grammar:opts.grammar||[NS+' '+id.replace(/\./g,' ')],
    route:{method,path},description:desc,
    params:opts.params||[],tags:[NS,...(opts.tags||[])],
    permissions:opts.permissions||['system'],hooks:opts.hooks||{}};
}
const components=[
  _c('prompt','POST','/api/prompt','Primary entry — all co-pilot interactions',{
    grammar:['ask','copilot','cp'],
    hooks:{
      in:[{id:'copilot.prompt.receive',intent:['ask','build','diagnose','navigate','note','tool','action'],contract:'nexus-interaction-contract-v1::copilot',tags:['entry-point']}],
      out:[{id:'copilot.prompt.to-ollama',wires_to:['ollama.jobs.dispatch.receive'],tags:['model']},
           {id:'copilot.prompt.reply',wires_to:['ui.copilot.receive'],tags:['response']}]
    }
  }),
  _c('stream.query','GET','/api/stream','Query the continuous event stream',{grammar:['stream','cs']}),
  _c('stream.ingest','POST','/api/stream/ingest','Push events into co-pilot stream'),
  _c('sessions','GET','/api/sessions','Active co-pilot sessions'),
  _c('axioms.list','GET','/api/axioms','List all axioms',{grammar:['axioms','list axioms']}),
  _c('axioms.add','POST','/api/axioms/add','Add a runtime axiom',{grammar:['add axiom']}),
  _c('axioms.remove','POST','/api/axioms/remove','Remove a runtime axiom',{grammar:['remove axiom']}),
  _c('lifeline.health','GET','/api/lifeline/health','Lifeline provider health',{grammar:['lifeline health']}),
  _c('build','POST','/api/build','Build a new module from description',{grammar:['build','co-pilot build']}),
  _c('diagnose','POST','/api/diagnose','Start recursive fractal diagnosis',{grammar:['diagnose','recursive diagnose']}),
  _c('diagnose.list','GET','/api/diagnose/list','List past diagnosis sessions'),
  _c('prompt.fulfill','POST','/api/prompt/fulfill','Adaptive iteration — RAID-routed, fault-classified, reflection-scored (§15.1-15.3)',{
    grammar:['fulfill','cp fulfill'],
    hooks:{
      in:[{id:'copilot.prompt.fulfill.receive',intent:['ask','build','diagnose'],contract:'nexus-interaction-contract-v1::copilot',tags:['entry-point','adaptive']}],
      out:[{id:'copilot.fulfillment.attempt',wires_to:['cortex.intelligence.event'],tags:['learning']}]
    }
  }),
  _c('prompt.stream','POST','/api/prompt/stream','Streaming SSE prompt — token-by-token, no timeout (P112)',{
    grammar:['stream ask','cp stream'],
    hooks:{
      in:[{id:'copilot.prompt.stream.receive',intent:['ask'],tags:['streaming','sse']}],
      out:[{id:'copilot.prompt.stream.chunk',wires_to:['ui.copilot.stream'],tags:['streaming']}],
    }
  }),
  _c('prompt.tools','POST','/api/prompt/tools','Agentic tool-loop entry — runs the sovereign lib/agent-tools runToolLoop with copilot\'s own model dispatch injected as callModel (§PHASEMAP P1, copilot/tool-runtime.js). Returns {text, iterations, toolCallLog}. LIVE as of 2026-07-31 — tools fire for real: the loop calls the bridge\'s POST /api/chat/tools (one model turn, tools declared, tool_calls back) via _chatWithToolsOnce. It previously posted to /api/jobs, which resolves to Ollama /api/generate and has no tools param, so no tool could ever fire and the loop answered from a guess at iteration 1; that path is deleted, not deprecated. Proven by a real HTTP round trip in tests/modules/test-copilot-tool-runtime.js, not a fabricated wire.',{
    grammar:['tools','cp tools','tool loop','copilot tools'],tags:['entry-point','agentic'],
    hooks:{
      in:[{id:'copilot.prompt.tools.receive',intent:['ask','build','diagnose','tool','action'],contract:'nexus-interaction-contract-v1::copilot',tags:['entry-point','agentic']}],
      out:[{id:'copilot.prompt.tools.reply',wires_to:['ui.copilot.receive'],tags:['response']}]
    }
  }),
  _c('health','GET','/health','Co-pilot health'),
  _c('contract','GET','/contract','Co-pilot interaction contract'),
];
module.exports={
  systemId:NS,version:V,port:3750,
  label:'COPILOT',purpose:'Sovereign co-pilot. Continuous stream. Dual cognition.',
  components,
  events:{
    emits:['copilot.booted','copilot.prompt.received','copilot.context.assembled','copilot.answered','copilot.stream.event','copilot.build.started','copilot.build.complete'],
    handles:['ollama.job.complete','cortex.pattern.crystallized','orchestrator.shutdown'],
  },
};
