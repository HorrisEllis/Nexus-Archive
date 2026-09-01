/* NEXUS v0.53.0 — nexus-forge-ui.js
 * Forge IDE — unified editor, co-pilot, compiler, test bridge
 * Phase 0B — extracted 2026-04-07
 */

/* ═══════════════════════════════════════════════════════════════
   FORGE IDE — UNIFIED EDITOR + CO-PILOT + COMPILER + TEST BRIDGE
   v7 MERIDIAN
   ═══════════════════════════════════════════════════════════════ */
const FORGE = {
  files: {},          // id -> {id,name,lang,content,modified,saved}
  activeFile: null,
  pilotMode: 'audit',
  pilotHistory: [],
  bottomTab: 'console',
  previewTab: 'preview',
  view: 'split',
  compilerOpen: true,
  resizing: false,
  _initialized: false,
  _pilotAbort: null,
  _lintMarks: [],
  _prevContent: '',
};

function forgeInit(){
  if(FORGE._initialized) return;
  FORGE._initialized = true;
  // If there's a generated code in builder, offer to open it
  if(_generatedCode && _generatedCode.length > 10){
    forgeOpenContent('generated_output', 'generated.html', _generatedCode);
  } else {
    forgeNewFile();
  }
  forgeLog('FORGE IDE initialized — drop files or paste code to begin', 'ok');
  forgeLog('Co-pilot standing by — select a mode and click ▶ RUN', 'pilot');
}

function forgeNewFile(){
  const id = uid();
  const f = { id, name: 'untitled-'+Object.keys(FORGE.files).length+'.html', lang: 'html', content: '', modified: false };
  FORGE.files[id] = f;
  forgeActivateFile(id);
  forgeRenderFileTabs();
  forgeRenderFileTree();
}

function forgeOpenContent(id, name, content){
  const lang = forgeLangFromName(name);
  const f = { id, name, lang, content, modified: false };
  FORGE.files[id] = f;
  forgeActivateFile(id);
  forgeRenderFileTabs();
  forgeRenderFileTree();
  forgeLog('Opened: ' + name + ' (' + content.length + ' chars)', 'ok');
}

function forgeLangFromName(name){
  const ext = name.split('.').pop().toLowerCase();
  const map = {
    html:'html', htm:'html', js:'javascript', ts:'typescript', jsx:'javascript', tsx:'typescript',
    py:'python', rb:'ruby', php:'php', rs:'rust', go:'go', sh:'bash', bash:'bash',
    cs:'csharp', cpp:'cpp', c:'c', java:'java', kt:'kotlin', swift:'swift',
    sql:'sql', md:'markdown', yml:'yaml', yaml:'yaml', json:'json', toml:'toml',
    dockerfile:'dockerfile', tf:'terraform', hcl:'terraform', graphql:'graphql', gql:'graphql',
    ex:'elixir', exs:'elixir', hs:'haskell', sol:'solidity', css:'css', scss:'css',
  };
  return map[ext] || 'auto';
}

function forgeActivateFile(id){
  const f = FORGE.files[id];
  if(!f) return;
  FORGE.activeFile = id;
  const ed = $('forge-editor');
  if(ed){ ed.value = f.content || ''; }
  const langSel = $('forge-lang-sel');
  if(langSel) langSel.value = f.lang || 'auto';
  const cur = $('forge-cur-file');
  if(cur) cur.textContent = f.name;
  const cc = $('forge-char-count2');
  if(cc) cc.textContent = (f.content||'').length + ' chars';
  // Sync the title bar tab display name
  const titleFile = document.getElementById('forge-active-file-display');
  if(titleFile) titleFile.textContent = f.name;
  forgePreviewRefresh();
  forgeRenderFileTabs();
  forgeRenderFileTree();
  // Sync GUI canvas if in GUI mode and file is HTML
  if(FORGE.mode === 'gui' && f.lang === 'html') {
    const canvas = document.getElementById('gui-canvas-inner');
    if(canvas) { canvas.innerHTML = f.content || ''; guiUpdateCount(); }
  }
}

