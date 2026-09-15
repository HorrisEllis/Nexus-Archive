/* NEXUS v0.53.0 — nexus-auth.js
 * Login flow, welcome-back, mode select, provider setup, init
 * Phase 0B — extracted 2026-04-07
 */

/* ═══════════════════════════════════════════════════════════════
   NEXUS v6 — LOGIN FLOW, WELCOME SCREEN, MODE SELECT
   ═══════════════════════════════════════════════════════════════ */

const LOGIN_PROVIDERS=[
  {id:'chatgpt',  name:'CHATGPT',  color:'var(--g)',  url:'https://chat.openai.com',    desc:'Free tier available',     icon:'⬡'},
  {id:'claude',   name:'CLAUDE',   color:'var(--o)',  url:'https://claude.ai',          desc:'Most capable reasoning',  icon:'◈'},
  {id:'gemini',   name:'GEMINI',   color:'var(--c)',  url:'https://gemini.google.com',  desc:'Google AI, fast',         icon:'◆'},
  {id:'grok',     name:'GROK',     color:'var(--y)',  url:'https://x.com/i/grok',       desc:'xAI, web-aware',          icon:'⟁'},
  {id:'perplexity',name:'PERPLEXITY',color:'var(--m)',url:'https://www.perplexity.ai',  desc:'Research + web search',   icon:'∿'},
  {id:'deepseek', name:'DEEPSEEK', color:'var(--c)',  url:'https://chat.deepseek.com',  desc:'System brain / reasoning',icon:'⬤'},
  {id:'local',    name:'LOCAL AI', color:'var(--text2)',url:'',                          desc:'Ollama / LM Studio',      icon:'⬢'},
];

let _loginSessionUUID='';
let _loginSelectedProvider='chatgpt';
let _loginAttempt=0;
let _loginCanvasFrame=null;

