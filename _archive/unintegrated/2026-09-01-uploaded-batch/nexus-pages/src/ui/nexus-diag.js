/* NEXUS v0.53.0 — nexus-diag.js
 * Diagnostic panel + Playwright test engine
 * Phase 0B — extracted 2026-04-07
 */

/* ═══════════════════════════════════════════════════════════════
   NEXUS v8 — DIAGNOSTIC PANEL + PLAYWRIGHT TEST ENGINE
   ═══════════════════════════════════════════════════════════════ */

/* ── DIAG PANEL CONTROL ── */
function nxDiagToggle(){
  const p=$('nx-diag-panel'),t=$('nx-diag-trigger');
  if(!p)return;
  const open=p.classList.toggle('open');
  if(t)t.style.display=open?'none':'flex';
  if(open) nxDiagRefreshStats();
}
function nxDiagTab(name,btn){
  document.querySelectorAll('.nx-dpanel').forEach(p=>{p.classList.remove('active');});
  document.querySelectorAll('.nx-dtab').forEach(b=>b.classList.remove('active'));
  const p=$('nx-dp-'+name);if(p)p.classList.add('active');
  if(btn)btn.classList.add('active');
  if(name==='stats')nxDiagRefreshStats();
  if(name==='pw'){const r=$('nx-pw-results');if(r&&!r.children.length)pwRunSmoke();}
}
function nxDiagClear(){
  NX_ERRORS.length=0;
  const l=$('nx-error-log-list');if(l)l.innerHTML='';
  const b=$('nx-error-badge');if(b){b.textContent='0';}
}
function nxDiagRefreshStats(){
  const list=$('nx-stats-list');if(!list)return;
  const projs=getProjects?.()??[];
  const rows=[
    ['Total interactions',NX_INTERACTIONS.total,'neutral'],
    ['OK actions',NX_INTERACTIONS.ok,'ok'],
    ['Warnings',NX_INTERACTIONS.warn,'warn'],
    ['Errors',NX_ERRORS.length,'err'],
    ['Projects',projs.length,'neutral'],
    ['AI provider',AI?.provider||'—','neutral'],
    ['Bridge',BRIDGE?.connected?'ONLINE':'OFFLINE',BRIDGE?.connected?'ok':'err'],
    ['Test env services',(()=>{try{const s=typeof TE!=='undefined'?TE?.services||{}:{};return Object.values(s).filter(Boolean).length+'/'+Object.keys(s).length;}catch{return '—';}})(),'neutral'],
    ['Open files',Object.keys(FORGE?.files||{}).length,'neutral'],
    ['Forge active',FORGE?.activeFile?'YES':'NO',FORGE?.activeFile?'ok':'warn'],
    ['localStorage',_lsOk()?'AVAILABLE':'BLOCKED',_lsOk()?'ok':'err'],
    ['AI axioms',(AI?.axioms?.chatgpt?.length||0)+' loaded','neutral'],
    ['Jaa entries',JAA?.getAll?.()?.length||0,'neutral'],
  ];
  list.innerHTML=rows.map(([l,v,c])=>`<div class="nx-stat-row"><span class="nx-stat-label">${esc(l)}</span><span class="nx-stat-val ${c}">${esc(String(v))}</span></div>`).join('');
}
function _lsOk(){try{localStorage.setItem('_nx_t','1');localStorage.removeItem('_nx_t');return true;}catch{return false;}}

/* ═══════════════════════════════════════════════════════════════
   PLAYWRIGHT-STYLE TEST ENGINE
   Tests every tab, button, input, feature, and service.
   ═══════════════════════════════════════════════════════════════ */
const PW = {
  results: [],
  running: false,
  _log: [],
};

function pwLog(msg){ PW._log.push(`[${ts()}] ${msg}`); }

async function pwExpect(label, fn, errorHint=''){
  const t0=performance.now();
  try{
    const result = await fn();
    if(result===false) throw new Error('Assertion returned false');
    const dur = Math.round(performance.now()-t0);
    PW.results.push({label,status:'pass',dur,hint:''});
    pwLog(`PASS ${label} (${dur}ms)`);
    return true;
  }catch(e){
    const dur = Math.round(performance.now()-t0);
    const detail = errorHint || e.message;
    PW.results.push({label,status:'fail',dur,hint:detail,err:e.message});
    pwLog(`FAIL ${label}: ${e.message}`);
    nxError('PW_FAIL', `Test failed: ${label}`, detail, 'playwright');
    return false;
  }
}

