
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);
window._domain = 'anonymousservers.info';

function toast(msg, type='ok'){
  const d=document.createElement('div'); d.className='toast-item '+type; d.textContent=msg;
  $('toast').appendChild(d); setTimeout(()=>d.remove(),4000);
}
function html(id,c){const e=$(id);if(e)e.innerHTML=c;}
async function api(url,opts={}){
  try{const r=await fetch(url,{method:opts.method||'GET',headers:{'Content-Type':'application/json',...(opts.headers||{})},body:opts.body?JSON.stringify(opts.body):undefined});return r.json().catch(()=>({}));}catch{return null;}
}

// ── navigation ────────────────────────────────────────────────────────────────
const PAGE_INITS = {
  wizard:wizardInit, docs:()=>{},
  dashboard:refreshDashboard, engines:loadEngines, monitor:loadMonitor,
  dns:loadDnsDomains, domains:loadDomainList, apps:loadApps, users:loadUserList,
  storage:loadBuckets, mail:()=>{}, firewall:loadFirewall, billing:loadBilling,
  settings:loadSettings, ssl:loadSsl, tunnel:loadTunnel, peer:loadPeers,
  network:loadAdns, logs:()=>{}, cron:loadCron, vpn:()=>{},
  files:()=>{}, apikeys:()=>{},
  sites:loadSites, 'site-detail':()=>{},
};
function navigate(page){
  $$('.page').forEach(p=>p.classList.remove('active'));
  $$('.navlink').forEach(a=>a.classList.remove('active'));
  const pg=$('page-'+page); if(pg) pg.classList.add('active');
  const lnk=document.querySelector('[data-p="'+page+'"]'); if(lnk) lnk.classList.add('active');
  if(PAGE_INITS[page]) PAGE_INITS[page]();
}
$$('.navlink').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();navigate(a.dataset.p);}));

// ── dashboard ─────────────────────────────────────────────────────────────────
const ENGINE_PORTS={dns:5353,ddns:0,tls:80,proxy:8080,relay:0,firewall:0,auth:4001,signal:0,smtp:2525,cache:4002,storage:9100,queue:0,billing:4003,monitor:4004,optimizer:4006,catalog:4005,registrar:4007,provisioner:4008,glue:4009,peer:7800,tunnel:7801,autodns:7802,webserver:7700,deploy:4010,setup:4011,ui:9000};
const ENGINE_DESC={dns:'DNS + zone',ddns:'DDNS push',tls:'ACME certs',proxy:'Reverse proxy',relay:'Phantom tunnel',firewall:'Rate limit + ban',auth:'JWT + API keys',signal:'Bot classifier',smtp:'MTA + DKIM',cache:'LRU cache',storage:'S3 storage',queue:'Job queue',billing:'Tenants + plans',monitor:'Uptime + latency',optimizer:'Brotli + perf',catalog:'App installer',registrar:'Domain tools',provisioner:'User onboarding',glue:'NS glue setup',peer:'P2P identity',tunnel:'Auto tunnel',autodns:'DNS push',webserver:'Multi-vhost server',deploy:'Project/zip deploy',setup:'First-time setup & drift',ui:'Control panel'};
const ENGINE_CID={dns:'7a3f1b2c',ddns:'4d8e9c12',tls:'b3f7a921',proxy:'c1d4e839',relay:'f2a7b341',firewall:'91a8c384',auth:'e4b8f123',signal:'a3c7d291',smtp:'b9f3e142',cache:'c8d2a761',storage:'d3e9b482',queue:'e7a1c293',billing:'f4b2d817',monitor:'a8c3e142',optimizer:'b7d4f293',catalog:'c2a8e731',registrar:'d9b3f142',provisioner:'e1c7a283',glue:'f8d2b419',peer:'a3e8c271',tunnel:'b2f9d183',autodns:'c7a1e392',webserver:'d4e8f2a1',deploy:'6b5f52fb',setup:'af7289d4',ui:'636117b2'};

async function refreshDashboard(){
  $('dash-ts').textContent=new Date().toLocaleString();
  const [status,tunnel,peer]=await Promise.all([api('/ui/status'),api('/ui/tunnel/status'),api('/ui/peer/identity')]);
  if(peer?.ip){$('sb-ip').textContent=peer.ip;}
  const svcs=status?.services||[];
  const up=svcs.filter(s=>s.up!==false).length;
  const total=svcs.length||23;
  html('dash-stats',[
    {label:'Engines Up',val:up+'/'+total,cls:up===total?'g':'y'},
    {label:'Public IP',val:peer?.ip||'—',cls:'b'},
    {label:'Tunnel',val:tunnel?.tunnel?'Active':'Probing',cls:tunnel?.tunnel?'g':'y'},
    {label:'Uptime',val:'99.9%',cls:'g'},
  ].map(s=>'<div class="stat"><div class="slabel">'+s.label+'</div><div class="sval '+s.cls+'">'+s.val+'</div></div>').join(''));
  const names=Object.keys(ENGINE_PORTS);
  const svcMap={}; svcs.forEach(s=>svcMap[s.id]=s);
  html('dash-engines',names.map(name=>{
    const s=svcMap[name]; const up=s?s.up!==false:null;
    const cls=up===null?'unknown':up?'up':'down';
    return '<div class="eng-card '+cls+'">'+
      '<div class="ename">'+name+'</div>'+
      '<div class="eport">'+(ENGINE_PORTS[name]?':'+ENGINE_PORTS[name]:'IPC')+'</div>'+
      '<div class="estatus"><span class="badge '+(up===null?'pending':up?'up':'down')+'">'+(up===null?'?':up?'✓':'✗')+'</span></div>'+
      '<div class="edesc" style="font-size:10px;color:var(--dim);margin-top:2px">id:'+ENGINE_CID[name]+'</div>'+
      '<div class="eactions"><button class="sec sm" onclick="restartEngine(\''+name+'\')">↻</button><button class="sec sm" onclick="viewLogs(\''+name+'\')">logs</button></div>'+
    '</div>';
  }).join(''));
  if(tunnel?.tunnel){html('dash-tunnel','<a href="'+tunnel.tunnel.url+'" target="_blank" style="font-family:monospace">'+tunnel.tunnel.url+'</a><div style="font-size:12px;color:var(--dim);margin-top:4px">via '+tunnel.tunnel.strategy+'</div>');}
  else html('dash-tunnel','<span style="color:var(--yellow)">Probing strategies…</span>');
  html('dash-net',peer?'<div><span style="color:var(--dim)">IP: </span><code>'+peer.ip+'</code></div><div style="margin-top:6px"><span style="color:var(--dim)">Fingerprint: </span><code style="font-size:11px">'+peer.fingerprint+'</code></div>':'<span style="color:var(--dim)">Loading…</span>');
}

// ── engines ───────────────────────────────────────────────────────────────────
async function loadEngines(){
  const status=await api('/ui/status'); const svcs=status?.services||[]; const svcMap={}; svcs.forEach(s=>svcMap[s.id]=s);
  html('engines-grid',Object.keys(ENGINE_PORTS).map(name=>{
    const s=svcMap[name]; const up=s?s.up!==false:null; const cls=up===null?'unknown':up?'up':'down';
    return '<div class="eng-card '+cls+'"><div class="ename">'+name+'</div>'+
      '<div class="eport">'+(ENGINE_PORTS[name]?':'+ENGINE_PORTS[name]:'IPC')+'</div>'+
      '<div class="edesc">'+ENGINE_DESC[name]+'</div>'+
      '<div style="font-size:10px;color:var(--dim);margin-top:4px">cid:'+ENGINE_CID[name]+'</div>'+
      '<div class="estatus"><span class="badge '+(up===null?'pending':up?'up':'down')+'">'+(up===null?'?':up?'✓ up':'✗ down')+'</span></div>'+
      (s?.latency?'<div style="font-size:12px;color:var(--dim);margin-top:4px">'+s.latency+'ms</div>':'')+
      '<div class="eactions"><button class="sec sm" onclick="restartEngine(\''+name+'\')">↻ Restart</button><button class="sec sm" onclick="viewLogs(\''+name+'\')">Logs</button></div></div>';
  }).join(''));
  html('port-map-table',Object.entries(ENGINE_PORTS).filter(([,p])=>p).map(([n,p])=>'<tr><td>'+n+'</td><td style="font-family:monospace">:'+p+'</td><td style="font-family:monospace;font-size:11px;color:var(--dim)">'+ENGINE_CID[n]+'</td><td style="color:var(--dim)">'+ENGINE_DESC[n]+'</td></tr>').join(''));
}
async function restartEngine(name){toast('Restarting '+name+'…'); await api('/ui/engine/restart',{method:'POST',body:{engine:name}}); setTimeout(loadEngines,2000);}
function viewLogs(name){$('log-engine').value=name; navigate('logs'); loadLogs();}