function loginInitCanvas(){
  const c=$('login-canvas');if(!c)return;
  // Pause background particle system while overlay is active
  if(window._cancelParticles) window._cancelParticles();
  const ctx=c.getContext('2d');
  c.width=window.innerWidth;c.height=window.innerHeight;
  const stars=Array.from({length:200},()=>({
    x:Math.random()*c.width,y:Math.random()*c.height,
    r:Math.random()*1.5+0.3,speed:Math.random()*0.3+0.1,
    opacity:Math.random()
  }));
  function draw(){
    const overlay=$('ai-login-overlay');
    if(!overlay||overlay.style.display==='none'){cancelAnimationFrame(_loginCanvasFrame);return;}
    ctx.clearRect(0,0,c.width,c.height);
    ctx.fillStyle='#05080f';ctx.fillRect(0,0,c.width,c.height);
    stars.forEach(s=>{
      s.opacity+=0.01*(Math.random()>.5?1:-1);
      s.opacity=Math.max(.1,Math.min(.9,s.opacity));
      s.y-=s.speed;if(s.y<0){s.y=c.height;s.x=Math.random()*c.width;}
      ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(0,212,255,${s.opacity})`;ctx.fill();
    });
    // Nebula glow
    const g=ctx.createRadialGradient(c.width/2,c.height/2,0,c.width/2,c.height/2,c.width*.6);
    g.addColorStop(0,'rgba(0,212,255,0.04)');g.addColorStop(1,'transparent');
    ctx.fillStyle=g;ctx.fillRect(0,0,c.width,c.height);
    _loginCanvasFrame=requestAnimationFrame(draw);
  }
  draw();
}

function loginRenderProviders(){
  const grid=$('login-ai-grid');if(!grid)return;
  // Check saved mode
  const savedMode=localStorage.getItem('nx6_login_mode')||'guardian';
  const guardianConnected=typeof GUARDIAN!=='undefined'&&GUARDIAN.connected;

  if(savedMode==='guardian'){
    // Guardian mode: show status + go to AI SETTINGS for callto wiring
    grid.innerHTML=`
      <div style="grid-column:1/-1;background:var(--bg1);border:1px solid rgba(0,255,136,.2);border-radius:3px;padding:16px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
          <span style="font-size:18px;color:var(--g)">⟁</span>
          <span style="font-family:var(--display);font-size:14px;letter-spacing:.18em;color:var(--g)">GUARDIAN MODE</span>
          <div style="margin-left:auto;width:8px;height:8px;border-radius:50%;background:${guardianConnected?'var(--g)':'var(--text4)'};box-shadow:${guardianConnected?'0 0 8px var(--g)':'none'}" id="login-guardian-dot"></div>
        </div>
        <div style="font-size:10px;color:var(--text2);line-height:1.7;margin-bottom:12px;">
          No API keys needed. Pick the chat input on any AI tab with Guardian, then assign it here.
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px;" id="login-guardian-agents">
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button onclick="loginSkip();setTimeout(()=>{switchTab('options');setTimeout(()=>optSwitchTab('ai',null),150);},150)" style="flex:1;background:rgba(0,255,136,.1);border:1px solid rgba(0,255,136,.4);border-radius:2px;padding:8px;font-family:var(--display);font-size:11px;letter-spacing:.1em;color:var(--g);cursor:pointer">⚙ AI SETTINGS</button>
          <button onclick="localStorage.setItem('nx6_login_mode','api');loginRenderProviders()" style="background:none;border:1px solid var(--border2);border-radius:2px;padding:8px 12px;font-size:10px;color:var(--text3);cursor:pointer">API key →</button>
        </div>
      </div>`;
  // Populate guardian agent wire grid
  const agentGrid = document.getElementById('login-guardian-agents');
  if (agentGrid) {
    const agentIds = ['chatgpt','claude','deepseek','gemini','ollama','grok'];
    const agentNames = {chatgpt:'ChatGPT',claude:'Claude',deepseek:'DeepSeek',gemini:'Gemini',ollama:'Ollama',grok:'Grok'};
    const agentColors = {chatgpt:'var(--g)',claude:'var(--o)',deepseek:'var(--c)',gemini:'var(--c)',ollama:'var(--text2)',grok:'var(--y)'};
    const guardianHooks = JSON.parse(localStorage.getItem('nx_guardian_agent_hooks')||'{}');
    agentGrid.innerHTML = '';
    agentIds.forEach(function(id) {
      var wired = !!(guardianHooks[id] && guardianHooks[id].calltoId);
      var color = agentColors[id] || 'var(--c)';
      var div = document.createElement('div');
      div.style.cssText = 'background:var(--bg1);border:1px solid '
        + (wired ? color : 'var(--border2)')
        + ';border-radius:3px;padding:8px 10px;display:flex;align-items:center;gap:8px;cursor:pointer;transition:all .2s';
      div.dataset.agentId = id;
      var nameSpan = document.createElement('span');
      nameSpan.style.cssText = 'font-family:var(--display);font-size:11px;letter-spacing:.12em;color:' + color + ';flex:1';
      nameSpan.textContent = agentNames[id] || id;
      var statusSpan = document.createElement('span');
      statusSpan.style.cssText = 'font-size:9px;color:' + (wired ? 'var(--g)' : 'var(--text4)');
      statusSpan.textContent = wired ? '⧁ WIRED' : 'WIRE';
      div.appendChild(nameSpan);
      div.appendChild(statusSpan);
      div.addEventListener('click', function() { loginWireAgent(this.dataset.agentId); });
      agentGrid.appendChild(div);
    });
  }
  } else {
    // API mode: show provider grid
    grid.innerHTML='';
    const API_PROVIDERS=LOGIN_PROVIDERS||[];
    API_PROVIDERS.forEach(p=>{
      const d=document.createElement('div');
      d.style.cssText='background:var(--bg1);border:1px solid var(--border2);border-radius:3px;padding:14px;cursor:pointer;transition:all .2s;display:flex;flex-direction:column;gap:6px;';
      const isLocal=p.id==='local';
      d.innerHTML='<div style="display:flex;align-items:center;gap:8px;"><span style="font-size:18px;color:'+p.color+'">'+p.icon+'</span><span style="font-family:var(--display);font-size:13px;letter-spacing:.16em;color:'+p.color+'">'+p.name+'</span></div>'
        +'<div style="font-size:10px;color:var(--text3);">'+p.desc+'</div>'
        +'<div style="font-size:9px;color:var(--text3);border-top:1px solid var(--border);padding-top:5px;margin-top:2px;">'+(isLocal?'Direct — no bridge':'Direct API key')+'</div>';
      d.onmouseenter=()=>{d.style.borderColor=p.color;d.style.background='rgba(255,255,255,.03)';};
      d.onmouseleave=()=>{d.style.borderColor='var(--border2)';d.style.background='var(--bg1)';};
      d.onclick=()=>loginConnectProvider(p);
      grid.appendChild(d);
    });
    // Back to Guardian button
    const back=document.createElement('div');
    back.style.cssText='grid-column:1/-1;text-align:center;padding:8px 0;';
    back.innerHTML='<button onclick="localStorage.setItem(\'nx6_login_mode\',\'guardian\');loginRenderProviders()" style="background:none;border:none;font-size:10px;color:var(--text3);cursor:pointer;text-decoration:underline">← Use Guardian mode instead (no API key)</button>';
    grid.appendChild(back);
  }
}

let _loginBridgeMode = true;
function loginToggleBridgeMode(){
  _loginBridgeMode = !_loginBridgeMode;
  const btn=$('login-bridge-btn');
  if(btn) btn.style.borderColor = _loginBridgeMode ? 'var(--c)' : 'var(--border2)';
  loginCheckBridge();
}
async function loginCheckBridge(){
  const statusEl=$('login-bridge-status');
  if(!statusEl) return;
  statusEl.textContent='checking bridge...';
  statusEl.style.color='var(--text3)';
  const bridgeUrl=val('bridge-url')||'http://127.0.0.1:3747';
  try{
    const ping=await fetch(bridgeUrl+'/health',{signal:AbortSignal.timeout(2500)});
    if(ping.ok){
      statusEl.textContent='bridge online';
      statusEl.style.color='var(--g)';
    }else{
      statusEl.textContent='bridge error '+ping.status;
      statusEl.style.color='var(--r)';
    }
  }catch{
    statusEl.textContent='bridge not running — NEXUS starts it automatically';
    statusEl.style.color='var(--y)';
    // Bridge auto-starts with NEXUS — this only shows in dev/file:// mode
    if (typeof toast === 'function' && !window._bridgeOfflineToasted) {
      window._bridgeOfflineToasted = true;
      toast('⚠ Bridge offline — if running NEXUS as .exe it starts automatically. In dev mode run: node bridge/nexus-bridge-server.js', 'warn', 8000);
    }
  }
}

async function loginConnectProvider(provider){
  _loginSelectedProvider=provider.id;
  AI.provider=provider.id;
  localStorage.setItem('nx6_last_provider',provider.id);
  // Local/Ollama — no bridge needed
  if(provider.id==='local'||provider.id==='ollama'){
    try{if(typeof onProviderChange==='function')onProviderChange();}catch(_){}
    loginSuccess(provider,'local');
    return;
  }
  // All other providers in API mode — check for API key
  const keyMap={claude:'opt-claude-key',chatgpt:'opt-chatgpt-key',deepseek:'opt-deepseek-key',gemini:'opt-gemini-key',grok:'opt-grok-key'};
  const keyEl=document.getElementById(keyMap[provider.id]);
  const hasKey=keyEl&&keyEl.value.trim();
  if(hasKey){
    try{if(typeof onProviderChange==='function')onProviderChange();}catch(_){}
    loginSuccess(provider,'api-key');
    return;
  }
  // No key — send to OPTIONS to add one
  const overlay=$('ai-login-overlay');
  if(overlay)overlay.style.display='none';
  localStorage.setItem('nx6_skip_login','true');
  if(typeof switchTab==='function')switchTab('options');
  setTimeout(()=>{
    if(typeof optSwitchTab==='function')optSwitchTab('ai',null);
    if(typeof toast==='function')toast('Add your '+provider.name+' API key here','ok',5000);
  },200);
}

async function loginConfirmCapture(){
  const provider=window._pendingLoginProvider;
  const bridgeUrl=window._pendingBridgeUrl||'http://127.0.0.1:3747';
  if(!provider)return;
  const msg=$('login-status-msg');
  const bar=$('login-progress-bar');
  if(msg)msg.textContent='Reading cookies from Firefox...';
  if(bar){bar.style.width='60%';bar.style.background='var(--c)';}
  try{
    const r=await fetch(bridgeUrl+'/accounts/'+provider.id+'/connect',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({accountId:'main'}),
      signal:AbortSignal.timeout(15000)
    });
    const result=await r.json();
    if(result.ok&&result.cookieCount>0){
      if(bar){bar.style.width='100%';bar.style.background='var(--g)';}
      if(msg)msg.textContent='Connected via '+result.method+' -- '+result.cookieCount+' cookies';
      await new Promise(r=>setTimeout(r,700));
      loginSuccess(provider,'bridge');
    } else {
      // Show manual paste option
      if(bar){bar.style.width='100%';bar.style.background='var(--y)';}
      loginShowManualPaste(provider,bridgeUrl,result.error||'No cookies found');
    }
  }catch(e){
    if(bar){bar.style.width='100%';bar.style.background='var(--r)';}
    loginShowManualPaste(provider,bridgeUrl,'Bridge error: '+e.message);
  }
}

function loginShowManualPaste(provider,bridgeUrl,errorMsg){
  // Cookie capture is deprecated — redirect to Guardian mode or OPTIONS
  if(typeof toast==='function') toast('Auto-capture removed. Use Guardian mode (no API needed) or add an API key in OPTIONS.','warn',6000);
  const overlay=$('ai-login-overlay');
  if(overlay)overlay.style.display='none';
  localStorage.setItem('nx6_skip_login','true');
  localStorage.setItem('nx6_login_mode','guardian');
  if(typeof switchTab==='function')switchTab('options');
  setTimeout(()=>{ if(typeof optSwitchTab==='function')optSwitchTab('ai',null); },200);
}

async function loginImportManual(){
  const provider=window._pendingLoginProvider;
  const bridgeUrl=window._pendingBridgeUrl||'http://127.0.0.1:3747';
  const input=document.getElementById('manual-cookie-input');
  const msg=$('login-status-msg');
  if(!input||!input.value.trim()){if(msg)msg.textContent='Paste your cookies first.';return;}
  if(msg)msg.textContent='Importing...';
  try{
    const r=await fetch(bridgeUrl+'/accounts/manual-import',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({provider:provider.id,cookies:input.value.trim()}),
      signal:AbortSignal.timeout(10000)
    });
    const result=await r.json();
    if(result.ok&&result.cookieCount>0){
      if(msg)msg.textContent='Imported '+result.cookieCount+' cookies';
      await new Promise(r=>setTimeout(r,600));
      loginSuccess(provider,'manual');
    } else {
      if(msg)msg.textContent='Failed: '+(result.error||'Could not parse cookies');
    }
  }catch(e){
    if(msg)msg.textContent='Error: '+e.message;
  }
}


function loginFail(provider,msg){
  const errorBox=$('login-error-box');const statusBox=$('login-status-box');
  if(statusBox)statusBox.style.display='none';
  if(errorBox)errorBox.style.display='';
  $('login-error-msg').textContent=msg||'Connection failed. Check your API key in Options.';
  $('login-error-uuid').textContent='UUID: '+_loginSessionUUID;
  $('login-manual-btn').style.display='';
  JAA.log('login:fail',{provider:provider.id,error:msg},_loginSessionUUID,'ERROR');
}

function loginRetry(){
  const p=LOGIN_PROVIDERS.find(x=>x.id===_loginSelectedProvider)||LOGIN_PROVIDERS[0];
  loginConnectProvider(p);
}

function loginSkip(){
  // Close the login overlay and go to the app
  const o=$('ai-login-overlay');
  if(o) o.style.display='none';
  localStorage.setItem('nx6_skip_login','true');
  // If they had a last provider remembered, keep it
  if(!localStorage.getItem('nx6_last_provider')) localStorage.setItem('nx6_last_provider','chatgpt');
  log_ev('login:skipped',{},'INFO');
  UUID.gen('action',{action:'login:skip'},'login:skip');
  // Go straight to home
  switchTab('home');
  toast('Skipped — configure AI in OPTIONS anytime','ok',4000);
}

function loginSuccess(provider,method){
  cancelAnimationFrame(_loginCanvasFrame);
  $('ai-login-overlay').style.display='none';
  // Update top bar pill
  const pill=document.querySelector('#top-bar .pill-idle');
  if(pill){pill.className='pill pill-ok';const t=pill.querySelector('span');if(t)t.textContent=provider.name+' ● ACTIVE';}
  JAA.log('login:complete',{provider:provider.id,method},_loginSessionUUID,'OK');
  localStorage.setItem('nx6_last_provider',provider.id);
  localStorage.setItem('nx6_login_session',_loginSessionUUID);
  showWelcomeScreen();
}

/* ─── WELCOME SCREEN ──────────────────────────────────────────── */
let _welcomeCanvasFrame=null;

function welcomeInitCanvas(){
  const c=$('welcome-canvas');if(!c)return;
  const ctx=c.getContext('2d');
  c.width=window.innerWidth;c.height=window.innerHeight;
  let t=0;
  const particles=Array.from({length:120},()=>({
    x:Math.random()*c.width,y:Math.random()*c.height,
    vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,
    r:Math.random()*2+.5,opacity:Math.random()*.8+.2,
    hue:Math.random()>0.7?280:195
  }));
  function draw(){
    if(!$('welcome-overlay')||$('welcome-overlay').style.display==='none')return;
    t+=0.005;
    ctx.fillStyle='rgba(5,8,15,0.15)';ctx.fillRect(0,0,c.width,c.height);
    particles.forEach(p=>{
      p.x+=p.vx;p.y+=p.vy;
      if(p.x<0)p.x=c.width;if(p.x>c.width)p.x=0;
      if(p.y<0)p.y=c.height;if(p.y>c.height)p.y=0;
      p.opacity=0.3+0.4*Math.sin(t*2+p.x*.01);
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`hsla(${p.hue},100%,70%,${p.opacity})`;ctx.fill();
    });
    // Sweeping aurora
    const aurora=ctx.createLinearGradient(0,c.height*.3,c.width,c.height*.7);
    aurora.addColorStop(0,'transparent');
    aurora.addColorStop(0.3+0.1*Math.sin(t),`rgba(0,212,255,${0.03+0.02*Math.sin(t)})`);
    aurora.addColorStop(0.7+0.1*Math.cos(t),`rgba(204,68,255,${0.03+0.02*Math.cos(t)})`);
    aurora.addColorStop(1,'transparent');
    ctx.fillStyle=aurora;ctx.fillRect(0,0,c.width,c.height);
    _welcomeCanvasFrame=requestAnimationFrame(draw);
  }
  draw();
}

function showWelcomeScreen(){
  const wo=$('welcome-overlay');if(!wo)return;
  wo.style.display='flex';
  welcomeInitCanvas();
  // Set personalized greeting
  const username=localStorage.getItem('nx6_username')||'';
  const greeting=$('welcome-greeting');const nameEl=$('welcome-name');
  if(greeting)greeting.textContent='WELCOME';

  // First time — ask for name
  if(!username){
    if(nameEl){
      nameEl.innerHTML=`<div style="display:flex;align-items:center;gap:10px;margin-top:8px;">
        <input id="welcome-name-input" style="background:rgba(0,212,255,.06);border:1px solid rgba(0,212,255,.3);border-radius:2px;padding:6px 14px;font-family:var(--display);font-size:18px;letter-spacing:.3em;color:var(--c);outline:none;text-align:center;width:240px;" placeholder="YOUR NAME" onkeydown="if(event.key==='Enter')welcomeSetName()"/>
        <button onclick="welcomeSetName()" style="background:rgba(0,212,255,.1);border:1px solid rgba(0,212,255,.4);border-radius:2px;padding:6px 14px;font-family:var(--display);font-size:11px;letter-spacing:.15em;color:var(--c);cursor:pointer;">ENTER →</button>
      </div>`;
      setTimeout(()=>document.getElementById('welcome-name-input')?.focus(),300);
    }
  } else {
    if(nameEl)nameEl.textContent=username.toUpperCase()+', VISIONARY';
  }

  // Animate cards in
  setTimeout(()=>{
    document.querySelectorAll('#welcome-mode-grid .mode-card, #wm-all').forEach((c,i)=>{
      c.style.opacity='0';c.style.transform='translateY(20px)';c.style.transition='all 0.4s ease '+(i*0.1)+'s';
      setTimeout(()=>{c.style.opacity='1';c.style.transform='none';},50);
    });
  },200);
  JAA.log('welcome:shown',{username:username||'new_user'},_loginSessionUUID,'INFO');
}

function welcomeSetName(){
  const inp=document.getElementById('welcome-name-input');
  const name=(inp?.value||'').trim();
  if(!name)return;
  localStorage.setItem('nx6_username',name);
  const u=$('opt-username');if(u)u.value=name;
  const nameEl=$('welcome-name');
  if(nameEl)nameEl.textContent=name.toUpperCase()+', VISIONARY';
  JAA.log('welcome:name_set',{name},_loginSessionUUID,'OK');
  toast('Welcome, '+name+'!','ok');
}

function welcomeSelectMode(mode){
  cancelAnimationFrame(_welcomeCanvasFrame);
  localStorage.setItem('nx6_selected_mode',mode);
  $('welcome-overlay').style.display='none';
  if(mode==='void'){openVoid();return;}
  if(mode==='all'){
    // Show full NEXUS — no restriction
    showModeSelect('all');
  } else if(mode==='script'){
    showModeSelect('script');
  } else if(mode==='systems'){
    showModeSelect('systems');
  }
  JAA.log('welcome:mode_selected',{mode},_loginSessionUUID,'INFO');
}

/* ─── MODE SELECT ─────────────────────────────────────────────── */
let _modeCanvasFrame=null;

function modeSelectInitCanvas(){
  const c=$('mode-canvas');if(!c)return;
  const ctx=c.getContext('2d');c.width=window.innerWidth;c.height=window.innerHeight;
  let t=0;
  function draw(){
    if(!$('mode-select-overlay')||$('mode-select-overlay').style.display==='none')return;
    t+=.003;ctx.fillStyle='rgba(5,8,15,.12)';ctx.fillRect(0,0,c.width,c.height);
    for(let i=0;i<3;i++){
      const x=c.width*(0.25+i*0.25+0.05*Math.sin(t+i));
      const y=c.height*(0.4+0.1*Math.cos(t*.7+i));
      const g=ctx.createRadialGradient(x,y,0,x,y,c.width*.25);
      const hue=i===0?195:i===1?280:45;
      g.addColorStop(0,`hsla(${hue},100%,60%,0.04)`);
      g.addColorStop(1,'transparent');
      ctx.fillStyle=g;ctx.fillRect(0,0,c.width,c.height);
    }
    _modeCanvasFrame=requestAnimationFrame(draw);
  }
  draw();
}

const MODE_ACTIONS={
  script:[
    {label:'BUILD SOMETHING NEW',icon:'⟁',color:'var(--c)',desc:'Script Builder — SISO-gated from vision to working code',action:()=>{switchTab('builder');sbSwitchSub('script',document.querySelector('[data-sbt="script"]'));}},
    {label:'EXPAND CURRENT PROJECT',icon:'↻',color:'var(--g)',desc:'Load project → inject all UUIDs, metadata, context into every tab',action:()=>{switchTab('projects');}},
  ],
  systems:[
    {label:'BUILD A NEW UNIVERSE',icon:'⬡',color:'var(--c)',desc:'Systems Builder wizard — architecture, modules, SISO pipeline',action:()=>{wizOpen();}},
    {label:'EXPAND MY UNIVERSE',icon:'⊕',color:'var(--g)',desc:'Load existing system → manage clusters, synthesize, integrate',action:()=>{switchTab('projects');}},
    {label:'ENTER THE SPATIAL VOID',icon:'∞',color:'var(--m)',desc:'Ideation, sparring, synthesis, creative methods',action:()=>{openVoid();}},
  ],
  all:[
    {label:'BUILD SOMETHING NEW',icon:'⟁',color:'var(--c)',desc:'Script Builder — fast, SISO-gated',action:()=>{switchTab('builder');sbSwitchSub('script',document.querySelector('[data-sbt="script"]'));}},
    {label:'BUILD A NEW UNIVERSE',icon:'⬡',color:'var(--g)',desc:'Systems Builder wizard — full architecture flow',action:()=>{wizOpen();}},
    {label:'ENTER THE SPATIAL VOID',icon:'∞',color:'var(--m)',desc:'Creative lab, AI sparring, synthesis, flow',action:()=>{openVoid();}},
    {label:'LOAD EXISTING PROJECT',icon:'◈',color:'var(--y)',desc:'Open a saved project with full UUID context',action:()=>{switchTab('projects');}},
  ]
};

function showModeSelect(mode){
  const overlay=$('mode-select-overlay');if(!overlay)return;
  overlay.style.display='flex';
  modeSelectInitCanvas();
  const grid=$('mode-action-grid');if(!grid)return;
  const greeting=$('mode-select-greeting');
  if(greeting)greeting.textContent=mode==='script'?'WHAT ARE WE BUILDING?':mode==='systems'?'WHAT UNIVERSE AWAITS?':'FULL SPECTRUM — CHOOSE YOUR PATH';
  const actions=MODE_ACTIONS[mode]||MODE_ACTIONS.all;
  const cols=actions.length===4?'repeat(2,1fr)':'repeat('+Math.min(actions.length,3)+',1fr)';
  grid.style.gridTemplateColumns=cols;
  grid.innerHTML='';
  actions.forEach((a,i)=>{
    const d=document.createElement('div');
    d.style.cssText='background:var(--bg1);border:1px solid var(--border2);border-radius:3px;padding:20px;cursor:pointer;transition:all .25s;display:flex;flex-direction:column;gap:8px;opacity:0;transform:translateY(14px);';
    d.innerHTML=`<div style="font-size:28px;color:${a.color}">${a.icon}</div><div style="font-family:var(--display);font-size:14px;letter-spacing:.16em;color:${a.color}">${a.label}</div><div style="font-size:10px;color:var(--text3);line-height:1.6">${a.desc}</div>`;
    d.onmouseenter=()=>{d.style.borderColor=a.color.replace(/var\(|\)/g,'');d.style.transform='translateY(-2px)';};
    d.onmouseleave=()=>{d.style.borderColor='var(--border2)';d.style.transform='none';};
    d.onclick=()=>{
      cancelAnimationFrame(_modeCanvasFrame);
      overlay.style.display='none';
      a.action();
      JAA.log('mode:action',{mode,label:a.label},_loginSessionUUID,'INFO');
    };
    grid.appendChild(d);
    setTimeout(()=>{d.style.transition='all .35s ease '+(i*0.08)+'s';d.style.opacity='1';d.style.transform='none';},60);
  });
}

function modeSelectBack(){
  cancelAnimationFrame(_modeCanvasFrame);
  $('mode-select-overlay').style.display='none';
  showWelcomeScreen();
}

/* ─── LOGIN FLOW BOOT ─────────────────────────────────────────── */
function bootLoginFlow(){
  _loginSessionUUID=UUID.gen('session',{boot:true});
  const o=$('ai-login-overlay');
  if(!o) return;

  // Always show the provider picker — let user confirm their AI each session
  // (Skip is still available via buttons if they don't want to pick)
  const lastProvider= localStorage.getItem('nx6_last_provider');
  o.style.display='flex';
  loginInitCanvas();
  loginRenderProviders();
  if(lastProvider) _loginSelectedProvider=lastProvider;
  // Start bridge check immediately
  loginCheckBridge();

  const manualBtn=$('login-manual-btn');
  if(manualBtn) manualBtn.style.display='';
}
function showLoginFlow(){
  // Axiom: nothing blocks the user. Just open OPTIONS > AI SETTINGS.
  // The full overlay is removed — toast + redirect is enough.
  const overlay=$('ai-login-overlay');
  if(overlay) overlay.style.display='none';
  localStorage.setItem('nx6_skip_login','true');
  if(typeof switchTab==='function') switchTab('options');
  setTimeout(()=>{
    if(typeof optSwitchTab==='function') optSwitchTab('ai', null);
  },150);
  if(typeof toast==='function') toast('Configure your AI here — Guardian mode needs no API keys','ok',5000);
}

function loginWireAgent(agentId) {
  localStorage.setItem('p5g_wiring_agent', agentId);
  localStorage.setItem('p5g_wiring_type', 'input');
  // Launch the automated Guardian Wiring Wizard — no toast spam
  if (typeof guardianWireWizardOpen === 'function') {
    guardianWireWizardOpen(agentId);
  } else {
    // Fallback if wizard not loaded yet
    if (typeof toast === 'function') toast('Guardian wizard loading — try again in a moment', 'warn', 3000);
  }
}

function loginGoOptions(){
  const o=$('ai-login-overlay');
  if(o) o.style.display='none';
  localStorage.setItem('nx6_skip_login','true');
  log_ev('login:go-options',{},'INFO');
  UUID.gen('action',{action:'login:go-options'},'login:options');
  switchTab('options');
  // Open AI provider accordion
  setTimeout(()=>{
    const acc=document.getElementById('acc-ai');
    if(acc&&!acc.classList.contains('open')){
      acc.classList.add('open');
      const body=acc.querySelector('.acc-body');if(body)body.style.display='';
      const chev=acc.querySelector('.acc-chevron');if(chev)chev.textContent='▾';
    }
  },200);
  toast('Set your API key here — no bridge required','ok',5000);
}

function loginRemember(){
  localStorage.setItem('nx6_last_provider',_loginSelectedProvider||'chatgpt');
  const o=$('ai-login-overlay');
  if(o) o.style.display='none';
  cancelAnimationFrame(_loginCanvasFrame);
  log_ev('login:remembered',{provider:_loginSelectedProvider},'INFO');
  switchTab('home');
  toast('Session remembered — won\'t ask again until cleared','ok');
}

function openVoid(){
  $('void-overlay').classList.add('open');
  voidInitCanvas();
  voidSwitchMode('explore',document.getElementById('vmt-explore'));
}
function voidClose(){$('void-overlay').classList.remove('open');}

function voidSwitchMode(mode,btn){
  ['explore','flow','spar','ground'].forEach(m=>{
    const p=$('void-panel-'+m);if(p)p.style.display=m===mode?'flex':'none';
  });
  document.querySelectorAll('#void-mode-tabs .void-btn').forEach(b=>{
    b.style.borderColor='rgba(0,212,255,.15)';b.style.color='rgba(0,212,255,.4)';
    delete b.dataset.active;
  });
  if(btn){btn.style.borderColor='rgba(0,212,255,.5)';btn.style.color='var(--c)';btn.dataset.active='true';}
}

function voidAddMsg(containerId,role,text){
  const c=$(containerId);if(!c)return;
  const d=document.createElement('div');d.className='void-msg '+role;
  d.innerHTML=text.replace(/\n/g,'<br>');
  c.appendChild(d);scrollBot(c);
}

function voidInspire(){
  const projs=getProjects();
  const projList=projs.length?projs.slice(0,5).map(p=>`• ${p.name} — built on ${new Date(p.created_at||Date.now()).toLocaleDateString()}`).join('\n'):'No projects yet — this will be the first.';
  voidAddMsg('void-conversation','user','Give me inspiration for what to build next.');
  const msgs=[
    {role:'system',content:`You are the NEXUS Inspiration Engine — a visionary who sees what others can't. You know these existing projects:\n${projList}\n\nYour job: spark creativity, show the user why their work matters, identify the next high-leverage move. Be genuinely inspiring, not generic. Reference their actual work.`},
    {role:'user',content:`My projects so far:\n${projList}\n\nInspire me. What should I build next? What patterns do you see in my work? What would amplify everything?`}
  ];
  voidAICall(msgs,'void-conversation');
}

async function voidFlowRitual(type){
  const output=$('void-flow-output');if(output)output.style.display='';
  const rituals={
    breathe:`BREATHWORK GUIDE — 4-7-8 Method\n\n1. Exhale completely through your mouth\n2. Close your mouth and inhale through your nose for 4 counts\n3. Hold your breath for 7 counts\n4. Exhale completely through your mouth for 8 counts\n\nRepeat 4 times. You are resetting your nervous system.\n\nAfter: sit in the silence for 30 seconds and let the first thought that comes be your build direction.`,
    inspire:null,
    scamper:null,
    constraints:null
  };
  if(type==='breathe'){
    if(output)output.textContent=rituals.breathe;
    return;
  }
  const prompts={
    inspire:`I need to get into creative flow for coding. Generate a SCAMPER analysis applied to software development. Give me 7 powerful questions I can apply to my current project right now to find breakthrough features.`,
    scamper:`Apply the SCAMPER method specifically to software and system design. For each letter (Substitute, Combine, Adapt, Modify, Put to other uses, Eliminate, Reverse), give me 2 concrete examples of how this method generates novel technical solutions. Make it immediately actionable.`,
    constraints:`I'm experiencing creative constraints. Apply Constraint Inversion — take the top 5 most common development constraints (time, budget, complexity, performance, compatibility) and show me how each one, when inverted, becomes a unique design advantage. Be specific and creative.`
  };
  const msgs=[
    {role:'system',content:'You are a creative director and systems thinker. Generate powerful, actionable creative prompts for software builders. Be specific, high-leverage, immediately usable.'},
    {role:'user',content:prompts[type]||'Generate a creative flow exercise for a developer.'}
  ];
  if(output){output.textContent='Generating…';}
  try{
    abortCtrl=new AbortController();
    const r=await aiChat(msgs,{temperature:0.8,max_tokens:1500,stream:false});
    const text=r.stream?await readStream(r,()=>{}):r.text;
    if(output)output.textContent=text;
    JAA.log('void:flow_ritual',{type,chars:text.length},'','OK');
  }catch(e){if(output)output.textContent='Error: '+e.message;}
  finally{abortCtrl=null;}
}

async function voidSpar(){
  const input=$('void-spar-input');const text=input?.value.trim();if(!text)return;
  if(input)input.value='';
  voidAddMsg('void-spar-conversation','user',text);
  const msgs=[
    {role:'system',content:`You are NEXUS Sparring Partner — an adversarial AI whose job is to make ideas stronger by attacking them ruthlessly but constructively. When the user presents an idea, system, or assumption:\n1. Find the 3 most critical weaknesses\n2. Challenge each assumption\n3. Present a devil's advocate case\n4. Ask the one question that would make or break this idea\n\nBe direct, sharp, intellectually honest. Not mean — precise. Your goal is to make the idea bulletproof.`},
    {role:'user',content:text}
  ];
  voidAICall(msgs,'void-spar-conversation');
  JAA.log('void:spar',{idea:text.slice(0,100)},'','INFO');
}

async function voidSparStrength(){
  const conv=$('void-spar-conversation');
  const lastUserMsg=conv?.querySelector('.void-msg.user:last-of-type')?.textContent||'';
  if(!lastUserMsg){toast('State an idea first','warn');return;}
  const msgs=[
    {role:'system',content:'You are finding genuine strengths. Identify the 3-5 strongest elements of this idea. What is genuinely brilliant about it? What has the most leverage? What should be doubled down on?'},
    {role:'user',content:'Find the genuine strengths of: '+lastUserMsg}
  ];
  voidAICall(msgs,'void-spar-conversation');
}

async function voidSparSynth(){
  const conv=$('void-spar-conversation');
  const allText=Array.from(conv?.querySelectorAll('.void-msg')||[]).map(m=>m.textContent).join('\n\n');
  if(!allText){toast('Have a sparring session first','warn');return;}
  const msgs=[
    {role:'system',content:'You are synthesizing. After all this sparring, what is the refined, strengthened version of the core idea? What survived the attack? What needs to change? Give a clear, actionable synthesis.'},
    {role:'user',content:'Synthesize this sparring session:\n\n'+allText.slice(0,3000)}
  ];
  voidAddMsg('void-spar-conversation','user','SYNTHESIZE ↓');
  voidAICall(msgs,'void-spar-conversation');
}

async function voidGround(){
  const input=$('void-ground-input');const text=input?.value.trim();if(!text)return;
  if(input)input.value='';
  voidAddMsg('void-ground-conversation','user',text);
  const msgs=[
    {role:'system',content:`You are a technical realist — a senior engineer who has shipped production systems. When presented with a vision, you ground it in reality:\n1. What is technically possible TODAY with current hardware/software\n2. What are the real performance ceilings (CPU, RAM, network, storage)\n3. What will the implementation complexity actually look like\n4. What shortcuts or elegant solutions exist\n5. Estimated timeline for a solo developer\n\nBe honest but not discouraging. Find the path from vision to reality.`},
    {role:'user',content:'Ground this vision in technical reality: '+text}
  ];
  voidAICall(msgs,'void-ground-conversation');
  JAA.log('void:ground',{vision:text.slice(0,100)},'','INFO');
}

async function voidGroundTech(){
  const input=$('void-ground-input');const text=input?.value.trim()||'my current project';
  const msgs=[
    {role:'system',content:'You are a tech stack expert. Given a project description, recommend the optimal, modern tech stack with specific libraries, frameworks, and tools. Include: language, framework, database, deployment, key packages. Be opinionated and specific.'},
    {role:'user',content:'Recommend the optimal tech stack for: '+text}
  ];
  voidAddMsg('void-ground-conversation','user','TECH STACK for: '+text.slice(0,50));
  voidAICall(msgs,'void-ground-conversation');
}

async function voidAICall(msgs,containerId){
  const loadingDiv=document.createElement('div');
  loadingDiv.className='void-msg ai';loadingDiv.textContent='…';
  const c=$(containerId);if(c)c.appendChild(loadingDiv);
  try{
    abortCtrl=new AbortController();
    const r=await aiChat(msgs,{temperature:0.75,max_tokens:2000,stream:false});
    const text=r.stream?await readStream(r,()=>{}):r.text;
    loadingDiv.innerHTML=text.replace(/\n/g,'<br>');
    if(c)scrollBot(c);
  }catch(e){loadingDiv.textContent='Error: '+e.message;loadingDiv.style.color='var(--r)';}
  finally{abortCtrl=null;}
}

function voidInitCanvas(){
  const canvas=$('void-canvas');if(!canvas)return;
  const ctx=canvas.getContext('2d');canvas.width=window.innerWidth;canvas.height=window.innerHeight;
  const stars=[];for(let i=0;i<200;i++)stars.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,r:Math.random()*1.5+.2,a:Math.random(),speed:Math.random()*.002+.001});
  function draw(){
    ctx.fillStyle='rgba(3,5,8,.15)';ctx.fillRect(0,0,canvas.width,canvas.height);
    stars.forEach(s=>{s.a+=s.speed;ctx.fillStyle=`rgba(0,212,255,${.1+Math.sin(s.a)*.15})`;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();});
    if($('void-overlay').classList.contains('open'))requestAnimationFrame(draw);
  }
  draw();
}
async function voidSend(){
  const input=$('void-input');const text=input.value.trim();if(!text)return;input.value='';
  const conv=$('void-conversation');
  const um=document.createElement('div');um.className='void-msg user';um.textContent=text;conv.appendChild(um);scrollBot(conv);
  _voidHistory.push({role:'user',content:text});
  const am=document.createElement('div');am.className='void-msg ai';am.textContent='…';conv.appendChild(am);scrollBot(conv);
  try{
    abortCtrl=new AbortController();
    const result=await aiChat([{role:'system',content:'You are the creative consciousness of NEXUS — The Void. Help users externalize vision, explore ideas, spark creation. Be poetic but precise. Ask probing questions. Help them arrive at a clear, compelling vision.'},..._voidHistory],{temperature:0.85,max_tokens:1024});
    let full='';
    if(result.stream)full=await readStream(result,(c,all)=>{am.textContent=all;scrollBot(conv);});
    else{full=result.text;am.textContent=full;}
    _voidHistory.push({role:'assistant',content:full});
    logIdea('idea',full.slice(0,500));
  }catch(e){am.textContent='[Error: '+e.message+']';}
  finally{abortCtrl=null;}
}
function voidExport(){
  if(!_voidHistory.length){alert('Nothing to export.');return;}
  const summary=_voidHistory.map(m=>`${m.role}: ${m.content}`).join('\n\n');
  setVal('sb-endstate','Vision from The Void');$('sb-output').textContent='// From The Void:\n\n'+summary;_generatedCode=summary;
  voidClose();switchTab('builder');
}

