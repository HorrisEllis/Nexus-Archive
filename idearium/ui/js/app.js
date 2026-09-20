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

async function api(path, opts={}, timeoutMs=6000) {
  if (!API_BASE) throw new Error('not connected to nexus');
  const r = await fetchTimeout(API_BASE + path, { headers:{'Content-Type':'application/json'}, ...opts }, timeoutMs);
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
  // §BUG FIXED 2026-07-11 — found via loom's wire-endpoints sweep (checking
  // every os.emit(...) against what actually listens for it): two event-
  // naming conventions coexist in idearium — bare ('spec.created',
  // 'idea.updated', matching this dispatcher's original startsWith checks)
  // and 'idearium.'-prefixed ('idearium.spec.built', 'idearium.spec.
  // compiled', 'idearium.spec.imported', 'idearium.spec.promoted',
  // 'idearium.queue.progress', 'idearium.repo.file.write/.delete'). Every
  // event using the second convention silently triggered no UI refresh at
  // all — not because refreshOnEvent had a bug in its logic, but because
  // it only ever recognized the first convention's prefixes. Strip an
  // optional leading 'idearium.' before matching so both conventions work
  // the same way, instead of adding one narrow special case per event
  // every time this happens again.
  const t = ev.type.startsWith('idearium.') ? ev.type.slice('idearium.'.length) : ev.type;
  if (t.startsWith('idea.'))   { loadIdeas(); }
  if (t.startsWith('gap.'))    { loadGaps(); }
  // §BUG FIXED 2026-07-15 — spec-engine's own chunk events are named
  // 'idearium.spec-engine.chunk.complete'/'.queued', which — unlike every
  // 'idearium.spec.*' event — does NOT start with 'spec.' (it's
  // 'spec-engine.', a hyphen not a dot). Those events silently fell through
  // every branch below and never refreshed anything, same class of bug as
  // the 2026-07-11 fix above this function.
  if (t.startsWith('spec.') || t.startsWith('spec-engine.')) { loadSpecs(); }
  // §FIX 2026-09-15 — James: "idearium needs to fail when chunks aren't
  // being generated." The backend now emits a real 'idearium.error' (and
  // 'idearium.spec-engine.build.stalled') when a spec's chunks are stuck
  // FAILED/ESCALATED with nothing left to dispatch — appendEventLog above
  // already logs it, but the log panel is easy to miss mid-session; a
  // stalled build deserves the same loud, impossible-to-miss toast() any
  // user-initiated failure already gets, not just a quiet log line.
  if (t === 'error' || t.startsWith('spec-engine.build.stalled')) { toast(ev.payload?.reason || 'a spec build stalled — see event log', 'err'); }
  if (t==='push.complete')     { loadSnapshots(); }
  if (t==='snr.update')        { loadStats(); }
  if (t.startsWith('repo.')) {
    loadApiRepos().then(() => {
      if (CURRENT_API_REPO && ev.payload?.repoUuid === CURRENT_API_REPO.uuid) {
        const fresh = API_REPOS.find(r => r.uuid === CURRENT_API_REPO.uuid);
        if (fresh) { CURRENT_API_REPO = fresh; renderApiRepoPanel(fresh); }
      }
    });
  }
  if (t.startsWith('queue.'))  { if (typeof loadStats === 'function') loadStats(); }
}

// ════════════════════════════════════════════════════
// STATE — populated only from real Nexus data, never seeded
// ════════════════════════════════════════════════════
let IDEAS=[], GAPS=[], SPECS=[], SNAPSHOTS=[], STATS=null;
let SELECTED=null, SELECTED_SPEC=null, SELECTED_SNAP=null;
let CURRENT_SORT='tension';
let BRAINSTORMS = [];  // §CHANGED 2026-09-03 — was JSON.parse(localStorage...); loaded from data/ via loadBrainstorms() below, matching every other real state in this file.
const IDEA_PHASES   = ['seed','expanding','tensioned','specced','building','complete','archived'];
const GAP_SEVERITIES= ['fatal','high','medium','low'];
const LINK_TYPES    = ['resonance','tension','causal','temporal','semantic'];
const SECTION_IDS   = ['intent','api_callto','module_hooks','cli_spec','schemas','gap_contract','failure_modes','tests','phase_map'];

async function loadAll() {
  await Promise.all([loadIdeas(), loadGaps(), loadSpecs(), loadSnapshots(), loadStats(), loadApiRepos(), loadBrainstorms()]);
}
// §BUILT 2026-09-03 — real data/-backed load, replacing the old
// localStorage.getItem at module-load time. Same shape (array of
// {uuid,text,tags,ts,promoted}), sourced from the real idearium_brainstorms
// JAA table now, not the browser.
async function loadBrainstorms() { try { BRAINSTORMS = (await api('/api/brainstorms')).brainstorms || []; renderBrainstorms(); updateStats(); } catch(e){ console.warn('[idearium] loadBrainstorms failed:', e.message); } }
async function loadIdeas()    { try { IDEAS = (await api('/api/ideas')).ideas || []; renderIdeaList(); if(SELECTED){const i=IDEAS.find(x=>x.uuid===SELECTED); if(i) renderDetail(i);} } catch(e){ console.warn('[idearium] loadIdeas failed:', e.message); toast('failed to load ideas: '+e.message,'err'); } }
async function loadGaps()     { try { GAPS  = (await api('/api/gaps')).gaps  || []; renderIdeaList(); } catch(e){ console.warn('[idearium] loadGaps failed:', e.message); } }
// §BUG FIXED 2026-07-15 — loadIdeas() re-renders the open idea detail panel
// on every refresh (see the line above); loadSpecs() never did the same for
// an open spec builder. An SSE-driven chunk/build event updated the spec
// list and status chips but left a currently-open builder panel showing
// stale chunk statuses until the user reselected the spec by hand.
async function loadSpecs()    { try { SPECS = (await api('/api/specs')).specs|| []; renderSpecList(); renderArchitect(); if (SELECTED_SPEC) { const s = SPECS.find(x=>x.uuid===SELECTED_SPEC); if (s) renderSpecBuilder(s); } } catch(e){ console.warn('[idearium] loadSpecs failed:', e.message); toast('failed to load specs: '+e.message,'err'); } }
async function loadSnapshots(){ try { SNAPSHOTS = (await api('/api/snapshots')).snapshots || []; renderVersionium(); } catch(e){ console.warn('[idearium] loadSnapshots failed:', e.message); } }
async function loadStats()    { try { STATS = (await api('/api/stats')).stats; } catch(e){ console.warn('[idearium] loadStats failed:', e.message); } updateStats(); }
// Ideas/Repo merge: repos are no longer their own rail tab — they're looked
// up by ideaUuid/specUuid from idea/spec detail panels. API_REPOS is the
// client-side cache loadAll() refreshes alongside everything else.
let API_REPOS = [];
async function loadApiRepos() {
  try {
    API_REPOS = (await api('/api/repos')).repos || [];
    renderRepoLibrary();
    if (CURRENT_API_REPO) {
      const fresh = API_REPOS.find(r => r.uuid === CURRENT_API_REPO.uuid);
      if (fresh) { CURRENT_API_REPO = fresh; renderApiRepoPanel(fresh); }
    }
  } catch(e){ console.warn('[idearium] loadApiRepos failed:', e.message); }
}

// §NEW 2026-07-15 — chunk retry trail + build artifacts for a spec-engine
// spec, read from speceng.show's `history` block. Kept out of SPECS/loadSpecs
// entirely: it's per-spec detail, not list data, and fetching it for every
// spec on every list refresh would be wasted work for specs nobody has open.
// Fetched lazily by renderSpecHistoryPanel() only while that spec's builder
// panel is actually mounted, and rendered into its own sub-panel so a slow
// or failed history fetch never blocks the chunk list/action row above it
// (already-known synchronous data) from showing immediately.
let SPEC_HISTORY = {};
let _historyFetchInFlight = new Set();

async function renderSpecHistoryPanel(specUuid) {
  if (_historyFetchInFlight.has(specUuid)) return;
  _historyFetchInFlight.add(specUuid);
  try {
    const res = await api(`/api/spec-engine/specs/${specUuid}`);
    SPEC_HISTORY[specUuid] = res.history || { chunkEvents: [], buildArtifacts: [] };
  } catch (e) {
    console.warn('[idearium] history fetch failed:', e.message);
    SPEC_HISTORY[specUuid] = SPEC_HISTORY[specUuid] || { chunkEvents: [], buildArtifacts: [] };
  } finally {
    _historyFetchInFlight.delete(specUuid);
  }
  // The user may have navigated to a different spec (or away entirely)
  // while this was in flight — only touch the DOM if it's still relevant.
  if (SELECTED_SPEC !== specUuid) return;
  const panel = document.getElementById('spec-history-panel');
  if (panel) panel.innerHTML = buildSpecHistoryHtml(specUuid);
  const badge = document.getElementById('spec-compiled-badge');
  if (badge) badge.outerHTML = buildCompiledBadgeHtml(specUuid);
}

function buildCompiledBadgeHtml(specUuid) {
  const hist = SPEC_HISTORY[specUuid];
  if (!hist) return `<span id="spec-compiled-badge" style="font-family:var(--mono);font-size:9px;color:var(--text3)">checking build status…</span>`;
  const latest = (hist.buildArtifacts || [])[0]; // [0] = most recent, per _specHistory's sort
  if (!latest) return `<span id="spec-compiled-badge" style="font-family:var(--mono);font-size:9px;color:var(--text3)">not compiled yet</span>`;
  if (latest.ok) {
    return `<span id="spec-compiled-badge" style="font-family:var(--mono);font-size:9px;color:var(--mint)">✓ compiled · ${escapeHtml(latest.extraction||'')}${latest.agent?` · ${escapeHtml(latest.agent)}`:''}</span>`;
  }
  return `<span id="spec-compiled-badge" style="font-family:var(--mono);font-size:9px;color:var(--coral)" title="${escapeHtml(latest.error||'')}">✗ compile failed — ${escapeHtml((latest.error||'unknown error').slice(0,70))}</span>`;
}