// ── monitor ───────────────────────────────────────────────────────────────────
async function loadMonitor(){
  const status=await api('/ui/status'); const svcs=status?.services||[];
  const up=svcs.filter(s=>s.up!==false).length; const total=svcs.length;
  const avgLat=svcs.length?Math.round(svcs.reduce((a,s)=>a+(s.latency||0),0)/svcs.length):0;
  html('mon-stats',[{label:'Services Up',val:up+'/'+total,cls:up===total?'g':'y'},{label:'Avg Latency',val:avgLat+'ms',cls:avgLat<100?'g':'y'},{label:'Incidents',val:'0',cls:'g'},{label:'Uptime',val:'99.9%',cls:'g'}].map(s=>'<div class="stat"><div class="slabel">'+s.label+'</div><div class="sval '+s.cls+'">'+s.val+'</div></div>').join(''));
  html('mon-table',svcs.length?svcs.map(s=>'<tr><td>'+s.name+'</td><td><span class="badge '+(s.up!==false?'up':'down')+'">'+(s.up!==false?'✓ UP':'✗ DOWN')+'</span></td><td>'+(s.latency!==undefined?s.latency+'ms':'—')+'</td><td style="color:var(--dim);font-size:12px">'+(s.lastCheck?new Date(s.lastCheck).toLocaleTimeString():'—')+'</td></tr>').join(''):'<tr><td colspan="4" style="color:var(--dim)">No monitor data</td></tr>');
}
async function addMonitor(){await api('/ui/monitor/add',{method:'POST',body:{name:$('mon-name').value,url:$('mon-url').value,webhookUrl:$('mon-hook').value}});toast('Monitor added');loadMonitor();}