function forgeRenderFileTabs(){
  const bar = $('forge-file-tabs');
  if(!bar) return;
  bar.innerHTML = '';
  Object.values(FORGE.files).forEach(f => {
    const tab = document.createElement('div');
    tab.className = 'forge-file-tab' + (f.id === FORGE.activeFile ? ' active' : '') + (f.modified ? ' modified' : '');
    tab.innerHTML = `<span onclick="forgeActivateFile('${f.id}')">${esc(f.name)}</span><button class="forge-file-tab-close" onclick="forgeCloseFile('${f.id}')">×</button>`;
    bar.appendChild(tab);
  });
  const cnt = $('forge-file-count');
  if(cnt) cnt.textContent = Object.keys(FORGE.files).length;
}

function forgeRenderFileTree(){
  const tree = $('forge-file-tree');
  if(!tree) return;
  tree.innerHTML = '';
  if(!Object.keys(FORGE.files).length){
    tree.innerHTML = '<div style="font-size:9px;color:var(--text4);padding:6px 8px;font-style:italic">No files open</div>';
    return;
  }
  const langIcons = {html:'🌐',javascript:'⚡',typescript:'🔷',python:'🐍',php:'🐘',rust:'⚙',go:'🟢',bash:'$',sql:'🗄',markdown:'📝',json:'{}',yaml:'⚙',dockerfile:'🐋',css:'🎨',auto:'📄'};
  Object.values(FORGE.files).forEach(f => {
    const item = document.createElement('div');
    item.className = 'forge-tree-item' + (f.id === FORGE.activeFile ? ' active' : '');
    item.innerHTML = `<span class="forge-tree-item-icon">${langIcons[f.lang]||'📄'}</span><span class="forge-tree-item-name">${esc(f.name)}</span><span class="forge-tree-item-lang">${f.lang||''}</span>`;
    item.onclick = () => forgeActivateFile(f.id);
    tree.appendChild(item);
  });
  const cnt = $('forge-file-count');
  if(cnt) cnt.textContent = Object.keys(FORGE.files).length;
}

function forgeCloseFile(id){
  const f = FORGE.files[id];
  if(f && f.modified && !confirm('Close "'+f.name+'" with unsaved changes?')) return;
  delete FORGE.files[id];
  if(FORGE.activeFile === id){
    const ids = Object.keys(FORGE.files);
    FORGE.activeFile = ids.length ? ids[ids.length-1] : null;
    if(FORGE.activeFile) forgeActivateFile(FORGE.activeFile);
    else {
      const ed = $('forge-editor'); if(ed) ed.value='';
      const cur = $('forge-cur-file'); if(cur) cur.textContent='untitled';
    }
  }
  forgeRenderFileTabs();
  forgeRenderFileTree();
}

function forgeEditorInput(){
  const ed = $('forge-editor'); if(!ed) return;
  const f = FORGE.activeFile ? FORGE.files[FORGE.activeFile] : null;
  if(f){
    f.content = ed.value;
    f.modified = true;
    forgeRenderFileTabs();
  }
  const cc = $('forge-char-count2');
  if(cc) cc.textContent = ed.value.length + ' chars';
  if(FORGE.previewTab === 'preview') forgePreviewRefresh();
}

function forgeEditorKeydown(e){
  if(e.key === 'Tab'){
    e.preventDefault();
    const el = e.target;
    const s = el.selectionStart, end = el.selectionEnd;
    el.value = el.value.slice(0,s) + '  ' + el.value.slice(end);
    el.selectionStart = el.selectionEnd = s + 2;
    forgeEditorInput();
  }
  if(e.ctrlKey || e.metaKey){
    if(e.key==='s'){ e.preventDefault(); forgeSave(); }
    if(e.key==='/'){ e.preventDefault(); forgeToggleComment(); }
  }
}