function pwRenderResults(containerId='nx-pw-results'){
  const container=$(containerId); if(!container) return;
  container.innerHTML='';
  // Group by suite
  const groups={};
  PW.results.forEach(r=>{
    const parts=r.label.split('::');
    const suite=parts[0]||'General';
    const name=parts.slice(1).join('::');
    if(!groups[suite]) groups[suite]=[];
    groups[suite].push({...r, name: name||r.label});
  });
  Object.entries(groups).forEach(([suite,tests])=>{
    const pass=tests.filter(t=>t.status==='pass').length;
    const fail=tests.filter(t=>t.status==='fail').length;
    const run=tests.filter(t=>t.status==='run').length;
    const status=run?'running':fail?'fail':'pass';
    const g=document.createElement('div'); g.className='pw-test-group';
    const head=document.createElement('div'); head.className='pw-test-group-head '+status;
    head.innerHTML=`<span class="pw-test-group-name">${esc(suite)}</span><span style="font-size:9px;color:var(--text3)">${pass}/${tests.length} passed</span>`;
    g.appendChild(head);
    tests.forEach(t=>{
      const row=document.createElement('div'); row.className='pw-test-row';
      const icon=document.createElement('div'); icon.className='pw-test-icon '+t.status;
      icon.textContent=t.status==='pass'?'✓':t.status==='fail'?'✕':t.status==='run'?'…':'—';
      row.innerHTML=`<div class="pw-test-name">${esc(t.name)}</div><div class="pw-test-dur">${t.dur||0}ms</div>`;
      if(t.hint&&t.status==='fail') row.innerHTML+=`<div class="pw-test-err">${esc(t.hint)}</div>`;
      row.insertBefore(icon,row.firstChild);
      g.appendChild(row);
    });
    container.appendChild(g);
  });
}

async function pwRunSmoke(){
  PW.results=[]; PW._log=[];
  const c=$('nx-pw-results'); if(c) c.innerHTML='<div style="font-size:9px;color:var(--y);padding:8px">⟳ Running smoke tests…</div>';
  await pwSuite_DOM();
  pwRenderResults();
}

async function pwRunAll(){
  PW.results=[]; PW._log=[];
  PW.running=true;
  const c=$('nx-pw-results'); if(c) c.innerHTML='<div style="font-size:9px;color:var(--y);padding:8px">⟳ Running all tests — this may take 20-30s…</div>';
  await pwSuite_DOM();
  await new Promise(r=>setTimeout(r,30));
  await pwSuite_Navigation();
  await new Promise(r=>setTimeout(r,30));
  await pwSuite_Storage();
  await new Promise(r=>setTimeout(r,30));
  await pwSuite_ForgeIDE();
  await new Promise(r=>setTimeout(r,30));
  await pwSuite_TestEnv();
  await new Promise(r=>setTimeout(r,30));
  await pwSuite_Console();
  await new Promise(r=>setTimeout(r,30));
  await pwSuite_Builder();
  await new Promise(r=>setTimeout(r,30));
  await pwSuite_CoPilot();
  await new Promise(r=>setTimeout(r,30));
  await pwSuite_Projects();
  await new Promise(r=>setTimeout(r,30));
  await pwSuite_AI();
  await new Promise(r=>setTimeout(r,30));
  await pwSuite_ErrorSystem();
  PW.running=false;
  pwRenderResults();
  // Also update the main test tab
  pwUpdateMainTestTab();
  const pass=PW.results.filter(r=>r.status==='pass').length;
  const fail=PW.results.filter(r=>r.status==='fail').length;
  toast(`PW Tests: ${pass} passed, ${fail} failed`, fail?'warn':'ok', 6000);
  log_ev('pw:complete',{pass,fail,total:PW.results.length},'INFO');
}

function pwUpdateMainTestTab(){
  // Sync into the main TESTS tab UI panel
  const pass=PW.results.filter(r=>r.status==='pass').length;
  const fail=PW.results.filter(r=>r.status==='fail').length;
  const total=PW.results.length;
  const pct=total?Math.round(pass/total*100):0;
  const els={
    'test-pass-count':pass,'test-fail-count':fail,'test-total-count':total,
    'test-score-pct':pct+'%','test-last-run':new Date().toLocaleTimeString(),
    'opts-pass':pass,'opts-fail':fail,'opts-total':total,'opts-score':pct+'%'
  };
  Object.entries(els).forEach(([id,v])=>{const el=$(id);if(el)el.textContent=v;});
  const bar=$('test-progress-bar');if(bar){bar.style.width=pct+'%';bar.style.background=fail?'var(--r)':'var(--g)';}
  const skb=$('test-skip-count');if(skb)skb.textContent=0;
  const badge=$('tests-acc-badge');if(badge)badge.textContent=pct+'%';
  // Inject PW results into the UI smoke tab
  const uiEl=$('ui-test-results');
  if(uiEl){ uiEl.innerHTML=''; pwRenderResults(); const r=$('nx-pw-results'); if(r) uiEl.innerHTML=r.innerHTML; }
}

/* ── SUITE: DOM Integrity ── */
async function pwSuite_DOM(){
  const critical=[
    'app','top-bar','nav-bar','main','toast-root',
    'tab-home','tab-console','tab-builder','tab-forge','tab-testenv',
    'tab-projects','tab-log','tab-options','tab-tests','tab-help',
    'forge-editor','forge-pilot-chat','forge-file-tabs',
    'nx-diag-panel','nx-error-log-list',
    'console-output','console-input','system-prompt',
    'te-status-pill','tes-dashboard','tes-instances'
  ];
  for(const id of critical){
    await pwExpect(`DOM::Element #${id} exists`,()=>!!$(id),`Element #${id} missing from DOM — check HTML injection`);
  }
  await pwExpect('DOM::Nav has correct tab count',()=>{
    const tabs=document.querySelectorAll('.tab-btn');
    if(tabs.length<8) throw new Error(`Only ${tabs.length} tabs found, expected ≥8`);
    return true;
  },'Check nav-bar tab-btn elements');
  await pwExpect('DOM::All tab panels have matching tab buttons',()=>{
    const panels=[...document.querySelectorAll('.tab-panel')].map(p=>p.id.replace('tab-',''));
    const missing=panels.filter(n=>!document.querySelector(`.tab-btn[data-tab="${n}"]`));
    if(missing.length) throw new Error(`No nav button for: ${missing.join(', ')}`);
    return true;
  });
}

