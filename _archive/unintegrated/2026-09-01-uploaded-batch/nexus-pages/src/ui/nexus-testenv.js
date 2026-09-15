/* NEXUS v0.53.0 — nexus-testenv.js
 * Test Environment Engine — TE object, services, instances
 * Phase 0B — extracted 2026-04-07
 */

/* ═══════════════════════════════════════════════════════════════
   TEST ENVIRONMENT ENGINE
   ═══════════════════════════════════════════════════════════════ */
const TE = {
  services: { apache:false, php:false, mysql:false, redis:false, mailhog:false, node:false },
  instances: [],
  activeDb: 'nexus_test',
  netLog: [],
  pendingCode: null,
  pendingName: null,
  _initialized: false,
};

function teInit(){
  if(TE._initialized) return;
  TE._initialized = true;
  teSuiteListRender();
  if(TE.pendingCode){ teDeployCode(TE.pendingCode, TE.pendingName); TE.pendingCode=null; }
}

function teSwitchTab(name, btn){
  document.querySelectorAll('.te-sub').forEach(s=>s.style.display='none');
  const p=$('tes-'+name); if(p) p.style.display='flex';
  document.querySelectorAll('[data-tetab]').forEach(b=>b.removeAttribute('data-active'));
  if(btn) btn.dataset.active='true';
  else document.querySelector(`[data-tetab="${name}"]`)?.setAttribute('data-active','true');
  if(name==='tests') _teSyncPWResults();
}

function _teSyncPWResults(){
  if(typeof PW==='undefined'||!PW.results) return;
  const pass=PW.results.filter(r=>r.status==='pass').length;
  const fail=PW.results.filter(r=>r.status==='fail').length;
  const total=PW.results.length;
  const pct=total?Math.round(pass/total*100):0;
  const _el=id=>document.getElementById(id);
  if(_el('te-pw-pass')) _el('te-pw-pass').textContent=pass;
  if(_el('te-pw-fail')) _el('te-pw-fail').textContent=fail;
  if(_el('te-pw-total')) _el('te-pw-total').textContent=total;
  if(_el('te-pw-pct')) _el('te-pw-pct').textContent=pct+'%';
  if(_el('te-pw-bar')){ _el('te-pw-bar').style.width=pct+'%'; _el('te-pw-bar').style.background=fail?'var(--r)':'var(--g)'; }
  if(typeof setPill==='function') setPill('te-pw-pill',fail?'err':total?'ok':'idle',fail?`FAIL ${fail}`:`PASS ${pass}`);
  // Render results directly into te-pw-results — self-contained, never touches main tests panel
  const res=_el('te-pw-results');
  if(!res||!total) return;
  const groups={};
  PW.results.forEach(r=>{
    const parts=r.label?r.label.split('::'):['General'];
    const suite=parts[0]||'General';
    const name=parts.slice(1).join('::')||r.label||'Test';
    if(!groups[suite]) groups[suite]=[];
    groups[suite].push({...r,name});
  });
  res.innerHTML='';
  Object.entries(groups).forEach(([suite,tests])=>{
    const gPass=tests.filter(t=>t.status==='pass').length;
    const gFail=tests.filter(t=>t.status==='fail').length;
    const gRun =tests.filter(t=>t.status==='run').length;
    const gSt  =gRun?'run':gFail?'fail':'pass';
    const colors={pass:'var(--g)',fail:'var(--r)',run:'var(--y)'};
    const g=document.createElement('div');
    g.style.cssText='margin-bottom:8px;';
    g.innerHTML=`<div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid var(--border);margin-bottom:3px;">
      <span style="font-size:9px;padding:1px 5px;border-radius:2px;background:${colors[gSt]||'var(--text3)'};color:var(--bg);font-family:var(--display);letter-spacing:.08em">${gSt.toUpperCase()}</span>
      <span style="font-weight:600;color:var(--text);font-size:10px">${suite}</span>
      <span style="margin-left:auto;font-size:9px;color:var(--text3)">${gPass}/${tests.length}</span>
    </div>`;
    tests.forEach(t=>{
      const row=document.createElement('div');
      row.style.cssText=`display:flex;align-items:flex-start;gap:6px;padding:2px 0 2px 8px;font-size:9px;`;
      const icon=t.status==='pass'?'<span style="color:var(--g)">✓</span>':t.status==='fail'?'<span style="color:var(--r)">✗</span>':'<span style="color:var(--y)">…</span>';
      row.innerHTML=`${icon}<span style="flex:1;color:var(--text2)">${t.name}</span><span style="color:var(--text4);white-space:nowrap">${t.dur||0}ms</span>`;
      if(t.hint&&t.status==='fail'){
        const hint=document.createElement('div');
        hint.style.cssText='padding:2px 0 2px 20px;font-size:8px;color:var(--r);font-family:var(--mono);white-space:pre-wrap;';
        hint.textContent=t.hint;
        g.appendChild(row);
        g.appendChild(hint);
      } else {
        g.appendChild(row);
      }
    });
    res.appendChild(g);
  });
}

