/* NEXUS v0.53.0 — nexus-siso-health.js
 * SISO health check + critical ID validation
 * Phase 0B — extracted 2026-04-07
 */

/* ═══════════════════════════════════════════════════════════════
   NEXUS v10.1 FINAL PATCH — Tests Fix · Tab Redirect · Full Wiring
   All gates registered via SISO stream. Pure functional.
   ═══════════════════════════════════════════════════════════════ */

/* ── GATE: TestsRedirectGate ───────────────────────────────────
   "Tests" tab no longer exists as a top-level nav — it lives inside
   TestEnv. This gate intercepts switchTab('tests') and redirects
   to testenv + opens the tests sub-tab without jerking the user around.
   ─────────────────────────────────────────────────────────────── */
class TestsRedirectGate extends NXGate {
  constructor() { super('nx:nav:tests:redirect'); }
  transform(event, stream) {
    // Switch to testenv smoothly
    const panel = document.getElementById('tab-testenv');
    const allPanels = document.querySelectorAll('.tab-panel');
    const allBtns = document.querySelectorAll('.tab-btn');
    allPanels.forEach(p => p.removeAttribute('data-active'));
    allBtns.forEach(b => b.removeAttribute('data-active'));
    if (panel) panel.dataset.active = 'true';
    const btn = document.querySelector('.tab-btn[data-tab="testenv"]');
    if (btn) btn.dataset.active = 'true';
    // Then open the tests sub-tab inside testenv (after injection)
    setTimeout(() => {
      const testsBtn = document.querySelector('[data-tetab="tests"]');
      if (testsBtn) teSwitchTab('tests', testsBtn);
    }, 50);
    return null;
  }
}
SISO_STREAM.register(new TestsRedirectGate());

/* Patch switchTab to intercept 'tests' and redirect gracefully */
(function patchSwitchTabForTests() {
  const _orig = switchTab;
  window.switchTab = function(name) {
    if (name === 'tests') {
      sisoEmit('nx:nav:tests:redirect', {});
      return;
    }
    _orig(name);
  };
})();

/* ── GATE: SISOBuildIntegrationGate ───────────────────────────
   When DeepScan manifest build triggers, inject the SISO manifest
   prompt context into the standard builder's AI request.
   ─────────────────────────────────────────────────────────────── */
class SISOBuildIntegrationGate extends NXGate {
  constructor() { super('nx:siso:build:inject'); }
  transform(event, stream) {
    const { manifestPrompt } = event.data;
    if (!manifestPrompt) return null;
    // Pre-load the manifest prompt into the builder system context
    window._ds_manifest_prompt = manifestPrompt;
    // Patch the next sbGenerate call to prepend manifest context
    const _orig = window.sbGenerate;
    if (!_orig || window._siso_manifest_patched) return null;
    window._siso_manifest_patched = true;
    window.sbGenerate = async function() {
      const mp = window._ds_manifest_prompt;
      if (mp) {
        // Inject into sb-inject field if empty
        const injectEl = document.getElementById('sb-inject');
        if (injectEl && !injectEl.value.trim()) {
          injectEl.value = '[SISO MANIFEST ACTIVE — architecture, gates, and infra pre-loaded from DeepScan builder]';
        }
        window._ds_manifest_prompt = null;
        window._siso_manifest_patched = false;
      }
      return _orig.apply(this, arguments);
    };
    return null;
  }
}
SISO_STREAM.register(new SISOBuildIntegrationGate());

/* ── GATE: UIAliveGate ─────────────────────────────────────────
   Adds RGB alive effects to key UI sections dynamically after load.
   Keeps the whole system feeling alive without hard-coding everywhere.
   ─────────────────────────────────────────────────────────────── */
