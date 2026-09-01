/* NEXUS v0.53.0 — nexus-core.js
 * Core — EventBus, errors, toast, guards, tab nav, AI chat, projects
 * Phase 0B — extracted 2026-04-07
 */

'use strict';
/* ═══════════════════════════════════════════════════════════════
   NEXUS v0.53.0 — SISO EVENT STREAM
   ═══════════════════════════════════════════════════════════════ */
const _NX_LOG=[];let _log_seq=0,_llm_count=0;
const S={
  _cb:[],
  on(fn){this._cb.push(fn);},
  emit(type,data={},level='INFO'){
    const ev={seq:_log_seq++,time:Date.now(),type,level,data};
    _NX_LOG.push(ev);
    if(_NX_LOG.length>5000)_NX_LOG.shift();
    this._cb.forEach(fn=>{try{fn(ev);}catch{}});
  },
  count(){return _NX_LOG.length;}
};
function log_ev(t,d={},l='INFO'){S.emit(t,d,l);}

/* ─── UTILS ───────────────────────────────────────────────────── */
const $=id=>document.getElementById(id);
const val=id=>{const el=$(id);return el?el.value:'';}
const setVal=(id,v)=>{const el=$(id);if(el)el.value=v;}
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,5);
const ts=()=>new Date().toTimeString().slice(0,8);
function scrollBot(el){if(el)el.scrollTop=el.scrollHeight;}
/* ═══════════════════════════════════════════════════════════════
   NEXUS v8 — COMPREHENSIVE ERROR & DIAGNOSTIC SYSTEM
   Every interaction reports. Nothing fails silently.
   ═══════════════════════════════════════════════════════════════ */

/* ── MASTER ERROR LOG ── */
const NX_ERRORS = [];
const NX_INTERACTIONS = { total:0, ok:0, warn:0, err:0 };

function nxError(code, msg, detail='', ctx='') {
  const entry = { id:uid(), ts:new Date().toISOString(), code, msg, detail, ctx, stack:new Error().stack?.split('\n').slice(2,4).join(' ') };
  NX_ERRORS.unshift(entry);
  if(NX_ERRORS.length > 2000) NX_ERRORS.length = 2000;
  NX_INTERACTIONS.err++;
  log_ev('error:'+code, { msg, detail, ctx }, 'ERROR');
  JAA?.log?.('error:'+code, { msg, detail, ctx }, '', 'ERROR');
  errorToast(msg, detail, 'err');
  errorLogPanel(entry);
  return entry;
}

function nxWarn(code, msg, detail='', ctx='') {
  const entry = { id:uid(), ts:new Date().toISOString(), code, msg, detail, ctx };
  NX_ERRORS.unshift(entry);
  if(NX_ERRORS.length > 2000) NX_ERRORS.length = 2000;
  NX_INTERACTIONS.warn++;
  log_ev('warn:'+code, { msg, detail, ctx }, 'WARN');
  errorToast(msg, detail, 'warn');
  errorLogPanel(entry);
  return entry;
}

function nxOk(code, msg, detail='') {
  NX_INTERACTIONS.ok++;
  NX_INTERACTIONS.total++;
  log_ev('ok:'+code, { msg, detail }, 'INFO');
  diagUpdateCounters();
}

/* ── RICH TOAST — bottom-right popup with detail expansion ── */
function toast(msg, type='ok', ms=3000, source='') {
  const r = $('toast-root'); if(!r) return;
  const d = document.createElement('div');
  d.className = 'toast ' + type;
  // Source label for traceability
  const srcLabel = source ? `<span class="toast-src">${esc(source)}</span>` : '';
  // Crash log button for errors
  const logBtn = (type === 'err' || type === 'crit' || type === 'error')
    ? `<button class="toast-log-btn" onclick="nxOpenCrashLog()" title="View crash log">⚠</button>` : '';
  d.innerHTML = `${srcLabel}<span class="toast-msg">${esc(msg)}</span>${logBtn}<button class="toast-close" onclick="this.parentElement.remove()">×</button>`;
  r.appendChild(d);
  // Report errors to crash logger via Electron IPC
  if ((type === 'err' || type === 'crit' || type === 'error') && window.electronAPI?.invoke) {
    window.electronAPI.invoke('nexus:crash-report', { level: 'ERROR', source: source || 'toast', msg, detail: null }).catch(() => {});
  }
  setTimeout(() => { d.style.opacity='0'; d.style.transform='translateX(20px)'; setTimeout(()=>d.remove(),300); }, ms);
}

// Open crash log in diagnose tab
window.nxOpenCrashLog = function() {
  if (typeof switchTab === 'function') switchTab('options');
  setTimeout(() => { if (typeof optSwitchTab === 'function') optSwitchTab('diagnose', null); }, 200);
  setTimeout(async () => {
    if (window.electronAPI?.getCrashLog) {
      const data = await window.electronAPI.getCrashLog();
      const el = document.getElementById('nx-crash-log-output');
      if (el && data?.ring) {
        el.textContent = data.ring.map(e => `[${e.ts?new Date(e.ts).toISOString().slice(11,23):'?'}] ${e.level} ${e.source}: ${e.msg}`).join('\n');
      }
    }
  }, 500);
};

