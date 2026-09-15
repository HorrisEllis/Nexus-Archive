---
chunk_uuid: 0325a14a-ac03-4530-800b-d3f369189e8c
spec_uuid: 47e02ad5-207d-47a0-9d30-835d85b3510b
section: nexus-guardian-ui-agents-mistral-index-html
title: nexus/guardian/ui/agents/mistral/index.html
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:47e02ad5:nexus-guardian-ui-agents-mistral-index-html
contract_id: spec-contract:47e02ad5:nexus-guardian-ui-agents-mistral-index-html:0325a14a
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-15T20:07:15.939Z
---

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Mistral Console — NEXUS</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
:root{
  --void:#06050a;--surface:#0e0c15;--panel2:#1a1208;
  --border:#1e1a10;--border2:#2e2518;
  --text:#f0ead5;--text2:#a09070;--text3:#504030;
  --ac:#ff7c38;--ac-dim:rgba(255,124,56,.1);--ac-glow:rgba(255,124,56,.4);
  --green:#00ff88;--red:#ff3355;--red-dim:rgba(255,51,85,.1);
  --amber:#ffaa00;--amber-dim:rgba(255,170,0,.1);
  --mono:'Space Mono',monospace;--ui:'Space Grotesk',sans-serif;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;background:var(--void);color:var(--text);font-family:var(--ui);overflow:hidden;font-size:13px}
