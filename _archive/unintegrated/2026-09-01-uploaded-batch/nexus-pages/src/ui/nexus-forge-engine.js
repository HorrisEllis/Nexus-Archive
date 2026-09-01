/* NEXUS v0.53.0 — nexus-forge-engine.js
 * Forge v8 Engine — mode switching, GUI builder, stylesheet editor
 * Phase 0B — extracted 2026-04-07
 */

(function(){
'use strict';

// ── FORGE extended state ──────────────────────────────────────────
Object.assign(FORGE, {
  mode: 'code',           // code | gui | style | web | cli | compile
  guiElements: [],
  guiSelected: null,
  guiHistory: [],
  guiHistoryIdx: -1,
  styleTokens: null,
  webSections: [],
  webActiveSection: null,
  cliSessions: [],
  cliActiveSession: null,
  cliHistory: [],
  cliHistoryIdx: -1,
  compileTarget: null,
  pipelineRunning: false,
  errors: [],
  settingsRegistry: [],
  settingsPresets: {},
});

// ── Mode switching ────────────────────────────────────────────────
window.forgeSwitchMode = function(mode, btn){
  FORGE.mode = mode;
  ['code','gui','style','web','cli','compile'].forEach(m=>{
    const panel = document.getElementById('forge-mode-'+m);
    if(panel) panel.style.display = m===mode ? 'flex' : 'none';
  });
  document.querySelectorAll('.forge-mode-btn').forEach(b=>b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  else { const b=document.getElementById('fmode-btn-'+mode); if(b) b.classList.add('active'); }
  if(mode==='gui')     guiInit();
  if(mode==='style')   styleInit();
  if(mode==='web')     webInit();
  if(mode==='cli')     cliInit();
  if(mode==='compile') compileInit();
};

// ── Sidebar tab switching — bulletproof ──────────────────────────
window.forgeSideTab = function(tab, btn){
  ['files','settings','uce'].forEach(t=>{
    const el=document.getElementById('forge-stab-'+t);
    if(el) el.style.display = t===tab ? 'flex' : 'none';
  });
  document.querySelectorAll('.forge-stab').forEach(b=>b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  else {
    const b = document.querySelector(`.forge-stab[onclick*="'${tab}'"]`);
    if(b) b.classList.add('active');
  }
  if(tab==='settings') { try{forgeSettingsRender();}catch{} nxEnsureGateSettings(); }
  if(tab==='uce') { try{forgeUCEMiniRender();}catch{} }
};

function nxEnsureGateSettings(){
  if(document.getElementById('nx-gate-settings')) return;
  const sideSettings = document.getElementById('forge-stab-settings');
  if(!sideSettings) return;
  const gs = document.createElement('div');
  gs.id = 'nx-gate-settings';
  gs.style.cssText = 'padding:10px 12px;border-top:1px solid var(--border2);flex-shrink:0;';
  gs.innerHTML = `
    <div style="font-family:var(--display);font-size:9px;letter-spacing:.18em;color:var(--c);margin-bottom:8px;">⬡ GATE SETTINGS</div>
    <div style="display:flex;flex-direction:column;gap:5px;">
      ${[
        ['gate-bottomup',   'Bottom-Up Enforce', 'NEXUS_AXIOM_BOTTOM_UP._enabled'],
        ['gate-siso-credit','SISO Credit Footer', 'NEXUS_GATE_SISO_CREDIT'],
        ['gate-dedup',      'Ideas Dedup Check',  'NEXUS_GATE_DEDUP'],
        ['gate-autosave',   'Auto-Save Projects', 'NEXUS_GATE_AUTOSAVE'],
        ['gate-modal',      'Build Progress Modal','NEXUS_GATE_MODAL'],
      ].map(([id,label,flag])=>`
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:9px;color:var(--text3)">${label}</span>
          <label class="chk on" id="${id}" onclick="this.classList.toggle('on');window.${flag}=this.classList.contains('on')"><div class="chk-dot"></div></label>
        </div>`).join('')}
      <div style="margin-top:4px;padding:5px 7px;background:rgba(0,212,255,.03);border:1px solid rgba(0,212,255,.12);border-radius:3px;">
        <div style="font-size:8px;color:var(--text4);line-height:1.5">A0: Build bottom-up always.<br><a href="https://siso-framework.org" style="color:var(--text3);text-decoration:none">siso-framework.org</a></div>
      </div>
    </div>
    <!-- npm / compile runner -->
    <div style="margin-top:10px;border-top:1px solid var(--border);padding-top:8px;">
      <div style="font-family:var(--display);font-size:9px;letter-spacing:.14em;color:var(--o);margin-bottom:6px;">⚡ NPM / COMPILE</div>
      <input id="nx-npm-dir" placeholder="Project dir path…" style="width:100%;background:var(--bg3);border:1px solid var(--border2);border-radius:2px;color:var(--text);font-family:var(--mono);font-size:9px;padding:3px 6px;outline:none;margin-bottom:4px;">
      <div style="display:flex;gap:3px;flex-wrap:wrap;">
        <button onclick="nxRunNpm('install')" style="background:none;border:1px solid var(--border2);border-radius:2px;color:var(--text3);font-family:var(--mono);font-size:8px;padding:2px 6px;cursor:pointer;flex:1" onmouseenter="this.style.borderColor='var(--g)';this.style.color='var(--g)'" onmouseleave="this.style.borderColor='var(--border2)';this.style.color='var(--text3)'">INSTALL</button>
        <button onclick="nxRunNpm('build')" style="background:none;border:1px solid var(--border2);border-radius:2px;color:var(--text3);font-family:var(--mono);font-size:8px;padding:2px 6px;cursor:pointer;flex:1" onmouseenter="this.style.borderColor='var(--o)';this.style.color='var(--o)'" onmouseleave="this.style.borderColor='var(--border2)';this.style.color='var(--text3)'">BUILD</button>
        <button onclick="nxRunNpm('start')" style="background:none;border:1px solid var(--border2);border-radius:2px;color:var(--text3);font-family:var(--mono);font-size:8px;padding:2px 6px;cursor:pointer;flex:1" onmouseenter="this.style.borderColor='var(--c)';this.style.color='var(--c)'" onmouseleave="this.style.borderColor='var(--border2)';this.style.color='var(--text3)'">START</button>
      </div>
      <div id="nx-npm-log" style="margin-top:4px;background:var(--bg);border:1px solid var(--border);border-radius:2px;padding:5px;font-family:var(--mono);font-size:8px;color:var(--text3);max-height:80px;overflow-y:auto;display:none;line-height:1.5;white-space:pre-wrap;"></div>
    </div>`;
  sideSettings.appendChild(gs);
  window.NEXUS_GATE_SISO_CREDIT = true;
  window.NEXUS_GATE_DEDUP       = true;
  window.NEXUS_GATE_AUTOSAVE    = true;
  window.NEXUS_GATE_MODAL       = true;
}

async function nxRunNpm(script){
  const dir = document.getElementById('nx-npm-dir')?.value?.trim();
  const log = document.getElementById('nx-npm-log');
  if(log){ log.style.display='block'; log.textContent='⟳ Running npm '+script+'…\n'; }
  // Via bridge
  try{
    const url = (typeof BRIDGE!=='undefined'?BRIDGE.url:'http://127.0.0.1:3747');
    const r = await fetch(url+'/bridge/cli',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ command: `npm ${script}`, cwd: dir||'.' })
    });
    const data = await r.json().catch(()=>({}));
    const out = data.stdout||data.output||data.result||JSON.stringify(data);
    if(log) log.textContent += out + (data.stderr?'\nSTDERR: '+data.stderr:'');
    if(log) log.scrollTop = log.scrollHeight;
    toast('npm '+script+' complete','ok');
  } catch(e){
    // Fallback: via nexus IPC if in Electron
    if(window.nexus?.exec){
      try{
        const r = await window.nexus.exec('npm '+script, dir||process?.cwd?.());
        if(log) log.textContent += r.output||r.error||'done';
        toast('npm '+script+(r.ok?' complete':' failed'), r.ok?'ok':'warn');
      } catch(e2){ if(log) log.textContent += 'Error: '+e2.message; }
    } else {
      if(log) log.textContent += 'Bridge not connected. Start bridge or use Electron app.\n';
      toast('Bridge not available for npm runner','warn');
    }
  }
}

// ── UCE mini panel in sidebar ─────────────────────────────────────
function forgeUCEMiniRender(){
  const el=document.getElementById('forge-uce-mini');
  if(!el||typeof UCE_DB==='undefined') return;
  const f=FORGE.activeFile?FORGE.files[FORGE.activeFile]:null;
  const lang=f?.lang||'auto';
  // Show entries relevant to active file's language
  const relevant = UCE_DB.filter(e=>
    (e.tags||[]).some(t=>t===lang||t===f?.lang) ||
    e.id.includes(lang) || e.bridges?.some(b=>b.includes(lang))
  ).slice(0,20);
  const entries = relevant.length ? relevant : UCE_DB.slice(0,20);
  el.innerHTML = entries.map(e=>`
    <div onclick="uceOpenById('${e.id}')" style="padding:4px 6px;background:var(--bg2);border-radius:2px;cursor:pointer;border:0.5px solid var(--border);">
      <div style="font-size:9px;font-weight:600;color:var(--text);font-family:var(--mono)">${e.name}</div>
      <div style="font-size:8px;color:var(--text3)">${e.id}</div>
    </div>
  `).join('');
}

window.forgeUCEScanFile = function(){
  if(typeof uceScanFile==='function') uceScanFile();
  forgeUCEMiniRender();
};

// ── Error prompt system ───────────────────────────────────────────
window.forgeErrorPrompt = function(title, msg, hint, actions){
  // actions: [{label, color, fn}]
  FORGE.errors.push({title,msg,hint,ts:new Date().toISOString()});
  const ct = document.getElementById('forge-error-count');
  if(ct) ct.textContent = FORGE.errors.length;
  // Render error in bottom errors panel
  const errPanel = document.getElementById('fb-panel-errors');
  if(errPanel){
    const d=document.createElement('div');
    d.style.cssText='padding:4px 0;border-bottom:0.5px solid var(--border);';
    d.innerHTML=`<div style="font-size:9px;color:var(--r);font-family:var(--display)">${title}</div><div style="font-size:9px;color:var(--text2);font-family:var(--mono);margin-top:2px">${msg}</div>`;
    errPanel.appendChild(d);
  }
  // Show modal
  const overlay = document.getElementById('forge-error-backdrop');
  const modal   = document.getElementById('forge-error-prompt');
  const titleEl = document.getElementById('fep-title');
  const msgEl   = document.getElementById('fep-msg');
  const hintEl  = document.getElementById('fep-hint');
  const actEl   = document.getElementById('fep-actions');
  if(!modal) return;
  if(titleEl) titleEl.textContent = title;
  if(msgEl)   msgEl.textContent   = msg;
  if(hintEl)  hintEl.textContent  = hint||'';
  if(actEl){
    actEl.innerHTML='';
    (actions||[{label:'Dismiss',color:'var(--text3)',fn:null}]).forEach(a=>{
      const btn=document.createElement('button');
      btn.className='btn';
      btn.textContent=a.label;
      btn.style.cssText=`font-size:9px;color:${a.color||'var(--text2)'};`;
      btn.onclick=()=>{ forgeErrorClose(); if(a.fn) a.fn(); };
      actEl.appendChild(btn);
    });
    // Always add dismiss
    const d=document.createElement('button');
    d.className='btn';d.textContent='Dismiss';d.style.fontSize='9px';
    d.onclick=forgeErrorClose;
    actEl.appendChild(d);
  }
  if(overlay) overlay.style.display='block';
  if(modal)   modal.style.display='block';
  log_ev('forge:error:prompt',{title,msg});
};
window.forgeErrorClose = function(){
  const o=document.getElementById('forge-error-backdrop');
  const m=document.getElementById('forge-error-prompt');
  if(o) o.style.display='none';
  if(m) m.style.display='none';
};

// ── Settings search ───────────────────────────────────────────────
window.forgeSettingsSearch = function(){
  const overlay = document.getElementById('forge-settings-overlay');
  if(!overlay) return;
  overlay.style.display = overlay.style.display==='none'?'block':'none';
  if(overlay.style.display==='block'){
    const inp=document.getElementById('forge-settings-search-input');
    if(inp){ inp.value=''; inp.focus(); forgeSettingsFilter(''); }
  }
};
window.forgeSettingsClose = function(){
  const o=document.getElementById('forge-settings-overlay');
  if(o) o.style.display='none';
};

// Build settings registry from all FORGE settings
function forgeSettingsBuild(){
  FORGE.settingsRegistry = [
    // Code editor
    {id:'forge.editor.lang',       label:'Language',        group:'Editor',   get:()=>document.getElementById('forge-lang-sel')?.value, inputId:'forge-lang-sel'},
    {id:'forge.editor.tabsize',    label:'Tab size',        group:'Editor',   get:()=>'2'},
    {id:'forge.editor.wordwrap',   label:'Word wrap',       group:'Editor',   get:()=>'off'},
    // Compiler general
    {id:'forge.compile.optimize',  label:'Optimization',    group:'Compiler', get:()=>'O2'},
    {id:'forge.compile.debug',     label:'Debug symbols',   group:'Compiler', get:()=>'false'},
    {id:'forge.compile.lto',       label:'LTO',             group:'Compiler', get:()=>'false'},
    {id:'forge.compile.strip',     label:'Strip',           group:'Compiler', get:()=>'false'},
    // x86-64
    {id:'forge.arch.x86.march',    label:'x86 -march',      group:'x86-64',   get:()=>document.getElementById('cset-x86-march')?.value||'x86-64'},
    {id:'forge.arch.x86.avx',      label:'x86 AVX',         group:'x86-64',   get:()=>document.getElementById('cset-x86-avx')?.value||'none'},
    {id:'forge.arch.x86.pic',      label:'x86 PIC',         group:'x86-64',   get:()=>'true'},
    // ARM64
    {id:'forge.arch.arm.variant',  label:'ARM variant',     group:'ARM64',    get:()=>document.getElementById('cset-arm-variant')?.value||'generic'},
    {id:'forge.arch.arm.neon',     label:'ARM NEON',        group:'ARM64',    get:()=>'true'},
    // WASM
    {id:'forge.arch.wasm.target',  label:'WASM target',     group:'WASM',     get:()=>document.getElementById('cset-wasm-target')?.value||'browser'},
    {id:'forge.arch.wasm.simd',    label:'WASM SIMD',       group:'WASM',     get:()=>'false'},
    {id:'forge.arch.wasm.threads', label:'WASM threads',    group:'WASM',     get:()=>'false'},
    // Android
    {id:'forge.android.api',       label:'Android API',     group:'Android',  get:()=>document.getElementById('cset-android-api')?.value||'26'},
    {id:'forge.android.abi',       label:'Android ABI',     group:'Android',  get:()=>document.getElementById('cset-android-abi')?.value||'arm64-v8a'},
    {id:'forge.android.r8',        label:'R8 minify',       group:'Android',  get:()=>'true'},
    {id:'forge.android.ndk',       label:'NDK version',     group:'Android',  get:()=>document.getElementById('cset-android-ndk')?.value||'26'},
    // Docker
    {id:'forge.docker.base',       label:'Docker base',     group:'Docker',   get:()=>document.getElementById('cset-docker-base')?.value||'debian:bookworm-slim'},
    {id:'forge.docker.platform',   label:'Docker platform', group:'Docker',   get:()=>document.getElementById('cset-docker-platform')?.value||'linux/amd64'},
    {id:'forge.docker.multi',      label:'Multi-stage',     group:'Docker',   get:()=>'true'},
    // GUI
    {id:'forge.gui.device',        label:'Preview device',  group:'GUI',      get:()=>document.getElementById('gui-device')?.value||'desktop'},
    // Stylesheet
    {id:'forge.style.preset',      label:'Style preset',    group:'Stylesheet',get:()=>document.getElementById('style-preset')?.value||''},
    {id:'forge.style.format',      label:'Output format',   group:'Stylesheet',get:()=>document.getElementById('style-output-fmt')?.value||'css-vars'},
    // WordPress
    {id:'forge.wp.name',           label:'Plugin name',     group:'WordPress', get:()=>document.getElementById('wp-name')?.value||''},
    {id:'forge.wp.slug',           label:'Plugin slug',     group:'WordPress', get:()=>document.getElementById('wp-slug')?.value||''},
    // CLI
    {id:'forge.cli.shell',         label:'Shell',           group:'CLI',      get:()=>document.getElementById('cli-shell')?.value||'bash'},
  ];
  FORGE.settingsRegistry.forEach(s=>{ s.uuid = typeof settingsUUID==='function' ? settingsUUID(s.id) : s.id; });
}

window.forgeSettingsRender = function(){
  forgeSettingsBuild();
  const list = document.getElementById('forge-settings-list');
  if(!list) return;
  list.innerHTML = FORGE.settingsRegistry.map(s=>`
    <div class="forge-settings-item" onclick="forgeSettingsJump('${s.id}')" title="UUID: ${s.uuid}">
      <div style="flex:1">
        <div class="forge-settings-item-label">${s.label}</div>
        <div style="font-size:8px;color:var(--text4)">${s.group}</div>
      </div>
      <div class="forge-settings-item-val">${s.get()||'—'}</div>
    </div>
  `).join('');
};

window.forgeSettingsFilter = function(q){
  forgeSettingsBuild();
  const results = document.getElementById('forge-settings-results') || document.getElementById('forge-settings-list');
  if(!results) return;
  const filtered = q ? FORGE.settingsRegistry.filter(s=>
    s.label.toLowerCase().includes(q.toLowerCase()) ||
    s.group.toLowerCase().includes(q.toLowerCase()) ||
    s.id.toLowerCase().includes(q.toLowerCase()) ||
    s.uuid.includes(q)
  ) : FORGE.settingsRegistry;
  results.innerHTML = filtered.map(s=>`
    <div class="forge-settings-item" onclick="forgeSettingsJump('${s.id}')" title="UUID: ${s.uuid}">
      <div style="flex:1">
        <div class="forge-settings-item-label">${s.label} <span style="color:var(--text4);font-size:8px">${s.group}</span></div>
        <div style="font-family:var(--mono);font-size:8px;color:var(--text4)">${s.uuid}</div>
      </div>
      <div class="forge-settings-item-val">${s.get()||'—'}</div>
    </div>
  `).join('') || '<div style="padding:10px;font-size:9px;color:var(--text3);">No settings match</div>';
};

window.forgeSettingsJump = function(id){
  forgeSettingsClose();
  const s = FORGE.settingsRegistry.find(x=>x.id===id);
  if(!s) return;
  if(id.startsWith('forge.arch.')||id.startsWith('forge.compile.')){
    forgeSwitchMode('compile', document.getElementById('fmode-btn-compile'));
  } else if(id.startsWith('forge.gui.')){
    forgeSwitchMode('gui', document.getElementById('fmode-btn-gui'));
  } else if(id.startsWith('forge.style.')){
    forgeSwitchMode('style', document.getElementById('fmode-btn-style'));
  } else if(id.startsWith('forge.wp.')||id.startsWith('forge.web.')){
    forgeSwitchMode('web', document.getElementById('fmode-btn-web'));
  } else if(id.startsWith('forge.cli.')){
    forgeSwitchMode('cli', document.getElementById('fmode-btn-cli'));
  }
  if(s.inputId){ const el=document.getElementById(s.inputId); if(el){ el.focus(); el.scrollIntoView({behavior:'smooth',block:'center'}); } }
};

window.forgeSettingsPresetSave = function(){
  const name = prompt('Preset name:');
  if(!name) return;
  forgeSettingsBuild();
  const preset = {};
  FORGE.settingsRegistry.forEach(s=>{ preset[s.id]=s.get(); });
  FORGE.settingsPresets[name]=preset;
  try{ localStorage.setItem('nx_forge_presets', JSON.stringify(FORGE.settingsPresets)); }catch{}
  toast('Preset saved: '+name,'ok');
};

window.forgeSettingsPresetLoad = function(){
  try{ FORGE.settingsPresets = JSON.parse(localStorage.getItem('nx_forge_presets')||'{}'); }catch{}
  const names = Object.keys(FORGE.settingsPresets);
  if(!names.length){ toast('No presets saved','warn'); return; }
  const name = prompt('Load preset:\n'+names.join('\n'));
  if(!name||!FORGE.settingsPresets[name]) return;
  const preset=FORGE.settingsPresets[name];
  Object.entries(preset).forEach(([id,val])=>{
    const s = FORGE.settingsRegistry.find(x=>x.id===id);
    if(s?.inputId){ const el=document.getElementById(s.inputId); if(el) el.value=val; }
  });
  toast('Preset loaded: '+name,'ok');
};

window.forgeSettingsExport = window.compilerSettingsExport = function(){
  forgeSettingsBuild();
  const data={};
  FORGE.settingsRegistry.forEach(s=>{ data[s.id]={label:s.label,value:s.get(),uuid:s.uuid,group:s.group}; });
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='nexus-forge-settings.json';
  a.click();
};
window.compilerSettingsImport = function(){
  const inp=document.createElement('input');
  inp.type='file';inp.accept='.json';
  inp.onchange=e=>{
    const f=e.target.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=ev=>{
      try{
        const data=JSON.parse(ev.target.result);
        forgeSettingsBuild();
        Object.entries(data).forEach(([id,s])=>{
          const reg=FORGE.settingsRegistry.find(x=>x.id===id);
          if(reg?.inputId){ const el=document.getElementById(reg.inputId); if(el) el.value=s.value||''; }
        });
        toast('Settings imported','ok');
      }catch(err){ forgeErrorPrompt('Import error','Invalid settings JSON: '+err.message,'Check file format.',[]); }
    };
    r.readAsText(f);
  };
  inp.click();
};

// ── PIPELINE ──────────────────────────────────────────────────────
window.forgePipelineRun = async function(){
  if(FORGE.pipelineRunning){ toast('Pipeline already running','warn'); return; }
  const f=FORGE.activeFile?FORGE.files[FORGE.activeFile]:null;
  if(!f||!f.content.trim()){ toast('Open a file first','warn'); return; }
  FORGE.pipelineRunning=true;
  const bar=document.getElementById('forge-pipeline-bar');
  const prog=document.getElementById('forge-pipeline-progress');
  const status=document.getElementById('forge-pipeline-status');
  if(bar) bar.style.display='flex';
  const setStage=(stage,state)=>{
    ['build','compile','test'].forEach((s,i)=>{
      const el=document.getElementById('fp-stage-'+s);
      if(!el) return;
      el.className='forge-pipeline-stage'+(s===stage?' '+state:'');
    });
  };
  const setProgress=(pct,msg)=>{
    if(prog) prog.style.width=pct+'%';
    if(status) status.textContent=msg;
  };

  try{
    // Stage 1: Builder — validate bottom-up gate
    setStage('build','active'); setProgress(10,'Gate 0: validating structure…');
    await new Promise(r=>setTimeout(r,300));
    // Check for foundation-first: warn if UI-only code with no data layer
    const hasDataLayer = /class\s+\w+|interface\s+\w+|type\s+\w+|CREATE TABLE|schema|model|entity/i.test(f.content);
    const hasUIOnly    = /document\.getElementById|<div|<button|useState/i.test(f.content) && !hasDataLayer;
    if(hasUIOnly && f.content.length > 200){
      await new Promise(resolve=>{
        forgeErrorPrompt(
          'Gate 0 — Bottom-up axiom',
          'This file appears to be UI-only with no data layer, schema, or model.',
          'Builder axiom: foundation first. Add data models or schema before UI, or confirm this is intentional.',
          [
            {label:'Continue anyway', color:'var(--y)', fn:resolve},
            {label:'Let co-pilot add foundation', color:'var(--c)', fn:()=>{ forgePilotMode('architect'); forgePilotRun(); resolve(); }},
          ]
        );
      });
    }
    setProgress(30,'Stage 1 complete');
    setStage('build','done');

    // Stage 2: Compiler
    setStage('compile','active'); setProgress(40,'Compiling…');
    await forgeCompileRun(true); // silent=true
    setProgress(65,'Stage 2 complete');
    setStage('compile','done');

    // Stage 3: Test env
    setStage('test','active'); setProgress(75,'Running smoke tests…');
    await new Promise(r=>setTimeout(r,400));
    if(typeof teRunPWSmokeTests==='function') await teRunPWSmokeTests();
    setProgress(100,'Pipeline complete');
    setStage('test','done');
    toast('Pipeline complete — Builder → Compiler → Test Env','ok',4000);
  }catch(e){
    if(status) status.textContent='Pipeline error';
    forgeErrorPrompt(
      'Pipeline error',
      e.message,
      'Fix the error and re-run, or abort pipeline.',
      [{label:'Abort',color:'var(--r)',fn:forgePipelineAbort},{label:'Retry',color:'var(--c)',fn:()=>{FORGE.pipelineRunning=false;forgePipelineRun();}}]
    );
  }finally{
    FORGE.pipelineRunning=false;
  }
};

window.forgePipelineAbort = function(){
  FORGE.pipelineRunning=false;
  const bar=document.getElementById('forge-pipeline-bar');
  if(bar) bar.style.display='none';
  toast('Pipeline aborted','warn');
};

// ── COMPILER SETTINGS ─────────────────────────────────────────────
const COMPILER_TARGETS = [
  {id:'web',       label:'Web / HTML',        color:'var(--c)',  icon:'🌐'},
  {id:'wasm',      label:'WebAssembly',        color:'var(--c)',  icon:'⬡'},
  {id:'pwa',       label:'PWA',               color:'var(--c)',  icon:'📱'},
  {id:'wordpress', label:'WordPress Plugin',   color:'var(--m)',  icon:'⬡'},
  {id:'node',      label:'Node.js',            color:'var(--g)',  icon:'⬡'},
  {id:'bun',       label:'Bun',               color:'var(--g)',  icon:'⬡'},
  {id:'deno',      label:'Deno',              color:'var(--g)',  icon:'⬡'},
  {id:'electron',  label:'Electron',           color:'var(--c)',  icon:'⬡'},
  {id:'python',    label:'Python',            color:'var(--y)',  icon:'🐍'},
  {id:'rust',      label:'Rust',              color:'var(--o)',  icon:'⚙'},
  {id:'go',        label:'Go',               color:'var(--c)',  icon:'⬡'},
  {id:'java',      label:'Java / Kotlin',     color:'var(--y)',  icon:'☕'},
  {id:'csharp',    label:'C# / .NET',        color:'var(--m)',  icon:'⬡'},
  {id:'cpp',       label:'C / C++',          color:'var(--o)',  icon:'⬡'},
  {id:'zig',       label:'Zig',              color:'var(--y)',  icon:'⬡'},
  {id:'android',   label:'Android APK',       color:'var(--g)',  icon:'🤖'},
  {id:'ios',       label:'iOS / macOS',      color:'var(--text2)',icon:'🍎'},
  {id:'win',       label:'Windows',           color:'var(--c)',  icon:'⬡'},
  {id:'linux',     label:'Linux',            color:'var(--y)',  icon:'🐧'},
  {id:'mac',       label:'macOS Universal',  color:'var(--text2)',icon:'🍎'},
  {id:'docker',    label:'Docker',           color:'var(--c)',  icon:'🐋'},
  {id:'lambda',    label:'Lambda / CF Workers', color:'var(--y)', icon:'⬡'},
  {id:'k8s',       label:'Kubernetes',        color:'var(--c)',  icon:'⬡'},
];

const COMPILER_SETTINGS = {
  web:   [{id:'minify',label:'Minify',type:'bool',def:'true'},{id:'sourcemap',label:'Source map',type:'bool',def:'true'},{id:'target',label:'Browser target',type:'select',opts:['esnext','es2022','es2020','es2015'],def:'esnext'},{id:'bundler',label:'Bundler',type:'select',opts:['vite','rollup','esbuild','webpack','parcel','none'],def:'vite'},{id:'treeshake',label:'Tree-shaking',type:'bool',def:'true'},{id:'codesplit',label:'Code splitting',type:'bool',def:'true'},{id:'publicpath',label:'Public path',type:'text',def:'/'}],
  wasm:  [{id:'target',label:'Target',type:'select',opts:['browser','wasi','emscripten'],def:'browser'},{id:'simd128',label:'SIMD128',type:'bool',def:'false'},{id:'threads',label:'Threads',type:'bool',def:'false'},{id:'bulkmem',label:'Bulk memory',type:'bool',def:'true'},{id:'reftypes',label:'Reference types',type:'bool',def:'false'},{id:'stacksize',label:'Stack size (bytes)',type:'text',def:'65536'},{id:'optimize',label:'Optimize (-O)',type:'select',opts:['0','1','2','3','s','z'],def:'2'}],
  android:[{id:'api',label:'Min API level',type:'select',opts:['21','24','26','28','30','31','33','34','35'],def:'26'},{id:'abi',label:'ABI filters',type:'text',def:'arm64-v8a,x86_64'},{id:'ndk',label:'NDK version',type:'text',def:'26'},{id:'r8',label:'R8 minify',type:'bool',def:'true'},{id:'proguard',label:'ProGuard rules',type:'bool',def:'false'},{id:'debuggable',label:'Debuggable',type:'bool',def:'false'},{id:'signingkey',label:'Keystore path',type:'text',def:''},{id:'keystorepass',label:'Keystore password',type:'password',def:''},{id:'keyalias',label:'Key alias',type:'text',def:'release'},{id:'multidex',label:'MultiDex',type:'bool',def:'false'},{id:'vectordrawables',label:'Vector drawables',type:'bool',def:'true'}],
  rust:  [{id:'profile',label:'Profile',type:'select',opts:['debug','release','bench'],def:'release'},{id:'optimize',label:'Opt level',type:'select',opts:['0','1','2','3','s','z'],def:'3'},{id:'lto',label:'LTO',type:'select',opts:['false','thin','fat'],def:'thin'},{id:'codegen',label:'Codegen units',type:'text',def:'1'},{id:'strip',label:'Strip',type:'select',opts:['none','debuginfo','symbols'],def:'symbols'},{id:'features',label:'Features',type:'text',def:''},{id:'target',label:'Target triple',type:'text',def:''},{id:'panic',label:'Panic strategy',type:'select',opts:['unwind','abort'],def:'abort'},{id:'debuginfo',label:'Debug info',type:'select',opts:['0','1','2'],def:'0'}],
  go:    [{id:'gcflags',label:'gcflags',type:'text',def:''},{id:'ldflags',label:'ldflags',type:'text',def:'-s -w'},{id:'trimpath',label:'Trimpath',type:'bool',def:'true'},{id:'cgo',label:'CGO enabled',type:'bool',def:'false'},{id:'os',label:'GOOS',type:'text',def:''},{id:'arch',label:'GOARCH',type:'text',def:''},{id:'race',label:'Race detector',type:'bool',def:'false'},{id:'static',label:'Static binary',type:'bool',def:'false'}],
  docker:[{id:'base',label:'Base image',type:'text',def:'debian:bookworm-slim'},{id:'platform',label:'Platform',type:'text',def:'linux/amd64,linux/arm64'},{id:'multi',label:'Multi-stage',type:'bool',def:'true'},{id:'labels',label:'Labels',type:'text',def:''},{id:'healthcheck',label:'Healthcheck CMD',type:'text',def:''},{id:'user',label:'USER',type:'text',def:'nobody'},{id:'expose',label:'EXPOSE ports',type:'text',def:'8080'},{id:'entrypoint',label:'ENTRYPOINT',type:'text',def:''},{id:'cmd',label:'CMD',type:'text',def:''},{id:'compress',label:'Compress layers',type:'bool',def:'true'}],
  python:[{id:'version',label:'Python version',type:'select',opts:['3.8','3.9','3.10','3.11','3.12','3.13'],def:'3.12'},{id:'onefile',label:'One-file bundle',type:'bool',def:'true'},{id:'noconsole',label:'No console (GUI)',type:'bool',def:'false'},{id:'upx',label:'UPX compress',type:'bool',def:'false'},{id:'icon',label:'Icon path',type:'text',def:''},{id:'hiddenimports',label:'Hidden imports',type:'text',def:''},{id:'tool',label:'Bundler',type:'select',opts:['pyinstaller','nuitka','cx_freeze','briefcase'],def:'pyinstaller'}],
  electron:[{id:'platform',label:'Platform',type:'select',opts:['win','mac','linux','all'],def:'all'},{id:'arch',label:'Arch',type:'text',def:'x64'},{id:'isolation',label:'contextIsolation',type:'bool',def:'true'},{id:'nodeint',label:'nodeIntegration',type:'bool',def:'false'},{id:'sandbox',label:'sandbox',type:'bool',def:'true'},{id:'updater',label:'Auto-updater',type:'bool',def:'false'},{id:'target',label:'Build target',type:'select',opts:['nsis','portable','dmg','appimage','deb','rpm'],def:'nsis'},{id:'sign',label:'Code signing',type:'bool',def:'false'}],
  ios:   [{id:'deploytarget',label:'Deployment target',type:'text',def:'15.0'},{id:'swift',label:'Swift version',type:'text',def:'5.10'},{id:'bitcode',label:'Bitcode',type:'bool',def:'false'},{id:'sign',label:'Code signing',type:'bool',def:'true'},{id:'entitlements',label:'Entitlements plist',type:'text',def:''},{id:'provision',label:'Provisioning profile',type:'text',def:''},{id:'arch',label:'Architectures',type:'text',def:'arm64'}],
  win:   [{id:'compiler',label:'Compiler',type:'select',opts:['msvc','mingw','clang'],def:'msvc'},{id:'subsystem',label:'Subsystem',type:'select',opts:['console','windows','service'],def:'console'},{id:'manifest',label:'Manifest',type:'bool',def:'true'},{id:'sign',label:'Authenticode sign',type:'bool',def:'false'},{id:'cert',label:'Certificate path',type:'text',def:''},{id:'optimize',label:'Optimization',type:'select',opts:['/Od','/O1','/O2','/Ox'],def:'/O2'},{id:'debug',label:'Debug info (PDB)',type:'bool',def:'false'}],
  linux: [{id:'static',label:'Static binary',type:'bool',def:'false'},{id:'libc',label:'libc',type:'select',opts:['glibc','musl'],def:'glibc'},{id:'optimize',label:'Optimization',type:'select',opts:['-O0','-O1','-O2','-O3','-Os','-Oz'],def:'-O2'},{id:'lto',label:'LTO',type:'bool',def:'false'},{id:'strip',label:'Strip',type:'bool',def:'true'},{id:'package',label:'Package format',type:'select',opts:['none','appimage','flatpak','snap','deb','rpm'],def:'appimage'},{id:'arch',label:'Target arch',type:'select',opts:['x86_64','aarch64','armv7','riscv64'],def:'x86_64'}],
  mac:   [{id:'universal',label:'Universal binary',type:'bool',def:'true'},{id:'notarize',label:'Notarize',type:'bool',def:'false'},{id:'hardened',label:'Hardened runtime',type:'bool',def:'true'},{id:'entitlements',label:'Entitlements',type:'text',def:''},{id:'sign',label:'codesign identity',type:'text',def:''},{id:'deploytarget',label:'Deployment target',type:'text',def:'12.0'},{id:'bundle',label:'Bundle format',type:'select',opts:['app','dmg','pkg','zip'],def:'dmg'}],
  wordpress:[{id:'phpcompat',label:'PHP compat',type:'text',def:'8.0'},{id:'wpcompat',label:'WP compat',type:'text',def:'6.0'},{id:'minify',label:'Minify assets',type:'bool',def:'true'},{id:'genblocks',label:'Gutenberg blocks',type:'bool',def:'false'},{id:'genpot',label:'Generate POT',type:'bool',def:'true'},{id:'plugincheck',label:'Plugin check compat',type:'bool',def:'true'},{id:'readme',label:'Generate readme.txt',type:'bool',def:'true'}],
  node:  [{id:'target',label:'Node version',type:'text',def:'22'},{id:'bundle',label:'Bundle tool',type:'select',opts:['esbuild','rollup','webpack','pkg','none'],def:'esbuild'},{id:'platform',label:'Target platform',type:'select',opts:['node','browser','neutral'],def:'node'},{id:'format',label:'Output format',type:'select',opts:['cjs','esm','iife'],def:'cjs'},{id:'minify',label:'Minify',type:'bool',def:'true'},{id:'sourcemap',label:'Source map',type:'bool',def:'false'},{id:'external',label:'Externals',type:'text',def:''}],
  csharp:[{id:'config',label:'Configuration',type:'select',opts:['Debug','Release'],def:'Release'},{id:'framework',label:'Target framework',type:'text',def:'net8.0'},{id:'selfcontained',label:'Self-contained',type:'bool',def:'false'},{id:'rid',label:'Runtime ID',type:'text',def:'linux-x64'},{id:'singlefile',label:'Single file',type:'bool',def:'false'},{id:'trimmed',label:'Trimmed',type:'bool',def:'false'},{id:'aot',label:'Native AOT',type:'bool',def:'false'}],
  lambda:[{id:'runtime',label:'Runtime',type:'select',opts:['nodejs22.x','python3.12','java21','dotnet8','go1.x','ruby3.3'],def:'nodejs22.x'},{id:'memory',label:'Memory (MB)',type:'text',def:'512'},{id:'timeout',label:'Timeout (s)',type:'text',def:'30'},{id:'layers',label:'Layers ARNs',type:'text',def:''},{id:'vpc',label:'VPC enabled',type:'bool',def:'false'},{id:'arch',label:'Architecture',type:'select',opts:['x86_64','arm64'],def:'arm64'},{id:'handler',label:'Handler',type:'text',def:'index.handler'}],
  cpp:   [{id:'std',label:'C++ standard',type:'select',opts:['c++17','c++20','c++23'],def:'c++20'},{id:'optimize',label:'Optimization',type:'select',opts:['-O0','-O1','-O2','-O3','-Os'],def:'-O2'},{id:'lto',label:'LTO',type:'bool',def:'false'},{id:'sanitize',label:'Sanitizers',type:'text',def:''},{id:'warnings',label:'Warnings',type:'text',def:'-Wall -Wextra'},{id:'march',label:'-march',type:'text',def:'native'},{id:'debug',label:'Debug (-g)',type:'bool',def:'false'},{id:'static',label:'Static link',type:'bool',def:'false'}],
  k8s:   [{id:'namespace',label:'Namespace',type:'text',def:'default'},{id:'replicas',label:'Replicas',type:'text',def:'3'},{id:'image',label:'Image',type:'text',def:''},{id:'pullpolicy',label:'Pull policy',type:'select',opts:['Always','IfNotPresent','Never'],def:'Always'},{id:'requests_cpu',label:'CPU request',type:'text',def:'100m'},{id:'requests_mem',label:'Memory request',type:'text',def:'128Mi'},{id:'limits_cpu',label:'CPU limit',type:'text',def:'500m'},{id:'limits_mem',label:'Memory limit',type:'text',def:'512Mi'},{id:'serviceaccount',label:'Service account',type:'text',def:'default'}],
};

function compileInit(){
  const list = document.getElementById('compile-target-list');
  if(!list||list.children.length) return;
  COMPILER_TARGETS.forEach(t=>{
    const btn=document.createElement('button');
    btn.className='compile-target-btn';
    btn.dataset.target=t.id;
    btn.innerHTML=`<span class="compile-target-dot"></span><span style="color:${t.color}">${t.label}</span>`;
    btn.onclick=()=>compileSelectTarget(t.id);
    list.appendChild(btn);
  });
}

window.compileSelectTarget = function(id){
  FORGE.compileTarget=id;
  document.querySelectorAll('.compile-target-btn').forEach(b=>{
    b.className='compile-target-btn'+(b.dataset.target===id?' active':'');
  });
  const panel=document.getElementById('compile-settings-panel');
  if(!panel) return;
  // Android gets the full APK builder wizard
  if(id==='android'){ apkBuilderOpen(panel); return; }
  const settings=COMPILER_SETTINGS[id]||[];
  const target=COMPILER_TARGETS.find(t=>t.id===id);
  panel.innerHTML=`
    <div style="margin-bottom:12px;padding-bottom:10px;border-bottom:0.5px solid var(--border);">
      <div style="font-family:var(--display);font-size:12px;letter-spacing:.18em;color:${target?.color||'var(--c)'};margin-bottom:3px">${target?.label||id.toUpperCase()}</div>
      <div style="font-size:9px;color:var(--text3)">All ${settings.length} settings exposed · hover any setting to see its UUID</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:0;background:var(--bg1);border:0.5px solid var(--border);border-radius:3px;overflow:hidden;">
    ${settings.map(s=>{
      const sid=`cset-${id}-${s.id}`;
      const uuid=typeof settingsUUID==='function'?settingsUUID('forge.'+id+'.'+s.id):'';
      let ctrl='';
      if(s.type==='bool') ctrl=`<label class="chk on" id="${sid}" onclick="this.classList.toggle('on')"><div class="chk-dot"></div>${s.def==='true'?'enabled':'disabled'}</label>`;
      else if(s.type==='select') ctrl=`<select class="finp" id="${sid}" style="font-size:9px;padding:1px 4px;max-width:160px">${s.opts.map(o=>`<option${o===s.def?' selected':''}>${o}</option>`).join('')}</select>`;
      else if(s.type==='password') ctrl=`<input class="finp" id="${sid}" type="password" placeholder="${s.def}" style="font-size:9px;max-width:160px"/>`;
      else ctrl=`<input class="finp" id="${sid}" type="text" value="${s.def}" placeholder="${s.def}" style="font-size:9px;max-width:200px"/>`;
      return`<div class="compile-setting">
        <span class="compile-setting-label">${s.label}</span>
        <div class="compile-setting-ctrl">${ctrl}</div>
        <span class="compile-setting-uuid">${uuid}</span>
      </div>`;
    }).join('')}
    </div>
    <button class="btn ok" style="margin-top:10px;font-size:10px" onclick="forgeCompileRun()">▶ COMPILE ${(target?.label||id).toUpperCase()}</button>
  `;
};

window.forgeCompileRun = async function(silent){
  const f=FORGE.activeFile?FORGE.files[FORGE.activeFile]:null;
  if(!f){ if(!silent) toast('No file to compile','warn'); return; }
  const targetId=FORGE.compileTarget||'web';
  const badge=document.getElementById('compile-status-pill');
  const statusTxt=document.getElementById('compile-status-txt');
  const log=document.getElementById('forge-comp-log');
  if(badge) badge.className='pill pill-busy';
  if(statusTxt) statusTxt.textContent='COMPILING';
  const compLog=msg=>{
    if(log){const d=document.createElement('div');d.style.cssText='padding:1px 0;border-bottom:0.5px solid rgba(26,42,64,.2);font-size:9px;';d.textContent=msg;log.appendChild(d);scrollBot(log);}
    forgeLog(msg,'info');
  };
  compLog('▶ '+targetId.toUpperCase()+' compile started: '+f.name);
  // Gather settings for this target
  const settings=COMPILER_SETTINGS[targetId]||[];
  const cfg={};
  settings.forEach(s=>{
    const el=document.getElementById(`cset-${targetId}-${s.id}`);
    if(el) cfg[s.id]=el.type==='checkbox'||el.classList.contains('chk')?el.classList.contains('on'):el.value;
  });
  compLog('Config: '+JSON.stringify(cfg).slice(0,200));
  try{
    const msgs=[
      {role:'system',content:`You are NEXUS Compiler AI. Generate a complete, production-ready build configuration and commands for target: ${targetId}. Settings: ${JSON.stringify(cfg)}. Output structured JSON: {commands:[],configs:{},dependencies:[],notes:[],cicd:""}`},
      {role:'user',content:`File: ${f.name}\nLanguage: ${f.lang}\nTarget: ${targetId}\nSettings: ${JSON.stringify(cfg)}\n\nCode preview:\n${f.content.slice(0,3000)}`}
    ];
    const r=await aiChat(msgs,{temperature:0.1,max_tokens:2000,stream:false});
    const text=r.stream?await readStream(r,()=>{}):r.text;
    compLog('✓ Build config generated');
    const out=document.getElementById('fp-panel-output');
    if(out){out.innerHTML='<pre style="color:var(--g);font-size:10px;white-space:pre-wrap;padding:8px">'+esc(text)+'</pre>';forgePreviewTab('output',document.getElementById('fp-tab-output'));}
    if(badge) badge.className='pill pill-ok';
    if(statusTxt) statusTxt.textContent='DONE';
    if(!silent) toast('Compiled: '+targetId,'ok');
    return text;
  }catch(e){
    compLog('✗ '+e.message);
    if(badge) badge.className='pill pill-err';
    if(statusTxt) statusTxt.textContent='ERROR';
    forgeErrorPrompt(
      'Compile error',
      e.message,
      'Check bridge connection or API key, then retry.',
      [{label:'Open bridge settings',color:'var(--c)',fn:()=>{ switchTab('options'); optSwitchTab('bridge',document.querySelector('.opt-tab:nth-child(3)')); }},
       {label:'Retry', color:'var(--y)', fn:()=>forgeCompileRun(silent)}]
    );
    throw e;
  }
};

// ── GUI BUILDER ───────────────────────────────────────────────────
const GUI_COMPONENTS = {
  layout:[
    {label:'Container', tag:'div', style:'padding:20px;max-width:1200px;margin:0 auto;'},
    {label:'Row', tag:'div', style:'display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;'},
    {label:'Column', tag:'div', style:'flex:1;min-width:200px;'},
    {label:'Grid 2-col', tag:'div', style:'display:grid;grid-template-columns:1fr 1fr;gap:16px;'},
    {label:'Grid 3-col', tag:'div', style:'display:grid;grid-template-columns:repeat(3,1fr);gap:16px;'},
    {label:'Section', tag:'section', style:'padding:60px 20px;'},
    {label:'Header', tag:'header', style:'padding:16px 20px;background:#1a1a2e;color:#fff;display:flex;align-items:center;justify-content:space-between;'},
    {label:'Footer', tag:'footer', style:'padding:20px;background:#f5f5f5;text-align:center;'},
    {label:'Sidebar', tag:'aside', style:'width:240px;flex-shrink:0;padding:16px;background:#f9f9f9;'},
    {label:'Card', tag:'div', style:'background:#fff;border-radius:8px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,.1);'},
  ],
  content:[
    {label:'Heading 1', tag:'h1', text:'Main Heading', style:'font-size:2.5rem;font-weight:700;margin-bottom:16px;'},
    {label:'Heading 2', tag:'h2', text:'Section Title', style:'font-size:1.8rem;font-weight:600;margin-bottom:12px;'},
    {label:'Heading 3', tag:'h3', text:'Sub Title', style:'font-size:1.3rem;font-weight:600;margin-bottom:8px;'},
    {label:'Paragraph', tag:'p', text:'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', style:'line-height:1.7;margin-bottom:16px;'},
    {label:'Link', tag:'a', text:'Click here', style:'color:#0066cc;text-decoration:underline;', attrs:{href:'#'}},
    {label:'List (ul)', tag:'ul', html:'<li>Item one</li><li>Item two</li><li>Item three</li>', style:'margin:0 0 16px 20px;line-height:1.8;'},
    {label:'Blockquote', tag:'blockquote', text:'A meaningful quote or highlight.', style:'border-left:4px solid #0066cc;padding:12px 20px;background:#f0f7ff;margin:16px 0;'},
    {label:'HR divider', tag:'hr', style:'border:none;border-top:1px solid #eee;margin:24px 0;'},
    {label:'Code block', tag:'pre', text:'const x = 42;', style:'background:#1e1e1e;color:#d4d4d4;padding:16px;border-radius:4px;overflow-x:auto;font-family:monospace;'},
    {label:'Badge', tag:'span', text:'NEW', style:'display:inline-block;padding:2px 8px;background:#0066cc;color:#fff;border-radius:20px;font-size:11px;font-weight:600;'},
  ],
  forms:[
    {label:'Text input', tag:'input', style:'width:100%;padding:10px 12px;border:1px solid #ddd;border-radius:4px;font-size:14px;', attrs:{type:'text',placeholder:'Enter text…'}},
    {label:'Email input', tag:'input', style:'width:100%;padding:10px 12px;border:1px solid #ddd;border-radius:4px;', attrs:{type:'email',placeholder:'email@example.com'}},
    {label:'Password', tag:'input', style:'width:100%;padding:10px 12px;border:1px solid #ddd;border-radius:4px;', attrs:{type:'password',placeholder:'Password'}},
    {label:'Textarea', tag:'textarea', style:'width:100%;padding:10px 12px;border:1px solid #ddd;border-radius:4px;min-height:100px;resize:vertical;', attrs:{placeholder:'Message…'}},
    {label:'Select', tag:'select', html:'<option>Option 1</option><option>Option 2</option><option>Option 3</option>', style:'width:100%;padding:10px 12px;border:1px solid #ddd;border-radius:4px;'},
    {label:'Checkbox', tag:'label', html:'<input type="checkbox"> <span>Check me</span>', style:'display:flex;align-items:center;gap:8px;cursor:pointer;'},
    {label:'Radio group', tag:'div', html:'<label style="display:flex;align-items:center;gap:6px;margin-bottom:6px"><input type="radio" name="r"> Option A</label><label style="display:flex;align-items:center;gap:6px"><input type="radio" name="r"> Option B</label>'},
    {label:'Button', tag:'button', text:'Submit', style:'padding:10px 24px;background:#0066cc;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:14px;font-weight:600;'},
    {label:'Button outline', tag:'button', text:'Cancel', style:'padding:10px 24px;background:transparent;color:#0066cc;border:1px solid #0066cc;border-radius:4px;cursor:pointer;'},
    {label:'Form group', tag:'div', html:'<label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px">Label</label><input type="text" placeholder="Value" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:4px;">', style:'margin-bottom:16px;'},
  ],
  media:[
    {label:'Image', tag:'img', style:'max-width:100%;height:auto;border-radius:4px;', attrs:{src:'https://via.placeholder.com/600x400',alt:'Image'}},
    {label:'Video', tag:'video', style:'width:100%;border-radius:4px;', attrs:{controls:true,src:''}},
    {label:'Iframe embed', tag:'iframe', style:'width:100%;height:400px;border:none;border-radius:4px;', attrs:{src:'about:blank'}},
    {label:'SVG icon', tag:'svg', html:'<circle cx="12" cy="12" r="10" fill="#0066cc"/>', style:'width:24px;height:24px;', attrs:{viewBox:'0 0 24 24',xmlns:'http://www.w3.org/2000/svg'}},
  ],
  components:[
    {label:'Navbar', tag:'nav', html:'<span style="font-weight:700;font-size:18px">Brand</span><div style="display:flex;gap:20px"><a href="#" style="text-decoration:none;color:inherit">Home</a><a href="#" style="text-decoration:none;color:inherit">About</a><a href="#" style="text-decoration:none;color:inherit">Contact</a></div>', style:'padding:16px 24px;background:#fff;border-bottom:1px solid #eee;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;'},
    {label:'Hero section', tag:'div', html:'<h1 style="font-size:3rem;font-weight:800;margin-bottom:16px;line-height:1.2">Your Main Headline</h1><p style="font-size:1.2rem;color:#666;margin-bottom:32px">A compelling subheadline that explains your value proposition clearly.</p><button style="padding:14px 32px;background:#0066cc;color:#fff;border:none;border-radius:6px;font-size:16px;cursor:pointer;font-weight:600">Get Started</button>', style:'text-align:center;padding:80px 20px;background:linear-gradient(135deg,#f0f7ff,#fff);'},
    {label:'Feature card', tag:'div', html:'<div style="font-size:32px;margin-bottom:12px">⚡</div><h3 style="font-size:1.1rem;font-weight:600;margin-bottom:8px">Feature Title</h3><p style="color:#666;line-height:1.6">A brief description of this feature and why it matters.</p>', style:'padding:28px;background:#fff;border-radius:8px;text-align:center;box-shadow:0 2px 12px rgba(0,0,0,.08);'},
    {label:'Alert info', tag:'div', text:'ℹ This is an informational message.', style:'padding:12px 16px;background:#e8f4fd;border:1px solid #bee5fb;border-radius:4px;color:#0c5460;margin:8px 0;'},
    {label:'Alert success', tag:'div', text:'✓ Action completed successfully!', style:'padding:12px 16px;background:#d4edda;border:1px solid #c3e6cb;border-radius:4px;color:#155724;margin:8px 0;'},
    {label:'Alert warning', tag:'div', text:'⚠ Please review before continuing.', style:'padding:12px 16px;background:#fff3cd;border:1px solid #ffc107;border-radius:4px;color:#856404;margin:8px 0;'},
    {label:'Pricing card', tag:'div', html:'<div style="font-size:13px;font-weight:600;color:#666;margin-bottom:6px;text-transform:uppercase">Pro</div><div style="font-size:2.5rem;font-weight:800;margin-bottom:4px">$49<span style="font-size:14px;color:#666">/mo</span></div><div style="color:#666;margin-bottom:20px">For growing teams</div><ul style="list-style:none;margin-bottom:24px;text-align:left"><li style="padding:4px 0">✓ Unlimited projects</li><li style="padding:4px 0">✓ Priority support</li><li style="padding:4px 0">✓ Advanced analytics</li></ul><button style="width:100%;padding:12px;background:#0066cc;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:600">Get started</button>', style:'padding:32px;background:#fff;border-radius:8px;border:2px solid #0066cc;text-align:center;box-shadow:0 4px 20px rgba(0,102,204,.15);'},
  ],
};

function guiInit(){
  if(document.querySelector('#gui-palette-layout .gui-pal-item')) return;
  Object.entries(GUI_COMPONENTS).forEach(([group,items])=>{
    const container=document.getElementById('gui-palette-'+group);
    if(!container) return;
    items.forEach(item=>{
      const el=document.createElement('div');
      el.className='gui-pal-item';
      el.draggable=true;
      el.dataset.component=JSON.stringify(item);
      el.innerHTML=`<span style="font-size:10px">${item.label}</span>`;
      el.ondragstart=e=>{ e.dataTransfer.setData('component', JSON.stringify(item)); };
      el.onclick=()=>guiDropComponent(item);
      container.appendChild(el);
    });
  });
  guiRenderCanvas();
}

window.guiCanvasDragOver = function(e){ e.preventDefault(); };
window.guiCanvasDrop = function(e){
  e.preventDefault();
  const data=e.dataTransfer.getData('component');
  if(data){ try{ guiDropComponent(JSON.parse(data)); }catch{} }
};

window.guiDropComponent = function(item){
  const id='gui_'+Date.now();
  const el={id, ...item, content:item.text||item.html||'', innerHTML:item.html||''};
  FORGE.guiElements.push(el);
  guiRenderCanvas();
  guiSelectElement(id);
  guiUpdateCount();
};

function guiRenderCanvas(){
  const inner = document.getElementById('gui-canvas-inner');
  const empty  = document.getElementById('gui-canvas-empty');
  if(!inner) return;
  if(empty) empty.style.display = FORGE.guiElements.length ? 'none' : 'flex';
  inner.innerHTML = '';

  FORGE.guiElements.forEach((el, idx) => {
    const wrap = document.createElement('div');
    wrap.className = 'gui-el-wrap' + (el.id === FORGE.guiSelected ? ' selected' : '');
    wrap.dataset.guiId = el.id;
    wrap.style.cssText = 'position:relative;margin-bottom:4px;border:1.5px solid transparent;border-radius:3px;transition:border-color .15s;';
    if(el.id === FORGE.guiSelected) wrap.style.borderColor = '#00d4ff';

    // Hover highlight
    wrap.addEventListener('mouseenter', () => { if(el.id !== FORGE.guiSelected) wrap.style.borderColor='rgba(0,212,255,.35)'; });
    wrap.addEventListener('mouseleave', () => { if(el.id !== FORGE.guiSelected) wrap.style.borderColor='transparent'; });

    // Actual element
    const dom = document.createElement(el.tag || 'div');
    dom.style.cssText = (el.style || '') + 'user-select:none;';
    if(el.innerHTML) dom.innerHTML = el.innerHTML;
    else if(el.text)  dom.textContent = el.text;
    if(el.attrs) Object.entries(el.attrs).forEach(([k,v]) => { if(k!=='src'||!String(v).startsWith('http')) dom.setAttribute(k, v); });
    dom.addEventListener('click', e => { e.stopPropagation(); guiSelectElement(el.id); });
    wrap.appendChild(dom);

    // Floating action bar (shown on select)
    const bar = document.createElement('div');
    bar.style.cssText = `position:absolute;top:-1px;right:0;display:${el.id===FORGE.guiSelected?'flex':'none'};gap:2px;background:#0b1120;border:1px solid #00d4ff;border-radius:0 3px 3px 0;padding:2px 4px;z-index:10;`;
    bar.innerHTML = [
      `<button onclick="guiMoveUp('${el.id}')" title="Move up" style="background:none;border:none;color:#00d4ff;cursor:pointer;font-size:10px;padding:1px 3px;">↑</button>`,
      `<button onclick="guiMoveDown('${el.id}')" title="Move down" style="background:none;border:none;color:#00d4ff;cursor:pointer;font-size:10px;padding:1px 3px;">↓</button>`,
      `<button onclick="guiDuplicateEl('${el.id}')" title="Duplicate" style="background:none;border:none;color:#00d4ff;cursor:pointer;font-size:10px;padding:1px 3px;">⧉</button>`,
      `<button onclick="guiDeleteEl('${el.id}')" title="Delete" style="background:none;border:none;color:#ff3a55;cursor:pointer;font-size:10px;padding:1px 3px;">✕</button>`,
    ].join('');
    wrap.appendChild(bar);

    inner.appendChild(wrap);
  });

  // Update the active file content if file is open
  guiSyncToActiveFile();
}

function guiSyncToActiveFile(){
  const f = FORGE.activeFile ? FORGE.files[FORGE.activeFile] : null;
  if(!f || f.lang !== 'html') return;
  const inner = document.getElementById('gui-canvas-inner');
  if(!inner) return;
  // Export clean HTML (without action bars) to file
  const clone = inner.cloneNode(true);
  clone.querySelectorAll('div[style*="position:absolute"]').forEach(b => b.remove());
  clone.querySelectorAll('.gui-el-wrap').forEach(w => {
    const child = w.firstElementChild;
    if(child) w.parentNode?.insertBefore(child, w);
    w.remove();
  });
  f.content = clone.innerHTML;
  f.modified = true;
  const ed = document.getElementById('forge-editor');
  if(ed && FORGE.activeFile === f.id) ed.value = f.content;
  forgeRenderFileTabs();
}

window.guiCanvasClick = function(e){
  if(e.target.id==='gui-canvas'||e.target.id==='gui-canvas-inner'){ guiSelectElement(null); }
};

window.guiSelectElement = function(id){
  FORGE.guiSelected=id;
  // Use new wrapper class
  document.querySelectorAll('.gui-el-wrap').forEach(el=>{
    const selected = el.dataset.guiId===id;
    el.style.borderColor = selected ? '#00d4ff' : 'transparent';
    const bar = el.querySelector('div[style*="position:absolute"]');
    if(bar) bar.style.display = selected ? 'flex' : 'none';
  });
  guiShowProps(id);
  const badge=document.getElementById('gui-selected-id');
  if(badge) badge.textContent=id||'none';
};

window.guiDuplicateEl = function(id){
  const el=FORGE.guiElements.find(e=>e.id===id);
  if(!el) return;
  const newEl={...JSON.parse(JSON.stringify(el)), id:'gui_'+Date.now()};
  const idx=FORGE.guiElements.findIndex(e=>e.id===id);
  FORGE.guiElements.splice(idx+1,0,newEl);
  guiRenderCanvas(); guiSelectElement(newEl.id); guiUpdateCount();
};

function guiShowProps(id){
  const el=id?FORGE.guiElements.find(e=>e.id===id):null;
  const panel=document.getElementById('gui-props-content');
  if(!panel) return;
  if(!el){ panel.innerHTML='<div style="font-size:9px;color:var(--text3);font-style:italic;padding:8px;">Select an element</div>'; return; }
  panel.innerHTML=`
    <div style="display:flex;flex-direction:column;gap:8px;font-size:10px;">
      <div><div style="font-size:8px;color:var(--text3);margin-bottom:3px">TAG</div><input class="finp" value="${el.tag||'div'}" style="font-size:9px;width:100%" onchange="guiUpdateProp('${id}','tag',this.value)"/></div>
      <div><div style="font-size:8px;color:var(--text3);margin-bottom:3px">CONTENT</div><textarea class="finp" style="font-size:9px;width:100%;height:60px;resize:none;" onchange="guiUpdateProp('${id}','text',this.value)">${el.text||''}</textarea></div>
      <div><div style="font-size:8px;color:var(--text3);margin-bottom:3px">INNER HTML</div><textarea class="finp" style="font-size:9px;width:100%;height:60px;resize:none;" onchange="guiUpdateProp('${id}','innerHTML',this.value)">${el.innerHTML||''}</textarea></div>
      <div><div style="font-size:8px;color:var(--text3);margin-bottom:3px">INLINE STYLE</div><textarea class="finp" style="font-size:9px;width:100%;height:60px;resize:none;" onchange="guiUpdateProp('${id}','style',this.value)">${el.style||''}</textarea></div>
      <div style="display:flex;gap:4px;margin-top:4px;">
        <button class="btn" style="font-size:8px;flex:1" onclick="guiMoveUp('${id}')">↑ UP</button>
        <button class="btn" style="font-size:8px;flex:1" onclick="guiMoveDown('${id}')">↓ DOWN</button>
        <button class="btn danger" style="font-size:8px;flex:1" onclick="guiDeleteEl('${id}')">✕ DEL</button>
      </div>
    </div>
  `;
}

window.guiUpdateProp = function(id, prop, val){
  const el=FORGE.guiElements.find(e=>e.id===id);
  if(el){ el[prop]=val; guiRenderCanvas(); guiSelectElement(id); }
};
window.guiMoveUp   = function(id){ const i=FORGE.guiElements.findIndex(e=>e.id===id); if(i>0)[FORGE.guiElements[i-1],FORGE.guiElements[i]]=[FORGE.guiElements[i],FORGE.guiElements[i-1]]; guiRenderCanvas(); };
window.guiMoveDown = function(id){ const i=FORGE.guiElements.findIndex(e=>e.id===id); if(i<FORGE.guiElements.length-1)[FORGE.guiElements[i],FORGE.guiElements[i+1]]=[FORGE.guiElements[i+1],FORGE.guiElements[i]]; guiRenderCanvas(); };
window.guiDeleteEl = function(id){ FORGE.guiElements=FORGE.guiElements.filter(e=>e.id!==id); guiSelectElement(null); guiRenderCanvas(); guiUpdateCount(); };
function guiUpdateCount(){ const b=document.getElementById('gui-el-count'); if(b) b.textContent=FORGE.guiElements.length; }
/* ── Forge editor undo/redo — 50-state ring buffer ── */
const _forgeUndoStack = [];
const _forgeRedoStack = [];
let   _forgeUndoLock  = false;
const FORGE_UNDO_MAX  = 50;

function _forgeSnapshotGet() {
  const ed = document.getElementById('forge-editor');
  return ed ? ed.value : (typeof _generatedCode !== 'undefined' ? _generatedCode : null);
}
function _forgeSnapshotSet(v) {
  const ed = document.getElementById('forge-editor');
  if (ed) { ed.value = v; ed.dispatchEvent(new Event('input', { bubbles: true })); }
  if (typeof _generatedCode !== 'undefined') window._generatedCode = v;
}

function forgeHistoryPush(snapshot) {
  if (_forgeUndoLock) return;
  if (snapshot == null) return;
  const last = _forgeUndoStack[_forgeUndoStack.length - 1];
  if (last === snapshot) return; // no change
  _forgeUndoStack.push(snapshot);
  if (_forgeUndoStack.length > FORGE_UNDO_MAX) _forgeUndoStack.shift();
  _forgeRedoStack.length = 0; // new edit clears redo
}
// Auto-snapshot on editor input (throttled 1s)
let _forgeUndoThrottle = null;
document.addEventListener('input', function(e) {
  if (e.target && e.target.id === 'forge-editor') {
    clearTimeout(_forgeUndoThrottle);
    _forgeUndoThrottle = setTimeout(() => forgeHistoryPush(e.target.value), 1000);
  }
});

window.guiUndo = function() {
  if (_forgeUndoStack.length < 2) { toast('Nothing to undo', 'warn'); return; }
  const current = _forgeSnapshotGet();
  _forgeRedoStack.push(current);
  _forgeUndoStack.pop();
  const prev = _forgeUndoStack[_forgeUndoStack.length - 1];
  _forgeUndoLock = true;
  _forgeSnapshotSet(prev);
  _forgeUndoLock = false;
  toast('Undo', 'ok', 1200);
};
window.guiRedo = function() {
  if (!_forgeRedoStack.length) { toast('Nothing to redo', 'warn'); return; }
  const next = _forgeRedoStack.pop();
  forgeHistoryPush(_forgeSnapshotGet());
  _forgeUndoLock = true;
  _forgeSnapshotSet(next);
  _forgeUndoLock = false;
  toast('Redo', 'ok', 1200);
};
window.guiSetDevice = function(d){
  const c=document.getElementById('gui-canvas');
  if(!c) return;
  const map={desktop:'100%',tablet:'768px',mobile:'390px'};
  c.style.maxWidth=map[d]||'100%';
};
window.guiExportCode = function(){
  const inner=document.getElementById('gui-canvas-inner');
  if(!inner){ toast('Nothing to export','warn'); return; }
  const code='<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>Export</title>\n</head>\n<body>\n'+inner.innerHTML+'\n</body>\n</html>';
  forgeOpenContent('gui_export_'+Date.now(),'gui-export.html',code);
  forgeSwitchMode('code',document.getElementById('fmode-btn-code'));
  toast('HTML exported to editor','ok');
};

// ── STYLESHEET EDITOR ─────────────────────────────────────────────
const STYLE_DEFAULTS = {
  colors:[
    {id:'primary',label:'Primary',value:'#0066cc',uuid:''},
    {id:'secondary',label:'Secondary',value:'#6c757d',uuid:''},
    {id:'accent',label:'Accent',value:'#00d4ff',uuid:''},
    {id:'success',label:'Success',value:'#28a745',uuid:''},
    {id:'warning',label:'Warning',value:'#ffc107',uuid:''},
    {id:'danger',label:'Danger',value:'#dc3545',uuid:''},
    {id:'bg-primary',label:'BG Primary',value:'#ffffff',uuid:''},
    {id:'bg-secondary',label:'BG Secondary',value:'#f8f9fa',uuid:''},
    {id:'text-primary',label:'Text Primary',value:'#212529',uuid:''},
    {id:'text-secondary',label:'Text Secondary',value:'#6c757d',uuid:''},
    {id:'border',label:'Border',value:'#dee2e6',uuid:''},
  ],
  typography:[
    {id:'font-sans',label:'Font (sans)',value:'-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',uuid:''},
    {id:'font-mono',label:'Font (mono)',value:'"Courier New", Courier, monospace',uuid:''},
    {id:'font-size-base',label:'Base font size',value:'16px',uuid:''},
    {id:'line-height',label:'Line height',value:'1.6',uuid:''},
    {id:'font-weight-normal',label:'Weight normal',value:'400',uuid:''},
    {id:'font-weight-bold',label:'Weight bold',value:'700',uuid:''},
  ],
  spacing:[
    {id:'spacing-xs',label:'Spacing XS',value:'4px',uuid:''},
    {id:'spacing-sm',label:'Spacing SM',value:'8px',uuid:''},
    {id:'spacing-md',label:'Spacing MD',value:'16px',uuid:''},
    {id:'spacing-lg',label:'Spacing LG',value:'24px',uuid:''},
    {id:'spacing-xl',label:'Spacing XL',value:'48px',uuid:''},
    {id:'container-max',label:'Container max-width',value:'1200px',uuid:''},
  ],
  borders:[
    {id:'radius-sm',label:'Radius SM',value:'4px',uuid:''},
    {id:'radius-md',label:'Radius MD',value:'8px',uuid:''},
    {id:'radius-lg',label:'Radius LG',value:'12px',uuid:''},
    {id:'radius-full',label:'Radius full',value:'9999px',uuid:''},
    {id:'border-width',label:'Border width',value:'1px',uuid:''},
    {id:'border-style',label:'Border style',value:'solid',uuid:''},
  ],
  shadows:[
    {id:'shadow-sm',label:'Shadow SM',value:'0 1px 3px rgba(0,0,0,.12)',uuid:''},
    {id:'shadow-md',label:'Shadow MD',value:'0 4px 12px rgba(0,0,0,.15)',uuid:''},
    {id:'shadow-lg',label:'Shadow LG',value:'0 8px 32px rgba(0,0,0,.2)',uuid:''},
    {id:'shadow-focus',label:'Focus ring',value:'0 0 0 3px rgba(0,102,204,.25)',uuid:''},
  ],
  motion:[
    {id:'transition-fast',label:'Transition fast',value:'0.1s ease',uuid:''},
    {id:'transition-base',label:'Transition base',value:'0.2s ease',uuid:''},
    {id:'transition-slow',label:'Transition slow',value:'0.4s ease',uuid:''},
    {id:'ease-in-out',label:'Easing',value:'cubic-bezier(0.4,0,0.2,1)',uuid:''},
  ],
};

let STYLE_TOKENS = JSON.parse(JSON.stringify(STYLE_DEFAULTS));

function styleInit(){
  if(document.querySelector('#style-colors .style-token')) return;
  Object.entries(STYLE_TOKENS).forEach(([group, tokens])=>{
    const container=document.getElementById('style-'+group);
    if(!container) return;
    tokens.forEach(t=>{
      if(!t.uuid && typeof settingsUUID==='function') t.uuid=settingsUUID('forge.style.'+group+'.'+t.id);
      const wrap=document.createElement('div');
      wrap.className='style-token';
      wrap.title='UUID: '+t.uuid;
      const isColor=group==='colors';
      wrap.innerHTML=`
        <span class="style-token-label">${t.label}</span>
        ${isColor?`<input type="color" value="${t.value}" style="width:28px;height:22px;border:none;padding:0;cursor:pointer;border-radius:3px;" onchange="styleUpdateToken('${group}','${t.id}',this.value)"/>`:
        `<input type="text" value="${t.value}" class="finp" style="max-width:120px;font-size:9px;" onchange="styleUpdateToken('${group}','${t.id}',this.value)"/>`}
        <span class="style-token-val">${t.value}</span>
      `;
      container.appendChild(wrap);
    });
  });
  styleRenderPreview();
  styleExportRaw();
}

window.styleUpdateToken = function(group, id, value){
  const t=STYLE_TOKENS[group]?.find(x=>x.id===id);
  if(t){ t.value=value; styleRenderPreview(); styleExportRaw(); }
};

function styleRenderPreview(){
  const preview=document.getElementById('style-preview');
  if(!preview) return;
  const get=(group,id)=>STYLE_TOKENS[group]?.find(x=>x.id===id)?.value||'';
  preview.style.cssText=`
    font-family:${get('typography','font-sans')};
    font-size:${get('typography','font-size-base')};
    color:${get('colors','text-primary')};
    background:${get('colors','bg-primary')};
    line-height:${get('typography','line-height')};
    padding:16px;
  `;
  preview.innerHTML=`
    <div style="font-size:24px;font-weight:${get('typography','font-weight-bold')};margin-bottom:8px;color:${get('colors','text-primary')}">Heading</div>
    <p style="color:${get('colors','text-secondary')};margin-bottom:12px;">Sample text with secondary color.</p>
    <button style="padding:8px 20px;background:${get('colors','primary')};color:#fff;border:none;border-radius:${get('borders','radius-md')};cursor:pointer;font-weight:${get('typography','font-weight-bold')}">Primary</button>
    <button style="padding:8px 20px;background:transparent;color:${get('colors','primary')};border:${get('borders','border-width')} ${get('borders','border-style')} ${get('colors','border')};border-radius:${get('borders','radius-md')};cursor:pointer;margin-left:8px;">Outline</button>
    <div style="margin:12px 0;padding:10px 14px;background:${get('colors','bg-secondary')};border-radius:${get('borders','radius-md')};border:${get('borders','border-width')} ${get('borders','border-style')} ${get('colors','border')};box-shadow:${get('shadows','shadow-sm')};">Card surface</div>
    <span style="padding:2px 10px;background:${get('colors','success')};color:#fff;border-radius:${get('borders','radius-full')};font-size:12px;">Badge</span>
  `;
}

function styleExportRaw(){
  const out=document.getElementById('style-raw-output');
  if(!out) return;
  const fmt=document.getElementById('style-output-fmt')?.value||'css-vars';
  let result='';
  if(fmt==='css-vars'){
    result=':root {\n';
    Object.entries(STYLE_TOKENS).forEach(([group,tokens])=>{
      result+=`  /* ${group} */\n`;
      tokens.forEach(t=>{ result+=`  --${t.id}: ${t.value};\n`; });
    });
    result+='}';
  } else if(fmt==='json'){
    const obj={};
    Object.entries(STYLE_TOKENS).forEach(([group,tokens])=>{
      obj[group]={};
      tokens.forEach(t=>{ obj[group][t.id]=t.value; });
    });
    result=JSON.stringify(obj,null,2);
  } else if(fmt==='scss'){
    Object.entries(STYLE_TOKENS).forEach(([group,tokens])=>{
      result+=`// ${group}\n`;
      tokens.forEach(t=>{ result+=`$${t.id}: ${t.value};\n`; });
      result+='\n';
    });
  }
  out.value=result;
}

window.styleToggleSection = function(head){
  const body=head.nextElementSibling;
  if(body){ body.style.display=body.style.display==='none'?'block':'none'; head.textContent=head.textContent.replace(/[▸▾]/,body.style.display==='none'?'▸':'▾'); }
};

window.styleLoadPreset = function(name){
  const presets={
    nexus:{colors:[{id:'primary',value:'#00d4ff'},{id:'accent',value:'#cc44ff'},{id:'bg-primary',value:'#0a0f1e'},{id:'bg-secondary',value:'#0d1428'},{id:'text-primary',value:'#ccd8f0'},{id:'border',value:'rgba(0,212,255,.2)'}]},
    minimal:{colors:[{id:'primary',value:'#333'},{id:'bg-primary',value:'#fff'},{id:'bg-secondary',value:'#fafafa'},{id:'text-primary',value:'#111'}]},
    warm:{colors:[{id:'primary',value:'#ff6b35'},{id:'accent',value:'#ffb030'},{id:'bg-primary',value:'#fff8f5'},{id:'bg-secondary',value:'#fff0e8'},{id:'text-primary',value:'#2d1a0e'}]},
  };
  if(!presets[name]) return;
  presets[name].colors?.forEach(({id,value})=>{ const t=STYLE_TOKENS.colors.find(x=>x.id===id); if(t) t.value=value; });
  styleInit.reinit=true;
  document.querySelectorAll('#style-colors .style-token').forEach(w=>w.remove());
  styleInit();
  toast('Preset loaded: '+name,'ok');
};

window.stylePreviewToggleDark = function(){
  const preview=document.getElementById('style-preview');
  if(preview) preview.style.filter=document.getElementById('style-dark-toggle')?.classList.contains('on')?'invert(1) hue-rotate(180deg)':'none';
};

window.styleExport = function(){
  styleExportRaw();
  const out=document.getElementById('style-raw-output');
  const fmt=document.getElementById('style-output-fmt')?.value||'css-vars';
  const extMap = {'css-vars':'css','json':'json','scss':'scss','tailwind':'js'};
  const ext = extMap[fmt]||'css';
  const blob=new Blob([out?.value||''],{type:'text/plain'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`theme.${fmt==='css-vars'?'css':fmt==='json'?'json':'scss'}`;
  a.click();
};
window.styleAddColor = function(){
  const name=prompt('Token name (e.g. brand-purple):');
  const val=prompt('Value (e.g. #7c3aed):');
  if(!name||!val) return;
  STYLE_TOKENS.colors.push({id:name,label:name,value:val,uuid:typeof settingsUUID==='function'?settingsUUID('forge.style.colors.'+name):''});
  document.querySelectorAll('#style-colors .style-token').forEach(w=>w.remove());
  const c=document.getElementById('style-colors');
  STYLE_TOKENS.colors.forEach(t=>{
    const wrap=document.createElement('div');wrap.className='style-token';
    wrap.innerHTML=`<span class="style-token-label">${t.label}</span><input type="color" value="${t.value}" style="width:28px;height:22px;border:none;padding:0;cursor:pointer;" onchange="styleUpdateToken('colors','${t.id}',this.value)"/><span class="style-token-val">${t.value}</span>`;
    c.appendChild(wrap);
  });
  styleRenderPreview();
};

// ── WEBSITE BUILDER ───────────────────────────────────────────────
const WEB_SECTION_TEMPLATES = [
  {id:'hero',label:'Hero',html:'<section style="padding:80px 20px;text-align:center;background:linear-gradient(135deg,#f0f7ff,#fff)"><h1 style="font-size:3rem;font-weight:800;margin-bottom:16px">Your Headline</h1><p style="font-size:1.2rem;color:#666;margin-bottom:32px">Compelling subheadline</p><a href="#" style="padding:14px 36px;background:#0066cc;color:#fff;border-radius:6px;text-decoration:none;font-weight:700;font-size:16px">Get Started</a></section>'},
  {id:'features',label:'Features',html:'<section style="padding:60px 20px;"><h2 style="text-align:center;font-size:2rem;margin-bottom:40px">Features</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:24px;max-width:1200px;margin:0 auto"><div style="padding:24px;text-align:center"><div style="font-size:36px;margin-bottom:12px">⚡</div><h3>Fast</h3><p style="color:#666">Lightning quick performance</p></div><div style="padding:24px;text-align:center"><div style="font-size:36px;margin-bottom:12px">🔒</div><h3>Secure</h3><p style="color:#666">Enterprise-grade security</p></div><div style="padding:24px;text-align:center"><div style="font-size:36px;margin-bottom:12px">📱</div><h3>Mobile</h3><p style="color:#666">Works on all devices</p></div></div></section>'},
  {id:'pricing',label:'Pricing',html:'<section style="padding:60px 20px;background:#f9f9f9;"><h2 style="text-align:center;font-size:2rem;margin-bottom:40px">Pricing</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:24px;max-width:900px;margin:0 auto"><div style="padding:32px;background:#fff;border-radius:8px;text-align:center"><h3>Free</h3><div style="font-size:2.5rem;font-weight:800;margin:12px 0">$0</div><ul style="list-style:none;margin-bottom:24px"><li>5 projects</li><li>Basic features</li></ul><button style="width:100%;padding:12px;border:1px solid #0066cc;color:#0066cc;border-radius:4px;cursor:pointer;font-weight:600">Sign Up</button></div><div style="padding:32px;background:#0066cc;border-radius:8px;text-align:center;color:#fff"><h3>Pro</h3><div style="font-size:2.5rem;font-weight:800;margin:12px 0">$49</div><ul style="list-style:none;margin-bottom:24px"><li>Unlimited</li><li>All features</li></ul><button style="width:100%;padding:12px;background:#fff;color:#0066cc;border:none;border-radius:4px;cursor:pointer;font-weight:600">Get Pro</button></div></div></section>'},
  {id:'testimonials',label:'Testimonials',html:'<section style="padding:60px 20px;"><h2 style="text-align:center;font-size:2rem;margin-bottom:40px">What people say</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;max-width:1200px;margin:0 auto"><blockquote style="padding:24px;background:#f0f7ff;border-radius:8px;border-left:4px solid #0066cc"><p>"Incredible product that transformed our workflow."</p><cite style="display:block;margin-top:12px;font-weight:600;color:#0066cc">— Jane Doe, CEO</cite></blockquote><blockquote style="padding:24px;background:#f0f7ff;border-radius:8px;border-left:4px solid #0066cc"><p>"Best investment we made this year."</p><cite style="display:block;margin-top:12px;font-weight:600;color:#0066cc">— John Smith, CTO</cite></blockquote></div></section>'},
  {id:'contact',label:'Contact',html:'<section style="padding:60px 20px;background:#f9f9f9;"><h2 style="text-align:center;font-size:2rem;margin-bottom:40px">Get in touch</h2><form style="max-width:560px;margin:0 auto;display:flex;flex-direction:column;gap:16px"><input type="text" placeholder="Your name" style="padding:12px;border:1px solid #ddd;border-radius:4px;font-size:14px"/><input type="email" placeholder="Email address" style="padding:12px;border:1px solid #ddd;border-radius:4px;font-size:14px"/><textarea placeholder="Message…" style="padding:12px;border:1px solid #ddd;border-radius:4px;min-height:120px;resize:vertical;font-size:14px"></textarea><button style="padding:12px;background:#0066cc;color:#fff;border:none;border-radius:4px;font-size:16px;cursor:pointer;font-weight:600">Send message</button></form></section>'},
  {id:'footer',label:'Footer',html:'<footer style="padding:40px 20px;background:#1a1a2e;color:#aaa;text-align:center"><div style="max-width:1200px;margin:0 auto"><div style="font-size:24px;font-weight:700;color:#fff;margin-bottom:16px">Brand</div><div style="display:flex;gap:20px;justify-content:center;margin-bottom:24px"><a href="#" style="color:#aaa;text-decoration:none">About</a><a href="#" style="color:#aaa;text-decoration:none">Privacy</a><a href="#" style="color:#aaa;text-decoration:none">Terms</a><a href="#" style="color:#aaa;text-decoration:none">Contact</a></div><p style="font-size:12px">© 2024 Brand. All rights reserved.</p></div></footer>'},
];

function webInit(){
  // Render templates
  const tmplList=document.getElementById('web-templates');
  if(tmplList&&!tmplList.children.length){
    WEB_SECTION_TEMPLATES.forEach(t=>{
      const btn=document.createElement('div');
      btn.className='web-template-item';
      btn.textContent=t.label;
      btn.onclick=()=>webAddSectionFromTemplate(t);
      tmplList.appendChild(btn);
    });
  }
  // Wire framework selector
  const fw=document.getElementById('web-framework');
  if(fw) fw.onchange=()=>{ const wp=document.getElementById('wp-plugin-fields'); if(wp) wp.style.display=fw.value==='wordpress'?'block':'none'; };
}

window.webAddSection = function(){
  const html=prompt('Paste HTML for new section:');
  if(!html) return;
  webAddSectionFromTemplate({id:'custom_'+Date.now(), label:'Custom', html});
};

window.webAddSectionFromTemplate = function(t){
  FORGE.webSections.push({...t, id:t.id+'_'+Date.now()});
  webRender();
  toast('Section added: '+t.label,'ok');
};

function webRender(){
  const list=document.getElementById('web-section-list');
  const canvas=document.getElementById('web-canvas');
  if(!list||!canvas) return;
  list.innerHTML=FORGE.webSections.map(s=>`
    <div class="web-section-item${s.id===FORGE.webActiveSection?' active':''}" onclick="webSelectSection('${s.id}')">
      <span style="flex:1">${s.label}</span>
      <button onclick="event.stopPropagation();webDeleteSection('${s.id}')" style="background:none;border:none;color:var(--text4);cursor:pointer;font-size:10px;">✕</button>
    </div>
  `).join('');
  canvas.innerHTML=FORGE.webSections.map(s=>`<div style="width:100%;max-width:1200px;" id="websec-${s.id}">${s.html}</div>`).join('');
}

window.webSelectSection = function(id){ FORGE.webActiveSection=id; webRender(); };
window.webDeleteSection = function(id){ FORGE.webSections=FORGE.webSections.filter(s=>s.id!==id); if(FORGE.webActiveSection===id) FORGE.webActiveSection=null; webRender(); };
window.webSEOPanel = function(){ const p=document.getElementById('web-seo-panel'); if(p) p.style.display=p.style.display==='none'?'flex':'none'; };
window.webExport = function(){
  const html=FORGE.webSections.map(s=>s.html).join('\n');
  const meta=`<title>${document.getElementById('seo-title')?.value||'Page'}</title>\n<meta name="description" content="${document.getElementById('seo-desc')?.value||''}">`;
  const full=`<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n${meta}\n</head>\n<body>\n${html}\n</body>\n</html>`;
  forgeOpenContent('web_export_'+Date.now(),'website.html',full);
  forgeSwitchMode('code',document.getElementById('fmode-btn-code'));
  toast('Website exported to editor','ok');
};
window.webExportSEO = function(){
  const schema=document.getElementById('seo-schema-type')?.value;
  const title=document.getElementById('seo-title')?.value||'';
  const desc=document.getElementById('seo-desc')?.value||'';
  const canonical=document.getElementById('seo-canonical')?.value||'';
  const ogTitle=document.getElementById('seo-og-title')?.value||title;
  const ogImage=document.getElementById('seo-og-image')?.value||'';
  let meta=`<title>${title}</title>\n<meta name="description" content="${desc}">\n`;
  if(canonical) meta+=`<link rel="canonical" href="${canonical}">\n`;
  meta+=`<meta property="og:title" content="${ogTitle}">\n`;
  if(ogImage) meta+=`<meta property="og:image" content="${ogImage}">\n`;
  if(schema) meta+=`<script type="application/ld+json">{"@context":"https://schema.org","@type":"${schema}","name":"${title}"}<\/script>\n`;
  const blob=new Blob([meta],{type:'text/plain'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='seo-meta.html';
  a.click();
};
window.wpBuildPlugin = function(){
  const name=document.getElementById('wp-name')?.value||'My Plugin';
  const slug=document.getElementById('wp-slug')?.value||(name.toLowerCase().replace(/\s+/g,'-'));
  const version=document.getElementById('wp-version')?.value||'1.0.0';
  const desc=document.getElementById('wp-description')?.value||'Plugin description.';
  const textdomain=document.getElementById('wp-textdomain')?.value||slug;
  const requiresWP=document.getElementById('wp-requires-wp')?.value||'6.0';
  const requiresPHP=document.getElementById('wp-requires-php')?.value||'8.0';
  const license=document.getElementById('wp-license')?.value||'GPL v2 or later';
  const php=`<?php
/**
 * Plugin Name: ${name}
 * Plugin URI:  https://example.com/${slug}
 * Description: ${desc}
 * Version:     ${version}
 * Author:      Your Name
 * Author URI:  https://example.com
 * License:     ${license}
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: ${textdomain}
 * Requires at least: ${requiresWP}
 * Requires PHP: ${requiresPHP}
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

define( '${slug.toUpperCase().replace(/-/g,'_')}_VERSION', '${version}' );
define( '${slug.toUpperCase().replace(/-/g,'_')}_PATH', plugin_dir_path( __FILE__ ) );
define( '${slug.toUpperCase().replace(/-/g,'_')}_URL', plugin_dir_url( __FILE__ ) );

// Activation / Deactivation / Uninstall
register_activation_hook( __FILE__, '${slug.replace(/-/g,'_')}_activate' );
register_deactivation_hook( __FILE__, '${slug.replace(/-/g,'_')}_deactivate' );

function ${slug.replace(/-/g,'_')}_activate() {
    // Create tables, set options, flush rewrite rules.
    flush_rewrite_rules();
}

function ${slug.replace(/-/g,'_')}_deactivate() {
    flush_rewrite_rules();
}

// Admin menu
add_action( 'admin_menu', '${slug.replace(/-/g,'_')}_add_menu' );
function ${slug.replace(/-/g,'_')}_add_menu() {
    add_options_page(
        __( '${name}', '${textdomain}' ),
        __( '${name}', '${textdomain}' ),
        'manage_options',
        '${slug}',
        '${slug.replace(/-/g,'_')}_options_page'
    );
}

// Settings API
add_action( 'admin_init', '${slug.replace(/-/g,'_')}_settings_init' );
function ${slug.replace(/-/g,'_')}_settings_init() {
    register_setting( '${slug}', '${slug.replace(/-/g,'_')}_options', [
        'sanitize_callback' => '${slug.replace(/-/g,'_')}_sanitize',
    ]);
    add_settings_section( 'main', __( 'Main Settings', '${textdomain}' ), null, '${slug}' );
    add_settings_field( 'example_field', __( 'Example Field', '${textdomain}' ),
        '${slug.replace(/-/g,'_')}_render_field', '${slug}', 'main' );
}

function ${slug.replace(/-/g,'_')}_sanitize( $input ) {
    return array_map( 'sanitize_text_field', (array) $input );
}

function ${slug.replace(/-/g,'_')}_render_field() {
    $options = get_option( '${slug.replace(/-/g,'_')}_options', [] );
    printf( '<input type="text" name="${slug.replace(/-/g,'_')}_options[example_field]" value="%s" class="regular-text" />',
        esc_attr( $options['example_field'] ?? '' ) );
}

// Options page
function ${slug.replace(/-/g,'_')}_options_page() {
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_die( esc_html__( 'Insufficient permissions.', '${textdomain}' ) );
    }
    if ( isset( $_POST['_wpnonce'] ) && wp_verify_nonce( sanitize_key( $_POST['_wpnonce'] ), '${slug}-save' ) ) {
        // Nonce verified — handle form
    }
    ?>
    <div class="wrap">
        <h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
        <form method="post" action="options.php">
            <?php
            settings_fields( '${slug}' );
            do_settings_sections( '${slug}' );
            submit_button( __( 'Save Settings', '${textdomain}' ) );
            ?>
        </form>
    </div>
    <?php
}

// Asset enqueueing
add_action( 'wp_enqueue_scripts', '${slug.replace(/-/g,'_')}_enqueue' );
function ${slug.replace(/-/g,'_')}_enqueue() {
    wp_enqueue_style( '${slug}', plugins_url( 'assets/style.css', __FILE__ ), [], ${slug.toUpperCase().replace(/-/g,'_')}_VERSION );
    wp_enqueue_script( '${slug}', plugins_url( 'assets/script.js', __FILE__ ), ['jquery'], ${slug.toUpperCase().replace(/-/g,'_')}_VERSION, true );
}

// i18n
add_action( 'plugins_loaded', function() {
    load_plugin_textdomain( '${textdomain}', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
});
`;
  forgeOpenContent('wp_plugin_'+Date.now(), slug+'.php', php);
  forgeSwitchMode('code',document.getElementById('fmode-btn-code'));
  toast('WordPress plugin scaffold generated','ok');
};

// ── CLI PANEL ─────────────────────────────────────────────────────
function cliInit(){
  if(FORGE.cliSessions.length) return;
  cliNewSession();
}

window.cliNewSession = function(){
  const id='cli_'+Date.now();
  FORGE.cliSessions.push({id, name:'Session '+(FORGE.cliSessions.length+1), lines:[]});
  FORGE.cliActiveSession=id;
  cliRenderSessions();
  cliRenderOutput();
};

function cliRenderSessions(){
  const list=document.getElementById('cli-sessions');
  if(!list) return;
  list.innerHTML=FORGE.cliSessions.map(s=>`
    <button class="cli-session-btn${s.id===FORGE.cliActiveSession?' active':''}" onclick="cliSwitchSession('${s.id}')">
      <span style="flex:1;text-align:left">${s.name}</span>
      <button onclick="event.stopPropagation();cliCloseSession('${s.id}')" style="background:none;border:none;color:var(--text4);cursor:pointer;font-size:9px">✕</button>
    </button>
  `).join('');
}

window.cliSwitchSession = function(id){ FORGE.cliActiveSession=id; cliRenderSessions(); cliRenderOutput(); };
window.cliCloseSession  = function(id){
  FORGE.cliSessions=FORGE.cliSessions.filter(s=>s.id!==id);
  if(FORGE.cliActiveSession===id) FORGE.cliActiveSession=FORGE.cliSessions[0]?.id||null;
  if(!FORGE.cliSessions.length) cliNewSession();
  else { cliRenderSessions(); cliRenderOutput(); }
};

function cliGetSession(){ return FORGE.cliSessions.find(s=>s.id===FORGE.cliActiveSession)||null; }

function cliRenderOutput(){
  const out=document.getElementById('cli-output');
  if(!out) return;
  const s=cliGetSession();
  out.innerHTML=(s?.lines||[]).map(l=>`<span class="cli-line-${l.type||'out'}">${esc(l.text)}</span>\n`).join('');
  scrollBot(out);
}

function cliAddLine(text, type='out'){
  const s=cliGetSession();
  if(!s) return;
  s.lines.push({text,type});
  if(s.lines.length>2000) s.lines.splice(0,s.lines.length-2000);
  cliRenderOutput();
}

window.cliInputKey = function(e){
  const inp=document.getElementById('cli-input');
  if(e.key==='Enter'){ cliRun(); }
  else if(e.key==='ArrowUp'){
    if(FORGE.cliHistoryIdx<FORGE.cliHistory.length-1){ FORGE.cliHistoryIdx++; if(inp) inp.value=FORGE.cliHistory[FORGE.cliHistoryIdx]||''; }
  } else if(e.key==='ArrowDown'){
    if(FORGE.cliHistoryIdx>-1){ FORGE.cliHistoryIdx--; if(inp) inp.value=FORGE.cliHistoryIdx>=0?FORGE.cliHistory[FORGE.cliHistoryIdx]:''; }
  }
};

window.cliPresetCommand = function(cmd){
  const inp=document.getElementById('cli-input');
  if(inp) inp.value=cmd;
};

window.cliRun = async function(){
  const inp=document.getElementById('cli-input');
  const cmd=inp?.value?.trim();
  if(!cmd) return;
  if(inp) inp.value='';
  FORGE.cliHistory.unshift(cmd);
  FORGE.cliHistoryIdx=-1;
  if(FORGE.cliHistory.length>100) FORGE.cliHistory.length=100;
  // Add to history list UI
  const hist=document.getElementById('cli-history-list');
  if(hist){ const d=document.createElement('div'); d.style.cssText='padding:1px 3px;cursor:pointer;color:var(--text3);'; d.textContent=cmd; d.onclick=()=>{const i=document.getElementById('cli-input');if(i)i.value=cmd;}; hist.prepend(d); if(hist.children.length>20) hist.lastChild?.remove(); }
  cliAddLine('$ '+cmd,'cmd');
  setPill('cli-status-pill','idle','RUNNING');
  document.getElementById('cli-status-pill')?.querySelector('span')?.setAttribute('style','');
  const bridgeUrl=(typeof val==='function'?val('bridge-url'):null)||'http://127.0.0.1:3747';
  try{
    const resp=await fetch(bridgeUrl+'/cli/exec',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({cmd, shell:document.getElementById('cli-shell')?.value||'bash'}),
      signal:AbortSignal.timeout(60000)
    });
    if(!resp.ok) throw new Error('Bridge returned '+resp.status);
    const reader=resp.body.getReader();
    const dec=new TextDecoder();
    while(true){
      const {done,value}=await reader.read();
      if(done) break;
      const chunk=dec.decode(value,{stream:true});
      chunk.split('\n').forEach(line=>{ if(line) cliAddLine(line, line.startsWith('ERR')||line.startsWith('error')?'err':'out'); });
    }
    setPill('cli-status-pill','ok','DONE');
  }catch(e){
    // Bridge not available — show error but don't crash
    cliAddLine('Bridge not connected: '+e.message,'err');
    cliAddLine('Connect bridge (node bridge/nexus-bridge-server.js) to run real commands.','info');
    cliAddLine('Simulating: '+cmd,'info');
    setPill('cli-status-pill','err','ERROR');
    // Simulated output for common commands
    if(cmd.startsWith('echo '))    cliAddLine(cmd.slice(5).replace(/['"]/g,''),'out');
    else if(cmd==='ls'||cmd==='dir') cliAddLine('file1.txt  file2.js  src/  dist/','out');
    else if(cmd==='pwd') cliAddLine('/home/user/project','out');
    else if(cmd.startsWith('cat ')) cliAddLine('[file contents would appear here]','info');
  }
  setPill('cli-status-pill','idle','IDLE');
};

window.cliKill  = function(){ cliAddLine('^C','err'); setPill('cli-status-pill','idle','IDLE'); };
window.cliClear = function(){ const s=cliGetSession(); if(s) s.lines=[]; cliRenderOutput(); };

// ── IMPORT SYSTEM ─────────────────────────────────────────────────
window.forgeImportTest   = function(){ forgeImportFile('test',   ['.js','.ts','.py','.spec.js']); };
window.forgeImportEngine = function(){ forgeImportFile('engine', ['.js','.ts']); };
window.forgeImportUI     = function(){ forgeImportFile('ui',     ['.html','.jsx','.svelte','.vue']); };
window.forgeImportUCE    = function(){ forgeImportFile('uce',    ['.json']); };

function forgeImportFile(type, exts){
  const inp=document.createElement('input');
  inp.type='file';inp.accept=exts.join(',');
  inp.onchange=e=>{
    const f=e.target.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=ev=>{
      const content=ev.target.result;
      const id=type+'_import_'+Date.now();
      if(type==='uce'){
        try{
          const entries=JSON.parse(content);
          const arr=Array.isArray(entries)?entries:[entries];
          if(typeof UCE_DB!=='undefined' && typeof uceRender==='function'){
            const existing=new Set(UCE_DB.map(e=>e.id));
            const added=arr.filter(e=>e.id&&!existing.has(e.id));
            added.forEach(e=>{
              e.uuid=typeof uceUUID==='function'?uceUUID(e.id):e.id;
              UCE_DB.push(e);
              UCE_BY_ID[e.id]=e;
            });
            uceRender();
            toast(`UCE: imported ${added.length} entries`,'ok');
          }
        }catch(err){ forgeErrorPrompt('UCE import error','Invalid JSON: '+err.message,'',[]); }
        return;
      }
      forgeOpenContent(id, f.name, content);
      forgeLog('Imported '+type+': '+f.name+' ('+content.length+' chars)','ok');
      toast('Imported '+f.name,'ok');
      // Register in registry
      if(type==='test') forgeLog('Test registered — available in PW runner','ok');
    };
    r.readAsText(f);
  };
  inp.click();
}

// ── BOOT ──────────────────────────────────────────────────────────
setTimeout(()=>{
  // Ensure code mode visible on init
  forgeSwitchMode('code', document.getElementById('fmode-btn-code'));
  // Build settings registry
  forgeSettingsBuild();
  // Open compiler settings with first target
  setTimeout(()=>{
    if(document.getElementById('compile-target-list')?.children.length===0) compileInit();
  }, 500);
}, 200);

// Keyboard shortcut: Cmd/Ctrl+, opens settings search
document.addEventListener('keydown', e=>{
  if((e.metaKey||e.ctrlKey) && e.key===','){ e.preventDefault(); forgeSettingsSearch(); }
});

})();