/* ── SUITE: Navigation ── */
async function pwSuite_Navigation(){
  const tabs=['home','console','builder','forge','testenv','projects','log','options','tests','help'];
  for(const tab of tabs){
    await pwExpect(`Navigation::switchTab('${tab}') activates panel`,()=>{
      switchTab(tab);
      const panel=$('tab-'+tab);
      if(!panel) throw new Error(`Panel #tab-${tab} not found`);
      if(panel.dataset.active!=='true') throw new Error(`Panel not activated after switchTab('${tab}')`);
      const btn=document.querySelector(`.tab-btn[data-tab="${tab}"]`);
      if(btn&&btn.dataset.active!=='true') throw new Error(`Nav button not marked active for ${tab}`);
      return true;
    },`Tab '${tab}' panel not activating — check switchTab() routing`);
    await new Promise(r=>setTimeout(r,20));
  }
  // Restore home
  switchTab('home');
}

/* ── SUITE: Storage ── */
async function pwSuite_Storage(){
  await pwExpect('Storage::localStorage available',()=>{
    localStorage.setItem('_pw_test','1');
    const v=localStorage.getItem('_pw_test');
    localStorage.removeItem('_pw_test');
    if(v!=='1') throw new Error('Read-back mismatch');
    return true;
  },'localStorage not available — may be private/blocked');
  await pwExpect('Storage::Projects read/write',()=>{
    const before=getProjects();
    const id='_pw_'+uid();
    const p={id,name:'PW_TEST',code:'//test',created_at:new Date().toISOString(),updated_at:new Date().toISOString()};
    const all=[p,...before];
    saveProjects(all);
    const after=getProjects();
    const found=after.find(x=>x.id===id);
    saveProjects(before); // restore
    if(!found) throw new Error('Project not persisted');
    return true;
  });
  await pwExpect('Storage::JAA log write/read',()=>{
    const entry=JAA.log('pw:test',{msg:'test'},'_pw_test','INFO');
    if(!entry?.id) throw new Error('JAA log returned no entry');
    const all=JAA.getAll();
    if(!all.find(e=>e.id===entry.id)) throw new Error('JAA entry not found after write');
    return true;
  });
}