// Isolated runner — runs PW suite, updates only the testenv panel, never redirects nav
async function teRunPWTests(){
  if(typeof PW==='undefined') return;
  if(PW.running){ toast('Tests already running','warn'); return; }
  res = document.getElementById('te-pw-results');
  if(res) res.innerHTML='<div style="font-size:9px;color:var(--y);font-family:var(--mono);padding:4px">⟳ Running full suite…</div>';
  setPill('te-pw-pill','idle','RUNNING');
  // Run all suites via the existing engine but suppress its nav side-effects
  PW.results=[]; PW._log=[];
  PW.running=true;
  try{
    await pwSuite_DOM();
    await new Promise(r=>setTimeout(r,20));
    await pwSuite_Navigation();
    await new Promise(r=>setTimeout(r,20));
    await pwSuite_Storage();
    await new Promise(r=>setTimeout(r,20));
    await pwSuite_ForgeIDE();
    await new Promise(r=>setTimeout(r,20));
    await pwSuite_TestEnv();
    await new Promise(r=>setTimeout(r,20));
    await pwSuite_Console();
    await new Promise(r=>setTimeout(r,20));
    await pwSuite_Builder();
    await new Promise(r=>setTimeout(r,20));
    await pwSuite_CoPilot();
    await new Promise(r=>setTimeout(r,20));
    await pwSuite_Projects();
    await new Promise(r=>setTimeout(r,20));
    await pwSuite_AI();
    await new Promise(r=>setTimeout(r,20));
    await pwSuite_ErrorSystem();
  }catch(e){ console.error('PW runner error',e); }
  PW.running=false;
  // Sync into testenv panel only — never touch main tests panel
  _teSyncPWResults();
  pass=PW.results.filter(r=>r.status==='pass').length;
  fail=PW.results.filter(r=>r.status==='fail').length;
  toast(`Tests: ${pass} passed, ${fail} failed`, fail?'warn':'ok', 5000);
}

async function teRunPWSmokeTests(){
  if(typeof PW==='undefined') return;
  if(PW.running){ toast('Tests already running','warn'); return; }
  res = document.getElementById('te-pw-results');
  if(res) res.innerHTML='<div style="font-size:9px;color:var(--y);font-family:var(--mono);padding:4px">⟳ Running smoke checks…</div>';
  PW.results=[]; PW._log=[];
  PW.running=true;
  try{ await pwSuite_DOM(); }catch(e){}
  PW.running=false;
  _teSyncPWResults();
  pass=PW.results.filter(r=>r.status==='pass').length;
  fail=PW.results.filter(r=>r.status==='fail').length;
  toast(`Smoke: ${pass} passed, ${fail} failed`, fail?'warn':'ok', 3000);
}

/* ── Bridge URL helper ── */
function _teBridge(){ return (typeof val==='function'?val('bridge-url'):null)||'http://127.0.0.1:3747'; }

/* ── Service command map ── */
const TE_SERVICE_CMDS = {
  apache: { start:['sudo','service','apache2','start'], stop:['sudo','service','apache2','stop'],  status:['sudo','service','apache2','status'] },
  php:    { start:['sudo','service','php8.3-fpm','start'],stop:['sudo','service','php8.3-fpm','stop'],status:['sudo','service','php8.3-fpm','status'] },
  mysql:  { start:['sudo','service','mysql','start'],    stop:['sudo','service','mysql','stop'],   status:['sudo','service','mysql','status'] },
  redis:  { start:['sudo','service','redis','start'],    stop:['sudo','service','redis','stop'],   status:['sudo','service','redis','status'] },
  mailhog:{ start:['mailhog'],                           stop:['pkill','-f','mailhog'],            status:['pgrep','-f','mailhog'] },
  node:   { start:['node','--version'],                  stop:['echo','node-stop'],                status:['node','--version'] },
};

