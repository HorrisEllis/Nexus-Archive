#!/usr/bin/env node
'use strict';
// ════════════════════════════════════════════════════════════════════════════
// NEXUS CLI — nexus-cli.js
// Emitted from guardian-cli.eg + nexus-core.eg
// LAW V: CLI first. UI is a skin. Every feature has a CLI command.
// ════════════════════════════════════════════════════════════════════════════
const http = require('http');
const readline = require('readline');
const VERSION = '1.0.0';

const G_API = 'http://127.0.0.1:7820';
const M_API = 'http://127.0.0.1:7823';
const I_API = 'http://127.0.0.1:4800';

// ANSI
const C = { reset:'\x1b[0m', bold:'\x1b[1m', dim:'\x1b[2m',
  signal:'\x1b[92m', noise:'\x1b[91m', warn:'\x1b[93m',
  blue:'\x1b[96m', purple:'\x1b[95m', muted:'\x1b[90m' };
const s = t => C.signal+t+C.reset, n = t => C.noise+t+C.reset,
      w = t => C.warn+t+C.reset,   b = t => C.blue+t+C.reset,
      d = t => C.muted+t+C.reset,  bold = t => C.bold+t+C.reset;
const bar  = (v,w=20) => '[' + '\u2588'.repeat(Math.round(v*w)) + '\u2591'.repeat(w-Math.round(v*w)) + ']';
const ts   = ms => new Date(ms).toLocaleTimeString('en',{hour12:false});

// HTTP
function req(method, base, p, body, timeout=8000) {
  return new Promise((resolve, reject) => {
    const url = new URL(base + p);
    const opts = { hostname:url.hostname, port:url.port, path:url.pathname+url.search, method };
    if (body) opts.headers = {'Content-Type':'application/json','Content-Length':Buffer.byteLength(JSON.stringify(body))};
    const r = http.request(opts, res => {
      let raw=''; res.on('data',c=>raw+=c); res.on('end',()=>{
        try{resolve({status:res.statusCode,data:JSON.parse(raw)});}catch(e){resolve({status:res.statusCode,data:raw});}
      });
    });
    r.on('error',reject);
    r.setTimeout(timeout,()=>{r.destroy();reject(new Error('timeout '+base+p));});
    if(body)r.write(JSON.stringify(body));
    r.end();
  });
}
const GET  = (base,p)       => req('GET',base,p);
const POST = (base,p,body)  => req('POST',base,p,body);
const PUT  = (base,p,body)  => req('PUT',base,p,body);

// Table
function tbl(rows, cols) {
  if(!rows?.length){console.log(d('  (empty)'));return;}
  const keys = cols||Object.keys(rows[0]);
  const ws = keys.map(k=>Math.max(k.length,...rows.map(r=>String(r[k]||'').length)));
  console.log('  '+keys.map((k,i)=>b(k.padEnd(ws[i]))).join(' | '));
  console.log('  '+keys.map((k,i)=>'-'.repeat(ws[i])).join('-+-'));
  for(const row of rows.slice(0,50)) {
    console.log('  '+keys.map((k,i)=>{
      const v=String(row[k]||'').slice(0,ws[i]).padEnd(ws[i]);
      if(k==='status'||k==='state') return row[k]==='complete'||row[k]==='verified'?s(v):row[k]==='failed'?n(v):w(v);
      return v;
    }).join(' | '));
  }
  if(rows.length>50)console.log(d('  ... '+(rows.length-50)+' more'));
}

// Page
function pg(rec,title){
  console.log('\n'+bold('\u29e1 '+(title||'Record')));
  console.log('-'.repeat(60));
  for(const[k,v] of Object.entries(rec)){
    const val = typeof v==='object'?JSON.stringify(v,null,2):String(v||'-');
    console.log('  '+b(k.padEnd(18))+' '+(val.length>120?val.slice(0,120)+'...':val));
  }
  console.log('-'.repeat(60)+'\n');
}

