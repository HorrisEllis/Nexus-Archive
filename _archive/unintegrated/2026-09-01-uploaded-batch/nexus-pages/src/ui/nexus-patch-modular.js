/* NEXUS v0.53.0 — nexus-patch-modular.js
 * Patch v1 + modular init — missing functions, TestEnv target popup
 * Phase 0B — extracted 2026-04-07
 */

(function(){
'use strict';

// ── API KEY SAVE HELPERS ──────────────────────────────────────────
// Lets users set keys directly in Options without bridge
window.setVal = window.setVal || function(id, v){ const el=document.getElementById(id); if(el) el.value=v; };

// Save API keys to localStorage when typed
setTimeout(()=>{
  const keyFields=[
    ['opt-claude-key','nx_claude_key'],
    ['opt-chatgpt-key','nx_openai_key'],
    ['opt-gemini-key','nx_gemini_key'],
    ['opt-deepseek-key','nx_deepseek_key'],
    ['opt-ollama-url','nx_ollama_url'],
  ];
  keyFields.forEach(([id,lsKey])=>{
    const el=document.getElementById(id);
    if(!el) return;
    // Restore saved value
    const saved=localStorage.getItem(lsKey);
    if(saved&&!el.value) el.value=saved;
    // Save on change
    el.addEventListener('change',()=>{ localStorage.setItem(lsKey,el.value); });
  });
  // Restore provider selection
  const prov=document.getElementById('opt-provider');
  const saved=localStorage.getItem('nx_provider');
  if(prov&&saved) prov.value=saved;
  if(prov) prov.addEventListener('change',function(){
    localStorage.setItem('nx_provider',prov.value);
    if(typeof AI!=='undefined') AI.provider=prov.value;
  });
},1000);

// ── TEST PROVIDER FUNCTIONS ───────────────────────────────────────
window.testGemini = async function(){
  const key=document.getElementById('opt-gemini-key')?.value?.trim();
  if(!key){toast('Enter Gemini API key first','warn');return;}
  const st=document.getElementById('test-gemini-status')||{textContent:''};
  try{
    const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`,{signal:AbortSignal.timeout(5000)});
    if(r.ok){toast('Gemini key valid ✓','ok');if(st)st.textContent='✓';}
    else{toast('Gemini key invalid ('+r.status+')','warn');if(st)st.textContent='✗';}
  }catch(e){toast('Gemini test failed: '+e.message,'warn');}
};

// ── FORGE IMPORT STUBS (fully wired) ─────────────────────────────
window.forgeImportTest = window.forgeImportTest || function(){
  const inp=document.createElement('input'); inp.type='file'; inp.accept='.js,.ts,.py,.spec.js';
  inp.onchange=e=>{ const f=e.target.files[0]; if(!f) return;
    const r=new FileReader(); r.onload=ev=>{ if(typeof forgeOpenContent==='function') forgeOpenContent('test_'+Date.now(),f.name,ev.target.result); toast('Test imported: '+f.name,'ok'); }; r.readAsText(f); };
  inp.click();
};
window.forgeImportEngine = window.forgeImportEngine || function(){
  const inp=document.createElement('input'); inp.type='file'; inp.accept='.js,.ts';
  inp.onchange=e=>{ const f=e.target.files[0]; if(!f) return;
    const r=new FileReader(); r.onload=ev=>{ if(typeof forgeOpenContent==='function') forgeOpenContent('eng_'+Date.now(),f.name,ev.target.result); toast('Engine imported: '+f.name,'ok'); }; r.readAsText(f); };
  inp.click();
};
window.forgeImportUI = window.forgeImportUI || function(){
  const inp=document.createElement('input'); inp.type='file'; inp.accept='.html,.jsx,.svelte,.vue';
  inp.onchange=e=>{ const f=e.target.files[0]; if(!f) return;
    const r=new FileReader(); r.onload=ev=>{ if(typeof forgeOpenContent==='function') forgeOpenContent('ui_'+Date.now(),f.name,ev.target.result); toast('UI imported: '+f.name,'ok'); }; r.readAsText(f); };
  inp.click();
};
window.forgeImportUCE = window.forgeImportUCE || function(){
  const inp=document.createElement('input'); inp.type='file'; inp.accept='.json';
  inp.onchange=e=>{ const f=e.target.files[0]; if(!f) return;
    const r=new FileReader(); r.onload=ev=>{
      try{
        const entries=JSON.parse(ev.target.result); const arr=Array.isArray(entries)?entries:[entries];
        if(typeof UCE_DB!=='undefined'&&typeof uceRender==='function'){
          const existing=new Set(UCE_DB.map(e=>e.id));
          const added=arr.filter(e=>e.id&&!existing.has(e.id));
          added.forEach(e=>{ if(typeof UCE_BY_ID!=='undefined') UCE_BY_ID[e.id]=e; UCE_DB.push(e); });
          uceRender(); toast('UCE: imported '+added.length+' entries','ok');
        }
      }catch(err){ toast('UCE import error: '+err.message,'warn'); }
    }; r.readAsText(f);
  };
  inp.click();
};

// ── FORGE COPILOT CYCLE ───────────────────────────────────────────
window.forgeCopilotCycle = window.forgeCopilotCycle || function(){
  const modes=['audit','fix','extend','refactor','document','test','security','perf','explain'];
  if(typeof FORGE==='undefined') return;
  FORGE.pilotMode = FORGE.pilotMode || 'audit';
  const idx = modes.indexOf(FORGE.pilotMode);
  FORGE.pilotMode = modes[(idx+1)%modes.length];
  const badge=document.getElementById('forge-copilot-mode-badge')||document.getElementById('forge-pilot-mode');
  if(badge) badge.textContent='⟡ '+FORGE.pilotMode.toUpperCase();
  if(typeof toast==='function') toast('Co-pilot: '+FORGE.pilotMode,'info');
};

// ── CLI KILL / SESSION ────────────────────────────────────────────
window.cliKill = window.cliKill || function(){
  if(typeof FORGE!=='undefined'&&FORGE._cliProc) FORGE._cliProc=null;
  const out=document.getElementById('cli-output');
  if(out){ const d=document.createElement('div'); d.style.color='var(--r)'; d.textContent='^C — process killed'; out.appendChild(d); out.scrollTop=out.scrollHeight; }
  if(typeof setPill==='function') setPill('cli-status-pill','idle','IDLE');
  if(typeof toast==='function') toast('Process killed','warn');
};
window.cliCloseSession = window.cliCloseSession || function(id){
  if(typeof FORGE==='undefined'||!FORGE.cliSessions) return;
  FORGE.cliSessions=FORGE.cliSessions.filter(s=>s.id!==id);
  if(FORGE.cliActiveSession===id) FORGE.cliActiveSession=FORGE.cliSessions[0]?.id||null;
  if(!FORGE.cliSessions.length&&typeof cliNewSession==='function') cliNewSession();
  else if(typeof cliRenderSessions==='function') cliRenderSessions();
};

// ── GUI BUILDER MOVE HELPERS ──────────────────────────────────────
window.guiMoveUp = window.guiMoveUp || function(id){
  if(typeof FORGE==='undefined'||!FORGE.guiElements) return;
  const i=FORGE.guiElements.findIndex(e=>e.id===id);
  if(i>0){[FORGE.guiElements[i-1],FORGE.guiElements[i]]=[FORGE.guiElements[i],FORGE.guiElements[i-1]];}
  if(typeof guiRenderCanvas==='function') guiRenderCanvas();
};
window.guiMoveDown = window.guiMoveDown || function(id){
  if(typeof FORGE==='undefined'||!FORGE.guiElements) return;
  const i=FORGE.guiElements.findIndex(e=>e.id===id);
  if(i<FORGE.guiElements.length-1){[FORGE.guiElements[i],FORGE.guiElements[i+1]]=[FORGE.guiElements[i+1],FORGE.guiElements[i]];}
  if(typeof guiRenderCanvas==='function') guiRenderCanvas();
};
window.guiDeleteEl = window.guiDeleteEl || function(id){
  if(typeof FORGE==='undefined'||!FORGE.guiElements) return;
  FORGE.guiElements=FORGE.guiElements.filter(e=>e.id!==id);
  if(typeof guiSelectElement==='function') guiSelectElement(null);
  if(typeof guiRenderCanvas==='function') guiRenderCanvas();
};

// ── APK MISSING FUNCTIONS ─────────────────────────────────────────
window.apkPermAll  = window.apkPermAll  || function(){ if(typeof ALL_PERMISSIONS!=='undefined'&&typeof apkState!=='undefined'){ ALL_PERMISSIONS.forEach(p=>apkState.selectedPerms.add(p.id)); if(typeof apkRenderPerms==='function') apkRenderPerms(); } };
window.apkPermNone = window.apkPermNone || function(){ if(typeof apkState!=='undefined'){ apkState.selectedPerms.clear(); if(typeof apkRenderPerms==='function') apkRenderPerms(); } };
window.apkLogCopy  = window.apkLogCopy  || function(){ const el=document.getElementById('apk-build-log'); if(el) navigator.clipboard.writeText(el.innerText).then(()=>toast('Log copied','ok')); };
window.apkSignAPK  = window.apkSignAPK  || function(){ const ks=document.getElementById('sign-ks')?.value; if(!ks){toast('Enter keystore path first','warn');return;} toast('Signing requires bridge: node bridge/nexus-bridge-server.js','info'); };
window.apkScanDevices = window.apkScanDevices || async function(){
  const list=document.getElementById('apk-device-list'); if(!list) return;
  list.textContent='Scanning...';
  const bridgeUrl=(typeof val==='function'?val('bridge-url'):null)||'http://127.0.0.1:3747';
  try{ const r=await fetch(bridgeUrl+'/adb/devices',{signal:AbortSignal.timeout(4000)}); const d=await r.json(); list.innerHTML=(d.devices||[]).map(function(dev){return '<div style="color:var(--g);font-size:9px">'+dev.id+' &mdash; '+(dev.model||'device')+'</div>';}).join('')||'<span style="color:var(--text3);font-size:9px">No devices found</span>'; }
  catch(_e){ list.innerHTML='<span style="color:var(--y);font-size:9px">Bridge offline &mdash; connect bridge to scan</span>'; }
};
window.apkRenderPlayChecklist = window.apkRenderPlayChecklist || function(){
  const el=document.getElementById('apk-play-checklist'); if(!el) return;
  const checks=[
    {label:'App name set', ok:!!document.getElementById('apk-name')?.value?.trim()},
    {label:'Package name set', ok:/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*){2,}$/.test(document.getElementById('apk-pkg')?.value||'')},
    {label:'Version name set', ok:!!document.getElementById('apk-ver-name')?.value?.trim()},
    {label:'Target SDK ≥ 34', ok:parseInt(document.getElementById('apk-target-sdk')?.value||'0')>=34},
    {label:'Permissions reviewed', ok:typeof apkState!=='undefined'&&apkState.selectedPerms?.size>0},
  ];
  el.innerHTML=checks.map(c=>`<div style="display:flex;gap:6px;align-items:center;padding:3px 0;font-size:9px"><span style="color:${c.ok?'var(--g)':'var(--r)'}">${c.ok?'✓':'✗'}</span><span style="color:${c.ok?'var(--text2)':'var(--text3)'}">${c.label}</span></div>`).join('');
};

// ── loginWithProvider alias ───────────────────────────────────────
window.loginWithProvider = window.loginWithProvider || window.loginConnectProvider || function(p){ if(typeof loginConnectProvider==='function') loginConnectProvider(p); };

// ─────────────────────────────────────────────────────────────────
// ── TESTENV TARGET POPUP ─────────────────────────────────────────
// A popup menu showing all service targets: PHP, Apache, MySQL,
// Redis, Node, MailHog — with start/stop, port, status, quick actions
// ─────────────────────────────────────────────────────────────────

// Inject popup styles
const _teStyle=document.createElement('style');
_teStyle.textContent=`
#te-target-overlay{position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;}
#te-target-popup{background:var(--bg1);border:1px solid var(--border2);border-radius:4px;min-width:520px;max-width:680px;width:90vw;max-height:80vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 12px 60px rgba(0,0,0,.6);}
.te-popup-head{padding:12px 16px;background:var(--bg2);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;flex-shrink:0;}
.te-popup-title{font-family:var(--display);font-size:11px;letter-spacing:.2em;color:var(--g);}
.te-popup-body{overflow-y:auto;padding:10px;display:flex;flex-direction:column;gap:6px;}
.te-svc-row{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--bg2);border:0.5px solid var(--border);border-radius:3px;cursor:pointer;transition:border-color .15s;}
.te-svc-row:hover{border-color:rgba(0,212,255,.4);}
.te-svc-row.running{border-color:rgba(0,255,136,.3);background:rgba(0,255,136,.03);}
.te-svc-icon{font-size:16px;flex-shrink:0;}
.te-svc-info{flex:1;min-width:0;}
.te-svc-name{font-family:var(--display);font-size:10px;letter-spacing:.12em;color:var(--text);}
.te-svc-desc{font-size:8px;color:var(--text3);font-family:var(--mono);margin-top:2px;}
.te-svc-port{font-family:var(--mono);font-size:9px;color:var(--text4);min-width:50px;text-align:right;}
.te-svc-status{font-family:var(--display);font-size:8px;letter-spacing:.1em;padding:2px 8px;border-radius:2px;min-width:64px;text-align:center;}
.te-svc-status.running{color:var(--g);background:rgba(0,255,136,.1);border:0.5px solid rgba(0,255,136,.25);}
.te-svc-status.stopped{color:var(--text4);background:rgba(255,255,255,.04);border:0.5px solid var(--border);}
.te-svc-toggle{font-size:9px;padding:3px 10px;border-radius:2px;cursor:pointer;font-family:var(--display);letter-spacing:.08em;border:0.5px solid;transition:all .12s;}
.te-svc-toggle.start{color:var(--g);border-color:rgba(0,255,136,.4);background:rgba(0,255,136,.06);}
.te-svc-toggle.start:hover{background:rgba(0,255,136,.15);}
.te-svc-toggle.stop{color:var(--r);border-color:rgba(255,45,85,.4);background:rgba(255,45,85,.06);}
.te-svc-toggle.stop:hover{background:rgba(255,45,85,.15);}
.te-popup-actions{padding:10px 12px;border-top:1px solid var(--border);display:flex;gap:6px;flex-shrink:0;flex-wrap:wrap;}
.te-deploy-row{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:10px;border-top:1px solid var(--border);}
.te-deploy-card{padding:10px 12px;background:var(--bg2);border:0.5px solid var(--border);border-radius:3px;cursor:pointer;text-align:center;transition:all .15s;}
.te-deploy-card:hover{border-color:var(--c);background:rgba(0,212,255,.04);}
.te-deploy-card-name{font-family:var(--display);font-size:9px;letter-spacing:.12em;color:var(--c);}
.te-deploy-card-desc{font-size:8px;color:var(--text3);margin-top:3px;}
`;
document.head.appendChild(_teStyle);

// Service definitions
const TE_SERVICES = [
  {id:'apache',  name:'APACHE2',  icon:'🌐', port:':80 / :443', desc:'Web server · PHP-FPM · Virtual hosts · .htaccess'},
  {id:'php',     name:'PHP 8.3',  icon:'🐘', port:'FPM socket', desc:'FastCGI · Composer · PDO · cURL · GD · Xdebug'},
  {id:'mysql',   name:'MYSQL 8',  icon:'🗄',  port:':3306',      desc:'SQL database · InnoDB · utf8mb4 · Query console'},
  {id:'redis',   name:'REDIS 7',  icon:'⚡',  port:':6379',      desc:'In-memory cache · LRU eviction · Pub/Sub'},
  {id:'node',    name:'NODE.JS',  icon:'🟢', port:':3000',      desc:'Express / Bun / Deno · npm scripts · REST API'},
  {id:'mailhog', name:'MAILHOG',  icon:'📧', port:':1025/:8025', desc:'SMTP capture · Email testing · Web UI at :8025'},
];

const TE_DEPLOY_TARGETS = [
  {id:'browser',  name:'BROWSER SIM',   icon:'🔭', desc:'Open embedded browser at localhost:8080'},
  {id:'testenv',  name:'RUN TEST SUITE',icon:'✓',  desc:'Execute full Playwright / Jest / PHPUnit suite'},
  {id:'deepscan', name:'DEEP SCAN',     icon:'⬡',  desc:'Adversarial code review on deployed app'},
  {id:'buildlog', name:'BUILD LOG',     icon:'📋', desc:'View last build output and compilation errors'},
  {id:'network',  name:'NETWORK MON',   icon:'📡', desc:'HTTP / WebSocket / API call monitor'},
  {id:'instance', name:'SPAWN INSTANCE',icon:'⬡', desc:'Create isolated sandboxed test instance'},
];

// ── Open popup ────────────────────────────────────────────────────
window.teShowTargetPopup = function(){
  let overlay = document.getElementById('te-target-overlay');
  if(overlay){ overlay.style.display='flex'; teRefreshServiceStatus(); return; }
  overlay = document.createElement('div');
  overlay.id = 'te-target-overlay';
  overlay.onclick = e=>{ if(e.target===overlay) teHideTargetPopup(); };
  overlay.innerHTML = `
    <div id="te-target-popup">
      <div class="te-popup-head">
        <span class="te-popup-title">⬡ TESTENV — SERVICE TARGETS</span>
        <div class="pill pill-idle" id="te-popup-status-pill" style="font-size:8px"><div class="pill-dot"></div><span id="te-popup-status-txt">CHECKING…</span></div>
        <button onclick="teHideTargetPopup()" style="margin-left:auto;background:none;border:none;color:var(--text3);cursor:pointer;font-size:14px;">✕</button>
      </div>
      <div class="te-popup-body" id="te-popup-svc-list">
        ${TE_SERVICES.map(s=>`
        <div class="te-svc-row" id="te-svcrow-${s.id}" onclick="teToggleServiceFromPopup('${s.id}')">
          <span class="te-svc-icon">${s.icon}</span>
          <div class="te-svc-info">
            <div class="te-svc-name">${s.name}</div>
            <div class="te-svc-desc">${s.desc}</div>
          </div>
          <span class="te-svc-port">${s.port}</span>
          <span class="te-svc-status stopped" id="te-popup-status-${s.id}">STOPPED</span>
          <button class="te-svc-toggle start" id="te-popup-btn-${s.id}" onclick="event.stopPropagation();teToggleServiceFromPopup('${s.id}')">▶ START</button>
        </div>`).join('')}
      </div>
      <div class="te-popup-actions">
        <button class="btn ok" style="font-size:9px" onclick="teStartAll()">▶ START ALL</button>
        <button class="btn danger" style="font-size:9px" onclick="teStopAll()">■ STOP ALL</button>
        <button class="btn" style="font-size:9px" onclick="teRefreshServiceStatus()">↻ REFRESH</button>
        <button class="btn" style="font-size:9px" onclick="teCheckBridgeServices()">⟁ CHECK BRIDGE</button>
        <button class="btn accent" style="font-size:9px;margin-left:auto" onclick="teHideTargetPopup();switchTab('testenv')">OPEN TEST ENV →</button>
      </div>
      <div style="padding:8px 10px;border-top:1px solid var(--border);font-family:var(--display);font-size:9px;letter-spacing:.12em;color:var(--text3);">⬡ DEPLOY TARGETS</div>
      <div class="te-deploy-row">
        ${TE_DEPLOY_TARGETS.map(t=>`
        <div class="te-deploy-card" onclick="teDeployTarget('${t.id}')">
          <div style="font-size:18px;margin-bottom:4px">${t.icon}</div>
          <div class="te-deploy-card-name">${t.name}</div>
          <div class="te-deploy-card-desc">${t.desc}</div>
        </div>`).join('')}
      </div>
    </div>`;
  document.body.appendChild(overlay);
  teRefreshServiceStatus();
};

window.teHideTargetPopup = function(){
  const o=document.getElementById('te-target-overlay');
  if(o) o.style.display='none';
};

// ── Refresh service status from bridge or TE state ────────────────
window.teRefreshServiceStatus = async function(){
  const bridgeUrl=(typeof val==='function'?val('bridge-url'):null)||'http://127.0.0.1:3747';
  // Try bridge for real status
  let services={};
  try{
    const r=await fetch(bridgeUrl+'/services/status',{signal:AbortSignal.timeout(3000)});
    const data=await r.json();
    services=data.services||{};
    const pill=document.getElementById('te-popup-status-pill');
    const txt=document.getElementById('te-popup-status-txt');
    if(pill) pill.className='pill pill-ok';
    if(txt) txt.textContent='BRIDGE ONLINE';
  }catch{
    // Fall back to TE.services state
    if(typeof TE!=='undefined') services=Object.fromEntries(Object.entries(TE.services||{}).map(([k,v])=>([k,{running:v}])));
    const txt=document.getElementById('te-popup-status-txt');
    if(txt) txt.textContent='LOCAL STATE';
  }
  TE_SERVICES.forEach(svc=>{
    const running = services[svc.id]?.running || (typeof TE!=='undefined'&&TE.services?.[svc.id]);
    _teUpdateServiceUI(svc.id, running);
  });
};

function _teUpdateServiceUI(id, running){
  const row=document.getElementById('te-svcrow-'+id);
  const badge=document.getElementById('te-popup-status-'+id);
  const btn=document.getElementById('te-popup-btn-'+id);
  if(row){ row.className='te-svc-row'+(running?' running':''); }
  if(badge){ badge.className='te-svc-status '+(running?'running':'stopped'); badge.textContent=running?'RUNNING':'STOPPED'; }
  if(btn){ btn.className='te-svc-toggle '+(running?'stop':'start'); btn.textContent=running?'■ STOP':'▶ START'; }
}

// ── Toggle service from popup ─────────────────────────────────────
window.teToggleServiceFromPopup = async function(id){
  const isRunning = typeof TE!=='undefined'&&TE.services?.[id];
  const action = isRunning ? 'stop' : 'start';
  const bridgeUrl=(typeof val==='function'?val('bridge-url'):null)||'http://127.0.0.1:3747';
  // Try bridge
  try{
    const r=await fetch(bridgeUrl+'/services/'+id+'/'+action,{method:'POST',signal:AbortSignal.timeout(8000)});
    const data=await r.json();
    const newState=data.ok ? !isRunning : isRunning;
    if(typeof teToggleService==='function') teToggleService(id, newState);
    _teUpdateServiceUI(id, newState);
    if(typeof toast==='function') toast(id.toUpperCase()+' '+(newState?'started':'stopped'),newState?'ok':'warn');
  }catch{
    // Bridge offline — toggle local state only
    if(typeof teToggleService==='function') teToggleService(id, !isRunning);
    _teUpdateServiceUI(id, !isRunning);
    if(typeof toast==='function') toast(id+' toggled locally (bridge offline)','info');
  }
};

window.teStartAll = async function(){
  for(const s of TE_SERVICES){ await teToggleServiceFromPopup(s.id); await new Promise(r=>setTimeout(r,100)); }
  if(typeof toast==='function') toast('All services started','ok');
};
window.teStopAll = async function(){
  TE_SERVICES.forEach(s=>{ if(typeof teToggleService==='function') teToggleService(s.id,false); _teUpdateServiceUI(s.id,false); });
  if(typeof toast==='function') toast('All services stopped','warn');
};

window.teCheckBridgeServices = async function(){
  await teRefreshServiceStatus();
  if(typeof toast==='function') toast('Service status refreshed','ok');
};

// ── Deploy targets from popup ─────────────────────────────────────
window.teDeployTarget = function(targetId){
  teHideTargetPopup();
  if(typeof teSwitchTab==='function'){
    switch(targetId){
      case 'browser':  teSwitchTab('browser'); break;
      case 'testenv':  teRunPWTests&&teRunPWTests(); teSwitchTab('tests'); break;
      case 'deepscan': if(typeof setBuilderMode==='function'){switchTab('builder');setBuilderMode('deepscan');} break;
      case 'buildlog': teSwitchTab('runner'); break;
      case 'network':  teSwitchTab('network'); break;
      case 'instance': if(typeof teSpawnInstance==='function') teSpawnInstance(); break;
    }
  }
};

// ── Inject "TARGETS" button into TestEnv toolbar ──────────────────
function injectTeTargetsButton(){
  // Find the testenv top bar
  const teBar = document.querySelector('#tab-testenv > div:first-child');
  if(!teBar||teBar.dataset.targetsInjected) return;
  teBar.dataset.targetsInjected='1';
  const btn=document.createElement('button');
  btn.className='btn accent';
  btn.style.cssText='font-size:9px;padding:3px 10px;color:var(--c);border-color:rgba(0,212,255,.4);margin-left:6px;';
  btn.innerHTML='⬡ TARGETS';
  btn.title='Service targets & deploy options';
  btn.onclick=()=>teShowTargetPopup();
  // Insert before the last button group
  const firstBtn=teBar.querySelector('button');
  if(firstBtn) teBar.insertBefore(btn,firstBtn.nextSibling);
  else teBar.appendChild(btn);
}

// Also add quick-access button to TestEnv dashboard
function injectTeDashboardTargets(){
  const dash=document.getElementById('tes-dashboard');
  if(!dash||dash.dataset.targetsInjected) return;
  dash.dataset.targetsInjected='1';
  // Find the quick actions grid
  const grid=dash.querySelector('[style*="grid"]')||dash.querySelector('.mcard-grid');
  if(!grid) return;
  const card=document.createElement('div');
  card.className='mcard';
  card.style.cssText='cursor:pointer;border-color:rgba(0,212,255,.3);';
  card.innerHTML='<div class="mcard-title">SERVICE TARGETS</div><div class="mcard-val" style="font-size:14px;color:var(--c)">⬡</div>';
  card.onclick=()=>teShowTargetPopup();
  grid.appendChild(card);
}

// ── Boot ──────────────────────────────────────────────────────────
setTimeout(()=>{
  injectTeTargetsButton();
  injectTeDashboardTargets();
  // Also add to TestEnv sub-nav
  const teSubnav=document.querySelector('#tab-testenv [style*="ptab"]');
  // Keyboard shortcut: Ctrl+T opens target popup when in testenv
  document.addEventListener('keydown',e=>{
    if(e.ctrlKey&&e.shiftKey&&e.key==='T'){
      e.preventDefault();
      const active=document.querySelector('.tab-panel[data-active]');
      if(active?.id==='tab-testenv') teShowTargetPopup();
    }
  });
  // Re-inject on tab switch
  const _orig=window.switchTab;
  if(typeof _orig==='function'){
    window.switchTab=function(name,...args){
      _orig(name,...args);
      if(name==='testenv') setTimeout(()=>{ injectTeTargetsButton(); injectTeDashboardTargets(); },100);
    };
  }
},600);

// ── Builder status indicator ──────────────────────────────────────
// Show clear "needs API key or bridge" message in builder when no config
setTimeout(()=>{
  const sbEndstate=document.getElementById('sb-endstate');
  const sbGenBtn=document.getElementById('sb-generate');
  if(!sbEndstate||!sbGenBtn) return;
  const hasKey=()=>{
    const ck=localStorage.getItem('nx_claude_key')||document.getElementById('opt-claude-key')?.value||'';
    const ok=localStorage.getItem('nx_openai_key')||document.getElementById('opt-chatgpt-key')?.value||'';
    const gk=localStorage.getItem('nx_gemini_key')||document.getElementById('opt-gemini-key')?.value||'';
    return ck||ok||gk;
  };
  // Show hint in builder if no key
  const hint=document.createElement('div');
  hint.id='sb-api-hint';
  hint.style.cssText='font-size:9px;color:var(--y);font-family:var(--mono);padding:3px 8px;display:none;';
  hint.innerHTML='⚠ No API key or bridge detected — go to <b style="color:var(--c);cursor:pointer" onclick="switchTab(\'options\')">OPTIONS</b> to add a key';
  sbEndstate.parentElement?.insertBefore(hint, sbEndstate);
  const check=()=>{ hint.style.display=hasKey()?'none':'block'; };
  check();
  sbEndstate.addEventListener('focus',check);
  sbGenBtn.addEventListener('click',check,{capture:true});
},800);

})();