function buildSpecHistoryHtml(specUuid) {
  const hist = SPEC_HISTORY[specUuid];
  if (!hist) return `<div style="font-family:var(--mono);font-size:10px;color:var(--text3);padding:6px 0">loading history…</div>`;
  const { chunkEvents=[], buildArtifacts=[] } = hist;
  if (!chunkEvents.length && !buildArtifacts.length) {
    return `<div style="font-family:var(--mono);font-size:10px;color:var(--text3);padding:6px 0">no build history yet</div>`;
  }
  const fmtTime = ts => ts ? new Date(ts).toLocaleString() : '—';
  const artifactsHtml = buildArtifacts.map(a => `
    <div style="display:flex;align-items:center;gap:8px;font-family:var(--mono);font-size:10px;padding:4px 0;border-bottom:1px solid var(--b0)">
      <span style="color:${a.ok?'var(--mint)':'var(--coral)'}">${a.ok?'✓':'✗'}</span>
      <span style="flex:1;color:var(--text2)">${escapeHtml(a.extraction||'—')}${a.agent?` · ${escapeHtml(a.agent)}`:''}${a.error?` · ${escapeHtml(a.error.slice(0,80))}`:''}</span>
      <span style="color:var(--text3);flex-shrink:0">${fmtTime(a.ts)}</span>
    </div>`).join('');
  const eventsHtml = chunkEvents.map(e => `
    <div style="display:flex;align-items:center;gap:8px;font-family:var(--mono);font-size:10px;padding:3px 0;border-bottom:1px solid var(--b0)">
      <span style="color:${e.cacheHit?'var(--mint)':'var(--amber)'}" title="${e.cacheHit?'cache/reuse hit':'built'}">${e.cacheHit?'⚡':'●'}</span>
      <span style="flex:1;color:var(--text2)">${escapeHtml(e.sectionId||'')}</span>
      <span style="color:var(--text3)">${escapeHtml(e.source||'')}${e.reusedFrom?' (reused)':''}${e.cost!=null?` · ${e.cost} tok`:''}</span>
      <span style="color:var(--text3);flex-shrink:0">${fmtTime(e.ts)}</span>
    </div>`).join('');
  return `
    <details style="margin-top:4px" ${buildArtifacts.length?'open':''}>
      <summary style="cursor:pointer;font-family:var(--mono);font-size:10px;color:var(--text2)">build artifacts (${buildArtifacts.length})</summary>
      ${artifactsHtml || `<div style="font-family:var(--mono);font-size:10px;color:var(--text3);padding:4px 0">none yet</div>`}
    </details>
    <details style="margin-top:8px">
      <summary style="cursor:pointer;font-family:var(--mono);font-size:10px;color:var(--text2)">chunk history (${chunkEvents.length}${chunkEvents.length===200?'+':''})</summary>
      ${eventsHtml || `<div style="font-family:var(--mono);font-size:10px;color:var(--text3);padding:4px 0">none yet</div>`}
    </details>
  `;
}


function updateStats() {
  document.getElementById('stat-ideas').textContent = IDEAS.filter(i=>i.phase!=='archived').length || 0;
  document.getElementById('stat-gaps').textContent  = GAPS.filter(g=>g.status==='open').length || 0;
  document.getElementById('stat-specs').textContent = SPECS.length || 0;
  document.getElementById('stat-snr').textContent    = STATS && STATS.snr!=null ? STATS.snr.toFixed ? STATS.snr.toFixed(2) : STATS.snr : '—';
  document.getElementById('brain-count-badge').textContent = `${BRAINSTORMS.length} entries`;
  document.getElementById('spec-count-badge').textContent  = `${SPECS.length} specs`;
  document.getElementById('snap-btn').disabled = !CONNECTED;
}

// ════════════════════════════════════════════════════
// VIEW SWITCHING + NAV RAIL
// ════════════════════════════════════════════════════
function setView(v) {
  document.querySelectorAll('.view').forEach(el=>el.classList.toggle('active', el.id==='view-'+v));
  document.querySelectorAll('.tab-btn, .tab-sub').forEach(b=>b.classList.toggle('active', b.dataset.view===v));
  document.querySelectorAll('.tab-group').forEach(g=>{
    const groupBtn = g.querySelector('.tab-group-btn');
    const views = (groupBtn?.dataset.views || '').split(',');
    if (groupBtn) groupBtn.classList.toggle('active', views.includes(v));
    g.classList.remove('open');
  });
  // Clicking the Repos tab itself always lands on the landing grid, even if
  // a repo was left open last visit — openRepoFor() (idea/spec → repo) is
  // the only path that should skip straight to detail mode.
  if (v === 'repo') { exitRepoDetail(); }
}