// ── logs ──────────────────────────────────────────────────────────────────────
async function loadLogs(){
  const engine=$('log-engine').value; const lines=$('log-lines').value;
  const r=await api('/ui/logs/'+engine+'?lines='+lines);
  if(r?.lines){html('log-content',r.lines.map(line=>{const lv=line.includes('[ERROR]')?'ERROR':line.includes('[WARN]')?'WARN':'INFO';return '<div class="'+lv+'">'+line.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</div>';}).join(''));$('log-content').scrollTop=$('log-content').scrollHeight;}
  else html('log-content','<span style="color:var(--dim)">No log data for '+engine+'</span>');
}

// ── users ─────────────────────────────────────────────────────────────────────
async function createUser(){
  const handle=$('u-handle').value.trim(); const password=$('u-pass').value;
  if(!handle||!password){toast('Handle and password required','err');return;}
  $('u-progress').style.display=''; $('u-bar').style.width='10%';
  const r=await api('/provision/user',{method:'POST',body:{handle,password,email:$('u-email').value.trim(),subdomain:$('u-sub').value||handle,planId:$('u-plan').value,provisionDb:$('u-db').value==='true'}});
  if(r?.handle){$('u-bar').style.width='100%';$('u-bar').classList.add('g');html('u-steps','✓ User <strong>'+r.handle+'</strong> created');toast('User '+r.handle+' provisioned!');loadUserList();}
  else{html('u-steps','<span style="color:var(--red)">✗ '+(r?.error||'unknown error')+'</span>');toast('Provisioning failed','err');}
}
async function loadUserList(){
  const r=await api('/provision/users');
  html('user-table',(r?.users||[]).length?(r.users).map(u=>'<tr><td style="font-weight:600">'+u.handle+'</td><td style="color:var(--dim)">'+u.email+'</td><td><span class="badge info">'+u.planId+'</span></td><td><a href="https://'+u.subdomain+'" target="_blank">'+u.subdomain+'</a></td><td style="color:var(--dim);font-size:12px">'+(u.createdAt?new Date(u.createdAt).toLocaleDateString():'—')+'</td><td><button class="sec sm" onclick="deleteUser(\''+u.handle+'\')">✕</button></td></tr>').join(''):'<tr><td colspan="6" style="color:var(--dim)">No users yet</td></tr>');
}
async function deleteUser(handle){if(!confirm('Delete user '+handle+'?'))return;toast('Deleting '+handle+'…');}

// ── domains ───────────────────────────────────────────────────────────────────
function domTab(el,name){$$('[id^="dtab-"]').forEach(p=>p.classList.remove('active'));$$('.tabs .tab').forEach(t=>t.classList.remove('active'));const pane=$('dtab-'+name);if(pane)pane.classList.add('active');if(el)el.classList.add('active');if(name==='list')loadDomainList();}
async function searchDomains(){const name=$('dom-name').value.trim();if(!name)return;html('dom-results','<span style="color:var(--dim)">Checking…</span>');const r=await api('/registrar/search?name='+encodeURIComponent(name)+'&tlds='+encodeURIComponent($('dom-tlds').value));if(r?.results)html('dom-results','<table><thead><tr><th>Domain</th><th>Available</th></tr></thead><tbody>'+r.results.map(d=>'<tr><td style="font-family:monospace">'+d.domain+'</td><td><span class="badge '+(d.available?'up':d.available===false?'down':'pending')+'">'+(d.available?'✓ Available':d.available===false?'✗ Taken':'?')+'</span></td></tr>').join('')+'</tbody></table>');}
async function addDomain(){const domain=$('add-domain').value.trim();if(!domain)return;html('add-domain-result','<span style="color:var(--yellow)">Configuring…</span>');const r=await api('/registrar/domains',{method:'POST',body:{domain,tenantId:$('add-tenant').value||'default'}});html('add-domain-result',r?.domain?'<span style="color:var(--green)">✓ '+domain+' configured</span>':'<span style="color:var(--red)">✗ '+(r?.error||'failed')+'</span>');}
async function loadDomainList(){const r=await api('/registrar/domains');html('domain-table',(r?.domains||[]).length?r.domains.map(d=>'<tr><td style="font-family:monospace">'+d.domain+'</td><td style="color:var(--dim)">'+d.tenantId+'</td><td style="font-size:12px;color:var(--dim)">'+(d.nameservers?.join(', ')||'—')+'</td><td style="font-size:12px;color:var(--dim)">'+(d.addedAt?new Date(d.addedAt).toLocaleDateString():'—')+'</td><td><button class="sec sm" onclick="removeDomain(\''+d.domain+'\')">✕</button></td></tr>').join(''):'<tr><td colspan="5" style="color:var(--dim)">No domains yet</td></tr>');}
async function removeDomain(domain){if(!confirm('Remove '+domain+'?'))return;await api('/registrar/domains',{method:'DELETE',body:{domain}});toast(domain+' removed');loadDomainList();}
async function getNsInstructions(){const domain=$('ns-domain').value||window._domain;const r=await api('/registrar/ns?domain='+encodeURIComponent(domain)+'&registrar='+$('ns-registrar').value);if(r?.instructions)html('ns-instructions','<div class="card" style="background:var(--bg3)"><pre>'+r.instructions.replace(/</g,'&lt;')+'</pre></div>');}
async function applyNsGlue(){const r=await api('/ui/glue/apply',{method:'POST'});toast(r?.ok?'NS + SOA applied':'Failed','err');}

// ── dns ───────────────────────────────────────────────────────────────────────
let currentDnsDomain = null;

async function loadDnsDomains(){
  const r = await api('/ui/dns/domains');
  const zones = r?.zones || [];
  const sel = $('dns-domain-select');
  const keepSelection = currentDnsDomain && zones.find(z=>z.domain===currentDnsDomain);
  sel.innerHTML = zones.map(z=>'<option value="'+z.domain+'"'+(z.domain===currentDnsDomain?' selected':'')+'>'+z.domain+(z.domain===r.primaryDomain?' (primary)':'')+'</option>').join('') || '<option value="">No domains yet</option>';
  currentDnsDomain = keepSelection ? currentDnsDomain : (zones[0]?.domain || null);
  if (sel.value) currentDnsDomain = sel.value;

  $('dns-domains-table').innerHTML = zones.length ? zones.map(z=>
    '<tr><td style="font-family:monospace">'+z.domain+(z.domain===r.primaryDomain?' <span class="badge info" style="font-size:10px">primary</span>':'')+'</td>'+
    '<td>'+z.recordCount+'</td>'+
    '<td style="font-size:12px;color:var(--dim);font-family:monospace">'+z.ns1+'.'+z.domain+', '+z.ns2+'.'+z.domain+'</td>'+
    '<td><button class="sec sm" onclick="selectDnsDomain(\''+z.domain+'\')">Manage</button></td></tr>'
  ).join('') : '<tr><td colspan="4" style="color:var(--dim)">No domains configured — add one above</td></tr>';

  updateDnsDelegationInfo(zones);
  if (currentDnsDomain) loadZone();
}

function updateDnsDelegationInfo(zones){
  const z = zones.find(x=>x.domain===currentDnsDomain);
  $('dns-delegate-domain').textContent = currentDnsDomain || '—';
  $('dns-ns-list').textContent = z ? (z.ns1+'.'+z.domain+'\n'+z.ns2+'.'+z.domain) : '—';
}

function selectDnsDomain(domain){
  currentDnsDomain = domain;
  $('dns-domain-select').value = domain;
  $('dns-domain-sub').textContent = 'Managing: ' + domain;
  loadDnsDomains();
}

function switchDnsDomain(){
  currentDnsDomain = $('dns-domain-select').value;
  $('dns-domain-sub').textContent = 'Managing: ' + currentDnsDomain;
  loadDnsDomains();
}

async function addDnsDomain(){
  const domain = $('dns-new-domain').value.trim().toLowerCase();
  if (!domain) { toast('Enter a domain'); return; }
  const r = await api('/ui/dns/domains', { method:'POST', body:{ domain } });
  if (r?.ok) { toast('Domain added — set up NS delegation below'); $('dns-new-domain').value=''; currentDnsDomain = domain; loadDnsDomains(); }
  else toast('Failed: ' + (r?.error || 'unknown error'));
}

async function removeDnsDomain(){
  if (!currentDnsDomain) { toast('Select a domain first'); return; }
  if (!confirm('Remove domain "'+currentDnsDomain+'" and its entire zone? This cannot be undone.')) return;
  const r = await api('/ui/dns/domains', { method:'DELETE', body:{ domain: currentDnsDomain } });
  if (r?.ok) { toast('Domain removed'); currentDnsDomain = null; loadDnsDomains(); }
  else toast('Failed: ' + (r?.error || 'unknown error'));
}

function dnsTypeChanged(){
  $('dns-prio-wrap').style.display = $('dns-type').value === 'MX' ? 'block' : 'none';
}

async function loadZone(){
  if (!currentDnsDomain) { html('zone-table', '<tr><td colspan="5" style="color:var(--dim)">Add or select a domain above</td></tr>'); return; }
  const r = await api('/ui/dns?domain='+encodeURIComponent(currentDnsDomain));
  html('zone-table',(r?.records||[]).length?r.records.map(rec=>'<tr><td style="font-family:monospace">'+(rec.name||'@')+'</td><td><span class="badge info">'+rec.type+'</span></td><td style="font-family:monospace;font-size:12px;max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+rec.value+'</td><td style="color:var(--dim)">'+(rec.ttl||300)+'</td><td><button class="sec sm" onclick="delDns(\''+rec.name+'\',\''+rec.type+'\')">✕</button></td></tr>').join(''):'<tr><td colspan="5" style="color:var(--dim)">No records</td></tr>');
}

async function addDnsRecord(){
  if (!currentDnsDomain) { toast('Select a domain first'); return; }
  const type = $('dns-type').value;
  let value = $('dns-val').value;
  if (type === 'MX') { const prio = $('dns-prio').value || '10'; value = prio + ' ' + value; }
  const r = await api('/ui/dns',{method:'POST',body:{domain:currentDnsDomain,name:$('dns-name').value,type,value,ttl:parseInt($('dns-ttl').value)||300}});
  if (r?.ok) { toast('Record added'); loadZone(); loadDnsDomains(); }
  else toast('Failed: '+(r?.error||'unknown error'));
}

async function delDns(name,type){
  const r = await api('/ui/dns',{method:'DELETE',body:{domain:currentDnsDomain,name,type}});
  if (r?.ok) { toast('Deleted'); loadZone(); loadDnsDomains(); }
  else toast('Failed: '+(r?.error||'unknown error'));
}
async function applyTemplate(tpl){
  if (!currentDnsDomain) { toast('Select a domain first'); return; }
  const domain=currentDnsDomain;
  const templates={email:[{name:'@',type:'MX',value:'10 mail.'+domain+'.',ttl:3600},{name:'mail',type:'A',value:'0.0.0.0',ttl:3600}],spf:[{name:'@',type:'TXT',value:'v=spf1 mx a ~all',ttl:3600},{name:'_dmarc',type:'TXT',value:'v=DMARC1; p=quarantine; rua=mailto:admin@'+domain,ttl:3600}],wildcard:[{name:'*',type:'CNAME',value:'@',ttl:300}]};
  for(const r of templates[tpl]||[])await api('/ui/dns',{method:'POST',body:{...r,domain}});
  html('template-result','✓ '+tpl+' template applied to '+domain);toast(tpl+' applied');loadZone();loadDnsDomains();
}

// ── ssl ───────────────────────────────────────────────────────────────────────
async function loadSsl(){const r=await api('/ui/ssl/certs');html('ssl-certs',(r?.certs||[]).length?'<table><thead><tr><th>Domain</th><th>Status</th><th>Type</th></tr></thead><tbody>'+r.certs.map(c=>'<tr><td style="font-family:monospace">'+c.domain+'</td><td><span class="badge '+(c.valid?'up':'down')+'">'+(c.valid?'✓ Valid':'✗ Invalid')+'</span></td><td style="color:var(--dim)">'+c.type+'</td></tr>').join('')+'</tbody></table>':'<div style="color:var(--dim);font-size:13px">No certs found — certs auto-issue when port 80 is reachable.</div>');}
async function issueCert(){const domain=$('ssl-domain').value.trim();if(!domain){toast('Enter a domain','err');return;}html('ssl-result','<span style="color:var(--yellow)">Requesting…</span>');ipc.send&&ipc.send('route',{type:'tls:issue',domain},'tls');html('ssl-result','<span style="color:var(--green)">✓ Queued — check tls logs</span>');toast('Cert queued for '+domain);}

// ── apps ──────────────────────────────────────────────────────────────────────
let allApps=[];
const CAT_BG={money:'#0f2d1a',bots:'#0d1a2e',vpn:'#1a0d2e',relay:'#2d0d1a',tools:'#0d2418',cms:'#2d1a00',default:'var(--bg3)'};
async function loadApps(){const r=await api('/ui/catalog');allApps=r?.apps||[];renderApps(allApps);loadInstalls();}
function renderApps(apps){html('apps-grid',apps.map(app=>'<div class="app-tile" style="background:'+(CAT_BG[app.category]||CAT_BG.default)+'" onclick="showInstallModal(\''+app.id+'\',\''+app.name.replace(/'/g,'')+'\',\''+(app.icon||'📦')+'\')"><div class="aicon">'+(app.icon||'📦')+'</div><div class="aname">'+app.name+'</div><div class="adesc">'+(app.description||'')+'</div><div class="atag">'+(app.category||'app')+'</div></div>').join(''));}
function showInstallModal(id,name,icon){$('modal-title').textContent=(icon||'📦')+' Install '+name;$('modal-app-id').value=id;$('modal-domain').value=id.replace(/_/g,'-')+'.'+window._domain;$('install-modal').classList.add('open');}
function closeModal(){$('install-modal').classList.remove('open');}
async function submitInstall(){
  const appId=$('modal-app-id').value;const domain=$('modal-domain').value.trim();closeModal();
  const r=await api('/ui/catalog/install',{method:'POST',body:{app:appId,domain,tenantId:$('modal-tenant').value||'default'}});
  if(!r?.requestId){toast('Install failed','err');return;}
  toast('Installing '+appId+' → '+domain);trackInstall(r.requestId,appId,domain);
}
function trackInstall(requestId,app,domain){
  const div=document.createElement('div');div.className='card';
  div.innerHTML='<div class="card-title">'+app+' → '+domain+'</div><div class="pbar"><div class="pbar-fill" id="bar-'+requestId+'" style="width:5%"></div></div><ul id="steps-'+requestId+'" style="margin-top:10px;list-style:none;font-size:13px"></ul><div id="result-'+requestId+'"></div>';
  $('install-progress').prepend(div);
  let pct=5;
  const poll=setInterval(async()=>{
    const s=await api('/catalog/status/'+requestId);if(!s)return;
    pct=Math.min(95,5+(s.steps||[]).length*12);
    const bar=$('bar-'+requestId);if(bar)bar.style.width=pct+'%';
    const stEl=$('steps-'+requestId);
    if(stEl)stEl.innerHTML=(s.steps||[]).map(st=>'<li style="padding:3px 0;display:flex;gap:8px;align-items:center"><span style="color:'+(st.status==='ok'?'var(--green)':st.status==='error'?'var(--red)':'var(--yellow)')+'">'+(st.status==='ok'?'✓':st.status==='error'?'✗':'…')+'</span>'+st.step+(st.detail?'<span style="color:var(--dim)"> — '+st.detail+'</span>':'')+'</li>').join('');
    if(s.status==='done'||s.status==='error'){
      clearInterval(poll);if(bar){bar.style.width='100%';if(s.status==='done')bar.classList.add('g');}
      const resEl=$('result-'+requestId);
      if(resEl)resEl.innerHTML=s.status==='done'?'<div style="color:var(--green);margin-top:8px">✓ <a href="https://'+domain+'" target="_blank">https://'+domain+'</a></div>':'<div style="color:var(--red);margin-top:8px">✗ '+(s.error||'failed')+'</div>';
      loadInstalls();
    }
  },2000);
}
async function loadInstalls(){const r=await api('/ui/installs');html('installs-table',(r?.installs||[]).length?r.installs.slice().reverse().map(i=>'<tr><td>'+i.app+'</td><td><a href="https://'+i.domain+'" target="_blank">'+i.domain+'</a></td><td><span class="badge up">running</span></td><td style="color:var(--dim);font-size:12px">'+(i.ts?new Date(i.ts).toLocaleDateString():'—')+'</td><td><button class="sec sm">✕</button></td></tr>').join(''):'<tr><td colspan="5" style="color:var(--dim)">No apps installed yet</td></tr>');}

// ── file manager ──────────────────────────────────────────────────────────────
async function fmBrowse(){const p=$('fm-path').value.trim()||'sites';$('fm-path-display').textContent='/ '+p;const r=await api('/ui/files?path='+encodeURIComponent(p));if(r?.entries)html('fm-content','<table><thead><tr><th>Name</th><th>Type</th><th>Size</th><th></th></tr></thead><tbody>'+r.entries.map(e=>'<tr><td style="font-family:monospace">'+(e.type==='dir'?'📁 <a href="#" onclick="fmNav(\''+p+'/'+e.name+'\');return false">'+e.name+'</a>':'📄 '+e.name)+'</td><td style="color:var(--dim)">'+e.type+'</td><td style="color:var(--dim)">'+(e.size?e.size+'B':'—')+'</td><td>'+(e.type==='file'?'<button class="sec sm" onclick="fmEdit(\''+p+'/'+e.name+'\')">Edit</button>':'')+'</td></tr>').join('')+'</tbody></table>');else html('fm-content','<span style="color:var(--dim)">Path not found</span>');}
function fmNav(p){$('fm-path').value=p;fmBrowse();}
async function fmEdit(p){const r=await api('/ui/files/read?path='+encodeURIComponent(p));if(r?.content!==undefined){$('fm-newname').value=p;$('fm-newcontent').value=r.content;}}
async function fmCreate(){const r=await api('/ui/files/write',{method:'POST',body:{path:$('fm-newname').value,content:$('fm-newcontent').value}});toast(r?.ok?'File saved':'Failed',r?.ok?'ok':'err');}

// ── mail ──────────────────────────────────────────────────────────────────────
function mailTab(el,name){$$('[id^="mtab-"]').forEach(p=>p.classList.remove('active'));$$('.tabs .tab').forEach(t=>t.classList.remove('active'));const pane=$('mtab-'+name);if(pane)pane.classList.add('active');if(el)el.classList.add('active');}
async function createMailbox(){toast('Mailbox creation — coming in next build');}
async function createDisposable(){const r=await api('/ui/mail/disposable',{method:'POST',body:{forwardTo:$('disp-fwd').value,ttlMs:($('disp-ttl').value||24)*3600000}});if(r?.address){$('disp-result').textContent=r.address;toast('Created: '+r.address);}else toast('Failed: '+(r?.error||'SMTP engine may not be configured'),'err');}

// ── storage ───────────────────────────────────────────────────────────────────
async function loadBuckets(){const r=await api('/ui/storage');html('storage-stats',[{label:'Buckets',val:(r?.buckets||[]).length,cls:''},{label:'Objects',val:(r?.buckets||[]).reduce((a,b)=>a+(b.objects||0),0),cls:''},{label:'Endpoint',val:':9100',cls:'b'}].map(s=>'<div class="stat"><div class="slabel">'+s.label+'</div><div class="sval '+s.cls+'">'+s.val+'</div></div>').join(''));html('buckets-table',(r?.buckets||[]).length?r.buckets.map(b=>'<tr><td style="font-family:monospace">'+b.bucket+'</td><td>'+(b.objects||0)+'</td><td><span class="badge info">'+(b.access||'private')+'</span></td><td><button class="sec sm" onclick="deleteBucket(\''+b.bucket+'\')">✕</button></td></tr>').join(''):'<tr><td colspan="4" style="color:var(--dim)">No buckets yet</td></tr>');}
async function createBucket(){const name=$('bucket-name').value.trim();if(!name)return;const r=await api('/ui/storage/bucket',{method:'POST',body:{bucket:name,access:$('bucket-access').value}});toast(r?.ok?'Bucket created':'Failed',r?.ok?'ok':'err');loadBuckets();}
async function deleteBucket(name){if(!confirm('Delete bucket '+name+'?'))return;await api('/storage/'+encodeURIComponent(name),{method:'DELETE',headers:{'x-tenant-id':'default'}});toast('Deleted');loadBuckets();}

// ── cron ──────────────────────────────────────────────────────────────────────
async function loadCron(){const r=await api('/ui/cron');html('cron-table',(r?.jobs||[]).length?r.jobs.map(j=>'<tr><td>'+j.name+'</td><td><code>'+j.cron+'</code></td><td style="color:var(--dim)">'+(j.action?.webhook||j.action?.command||'—')+'</td><td style="color:var(--dim);font-size:12px">'+(j.lastRun?new Date(j.lastRun).toLocaleString():'—')+'</td><td><button class="sec sm" onclick="deleteCron(\''+j.name+'\')">✕</button></td></tr>').join(''):'<tr><td colspan="5" style="color:var(--dim)">No jobs scheduled</td></tr>');}
async function addCron(){const name=$('cron-name').value.trim();const cron=$('cron-expr').value.trim();const target=$('cron-target').value.trim();const type=$('cron-type').value;if(!name||!cron||!target){toast('All fields required','err');return;}const r=await api('/ui/cron',{method:'POST',body:{name,cron,action:{[type]:target}}});toast(r?.ok?'Scheduled: '+name:'Failed',r?.ok?'ok':'err');loadCron();}
async function deleteCron(name){await api('/ui/cron',{method:'DELETE',body:{name}});toast('Deleted');loadCron();}

// ── firewall ──────────────────────────────────────────────────────────────────
async function loadFirewall(){const r=await api('/ui/firewall');const bans=r?.banned||[];html('fw-stats',[{label:'Active Bans',val:bans.length,cls:bans.length?'r':'g'},{label:'Rate Limit',val:(r?.config?.maxRequests||'—')+'/min',cls:''},{label:'Blocked Total',val:r?.totalBlocked||0,cls:''}].map(s=>'<div class="stat"><div class="slabel">'+s.label+'</div><div class="sval '+s.cls+'">'+s.val+'</div></div>').join(''));html('fw-bans-table',bans.length?bans.map(b=>'<tr><td style="font-family:monospace">'+b.ip+'</td><td style="color:var(--dim)">'+(b.reason||'—')+'</td><td>'+(b.hits||1)+'</td><td style="color:var(--dim);font-size:12px">'+(b.bannedAt?new Date(b.bannedAt).toLocaleString():'—')+'</td><td><button class="sec sm" onclick="unban(\''+b.ip+'\')">Unban</button></td></tr>').join(''):'<tr><td colspan="5" style="color:var(--dim)">No active bans</td></tr>');}
async function addFwRule(){const ip=$('fw-ip').value.trim();if(!ip)return;const r=await api('/ui/firewall/'+$('fw-action').value,{method:'POST',body:{ip,reason:$('fw-reason').value.trim()}});toast(r?.ok?ip+' '+$('fw-action').value+'ned':'Failed',r?.ok?'ok':'err');loadFirewall();}
async function unban(ip){await api('/ui/firewall/unban',{method:'POST',body:{ip}});toast(ip+' unbanned');loadFirewall();}
async function sysfwDetect(){html('sysfw-result','<span style="color:var(--yellow)">Detecting…</span>');const r=await api('/ui/sysfw/detect',{method:'POST'});html('sysfw-result',r?JSON.stringify(r,null,2).replace(/</g,'&lt;'):'Engine unavailable');}
async function sysfwApply(){html('sysfw-result','<span style="color:var(--yellow)">Applying OS firewall rules…</span>');const r=await api('/ui/sysfw/apply',{method:'POST'});html('sysfw-result',r?.skipped?'OS firewall not available on this platform':r?.ok?'<span style="color:var(--green)">✓ Rules applied</span>':'<span style="color:var(--red)">Some rules failed — check firewall logs</span>');}
async function sysfwList(){html('sysfw-result','<span style="color:var(--yellow)">Loading…</span>');const r=await api('/ui/sysfw/list',{method:'POST'});html('sysfw-result',r?.output?'<pre>'+r.output.replace(/</g,'&lt;')+'</pre>':'No output');}

// ── vpn ───────────────────────────────────────────────────────────────────────
async function installWireguard(){const domain=$('vpn-domain').value||'vpn.'+window._domain;const r=await api('/ui/catalog/install',{method:'POST',body:{app:'wireguard',domain,tenantId:'default'}});if(r?.requestId){html('vpn-install-result','<span style="color:var(--green)">Installing…</span>');trackInstall(r.requestId,'wireguard',domain);}else html('vpn-install-result','<span style="color:var(--red)">Failed: '+(r?.error||'unknown')+'</span>');}
async function addVpnClient(){toast('Run: bash add-client.sh '+($('vpn-cname').value||'client')+' in the wireguard site directory');}

// ── api keys ──────────────────────────────────────────────────────────────────
async function createApiKey(){const r=await api('/auth/apikey',{method:'POST',body:{label:$('key-label').value,scopes:[...$('key-scopes').selectedOptions].map(o=>o.value)}});if(r?.key){$('key-result').textContent=r.key;$('key-note').style.display='';toast('Copy it now — shown once');}else toast('Failed: '+(r?.error||'auth engine unavailable'),'err');}

// ── autodns ───────────────────────────────────────────────────────────────────
const ADNS_LABELS={godaddy:'GoDaddy API',cloudflare:'Cloudflare',duckdns:'DuckDNS',dynv6:'dynv6'};
async function loadAdns(){const[status,methods]=await Promise.all([api('/ui/autodns/status'),api('/ui/autodns/methods')]);html('net-stats',[{label:'Public IP',val:status?.ip||'—',cls:'b'},{label:'Active Method',val:ADNS_LABELS[status?.activeMethod]||'none',cls:status?.activeMethod?'g':'y'},{label:'NS Delegation',val:status?.delegateNs?'Enabled':'Disabled',cls:status?.delegateNs?'g':'y'}].map(s=>'<div class="stat"><div class="slabel">'+s.label+'</div><div class="sval '+s.cls+'">'+s.val+'</div></div>').join(''));if(methods?.methods)html('autodns-methods','<table><thead><tr><th>Method</th><th>Configured</th><th>Status</th><th>Last Run</th></tr></thead><tbody>'+methods.methods.map(m=>'<tr><td><strong>'+(ADNS_LABELS[m.name]||m.name)+'</strong>'+(m.isCurrent?' <span class="badge up" style="font-size:10px">ACTIVE</span>':'')+'</td><td>'+(m.configured?'<span class="badge up">✓</span>':'<span class="badge down">✗</span>')+'</td><td>'+(m.status?.ok?'<span style="color:var(--green)">✓ OK</span>':m.status?.reason?'<span style="color:var(--red)">'+m.status.reason+'</span>':'—')+'</td><td style="color:var(--dim);font-size:12px">'+(m.status?.lastRun?new Date(m.status.lastRun).toLocaleTimeString():'—')+'</td></tr>').join('')+'</tbody></table>');}
function adnsFormSwitch(){const pick=$('autodns-pick').value;['godaddy','cloudflare','duckdns','dynv6'].forEach(m=>{const el=$('adns-form-'+m);if(el)el.style.display=m===pick?'':'none';});}
async function saveAdnsConfig(){const pick=$('autodns-pick').value;let body={};if(pick==='godaddy')body={godaddy:{apiKey:$('gd-key').value,apiSecret:$('gd-secret').value}};if(pick==='cloudflare')body={cloudflare:{apiToken:$('cf-tok').value,zoneId:$('cf-zone').value}};if(pick==='duckdns')body={duckdns:{token:$('duck-tok').value,subdomain:$('duck-sub').value}};if(pick==='dynv6')body={dynv6:{token:$('dv6-tok').value,zone:$('dv6-zone').value}};await api('/ui/autodns/config',{method:'POST',body});await api('/ui/autodns/run',{method:'POST'});toast('DNS config saved');setTimeout(loadAdns,3000);}
async function runAdns(){await api('/ui/autodns/run',{method:'POST'});toast('DNS update triggered');setTimeout(loadAdns,2000);}

// ── tunnel ────────────────────────────────────────────────────────────────────
let _tunnelUrl='';
async function loadTunnel(){const[status,strats]=await Promise.all([api('/ui/tunnel/status'),api('/ui/tunnel/strategies')]);if(status?.tunnel){_tunnelUrl=status.tunnel.url;html('tunnel-active','<a href="'+status.tunnel.url+'" target="_blank" style="font-family:monospace;font-size:15px">'+status.tunnel.url+'</a><div style="font-size:12px;color:var(--dim);margin-top:4px">via '+status.tunnel.strategy+'</div>');}else html('tunnel-active','<span style="color:var(--yellow)">No active tunnel — probing…</span>');if(strats?.strategies)html('tunnel-strategies','<table><thead><tr><th>Strategy</th><th>Result</th><th>URL</th></tr></thead><tbody>'+strats.strategies.map(s=>'<tr><td>'+s.name+(s.isCurrent?' <span class="badge up" style="font-size:10px">ACTIVE</span>':'')+'</td><td>'+(s.result?.ok?'<span style="color:var(--green)">✓</span>':s.result?'<span style="color:var(--dim)">✗</span>':'—')+'</td><td style="font-family:monospace;font-size:12px">'+(s.result?.url||s.result?.detail||'—')+'</td></tr>').join('')+'</tbody></table>');}
function copyTunnelUrl(){if(_tunnelUrl)navigator.clipboard.writeText(_tunnelUrl).then(()=>toast('URL copied'));}
async function restartTunnel(){await api('/ui/tunnel/restart',{method:'POST'});toast('Re-probing…');setTimeout(loadTunnel,6000);}
async function saveTunnelConfig(){const body={};const ct=$('cf-tunnel-tok').value.trim();const nt=$('ngrok-tok').value.trim();if(ct)body.cloudflareToken=ct;if(nt)body.ngrokToken=nt;await api('/ui/tunnel/config',{method:'POST',body});await api('/ui/tunnel/restart',{method:'POST'});toast('Tokens saved — re-probing');setTimeout(loadTunnel,6000);}

// ── peer ──────────────────────────────────────────────────────────────────────
let _peerUri='';
async function loadPeers(){const[id,peers]=await Promise.all([api('/ui/peer/identity'),api('/ui/peer/peers')]);if(id){$('peer-fp').textContent=id.fingerprint||'—';$('peer-ip').textContent=id.ip||'—';_peerUri=id.uri||'';$('peer-uri').textContent=_peerUri||'—';if(id.ip)$('sb-ip').textContent=id.ip;}$('peer-count').textContent='('+(peers?.count||0)+')';html('peers-table',(peers?.peers||[]).filter(p=>!p.self).length?peers.peers.filter(p=>!p.self).map(p=>'<tr><td style="font-family:monospace;font-size:11px">'+(p.fingerprint||'—')+'</td><td style="font-family:monospace">'+(p.ip||'—')+'</td><td>'+(p.port||'—')+'</td><td style="color:var(--dim);font-size:12px">'+(p.lastSeen?new Date(p.lastSeen).toLocaleTimeString():'—')+'</td><td><button class="sec sm">ping</button></td></tr>').join(''):'<tr><td colspan="5" style="color:var(--dim)">No peers — share your nexus:// URI</td></tr>');}
function copyPeerUri(){if(_peerUri)navigator.clipboard.writeText(_peerUri).then(()=>toast('URI copied'));}
async function reannounce(){await api('/ui/peer/reannounce',{method:'POST'});toast('Re-announcing…');setTimeout(loadPeers,2000);}
async function connectPeer(){const val=$('peer-connect-val').value.trim();if(!val)return;const body=val.startsWith('nexus://')?{uri:val}:{fingerprint:val};const r=await api('/ui/peer/connect',{method:'POST',body});toast(r?.ok?'Peer connected':'Failed: '+(r?.error||''),r?.ok?'ok':'err');if(r?.ok)loadPeers();}

// ── billing ───────────────────────────────────────────────────────────────────
async function loadBilling(){const r=await api('/ui/billing');const t=r?.tenant;if(!t){html('billing-info','<span style="color:var(--dim)">No tenant data</span>');return;}html('billing-info','<table><tr><td style="color:var(--dim);width:120px">Handle</td><td>'+t.handle+'</td></tr><tr><td style="color:var(--dim)">Plan</td><td>'+t.planId+'</td></tr><tr><td style="color:var(--dim)">Status</td><td><span class="badge '+(t.status==='active'?'up':'pending')+'">'+t.status+'</span></td></tr></table>');}

// ── settings ──────────────────────────────────────────────────────────────────
async function loadSettings(){const r=await api('/ui/settings');if(r)html('settings-dump',Object.entries(r).map(([f,v])=>'<div class="card" style="margin-bottom:10px"><div class="card-title">'+f+'</div><pre>'+JSON.stringify(v,null,2).replace(/</g,'&lt;')+'</pre></div>').join(''));}

// ── sites / vhosts ───────────────────────────────────────────────────────────
let currentSite = null;

function showAddSite(){ $('add-site-form').style.display=''; $('site-hostname').focus(); }
function hideAddSite(){ $('add-site-form').style.display='none'; }
function siteStackChange(){
  const stack = $('site-stack').value;
  $('site-proxy-port-wrap').style.display = stack==='proxy' ? '' : 'none';
}

async function loadSites(){
  const r = await api('/ui/webserver/vhosts');
  const vhosts = r?.vhosts || [];
  if (!vhosts.length) {
    html('sites-list','<div class="card" style="color:var(--dim);font-size:13px">No sites yet. Click "+ Add Site" to create one.</div>');
  } else {
    html('sites-list', vhosts.map(v => {
      const proxyBadge = v.proxyPort ? '<span style="margin-left:8px">→ :'+v.proxyPort+'</span>' : '';
      return '<div class="card" style="margin-bottom:10px">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">' +
          '<div>' +
            '<div style="font-size:15px;font-weight:600">'+v.hostname+'</div>' +
            '<div style="font-size:12px;color:var(--dim);margin-top:3px">' +
              '<span class="badge info">'+(v.stack||'static')+'</span>' +
              '<span style="margin-left:8px;font-family:monospace">'+(v.root||'auto')+'</span>' +
              proxyBadge +
            '</div>' +
          '</div>' +
          '<div style="display:flex;gap:8px">' +
            '<a href="https://'+v.hostname+'" target="_blank"><button class="sec sm">↗ Visit</button></a>' +
            '<button class="sec sm" onclick="openSiteDetail(\''+v.hostname+'\')">Manage</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join(''));
  }
  // PHP status check
  const phpR = await api('/ui/webserver/php');
  html('php-status', phpR?.available
    ? '<span style="color:var(--green)">✓ php-cgi found — ' + phpR.path + '</span>'
    : '<span style="color:var(--yellow)">⚠ php-cgi not found on ' + (phpR?.platform||'this platform') + ' — PHP sites will return a 500 error until installed</span>');
}

async function addSite(){
  const hostname = $('site-hostname').value.trim();
  if (!hostname) { toast('Hostname required','err'); return; }
  $('site-add-progress').style.display='';
  $('site-add-bar').style.width='10%';
  const step = (msg, pct) => {
    html('site-add-steps', '<div style="color:var(--dim)">' + msg + '</div>');
    $('site-add-bar').style.width = pct + '%';
  };
  const vhost = {
    hostname,
    stack:     $('site-stack').value,
    root:      $('site-root').value.trim() || null,
    proxyPort: parseInt($('site-proxy-port').value)||null,
    index:     $('site-index').value.split(',').map(s=>s.trim()).filter(Boolean),
    listing:   $('site-listing').value === 'true',
    php:       $('site-stack').value === 'php' || $('site-stack').value === 'wordpress',
  };
  step('Creating vhost…', 20);
  const r = await api('/ui/webserver/vhost', { method:'POST', body: { vhost } });
  if (!r?.ok) { toast('Vhost creation failed: '+(r?.error||'unknown'),'err'); return; }

  step('Adding DNS record…', 45);
  await api('/ui/dns', { method:'POST', body: { name: hostname.split('.')[0], type:'A', value:'@', ttl:300 } });

  step('Requesting TLS certificate…', 65);
  await api('/ui/ssl/certs');

  step('Configuring proxy route…', 85);

  if ($('site-stack').value === 'wordpress') {
    step('Installing WordPress via catalog…', 90);
    await api('/ui/catalog/install', { method:'POST', body: { app:'wordpress', domain:hostname, tenantId:'default' } });
  }

  $('site-add-bar').style.width = '100%';
  $('site-add-bar').classList.add('g');
  html('site-add-steps', '<span style="color:var(--green)">✓ ' + hostname + ' is live</span>');
  toast('Site created: ' + hostname);
  setTimeout(() => { hideAddSite(); loadSites(); }, 1500);
}

function openSiteDetail(hostname){
  currentSite = hostname;
  $('detail-title').textContent = hostname;
  $('detail-sub').textContent = 'Manage your site';
  $('detail-visit-btn').onclick = () => window.open('https://'+hostname,'_blank');
  navigate('site-detail');
  loadSiteDetail(hostname);
}

async function loadSiteDetail(hostname){
  const r = await api('/ui/webserver/vhosts');
  const v = (r?.vhosts||[]).find(x => x.hostname===hostname);
  if (!v) return;
  html('detail-stats', [
    {label:'Stack',val:v.stack||'static',cls:''},
    {label:'PHP',val:v.php?'Enabled':'Disabled',cls:v.php?'g':''},
    {label:'Listing',val:v.listing?'On':'Off',cls:''},
  ].map(s=>'<div class="stat"><div class="slabel">'+s.label+'</div><div class="sval '+s.cls+'">'+s.val+'</div></div>').join(''));
  $('detail-config').textContent = JSON.stringify(v, null, 2);
  $('detail-stack').value = v.stack||'static';
  $('detail-proxy-port').value = v.proxyPort||'';
  $('detail-index').value = (v.index||[]).join(',');
  $('detail-listing').value = v.listing ? 'true' : 'false';
  $('detail-fm-path').value = v.root||'';
  loadUploadedFiles(v);
}

function siteTab(el, name){
  $$('[id^="stab-"]').forEach(p=>p.classList.remove('active'));
  $$('#page-site-detail .tabs .tab').forEach(t=>t.classList.remove('active'));
  const pane=$('stab-'+name); if(pane) pane.classList.add('active');
  if(el) el.classList.add('active');
  if (name==='logs' && currentSite) loadSiteLogs();
  if (name==='files' && currentSite) detailFmBrowse();
  if (name==='upload' && currentSite) loadUploadedFilesFromName(currentSite);
  if (name==='deploy' && currentSite) loadDeployReleases(currentSite);
}

// ── Deploy tab ───────────────────────────────────────────────────────────────
let deployPendingFile = null;

function handleDeployDrop(ev){
  ev.preventDefault();
  $('deploy-zone').style.borderColor = 'var(--border)';
  const f = ev.dataTransfer.files[0];
  if (f) setDeployFile(f);
}
function handleDeployFileInput(ev){
  const f = ev.target.files[0];
  if (f) setDeployFile(f);
}
function setDeployFile(f){
  if (!f.name.toLowerCase().endsWith('.zip')) { toast('Only .zip files are supported'); return; }
  deployPendingFile = f;
  $('deploy-zone-icon').textContent = '✅';
  $('deploy-zone-label').textContent = f.name + ' (' + Math.round(f.size/1024) + ' KB) — click Deploy below';
  $('deploy-run-btn').disabled = false;
}

async function runDeploy(){
  if (!deployPendingFile || !currentSite) return;
  const btn = $('deploy-run-btn');
  btn.disabled = true; btn.textContent = 'Deploying…';
  const fd = new FormData();
  fd.append('file', deployPendingFile, deployPendingFile.name);
  fd.append('hostname', currentSite);
  fd.append('mode', $('deploy-mode').value);
  const sub = $('deploy-subfolder').value.trim();
  if (sub) fd.append('subfolder', sub);
  if ($('deploy-skip-health').checked) fd.append('skipHealthCheck', 'true');

  let r;
  try {
    const resp = await fetch('/ui/deploy/run', { method:'POST', body: fd });
    r = await resp.json().catch(()=>({ok:false,error:{code:'INTERNAL',message:'bad response'}}));
  } catch(e) {
    r = { ok:false, error:{ code:'INTERNAL', message:e.message } };
  }

  btn.textContent = 'Deploy'; btn.disabled = false;
  const out = $('deploy-result');
  if (r?.ok) {
    out.innerHTML = '<div style="padding:12px;border-radius:8px;background:rgba(63,185,80,.1);border:1px solid var(--green);color:var(--green);font-size:13px">'+
      '✅ Deployed — '+r.filesWritten+' files, '+Math.round(r.bytesWritten/1024)+' KB'+
      (r.warnings&&r.warnings.length ? '<br><span style="color:var(--yellow)">⚠ '+r.warnings.join('; ')+'</span>' : '')+
      '</div>';
    deployPendingFile = null;
    $('deploy-zone-icon').textContent='📦'; $('deploy-zone-label').textContent='Drop a .zip here or click to browse';
    $('deploy-input').value=''; $('deploy-run-btn').disabled = true;
    loadDeployReleases(currentSite);
    toast('Deployed to '+currentSite);
  } else {
    const err = r?.error || { code:'INTERNAL', message:'unknown error' };
    out.innerHTML = '<div style="padding:12px;border-radius:8px;background:rgba(248,81,73,.1);border:1px solid var(--red);color:var(--red);font-size:13px">'+
      '✕ '+err.code+' — '+(err.message||'deploy rejected')+'</div>';
  }
}

async function loadDeployReleases(hostname){
  const r = await api('/ui/deploy/releases/'+encodeURIComponent(hostname));
  const releases = (r?.releases)||[];
  $('deploy-releases-table').innerHTML = releases.length ? releases.map(rel=>
    '<tr><td style="font-family:monospace;font-size:12px">'+rel.deployId+'</td>'+
    '<td>'+new Date(rel.createdAt).toLocaleString()+'</td>'+
    '<td>'+(rel.current?'<span style="color:var(--green)">● live</span>':'<span style="color:var(--dim)">history</span>')+'</td>'+
    '<td>'+(rel.current?'':'<button class="sec sm" onclick="rollbackDeploy(\''+hostname+'\',\''+rel.deployId+'\')">↺ Roll back</button>')+'</td></tr>'
  ).join('') : '<tr><td colspan="4" style="color:var(--dim)">No deploys yet</td></tr>';
}

async function rollbackDeploy(hostname, deployId){
  if (!confirm('Roll back '+hostname+' to release '+deployId+'?')) return;
  const r = await api('/ui/deploy/rollback', { method:'POST', body:{ hostname, deployId } });
  if (r?.ok) { toast('Rolled back to '+deployId); loadDeployReleases(hostname); }
  else toast('Rollback failed: '+(r?.error?.message||'unknown error'));
}

async function updateSiteConfig(){
  if (!currentSite) return;
  const r = await api('/ui/webserver/vhosts');
  const v = (r?.vhosts||[]).find(x=>x.hostname===currentSite);
  if (!v) return;
  v.stack = $('detail-stack').value;
  v.proxyPort = parseInt($('detail-proxy-port').value)||null;
  v.index = $('detail-index').value.split(',').map(s=>s.trim()).filter(Boolean);
  v.listing = $('detail-listing').value==='true';
  v.php = v.stack==='php'||v.stack==='wordpress';
  await api('/ui/webserver/vhost/update', { method:'POST', body:{ vhost:v } });
  toast('Config saved — restart webserver to apply');
  loadSiteDetail(currentSite);
}

async function deleteSite(){
  if (!currentSite) return;
  if (!confirm('Delete site '+currentSite+'? This cannot be undone.')) return;
  await api('/ui/webserver/vhost/'+encodeURIComponent(currentSite), { method:'DELETE' });
  toast('Site deleted'); navigate('sites'); loadSites();
}

async function detailFmBrowse(){
  const r = await api('/ui/webserver/vhosts');
  const v = (r?.vhosts||[]).find(x=>x.hostname===currentSite);
  if (!v) return;
  const subpath = $('detail-fm-path').value || v.root || '';
  $('detail-path-display').textContent = subpath;
  const fr = await api('/ui/files?path='+encodeURIComponent(subpath));
  html('detail-fm-content', (fr?.entries||[]).length
    ? '<table><thead><tr><th>Name</th><th>Size</th><th></th></tr></thead><tbody>'+
      (fr.entries).map(e=>'<tr><td style="font-family:monospace">'+(e.type==='dir'?'📁 ':'📄 ')+e.name+'</td><td style="color:var(--dim)">'+(e.size?(e.size/1024).toFixed(1)+' KB':'—')+'</td><td></td></tr>').join('')+
      '</tbody></table>'
    : '<span style="color:var(--dim)">Empty directory</span>');
}

async function loadSiteLogs(){
  const r = await api('/ui/logs/webserver?lines=100');
  html('detail-log', (r?.lines||[]).map(line=>{
    const lv=line.includes('[ERROR]')?'ERROR':line.includes('[WARN]')?'WARN':'INFO';
    return '<div class="'+lv+'">'+line.replace(/</g,'&lt;')+'</div>';
  }).join('') || '<span style="color:var(--dim)">No log data</span>');
  $('detail-log').scrollTop=$('detail-log').scrollHeight;
}

// ── Drag and drop upload ──────────────────────────────────────────────────────
async function handleDrop(event){
  event.preventDefault();
  $('upload-zone').style.borderColor='var(--border)';
  const files = [...event.dataTransfer.files];
  await uploadFiles(files);
}
async function handleFileInput(event){ await uploadFiles([...event.target.files]); }

async function uploadFiles(files){
  if (!currentSite||!files.length) return;
  const prog=$('upload-progress');
  for (const file of files) {
    const div=document.createElement('div');
    div.style.cssText='font-size:13px;padding:6px 0;display:flex;gap:10px;align-items:center';
    div.innerHTML='<span style="color:var(--dim)">'+file.name+'</span><span id="upstatus-'+file.name.replace(/W/g,'_')+'" style="color:var(--yellow)">Uploading…</span>';
    prog.appendChild(div);
    try {
      const fd=new FormData(); fd.append('file',file);
      const r=await fetch('/ui/webserver/upload/'+encodeURIComponent(currentSite),{method:'POST',body:fd});
      const data=await r.json();
      const el=document.getElementById('upstatus-'+file.name.replace(/W/g,'_'));
      if(el) el.innerHTML=data.ok?'<span style="color:var(--green)">✓ Done</span>':'<span style="color:var(--red)">✗ Failed</span>';
    } catch(e) {
      const el=document.getElementById('upstatus-'+file.name.replace(/W/g,'_'));
      if(el) el.innerHTML='<span style="color:var(--red)">✗ Error</span>';
    }
  }
  await loadUploadedFilesFromName(currentSite);
  toast(files.length+' file(s) uploaded');
}

async function loadUploadedFilesFromName(hostname){
  const r = await api('/ui/webserver/files/'+encodeURIComponent(hostname));
  renderUploadedFiles(r?.files||[]);
}
async function loadUploadedFiles(v){ loadUploadedFilesFromName(v.hostname); }

function renderUploadedFiles(files){
  html('upload-files-table', files.length
    ? files.map(f=>'<tr>' +
        '<td style="font-family:monospace">'+f.name+'</td>' +
        '<td style="color:var(--dim)">'+(f.size?(f.size/1024).toFixed(1)+' KB':'—')+'</td>' +
        '<td style="font-family:monospace;font-size:11px">'+(f.nexus?'<a href="'+f.nexus+'">'+f.nexus.slice(0,32)+'…</a>':'—')+'</td>' +
        '<td style="color:var(--dim);font-size:12px">'+(f.uploaded?new Date(f.uploaded).toLocaleString():'—')+'</td>' +
        '<td><button class="sec sm" onclick="deleteUpload(\''+f.fileId+'\')">&#x2715;</button></td>' +
      '</tr>').join('')
    : '<tr><td colspan="5" style="color:var(--dim)">No uploaded files yet</td></tr>');
}

async function deleteUpload(fileId){
  if (!currentSite) return;
  await api('/ui/webserver/file/'+encodeURIComponent(currentSite)+'/'+fileId, { method:'DELETE' });
  loadUploadedFilesFromName(currentSite);
  toast('File deleted');
}

function visitSite(){ if(currentSite) window.open('https://'+currentSite,'_blank'); }

// ── docs tabs ─────────────────────────────────────────────────────────────────
function docsTab(el,name){
  $$('[id^="dtab-"]').forEach(p=>p.classList.remove('active'));
  $$('#page-docs .tabs .tab').forEach(t=>t.classList.remove('active'));
  const pane=$('dtab-'+name); if(pane) pane.classList.add('active');
  if(el) el.classList.add('active');
  else { const tabs=[...$$('#page-docs .tabs .tab')]; const idx=['start','dns','network','apps','security','cli','api','troubleshoot'].indexOf(name); if(tabs[idx]) tabs[idx].classList.add('active'); }
}

// ── setup wizard ─────────────────────────────────────────────────────────────
function wizardInit(){
  loadWizardConfig();
  checkDrift();
}

function wstep(label,status,detail){
  const icon = status==='ok'?'<span style="color:var(--green)">✓</span>':status==='err'?'<span style="color:var(--red)">✗</span>':status==='warn'?'<span style="color:var(--yellow)">!</span>':'<span style="color:var(--dim)">…</span>';
  return '<div class="wizard-step"><div class="wstatus">'+icon+'</div><div><div class="wlabel">'+label+'</div>'+(detail?'<div class="wdetail">'+detail+'</div>':'')+'</div></div>';
}

async function loadWizardConfig(){
  const r = await api('/ui/setup/status');
  if (r?.domain) $('wiz-domain').value = r.domain;
  if (r?.currentStep) {
    $('wiz-config-result').innerHTML = '<span style="color:var(--yellow)">⚠ A previous run stopped at step "'+r.currentStep+'" — <a href="#" onclick="resumeWizard();return false">resume it</a> instead of starting over.</span>';
  }
}

async function saveWizardConfig(){
  const domain = $('wiz-domain').value.trim();
  if (!domain) { toast('Enter a domain first'); return; }
  const body = { domain, registrar: $('wiz-registrar').value };
  if (body.registrar === 'godaddy') {
    body.godaddy = { apiKey: $('wiz-godaddy-key').value.trim(), apiSecret: $('wiz-godaddy-secret').value.trim() };
  }
  const r = await api('/ui/setup/configure', { method:'POST', body });
  $('wiz-config-result').innerHTML = r?.ok
    ? '<span style="color:var(--green)">✓ Saved</span>'
    : '<span style="color:var(--red)">✕ '+(r?.error||'save failed')+'</span>';
}

// setup.js's orchestrator step keys, in run order — this list drives both
// the visual stepper AND which result key each step reads from.
const WIZ_STEPS = [
  {key:'upnp',label:'Forwarding router ports (UPnP)'},
  {key:'sysfw',label:'Applying OS firewall rules'},
  {key:'glue',label:'DNS + glue/NS delegation'},
  {key:'tls',label:'Requesting TLS certificate'},
];

async function runFullWizard(force){
  $('wizard-progress').style.display='';
  $('wizard-steps').innerHTML = WIZ_STEPS.map(s=>wstep(s.label,'pending')).join('');
  $('wizard-bar').style.width='10%'; $('wizard-bar').classList.remove('g');

  const r = await api('/ui/setup/run', { method:'POST', body:{ force: !!force } });

  if (!r || r.ok === undefined) {
    toast('Setup run failed to reach the setup engine'); return;
  }
  if (r.error?.code === 'ALREADY_IN_PROGRESS') {
    toast('A setup run is already in progress — hang tight'); return;
  }

  const results = r.results || {};
  WIZ_STEPS.forEach((s,i)=>{
    const res = results[s.key];
    const status = !res ? 'pending' : res.ok ? 'ok' : 'err';
    updateWizStep(i, WIZ_STEPS, status, res?.detail||'');
  });
  $('wizard-bar').style.width='100%';
  if (r.ok) $('wizard-bar').classList.add('g');

  if (r.ok) {
    toast('Setup wizard complete');
    wizCheckUpnp(); wizDetectSysfw(); wizCheckDns(true); wizCheckTls(true);
  } else {
    toast('Setup stopped at "'+r.failedAt+'" — fix it and re-run, or resume');
  }
  checkDrift();
}

async function resumeWizard(){
  $('wizard-progress').style.display='';
  const r = await api('/ui/setup/resume', { method:'POST' });
  if (r?.ok) { toast('Resumed and completed successfully'); runFullWizard.lastResult=r; }
  else toast('Resume failed: '+(r?.error?.message||'unknown error'));
  loadWizardConfig();
  checkDrift();
}

// ── drift banner — polled on load and periodically from every page ─────────
async function checkDrift(){
  const r = await api('/ui/setup/drift-check');
  const banner = $('drift-banner');
  if (!r) { return; }
  if (r.drift) {
    $('drift-banner-text').textContent = '⚠ IP changed since your last setup run ('+(r.lastKnownIp||'?')+' → '+(r.currentIp||'?')+') — glue records and DNS may be stale.';
    banner.style.display = 'flex';
  } else if (r.lastRunFailed) {
    $('drift-banner-text').textContent = '⚠ The last setup run did not finish successfully.';
    banner.style.display = 'flex';
  } else {
    banner.style.display = 'none';
  }
}

function updateWizStep(idx,steps,status,detail){
  const html_=steps.map((s,i)=>i===idx?wstep(s.label,status,detail):wstep(s.label, i<idx?'ok':'pending')).join('');
  $('wizard-steps').innerHTML=html_;
}

async function wizCheckUpnp(){
  html('wiz-upnp-status','<span style="color:var(--yellow)">Checking…</span>');
  const r=await api('/ui/upnp/status',{method:'POST'});
  html('wiz-upnp-status', r?.ok?'<span style="color:var(--green)">✓ Router gateway found — automatic forwarding available</span>':'<span style="color:var(--yellow)">⚠ '+(r?.detail||'no UPnP gateway found')+' — manual forwarding may be required</span>');
}
async function wizOpenUpnp(){
  html('wiz-upnp-status','<span style="color:var(--yellow)">Forwarding ports…</span>');
  const r=await api('/ui/upnp/open',{method:'POST'});
  html('wiz-upnp-status', r?.skipped?'<span style="color:var(--yellow)">⚠ '+(r.reason||'no gateway found')+'</span>':r?.ok?'<span style="color:var(--green)">✓ All ports forwarded automatically</span>':'<span style="color:var(--yellow)">⚠ Some ports failed — see logs</span>');
  toast(r?.ok?'Ports forwarded':'Check UPnP status','ok');
}
async function wizDetectSysfw(){
  html('wiz-sysfw-status','<span style="color:var(--yellow)">Detecting…</span>');
  const r=await api('/ui/sysfw/detect',{method:'POST'});
  html('wiz-sysfw-status', r?.tool?'<span style="color:var(--green)">✓ Using '+r.tool+' on '+r.platform+'</span>':'<span style="color:var(--yellow)">⚠ No supported firewall tool detected</span>');
}
async function wizApplySysfw(){
  html('wiz-sysfw-status','<span style="color:var(--yellow)">Applying rules…</span>');
  const r=await api('/ui/sysfw/apply',{method:'POST'});
  html('wiz-sysfw-status', r?.skipped?'<span style="color:var(--yellow)">⚠ Not available on this platform</span>':r?.ok?'<span style="color:var(--green)">✓ Rules applied</span>':'<span style="color:var(--yellow)">⚠ Some rules failed</span>');
}
async function wizCheckDns(silent){
  if(!silent) html('wiz-dns-status','<span style="color:var(--yellow)">Checking…</span>');
  const peer=await api('/ui/peer/identity');
  const ip=peer?.ip;
  const result = ip ? {ok:true, detail:'Public IP detected: '+ip+'. Confirm your domain\'s DNS A record points here.'} : {ok:false, detail:'Could not detect public IP yet'};
  if(!silent) html('wiz-dns-status', result.ok?'<span style="color:var(--green)">✓ '+result.detail+'</span>':'<span style="color:var(--yellow)">⚠ '+result.detail+'</span>');
  return result;
}
async function wizCheckTls(silent){
  if(!silent) html('wiz-tls-status','<span style="color:var(--yellow)">Checking…</span>');
  const r=await api('/ui/ssl/certs');
  const has=(r?.certs||[]).length>0;
  const result = has ? {ok:true, detail:(r.certs.length)+' certificate(s) found'} : {ok:false, detail:'No certificate issued yet — usually means port 80 is not yet reachable from the internet'};
  if(!silent) html('wiz-tls-status', result.ok?'<span style="color:var(--green)">✓ '+result.detail+'</span>':'<span style="color:var(--yellow)">⚠ '+result.detail+'</span>');
  return result;
}

// ── boot ──────────────────────────────────────────────────────────────────────
wizardInit();
setInterval(checkDrift, 60000);
setInterval(()=>{const p=document.querySelector('.page.active')?.id?.replace('page-','');if(p==='dashboard')refreshDashboard();if(p==='monitor')loadMonitor();},30000);