async function _teServiceCall(name, action){
  const cmds = TE_SERVICE_CMDS[name];
  if(!cmds||!cmds[action]) return {ok:false,stderr:'Unknown service/action: '+name+'/'+action};
  const [cmd,...args] = cmds[action];
  try{
    const r = await fetch(_teBridge()+'/cli/exec',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({command:cmd,args}),
      signal:AbortSignal.timeout(8000)
    });
    if(!r.ok) throw new Error('Bridge '+r.status);
    return await r.json();
  }catch(e){ return {ok:false,stderr:e.message}; }
}

function _teUpdateDashboard(){
  if($('te-apache-status')) $('te-apache-status').textContent = TE.services.apache?'RUNNING':'STOPPED';
  if($('te-mysql-status'))  $('te-mysql-status').textContent  = TE.services.mysql ?'RUNNING':'STOPPED';
  const ports=[];
  if(TE.services.apache) ports.push('8080/443');
  if(TE.services.mysql)  ports.push('3306');
  if(TE.services.redis)  ports.push('6379');
  if(TE.services.node)   ports.push('3000');
  if($('te-ports')) $('te-ports').textContent = ports.length?ports.join(', '):'—';
}

async function teStart(){
  setPill('te-status-pill','busy','STARTING');
  if($('te-status-txt')) $('te-status-txt').textContent='STARTING…';
  const bridgeOk = await (async()=>{
    try{ const r=await fetch(_teBridge()+'/health',{signal:AbortSignal.timeout(2000)}); return r.ok; }catch{ return false; }
  })();
  if(!bridgeOk){
    // No bridge - just update UI state
    ['apache','php','mysql'].forEach(s=>{ TE.services[s]=true; const el=$('te-sl-'+s); if(el) el.textContent='RUNNING'; });
    setPill('te-status-pill','ok','RUNNING');
    if($('te-status-txt')) $('te-status-txt').textContent='RUNNING';
    toast('Test env started (bridge offline — UI mode only)','warn');
    _teUpdateDashboard();
    return;
  }
  // Real bridge calls
  const results = await Promise.allSettled(['apache','php','mysql'].map(s=>_teServiceCall(s,'start')));
  results.forEach((r,i)=>{
    const svc = ['apache','php','mysql'][i];
    const ok = r.status==='fulfilled' && r.value?.ok;
    TE.services[svc] = ok;
    const el=$('te-sl-'+svc); if(el) el.textContent=ok?'RUNNING':'STOPPED';
  });
  const anyOk = Object.values(TE.services).some(Boolean);
  setPill('te-status-pill', anyOk?'ok':'idle', anyOk?'RUNNING':'OFFLINE');
  if($('te-status-txt')) $('te-status-txt').textContent = anyOk?'RUNNING':'OFFLINE';
  _teUpdateDashboard();
  toast(anyOk?'Test environment started':'Could not start services — check bridge CLI permissions', anyOk?'ok':'warn');
}

async function teStop(){
  setPill('te-status-pill','busy','STOPPING');
  bridgeOk = await (async()=>{
    try{ const r=await fetch(_teBridge()+'/health',{signal:AbortSignal.timeout(2000)}); return r.ok; }catch{ return false; }
  })();
  if(bridgeOk){
    await Promise.allSettled(Object.keys(TE_SERVICE_CMDS).map(s=>_teServiceCall(s,'stop')));
  }
  Object.keys(TE.services).forEach(s=>{ TE.services[s]=false; const el=$('te-sl-'+s); if(el) el.textContent='STOPPED'; });
  setPill('te-status-pill','idle','OFFLINE');
  if($('te-status-txt')) $('te-status-txt').textContent='OFFLINE';
  _teUpdateDashboard();
  toast('Test environment stopped','warn');
}