// Top-tab subnav dropdowns (Create ▾ / Build ▾) — hover works via CSS,
// this adds click/tap support (touch + keyboard-driven clicks) on top of it.
function toggleTabGroup(e, btn) {
  e.stopPropagation();
  const group = btn.closest('.tab-group');
  document.querySelectorAll('.tab-group').forEach(g => { if (g !== group) g.classList.remove('open'); });
  group.classList.toggle('open');
}
document.addEventListener('click', () => {
  document.querySelectorAll('.tab-group.open').forEach(g => g.classList.remove('open'));
});

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
// §NEW 2026-07-16 — nothing on disk is destroyed (spec-engine/index.js's
// deleteSpec just flips a flag — same §7.4/§M1 pattern as archiveIdea
// above), so this doesn't need a themedPrompt reason like archiveIdea does.
// A plain confirm() is enough since it's reversible via restoreSpec.
async function deleteSpec(uuid, name) {
  if (!confirm(`remove "${name}" from the spec library?\n\nnothing on disk is deleted — this can be undone.`)) return;
  try {
    await api(`/api/spec-engine/specs/${uuid}`, { method: 'DELETE' });
    if (SELECTED_SPEC === uuid) {
      SELECTED_SPEC = null;
      document.getElementById('spec-builder').innerHTML = '<div class="detail-empty">select or create a spec to open the builder</div>';
    }
    toast('removed from library', 'ok');
    await loadSpecs();
  } catch(e) { toast(e.message, 'err'); }
}
async function restoreSpec(uuid) {
  try { await api(`/api/spec-engine/specs/${uuid}/restore`, { method: 'POST' }); toast('restored', 'ok'); await loadSpecs(); }
  catch(e) { toast(e.message, 'err'); }
}
// §NEW 2026-07-16 — legacy specs (no .chunks — the pre-spec-engine
// 9-section format) live in a different store than deleteSpec() above
// covers, and follow the same §M1 "reason required, nothing deleted"
// convention as archiveIdea. Separate function because the requirement
// (reason) and the endpoint (/api/specs, not /api/spec-engine/specs) both
// differ from the spec-engine path.
async function archiveSpec(uuid, name) {
  const reason = await themedPrompt('archive reason (required — §M1, nothing deleted):', `archive "${name}"`);
  if (!reason) return;
  try {
    await api(`/api/specs/${uuid}`, { method: 'DELETE', body: JSON.stringify({reason}) });
    if (SELECTED_SPEC === uuid) {
      SELECTED_SPEC = null;
      document.getElementById('spec-builder').innerHTML = '<div class="detail-empty">select or create a spec to open the builder</div>';
    }
    toast('archived', 'ok');
    await loadSpecs();
  } catch(e) { toast(e.message, 'err'); }
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
// BRAINSTORM — quick-capture (genuinely user-authored, not seeded),
// promotable into a real tracked idea via POST /api/ideas.
// §CHANGED 2026-09-03 — James: "idearium needs to use data folder. no DOM
// storage." Was entirely localStorage; every write now goes through the
// real idearium_brainstorms table (api/index.js's brainstorm.* handlers).
// Same UX, same function names, real backend underneath.
// ════════════════════════════════════════════════════
async function addBrainstorm() {
  const text = document.getElementById('brain-text').value.trim();
  if (!text) { toast('write something first','err'); return; }
  const tags = document.getElementById('brain-tags').value.split(',').map(t=>t.trim()).filter(Boolean);
  try {
    await api('/api/brainstorms', { method: 'POST', body: JSON.stringify({ text, tags }) });
    document.getElementById('brain-text').value=''; document.getElementById('brain-tags').value='';
    await loadBrainstorms();
  } catch(e) { toast(e.message, 'err'); }
}
async function deleteBrainstorm(id) {
  try { await api(`/api/brainstorms/${id}`, { method: 'DELETE' }); await loadBrainstorms(); }
  catch(e) { toast(e.message, 'err'); }
}
async function promoteBrainstorm(id) {
  if (!CONNECTED) { toast('connect to nexus to promote','err'); return; }
  try {
    await api(`/api/brainstorms/${id}/promote`, { method: 'POST' });
    await loadBrainstorms();
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
        ${b.promoted ? `<span class="ic-tag" style="color:var(--mint)">promoted ✓</span>` : `<button class="action-btn primary" onclick="promoteBrainstorm('${b.uuid}')">promote → idea</button>`}
        <button class="action-btn" onclick='openNewSpecModal({name:${JSON.stringify(b.text.slice(0,60))}, description:${JSON.stringify(b.text)}})'>+ spec</button>
        <button class="action-btn danger" onclick="deleteBrainstorm('${b.uuid}')">discard</button>
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
    // §NEW 2026-07-16 — quick delete right on the card, not just inside the
    // builder. `.chunks` is the same origin discriminator renderSpecBuilder
    // uses (§BUG FIXED 2026-07-11) — legacy specs aren't spec-engine
    // manifests and deleteSpec's DELETE route only knows about those, so the
    // button only shows where it'll actually work.
    // §FIXED 2026-07-16 — this used to only render for spec-engine specs
    // (`.chunks` present), which is exactly why deleting the legacy
    // e2e-check-spec/test junk (no .chunks — old 9-section format) had no
    // button anywhere. Both origins get one now, routed to the function
    // that matches their actual store.
    const delBtn = spec.chunks
      ? `<button class="action-btn danger" style="padding:1px 6px;font-size:9px" onclick="event.stopPropagation(); deleteSpec('${spec.uuid}', '${escapeHtml(spec.name).replace(/'/g,"\\'").slice(0,40)}')">×</button>`
      : `<button class="action-btn danger" style="padding:1px 6px;font-size:9px" onclick="event.stopPropagation(); archiveSpec('${spec.uuid}', '${escapeHtml(spec.name).replace(/'/g,"\\'").slice(0,40)}')">×</button>`;
    return `
      <div class="spec-card${SELECTED_SPEC===spec.uuid?' selected':''}" onclick="selectSpec('${spec.uuid}')">
        <div class="spec-card-top">
          <span class="spec-name">${escapeHtml(spec.name)}</span>
          <span style="display:flex;align-items:center;gap:6px">
            <span class="ic-status st-${spec.phase}">${spec.phase}</span>
            ${delBtn}
          </span>
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
  // §BUG FIXED 2026-07-11 — every spec in SPECS renders through this
  // function regardless of origin, but saveSection/checkSpec/buildSpec
  // below all call the LEGACY-only /api/specs/:uuid/* endpoints. A
  // spec-engine spec's uuid was never in os.db.specs, so those calls
  // either 404'd or silently did nothing — the action buttons looked
  // present and did nothing real. `.chunks` only exists on spec-engine
  // manifests (spec.list's merge spreads the raw manifest in) — use it
  // as the discriminator and render a genuinely different, working
  // action row for that case instead of the legacy one.
  if (Array.isArray(spec.chunks)) return renderSpecEngineBuilder(spec);

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
        <button class="action-btn danger" onclick="archiveSpec('${spec.uuid}', '${escapeHtml(spec.name).replace(/'/g,"\\'").slice(0,40)}')">archive</button>
      </div>
    </div>
  `;
}
// §NEW 2026-07-11 — the working action row for a spec-engine spec: real
// chunk status (not the legacy 9-section grid), a build-all-and-promote
// one-click flow ("have it build the repository — end-state"), and an
// open-repository link once one exists. Read-only chunk list for now —
// spec-engine chunks are agent/template-built, not hand-edited inline
// the way legacy sections are; editing an individual chunk's content is
// a real follow-up, not something this pass claims to do.
function renderSpecEngineBuilder(spec) {
  const wrap = document.getElementById('spec-builder');
  const chunks = spec.chunks || [];
  const done = chunks.filter(c => c.status === 'complete').length;
  const pct = chunks.length ? Math.round(done / chunks.length * 100) : 0;
  // §CHANGED 2026-09-03 — was `r.promotedFromSpec === spec.uuid`, which
  // only matches repos created via the completion-gated /promote path.
  // Repo-first shells (created at spec creation, submitNewSpec above) set
  // specUuid but never promotedFromSpec — specUuid is the real, always-set
  // correlation field either way (RepoLayer.ingest sets it on every path),
  // so it's the correct match regardless of how the repo came to exist.
  const repo = API_REPOS.find(r => r.specUuid === spec.uuid);
  const building = !!BUILD_IN_PROGRESS[spec.uuid];

  wrap.innerHTML = `
    <div class="builder-body">
      <div class="ds" style="margin-bottom:0">
        <div class="ds-label" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <span>spec-engine — ${escapeHtml((spec.templateIds||[]).join(', ') || 'no template')} · build logic: ${escapeHtml(spec.buildEngine||'auto')}</span>
          ${buildCompiledBadgeHtml(spec.uuid)}
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="tension-track" style="flex:1;height:6px"><div class="tension-fill" style="width:${pct}%;background:${pct===100?'var(--mint)':'var(--amber)'}"></div></div>
          <span style="font-family:var(--mono);font-size:12px;font-weight:600">${done}/${chunks.length}</span>
        </div>
      </div>
      <div class="field-group">
        <div class="field-label">chunks</div>
        <div style="display:flex;flex-direction:column;gap:4px">
          ${chunks.map(c => `
            <div style="display:flex;align-items:center;gap:8px;font-family:var(--mono);font-size:11px;padding:4px 0;border-bottom:1px solid var(--b0)">
              <span style="color:${c.status==='complete'?'var(--mint)':c.status==='building'?'var(--amber)':'var(--text3)'}">${c.status==='complete'?'✓':c.status==='building'?'…':'○'}</span>
              <span style="flex:1;color:var(--text2)">${escapeHtml(c.sectionId)}</span>
              ${
                // §BUILT 2026-09-03 — James: "send each chunk to the
                // respectable agent... needs to have a drop for the agent
                // to send it to." Was static text (c.agent||''). Only
                // PENDING chunks are editable — matches setChunkAgent()'s
                // own real refusal (spec-engine/index.js) on anything past
                // PENDING, so the UI never offers a change the backend
                // would reject; a chunk that's already building/complete
                // shows its real, already-fixed agent as text instead.
                c.status === 'pending'
                  ? `<select class="agent-select" style="font-family:var(--mono);font-size:11px;background:var(--bg2,#1a1a1a);color:var(--text2);border:1px solid var(--b0);border-radius:3px;padding:1px 4px" onchange="setChunkAgent('${spec.uuid}','${c.uuid}',this.value)">
                      ${AGENT_OPTIONS.map(a => `<option value="${a}" ${a===c.agent?'selected':''}>${a}</option>`).join('')}
                    </select>`
                  : `<span style="color:var(--text3)">${escapeHtml(c.agent||'')}${c.agentModel&&c.agentModel.startsWith('template')?' (template)':''}</span>`
              }
              ${
                // §BUILT 2026-09-03 — the chunk's own real return address
                // while it's genuinely in flight (jobId/dispatchDir, set
                // by spec-engine's recordDispatchJob the instant a queued
                // job exists on guardian's side). This is the visibility
                // James was asking for: is a 'building' chunk actually
                // moving, or stuck with nothing anyone can see. A chunk
                // still 'building' with no jobId is the local-ollama path
                // (synchronous, no guardian job to track) — shown plainly
                // as 'local', not blank, so the absence reads as real
                // information, not a missed field.
                c.status === 'building'
                  ? `<span title="${c.dispatchDir ? escapeHtml(c.dispatchDir) : ''}" style="color:var(--amber);font-size:10px">${c.jobId ? `job:${escapeHtml(String(c.jobId)).slice(0,10)}` : 'local'}</span>`
                  : ''
              }
            </div>`).join('')}
        </div>
      </div>
      <div class="field-group">
        <div class="field-label">build history</div>
        <div id="spec-history-panel">${buildSpecHistoryHtml(spec.uuid)}</div>
      </div>
      <div class="action-row">
        <button class="action-btn primary" ${building||done===chunks.length?'disabled':''} onclick="createRepoThenBuild('${spec.uuid}')">${building?'building…':(done===chunks.length?'all chunks built':'build remaining chunks')}</button>
        ${
          // §CHANGED 2026-09-03 — repo-first: `repo` is now real from the
          // moment the spec was created (submitNewSpec), not only once
          // every chunk is done, so this shows ALONGSIDE the build button
          // rather than replacing it — the repo is genuinely open-able
          // while chunks are still landing into it.
          repo
            ? `<button class="action-btn" onclick="openRepoFor('${spec.ideaUuid||''}', '${spec.uuid}', '${escapeHtml(spec.name).replace(/'/g,"\\'").slice(0,40)}')">open repository →</button>`
            : ''
        }
        <button class="action-btn" onclick="exportSpec('${spec.uuid}')">export markdown</button>
        <button class="action-btn danger" onclick="deleteSpec('${spec.uuid}', '${escapeHtml(spec.name).replace(/'/g,"\\'").slice(0,40)}')">remove from library</button>
      </div>
    </div>
  `;
  renderSpecHistoryPanel(spec.uuid); // async — fills in the badge + panel above once the fetch resolves
}

// §BUILT 2026-09-03 — real, dispatchable agents (agent-suite/index.js's
// REAL_GUARDIAN_PROVIDERS + the two local paths, ollama/mistral — same
// list buildChunkWithAgent() actually checks against). Not a guess: an
// agent offered here that agent-suite doesn't recognize would be a UI
// promising a destination that doesn't exist.
const AGENT_OPTIONS = ['ollama', 'mistral', 'claude', 'chatgpt', 'gemini', 'perplexity', 'deepseek'];

// §BUILT 2026-09-03 — per-chunk agent reassignment, PENDING chunks only
// (the select in renderSpecEngineBuilder only renders for pending chunks
// in the first place, so this mirrors the backend's own real refusal
// rather than introducing a second place that decides it).
async function setChunkAgent(specUuid, chunkUuid, agent) {
  try {
    await api(`/api/spec-engine/specs/${specUuid}/chunk/${chunkUuid}/agent`, {
      method: 'POST', body: JSON.stringify({ agent }),
    });
    await loadSpecs();
    const spec = SPECS.find(s => s.uuid === specUuid);
    if (spec) renderSpecBuilder(spec);
  } catch (e) { toast(e.message, 'err'); }
}

// specUuid -> true while a build loop is running, so the button can't be
// double-clicked into two concurrent loops.
let BUILD_IN_PROGRESS = {};

// §RENAMED 2026-09-03 — was buildAllAndPromote. Repo-first (submitNewSpec
// creates the repo shell the moment the spec exists, RepoLayer._enrich
// reads live off specUuid) means there is no longer a separate "promote"
// step at the end of a successful build — the repo already IS this spec,
// chunks appear in it as they land. This function's only job now is
// driving the build loop (WARP cache / cross-spec reuse / real per-chunk
// agent dispatch, whichever resolves each chunk) to completion, plus one
// self-heal: a spec created before this change (or whose repo-first call
// failed at creation time) has no repo yet — create it here, once, before
// looping, rather than leaving it permanently repo-less.
async function createRepoThenBuild(specUuid) {
  if (BUILD_IN_PROGRESS[specUuid]) return;
  BUILD_IN_PROGRESS[specUuid] = true;
  selectSpec(specUuid);
  try {
    const spec0 = SPECS.find(s => s.uuid === specUuid);
    const hasRepo = API_REPOS.some(r => r.specUuid === specUuid);
    if (!hasRepo && spec0) {
      try {
        await api('/api/repos', {
          method: 'POST',
          body: JSON.stringify({ name: spec0.name, specUuid, source: 'repo-first' }),
        });
        await loadApiRepos();
      } catch (e) { toast(`repo shell failed, building anyway: ${e.message}`, 'err'); }
    }

    const MAX_STEPS = 40; // generous ceiling — a stuck loop must stop, not spin (§1.2)
    for (let i = 0; i < MAX_STEPS; i++) {
      const spec = SPECS.find(s => s.uuid === specUuid);
      const pending = (spec?.chunks || []).filter(c => c.status !== 'complete');
      if (!pending.length) break;

      const res = await api(`/api/spec-engine/specs/${specUuid}/build`, { method: 'POST', body: JSON.stringify({}) });
      if (res.done) break;
      // building/queued chunks resolve async server-side (SSE-driven) —
      // give it a moment before checking again rather than hammering.
      await new Promise(r => setTimeout(r, 1200));
      await loadSpecs();
      const fresh = SPECS.find(s => s.uuid === specUuid);
      if (fresh) renderSpecBuilder(fresh);
    }

    await loadSpecs();
    const spec = SPECS.find(s => s.uuid === specUuid);
    const stillPending = (spec?.chunks || []).filter(c => c.status !== 'complete' && c.status !== 'building');
    if (stillPending.length) {
      toast(`build stopped — ${stillPending.length} chunk(s) still pending (${stillPending.map(c=>c.sectionId).join(', ')})`, 'err');
      renderSpecBuilder(spec);
      return;
    }

    toast('all chunks built', 'ok');
    await loadApiRepos();
    if (spec?.ideaUuid) await loadIdeas(); // phase just advanced
    openRepoFor(spec?.ideaUuid || null, specUuid, spec?.name || '');
  } catch (e) {
    toast(`build failed: ${e.message}`, 'err');
  } finally {
    BUILD_IN_PROGRESS[specUuid] = false;
    const spec = SPECS.find(s => s.uuid === specUuid);
    if (spec) renderSpecBuilder(spec);
  }
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
function newSpecPrompt() {
  openNewSpecModal();
}

// ════════════════════════════════════════════════════
// NEW SPEC MODAL — template picker (architecture/schemas/checklists/axioms/
// compartments/genesis/...) + WARP build-logic selector, wired to the real
// spec-engine (GET/POST /api/spec-engine/...). "Map to repo now" is not a
// separate backend action — it's create → spec.promote(mode:'manual') in
// one click, which is exactly what the compartments/axioms templates are
// designed for: their seeded chunks (meta/purpose/axioms/integration) are
// enough to promote immediately, everything else lands as a TODO in the
// repo skeleton until a follow-up spec fills it in.
// ════════════════════════════════════════════════════
let NS_TEMPLATES = null;
let NS_IDEA_UUID = null; // set when opened from an idea, so the created repo can be linked later

async function loadNewSpecTemplates() {
  if (NS_TEMPLATES) return NS_TEMPLATES;
  try {
    const r = await api('/api/spec-engine/templates');
    NS_TEMPLATES = r.templates || r.data || r || [];
  } catch (e) { NS_TEMPLATES = []; }
  return NS_TEMPLATES;
}

async function openNewSpecModal({ name = '', description = '', ideaUuid = null } = {}) {
  NS_IDEA_UUID = ideaUuid;
  document.getElementById('ns-name').value = name;
  document.getElementById('ns-description').value = description;
  document.getElementById('ns-build-engine').value = 'auto';

  const templates = await loadNewSpecTemplates();
  const wrap = document.getElementById('ns-templates');
  wrap.innerHTML = templates.map(t => `
    <label style="display:flex;align-items:flex-start;gap:8px;padding:4px 2px;cursor:pointer;font-size:11px;color:var(--text2)">
      <input type="checkbox" class="ns-tpl-check" value="${t.id}" onchange="onNewSpecTemplateChange()" style="margin-top:2px">
      <span><b style="color:var(--text)">${escapeHtml(t.label||t.id)}</b>${t.hasSeed ? ' <span style="color:var(--mint)">· deterministic</span>' : ''}<br>
      <span style="color:var(--text3)">${escapeHtml(t.description||'')}</span></span>
    </label>`).join('');

  document.getElementById('new-spec-modal').classList.add('open');
  document.getElementById('ns-name').focus();
}
function closeNewSpecModal() { document.getElementById('new-spec-modal').classList.remove('open'); }

// ════════════════════════════════════════════════════
// UPLOAD PROJECT — prompt (name/goal, declares the temp compartment's
// end-state) -> spawn temp compartment -> dropzone -> "import repository"
// -> POST /api/project-import/:uuid/finalize (writes manifest.json/
// project.json/.git server-side, resolves the compartment) -> opens the
// repo view. Backed by lib/project-container.js + lib/project-import.config.js
// on the server; nothing about bounds or example goals is hardcoded here —
// UP_INTENT_EXAMPLES is fetched from GET /api/project-import/config.
// ════════════════════════════════════════════════════
let UP_CONTAINER_UUID = null;
let UP_STAGED_FILE = null;

async function openUploadProjectModal() {
  if (!CONNECTED) { toast('not connected to nexus', 'err'); return; }
  document.getElementById('up-name').value = '';
  document.getElementById('up-goal').value = '';
  document.getElementById('up-step-prompt').style.display = '';
  document.getElementById('up-step-drop').style.display = 'none';
  document.getElementById('upload-project-modal').classList.add('open');

  const chips = document.getElementById('up-chips');
  chips.innerHTML = '<span style="font-size:10px;color:var(--text3)">loading…</span>';
  try {
    const cfg = await api('/api/project-import/config');
    chips.innerHTML = '';
    (cfg.intentExamples || []).forEach(text => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'up-chip';
      b.textContent = text;
      b.onclick = () => { document.getElementById('up-goal').value = text; };
      chips.appendChild(b);
    });
  } catch (e) { chips.innerHTML = ''; }
}

function closeUploadProjectModal() {
  document.getElementById('upload-project-modal').classList.remove('open');
}

async function cancelUploadProject() {
  if (UP_CONTAINER_UUID) {
    try { await api(`/api/project-import/${UP_CONTAINER_UUID}/cancel`, { method: 'POST', body: '{}' }); }
    catch (e) { console.warn('[upload-project] cancel failed:', e.message); }
  }
  UP_CONTAINER_UUID = null; UP_STAGED_FILE = null;
  closeUploadProjectModal();
}

async function submitUploadProjectStart() {
  const name = document.getElementById('up-name').value.trim();
  const goal = document.getElementById('up-goal').value.trim();
  if (!name) return toast('project name is required', 'err');
  if (!goal) return toast('a goal is required — it becomes the end-state', 'err');

  try {
    const res = await api('/api/project-import/start', { method: 'POST', body: JSON.stringify({ name, goal }) });
    UP_CONTAINER_UUID = res.containerUuid;
    document.getElementById('up-container-note').textContent =
      `compartment ${res.compartmentId ? res.compartmentId.slice(0, 8) : '—'} open · intent: ${res.intent?.domain || '?'}.${res.intent?.verb || '?'}`;
    document.getElementById('up-step-prompt').style.display = 'none';
    document.getElementById('up-step-drop').style.display = '';
  } catch (e) { toast(`could not start: ${e.message}`, 'err'); }
}

function stageUploadProjectFile(file) {
  if (!file) return;
  if (!/\.zip$/i.test(file.name)) { toast(`not a .zip: ${file.name}`, 'err'); return; }
  UP_STAGED_FILE = file;
  document.getElementById('up-drop-text').textContent = `${file.name} (${formatBytes(file.size)}) — ready`;
  document.getElementById('up-import-btn').disabled = false;
}

async function submitUploadProjectImport() {
  if (!UP_STAGED_FILE || !UP_CONTAINER_UUID) return;
  const btn = document.getElementById('up-import-btn');
  const zone = document.getElementById('up-drop');
  btn.disabled = true;
  document.getElementById('up-drop-text').textContent = 'uploading…';
  if (zone) zone.classList.add('drag');

  let contentBase64;
  try {
    contentBase64 = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result.split(',')[1] || '');
      r.onerror = reject;
      r.readAsDataURL(UP_STAGED_FILE);
    });
  } catch (e) {
    toast(`file read failed: ${e.message}`, 'err');
    btn.disabled = false; if (zone) zone.classList.remove('drag');
    return;
  }

  document.getElementById('up-drop-text').textContent = 'generating manifest, project.json, and .git…';
  let res;
  try {
    res = await api(`/api/project-import/${UP_CONTAINER_UUID}/finalize`, {
      method: 'POST', body: JSON.stringify({ filename: UP_STAGED_FILE.name, contentBase64 }),
    }, 30000);
  } catch (e) {
    toast(`import did not reach the declared end-state: ${e.message}`, 'err');
    btn.disabled = false; if (zone) zone.classList.remove('drag');
    document.getElementById('up-drop-text').textContent = `${UP_STAGED_FILE.name} — ready`;
    return;
  }

  if (zone) zone.classList.remove('drag');
  toast(res.deduped
    ? 'content already exists as an existing repo — reusing it'
    : `imported "${res.repo?.name || ''}" — ${res.fileCount} file(s), ${res.git?.committed ? 'committed' : 'git not committed'}`,
    'ok');

  closeUploadProjectModal();
  const repo = res.repo;
  UP_CONTAINER_UUID = null; UP_STAGED_FILE = null;
  document.getElementById('up-file-input').value = '';

  // The new repo was created after this session's last API_REPOS load —
  // refresh before routing to the repo view, or openRepoFor's match
  // against the in-memory list will miss it.
  await loadApiRepos();
  if (repo) openRepoFor(repo.ideaUuid, repo.specUuid, repo.name);
}


function selectedTemplateIds() {
  return [...document.querySelectorAll('.ns-tpl-check:checked')].map(c => c.value);
}

function onNewSpecTemplateChange() {
  // "map to repo now" only makes sense once the map-first templates
  // (compartments, axioms) are among the selection — showing it for every
  // combination would let someone promote a spec that's really just empty
  // TODOs with a name attached.
  const ids = selectedTemplateIds();
  const mapWorthy = ids.includes('compartments') || ids.includes('axioms');
  document.getElementById('ns-map-btn').style.display = mapWorthy ? '' : 'none';
}

async function submitNewSpec(mapToRepo) {
  const name = document.getElementById('ns-name').value.trim();
  if (!name) { toast('name required', 'err'); return; }
  const description = document.getElementById('ns-description').value.trim();
  const templateIds = selectedTemplateIds();
  const buildEngine = document.getElementById('ns-build-engine').value || 'auto';
  const ideaUuid = NS_IDEA_UUID; // §BUG FIXED 2026-07-11 — was captured on open, never sent

  try {
    const r = await api('/api/spec-engine/specs', {
      method: 'POST',
      body: JSON.stringify({ name, description, templateIds, buildEngine, ideaUuid: ideaUuid || undefined }),
    });
    const manifest = r.manifest || r;
    toast(`spec created${templateIds.length ? ` from [${templateIds.join(', ')}]` : ''} · build logic: ${buildEngine}`, 'ok');

    if (mapToRepo) {
      try {
        const promoted = await api(`/api/spec-engine/specs/${manifest.uuid}/promote`, {
          method: 'POST', body: JSON.stringify({ mode: 'manual' }),
        });
        toast('mapped to repository — compartments/axioms in, rest TODO', 'ok');
        closeNewSpecModal();
        await loadSpecs(); await loadApiRepos();
        if (ideaUuid) await loadIdeas(); // picks up the idea's new phase + linkedSpec
        openRepoFor(ideaUuid || null, manifest.uuid, name);
        return;
      } catch (e) { toast(`spec created, map-to-repo failed: ${e.message}`, 'err'); }
    }

    // §BUILT 2026-09-03 — James: "create a repository, then send each
    // chunk to the respective agent." Every spec now gets a real repo
    // shell the moment it exists — not only once every chunk is done (the
    // explicit "map to repo now" branch above, unchanged, still template-
    // gated). RepoLayer._enrich() always resolves live off specUuid, so
    // this same repo record shows chunks landing as each one completes —
    // no second promote step needed once the build loop below finishes.
    try {
      const repoRes = await api('/api/repos', {
        method: 'POST',
        body: JSON.stringify({ name, specUuid: manifest.uuid, source: 'repo-first', ideaUuid: ideaUuid || undefined }),
      });
      if (repoRes.error) toast(`spec created, repo shell failed: ${repoRes.error}`, 'err');
      else await loadApiRepos();
    } catch (e) {
      // §1.2 loud, non-fatal — the spec is real regardless; a failed repo
      // shell is surfaced, not silently swallowed, and createRepoThenBuild()
      // below self-heals this (creates it late) if the user builds anyway.
      toast(`spec created, repo shell failed: ${e.message}`, 'err');
    }

    closeNewSpecModal();
    await loadSpecs();
    if (ideaUuid) {
      await loadIdeas();
      const idea = IDEAS.find(i => i.uuid === ideaUuid);
      if (idea) renderDetail(idea); // reflect the new phase + linked-spec immediately, not on next reload
    }
  } catch (e) { toast(e.message, 'err'); }
}
function createSpecForIdea(ideaUuid) {
  const idea = IDEAS.find(i=>i.uuid===ideaUuid); if (!idea) return;
  // §BUG FIXED 2026-07-11 — this used to POST straight to the legacy
  // /api/ideas/:uuid/spec path: no template picker, no buildEngine choice,
  // and (separately fixed) that path never advanced idea.phase either.
  // Routing through the same modal Brainstorm/Spec Library use means an
  // idea-originated spec gets the same template composition and repo
  // materialization as any other — one spec-creation path, not two.
  openNewSpecModal({ ideaUuid, name: (idea.text||'spec').slice(0,60), description: idea.text||'' });
}

// ════════════════════════════════════════════════════
// ARCHITECT — blueprint tree derived from real compiled specs
// ════════════════════════════════════════════════════
async function renderArchitect() {
  const wrap = document.getElementById('architect-wrap');
  // §DATA-SOURCE FIX 2026-07-18 — this used to read SPECS (loaded from
  // /api/specs — the LEGACY lightweight spec system: db.specs inside
  // IdeaOS, auto-stub sections with placeholder content, a checklist/
  // wiring tracker, not real content — see idearium/index.js's own header
  // history for "two separate spec systems"). Every node showed "1 chars"
  // because that's genuinely what was there: a stub, not your actual
  // spec-engine chunks. The real content — what you've been editing in
  // the Repository panel — lives entirely in spec-engine's manifests,
  // reached via /api/spec-engine/specs, a completely different store this
  // view never queried. Fixed to read from there instead.
  let realSpecs = [];
  try {
    const r = await api('/api/spec-engine/specs');
    realSpecs = (r.specs || []).filter(s => !s.deleted && s.totalChunks > 0);
  } catch (e) {
    wrap.innerHTML = `<div class="detail-empty">could not load spec-engine specs: ${escapeHtml(e.message)}</div>`;
    return;
  }
  if (!realSpecs.length) { wrap.innerHTML = `<div class="detail-empty">no compiled specs yet — import or build one to see its blueprint here</div>`; return; }
  wrap.innerHTML = `<div class="blueprint-tree">` + realSpecs.map(spec => {
    const children = (spec.chunks || []).map(c => {
      const complete = c.status === 'complete';
      const label = complete ? `${c.byteSize.toLocaleString()}b` : c.status;
      return `
      <div class="bp-node">
        <span class="bp-dot ${complete ? '' : 'gray'}"></span>
        <span class="bp-label">${escapeHtml((c.sectionTitle || c.sectionId || '').replace(/_/g,' '))}</span>
        <span class="bp-meta">${label}</span>
      </div>`;
    }).join('');
    return `
      <div class="bp-node">
        <span class="bp-dot"></span>
        <span class="bp-label" style="font-size:13px;color:var(--sky)">${escapeHtml(spec.name)}</span>
        <span class="bp-meta">${spec.status} · v${spec.version||'1.0.0'} · ${spec.doneChunks}/${spec.totalChunks} chunks · ${(spec.totalBytes||0).toLocaleString()}b total</span>
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
  // Arriving from an idea/spec always lands in detail mode, same as clicking
  // a block — this entry point skips the grid on purpose (already know which
  // repo, or that none exists yet), matching the old pre-grid behavior.
  REPO_DETAIL_OPEN = true;
  document.getElementById('repo-wrap').classList.add('repo-open');
  document.getElementById('repo-back-btn').style.display = '';
  document.getElementById('repo-view-title').textContent = 'Repository';
  document.getElementById('repo-context').textContent = label ? `← ${label}` : '';
  const repo = API_REPOS.find(r =>
    (specUuid && r.promotedFromSpec === specUuid) ||
    (CURRENT_REPO_IDEA && r.ideaUuid === CURRENT_REPO_IDEA) ||
    (specUuid && r.specUuid === specUuid));
  if (repo) selectApiRepo(repo.uuid); else { renderRepoLibrary(); renderApiRepoPanel(null); }
}

