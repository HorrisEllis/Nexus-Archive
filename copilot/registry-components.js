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
  _c('health','GET','/health','Co-pilot health'),
  _c('contract','GET','/contract','Co-pilot interaction contract'),

  // ── PERSON MODEL — the co-pilot's model of the USER ─────────────────────
  // §2026-08-17. Distinct from copilot/lib/self-model.js (the co-pilot's model
  // of ITSELF). Registered so the grammar engine can resolve "what do you know
  // about me" to a real component instead of falling through to the LLM.
  _c('person-model.portrait','GET','/api/person-model/portrait',
    'Lens reading of the user model — always carries provenance and lens coverage (§LN-7)',{
    grammar:['what do you know about me','person model','my model','portrait','who am i to you'],
    tags:['person-model','identity'],
    hooks:{
      in:[{id:'copilot.person-model.read',intent:['ask'],tags:['read-only']}],
      out:[{id:'copilot.person-model.reply',wires_to:['ui.copilot.receive'],tags:['response']}]
    }
  }),
  _c('person-model.review','GET','/api/person-model/review',
    'Observations the co-pilot has proposed about the user — pending, never claims (§IP-5)',{
    grammar:['review queue','what have you noticed','pending observations'],tags:['person-model','review']
  }),
  _c('person-model.accept','POST','/api/person-model/accept',
    'USER-ONLY. Promotes an observation to a stated claim. No agent path exists (§IP-5)',{
    grammar:['accept observation'],tags:['person-model','review'],permissions:['user'],
    hooks:{in:[{id:'copilot.person-model.accept',intent:['action'],tags:['user-only']}],
           out:[{id:'copilot.person-model.node.stated',wires_to:['cortex.memory.insert'],tags:['identity']}]}
  }),
  _c('person-model.reject','POST','/api/person-model/reject',
    'Rejects a proposed observation. A reason is required (§IP-6)',{
    grammar:['reject observation'],tags:['person-model','review'],permissions:['user']
  }),
  _c('person-model.state','POST','/api/person-model/state',
    'The user states something about themselves — the ONLY route into trigger/sensitive/boundary',{
    grammar:['remember about me','i am','my value','my goal'],tags:['person-model','identity'],permissions:['user'],
    hooks:{in:[{id:'copilot.person-model.state',intent:['note','action'],tags:['user-only','stated-only-gate']}],
           out:[{id:'copilot.person-model.node.stated',wires_to:['cortex.memory.insert'],tags:['identity']}]}
  }),
  _c('person-model.connect','POST','/api/person-model/connect',
    'Typed edge between two model nodes — supports/tensions/causes/co_occurs',{tags:['person-model','lattice']}),
  _c('person-model.meaning','GET','/api/person-model/meaning',
    'Meaning-web lens — a projection over the lattice, not a nested graph',{
    grammar:['what does mean to me','meaning of'],tags:['person-model','lens']
  }),
  _c('person-model.chain','GET','/api/person-model/chain',
    'Session hash-chain integrity — reports breaks, attributed to the session',{
    grammar:['model history','session chain'],tags:['person-model','integrity']
  }),
  _c('person-model.export','GET','/api/person-model/export',
    'Everything held about the user, in one object',{
    grammar:['export my model','what do you have on me'],tags:['person-model'],permissions:['user']
  }),
  _c('person-model.forget','POST','/api/person-model/forget',
    'Archives a node with a required reason (§0.3 — never a silent delete)',{
    grammar:['forget that'],tags:['person-model'],permissions:['user']
  }),
  _c('person-model.purge','POST','/api/person-model/purge',
    'HARD DELETE of the whole model. Requires an explicit confirmation string',{
    tags:['person-model','destructive'],permissions:['user']
  }),
  _c('person-model.health','GET','/api/person-model/health','Person-model stats + chain state',{tags:['person-model']}),

  // ── LEDGER WIRE ─────────────────────────────────────────────────────────
  _c('ledger.stream','GET','/ledger/stream',
    'Canonical component-ledger rows as SSE — the cross-process wire autopilot consumes',{
    grammar:['copilot ledger stream'],tags:['ledger','sse','observability'],
    hooks:{out:[{id:'copilot.ledger.stream',wires_to:['autopilot.ledger.consume','cortex.intelligence.event'],
                 tags:['cross-process','canonical-schema']}]}
  }),
];
module.exports={
  systemId:NS,version:V,port:3750,
  label:'COPILOT',purpose:'Sovereign co-pilot. Continuous stream. Dual cognition.',
  components,
  events:{
    emits:['copilot.booted','copilot.prompt.received','copilot.context.assembled','copilot.answered','copilot.stream.event','copilot.build.started','copilot.build.complete',
      // §2026-08-17 — every broadcast() is now ALSO a component-ledger row, so
      // these reach event_log, error_log and the pattern engine rather than
      // dying at the edge of the SSE client Set.
      'copilot.person-model.node.stated','copilot.person-model.observation.noted','copilot.person-model.session.ended'],
    handles:['ollama.job.complete','cortex.pattern.crystallized','orchestrator.shutdown'],
  },
};
