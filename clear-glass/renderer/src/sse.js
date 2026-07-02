/**
 * renderer/src/sse.js — connects to the NEXUS SSE bus (the same bus the
 * API and CLI already read from — see clear-glass/src/sse/server.js,
 * which broadcasts every event on the backend Stream via bus.on('*', ...)).
 * Extracted from browser.html's inline <script> ("SSE subscription"
 * section).
 *
 * Every SSE event is rebroadcast here as a `cg:sse:<type>` CustomEvent on
 * `document`, so any other module can subscribe with a plain
 * `document.addEventListener('cg:sse:mesh.task.complete', ...)` instead
 * of this file needing to know about every panel that cares. Status-dot
 * wiring stays local here since it's tightly bound to the chrome-bar DOM.
 */

import { agentId, ssePort, state } from './state.js';

function rebroadcast(type, data) {
  document.dispatchEvent(new CustomEvent(`cg:sse:${type}`, { detail: data }));
}

export function connectSSE({ onAddMsg } = {}) {
  function addMsg(role, content) {
    if (onAddMsg) onAddMsg(role, content);
  }

  const es = new EventSource(`http://127.0.0.1:${ssePort}/events?replay=5`);
  state.es = es;

  const statusHealth = document.getElementById('status-health');

  // §fix 2026-06-30 — orchestrator offline (standalone Clear Glass) means
  // nexus.status never fires, so this timeout makes "—" say something
  // after a few seconds of silence instead of looking indistinguishable
  // from "still loading."
  const healthTimeout = setTimeout(() => {
    statusHealth.textContent = 'Health: offline';
    statusHealth.style.color = 'var(--red, #ff4466)';
    statusHealth.title = 'No nexus.status event received — orchestrator unreachable or NEXUS not running';
    const dot = document.getElementById('dot-nexus');
    if (dot) {
      dot.className = 'status-dot error';
      dot.parentElement.title = 'orchestrator unreachable — no nexus.status event in 8s';
    }
  }, 8000);

  function relay(type, transform) {
    es.addEventListener(type, (e) => {
      let data = e.data;
      try {
        data = JSON.parse(e.data);
      } catch {}
      rebroadcast(type, data);
      if (transform) transform(data, e);
    });
  }

  relay('nexus.status', (d) => {
    clearTimeout(healthTimeout);
    const dot = document.getElementById('dot-nexus');
    dot.className = 'status-dot ' + (d.all ? 'ok' : 'error');
    dot.parentElement.title =
      `orchestrator:${d.orchestrator ? 'up' : 'down'} ` +
      `cortex:${d.cortex ? 'up' : 'down'} ` +
      `guardian:${d.guardian ? 'up' : 'down'} ` +
      `bridge:${d.bridge ? 'up' : 'down'}`;

    const checks = ['orchestrator', 'cortex', 'guardian', 'bridge'];
    const upCount = checks.filter((k) => d[k]).length;
    const pct = Math.round((upCount / checks.length) * 100);
    statusHealth.textContent = `Health: ${pct}`;
    statusHealth.style.color = pct === 100 ? '' : pct >= 50 ? 'var(--amber, #ffb454)' : 'var(--red, #ff4466)';
  });

  relay('tls.tunnel', () => {
    document.getElementById('dot-tls').className = 'status-dot ok';
  });

  relay('window.maximized', (d) => {
    if (d.agentId !== agentId) return;
    document.getElementById('btn-maximize').textContent = d.maximized ? '❐' : '⛶';
    document.getElementById('btn-maximize').title = d.maximized ? 'Restore' : 'Maximize';
  });

  relay('tls.error', () => {
    document.getElementById('dot-tls').className = 'status-dot warn';
  });

  relay('context.rate-limited', (d) => {
    if (d.agentId === agentId) addMsg('assistant', `⚠ Rate limit on ${agentId} — RAID rerouting.`);
  });

  relay('context.fp.switched', (d) => {
    if (d.agentId === agentId) addMsg('assistant', `Fingerprint switched → ${d.mode} (${d.ua.slice(0, 60)}...)`);
  });

  relay('dom.picked'); // picker.js subscribes to cg:sse:dom.picked directly

  relay('driver.error', (d) => {
    addMsg('assistant', `Driver error [${d.action}]: ${d.error}`);
  });

  relay('url.match', (d) => {
    if (d.agentId === agentId || d.agentId === '*') {
      addMsg('assistant', `🎯 URL match [${d.label}]: ${d.url.slice(0, 80)}`);
    }
  });

  relay('mesh.task.complete', (d) => {
    addMsg('assistant', `✦ Mesh [${d.agentKey}] complete: ${d.responseSnippet?.slice(0, 100) || '(done)'}`);
  });

  relay('mesh.task.error', (d) => {
    addMsg('assistant', `✦ Mesh [${d.agentKey}] error: ${d.error}`);
  });

  relay('diag.run.complete', (d) => {
    const icon = d.success ? '✓' : '✗';
    addMsg('assistant', `${icon} Diagnostic [${d.label}]: ${d.passed}/${d.total} passed`);
  });

  relay('diag.step.fail', (d) => {
    addMsg('assistant', `⚠ Step failed: ${d.label} — ${d.error}`);
  });

  relay('diag.screenshot.saved', (d) => {
    addMsg('assistant', `📸 Screenshot saved: ${d.file.split('/').pop()}`);
  });

  // Panels that only need to know "something changed, refresh if open" —
  // no chrome-bar-specific logic, so they're just relayed with no local
  // transform. Each panel module subscribes to its own cg:sse:* event.
  [
    'provider.host.started',
    'provider.host.stopped',
    'bookmarks.added',
    'bookmarks.removed',
    'rewind.snapshotted',
    'mesh.queue.add',
    'mesh.queue.processing',
    'mesh.agent.spawned',
  ].forEach((type) => relay(type));

  relay('userscript.injected', (d) => {
    if (d.agentId === agentId) addMsg('assistant', `⚙ Script injected: ${d.name}`);
  });
  relay('userscript.auto-injected', (d) => {
    if (d.agentId === agentId && d.count > 0) addMsg('assistant', `⚙ ${d.count} userscript(s) auto-injected on ${d.url}`);
  });

  es.onerror = () => {
    document.getElementById('dot-sse').className = 'status-dot error';
    setTimeout(() => connectSSE({ onAddMsg }), 3000);
  };

  es.onopen = () => {
    document.getElementById('dot-sse').className = 'status-dot ok';
  };

  return es;
}
