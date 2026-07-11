// ════════════════════════════════════════════════════
// STARFIELD CANVAS — twinkling stars (Van Gogh / synthwave reference, dialed
// down to ambient field per the style note: ~0.15-0.2 opacity behind panels)
// ════════════════════════════════════════════════════
(function(){
  const canvas = document.getElementById('star-canvas');
  const ctx = canvas.getContext('2d');
  let stars = [];
  function resize(){
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const N = Math.round((canvas.width*canvas.height)/9000);
    stars = Array.from({length:N}, () => ({
      x: Math.random()*canvas.width, y: Math.random()*canvas.height*0.9,
      r: Math.random()*1.3+0.3, base: Math.random()*0.5+0.25,
      speed: Math.random()*0.02+0.005, phase: Math.random()*Math.PI*2
    }));
  }
  function tick(t){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for (const s of stars){
      const tw = s.base + Math.sin(t*s.speed + s.phase)*0.35;
      ctx.globalAlpha = Math.max(0, Math.min(1, tw));
      ctx.fillStyle = '#cfe6ff';
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill();
    }
    requestAnimationFrame(tick);
  }
  window.addEventListener('resize', resize);
  resize(); requestAnimationFrame(tick);
})();

// ════════════════════════════════════════════════════
// NEXUS API CLIENT — wired to the real Idearium service (idearium/api/index.js)
// Real routes: GET /api/ideas, /api/specs, /api/gaps, /api/snapshots, /api/stats,
// /api/events, /sse · POST /api/ideas, /api/gaps, /api/snapshots, etc.
// Tries direct :4800, falls back to orchestrator proxy at :9000/api/idearium
// ════════════════════════════════════════════════════
const API_CANDIDATES = ['http://127.0.0.1:4800', 'http://127.0.0.1:9000/api/idearium'];
let API_BASE = null;
let CONNECTED = false;
let SSE = null;

async function fetchTimeout(url, opts={}, ms=5000) {
  // §2026-07-10 — was 1800ms. The screenshots showed repeated "operation was
  // aborted" toasts: the health check aborting at 1.8s against a host under
  // memory pressure (the 0xC0000409 crash cause). 1.8s is too tight for a cold
  // connection or a loaded machine. Writes already used 6000; this aligns the
  // default so health checks and exports stop spuriously aborting.
  const ctrl = new AbortController();
  const id = setTimeout(()=>ctrl.abort(), ms);
  try { return await fetch(url, { ...opts, signal: ctrl.signal }); }
  finally { clearTimeout(id); }
}

async function nexusConnect(manual=false) {
  setConnUI('connecting');
  for (const base of API_CANDIDATES) {
    try {
      const r = await fetchTimeout(base + '/health');
      if (r.ok) { API_BASE = base; CONNECTED = true; setConnUI('online', base); await loadAll(); openSSE(); return true; }
    } catch(_) {}
  }
  CONNECTED = false; API_BASE = null; setConnUI('offline');
  if (manual) toast('still unreachable — is the idearium service running?','err');
  return false;
}

function setConnUI(state, base) {
  const el = document.getElementById('conn-indicator');
  const label = document.getElementById('conn-label');
  const banner = document.getElementById('offline-banner');
  el.className = 'tb-conn ' + (state==='online'?'online':state==='connecting'?'':'offline');
  label.textContent = state==='online' ? `nexus · ${base.replace('http://127.0.0.1','')}` : state==='connecting' ? 'connecting…' : 'offline — click to retry';
  banner.classList.toggle('show', state==='offline');
  document.getElementById('welcome-foot').textContent = state==='online'
    ? `connected · ${base}`
    : 'awaiting connection to nexus idearium service · :4800';
}

async function api(path, opts={}) {
  if (!API_BASE) throw new Error('not connected to nexus');
  const r = await fetchTimeout(API_BASE + path, { headers:{'Content-Type':'application/json'}, ...opts }, 6000);
  let data = {};
  try { data = await r.json(); } catch(_) {}
  if (!r.ok || data.ok === false) throw new Error(data.error || r.statusText || 'request failed');
  return data;
}

function openSSE() {
  try {
    if (SSE) SSE.close();
    SSE = new EventSource(API_BASE + '/sse');
    SSE.onopen = () => { document.getElementById('sse-badge').textContent='live'; document.getElementById('sse-badge').classList.add('live'); };
    SSE.onerror = () => { document.getElementById('sse-badge').textContent='disconnected'; document.getElementById('sse-badge').classList.remove('live'); };
    SSE.onmessage = (e) => {
      try { const ev = JSON.parse(e.data); appendEventLog(ev); refreshOnEvent(ev); }
      catch(_) {}
    };
  } catch(_) {}
}

function refreshOnEvent(ev) {
  // re-pull the relevant slice rather than trust a partial payload
  if (!ev || !ev.type) return;
  if (ev.type.startsWith('idea.'))   { loadIdeas(); }
  if (ev.type.startsWith('gap.'))    { loadGaps(); }
  if (ev.type.startsWith('spec.'))   { loadSpecs(); }
  if (ev.type==='push.complete')     { loadSnapshots(); }
  if (ev.type==='snr.update')        { loadStats(); }
}

// ════════════════════════════════════════════════════
// STATE — populated only from real Nexus data, never seeded
// ════════════════════════════════════════════════════
let IDEAS=[], GAPS=[], SPECS=[], SNAPSHOTS=[], STATS=null;
let SELECTED=null, SELECTED_SPEC=null, SELECTED_SNAP=null;
let CURRENT_SORT='tension';
let BRAINSTORMS = JSON.parse(localStorage.getItem('idearium.brainstorms')||'[]');
const IDEA_PHASES   = ['seed','expanding','tensioned','specced','building','complete','archived'];
const GAP_SEVERITIES= ['fatal','high','medium','low'];
const LINK_TYPES    = ['resonance','tension','causal','temporal','semantic'];
const SECTION_IDS   = ['intent','api_callto','module_hooks','cli_spec','schemas','gap_contract','failure_modes','tests','phase_map'];