// SSE
function sse(base,p,filter){
  const url = new URL(base+p);
  const r = http.request({hostname:url.hostname,port:url.port,path:url.pathname},res=>{
    res.on('data',chunk=>{
      for(const line of chunk.toString().split('\n')){
        if(!line.startsWith('data:'))continue;
        try{
          const ev=JSON.parse(line.slice(5));
          if(filter&&!ev.type?.includes(filter))continue;
          const type=ev.type||'event';
          const col=type.includes('error')||type.includes('fail')?n:type.includes('gap')?w:s;
          console.log('  '+d(ts(ev.ts||Date.now()))+'  '+col(type.padEnd(30))+'  '+d(JSON.stringify(ev.data||{}).slice(0,80)));
        }catch(e){}
      }
    });
  });
  r.on('error',e=>console.log(n('  SSE: '+e.message)));
  r.end();
}

// Commands
const CMD = {
  async status() {
    const[g,m]=await Promise.allSettled([GET(G_API,'/health'),GET(M_API,'/status')]);
    console.log('\n'+bold('\u29e1 NEXUS STATUS'));
    console.log('-'.repeat(40));
    console.log('  Guardian API  '+(g.status==='fulfilled'?s('● online'):n('✗ offline'))+'  '+G_API);
    console.log('  Memory/Core   '+(m.status==='fulfilled'?s('● online'):n('✗ offline'))+'  '+M_API);
    if(m.status==='fulfilled'){const dd=m.value.data;for(const[k,v] of Object.entries(dd?.counts||{}))console.log('  '+b(k.padEnd(16))+' '+v+' rows');}
    console.log('-'.repeat(40)+'\n');
  },
  async jobs(a){const r=await GET(G_API,'/api/jobs?status='+(a[0]||'all'));console.log('\n'+bold('Jobs'));tbl(r.data?.jobs||r.data||[],['id','provider','status','command','ts']);},
  async artifacts(a){
    if(a[0]==='show'&&a[1]){const r=await GET(G_API,'/api/artifacts/'+a[1]);pg(r.data?.artifact||r.data,'Artifact');}
    else if(a[0]==='search'&&a[1]){const r=await GET(G_API,'/api/artifacts?search='+encodeURIComponent(a[1]));tbl(r.data?.artifacts||[],['name','lang','ts']);}
    else{const r=await GET(G_API,'/api/artifacts');console.log('\n'+bold('Artifacts'));tbl(r.data?.artifacts||[],['name','lang','ts','direction']);}
  },
  async memory(a){
    if(a[0]==='search'&&a[1]){const r=await GET(M_API,'/memory?search='+encodeURIComponent(a[1]));tbl(r.data?.rows||[],['content','tier','source','ts']);}
    else if(a[0]==='tail'){const r=await GET(M_API,'/memory?limit='+(a[1]||20));tbl(r.data?.rows||[],['content','tier','source','ts']);}
    else if(a[0]==='forget'&&a[1]){const r=await PUT(M_API,'/memory/'+a[1],{tier:'forgotten'});console.log(r.data?.ok?s('  ✓ forgotten'):n('  ✗ failed'));}
    else console.log(d('  memory search <term> | memory tail [n] | memory forget <uuid>'));
  },
  async gaps(a){
    if(a[0]==='show'&&a[1]){const r=await GET(G_API,'/api/gaps/'+a[1]);pg(r.data?.gap||r.data,'Gap');}
    else if(a[0]==='open'){const r=await POST(G_API,'/api/gaps',{type:a[1]||'unresolved',description:a[2]||'',severity:a[3]||'medium'});console.log(r.data?.ok?s('  ✓ opened'):n('  ✗ failed'));}
    else if(a[0]==='resolve'&&a[1]){const r=await POST(G_API,'/api/gaps/'+a[1]+'/resolve',{resolution:a[2]||''});console.log(r.data?.ok?s('  ✓ resolved'):n('  ✗ failed'));}
    else{const r=await GET(G_API,'/api/gaps?status='+(a[0]||'open'));console.log('\n'+bold('Gaps'));tbl(r.data?.gaps||r.data||[],['type','severity','description','status','ts']);}
  },
  async ledger(a){const r=await GET(G_API,'/api/ledger?n='+(a[0]||30));const rows=r.data?.entries||r.data||[];console.log('\n'+bold('Ledger'));for(const row of rows){const cat=row.category||'EVENT';const col={UPGRADE:s,GAP:w,ERROR:n,INPUT:b,OUTPUT:x=>C.purple+x+C.reset}[cat]||d;console.log('  '+d(ts(row.ts))+' '+col((cat+'  ').slice(0,8))+' '+(row.msg||'').slice(0,80));}},
  async sessions(){const r=await GET(G_API,'/api/sessions');console.log('\n'+bold('Sessions'));tbl(r.data?.sessions||r.data||[],['name','provider','chat_id','ts']);},
  async watch(a){console.log(d('  live tail (ctrl+c to stop)'));sse(G_API,'/sse',a[0]);},
  async settings(a){
    if(a[0]==='set'&&a[1]){const r=await PUT(G_API,'/api/settings/'+a[1],{value:a[2]||''});console.log(r.data?.ok?s('  ✓ set'):n('  ✗ failed'));}
    else if(a[0]==='reset'){const r=await POST(G_API,'/api/settings/reset',{});console.log(r.data?.ok?s('  ✓ reset'):n('  ✗ failed'));}
    else{const r=await GET(G_API,'/api/settings');console.log('\n'+bold('Settings'));const rows=r.data?.settings||r.data||[];for(const row of rows)console.log('  '+b((row.key||'').padEnd(32))+' '+row.value);}
  },
  async idea(a){
    if(a[0]==='add'&&a[1]){const r=await POST(I_API,'/api/ideas',{text:a.slice(1).join(' ')});console.log(r.data?.ok?s('  ✓ '+r.data.uuid?.slice(0,8)):n('  ✗ failed'));}
    else if(a[0]==='show'&&a[1]){const r=await GET(I_API,'/api/ideas/'+a[1]);pg(r.data?.idea||r.data,'Idea');}
    else{const r=await GET(I_API,'/api/ideas');console.log('\n'+bold('Ideas'));tbl(r.data?.ideas||r.data||[],['text','phase','tension','compartment','ts']);}
  },
  async help(){console.log(bold('\n\u29e1 NEXUS CLI v'+VERSION+'\n')
    +[['status','system health'],['jobs [status]','list jobs'],['artifacts','list artifacts'],
      ['memory search <t>','search memory'],['memory tail [n]','recent memory'],
      ['gaps [status]','list gaps'],['gaps open <type> <desc> <sev>','open gap'],
      ['gaps resolve <uuid> <resolution>','resolve gap'],['ledger [n]','ledger tail'],
      ['sessions','list sessions'],['settings','all settings'],
      ['idea [add <text>|show <uuid>]','ideas'],['watch [filter]','live event stream'],
      ['help','this']].map(([c,d2])=>'  '+b(c.padEnd(36))+d(d2)).join('\n')+'\n');
  },
};

// Dispatch
async function dispatch(argv) {
  const[cmd,...args]=argv;
  if(!cmd||cmd==='help'){await CMD.help();return;}
  const fn=CMD[cmd];
  if(!fn){console.log(n('  unknown: '+cmd));process.exit(1);}
  try{await fn(args);}catch(e){console.log(n('  '+cmd+': '+e.message));process.exit(1);}
}

// REPL
function repl(){
  console.log(bold('\n\u29e1 NEXUS CLI ')+d('v'+VERSION));
  console.log(d('  type help | ctrl+c to exit\n'));
  const rl=readline.createInterface({input:process.stdin,output:process.stdout,prompt:s('nexus')+' \u203a '});
  rl.prompt();
  rl.on('line',async line=>{const parts=line.trim().split(/\s+/).filter(Boolean);if(parts.length)await dispatch(parts);rl.prompt();});
  rl.on('close',()=>{console.log(d('\n  bye\n'));process.exit(0);});
}

const args=process.argv.slice(2);
if(args.length===0)repl();else dispatch(args);