/* ─── WIZARD ──────────────────────────────────────────────────── */
const WIZ={step:0,total:6,data:{audience:null,intention:null,interfaces:[],architecture:null,creativity:null}};
function wizOpen(){$('wizard-overlay').classList.add('open');WIZ.step=0;wizRender();wizInitCanvas();}
function wizClose(){$('wizard-overlay').classList.remove('open');}
function wizRender(){
  document.querySelectorAll('.wiz-slide').forEach(s=>s.classList.toggle('active',parseInt(s.dataset.step)===WIZ.step));
  const dots=$('wiz-dots');dots.innerHTML='';
  for(let i=0;i<WIZ.total;i++){const d=document.createElement('div');d.className='wiz-dot'+(i<WIZ.step?' done':'')+(i===WIZ.step?' active':'');dots.appendChild(d);}
}
function wizNext(){if(WIZ.step===1&&WIZ.data.intention==='void'){wizClose();openVoid();return;}if(WIZ.step<WIZ.total-1){WIZ.step++;wizRender();}}
function wizPrev(){if(WIZ.step>0){WIZ.step--;wizRender();}}
function wizSelect(el,step){
  el.parentElement.querySelectorAll('.wiz-opt').forEach(o=>o.classList.remove('selected'));el.classList.add('selected');
  const v=el.dataset.val;
  if(step===0){WIZ.data.audience=v;$('wiz-client-qs').classList.toggle('show',v==='client');}
  if(step===1){WIZ.data.intention=v;$('wiz-intention-input').style.display=(v==='new'||v==='update')?'':'none';}
  if(step===3)WIZ.data.architecture=v;
  if(step===4)WIZ.data.creativity=v;
}
function wizToggle(el){el.classList.toggle('on');}
function wizFinish(){
  document.querySelectorAll('.wiz-data').forEach(el=>{if(el.dataset.key&&el.value.trim())WIZ.data[el.dataset.key]=el.value.trim();});
  WIZ.data.interfaces=[];document.querySelectorAll('.wiz-slide[data-step="2"] .wiz-check.on').forEach(c=>WIZ.data.interfaces.push(c.dataset.val));
  WIZ.data.constraints=[];document.querySelectorAll('.wiz-slide[data-step="5"] .wiz-check.on').forEach(c=>WIZ.data.constraints.push(c.dataset.val));
  wizClose();

  // Build rich end-state string
  let endState='';
  if(WIZ.data.audience==='client'&&WIZ.data.clientName)endState+=`For ${WIZ.data.clientName}: `;
  if(WIZ.data.intention==='update')endState+='Update/Fix: ';
  endState+=WIZ.data.clientRequest||WIZ.data.intention||'';
  if(WIZ.data.interfaceDesc)endState+=' — '+WIZ.data.interfaceDesc;
  if(WIZ.data.intention)endState=endState.trim();

  // Set builder fields
  setVal('sb-endstate',endState.trim());

  // Set output type based on wizard data
  const ifaces=WIZ.data.interfaces||[];
  if(ifaces.includes('desktop'))setVal('sb-output-type','electron');
  else if(ifaces.includes('api'))setVal('sb-output-type','api');
  else if(ifaces.includes('cli'))setVal('sb-output-type','cli');
  else if(ifaces.includes('browser'))setVal('sb-output-type','dashboard');

  // Populate SISO modules from features if available
  const featText=WIZ.data.features||WIZ.data.additionalContext||'';
  if(featText&&WIZ.data.architecture==='modular'){
    const features=featText.split('\n').filter(Boolean).map(f=>f.replace(/^[-•*]\s*/,'').toLowerCase().replace(/\s+/g,'-'));
    if(features.length>0)setVal('siso-modules',features.join('\n'));
  }

  // Set SISO architecture
  if(WIZ.data.architecture)setVal('siso-arch',WIZ.data.architecture==='modular'?'Node.js + Modular Architecture':WIZ.data.architecture==='grouped'?'HTML/CSS/JS — Grouped':'Single-file');

  // Log to Jaa
  const projUUID=UUID.gen('wizard-project',{endState:endState.slice(0,60),audience:WIZ.data.audience});
  JAA.log('wizard:complete',{...WIZ.data,projUUID,endState:endState.slice(0,100)},projUUID,'OK');
  DELTA.record(projUUID,'wizard_complete',0,endState.length,{audience:WIZ.data.audience,architecture:WIZ.data.architecture});

  // Route to appropriate builder mode
  switchTab('builder');
  if(WIZ.data.architecture==='modular'){
    // Systems mode → SISO gated
    sbSwitchSub('gated',document.querySelector('[data-sbt="gated"]'));
    sisoInitUI();
    toast('Systems build configured — review modules then click BUILD ALL GATES','ok',4000);
  } else {
    // Script mode → quick build
    sbSwitchSub('script',document.querySelector('[data-sbt="script"]'));
  }
  log_ev('wizard:complete',WIZ.data);
}
function wizInitCanvas(){
  const canvas=$('wiz-canvas');if(!canvas)return;
  const ctx=canvas.getContext('2d');canvas.width=window.innerWidth;canvas.height=window.innerHeight;
  const pts=[];for(let i=0;i<60;i++)pts.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,r:Math.random()*2+.5});
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='rgba(0,212,255,.4)';
    pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>canvas.width)p.vx*=-1;if(p.y<0||p.y>canvas.height)p.vy*=-1;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();});
    ctx.strokeStyle='rgba(0,212,255,.06)';ctx.lineWidth=.5;
    for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y;if(dx*dx+dy*dy<15000){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.stroke();}}
    if($('wizard-overlay').classList.contains('open'))requestAnimationFrame(draw);
  }
  draw();
}