async function loadAll() {
  await Promise.all([loadIdeas(), loadGaps(), loadSpecs(), loadSnapshots(), loadStats(), loadApiRepos()]);
}
async function loadIdeas()    { try { IDEAS = (await api('/api/ideas')).ideas || []; renderIdeaList(); if(SELECTED){const i=IDEAS.find(x=>x.uuid===SELECTED); if(i) renderDetail(i);} } catch(e){ console.warn('[idearium] loadIdeas failed:', e.message); toast('failed to load ideas: '+e.message,'err'); } }
async function loadGaps()     { try { GAPS  = (await api('/api/gaps')).gaps  || []; renderIdeaList(); } catch(e){ console.warn('[idearium] loadGaps failed:', e.message); } }
async function loadSpecs()    { try { SPECS = (await api('/api/specs')).specs|| []; renderSpecList(); renderArchitect(); } catch(e){ console.warn('[idearium] loadSpecs failed:', e.message); toast('failed to load specs: '+e.message,'err'); } }
async function loadSnapshots(){ try { SNAPSHOTS = (await api('/api/snapshots')).snapshots || []; renderVersionium(); } catch(e){ console.warn('[idearium] loadSnapshots failed:', e.message); } }
async function loadStats()    { try { STATS = (await api('/api/stats')).stats; } catch(e){ console.warn('[idearium] loadStats failed:', e.message); } updateStats(); }
// Ideas/Repo merge: repos are no longer their own rail tab — they're looked
// up by ideaUuid/specUuid from idea/spec detail panels. API_REPOS is the
// client-side cache loadAll() refreshes alongside everything else.
let API_REPOS = [];
async function loadApiRepos() { try { API_REPOS = (await api('/api/repos')).repos || []; } catch(e){} }


function updateStats() {
  document.getElementById('stat-ideas').textContent = IDEAS.filter(i=>i.phase!=='archived').length || 0;
  document.getElementById('stat-gaps').textContent  = GAPS.filter(g=>g.status==='open').length || 0;
  document.getElementById('stat-specs').textContent = SPECS.length || 0;
  document.getElementById('stat-snr').textContent    = STATS && STATS.snr!=null ? STATS.snr.toFixed ? STATS.snr.toFixed(2) : STATS.snr : '—';
  document.getElementById('brain-count-badge').textContent = `${BRAINSTORMS.length} entries`;
  document.getElementById('spec-count-badge').textContent  = `${SPECS.length} specs`;
  document.getElementById('snap-count-badge').textContent  = `${SNAPSHOTS.length} snapshots`;
  document.getElementById('snap-btn').disabled = !CONNECTED;
}

// ════════════════════════════════════════════════════
// VIEW SWITCHING + NAV RAIL
// ════════════════════════════════════════════════════
function setView(v) {
  document.querySelectorAll('.view').forEach(el=>el.classList.toggle('active', el.id==='view-'+v));
  document.querySelectorAll('.rail-btn').forEach(b=>b.classList.toggle('active', b.dataset.view===v));
}

// ════════════════════════════════════════════════════
// EVENT LOG
// ════════════════════════════════════════════════════
function appendEventLog(ev) {
  const log = document.getElementById('event-log');
  const time = new Date(ev.ts||Date.now()).toLocaleTimeString('en-GB',{hour12:false});
  const typeShort = (ev.type||'event').replace('idearium.','');
  const typeClass = typeShort.includes('gap')?'gap':typeShort.includes('snapshot')||typeShort.includes('push')?'snap':typeShort.includes('spec')?'spec':typeShort.includes('error')?'err':'idea';
  const div = document.createElement('div');
  div.className = 'gap-log-line';
  const payload = ev.payload || {};
  const preview = (payload.text||payload.name||payload.uuid||payload.message||'').toString().slice(0,40);
  div.innerHTML = `<span class="gl-ts">${time}</span><span class="gl-type ${typeClass}">${typeShort}</span><span style="color:var(--text3)">${preview}</span>`;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
  while (log.children.length > 300) log.removeChild(log.firstChild);
}