::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:var(--border2);border-radius:3px}
#shell{display:grid;grid-template-rows:52px 1fr;height:100vh}
#topbar{display:flex;align-items:center;gap:14px;padding:0 20px;background:linear-gradient(180deg,var(--panel2),var(--void));border-bottom:1px solid var(--border)}
.glyph{font-size:22px;color:var(--ac);text-shadow:0 0 16px var(--ac-glow)}
.title{font-family:var(--mono);font-size:12px;font-weight:700;letter-spacing:.16em}.title b{color:var(--ac)}
#model-badge{font-family:var(--mono);font-size:10px;padding:4px 12px;border-radius:20px;border:1px solid var(--border2);color:var(--text3);margin-left:8px}
#status-badge{font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:.1em;padding:4px 12px;border-radius:20px;border:1px solid var(--border2);color:var(--text3);display:flex;align-items:center;gap:6px;margin-left:auto;transition:all .3s}
#status-badge .dot{width:6px;height:6px;border-radius:50%;background:var(--text3);flex-shrink:0}
#status-badge.live{border-color:var(--ac-glow);color:var(--ac);background:var(--ac-dim)}
#status-badge.live .dot{background:var(--ac);animation:pulse 2s ease-in-out infinite}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 var(--ac-glow)}50%{box-shadow:0 0 0 4px transparent}}
#main{display:grid;grid-template-columns:200px 1fr 260px;height:100%;overflow:hidden}
.zone{overflow-y:auto;padding:16px}.zone+.zone{border-left:1px solid var(--border)}
.zone-label{font-family:var(--mono);font-size:9px;font-weight:700;letter-spacing:.18em;color:var(--text3);margin-bottom:12px;display:flex;align-items:center;gap:8px;text-transform:uppercase}
.zone-label::after{content:'';flex:1;height:1px;background:var(--border)}
.sys-row{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.03);font-size:11px}
.sys-key{color:var(--text3);font-size:10px}.sys-val{font-family:var(--mono);font-size:10px;color:var(--text2)}
.sys-val.ok{color:var(--green)}.sys-val.off{color:var(--red)}
.model-row{display:flex;align-items:center;justify-content:space-between;padding:7px 10px;border:1px solid var(--border);border-radius:5px;margin-bottom:5px;cursor:pointer;transition:all .15s}
.model-row:hover,.model-row.active{border-color:var(--ac-glow);background:var(--ac-dim)}
.model-name{font-family:var(--mono);font-size:10px;font-weight:600;color:var(--text)}
.model-info{font-size:9px;color:var(--text3)}
.tool-btn{display:flex;align-items:center;gap:8px;width:100%;font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.06em;background:transparent;border:1px solid var(--border2);color:var(--text3);padding:7px 10px;border-radius:5px;cursor:pointer;margin-bottom:5px;text-align:left;transition:all .15s}
.tool-btn:hover{border-color:var(--ac-glow);color:var(--ac);background:var(--ac-dim)}
.tool-out{font-family:var(--mono);font-size:9px;color:var(--text3);padding:6px 8px;background:var(--surface);border:1px solid var(--border);border-radius:4px;max-height:120px;overflow-y:auto;white-space:pre-wrap;line-height:1.4;margin-bottom:8px}
#messages{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:10px}
.msg{padding:10px 12px;border-radius:6px;font-size:12px;line-height:1.7}
.msg.user{background:var(--panel2);border:1px solid var(--border2)}
.msg.assistant{background:rgba(255,124,56,.04);border:1px solid rgba(255,124,56,.12);border-left:3px solid var(--ac)}
.msg-role{font-family:var(--mono);font-size:9px;font-weight:700;letter-spacing:.1em;color:var(--text3);margin-bottom:5px}
.msg.assistant .msg-role{color:var(--ac)}
.msg-text{color:var(--text);white-space:pre-wrap;word-break:break-word}
.scursor{display:inline-block;width:7px;height:13px;background:var(--ac);animation:blink .7s step-end infinite;vertical-align:text-bottom;margin-left:2px}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
#input-area{padding:12px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:8px}
.ctx-bar{display:flex;flex-wrap:wrap;gap:5px}
.ctx-chip{font-family:var(--mono);font-size:9px;padding:3px 9px;border-radius:12px;border:1px solid var(--border2);color:var(--text3);cursor:pointer;transition:all .15s;user-select:none}
.ctx-chip:hover{border-color:var(--ac-glow);color:var(--ac)}
.ctx-chip.on{border-color:var(--ac-glow);color:var(--ac);background:var(--ac-dim)}
.input-row{display:flex;gap:8px;align-items:flex-end}
textarea#prompt-in{flex:1;background:var(--surface);border:1px solid var(--border);border-radius:6px;color:var(--text);padding:10px 12px;font-family:var(--mono);font-size:11px;line-height:1.6;outline:none;resize:none;min-height:48px;max-height:120px;transition:border-color .2s}
textarea#prompt-in:focus{border-color:var(--ac-glow)}
textarea#prompt-in::placeholder{color:var(--text3)}
#send-btn{font-family:var(--mono);font-size:11px;font-weight:700;background:var(--ac-dim);border:1px solid var(--ac-glow);color:var(--ac);padding:10px 18px;border-radius:6px;cursor:pointer;transition:all .15s;white-space:nowrap;flex-shrink:0}
#send-btn:hover{background:rgba(255,124,56,.2)}
#send-btn:disabled{opacity:.4;cursor:default}
#stop-btn{font-family:var(--mono);font-size:11px;background:var(--red-dim);border:1px solid rgba(255,51,85,.4);color:var(--red);padding:10px 14px;border-radius:6px;cursor:pointer;display:none}
.gap-item{padding:6px 10px;border-left:2px solid var(--border2);margin-bottom:5px;font-size:10.5px}
.gap-item.high{border-left-color:var(--red)}.gap-item.medium{border-left-color:var(--amber)}
.gap-type{font-family:var(--mono);font-size:10px;font-weight:600;color:var(--text2)}
.gap-body{color:var(--text3);margin-top:2px;font-size:10px;line-height:1.4}
.gap-fix{font-family:var(--mono);font-size:9px;color:var(--text3);margin-top:4px;padding:3px 7px;border:1px solid var(--border2);border-radius:3px;cursor:pointer;display:inline-block;transition:all .15s}
.gap-fix:hover{border-color:var(--ac-glow);color:var(--ac)}
input.nx-in{width:100%;background:var(--surface);border:1px solid var(--border);border-radius:5px;color:var(--text);padding:7px 10px;font-family:var(--mono);font-size:10px;outline:none;margin-bottom:6px;transition:border-color .2s}
input.nx-in:focus{border-color:var(--ac-glow)}
#zone-chat{padding:0;display:flex;flex-direction:column}
</style>
</head>
<body>
<div id="shell">
  <div id="topbar">
    <span class="glyph">⬡</span>
    <span class="title">MISTRAL <b>CONSOLE</b></span>
    <span style="font-family:var(--mono);font-size:10px;color:var(--text3)">local · sovereign · no token cost · no tab needed</span>
    <div id="model-badge">loading…</div>
    <div id="status-badge"><span class="dot"></span><span id="status-txt">CHECKING</span></div>
  </div>
  <div id="main">
    <div class="zone">
      <div class="zone-label">Models</div>
      <div id="model-list"><div style="color:var(--text3);font-size:10px">Loading…</div></div>
      <div class="zone-label" style="margin-top:16px">System</div>
      <div class="sys-row"><span class="sys-key">Ollama</span><span class="sys-val" id="sv-ol">—</span></div>
      <div class="sys-row"><span class="sys-key">Guardian</span><span class="sys-val" id="sv-gd">—</span></div>
      <div class="sys-row"><span class="sys-key">Cortex</span><span class="sys-val" id="sv-cx">—</span></div>
      <div class="sys-row"><span class="sys-key">Open Gaps</span><span class="sys-val" id="sv-gaps">—</span></div>
      <div class="sys-row"><span class="sys-key">Active Jobs</span><span class="sys-val" id="sv-jobs">—</span></div>
      <div class="zone-label" style="margin-top:16px">Tools</div>
      <button class="tool-btn" onclick="ctxSystem()">⬡ Inject System State</button>
      <button class="tool-btn" onclick="ctxGaps()">△ Inject Open Gaps</button>
      <button class="tool-btn" onclick="ctxMemory()">◦ Inject Cortex Memory</button>
      <div class="tool-out" id="ctx-out" style="display:none"></div>
      <div class="zone-label" style="margin-top:12px">Repair</div>
      <input class="nx-in" id="repair-in" placeholder="problem to fix via RAID…">
      <button class="tool-btn" onclick="doRepair()">⚡ Dispatch Repair</button>
      <div class="tool-out" id="repair-out" style="display:none"></div>
    </div>
    <div class="zone" id="zone-chat">
      <div id="messages">
        <div id="welcome" style="color:var(--text3);font-size:11px;text-align:center;padding:30px;line-height:1.8">
          <div style="font-size:24px;margin-bottom:8px">⬡</div>
          Mistral 7B — local via Ollama<br>
          <span style="font-size:10px">Sovereign · No token limits · Full NEXUS context</span>
        </div>
      </div>
      <div id="input-area">
        <div class="ctx-bar">
          <div class="ctx-chip on" data-ctx="system">system</div>
          <div class="ctx-chip" data-ctx="gaps">gaps</div>
          <div class="ctx-chip" data-ctx="memory">memory</div>
          <div class="ctx-chip" data-ctx="jobs">jobs</div>
          <div class="ctx-chip" data-ctx="reflection">reflection</div>
        </div>
        <div class="input-row">
          <textarea id="prompt-in" placeholder="Ask Mistral about NEXUS… (Enter to send, Shift+Enter for newline)" rows="2"></textarea>
          <button id="send-btn" onclick="send()">SEND →</button>
          <button id="stop-btn" onclick="stop()">■ STOP</button>
        </div>
        <div style="font-family:var(--mono);font-size:9px;color:var(--text3);display:flex;gap:12px">
          <span id="st-model">—</span><span id="st-tok">0 tok</span><span id="st-time">—</span>
        </div>
      </div>
    </div>
    <div class="zone">
      <div class="zone-label">Open Gaps</div>
      <div id="gaps-list"><div style="color:var(--text3);font-size:10px">Loading…</div></div>
      <div class="zone-label" style="margin-top:14px">CLI</div>
      <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">
        <button onclick="cli('health')" class="tool-btn" style="padding:3px 8px;margin:0">health</button>
        <button onclick="cli('gaps')" class="tool-btn" style="padding:3px 8px;margin:0">gaps</button>
        <button onclick="cli('jobs')" class="tool-btn" style="padding:3px 8px;margin:0">jobs</button>
        <button onclick="cli('stats')" class="tool-btn" style="padding:3px 8px;margin:0">stats</button>
        <button onclick="cli('providers')" class="tool-btn" style="padding:3px 8px;margin:0">providers</button>
      </div>
      <input class="nx-in" id="cli-in" placeholder="custom command…">
      <button class="tool-btn" onclick="cli(document.getElementById('cli-in').value)">▶ Run</button>
      <div class="tool-out" id="cli-out" style="display:none"></div>
      <div class="zone-label" style="margin-top:14px">Active Jobs</div>
      <div id="jobs-list"><div style="color:var(--text3);font-size:10px">—</div></div>
    </div>
  </div>