class UIAliveGate extends NXGate {
  constructor() { super('nx:ui:alive:apply'); }
  transform(event, stream) {
    // Add alive dots to section headers that don't have them
    const headerSelectors = [
      '#tab-console > div:first-child',
      '#tab-forge > div:first-child',
      '#tab-projects > div:first-child',
      '#tab-log > div:first-child',
    ];
    headerSelectors.forEach(sel => {
      const el = document.querySelector(sel);
      if (!el || el.querySelector('.alive-dot')) return;
      const dot = document.createElement('div');
      dot.className = 'alive-dot cyan';
      dot.style.cssText = 'flex-shrink:0;';
      el.insertBefore(dot, el.firstChild);
    });

    // Add rgb-alive to the FORGE tab button
    const forgeBtn = document.querySelector('.tab-btn[data-tab="forge"]');
    if (forgeBtn && !forgeBtn.classList.contains('rgb-alive-applied')) {
      forgeBtn.classList.add('rgb-alive-applied');
      // Subtle orange pulse for forge
      forgeBtn.style.setProperty('--alive-color', 'var(--o)');
    }

    // Add pulse to all mcard elements to feel alive
    document.querySelectorAll('.mcard').forEach((card, i) => {
      if (card.dataset.aliveApplied) return;
      card.dataset.aliveApplied = '1';
      card.style.transition = 'border-color 0.3s, box-shadow 0.3s';
      card.addEventListener('mouseenter', () => {
        card.style.borderColor = 'rgba(0,212,255,.4)';
        card.style.boxShadow = '0 0 12px rgba(0,212,255,.08)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.borderColor = '';
        card.style.boxShadow = '';
      });
    });

    // Apply shimmer to topbar logo already done via css
    // Apply subtle rgb border animation to the main nav
    const nav = document.querySelector('nav');
    if (nav) {
      nav.style.position = 'relative';
    }

    log_ev('ui:alive:applied', {}, 'INFO');
    return null;
  }
}
SISO_STREAM.register(new UIAliveGate());

/* ── GATE: SaveConfigEnhancedGate ─────────────────────────────
   Enhances saveConfig to also register in SISO stream so the
   diagnose tab and data tab always have fresh state.
   ─────────────────────────────────────────────────────────────── */
class SaveConfigEnhancedGate extends NXGate {
  constructor() { super('nx:config:saved'); }
  transform(event, stream) {
    // Re-run diagnose status cards silently (no UI flash)
    try {
      const aiProvider = event.data.aiProvider || '';
      const dAi = document.getElementById('diag-ai-status');
      if (dAi && aiProvider) {
        dAi.textContent = aiProvider.toUpperCase();
        dAi.className = 'mcard-val ok';
      }
    } catch(e) {}
    return null;
  }
}
SISO_STREAM.register(new SaveConfigEnhancedGate());

/* Patch saveConfig to emit SISO event */
(function patchSaveConfig() {
  const _orig = typeof saveConfig === 'function' ? saveConfig : null;
  if (!_orig) return;
  window.saveConfig = function() {
    const result = _orig.apply(this, arguments);
    sisoEmit('nx:config:saved', {
      aiProvider: document.getElementById('opt-ai-provider')?.value || ''
    });
    return result;
  };
})();

/* ── GATE: ProjectPathEnhanceGate ─────────────────────────────
   Patches saveNewProject to always register the UUID path schema.
   /data/projects/{UUID}/ becomes the canonical path for all projects.
   ─────────────────────────────────────────────────────────────── */
class ProjectPathEnhanceGate extends NXGate {
  constructor() { super('nx:project:path:enhance'); }
  transform(event, stream) {
    const _orig = typeof saveNewProject === 'function' ? saveNewProject : null;
    if (!_orig || window._projectPathPatched) return null;
    window._projectPathPatched = true;
    window.saveNewProject = function(name, code, description) {
      const result = _orig(name, code, description);
      if (result && result.id) {
        sisoEmit('nx:project:save', {
          uuid: result.id,
          name: result.name,
          lang: '',
          code: code || '',
          meta: { created: result.created_at, description }
        });
      }
      return result;
    };
    return null;
  }
}
SISO_STREAM.register(new ProjectPathEnhanceGate());

/* ── SISO STREAM HEALTH MONITOR ───────────────────────────────
   Exposes SISO stream state to the diagnose tab.
   ─────────────────────────────────────────────────────────────── */
window.getSISOHealth = function() {
  return {
    gates: SISO_STREAM.gates.size,
    gateNames: [...SISO_STREAM.gates.keys()],
    eventCount: SISO_STREAM.eventCount,
    pending: SISO_STREAM.pending.length,
    logEntries: SISO_LOG.entries.length,
    logLevel: SISO_LOG.level,
  };
};

/* Expose SISO gate list in diagnose log when diagnose runs */
(function patchDiagnoseForSISO() {
  const _origDiag = typeof diagRunAll === 'function' ? diagRunAll : null;
  if (!_origDiag) return;
  window.diagRunAll = function() {
    _origDiag();
    const log = document.getElementById('diag-log');
    if (!log) return;
    const health = getSISOHealth();
    const line = document.createElement('div');
    line.style.color = 'var(--m)';
    line.style.marginTop = '6px';
    line.style.borderTop = '1px solid var(--border)';
    line.style.paddingTop = '6px';
    line.innerHTML = `<b>SISO Framework:</b> ${health.gates} gates registered · ${health.eventCount} events processed · log: ${health.logEntries} entries<br>` +
      `<span style="color:var(--text3);font-size:9px">Gates: ${health.gateNames.join(' · ')}</span>`;
    log.appendChild(line);
  };
})();