// ════════════════════════════════════════════════════
// IDEAS — real schema: uuid, slug, text, tags, phase, tension,
// resonanceWith, tensionWith, openGaps, stability{...}, compartment, linkedSpec
// ════════════════════════════════════════════════════
function sortBy(s, btn) {
  CURRENT_SORT = s;
  document.querySelectorAll('#view-ideas .toolbar .mode-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderIdeaList();
}

function getFilteredIdeas() {
  const q = (document.getElementById('search').value||'').toLowerCase();
  let pool = IDEAS.filter(i => i.phase !== 'archived');
  if (q) pool = pool.filter(i => (i.text||'').toLowerCase().includes(q) || (i.tags||[]).some(t=>t.toLowerCase().includes(q)));
  return pool.sort((a,b) => {
    if (CURRENT_SORT==='tension') return (b.tension||0)-(a.tension||0);
    if (CURRENT_SORT==='updated') return (b.updatedAt||0)-(a.updatedAt||0);
    return (a.text||'').localeCompare(b.text||'');
  });
}

function renderIdeaList() {
  const list = document.getElementById('idea-list');
  const items = getFilteredIdeas();
  list.innerHTML = '';
  if (!items.length) {
    list.innerHTML = `<div style="padding:20px;text-align:center;font-family:var(--mono);font-size:11px;color:var(--text3)">${CONNECTED ? 'no ideas yet — click + idea' : 'not connected to nexus'}</div>`;
    return;
  }
  for (const idea of items) {
    const tension = idea.tension || 0;
    const card = document.createElement('div');
    const tClass = tension > 0.7 ? 't-high' : tension > 0.4 ? 't-med' : 'low';
    const openGaps = GAPS.filter(g=>g.status==='open'&&(g.between||[idea.uuid]).includes(idea.uuid));
    card.className = `idea-card ${tClass} ${idea.phase}${idea._local?' local':''}${SELECTED===idea.uuid?' selected':''}`;
    card.onclick = () => selectIdea(idea.uuid);
    const tagsHtml = (idea.tags||[]).map(t=>`<span class="ic-tag">#${t}</span>`).join('');
    const gapsHtml = openGaps.length ? `<span class="ic-gap">◆ ${openGaps.length} gap${openGaps.length>1?'s':''}</span>` : '';
    const tColor = tension>0.7?'var(--coral)':tension>0.4?'var(--amber)':'var(--mint)';
    const stab = idea.stability || {};
    const stabHtml = ['execution','runtime','effectiveness','rigidity','persistence'].map(k=>{
      const v = stab[k]!=null ? stab[k] : 1;
      return `<i style="height:${Math.max(3,v*10)}px;background:${v<0.4?'var(--coral)':v<0.7?'var(--amber)':'var(--mint)'}" title="${k}: ${v}"></i>`;
    }).join('');
    card.innerHTML = `
      <div class="ic-top">
        <div class="ic-name">${escapeHtml(idea.text||idea.slug||'untitled')}</div>
        <span class="ic-status st-${idea.phase}">${idea.phase}${idea._local?' · local':''}</span>
      </div>
      <div class="tension-row">
        <span class="tension-label">tension</span>
        <div class="tension-track"><div class="tension-fill" style="width:${tension*100}%;background:${tColor}"></div></div>
        <span class="tension-pct" style="color:${tColor}">${Math.round(tension*100)}%</span>
        <div class="stab-mini">${stabHtml}</div>
      </div>
      <div class="ic-meta">${gapsHtml}${tagsHtml}<span class="ic-uuid">${(idea.uuid||'').slice(0,8)}</span></div>
    `;
    list.appendChild(card);
  }
}

function selectIdea(uuid) {
  SELECTED = uuid;
  const idea = IDEAS.find(i=>i.uuid===uuid);
  if (!idea) return;
  renderIdeaList();
  renderDetail(idea);
}

function renderDetail(idea) {
  const tension = idea.tension || 0;
  const openGaps = GAPS.filter(g=>g.status==='open'&&(g.between||[idea.uuid]).includes(idea.uuid));
  const resIdeas = (idea.resonanceWith||[]).map(u=>IDEAS.find(i=>i.uuid===u)).filter(Boolean);
  const tenIdeas = (idea.tensionWith||[]).map(u=>IDEAS.find(i=>i.uuid===u)).filter(Boolean);
  const linkedSpec = idea.linkedSpec ? SPECS.find(s=>s.uuid===idea.linkedSpec) : null;

  document.getElementById('detail-title').textContent = (idea.text||idea.slug||'').slice(0,40);
  const area = document.getElementById('detail-area');
  const tColor = tension>0.7?'var(--coral)':tension>0.4?'var(--amber)':'var(--mint)';

  let html = `
    <div class="ds">
      <div class="ds-label">tension score</div>
      <div style="display:flex;align-items:center;gap:8px">
        <div class="tension-track" style="flex:1;height:5px;background:var(--bg);border-radius:3px;overflow:hidden">
          <div class="tension-fill" style="width:${tension*100}%;background:${tColor};height:100%;border-radius:3px"></div>
        </div>
        <span style="font-family:var(--mono);font-size:13px;font-weight:600;color:${tColor}">${Math.round(tension*100)}%</span>
      </div>
    </div>
    <div class="ds"><div class="ds-label">text</div><div class="ds-value">${escapeHtml(idea.text||'—')}</div></div>
    <div class="ds">
      <div class="ds-label">phase</div>
      <div style="display:flex;gap:5px;flex-wrap:wrap">
        ${IDEA_PHASES.map(p=>`<button class="action-btn${idea.phase===p?' primary':''}" onclick="setPhase('${idea.uuid}','${p}')">${p}</button>`).join('')}
      </div>
    </div>
  `;
  if ((idea.tags||[]).length) html += `<div class="ds"><div class="ds-label">tags</div><div class="tag-row">${idea.tags.map(t=>`<span class="tag-pill">${escapeHtml(t)}</span>`).join('')}</div></div>`;
  if (idea.compartment) html += `<div class="ds"><div class="ds-label">compartment</div><div class="ds-mono">${escapeHtml(idea.compartment)}</div></div>`;

  html += `
    <div class="ds">
      <div class="ds-label">stability</div>
      <div class="pend-detail" style="background:var(--bg2);border:1px solid var(--b0);border-radius:5px;padding:10px">
        ${Object.entries(idea.stability||{}).map(([k,v])=>`<div class="pend-row" style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid var(--b0)"><span class="pend-k" style="font-family:var(--mono);font-size:9px;color:var(--text3)">${k}</span><span class="pend-v" style="font-family:var(--mono);font-size:10px">${v}</span></div>`).join('') || '<span style="color:var(--text3);font-family:var(--mono);font-size:10px">no stability data</span>'}
      </div>
    </div>
  `;

  if (linkedSpec) {
    html += `<div class="ds"><div class="ds-label">linked spec</div><div class="link-item" style="cursor:pointer" onclick="setView('spec');selectSpec('${linkedSpec.uuid}')"><span class="link-type resonance">spec</span><span>${escapeHtml(linkedSpec.name)}</span><span class="ic-uuid" style="margin-left:auto">${linkedSpec.phase}</span></div></div>`;
  } else {
    html += `<div class="ds"><div class="ds-label">spec</div><button class="action-btn primary" onclick="createSpecForIdea('${idea.uuid}')">+ create spec from this idea</button></div>`;
  }

  html += `<div class="ds"><div class="ds-label">repository</div><button class="action-btn" onclick="openRepoFor('${idea.uuid}', null, '${escapeHtml(idea.text||idea.uuid).replace(/'/g,"\\'").slice(0,40)}')">open repository →</button></div>`;

  if (openGaps.length) {
    html += `<div class="ds"><div class="ds-label">open gaps (${openGaps.length})</div>`;
    for (const g of openGaps) {
      html += `
        <div class="gap-item open">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
            <span class="gap-id">${g.uuid.slice(0,8)}</span>
            <span style="font-family:var(--mono);font-size:9px" class="sev-${g.severity}">${g.severity}</span>
            <button class="action-btn" style="font-size:9px;padding:1px 6px" onclick="resolveGap('${g.uuid}')">resolve</button>
          </div>
          <div class="gap-desc">${escapeHtml(g.description)}</div>
        </div>`;
    }
    html += `</div>`;
  }

  if (resIdeas.length || tenIdeas.length) {
    html += `<div class="ds"><div class="ds-label">relationships</div>`;
    for (const r of resIdeas) html += `<div class="link-item"><span class="link-type resonance">resonance</span><span>${escapeHtml((r.text||'').slice(0,30))}</span><span class="ic-uuid" style="margin-left:auto">${r.uuid.slice(0,8)}</span></div>`;
    for (const r of tenIdeas) html += `<div class="link-item"><span class="link-type tension">tension</span><span>${escapeHtml((r.text||'').slice(0,30))}</span><span class="ic-uuid" style="margin-left:auto">${r.uuid.slice(0,8)}</span></div>`;
    html += `</div>`;
  }

  const others = IDEAS.filter(i=>i.uuid!==idea.uuid && i.phase!=='archived');
  if (others.length) {
    html += `<div class="ds"><div class="ds-label">link to another idea</div><div style="display:flex;gap:5px;flex-wrap:wrap">${others.slice(0,6).map(o=>`<button class="action-btn" onclick="linkIdeas('${idea.uuid}','${o.uuid}','resonance')" title="${escapeHtml(o.text)}">~ ${escapeHtml((o.text||'').slice(0,16))}</button>`).join('')}</div></div>`;
  }

  html += `
    <div class="ds">
      <div class="ds-label">actions</div>
      <div class="action-row">
        <button class="action-btn" onclick="openGapPrompt('${idea.uuid}')">open gap</button>
        <button class="action-btn danger" onclick="archiveIdea('${idea.uuid}')">archive</button>
      </div>
    </div>
    <div class="ds"><div class="ds-label">identity</div><div class="ds-mono">${idea.uuid}\n${idea.slug||''}\ncreated ${idea.createdAt?new Date(idea.createdAt).toLocaleString():'—'}\nupdated ${idea.updatedAt?new Date(idea.updatedAt).toLocaleString():'—'}</div></div>
  `;
  area.innerHTML = html;
}

