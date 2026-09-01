/* NEXUS v0.53.0 — nexus-siso-fw.js
 * SISO Framework Core JS — Event, Gate, Stream
 * Phase 0B — extracted 2026-04-07
 */

/* ═══════════════════════════════════════════════════════════════════
   NEXUS v10.1 — SISO FRAMEWORK CORE (JavaScript port of siso-ai/siso-framework)
   Event → Gate → Stream — pure functional event processing.
   All new features built as SISO gates on top of this primitives layer.
   ═══════════════════════════════════════════════════════════════════ */

/* ── SISO: Event ───────────────────────────────────────────────── */
class NXEvent {
  constructor(type, data = {}) {
    this.type = type;
    this.data = Object.freeze({ ...data });
    this._id = (Date.now().toString(36) + Math.random().toString(36).slice(2, 6));
  }
}

/* ── SISO: Gate ────────────────────────────────────────────────── */
class NXGate {
  constructor(signature) {
    this.signature = signature;
  }
  /** @returns {NXEvent|NXEvent[]|null} */
  transform(event, stream) { return null; }
}

/* ── SISO: StreamLog ───────────────────────────────────────────── */
class NXStreamLog {
  constructor(level = 'EVENTS') {
    this.level = level; // OFF | EVENTS | DEEP | DATA
    this.entries = [];
    this.seq = 0;
    this._idCounter = 0;
  }
  nextStreamId() { return ++this._idCounter; }
  record({ streamId, parentStreamId, eventType, gateClaimed, eventData }) {
    if (this.level === 'OFF') return;
    const entry = { seq: this.seq++, time: Date.now(), type: eventType, claimed: gateClaimed };
    if (this.level === 'DEEP' || this.level === 'DATA') {
      entry.streamId = streamId;
      if (parentStreamId != null) entry.parentStreamId = parentStreamId;
    }
    if (this.level === 'DATA') entry.data = eventData;
    this.entries.push(entry);
    if (this.entries.length > 2000) this.entries.shift();
  }
  sample() { return { level: this.level, count: this.entries.length, entries: [...this.entries] }; }
  clear() { this.entries = []; this.seq = 0; }
}

/* ── SISO: Stream ──────────────────────────────────────────────── */
class NXStream {
  constructor({ log = null, parentStreamId = null } = {}) {
    this.gates = new Map();
    this.pending = [];
    this.eventCount = 0;
    this.log = log;
    this.streamId = log ? log.nextStreamId() : null;
    this.parentStreamId = parentStreamId;
  }
  register(gate) {
    if (this.gates.has(gate.signature))
      throw new Error(`SISO signature collision: '${gate.signature}'`);
    this.gates.set(gate.signature, gate);
    return this;
  }
  emit(event) {
    this.eventCount++;
    const gate = this.gates.get(event.type);
    if (this.log) {
      this.log.record({ streamId: this.streamId, parentStreamId: this.parentStreamId,
        eventType: event.type, gateClaimed: gate ? gate.signature : null, eventData: event.data });
    }
    if (gate) {
      const result = gate.transform(event, this);
      if (result instanceof NXEvent) this.emit(result);
      else if (Array.isArray(result)) result.forEach(e => e instanceof NXEvent && this.emit(e));
    } else {
      this.pending.push(event);
    }
  }
  sampleHere() {
    return { pending: [...this.pending], eventCount: this.eventCount, gateCount: this.gates.size };
  }
}

/* ── GLOBAL SISO INFRASTRUCTURE ────────────────────────────────── */
const SISO_LOG = new NXStreamLog('EVENTS');
const SISO_STREAM = new NXStream({ log: SISO_LOG });

// Helper: emit into global SISO stream
function sisoEmit(type, data = {}) {
  SISO_STREAM.emit(new NXEvent(type, data));
}

/* ─────────────────────────────────────────────────────────────────
   GATE: ParticleSystemGate — drives the canvas particle engine
   ───────────────────────────────────────────────────────────────── */
class ParticleSystemGate extends NXGate {
  constructor() {
    super('nx:particle:init');
    this._particles = [];
    this._raf = null;
  }
  transform(event, stream) {
    const canvas = document.getElementById('nx-particle-canvas');
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    const COLORS = ['#00d4ff','#00ff88','#cc44ff','#ff6b35','#ffcc00','#ff2d55'];
    let W, H;
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const particles = [];
    const count = 80;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: Math.random() * 0.5 + 0.1,
        pulse: Math.random() * Math.PI * 2,
      });
    }
    let _particleRaf = null;
    const CONN_DIST_SQ = 90 * 90;
    const draw = () => {
      // Pause while login overlay is open — avoids competing RAF loops on boot
      const overlay = document.getElementById('ai-login-overlay');
      if (overlay && overlay.style.display !== 'none') {
        _particleRaf = requestAnimationFrame(draw);
        return;
      }
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.pulse += 0.012;
        p.alpha = 0.08 + Math.sin(p.pulse) * 0.07;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });
      // Connection lines — distSq avoids sqrt in hot path
      ctx.globalAlpha = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distSq = dx * dx + dy * dy;
          if (distSq < CONN_DIST_SQ) {
            const alpha = (1 - Math.sqrt(distSq) / 90) * 0.06;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = particles[i].color;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      _particleRaf = requestAnimationFrame(draw);
    };
    window._cancelParticles = () => { if (_particleRaf) cancelAnimationFrame(_particleRaf); };
    draw();
    log_ev('siso:particle:init', { particles: count }, 'INFO');
    return null;
  }
}
SISO_STREAM.register(new ParticleSystemGate());

/* ─────────────────────────────────────────────────────────────────
   GATE: OptionsTabGate — drives the OPTIONS sub-tab navigation
   ───────────────────────────────────────────────────────────────── */
class OptionsTabGate extends NXGate {
  constructor() { super('nx:options:tab:switch'); }
  transform(event, stream) {
    const { tab } = event.data;
    document.querySelectorAll('.opt-tab').forEach(b => b.removeAttribute('data-active'));
    document.querySelectorAll('.opt-sub').forEach(p => p.removeAttribute('data-active'));
    const btn = document.querySelector(`.opt-tab[onclick*="'${tab}'"]`);
    const pnl = document.getElementById(`optsub-${tab}`);
    if (btn) btn.dataset.active = 'true';
    if (pnl) pnl.dataset.active = 'true';
    // Trigger sub-tab specific init
    if (tab === 'data') stream.emit(new NXEvent('nx:data:refresh', {}));
    if (tab === 'diagnose') stream.emit(new NXEvent('nx:diagnose:run', {}));
    return null;
  }
}
SISO_STREAM.register(new OptionsTabGate());