function forgeCursorUpdate(){
  const ed = $('forge-editor'); if(!ed) return;
  const txt = ed.value.slice(0, ed.selectionStart);
  const lines = txt.split('\n');
  const ln = $('forge-line-col');
  if(ln) ln.textContent = `Ln ${lines.length}, Col ${lines[lines.length-1].length+1}`;
}

function forgeToggleComment(){
  const ed = $('forge-editor'); if(!ed) return;
  const s = ed.selectionStart, e2 = ed.selectionEnd;
  const line = ed.value.slice(0,s).lastIndexOf('\n')+1;
  const f = FORGE.activeFile ? FORGE.files[FORGE.activeFile] : null;
  const lang = f?.lang || 'javascript';
  const prefix = ['html','markdown'].includes(lang) ? '<!-- ' : '// ';
  const before = ed.value.slice(line, s);
  if(before.trimStart().startsWith(prefix.trim())){
    ed.value = ed.value.slice(0,line) + before.replace(prefix.trim(),'').trimStart() + ed.value.slice(s);
  } else {
    ed.value = ed.value.slice(0,line) + prefix + ed.value.slice(line);
  }
  forgeEditorInput();
}

function forgePreviewRefresh(){
  const frame = $('forge-preview-frame'); if(!frame) return;
  const f = FORGE.activeFile ? FORGE.files[FORGE.activeFile] : null;
  const code = f?.content || '';
  const lang = f?.lang || 'auto';
  if(['html','auto'].includes(lang) && (code.includes('<') || code.includes('<!DOCTYPE'))){
    frame.srcdoc = code;
  } else if(lang === 'markdown'){
    const html = code.replace(/^# (.+)/gm,'<h1>$1</h1>').replace(/^## (.+)/gm,'<h2>$1</h2>').replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/\n/g,'<br>');
    frame.srcdoc = `<html><body style="font-family:sans-serif;padding:16px;color:#333;line-height:1.7">${html}</body></html>`;
  } else {
    frame.srcdoc = `<!DOCTYPE html><html><head><style>body{background:#05080f;color:#b8cfe0;font-family:'DM Mono',monospace;font-size:11px;padding:14px;white-space:pre-wrap;line-height:1.7}</style></head><body>${esc(code)}</body></html>`;
  }
}

function forgePreviewTab(name, btn){
  FORGE.previewTab = name;
  ['preview','output','diff','ast','uce'].forEach(n=>{
    const p = $('fp-panel-'+n); if(p) p.style.display = n===name ? 'flex' : 'none';
  });
  document.querySelectorAll('#forge-split-wrap .preview-tab').forEach(b=>b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  if(name==='preview') forgePreviewRefresh();
  if(name==='uce') { uceRender(); uceScanFile(); }
}

function forgeBottomTab(name, btn){
  FORGE.bottomTab = name;
  ['console','copilot','buildlog','qa'].forEach(n=>{
    const p=$('fb-panel-'+n); if(p) p.style.display = n===name?'':'none';
  });
  document.querySelectorAll('#forge-bottom .preview-tab').forEach(b=>b.classList.remove('active'));
  if(btn) btn.classList.add('active');
}

function forgeBottomToggle(){
  const b=$('forge-bottom'); if(!b) return;
  const cur = parseInt(b.style.maxHeight)||300;
  b.style.maxHeight = cur <= 140 ? '400px' : '140px';
}

function forgeSetView(view, btn){
  FORGE.view = view;
  const ep=$('forge-editor-pane'), pp=$('forge-preview-pane'), rh=$('forge-resize-handle');
  if(view==='editor'){
    if(ep)ep.style.flex='1'; if(pp)pp.style.display='none'; if(rh)rh.style.display='none';
  } else if(view==='preview'){
    if(ep)ep.style.display='none'; if(pp){pp.style.flex='1';pp.style.display='flex';} if(rh)rh.style.display='none';
    forgePreviewRefresh();
  } else if(view==='console'){
    if(ep)ep.style.flex='1'; if(pp)pp.style.display='none'; if(rh)rh.style.display='none';
    const b=$('forge-bottom'); if(b) b.style.maxHeight='400px';
  } else { // split
    if(ep){ep.style.flex='1';ep.style.display='flex';} if(pp){pp.style.flex='1';pp.style.display='flex';} if(rh)rh.style.display='';
    forgePreviewRefresh();
  }
  document.querySelectorAll('.forge-view-btn').forEach(b=>b.classList.remove('active'));
  if(btn) btn.classList.add('active');
}

/* ── RESIZE ── */
function forgeResizeStart(e){
  FORGE.resizing = true;
  const startX = e.clientX;
  const ep = $('forge-editor-pane'), pp = $('forge-preview-pane');
  const totalW = ep.offsetWidth + pp.offsetWidth;
  const onMove = ev=>{
    if(!FORGE.resizing)return;
    const dx = ev.clientX - startX;
    const newW = Math.max(200, Math.min(totalW-200, ep.offsetWidth+dx));
    ep.style.flex='none'; ep.style.width=newW+'px';
    pp.style.flex='1'; pp.style.width='';
  };
  const onUp=()=>{ FORGE.resizing=false; document.removeEventListener('mousemove',onMove); document.removeEventListener('mouseup',onUp); };
  document.addEventListener('mousemove',onMove);
  document.addEventListener('mouseup',onUp);
}

/* ── DRAG & DROP ── */
function forgeDragOver(e){ e.preventDefault(); $('forge-dropzone')?.classList.add('dragover'); }
function forgeDragLeave(e){ $('forge-dropzone')?.classList.remove('dragover'); }
function forgeDrop(e){
  e.preventDefault(); $('forge-dropzone')?.classList.remove('dragover');
  forgeHandleFiles(e.dataTransfer.files);
}
function forgeOpenDropzone(){ $('forge-file-input')?.click(); }
function forgeFileInputChange(e){ forgeHandleFiles(e.target.files); }

function forgeHandleFiles(files){
  if(!files || !files.length) return;
  Array.from(files).forEach(file=>{
    const reader = new FileReader();
    reader.onload = ev=>{
      forgeOpenContent(uid(), file.name, ev.target.result);
      forgeLog('Loaded: '+file.name+' ('+Math.round(file.size/1024)+'KB)', 'ok');
    };
    reader.readAsText(file);
  });
}

/* ── SAVE / DOWNLOAD ── */
function forgeSave(){
  const f = FORGE.activeFile ? FORGE.files[FORGE.activeFile] : null;
  if(!f){ toast('No file open','warn'); return; }
  f.modified = false;
  forgeRenderFileTabs();
  // Save to project if name matches
  const projs = getProjects();
  const proj = projs.find(p=>p.name===f.name||p.id===f.id);
  if(proj){ proj.code=f.content; proj.updated_at=new Date().toISOString(); saveProjects(projs); }
  toast('Saved: '+f.name,'ok');
  forgeLog('File saved: '+f.name,'ok');
}

function forgeDownload(){
  const f = FORGE.activeFile ? FORGE.files[FORGE.activeFile] : null;
  if(!f){ toast('No file open','warn'); return; }
  const a=document.createElement('a'); a.href='data:text/plain;charset=utf-8,'+encodeURIComponent(f.content);
  a.download=f.name; a.click();
  toast('Downloaded: '+f.name,'ok');
}

/* ── LANG CHANGE ── */
function forgeLangChanged(){
  const f = FORGE.activeFile ? FORGE.files[FORGE.activeFile] : null;
  const lang = val('forge-lang-sel');
  if(f){ f.lang = lang; }
  forgePreviewRefresh();
}

/* ── FORMAT / LINT ── */
function forgeFormat(){
  const ed=$('forge-editor'); if(!ed) return;
  const f=FORGE.activeFile?FORGE.files[FORGE.activeFile]:null;
  if(!f){toast('No file','warn');return;}
  // Basic indent normalizer for HTML/JS
  let code=ed.value;
  if(f.lang==='json'){
    try{ code=JSON.stringify(JSON.parse(code),null,2); }catch(e){toast('JSON parse error: '+e.message,'err');return;}
  }
  ed.value=code; f.content=code; f.modified=true;
  forgeRenderFileTabs();
  toast('Formatted','ok');
  forgeLog('Format applied','ok');
}

function forgeLint(){
  const f=FORGE.activeFile?FORGE.files[FORGE.activeFile]:null;
  if(!f){toast('No file open','warn');return;}
  const issues=[];
  const lines=f.content.split('\n');
  lines.forEach((line,i)=>{
    if(line.includes('console.log')&&f.lang==='javascript') issues.push({ln:i+1,type:'warn',msg:'console.log left in code'});
    if(/TODO|FIXME|HACK/.test(line)) issues.push({ln:i+1,type:'warn',msg:line.match(/TODO|FIXME|HACK/)[0]+' comment'});
    if(line.length>200) issues.push({ln:i+1,type:'warn',msg:'Line exceeds 200 chars'});
  });
  if(f.lang==='json'){try{JSON.parse(f.content);}catch(e){issues.push({ln:1,type:'err',msg:'JSON: '+e.message});}}
  const out=$('fp-panel-output');
  if(out){
    out.style.display='flex';
    out.innerHTML=issues.length
      ? issues.map(i=>`<div class="forge-log-line"><span class="forge-log-ts">L${i.ln}</span><span class="forge-log-level ${i.type}">${i.type.toUpperCase()}</span><span class="forge-log-msg">${esc(i.msg)}</span></div>`).join('')
      : '<div class="forge-log-line"><span class="forge-log-level ok">PASS</span><span class="forge-log-msg">No lint issues found</span></div>';
    forgePreviewTab('output',$('fp-tab-output'));
  }
  forgeLog(`Lint: ${issues.length} issues found`,(issues.length?'warn':'ok'));
}

/* ── HOSTILE ATTACK ── */
async function forgeHostile(){
  const f=FORGE.activeFile?FORGE.files[FORGE.activeFile]:null;
  if(!f||!f.content){toast('No code to attack','warn');return;}
  forgeLog('Running hostile attack…','warn');
  const msgs=[
    {role:'system',content:'You are NEXUS Hostile Truth Engine. Brutally audit this code. Find every flaw, security hole, performance issue, edge case, and logic error. Be ruthless. Format: numbered list, severity (CRITICAL/HIGH/MEDIUM/LOW), and exact fix for each.'},
    {role:'user',content:`Attack this ${f.lang} code:\n\n${f.content.slice(0,8000)}`}
  ];
  const out=$('fp-panel-output');
  if(out){out.innerHTML='<div style="color:var(--r);font-family:var(--mono);font-size:10px;padding:6px">Running hostile analysis…</div>';forgePreviewTab('output',$('fp-tab-output'));}
  try{
    const r=await aiChat(msgs,{temperature:0.3,max_tokens:2000,stream:true});
    let text='';
    text=await readStream(r,(c,all)=>{if(out)out.innerHTML='<pre style="color:var(--r);font-size:10px;white-space:pre-wrap;padding:6px">'+esc(all)+'</pre>';});
    forgeLog('Hostile attack complete — '+text.split('\n').length+' lines','warn');
  }catch(e){forgeLog('Hostile error: '+e.message,'err');}
}

/* ── COMPILE ── */
async function forgeCompile(){
  const f=FORGE.activeFile?FORGE.files[FORGE.activeFile]:null;
  if(!f){toast('No file to compile','warn');return;}
  const targets=[...$('forge-comp-targets').querySelectorAll('.chk.on')].map(c=>c.dataset.ct);
  const log=$('forge-comp-log'); if(log)log.innerHTML='';
  const compLog=msg=>{ if(log){const d=document.createElement('div');d.style.cssText='padding:1px 0;border-bottom:1px solid rgba(26,42,64,.2)';d.textContent=msg;log.appendChild(d);scrollBot(log);} };
  const badge=$('forge-comp-badge');
  if(badge){badge.className='pill pill-busy';badge.querySelector('span').textContent='COMPILING';}
  compLog('▶ Compile started: '+f.name);
  compLog('Targets: '+targets.join(', ')||'web');
  compLog('Language: '+f.lang);
  const msgs=[
    {role:'system',content:`You are NEXUS Universal Compiler AI. Analyze the provided code and generate a comprehensive compilation/build manifest. For each target platform, provide: exact build commands, required dependencies, configuration files needed, environment setup, and deployment instructions. Cover: ${targets.join(', ')}. Output as structured JSON with keys: targets[], commands{}, configs{}, dependencies{}, notes.`},
    {role:'user',content:`File: ${f.name}\nLanguage: ${f.lang}\nTargets: ${targets.join(', ')}\n\nCode (first 4000 chars):\n${f.content.slice(0,4000)}\n\nGenerate complete build manifest.`}
  ];
  try{
    const r=await aiChat(msgs,{temperature:0.2,max_tokens:2000,stream:false});
    const text=r.stream?await readStream(r,()=>{}):r.text;
    compLog('✓ Build manifest generated');
    compLog(text.slice(0,500)+'…');
    const out=$('fp-panel-output');
    if(out){out.innerHTML='<pre style="color:var(--g);font-size:10px;white-space:pre-wrap;padding:8px">'+esc(text)+'</pre>';forgePreviewTab('output',$('fp-tab-output'));}
    if(badge){badge.className='pill pill-ok';badge.querySelector('span').textContent='DONE';}
    toast('Compile manifest ready','ok');
    forgeLog('Compile complete','ok');
  }catch(e){
    compLog('✗ ERROR: '+e.message);
    if(badge){badge.className='pill pill-err';badge.querySelector('span').textContent='ERROR';}
    forgeLog('Compile error: '+e.message,'err');
  }
}

function forgeToggleCompilerPanel(){
  const p=$('forge-compiler-panel'); if(!p)return;
  p.style.display=p.style.display==='none'?'flex':'none';
}

/* ── RUN IN TEST ENV ── */
function forgeRunInTestEnv(){
  const f=FORGE.activeFile?FORGE.files[FORGE.activeFile]:null;
  if(!f){toast('No file to send','warn');return;}
  // Transfer to test env
  TE.pendingCode=f.content;
  TE.pendingName=f.name;
  switchTab('testenv');
  toast('Sent to Test Environment','ok');
  forgeLog('→ Sent to Test Environment','ok');
}

/* ── CONSOLE / LOG ── */
function forgeLog(msg, level='info'){
  const panel=$('fb-panel-console'); if(!panel) return;
  const d=document.createElement('div'); d.className='forge-log-line';
  d.innerHTML=`<span class="forge-log-ts">${ts()}</span><span class="forge-log-level ${level}">${level.toUpperCase()}</span><span class="forge-log-msg">${esc(msg)}</span>`;
  panel.appendChild(d); scrollBot(panel);
}

function forgeConsoleClear(){
  const p=$('fb-panel-console'); if(p)p.innerHTML='';
}

function forgeConsoleKey(e){ if(e.key==='Enter') forgeConsoleSubmit(); }

async function forgeConsoleSubmit(){
  const input=$('forge-console-input'); if(!input) return;
  const text=input.value.trim(); if(!text) return;
  input.value='';
  forgeLog('> '+text,'info');
  // Route: if starts with ? or is a question, go to copilot
  if(text.startsWith('?')||text.includes(' ')){
    forgeBottomTab('copilot',$('fbt-copilot'));
    await forgePilotSendMessage(text.replace(/^\?/,'').trim());
  } else {
    // Command shortcuts
    const cmd=text.toLowerCase();
    if(cmd==='clear'){forgeConsoleClear();}
    else if(cmd==='save'){forgeSave();}
    else if(cmd==='lint'){forgeLint();}
    else if(cmd==='format'){forgeFormat();}
    else if(cmd==='audit'){forgePilotMode('audit');await forgePilotRun();}
    else if(cmd==='fix'){forgePilotMode('fix');await forgePilotRun();}
    else if(cmd==='hostile'||cmd==='attack'){await forgeHostile();}
    else if(cmd==='compile'){await forgeCompile();}
    else if(cmd==='help'||cmd==='?'){
      forgeLog('Commands: clear, save, lint, format, audit, fix, hostile, compile, test | Or type any question','info');
    } else {
      await forgePilotSendMessage(text);
    }
  }
}

/* ── CO-PILOT CORE ── */
function forgePilotMode(mode, btn){
  FORGE.pilotMode = mode;
  const badge=$('forge-pilot-mode'); if(badge) badge.textContent=mode.toUpperCase();
  document.querySelectorAll('.forge-pilot-mode-btn').forEach(b=>b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  else document.querySelector(`.forge-pilot-mode-btn[data-mode="${mode}"]`)?.classList.add('active');
}

function forgePilotCycle(){
  const modes=['audit','fix','extend','update','refactor','document','test','security','perf','explain'];
  const cur=modes.indexOf(FORGE.pilotMode);
  forgePilotMode(modes[(cur+1)%modes.length]);
}

function forgePilotKey(e){ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();forgePilotRun();} }

async function forgePilotRun(){
  const f=FORGE.activeFile?FORGE.files[FORGE.activeFile]:null;
  if(!f&&!$('forge-editor')?.value){toast('No code loaded','warn');return;}
  const instruction=val('forge-pilot-input').trim();
  const code=(f?.content||$('forge-editor')?.value||'').slice(0,12000);
  const msg=instruction||(FORGE.pilotMode+' this code');
  await forgePilotSendMessage(msg, code);
}

async function forgePilotSendMessage(userMsg, codeCtx){
  const f=FORGE.activeFile?FORGE.files[FORGE.activeFile]:null;
  const code=codeCtx||(f?.content||'').slice(0,12000);
  const lang=f?.lang||'auto';
  const inclCode=$('fpctx-code')?.classList.contains('on');
  const inclAxioms=$('fpctx-axioms')?.classList.contains('on');

  const modeSystemPrompts={
    audit: 'You are NEXUS Co-Pilot in AUDIT mode. Comprehensively audit the provided code. Report: architecture quality, security vulnerabilities, performance issues, code smells, missing error handling, and improvement opportunities. Be specific with line numbers and exact fixes.',
    fix: 'You are NEXUS Co-Pilot in FIX mode. Identify and fix all bugs, errors, and issues in the code. Output the corrected code with a brief diff summary of what changed.',
    extend: 'You are NEXUS Co-Pilot in EXTEND mode. Add new features, capabilities, or modules to the existing code. Maintain the existing architecture and patterns. Output production-ready additions.',
    update: 'You are NEXUS Co-Pilot in UPDATE mode. Modernize, refactor for best practices, update APIs to current versions, and improve the overall code quality while preserving all functionality.',
    refactor: 'You are NEXUS Co-Pilot in REFACTOR mode. Dramatically improve the code structure: extract functions, reduce complexity, improve naming, eliminate duplication, and apply SOLID principles.',
    document: 'You are NEXUS Co-Pilot in DOCUMENT mode. Generate comprehensive documentation: JSDoc/PHPDoc comments, README content, API docs, architecture overview, and inline explanations.',
    test: 'You are NEXUS Co-Pilot in TEST GENERATION mode. Generate a complete test suite: unit tests, integration tests, edge cases, mocks. Match the testing framework appropriate to the language.',
    security: 'You are NEXUS Co-Pilot in SECURITY mode. Perform a deep security audit: injection attacks, auth flaws, data exposure, CSRF, XSS, insecure dependencies, crypto misuse. Provide CVE references where relevant.',
    perf: 'You are NEXUS Co-Pilot in PERFORMANCE mode. Profile and optimize: algorithmic complexity, memory leaks, database queries, caching opportunities, async patterns, bundle size, rendering performance.',
    explain: 'You are NEXUS Co-Pilot in EXPLAIN mode. Explain this code thoroughly: what it does, how it works, the architecture decisions, design patterns used, and potential gotchas.',
    translate: 'You are NEXUS Co-Pilot in TRANSLATE mode. Translate this code to the requested target language while maintaining all functionality and improving idiom compatibility.',
    architect: 'You are NEXUS Co-Pilot in ARCHITECT mode. Analyze and redesign the architecture: suggest better patterns, propose a scalable structure, identify architectural debt, and outline a migration path.',
  };

  const sys=(modeSystemPrompts[FORGE.pilotMode]||modeSystemPrompts.audit)+(inclAxioms?'\n\n'+buildAxiomString():'');
  const msgs=[{role:'system',content:sys},...FORGE.pilotHistory.slice(-6)];
  if(inclCode&&code) msgs.push({role:'user',content:`Code (${lang}):\n\`\`\`\n${code}\n\`\`\``});
  msgs.push({role:'user',content:userMsg});

  forgePilotAddMsg('user',userMsg);
  const status=$('forge-pilot-status'); if(status){status.textContent='⟳ Thinking…';status.style.color='var(--y)';}

  FORGE._pilotAbort=new AbortController();
  try{
    abortCtrl=FORGE._pilotAbort;
    const r=await aiChat(msgs,{temperature:0.35,max_tokens:4000,stream:true});
    let fullText='';
    const msgEl=forgePilotAddMsg('ai','');
    fullText=await readStream(r,(c,all)=>{if(msgEl)msgEl.textContent=all;scrollBot($('forge-pilot-chat'));});
    FORGE.pilotHistory.push({role:'user',content:userMsg});
    FORGE.pilotHistory.push({role:'assistant',content:fullText});
    if(FORGE.pilotHistory.length>20) FORGE.pilotHistory=FORGE.pilotHistory.slice(-20);
    if(status){status.textContent='✓ Done — click ↙ APPLY to patch code';status.style.color='var(--g)';}
    FORGE._lastPatch=fullText;
    forgeLog('[Co-Pilot] '+FORGE.pilotMode+' complete ('+fullText.length+' chars)','pilot');
  }catch(e){
    if(e.name!=='AbortError') forgePilotAddMsg('system','Error: '+e.message);
    if(status){status.textContent='Error: '+e.message;status.style.color='var(--r)';}
  }finally{ abortCtrl=null; FORGE._pilotAbort=null; }
}

function forgePilotAddMsg(role, text){
  const chat=$('forge-pilot-chat'); if(!chat) return null;
  const d=document.createElement('div'); d.className='forge-pilot-msg '+role;
  d.textContent=text; chat.appendChild(d); scrollBot(chat); return d;
}

function forgePilotAbort(){
  FORGE._pilotAbort?.abort(); abortCtrl?.abort();
  const s=$('forge-pilot-status'); if(s){s.textContent='Aborted';s.style.color='var(--r)';}
}

function forgePilotApplyPatch(){
  const patch=FORGE._lastPatch; if(!patch){toast('No patch to apply','warn');return;}
  // Extract code block if present
  let code=patch;
  const m=patch.match(/```(?:\w+)?\n([\s\S]+?)```/);
  if(m) code=m[1];
  if(code.length < 20){toast('No code block found in response','warn');return;}
  const f=FORGE.activeFile?FORGE.files[FORGE.activeFile]:null;
  if(!f){toast('No file open to patch','warn');return;}
  // Save previous as revision
  if(f.content) REV.add(f.id,f.content,'enhance','Pre-copilot patch');
  f.content=code; f.modified=true;
  const ed=$('forge-editor'); if(ed) ed.value=code;
  forgeRenderFileTabs();
  forgePreviewRefresh();
  toast('Patch applied','ok');
  forgePilotAddMsg('system','✓ Patch applied to '+f.name);
  forgeLog('Co-pilot patch applied','ok');
}