/* ── FINAL BOOT SEQUENCE ──────────────────────────────────────
   Everything through the SISO stream. Pure events, pure gates.
   ─────────────────────────────────────────────────────────────── */
setTimeout(() => {
  // Apply alive UI effects across the interface
  sisoEmit('nx:ui:alive:apply', {});
  // Patch project path enhancement
  sisoEmit('nx:project:path:enhance', {});
  // Sync diagnose header stats
  const dBridge = document.getElementById('diag-bridge-status');
  if (dBridge) dBridge.textContent = '—';

  // Log final gate registry to stream
  log_ev('siso:registry:final', {
    gates: SISO_STREAM.gates.size,
    gateNames: [...SISO_STREAM.gates.keys()],
    version: '10.1',
  }, 'INFO');

  // Add SISO event log to S bus so it shows in the NEXUS LOG tab
  SISO_LOG.entries.slice(-10).forEach(entry => {
    log_ev('siso:gate:' + entry.type, { claimed: entry.claimed, seq: entry.seq }, 'INFO');
  });

  // Update Options tabs alive state
  const optTabBar = document.getElementById('opt-tab-bar');
  if (optTabBar) {
    // Add alive dot to AI tab
    const aiTab = optTabBar.querySelector('[onclick*="\'ai\'"]');
    if (aiTab && !aiTab.querySelector('.alive-dot')) {
      const dot = document.createElement('div');
      dot.className = 'alive-dot cyan';
      dot.style.cssText = 'display:inline-block;margin-left:5px;vertical-align:middle;';
      aiTab.appendChild(dot);
    }
  }

  // Verify builder panels exist and are properly hidden
  const stdPanel = document.getElementById('builder-standard-panel');
  const dsPanel = document.getElementById('builder-deepscan-panel');
  if (stdPanel) stdPanel.style.display = 'flex';
  if (dsPanel) dsPanel.style.display = 'none';

}, 2500);

/* ── SISO LOG VIEWER in Log Tab ───────────────────────────────
   Add a SISO stream view to the existing LOG tab so you can watch
   gate events flow in real time.
   ─────────────────────────────────────────────────────────────── */
function injectSISOLogView() {
  const logTabBar = document.querySelector('#tab-log > div:first-child');
  if (!logTabBar || logTabBar.querySelector('[data-ltab="siso"]')) return;
  const btn = document.createElement('button');
  btn.className = 'ptab';
  btn.dataset.ltab = 'siso';
  btn.textContent = '⬡ SISO STREAM';
  btn.style.cssText = 'color:var(--m)';
  btn.onclick = function() { logSwitchTab('siso', btn); renderSISOLog(); };
  logTabBar.appendChild(btn);

  // Add SISO log panel
  const logMain = document.getElementById('tab-log');
  if (logMain) {
    const panel = document.createElement('div');
    panel.id = 'log-sub-siso';
    panel.style.cssText = 'display:none;flex-direction:column;flex:1;min-height:0;overflow:hidden;';
    panel.setAttribute('data-ltab-panel', 'siso');
    panel.innerHTML = `
      <div style="flex-shrink:0;padding:8px 14px;background:var(--bg1);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px">
        <div class="alive-dot magenta"></div>
        <span style="font-family:var(--display);font-size:11px;letter-spacing:.2em;color:var(--m)">SISO STREAM — LIVE GATE LOG</span>
        <span style="font-size:9px;color:var(--text3)">Event → Gate → Stream · Pure functional trace</span>
        <button class="btn" style="font-size:9px;margin-left:auto" onclick="renderSISOLog()">↻ REFRESH</button>
        <button class="btn" style="font-size:9px;color:var(--r);border-color:rgba(255,45,85,.3)" onclick="SISO_LOG.clear();renderSISOLog()">CLEAR</button>
        <select class="finp" style="max-width:100px;font-size:9px" onchange="SISO_LOG.level=this.value;renderSISOLog()">
          <option value="EVENTS">EVENTS</option>
          <option value="DEEP">DEEP</option>
          <option value="DATA">DATA</option>
          <option value="OFF">OFF</option>
        </select>
      </div>
      <div style="flex-shrink:0;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:8px 14px;background:var(--bg2);border-bottom:1px solid var(--border)">
        <div class="mcard" style="padding:6px 10px"><div class="mcard-title" style="font-size:8px">GATES</div><div style="font-family:var(--display);font-size:16px;color:var(--m)" id="siso-stat-gates">0</div></div>
        <div class="mcard" style="padding:6px 10px"><div class="mcard-title" style="font-size:8px">EVENTS</div><div style="font-family:var(--display);font-size:16px;color:var(--c)" id="siso-stat-events">0</div></div>
        <div class="mcard" style="padding:6px 10px"><div class="mcard-title" style="font-size:8px">PENDING</div><div style="font-family:var(--display);font-size:16px;color:var(--y)" id="siso-stat-pending">0</div></div>
        <div class="mcard" style="padding:6px 10px"><div class="mcard-title" style="font-size:8px">LOG ENTRIES</div><div style="font-family:var(--display);font-size:16px;color:var(--g)" id="siso-stat-log">0</div></div>
      </div>
      <div id="siso-log-list" style="flex:1;overflow-y:auto;padding:8px 14px;font-family:var(--mono);font-size:10px;line-height:1.8"></div>
    `;
    logMain.appendChild(panel);
  }
}
// Auto-run on first load
injectSISOLogView();

