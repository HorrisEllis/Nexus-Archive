'use strict';
/**
 * lib/contract-queue.js
 * comp_id: nexus.lib.contract-queue
 * uuid: nexus-contract-queue-v1-0000-2026-0627-jamesbrooks-001
 */
const fs=require('fs'),path=require('path'),crypto=require('crypto'),http=require('http');
const ROOT=path.join(__dirname,'..'),CX_URL=process.env.CORTEX_URL||'http://127.0.0.1:3748';
const STUCK_MS=parseInt(process.env.CONTRACT_STUCK_MS||'45000'),MAX_RETRIES=3;
const STATUS=Object.freeze({QUEUED:'queued',DISPATCHED:'dispatched',RUNNING:'running',COMPLETE:'complete',FAILED:'failed',STUCK:'stuck'});
const PRIORITY=Object.freeze({CRITICAL:'critical',HIGH:'high',NORMAL:'normal',LOW:'low'});
function _dir(sys,io){const d=path.join(ROOT,sys,io);fs.mkdirSync(d,{recursive:true});return d;}
function _p(dir,uuid){return path.join(dir,`${uuid}.json`);}
function _w(fp,c){fs.writeFileSync(fp,JSON.stringify(c,null,2),'utf8');}
function _r(fp){try{return JSON.parse(fs.readFileSync(fp,'utf8'));}catch(_){return null;}}
function _u(fp,patch){const c=_r(fp);if(!c)return null;const u={...c,...patch,updatedAt:Date.now()};_w(fp,u);return u;}

function create(opts={}){
  if(!opts.fromSystem||!opts.toSystem||!opts.intent) throw new Error('fromSystem, toSystem, intent required');
  const c={
    uuid:crypto.randomUUID(),requestId:opts.requestId||crypto.randomUUID(),
    contractId:opts.contractId||'nexus-interaction-contract-v1',
    fromSystem:opts.fromSystem,fromComponent:opts.fromComponent||opts.fromSystem,
    fromHook:opts.fromHook||`${opts.fromComponent||opts.fromSystem}.out`,
    toSystem:opts.toSystem,toComponent:opts.toComponent||opts.toSystem,
    toHook:opts.toHook||`${opts.toComponent||opts.toSystem}.in`,
    intent:opts.intent,agent:opts.agent||null,tags:opts.tags||[],
    payload:opts.payload||{},status:STATUS.QUEUED,priority:opts.priority||PRIORITY.NORMAL,
    createdAt:Date.now(),dispatchedAt:null,completedAt:null,
    ttlMs:opts.ttlMs||STUCK_MS,retryCount:0,result:null,error:null,
  };
  _w(_p(_dir(opts.fromSystem,'output'),c.uuid),c); // §LAW II
  return c;
}

function dispatch(c){
  const d={...c,status:STATUS.DISPATCHED,dispatchedAt:Date.now()};
  _w(_p(_dir(c.toSystem,'input'),c.uuid),d);
  _w(_p(_dir(c.fromSystem,'output'),c.uuid),d);
  return d;
}

function accept(sys,uuid){return _u(_p(_dir(sys,'input'),uuid),{status:STATUS.RUNNING,acceptedAt:Date.now()});}
function complete(sys,uuid,result){return _u(_p(_dir(sys,'input'),uuid),{status:STATUS.COMPLETE,result,completedAt:Date.now()});}
function fail(sys,uuid,error){
  const c=_r(_p(_dir(sys,'input'),uuid));if(!c)return null;
  const retryCount=(c.retryCount||0)+1;
  return _u(_p(_dir(sys,'input'),uuid),{status:retryCount>=MAX_RETRIES?STATUS.FAILED:STATUS.QUEUED,error:String(error),retryCount,failedAt:Date.now()});
}

function pending(sys){
  try{
    const dir=_dir(sys,'input');
    return fs.readdirSync(dir).filter(f=>f.endsWith('.json'))
      .map(f=>_r(path.join(dir,f))).filter(c=>c&&(c.status===STATUS.QUEUED||c.status===STATUS.DISPATCHED))
      .sort((a,b)=>{const p={critical:0,high:1,normal:2,low:3};return(p[a.priority]||2)-(p[b.priority]||2)||a.createdAt-b.createdAt;});
  }catch(_){return[];}
}

function findStuck(sysIds){
  const stuck=[],now=Date.now();
  for(const sys of sysIds){
    try{
      const dir=_dir(sys,'input');
      fs.readdirSync(dir).filter(f=>f.endsWith('.json')).forEach(f=>{
        const c=_r(path.join(dir,f));
        if(!c||!['queued','dispatched','running'].includes(c.status))return;
        const age=now-(c.dispatchedAt||c.createdAt);
        if(age>(c.ttlMs||STUCK_MS))stuck.push({...c,stuckMs:age,systemId:sys});
      });
    }catch(_){}
  }
  return stuck;
}

function markStuck(sys,uuid){return _u(_p(_dir(sys,'input'),uuid),{status:STATUS.STUCK,stuckAt:Date.now()});}

async function reportStuck(contract){
  const body=JSON.stringify({table:'gaps',row:{uuid:crypto.randomUUID(),type:'contract.stuck',severity:'high',status:'open',
    body:`Contract ${contract.uuid} stuck ${Math.round(contract.stuckMs/1000)}s in ${contract.systemId}: ${contract.intent} ${contract.fromSystem}→${contract.toSystem}`,
    source:'contract-queue',contractId:contract.uuid,ts:Date.now()}});
  return new Promise(res=>{
    const u=new URL(`${CX_URL}/api/memory/insert`);
    const req=http.request({hostname:u.hostname,port:u.port||3748,path:u.pathname,method:'POST',
      headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)},timeout:3000},
      r=>{r.resume();res(true);}); req.on('error',()=>res(false)); req.write(body);req.end();
  });
}

module.exports={create,dispatch,accept,complete,fail,pending,findStuck,markStuck,reportStuck,STATUS,PRIORITY};