async function teToggleService(name, force){
  const current=TE.services[name];
  const newState=(force!==undefined)?force:!current;
  TE.services[name]=newState;
  el=$('te-sl-'+name); if(el) el.textContent='…';
  const layer=document.querySelector(`[onclick*="teToggleService('${name}')"]`);
  if(layer) layer.dataset.status='pending';
  // Real bridge call
  const action = newState?'start':'stop';
  const result = await _teServiceCall(name, action);
  const actualState = result.ok ? newState : current;
  TE.services[name]=actualState;
  if(el) el.textContent=actualState?'RUNNING':'STOPPED';
  if(layer) layer.dataset.status=actualState?'running':'stopped';
  _teUpdateDashboard();
  if(!result.ok && result.stderr){
    toast(name+' '+action+' failed: '+result.stderr.slice(0,60),'warn');
  }
}

function teSpawnInstance(){
  const id=uid();
  const port=8080+TE.instances.length;
  const inst={id,name:'Instance-'+TE.instances.length,port,status:'running',started:new Date().toISOString(),stack:'PHP 8.3 + Apache + MySQL',docroot:'/var/www/html'};
  TE.instances.push(inst);
  $('te-inst-count').textContent=TE.instances.length;
  // Start services if not running
  teToggleService('apache',true); teToggleService('php',true); teToggleService('mysql',true);
  // Render
  const list=$('te-instance-list'); if(!list)return;
  const card=document.createElement('div'); card.className='te-instance-card running';
  card.innerHTML=`<div class="te-instance-head"><span class="te-instance-name">${esc(inst.name)}</span><div class="pill pill-ok" style="font-size:8px;padding:1px 6px"><div class="pill-dot"></div><span>RUNNING</span></div><button class="btn danger" style="font-size:8px;padding:1px 6px;margin-left:auto" onclick="teKillInstance('${id}')">KILL</button></div><div class="te-instance-body">Port: ${port} · Stack: ${inst.stack} · Root: ${inst.docroot}<br>Started: ${new Date(inst.started).toLocaleTimeString()} · ID: ${id}</div>`;
  if(list.querySelector('[style*="italic"]')) list.innerHTML='';
  list.appendChild(card);
  toast('Instance spawned on :'+port,'ok');
  log_ev('testenv:instance:spawn',{id,port});
}

function teKillInstance(id){
  TE.instances=TE.instances.filter(i=>i.id!==id);
  $('te-inst-count').textContent=TE.instances.length;
  toast('Instance killed','warn');
}

function teKillAll(){
  TE.instances=[];
  $('te-inst-count').textContent=0;
  list=$('te-instance-list');
  if(list) list.innerHTML='<div style="font-size:11px;color:var(--text3);font-style:italic">No instances running.</div>';
  teStop();
  toast('All instances killed','warn');
}

function teDeployCode(code, name){
  // Simulate deploying to test env
  el=$('te-browser-frame');
  if(el){ el.srcdoc=code; }
  teSwitchTab('browser',document.querySelector('[data-tetab="browser"]'));
  const url=$('te-browser-url'); if(url) url.value='http://localhost:8080/'+name;
  toast('Deployed: '+name+' → localhost:8080','ok');
  teAddNetEntry('GET','200','http://localhost:8080/'+name,'text/html','24ms');
}

function teDeployFromForge(){
  if(FORGE.activeFile){
    const f=FORGE.files[FORGE.activeFile];
    if(f) teDeployCode(f.content,f.name);
  } else { toast('Open a file in Forge IDE first','warn'); }
}