/* ─── OPTIONS ─────────────────────────────────────────────────── */
function onProviderChange(){
  const p=val('opt-ai-provider');AI.provider=p;
  ['chatgpt','claude','ollama','lmstudio'].forEach(pr=>{
    const sec=$('provider-'+pr);if(sec)sec.style.display=pr===p?'':'none';
  });
  const label=p==='chatgpt'?'CHATGPT':p==='claude'?'CLAUDE':p==='ollama'?'OLLAMA':'LM STUDIO';
  if($('active-model-badge'))$('active-model-badge').textContent=label;
  if($('console-model-badge'))$('console-model-badge').textContent=label;
  if($('hm-provider'))$('hm-provider').textContent=label;
  log_ev('provider:change',{provider:p});
}
function toggleFallback(){
  AI.fallbackEnabled=$('opt-fallback-toggle')?.classList.contains('on');
  const fb=$('opt-fallback-provider');if(fb)fb.style.display=AI.fallbackEnabled?'':'none';
}

async function testChatGPT(){
  const st=$('status-chatgpt');if(st){st.textContent='Testing…';st.dataset.ok='warn';}
  try{
    const key=val('opt-chatgpt-key');if(!key)throw new Error('No API key set');
    const base=val('opt-chatgpt-url')||'https://api.openai.com/v1';
    const r=await fetch(`${base}/models`,{headers:{'Authorization':'Bearer '+key}});
    if(r.ok){if(st){st.textContent='✓ Connected to OpenAI API';st.dataset.ok='true';}setPill('pill-ai','ok','CHATGPT');}
    else{const e=await r.json();throw new Error(e.error?.message||'HTTP '+r.status);}
  }catch(e){if(st){st.textContent='✗ '+e.message;st.dataset.ok='false';}}
}
async function testClaude(){
  const st=$('status-claude');if(st){st.textContent='Testing…';st.dataset.ok='warn';}
  try{
    const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':val('opt-claude-key'),'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify({model:val('opt-claude-model')||'claude-sonnet-4-20250514',max_tokens:10,messages:[{role:'user',content:'ping'}]})});
    if(r.ok){if(st){st.textContent='✓ Connected to Claude API';st.dataset.ok='true';}setPill('pill-ai','ok','CLAUDE');}
    else{const e=await r.text();throw new Error(e.slice(0,120));}
  }catch(e){if(st){st.textContent='✗ '+e.message;st.dataset.ok='false';}}
}
async function testOllama(){
  const st=$('status-ollama');if(st){st.textContent='Testing…';st.dataset.ok='warn';}
  try{const r=await fetch((val('opt-ollama-url')||'http://localhost:11434')+'/api/tags');if(r.ok){if(st){st.textContent='✓ Ollama online';st.dataset.ok='true';}}else throw new Error('HTTP '+r.status);}
  catch(e){if(st){st.textContent='✗ '+e.message;st.dataset.ok='false';}}
}
async function testLMS(){
  const st=$('status-lms');if(st){st.textContent='Testing…';st.dataset.ok='warn';}
  try{const r=await fetch((val('opt-lms-url')||'http://localhost:1234')+'/v1/models');if(r.ok){if(st){st.textContent='✓ LM Studio online';st.dataset.ok='true';}}else throw new Error('HTTP '+r.status);}
  catch(e){if(st){st.textContent='✗ '+e.message;st.dataset.ok='false';}}
}
async function ollamaRefreshModels(){
  try{const r=await fetch((val('opt-ollama-url')||'http://localhost:11434')+'/api/tags');const j=await r.json();const list=$('ollama-model-list');if(!list)return;list.innerHTML=(j.models||[]).map(m=>`<div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid var(--border);font-size:10px"><span style="flex:1;color:var(--text)">${esc(m.name)}</span><button class="btn" style="font-size:8px;padding:1px 6px" onclick="setVal('opt-ollama-model','${esc(m.name)}')">USE</button></div>`).join('');}
  catch(e){const list=$('ollama-model-list');if(list)list.innerHTML=`<div style="color:var(--r);font-size:10px">${esc(e.message)}</div>`;}
}

/* ─── AXIOMS ──────────────────────────────────────────────────── */
function renderAxioms(provider){
  const p=provider||AI.provider;const list=$(p+'-axioms');if(!list)return;
  const axioms=AI.axioms[p]||[];list.innerHTML='';
  axioms.forEach((ax,i)=>{
    const d=document.createElement('div');d.className='ai-axiom';
    d.innerHTML=`<span class="ai-axiom-num">${i+1}</span><textarea class="ai-axiom-text" rows="1" spellcheck="false">${esc(ax.text)}</textarea><button class="ai-axiom-del" onclick="removeAxiom('${p}','${ax.id}')">×</button>`;
    const ta=d.querySelector('.ai-axiom-text');ta.addEventListener('input',e=>{ax.text=e.target.value;ta.style.height='auto';ta.style.height=ta.scrollHeight+'px';});
    setTimeout(()=>{ta.style.height='auto';ta.style.height=ta.scrollHeight+'px';},0);
    list.appendChild(d);
  });
}
function addAxiom(p){if(!AI.axioms[p])AI.axioms[p]=[];AI.axioms[p].push({id:uid(),text:''});renderAxioms(p);}
function removeAxiom(p,id){AI.axioms[p]=AI.axioms[p].filter(a=>a.id!==id);renderAxioms(p);}

/* ─── CONFIG PERSISTENCE ──────────────────────────────────────── */
function saveConfig(){
  const cfg={provider:AI.provider,fallbackEnabled:AI.fallbackEnabled,fallbackProvider:val('opt-fallback-provider'),
    chatgptKey:val('opt-chatgpt-key'),chatgptModel:val('opt-chatgpt-model'),chatgptUrl:val('opt-chatgpt-url'),
    claudeKey:val('opt-claude-key'),claudeModel:val('opt-claude-model'),claudeMaxTokens:val('opt-claude-maxtokens'),
    ollamaUrl:val('opt-ollama-url'),ollamaModel:val('opt-ollama-model'),
    lmsUrl:val('opt-lms-url'),lmsKey:val('opt-lms-key'),lmsModel:val('opt-lms-model'),
    axioms:AI.axioms,ghToken:val('opt-gh-token'),ghRepo:val('opt-gh-repo'),ghBranch:val('opt-gh-branch'),
    pipeUrl:val('opt-pipe-url'),pipeLabel:val('opt-pipe-label')};
  localStorage.setItem('nx5_config',JSON.stringify(cfg));
  // Sync to nx6_cfg for startup interception compatibility (Phase 1 reads nx6_cfg)
  try {
    const nx6 = JSON.parse(localStorage.getItem('nx6_cfg')||'{}');
    const merged = Object.assign(nx6, {
      chatgptKey: cfg.chatgptKey, claudeKey: cfg.claudeKey,
      deepseekKey: cfg.deepseekKey, geminiKey: cfg.geminiKey,
      ollamaUrl: cfg.ollamaUrl, ollamaModel: cfg.ollamaModel,
      userName: cfg.userName, partnerName: cfg.partnerName,
      bridgeUrl: cfg.bridgeUrl, bridgeApiKey: cfg.bridgeApiKey,
      defaultProvider: cfg.provider || 'chatgpt',
    });
    localStorage.setItem('nx6_cfg', JSON.stringify(merged));
  } catch {}
  const btn=$('save-btn');if(btn){btn.textContent='✓ SAVED';setTimeout(()=>btn.textContent='SAVE CONFIGURATION',2000);}
  log_ev('config:saved',{provider:cfg.provider});toast('Config saved','ok');
}
function loadConfig(){
  try{
    const nx5 = JSON.parse(localStorage.getItem('nx5_config') || 'null');
    const nx6raw = JSON.parse(localStorage.getItem('nx6_cfg') || 'null');
    const cfg = nx5 || nx6raw;
    if(!cfg){
      // Fresh install — probe all providers, use first responder
      AI.provider = localStorage.getItem('nx6_last_provider') || '';
      onProviderChange();
      ['chatgpt','claude','ollama','lmstudio'].forEach(p=>renderAxioms(p));
      setTimeout(aiProbeAll, 1200); // probe after UI settles
      return;
    }
    AI.provider = cfg.provider || cfg.defaultProvider || localStorage.getItem('nx6_last_provider') || 'chatgpt';AI.fallbackEnabled=cfg.fallbackEnabled||false;
    setVal('opt-ai-provider',AI.provider);
    if(cfg.chatgptKey)setVal('opt-chatgpt-key',cfg.chatgptKey);
    if(cfg.chatgptModel)setVal('opt-chatgpt-model',cfg.chatgptModel);
    if(cfg.chatgptUrl)setVal('opt-chatgpt-url',cfg.chatgptUrl);
    if(cfg.claudeKey)setVal('opt-claude-key',cfg.claudeKey);
    if(cfg.claudeModel)setVal('opt-claude-model',cfg.claudeModel);
    if(cfg.claudeMaxTokens)setVal('opt-claude-maxtokens',cfg.claudeMaxTokens);
    if(cfg.ollamaUrl)setVal('opt-ollama-url',cfg.ollamaUrl);
    if(cfg.ollamaModel)setVal('opt-ollama-model',cfg.ollamaModel);
    if(cfg.lmsUrl)setVal('opt-lms-url',cfg.lmsUrl);
    if(cfg.lmsKey)setVal('opt-lms-key',cfg.lmsKey);
    if(cfg.lmsModel)setVal('opt-lms-model',cfg.lmsModel);
    if(cfg.fallbackProvider)setVal('opt-fallback-provider',cfg.fallbackProvider);
    if(cfg.axioms)AI.axioms=cfg.axioms;
    if(cfg.ghToken)setVal('opt-gh-token',cfg.ghToken);
    if(cfg.ghRepo)setVal('opt-gh-repo',cfg.ghRepo);
    if(cfg.ghBranch)setVal('opt-gh-branch',cfg.ghBranch);
    if(cfg.pipeUrl)setVal('opt-pipe-url',cfg.pipeUrl);
    if(cfg.pipeLabel)setVal('opt-pipe-label',cfg.pipeLabel);
    if(cfg.ghToken)GH.token=cfg.ghToken;
    if(cfg.ghRepo)GH.repo=cfg.ghRepo;
    if(cfg.ghBranch)GH.branch=cfg.ghBranch||'main';
    if(AI.fallbackEnabled)$('opt-fallback-toggle')?.classList.add('on');
    onProviderChange();
    ['chatgpt','claude','ollama','lmstudio'].forEach(p=>renderAxioms(p));
  }catch(e){onProviderChange();}
  try{
    const p=JSON.parse(localStorage.getItem('nx5_pipe'));
    if(p&&p.active){Object.assign(PIPE,p);updatePipeUI();setVal('opt-pipe-url',PIPE.url);setVal('opt-pipe-label',PIPE.label);}
  }catch{}
}