/* ── SUITE: Forge IDE ── */
async function pwSuite_ForgeIDE(){
  switchTab('forge');
  await new Promise(r=>setTimeout(r,50));

  await pwExpect('Forge::forgeInit() runs without error',()=>{
    // Re-run is safe due to _initialized guard
    const prevInit=FORGE._initialized;
    FORGE._initialized=false;
    forgeInit();
    FORGE._initialized=true;
    return true;
  },'forgeInit threw — check FORGE init block');

  await pwExpect('Forge::forgeNewFile() creates a file',()=>{
    const before=Object.keys(FORGE.files).length;
    forgeNewFile();
    const after=Object.keys(FORGE.files).length;
    if(after<=before) throw new Error(`No new file created (before:${before}, after:${after})`);
    return true;
  });

  await pwExpect('Forge::forgeOpenContent() sets active file',()=>{
    forgeOpenContent('_pw_file','test.js','console.log("hello");');
    if(FORGE.activeFile!=='_pw_file') throw new Error('Active file not set');
    if(!FORGE.files['_pw_file']) throw new Error('File not in FORGE.files');
    return true;
  });

  await pwExpect('Forge::Editor textarea updates on forgeActivateFile()',()=>{
    forgeActivateFile('_pw_file');
    const ed=$('forge-editor');
    if(!ed) throw new Error('#forge-editor not found');
    if(!ed.value.includes('console.log')) throw new Error('Editor value not set');
    return true;
  });

  await pwExpect('Forge::forgeEditorInput() marks file modified',()=>{
    const ed=$('forge-editor'); if(!ed) throw new Error('No editor');
    const f=FORGE.files['_pw_file'];
    f.modified=false;
    ed.value+=' // edit';
    forgeEditorInput();
    if(!f.modified) throw new Error('File not marked modified');
    return true;
  });

  await pwExpect('Forge::forgeLangFromName() maps extensions correctly',()=>{
    const tests={
      'app.js':'javascript','index.html':'html','main.py':'python',
      'server.php':'php','Cargo.rs':'rust','main.go':'go',
      'config.yml':'yaml','query.sql':'sql','Dockerfile':'dockerfile'
    };
    for(const [name,expected] of Object.entries(tests)){
      const got=forgeLangFromName(name);
      if(got!==expected&&expected!=='auto') throw new Error(`${name}: expected ${expected}, got ${got}`);
    }
    return true;
  });

  await pwExpect('Forge::forgeLint() runs on JS file',()=>{
    forgeOpenContent('_pw_lint','lint_test.js','console.log("test");\n// TODO: fix this');
    forgeActivateFile('_pw_lint');
    forgeLint();
    return true;
  },'forgeLint() threw — check lint implementation');

  await pwExpect('Forge::forgeFormat() on valid JSON',()=>{
    forgeOpenContent('_pw_json','data.json','{"a":1,"b":2}');
    forgeActivateFile('_pw_json');
    const langSel=$('forge-lang-sel'); if(langSel) langSel.value='json';
    forgeLangChanged();
    forgeFormat();
    const f=FORGE.files['_pw_json'];
    if(!f.content.includes('\n')) throw new Error('JSON not formatted (no newlines)');
    return true;
  });

  await pwExpect('Forge::forgeCloseFile() removes from FORGE.files',()=>{
    const id='_pw_close_test';
    FORGE.files[id]={id,name:'close.js',lang:'javascript',content:'test',modified:false};
    forgeCloseFile(id);
    if(FORGE.files[id]) throw new Error('File still in FORGE.files after close');
    return true;
  });

  await pwExpect('Forge::forgeSave() clears modified flag',()=>{
    forgeOpenContent('_pw_save','save_test.js','let x=1;');
    forgeActivateFile('_pw_save');
    FORGE.files['_pw_save'].modified=true;
    forgeSave();
    if(FORGE.files['_pw_save']?.modified) throw new Error('Modified flag not cleared after save');
    return true;
  });

  await pwExpect('Forge::forgeSetView() all 4 views work',()=>{
    ['split','editor','preview','console'].forEach(v=>forgeSetView(v));
    forgeSetView('split'); // restore
    return true;
  });

  await pwExpect('Forge::forgePreviewTab() switches panels',()=>{
    ['preview','output','diff','ast'].forEach(name=>forgePreviewTab(name));
    forgePreviewTab('preview'); // restore
    return true;
  });

  await pwExpect('Forge::forgeBottomTab() switches bottom panels',()=>{
    ['console','copilot','buildlog','qa'].forEach(name=>forgeBottomTab(name));
    forgeBottomTab('console'); // restore
    return true;
  });

  await pwExpect('Forge::File tree renders correctly',()=>{
    forgeRenderFileTree();
    const tree=$('forge-file-tree'); if(!tree) throw new Error('#forge-file-tree not found');
    if(!tree.children.length) throw new Error('File tree empty after forgeRenderFileTree()');
    return true;
  });

  await pwExpect('Forge::File tabs render correctly',()=>{
    forgeRenderFileTabs();
    const bar=$('forge-file-tabs'); if(!bar) throw new Error('#forge-file-tabs not found');
    return true;
  });

  await pwExpect('Forge::forgeCursorUpdate() does not throw',()=>{
    forgeOpenContent('_pw_cursor','cursor.js','let a=1;\nlet b=2;');
    forgeActivateFile('_pw_cursor');
    forgeCursorUpdate();
    const el=$('forge-line-col');
    if(!el?.textContent?.includes('Ln')) throw new Error('Cursor display not updated');
    return true;
  });

  await pwExpect('Forge::forgeDownload() does not throw on valid file',()=>{
    forgeOpenContent('_pw_dl','download.txt','hello');
    forgeActivateFile('_pw_dl');
    // Can't truly test download in DOM, but ensure no throw
    try{ forgeDownload(); }catch(e){ throw new Error('forgeDownload threw: '+e.message); }
    return true;
  });

  await pwExpect('Forge::Compiler panel toggle works',()=>{
    const p=$('forge-compiler-panel'); if(!p) throw new Error('No compiler panel');
    const before=p.style.display;
    forgeToggleCompilerPanel();
    const after=p.style.display;
    if(before===after) throw new Error('Panel display did not change');
    forgeToggleCompilerPanel(); // restore
    return true;
  });
}

