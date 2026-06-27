'use strict';
/**
 * bridge/registry-components.js
 * comp_id: nexus.bridge.registry
 * uuid: nexus-bridge-registry-v1-0000-2026-0627-jamesbrooks-001
 */
const V='3.0.0';const NS='bridge';
function _c(id,method,path,desc,opts={}){
  return{id:`${NS}.${id}`,namespace:NS,name:id,version:V,
    grammar:opts.grammar||[id.replace(/\./g,' ')],
    route:{method,path},description:desc,
    params:opts.params||[],tags:[NS,...(opts.tags||[])],
    permissions:opts.permissions||['system'],hooks:opts.hooks||{}};
}
module.exports=[
  _c('health',           'GET',  '/health',             'Bridge health + relay stats'),
  _c('contract',         'GET',  '/api/contract',       'Bridge interaction contract'),
  _c('events',           'GET',  '/events',             'SSE — all bridge events', {tags:['stream']}),
  _c('relay.request',    'POST', '/api/relay',          'Route request through P2P trust relay', {
    tags:['relay'],
    hooks:{
      in:[{id:'bridge.relay.receive',intent:['relay','proxy','forward'],contract:'nexus-interaction-contract-v1::bridge',tags:['relay']}],
      out:[{id:'bridge.relay.complete',wires_to:['cortex.cfr.graph'],tags:['relay']}],
    }}),
  _c('nodes.list',       'GET',  '/api/nodes',          'Connected relay nodes'),
  _c('node.register',    'POST', '/api/nodes',          'Register a relay node'),
  _c('node.trust',       'POST', '/api/nodes/:id/trust','Set trust score for a node', {tags:['trust']}),
  _c('requests.list',    'GET',  '/api/requests',       'Request log'),
  _c('circuit.status',   'GET',  '/api/circuit',        'Circuit breaker state per node'),
  _c('circuit.reset',    'POST', '/api/circuit/:id/reset','Reset circuit breaker for node'),
  _c('identity.verify',  'POST', '/api/identity/verify','Verify system identity token', {tags:['identity']}),
];