/* ─── LOG SYSTEM ──────────────────────────────────────────────── */
const logBody=$('log-body');
S.on(event=>{
  const fv=(val('log-filter')||'').toLowerCase();const lv=val('log-level')||'ALL';
  if(lv!=='ALL'&&event.level!==lv)return;
  if(fv&&!JSON.stringify(event).toLowerCase().includes(fv))return;
  const row=document.createElement('div');row.className='lrr';row.dataset.lv=event.level;
  const d=new Date(event.time);const ds=event.data?JSON.stringify(event.data).slice(0,120):'';
  const lc=event.level==='ERROR'?'var(--r)':event.level==='WARN'?'var(--y)':event.level==='LLM'?'var(--o)':event.level==='JAA'?'var(--m)':'var(--text)';
  row.innerHTML=`<span style="color:var(--text3);font-style:italic">${d.toTimeString().slice(0,8)}</span><span style="color:var(--text4);text-align:right">#${event.seq}</span><span style="color:${lc}">${esc(event.type)}</span><span style="color:var(--c3)">${esc(event.data?.provider||'—')}</span><span style="color:var(--text3);word-break:break-all">${esc(ds)}</span>`;
  if(logBody){logBody.appendChild(row);scrollBot(logBody);}
  if($('log-count'))$('log-count').textContent=S.count()+' entries';
});
function logFilterChange(){}
function logExport(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(_NX_LOG,null,2)],{type:'application/json'}));a.download='nexus-log-'+Date.now()+'.json';a.click();}
function logClear(){if(logBody)logBody.innerHTML='';_NX_LOG.length=0;}

/* ─── LOG TAB SWITCHER ─────────────────────────────────────────── */
function logSwitchTab(name,btn){
  document.querySelectorAll('[data-ltab-panel]').forEach(p=>{p.style.display='none';});
  document.querySelectorAll('[data-ltab]').forEach(b=>b.removeAttribute('data-active'));
  const panel=$('log-sub-'+name);if(panel)panel.style.display='flex';
  if(btn)btn.dataset.active='true';
  if(name==='jaa')jaaRender();
  if(name==='uuids')uuidRender();
  if(name==='deltas')deltaRender();
}

/* ─── JAA LOG VIEWER ──────────────────────────────────────────── */
function jaaRender(){
  const body=$('jaa-log-body');if(!body)return;
  const typeFilter=val('jaa-filter-type');
  const levelFilter=val('jaa-filter-level');
  const search=(val('jaa-search')||'').toLowerCase();
  let entries=JAA.getAll();
  if(typeFilter)entries=entries.filter(e=>e.type===typeFilter);
  if(levelFilter)entries=entries.filter(e=>e.level===levelFilter);
  if(search)entries=entries.filter(e=>JSON.stringify(e).toLowerCase().includes(search));
  if($('jaa-count'))$('jaa-count').textContent=entries.length+' entries';
  body.innerHTML='';
  entries.slice(-200).reverse().forEach(e=>{
    const d=document.createElement('div');
    d.style.cssText='display:grid;grid-template-columns:120px 60px 80px 140px 1fr;gap:8px;padding:3px 0;border-bottom:1px solid rgba(26,42,64,.2);font-size:9px;align-items:start;';
    const lc=e.level==='ERROR'?'var(--r)':e.level==='WARN'?'var(--y)':e.level==='OK'?'var(--g)':'var(--c)';
    const dataStr=typeof e.data==='object'?JSON.stringify(e.data).slice(0,160):String(e.data||'').slice(0,160);
    d.innerHTML=`<span style="color:var(--text3)">${e.ts?e.ts.slice(11,23):'—'}</span><span style="color:${lc}">${e.level||'—'}</span><span style="color:var(--c);word-break:break-all">${esc(e.type||'—')}</span><span style="color:var(--text3);font-family:var(--mono);font-size:8px">${esc((e.sessionId||'').slice(0,20))}</span><span style="color:var(--text2);word-break:break-all">${esc(dataStr)}</span>`;
    body.appendChild(d);
  });
  if(!entries.length)body.innerHTML='<div style="padding:12px;font-size:10px;color:var(--text3);font-style:italic">No Jaa entries yet. Run a build to populate the log.</div>';
}

function jaaExport(){
  const all=JAA.getAll();
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([JSON.stringify(all,null,2)],{type:'application/json'}));
  a.download='nexus-jaa-log-'+Date.now()+'.json';a.click();
}

function jaaConfirmClear(){
  if(!confirm('Clear ALL Jaa persistent logs? This cannot be undone.'))return;
  JAA.clear();jaaRender();toast('Jaa log cleared','warn');
}

/* ─── UUID REGISTRY VIEWER — delegated to new system above ─── */

/* ─── DELTA VIEWER ─────────────────────────────────────────────── */
function deltaRender(){
  const body=$('delta-body');if(!body)return;
  const all=DELTA.getAll();
  if($('delta-count'))$('delta-count').textContent=all.length+' deltas';
  body.innerHTML='';
  all.slice().reverse().slice(0,200).forEach(d=>{
    const el=document.createElement('div');
    el.style.cssText='background:var(--bg1);border:1px solid var(--border2);border-radius:2px;padding:8px 12px;display:flex;align-items:center;gap:10px;font-size:10px;';
    const deltaStr=typeof d.delta==='object'?JSON.stringify(d.delta):(d.delta>0?'+'+d.delta:String(d.delta));
    const dColor=typeof d.delta==='number'?(d.delta>0?'var(--g)':'var(--r)'):'var(--c)';
    el.innerHTML=`<span style="color:var(--text3);flex-shrink:0;font-size:9px">${d.ts?d.ts.slice(0,16):''}</span><span style="color:var(--c);font-family:var(--display);font-size:11px;min-width:80px">${esc(d.type||'—')}</span><span style="color:var(--text3);flex:1;font-size:9px;font-family:var(--mono)">${esc((d.projectId||'').slice(0,24))}</span><span style="color:${dColor};font-family:var(--display);font-size:12px">${esc(deltaStr)}</span>`;
    body.appendChild(el);
  });
  if(!all.length)body.innerHTML='<div style="padding:12px;font-size:10px;color:var(--text3);font-style:italic">No deltas tracked yet. Deltas are recorded on each build and gate completion.</div>';
}

function deltaExport(){
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([JSON.stringify(DELTA.getAll(),null,2)],{type:'application/json'}));
  a.download='nexus-deltas-'+Date.now()+'.json';a.click();
}

/* ─── HOME DROP ZONE ──────────────────────────────────────────── */
function homeDropOver(e){
  e.preventDefault();
  const dz=$('home-drop-zone');
  if(dz){dz.style.borderColor='var(--c)';dz.style.background='rgba(0,212,255,.04)';}
}
function homeDropLeave(e){
  const dz=$('home-drop-zone');
  if(dz){dz.style.borderColor='var(--border2)';dz.style.background='';}
}
function homeDrop(e){
  e.preventDefault();
  homeDropLeave(e);
  const files=Array.from(e.dataTransfer.files);
  if(files.length)processImportFiles(files);
}
function homeImportClick(){$('home-file-input')?.click();}
function homeFileSelected(e){processImportFiles(Array.from(e.target.files));e.target.value='';}

async function processImportFiles(files){
  let imported=0;
  for(const file of files){
    const name=file.name.toLowerCase();
    const reader=new FileReader();
    try{
      const content=await new Promise((res,rej)=>{reader.onload=e=>res(e.target.result);reader.onerror=rej;reader.readAsText(file);});
      if(name.endsWith('.json')){
        // Try as NEXUS project export
        try{
          const data=JSON.parse(content);
          if(data.name&&(data.code||data.content)){
            const projName=data.name||file.name.replace('.json','');
            saveNewProject(projName,data.code||data.content,data.description||'Imported from '+file.name);
            JAA.log('import:json_project',{name:projName,source:file.name},'','OK');
            toast('Imported project: '+projName,'ok');imported++;
            continue;
          }
          // Try as template
          if(data.uuid&&data.content&&data.name){
            const all=JSON.parse(localStorage.getItem('nx6_templates')||'[]');
            all.push(data);localStorage.setItem('nx6_templates',JSON.stringify(all));
            toast('Imported template: '+data.name,'ok');imported++;
            continue;
          }
        }catch{}
        // Generic JSON — import as project with stringified content
        saveNewProject(file.name.replace('.json',''),content,'Imported JSON file');
        imported++;
      } else if(name.endsWith('.html')||name.endsWith('.js')||name.endsWith('.py')||name.endsWith('.ts')||name.endsWith('.txt')){
        const projName=file.name.replace(/\.[^.]+$/,'');
        saveNewProject(projName,content,'Imported from '+file.name);
        JAA.log('import:code_file',{name:projName,size:content.length,type:name.split('.').pop()},'','OK');
        toast('Imported: '+projName,'ok');imported++;
      } else if(name.endsWith('.md')){
        // Markdown — could be Obsidian/Notion export
        const projName=file.name.replace('.md','');
        saveNewProject(projName,content,'Imported Markdown: '+file.name);
        toast('Imported markdown: '+projName,'ok');imported++;
      } else {
        toast('Unsupported file type: '+file.name,'warn');
      }
    }catch(e){toast('Import error for '+file.name+': '+e.message,'err');}
  }
  if(imported>0){renderRecentProjects();renderProjects();}
}

/* ─── USERNAME / PERSONALIZATION ─────────────────────────────── */
function setUsername(name){
  if(!name)return;
  localStorage.setItem('nx6_username',name.trim());
  toast('Username saved: '+name,'ok');
  JAA.log('system:username_set',{username:name},'','INFO');
}

function getUsername(){return localStorage.getItem('nx6_username')||'VISIONARY';}

/* ─── IDEA LOG SOFT POPUP ─────────────────────────────────────── */
const IDEA_PROMPTS=[
  'What do you like best about your current system?',
  'What\'s the best feature you\'ve built recently?',
  'What\'s one thing you\'d change if you could?',
  'How\'s the latest version working?',
  'What changed since your last build?',
  'What broke and needs fixing?',
  'What inspired your latest ideas?',
  'What feature would 10x this project?',
];
let _ideaPopupTimer=null;

function startIdeaPopupCycle(){
  // Show an idea prompt every 30 minutes of active use
  clearTimeout(_ideaPopupTimer);
  _ideaPopupTimer=setTimeout(()=>{
    if(document.body.dataset.loading==='true')return;
    showIdeaPopup(IDEA_PROMPTS[Math.floor(Math.random()*IDEA_PROMPTS.length)]);
    startIdeaPopupCycle();
  },30*60*1000);
}

function showIdeaPopup(question){
  const existing=$('idea-popup');if(existing)existing.remove();
  const d=document.createElement('div');d.id='idea-popup';
  d.style.cssText='position:fixed;bottom:60px;right:16px;z-index:800;background:var(--bg1);border:1px solid var(--border2);border-radius:3px;padding:14px 16px;max-width:300px;animation:wizFadeIn .3s ease;box-shadow:0 4px 20px rgba(0,0,0,.4);';
  d.innerHTML=`<div style="font-family:var(--display);font-size:10px;letter-spacing:.16em;color:var(--m);margin-bottom:8px;">⟁ QUICK LOG</div>
  <div style="font-size:11px;color:var(--text2);margin-bottom:10px;line-height:1.5">${esc(question)}</div>
  <textarea id="idea-popup-input" style="width:100%;background:var(--bg2);border:1px solid var(--border2);border-radius:2px;padding:6px 8px;font-family:var(--mono);font-size:10px;color:var(--text);outline:none;resize:none;min-height:60px;" placeholder="Your thoughts…"></textarea>
  <div style="display:flex;gap:6px;margin-top:8px;justify-content:flex-end;">
    <button class="btn" style="font-size:9px" onclick="this.closest('#idea-popup').remove()">SKIP</button>
    <button class="btn ok" style="font-size:9px" onclick="saveIdeaPopup('${esc(question)}')">LOG IDEA</button>
    <button class="btn accent" style="font-size:9px" onclick="saveIdeaPopupRoadmap('${esc(question)}')">+ ROADMAP</button>
  </div>`;
  document.body.appendChild(d);
}

function saveIdeaPopup(question){
  const text=document.getElementById('idea-popup-input')?.value.trim();
  if(text){
    logIdea('idea',text,'',{prompt:question});
    JAA.log('idea:logged',{question:question.slice(0,60),answer:text.slice(0,100)},'','INFO');
    toast('Idea logged to Jaa','ok');
  }
  document.getElementById('idea-popup')?.remove();
}

function saveIdeaPopupRoadmap(question){
  const text=document.getElementById('idea-popup-input')?.value.trim();
  if(text){
    saveIdeaPopup(question);
    // Add to roadmap backlog
    const item={id:uid(),title:text.slice(0,60),body:text,status:'backlog',created:new Date().toISOString(),delta:5,priority:'medium'};
    const items=JSON.parse(localStorage.getItem('nx5_roadmap')||'[]');
    items.push(item);localStorage.setItem('nx5_roadmap',JSON.stringify(items));
    toast('Added to roadmap backlog','ok');
  } else {
    document.getElementById('idea-popup')?.remove();
  }
}