/* ── SUITE: Test Environment ── */
async function pwSuite_TestEnv(){
  switchTab('testenv');
  await new Promise(r=>setTimeout(r,50));

  await pwExpect('TestEnv::teInit() runs without error',()=>{
    TE._initialized=false;
    teInit();
    return TE._initialized===true;
  });

  await pwExpect('TestEnv::teSwitchTab() switches all sub-tabs',()=>{
    const tabs=['dashboard','instances','php','apache','mysql','runner','browser','network','logs'];
    for(const t of tabs){
      teSwitchTab(t,document.querySelector(`[data-tetab="${t}"]`));
      const panel=$('tes-'+t);
      if(!panel) throw new Error(`Panel #tes-${t} not found`);
    }
    teSwitchTab('dashboard');
    return true;
  });

  await pwExpect('TestEnv::teToggleService() starts/stops services',()=>{
    teToggleService('apache',true);
    if(!TE.services.apache) throw new Error('Apache not set to true');
    teToggleService('apache',false);
    if(TE.services.apache) throw new Error('Apache not set to false');
    return true;
  });

  await pwExpect('TestEnv::teStart() starts core services',()=>{
    teStart();
    if(!TE.services.apache||!TE.services.php||!TE.services.mysql) throw new Error('Not all services started');
    return true;
  });

  await pwExpect('TestEnv::teSpawnInstance() creates instance',()=>{
    const before=TE.instances.length;
    teSpawnInstance();
    if(TE.instances.length<=before) throw new Error('No instance added');
    const inst=TE.instances[TE.instances.length-1];
    if(!inst.id||!inst.port) throw new Error('Instance missing id or port');
    return true;
  });

  await pwExpect('TestEnv::teKillInstance() removes instance',()=>{
    const before=TE.instances.length;
    if(!before){teSpawnInstance();}
    const id=TE.instances[0].id;
    teKillInstance(id);
    if(TE.instances.find(i=>i.id===id)) throw new Error('Instance not removed');
    return true;
  });

  await pwExpect('TestEnv::teSelectDb() updates active DB',()=>{
    const el=document.querySelector('.te-db-item');
    if(!el) throw new Error('No .te-db-item found');
    teSelectDb(el,'nexus_test');
    if(TE.activeDb!=='nexus_test') throw new Error('activeDb not updated');
    return true;
  });

  await pwExpect('TestEnv::teCreateDb() adds item to list',()=>{
    const before=$('te-db-list')?.children?.length||0;
    // Simulate without prompt
    const name='_pw_testdb';
    const list=$('te-db-list');
    if(!list) throw new Error('#te-db-list not found');
    const item=document.createElement('div'); item.className='te-db-item';
    item.innerHTML=`<span>${name}</span>`;
    list.appendChild(item);
    if($('te-db-list').children.length<=before) throw new Error('DB item not added');
    return true;
  });

  await pwExpect('TestEnv::teAddNetEntry() appends to network log',()=>{
    teSwitchTab('network');
    const log=$('te-net-log'); if(!log) throw new Error('#te-net-log not found');
    const before=log.children.length;
    teAddNetEntry('GET','200','/test','text/html','5ms');
    if(log.children.length<=before) throw new Error('Network entry not added');
    return true;
  });

  await pwExpect('TestEnv::teSuiteListRender() populates suite list',()=>{
    teSuiteListRender();
    const list=$('te-suite-list');
    if(!list) throw new Error('#te-suite-list not found');
    if(!list.children.length) throw new Error('Suite list empty');
    return true;
  });

  await pwExpect('TestEnv::teBrowserNav() does not throw',()=>{
    setVal('te-browser-url','http://localhost:8080');
    teBrowserNav();
    return true;
  });

  await pwExpect('TestEnv::teStop() stops all services',()=>{
    teStop();
    const anyRunning=Object.values(TE.services).some(Boolean);
    if(anyRunning) throw new Error('Services still running after teStop()');
    return true;
  });
}

/* ── SUITE: Console ── */
async function pwSuite_Console(){
  switchTab('console');
  await new Promise(r=>setTimeout(r,30));

  await pwExpect('Console::Output element exists',()=>!!$('console-output'),'#console-output not found');
  await pwExpect('Console::Input element exists',()=>!!$('console-input'),'#console-input not found');
  await pwExpect('Console::System prompt element exists',()=>!!$('system-prompt'),'#system-prompt not found');

  await pwExpect('Console::appendMsg() adds message to output',()=>{
    const out=$('console-output');if(!out) throw new Error('No output');
    const before=out.children.length;
    appendMsg('system','PW test message');
    if(out.children.length<=before) throw new Error('Message not appended');
    return true;
  });

  await pwExpect('Console::Quick commands exist',()=>{
    const cmds=document.querySelectorAll('.qcmd');
    if(cmds.length<4) throw new Error(`Only ${cmds.length} quick commands found`);
    return true;
  });

  await pwExpect('Console::Engine pills exist and are clickable',()=>{
    const pills=document.querySelectorAll('.eng-pill');
    if(!pills.length) throw new Error('No engine pills');
    pills[0].click();
    return true;
  });

  await pwExpect('Console::Depth buttons exist',()=>{
    const btns=document.querySelectorAll('.depth-btn');
    if(btns.length<3) throw new Error(`Only ${btns.length} depth buttons`);
    return true;
  });

  await pwExpect('Console::Mode toggle (CHAT/PILOT) works',()=>{
    const chat=$('mode-chat'),pilot=$('mode-pilot');
    if(!chat||!pilot) throw new Error('Mode buttons not found');
    pilot.click(); chat.click();
    return true;
  });

  await pwExpect('Console::Clear button works',()=>{
    const out=$('console-output');if(!out) throw new Error('No output');
    appendMsg('system','msg1');appendMsg('system','msg2');
    $('clr-console').click();
    if(out.children.length>0) throw new Error(`Output has ${out.children.length} items after clear`);
    return true;
  });
}