async function setPhase(uuid, phase) {
  try { await api(`/api/ideas/${uuid}/phase`, { method:'POST', body: JSON.stringify({phase}) }); toast(`phase → ${phase}`,'ok'); await loadIdeas(); }
  catch(e) { toast(e.message,'err'); }
}
async function linkIdeas(fromUuid, toUuid, linkType='resonance') {
  try { await api(`/api/ideas/${fromUuid}/link`, { method:'POST', body: JSON.stringify({toUuid, linkType}) }); toast('linked','ok'); await loadIdeas(); }
  catch(e) { toast(e.message,'err'); }
}
async function archiveIdea(uuid) {
  const reason = await themedPrompt('archive reason (required — §M1, nothing deleted):', 'archive idea');
  if (!reason) return;
  try { await api(`/api/ideas/${uuid}`, { method:'DELETE', body: JSON.stringify({reason}) }); SELECTED=null; document.getElementById('detail-area').innerHTML='<div class="detail-empty">idea archived</div>'; toast('archived','ok'); await loadIdeas(); }
  catch(e) { toast(e.message,'err'); }
}
async function openGapPrompt(ideaUuid) {
  const description = await themedPrompt('gap description:', 'open gap');
  if (!description) return;
  openGap({ description, ideaUuid, type:'unresolved', severity:'medium' });
}
async function openGap({description, ideaUuid, type, severity}) {
  try { await api('/api/gaps', { method:'POST', body: JSON.stringify({description, ideaUuid, type, severity, between:ideaUuid?[ideaUuid]:[]}) }); toast('gap opened','ok'); await loadGaps(); if(SELECTED) renderDetail(IDEAS.find(i=>i.uuid===SELECTED)); }
  catch(e) { toast(e.message,'err'); }
}
async function resolveGap(uuid) {
  try { await api(`/api/gaps/${uuid}/resolve`, { method:'POST', body: JSON.stringify({resolution:'resolved via UI'}) }); toast('gap resolved','ok'); await loadGaps(); if(SELECTED) renderDetail(IDEAS.find(i=>i.uuid===SELECTED)); }
  catch(e) { toast(e.message,'err'); }
}

function openModal(){ document.getElementById('modal').classList.add('open'); document.getElementById('f-text').focus(); }
function closeModal(){ document.getElementById('modal').classList.remove('open'); }
function openSpecChoice(){ document.getElementById('spec-choice-modal').classList.add('open'); }
function closeSpecChoice(){ document.getElementById('spec-choice-modal').classList.remove('open'); }

// Themed replacement for window.prompt() — same contract (resolves to the
// entered string, or null on cancel/empty) so call sites just add `await`.
let _promptResolve = null;
function themedPrompt(label, title='input') {
  document.getElementById('prompt-modal-title').textContent = title;
  document.getElementById('prompt-modal-label').textContent = label;
  const input = document.getElementById('prompt-modal-input');
  input.value = '';
  document.getElementById('prompt-modal').classList.add('open');
  setTimeout(() => input.focus(), 50);
  return new Promise(resolve => { _promptResolve = resolve; });
}
function closePromptModal(value) {
  document.getElementById('prompt-modal').classList.remove('open');
  if (_promptResolve) { _promptResolve(value && value.trim() ? value.trim() : null); _promptResolve = null; }
}

async function submitIdea() {
  const text = document.getElementById('f-text').value.trim();
  if (!text || text.length < 3) { toast('text must be ≥3 chars','err'); return; }
  const tags = document.getElementById('f-tags').value.split(',').map(t=>t.trim()).filter(Boolean);
  const compartment = document.getElementById('f-compartment').value.trim() || null;
  try {
    const res = await api('/api/ideas', { method:'POST', body: JSON.stringify({text, tags, compartment}) });
    closeModal();
    ['f-text','f-tags','f-compartment'].forEach(id=>document.getElementById(id).value='');
    await loadIdeas();
    setView('ideas');
    if (res.idea) selectIdea(res.idea.uuid);
    toast('idea logged','ok');
  } catch(e) { toast(e.message,'err'); }
}

async function doSnapshot() {
  if (!CONNECTED) { toast('not connected to nexus','err'); return; }
  const msg = document.getElementById('snap-msg').value.trim() || 'snapshot';
  try {
    const res = await api('/api/snapshots', { method:'POST', body: JSON.stringify({message: msg}) });
    document.getElementById('snap-msg').value='';
    document.getElementById('snap-latest').textContent = res.snapshot ? res.snapshot.commitId : '';
    toast(`snapshot pushed`,'ok');
    await loadSnapshots();
  } catch(e) { toast(e.message,'err'); }
}