/* ─── HELP / COPILOT SYSTEM ──────────────────────────────────── */
const HELP_TOPICS=[
  {id:'quick-start',title:'Quick Start',icon:'⚡',content:`<h3 style="color:var(--c);font-family:var(--display);letter-spacing:.18em">QUICK START — 5 MINUTES TO FIRST BUILD</h3>
<ol style="padding-left:18px;margin-top:10px;display:flex;flex-direction:column;gap:10px;font-size:11px;">
<li><strong style="color:var(--c)">SET API KEY</strong> — OPTIONS → AI Provider → paste your ChatGPT/Claude/Ollama key → TEST</li>
<li><strong style="color:var(--c)">BUILD SOMETHING</strong> — BUILDER → Script Builder → describe your vision → ▶ GENERATE</li>
<li><strong style="color:var(--o)">OR USE FORGE IDE</strong> — ⚡ FORGE IDE → new file or drag & drop existing code → co-pilot watches automatically</li>
<li><strong style="color:var(--g)">SAVE & TEST</strong> — After build: SAVE TO PROJECTS → run QA → send to Test Environment</li>
<li><strong style="color:var(--y)">EXPORT YOUR DATA</strong> — HOME → ⬡ MANIFEST → download config, projects, UUIDs, error log</li>
</ol>
<p style="margin-top:14px;padding:8px 10px;background:rgba(0,212,255,.06);border:1px solid rgba(0,212,255,.15);border-radius:2px;font-size:10px;">Every action is UUID-tracked and Jaa-logged. Your entire session is reproducible. The error log captures everything that goes wrong with resolution hints.</p>`},

  {id:'forge-ide',title:'Forge IDE',icon:'⚡',content:`<h3 style="color:var(--o);font-family:var(--display);letter-spacing:.18em">⚡ FORGE IDE — UNIFIED EDITOR</h3>
<p style="font-size:11px;line-height:1.8;"><strong style="color:var(--o)">The Forge IDE</strong> is a full-featured code editor with live preview, co-pilot AI, drag-and-drop file loading, and a universal compiler — all in one split-pane interface.</p>
<p style="margin-top:10px;font-size:11px;"><strong>Loading Files</strong></p>
<ul style="padding-left:18px;margin-top:4px;font-size:11px;line-height:1.8;">
<li>Drag any file onto the left sidebar drop zone</li>
<li>Click + FILE for a new blank file</li>
<li>Files from the Builder auto-populate on tab switch</li>
<li>All open files get a <code style="color:var(--c)">NX-FILE-xxx</code> UUID</li>
</ul>
<p style="margin-top:10px;font-size:11px;"><strong>Co-Pilot Modes</strong> — 12 available:</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:6px;font-size:10px;">
<div><span style="color:var(--m)">AUDIT</span> — Full code analysis</div>
<div><span style="color:var(--m)">FIX</span> — Bug fixes with diff</div>
<div><span style="color:var(--m)">EXTEND</span> — Add new features</div>
<div><span style="color:var(--m)">UPDATE</span> — Modernize code</div>
<div><span style="color:var(--m)">REFACTOR</span> — Improve structure</div>
<div><span style="color:var(--m)">DOCUMENT</span> — Generate docs</div>
<div><span style="color:var(--m)">TEST</span> — Generate test suite</div>
<div><span style="color:var(--m)">SECURITY</span> — CVE analysis</div>
<div><span style="color:var(--m)">PERF</span> — Optimize speed</div>
<div><span style="color:var(--m)">EXPLAIN</span> — Teach the code</div>
<div><span style="color:var(--m)">TRANSLATE</span> — Convert language</div>
<div><span style="color:var(--m)">ARCHITECT</span> — Design review</div>
</div>
<p style="margin-top:10px;font-size:11px;"><strong>↙ APPLY</strong> — Applies the co-pilot's code patch directly into the editor with auto-revision saved.</p>
<p style="margin-top:6px;font-size:11px;"><strong>▶ TEST ENV</strong> — Sends current file to the Test Environment browser simulator.</p>`},

  {id:'uuid-system',title:'UUID Tracking',icon:'⬡',content:`<h3 style="color:var(--c);font-family:var(--display);letter-spacing:.18em">⬡ UNIVERSAL UUID TRACKING</h3>
<p style="font-size:11px;line-height:1.8;">Every entity in NEXUS v9 carries a <code style="color:var(--c)">NX-TYPE-timestamp-RAND</code> UUID. 30 entity types, 154 generation points, 106 function hooks.</p>
<p style="margin-top:10px;font-size:11px;"><strong>30 Entity Types:</strong></p>
<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;">
${['session','tab-nav','action','button','modal','file','ai-call','copilot','error','gate','project','build','siso-session','compile','template','test-run','te-instance','te-service','sql-query','php-run','wizard','void','idea','revision','import','export','drag-drop','system','routing','account'].map(t=>`<span style="font-size:8px;padding:1px 6px;border:1px solid var(--border2);border-radius:2px;color:var(--text2)">${t}</span>`).join('')}
</div>
<p style="margin-top:10px;font-size:11px;"><strong>UUID Inspector</strong> — Click any UUID row in LOG → UUID Registry to open the inspector overlay. Shows: type, entity, session, sequence number, all meta fields, and a 5-entry session timeline.</p>
<p style="margin-top:6px;font-size:11px;"><strong>Hover tooltips</strong> — Hover any stamped element (buttons, tabs, inputs) to see its UUID in a tooltip.</p>
<p style="margin-top:6px;font-size:11px;"><strong>Export</strong> — LOG → UUID Registry → ⬇ EXPORT → <code style="color:var(--c)">nexus-uuids.json</code></p>
<p style="margin-top:6px;font-size:11px;"><strong>Session UUID</strong> — Generated on every boot. All actions in that session share the same sessionId for full traceability.</p>`},

  {id:'test-env',title:'Test Environment',icon:'⬡',content:`<h3 style="color:var(--g);font-family:var(--display);letter-spacing:.18em">⬡ TEST ENVIRONMENT</h3>
<p style="font-size:11px;line-height:1.8;"><strong>Sandboxed stack:</strong> PHP 8.3 · Apache 2.4 · MySQL 8.0 · Redis 7 · Node.js 20 · Mailhog</p>
<p style="margin-top:10px;font-size:11px;"><strong>9 Sub-panels:</strong></p>
<ul style="padding-left:18px;font-size:11px;line-height:1.8;">
<li><strong>Dashboard</strong> — Stack status, quick actions, service toggles</li>
<li><strong>Instances</strong> — Spawn/kill isolated PHP+Apache+MySQL sandboxes</li>
<li><strong>PHP 8.3</strong> — REPL, 16 extensions, version picker, PHPUnit runner</li>
<li><strong>Apache2</strong> — VirtualHost manager, module toggles, config editor</li>
<li><strong>MySQL</strong> — DB browser, table inspector, AI SQL console, CSV export</li>
<li><strong>Test Runner</strong> — PHPUnit/Jest/Playwright/Cypress/Pytest/Mocha/Vitest</li>
<li><strong>Browser Sim</strong> — Embedded iframe with Chrome/Firefox/Mobile selector</li>
<li><strong>Network</strong> — HTTP/WS/gRPC request log auto-populated by all operations</li>
<li><strong>Logs</strong> — Apache error/access, PHP error, MySQL, App, Xdebug</li>
</ul>
<p style="margin-top:8px;font-size:11px;"><strong>▶ START ENV</strong> — Starts all core services. <strong>⊕ NEW INSTANCE</strong> — Spawns an isolated container on its own port. Every instance, service toggle, and SQL query gets a UUID.</p>`},

  {id:'error-log',title:'Error Log & Diagnostics',icon:'⚠',content:`<h3 style="color:var(--r);font-family:var(--display);letter-spacing:.18em">⚠ ERROR LOG & DIAGNOSTICS</h3>
<p style="font-size:11px;line-height:1.8;">NEXUS logs every error, warning, and diagnostic event with code, message, detail, stack trace, and context UUID.</p>
<p style="margin-top:10px;font-size:11px;"><strong>⬡ DIAG Panel</strong> — Bottom-left corner. Shows live error count badge. Click to open 3-tab panel: Errors · Stats · PW Tests.</p>
<p style="margin-top:8px;font-size:11px;"><strong>Rich Toasts</strong> — Every error fires a toast with a <span style="color:var(--r)">▸ WHY</span> expand button showing the full explanation and fix steps.</p>
<p style="margin-top:8px;font-size:11px;"><strong>Error Log File</strong> — HOME → ⬇ ERROR LOG → downloads <code style="color:var(--c)">nexus-error.log</code> with every error, its UUID, timestamp, stack trace, and resolution hint.</p>
<p style="margin-top:8px;font-size:11px;"><strong>Guard system</strong> — 4 require* guards prevent silent failures:
<br>• <code style="color:var(--c)">requireAI()</code> — checks bridge + API key
<br>• <code style="color:var(--c)">requireFile()</code> — checks active file has content
<br>• <code style="color:var(--c)">requireService(name)</code> — checks TE service running
<br>• <code style="color:var(--c)">requireBridge()</code> — checks local bridge server</p>`},

  {id:'manifest',title:'Manifest Generator',icon:'⬡',content:`<h3 style="color:var(--y);font-family:var(--display);letter-spacing:.18em">⬡ MANIFEST GENERATOR</h3>
<p style="font-size:11px;line-height:1.8;">Generates structured JSON manifests for projects and system config that can be used to reproduce, share, or restore any state.</p>
<p style="margin-top:10px;font-size:11px;"><strong>What manifests contain:</strong></p>
<ul style="padding-left:18px;font-size:11px;line-height:1.8;">
<li>Project UUID, name, description, created/updated timestamps</li>
<li>Full source code + line count + language detection</li>
<li>All revisions with UUIDs and change summaries</li>
<li>Feature list with verification status</li>
<li>Roadmap items and milestone status</li>
<li>Build history: SISO gates, compiler runs, QA scores</li>
<li>Jaa log entries for that project</li>
<li>Delta tracker history</li>
</ul>
<p style="margin-top:8px;font-size:11px;"><strong>System Config manifest</strong> adds: provider settings (keys redacted), bridge URL, workspace mode, axioms per provider, routing chain.</p>
<p style="margin-top:8px;font-size:11px;"><strong>Usage:</strong> HOME → ⬡ MANIFEST → select project or "System Config" → downloads JSON. Import back via drag & drop on the home drop zone.</p>`},

  {id:'data-export',title:'Data Externalization',icon:'⬇',content:`<h3 style="color:var(--o);font-family:var(--display);letter-spacing:.18em">⬇ DATA EXTERNALIZATION GUIDE</h3>
<p style="font-size:11px;line-height:1.8;"><strong>All persistent data is stored in localStorage as JSON</strong> and can be exported to files at any time. Here's what lives where:</p>
<div style="display:flex;flex-direction:column;gap:8px;margin-top:10px;font-size:10px;">
<div style="padding:6px 10px;background:var(--bg2);border:1px solid var(--border);border-radius:2px;"><span style="color:var(--c);font-family:var(--display)">nx5_projects</span> → <code>nexus-projects.json</code> — All project code, metadata, revisions</div>
<div style="padding:6px 10px;background:var(--bg2);border:1px solid var(--border);border-radius:2px;"><span style="color:var(--c);font-family:var(--display)">nx6_uuids</span> → <code>nexus-uuids.json</code> — Full UUID registry with session chains</div>
<div style="padding:6px 10px;background:var(--bg2);border:1px solid var(--border);border-radius:2px;"><span style="color:var(--c);font-family:var(--display)">nx6_jaa_log</span> → <code>nexus-jaa.json</code> — JAA persistent event log</div>
<div style="padding:6px 10px;background:var(--bg2);border:1px solid var(--border);border-radius:2px;"><span style="color:var(--c);font-family:var(--display)">nx6_deltas</span> → <code>nexus-deltas.json</code> — Delta tracker entries</div>
<div style="padding:6px 10px;background:var(--bg2);border:1px solid var(--border);border-radius:2px;"><span style="color:var(--r);font-family:var(--display)">NX_ERRORS</span> → <code>nexus-error.log</code> — All errors with UUIDs and traces</div>
<div style="padding:6px 10px;background:var(--bg2);border:1px solid var(--border);border-radius:2px;"><span style="color:var(--y);font-family:var(--display)">nexus-config</span> → <code>nexus-config.json</code> — System config, provider settings</div>
</div>
<p style="margin-top:10px;font-size:11px;"><strong>One-click export all:</strong> HOME → ⬇ EXPORT ALL DATA — downloads a ZIP-equivalent bundle of all 6 files.</p>`},

  {id:'builder',title:'Script Builder',icon:'⟁',content:`<h3 style="color:var(--c);font-family:var(--display);letter-spacing:.18em">SCRIPT BUILDER</h3>
<p style="font-size:11px;line-height:1.8;"><strong>VISION / END-STATE</strong> — Describe what you want built. The more specific, the better. Include: what it does, how it should behave, edge cases you care about.</p>
<p style="margin-top:8px;font-size:11px;"><strong>OUTPUT TYPE</strong> — Guides AI architecture choices. Full Module, Electron App, CLI, REST API, Library, Dashboard, Pipeline.</p>
<p style="margin-top:8px;font-size:11px;"><strong>Toggles:</strong></p>
<ul style="padding-left:18px;font-size:11px;line-height:1.8;">
<li><strong style="color:var(--c)">SISO</strong> — Routes to gated pipeline</li>
<li><strong style="color:var(--c)">STREAM</strong> — Live character-by-character output</li>
<li><strong style="color:var(--r)">RED-TEAM</strong> — Auto hostile-attacks after build</li>
<li><strong style="color:var(--g)">AUTO-DOCS</strong> — Generates documentation immediately</li>
</ul>
<p style="margin-top:8px;font-size:11px;">Every build generates a <code style="color:var(--c)">NX-BUIL-xxx</code> UUID for full traceability through gates, logs, and deltas.</p>`},

  {id:'siso',title:'SISO Gated Build',icon:'⬡',content:`<h3 style="color:var(--c);font-family:var(--display);letter-spacing:.18em">SISO GATED BUILD</h3>
<p style="font-size:11px;line-height:1.8;">Builds complex systems one module at a time, each gate verified before proceeding. Every gate gets a <code style="color:var(--c)">NX-GATE-xxx</code> UUID.</p>
<p style="margin-top:8px;font-size:11px;"><strong>Flow:</strong> VISION → Architecture → Gate 1 → Verify → Gate 2 → … → Final Assembly</p>
<p style="margin-top:8px;font-size:11px;"><strong>Resume:</strong> Every gate logged to Jaa. If interrupted, enable RESUME FROM LAST GATE → click ↩ RESUME — finds last checkpoint and continues.</p>
<p style="margin-top:8px;font-size:11px;"><strong>Presets:</strong> NEXUS (13 modules), API, UI. Or define custom module list.</p>`},

  {id:'jaa',title:'JAA Logging',icon:'◈',content:`<h3 style="color:var(--c);font-family:var(--display);letter-spacing:.18em">JAA PERSISTENCE ENGINE</h3>
<p style="font-size:11px;line-height:1.8;">Every build, gate, validation, idea, error, and export is logged to JAA. The UUID system cross-references every entry with its entity chain.</p>
<p style="margin-top:8px;font-size:11px;"><strong>View:</strong> LOG → JAA PERSISTENT LOG — filter by type, level, session UUID</p>
<p style="margin-top:8px;font-size:11px;"><strong>Storage:</strong> Up to 10,000 entries in localStorage. Export to <code style="color:var(--c)">nexus-jaa.json</code> regularly.</p>
<p style="margin-top:8px;font-size:11px;"><strong>Database entries</strong> — All DB-related events (SQL queries, PHP runs, service starts) generate Jaa entries with their UUID for correlation.</p>`},

  {id:'first-setup',title:'First Time Setup',icon:'◎',content:`<h3 style="color:var(--g);font-family:var(--display);letter-spacing:.18em">◎ FIRST TIME SETUP</h3>
<p style="font-size:11px;line-height:1.8;">On first load, NEXUS checks your connection and shows the setup screen if needed. Here's what to configure:</p>
<ol style="padding-left:18px;font-size:11px;line-height:1.8;">
<li><strong style="color:var(--c)">AI Provider</strong> — At minimum, set a ChatGPT API key (free tier: gpt-4o-mini) in OPTIONS → AI Provider. Or use Guardian bridge (no API key needed — OPTIONS → BRIDGE).</li>
<li><strong style="color:var(--c)">Bridge URL</strong> — If running the local bridge server (<code>node nexus-bridge.js</code>), set the URL in OPTIONS → Bridge (default: localhost:3747).</li>
<li><strong style="color:var(--c)">Username</strong> — Set your name in OPTIONS for personalized welcome screen.</li>
<li><strong style="color:var(--c)">Workspace Mode</strong> — OPTIONS → Mode: Unity (all tabs independent) or Build (project-focused launcher).</li>
<li><strong style="color:var(--c)">Generate Config</strong> — HOME → ⬇ CONFIG JSON — save your settings to <code>nexus-config.json</code> for backup.</li>
</ol>
<p style="margin-top:10px;padding:6px 10px;background:rgba(0,255,136,.05);border:1px solid rgba(0,255,136,.15);border-radius:2px;font-size:10px;">If connection check fails on startup, NEXUS shows a setup overlay instead of the home screen so you can configure everything before proceeding.</p>`},

  {id:'troubleshoot',title:'Troubleshooting',icon:'⚠',content:`<h3 style="color:var(--y);font-family:var(--display);letter-spacing:.18em">TROUBLESHOOTING</h3>
<p style="font-size:11px;"><strong style="color:var(--r)">AI not responding?</strong></p>
<ul style="padding-left:18px;margin-top:4px;margin-bottom:10px;font-size:11px;line-height:1.7;">
<li>OPTIONS → AI Provider → TEST</li>
<li>Check API key starts with <code>sk-</code> or <code>sk-ant-</code></li>
<li>Look at ⬡ DIAG panel for specific error code</li>
<li>Check <code>nexus-error.log</code> for full trace</li>
</ul>
<p style="font-size:11px;"><strong style="color:var(--r)">Build stalling?</strong></p>
<ul style="padding-left:18px;margin-top:4px;margin-bottom:10px;font-size:11px;line-height:1.7;">
<li>Check BUILD LOG tab for errors</li>
<li>Reduce GATE SIZE to Small (2K)</li>
<li>Click ■ STOP then use ↩ RESUME — finds last gate UUID in Jaa</li>
</ul>
<p style="font-size:11px;"><strong style="color:var(--r)">UUID error "nxAssignUUID is not defined"?</strong></p>
<ul style="padding-left:18px;margin-top:4px;font-size:11px;line-height:1.7;">
<li>Hard refresh (Ctrl+Shift+R) — clears cached JS</li>
<li>Ensure you're using nexus_v9_UUID.html or later</li>
<li>Check browser console for earlier errors blocking init</li>
</ul>
<p style="font-size:11px;margin-top:10px;"><strong style="color:var(--r)">Storage warnings?</strong></p>
<ul style="padding-left:18px;margin-top:4px;font-size:11px;line-height:1.7;">
<li>LOG → JAA → ⬇ EXPORT then CLEAR ALL</li>
<li>LOG → UUID Registry → export and clear</li>
<li>HOME → ⬇ EXPORT ALL DATA first</li>
</ul>`},
];