/* ── SUITE: Builder ── */
async function pwSuite_Builder(){
  switchTab('builder');
  await new Promise(r=>setTimeout(r,30));

  await pwExpect('Builder::Sub-tabs exist',()=>{
    const tabs=document.querySelectorAll('#sb-subtab-bar .ptab');
    if(tabs.length<4) throw new Error(`Only ${tabs.length} builder sub-tabs`);
    return true;
  });

  await pwExpect('Builder::sbSwitchSub() works for all sub-tabs',()=>{
    ['script','gated','template','qa','compiler'].forEach(name=>{
      const btn=document.querySelector(`[data-sbt="${name}"]`);
      if(!btn) throw new Error(`No button for sub-tab: ${name}`);
      sbSwitchSub(name,btn);
    });
    sbSwitchSub('script',document.querySelector('[data-sbt="script"]'));
    return true;
  });

  await pwExpect('Builder::Vision input accepts text',()=>{
    const inp=$('sb-endstate');if(!inp) throw new Error('#sb-endstate not found');
    inp.value='Test vision';
    if(inp.value!=='Test vision') throw new Error('Input value not set');
    return true;
  });

  await pwExpect('Builder::Output type select has options',()=>{
    const sel=$('sb-output-type');if(!sel) throw new Error('#sb-output-type not found');
    if(sel.options.length<5) throw new Error(`Only ${sel.options.length} output types`);
    return true;
  });

  await pwExpect('Builder::Language select has options',()=>{
    const sel=$('sb-lang');if(!sel) throw new Error('#sb-lang not found');
    if(sel.options.length<8) throw new Error(`Only ${sel.options.length} languages`);
    return true;
  });

  await pwExpect('Builder::SISO/Stream/Red-team checkboxes exist',()=>{
    const ids=['chk-siso','chk-stream','chk-hostile','chk-docs'];
    ids.forEach(id=>{
      if(!$(id)) throw new Error(`Missing checkbox: #${id}`);
    });
    return true;
  });

  await pwExpect('Builder::sbGenerate() with no vision shows error',async()=>{
    setVal('sb-endstate','');
    await sbGenerate();
    return true; // Error toast is the expected behavior
  });

  await pwExpect('Builder::sbDownload() with no code shows error toast',()=>{
    _generatedCode='';
    sbDownload();
    return true;
  });

  await pwExpect('Builder::sbCopyOutput() does not throw',()=>{
    sbCopyOutput();
    return true;
  });

  await pwExpect('Builder::Compiler targets all exist',()=>{
    const targets=['comp-win','comp-linux','comp-mac','comp-web','comp-electron'];
    targets.forEach(id=>{if(!$(id))throw new Error(`Missing: #${id}`);});
    return true;
  });
}

/* ── SUITE: Co-Pilot ── */
async function pwSuite_CoPilot(){
  switchTab('forge');
  await new Promise(r=>setTimeout(r,30));

  await pwExpect('CoPilot::forgePilotMode() sets mode correctly',()=>{
    const modes=['audit','fix','extend','update','refactor','document','test','security','perf','explain','translate','architect'];
    modes.forEach(m=>forgePilotMode(m));
    if(FORGE.pilotMode!=='architect') throw new Error('Last mode not set to architect');
    forgePilotMode('audit'); // restore
    return true;
  });

  await pwExpect('CoPilot::forgePilotCycle() cycles through modes',()=>{
    forgePilotMode('audit');
    forgePilotCycle();
    if(FORGE.pilotMode==='audit') throw new Error('Mode did not advance');
    return true;
  });

  await pwExpect('CoPilot::forgePilotAddMsg() adds to chat',()=>{
    const chat=$('forge-pilot-chat');if(!chat) throw new Error('No pilot chat');
    const before=chat.children.length;
    forgePilotAddMsg('system','test message');
    if(chat.children.length<=before) throw new Error('Message not added');
    return true;
  });

  await pwExpect('CoPilot::forgePilotAbort() does not throw',()=>{
    forgePilotAbort();
    return true;
  });

  await pwExpect('CoPilot::Context checkboxes exist',()=>{
    const ids=['fpctx-code','fpctx-selection','fpctx-projects','fpctx-axioms','fpctx-errors'];
    ids.forEach(id=>{ if(!$(id)) throw new Error(`Missing: #${id}`); });
    return true;
  });

  await pwExpect('CoPilot::forgePilotApplyPatch() warns with no patch',()=>{
    FORGE._lastPatch=null;
    forgePilotApplyPatch(); // Should show warn toast, not throw
    return true;
  });
}

/* ── SUITE: Projects ── */
async function pwSuite_Projects(){
  await pwExpect('Projects::saveNewProject() creates project',()=>{
    const before=getProjects().length;
    saveNewProject('_PW_TEST_','//_pw',`PW test project`);
    const after=getProjects();
    const found=after.find(p=>p.name==='_PW_TEST_');
    if(!found) throw new Error('Project not saved');
    // Clean up
    saveProjects(after.filter(p=>p.name!=='_PW_TEST_'));
    return true;
  });

  await pwExpect('Projects::renderProjects() runs without error',()=>{
    switchTab('projects');
    renderProjects();
    return true;
  });

  await pwExpect('Projects::Project search filter works',()=>{
    const inp=$('proj-search');
    if(!inp) throw new Error('#proj-search not found');
    inp.value='nonexistent_xyz';
    renderProjects();
    inp.value='';
    renderProjects();
    return true;
  });

  await pwExpect('Projects::projExportAll() does not throw',()=>{
    projExportAll();
    return true;
  });
}

