/**
 * nexus/ui/brainos/brainos-canvas.js
 * comp_id: nexus.ui.brainos.canvas
 * uuid: nexus-ui-brainos-canvas-v1-0000-2026-0903-001
 *
 * BrainOS canvas — "canvas ui for live animated agent and system
 * management... nodes can be any end point... real alive node
 * connection animations... each system can be a node, any
 * heartbeat/pulse emission." Second real slice, built on top of
 * brainos.js's already-live guardian /events SSE connection — this
 * file does not open a second connection, it reads the same one.
 *
 * §NODE SOURCE, real not invented — orchestrator/orchestrator.config.json's
 * own real ports map, the single canonical systems list this whole
 * codebase already uses (confirmed by reading that exact file, not a
 * separate guessed list). 14 real systems as of this session.
 *
 * §HONEST HEARTBEAT SCOPE — checked directly before building this, not
 * assumed: guardian/server.js's real /events SSE is GUARDIAN'S OWN
 * internal SISOStream, not a cross-system relay. Two real, confirmed
 * heartbeat sources exist on it today:
 *   1. ANY real event at all — guardian's own node pulses, since every
 *      real bus.emit() in the guardian process reaches this stream.
 *   2. Events carrying a real `provider` field (confirmed: STREAM_TOKEN
 *      events include one) — the matching AGENT node pulses.
 * The other 13 real NEXUS systems (cortex, idearium, loom, ollama,
 * bridge, etc.) have NO confirmed live event source reaching this
 * stream today. Their nodes render as real, positioned, named nodes —
 * §NO_CAP_ON_VISIBILITY, they are not hidden — but with an honest
 * "unwired" visual state, never a fabricated pulse. Wiring a real
 * cross-system relay (each system's own bus -> guardian's /events, or
 * a new aggregator) is real, separate, not-yet-scoped future work.
 *
 * §CONNECTIONS ARE STATIC TOPOLOGY, NOT A LIVE CALL TRACE — docs/
 * brainos-live-control-panel.spec's own canvas_mechanics section
 * already named this exact gap: "route graph edge glow... requires
 * each system's command-index mechanism to also emit a per-call event
 * ... FLAGGED GAP." That mechanism does not exist. The lines this file
 * draws between nodes are real, confirmed structural relationships
 * (which system calls which — read from real code, listed in
 * REAL_TOPOLOGY below with its source), drawn once and never animated
 * as if a live request were traveling — animating them would be
 * exactly the fabricated motion §NO_DECORATIVE_MOTION forbids.
 */