function helpInitTopics(){
  const list=$('help-topics');if(!list)return;
  list.innerHTML=''; // always rebuild so new topics appear
  HELP_TOPICS.forEach((t,i)=>{
    const d=document.createElement('div');
    d.style.cssText='padding:6px 10px;border:1px solid var(--border2);border-radius:2px;cursor:pointer;transition:all .15s;display:flex;align-items:center;gap:7px;font-size:10px;color:var(--text2);margin-bottom:2px;';
    d.innerHTML=`<span style="color:var(--m);font-size:12px;flex-shrink:0">${t.icon}</span><span>${t.title}</span>`;
    d.onmouseenter=()=>{ if(!d.dataset.active) d.style.cssText+=';border-color:var(--border3);'; };
    d.onmouseleave=()=>{ if(!d.dataset.active) d.style.borderColor='var(--border2)'; };
    d.onclick=()=>{
      document.querySelectorAll('#help-topics > div').forEach(el=>{
        el.style.borderColor='var(--border2)';
        el.style.color='var(--text2)';
        delete el.dataset.active;
      });
      d.style.borderColor='var(--m)';
      d.style.color='var(--m)';
      d.dataset.active='true';
      helpShowTopic(t);
    };
    list.appendChild(d);
    // Auto-open first topic
    if(i===0) setTimeout(()=>d.click(),80);
  });
}

function helpShowTopic(topic){
  const content=$('help-content');const bc=$('help-breadcrumb');
  if(bc) bc.textContent = topic.icon + ' ' + topic.title;
  if(content){
    content.innerHTML = `<div style="animation:wizFadeIn .2s ease">${topic.content}</div>`;
    // Style any code tags
    content.querySelectorAll('code').forEach(el=>{
      if(!el.style.color) el.style.cssText+='color:var(--c);background:rgba(0,212,255,.08);padding:1px 5px;border-radius:2px;font-size:10px;';
    });
  }
  UUID.gen('action',{action:'help:topic',key:topic.id,tab:'help'},'help:topic:'+topic.id);
}

function helpSearchFilter(query){
  if(!query){document.querySelectorAll('#help-topics > div').forEach(d=>d.style.display='');;return;}
  const q=query.toLowerCase();
  document.querySelectorAll('#help-topics > div').forEach((d,i)=>{
    const t=HELP_TOPICS[i];
    const match=t.title.toLowerCase().includes(q)||t.content.toLowerCase().includes(q);
    d.style.display=match?'':'none';
  });
}

function helpSearch(){
  const q=val('help-search-input').trim();
  if(!q)return;
  const results=HELP_TOPICS.filter(t=>t.title.toLowerCase().includes(q.toLowerCase())||t.content.toLowerCase().includes(q.toLowerCase()));
  const content=$('help-content');
  if(!results.length){if(content)content.innerHTML='<div style="color:var(--text3);font-style:italic">No results for: '+esc(q)+'</div>';return;}
  helpShowTopic(results[0]);
}