function errorToast(msg, detail='', type='err') {
  const r = $('toast-root'); if(!r) return;
  const id = 'et-'+uid();
  const d = document.createElement('div');
  d.id = id;
  d.className = 'toast etx ' + type;
  const hasDetail = detail && detail.length > 0;
  d.innerHTML = `
    <div class="etx-header">
      <span class="etx-icon">${type==='err'?'✕':type==='warn'?'⚠':'ℹ'}</span>
      <span class="etx-msg">${esc(msg)}</span>
      <button class="toast-close" onclick="document.getElementById('${id}')?.remove()">×</button>
    </div>
    ${hasDetail ? `<div class="etx-detail" id="${id}-detail" style="display:none">${esc(detail)}</div>
    <button class="etx-expand" onclick="
      const d=document.getElementById('${id}-detail');
      if(d){d.style.display=d.style.display==='none'?'block':'none';this.textContent=d.style.display==='none'?'▸ WHY':'▾ HIDE';}
    ">▸ WHY</button>` : ''}
  `;
  r.appendChild(d);
  const ms = type==='err' ? 8000 : 5000;
  setTimeout(() => { d.style.opacity='0'; d.style.transform='translateX(20px)'; setTimeout(()=>d.remove(),300); }, ms);
}

/* ── ERROR LOG PANEL (injected into page at init) ── */
function errorLogPanel(entry) {
  const panel = $('nx-error-log-list'); if(!panel) return;
  const d = document.createElement('div');
  d.className = 'nx-err-entry ' + (entry.code?.includes('warn')||entry.msg?.toLowerCase().includes('warn') ? 'warn' : 'err');
  d.innerHTML = `<span class="nx-err-ts">${entry.ts.slice(11,19)}</span><span class="nx-err-code">${esc(entry.code||'?')}</span><span class="nx-err-msg">${esc(entry.msg)}</span>${entry.detail?`<div class="nx-err-detail">${esc(entry.detail)}</div>`:''}`;
  panel.insertBefore(d, panel.firstChild);
  if(panel.children.length > 500) panel.lastChild?.remove();
  const badge = $('nx-error-badge');
  if(badge){ badge.textContent = NX_ERRORS.length; badge.style.display = ''; }
  diagUpdateCounters();
}

function diagUpdateCounters() {
  const t=$('diag-total'),o=$('diag-ok'),w=$('diag-warn'),e=$('diag-err');
  NX_INTERACTIONS.total++;
  if(t) t.textContent=NX_INTERACTIONS.total;
  if(o) o.textContent=NX_INTERACTIONS.ok;
  if(w) w.textContent=NX_INTERACTIONS.warn;
  if(e) e.textContent=NX_ERRORS.length;
}

/* ── REQUIRE helpers — every feature gates on these ── */
function requireAI(ctx='') {
  const bridgeOk = BRIDGE?.connected;
  const hasKey = val('opt-chatgpt-key')||val('opt-claude-key')||val('opt-ollama-url');
  if(!bridgeOk && !hasKey) {
    nxError('NO_AI', 'AI not configured', 'Bridge offline and no API key set. Go to OPTIONS → Provider and add a key, or start the NEXUS bridge server.', ctx);
    return false;
  }
  return true;
}

function requireFile(ctx='') {
  if(!FORGE.activeFile || !FORGE.files[FORGE.activeFile]) {
    nxWarn('NO_FILE', 'No file open', 'Open a file first — drag & drop onto the sidebar or click + FILE', ctx);
    return false;
  }
  const f = FORGE.files[FORGE.activeFile];
  if(!f.content || f.content.trim().length < 3) {
    nxWarn('EMPTY_FILE', 'File is empty', 'Write or paste some code into the editor before running this action.', ctx);
    return false;
  }
  return true;
}

function requireCode(ctx='') {
  const ed = $('forge-editor');
  if(!ed?.value?.trim()) {
    nxWarn('NO_CODE', 'No code in editor', 'Write or load code into the editor first.', ctx);
    return false;
  }
  return true;
}

function requireService(name, ctx='') {
  if(!TE.services[name]) {
    nxWarn('SERVICE_DOWN', `${name.toUpperCase()} not running`, `Start ${name} first — go to TEST ENV → Dashboard and click ▶ START ENV, or click the ${name} layer to toggle it on.`, ctx);
    return false;
  }
  return true;
}

function requireBridge(ctx='') {
  if(!BRIDGE?.connected) {
    nxWarn('BRIDGE_DOWN', 'NEXUS Bridge not connected', 'The local bridge server is not running. Start it with: node nexus-bridge.js — or configure direct API keys in OPTIONS → Provider.', ctx);
    return false;
  }
  return true;
}

/* ─── TAB ROUTING ─────────────────────────────────────────────── */
function switchTab(name){
  document.querySelectorAll('.tab-panel').forEach(p=>p.removeAttribute('data-active'));
  document.querySelectorAll('.tab-btn').forEach(b=>b.removeAttribute('data-active'));
  const panel=$('tab-'+name);if(panel)panel.dataset.active='true';
  const btn=document.querySelector(`.tab-btn[data-tab="${name}"]`);if(btn)btn.dataset.active='true';
  // #main contains only tab-home — hide it when on any other tab so flex children fill height
  const mainEl=$('main');
  if(mainEl){mainEl.style.display=(name==='home'?'flex':'none');}
  if(name==='home'){updateHomeMetrics();renderRecentProjects();if(_workspaceMode==='build')buildModeRender();}
  if(name==='log'){/* auto-refresh active log sub-tab */}
  if(name==='projects'){renderProjects();}
  if(name==='roadmap'){populateRmFilter();renderRoadmap();}
  if(name==='ideas'){renderIdeas();}
  if(name==='enhance'){enhPopulateProjects();}
  log_ev('nav:switch',{tab:name});
}

/* ─── MODAL ───────────────────────────────────────────────────── */
function openModal(id){const m=$(id);if(m)m.classList.add('open');}
function closeModal(id){const m=$(id);if(m)m.classList.remove('open');}
document.addEventListener('click',e=>{
  if(e.target.classList.contains('modal-overlay'))e.target.classList.remove('open');
});

/* ─── AI ENGINE DEFINITIONS ───────────────────────────────────── */
const ENGINES={
  erosmancer:{key:'erosmancer',name:'EROSMANCER',color:'var(--c)',description:'Reverse-engineer from end-states. Find hidden leverage. Apply cross-domain pattern transfer.',corePrinciples:'End-state thinking, cross-domain transfer, leverage amplification',layers:['Vision synthesis','Pattern extraction','Leverage mapping','Implementation cascade']},
  hostile:{key:'hostile',name:'HOSTILE TRUTH ENGINE',color:'var(--r)',description:'Stress-test everything. Apply TSP×VP×SS scoring. Identify single points of failure before they occur.',corePrinciples:'Adversarial analysis, stress testing, failure mapping',layers:['Threat surface analysis','Vulnerability probing','Systemic failure mapping','Mitigation generation']},
  deltaRisk:{key:'deltaRisk',name:'DELTA RISK',color:'var(--y)',description:'Scan for the 28 systemic Δ failure types. Map cascading effects.',corePrinciples:'Systemic failure taxonomy, cascade analysis',layers:['Input validation','State corruption','Resource exhaustion','Cascade failure','Recovery paths']},
  unified:{key:'unified',name:'UNIFIED ENGINE',color:'var(--g)',description:'Full-spectrum analysis combining all engine perspectives into unified output.',corePrinciples:'Synthesis, integration, holistic analysis',layers:['Multi-engine fusion','Conflict resolution','Priority synthesis','Action cascade']},
};

/* ─── AI PROVIDER STATE ───────────────────────────────────────── */
const AI={
  // 'auto' tries: Ollama local → DeepSeek direct → Guardian (if hooked) → error with guide
  provider: localStorage.getItem('nx6_last_provider') || 'auto',
  fallbackEnabled: false,
  axioms: {claude:[], ollama:[], lmstudio:[], chatgpt:[], deepseek:[], gemini:[], grok:[]},
};

let abortCtrl=null;

/* ─── AI CORE ─────────────────────────────────────────────────── */
async function aiChat(messages,opts={}){
  const temp=(opts.temperature!=null?opts.temperature:parseFloat(val('param-temp')))||0.65;
  const maxTok=(opts.max_tokens!=null?opts.max_tokens:parseInt(val('param-tokens')))||4096;
  const stream=opts.stream!==false;
  const bridgeUrl=val('bridge-url')||'http://127.0.0.1:3747';

  // ── Guardian wiring check — route through browser AI if configured ────────
  try {
    const _cw = JSON.parse(localStorage.getItem('nx_console_wiring') || '{}');

    // If Guardian mode but no callto assigned yet — show setup guide, don't fall through
    if (_cw.mode === 'guardian' && !_cw.inputCalltoId) {
      const _gConnected = typeof GUARDIAN !== 'undefined' && GUARDIAN.connected;
      throw new Error(
        '⟁ Guardian mode selected but no input callto wired.' +
        (_gConnected
          ? '\n\nGuardian is connected. To wire a callto:\n1. Go to the AI website (e.g. chat.openai.com) in Firefox with Guardian active\n2. Click Guardian → PICK ELEMENT on the chat input field → ADD TO INDEX\n3. Come back to NEXUS → OPTIONS → CONSOLE → Guardian Wiring → REFRESH CALLTOS → select it → SAVE WIRING'
          : '\n\nGuardian extension not connected.\n1. Install Guardian v3.3.x in Firefox\n2. Click the Guardian icon → it should show HANDSHAKE OK\n3. Then pick elements on your AI website')
      );
    }

    if (_cw.mode === 'guardian' && _cw.inputCalltoId) {
      const _agentId = _cw.agentId || 'chatgpt';
      // Extract last user message for Guardian dispatch
      const _lastUser = [...messages].reverse().find(m => m.role === 'user');
      const _txt = typeof _lastUser?.content === 'string' ? _lastUser.content
        : Array.isArray(_lastUser?.content) ? _lastUser.content.filter(p=>p.type==='text').map(p=>p.text).join(' ') : '';
      if (_txt) {
        const _gResp = await fetch(bridgeUrl + '/v1/messages', {
          method: 'POST', signal: abortCtrl?.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider: 'guardian', agentId: _agentId, messages, intent: _cw.intent || 'chat' }),
        });
        if (_gResp.status === 202) {
          // Dispatched — wait for SSE response (max 45s)
          const _responseText = await new Promise((resolve) => {
            const _timeout = setTimeout(() => resolve(null), 45000);
            const _evSource = typeof EventSource !== 'undefined' ? new EventSource(bridgeUrl + '/events') : null;
            if (!_evSource) { clearTimeout(_timeout); resolve(null); return; }
            _evSource.addEventListener('message', function(e) {
              try {
                const d = JSON.parse(e.data);
                if (d.type === 'guardian.link.event' || d.type === 'guardian:ai:response') {
                  const txt = d.text || d.response || d.payload?.text || (d.event && (d.event.text || d.event.value));
                  if (txt) { clearTimeout(_timeout); _evSource.close(); resolve(txt); }
                }
              } catch(_) {}
            });
            _evSource.onerror = function() { _evSource.close(); clearTimeout(_timeout); resolve(null); };
          });
          if (_responseText) {
            return { stream: false, text: _responseText, guardian: true, agentId: _agentId };
          }
          // Timeout — return waiting message
          return { stream: false, text: '[Guardian] Message sent to ' + _agentId + '. Response capture timed out — check that the output callto listener is active and the AI tab has responded.', guardian: true, agentId: _agentId };
        }
        // 503 = no hook configured — fall through to normal path
        if (_gResp.status !== 503) {
          const _gj = await _gResp.json().catch(() => ({}));
          throw new Error('Guardian dispatch failed: ' + (_gj.error || _gResp.status));
        }
      }
    }
  } catch(guardianErr) {
    // Rethrow intentional guidance errors — these should surface to the user
    if (guardianErr.message.includes('Guardian dispatch failed') ||
        guardianErr.message.includes('Guardian mode selected') ||
        guardianErr.message.includes('no input callto')) throw guardianErr;
    // Other errors (JSON parse, network fetch) — fall through to normal path
  }

  // ── Direct API key fallback (works without bridge) ────────────────
  const provider = AI.provider||val('opt-provider')||localStorage.getItem('nx6_last_provider')||'ollama';

  // ── Guardian hook injection: read per-agent callto + intent assignment ────────
  // If this agent has a callto hook assigned in AI SETTINGS → GUARDIAN HOOK,
  // inject the callto context as a system message prefix and route to intent.
  let _guardianCtxInjected = false;
  try {
    const agentHooks = JSON.parse(localStorage.getItem('nx_guardian_agent_hooks')||'{}');
    const hook = agentHooks[provider];
    if (hook && hook.calltoId && typeof GUARDIAN !== 'undefined') {
      const ct = GUARDIAN.calltos.find(c => c.id === hook.calltoId);
      if (ct) {
        // Prepend callto context to the first user message
        const ctxBlock = '[GUARDIAN CALLTO · '+ct.id+']\nSelector: '+(ct.selector||'?')+'\nURL: '+(ct.url||'?')+'\nAction: '+(ct.action||'click')+'\nLabel: '+(ct.label||ct.id)+'\nIntent: '+(hook.intent||'chat')+(hook.intent==='custom'&&hook.custom?'\nCustom: '+hook.custom:'');
        if (messages.length && messages[0].role === 'system') {
          messages = [{ role: 'system', content: messages[0].content + '\n\n' + ctxBlock }, ...messages.slice(1)];
        } else {
          messages = [{ role: 'system', content: ctxBlock }, ...messages];
        }
        _guardianCtxInjected = true;
        // Route to Guardian chat API target if assigned
        if (hook.apiTarget && hook.apiTarget !== '' && hook.apiTarget !== 'auto') {
          const gcSel = document.getElementById('gc-api-target');
          if (gcSel && !gcSel.value) gcSel.value = hook.apiTarget;
        }
      }
    }
  } catch(_e) { /* guardian hooks optional */ }
  const claudeKey = val('opt-claude-key')||val('claude-key')||localStorage.getItem('nx_claude_key')||'';
  const openaiKey = val('opt-chatgpt-key')||val('openai-key')||localStorage.getItem('nx_openai_key')||'';
  const geminiKey = val('opt-gemini-key')||localStorage.getItem('nx_gemini_key')||'';

  // Pre-flight: if provider needs a key and has none, skip bridge and show guidance early
  const _hasNoConfig = (() => {
    if(provider === 'auto') return false; // auto will try Ollama
    if(provider === 'ollama') return false; // no key needed
    if(provider === 'claude') return !claudeKey;
    if(provider === 'chatgpt' || provider === 'openai') return !openaiKey;
    if(provider === 'deepseek') return !(val('opt-deepseek-key') || localStorage.getItem('nx_deepseek_key'));
    if(provider === 'gemini') return !geminiKey;
    return false;
  })();
  if(_hasNoConfig) {
    throw new Error(
      '⚠ No API key for ' + provider + '.\n\n' +
      'Options:\n' +
      '1. Guardian mode (no API key): OPTIONS → CONSOLE → set Mode to Guardian → pick callto\n' +
      '2. Add API key: OPTIONS → AI SETTINGS → ' + provider + ' → paste key\n' +
      '3. Ollama local (free): https://ollama.ai then: ollama pull deepseek-r1:8b'
    );
  }

  // Try bridge first; on fail, try direct API; on fail, throw with clear message
  try {
    const resp=await fetch(bridgeUrl+'/v1/messages',{
      method:'POST',signal:abortCtrl?.signal,
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({provider,messages,stream,temperature:temp,max_tokens:maxTok}),
    });
    if(!resp.ok){let e='Bridge error '+resp.status;try{const j=await resp.json();e=j.error||e;}catch{}throw new Error(e);}
    if(stream)return{stream:true,body:resp.body,bridge:true};
    const j=await resp.json();
    return{stream:false,text:j.text||j.content||j.response||''};
  } catch(bridgeErr){
    // Bridge offline — attempt direct API
    if(provider==='claude'&&claudeKey){
      const resp=await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST',signal:abortCtrl?.signal,
        headers:{'Content-Type':'application/json','x-api-key':claudeKey,'anthropic-version':'2023-06-01'},
        body:JSON.stringify({model:val('opt-model')||'claude-sonnet-4-20250514',messages,max_tokens:maxTok,stream})
      });
      if(!resp.ok){let e='Claude API '+resp.status;try{const j=await resp.json();e=j.error?.message||e;}catch{}throw new Error(e);}
      if(stream)return{stream:true,body:resp.body,bridge:false,claude:true};
      const j=await resp.json();
      return{stream:false,text:(j.content||[]).map(b=>b.text||'').join('')};
    }
    if((provider==='chatgpt'||provider==='openai')&&openaiKey){
      const resp=await fetch('https://api.openai.com/v1/chat/completions',{
        method:'POST',signal:abortCtrl?.signal,
        headers:{'Content-Type':'application/json','Authorization':'Bearer '+openaiKey},
        body:JSON.stringify({model:'gpt-4o',messages,max_tokens:maxTok,stream})
      });
      if(!resp.ok){let e='OpenAI API '+resp.status;try{const j=await resp.json();e=j.error?.message||e;}catch{}throw new Error(e);}
      if(stream)return{stream:true,body:resp.body,bridge:false,openai:true};
      const j=await resp.json();
      return{stream:false,text:j.choices?.[0]?.message?.content||''};
    }
    if(provider==='gemini'&&geminiKey){
      const model='gemini-1.5-flash';
      const parts=messages.map(m=>({role:m.role==='assistant'?'model':'user',parts:[{text:m.content}]}));
      const resp=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,{
        method:'POST',signal:abortCtrl?.signal,
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({contents:parts,generationConfig:{maxOutputTokens:maxTok,temperature:temp}})
      });
      if(!resp.ok){let e='Gemini API '+resp.status;try{const j=await resp.json();e=j.error?.message||e;}catch{}throw new Error(e);}
      const j=await resp.json();
      return{stream:false,text:j.candidates?.[0]?.content?.parts?.[0]?.text||''};
    }
    // Ollama direct fallback — always try local first when bridge is down (Axiom A3)
    if (provider === 'ollama' || provider === 'local' || provider === 'auto' || !provider) {
      const ollamaUrl = (() => { try { return JSON.parse(localStorage.getItem('nx6_cfg')||'{}').ollamaUrl || 'http://localhost:11434'; } catch { return 'http://localhost:11434'; } })();
      const ollamaModel = (() => { try { return JSON.parse(localStorage.getItem('nx6_cfg')||'{}').ollamaModel || 'deepseek-r1:8b'; } catch { return 'deepseek-r1:8b'; } })();
      try {
        if (stream) {
          // Streaming: Ollama returns NDJSON — readStream handles it via result.ollama flag
          const resp = await fetch(ollamaUrl + '/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: abortCtrl?.signal,
            body: JSON.stringify({ model: ollamaModel, messages, stream: true }),
          });
          if (!resp.ok) throw new Error('Ollama ' + resp.status);
          return { stream: true, body: resp.body, bridge: false, ollama: true };
        } else {
          // Non-streaming: simple JSON response
          const resp = await fetch(ollamaUrl + '/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: abortCtrl?.signal,
            body: JSON.stringify({ model: ollamaModel, messages, stream: false }),
          });
          if (!resp.ok) throw new Error('Ollama ' + resp.status);
          const j = await resp.json();
          return { stream: false, text: j.message?.content || j.response || '' };
        }
      } catch (ollamaErr) {
        throw new Error('Bridge offline + Ollama unreachable (' + ollamaErr.message + '). Start Ollama: ollama serve');
      }
    }
    // No key available — tell user clearly
    throw new Error('Bridge offline (' + bridgeErr.message + ') and no API key set. Add a key in Options, or install Ollama (free, local): https://ollama.ai');
  }
}


async function readStream(result,onChunk){
  const reader=result.body.getReader();
  const dec=new TextDecoder();
  let full='';
  let buf=''; // buffer incomplete lines across chunks
  while(true){
    const{done,value}=await reader.read();
    if(done)break;
    buf+=dec.decode(value,{stream:true});
    const lines=buf.split('\n');
    buf=lines.pop()||''; // keep last incomplete line in buffer
    for(const line of lines){
      const trimmed=line.trim();
      if(!trimmed)continue;
      // Determine format: SSE ("data: ...") or NDJSON (raw JSON)
      let raw=trimmed;
      if(trimmed.startsWith('data:')){
        raw=trimmed.slice(5).trim();
        if(raw==='[DONE]')continue;
      }
      try{
        const j=JSON.parse(raw);
        let text='';
        // Ollama NDJSON: {message:{content:"..."}, done:bool}
        if(result.ollama||j.message?.content!==undefined){
          text=j.message?.content||j.response||'';
          if(j.done&&!text)continue; // final done packet with no content
        }
        else if(result.openai)text=j.choices?.[0]?.delta?.content||'';
        else if(result.claude||(!result.bridge&&!result.openai&&!result.ollama)){
          if(j.type==='content_block_delta')text=j.delta?.text||'';
        } else {
          // Bridge-proxied: universal format detection
          if(j.type==='content_block_delta')text=j.delta?.text||'';
          else if(j.choices)text=j.choices[0]?.delta?.content||'';
          else if(j.message?.content!==undefined)text=j.message.content||'';
          else if(j.text)text=j.text;
          else if(j.response)text=j.response;
        }
        if(text){full+=text;onChunk(text,full);}
      }catch{}
    }
  }
  // Process any remaining buffered content
  if(buf.trim()){
    try{
      const j=JSON.parse(buf.trim());
      const text=j.message?.content||j.response||j.text||'';
      if(text){full+=text;onChunk(text,full);}
    }catch{}
  }
  return full;
}

function buildAxiomString(){
  const axioms=AI.axioms[AI.provider]||[];
  if(!axioms.length)return '';
  return 'AXIOMS:\n'+axioms.map((a,i)=>`${i+1}. ${a.text}`).join('\n');
}

/* ─── CONSOLE ─────────────────────────────────────────────────── */
let _convoHistory=[];

function appendMsg(role,text,extraClass=''){
  const out=$('console-output');
  const div=document.createElement('div');div.className='msg'+(extraClass?' '+extraClass:'');div.dataset.role=role;
  div.innerHTML=`<div class="msg-role">${esc(role.toUpperCase())}</div><div class="msg-ts">${ts()}</div><div class="msg-body">${esc(text)}</div>`;
  out.appendChild(div);scrollBot(out);
  return div.querySelector('.msg-body');
}

async function consoleSubmit(){
  const input=$('console-input');
  const text=input.value.trim();if(!text||document.body.dataset.loading==='true')return;
  input.value='';
  appendMsg('user',text);
  _convoHistory.push({role:'user',content:text});
  if(_convoHistory.length > 200) _convoHistory.splice(0, _convoHistory.length - 200);
  // log to idea tracker
  logIdea('input',text);
  document.body.dataset.loading='true';
  setPill('pill-ai','busy','THINKING');
  const bodyEl=appendMsg('assistant','','cur');
  _llm_count++;
  const isPilot=$('mode-pilot').classList.contains('active');
  const activeEng=document.querySelector('.eng-pill.active-er, .eng-pill.active-ht, .eng-pill.active-dr');
  const engCtx=activeEng?getEngineCtx(activeEng.dataset.eng):'';
  const depth=document.querySelector('.depth-btn.active')?.dataset.depth||'full';
  const depthNote=depth==='quick'?'Be concise.':depth==='off'?'Minimal engine context.':'Apply full engine analysis.';
  const sys=val('system-prompt')||'You are NEXUS AI.';
  const msgs=[{role:'system',content:`${sys}\n\n${engCtx}\n\n${buildAxiomString()}\n\n${depthNote}${isPilot?'\n\nPILOT MODE: Full system context active. Access all engine frameworks simultaneously.':''}`},..._convoHistory];
  try{
    abortCtrl=new AbortController();
    const result=await aiChat(msgs);
    let full='';
    if(result.stream){full=await readStream(result,(c,all)=>{bodyEl.textContent=all;scrollBot($('console-output'));});}
    else{full=result.text;bodyEl.textContent=full;}
    bodyEl.parentElement?.classList.remove('cur');
    _convoHistory.push({role:'assistant',content:full});
    // Log output + pipe to Claude chat
    logIdea('output',full);
    chatPipeSend('output',text,full);
    log_ev('llm:response',{chars:full.length,engine:activeEng?.dataset.eng||'none'},'LLM');
    setPill('pill-ai','ok',AI.provider.toUpperCase());
    if($('hm-llm'))$('hm-llm').textContent=_llm_count;
  }catch(e){
    bodyEl.parentElement?.classList.remove('cur');
    if(e.name==='AbortError'){
      bodyEl.textContent='[aborted]';
    } else {
      const msg = e.message || '';
      // Detect specific error types and show actionable guidance
      let displayMsg = msg;
      if(msg.includes('No accounts found') || msg.includes('Add an account first')) {
        const prov = (msg.match(/provider="([^"]+)"/) || [])[1] || AI.provider;
        displayMsg = '⚠ No AI configured for ' + prov + '.\n\n' +
          'Options:\n' +
          '1. Guardian mode (no API key): OPTIONS → CONSOLE → Guardian Wiring → pick your AI tab callto\n' +
          '2. Ollama local (free): install ollama.ai, run: ollama serve, then: ollama pull deepseek-r1:8b\n' +
          '3. API key: OPTIONS → AI SETTINGS → ' + prov + ' → enter key\n\n' +
          'Then switch AI mode: HOME → AI CONNECTION → select mode';
        toast('⚠ No AI connected — see console for setup guide', 'warn', 6000);
      } else if(msg.includes('Bridge offline') || msg.includes('bridge') && msg.includes('offline')) {
        displayMsg = '⚠ Bridge offline and no direct AI configured.\n\n' +
          'The bridge starts automatically with NEXUS. If running in dev mode:\n' +
          '  node bridge/nexus-bridge-server.js\n\n' +
          'Or use Guardian mode (OPTIONS → CONSOLE → Guardian Wiring).';
        toast('⚠ Bridge offline — see console', 'warn', 5000);
      } else if(msg.includes('No AI provider') || msg.includes('no API key')) {
        displayMsg = '⚠ No AI provider configured.\n\nGo to: OPTIONS → CONSOLE → Guardian Wiring (no API key needed)\nOr: OPTIONS → AI SETTINGS → add an API key';
        toast('⚠ Configure an AI provider first', 'warn', 5000);
      }
      appendMsg('error', displayMsg);
      log_ev('llm:error',{msg:e.message},'ERROR');
    }
    setPill('pill-ai','err','ERROR');
  }finally{document.body.dataset.loading='false';abortCtrl=null;}
}

function getEngineCtx(key){
  const eng=ENGINES[key];if(!eng)return '';
  return `[${eng.name} ENGINE ACTIVE]\n${eng.description}\nPrinciples: ${eng.corePrinciples}\nLayers: ${eng.layers.join(', ')}`;
}

/* ─── PILL ────────────────────────────────────────────────────── */
function setPill(id,state,txt){
  const el=$(id);if(!el)return;
  el.className='pill pill-'+state;
  const dot=el.querySelector('.pill-dot');const span=el.querySelector('span');
  if(dot){if(state==='ok')dot.style.background='var(--g)';else if(state==='err')dot.style.background='var(--r)';else if(state==='busy')dot.style.background='var(--y)';else dot.style.background='';}
  if(span&&txt)span.textContent=txt;
}

/* ─── PROJECTS ────────────────────────────────────────────────── */
function getProjects(){try{return JSON.parse(localStorage.getItem('nx5_projects')||'[]');}catch{return[];}}
function saveProjects(arr){localStorage.setItem('nx5_projects',JSON.stringify(arr));}

function renderProjects(){
  const grid=$('proj-grid');if(!grid)return;
  const projs=getProjects();
  const q=(val('proj-search')||'').toLowerCase();
  const filtered=q?projs.filter(p=>p.name.toLowerCase().includes(q)||p.description?.toLowerCase().includes(q)):projs;
  $('proj-count').textContent=filtered.length+' projects';
  if(!filtered.length){grid.innerHTML='<div style="font-size:11px;color:var(--text3);font-style:italic;grid-column:1/-1;padding:20px 0">No projects found.</div>';return;}
  grid.innerHTML='';
  filtered.forEach(p=>{
    const div=document.createElement('div');div.className='pcard';
    const d=p.updated_at?new Date(p.updated_at).toLocaleString():'—';
    const lines=p.code?p.code.split('\n').length:0;
    div.innerHTML=`<div class="pcard-head"><div class="pcard-name">${esc(p.name)}</div><div style="display:flex;gap:4px"><button class="btn info" style="font-size:8px;padding:1px 6px" onclick="openProjectWorkspace('${p.id}')">OPEN</button><button class="btn danger" style="font-size:8px;padding:1px 6px" onclick="deleteProject('${p.id}')">×</button></div></div><div class="pcard-body"><div style="font-size:10px;color:var(--text2);margin-bottom:6px">${esc(p.description||'')}</div><div style="display:flex;gap:10px;font-size:9px;color:var(--text3)"><span>${lines} lines</span><span>Updated: ${d}</span></div></div>`;
    grid.appendChild(div);
  });
  updateSelectors();
  if(_workspaceMode==='build')buildModeRender();
}

function renderRecentProjects(){
  const el=$('home-recent-projects');if(!el)return;
  const projs=getProjects().slice().sort((a,b)=>new Date(b.updated_at||0)-new Date(a.updated_at||0)).slice(0,5);
  if(!projs.length){el.innerHTML='<div style="font-size:11px;color:var(--text3);font-style:italic">No projects yet.</div>';return;}
  el.innerHTML=projs.map(p=>`<div class="recent-proj-card" onclick="openProjectWorkspace('${p.id}')"><div class="rpc-dot"></div><div class="rpc-name">${esc(p.name)}</div><div class="rpc-meta">${p.code?p.code.split('\n').length:0} lines · ${p.updated_at?new Date(p.updated_at).toLocaleDateString():''}</div><div style="font-size:9px;color:var(--c)">OPEN →</div></div>`).join('');
}

function saveNewProject(name,code,description=''){
  const projs=getProjects();
  const p={id:uid(),name,description,code,created_at:new Date().toISOString(),updated_at:new Date().toISOString(),features:[],errors:[]};
  projs.unshift(p);saveProjects(projs);renderProjects();renderRecentProjects();
  updateSelectors();
  if($('hm-projects'))$('hm-projects').textContent=projs.length;
  log_ev('project:created',{name});
  // ── Auto-add revision, iteration, and snapshot ──────────────────
  try {
    // Revision (always)
    REV.add(p.id, code, 'auto', 'Initial save — '+new Date().toLocaleTimeString());
    // Snapshot (if snapshot mode is active or gate flag set)
    const snapMode = window.NEXUS_GATE_AUTOSAVE !== false;
    if(snapMode){
      const snapKey = 'nx_snapshots_'+p.id;
      const snaps = JSON.parse(localStorage.getItem(snapKey)||'[]');
      snaps.unshift({id:uid(),ts:new Date().toISOString(),label:'Auto-snapshot: '+name.slice(0,40),code,size:code.length});
      if(snaps.length>50) snaps.length=50;
      localStorage.setItem(snapKey, JSON.stringify(snaps));
    }
    // Iteration counter
    const iterKey = 'nx_iter_'+p.id;
    localStorage.setItem(iterKey, JSON.stringify({count:1,lastTs:new Date().toISOString()}));
    log_ev('revision:auto',{projectId:p.id,name});
  } catch(e){ console.warn('[NEXUS] Auto-revision failed:',e.message); }
  toast('Project saved: '+name,'ok');
  return p;
}

function deleteProject(id){
  if(!confirm('Delete this project?'))return;
  saveProjects(getProjects().filter(p=>p.id!==id));
  renderProjects();renderRecentProjects();
  if($('proj-workspace').classList.contains('open')&&_wsProject?.id===id)projCloseWorkspace();
}

function updateSelectors(){
  const projs=getProjects();
  ['proj-select','docs-proj-sel','feat-proj-sel','err-proj-sel','enh-project-sel','it-proj-filter','rm-project-filter'].forEach(id=>{
    const s=$(id);if(!s)return;const c=s.value;
    const base=id==='rm-project-filter'?'<option value="">All Projects</option>':'<option value="">— Select Project —</option>';
    s.innerHTML=base+projs.map(p=>`<option value="${p.id}">${esc(p.name.slice(0,40))}</option>`).join('');
    s.value=c;
  });
}

/* ─── PROJECT WORKSPACE ───────────────────────────────────────── */
let _wsProject=null;

function openProjectWorkspace(id){
  const p=getProjects().find(x=>x.id===id);if(!p)return;
  _wsProject=p;
  $('proj-gallery-view').style.display='none';
  $('proj-workspace').classList.add('open');
  $('ws-proj-name').textContent=p.name;
  $('ws-proj-meta').textContent=(p.code?p.code.split('\n').length:0)+' lines · '+new Date(p.updated_at||Date.now()).toLocaleDateString();
  $('ws-code-editor').value=p.code||'';
  wsRenderRevisions();
  wsRenderRoadmap();
  switchTab('projects');
  log_ev('workspace:open',{id,name:p.name});
}

function projCloseWorkspace(){
  _wsProject=null;
  $('proj-gallery-view').style.display='flex';
  $('proj-workspace').classList.remove('open');
  renderProjects();
}

function wsSwitchTab(btn,name){
  document.querySelectorAll('.pwt').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.pwt-panel').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  $('ws-'+name)?.classList.add('active');
  if(name==='preview')wsRefreshPreview();
  if(name==='revisions')wsRenderRevisions();
}

function wsRefreshPreview(){
  const code=$('ws-code-editor').value;
  const frame=$('ws-preview-frame');
  const src=$('ws-preview-source');
  if(code.trim().startsWith('<')&&(code.includes('<html')||code.includes('<!DOCTYPE')||code.includes('<body'))){
    frame.srcdoc=code;if(src)src.style.display='none';
  }else{
    frame.srcdoc=`<!DOCTYPE html><html><head><style>body{background:#05080f;color:#b8cfe0;font-family:monospace;font-size:11px;padding:14px;white-space:pre-wrap;}</style></head><body>${esc(code)}</body></html>`;
  }
}

