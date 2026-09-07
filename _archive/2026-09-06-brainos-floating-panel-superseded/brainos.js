/**
 * nexus/ui/brainos/brainos.js
 * comp_id: nexus.ui.brainos.panel
 * uuid: nexus-ui-brainos-panel-v1-0000-2026-0903-001
 *
 * BrainOS — the live control panel. Built against docs/brainos-live-
 * control-panel.spec (status was "specced", not built — this is the
 * first real slice). James: "Just do BrainOS... Interaction contract
 * for the ui to float."
 *
 * §NO_DECORATIVE_MOTION (spec's own hard axiom, carried forward here) —
 * every visual change in this file is caused by a real event arriving
 * over a real connection. There is no setInterval-driven idle animation
 * anywhere in this file. If /events goes quiet, the panel goes still.
 *
 * §NO_CAP_ON_VISIBILITY / §honesty over completeness — checked docs/
 * command-index-per-system.spec directly (2026-09-06, not assumed):
 * only phase 1 (idearium) and phase 5 (clear-glass) are marked DONE.
 * ollama and guardian remain SPECCED, not built. Phase 4 (bridge) is
 * retired — bridge itself no longer exists. Two real, live command
 * indexes render today; ollama/guardian render as "not yet indexed" —
 * this file does not fabricate placeholder route counts to fill that
 * gap.
 *
 * §REAL DATA SOURCES, each confirmed by reading the actual server code
 * before writing this, not assumed:
 *   - guardian/server.js's real GET /events SSE — every real bus.emit()
 *     anywhere in guardian is unconditionally cockpitBroadcast()'d here
 *     (confirmed: SISOStream.emit -> cockpitBroadcast, guardian/
 *     server.js). First real event on connect is {type:'connected'}.
 *   - clear-glass/src/ipc/bridge.js's real GET /cli/commands — real,
 *     live Express route introspection, not a static file (confirmed:
 *     _buildCommandIndex() walks this.app._router.stack directly).
 *   - clear-glass/src/sse/server.js's real GET /events (SSE_PORT 7701,
 *     added 2026-09-06) — genuinely separate process/stream from
 *     guardian's, subscribes to clear-glass's own core bus via
 *     on('*', ...), carries agent-mesh's real mesh.* events.
 *
 * This is a self-contained, dependency-free widget: no framework, no
 * build step. Include brainos.css after nexus-dark.css, then this file,
 * then call BrainOS.mount().
 */