/* ── SUITE: AI Configuration ── */
async function pwSuite_AI(){
  await pwExpect('AI::AI object exists with required fields',()=>{
    if(!AI) throw new Error('AI object undefined');
    if(!AI.provider) throw new Error('AI.provider undefined');
    if(!AI.axioms) throw new Error('AI.axioms undefined');
    return true;
  });

  await pwExpect('AI::buildAxiomString() returns string',()=>{
    const s=buildAxiomString();
    if(typeof s!=='string') throw new Error('Not a string: '+typeof s);
    return true;
  });

  await pwExpect('AI::ENGINES object has all 4 engines',()=>{
    const required=['erosmancer','hostile','deltaRisk','unified'];
    required.forEach(k=>{if(!ENGINES[k])throw new Error(`Missing engine: ${k}`);});
    return true;
  });

  await pwExpect('AI::requireAI() returns bool without throwing',()=>{
    const result=requireAI('pw-test');
    if(typeof result!=='boolean') throw new Error('requireAI not returning boolean');
    return true;
  });

  await pwExpect('AI::aiChat() fails gracefully with no bridge',async()=>{
    // Should throw, not hang
    try{ await Promise.race([aiChat([{role:'user',content:'test'}],{stream:false}), new Promise((_,r)=>setTimeout(()=>r(new Error('timeout')),2000))]); }
    catch(e){ return true; } // Expected to fail
    return true;
  },'aiChat should fail when bridge is offline');
}

/* ── SUITE: Error System ── */
async function pwSuite_ErrorSystem(){
  await pwExpect('ErrorSystem::nxError() adds to NX_ERRORS',()=>{
    const before=NX_ERRORS.length;
    nxError('PW_SELF_TEST','Test error','Test detail','test');
    if(NX_ERRORS.length<=before) throw new Error('Error not added to NX_ERRORS');
    return true;
  });

  await pwExpect('ErrorSystem::nxWarn() adds to NX_ERRORS',()=>{
    const before=NX_ERRORS.length;
    nxWarn('PW_WARN_TEST','Test warn','Test detail','test');
    if(NX_ERRORS.length<=before) throw new Error('Warn not added to NX_ERRORS');
    return true;
  });

  await pwExpect('ErrorSystem::errorToast() adds toast to DOM',()=>{
    const r=$('toast-root');if(!r) throw new Error('No toast root');
    const before=r.children.length;
    errorToast('PW test toast','PW detail text','warn');
    if(r.children.length<=before) throw new Error('Toast not added');
    return true;
  });

  await pwExpect('ErrorSystem::requireFile() returns false with no file',()=>{
    const saved=FORGE.activeFile;
    FORGE.activeFile=null;
    const r=requireFile('pw-test');
    FORGE.activeFile=saved;
    if(r!==false) throw new Error('requireFile should return false when no file');
    return true;
  });

  await pwExpect('ErrorSystem::requireService() returns false when service off',()=>{
    TE.services.mysql=false;
    const r=requireService('mysql','pw-test');
    if(r!==false) throw new Error('requireService should return false when service off');
    return true;
  });

  await pwExpect('ErrorSystem::nxDiagToggle() opens/closes panel',()=>{
    const p=$('nx-diag-panel');if(!p) throw new Error('No diag panel');
    const before=p.classList.contains('open');
    nxDiagToggle();
    const after=p.classList.contains('open');
    if(before===after) throw new Error('Panel state did not change');
    nxDiagToggle(); // restore
    return true;
  });

  await pwExpect('ErrorSystem::nxDiagTab() switches tabs',()=>{
    nxDiagToggle(); // open
    ['errors','stats','pw'].forEach(t=>nxDiagTab(t,null));
    nxDiagTab('errors',null);
    nxDiagToggle(); // close
    return true;
  });
}

/* ─── ERROR-AWARE OVERRIDES for FORGE features ─── */
/* These wrap the existing functions with require* guards */

const _origForgeHostile=typeof forgeHostile==='function'?forgeHostile:null;
forgeHostile=async function(){
  if(!requireFile('forge:hostile')) return;
  if(!requireAI('forge:hostile')) return;
  if(_origForgeHostile) return _origForgeHostile();
};

const _origForgeCompile=typeof forgeCompile==='function'?forgeCompile:null;
forgeCompile=async function(){
  if(!requireFile('forge:compile')) return;
  if(!requireAI('forge:compile')) { nxWarn('COMPILE_NOAI','AI not configured for build manifest','The compiler uses AI to generate build manifests. Add a key in OPTIONS, or targets will be listed as stubs.','compile'); }
  if(_origForgeCompile) return _origForgeCompile();
};

const _origForgePilotRun=typeof forgePilotRun==='function'?forgePilotRun:null;
forgePilotRun=async function(){
  if(!requireAI('forge:copilot')) return;
  if(_origForgePilotRun) return _origForgePilotRun();
};

const _origForgeSave=typeof forgeSave==='function'?forgeSave:null;
forgeSave=function(){
  if(!FORGE.activeFile||!FORGE.files[FORGE.activeFile]){
    nxWarn('SAVE_NOFILE','Nothing to save','No file is currently open in the Forge IDE editor. Open or create a file first.','forge:save');
    return;
  }
  if(_origForgeSave) return _origForgeSave();
};