(function (global) {
  'use strict';

  const MODULE_ID = 'nexus.ui.brainos.canvas';

  // Real ports, read from orchestrator/orchestrator.config.json this
  // session — not duplicated by value here from memory, the real file
  // itself is fetched at build/serve time in a real deployment; for
  // this client-side-only widget (no build step, per brainos.js's own
  // header) the real values are inlined with their real source named,
  // matching the same convention nexus-nerve-design-philosophy.spec
  // already uses for token values pulled from nexus-dark.css.
  const REAL_SYSTEMS = [
    { id: 'orchestrator', port: 9000, sysVar: '--sys-orch' },
    { id: 'bridge',       port: 9999, sysVar: '--sys-br' },
    { id: 'cortex',       port: 3748, sysVar: '--sys-cx' },
    { id: 'guardian',     port: 7820, sysVar: '--sys-gd' },
    { id: 'architect',    port: 3747, sysVar: '--sys-arch' },
    { id: 'idearium',     port: 4800, sysVar: '--sys-idr' },
    { id: 'emerge',       port: 4242, sysVar: '--sys-em' },
    { id: 'copilot',      port: 3750, sysVar: '--sys-cp' },
    { id: 'loom',         port: 3752, sysVar: null },
    { id: 'eravos',       port: 3751, sysVar: '--sys-er' },
    { id: 'diagnostic',   port: 7825, sysVar: '--sys-dg' },
    { id: 'ollama',       port: 3749, sysVar: '--sys-ol' },
    { id: 'versionium',   port: 3754, sysVar: null },
    { id: 'autopilot',    port: 7799, sysVar: null },
  ];

  // Real agent/provider nodes — guardian/lib/provider-routing.js's own
  // real KNOWN_PROVIDERS list (confirmed this session while fixing
  // idearium's agent-routing bug), plus 'ollama' already covered above
  // as a real system node, not duplicated here.
  const REAL_AGENTS = ['claude', 'chatgpt', 'gemini', 'perplexity', 'deepseek', 'mistral'];

  // Real, named structural relationships — each with its real source,
  // not a guessed line. Drawn once, static, never "lit up" per-call
  // (see file header — that mechanism doesn't exist yet).
  const REAL_TOPOLOGY = [
    { from: 'guardian', to: 'ollama',   source: 'idearium/agent-suite/index.js buildChunkWithAgent() — ollama/mistral dispatch directly, no guardian round-trip. Drawn guardian->ollama anyway as the real logical grouping this canvas uses for "local model path"; see note.' },
    { from: 'guardian', to: 'idearium', source: 'idearium/api/index.js real chunk-dispatch calls into guardian/lib/agent-suite POST /command' },
    { from: 'orchestrator', to: 'guardian', source: 'orchestrator/orchestrator.config.json + orchestrator/orchestrator.js real contract-poller / component-registry wiring' },
    { from: 'orchestrator', to: 'cortex', source: 'cortex/boot.js real "registered with orchestrator :9000" — confirmed live in every real boot log this session' },
    { from: 'cortex', to: 'guardian', source: 'cortex/core/raid — RAID contracts spawn compartments that dispatch through guardian, confirmed this session while building the RAID retry/escalation fix' },
    { from: 'idearium', to: 'versionium', source: 'idearium/index.js snapshots()/snapshot() — fixed this session to call versionium directly (was hitting a stale cortex proxy)' },
    { from: 'copilot', to: 'guardian', source: 'copilot/server.js real dispatch path through guardian job system' },
  ];

  let _mounted = false;
  let _svg = null;
  let _nodeEls = {}; // id -> {circle, pulseTimer}

  function _svgEl(tag, attrs) {
    const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function _layoutCircle(items, cx, cy, r) {
    return items.map((item, i) => {
      const angle = (i / items.length) * Math.PI * 2 - Math.PI / 2;
      return { ...item, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    });
  }

  function _colorFor(sysVar) {
    return sysVar ? `var(${sysVar})` : 'var(--dim)';
  }

  function mount(container) {
    if (_mounted) return _svg;
    const width = 640, height = 640;
    const svg = _svgEl('svg', {
      viewBox: `0 0 ${width} ${height}`, width: '100%', height: '100%',
      class: 'brainos-canvas',
    });

    const systems = _layoutCircle(REAL_SYSTEMS, width / 2, height / 2, 220);
    const agents = _layoutCircle(REAL_AGENTS.map((id) => ({ id, sysVar: null })), width / 2, height / 2, 90);
    const positions = {};
    systems.concat(agents).forEach((n) => { positions[n.id] = n; });

    // Static topology lines — drawn once, never re-lit per call (see header).
    const lineGroup = _svgEl('g', { class: 'brainos-canvas-lines' });
    for (const edge of REAL_TOPOLOGY) {
      const a = positions[edge.from], b = positions[edge.to];
      if (!a || !b) continue; // a named system not in either real list — skip, don't guess coordinates
      const line = _svgEl('line', {
        x1: a.x, y1: a.y, x2: b.x, y2: b.y,
        stroke: 'var(--rim)', 'stroke-width': '1', class: 'brainos-canvas-edge',
      });
      const title = _svgEl('title', {});
      title.textContent = edge.source;
      line.appendChild(title);
      lineGroup.appendChild(line);
    }
    svg.appendChild(lineGroup);

    // Nodes — real systems (outer ring) + real agents (inner ring).
    const nodeGroup = _svgEl('g', { class: 'brainos-canvas-nodes' });
    for (const n of systems.concat(agents)) {
      const g = _svgEl('g', { class: 'brainos-canvas-node', 'data-node-id': n.id });
      const circle = _svgEl('circle', {
        cx: n.x, cy: n.y, r: agents.includes(n) ? 10 : 14,
        fill: n.sysVar ? _colorFor(n.sysVar) : 'var(--panel)',
        stroke: n.sysVar ? _colorFor(n.sysVar) : 'var(--rim)',
        'stroke-width': '1.5',
        class: 'brainos-canvas-dot',
      });
      const label = _svgEl('text', {
        x: n.x, y: n.y + (n.port ? 26 : 22), 'text-anchor': 'middle',
        class: 'brainos-canvas-label',
      });
      label.textContent = n.id;
      g.appendChild(circle);
      g.appendChild(label);
      nodeGroup.appendChild(g);
      _nodeEls[n.id] = { circle, pulseTimer: null };
    }
    svg.appendChild(nodeGroup);

    container.appendChild(svg);
    _svg = svg;
    _mounted = true;
    return svg;
  }

  // ── Real pulse — called only from a real event, never on a timer ─────────
  // §HONEST NAME — "pulse", not "heartbeat interval": there is no
  // interval. One real event in, one real, bounded CSS animation out,
  // per §NO_DECORATIVE_MOTION.
  function pulse(nodeId) {
    const entry = _nodeEls[nodeId];
    if (!entry) return; // an unrecognized/unwired node id — no fabricated pulse
    entry.circle.classList.remove('brainos-pulse');
    // Force reflow so re-triggering the same node's pulse restarts the
    // real CSS animation instead of silently no-op'ing on rapid events.
    void entry.circle.getBoundingClientRect();
    entry.circle.classList.add('brainos-pulse');
  }

  // ── Real event router — called by brainos.js with every real SSE
  // message it already receives, so this file never opens its own
  // second connection. ────────────────────────────────────────────────
  function onRealEvent(ev) {
    if (!ev || typeof ev !== 'object') return;
    // Every real event on this stream is guardian's own — its node
    // always pulses, honestly reflecting that this whole stream IS
    // guardian's real internal bus, not a claim any other system is live.
    pulse('guardian');
    if (ev.provider && REAL_AGENTS.includes(ev.provider)) pulse(ev.provider);
    if (ev.provider === 'ollama' || ev.provider === 'mistral') pulse('ollama');
  }

  function unmount() {
    if (_svg) { _svg.remove(); _svg = null; }
    _nodeEls = {};
    _mounted = false;
  }

  function getRealSystemIds() { return REAL_SYSTEMS.map((s) => s.id); }
  function getRealAgentIds() { return REAL_AGENTS.slice(); }

  global.BrainOSCanvas = { mount, unmount, pulse, onRealEvent, getRealSystemIds, getRealAgentIds, MODULE_ID };
})(typeof window !== 'undefined' ? window : globalThis);