// §OVERHAUL 2026-09-17 — the compartment → repo rail. Real grouping on
// repo.compartmentId (idearium/repo/index.js's own real field, §SBP1 —
// see that file's header), not a fabricated hierarchy. Repos with no
// compartmentId (the common case today — most repos are still created
// without one) land in one honestly-labeled "Uncategorized" bucket
// rather than being hidden or given a fake group name.
//
// There is no idearium-side endpoint that resolves a compartmentId to a
// human name (COS's compartment registry — cos/manager.js — is a
// separate subsystem idearium's API never wired a lookup to). Rather
// than invent a name, the group label is the id itself, in the same
// mono/truncated style every other id already appears in across this
// app — an honest identifier, not a guessed label.
let REPO_RAIL_COLLAPSED = new Set(); // compartment keys the user closed (list mode only)
// §BLOCKS-2026-09-19 — James: "repos tab needs to show all repo compartments
// in blocks... click on a repo to actually enter it. like a github repo."
// Two render modes off one state flag: REPO_DETAIL_OPEN=false is the landing
// grid (every compartment, every repo, as a block — this IS the "all repo
// compartments in blocks" ask); true is the compact list used once inside a
// repo, alongside its file tree + editor, so switching repos mid-session
// doesn't force a trip back to the grid.
let REPO_DETAIL_OPEN = false;
function renderRepoLibrary() {
  const body = document.getElementById('repo-rail-body');
  const badge = document.getElementById('repo-count-badge');
  if (badge) badge.textContent = API_REPOS.length ? String(API_REPOS.length) : '';
  body.classList.toggle('block-grid', !REPO_DETAIL_OPEN);
  if (!API_REPOS.length) {
    body.innerHTML = `<div class="repo-rail-empty">no repos yet<br><br>drop files or promote a spec to create one</div>`;
    return;
  }
  const q = (document.getElementById('repo-rail-filter')?.value || '').toLowerCase().trim();
  const groups = new Map(); // compartmentId (or '') -> repos[]
  for (const r of API_REPOS) {
    if (q && !r.name.toLowerCase().includes(q)) continue;
    const key = r.compartmentId || '';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }
  if (!groups.size) { body.innerHTML = `<div class="repo-rail-empty">no repos match "${escapeHtml(q)}"</div>`; return; }
  // Uncategorized last, others by first-repo recency (newest activity first)
  const keys = [...groups.keys()].sort((a, b) => {
    if (!a) return 1; if (!b) return -1;
    return Math.max(...groups.get(b).map(r=>r.updatedAt||0)) - Math.max(...groups.get(a).map(r=>r.updatedAt||0));
  });
  if (!REPO_DETAIL_OPEN) {
    // ── Landing grid: every compartment as a labeled section, every repo
    // in it as a block. No collapsing here — the point is to see all of it.
    body.innerHTML = keys.map(key => {
      const repos = groups.get(key).slice().sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
      const label = key ? key : 'Uncategorized';
      return `
        <div class="repo-grid-group-label">${escapeHtml(label)} · ${repos.length}</div>
        ${repos.map(r => {
          const dotClass = r.phase === 'complete' ? 'done' : (r.phase === 'building' ? 'building' : '');
          return `
          <div class="repo-block" onclick="enterRepoDetail('${r.uuid}')">
            <div class="repo-block-head"><span class="repo-block-icon">⌥</span><span class="repo-block-name" title="${escapeHtml(r.name)}">${escapeHtml(r.name)}</span></div>
            <div class="repo-block-desc">${r.fileCount} files${r.promotedFromSpec ? ' · from spec' : ''}</div>
            <div class="repo-block-meta"><span class="dot ${dotClass}"></span><span>${escapeHtml(r.phase||'idle')}</span></div>
          </div>`;
        }).join('')}`;
    }).join('');
    return;
  }
  // ── Compact list: used once a repo is open, for quick switching ──
  body.innerHTML = keys.map(key => {
    const repos = groups.get(key).slice().sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
    const label = key ? key : 'Uncategorized';
    const collapsed = REPO_RAIL_COLLAPSED.has(key);
    return `
      <div class="compartment-group${collapsed?' collapsed':''}" data-key="${escapeHtml(key)}">
        <div class="compartment-head" onclick="toggleCompartment('${key.replace(/'/g,"\\'")}')">
          <span class="compartment-caret">▾</span>
          <span class="compartment-name" title="${escapeHtml(label)}">${escapeHtml(label)}</span>
          <span class="compartment-count">${repos.length}</span>
        </div>
        <div class="compartment-repos">
          ${repos.map(r => {
            const dotClass = r.phase === 'complete' ? 'done' : (r.phase === 'building' ? 'building' : '');
            return `
            <div class="repo-card${CURRENT_API_REPO && CURRENT_API_REPO.uuid===r.uuid?' active':''}" onclick="selectApiRepo('${r.uuid}')">
              ${dotClass ? `<span class="repo-card-dot ${dotClass}"></span>` : ''}
              <div class="repo-card-body">
                <div class="repo-card-name">${escapeHtml(r.name)}</div>
                <div class="repo-card-meta">${r.fileCount} files · ${escapeHtml(r.phase||'—')}</div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>`;
  }).join('');
}
function toggleCompartment(key) {
  if (REPO_RAIL_COLLAPSED.has(key)) REPO_RAIL_COLLAPSED.delete(key); else REPO_RAIL_COLLAPSED.add(key);
  renderRepoLibrary();
}
// Entering from a grid block: open detail mode (rail collapses to the
// compact list, tree + ide panes reappear), then select the repo as before.
function enterRepoDetail(uuid) {
  REPO_DETAIL_OPEN = true;
  document.getElementById('repo-wrap').classList.add('repo-open');
  document.getElementById('repo-back-btn').style.display = '';
  document.getElementById('repo-view-title').textContent = 'Repository';
  selectApiRepo(uuid);
}
// Back button: return to the landing grid. Closes whatever file was open —
// re-entering a repo always starts from its tree, same as a fresh visit.
function exitRepoDetail() {
  REPO_DETAIL_OPEN = false;
  CURRENT_API_REPO = null; ACTIVE_API_FILE = null; API_FILE_DIRTY = false; CURRENT_REPO_SUBTAB = null;
  document.getElementById('repo-wrap').classList.remove('repo-open');
  document.getElementById('repo-back-btn').style.display = 'none';
  document.getElementById('repo-view-title').textContent = 'Repository Library';
  document.getElementById('repo-context').textContent = '';
  renderRepoLibrary();
}
function selectApiRepo(uuid) {
  const repo = API_REPOS.find(r => r.uuid === uuid);
  if (!repo) return;
  const switchingRepo = CURRENT_API_REPO && CURRENT_API_REPO.uuid !== uuid;
  if (switchingRepo) {
    // switching to a genuinely different repo — any open file belongs to
    // the old one and must close, unlike a same-repo background refresh
    ACTIVE_API_FILE = null; API_FILE_DIRTY = false;
    document.getElementById('ide-tabs').textContent = 'no file open';
    document.getElementById('ide-code').textContent = '// click a file in the tree to open it here';
    _showIdeEditor(false);
  }
  document.getElementById('repo-context').textContent = '';
  renderRepoLibrary(); // refresh active-card highlight
  renderApiRepoPanel(repo);
  // §REPO SUBTABS — a genuinely different repo always lands back on Home,
  // same "always starts fresh" rule the file-tree above already follows.
  // A same-repo refresh (switchingRepo:false, e.g. after loadApiRepos()
  // polls) leaves whichever subtab is currently open alone and just
  // re-renders it, so an open Phasemap/Settings tab doesn't get yanked
  // back to Home every poll cycle.
  if (switchingRepo || !CURRENT_REPO_SUBTAB) setRepoSubtab('home');
  else renderCurrentRepoSubtab();
}

// ════════════════════════════════════════════════════
// §REPO SUBTABS 2026-09-20 — Home / Files / Phasemap / Settings. Each
// panel loads its own data; switching tabs never re-fetches a panel
// that's already showing the current repo (see the *_LOADED_FOR guards
// below) — CURRENT_API_REPO can change out from under an open tab via
// loadApiRepos()'s poll, so every render function re-checks the repo
// uuid itself rather than trusting a stale "already loaded" flag.
// ════════════════════════════════════════════════════
let CURRENT_REPO_SUBTAB = null;

function setRepoSubtab(name) {
  CURRENT_REPO_SUBTAB = name;
  document.querySelectorAll('.repo-subtab-btn').forEach(b => b.classList.toggle('active', b.dataset.subtab === name));
  document.querySelectorAll('.repo-subtab-panel').forEach(p => p.classList.toggle('active', p.id === `repo-subtab-${name}`));
  renderCurrentRepoSubtab();
}

function renderCurrentRepoSubtab() {
  if (!CURRENT_API_REPO) return;
  if (CURRENT_REPO_SUBTAB === 'home') renderRepoHome(CURRENT_API_REPO);
  else if (CURRENT_REPO_SUBTAB === 'files') renderApiRepoPanel(CURRENT_API_REPO);
  else if (CURRENT_REPO_SUBTAB === 'phasemap') renderRepoPhasemap(CURRENT_API_REPO);
  else if (CURRENT_REPO_SUBTAB === 'settings') renderRepoSettings(CURRENT_API_REPO);
}

// ── HOME — the repo's own README/.spec if it has one, else basic identity.
// Real content only: no fabricated summary when neither file exists.
async function renderRepoHome(repo) {
  const el = document.getElementById('repo-subtab-home');
  if (!el) return;
  const homeFile = (repo.files || []).find(f => /(^|\/)readme\.md$/i.test(f.path))
                 || (repo.files || []).find(f => /\.spec$/i.test(f.path));
  const identity = `
    <div class="ds"><div class="ds-label">repository</div><div class="ds-mono">${escapeHtml(repo.name)}\nuuid ${repo.uuid}\nsource ${escapeHtml(repo.source || 'unknown')}${repo.createdAt ? '\n' + new Date(repo.createdAt).toLocaleString() : ''}</div></div>`;
  if (!homeFile) {
    el.innerHTML = identity + `<div class="detail-empty">no README.md or .spec file in this repo yet</div>`;
    return;
  }
  el.innerHTML = identity + `<div class="ds"><div class="ds-label">${escapeHtml(homeFile.path)}</div><div class="ds-mono" id="repo-home-content">loading…</div></div>`;
  try {
    const r = await api(`/api/repos/${repo.uuid}/file?path=${encodeURIComponent(homeFile.path)}`, {}, 15000);
    const target = document.getElementById('repo-home-content');
    // still looking at the same repo/tab? (a fast repo switch mid-fetch
    // must not paint a stale README over the new repo's Home panel)
    if (target && CURRENT_API_REPO?.uuid === repo.uuid && CURRENT_REPO_SUBTAB === 'home') {
      target.textContent = r.content || '(empty file)';
    }
  } catch (e) {
    const target = document.getElementById('repo-home-content');
    if (target) target.textContent = `// could not read ${homeFile.path}: ${e.message}`;
  }
}

// ── PHASEMAP — MCO2's real verification tiers (L0-L8, sync+lazy merged)
// and MCO1's real dependency graph summary. Both are honest about a repo
// that hasn't been through the import pipeline yet (404, shown as such —
// never faked as "all green").
async function renderRepoPhasemap(repo) {
  const el = document.getElementById('repo-subtab-phasemap');
  if (!el) return;
  el.innerHTML = `<div class="detail-empty">loading…</div>`;
  let verification = null, verificationError = null, graph = null, graphError = null;
  try { verification = await api(`/api/repos/${repo.uuid}/verification`, {}, 15000); }
  catch (e) { verificationError = e.message; }
  try { graph = await api(`/api/repos/${repo.uuid}/graph`, {}, 15000); }
  catch (e) { graphError = e.message; }
  // repo switched away while these were in flight — don't paint stale data
  if (CURRENT_API_REPO?.uuid !== repo.uuid || CURRENT_REPO_SUBTAB !== 'phasemap') return;

  const tierRow = (t) => `<div class="pend-row" style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid var(--b0)">
    <span style="font-family:var(--mono);font-size:10px;color:var(--text3)">${escapeHtml(t.level)} · ${escapeHtml(t.name || '')}</span>
    <span style="font-family:var(--mono);font-size:10px;color:${t.status==='not_applicable'?'var(--text3)':t.passed?'var(--mint)':'var(--coral)'}">${t.status==='not_applicable'?'n/a':t.passed?'passed':'failed'}</span>
  </div>`;

  let verificationHtml;
  if (verificationError) {
    verificationHtml = `<div class="detail-empty">${escapeHtml(verificationError)}</div>`;
  } else {
    const tiers = verification.tiers || [];
    const lazyTiers = verification.lazyVerification?.tiers || [];
    const lazyStatus = verification.lazyVerification?.status || 'not scheduled';
    verificationHtml = `
      <div class="ds"><div class="ds-label">verification — synchronous (L0-L5)</div>${tiers.map(tierRow).join('') || '<span style="color:var(--text3);font-size:10px">—</span>'}</div>
      <div class="ds"><div class="ds-label">verification — lazy (L6-L8) · ${escapeHtml(lazyStatus)}</div>${lazyTiers.map(tierRow).join('') || '<span style="color:var(--text3);font-size:10px">pending or not yet scheduled</span>'}</div>`;
  }

  const graphHtml = graphError
    ? `<div class="detail-empty">${escapeHtml(graphError)}</div>`
    : `<div class="ds"><div class="ds-label">dependency graph</div><div class="ds-mono">${graph.nodeCount ?? '—'} nodes\n${graph.edgeCount ?? '—'} edges\n${graph.unresolvedCount ?? 0} unresolved references</div></div>`;

  el.innerHTML = verificationHtml + graphHtml;
}

// ── SETTINGS — compartment (real, MCO6), agent/source provenance, and
// the repo-level actions (add file, fork, export, archive) moved here
// from the file-tree toolbar — these are repo settings, not tree controls.
function renderRepoSettings(repo) {
  const el = document.getElementById('repo-subtab-settings');
  if (!el) return;
  const compartmentLine = repo.compartmentId
    ? `compartment ${repo.compartmentId}`
    : `compartment — none attached`;
  el.innerHTML = `
    <div class="ds"><div class="ds-label">compartment</div><div class="ds-mono">${escapeHtml(compartmentLine)}</div></div>
    <div class="ds"><div class="ds-label">agent / provenance</div><div class="ds-mono">source ${escapeHtml(repo.source || 'unknown')}\nspec ${repo.specUuid || '—'}\nidea ${repo.ideaUuid || '—'}\npromoted from ${repo.promotedFromSpec || '—'}</div></div>
    <div class="ds"><div class="ds-label">repository</div>
      <div class="action-row">
        <button class="action-btn" onclick="addApiRepoFile('${repo.uuid}')">+ add file</button>
        <button class="action-btn" onclick="forkApiRepo('${repo.uuid}')">⑂ fork</button>
        <button class="action-btn" onclick="exportApiRepo()">⇩ export .zip</button>
        <button class="action-btn danger" onclick="archiveApiRepo()">✕ archive</button>
      </div>
    </div>`;
}

// Renders the selected repo as a real, nested, expanded-by-default file
// tree (same path-splitting the server's own RepoLayer.checklist() uses
// — see that method's header — replicated client-side since checklist()
// itself isn't exposed over HTTP; re-derives the exact same tree from
// the same files[] this panel already has). §OVERHAUL 2026-09-17 —
// previously a flat, unnested list of every path (unusable at scale —
// the repo this was built against has 502 files); now a real tree.
let REPO_TREE_COLLAPSED = new Set(); // dir paths the user closed (opt OUT, default open)
function renderApiRepoPanel(repo) {
  const tree = document.getElementById('file-tree');
  if (!ACTIVE_API_FILE) {
    document.getElementById('ide-tabs').textContent = 'no file open';
    document.getElementById('ide-code').textContent = '// click a file in the tree to open it here';
    _showIdeEditor(false);
  }
  if (!repo) {
    tree.innerHTML = `<div class="repo-empty">no repo linked yet<br><br>drop files below to attach one to this idea<br><br><button class="modal-btn confirm" onclick="document.getElementById('repo-drop-input').click()">drop repo files…</button></div>`;
    CURRENT_API_REPO = null; ACTIVE_API_FILE = null;
    return;
  }
  CURRENT_API_REPO = repo;
  const statusLine = repo.localPath
    ? `${repo.materializedCount||repo.fileCount} of ${repo.fileCount} files materialized — <span style="color:var(--mint)">${escapeHtml(repo.localPath)}</span>`
    : (repo.promotedFromSpec ? 'promoted from spec — file structure as components' : 'manifest only — file content isn\'t stored yet');

  // dir path -> { __dir:true, children:{} } | { __dir:false, ...file }
  const root = {};
  for (const f of (repo.files || [])) {
    const parts = f.path.split('/');
    let node = root;
    let acc = '';
    for (let i = 0; i < parts.length - 1; i++) {
      acc = acc ? `${acc}/${parts[i]}` : parts[i];
      node[parts[i]] = node[parts[i]] || { __dir: true, __path: acc, children: {} };
      node = node[parts[i]].children;
    }
    node[parts[parts.length - 1]] = { __dir: false, __path: f.path, ...f };
  }
  const canDelete = !!repo.localPath;
  function renderNode(node, depth) {
    const indent = `<span class="tree-indent" style="width:${depth*14}px"></span>`;
    const entries = Object.entries(node).sort(([a,av],[b,bv]) => {
      if (av.__dir !== bv.__dir) return av.__dir ? -1 : 1; // dirs first
      return a.localeCompare(b);
    });
    let html = '';
    for (const [name, entry] of entries) {
      if (entry.__dir) {
        const collapsed = REPO_TREE_COLLAPSED.has(entry.__path);
        html += `<div class="tree-node dir tree-dir${collapsed?' collapsed':''}" onclick="toggleTreeDir('${entry.__path.replace(/'/g,"\\'")}')">${indent}<span class="tree-caret">▾</span>📁 ${escapeHtml(name)}</div>`;
        html += `<div class="tree-children">${renderNode(entry.children, depth+1)}</div>`;
      } else {
        const active = ACTIVE_API_FILE === entry.__path ? ' active' : '';
        const statusDot = entry.status ? `<span class="tree-status-dot ${entry.status}" title="${escapeHtml(entry.status)}"></span>` : '';
        const compTag = entry.comp_id ? ` <span style="color:var(--violet);font-size:9px">▸${escapeHtml(entry.comp_id)}</span>` : '';
        const delBtn = canDelete ? `<span class="tree-file-del" title="delete" onclick="event.stopPropagation();deleteApiRepoFile('${repo.uuid}','${entry.__path.replace(/'/g,"\\'")}')">×</span>` : '';
        html += `<div class="tree-node file${active}" onclick="openApiRepoFile('${repo.uuid}','${entry.__path.replace(/'/g,"\\'")}')">${indent}${statusDot||'📄'}<span class="tree-file-name">${escapeHtml(name)}${compTag}</span><span class="tree-file-bytes">${entry.bytes||0}b</span>${delBtn}</div>`;
      }
    }
    return html;
  }
  const treeHtml = Object.keys(root).length ? renderNode(root, 0) : '<div style="padding:14px;color:var(--text3);font-family:var(--mono);font-size:11px">no files</div>';
  // §MOVED 2026-09-20 — the add/fork/export/archive action strip that used
  // to live here moved to the Settings subtab (renderRepoSettings below):
  // those are repo-level actions, not file-tree controls, and the file
  // tree is now specifically the Files subtab's content.
  tree.innerHTML = `
    <div style="padding:8px 10px 4px;font-family:var(--mono);font-size:9px;color:var(--text3);line-height:1.5" id="repo-badge">${escapeHtml(repo.name)} — ${statusLine}</div>
    <div class="tree-toolbar"><input type="text" id="tree-file-filter" placeholder="filter files…" oninput="renderApiRepoPanel(CURRENT_API_REPO)"></div>
    <div>${treeHtml}</div>`;
  // client-side file filter (kept simple — text match on path, re-render
  // is cheap even at 500 files since it's one innerHTML write)
  const q = (document.getElementById('tree-file-filter')?.value || '').toLowerCase().trim();
  if (q) {
    const filtered = {};
    for (const f of (repo.files||[])) if (f.path.toLowerCase().includes(q)) filtered[f.path] = true;
    // simplest correct filter: hide tree-node.file rows whose path doesn't match, and any dir with no visible children
    tree.querySelectorAll('.tree-node.file').forEach(el => {
      const onclickAttr = el.getAttribute('onclick') || '';
      const m = onclickAttr.match(/openApiRepoFile\('[^']*','([^']*)'\)/);
      const path = m ? m[1].replace(/\\'/g, "'") : '';
      el.style.display = filtered[path] ? '' : 'none';
    });
    tree.querySelectorAll('.tree-dir').forEach(dirEl => {
      const children = dirEl.nextElementSibling;
      const anyVisible = children && [...children.querySelectorAll('.tree-node.file')].some(f => f.style.display !== 'none');
      dirEl.style.display = anyVisible ? '' : 'none';
      if (children) children.style.display = anyVisible ? '' : 'none';
    });
  }
}
function toggleTreeDir(path) {
  if (REPO_TREE_COLLAPSED.has(path)) REPO_TREE_COLLAPSED.delete(path); else REPO_TREE_COLLAPSED.add(path);
  renderApiRepoPanel(CURRENT_API_REPO);
}
// §NEW 2026-09-17 — repo.fork existed as a real API endpoint
// (idearium/interaction-contract.json's repo.fork) with no UI ever
// wired to it.
async function forkApiRepo(uuid) {
  const repo = API_REPOS.find(r => r.uuid === uuid);
  const name = await themedPrompt(`name for the fork (forking "${repo?.name||uuid}"):`, 'fork repo');
  if (!name) return;
  try {
    const r = await api(`/api/repos/${uuid}/fork`, { method: 'POST', body: JSON.stringify({ name }) });
    toast(`forked → ${name}`, 'ok');
    await loadApiRepos();
    renderRepoLibrary();
    if (r && r.repo && r.repo.uuid) selectApiRepo(r.repo.uuid);
  } catch (e) { toast(`fork failed: ${e.message}`, 'err'); }
}

// ════════════════════════════════════════════════════
// API REPO FILE EDITOR — real read/write against a materialized repo,
// via GET/POST/DELETE /api/repos/:uuid/file. Separate from openFile()
// above, which is the read-only local-folder (File System Access) browser
// — this is the API-backed path with actual save/add/delete.
// ════════════════════════════════════════════════════
let CURRENT_API_REPO = null;
let ACTIVE_API_FILE = null;
let API_FILE_DIRTY = false;

function _showIdeEditor(show) {
  document.getElementById('ide-code').style.display = show ? 'none' : '';
  document.getElementById('ide-editor').style.display = show ? '' : 'none';
}

async function openApiRepoFile(repoUuid, filePath) {
  if (API_FILE_DIRTY && !confirm(`discard unsaved changes to ${ACTIVE_API_FILE}?`)) return;
  ACTIVE_API_FILE = filePath;
  API_FILE_DIRTY = false;
  renderApiRepoPanel(CURRENT_API_REPO);
  document.getElementById('ide-tabs').innerHTML = `${escapeHtml(filePath)}` +
    `<span class="ide-tab-dirty" id="ide-dirty" style="display:none">● unsaved</span>` +
    `<button class="ide-tab-btn" onclick="saveApiRepoFile()">save</button>`;
  // §TIMEOUT FIX 2026-07-15 — file reads share the repo's own spec-engine
  // manifest with whatever chunk-import is currently running (completeChunk
  // does synchronous readFileSync/writeFileSync per chunk — see
  // spec-engine/index.js), so a read hitting mid-build genuinely can take
  // longer than the API's general 6s default. 15s ceiling, plus one retry
  // specifically on an aborted/timed-out request (not on a real 404 or
  // other server error — those won't succeed on retry and shouldn't wait
  // an extra 15s to say so).
  const attempt = () => api(`/api/repos/${repoUuid}/file?path=${encodeURIComponent(filePath)}`, {}, 15000);
  try {
    let r;
    try {
      r = await attempt();
    } catch (e) {
      const isAbort = /aborted/i.test(e.message);
      if (!isAbort) throw e;
      console.warn(`[idearium] file read aborted (likely contended with an in-progress build), retrying once: ${filePath}`);
      r = await attempt();
    }
    _showIdeEditor(true);
    const ta = document.getElementById('ide-editor');
    ta.value = r.content;
    ta.oncancel = null;
    ta.oninput = () => { API_FILE_DIRTY = true; const d = document.getElementById('ide-dirty'); if (d) d.style.display = ''; };
  } catch (e) {
    _showIdeEditor(false);
    document.getElementById('ide-code').textContent = `// could not read file: ${e.message}`;
  }
}

async function saveApiRepoFile() {
  if (!CURRENT_API_REPO || !ACTIVE_API_FILE) return;
  const content = document.getElementById('ide-editor').value;
  try {
    await api(`/api/repos/${CURRENT_API_REPO.uuid}/file`, {
      method: 'POST', body: JSON.stringify({ path: ACTIVE_API_FILE, content }),
    });
    API_FILE_DIRTY = false;
    const d = document.getElementById('ide-dirty'); if (d) d.style.display = 'none';
    toast(`saved ${ACTIVE_API_FILE}`, 'ok');
    await loadApiRepos();
    const fresh = API_REPOS.find(r => r.uuid === CURRENT_API_REPO.uuid);
    if (fresh) { CURRENT_API_REPO = fresh; renderApiRepoPanel(fresh); }
  } catch (e) { toast(`save failed: ${e.message}`, 'err'); }
}

// §EXPORT 2026-07-18 — "the export, needs to be the .spec file compressed
// repo." Real zip (application/zip, not JSON), so this bypasses api()'s
// JSON-parsing wrapper and goes through fetchTimeout directly — same
// pattern the legacy exportSpec() already used for its markdown download.
// 20s ceiling: a 71-spec / 1000+ chunk instance building this archive
// server-side is real work, not just a network round-trip.
async function exportApiRepo() {
  if (!CURRENT_API_REPO) { toast('no repo loaded — open one first', 'err'); return; }
  toast('exporting…', 'ok');
  try {
    const r = await fetchTimeout(API_BASE + `/api/repos/${CURRENT_API_REPO.uuid}/export`, {}, 20000);
    if (!r.ok) {
      let msg = r.statusText;
      try { msg = (await r.json()).error || msg; } catch (_) {}
      throw new Error(msg);
    }
    const blob = await r.blob();
    const cd = r.headers.get('Content-Disposition') || '';
    const match = cd.match(/filename="([^"]+)"/);
    const filename = match ? match[1] : `${(CURRENT_API_REPO.name || 'repo').replace(/[^a-z0-9-_]+/gi, '_')}.zip`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
    toast(`exported ${filename}`, 'ok');
  } catch (e) {
    toast(`export failed: ${e.message}`, 'err');
  }
}

async function addApiRepoFile(repoUuid) {
  const filePath = await themedPrompt('new file path (e.g. src/notes.md):', 'add file');
  if (!filePath) return;
  try {
    await api(`/api/repos/${repoUuid}/file`, {
      method: 'POST', body: JSON.stringify({ path: filePath, content: '' }),
    });
    toast(`created ${filePath}`, 'ok');
    await loadApiRepos();
    const fresh = API_REPOS.find(r => r.uuid === repoUuid);
    if (fresh) { CURRENT_API_REPO = fresh; renderApiRepoPanel(fresh); }
    openApiRepoFile(repoUuid, filePath);
  } catch (e) { toast(`create failed: ${e.message}`, 'err'); }
}

async function deleteApiRepoFile(repoUuid, filePath) {
  if (!confirm(`delete ${filePath}? (moved to .trash/, not permanently erased — §7.4)`)) return;
  try {
    await api(`/api/repos/${repoUuid}/file?path=${encodeURIComponent(filePath)}`, { method: 'DELETE' });
    toast(`deleted ${filePath}`, 'ok');
    if (ACTIVE_API_FILE === filePath) { ACTIVE_API_FILE = null; _showIdeEditor(false); document.getElementById('ide-tabs').textContent = 'no file open'; document.getElementById('ide-code').textContent = '// click a file in the tree to open it here'; }
    await loadApiRepos();
    const fresh = API_REPOS.find(r => r.uuid === repoUuid);
    if (fresh) { CURRENT_API_REPO = fresh; renderApiRepoPanel(fresh); }
  } catch (e) { toast(`delete failed: ${e.message}`, 'err'); }
}

// §BUILT 2026-09-15 — archives a RepoLayer repo via the same DELETE
// /api/repos/:uuid → repo.archive the API has already routed since the v2
// redesign (see idearium/api/index.js's dynRoutes) — soft-delete only,
// status flips to 'archived' and it drops out of the default repo list;
// nothing on disk is touched (§7.4). No prior UI path called this at all.
async function archiveApiRepo() {
  if (!CURRENT_API_REPO) { toast('no repo loaded — open one first', 'err'); return; }
  if (!confirm(`archive "${CURRENT_API_REPO.name}"? it'll drop out of the repo list — content itself is kept, not deleted.`)) return;
  const uuid = CURRENT_API_REPO.uuid;
  try {
    await api(`/api/repos/${uuid}`, { method: 'DELETE' });
    toast('repo archived', 'ok');
    await loadApiRepos();
    CURRENT_API_REPO = null; ACTIVE_API_FILE = null; _showIdeEditor(false);
    renderApiRepoPanel(null);
  } catch (e) {
    toast('archive failed: ' + e.message, 'err');
  }
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
  // §REMOVED 2026-09-20 — the Versionium tab is gone; doSnapshot()/
  // loadSnapshots() still populate SNAPSHOTS for real (a repo's Phasemap
  // subtab and other future consumers can read the array directly), this
  // function just has nothing left to render into. Guarded, not deleted —
  // loadSnapshots() and the bulk-refresh line still call it.
  const list = document.getElementById('commit-list');
  if (!list) return;
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
  if (!area) return; // §REMOVED 2026-09-20 — see renderVersionium()'s own note
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
  if (e.key==='Escape') { closeModal(); closeNewSpecModal(); closeUploadProjectModal(); }
  if ((e.metaKey||e.ctrlKey) && e.key==='n') { e.preventDefault(); setView('ideas'); openModal(); }
});

// ════════════════════════════════════════════════════
// §REMOVED 2026-09-20 — the flat Projects shelf (GET/POST /api/projects,
// its own tab) is gone from this UI. formatBytes() stays: the Upload
// Project modal (openUploadProjectModal, unrelated feature) still uses
// it. The backend routes themselves are untouched — this is a UI-only
// removal, not a route removal.
// ════════════════════════════════════════════════════

function formatBytes(n) {
  if (!n && n !== 0) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024*1024) return `${(n/1024).toFixed(1)} KB`;
  return `${(n/(1024*1024)).toFixed(1)} MB`;
}