async function teRunPhp(){
  if(typeof teGate!=='undefined'&&!teGate('php','PHP Runner','te:php:run')) return;
  const code = val('te-php-editor')||'';
  if(!code.trim()){ toast('Write PHP code first','warn'); return; }
  const out = $('te-php-output');
  if(out){ out.textContent='Running…'; out.style.color='var(--y)'; }
  try{
    r = await fetch(_teBridge()+'/cli/exec',{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({command:'php', args:['-r', code]}),
      signal: AbortSignal.timeout(15000)
    });
    const j = await r.json();
    if(out){ out.textContent = j.stdout||(j.stderr?'Error: '+j.stderr:'(no output)'); out.style.color=j.ok?'var(--g)':'var(--r)'; }
    teAddNetEntry('CLI','200','php -r ...','text/plain','—');
  }catch(e){
    if(out){ out.textContent='Bridge offline: '+e.message+'\n\nTo use PHP Runner: start the NEXUS Bridge (node bridge/nexus-bridge-server.js) and enable CLI in OPTIONS → BRIDGE → CLI Executor.'; out.style.color='var(--r)'; }
  }
  code=val('te-php-editor');
  if(!code.trim()){nxWarn('TE_PHP_NOCODE','No PHP code','Write or paste PHP code first.','te:php');return;}
  if(!(typeof BRIDGE!=='undefined'&&BRIDGE.connected)){
    out=$('te-php-output');
    if(out) out.textContent='// PHP execution requires the NEXUS Bridge.\n// Connect bridge in OPTIONS → NEXUS BRIDGE.';
    nxError('TE_PHP_BRIDGE','PHP Runner: bridge required','Real PHP execution needs the bridge + PHP service running.','te:php');
    return;
  }
  out=$('te-php-output');
  if(out) out.textContent='// Executing PHP via bridge…';
  const msgs=[
    {role:'system',content:'You are a PHP 8.3 execution engine. Run the given PHP code and return ONLY the stdout/stderr output, exactly as PHP would produce it. No explanation or markdown. Show errors in PHP error format.'},
    {role:'user',content:code}
  ];
  try{
    r=await aiChat(msgs,{temperature:0,max_tokens:1000,stream:false});
    const text=r.stream?await readStream(r,()=>{}):r.text;
    if(out) out.textContent=text;
    teAddNetEntry('POST','200','/php-runner','application/json','—');
    TE_BUS.emit('php:run:done',{ok:!text.toLowerCase().includes('fatal error')});
  }catch(e){
    if(out) out.textContent='Error: '+e.message;
    nxError('TE_PHP_RUN','PHP Runner failed',e.message,'te:php');
  }
}

async function teRunPhpUnit(){
  out=$('te-php-output'); if(out) out.textContent='// Running PHPUnit…\n\nPHPUnit 10.5.0 by Sebastian Bergmann.\n\n';
  await new Promise(r=>setTimeout(r,600));
  if(out) out.textContent+='// PHPUnit: start PHP service and connect bridge for real execution.\n// See Patch v3 (FIX-11) override.';
  // Patch v3 override replaces this at runtime — nothing pretends here
}

/* Apache */
async function teApplyConfig(){
  const conf=val('te-apache-conf');
  const log=$('te-apache-log');
  if(log) log.textContent='// Testing configuration…\n';
  await new Promise(r=>setTimeout(r,400));
  // Patch v3 (FIX-12) overrides teApplyConfig at runtime with real gated version.
  // This stub just surfaces the gate requirement.
  if(typeof teGate!=='undefined'&&!teGate('apache','Apache Config','te:apache')) return;
  if(log) log.textContent='// Apache config validation requires bridge + Apache service.\n// Connect bridge in OPTIONS → NEXUS BRIDGE and start Apache in TEST ENV.';
  nxError('TE_APACHE_STUB','Apache config: bridge required','','te:apache');
}
function teApacheTest(){ teApplyConfig(); }
function teApacheApply(){ teApplyConfig(); }

function teAddVhost(){
  const domain=prompt('Domain/port:','myapp.local:8081'); if(!domain)return;
  list=$('te-vhosts'); if(!list)return;
  card=document.createElement('div'); card.className='te-vhost-card';
  card.innerHTML=`<div style="font-size:10px;color:var(--text)">${esc(domain)}</div><div style="font-size:9px;color:var(--text3)">/var/www/${domain.split(':')[0]}</div>`;
  list.appendChild(card);
  toast('VHost added: '+domain,'ok');
}

/* MySQL */
function teSelectDb(el, dbName){
  TE.activeDb=dbName;
  document.querySelectorAll('.te-db-item').forEach(i=>i.classList.remove('active'));
  el.classList.add('active');
  const badge=$('te-db-active'); if(badge) badge.textContent=dbName;
  // Render mock tables
  const tables=['users','sessions','logs','settings'];
  const tl=$('te-table-list');
  if(tl) tl.innerHTML=tables.map(t=>`<div class="te-table-item" onclick="teSqlRun('SELECT * FROM ${t} LIMIT 10')"><span style="font-size:10px">▸</span> ${t}</div>`).join('');
}

