'use strict';
const NS='eravos',V='3.0.0';
function _c(id,method,path,desc,opts={}){
  return{id:`${NS}.${id}`,namespace:NS,name:id,version:V,
    grammar:opts.grammar||['eravos '+id.replace(/\./g,' ')],
    route:{method,path},description:desc,
    params:opts.params||[],tags:[NS,...(opts.tags||[])],
    permissions:opts.permissions||['system'],hooks:opts.hooks||{}};
}
const components=[
  _c('canvas','GET','/','Main ERAVOS canvas — organisms, wires, transport',{grammar:['eravos','canvas','open canvas']}),
  _c('organism.spawn','POST','/api/organisms','Spawn an organism by id onto the canvas',{
    grammar:['eravos spawn','spawn organism'],
    hooks:{
      in:[{id:'eravos.organism.spawn.receive',intent:['compose','visualize','spawn'],contract:'nexus-interaction-contract-v1::eravos',tags:['spawn']}],
      out:[{id:'eravos.organism.spawn.complete',wires_to:['cortex.raid.feedback'],tags:['spawned']}]
    }
  }),
  _c('organism.list','GET','/api/organisms','List all mounted organisms',{grammar:['eravos organisms']}),
  _c('organism.remove','DELETE','/api/organisms/:uuid','Remove an organism'),
  _c('wire.connect','POST','/api/wires','Connect two organism hooks',{grammar:['eravos wire']}),
  _c('wire.list','GET','/api/wires','List all wires'),
  _c('catalog.list','GET','/api/catalog','Available organisms from registry',{grammar:['eravos catalog']}),
  _c('pack.install','POST','/api/pack/install','Install a .zip organism pack',{grammar:['eravos install']}),
  _c('transport.play','POST','/api/transport/play','Start playback',{grammar:['eravos play']}),
  _c('transport.stop','POST','/api/transport/stop','Stop playback',{grammar:['eravos stop']}),
  _c('health','GET','/health','ERAVOS health'),
  _c('contract','GET','/contract','ERAVOS interaction contract'),
];
module.exports={
  systemId:NS,version:V,port:3751,
  label:'ERAVOS',purpose:'Sovereign canvas. Organisms, wires, audio, spatial.',
  components,
  events:{
    emits:['eravos.booted','eravos.organism.spawned','eravos.organism.removed','eravos.wire.connected','eravos.wire.disconnected','eravos.pack.queued','eravos.transport.play','eravos.transport.stop'],
    handles:['guardian.organism-queue.push','raid.dispatch.eravos','orchestrator.shutdown'],
  },
};