// ════════════════════════════════════════════════════
// BRAINSTORM — local quick-capture (genuinely user-authored, not seeded),
// promotable into a real tracked idea via POST /api/ideas
// ════════════════════════════════════════════════════
function saveBrainstorms(){ localStorage.setItem('idearium.brainstorms', JSON.stringify(BRAINSTORMS)); }
function addBrainstorm() {
  const text = document.getElementById('brain-text').value.trim();
  if (!text) { toast('write something first','err'); return; }
  const tags = document.getElementById('brain-tags').value.split(',').map(t=>t.trim()).filter(Boolean);
  BRAINSTORMS.unshift({ id: 'b-'+Date.now().toString(36), text, tags, ts: Date.now(), promoted:false });
  saveBrainstorms();
  document.getElementById('brain-text').value=''; document.getElementById('brain-tags').value='';
  renderBrainstorms(); updateStats();
}
function deleteBrainstorm(id){ BRAINSTORMS = BRAINSTORMS.filter(b=>b.id!==id); saveBrainstorms(); renderBrainstorms(); updateStats(); }
async function promoteBrainstorm(id) {
  const b = BRAINSTORMS.find(x=>x.id===id); if (!b) return;
  if (!CONNECTED) { toast('connect to nexus to promote','err'); return; }
  try {
    await api('/api/ideas', { method:'POST', body: JSON.stringify({text:b.text, tags:b.tags}) });
    b.promoted = true; saveBrainstorms(); renderBrainstorms();
    await loadIdeas();
    toast('promoted to idea','ok');
  } catch(e) { toast(e.message,'err'); }
}
function renderBrainstorms() {
  const grid = document.getElementById('brain-grid');
  if (!BRAINSTORMS.length) { grid.innerHTML = `<div class="detail-empty" style="grid-column:1/-1">no brainstorms yet — capture a raw thought above</div>`; return; }
  grid.innerHTML = BRAINSTORMS.map(b => `
    <div class="brain-card">
      <div class="brain-card-text">${escapeHtml(b.text)}</div>
      <div class="brain-card-meta">
        ${(b.tags||[]).map(t=>`<span class="ic-tag">#${escapeHtml(t)}</span>`).join('')}
        <span class="brain-ts">${new Date(b.ts).toLocaleString()}</span>
      </div>
      <div class="action-row">
        ${b.promoted ? `<span class="ic-tag" style="color:var(--mint)">promoted ✓</span>` : `<button class="action-btn primary" onclick="promoteBrainstorm('${b.id}')">promote → idea</button>`}
        <button class="action-btn danger" onclick="deleteBrainstorm('${b.id}')">discard</button>
      </div>
    </div>
  `).join('');
}

// ════════════════════════════════════════════════════
// SPEC LIBRARY / BUILDER / COMPILER
// real schema: {uuid,name,version,ideaUuid,phase,sections[{id,title,complete,required,content}],modules,wired,buildOrder}
// confidence + gap analysis computed client-side from real section completeness
// ════════════════════════════════════════════════════
let BUILDER_ACTIVE_SECTION = SECTION_IDS[0];

function specConfidence(spec) {
  const secs = spec.sections || [];
  if (!secs.length) return 0;
  const filled = secs.filter(s=>s.content && s.content.trim().length>0).length;
  return Math.round((filled/secs.length)*100);
}
function specGaps(spec) {
  return (spec.sections||[]).filter(s=>s.required && (!s.content || !s.content.trim()));
}

function renderSpecList() {
  const list = document.getElementById('spec-list');
  const q = (document.getElementById('spec-search').value||'').toLowerCase();
  let pool = SPECS.filter(s => (s.name||'').toLowerCase().includes(q));
  if (!pool.length) { list.innerHTML = `<div style="padding:20px;text-align:center;font-family:var(--mono);font-size:11px;color:var(--text3)">${CONNECTED ? 'no specs yet — open an idea and create one' : 'not connected to nexus'}</div>`; return; }
  list.innerHTML = pool.map(spec => {
    const conf = specConfidence(spec);
    const gaps = specGaps(spec);
    const chips = (spec.sections||[]).map(s=>`<span class="section-chip ${s.content?'done':(s.required?'missing':'')}" title="${s.title}">${s.id.slice(0,4)}</span>`).join('');
    return `
      <div class="spec-card${SELECTED_SPEC===spec.uuid?' selected':''}" onclick="selectSpec('${spec.uuid}')">
        <div class="spec-card-top">
          <span class="spec-name">${escapeHtml(spec.name)}</span>
          <span class="ic-status st-${spec.phase}">${spec.phase}</span>
        </div>
        <div style="font-family:var(--mono);font-size:9px;color:var(--text3)">confidence ${conf}% · ${gaps.length} gap${gaps.length===1?'':'s'} · v${spec.version||'1.0.0'}</div>
        <div class="section-grid">${chips}</div>
      </div>`;
  }).join('');
}

function selectSpec(uuid) {
  SELECTED_SPEC = uuid;
  renderSpecList();
  const spec = SPECS.find(s=>s.uuid===uuid);
  if (!spec) return;
  document.getElementById('spec-detail-title').textContent = spec.name;
  BUILDER_ACTIVE_SECTION = (spec.sections||[])[0]?.id || SECTION_IDS[0];
  renderSpecBuilder(spec);
}

function renderSpecBuilder(spec) {
  const conf = specConfidence(spec);
  const gaps = specGaps(spec);
  const sec = (spec.sections||[]).find(s=>s.id===BUILDER_ACTIVE_SECTION) || {};
  const wrap = document.getElementById('spec-builder');
  wrap.innerHTML = `
    <div class="builder-section-tabs">
      ${(spec.sections||[]).map(s=>`<button class="sec-tab ${s.id===BUILDER_ACTIVE_SECTION?'active':''} ${s.content?'filled':''}" onclick="switchSection('${spec.uuid}','${s.id}')">${s.id.replace(/_/g,' ')}</button>`).join('')}
    </div>
    <div class="builder-body">
      <div class="ds" style="margin-bottom:0">
        <div class="ds-label">compiler — confidence &amp; gap analysis</div>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="tension-track" style="flex:1;height:6px"><div class="tension-fill" style="width:${conf}%;background:${conf>70?'var(--mint)':conf>35?'var(--amber)':'var(--coral)'}"></div></div>
          <span style="font-family:var(--mono);font-size:12px;font-weight:600">${conf}%</span>
        </div>
        ${gaps.length?`<div style="margin-top:8px;font-family:var(--mono);font-size:10px;color:var(--coral)">missing required: ${gaps.map(g=>g.id).join(', ')}</div>`:'<div style="margin-top:8px;font-family:var(--mono);font-size:10px;color:var(--mint)">all required sections filled</div>'}
      </div>
      <div class="field-group">
        <div class="field-label">${sec.id ? sec.id.replace(/_/g,' ') : 'section'} — ${sec.required?'required':'optional'}</div>
        <textarea class="builder-textarea" id="builder-content" placeholder="write this SEAM section...">${escapeHtml(sec.content||'')}</textarea>
      </div>
      <div class="action-row">
        <button class="action-btn primary" onclick="saveSection('${spec.uuid}')">save section</button>
        <button class="action-btn" onclick="checkSpec('${spec.uuid}')">run spec check</button>
        <button class="action-btn" onclick="buildSpec('${spec.uuid}')">compile / build</button>
        <button class="action-btn" onclick="exportSpec('${spec.uuid}')">export markdown</button>
        <button class="action-btn" onclick="openRepoFor('${spec.ideaUuid||''}', '${spec.uuid}', '${escapeHtml(spec.name).replace(/'/g,"\\'").slice(0,40)}')">open repository →</button>
      </div>
    </div>
  `;
}
function switchSection(uuid, sectionId) {
  BUILDER_ACTIVE_SECTION = sectionId;
  const spec = SPECS.find(s=>s.uuid===uuid);
  if (spec) renderSpecBuilder(spec);
}
async function saveSection(uuid) {
  const spec = SPECS.find(s=>s.uuid===uuid); if (!spec) return;
  const content = document.getElementById('builder-content').value;
  const sections = (spec.sections||[]).map(s=>s.id===BUILDER_ACTIVE_SECTION ? {...s, content, complete: content.trim().length>0} : s);
  try { await api(`/api/specs/${uuid}`, { method:'PATCH', body: JSON.stringify({sections}) }); toast('section saved','ok'); await loadSpecs(); selectSpec(uuid); }
  catch(e) { toast(e.message,'err'); }
}
async function checkSpec(uuid) {
  try { await api(`/api/specs/${uuid}/check`, { method:'POST' }); toast('spec check run','ok'); await loadSpecs(); selectSpec(uuid); }
  catch(e) { toast(e.message,'err'); }
}
async function buildSpec(uuid) {
  try {
    const res = await api(`/api/specs/${uuid}/build`, { method:'POST' });
    toast(res.message || res.status, res.status==='built'?'ok':'err');
    await loadSpecs(); selectSpec(uuid); renderArchitect();
  } catch(e) { toast(e.message,'err'); }
}
async function exportSpec(uuid) {
  try {
    const r = await fetchTimeout(API_BASE + `/api/specs/${uuid}/export`);
    const md = await r.text();
    const blob = new Blob([md], {type:'text/markdown'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    const spec = SPECS.find(s=>s.uuid===uuid);
    a.download = (spec?.name||'spec').replace(/[^a-z0-9-]/gi,'_') + '.spec.md';
    a.click();
    toast('exported','ok');
  } catch(e) { toast(e.message,'err'); }
}
async function newSpecPrompt() {
  const name = await themedPrompt('spec name:', 'new spec');
  if (!name) return;
  try {
    await api('/api/specs', { method:'POST', body: JSON.stringify({name}) });
    toast('spec created','ok');
    await loadSpecs();
  } catch(e) { toast(e.message,'err'); }
}
async function createSpecForIdea(ideaUuid) {
  const idea = IDEAS.find(i=>i.uuid===ideaUuid); if (!idea) return;
  try {
    await api(`/api/ideas/${ideaUuid}/spec`, { method:'POST', body: JSON.stringify({name: (idea.text||'spec').slice(0,60)}) });
    toast('spec created from idea','ok');
    await loadIdeas(); await loadSpecs();
    renderDetail(IDEAS.find(i=>i.uuid===ideaUuid));
  } catch(e) { toast(e.message,'err'); }
}

// ════════════════════════════════════════════════════
// ARCHITECT — blueprint tree derived from real compiled specs
// ════════════════════════════════════════════════════
function renderArchitect() {
  const wrap = document.getElementById('architect-wrap');
  const built = SPECS.filter(s => ['specced','building','complete'].includes(s.phase));
  if (!built.length) { wrap.innerHTML = `<div class="detail-empty">no specced/built ideas yet — compile a spec in the Library to see its blueprint here</div>`; return; }
  wrap.innerHTML = `<div class="blueprint-tree">` + built.map(spec => {
    const idea = IDEAS.find(i=>i.uuid===spec.ideaUuid);
    const children = (spec.sections||[]).map(s => `
      <div class="bp-node">
        <span class="bp-dot ${s.content?'':'gray'}"></span>
        <span class="bp-label">${s.id.replace(/_/g,' ')}</span>
        <span class="bp-meta">${s.content ? (s.content.length+' chars') : 'empty'}</span>
      </div>`).join('');
    return `
      <div class="bp-node">
        <span class="bp-dot"></span>
        <span class="bp-label" style="font-size:13px;color:var(--sky)">${escapeHtml(spec.name)}</span>
        <span class="bp-meta">${spec.phase} · v${spec.version||'1.0.0'}${idea?` · from "${escapeHtml((idea.text||'').slice(0,30))}"`:''}</span>
      </div>
      <div class="bp-children">${children}</div>
    `;
  }).join('') + `</div>`;
}

// ════════════════════════════════════════════════════
// REPOSITORY / FILE BROWSER / IDE — real local folder via File System Access
// (no fabricated tree; browses whatever folder the user actually opens)
// ════════════════════════════════════════════════════
let REPO_FILES = []; // [{path, handle}]
let ACTIVE_FILE = null;

let CURRENT_REPO_IDEA = null; // idea this repo-view session is scoped to (set by openRepoFor)

// The merge point: ideas/specs don't have their own separate "Repository"
// nav item anymore — clicking "open repository" on an idea or a spec lands
// here, scoped to that idea. If a repo is already linked (RepoLayer match
// by ideaUuid/specUuid), show it. If not, the dropzone already in this view
// becomes "attach files to THIS idea" instead of a generic, unscoped drop.
function openRepoFor(ideaUuid, specUuid, label) {
  CURRENT_REPO_IDEA = ideaUuid || (specUuid && SPECS.find(s=>s.uuid===specUuid)?.ideaUuid) || null;
  setView('repo');
  document.getElementById('repo-context').textContent = label ? `← ${label}` : '';
  const repo = API_REPOS.find(r =>
    (specUuid && r.promotedFromSpec === specUuid) ||
    (CURRENT_REPO_IDEA && r.ideaUuid === CURRENT_REPO_IDEA) ||
    (specUuid && r.specUuid === specUuid));
  renderApiRepoPanel(repo);
}

// Renders a RepoLayer-tracked repo's file manifest. Honest limitation, not
// hidden: RepoLayer only persists path+bytes for ingested files (besides the
// canonical .spec, whose text lands in the spec's intent section) — there is
// no content-addressable blob store yet, so these entries are not clickable
// into the IDE pane the way locally-picked-folder files are. That's a real
// gap, not a UI oversight; fixing it means RepoLayer needs actual file
// storage, which is separate, larger work.
function renderApiRepoPanel(repo) {
  const tree = document.getElementById('file-tree');
  document.getElementById('ide-tabs').textContent = 'no file open';
  document.getElementById('ide-code').textContent = '// click a file in the tree to open it here';
  if (!repo) {
    document.getElementById('repo-badge').textContent = 'no repo linked to this idea';
    tree.innerHTML = `<div class="repo-empty">no repo linked yet<br><br>drop files below to attach one to this idea<br><br><button class="modal-btn confirm" onclick="document.getElementById('repo-drop-input').click()">drop repo files…</button></div>`;
    return;
  }
  document.getElementById('repo-badge').textContent = `${repo.fileCount} files · ${repo.phase}${repo.forks.length?` · ${repo.forks.length} fork(s)`:''}`;
  tree.innerHTML = `
    <div class="repo-empty" style="text-align:left;padding:14px">
      <div style="font-family:var(--mono);font-size:11px;color:var(--text3);margin-bottom:8px">${repo.promotedFromSpec ? 'promoted from spec — file structure as components' : 'manifest only — file content isn\'t stored yet, see note'}</div>
      ${(repo.files||[]).map(f=>`<div style="font-family:var(--mono);font-size:11px;padding:3px 0;color:var(--text2)">${escapeHtml(f.path)} <span style="color:var(--text3)">(${f.bytes}b)</span>${f.comp_id?`<br><span style="color:var(--accent);font-size:9px;padding-left:12px">▸ ${escapeHtml(f.comp_id)}${f.status?` · ${f.status}`:''}</span>`:''}</div>`).join('') || '<div style="color:var(--text3)">no files</div>'}
    </div>`;
}

async function pickLocalRepo() {
  try {
    if (!window.showDirectoryPicker) { toast('your browser does not support folder access — try Chrome/Edge','err'); return; }
    const dirHandle = await window.showDirectoryPicker();
    REPO_FILES = [];
    await walkDir(dirHandle, '');
    document.getElementById('repo-badge').textContent = `${REPO_FILES.length} files loaded`;
    renderFileTree();
    toast(`loaded ${REPO_FILES.length} files from ${dirHandle.name}`,'ok');
  } catch(e) { if (e.name !== 'AbortError') toast(e.message,'err'); }
}

// Drag-and-drop ingest → POST /api/repos (RepoLayer: each dropped repo
// becomes its own tracked idea+spec, not folded into the open local folder).
(function wireRepoDropzone(){
  const zone = document.getElementById('file-tree');
  if (!zone) return;
  ['dragover','dragenter'].forEach(ev => zone.addEventListener(ev, e => { e.preventDefault(); zone.style.outline = '1px dashed var(--accent, #5af)'; }));
  ['dragleave','drop'].forEach(ev => zone.addEventListener(ev, e => { e.preventDefault(); zone.style.outline = ''; }));
  zone.addEventListener('drop', e => { if (e.dataTransfer?.files?.length) ingestDroppedFiles(e.dataTransfer.files); });
})();

async function ingestDroppedFiles(fileList) {
  const files = Array.from(fileList);
  if (!files.length) return;
  try {
    const payload = await Promise.all(files.map(f => new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve({ path: f.name, bytes: f.size, content: r.result });
      r.onerror = reject;
      r.readAsText(f);
    })));
    const name = files.length === 1 ? files[0].name.replace(/\.[^/.]+$/, '') : `drop-${Date.now()}`;
    const res = await api('/api/repos', { method: 'POST', body: JSON.stringify({ name, files: payload, source: 'drop', ideaUuid: CURRENT_REPO_IDEA }) });
    toast(`ingested "${name}" as repo (${payload.length} file${payload.length>1?'s':''})${CURRENT_REPO_IDEA?' — attached to this idea':''}`, 'ok');
    await loadApiRepos();
    if (CURRENT_REPO_IDEA) { const r = API_REPOS.find(x=>x.ideaUuid===CURRENT_REPO_IDEA); renderApiRepoPanel(r); }
  } catch (e) { toast(`ingest failed: ${e.message}`, 'err'); }
}
async function walkDir(dirHandle, prefix) {
  for await (const [name, handle] of dirHandle.entries()) {
    if (name === 'node_modules' || name === '.git') continue;
    const p = prefix ? prefix + '/' + name : name;
    if (handle.kind === 'file') REPO_FILES.push({ path:p, handle });
    else await walkDir(handle, p);
  }
}
function buildTree(files) {
  const root = {};
  for (const f of files) {
    const parts = f.path.split('/');
    let node = root;
    for (let i=0;i<parts.length;i++) {
      const part = parts[i];
      if (i === parts.length-1) { node[part] = { __file: f }; }
      else { node[part] = node[part] || {}; node = node[part]; }
    }
  }
  return root;
}
function renderFileTree() {
  const tree = document.getElementById('file-tree');
  if (!REPO_FILES.length) { tree.innerHTML = `<div class="repo-empty">no repository loaded<br><br><button class="modal-btn confirm" onclick="pickLocalRepo()">open local nexus folder</button></div>`; return; }
  const root = buildTree(REPO_FILES);
  tree.innerHTML = renderTreeNode(root, 0);
}
function renderTreeNode(node, depth) {
  let html = '';
  const keys = Object.keys(node).sort((a,b)=>{
    const aDir = !node[a].__file, bDir = !node[b].__file;
    if (aDir !== bDir) return aDir ? -1 : 1;
    return a.localeCompare(b);
  });
  for (const key of keys) {
    const val = node[key];
    const indent = `<span class="tree-indent" style="width:${depth*14}px"></span>`;
    if (val.__file) {
      const f = val.__file;
      html += `<div class="tree-node file${ACTIVE_FILE===f.path?' active':''}" onclick="openFile('${f.path.replace(/'/g,"\\'")}')">${indent}📄 ${escapeHtml(key)}</div>`;
    } else {
      html += `<div class="tree-node dir">${indent}📁 ${escapeHtml(key)}</div>` + renderTreeNode(val, depth+1);
    }
  }
  return html;
}
async function openFile(path) {
  const entry = REPO_FILES.find(f=>f.path===path);
  if (!entry) return;
  ACTIVE_FILE = path;
  renderFileTree();
  document.getElementById('ide-tabs').textContent = path;
  try {
    const file = await entry.handle.getFile();
    if (file.size > 400000) { document.getElementById('ide-code').textContent = `// file too large to preview inline (${file.size} bytes)`; return; }
    const text = await file.text();
    const lines = text.split('\n');
    document.getElementById('ide-code').innerHTML = lines.map((l,i)=>`<span class="ln">${i+1}</span>${escapeHtml(l)}`).join('\n');
  } catch(e) {
    document.getElementById('ide-code').textContent = `// could not read file: ${e.message}`;
  }
}