</div>
<script>
const GD='http://localhost:7820',ORCH='http://localhost:9000',CX='http://localhost:3748',OL='http://localhost:11434';
let selModel='mistral:7b-instruct-q4_K_M',_abort=null,_streaming=false;
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
async function api(url,opts){try{const r=await fetch(url,{signal:AbortSignal.timeout(5000),...opts});return r.ok?r.json():null;}catch{return null;}}
async function post(url,body){return api(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});}

async function loadModels(){
  const r=await api(`${OL}/api/tags`);
  const models=r?.models||[];
  const el=document.getElementById('model-list');
  const badge=document.getElementById('model-badge');
  if(!models.length){el.innerHTML='<div style="color:var(--red);font-size:10px">Ollama offline — run: ollama serve</div>';badge.textContent='OFFLINE';return;}
  document.getElementById('status-badge').className='live';
  document.getElementById('status-txt').textContent=models.length+' MODEL'+(models.length===1?'':'S');
  document.getElementById('sv-ol').className='sys-val ok';
  document.getElementById('sv-ol').textContent='✓ '+models.length+' models';
  const pref=models.find(m=>m.name.includes('mistral'))||models.find(m=>m.name.includes('qwen'))||models[0];
  if(pref){selModel=pref.name;badge.textContent=pref.name;}
  el.innerHTML=models.map(m=>{
    const gb=((m.size||0)/1024/1024/1024).toFixed(1);
    return `<div class="model-row ${m.name===selModel?'active':''}" onclick="selMod('${esc(m.name)}',this)">
      <div><div class="model-name">${esc(m.name)}</div><div class="model-info">${gb}GB</div></div>
      ${m.name===selModel?'<span style="color:var(--ac);font-size:10px">▶</span>':''}
    </div>`;
  }).join('');
}

