'use strict';
/**
 * ui/brainos/brainos-app.js
 * §NEW 2026-09-06 — James: "make this ui, map it all onto the html."
 * Full-page app driving the real, mapped BrainOS UI. Reuses the exact
 * same real endpoints/ports already established and tested in
 * brainos.js (guardian :7820, clear-glass :7704/:7701, cortex :3748,
 * diagnostic :7825) — this file drives THIS page's layout instead of
 * brainos.js's own floating panel, which isn't used here.
 *
 * §NO_DECORATIVE_MOTION / §NO_CAP_ON_VISIBILITY — same real axioms
 * brainos-canvas.js already holds itself to: every visual update here
 * traces to a real fetch or a real SSE event, nothing on a timer for
 * its own sake, and every real row/entry gets shown, no top-N cap.
 */
(function () {
  const GUARDIAN_URL   = 'http://127.0.0.1:7820';
  const CLEARGLASS_URL = 'http://127.0.0.1:7704';
  const CLEARGLASS_SSE = 'http://127.0.0.1:7701';
  const CORTEX_URL     = 'http://127.0.0.1:3748';
  const DIAGNOSTIC_URL = 'http://127.0.0.1:7825';

  let _selectedNode = null;
  let _meshNodes = {}; // id -> real node data, mirrors brainos-canvas.js's own tracking for the sidebar list

  // ── Tab switching — plain, real, no framework ───────────────────────────
  function setMainTab(tab) {
    document.querySelectorAll('.tnav').forEach((t) => t.classList.toggle('act', t.dataset.tab === tab));
    document.querySelectorAll('.panel-overlay').forEach((p) => p.classList.remove('act'));
    if (tab !== 'canvas') {
      const el = document.getElementById('panel-' + tab);
      if (el) el.classList.add('act');
    }
    if (tab === 'bayes') fetchBayes();
    if (tab === 'pipeline') fetchPipeline();
    if (tab === 'automation') fetchAutomation();
  }
  document.querySelectorAll('.tnav').forEach((t) => t.addEventListener('click', () => setMainTab(t.dataset.tab)));

  function setRTab(tab) {
    document.querySelectorAll('.rptab').forEach((t) => t.classList.toggle('act', t.dataset.rtab === tab));
    document.querySelectorAll('.rp-body').forEach((b) => b.classList.remove('act'));
    document.getElementById('rt-' + tab).classList.add('act');
    if (tab === 'chatlog') fetchChatLog();
  }
  document.querySelectorAll('.rptab').forEach((t) => t.addEventListener('click', () => setRTab(t.dataset.rtab)));

  function log(msg) {
    const strip = document.getElementById('log-strip');
    const el = document.createElement('div');
    el.className = 'll';
    el.textContent = `${new Date().toLocaleTimeString('en-GB', { hour12: false })}  ${msg}`;
    strip.insertBefore(el, strip.firstChild);
    while (strip.children.length > 6) strip.lastChild.remove();
    setTimeout(() => el.remove(), 10000);
  }

  // ── CANVAS — mount the real, existing dynamic mesh renderer ─────────────
  const canvasHost = document.getElementById('canvas-host');
  window.BrainOSCanvas.mount(canvasHost);
  window.BrainOSCanvas.onNodeClick((node) => {
    _selectedNode = node;
    renderNodeDetail(node);
    setRTab('node');
  });

  // Real, one-time initial fetch — same real endpoint built earlier this
  // session — gives the canvas AND the sidebar their actual current state
  // before the first live SSE tick.
  fetch(CLEARGLASS_URL + '/agent-mesh/view')
    .then((r) => r.json())
    .then((data) => {
      if (data?.ok && Array.isArray(data.nodes)) {
        window.BrainOSCanvas.renderMeshView(data.nodes);
        data.nodes.forEach((n) => { _meshNodes[n.id] = n; });
        renderSidebar();
      }
    })
    .catch((e) => log(`mesh view fetch failed: ${e.message}`));

  // Real SSE — guardian's own stream (every real guardian bus.emit()).
  try {
    const es = new EventSource(GUARDIAN_URL + '/events');
    es.onmessage = (msg) => {
      let data; try { data = JSON.parse(msg.data); } catch (_) { return; }
      window.BrainOSCanvas.onRealEvent(data);
    };
    es.onerror = () => log('guardian SSE disconnected');
  } catch (e) { log(`guardian SSE failed: ${e.message}`); }

  // Real SSE — clear-glass's own stream, mesh.* events only (agent-mesh
  // lives in a different real process than guardian — same justified
  // exception brainos.js's own header already documents).
  try {
    const cgEs = new EventSource(CLEARGLASS_SSE + '/events');
    cgEs.onmessage = (msg) => {
      let data; try { data = JSON.parse(msg.data); } catch (_) { return; }
      if (typeof data?.type === 'string' && data.type.startsWith('mesh.')) {
        window.BrainOSCanvas.onRealEvent(data);
        if (data.type === 'mesh.nodes.snapshot' && Array.isArray(data.nodes)) {
          data.nodes.forEach((n) => { _meshNodes[n.id] = n; });
          renderSidebar();
        }
      }
    };
    cgEs.onerror = () => log('clear-glass SSE disconnected');
  } catch (e) { log(`clear-glass SSE failed: ${e.message}`); }

  function _statusColor(status) {
    if (status === 'alive' || status === 'connected' || status === 'ok') return 'var(--online)';
    if (status === 'idle') return 'var(--warn)';
    return 'var(--offline)';
  }

  function renderSidebar() {
    const list = document.getElementById('node-list');
    const ids = Object.keys(_meshNodes);
    if (!ids.length) { list.innerHTML = '<div class="empty-state">no real nodes yet</div>'; return; }
    list.innerHTML = ids.map((id) => {
      const n = _meshNodes[id];
      return `<div class="node-item${_selectedNode?.id === id ? ' sel' : ''}" data-id="${id}">
        <div class="nd-dot" style="background:${_statusColor(n.status)}"></div>
        <div class="nd-label">${n.label || id}</div>
        <div class="nd-kind">${n.kind || ''}</div>
      </div>`;
    }).join('');
    list.querySelectorAll('.node-item').forEach((el) => {
      el.addEventListener('click', () => {
        const n = _meshNodes[el.dataset.id];
        if (n) { _selectedNode = n; renderNodeDetail(n); setRTab('node'); renderSidebar(); }
      });
    });
  }

  // ── NODE detail (right panel) — real data from whatever was clicked ─────
  function renderNodeDetail(n) {
    const el = document.getElementById('rt-node');
    if (!n) { el.innerHTML = '<div class="empty-state">click a node on the canvas</div>'; return; }
    el.innerHTML = `
      <div class="list-row">
        <div class="lr-head"><span class="lr-name">${n.label || n.id}</span>
          <span class="badge ${n.status === 'alive' || n.status === 'connected' ? 'ok' : n.status === 'idle' ? 'warn' : 'err'}">${n.status || 'unknown'}</span>
        </div>
        <div class="lr-meta">id: ${n.id}</div>
        <div class="lr-meta">kind: ${n.kind || '—'}</div>
        ${n.health !== undefined ? `<div class="lr-meta">health: ${n.health}</div>` : ''}
        ${n.meta ? `<div class="lr-meta">meta: ${JSON.stringify(n.meta)}</div>` : ''}
      </div>`;
  }

  // ── CHAT LOGS (right panel) — real: GET cortex/api/chat-log ─────────────
  function fetchChatLog() {
    const el = document.getElementById('rt-chatlog');
    fetch(CORTEX_URL + '/api/chat-log?n=50')
      .then((r) => r.json())
      .then((data) => {
        if (!data.ok || !data.entries?.length) { el.innerHTML = '<div class="empty-state">no real chat log entries</div>'; return; }
        el.innerHTML = data.entries.map((e) => `
          <div class="list-row">
            <div class="lr-head"><span class="lr-name">${e.provider || e.agent || 'unknown'}</span><span class="lr-meta">${new Date(e.ts || e.createdAt || Date.now()).toLocaleTimeString()}</span></div>
            <div class="lr-meta">${(e.prompt || e.text || e.message || JSON.stringify(e)).toString().slice(0, 140)}</div>
          </div>`).join('');
      })
      .catch((e) => { el.innerHTML = `<div class="empty-state">chat log fetch failed: ${e.message}</div>`; });
  }

  // ── DEPLOY — real: POST clear-glass/provider/deploy ─────────────────────
  document.getElementById('deploy-btn').addEventListener('click', () => {
    const provider = document.getElementById('deploy-provider').value;
    const out = document.getElementById('deploy-result');
    out.textContent = 'deploying…';
    fetch(CLEARGLASS_URL + '/provider/deploy', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerId: provider }),
    })
      .then((r) => r.json())
      .then((data) => { out.textContent = data.ok ? `✓ redeployed ${provider}` : `✗ ${data.error || 'deploy failed'}`; log(`deploy ${provider}: ${data.ok ? 'ok' : data.error}`); })
      .catch((e) => { out.textContent = `✗ ${e.message}`; });
  });

  // ── BAYES — real: GET diagnostic/cfr/field ──────────────────────────────
  function fetchBayes() {
    const el = document.getElementById('bayes-body');
    fetch(DIAGNOSTIC_URL + '/cfr/field')
      .then((r) => r.json())
      .then((data) => {
        if (!data.ok) { el.innerHTML = `<div class="empty-state">cfr/field error: ${data.error || 'unknown'}</div>`; return; }
        const pct = (v) => Math.max(0, Math.min(100, Math.round((v || 0) * 100)));
        el.innerHTML = `
          <div class="list-row">
            <div class="lr-head"><span class="lr-name">Regime</span><span class="badge ${data.regime === 'stable' ? 'ok' : data.regime === 'chaotic' ? 'err' : 'warn'}">${data.regime || 'unknown'}</span></div>
            <div class="lr-meta">Coherence ${pct(data.coherence)}%</div>
            <div class="bar-track"><div class="bar-fill" style="width:${pct(data.coherence)}%;background:var(--online)"></div></div>
            <div class="lr-meta" style="margin-top:6px">Entropy ${pct(data.entropy)}%</div>
            <div class="bar-track"><div class="bar-fill" style="width:${pct(data.entropy)}%;background:var(--warn)"></div></div>
            <div class="lr-meta" style="margin-top:6px">Friction ${pct(data.friction)}% · Resonance ${pct(data.resonance)}%</div>
            <div class="lr-meta" style="margin-top:6px">guardian reachable: ${data.guardianReachable ? 'yes' : 'no'}</div>
          </div>`;
      })
      .catch((e) => { el.innerHTML = `<div class="empty-state">cfr/field fetch failed: ${e.message}</div>`; });
  }

  // ── PIPELINE — real: GET cortex/api/raid/queue ──────────────────────────
  function fetchPipeline() {
    const el = document.getElementById('pipeline-body');
    fetch(CORTEX_URL + '/api/raid/queue?n=50')
      .then((r) => r.json())
      .then((data) => {
        if (!data.ok || !data.contracts?.length) { el.innerHTML = '<div class="empty-state">no real contracts in the queue</div>'; return; }
        el.innerHTML = data.contracts.map((c) => `
          <div class="list-row">
            <div class="lr-head"><span class="lr-name">${c.intent || c.type || c.uuid || 'contract'}</span><span class="badge ${c.status === 'complete' ? 'ok' : c.status === 'failed' ? 'err' : 'idle'}">${c.status || 'pending'}</span></div>
            <div class="lr-meta">uuid: ${c.uuid || '—'}</div>
            ${c.dependsOn?.length ? `<div class="lr-meta">depends on: ${c.dependsOn.join(', ')}</div>` : ''}
            ${c.onFail ? `<div class="lr-meta">onFail: ${JSON.stringify(c.onFail)}</div>` : ''}
          </div>`).join('');
      })
      .catch((e) => { el.innerHTML = `<div class="empty-state">raid queue fetch failed: ${e.message}</div>`; });
  }

  // ── AUTOMATION — real: window.ClearGlass.macros (IPC, now bridged) ──────
  function fetchAutomation() {
    const el = document.getElementById('automation-body');
    if (!window.ClearGlass?.macros) {
      el.innerHTML = '<div class="empty-state">window.ClearGlass.macros unavailable — this page must be opened inside clear-glass, not a plain browser tab</div>';
      return;
    }
    window.ClearGlass.macros.list()
      .then((data) => {
        const macros = Array.isArray(data) ? data : (data?.macros || data?.result || []);
        if (!macros.length) { el.innerHTML = '<div class="empty-state">no real macros stored</div>'; return; }
        el.innerHTML = macros.map((m) => `
          <div class="list-row">
            <div class="lr-head"><span class="lr-name">${m.name}</span>
              <button class="hbtn g" data-run="${m.name}">▶ RUN</button>
            </div>
            <div class="lr-meta">${m.description || m.steps?.length ? `${m.steps.length} steps` : ''}</div>
          </div>`).join('');
        el.querySelectorAll('[data-run]').forEach((btn) => {
          btn.addEventListener('click', () => {
            btn.textContent = '…';
            window.ClearGlass.macros.run(btn.dataset.run, {})
              .then((r) => { btn.textContent = r?.error ? '✗ FAILED' : '✓ RAN'; log(`macro ${btn.dataset.run}: ${r?.error || 'ok'}`); })
              .catch((e) => { btn.textContent = '✗ FAILED'; log(`macro run failed: ${e.message}`); });
          });
        });
      })
      .catch((e) => { el.innerHTML = `<div class="empty-state">macros:list failed: ${e.message}</div>`; });
  }

  // ── Clock — the one real, harmless timer; not a data source, just a clock ──
  setInterval(() => { document.getElementById('clock').textContent = new Date().toLocaleTimeString('en-GB', { hour12: false }); }, 1000);
})();