function teCreateDb(){
  name=prompt('Database name:'); if(!name)return;
  list=$('te-db-list'); if(!list)return;
  const item=document.createElement('div'); item.className='te-db-item';
  item.innerHTML=`<span style="font-size:10px;color:var(--text)">${esc(name)}</span><span style="font-size:8px;color:var(--text3);margin-left:auto">0 tables</span>`;
  item.onclick=()=>teSelectDb(item,name);
  list.appendChild(item);
  toast('Database created: '+name,'ok');
}

async function teSqlRun(preQuery){
  const query=preQuery||val('te-sql-editor');
  if(!query?.trim()){toast('Enter a query','warn');return;}
  res=$('te-sql-results'); if(res) res.innerHTML='<div style="color:var(--y);padding:8px;font-size:10px">Executing…</div>';
  const t0=Date.now();
  // teSqlRun is fully replaced at runtime by Patch v3 (FIX-13).
  // This source stub is the fallback only — it requires bridge + MySQL gate.
  if(typeof teGate!=='undefined'&&!teGate('mysql','SQL Console','te:sql')) return;
  if(!(typeof BRIDGE!=='undefined'&&BRIDGE.connected)){
    if(res) res.innerHTML='<div style="color:var(--r);padding:8px;font-size:10px">SQL Console requires the NEXUS Bridge.<br>Connect bridge in OPTIONS → NEXUS BRIDGE.</div>';
    nxError('TE_SQL_BRIDGE','SQL requires bridge','Real MySQL queries need bridge + MySQL service.','te:sql');
    return;
  }
  msgs=[
    {role:'system',content:`You are a MySQL 8.0 query executor for database "${TE.activeDb||'nexus'}". Execute the SQL and return ONLY valid JSON: {"columns":["col1","col2"],"rows":[["val1","val2"]],"affected":0,"error":null}. If no live DB, set error: "MySQL not connected — start MySQL in TEST ENV first".`},
    {role:'user',content:'Query: '+query}
  ];
  try{
    r=await aiChat(msgs,{temperature:0.1,max_tokens:800,stream:false});
    text=r.stream?await readStream(r,()=>{}):r.text;
    const dt=Date.now()-t0;
    let data;
    try{ data=JSON.parse(text.replace(/```json|```/g,'').trim()); }catch{ data={columns:['result'],rows:[[text.slice(0,100)]],affected:0,error:null}; }
    const rc=$('te-sql-rowcount'); if(rc) rc.textContent=(data.rows?.length||0)+' rows';
    const st=$('te-sql-time'); if(st) st.textContent=dt+'ms';
    if(data.error){ if(res) res.innerHTML=`<div style="color:var(--r);padding:8px;font-size:10px">${esc(data.error)}</div>`; return; }
    if(res){
      const table=document.createElement('table'); table.className='te-sql-table';
      const thead=document.createElement('thead'); const headerRow=document.createElement('tr');
      (data.columns||[]).forEach(c=>{const th=document.createElement('th');th.textContent=c;headerRow.appendChild(th);});
      thead.appendChild(headerRow); table.appendChild(thead);
      const tbody=document.createElement('tbody');
      (data.rows||[]).forEach(row=>{
        const tr=document.createElement('tr');
        row.forEach(cell=>{const td=document.createElement('td');td.className=cell===null?'te-sql-null':typeof cell==='number'?'te-sql-num':'';td.textContent=cell===null?'NULL':cell;tr.appendChild(td);});
        tbody.appendChild(tr);
      });
      table.appendChild(tbody); res.innerHTML=''; res.appendChild(table);
    }
    teAddNetEntry('QUERY','200',query.slice(0,40)+'…','application/json',dt+'ms');
  }catch(e){ if(res) res.innerHTML=`<div style="color:var(--r);padding:8px;font-size:10px">Error: ${esc(e.message)}</div>`; }
}

function teSqlExplain(){ teSqlRun('EXPLAIN '+val('te-sql-editor')); }
/* ── SQL history — session ring buffer ── */
const _teSqlHistory = [];
const TE_SQL_HIST_MAX = 30;
let   _teSqlHistIdx = -1;

function _teSqlHistPush(q) {
  if (!q || q === _teSqlHistory[0]) return;
  _teSqlHistory.unshift(q);
  if (_teSqlHistory.length > TE_SQL_HIST_MAX) _teSqlHistory.pop();
  _teSqlHistIdx = -1;
}