function selMod(name,el){selModel=name;document.getElementById('model-badge').textContent=name;document.querySelectorAll('.model-row').forEach(r=>r.classList.remove('active'));el.classList.add('active');}

async function refreshSys(){
  const [gaps,jobs]=await Promise.all([api(`${GD}/gaps?status=open&limit=50`),api(`${GD}/jobs?status=delivered&limit=10`)]);
  await Promise.all([
    api(`${GD}/health`).then(r=>{const e=document.getElementById('sv-gd');e.className='sys-val '+(r?.ok?'ok':'off');e.textContent=r?.ok?'✓ :7820':'✗ :7820';}),
    api(`${CX}/health`).then(r=>{const e=document.getElementById('sv-cx');e.className='sys-val '+(r?.ok?'ok':'off');e.textContent=r?.ok?'✓ :3748':'✗ :3748';})
  ]);
  const ga=gaps?.gaps||[];const el=document.getElementById('sv-gaps');
  el.textContent=ga.length;el.className='sys-val '+(ga.length>5?'off':ga.length>0?'':'ok');
  document.getElementById('sv-jobs').textContent=(jobs?.jobs||[]).length;
  renderGaps(ga);renderJobs(jobs?.jobs||[]);
}

function renderGaps(gaps){
  const el=document.getElementById('gaps-list');
  if(!gaps.length){el.innerHTML='<div style="color:var(--text3);font-size:10px">No open gaps ✓</div>';return;}
  el.innerHTML=gaps.slice(0,8).map(g=>`
    <div class="gap-item ${g.severity||'low'}">
      <div class="gap-type">${esc(g.type||'?')}</div>
      <div class="gap-body">${esc((g.body||'').slice(0,70))}</div>
      <span class="gap-fix" onclick="askGap('${esc(g.type||'')}','${esc((g.body||'').slice(0,60))}')">Ask Mistral →</span>
    </div>`).join('');
}