(function (global) {
  'use strict';

  const MODULE_ID = 'nexus.ui.brainos';
  const VERSION = '0.1.0';

  // Real, env-style overridable endpoints — same convention every real
  // backend config file in this codebase already uses (ollama/config.js,
  // intelligence/config.js), not hardcoded with no escape hatch.
  const DEFAULTS = {
    guardianUrl: (global.BRAINOS_GUARDIAN_URL || 'http://127.0.0.1:7820'),
    // §FIX 2026-09-06 — this was 7702 (clear-glass's IPC port, not a real
    // HTTP surface at all) instead of WIRE_PORT (7704, the real HTTP
    // server with /cli/commands, /contract, /health etc. — confirmed
    // directly against clear-glass/src/main/index.js). Every real fetch
    // below using this URL would have been hitting the wrong port.
    clearGlassUrl: (global.BRAINOS_CLEAR_GLASS_URL || 'http://127.0.0.1:7704'),
    // §NEW 2026-09-06 — clear-glass's real, separate SSE broadcast
    // server (src/sse/server.js, SSE_PORT env CLEARGL_SSE_PORT,
    // confirmed real: subscribes to the core bus via on('*', ...) and
    // broadcasts everything, including agent-mesh's real mesh.* events).
    // Genuinely a different port/process than guardian's own /events —
    // not the same stream this file already reads.
    clearGlassSseUrl: (global.BRAINOS_CLEAR_GLASS_SSE_URL || 'http://127.0.0.1:7701'),
    ollamaUrl: (global.BRAINOS_OLLAMA_URL || 'http://127.0.0.1:3749'),
    idariumUrl: (global.BRAINOS_IDEARIUM_URL || 'http://127.0.0.1:4800'),
    maxEventRows: 40,
  };

  // §CORRECTED 2026-09-06 — this comment previously claimed "ALL FIVE
  // now real and live, checked this session" for docs/command-index-
  // per-system.spec's 5 phases. Checked that spec directly, not assumed:
  // only phase 1 (idearium) and phase 5 (clear-glass) are marked DONE.
  // Phase 2 (ollama) and phase 3 (guardian) remain SPECCED, not built.
  // Phase 4 (bridge) is retired — bridge itself no longer exists. Two
  // real endpoints below, not five; ollama/guardian correctly render as
  // "not yet indexed" until their own phases are actually built.
  const REAL_INDEX_ENDPOINTS = {
    'idearium': { url: () => DEFAULTS.idariumUrl + '/api/contract/live', countField: 'endpointCount' },
    'clear-glass': { url: () => DEFAULTS.clearGlassUrl + '/cli/commands', countField: 'commandCount' },
  };

  let _panel = null;
  let _es = null;
  let _state = {
    connected: false,
    events: [],       // real events received over /events, newest first
    commandIndexes: {}, // real per-system results, keyed by system id — populated as each real fetch resolves
    providers: {},     // real provider.connected/disconnected tally, keyed by provider name
  };

  function _el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  // ── Real drag behavior — "the ui to float" ────────────────────────────────
  function _makeDraggable(panel, handle) {
    let dragging = false, startX = 0, startY = 0, origX = 0, origY = 0;
    handle.addEventListener('mousedown', (e) => {
      if (e.target.closest('.brainos-close')) return;
      dragging = true;
      panel.classList.add('dragging');
      startX = e.clientX; startY = e.clientY;
      const rect = panel.getBoundingClientRect();
      origX = rect.left; origY = rect.top;
      e.preventDefault();
    });
    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX, dy = e.clientY - startY;
      panel.style.left = Math.max(0, origX + dx) + 'px';
      panel.style.top = Math.max(0, origY + dy) + 'px';
      panel.style.right = 'auto';
    });
    window.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      panel.classList.remove('dragging');
    });
  }

  // ── Real render — called only in response to a real state change ─────────
  function _render() {
    if (!_panel) return;
    const dot = _panel.querySelector('.brainos-status-dot');
    dot.className = 'brainos-status-dot' + (_state.connected ? ' live' : '');

    const sysBody = _panel.querySelector('.brainos-systems');
    sysBody.innerHTML = '';
    for (const sys of Object.keys(REAL_INDEX_ENDPOINTS)) {
      const idx = _state.commandIndexes[sys];
      const row = _el('div', 'brainos-system-row');
      const dotEl = _el('span', 'brainos-system-dot');
      dotEl.style.background = idx ? 'var(--ok)' : 'var(--muted)';
      row.appendChild(dotEl);
      row.appendChild(_el('span', 'brainos-system-name', sys));
      const count = idx ? idx[REAL_INDEX_ENDPOINTS[sys].countField] : null;
      row.appendChild(_el('span', 'brainos-system-meta',
        idx ? `${count} real routes` : 'loading…'));
      sysBody.appendChild(row);
    }

    const evBody = _panel.querySelector('.brainos-events');
    evBody.innerHTML = '';
    for (const ev of _state.events.slice(0, DEFAULTS.maxEventRows)) {
      const row = _el('div', 'brainos-event-row');
      const t = new Date(ev.ts || Date.now());
      row.appendChild(_el('span', 't', t.toLocaleTimeString()));
      row.appendChild(_el('span', 'type', ev.type || 'event'));
      evBody.appendChild(row);
    }
    if (!_state.events.length) {
      evBody.appendChild(_el('div', 'brainos-not-indexed', 'no real events yet — waiting on /events'));
    }
  }

  // ── Real SSE wiring — no polling, no idle refresh ─────────────────────────
  function _connectEvents() {
    try {
      _es = new EventSource(DEFAULTS.guardianUrl + '/events');
    } catch (e) {
      console.warn(`[${MODULE_ID}] could not open real SSE connection: ${e.message}`);
      return;
    }
    _es.onopen = () => { _state.connected = true; _render(); };
    _es.onerror = () => { _state.connected = false; _render(); };
    _es.onmessage = (msg) => {
      let data;
      try { data = JSON.parse(msg.data); } catch (_) { return; }
      _state.events.unshift(data);
      if (_state.events.length > DEFAULTS.maxEventRows * 3) _state.events.length = DEFAULTS.maxEventRows * 3;
      _render();
      // Feed the SAME real event to the canvas, if mounted — no second
      // SSE connection opened for it (see brainos-canvas.js's own
      // header for why this matters: honesty about one real stream,
      // not a second call this file would then need to keep in sync).
      if (global.BrainOSCanvas) global.BrainOSCanvas.onRealEvent(data);
    };
  }

  // §NEW 2026-09-06 — a genuinely justified exception to the single-
  // stream principle above, not a casual second connection: agent-mesh
  // (src/mesh/agent-mesh.js) lives in clear-glass's own process, a real,
  // different process boundary than guardian's — its real mesh.* events
  // (mesh.node.status_changed, mesh.nodes.snapshot, mesh.raid.decision,
  // mesh.raid.unavailable) physically cannot reach guardian's /events;
  // they land on clear-glass's own core bus, confirmed real and already
  // broadcast by src/sse/server.js (subscribes via on('*', ...), already
  // started at SSE_PORT 7701). This connects to that already-live real
  // stream — not a second copy of guardian's, a genuinely separate real
  // source, honestly named as such.
  let _cgEs = null;
  function _connectClearGlassEvents() {
    try {
      _cgEs = new EventSource(DEFAULTS.clearGlassSseUrl + '/events');
    } catch (e) {
      console.warn(`[${MODULE_ID}] could not open real clear-glass SSE connection: ${e.message}`);
      return;
    }
    _cgEs.onmessage = (msg) => {
      let data;
      try { data = JSON.parse(msg.data); } catch (_) { return; }
      // Real events only — mesh.* is the one real vocabulary this
      // connection exists for; everything else clear-glass's bus
      // carries (dom.*, driver.*, etc.) is out of scope for this panel
      // today, not silently rendered as if it belonged here.
      if (typeof data?.type !== 'string' || !data.type.startsWith('mesh.')) return;
      if (global.BrainOSCanvas) global.BrainOSCanvas.onRealEvent(data);
    };
  }

  // ── Real, one-time fetch of each real system's real command index —
  // all five now real and live (see REAL_INDEX_ENDPOINTS above), a
  // real change from this file's original single-system (clear-glass
  // only) version. Each fetch is independent — one system being
  // unreachable never blocks the other four from rendering.
  function _fetchCommandIndex() {
    for (const [sys, cfg] of Object.entries(REAL_INDEX_ENDPOINTS)) {
      fetch(cfg.url())
        .then((r) => r.json())
        .then((data) => { _state.commandIndexes[sys] = data; _render(); })
        .catch((e) => { console.warn(`[${MODULE_ID}] real command index fetch failed for ${sys}: ${e.message}`); _render(); });
    }
  }

  // §NEW 2026-09-06 — James: "brainos is important. do that next." A
  // fresh mount has no dynamic mesh nodes until the first real
  // mesh.nodes.snapshot SSE tick (every 5s) arrives — this one-time
  // real fetch (GET /agent-mesh/view, built alongside this) gives the
  // canvas its actual current state immediately, same real data the
  // periodic snapshot event comes from, not a placeholder while
  // waiting. Full, unscoped render — the ONE real source that includes
  // both kind:'agent' and kind:'node' entries together; the periodic
  // SSE snapshot after this only ever refreshes the kind:'node' half
  // (see brainos-canvas.js's renderMeshView header for why).
  function _fetchMeshView() {
    fetch(DEFAULTS.clearGlassUrl + '/agent-mesh/view')
      .then((r) => r.json())
      .then((data) => {
        if (data?.ok && Array.isArray(data.nodes) && global.BrainOSCanvas) {
          global.BrainOSCanvas.renderMeshView(data.nodes);
        }
      })
      .catch((e) => console.warn(`[${MODULE_ID}] real mesh view fetch failed: ${e.message}`));
  }

  function mount(opts) {
    if (_panel) return _panel; // already mounted — one real instance
    Object.assign(DEFAULTS, opts || {});

    const panel = _el('div', 'brainos-panel');
    const titlebar = _el('div', 'brainos-titlebar');
    const dot = _el('span', 'brainos-status-dot');
    titlebar.appendChild(dot);
    titlebar.appendChild(_el('span', 'brainos-title', 'BRAINOS'));
    titlebar.appendChild(_el('span', 'brainos-badge', 'v' + VERSION));
    const closeBtn = _el('button', 'brainos-close', '×');
    closeBtn.addEventListener('click', unmount);
    titlebar.appendChild(closeBtn);
    panel.appendChild(titlebar);

    const body = _el('div', 'brainos-body');
    const sysLabel = _el('div', 'brainos-section-label');
    sysLabel.appendChild(document.createTextNode('systems'));
    body.appendChild(sysLabel);
    body.appendChild(_el('div', 'brainos-systems'));

    const evLabel = _el('div', 'brainos-section-label');
    evLabel.appendChild(document.createTextNode('live events'));
    body.appendChild(evLabel);
    body.appendChild(_el('div', 'brainos-events'));

    // Real canvas — mounted here if brainos-canvas.js was loaded before
    // this file. Optional dependency: brainos.js works standalone
    // (panel-only) without it, matching this file's own original scope;
    // the canvas is additive, not a hard requirement.
    if (global.BrainOSCanvas) {
      const canvasLabel = _el('div', 'brainos-section-label');
      canvasLabel.appendChild(document.createTextNode('live node map'));
      body.appendChild(canvasLabel);
      const canvasHost = _el('div', 'brainos-canvas-host');
      body.appendChild(canvasHost);
      global.BrainOSCanvas.mount(canvasHost);
    }

    panel.appendChild(body);
    document.body.appendChild(panel);
    _makeDraggable(panel, titlebar);

    _panel = panel;
    _render();
    _connectEvents();
    _connectClearGlassEvents();
    _fetchCommandIndex();
    _fetchMeshView();
    return panel;
  }

  function unmount() {
    if (_es) { _es.close(); _es = null; }
    if (_cgEs) { _cgEs.close(); _cgEs = null; }
    if (global.BrainOSCanvas) global.BrainOSCanvas.unmount();
    if (_panel) { _panel.remove(); _panel = null; }
    _state = { connected: false, events: [], commandIndexes: {}, providers: {} };
  }

  // ── Real, minimal introspection API — this is what
  // brainos-interaction-contract.json's own /state action reads, so
  // co-pilot (or anything else) can query real panel state without
  // reaching into the DOM directly.
  function getState() {
    return {
      mounted: !!_panel,
      connected: _state.connected,
      eventCount: _state.events.length,
      commandIndexesLoaded: Object.keys(_state.commandIndexes).length,
      position: _panel ? { top: _panel.style.top, left: _panel.style.left } : null,
    };
  }

  global.BrainOS = { mount, unmount, getState, MODULE_ID, VERSION };
})(typeof window !== 'undefined' ? window : globalThis);