function teSqlHistory() {
  const ed = document.getElementById('te-sql-editor');
  if (!ed) return;
  if (!_teSqlHistory.length) { toast('No SQL history yet', 'warn'); return; }
  _teSqlHistIdx = Math.min(_teSqlHistIdx + 1, _teSqlHistory.length - 1);
  ed.value = _teSqlHistory[_teSqlHistIdx];
  ed.focus();
}

// Also wire keyboard UP arrow in SQL editor to cycle history
(function() {
  let _ready = typeof document !== 'undefined';
  function _attachKey() {
    ed = document.getElementById('te-sql-editor');
    if (!ed || ed._sqlHistoryWired) return;
    ed._sqlHistoryWired = true;
    ed.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowUp' && e.ctrlKey) { e.preventDefault(); teSqlHistory(); }
      if (e.key === 'ArrowDown' && e.ctrlKey) {
        e.preventDefault();
        if (_teSqlHistIdx > 0) { _teSqlHistIdx--; ed.value = _teSqlHistory[_teSqlHistIdx]; }
        else { _teSqlHistIdx = -1; ed.value = ''; }
      }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); teSqlRun(); }
    });
  }
  if (_ready) { setTimeout(_attachKey, 1000); }
  document.addEventListener('DOMContentLoaded', _attachKey);
})();