function renderJobs(jobs){
  const el=document.getElementById('jobs-list');
  if(!jobs.length){el.innerHTML='<div style="color:var(--text3);font-size:10px">No active jobs</div>';return;}
  el.innerHTML=jobs.slice(0,5).map(j=>`
    <div style="padding:4px 0;border-bottom:1px solid rgba(255,255,255,.03);font-size:10px">
      <span style="font-family:var(--mono);color:var(--text3)">${j.status}</span>
      <span style="color:var(--text2);margin-left:6px">${esc((j.prompt||'').slice(0,50))}</span>
    </div>`).join('');
}

async function buildCtx(types){
  const parts=[];
  if(types.includes('system')){const[h,p]=await Promise.all([api(`${GD}/health`),api(`${GD}/providers`)]);const pr=Object.keys(p?.providers||p?.channels||{});parts.push(`[NEXUS SYSTEM]\nGuardian:${h?.ok?'online':'offline'} Providers:${pr.join(',')||'none'}`);}
  if(types.includes('gaps')){const r=await api(`${GD}/gaps?status=open&limit=8`);const g=r?.gaps||[];if(g.length)parts.push('[OPEN GAPS]\n'+g.map(g=>`[${g.severity}] ${g.type}: ${(g.body||'').slice(0,70)}`).join('\n'));}
  if(types.includes('memory')){const r=await api(`${CX}/api/jaa/decision_log?limit=6`);const ro=r?.rows||r?.result||[];if(ro.length)parts.push('[DECISIONS]\n'+ro.map(d=>`[${d.chosen}] ${(d.input||'').slice(0,60)}`).join('\n'));}
  if(types.includes('jobs')){const r=await api(`${GD}/jobs?status=delivered&limit=5`);const j=r?.jobs||[];if(j.length)parts.push('[JOBS]\n'+j.map(j=>`[${j.provider}] ${(j.prompt||'').slice(0,60)}`).join('\n'));}
  if(types.includes('reflection')){const r=await api(`${CX}/api/jaa/reflection_contracts?limit=5`);const ro=r?.rows||r?.result||[];if(ro.length)parts.push('[REFLECTION]\n'+ro.map(c=>`[${c.status}] ${c.decisionClass||'?'}`).join('\n'));}
  return parts.join('\n\n');
}

async function send(){
  const prompt=document.getElementById('prompt-in').value.trim();
  if(!prompt||_streaming)return;
  const types=[...document.querySelectorAll('.ctx-chip.on')].map(c=>c.dataset.ctx);
  const ctx=await buildCtx(types);
  const system=ctx?`You are the NEXUS Mistral operator with full system access.\n\n${ctx}`:'You are the NEXUS Mistral operator.';
  addMsg('user',prompt);
  document.getElementById('prompt-in').value='';
  const msgEl=addStream();
  let buf='',tok=0;const t0=Date.now();
  document.getElementById('send-btn').style.display='none';
  document.getElementById('stop-btn').style.display='';
  document.getElementById('st-model').textContent=selModel;
  _streaming=true;
  try{
    _abort=new AbortController();
    const r=await fetch(`${OL}/api/generate`,{method:'POST',headers:{'Content-Type':'application/json'},signal:_abort.signal,body:JSON.stringify({model:selModel,prompt:`${system}\n\nUser: ${prompt}\n\nAssistant:`,stream:true,options:{temperature:0.3,num_predict:2048}})});
    if(!r.ok)throw new Error('Ollama '+r.status);
    const reader=r.body.getReader();const dec=new TextDecoder();
    while(true){
      const{done,value}=await reader.read();if(done)break;
      for(const line of dec.decode(value).split('\n').filter(Boolean)){
        try{const d=JSON.parse(line);if(d.response){buf+=d.response;tok++;updateStream(msgEl,buf);document.getElementById('st-tok').textContent=tok+' tok';}if(d.done)document.getElementById('st-time').textContent=((Date.now()-t0)/1000).toFixed(1)+'s';}catch{}
      }
    }
  }catch(e){if(e.name!=='AbortError')updateStream(msgEl,buf||'✗ '+e.message);}
  finally{finalStream(msgEl,buf);_streaming=false;_abort=null;document.getElementById('send-btn').style.display='';document.getElementById('stop-btn').style.display='none';}
}