function wsPreviewSwitch(mode,btn){
  const frame=$('ws-preview-frame'),src=$('ws-preview-source');
  if(mode==='frame'){frame.style.display='';if(src)src.style.display='none';}
  else{if(src){src.style.display='';src.textContent=$('ws-code-editor').value;}frame.style.display='none';}
  btn.parentElement?.querySelectorAll('.preview-tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
}

function wsDownload(){
  if(!_wsProject)return;
  const code=$('ws-code-editor').value;
  const blob=new Blob([code],{type:'text/plain'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=_wsProject.name.replace(/\s+/g,'_')+'.html';a.click();
}

function wsSaveRevision(type='manual'){
  if(!_wsProject)return;
  const code=$('ws-code-editor').value;
  // Update project code
  const projs=getProjects();const idx=projs.findIndex(p=>p.id===_wsProject.id);
  if(idx>=0){projs[idx].code=code;projs[idx].updated_at=new Date().toISOString();saveProjects(projs);_wsProject=projs[idx];}
  REV.add(_wsProject.id,code,type,type==='manual'?'Manual save':'Auto-save');
  wsRenderRevisions();
  toast('Revision saved','ok');
}

function wsRenderRevisions(){
  if(!_wsProject)return;
  const revs=REV.getAll(_wsProject.id);
  $('ws-rev-count').textContent=revs.length;
  const tl=$('ws-rev-timeline');if(!tl)return;
  tl.innerHTML='';
  if(!revs.length){tl.innerHTML='<div style="padding:12px;font-size:10px;color:var(--text3);font-style:italic">No revisions yet.</div>';return;}
  revs.forEach((rev,i)=>{
    const div=document.createElement('div');div.className='rev-item'+(i===0?' current':'');
    div.innerHTML=`<div class="rev-dot ${rev.type}"></div><div class="rev-name">${esc(rev.label)}</div><div class="rev-ts">${rev.ts.slice(11,19)}</div><div style="display:flex;gap:4px"><button class="btn" style="font-size:8px;padding:1px 6px" onclick="wsRestoreRevision('${rev.id}')">RESTORE</button></div>`;
    tl.appendChild(div);
  });
  // Update global rev count
  const totalRevs=getProjects().reduce((sum,p)=>sum+REV.getAll(p.id).length,0);
  if($('hm-revisions'))$('hm-revisions').textContent=totalRevs;
}

function wsRestoreRevision(revId){
  if(!_wsProject)return;
  const rev=REV.restore(_wsProject.id,revId);if(!rev)return;
  REV.add(_wsProject.id,$('ws-code-editor').value,'auto','Pre-restore backup');
  $('ws-code-editor').value=rev.code;
  wsSaveRevision('auto');
  wsRenderRevisions();
  toast('Revision restored','ok');
}

async function wsAudit(){wsSwitchTab(document.querySelector('.pwt[data-pwt="audit"]'),'audit');wsRunAudit();}
async function wsEnhance(){
  // Load this project into enhance tab and switch
  setVal('enh-project-sel',_wsProject?.id||'');enhLoadProject();switchTab('enhance');
}

async function wsRunAudit(){
  if(!_wsProject){toast('No project open','warn');return;}
  const panel=$('ws-audit-panel');
  panel.innerHTML='<div style="padding:12px;color:var(--text3)">Running recursive audit…</div>';
  const code=$('ws-code-editor').value||_wsProject.code||'';
  const msgs=[
    {role:'system',content:`You are the NEXUS Recursive Auditor. Perform a THOROUGH audit covering: 1) UI/UX issues (broken elements, missing handlers, layout bugs), 2) Logic errors (broken functions, null refs, async issues), 3) Security vulnerabilities, 4) Performance bottlenecks, 5) Failure modes (what breaks under load/edge cases), 6) Missing features implied by the code structure. Score 0-100. Output JSON: {"score":85,"summary":"brief","categories":[{"name":"Category","items":[{"severity":"error|warn|ok|info|idea","message":"description"}]}]}`},
    {role:'user',content:`RECURSIVE AUDIT:\n\`\`\`\n${code.slice(0,14000)}\n\`\`\`\nReturn ONLY JSON.`}
  ];
  try{
    abortCtrl=new AbortController();
    const result=await aiChat(msgs,{temperature:0.2,max_tokens:4096,stream:false});
    const text=result.stream?await readStream(result,()=>{}):result.text;
    let audit={score:0,summary:'',categories:[]};
    try{audit=JSON.parse(text.replace(/```json|```/g,'').trim());}catch{const m=text.match(/\{[\s\S]*\}/);if(m)try{audit=JSON.parse(m[0]);}catch{}}
    panel.innerHTML='';
    const sc=audit.score>=80?'var(--g)':audit.score>=50?'var(--y)':'var(--r)';
    panel.innerHTML+=`<div class="audit-score"><div class="audit-score-item"><div class="audit-score-val" style="color:${sc}">${audit.score||'?'}</div><div class="audit-score-lbl">SCORE</div></div><div class="audit-score-item" style="flex:1;text-align:left;padding-left:16px"><div style="font-size:10px;color:var(--text2);line-height:1.6">${esc(audit.summary||'')}</div></div></div>`;
    (audit.categories||[]).forEach(cat=>{
      const sec=document.createElement('div');sec.className='audit-section';
      const items=(cat.items||[]).map(i=>`<div class="audit-row"><div class="audit-sev ${i.severity||'info'}">${(i.severity||'INFO').toUpperCase()}</div><div class="audit-msg">${esc(i.message||'')}</div></div>`).join('');
      const ec=(cat.items||[]).filter(i=>i.severity==='error').length,wc=(cat.items||[]).filter(i=>i.severity==='warn').length;
      sec.innerHTML=`<div class="audit-section-head"><span>${esc(cat.name||'')}</span><span style="font-size:9px;color:var(--text3);margin-left:auto">${ec?ec+'E ':''} ${wc?wc+'W ':''}</span></div><div class="audit-section-body">${items||'<div style="font-size:10px;color:var(--g)">✓ No issues</div>'}</div>`;
      panel.appendChild(sec);
    });
    log_ev('audit:complete',{score:audit.score,proj:_wsProject.name},'LLM');
  }catch(e){panel.innerHTML=`<div style="padding:12px;color:var(--r)">Audit error: ${esc(e.message)}</div>`;}
  finally{abortCtrl=null;}
}

/* ─── PROJECT WORKSPACE ROADMAP ───────────────────────────────── */
const RM_COLS=['backlog','todo','in_progress','review','done'];
const RM_COLORS={backlog:'var(--text3)',todo:'var(--c)',in_progress:'var(--y)',review:'var(--o)',done:'var(--g)'};

function wsRenderRoadmap(){
  if(!_wsProject)return;
  const board=$('ws-rm-board');if(!board)return;
  const items=((_wsProject.roadmap)||[]);
  board.innerHTML='';
  RM_COLS.forEach(col=>{
    const d=document.createElement('div');d.className='rm-col';
    const colItems=items.filter(i=>i.phase===col);
    d.innerHTML=`<div class="rm-col-head"><span style="color:${RM_COLORS[col]}">${col.replace(/_/g,' ').toUpperCase()}</span><span style="font-size:9px;color:var(--text3);margin-left:auto">${colItems.length}</span></div><div class="rm-col-body" data-col="${col}"></div>`;
    const body=d.querySelector('.rm-col-body');
    colItems.forEach(item=>{
      const card=document.createElement('div');card.className='rm-card';card.draggable=true;card.dataset.id=item.id;
      card.innerHTML=`<div class="rm-card-title">${esc(item.title)}</div><div class="rm-card-meta">Pri: ${item.priority||'—'}</div>`;
      card.addEventListener('dragstart',e=>e.dataTransfer.setData('text/plain',item.id));
      body.appendChild(card);
    });
    body.addEventListener('dragover',e=>{e.preventDefault();body.style.background='rgba(0,212,255,.03)';});
    body.addEventListener('dragleave',()=>body.style.background='');
    body.addEventListener('drop',e=>{
      e.preventDefault();body.style.background='';
      const id2=e.dataTransfer.getData('text/plain');
      const item=items.find(i=>i.id===id2);if(item){item.phase=col;wsUpdateRoadmap(items);}
    });
    board.appendChild(d);
  });
}

function wsAddRoadmapItem(){
  if(!_wsProject)return;
  const title=prompt('Item title:');if(!title)return;
  const items=(_wsProject.roadmap||[]);
  items.push({id:uid(),title,phase:'backlog',priority:'medium'});
  wsUpdateRoadmap(items);
}

function wsUpdateRoadmap(items){
  const projs=getProjects();const idx=projs.findIndex(p=>p.id===_wsProject?.id);
  if(idx>=0){projs[idx].roadmap=items;saveProjects(projs);_wsProject=projs[idx];}
  wsRenderRoadmap();
}

/* ─── GLOBAL ROADMAP ──────────────────────────────────────────── */
function populateRmFilter(){
  const s=$('rm-project-filter');if(!s)return;
  const c=s.value;s.innerHTML='<option value="">All Projects</option>';
  getProjects().forEach(p=>{s.innerHTML+=`<option value="${p.id}">${esc(p.name.slice(0,30))}</option>`;});
  s.value=c;
}
function renderRoadmap(){
  const board=$('rm-board');if(!board)return;
  const proj=val('rm-project-filter');
  let allItems=[];
  getProjects().forEach(p=>{if(!proj||p.id===proj)(p.roadmap||[]).forEach(i=>allItems.push({...i,_projName:p.name}));});
  $('rm-count').textContent=allItems.length+' items';
  board.innerHTML='';
  RM_COLS.forEach(col=>{
    const d=document.createElement('div');d.className='rm-col';
    const colItems=allItems.filter(i=>i.phase===col);
    d.innerHTML=`<div class="rm-col-head"><span style="color:${RM_COLORS[col]}">${col.replace(/_/g,' ').toUpperCase()}</span><span style="font-size:9px;color:var(--text3);margin-left:auto">${colItems.length}</span></div><div class="rm-col-body" data-col="${col}"></div>`;
    const body=d.querySelector('.rm-col-body');
    colItems.forEach(item=>{
      const card=document.createElement('div');card.className='rm-card';
      card.innerHTML=`<div class="rm-card-title">${esc(item.title)}</div><div class="rm-card-meta">${esc(item._projName||'')} · ${item.priority||'—'}</div>`;
      body.appendChild(card);
    });
    board.appendChild(d);
  });
}
$('rm-add-btn')?.addEventListener('click',()=>{
  const projs=getProjects();if(!projs.length){toast('No projects yet','warn');return;}
  const title=prompt('Item title:');if(!title)return;
  const proj=projs[0];
  if(!proj.roadmap)proj.roadmap=[];
  proj.roadmap.push({id:uid(),title,phase:'backlog',priority:'medium'});
  const all=getProjects();const idx=all.findIndex(p=>p.id===proj.id);
  if(idx>=0){all[idx]=proj;saveProjects(all);}
  renderRoadmap();
});

/* ─── IDEA TRACKER ────────────────────────────────────────────── */
function getIdeas(){try{return JSON.parse(localStorage.getItem('nx5_ideas')||'[]');}catch{return[];}}
function saveIdeas(arr){localStorage.setItem('nx5_ideas',JSON.stringify(arr));}

function logIdea(type,content,projectId='',meta={}){
  const ideas=getIdeas();
  const entry={id:uid(),type,content:String(content).slice(0,4000),projectId,ts:new Date().toISOString(),meta};
  ideas.unshift(entry);
  if(ideas.length>2000)ideas.length=2000;
  saveIdeas(ideas);
  // update badge
  const cnt=document.getElementById('idea-count-badge');if(cnt)cnt.textContent=ideas.length;
  if($('hm-ideas'))$('hm-ideas').textContent=ideas.length;
  // push to idea panel sidebar in console
  pushIdeaCard(entry);
  renderIdeas();
}

function pushIdeaCard(entry){
  const feed=$('idea-feed');if(!feed)return;
  const d=document.createElement('div');d.className=`idea-card ${entry.type}`;
  const preview=entry.content.slice(0,120)+(entry.content.length>120?'…':'');
  d.innerHTML=`<div class="idea-card-head"><span>${entry.type.toUpperCase()}</span><span>${entry.ts.slice(11,19)}</span></div><div class="idea-card-body">${esc(preview)}</div>`;
  feed.insertBefore(d,feed.firstChild);
  while(feed.children.length>50)feed.lastChild?.remove();
}

function renderIdeas(){
  const feed=$('it-feed');if(!feed)return;
  const all=getIdeas();
  const typeF=val('it-type-filter');const projF=val('it-proj-filter');const q=(val('it-search')||'').toLowerCase();
  const filtered=all.filter(e=>{
    if(typeF&&e.type!==typeF)return false;
    if(projF&&e.projectId!==projF)return false;
    if(q&&!e.content.toLowerCase().includes(q))return false;
    return true;
  });
  // stats
  const inputs=all.filter(e=>e.type==='input').length;
  const outputs=all.filter(e=>e.type==='output').length;
  const ideas=all.filter(e=>e.type==='idea').length;
  const errors=all.filter(e=>e.type==='error').length;
  setEl('it-total',all.length);setEl('it-inputs',inputs);setEl('it-outputs',outputs);setEl('it-ideas-count',ideas);setEl('it-errors-count',errors);
  if($('hm-ideas'))$('hm-ideas').textContent=all.length;

  if(!filtered.length){feed.innerHTML='<div style="font-size:11px;color:var(--text3);font-style:italic;padding:20px">No entries match filter.</div>';return;}
  feed.innerHTML='';
  filtered.slice(0,200).forEach(entry=>{
    const div=document.createElement('div');div.className=`it-item ${entry.type}-row`;
    const projName=entry.projectId?getProjects().find(p=>p.id===entry.projectId)?.name||entry.projectId:'';
    div.innerHTML=`<div class="it-item-head"><span class="it-item-type" style="color:${entry.type==='input'?'var(--c)':entry.type==='output'?'var(--o)':entry.type==='idea'?'var(--m)':'var(--r)'}">${entry.type.toUpperCase()}</span>${projName?`<span class="it-item-proj">${esc(projName.slice(0,20))}</span>`:''}<span class="it-item-ts">${entry.ts.slice(0,16)}</span></div><div class="it-item-body">${esc(entry.content.slice(0,500))}</div>`;
    feed.appendChild(div);
  });
}

function setEl(id,v){const el=$(id);if(el)el.textContent=v;}

function ideaExport(){
  const ideas=getIdeas();
  const blob=new Blob([JSON.stringify(ideas,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='nexus-ideas-'+Date.now()+'.json';a.click();
}
function ideaClear(){if(!confirm('Clear all idea entries?'))return;saveIdeas([]);renderIdeas();toast('Ideas cleared','warn');}

/* ─── CLAUDE CHAT PIPE (Guardian hook) ─────────────────────── */
const PIPE={url:'',label:'',active:false,autoPipe:false,ideasOnly:false,_win:null};

/* ── Guardian Idea Tracker — opens a real browser window ──────
   Flow:
   1. User clicks OPEN CHAT WINDOW
   2. A new browser window opens at claude.ai/chats (or custom URL)
   3. User navigates to any chat they want
   4. They click the injected "⟁ SET CHAT" button in the page
   5. NEXUS receives the current URL via postMessage, saves it
   6. All future AI outputs pipe into that chat automatically
   ─────────────────────────────────────────────────────────────── */

function chatPipeOpenWindow(){
  const startUrl=val('opt-pipe-url')||val('chat-pipe-url')||'https://claude.ai/chats';
  // In Electron/Guardian context, go through IPC
  if(window.nexus?.guardian?.openChatPicker){
    window.nexus.guardian.openChatPicker(startUrl).then(result=>{
      if(result?.url){chatPipeSetFromUrl(result.url,result.title||'Claude Chat');}
    }).catch(e=>toast('Guardian error: '+e.message,'err'));
    return;
  }
  // Browser fallback: open popup with injected SET CHAT button
  const win=window.open(startUrl,'nexus-chat-picker',
    'width=1200,height=800,toolbar=1,location=1,status=1,menubar=0,scrollbars=1');
  PIPE._win=win;
  if(!win){toast('Popup blocked — allow popups for this page','warn');return;}
  // Inject SET CHAT button once window loads
  const inject=()=>{
    try{
      if(win.closed){PIPE._win=null;return;}
      const doc=win.document;
      if(!doc.getElementById('nexus-set-chat-btn')){
        const btn=doc.createElement('div');
        btn.id='nexus-set-chat-btn';
        btn.style.cssText='position:fixed;top:12px;right:12px;z-index:999999;background:#00d4ff;color:#05080f;font-family:monospace;font-size:13px;font-weight:bold;padding:8px 16px;border-radius:4px;cursor:pointer;box-shadow:0 2px 12px rgba(0,212,255,.4);letter-spacing:.05em;user-select:none;';
        btn.textContent='⟁ SET CHAT';
        btn.onclick=()=>{
          const url=win.location.href;
          const title=win.document.title||'Claude Chat';
          window.postMessage({type:'NEXUS_SET_CHAT',url,title},'*');
          btn.textContent='✓ CHAT SET!';
          btn.style.background='#00ff88';
          setTimeout(()=>win.close(),800);
        };
        doc.body.appendChild(btn);
      }
    }catch(e){/* cross-origin, can't inject */}
  };
  // Try to inject periodically until window closes
  const timer=setInterval(()=>{
    if(!win||win.closed){clearInterval(timer);PIPE._win=null;return;}
    inject();
  },500);
  const st=$('status-pipe');
  if(st){st.textContent='Window open — navigate to a chat and click ⟁ SET CHAT';st.dataset.ok='warn';}
  toast('Navigate to a Claude chat and click ⟁ SET CHAT','ok',5000);
}

// Listen for SET CHAT message from popup
window.addEventListener('message',e=>{
  if(e.data?.type==='NEXUS_SET_CHAT'){
    chatPipeSetFromUrl(e.data.url,e.data.title||'Claude Chat');
  }
});

function chatPipeSetFromUrl(url,title){
  PIPE.url=url;PIPE.label=title;PIPE.active=true;
  setVal('opt-pipe-url',url);setVal('chat-pipe-url',url);
  setVal('opt-pipe-label',title);setVal('chat-pipe-label',title);
  localStorage.setItem('nx5_pipe',JSON.stringify(PIPE));
  updatePipeUI();
  const st=$('status-pipe');
  if(st){st.textContent='✓ Chat linked: '+title;st.dataset.ok='true';}
  toast('✓ Chat pipe set: '+title,'ok',3000);
  log_ev('pipe:set',{url,title});
}

function chatPipeConnect(){
  const url=val('chat-pipe-url')||val('opt-pipe-url');
  const label=val('chat-pipe-label')||val('opt-pipe-label')||'Claude Chat';
  if(!url){chatPipeOpenWindow();return;}
  chatPipeSetFromUrl(url,label);
}

function chatPipeDisconnect(){
  PIPE.active=false;PIPE.url='';PIPE.label='';
  if(PIPE._win&&!PIPE._win.closed)PIPE._win.close();
  PIPE._win=null;
  updatePipeUI();localStorage.removeItem('nx5_pipe');
  toast('Chat pipe disconnected','warn');
  log_ev('pipe:disconnect',{});
}

function updatePipeUI(){
  const active=PIPE.active;
  // Status box
  const dot=$('pipe-status-dot');
  const label=$('pipe-status-label');
  const urlEl=$('pipe-status-url');
  if(dot){dot.style.background=active?'var(--g)':'var(--text4)';dot.style.boxShadow=active?'0 0 6px rgba(0,255,136,.5)':'';}
  if(label){label.textContent=active?(PIPE.label||'CONNECTED'):'NOT CONNECTED';label.style.color=active?'var(--g)':'var(--text3)';}
  if(urlEl){urlEl.textContent=active?PIPE.url:'';}
  // Open btn text
  const owb=$('pipe-open-btn');
  if(owb)owb.textContent=active?'↻ CHANGE CHAT':'⟁ OPEN CHAT WINDOW';
  // Badge in acc-head
  const pb=$('pipe-acc-badge');
  if(pb){pb.textContent=active?(PIPE.label||'ONLINE'):'OFFLINE';pb.style.color=active?'var(--g)':'var(--text3)';}
  // Home metric
  const hm=$('hm-pipe');if(hm){hm.textContent=active?(PIPE.label||'ONLINE'):'OFFLINE';hm.style.color=active?'var(--g)':'var(--text3)';}
  // stat-row
  const sp=$('status-pipe');
  if(sp){sp.textContent=active?'✓ Piping to: '+PIPE.label:'Not connected';sp.dataset.ok=active?'true':'false';}
  // Ideas sidebar chat link
  const box=$('chat-link-box');const val2=$('chat-link-val');
  if(box)box.style.display=active?'':'none';
  if(val2)val2.textContent=PIPE.label||PIPE.url||'—';
}

function chatPipeSend(type,input,output){
  if(!PIPE.active)return;
  logIdea('idea',`[NEXUS→CLAUDE]\nInput: ${input.slice(0,200)}\nOutput: ${output.slice(0,500)}`,'');
  // In Electron: inject into the linked chat via Guardian
  if(window.nexus?.guardian?.sendToChat){
    const msg=`**[NEXUS ${type.toUpperCase()}]**\n\n${type==='input'?input:output}`.slice(0,1000);
    window.nexus.guardian.sendToChat(PIPE.url,msg).catch(()=>{});
  }
}

/* ─── GITHUB ──────────────────────────────────────────────────── */
const GH={token:'',repo:'',branch:'main'};
function ghSave(){GH.token=val('opt-gh-token')||val('gh-token');GH.repo=val('opt-gh-repo')||val('gh-repo');GH.branch=val('opt-gh-branch')||val('gh-branch')||'main';localStorage.setItem('nx5_gh',JSON.stringify(GH));toast('GitHub config saved','ok');closeModal('github-modal');}
function ghTest(){
  const st=$('status-github');if(st){st.textContent='Testing…';st.dataset.ok='warn';}
  fetch(`https://api.github.com/user`,{headers:{'Authorization':'token '+(GH.token||val('opt-gh-token')||val('gh-token'))}})
    .then(r=>r.json()).then(j=>{if(j.login){if(st){st.textContent='✓ Connected as @'+j.login;st.dataset.ok='true';}toast('GitHub connected: @'+j.login,'ok');}else throw new Error(j.message);})
    .catch(e=>{if(st){st.textContent='✗ '+e.message;st.dataset.ok='false';}toast('GitHub error: '+e.message,'err');});
}

async function wsGithubPush(){
  if(!_wsProject){toast('No project open','warn');return;}
  if(!GH.token||!GH.repo){openModal('github-modal');return;}
  const code=$('ws-code-editor').value||_wsProject.code||'';
  const filename=_wsProject.name.replace(/\s+/g,'_').toLowerCase()+'.html';
  const msg=prompt('Commit message:','Update '+_wsProject.name);if(!msg)return;
  try{
    // Check if file exists
    const check=await fetch(`https://api.github.com/repos/${GH.repo}/contents/${filename}?ref=${GH.branch}`,{headers:{'Authorization':'token '+GH.token}});
    let sha='';
    if(check.ok){const j=await check.json();sha=j.sha;}
    const body={message:msg,content:btoa(unescape(encodeURIComponent(code))),branch:GH.branch};
    if(sha)body.sha=sha;
    const resp=await fetch(`https://api.github.com/repos/${GH.repo}/contents/${filename}`,{method:'PUT',headers:{'Authorization':'token '+GH.token,'Content-Type':'application/json'},body:JSON.stringify(body)});
    if(resp.ok){toast('Pushed to GitHub: '+filename,'ok');log_ev('github:push',{repo:GH.repo,file:filename});}
    else throw new Error((await resp.json()).message);
  }catch(e){toast('Push failed: '+e.message,'err');log_ev('github:error',{msg:e.message},'ERROR');}
}
async function wsGithubPull(){
  if(!_wsProject||!GH.token||!GH.repo){openModal('github-modal');return;}
  const filename=_wsProject.name.replace(/\s+/g,'_').toLowerCase()+'.html';
  try{
    const resp=await fetch(`https://api.github.com/repos/${GH.repo}/contents/${filename}?ref=${GH.branch}`,
      {headers:{'Authorization':'token '+GH.token}});
    if(resp.status===404){toast('File not on GitHub yet — push first','warn');return;}
    if(!resp.ok)throw new Error('GitHub '+resp.status);
    const j=await resp.json();
    const decoded=decodeURIComponent(escape(atob(j.content.replace(/\n/g,''))));
    const ed=document.getElementById('ws-code-editor');
    if(ed){ed.value=decoded;ed.dispatchEvent(new Event('input',{bubbles:true}));}
    if(typeof _generatedCode!=='undefined')window._generatedCode=decoded;
    if(typeof forgeHistoryPush==='function')forgeHistoryPush(decoded);
    log_ev('github:pull',{repo:GH.repo,file:filename,size:decoded.length});
    toast('Pulled from GitHub: '+filename,'ok');
  }catch(e){toast('Pull failed: '+e.message,'err');log_ev('github:error',{msg:e.message},'ERROR');}
}
function wsGithubHistory(){if(!GH.repo)return;window.open(`https://github.com/${GH.repo}/commits/${GH.branch}`,'_blank');}

/* ─── REVISION SYSTEM ─────────────────────────────────────────── */
const REV={
  getAll(id){try{return JSON.parse(localStorage.getItem('nx5_rev_'+id)||'[]');}catch{return[];}},
  save(id,revs){localStorage.setItem('nx5_rev_'+id,JSON.stringify(revs));},
  add(id,code,type='auto',label=''){
    const revs=this.getAll(id);
    const rev={id:uid(),ts:new Date().toISOString(),type,label:label||('Rev #'+(revs.length+1)),code,lines:code.split('\n').length};
    revs.unshift(rev);if(revs.length>100)revs.length=100;
    this.save(id,revs);
    // Take causal snapshot on every revision so we can replay the exact session
    try {
      if(window.electronAPI){
        window.electronAPI.invoke('nexus:causal-snapshot').then(snap=>{
          if(snap) localStorage.setItem('nx5_causal_snap_'+id+'_'+rev.id, JSON.stringify(snap));
        }).catch(()=>{});
      }
    } catch(_) {}
    log_ev('revision:saved',{id,type,lines:rev.lines});return rev;
  },
  restore(id,revId){return this.getAll(id).find(r=>r.id===revId);},
  // Restore the causal snapshot attached to a revision (for replay)
  getCausalSnap(id,revId){
    try{return JSON.parse(localStorage.getItem('nx5_causal_snap_'+id+'_'+revId)||'null');}catch{return null;}
  },
  // Export all revisions + causal snaps as a backup bundle
  exportBundle(id){
    const revs=this.getAll(id);
    const snaps=revs.map(r=>({revId:r.id,snap:this.getCausalSnap(id,r.id)})).filter(s=>s.snap);
    return {v:1,id,ts:Date.now(),revisions:revs,causalSnapshots:snaps};
  },
  // Import a bundle
  importBundle(bundle){
    if(!bundle||!bundle.revisions) return false;
    this.save(bundle.id,bundle.revisions);
    (bundle.causalSnapshots||[]).forEach(s=>{
      if(s.snap) localStorage.setItem('nx5_causal_snap_'+bundle.id+'_'+s.revId,JSON.stringify(s.snap));
    });
    return true;
  },
};