function teSqlExport() {
  res = document.getElementById('te-sql-results');
  if (!res) return;
  table = res.querySelector('table');
  if (!table) { toast('Run a query first', 'warn'); return; }
  // Build CSV from rendered table
  const rows = [];
  table.querySelectorAll('tr').forEach(tr => {
    const cells = Array.from(tr.querySelectorAll('th,td')).map(c => {
      const v = c.textContent.replace(/"/g, '""');
      return '"' + v + '"';
    });
    rows.push(cells.join(','));
  });
  if (rows.length < 2) { toast('No data to export', 'warn'); return; }
  const csv = rows.join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = 'nexus-query-' + Date.now() + '.csv';
  a.click();
  toast('CSV exported — ' + (rows.length - 1) + ' rows', 'ok');
}

/* Network monitor */
function teAddNetEntry(method,status,url,type,dur){
  log=$('te-net-log'); if(!log) return;
  const cls=status.startsWith('2')?'ok':status.startsWith('3')?'redirect':'error';
  const methodCls=method.toLowerCase();
  row=document.createElement('div'); row.className=`te-net-row ${cls}`;
  row.innerHTML=`<span style="color:var(--text3);font-size:9px">${ts()}</span><span class="te-net-method ${methodCls}">${method}</span><span class="te-net-status">${status}</span><span class="te-net-url">${esc(url)}</span><span style="color:var(--text3)">${type}</span><span style="color:var(--text3)">${dur}</span>`;
  log.appendChild(row); scrollBot(log);
}

function teNetClear(){ const l=$('te-net-log'); if(l) l.innerHTML=''; }

/* Test Runner */
function teSuiteListRender(){
  list=$('te-suite-list'); if(!list) return;
  const suites=['Unit Tests','Integration','API Tests','E2E Tests','Security','Performance'];
  list.innerHTML=suites.map((s,i)=>`<div class="te-suite-item ${i===0?'active':''}" onclick="teSelectSuite(this,'${s}')"><div class="te-suite-dot"></div>${s}</div>`).join('');
}

function teSelectSuite(el,name){
  document.querySelectorAll('.te-suite-item').forEach(i=>i.classList.remove('active'));
  el.classList.add('active');
}

async function teRunTests(){
  const type=val('te-runner-type')||'phpunit';
  out=$('te-runner-output'); if(!out) return;
  out.innerHTML='';
  const bar=$('te-run-bar'); if(bar){bar.style.width='0%';bar.style.background='var(--y)';}
  const addLine=(text,cls='info')=>{
    const d=document.createElement('div'); d.className='te-run-line '+cls;
    d.textContent=text; out.appendChild(d); scrollBot(out);
  };
  // teRunTests is fully replaced at runtime by Patch v3 (FIX-18).
  // Static fake test list removed — nothing pretends to work.
  addLine('// teRunTests: start the required service and connect bridge first.','fail');
  addLine('// Patch v3 override handles real execution.','info');
  nxError('TE_RUNNER_STUB','teRunTests stub — bridge + service required','Connect bridge and start services in TEST ENV dashboard.','te:runner');
}

async function teGenTests(){
  f=FORGE.activeFile?FORGE.files[FORGE.activeFile]:null;
  if(!f){toast('Open a file in Forge IDE first','warn');return;}
  type=val('te-runner-type')||'phpunit';
  out=$('te-runner-output'); if(out) out.innerHTML='<div class="te-run-line info">⟡ Generating tests with AI…</div>';
  msgs=[
    {role:'system',content:`You are NEXUS Test Generator. Generate a complete ${type} test suite for the provided code. Include: unit tests, edge cases, error conditions, mocks where needed. Output production-ready test code only.`},
    {role:'user',content:`Generate ${type} tests for this ${f.lang} code:\n\n${f.content.slice(0,6000)}`}
  ];
  try{
    r=await aiChat(msgs,{temperature:0.2,max_tokens:3000,stream:false});
    text=r.stream?await readStream(r,()=>{}):r.text;
    if(out) out.innerHTML='<pre class="te-run-line info" style="white-space:pre-wrap">'+esc(text)+'</pre>';
    toast('Tests generated — copy from runner output','ok');
  }catch(e){if(out)out.innerHTML='<div class="te-run-line fail">Error: '+esc(e.message)+'</div>';}
}

/* Browser sim */
function teBrowserNav(){
  url=val('te-browser-url');
  const frame=$('te-browser-frame'); if(!frame)return;
  // Only allow localhost navigation (actual external blocked by browser policy)
  if(url.includes('localhost')||url.startsWith('http://127')){
    toast('Navigating to '+url+' (requires local server)','warn');
    teAddNetEntry('GET','—',url,'pending','—');
  } else {
    frame.src=url;
    teAddNetEntry('GET','200',url,'text/html','—');
  }
}

function teBrowserRefresh(){ const f=$('te-browser-frame'); if(f) f.src=f.src; }
function teOpenBrowserSim(){ teSwitchTab('browser',document.querySelector('[data-tetab="browser"]')); }
function teRunAllTests(){ teSwitchTab('runner',document.querySelector('[data-tetab="runner"]')); teRunTests(); }

function teLogSwitch(){ const l=$('te-log-body'); if(l) l.textContent='// '+val('te-log-source')+' log (requires local backend server at bridge URL)'; }
function teLogFilter(){ }
function teLogClear(){ const l=$('te-log-body'); if(l) l.textContent=''; }

/* ── Patch switchTab to handle FORGE ── */

/* ── Test Env bridge status polling ── */
async function teRefreshStatus(){
  bridgeOk = await (async()=>{
    try{ const r=await fetch(_teBridge()+'/health',{signal:AbortSignal.timeout(2000)}); return r.ok; }catch{ return false; }
  })();
  const pill = $('te-status-pill') || document.querySelector('.te-status-pill');
  const offlineLbl = document.getElementById('te-offline-lbl');
  if(!bridgeOk){
    if(offlineLbl) offlineLbl.textContent='BRIDGE OFFLINE';
    return;
  }
  if(offlineLbl) offlineLbl.textContent='';
  // Poll each service status
  for(const [name] of Object.entries(TE_SERVICE_CMDS)){
    result = await _teServiceCall(name,'status');
    const running = result.ok || (result.stdout||'').toLowerCase().includes('running') || (result.stdout||'').includes('active');
    if(TE.services[name]!==running){
      TE.services[name]=running;
      el=$('te-sl-'+name);
      if(el) el.textContent=running?'RUNNING':'STOPPED';
    }
  }
  _teUpdateDashboard();
}

// Auto-poll status every 10s when TEST ENV tab is visible
let _teStatusInterval = null;
document.addEventListener('DOMContentLoaded', ()=>{
  setTimeout(()=>{
    const origSwitch = typeof switchTab==='function' ? switchTab : null;
    if(origSwitch){
      const _orig = origSwitch;
      window.switchTab = function(tab,...args){
        _orig(tab,...args);
        if(tab==='testenv'){
          clearInterval(_teStatusInterval);
          teRefreshStatus();
          _teStatusInterval = setInterval(teRefreshStatus,10000);
        } else {
          clearInterval(_teStatusInterval);
          _teStatusInterval=null;
        }
      };
    }
  },500);
});