function stop(){_abort?.abort();}

function addMsg(role,text){
  const msgs=document.getElementById('messages');
  const w=document.getElementById('welcome');if(w)w.remove();
  const el=document.createElement('div');el.className='msg '+role;
  el.innerHTML=`<div class="msg-role">${role}</div><div class="msg-text">${esc(text)}</div>`;
  msgs.appendChild(el);msgs.scrollTop=msgs.scrollHeight;return el;
}
function addStream(){
  const msgs=document.getElementById('messages');
  const el=document.createElement('div');el.className='msg assistant';
  el.innerHTML='<div class="msg-role">mistral</div><div class="msg-text"><span class="scursor"></span></div>';
  msgs.appendChild(el);msgs.scrollTop=msgs.scrollHeight;return el;
}
function updateStream(el,text){const t=el.querySelector('.msg-text');if(t){t.innerHTML=esc(text)+'<span class="scursor"></span>';}document.getElementById('messages').scrollTop=99999;}
function finalStream(el,text){const t=el.querySelector('.msg-text');if(t)t.innerHTML=esc(text);}

function askGap(type,body){document.getElementById('prompt-in').value=`Analyze this NEXUS gap and suggest a concrete fix:\nType: ${type}\nBody: ${body}`;send();}

async function ctxSystem(){const o=document.getElementById('ctx-out');o.style.display='';o.textContent='⟳';const c=await buildCtx(['system','gaps','jobs']);document.getElementById('prompt-in').value=c+'\n\nAnalyze the system state above and identify the highest priority issues.';o.textContent='✓ Context injected';}
async function ctxGaps(){const r=await api(`${GD}/gaps?status=open&limit=10`);const g=r?.gaps||[];const c=g.map(x=>`[${x.severity}] ${x.type}: ${(x.body||'').slice(0,80)}`).join('\n');document.getElementById('prompt-in').value=`OPEN GAPS:\n${c}\n\nFor each gap explain what it means and how to resolve it.`;const o=document.getElementById('ctx-out');o.style.display='';o.textContent='✓ '+g.length+' gaps injected';}
async function ctxMemory(){const r=await api(`${CX}/api/jaa/decision_log?limit=10`);const ro=r?.rows||r?.result||[];const c=ro.map(d=>`[${d.chosen}|${d.satisfaction??'?'}] ${(d.input||'').slice(0,80)}`).join('\n');document.getElementById('prompt-in').value=`RECENT DECISIONS:\n${c}\n\nIdentify patterns that need attention.`;const o=document.getElementById('ctx-out');o.style.display='';o.textContent='✓ '+ro.length+' decisions injected';}

async function cli(cmd){if(!cmd?.trim())return;const o=document.getElementById('cli-out');o.style.display='';o.textContent='⟳ '+cmd+'…';const r=await post(`${GD}/cli/exec`,{command:cmd.trim(),source:'mistral-console'});const d=r?.result??r??{};o.textContent=typeof d==='string'?d:JSON.stringify(d,null,2).slice(0,400);}

async function doRepair(){const p=document.getElementById('repair-in').value.trim();const o=document.getElementById('repair-out');if(!p)return;o.style.display='';o.style.color='var(--amber)';o.textContent='⟳ dispatching…';const r=await post(`${GD}/command`,{command:'diagnose_and_repair',provider:'ollama',prompt:p,source:'mistral-console',meta:{source:'mistral-console'}});o.style.color=r?.jobId?'var(--green)':'var(--red)';o.textContent=r?.jobId?'✓ '+r.jobId.slice(0,12):'✗ '+(r?.error||'failed');}

document.getElementById('prompt-in').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}});
document.querySelectorAll('.ctx-chip').forEach(c=>c.addEventListener('click',()=>c.classList.toggle('on')));

loadModels();refreshSys();setInterval(loadModels,30000);setInterval(refreshSys,5000);
</script>
</body>
</html>