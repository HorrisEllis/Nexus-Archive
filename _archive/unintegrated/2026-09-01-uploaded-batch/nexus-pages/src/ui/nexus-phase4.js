/* NEXUS v0.53.0 — nexus-phase4.js
 * Phase 4: Bridge Tab — live polling, START/STOP/RESTART, log viewer,
 *          UUID tracking, P2P stub wiring, HELP topics.
 * Phase 0B — extracted 2026-04-07
 */

'use strict';
(function nexusPhase4Bridge() {

  /* ── constants ──────────────────────────────────────────────── */
  const POLL_MS     = 10_000;
  const LOG_LIMIT   = 200;

  let _pollTimer    = null;
  let _logTimer     = null;
  let _streaming    = false;
  let _logEs        = null;   // EventSource for SSE log stream

  /* ── HookIDs ────────────────────────────────────────────────── */
  const HOOKS = [
    { id:'bridge:tab:open',         label:'Bridge Tab — opened'                },
    { id:'bridge:tab:connect',      label:'Bridge Tab — connect button'        },
    { id:'bridge:tab:start',        label:'Bridge Tab — start bridge'          },
    { id:'bridge:tab:stop',         label:'Bridge Tab — stop bridge'           },
    { id:'bridge:tab:restart',      label:'Bridge Tab — restart bridge'        },
    { id:'bridge:tab:health-poll',  label:'Bridge Tab — health polled'         },
    { id:'bridge:tab:log-fetch',    label:'Bridge Tab — log fetched'           },
    { id:'bridge:tab:log-stream',   label:'Bridge Tab — SSE log stream opened' },
    { id:'bridge:tab:log-clear',    label:'Bridge Tab — log cleared'           },
    { id:'bridge:tab:cfg-save',     label:'Bridge Tab — config saved'          },
    { id:'bridge:tab:p2p-start',    label:'Bridge Tab — P2P start stub'       },
    { id:'bridge:tab:p2p-stop',     label:'Bridge Tab — P2P stop stub'        },
  ];

  function registerHooks() {
    try {
      if (!window.NEXUS?.registry) return;
      HOOKS.forEach(h => {
        window.NEXUS.registry.register({
          id:          h.id,
          label:       h.label,
          status:      'active',
          prefix:      'bridge',
          settingsPath:'options.bridge',
          builderFields: [],
          test: () => ({ ok: true, message: h.label + ' — registered' }),
        });
      });
    } catch {}
  }

  function emit(hookId, data = {}) {
    try {
      if (window.NEXUS?.bus) window.NEXUS.bus.emit(hookId, { payload: data });
      if (typeof UUID !== 'undefined') UUID.gen('action', { hookId, ...data }, hookId);
      if (typeof log_ev === 'function') log_ev(hookId, data, 'INFO');
    } catch {}
  }

  /* ── helpers ────────────────────────────────────────────────── */
  const $  = id => document.getElementById(id);
  const bUrl = () => ($('bridge-url')?.value?.trim()) || 'http://127.0.0.1:3747';

  async function bFetch(path, opts = {}) {
    const key = $('bridge-api-key')?.value?.trim();
    const headers = { 'Content-Type': 'application/json' };
    if (key) headers['X-API-Key'] = key;
    return fetch(bUrl() + path, { headers, signal: AbortSignal.timeout(6000), ...opts });
  }

  function setCard(id, val, color) {
    const el = $(id);
    if (!el) return;
    el.textContent = val;
    if (color) el.style.color = color;
  }

  function fmtUptime(secs) {
    if (!secs) return '—';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }

  function fmtBytes(bytes) {
    if (!bytes) return '—';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  }

  /* ── health poll ─────────────────────────────────────────────── */
  async function pollHealth() {
    const pill    = $('bridge-opt-pill');
    const pillTxt = $('bridge-opt-pill-txt');
    const badge   = $('bridge-srv-badge');

    try {
      const r = await bFetch('/health');
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const d = await r.json();

      /* top pill */
      if (pill)    pill.className    = 'pill pill-ok';
      if (pillTxt) pillTxt.textContent = 'ONLINE';
      if (badge)   { badge.textContent = 'ONLINE'; badge.style.color = 'var(--g)'; }

      /* metric cards */
      setCard('bh-status',  'OK',              'var(--g)');
      setCard('bh-version', d.version || '—',  'var(--c)');
      setCard('bh-uptime',  fmtUptime(d.uptime), 'var(--c)');
      setCard('bh-memory',  fmtBytes(d.memory?.heapUsed), 'var(--c)');

      /* extended info row */
      const info = $('bridge-info-row');
      if (info) {
        info.innerHTML =
          `<span style="color:var(--text3)">host:</span> ${d.host || '127.0.0.1'}:${d.port || 3747} &nbsp;|&nbsp; ` +
          `<span style="color:var(--text3)">data:</span> ${d.dataDir || '—'} &nbsp;|&nbsp; ` +
          `<span style="color:var(--text3)">profile:</span> ${d.activeProfile || 'none'}`;
      }

      /* global BRIDGE state */
      if (typeof BRIDGE !== 'undefined') {
        BRIDGE.connected = true;
        BRIDGE.health    = d;
      }

      emit('bridge:tab:health-poll', { version: d.version, uptime: d.uptime });

    } catch {
      if (pill)    pill.className    = 'pill pill-err';
      if (pillTxt) pillTxt.textContent = 'OFFLINE';
      if (badge)   { badge.textContent = 'OFFLINE'; badge.style.color = 'var(--r)'; }
      setCard('bh-status', 'OFFLINE', 'var(--r)');
      setCard('bh-version', '—');
      setCard('bh-uptime',  '—');
      setCard('bh-memory',  '—');
      if (typeof BRIDGE !== 'undefined') BRIDGE.connected = false;
    }
  }

  /* ── log viewer ──────────────────────────────────────────────── */
  async function fetchLog() {
    const container = $('bridge-log-container');
    if (!container) return;

    try {
      const r = await bFetch(`/log?limit=${LOG_LIMIT}`);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const d = await r.json();
      renderLog(d.logs || [], container);
      emit('bridge:tab:log-fetch', { count: (d.logs || []).length });
    } catch (e) {
      container.innerHTML = `<div style="color:var(--r);font-size:9px;padding:6px">Log unavailable: ${e.message}</div>`;
    }
  }

  function renderLog(events, container) {
    if (!container) return;
    const typeColor = {
      'http:req': 'var(--text3)', 'http:res': 'var(--text3)',
      'ai:response': 'var(--g)',  'ai:error': 'var(--r)',
      'error': 'var(--r)',        'warn': 'var(--y)',
      'bridge:connected': 'var(--c)', 'pw:': 'var(--m)',
      'ollama:': 'var(--c)',
    };
    const esc2 = s => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    container.innerHTML = events.slice().reverse().map(e => {
      const color = Object.entries(typeColor).find(([k]) => (e.type||'').startsWith(k))?.[1] || 'var(--text2)';
      const ts    = new Date(e.ts || e.time || Date.now()).toTimeString().slice(0,8);
      const data  = e.data ? ' ' + JSON.stringify(e.data).slice(0, 80) : '';
      return `<div style="display:flex;gap:6px;padding:2px 0;border-bottom:1px solid rgba(26,42,64,.4);font-size:9px;">` +
        `<span style="color:var(--text4);flex-shrink:0;font-family:var(--mono)">${ts}</span>` +
        `<span style="color:${color};flex-shrink:0;font-family:var(--display);font-size:8px;letter-spacing:.06em;min-width:120px">${esc2(e.type||'?')}</span>` +
        `<span style="color:var(--text3);font-family:var(--mono);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc2(data)}</span>` +
        `</div>`;
    }).join('');
  }

  function startLogStream() {
    if (_streaming || !window.EventSource) return;
    stopLogStream();
    try {
      _logEs = new EventSource(bUrl() + '/events');
      _logEs.onmessage = e => {
        try {
          const evt = JSON.parse(e.data);
          const container = $('bridge-log-container');
          if (!container) return;
          const existing = container.innerHTML;
          const esc2 = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
          const ts = new Date().toTimeString().slice(0,8);
          const data = evt.data ? ' ' + JSON.stringify(evt.data).slice(0,80) : '';
          const newRow = `<div style="display:flex;gap:6px;padding:2px 0;border-bottom:1px solid rgba(26,42,64,.4);font-size:9px;animation:evtIn .2s ease">` +
            `<span style="color:var(--text4);flex-shrink:0;font-family:var(--mono)">${ts}</span>` +
            `<span style="color:var(--c);flex-shrink:0;font-family:var(--display);font-size:8px;min-width:120px">${esc2(evt.type||'?')}</span>` +
            `<span style="color:var(--text3);font-family:var(--mono);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc2(data)}</span>` +
            `</div>`;
          container.insertAdjacentHTML('afterbegin', newRow);
          /* cap to LOG_LIMIT rows */
          while (container.children.length > LOG_LIMIT) container.lastChild.remove();
        } catch {}
      };
      _logEs.onerror = () => { _streaming = false; };
      _streaming = true;
      emit('bridge:tab:log-stream', {});
    } catch {}
  }

  function stopLogStream() {
    if (_logEs) { try { _logEs.close(); } catch {} _logEs = null; }
    _streaming = false;
  }

  /* ── START / STOP / RESTART ──────────────────────────────────── */
  window.bridgeTabStart = async function() {
    emit('bridge:tab:start', {});
    try {
      if (window.nexus?.bridgeStart) {
        const ok = await window.nexus.bridgeStart();
        if (typeof toast === 'function') toast(ok ? 'Bridge starting…' : 'Bridge already running', ok ? 'ok' : 'warn');
      } else {
        if (typeof toast === 'function') toast('Run: node bridge/nexus-bridge-server.js', 'info', 5000);
      }
    } catch (e) {
      if (typeof nxError === 'function') nxError('BRIDGE_START', 'Start failed', e.message, 'bridge:tab');
    }
    setTimeout(pollHealth, 1500);
  };

  window.bridgeTabStop = async function() {
    emit('bridge:tab:stop', {});
    stopLogStream();
    try {
      if (window.nexus?.bridgeStop) {
        await window.nexus.bridgeStop();
        if (typeof toast === 'function') toast('Bridge stopped', 'ok');
      }
    } catch {}
    setTimeout(pollHealth, 800);
  };

  window.bridgeTabRestart = async function() {
    emit('bridge:tab:restart', {});
    stopLogStream();
    if (typeof toast === 'function') toast('Restarting bridge…', 'ok');
    try {
      if (window.nexus?.bridgeStop) await window.nexus.bridgeStop();
    } catch {}
    await new Promise(r => setTimeout(r, 1200));
    try {
      if (window.nexus?.bridgeStart) await window.nexus.bridgeStart();
    } catch {}
    setTimeout(() => { pollHealth(); fetchLog(); startLogStream(); }, 2000);
  };

  window.bridgeTabClearLog = function() {
    const c = $('bridge-log-container');
    if (c) c.innerHTML = '<div style="color:var(--text3);font-size:9px;padding:6px;font-style:italic">Log cleared.</div>';
    emit('bridge:tab:log-clear', {});
  };

  window.bridgeTabSaveCfg = function() {
    const url = $('bridge-url')?.value?.trim();
    const key = $('bridge-api-key')?.value?.trim();
    if (!url) { if (typeof toast === 'function') toast('URL required', 'warn'); return; }
    try {
      const cfg = JSON.parse(localStorage.getItem('nx6_cfg') || '{}');
      cfg.bridgeUrl = url;
      if (key) cfg.bridgeApiKey = key;
      localStorage.setItem('nx6_cfg', JSON.stringify(cfg));
    } catch {}
    if (typeof BRIDGE !== 'undefined') BRIDGE.url = url;
    if (typeof toast === 'function') toast('Bridge config saved', 'ok');
    emit('bridge:tab:cfg-save', { url });
    pollHealth();
  };

  /* ── P2P controls — wired to bridge nexus-p2p-router.js ─────── */
  const _p2pBridgeUrl = () => (typeof val === 'function' ? val('bridge-url') : null) || 'http://127.0.0.1:3747';

  async function _p2pFetch(path, method='GET', body=null) {
    try {
      const r = await fetch(_p2pBridgeUrl() + path, {
        method, headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : null,
      });
      return r.ok ? await r.json() : null;
    } catch { return null; }
  }

  window.p2pStart = async function() {
    emit('bridge:tab:p2p-start', {});
    const badge = $('p2p-status-badge');
    if (badge) { badge.textContent = 'STARTING…'; badge.style.color = 'var(--y)'; }
    const r = await _p2pFetch('/p2p/start', 'POST', {});
    if (r?.ok) {
      if (badge) { badge.textContent = 'ONLINE'; badge.style.color = 'var(--g)'; }
      const peerEl = $('p2p-peer-id'); if (peerEl) peerEl.value = r.peerId || '';
      if (typeof toast === 'function') toast('P2P started · peer: ' + (r.peerId||'?'), 'ok');
    } else {
      if (badge) { badge.textContent = 'OFFLINE'; badge.style.color = 'var(--r)'; }
      if (typeof toast === 'function') toast('P2P start failed — bridge offline or peerjs not installed', 'warn');
    }
  };

  window.p2pStop = async function() {
    emit('bridge:tab:p2p-stop', {});
    const r = await _p2pFetch('/p2p/stop', 'POST', {});
    const badge = $('p2p-status-badge');
    if (badge) { badge.textContent = 'OFF'; badge.style.color = ''; }
    if (typeof toast === 'function') toast(r?.ok ? 'P2P stopped' : 'P2P stop — bridge offline', r?.ok ? 'warn' : 'warn');
  };

  window.p2pConnect = async function() {
    const remoteId = (typeof val === 'function' ? val('p2p-remote-id') : '') || '';
    const peerName = (typeof val === 'function' ? val('p2p-peer-name') : '') || remoteId;
    if (!remoteId) { if (typeof toast === 'function') toast('Enter a remote peer ID first', 'warn'); return; }
    const r = await _p2pFetch('/p2p/connect', 'POST', { peerId: remoteId, label: peerName });
    if (r?.ok) {
      if (typeof toast === 'function') toast('Peer added: ' + remoteId, 'ok');
      window.p2pRefresh();
    } else {
      if (typeof toast === 'function') toast('Peer connect failed — bridge offline or P2P not started', 'warn');
    }
  };

  window.p2pRefresh = async function() {
    const r = await _p2pFetch('/p2p/status');
    const badge = $('p2p-status-badge');
    const peerEl = $('p2p-peer-id');
    const listEl = $('p2p-peers-list');
    if (!r) {
      if (badge) { badge.textContent = 'OFFLINE'; badge.style.color = 'var(--r)'; }
      return;
    }
    if (badge) { badge.textContent = r.running ? 'ONLINE' : 'OFF'; badge.style.color = r.running ? 'var(--g)' : ''; }
    if (peerEl && r.peerId) peerEl.value = r.peerId;
    if (listEl) {
      const peers = r.peers || [];
      if (!peers.length) {
        listEl.innerHTML = '<div style="font-size:10px;color:var(--text3);font-style:italic">No peers.</div>';
      } else {
        listEl.innerHTML = peers.map(p =>
          '<div style="display:flex;align-items:center;gap:8px;padding:5px 10px;background:var(--bg2);border:1px solid var(--border2);border-radius:2px;font-size:10px;margin-bottom:3px">' +
          '<span style="font-family:var(--display);font-size:11px;color:var(--c)">' + (p.label||p.id||p) + '</span>' +
          '<span style="color:var(--text3);flex:1">' + (p.peerId||p.id||'') + '</span>' +
          '<span style="color:' + (p.connected?'var(--g)':'var(--r)') + '">' + (p.connected?'●':'○') + '</span>' +
          '</div>'
        ).join('');
      }
    }
  };

  // Auto-refresh P2P status when bridge tab opens
  setTimeout(window.p2pRefresh, 1000);

  /* ── inject enhanced controls into existing bridge panel ─────── */
  function enhanceBridgePanel() {
    const srvBody = document.querySelector('#acc-bridge-srv .acc-body');
    if (!srvBody || srvBody.dataset.p4) return;
    srvBody.dataset.p4 = '1';

    /* START / STOP / RESTART buttons row */
    const ctrlRow = document.createElement('div');
    ctrlRow.style.cssText = 'display:flex;gap:6px;margin-top:10px;flex-wrap:wrap;';
    ctrlRow.innerHTML =
      `<button class="btn ok" style="font-size:9px" onclick="bridgeTabStart()">▶ START</button>` +
      `<button class="btn danger" style="font-size:9px" onclick="bridgeTabStop()">■ STOP</button>` +
      `<button class="btn" style="font-size:9px;color:var(--y);border-color:rgba(255,204,0,.3)" onclick="bridgeTabRestart()">⟳ RESTART</button>` +
      `<button class="btn" style="font-size:9px;margin-left:auto" onclick="bridgeTabSaveCfg()">💾 SAVE</button>`;
    srvBody.appendChild(ctrlRow);

    /* info row */
    const infoRow = document.createElement('div');
    infoRow.id = 'bridge-info-row';
    infoRow.style.cssText = 'margin-top:6px;font-family:var(--mono);font-size:8px;color:var(--text3);line-height:1.7;';
    infoRow.textContent = 'Connect to bridge to see details';
    srvBody.appendChild(infoRow);

    /* event log section */
    const logSection = document.createElement('div');
    logSection.style.cssText = 'margin-top:12px;';
    logSection.innerHTML =
      `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">` +
        `<span style="font-family:var(--display);font-size:9px;letter-spacing:.14em;color:var(--text3)">BRIDGE EVENT LOG</span>` +
        `<div id="bridge-stream-dot" style="width:5px;height:5px;border-radius:50%;background:var(--text4);flex-shrink:0;transition:all .3s"></div>` +
        `<div style="margin-left:auto;display:flex;gap:4px;">` +
          `<button class="btn" style="font-size:8px;padding:1px 6px;color:var(--c)" onclick="fetchLog();startLogStream()">▶ LIVE</button>` +
          `<button class="btn" style="font-size:8px;padding:1px 6px" onclick="fetchLog()">↻ FETCH</button>` +
          `<button class="btn" style="font-size:8px;padding:1px 6px" onclick="bridgeTabClearLog()">✕</button>` +
        `</div>` +
      `</div>` +
      `<div id="bridge-log-container" style="` +
        `max-height:180px;overflow-y:auto;` +
        `background:var(--bg);border:1px solid var(--border2);border-radius:3px;` +
        `padding:6px 8px;font-family:var(--mono);` +
      `"><div style="color:var(--text3);font-size:9px;font-style:italic">Click LIVE or FETCH to load bridge events.</div></div>`;
    srvBody.appendChild(logSection);

    /* stream indicator dot update */
    setInterval(() => {
      const dot = $('bridge-stream-dot');
      if (dot) {
        if (_streaming) {
          dot.style.background = 'var(--g)';
          dot.style.boxShadow  = '0 0 6px var(--g)';
          dot.style.animation  = 'ppulse 2s infinite';
        } else {
          dot.style.background = 'var(--text4)';
          dot.style.boxShadow  = 'none';
          dot.style.animation  = '';
        }
      }
    }, 2000);
  }

  /* ── HELP topic injection ────────────────────────────────────── */
  function injectHelpTopics() {
    if (typeof HELP_TOPICS === 'undefined') return;
    /* Avoid duplicate injection */
    if (HELP_TOPICS.find(t => t.id === 'bridge-tab-config')) return;

    HELP_TOPICS.push({
      id:    'bridge-tab-config',
      title: 'Bridge Tab — Configuration',
      icon:  '⟁',
      content: `<h3 style="color:var(--c);font-family:var(--display);letter-spacing:.18em">⟁ BRIDGE TAB — CONFIGURATION</h3>
<p style="font-size:11px;line-height:1.8;">The Bridge Tab in OPTIONS → BRIDGE provides full control over the NEXUS bridge server running on port 3747.</p>
<p style="margin-top:10px;font-size:11px;"><strong>URL + Port</strong></p>
<p style="font-size:11px;line-height:1.8;">Default: <code style="color:var(--c)">http://127.0.0.1:3747</code>. Change via env <code style="color:var(--c)">NEXUS_API_PORT</code> or edit the URL field and click SAVE. The API key field is optional but strongly recommended — set <code style="color:var(--c)">NEXUS_API_KEY</code> in your environment.</p>
<p style="margin-top:10px;font-size:11px;"><strong>Metric Cards</strong></p>
<ul style="padding-left:18px;font-size:11px;line-height:1.8;">
<li><strong style="color:var(--c)">STATUS</strong> — OK or OFFLINE</li>
<li><strong style="color:var(--c)">VERSION</strong> — bridge server version from <code>/health</code></li>
<li><strong style="color:var(--c)">UPTIME</strong> — seconds since bridge started, formatted as Xh Xm</li>
<li><strong style="color:var(--c)">MEMORY</strong> — Node.js heap used in MB</li>
</ul>
<p style="margin-top:10px;font-size:11px;"><strong>Controls</strong></p>
<ul style="padding-left:18px;font-size:11px;line-height:1.8;">
<li><strong style="color:var(--g)">▶ START</strong> — Spawn bridge via Electron IPC <code>nexus:bridge-start</code></li>
<li><strong style="color:var(--r)">■ STOP</strong> — SIGTERM via <code>nexus:bridge-stop</code></li>
<li><strong style="color:var(--y)">⟳ RESTART</strong> — Stop → wait 1.2s → start</li>
<li><strong>💾 SAVE</strong> — Persist URL + API key to <code>nx6_cfg</code></li>
</ul>
<p style="margin-top:10px;font-size:11px;"><strong>Event Log</strong></p>
<p style="font-size:11px;line-height:1.8;">▶ LIVE opens an SSE stream from <code>/events</code> — every bridge bus event appears in real time. ↻ FETCH pulls the last 200 events from <code>/log</code>. The stream dot pulses green when live.</p>
<p style="margin-top:10px;font-size:11px;"><strong>P2P / WebRTC</strong></p>
<p style="font-size:11px;line-height:1.8;">The P2P section is stubbed — controls are present and hookIDs registered. Full activation in Phase 22. See HELP → BRIDGE & EXTENSION → WebRTC & P2P when available.</p>`
    });

    HELP_TOPICS.push({
      id:    'bridge-architecture',
      title: 'Bridge Architecture',
      icon:  '⟁',
      content: `<h3 style="color:var(--c);font-family:var(--display);letter-spacing:.18em">⟁ BRIDGE ARCHITECTURE</h3>
<p style="font-size:11px;line-height:1.8;">The NEXUS bridge is a Node.js HTTP server running as a child process of the Electron main process. It handles all AI routing, browser control, and data operations that cannot run in the renderer.</p>
<div style="background:var(--bg2);border:1px solid var(--border);border-radius:3px;padding:12px;margin:10px 0;font-family:var(--mono);font-size:9px;line-height:1.9;color:var(--text2);">
nexus.html (renderer)<br>
&nbsp;&nbsp;↓ fetch / window.nexus.* IPC<br>
main.js (Electron main)<br>
&nbsp;&nbsp;↓ child_process.spawn<br>
bridge/nexus-bridge-server.js :3747<br>
&nbsp;&nbsp;├── AI routing (direct API + Guardian)<br>
&nbsp;&nbsp;├── nexus-guardian.js<br>
&nbsp;&nbsp;├── adapters.js (3 of 17 PW adapters)<br>
&nbsp;&nbsp;├── router.js (fallback chain)<br>
&nbsp;&nbsp;├── account-manager.js (cookies/sessions)<br>
&nbsp;&nbsp;├── delta.js (Obsidian/Notion/Discord)<br>
&nbsp;&nbsp;└── nexus-ollama-service.py :3748 (Phase 3)
</div>
<p style="font-size:11px;line-height:1.8;"><strong>Key endpoints:</strong> <code>/health</code> · <code>/v1/messages</code> · <code>/bridge/route</code> · <code>/accounts</code> · <code>/guardian/*</code> · <code>/ollama/*</code> · <code>/events</code> (SSE) · <code>/log</code></p>
<p style="margin-top:8px;font-size:11px;line-height:1.8;">The bridge emits all events to an internal bus. Every bus event is also stored in a 5,000-event ring buffer (queryable via <code>GET /log</code>) and streamed via SSE on <code>GET /events</code>.</p>`
    });

    /* Re-render topics list if HELP is open */
    if (typeof helpInitTopics === 'function') try { helpInitTopics(); } catch {}
  }

  /* ── polling lifecycle ───────────────────────────────────────── */
  function startPolling() {
    if (_pollTimer) return;
    pollHealth();
    _pollTimer = setInterval(pollHealth, POLL_MS);
  }
  function stopPolling() {
    if (_pollTimer) { clearInterval(_pollTimer); _pollTimer = null; }
    stopLogStream();
  }

  /* Watch for bridge tab becoming active */
  function watchBridgeTab() {
    /* Hook into optSwitchTab */
    const _orig = typeof optSwitchTab === 'function' ? optSwitchTab.bind(window) : null;
    if (_orig) {
      window.optSwitchTab = function(tab, btn) {
        _orig(tab, btn);
        if (tab === 'bridge') {
          emit('bridge:tab:open', {});
          enhanceBridgePanel();
          startPolling();
          setTimeout(fetchLog, 400);
        } else {
          stopPolling();
        }
      };
    }

    /* Also watch acc-bridge-srv accordion open */
    const srvHead = document.querySelector('#acc-bridge-srv .acc-head');
    if (srvHead) {
      srvHead.addEventListener('click', () => {
        setTimeout(() => {
          enhanceBridgePanel();
          pollHealth();
        }, 100);
      });
    }
  }

  /* ── boot ────────────────────────────────────────────────────── */
  function whenReady(fn) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') setTimeout(fn, 200);
    else window.addEventListener('load', () => setTimeout(fn, 200));
  }

  whenReady(() => {
    registerHooks();
    watchBridgeTab();
    injectHelpTopics();
    /* If bridge tab is already active on load, start polling */
    const bridgeSub = document.getElementById('optsub-bridge');
    if (bridgeSub?.dataset?.active === 'true' || bridgeSub?.style?.display !== 'none') {
      enhanceBridgePanel();
      startPolling();
    }
  });

  console.log('[NEXUS v0.53.0] Phase 4 loaded — Bridge Tab enhanced.');

})();