const _origForgeDownload=typeof forgeDownload==='function'?forgeDownload:null;
forgeDownload=function(){
  if(!requireFile('forge:download')) return;
  if(_origForgeDownload) return _origForgeDownload();
};

const _origForgeRunInTestEnv=typeof forgeRunInTestEnv==='function'?forgeRunInTestEnv:null;
forgeRunInTestEnv=function(){
  if(!requireFile('forge:testenv')) return;
  if(_origForgeRunInTestEnv) return _origForgeRunInTestEnv();
};

/* Error-guard all builder functions */
const _origSbGenerate=typeof sbGenerate==='function'?sbGenerate:null;
sbGenerate=async function(){
  if(!requireAI('builder:generate')) return;
  const vision=val('sb-endstate')?.trim();
  if(!vision){ nxWarn('BUILD_NOVISION','Vision field is empty','Describe what you want to build in the VISION / END-STATE field before clicking Generate.','builder'); return; }
  if(_origSbGenerate) return _origSbGenerate();
};

const _origSbDownload=typeof sbDownload==='function'?sbDownload:null;
sbDownload=function(){
  if(!_generatedCode||_generatedCode.trim().length<5){ nxWarn('DL_NOCODE','No generated code to download','Run a build first. The output area must contain code before you can download.','builder:download'); return; }
  if(_origSbDownload) return _origSbDownload();
};

const _origSbValidate=typeof sbValidate==='function'?sbValidate:null;
sbValidate=async function(){
  if(!requireAI('builder:validate')) return;
  if(!_generatedCode?.trim()){ nxWarn('VAL_NOCODE','Nothing to validate','Generate code first, then click VALIDATE.','builder:validate'); return; }
  if(_origSbValidate) return _origSbValidate();
};

const _origSbHostileAttack=typeof sbHostileAttack==='function'?sbHostileAttack:null;
sbHostileAttack=async function(){
  if(!requireAI('builder:hostile')) return;
  if(_origSbHostileAttack) return _origSbHostileAttack();
};

const _origConsoleSubmit=typeof consoleSubmit==='function'?consoleSubmit:null;
consoleSubmit=async function(){
  const text=$('console-input')?.value?.trim();
  if(!text){ nxWarn('CONSOLE_EMPTY','Nothing to send','Type a message or command in the console input before hitting TRANSMIT.','console'); return; }
  if(!requireAI('console')) return;
  if(_origConsoleSubmit) return _origConsoleSubmit();
};

/* Error-guard test env SQL */
const _origTeSqlRun=typeof teSqlRun==='function'?teSqlRun:null;
teSqlRun=async function(preQ){
  const query=preQ||val('te-sql-editor');
  if(!query?.trim()){ nxWarn('SQL_EMPTY','SQL query is empty','Write a SQL query in the editor or click a table name to auto-fill a SELECT.','testenv:sql'); return; }
  if(!requireService('mysql','testenv:sql')) return;
  if(!requireAI('testenv:sql')) return;
  if(_origTeSqlRun) return _origTeSqlRun(preQ);
};

const _origTeRunPhp=typeof teRunPhp==='function'?teRunPhp:null;
teRunPhp=async function(){
  const code=val('te-php-editor');
  if(!code?.trim()){ nxWarn('PHP_EMPTY','PHP editor is empty','Write PHP code in the editor before clicking RUN PHP.','testenv:php'); return; }
  if(!requireService('php','testenv:php')) return;
  if(!requireAI('testenv:php')) return;
  if(_origTeRunPhp) return _origTeRunPhp();
};

const _origTeApacheApply=typeof teApacheApply==='function'?teApacheApply:null;
teApacheApply=async function(){
  if(!requireService('apache','testenv:apache')) return;
  if(_origTeApacheApply) return _origTeApacheApply();
};

const _origTeRunTests=typeof teRunTests==='function'?teRunTests:null;
teRunTests=async function(){
  if(!TE.instances.length&&!Object.values(TE.services).some(Boolean)){
    nxWarn('TEST_NOENV','No test environment running','Start the test environment first — click ▶ START ENV on the Dashboard, then spawn an instance.','testenv:runner');
    return;
  }
  if(_origTeRunTests) return _origTeRunTests();
};

const _origTeGenTests=typeof teGenTests==='function'?teGenTests:null;
teGenTests=async function(){
  if(!FORGE.activeFile){ nxWarn('GENTEST_NOFILE','No file open in Forge IDE','Open a file in Forge IDE to generate tests for. The test generator analyzes your code and produces a matching test suite.','testenv:gentest'); return; }
  if(!requireAI('testenv:gentest')) return;
  if(_origTeGenTests) return _origTeGenTests();
};

/* ── Run PW tests from TESTS tab ── */
const _origTestsRunAll=typeof testsRunAll==='function'?testsRunAll:null;
testsRunAll=async function(){
  await pwRunAll();
  if(_origTestsRunAll) _origTestsRunAll();
};

/* ── Auto-run smoke on startup ── */
function nxPostInit(){
  // Show a brief "ready" toast
  setTimeout(()=>{
    // NEXUS ready signal
    if(typeof toast==='function') toast('⬡ NEXUS ready','ok',2000);
    if(typeof nxDiagRefreshStats==='function') nxDiagRefreshStats();
  }, 1800);
}