function renderSISOLog() {
  const health = getSISOHealth();
  const sg = document.getElementById('siso-stat-gates'); if(sg) sg.textContent = health.gates;
  const se = document.getElementById('siso-stat-events'); if(se) se.textContent = health.eventCount;
  const sp = document.getElementById('siso-stat-pending'); if(sp) sp.textContent = health.pending;
  const sl = document.getElementById('siso-stat-log'); if(sl) sl.textContent = health.logEntries;
  const list = document.getElementById('siso-log-list');
  if (!list) return;
  const entries = SISO_LOG.entries.slice(-200).reverse();
  if (!entries.length) {
    list.innerHTML = '<div style="color:var(--text3);font-style:italic">No events logged yet. Interact with the system to see gate activity.</div>';
    return;
  }
  list.innerHTML = entries.map(e => {
    const claimed = e.claimed
      ? `<span style="color:var(--g)">→ ${esc(e.claimed)}</span>`
      : `<span style="color:var(--text3)">→ [pending]</span>`;
    const time = new Date(e.time).toTimeString().slice(0,8);
    return `<div style="display:flex;gap:10px;padding:2px 0;border-bottom:1px solid rgba(26,42,64,.4)">
      <span style="color:var(--text4);min-width:45px">#${e.seq}</span>
      <span style="color:var(--text3);min-width:70px">${time}</span>
      <span style="color:var(--c);flex:1">${esc(e.type)}</span>
      ${claimed}
    </div>`;
  }).join('');
}

/* Patch logSwitchTab to handle siso panel */
(function patchLogSwitchTabForSISO() {
  const _orig = typeof logSwitchTab === 'function' ? logSwitchTab : null;
  if (!_orig) return;
  window.logSwitchTab = function(name, btn) {
    // Hide SISO panel first
    const sisoPanel = document.getElementById('log-sub-siso');
    if (sisoPanel) sisoPanel.style.display = 'none';
    // Remove active from all log tab buttons including siso
    document.querySelectorAll('[data-ltab]').forEach(b => b.removeAttribute('data-active'));

    if (name === 'siso') {
      if (sisoPanel) sisoPanel.style.display = 'flex';
      if (btn) btn.dataset.active = 'true';
      return;
    }
    _orig(name, btn);
  };
})();

/* ── FINAL HEALTH CHECK ───────────────────────────────────────
   Verify all critical IDs exist and report via SISO.
   ─────────────────────────────────────────────────────────────── */
setTimeout(() => {
  const criticalIds = [
    'nx-particle-canvas', 'nx-scanline',
    'builder-mode-banner', 'builder-standard-panel', 'builder-deepscan-panel',
    'btn-lets-start', 'ds-pre-start', 'ds-step-flow', 'ds-output-panel',
    'opt-tab-bar', 'optsub-ai', 'optsub-data', 'optsub-diagnose',
    'diag-log', 'data-project-list',
    'tab-builder', 'tab-testenv', 'tab-options', 'tab-tests',
  ];
  const missing = criticalIds.filter(id => !document.getElementById(id));
  if (missing.length) {
    log_ev('siso:health:warn', { missing }, 'WARN');
    console.warn('[NEXUS SISO] Missing IDs:', missing);
  } else {
    log_ev('siso:health:ok', { checked: criticalIds.length }, 'INFO');
  }
}, 3200);
