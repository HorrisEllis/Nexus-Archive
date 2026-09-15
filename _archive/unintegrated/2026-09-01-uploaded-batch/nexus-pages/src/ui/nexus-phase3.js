/* NEXUS v0.53.0 — nexus-phase3.js
 * Phase 3 — Ollama Python service UI + hookIDs
 * Phase 0B — extracted 2026-04-07
 */

'use strict';
(function nexusPhase3Ollama() {

  const OLLAMA_PY_PORT    = 3748;
  const OLLAMA_PY_BASE    = `http://127.0.0.1:${OLLAMA_PY_PORT}`;
  const BRIDGE_BASE       = () => (typeof val === 'function' ? val('bridge-url') : null) || 'http://127.0.0.1:3747';
  const POLL_INTERVAL_MS  = 10000;

  let _pollTimer = null;
  let _pulling   = false;

  /* ── HookID registration ──────────────────────────────────────── */
  const PHASE3_HOOKS = [
    { id:'ollama:py:start',        label:'Ollama Python — service started',      prefix:'ollama' },
    { id:'ollama:py:stop',         label:'Ollama Python — service stopped',      prefix:'ollama' },
    { id:'ollama:py:restart',      label:'Ollama Python — restart triggered',    prefix:'ollama' },
    { id:'ollama:py:chat',         label:'Ollama Python — /chat dispatched',     prefix:'ollama' },
    { id:'ollama:py:stream-chunk', label:'Ollama Python — streaming token',      prefix:'ollama' },
    { id:'ollama:py:generate',     label:'Ollama Python — /generate dispatched', prefix:'ollama' },
    { id:'ollama:py:pull-start',   label:'Ollama Python — model pull started',   prefix:'ollama' },
    { id:'ollama:py:pull-progress',label:'Ollama Python — pull progress',        prefix:'ollama' },
    { id:'ollama:py:model-ready',  label:'Ollama Python — model loaded',         prefix:'ollama' },
    { id:'ollama:py:ps-refresh',   label:'Ollama Python — /ps polled',           prefix:'ollama' },
    { id:'ollama:py:error',        label:'Ollama Python — inference error',      prefix:'ollama' },
    { id:'ollama:py:smart-select', label:'Ollama Python — intent→model selected',prefix:'ollama' },
    { id:'ollama:py:embeddings',   label:'Ollama Python — embeddings requested', prefix:'ollama' },
  ];

  function registerPhase3Hooks() {
    try {
      if (!window.NEXUS?.registry) return;
      PHASE3_HOOKS.forEach(h => {
        window.NEXUS.registry.register({
          id:          h.id,
          label:       h.label,
          status:      'active',
          prefix:      h.prefix,
          settingsPath:'options.ai.ollama',
          builderFields: [],
          test: () => ({ ok: true, message: h.label + ' — hookID registered' }),
        });
      });
      log_ev('phase3:hooks-registered', { count: PHASE3_HOOKS.length }, 'INFO');
    } catch(e) {
      console.warn('[Phase3] Hook registration failed:', e.message);
    }
  }

  /* ── Fetch helpers ───────────────────────────────────────────── */
  async function pyFetch(path, opts = {}) {
    return fetch(OLLAMA_PY_BASE + path, {
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
      ...opts,
    });
  }

  /* ── Panel update ────────────────────────────────────────────── */
  async function ollamaPyRefresh() {
    const pill    = document.getElementById('ollama-py-pill');
    const pillTxt = document.getElementById('ollama-py-pill-txt');
    const vramBar = document.getElementById('ollama-vram-bar');
    const vramLbl = document.getElementById('ollama-vram-label');
    const psList  = document.getElementById('ollama-ps-list');

    if (pillTxt) pillTxt.textContent = 'CHECKING…';

    // Also query Electron IPC status if available
    let ipcStatus = null;
    try {
      if (window.nexus?.ollama) ipcStatus = await window.nexus.ollama.status();
    } catch {}

    // Try Python service directly
    try {
      const r = await pyFetch('/status');
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const j = await r.json();

      // Pill — RUNNING
      if (pill)    { pill.className = 'pill pill-ok'; }
      if (pillTxt) pillTxt.textContent = 'RUNNING';

      // Models in model-list dropdown
      const modelList = document.getElementById('ollama-model-list');
      if (modelList && j.models) {
        modelList.innerHTML = j.models.map(m =>
          `<div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid var(--border);font-size:10px">` +
          `<span style="flex:1;color:var(--text)">${esc(m)}</span>` +
          `<button class="btn" style="font-size:8px;padding:1px 6px" onclick="setVal('opt-ollama-model','${esc(m)}')">USE</button>` +
          `</div>`
        ).join('');
      }

      // Running models + VRAM
      const running = j.running || [];
      let totalVram = 0, maxVram = 0;
      running.forEach(m => { totalVram += (m.size_vram || 0); maxVram += (m.size || 0) || 8_000_000_000; });
      const pct = maxVram > 0 ? Math.min(100, Math.round(totalVram / maxVram * 100)) : 0;

      if (vramBar) vramBar.style.width = pct + '%';
      if (vramBar) vramBar.style.background = pct > 85 ? 'var(--r)' : pct > 60 ? 'var(--y)' : 'var(--c)';
      if (vramLbl) {
        const gb = n => (n / 1_073_741_824).toFixed(1) + ' GB';
        vramLbl.textContent = running.length
          ? `VRAM: ${gb(totalVram)} used · ${running.length} model${running.length > 1 ? 's' : ''} loaded`
          : 'VRAM: idle (no models loaded)';
      }

      if (psList) {
        psList.innerHTML = running.map(m =>
          `<div style="display:flex;align-items:center;gap:6px;padding:2px 0;">` +
          `<div style="width:5px;height:5px;border-radius:50%;background:var(--g);flex-shrink:0"></div>` +
          `<span style="flex:1;font-family:var(--mono)">${esc(m.model)}</span>` +
          `<span style="color:var(--text3)">${((m.size_vram || 0) / 1e9).toFixed(1)} GB</span>` +
          `</div>`
        ).join('') || '<span style="color:var(--text3);font-style:italic">No models currently loaded</span>';
      }

      log_ev('phase3:py-refresh', { models: j.models?.length, running: running.length }, 'INFO');

    } catch {
      // Service unreachable
      if (pill)    { pill.className = 'pill pill-err'; }
      if (pillTxt) pillTxt.textContent = ipcStatus?.running ? 'STARTING…' : 'OFFLINE';
      if (vramBar) vramBar.style.width = '0%';
      if (vramLbl) vramLbl.textContent = 'VRAM: —';
      if (psList)  psList.innerHTML = `<span style="color:var(--r);font-size:9px">Python service not running. Click RESTART to start it.</span>`;
    }
  }
  window.ollamaPyRefresh = ollamaPyRefresh;

  /* ── Restart ─────────────────────────────────────────────────── */
  window.ollamaPyRestart = async function() {
    const pillTxt = document.getElementById('ollama-py-pill-txt');
    const pill    = document.getElementById('ollama-py-pill');
    if (pillTxt) pillTxt.textContent = 'RESTARTING…';
    if (pill)    pill.className = 'pill pill-busy';
    log_ev('phase3:py-restart', {}, 'INFO');
    try {
      if (window.nexus?.ollama) {
        await window.nexus.ollama.restart();
        if (typeof toast === 'function') toast('Ollama Python service restarting…', 'ok', 3000);
      } else {
        // Fallback: hit bridge restart endpoint
        await fetch(BRIDGE_BASE() + '/ollama/restart', { method: 'POST' }).catch(() => {});
        if (typeof toast === 'function') toast('Restart signal sent to bridge', 'ok', 2000);
      }
    } catch(e) {
      if (typeof nxWarn === 'function') nxWarn('OLLAMA_RESTART', 'Restart failed', e.message, 'options:ollama');
    }
    // Re-poll after 3s
    setTimeout(ollamaPyRefresh, 3000);
  };

  /* ── Install deps ────────────────────────────────────────────── */
  window.ollamaPyInstall = function() {
    if (typeof toast === 'function') toast('Run in terminal: pip install -r bridge/requirements.txt', 'info', 6000);
    // If Electron exec is available, try it
    if (window.nexus?.exec) {
      window.nexus.exec('pip3 install -r bridge/requirements.txt --break-system-packages')
        .then(r => {
          if (r.ok) {
            if (typeof toast === 'function') toast('Dependencies installed ✓', 'ok');
            setTimeout(() => window.nexus.ollama?.start?.(), 1000);
          } else {
            if (typeof toast === 'function') toast('Install failed — check terminal', 'warn');
          }
        }).catch(() => {});
    }
  };

  /* ── Pull model ──────────────────────────────────────────────── */
  window.ollamaPullModel = async function() {
    if (_pulling) { if (typeof toast === 'function') toast('Pull already in progress', 'warn'); return; }
    const inp   = document.getElementById('ollama-pull-input');
    const model = inp?.value?.trim();
    if (!model) { if (typeof toast === 'function') toast('Enter a model name to pull', 'warn'); return; }

    const log2  = document.getElementById('ollama-pull-log');
    if (log2) { log2.style.display = 'block'; log2.textContent = `Pulling ${model}…
`; }
    _pulling = true;

    log_ev('phase3:pull-start', { model }, 'INFO');
    if (typeof toast === 'function') toast(`Pulling ${model}…`, 'ok', 3000);

    try {
      const r = await fetch(OLLAMA_PY_BASE + '/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model }),
      });

      const reader = r.body.getReader();
      const dec    = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = dec.decode(value);
        // Parse SSE lines
        text.split('\n').filter(l => l.startsWith('data: ')).forEach(line => {
          try {
            const d = JSON.parse(line.slice(6));
            const statusLine = d.error
              ? `ERROR: ${d.error}`
              : `${d.status || ''}${d.pct ? ' ' + d.pct + '%' : ''}`;
            if (log2 && statusLine) { log2.textContent += statusLine + '\n'; log2.scrollTop = log2.scrollHeight; }
            if (d.status === 'success') {
              if (typeof toast === 'function') toast(`${model} pulled successfully`, 'ok');
              log_ev('phase3:pull-done', { model }, 'INFO');
              ollamaPyRefresh();
              if (inp) inp.value = '';
            }
          } catch {}
        });
      }
    } catch(e) {
      if (log2) log2.textContent += `ERROR: ${e.message}
`;
      if (typeof nxWarn === 'function') nxWarn('OLLAMA_PULL', 'Pull failed', e.message, 'options:ollama');
      // Fallback: route through bridge
      try {
        await fetch(BRIDGE_BASE() + '/ollama/pull', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model }),
        });
        if (typeof toast === 'function') toast(`Pull routed through bridge`, 'ok');
      } catch {}
    } finally {
      _pulling = false;
    }
  };

  /* ── Start polling when OPTIONS → Ollama section is visible ───── */
  function startPolling() {
    if (_pollTimer) return;
    ollamaPyRefresh(); // immediate
    _pollTimer = setInterval(ollamaPyRefresh, POLL_INTERVAL_MS);
  }

  function stopPolling() {
    if (_pollTimer) { clearInterval(_pollTimer); _pollTimer = null; }
  }

  /* Watch for provider-ollama becoming visible */
  function watchOllamaSection() {
    const target = document.getElementById('provider-ollama');
    if (!target) return;
    const obs = new MutationObserver(() => {
      const visible = target.style.display !== 'none';
      if (visible) startPolling(); else stopPolling();
    });
    obs.observe(target, { attributes: true, attributeFilter: ['style'] });
    // Also check immediately
    if (target.style.display !== 'none') startPolling();
  }

  /* Listen for Electron IPC Ollama log events */
  function wireIpcListeners() {
    try {
      if (!window.nexus?.on) return;
      window.nexus.on('nexus:ollama-log', d => {
        log_ev('phase3:ipc-log', { msg: d.msg, level: d.level }, 'INFO');
      });
      window.nexus.on('nexus:ollama-error', d => {
        if (typeof nxError === 'function') nxError('OLLAMA_PY', d.message || 'Python service error', d.hint || '', 'ollama:py');
      });
    } catch {}
  }

  /* Boot */
  function whenReady(fn) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') setTimeout(fn, 200);
    else window.addEventListener('load', () => setTimeout(fn, 200));
  }

  whenReady(() => {
    registerPhase3Hooks();
    watchOllamaSection();
    wireIpcListeners();
    // Initial status check after 2s (bridge needs to be up first)
    setTimeout(ollamaPyRefresh, 2000);
  });

  console.log('[NEXUS v0.53.0] Phase 3 loaded — Ollama Python service wired.');

})();