// ════════════════════════════════════════════════════
// VERSIONIUM — real snapshot history (commitId, tensionMap, phaseMap, snr)
// ════════════════════════════════════════════════════
function renderVersionium() {
  const list = document.getElementById('commit-list');
  if (!SNAPSHOTS.length) { list.innerHTML = `<div class="detail-empty">${CONNECTED?'no snapshots yet — push one from the Ideas view':'not connected to nexus'}</div>`; return; }
  list.innerHTML = SNAPSHOTS.map(s => `
    <div class="commit-card" onclick="selectSnapshot('${s.uuid}')">
      <div class="commit-id">${s.commitId} <span style="color:var(--text3)">· ${s.branch||'main'}</span></div>
      <div class="commit-msg">${escapeHtml(s.message)}</div>
      <div class="commit-stats">
        <span>${new Date(s.ts).toLocaleString()}</span>
        <span>${s.ideasCount} ideas</span>
        <span>${s.gapCount} open gaps</span>
        <span>${s.specCount} specs</span>
        <span style="color:${s.snrDelta>0?'var(--mint)':s.snrDelta<0?'var(--coral)':'var(--text3)'}">snr ${s.snr!=null?s.snr.toFixed?s.snr.toFixed(2):s.snr:'—'} (${s.snrDelta>0?'+':''}${s.snrDelta||0})</span>
      </div>
    </div>
  `).join('');
}
function selectSnapshot(uuid) {
  SELECTED_SNAP = uuid;
  const s = SNAPSHOTS.find(x=>x.uuid===uuid);
  if (!s) return;
  const area = document.getElementById('versionium-detail');
  const phaseRows = Object.entries(s.phaseMap||{}).map(([p,n])=>`<div class="pend-row" style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid var(--b0)"><span style="font-family:var(--mono);font-size:9px;color:var(--text3)">${p}</span><span style="font-family:var(--mono);font-size:10px">${n}</span></div>`).join('');
  const tensionRows = Object.entries(s.tensionMap||{}).slice(0,12).map(([uuid,t])=>{
    const idea = IDEAS.find(i=>i.uuid===uuid);
    return `<div class="link-item"><span>${escapeHtml(idea?(idea.text||'').slice(0,28):uuid.slice(0,8))}</span><span style="margin-left:auto;font-family:var(--mono);font-size:10px">${(t*100).toFixed(0)}%</span></div>`;
  }).join('');
  area.innerHTML = `
    <div class="ds"><div class="ds-label">commit</div><div class="ds-mono">${s.commitId}\nbranch ${s.branch||'main'}\nparent ${s.parentId?s.parentId.slice(0,8):'—'}\n${new Date(s.ts).toLocaleString()}</div></div>
    <div class="ds"><div class="ds-label">message</div><div class="ds-value">${escapeHtml(s.message)}</div></div>
    <div class="ds"><div class="ds-label">phase distribution</div>${phaseRows||'<span style="color:var(--text3);font-size:10px">—</span>'}</div>
    <div class="ds"><div class="ds-label">tension at commit</div>${tensionRows||'<span style="color:var(--text3);font-size:10px">—</span>'}</div>
    <div class="ds"><div class="ds-label">actions</div><div class="action-row"><button class="action-btn primary" onclick="diffWithPrevious('${s.uuid}')">diff vs parent</button></div></div>
  `;
}
async function diffWithPrevious(uuid) {
  const s = SNAPSHOTS.find(x=>x.uuid===uuid);
  if (!s || !s.parentId) { toast('no parent snapshot to diff against','err'); return; }
  try {
    const res = await api(`/api/snapshots/${s.parentId}/diff/${uuid}`);
    toast('diff loaded — see console','ok');
    console.log('snapshot diff', res);
  } catch(e) { toast(e.message,'err'); }
}

// ════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════
function escapeHtml(s){ return String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function toast(msg, type='ok') {
  const area = document.getElementById('toast-area');
  const div = document.createElement('div');
  div.className = `toast ${type}`;
  div.textContent = msg;
  area.appendChild(div);
  setTimeout(()=>div.remove(), 2800);
}
document.addEventListener('keydown', e => {
  if (e.key==='Escape') closeModal();
  if ((e.metaKey||e.ctrlKey) && e.key==='n') { e.preventDefault(); setView('ideas'); openModal(); }
});

// ════════════════════════════════════════════════════
// INIT — no seed data. Connect to real nexus, render empty states until then.
// ════════════════════════════════════════════════════
window.addEventListener('load', () => {
  renderIdeaList(); renderSpecList(); renderVersionium(); renderArchitect(); renderBrainstorms();
  updateStats();
  nexusConnect();
  setInterval(() => { if (CONNECTED) loadStats(); else nexusConnect(); }, 15000);
});