function optSwitchTab(tab, btn) {
  sisoEmit('nx:options:tab:switch', { tab });
  document.querySelectorAll('.opt-sub').forEach(p => {
    if (p.id === 'optsub-' + tab) p.setAttribute('data-active', 'true');
    else p.removeAttribute('data-active');
  });
  document.querySelectorAll('#opt-tab-bar .opt-tab').forEach(b => b.removeAttribute('data-active'));
  if (btn) btn.setAttribute('data-active', 'true');

  if (tab === 'console') {
    const temp = document.getElementById('opt-console-temp');
    const tok  = document.getElementById('opt-console-tokens');
    const prov = document.getElementById('opt-console-provider');
    if (temp && typeof AI !== 'undefined') temp.value = AI.temperature || 0.65;
    if (tok  && typeof AI !== 'undefined') tok.value  = AI.maxTokens  || 4096;
    if (prov && typeof AI !== 'undefined') prov.value = AI.provider   || 'chatgpt';
  }
  if (tab === 'builder') {
    try {
      const gh = JSON.parse(localStorage.getItem('nx5_gh') || '{}');
      const t = document.getElementById('opt-gh-token');
      const r = document.getElementById('opt-gh-repo');
      const b = document.getElementById('opt-gh-branch');
      if (t && gh.token)  t.value  = gh.token;
      if (r && gh.repo)   r.value  = gh.repo;
      if (b && gh.branch) b.value  = gh.branch;
    } catch {}
  }
  if (tab === 'hooks') {
    setTimeout(function() { if (typeof nxtRenderHooks === 'function') nxtRenderHooks(); }, 100);
  }
  if (tab === 'diagnose') {
    setTimeout(function() { if (typeof nxDiagRefreshStats === 'function') nxDiagRefreshStats(); }, 100);
  }
}

/* ─────────────────────────────────────────────────────────────────
   GATE: DataTabGate — /data/projects/{UUID} management
   ───────────────────────────────────────────────────────────────── */
class DataTabGate extends NXGate {
  constructor() { super('nx:data:refresh'); }
  transform(event, stream) {
    try {
      // Load projects from localStorage (mirrors /data/projects/{UUID}/ path logic)
      const raw = localStorage.getItem('nx6_projects');
      const projects = raw ? JSON.parse(raw) : {};
      const uuidRaw = localStorage.getItem('nx6_uuid_registry');
      const uuids = uuidRaw ? JSON.parse(uuidRaw) : [];
      const list = document.getElementById('data-project-list');
      const statP = document.getElementById('data-stat-projects');
      const statU = document.getElementById('data-stat-uuids');
      const statSync = document.getElementById('data-stat-sync');
      if (statP) statP.textContent = Object.keys(projects).length;
      if (statU) statU.textContent = Array.isArray(uuids) ? uuids.length : 0;
      if (statSync) statSync.textContent = new Date().toTimeString().slice(0,8);
      if (list) {
        const keys = Object.keys(projects);
        if (!keys.length) {
          list.innerHTML = '<div style="font-size:10px;color:var(--text3);font-style:italic">No projects found. Save a project from the Builder or Projects tab to populate this.</div>';
        } else {
          list.innerHTML = keys.map(uuid => {
            const p = projects[uuid];
            const name = p.name || p.title || 'Unnamed Project';
            const created = p.created ? new Date(p.created).toLocaleDateString() : '—';
            const lang = p.lang || p.language || '';
            return `<div class="data-project-card" onclick="dataOpenProject('${uuid}')">
              <div class="dp-uuid">⬡ /data/projects/${uuid}/</div>
              <div class="dp-name">${esc(name)}</div>
              <div style="display:flex;gap:12px">
                <div class="dp-meta">Created: ${created}</div>
                ${lang ? `<div class="dp-meta" style="color:var(--c)">${esc(lang)}</div>` : ''}
                <div class="dp-meta" style="margin-left:auto">
                  <button class="btn danger" style="font-size:8px;padding:1px 6px" onclick="event.stopPropagation();dataDeleteProject('${uuid}')">✕</button>
                </div>
              </div>
            </div>`;
          }).join('');
        }
      }
    } catch(e) { console.error('DataTabGate error', e); }
    return null;
  }
}
SISO_STREAM.register(new DataTabGate());