async function helpAskCopilot(){
  const question=val('help-copilot-input').trim();
  if(!question){toast('Enter a question first','warn');return;}
  const content=$('help-content');
  if(content)content.innerHTML='<div style="color:var(--text3)">Asking NEXUS Copilot…</div>';
  if($('help-breadcrumb'))$('help-breadcrumb').textContent='COPILOT ANSWER';
  const msgs=[
    {role:'system',content:`You are the NEXUS v0.53.0 Copilot — expert on this system. NEXUS is a universal UUID-tracked autonomous development engine with:

CORE SYSTEMS: Script Builder (SISO-gated, 28-target compiler), Forge IDE (12 co-pilot modes, 24 languages, drag-and-drop, live preview), Test Environment (PHP 8.3, Apache2, MySQL, Redis, PHPUnit/Jest/Playwright), Spatial Void (Explore/Flow/Spar/Ground), Enhance Engine, Template Forge, QA Engine.

TRACKING: Universal UUID system (30 entity types, 154 gen points, 106 function hooks), JAA persistent logging, Delta tracker, Error log with resolution hints, Session tracing.

AI: Multi-provider (ChatGPT, Claude, Ollama, LM Studio), Guardian browser bridge, intent routing, fallback chain, Erosmancer/HTE/DeltaRisk/Unified engines.

DATA: Manifest generator (per-project + system config), export all data (projects, UUIDs, Jaa, deltas, error log, config), first-time setup detection, resume last project detection.

Answer questions about how to use NEXUS, troubleshoot issues, explain features, and guide users. Be specific and reference actual UI elements by name. Version: v0.53.0.`},
    {role:'user',content:question}
  ];
  try{
    abortCtrl=new AbortController();
    const r=await aiChat(msgs,{temperature:0.4,max_tokens:1500,stream:false});
    const text=r.stream?await readStream(r,()=>{}):r.text;
    if(content)content.innerHTML=`<div style="margin-bottom:12px;padding:8px 12px;background:rgba(204,68,255,.06);border:1px solid rgba(204,68,255,.2);border-radius:2px;font-size:10px;color:var(--m)">Q: ${esc(question)}</div>${text.replace(/\n/g,'<br>').replace(/`([^`]+)`/g,'<code style="color:var(--c);background:rgba(0,212,255,.08);padding:1px 4px;border-radius:2px">$1</code>')}`;
    setVal('help-copilot-input','');
    JAA.log('help:copilot',{question:question.slice(0,80),chars:text.length},'','OK');
  }catch(e){
    if(content)content.innerHTML='<div style="color:var(--r)">Copilot error: '+esc(e.message)+'</div>';
  }finally{abortCtrl=null;}
}

/* ─── THEME ───────────────────────────────────────────────────── */
/* ═══════════════════════════════════════════════════════════════
   WORKSPACE MODE — Unity vs Build
   ═══════════════════════════════════════════════════════════════ */
let _workspaceMode='unity'; // 'unity' | 'build'
let _buildActiveProject=null;

function setWorkspaceMode(mode){
  _workspaceMode=mode;
  // Update mode cards
  document.getElementById('mode-card-unity')?.classList.toggle('active',mode==='unity');
  document.getElementById('mode-card-build')?.classList.toggle('active',mode==='build');
  // Update badge
  const badge=document.getElementById('mode-acc-badge');
  if(badge){badge.textContent=mode==='build'?'BUILD':'UNITY';badge.style.color=mode==='build'?'var(--y)':'var(--c)';}
  // Update description
  const desc=document.getElementById('mode-description');
  if(desc){
    if(mode==='build'){
      desc.innerHTML='<b style="color:var(--y)">Build Mode</b> — Home becomes a project launcher. Select a project to load all its data into every tab at once. Focused, zero context switching.';
    }else{
      desc.innerHTML='<b style="color:var(--c)">Unity Mode</b> — All tabs are independent. Work across multiple projects, switch freely, full system always available.';
    }
  }
  // Toggle home views
  const unityHome=document.getElementById('unity-mode-home');
  const buildHome=document.getElementById('build-mode-home');
  if(unityHome)unityHome.style.display=mode==='unity'?'':'none';
  if(buildHome)buildHome.style.display=mode==='build'?'flex':'none';
  // Save
  localStorage.setItem('nx5_workspace_mode',mode);
  log_ev('mode:switch',{mode});
  if(mode==='build')buildModeRender();
  else buildModeUnload();
}

function buildModeRender(){
  const grid=document.getElementById('bm-grid');if(!grid)return;
  const q=(document.getElementById('bm-search')?.value||'').toLowerCase();
  const projs=getProjects().filter(p=>!q||p.name.toLowerCase().includes(q)||(p.description||'').toLowerCase().includes(q));
  if(!projs.length){
    grid.innerHTML='<div style="font-size:11px;color:var(--text3);font-style:italic;grid-column:1/-1;padding:20px">No projects found. Click ✦ NEW PROJECT to create one.</div>';
    return;
  }
  grid.innerHTML='';
  projs.forEach(p=>{
    const isActive=_buildActiveProject?.id===p.id;
    const lines=p.code?p.code.split('\n').length:0;
    const revCount=REV.getAll(p.id).length;
    const updated=p.updated_at?new Date(p.updated_at).toLocaleDateString():'—';
    const card=document.createElement('div');
    card.className='bm-card'+(isActive?' loaded':'');
    card.innerHTML=`
      <div class="bm-card-head">
        <div class="bm-card-name">${esc(p.name)}</div>
        ${isActive?'<span class="bm-card-badge">LOADED</span>':''}
      </div>
      <div class="bm-card-body">
        <div class="bm-card-desc">${esc(p.description||'No description.')}</div>
        <div class="bm-card-meta">
          <span>⌨ ${lines} lines</span>
          <span>↻ ${revCount} revisions</span>
          <span>✎ ${updated}</span>
          ${p.features?.length?`<span>✓ ${p.features.length} features</span>`:''}
        </div>
      </div>
      <div class="bm-card-footer">
        <div class="bm-load-btn" onclick="buildModeLoad('${p.id}')">
          ${isActive?'↻ RELOAD':'▶ LOAD INTO ALL TABS'}
        </div>
        ${isActive?'<div class="bm-loaded-indicator" style="display:flex">● ACTIVE</div>':''}
      </div>`;
    grid.appendChild(card);
  });
}

async function buildModeLoad(projId){
  const proj=getProjects().find(p=>p.id===projId);
  if(!proj){toast('Project not found','err');return;}
  _buildActiveProject=proj;
  toast('Loading '+proj.name+' into all tabs…','ok',2000);
  log_ev('build:load',{id:projId,name:proj.name});

  // ── 1. Builder tab ────────────────────────────────────────────
  setVal('sb-endstate',proj.name+(proj.description?' — '+proj.description:''));
  const sbOut=document.getElementById('sb-output');
  if(sbOut){sbOut.textContent=proj.code||'// No code yet';sbOut.style.color='var(--text)';}
  _generatedCode=proj.code||'';

  // ── 2. Pre-populate workspace (no tab switch) ─────────────────
  _wsProject=proj;
  const wsEditor=document.getElementById('ws-code-editor');
  if(wsEditor)wsEditor.value=proj.code||'';
  wsRenderRevisions();
  wsRenderRoadmap();
  // Sync ws-proj-name/meta for when user opens workspace later
  const wsName=document.getElementById('ws-proj-name');
  const wsMeta=document.getElementById('ws-proj-meta');
  if(wsName)wsName.textContent=proj.name;
  if(wsMeta)wsMeta.textContent=(proj.code?proj.code.split('\n').length:0)+' lines · '+new Date(proj.updated_at||Date.now()).toLocaleDateString();

  // ── 3. Enhance tab ────────────────────────────────────────────
  setVal('enh-project-sel',projId);
  enhLoadProject();

  // ── 4. Populate all project selectors ─────────────────────────
  ['proj-select','docs-proj-sel','feat-proj-sel','err-proj-sel'].forEach(id=>{
    const s=document.getElementById(id);if(!s)return;
    s.value=projId;
  });
  // Trigger loads
  docsLoad();featLoad();errLoad();

  // ── 5. Console — inject project context into system prompt ────
  const sysPrompt=document.getElementById('system-prompt');
  if(sysPrompt){
    const lines=proj.code?proj.code.split('\n').length:0;
    sysPrompt.value=`You are NEXUS AI working on project "${proj.name}" (${lines} lines). `+
      `${proj.description?'Description: '+proj.description+'. ':''}Provide precise, actionable guidance. All responses should be in context of this project.`;
  }

  // ── 6. Roadmap — filter to this project ───────────────────────
  const rmFilter=document.getElementById('rm-project-filter');
  if(rmFilter){rmFilter.value=projId;renderRoadmap();}

  // ── 7. Ideas — filter to this project ────────────────────────
  const itFilter=document.getElementById('it-proj-filter');
  if(itFilter){itFilter.value=projId;renderIdeas();}

  // ── 8. Idea panel — log load event ───────────────────────────
  logIdea('input',`[BUILD MODE] Loaded project: ${proj.name}`,projId,{event:'build_load'});

  // ── 9. Update active banner ───────────────────────────────────
  const banner=document.getElementById('bm-active-banner');
  const nameEl=document.getElementById('bm-active-name');
  const metaEl=document.getElementById('bm-active-meta');
  if(banner){banner.style.display='flex';}
  if(nameEl)nameEl.textContent=proj.name;
  if(metaEl){
    const lines=proj.code?proj.code.split('\n').length:0;
    metaEl.textContent=`${lines} lines · ${REV.getAll(projId).length} revisions · updated ${proj.updated_at?new Date(proj.updated_at).toLocaleDateString():'—'}`;
  }

  // ── 10. Re-render grid to show LOADED state ───────────────────
  buildModeRender();
  toast(`✓ ${proj.name} loaded into all tabs`,'ok',3000);
}

function buildModeUnload(){
  if(!_buildActiveProject)return;
  const name=_buildActiveProject.name;
  _buildActiveProject=null;
  // Clear active banner
  const banner=document.getElementById('bm-active-banner');
  if(banner)banner.style.display='none';
  // Reset system prompt
  const sysPrompt=document.getElementById('system-prompt');
  if(sysPrompt)sysPrompt.value='You are NEXUS AI — an autonomous engineering assistant. Provide precise, actionable guidance. Flag risks immediately. Log all significant insights to the idea tracker.';
  // Clear roadmap/idea filters
  const rmFilter=document.getElementById('rm-project-filter');
  if(rmFilter){rmFilter.value='';renderRoadmap();}
  const itFilter=document.getElementById('it-proj-filter');
  if(itFilter){itFilter.value='';renderIdeas();}
  // Re-render grid
  buildModeRender();
  toast(name+' unloaded','warn',2000);
  log_ev('build:unload',{name});
}

function loadWorkspaceMode(){
  const saved=localStorage.getItem('nx5_workspace_mode')||'unity';
  // Apply without triggering buildModeRender yet (projects not loaded)
  _workspaceMode=saved;
  const unityHome=document.getElementById('unity-mode-home');
  const buildHome=document.getElementById('build-mode-home');
  if(unityHome)unityHome.style.display=saved==='unity'?'':'none';
  if(buildHome)buildHome.style.display=saved==='build'?'flex':'none';
  document.getElementById('mode-card-unity')?.classList.toggle('active',saved==='unity');
  document.getElementById('mode-card-build')?.classList.toggle('active',saved==='build');
  const badge=document.getElementById('mode-acc-badge');
  if(badge){badge.textContent=saved==='build'?'BUILD':'UNITY';badge.style.color=saved==='build'?'var(--y)':'var(--c)';}
}

function applyAccent(c){document.documentElement.style.setProperty('--c',c);}


/* ─── HOME METRICS ────────────────────────────────────────────── */
function updateHomeMetrics(){
  const projs=getProjects();
  if($('hm-provider'))$('hm-provider').textContent=AI.provider.toUpperCase();
  if($('hm-projects'))$('hm-projects').textContent=projs.length;
  if($('hm-llm'))$('hm-llm').textContent=_llm_count;
  const ideas=getIdeas();if($('hm-ideas'))$('hm-ideas').textContent=ideas.length;
  const totalRevs=projs.reduce((sum,p)=>sum+REV.getAll(p.id).length,0);
  if($('hm-revisions'))$('hm-revisions').textContent=totalRevs;
  // v10: update UUID count badges
  const uuidCount = UUID.getAll().length;
  if($('hm-uuids'))$('hm-uuids').textContent=uuidCount;
  if($('home-uuid-badge'))$('home-uuid-badge').textContent='⬡ '+uuidCount+' UUIDs';
  if($('uuid-topbar-count'))$('uuid-topbar-count').textContent=uuidCount;
}

/* ─── EVENT BINDINGS ──────────────────────────────────────────── */
document.querySelectorAll('.tab-btn').forEach(btn=>{btn.addEventListener('click',()=>switchTab(btn.dataset.tab));});

$('c-send')?.addEventListener('click',consoleSubmit);
$('console-input')?.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();consoleSubmit();}});
$('c-abort')?.addEventListener('click',()=>{abortCtrl?.abort();});
$('clr-console')?.addEventListener('click',()=>{if($('console-output'))$('console-output').innerHTML='';_convoHistory=[];});

$('toggle-ideas')?.addEventListener('click',()=>{
  const p=$('idea-panel');p.classList.toggle('collapsed');
  $('toggle-ideas').style.color=p.classList.contains('collapsed')?'var(--m)':'var(--g)';
});

// Co-pilot toggle (re-labelled as ideas)
// (mode-btn click handlers unified in ADDITIONAL BINDINGS below)

document.querySelectorAll('.eng-pill').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const activeClasses=['active-ue','active-er','active-ht','active-dr','active-wx'];
    const wasActive=activeClasses.some(c=>btn.classList.contains(c));
    document.querySelectorAll('.eng-pill').forEach(b=>activeClasses.forEach(c=>b.classList.remove(c)));
    if(!wasActive){
      const eng=btn.dataset.eng;
      const cls=eng==='erosmancer'?'active-er':eng==='hostile'?'active-ht':eng==='deltaRisk'?'active-dr':eng==='unified'?'active-ue':'active-wx';
      btn.classList.add(cls);
    }
  });
});

document.querySelectorAll('.depth-btn').forEach(btn=>{btn.addEventListener('click',()=>{document.querySelectorAll('.depth-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');});});

document.querySelectorAll('.qcmd').forEach(btn=>{btn.addEventListener('click',()=>{setVal('console-input',btn.dataset.cmd);$('console-input')?.focus();});});
$('eng-explore-input')?.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();engExplorerSend();}});

// projects tab click triggers renderProjects via switchTab('projects') → already handled
document.querySelectorAll('[data-ptab]').forEach(btn=>{btn.addEventListener('click',()=>{document.querySelectorAll('.ptab').forEach(b=>b.removeAttribute('data-active'));document.querySelectorAll('.proj-subtab').forEach(p=>p.removeAttribute('data-active'));btn.dataset.active='true';const sub=$('pst-'+btn.dataset.ptab);if(sub)sub.dataset.active='true';});});

/* ─── INIT ────────────────────────────────────────────────────── */
function init(){
  window._nx_booting=true;
  loadConfig();
  engExplorerInit();
  renderProjects();
  updateHomeMetrics();
  renderRecentProjects();
  renderIdeas();
  // Load any locally queued accounts (bridge offline)
  try{
    const local=JSON.parse(localStorage.getItem('nx5_local_accounts')||'[]');
    if(local.length){
      BRIDGE.accounts=[...BRIDGE.accounts,...local.map(a=>({...a,id:a.accountId,status:a.status||'pending'}))];
      renderProviderAccountCards();
    }
  }catch{}
  // Seed intent map with defaults immediately so routing accordion shows content
  BRIDGE.intentMap=Object.assign({},_intentDefaults);
  renderIntentMap();
  initAccordions();
  loadWorkspaceMode();
  // Set initial bridge pill state
  setPill('bridge-status-pill','idle','BRIDGE OFFLINE');
  // Init delta sub-tab — show recent by default
  ['ds-stats','ds-failures','ds-ideas','ds-query','ds-outputs'].forEach(id=>{
    const el=document.getElementById(id);if(el)el.style.display='none';
  });
  log_ev('system:init',{version:'6.0',ts:new Date().toISOString()});
  if(window.nexus&&window.nexus.onBridgeStatus){
    window.nexus.onBridgeStatus(function(d){
      if(d.connected){BRIDGE.connected=true;BRIDGE.url=d.url||'http://127.0.0.1:3747';updateBridgeUI(true,d.data);}
      else{BRIDGE.connected=false;updateBridgeUI(false,null,d.error);}
    });
  }
  setTimeout(function(){if(!BRIDGE.connected)bridgeConnect().catch(function(){});},1500);


  // ── v6 BUILDER INIT ──────────────────────────────────────────
  // Populate SISO module defaults if empty
  if(!val('siso-modules'))setVal('siso-modules','uuid-system\nlogger\nevent-bus\ngate-engine\nbuild-engine\nverify-engine\nresume-engine\ndelta-tracker\nproject-manager\ntemplate-system\nai-bridge\nui-shell');

  // Populate template defaults
  if(!val('tpl-axioms'))setVal('tpl-axioms',[
    'Architecture first','File tree second','Module list third',
    'One module at a time','Never rewrite working modules',
    'Always test after each module','Keep a build manifest',
    'SISO Compliance — event-driven, gated generation',
    'Additive Development Only — never remove existing functionality',
    'Real-world Data — no mock data',
    'Fully Functional — no placeholders, no stubs',
    'Preemptive Failure Handling',
    'Only your finest, highest-leverage, lowest-friction code'
  ].join('\n'));

  if(!val('tpl-features'))setVal('tpl-features',[
    'UUID system','Jaa logger','Event system','Gate engine',
    'Build engine','Verify engine','Resume engine','Delta tracker',
    'Project manager','Template system','AI bridge','Electron dashboard'
  ].join('\n'));

  // Inject QA suite list
  qaInitUI();

  // Wire Jaa/UUID/Delta refresh on log tab open
  const origSwitch=switchTab;
  // Already patched in the overridden switchTab at bottom — safe

  // Log startup
  JAA.log('system:init',{version:'6.0',builder:'SISO+JAA+UUID+DELTA'},'','INFO');
  UUID.gen('system',{event:'startup',version:'6.0'});

  // Show builder sub-tab state
  sbSwitchSub('script',document.querySelector('[data-sbt="script"]'));

  // ── BOOT LOGIN FLOW ───────────────────────────────────────────
  setTimeout(()=>{window._nx_booting=false;bootLoginFlow();}, 400);

  // ── USERNAME ─────────────────────────────────────────────────
  const savedUsername=localStorage.getItem('nx6_username')||'';
  if(savedUsername){const u=$('opt-username');if(u)u.value=savedUsername;}

  // ── IDEA POPUP CYCLE ──────────────────────────────────────────
  const ideaPopupOn=localStorage.getItem('nx6_idea_popup')==='on';
  const ideaChk=$('opt-idea-popup');if(ideaChk&&ideaPopupOn)ideaChk.classList.add('on');
  if(ideaPopupOn)startIdeaPopupCycle();
  toast('NEXUS v0.53.0 ready','ok',2000);
}

// ─── ADDITIONAL BINDINGS ─────────────────────────────────────────
// Workspace code editor: debounced auto-save (2s after typing stops)
let _wsAutoSaveTimer=null;
$('ws-code-editor')?.addEventListener('input',()=>{
  clearTimeout(_wsAutoSaveTimer);
  _wsAutoSaveTimer=setTimeout(()=>{
    if(!_wsProject)return;
    const code=$('ws-code-editor').value;
    const projs=getProjects();const idx=projs.findIndex(p=>p.id===_wsProject.id);
    if(idx>=0){projs[idx].code=code;projs[idx].updated_at=new Date().toISOString();saveProjects(projs);_wsProject=projs[idx];}
  },2000);
});

// Void input: Shift+Enter=newline, Enter=send
$('void-input')?.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();voidSend();}});
$('void-spar-input')?.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();voidSpar();}});
$('void-ground-input')?.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();voidGround();}});

// Mode toggle clicks (prevent double-bind from earlier listeners)
document.querySelectorAll('.mode-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.mode-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    if(btn.id==='mode-pilot')appendMsg('system','PILOT MODE — Full system context injected.');
  });
});

// Ctrl+Enter also submits console
$('console-input')?.addEventListener('keydown',e=>{
  if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();consoleSubmit();}
});

// projects tab already handled by the main tab-btn listener above

/* ═══════════════════════════════════════════════════════════════
   ACCORDION — Options collapsible sections
   ═══════════════════════════════════════════════════════════════ */
function accToggle(id){
  const sec=document.getElementById(id);if(!sec)return;
  const body=sec.querySelector('.acc-body');
  const chev=sec.querySelector('.acc-chevron');
  const isOpen=sec.classList.contains('open');
  sec.classList.toggle('open',!isOpen);
  if(body)body.style.display=isOpen?'none':'flex';
  if(chev)chev.textContent=isOpen?'▸':'▾';
}
// Wire acc-body visibility on load
function initAccordions(){
  document.querySelectorAll('.acc-section').forEach(sec=>{
    const body=sec.querySelector('.acc-body');
    const chev=sec.querySelector('.acc-chevron');
    const isOpen=sec.classList.contains('open');
    if(body)body.style.display=isOpen?'flex':'none';
    if(chev)chev.textContent=isOpen?'▾':'▸';
  });
}

/* ─── Delta sub-tab switcher ─────────────────────────────────── */
function deltaSubTab(btn,name){
  document.querySelectorAll('#acc-delta .acc-pill').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  ['recent','stats','failures','ideas','query','outputs'].forEach(n=>{
    const el=document.getElementById('ds-'+n);
    if(el)el.style.display=n===name?'block':'none';
  });
}

/* ─── Sync test scores to options badge ──────────────────────── */
function syncTestBadge(){
  const pass=parseInt(document.getElementById('test-pass-count')?.textContent)||0;
  const fail=parseInt(document.getElementById('test-fail-count')?.textContent)||0;
  const total=parseInt(document.getElementById('test-total-count')?.textContent)||0;
  const pct=total?Math.round(pass/total*100):0;
  const badge=document.getElementById('tests-acc-badge');
  if(badge&&total>0){badge.textContent=pct+'%';badge.style.color=pct>=80?'var(--g)':pct>=60?'var(--y)':'var(--r)';}
  setEl('opts-pass',pass);setEl('opts-fail',fail);setEl('opts-total',total);
  setEl('opts-score',total?pct+'%':'—');
}