// ════════════════════════════════════════════════════
// NEXUS URI DEEP LINK — the idearium-side half of lib/nexus-uri.js's
// 'repo' and 'repo-chunk' routes. Electron's main process resolves the
// nexus:// URI and validates the uuid shape (see that file's header);
// this page's job is only the second half — turning a validated
// ?repo=/&chunk= query param into the same real navigation a user
// clicking "open repository →" already produces. Built on the existing
// functions exactly as they are: openRepoFor(ideaUuid, specUuid, label)
// and openApiRepoFile(repoUuid, filePath) — no new UI concept invented.
// §HONEST — if the repo isn't in this session's already-loaded
// API_REPOS (a real repo that was deleted, or a uuid for a repo that
// never existed), this warns and does nothing further; it does not
// fabricate a repo-shaped placeholder to open.
const NEXUS_URI_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
async function handleNexusDeepLink() {
  const p = new URLSearchParams(location.search);
  const repoUuid = p.get('repo');
  if (!repoUuid || !NEXUS_URI_UUID_RE.test(repoUuid)) return;

  await loadApiRepos();
  const repo = API_REPOS.find(r => r.uuid === repoUuid);
  if (!repo) { console.warn(`[idearium] nexus:// deep link: repo not found in this session: ${repoUuid}`); return; }
  openRepoFor(repo.ideaUuid, repo.specUuid, repo.name);

  const chunkUuid = p.get('chunk');
  if (!chunkUuid || !NEXUS_URI_UUID_RE.test(chunkUuid)) return;
  try {
    const r = await api(`/api/repos/${repoUuid}/chunk/${chunkUuid}`);
    if (r.filePath) await openApiRepoFile(repoUuid, r.filePath);
    else console.warn(`[idearium] nexus:// deep link: chunk ${chunkUuid} has no readable file (${r.readError || 'unknown'})`);
  } catch (e) {
    console.warn(`[idearium] nexus:// deep link: chunk lookup failed: ${e.message}`);
  }
}

// ════════════════════════════════════════════════════
// INIT — no seed data. Connect to real nexus, render empty states until then.
// ════════════════════════════════════════════════════
window.addEventListener('load', () => {
  renderIdeaList(); renderSpecList(); renderVersionium(); renderArchitect(); renderBrainstorms();
  updateStats();
  nexusConnect();
  handleNexusDeepLink();
  setInterval(() => { if (CONNECTED) loadStats(); else nexusConnect(); }, 15000);
});