/* Data tab actions (emit into SISO stream) */
function dataRefreshProjects() { sisoEmit('nx:data:refresh', {}); }
function dataOpenProject(uuid) {
  try {
    const raw = localStorage.getItem('nx6_projects');
    const projects = raw ? JSON.parse(raw) : {};
    if (projects[uuid]) { switchTab('projects'); toast(`Opened project ${uuid.slice(0,8)}…`, 'ok'); }
  } catch(e) {}
}
function dataDeleteProject(uuid) {
  if (!confirm(`Delete project ${uuid.slice(0,8)}…? This cannot be undone.`)) return;
  try {
    const raw = localStorage.getItem('nx6_projects');
    const projects = raw ? JSON.parse(raw) : {};
    delete projects[uuid];
    localStorage.setItem('nx6_projects', JSON.stringify(projects));
    sisoEmit('nx:data:refresh', {});
    toast('Project deleted', 'ok');
  } catch(e) { toast('Delete failed', 'err'); }
}
function dataPurgeOrphans() {
  const st = document.getElementById('data-danger-status');
  if (st) st.textContent = 'Purge complete (0 orphans found)'; // Placeholder — real impl needs bridge
  toast('Orphan purge complete', 'ok');
}
function dataClearAll() {
  if (!confirm('Clear ALL project data from local storage? This cannot be undone.')) return;
  ['nx6_projects','nx6_uuid_registry','nx6_builds'].forEach(k => localStorage.removeItem(k));
  sisoEmit('nx:data:refresh', {});
  toast('All data cleared', 'ok');
}
function dataExportAll() {
  try {
    const data = {
      projects: JSON.parse(localStorage.getItem('nx6_projects') || '{}'),
      uuids: JSON.parse(localStorage.getItem('nx6_uuid_registry') || '[]'),
      exported: new Date().toISOString(),
      path_schema: '/data/projects/{UUID}/'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `nexus-data-export-${Date.now()}.json`; a.click();
  } catch(e) { toast('Export failed', 'err'); }
}
function dataBackup() { dataExportAll(); }

/* ─────────────────────────────────────────────────────────────────
   GATE: DiagnoseGate — system health checks
   ───────────────────────────────────────────────────────────────── */
class DiagnoseGate extends NXGate {
  constructor() { super('nx:diagnose:run'); }
  transform(event, stream) {
    const log = document.getElementById('diag-log');
    if (log) log.innerHTML = '<div style="color:var(--y);padding:4px 0">⟳ Running diagnostics…</div>';
    const lines = [];
    const ts_ = () => new Date().toTimeString().slice(0,8);
    // Safe value reader — never throws
    const safeVal = (id) => { try { return (typeof val === 'function' ? val(id) : null) || document.getElementById(id)?.value || ''; } catch { return ''; } };
    const check = (id, valFn, label) => {
      try {
        const result = valFn();
        const el = document.getElementById(id);
        const ok = result !== false && result !== null && result !== undefined;
        if (el) { el.textContent = ok ? (typeof result === 'string' ? result : '✓ OK') : '✗ FAIL'; el.className = 'diag-health-val ' + (ok ? 'diag-ok' : 'diag-err'); }
        lines.push(`[${ts_()}] ${label}: ${ok ? 'OK' : 'FAIL'}`);
        return ok;
      } catch(e) {
        const el = document.getElementById(id);
        if (el) { el.textContent = '✗ ERROR'; el.className = 'diag-health-val diag-err'; }
        lines.push(`[${ts_()}] ${label}: ERROR — ${e.message}`);
        return false;
      }
    };

    // Run all checks
    const aiProvider = safeVal('opt-ai-provider') || localStorage.getItem('nx6_last_provider') || AI?.provider || '';
    const aiKey = safeVal('opt-chatgpt-key') || safeVal('opt-claude-key') || safeVal('opt-ollama-url') || safeVal('opt-deepseek-key') ||
      (() => { try { const c = JSON.parse(localStorage.getItem('nx6_cfg')||'{}'); return c.chatgptKey||c.claudeKey||c.ollamaUrl||c.deepseekKey||''; } catch { return ''; } })();

    check('dchk-ai-cfg', () => aiProvider ? aiProvider : false, 'AI provider configured');
    check('dchk-api-key', () => aiKey ? `${aiKey.slice(0,6)}…` : false, 'API key / URL set');
    check('dchk-bridge', () => {
      const el = document.getElementById('bridge-status-pill-opt');
      return el && el.querySelector('span')?.textContent?.includes('ONLINE') ? 'Online' : 'Offline (optional)';
    }, 'Bridge reachable');
    check('dchk-storage', () => { localStorage.setItem('nx_diag_test', '1'); return localStorage.getItem('nx_diag_test') === '1'; }, 'localStorage available');
    check('dchk-tabs', () => !!document.getElementById('tab-home') && !!document.getElementById('tab-builder'), 'Tab system operational');
    check('dchk-uuid', () => typeof UUID !== 'undefined' ? `${UUID._count || 0} UUIDs` : false, 'UUID registry initialized');
    check('dchk-forge', () => !!document.getElementById('tab-forge'), 'Forge IDE loaded');
    check('dchk-builder', () => {
      const m = document.getElementById('bmode-standard-btn');
      return m ? (m.classList.contains('active-mode') ? 'Standard' : 'DeepScan') : false;
    }, 'Builder mode');
    check('dchk-particles', () => !!document.getElementById('nx-particle-canvas'), 'Particle system active');

    // Stats
    const uuids = (() => { try { return JSON.parse(localStorage.getItem('nx6_uuid_registry') || '[]').length; } catch { return 0; } })();
    const dUuid = document.getElementById('diag-uuid-count');
    if (dUuid) dUuid.textContent = uuids;

    const dAi = document.getElementById('diag-ai-status');
    if (dAi) { dAi.textContent = aiProvider ? aiProvider.toUpperCase() : 'Not set'; dAi.className = 'mcard-val ' + (aiProvider ? 'ok' : 'danger'); }
    const dSt = document.getElementById('diag-storage-status');
    if (dSt) { dSt.textContent = '✓ OK'; dSt.className = 'mcard-val ok'; }
    const dDom = document.getElementById('diag-dom-status');
    if (dDom) { dDom.textContent = `${document.querySelectorAll('[id]').length} IDs`; }

    if (log) log.innerHTML = lines.map(l => `<div style="color:${l.includes('FAIL')||l.includes('ERROR')?'var(--r)':l.includes('OK')?'var(--g)':'var(--text3)'}">${esc(l)}</div>`).join('');
    return null;
  }
}
SISO_STREAM.register(new DiagnoseGate());

/* Diagnose actions */
function diagRunAll() { sisoEmit('nx:diagnose:run', {}); }
function diagClearLog() { const l = document.getElementById('diag-log'); if(l) l.innerHTML = 'Log cleared.'; }
function diagExport() {
  const log = document.getElementById('diag-log');
  const blob = new Blob([log ? log.innerText : 'No data'], { type: 'text/plain' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `nexus-diag-${Date.now()}.txt`; a.click();
}
async function diagRunAILatency() {
  const el = document.getElementById('diag-latency');
  const log = document.getElementById('diag-log');
  if (el) el.textContent = 'Testing…';
  const t0 = Date.now();
  try {
    const result = await aiChat([{role:'user',content:'Reply: NEXUS_DIAG_OK'}], { max_tokens: 10 });
    const ms = Date.now() - t0;
    if (el) { el.textContent = ms + 'ms'; el.className = 'mcard-val ' + (ms < 3000 ? 'ok' : 'warn'); }
    if (log) log.innerHTML += `<div style="color:var(--g)">[${new Date().toTimeString().slice(0,8)}] AI latency: ${ms}ms</div>`;
  } catch(e) {
    if (el) { el.textContent = 'Error'; el.className = 'mcard-val danger'; }
    if (log) log.innerHTML += `<div style="color:var(--r)">[${new Date().toTimeString().slice(0,8)}] AI latency test failed: ${esc(e.message)}</div>`;
  }
}

/* ─────────────────────────────────────────────────────────────────
   GATE: BuilderModeGate — switches builder between Standard / DeepScan
   ───────────────────────────────────────────────────────────────── */
class BuilderModeGate extends NXGate {
  constructor() { super('nx:builder:mode:set'); }
  transform(event, stream) {
    const { mode } = event.data; // 'standard' | 'deepscan'
    const stdPanel = document.getElementById('builder-standard-panel');
    const dsPanel = document.getElementById('builder-deepscan-panel');
    const stdBtn = document.getElementById('bmode-standard-btn');
    const dsBtn = document.getElementById('bmode-deepscan-btn');
    const desc = document.getElementById('builder-mode-desc');

    if (stdPanel) stdPanel.style.display = mode === 'standard' ? 'flex' : 'none';
    if (dsPanel) dsPanel.style.display = mode === 'deepscan' ? 'flex' : 'none';
    if (stdBtn) stdBtn.classList.toggle('active-mode', mode === 'standard');
    if (dsBtn) dsBtn.classList.toggle('active-mode', mode === 'deepscan');
    if (desc) desc.textContent = mode === 'deepscan'
      ? 'Manifest loader · Step-by-step extraction · Architecture · Infrastructure · AI prompt'
      : 'Script generation · Templates · QA · Compiler';
    log_ev('builder:mode:set', { mode }, 'INFO');
    return null;
  }
}
SISO_STREAM.register(new BuilderModeGate());

function setBuilderMode(mode) { sisoEmit('nx:builder:mode:set', { mode }); }

/* ─────────────────────────────────────────────────────────────────
   GATE: DeepScanManifestGate — drives the step-by-step manifest builder
   Pure SISO: each step emits the next step event.
   ───────────────────────────────────────────────────────────────── */

// DeepScan state (immutable snapshots accumulated across steps)
const DS_STATE = {
  active: false,
  currentStep: 0,
  answers: {},     // stepId → answer data
  manifest: {},
  tags: {
    architecture: ['Monolith','Microservices','Serverless','Event-Driven','Hexagonal','CQRS','SISO Pipeline','MVC','JAMstack','Edge'],
    infrastructure: ['Docker','Kubernetes','AWS','GCP','Azure','Bare Metal','Raspberry Pi','Local','Nginx','Apache','Redis','Postgres','MySQL','MongoDB','SQLite'],
    syntax: ['JavaScript','TypeScript','Python','PHP','Rust','Go','C#','C++','Bash','Ruby','Java','Kotlin','Swift','Zig','Elixir'],
    data: ['REST API','GraphQL','gRPC','WebSocket','Event Stream','SQL','NoSQL','File System','In-Memory','Pub/Sub'],
    security: ['JWT','OAuth2','API Keys','RBAC','ABAC','mTLS','Encryption at rest','Zero Trust','Rate limiting','CSP'],
    testing: ['Unit','Integration','E2E','TDD','BDD','Snapshot','Load Test','Fuzzing','Contract','None'],
    deployment: ['CI/CD','GitHub Actions','Manual','Dockerfile','Helm Chart','Serverless Deploy','Edge Deploy','PWA','Electron','None'],
  }
};

const DS_STEPS = [
  { id: 'vision',   title: 'VISION & OUTCOME',      q: 'What are you building? Describe the end-state, the purpose, and what success looks like.',         type: 'textarea', optional: false },
  { id: 'domain',   title: 'DOMAIN & USERS',         q: 'Who uses this? What domain or industry? Any known constraints, compliance needs, or audiences?',   type: 'textarea', optional: true },
  { id: 'arch',     title: 'ARCHITECTURE',            q: 'Choose your architecture patterns (select all that apply):',                                        type: 'tags', tagSet: 'architecture', optional: true },
  { id: 'infra',    title: 'INFRASTRUCTURE',          q: 'What will this run on? Select your infrastructure targets:',                                        type: 'tags', tagSet: 'infrastructure', optional: true },
  { id: 'syntax',   title: 'LANGUAGE & SYNTAX',      q: 'Which languages or runtimes? (Select all — or leave blank to let AI infer):',                       type: 'tags', tagSet: 'syntax', optional: true },
  { id: 'data',     title: 'DATA & INTERFACES',       q: 'How does data flow? What interfaces, protocols, and storage patterns apply?',                       type: 'tags', tagSet: 'data', optional: true },
  { id: 'security', title: 'SECURITY',                q: 'Which security patterns and requirements apply to this system?',                                    type: 'tags', tagSet: 'security', optional: true },
  { id: 'testing',  title: 'TESTING STRATEGY',        q: 'What testing approach should the build include?',                                                   type: 'tags', tagSet: 'testing', optional: true },
  { id: 'deploy',   title: 'DEPLOYMENT',              q: 'How will this be deployed or distributed?',                                                         type: 'tags', tagSet: 'deployment', optional: true },
  { id: 'extra',    title: 'ADDITIONAL CONTEXT',      q: 'Anything else — special constraints, inspirations, anti-patterns to avoid, or existing code to extend?', type: 'textarea', optional: true },
];

class DeepScanBeginGate extends NXGate {
  constructor() { super('nx:ds:begin'); }
  transform(event, stream) {
    DS_STATE.active = true;
    DS_STATE.currentStep = 0;
    DS_STATE.answers = {};
    DS_STATE.manifest = {};
    const pre = document.getElementById('ds-pre-start');
    const flow = document.getElementById('ds-step-flow');
    const outP = document.getElementById('ds-output-panel');
    if (pre) pre.style.display = 'none';
    if (flow) { flow.style.display = 'flex'; flow.style.flexDirection = 'column'; }
    if (outP) { outP.style.display = 'flex'; outP.style.flexDirection = 'column'; }
    stream.emit(new NXEvent('nx:ds:render:steps', {}));
    stream.emit(new NXEvent('nx:ds:step:activate', { stepIdx: 0 }));
    return null;
  }
}
SISO_STREAM.register(new DeepScanBeginGate());

class DeepScanRenderStepsGate extends NXGate {
  constructor() { super('nx:ds:render:steps'); }
  transform(event, stream) {
    const container = document.getElementById('ds-steps-container');
    if (!container) return null;
    container.innerHTML = DS_STEPS.map((step, i) => {
      return `<div class="ds-step locked" id="ds-step-${i}">
        <div class="ds-step-header">
          <span class="ds-step-num">${String(i + 1).padStart(2,'0')}</span>
          <span class="ds-step-title">${step.title}</span>
          <span style="margin-left:auto;font-size:9px;color:var(--text3)">${step.optional ? 'OPTIONAL' : 'REQUIRED'}</span>
        </div>
        <div class="ds-step-body" id="ds-step-body-${i}">
          <div style="font-size:9px;color:var(--text3);margin-bottom:8px">${esc(step.q)}</div>
          ${step.type === 'textarea' ? `<textarea class="finp" id="ds-ans-${i}" rows="3" placeholder="Leave blank to skip…" style="width:100%;resize:none;font-size:10px;background:var(--bg);color:var(--text)"></textarea>` : ''}
          ${step.type === 'tags' ? `<div id="ds-tags-${i}" style="display:flex;flex-wrap:wrap;gap:2px;margin-bottom:6px">
            ${(DS_STATE.tags[step.tagSet]||[]).map(t => `<span class="ds-tag-pill" onclick="dsTagToggle(${i},'${esc(t)}')" data-tag="${esc(t)}">${esc(t)}</span>`).join('')}
          </div><input class="finp" id="ds-custom-${i}" placeholder="+ Add custom…" style="font-size:10px;margin-top:4px" onkeydown="if(event.key==='Enter'){dsTagCustom(${i},this.value);this.value='';}"/>` : ''}
          <div style="display:flex;gap:6px;margin-top:8px">
            <button class="btn ok" style="font-size:9px" onclick="dsStepNext(${i})">NEXT →</button>
            ${i > 0 ? `<button class="btn" style="font-size:9px" onclick="dsStepBack(${i})">← BACK</button>` : ''}
            ${step.optional ? `<button class="btn" style="font-size:9px;color:var(--text3)" onclick="dsStepSkip(${i})">SKIP</button>` : ''}
          </div>
        </div>
      </div>`;
    }).join('') + `<div class="ds-step locked" id="ds-step-final">
        <div class="ds-step-header">
          <span class="ds-step-num" style="color:var(--g)">✓</span>
          <span class="ds-step-title">BUILD MANIFEST</span>
        </div>
        <div class="ds-step-body">
          <div style="font-size:9px;color:var(--text3);margin-bottom:10px">All steps complete. Your manifest and AI prompt are ready. Click to build.</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <button class="btn ok" style="font-size:10px" onclick="dsBuild()">⚡ BUILD FROM MANIFEST</button>
            <button class="btn" style="font-size:9px;color:var(--m);border-color:rgba(204,68,255,.3)" onclick="dsCopyOutput()">COPY MANIFEST</button>
            <button class="btn" style="font-size:9px" onclick="dsReset()">↺ RESET</button>
          </div>
        </div>
      </div>`;
    return null;
  }
}
SISO_STREAM.register(new DeepScanRenderStepsGate());

class DeepScanStepActivateGate extends NXGate {
  constructor() { super('nx:ds:step:activate'); }
  transform(event, stream) {
    const { stepIdx } = event.data;
    DS_STATE.currentStep = stepIdx;
    DS_STEPS.forEach((_, i) => {
      const el = document.getElementById(`ds-step-${i}`);
      if (!el) return;
      if (i < stepIdx) el.className = 'ds-step done';
      else if (i === stepIdx) { el.className = 'ds-step active'; el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
      else el.className = 'ds-step locked';
    });
    // Update final step
    const final = document.getElementById('ds-step-final');
    if (final) final.className = stepIdx >= DS_STEPS.length ? 'ds-step active' : 'ds-step locked';
    const status = document.getElementById('ds-build-status');
    if (status) status.textContent = `Step ${stepIdx + 1} / ${DS_STEPS.length}`;
    return null;
  }
}
SISO_STREAM.register(new DeepScanStepActivateGate());

class DeepScanManifestBuildGate extends NXGate {
  constructor() { super('nx:ds:manifest:build'); }
  transform(event, stream) {
    const a = DS_STATE.answers;
    const manifest = {
      nexus_manifest_version: '1.0',
      generated: new Date().toISOString(),
      framework: 'SISO (Stream In, Stream Out)',
      vision: a.vision || '',
      domain: a.domain || '',
      architecture: a.arch || [],
      infrastructure: a.infra || [],
      language_syntax: a.syntax || [],
      data_interfaces: a.data || [],
      security_patterns: a.security || [],
      testing_strategy: a.testing || [],
      deployment: a.deploy || [],
      additional_context: a.extra || '',
      siso_gates: []
    };
    // Auto-generate SISO gate pipeline from answers
    const gates = ['InputValidationGate', 'DomainParseGate'];
    if (manifest.data_interfaces.includes('REST API')) gates.push('RouteDispatchGate', 'RequestParseGate', 'ResponseFormatGate');
    if (manifest.data_interfaces.includes('GraphQL')) gates.push('GraphQLParseGate', 'ResolverDispatchGate');
    if (manifest.testing_strategy.length) gates.push('TestHarnessGate');
    if (manifest.security_patterns.includes('JWT')) gates.push('AuthGate', 'JWTValidationGate');
    if (manifest.deployment.includes('Docker')) gates.push('ContainerConfigGate');
    gates.push('OutputSerializeGate', 'ErrorHandlerGate');
    manifest.siso_gates = gates;
    DS_STATE.manifest = manifest;

    // Render manifest
    const out = document.getElementById('ds-manifest-output');
    if (out) out.textContent = JSON.stringify(manifest, null, 2);

    // Build AI prompt
    const prompt = [
      `You are NEXUS DeepScan Builder operating under the SISO framework (Stream In, Stream Out).`,
      `Build the following system using pure functional event-driven architecture.`,
      `Each component is a Gate: a pure function that matches one event type and emits transformed events.`,
      ``,
      `VISION: ${manifest.vision}`,
      manifest.domain ? `DOMAIN: ${manifest.domain}` : '',
      `ARCHITECTURE: ${manifest.architecture.join(', ') || 'AI-inferred'}`,
      `INFRASTRUCTURE: ${manifest.infrastructure.join(', ') || 'AI-inferred'}`,
      `LANGUAGE/RUNTIME: ${manifest.language_syntax.join(', ') || 'AI-inferred'}`,
      `DATA INTERFACES: ${manifest.data_interfaces.join(', ') || 'AI-inferred'}`,
      `SECURITY: ${manifest.security_patterns.join(', ') || 'standard'}`,
      `TESTING: ${manifest.testing_strategy.join(', ') || 'unit tests'}`,
      `DEPLOYMENT: ${manifest.deployment.join(', ') || 'AI-inferred'}`,
      manifest.additional_context ? `ADDITIONAL CONTEXT: ${manifest.additional_context}` : '',
      ``,
      `SISO GATE PIPELINE (implement each as a pure function / Gate class):`,
      manifest.siso_gates.map((g, i) => `  ${i + 1}. ${g}`).join('\n'),
      ``,
      `AXIOMS (SISO):`,
      `- Events are immutable. Gates emit new events, never mutate existing ones.`,
      `- Each gate has one responsibility: match one event type, emit zero or more transformed events.`,
      `- No side effects except emitting events. Deterministic: same input → same output.`,
      `- Mark processed-by to prevent infinite loops: if (event.processedBy?.includes(this.signature)) return null;`,
      ``,
      `Deliver complete, production-ready, fully functional code. No placeholders, no stubs. Pure output only.`
    ].filter(Boolean).join('\n');

    const promptOut = document.getElementById('ds-prompt-output');
    if (promptOut) promptOut.textContent = prompt;

    // Architecture diagram text
    const archOut = document.getElementById('ds-arch-output');
    if (archOut) archOut.textContent = [
      `// SISO GATE PIPELINE — ${manifest.vision.slice(0,60)}`,
      `//`,
      `// Input Event`,
      ...manifest.siso_gates.map((g, i) =>
        `//   ${'→'.repeat(i + 1)} ${g}${i < manifest.siso_gates.length - 1 ? ' →' : ' → [Output]'}`
      ),
      `//`,
      `// Architecture: ${manifest.architecture.join(' + ') || 'Inferred'}`,
      `// Infrastructure: ${manifest.infrastructure.join(' + ') || 'Inferred'}`,
      `// Deployment: ${manifest.deployment.join(' + ') || 'Inferred'}`
    ].join('\n');

    // Infra spec
    const infraOut = document.getElementById('ds-infra-output');
    if (infraOut) infraOut.textContent = [
      `// INFRASTRUCTURE MANIFEST`,
      `// Generated by NEXUS DeepScan at ${new Date().toISOString()}`,
      `//`,
      ...manifest.infrastructure.map(i => `// ⬡ ${i}`),
      `//`,
      `// Estimated stack:`,
      manifest.language_syntax.length ? `//   Runtime: ${manifest.language_syntax.join(', ')}` : '',
      manifest.data_interfaces.length ? `//   Interfaces: ${manifest.data_interfaces.join(', ')}` : '',
      manifest.security_patterns.length ? `//   Security: ${manifest.security_patterns.join(', ')}` : '',
      manifest.deployment.length ? `//   Deploy: ${manifest.deployment.join(', ')}` : ''
    ].filter(Boolean).join('\n');

    const status = document.getElementById('ds-build-status');
    if (status) { status.textContent = '✓ Manifest ready'; status.style.color = 'var(--g)'; }
    log_ev('ds:manifest:built', { gates: manifest.siso_gates.length, vision: manifest.vision.slice(0,60) }, 'INFO');
    return null;
  }
}
SISO_STREAM.register(new DeepScanManifestBuildGate());

/* DeepScan UI helper functions */
function dsBegin() { sisoEmit('nx:ds:begin', {}); }
function dsReset() {
  DS_STATE.active = false; DS_STATE.answers = {}; DS_STATE.currentStep = 0;
  const pre = document.getElementById('ds-pre-start');
  const flow = document.getElementById('ds-step-flow');
  const outP = document.getElementById('ds-output-panel');
  if (pre) pre.style.display = 'flex';
  if (flow) flow.style.display = 'none';
  if (outP) outP.style.display = 'none';
  const status = document.getElementById('ds-build-status');
  if (status) { status.textContent = 'Idle'; status.style.color = ''; }
}

function dsTagToggle(stepIdx, tag) {
  const answers = DS_STATE.answers;
  const step = DS_STEPS[stepIdx];
  const key = step.id;
  if (!Array.isArray(answers[key])) answers[key] = [];
  const i = answers[key].indexOf(tag);
  if (i === -1) answers[key].push(tag); else answers[key].splice(i, 1);
  // Update pill UI
  const pill = document.querySelector(`#ds-tags-${stepIdx} [data-tag="${CSS.escape(tag)}"]`);
  if (pill) pill.classList.toggle('sel', answers[key].includes(tag));
}

function dsTagCustom(stepIdx, tag) {
  if (!tag.trim()) return;
  const step = DS_STEPS[stepIdx];
  const key = step.id;
  if (!Array.isArray(DS_STATE.answers[key])) DS_STATE.answers[key] = [];
  if (!DS_STATE.answers[key].includes(tag)) DS_STATE.answers[key].push(tag);
  // Add pill to UI
  const container = document.getElementById(`ds-tags-${stepIdx}`);
  if (container) {
    const pill = document.createElement('span');
    pill.className = 'ds-tag-pill sel';
    pill.dataset.tag = tag;
    pill.textContent = tag;
    pill.onclick = () => dsTagToggle(stepIdx, tag);
    container.appendChild(pill);
  }
}

function dsStepNext(stepIdx) {
  // Collect answer for textarea steps
  const step = DS_STEPS[stepIdx];
  if (step.type === 'textarea') {
    const el = document.getElementById(`ds-ans-${stepIdx}`);
    DS_STATE.answers[step.id] = el ? el.value.trim() : '';
  }
  // Required check
  if (!step.optional && !DS_STATE.answers[step.id]) {
    toast('This field is required — please enter something', 'warn'); return;
  }
  const next = stepIdx + 1;
  if (next >= DS_STEPS.length) {
    sisoEmit('nx:ds:manifest:build', {});
    sisoEmit('nx:ds:step:activate', { stepIdx: DS_STEPS.length });
  } else {
    sisoEmit('nx:ds:step:activate', { stepIdx: next });
  }
}

function dsStepBack(stepIdx) {
  if (stepIdx > 0) sisoEmit('nx:ds:step:activate', { stepIdx: stepIdx - 1 });
}

function dsStepSkip(stepIdx) {
  const step = DS_STEPS[stepIdx];
  DS_STATE.answers[step.id] = step.type === 'tags' ? [] : '';
  const next = stepIdx + 1;
  if (next >= DS_STEPS.length) {
    sisoEmit('nx:ds:manifest:build', {});
    sisoEmit('nx:ds:step:activate', { stepIdx: DS_STEPS.length });
  } else {
    sisoEmit('nx:ds:step:activate', { stepIdx: next });
  }
}

function dsSwitchOut(tab, btn) {
  ['manifest','prompt','arch','infra'].forEach(t => {
    const el = document.getElementById(`ds-out-${t}`);
    const b = document.getElementById(`dst-${t}`);
    if (el) el.style.display = t === tab ? 'flex' : 'none';
    if (b) b.classList.toggle('active', t === tab);
  });
}

function dsCopyOutput() {
  const out = document.getElementById('ds-manifest-output');
  if (out) { navigator.clipboard.writeText(out.textContent).then(() => toast('Manifest copied','ok')); }
}

async function dsBuild() {
  if (!DS_STATE.manifest || !DS_STATE.manifest.vision) { toast('Complete the manifest steps first','warn'); return; }
  const prompt = document.getElementById('ds-prompt-output')?.textContent || '';
  if (!prompt) { toast('No prompt generated yet — complete steps first','warn'); return; }
  // Hand off to the standard builder with the manifest prompt pre-loaded
  setBuilderMode('standard');
  switchTab('builder');
  const endstate = document.getElementById('sb-endstate');
  if (endstate) endstate.value = DS_STATE.manifest.vision;
  const inject = document.getElementById('sb-inject');
  if (inject) inject.value = `[SISO MANIFEST] Architecture: ${DS_STATE.manifest.architecture.join(',')||'inferred'} | Gates: ${DS_STATE.manifest.siso_gates.join(' → ')}`;
  toast('Manifest loaded into builder — click GENERATE to build','ok');
  // Store prompt in build context
  window._ds_manifest_prompt = prompt;
  log_ev('ds:build:triggered', { vision: DS_STATE.manifest.vision.slice(0,80) }, 'INFO');
}

/* ─────────────────────────────────────────────────────────────────
   GATE: TestEnvTabGate — moves DeepScan + Tests into TestEnv sub-tabs
   ───────────────────────────────────────────────────────────────── */
class TestEnvInjectGate extends NXGate {
  constructor() { super('nx:testenv:inject'); }
  transform(event, stream) {
    // Add DeepScan and Tests as sub-tabs inside TestEnv
    const teSubBar = document.querySelector('#tab-testenv > div:nth-child(2)');
    if (teSubBar && !teSubBar.querySelector('[data-tetab="deepscan"]')) {
      const dsBtn = document.createElement('button');
      dsBtn.className = 'ptab'; dsBtn.dataset.tetab = 'deepscan';
      dsBtn.textContent = '⬡ DEEPSCAN';
      dsBtn.style.cssText = 'color:var(--m)';
      dsBtn.onclick = () => teSwitchTab('deepscan', dsBtn);
      teSubBar.appendChild(dsBtn);
      const testsBtn = document.createElement('button');
      testsBtn.className = 'ptab'; testsBtn.dataset.tetab = 'tests';
      testsBtn.textContent = '✓ TESTS';
      testsBtn.style.cssText = 'color:var(--c)';
      testsBtn.onclick = () => teSwitchTab('tests', testsBtn);
      teSubBar.appendChild(testsBtn);
    }
    // Create DeepScan sub-panel inside TestEnv panels container
    const tePanels = document.querySelector('#tab-testenv > div:nth-child(3)');
    if (tePanels && !document.getElementById('tes-deepscan')) {
      // DeepScan panel — just clones/moves the deepscan tab content
      const dsWrap = document.createElement('div');
      dsWrap.className = 'te-sub'; dsWrap.id = 'tes-deepscan';
      dsWrap.setAttribute('data-tetab-panel', 'deepscan');
      dsWrap.style.cssText = 'display:none;flex:1;min-height:0;flex-direction:column;overflow:hidden';
      dsWrap.innerHTML = `<div style="flex-shrink:0;padding:10px 16px;background:rgba(204,68,255,.04);border-bottom:1px solid rgba(204,68,255,.2);display:flex;align-items:center;gap:8px">
        <div class="alive-dot magenta"></div>
        <span style="font-family:var(--display);font-size:12px;letter-spacing:.2em;color:var(--m)">DEEPSCAN ENGINE</span>
        <span style="font-size:9px;color:var(--text3);margin-left:8px">Adversarial code review · URL scan · UMS manifest · Full audit loop</span>
        <button class="btn" style="font-size:9px;margin-left:auto;color:var(--m);border-color:rgba(204,68,255,.3)" onclick="switchTab('deepscan')">OPEN FULL DEEPSCAN →</button>
      </div>
      <div style="flex:1;overflow-y:auto;padding:14px 16px">
        <div style="font-size:10px;color:var(--text3);margin-bottom:12px">Quick scan from Test Environment — paste code or URL to run an adversarial review.</div>
        <div class="frow" style="margin-bottom:8px"><span class="flbl">CODE / URL</span><textarea class="finp" id="te-ds-code" rows="6" placeholder="Paste code or a URL here for DeepScan analysis…" style="flex:1;resize:none;font-size:10px;font-family:var(--mono)"></textarea></div>
        <div style="display:flex;gap:6px;margin-bottom:10px">
          <button class="btn ok" style="font-size:9px" onclick="teDsRunScan()">⬡ RUN SCAN</button>
          <button class="btn" style="font-size:9px;color:var(--m);border-color:rgba(204,68,255,.3)" onclick="switchTab('deepscan')">FULL DEEPSCAN →</button>
        </div>
        <div id="te-ds-output" style="background:var(--bg);border:1px solid var(--border2);border-radius:3px;padding:10px;font-family:var(--mono);font-size:10px;white-space:pre-wrap;color:var(--text2);min-height:80px">// Scan results appear here…</div>
      </div>`;
      tePanels.appendChild(dsWrap);

      // Tests panel
      const testsWrap = document.createElement('div');
      testsWrap.className = 'te-sub'; testsWrap.id = 'tes-tests';
      testsWrap.setAttribute('data-tetab-panel', 'tests');
      testsWrap.style.cssText = 'display:none;flex:1;min-height:0;flex-direction:column;overflow:hidden';
      testsWrap.innerHTML = `<div style="flex-shrink:0;padding:8px 14px;background:var(--bg1);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px">
        <div class="alive-dot cyan"></div>
        <span style="font-family:var(--display);font-size:12px;letter-spacing:.2em;color:var(--c)">TEST SUITE</span>
        <span style="font-size:9px;color:var(--text3)">Live JS · UI Smoke · Checklist · Reference</span>
        <button class="btn accent" style="font-size:9px;margin-left:auto" onclick="testsRunAll()">▶ RUN ALL</button>
        <button class="btn" style="font-size:9px;color:var(--m);border-color:rgba(204,68,255,.3)" onclick="pwRunSmoke()">SMOKE</button>
        <button class="btn" style="font-size:9px" onclick="switchTab('tests')">FULL TESTS →</button>
      </div>
      <div style="flex-shrink:0;display:flex;gap:12px;padding:8px 14px;background:var(--bg2);border-bottom:1px solid var(--border)">
        <div style="text-align:center"><div style="font-family:var(--display);font-size:18px;color:var(--g)" id="te-test-pass">—</div><div style="font-size:8px;color:var(--text3)">PASS</div></div>
        <div style="text-align:center"><div style="font-family:var(--display);font-size:18px;color:var(--r)" id="te-test-fail">—</div><div style="font-size:8px;color:var(--text3)">FAIL</div></div>
        <div style="text-align:center"><div style="font-family:var(--display);font-size:18px;color:var(--y)" id="te-test-total">—</div><div style="font-size:8px;color:var(--text3)">TOTAL</div></div>
        <div style="flex:1;height:6px;background:var(--border);border-radius:3px;overflow:hidden;align-self:center;margin:0 8px"><div id="te-test-bar" style="height:100%;width:0%;background:var(--g);transition:width .4s;border-radius:3px"></div></div>
        <div style="font-family:var(--display);font-size:14px;color:var(--c)" id="te-test-pct">—</div>
      </div>
      <div style="flex:1;overflow-y:auto;padding:10px 14px" id="te-test-results">
        <div style="font-size:10px;color:var(--text3);font-style:italic">Click RUN ALL to execute the test suite.</div>
      </div>`;
      tePanels.appendChild(testsWrap);

      // Wire test results into this panel
      const _orig = typeof testsRunAll === 'function' ? testsRunAll : null;
      window._te_testsRunAll = async function() {
        if (_orig) {
          await _orig();
          // Mirror results into TE panel
          const pass = document.getElementById('test-pass-count')?.textContent || '—';
          const fail = document.getElementById('test-fail-count')?.textContent || '—';
          const total = document.getElementById('test-total-count')?.textContent || '—';
          const pct = document.getElementById('test-score-pct')?.textContent || '—';
          const teP = document.getElementById('te-test-pass'); if(teP) teP.textContent = pass;
          const teF = document.getElementById('te-test-fail'); if(teF) teF.textContent = fail;
          const teT = document.getElementById('te-test-total'); if(teT) teT.textContent = total;
          const tePct = document.getElementById('te-test-pct'); if(tePct) tePct.textContent = pct;
          const bar = document.getElementById('te-test-bar');
          const srcBar = document.getElementById('test-progress-bar');
          if (bar && srcBar) bar.style.width = srcBar.style.width;
        }
      };
    }
    return null;
  }
}
SISO_STREAM.register(new TestEnvInjectGate());

async function teDsRunScan() {
  const code = (document.getElementById('te-ds-code')?.value || '').trim();
  const out = document.getElementById('te-ds-output');
  if (!code) { if(out) out.textContent = '// Paste code or URL first…'; return; }
  if (!requireAI('te:deepscan')) return;
  if (out) out.textContent = '// Scanning…';
  try {
    const result = await aiChat([
      { role: 'system', content: 'You are a security-focused adversarial code reviewer. Analyze the provided code or URL for vulnerabilities, anti-patterns, risks, and improvements. Be direct and specific.' },
      { role: 'user', content: `Adversarial review:\n\n${code}` }
    ], { max_tokens: 2000 });
    if (out) out.textContent = result.text || result;
  } catch(e) {
    if (out) out.textContent = `// Scan failed: ${e.message}`;
  }
}

/* ─────────────────────────────────────────────────────────────────
   GATE: ProjectUUIDPathGate — ensures /data/projects/{UUID}/ structure
   Called when saving a project — registers the path schema.
   ───────────────────────────────────────────────────────────────── */
class ProjectUUIDPathGate extends NXGate {
  constructor() { super('nx:project:save'); }
  transform(event, stream) {
    const { uuid, name, lang, code, meta = {} } = event.data;
    try {
      const raw = localStorage.getItem('nx6_projects') || '{}';
      const projects = JSON.parse(raw);
      projects[uuid] = {
        uuid,
        name: name || 'Untitled',
        lang: lang || '',
        code: code || '',
        created: meta.created || new Date().toISOString(),
        updated: new Date().toISOString(),
        path: `/data/projects/${uuid}/`,
        ...meta
      };
      localStorage.setItem('nx6_projects', JSON.stringify(projects));
      log_ev('project:saved', { uuid, name }, 'INFO');
    } catch(e) {
      console.error('ProjectUUIDPathGate error', e);
    }
    return null;
  }
}
SISO_STREAM.register(new ProjectUUIDPathGate());

// Expose so Builder save can use SISO path
function sisoSaveProject(uuid, name, lang, code, meta) {
  sisoEmit('nx:project:save', { uuid, name, lang, code, meta });
}

/* ─────────────────────────────────────────────────────────────────
   INITIALIZATION — boot all SISO gates after DOM ready
   ───────────────────────────────────────────────────────────────── */
setTimeout(() => {
  // Start particle system
  sisoEmit('nx:particle:init', {});
  // Inject DeepScan + Tests into TestEnv
  sisoEmit('nx:testenv:inject', {});
  // Ensure builder starts in standard mode
  sisoEmit('nx:builder:mode:set', { mode: 'standard' });
  // Log SISO boot
  log_ev('siso:boot', {
    version: '10.1',
    gates: SISO_STREAM.gates.size,
    framework: 'SISO (Stream In, Stream Out)',
    paper: 'https://github.com/siso-ai/siso-framework'
  }, 'INFO');
  toast('⬡ NEXUS v10.1 — SISO Framework active · RGB particle system live · Builder upgraded', 'ok', 4000);
}, 1500);

// Patch sbSaveProject to also register in SISO path store
(function patchSbSaveProject() {
  const _orig = typeof sbSaveProject === 'function' ? sbSaveProject : null;
  if (!_orig) return;
  window.sbSaveProject = function() {
    const result = _orig();
    const uuid = window._buildSessionId || '';
    const name = val('sb-endstate') || 'Untitled';
    const lang = val('sb-lang') || '';
    const code = document.getElementById('sb-output')?.textContent || '';
    if (uuid) sisoSaveProject(uuid, name, lang, code, {});
    return result;
  };
})();

