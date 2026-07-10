'use strict';
/**
 * ui/channels/build/build.js — the closed-loop build pipeline channel.
 *
 * Talks only to the Orchestrator (:9000 same-origin), per ui/home/
 * STRUCTURE.md's SISO law: "The home is a SISO subscriber. All reads go
 * through the Orchestrator proxy." Never calls emerge/guardian/idearium
 * directly.
 *
 * Backend: lib/build-pipeline.js, routed at
 *   POST /api/build/start {specPath, outputDir, provider}
 *   GET  /api/build/:id
 *   GET  /api/build/list
 * Live progress arrives as SSE frames of type 'build.node', 'build.stage',
 * 'build.complete', 'build.failed', 'build.error' — the same broadcast
 * channel every other live event in NEXUS already uses.
 */
(function () {
  const nodeEls = new Map(); // nodeName -> DOM element
  let currentBuildId = null;
  let currentPipelineId = null;
  let sse = null;

  function $(sel) { return document.querySelector(sel); }

  function _ensureSSE() {
    if (sse) return sse;
    sse = window.Toast ? window.Toast.connect('/sse') : new EventSource('/sse');
    sse.addEventListener('message', (e) => _onFrame(e.data));
    return sse;
  }

  function _onFrame(raw) {
    let event;
    try { event = JSON.parse(raw); } catch (_) { return; }
    if (!event.type) return;

    // pipeline.* events (lib/execution-pipeline.js) — the full closed loop
    // this channel drives. Rendered as extra rows in the same node grid,
    // named with a leading '·' so they read as pipeline stages rather
    // than build nodes at a glance.
    if (event.type.startsWith('pipeline.') && event.pipelineId === currentPipelineId) {
      return _onPipelineFrame(event);
    }

    if (!event.buildId || event.buildId !== currentBuildId) return;
    if (event.type === 'build.node') return _updateNode(event.node, event.status, event.detail);
    if (event.type === 'build.stage') return _setBadge(event.status);
    if (event.type === 'build.complete') return _finish('complete', event.summary);
    if (event.type === 'build.failed')   return _finish('failed', event.error);
    if (event.type === 'build.error')    return _finish('error', event.error);
  }

  const PIPELINE_STAGE_LABELS = {
    started:            '· pipeline started',
    'build-complete':   '· build stage',
    branched:           '· isolated verify branch',
    'sandbox-result':   '· sandbox verify',
    compared:           '· compare vs golden',
    'compare-error':    '· compare vs golden',
    promoted:           '· promote',
    'rolled-back':      '· rollback',
    'hot-integrating':  '· hot-integrate',
    'hot-integrated':   '· hot-integrate',
    'hot-integrate-failed': '· hot-integrate',
    complete:           '· pipeline complete',
    failed:             '· pipeline',
  };

  function _onPipelineFrame(event) {
    const stage = event.type.slice('pipeline.'.length);
    const label = PIPELINE_STAGE_LABELS[stage] || `· ${stage}`;
    const status = ['failed', 'rolled-back', 'compare-error', 'hot-integrate-failed'].includes(stage) ? 'error'
      : (stage === 'complete' ? 'complete' : 'active');
    const detail = event.error || event.reason || event.verdict || (event.regressions ? `${event.regressions.length} regression(s)` : '') || '';
    _updateNode(label, status, detail);
    if (stage === 'complete' && window.Toast) window.Toast.show(`Pipeline ${event.pipelineId} promoted and complete.`, 'info');
    if (status === 'error' && window.Toast) window.Toast.show(detail || `Pipeline ${event.pipelineId} — ${stage}`, 'error');
  }

  function _setBadge(text) {
    const badge = $('#build-status-badge');
    if (badge) badge.textContent = text;
  }

  function _nodeEl(name) {
    if (nodeEls.has(name)) return nodeEls.get(name);
    const grid = $('#build-node-grid');
    const el = document.createElement('div');
    el.className = 'build-node build-node--pending';
    el.innerHTML = `<span class="build-node__name"></span><span class="build-node__status"></span><span class="build-node__detail"></span>`;
    el.querySelector('.build-node__name').textContent = name;
    grid.appendChild(el);
    nodeEls.set(name, el);
    return el;
  }

  function _updateNode(name, status, detail) {
    const el = _nodeEl(name);
    el.className = `build-node build-node--${_statusClass(status)}`;
    el.querySelector('.build-node__status').textContent = status;
    el.querySelector('.build-node__detail').textContent = detail || '';
  }

  function _statusClass(status) {
    if (status === 'complete') return 'ok';
    if (status === 'error' || status === 'failed') return 'error';
    if (status === 'dry_run') return 'skip';
    return 'active';
  }

  function _finish(status, detail) {
    _setBadge(status);
    if (status === 'complete' && window.Toast) window.Toast.show(`Build ${currentBuildId} complete.`, 'info');
    if (status !== 'complete' && window.Toast) window.Toast.show(detail || `Build ${currentBuildId} ${status}.`, 'error');
    _loadHistory();
  }

  async function _startBuild() {
    const specPath   = $('#build-spec-path').value.trim();
    const outputDir   = $('#build-output-dir').value.trim();
    const provider    = $('#build-provider').value;
    const fullPipeline = $('#build-full-pipeline')?.checked;
    if (!specPath) { if (window.Toast) window.Toast.show('A .spec path is required.', 'warn'); return; }

    const endpoint = fullPipeline ? '/api/pipeline/start' : '/api/build/start';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ specPath, outputDir: outputDir || undefined, provider }),
    });
    const body = await res.json();
    if (!body.ok) {
      if (window.Toast) window.Toast.show(body.error || 'Failed to start.', 'error');
      return;
    }

    currentBuildId = body.buildId || null;      // set once pipeline.build-complete's buildId is known, if fullPipeline
    currentPipelineId = body.pipelineId || null;
    nodeEls.clear();
    $('#build-node-grid').innerHTML = '';
    $('#build-status-section').classList.remove('hidden');
    $('#build-status-id').textContent = body.pipelineId || body.buildId;
    _setBadge('started');
    _ensureSSE();
  }

  async function _loadHistory() {
    try {
      const res = await fetch('/api/build/list');
      const body = await res.json();
      const list = $('#build-history-list');
      list.innerHTML = '';
      (body.builds || []).slice(0, 10).forEach((b) => {
        const li = document.createElement('li');
        li.className = `build-history__item build-history__item--${_statusClass(b.status)}`;
        li.textContent = `${b.buildId} — ${b.specPath.split('/').pop()} — ${b.status}`;
        list.appendChild(li);
      });
    } catch (_) { /* orchestrator not reachable yet — non-fatal */ }
  }

  async function _startAuto() {
    const specPath = $('#build-spec-path').value.trim();
    const provider = $('#build-provider').value;
    if (!specPath) { if (window.Toast) window.Toast.show('A .spec path is required.', 'warn'); return; }

    $('#build-status-section').classList.remove('hidden');
    $('#build-node-grid').innerHTML = '';
    nodeEls.clear();
    _updateNode('· copilot deciding', 'active', 'asking the autonomous loop to handle this');
    _setBadge('started');
    _ensureSSE();

    const res = await fetch('/api/system/autonomous/build-spec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ specPath, provider }),
    });
    const body = await res.json();
    if (!body.ok) {
      _updateNode('· copilot deciding', 'error', body.error || 'could not start');
      if (window.Toast) window.Toast.show(body.error || 'Autonomous build failed to start.', 'error');
      return;
    }
    if (body.pipelineId) currentPipelineId = body.pipelineId; // deterministic fallback path
    const note = body.via === 'deterministic-fallback'
      ? 'copilot handed this to the direct pipeline (its own reasoning step didn\'t call the tool in time)'
      : 'copilot is driving this via the autonomous loop';
    _updateNode('· copilot deciding', 'complete', note);
    if (window.Toast) window.Toast.show(note, 'info');
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (window.Toast) window.Toast.mount(document.body);
    $('#build-start-btn').addEventListener('click', _startBuild);
    $('#build-auto-btn')?.addEventListener('click', _startAuto);
    _loadHistory();
  });
})();
