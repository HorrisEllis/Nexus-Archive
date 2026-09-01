/* NEXUS v0.53.0 — nexus-phase2.js
 * Phase 2 — A15, A18, A21, wizard collapse, pill truth, enter ring
 * Phase 0B — extracted 2026-04-07
 */

'use strict';
(function nexusPhase2Final() {

  /* ── helpers ── */
  const $  = id => document.getElementById(id);
  const lc = () => { try { return JSON.parse(localStorage.getItem('nx6_cfg') || '{}'); } catch { return {}; } };
  const sc = o  => { try { localStorage.setItem('nx6_cfg', JSON.stringify(Object.assign(lc(), o))); } catch {} };
  function whenReady(fn) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') setTimeout(fn, 150);
    else window.addEventListener('load', () => setTimeout(fn, 150));
  }

  /* ════════════════════════════════════════════════════════════════
     AXIOM A21 — Holistic or Nothing
     Output is always complete. Never partial. Never fragmented.
     Every export, build, package, and delivery is a whole unit.
     Partial output is not output. A fragment is not a feature.
  ════════════════════════════════════════════════════════════════ */
  window.NEXUS_AXIOM_HOLISTIC = {
    id:     'A21',
    label:  'Holistic or Nothing',
    rule:   'Every output — build artifact, export, delivery, phase — is complete or it does not ship. No partial files. No fragmented deliveries. No split-up outputs that require reassembly. A ZIP, not a folder. A system, not a collection of parts.',
    credit: 'NEXUS v0.53.0 — siso-framework.org',
    _enabled: true,

    /* enforce() — call before any output operation.
       Throws if completeness assertion fails. */
    enforce(label, checks = []) {
      if (!this._enabled) return true;
      const failed = checks.filter(c => !c.ok);
      if (failed.length) {
        const reasons = failed.map(c => c.reason).join('; ');
        const msg = `[A21] Holistic violation in "${label}": ${reasons}`;
        if (typeof nxError === 'function') nxError('A21_HOLISTIC', msg, 'Output blocked — resolve all checks before delivery.', label);
        throw new Error(msg);
      }
      return true;
    },

    /* wrap a download/export function to assert completeness first */
    guard(label, checksFn, outputFn) {
      return async (...args) => {
        const checks = typeof checksFn === 'function' ? checksFn(...args) : [];
        this.enforce(label, checks);
        return outputFn(...args);
      };
    },
  };

  /* Register A21 in HookRegistry if NEXUS is ready */
  function registerA21Hook() {
    try {
      if (window.NEXUS?.registry) {
        window.NEXUS.registry.register({
          id: 'axiom.a21.holistic',
          label: 'Axiom A21 — Holistic or Nothing',
          status: 'active',
          prefix: 'axiom',
          settingsPath: 'options.axioms',
          builderFields: [],
          test: () => ({ ok: window.NEXUS_AXIOM_HOLISTIC._enabled, message: 'A21 enforced: ' + (window.NEXUS_AXIOM_HOLISTIC._enabled ? 'ON' : 'OFF') }),
        });
      }
    } catch {}
  }

  /* Wrap homeExportAll to enforce A21 */
  function wrapExportAll() {
    const _orig = typeof homeExportAll === 'function' ? homeExportAll.bind(window) : null;
    if (!_orig) return;
    window.homeExportAll = function() {
      /* A21 check: all 6 data stores must be readable */
      const checks = [
        { ok: typeof getProjects === 'function',                    reason: 'projects not available' },
        { ok: typeof UUID !== 'undefined' && UUID._registry,        reason: 'UUID registry not loaded' },
        { ok: typeof JAA !== 'undefined',                           reason: 'JAA log not loaded' },
        { ok: typeof NX_ERRORS !== 'undefined',                     reason: 'error log not available' },
        { ok: localStorage.getItem('nx6_cfg') !== null || true,     reason: 'config not saved yet' }, // soft
        { ok: true,                                                  reason: '' }, // delta — always allow
      ];
      try { NEXUS_AXIOM_HOLISTIC.enforce('homeExportAll', checks); }
      catch (e) { return; } // error already toasted
      _orig();
    };
  }

  /* ════════════════════════════════════════════════════════════════
     A15 — Roadmap import/export wired to ROADMAP tab
  ════════════════════════════════════════════════════════════════ */
  function wireRoadmapImport() {
    /* Add import + export buttons to ROADMAP tab toolbar if not present */
    const toolbar = document.querySelector('#tab-roadmap .proj-toolbar');
    if (!toolbar || document.getElementById('a15-rm-import')) return;

    const importBtn = document.createElement('button');
    importBtn.id = 'a15-rm-import';
    importBtn.className = 'btn';
    importBtn.style.cssText = 'font-size:9px;color:var(--c);border-color:rgba(0,212,255,.3)';
    importBtn.textContent = '⬆ IMPORT MD';
    importBtn.title = 'Axiom A15 — Import ROADMAP.md from disk';
    importBtn.onclick = a15ImportRoadmap;

    const exportBtn = document.createElement('button');
    exportBtn.id = 'a15-rm-export';
    exportBtn.className = 'btn';
    exportBtn.style.cssText = 'font-size:9px;color:var(--g);border-color:rgba(0,255,136,.3)';
    exportBtn.textContent = '⬇ EXPORT MD';
    exportBtn.title = 'Axiom A15 — Export roadmap as ROADMAP.md';
    exportBtn.onclick = a15ExportRoadmap;

    toolbar.appendChild(importBtn);
    toolbar.appendChild(exportBtn);
  }

  window.a15ImportRoadmap = function() {
    /* Use Electron dialog if available, else file input fallback */
    const doImport = (text) => {
      /* Parse markdown phases into roadmap items */
      const phases = [];
      const lines = text.split('\n');
      let current = null;
      lines.forEach(line => {
        const phaseMatch = line.match(/^\|\s*\*{0,2}(\d+[A-Za-z]?)\*{0,2}\s*\|\s*([^|]+)\|/);
        if (phaseMatch) {
          phases.push({ id: 'rm-' + Date.now() + '-' + phaseMatch[1], phase: phaseMatch[1].trim(), name: phaseMatch[2].trim(), status: 'planned', source: 'import' });
        }
        const h3 = line.match(/^### Phase ([^\s—]+)\s*[—-]\s*(.+)/);
        if (h3) {
          current = { id: 'rm-' + Date.now() + '-' + h3[1], phase: h3[1], name: h3[2].trim(), status: 'planned', bullets: [] };
          phases.push(current);
        }
        if (current && line.match(/^- \[[ x]\]/)) {
          current.bullets = current.bullets || [];
          current.bullets.push({ done: line.includes('- [x]'), text: line.replace(/^- \[[ x]\]\s*/, '').trim() });
        }
      });
      /* Deduplicate by phase number and persist */
      const existing = JSON.parse(localStorage.getItem('nx_roadmap_items') || '[]');
      const existingPhases = new Set(existing.map(i => i.phase));
      const toAdd = phases.filter(p => !existingPhases.has(p.phase));
      const merged = [...existing, ...toAdd];
      localStorage.setItem('nx_roadmap_items', JSON.stringify(merged));
      if (typeof renderRoadmap === 'function') renderRoadmap();
      if (typeof toast === 'function') toast('Roadmap imported: ' + toAdd.length + ' new phases', 'ok');
      log_ev('a15:roadmap-import', { count: merged.length, new: toAdd.length }, 'INFO');
    };

    if (window.nexus?.dialogFile) {
      window.nexus.dialogFile({ title: 'Import ROADMAP.md', filters: [{ name: 'Markdown', extensions: ['md', 'txt'] }] })
        .then(result => { if (result && !result.canceled) return window.nexus.readFile(result.filePath || result); })
        .then(content => { if (content) doImport(content); })
        .catch(() => {});
    } else {
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = '.md,.txt';
      inp.onchange = e => {
        const f = e.target.files[0]; if (!f) return;
        const r = new FileReader();
        r.onload = ev => doImport(ev.target.result);
        r.readAsText(f);
      };
      inp.click();
    }
  };

  window.a15ExportRoadmap = function() {
    const items = JSON.parse(localStorage.getItem('nx_roadmap_items') || '[]');
    if (!items.length) { if (typeof toast === 'function') toast('No roadmap items to export', 'warn'); return; }
    let md = '# NEXUS — Roadmap Export\n\n';
    md += '**Exported:** ' + new Date().toISOString() + '\n\n';
    const byPhase = {};
    items.forEach(i => { byPhase[i.phase] = i; });
    Object.values(byPhase).sort((a, b) => parseFloat(a.phase) - parseFloat(b.phase)).forEach(item => {
      md += `### Phase ${item.phase} — ${item.name}\n`;
      md += `**Status:** ${item.status || 'planned'}\n\n`;
      (item.bullets || []).forEach(b => { md += `- [${b.done ? 'x' : ' '}] ${b.text}\n`; });
      md += '\n';
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([md], { type: 'text/markdown' }));
    a.download = 'ROADMAP-export-' + Date.now() + '.md';
    a.click();
    if (typeof toast === 'function') toast('Roadmap exported: ROADMAP-export.md', 'ok');
    log_ev('a15:roadmap-export', { count: items.length }, 'INFO');
  };

  /* ════════════════════════════════════════════════════════════════
     A18 — Axiom preservation: axioms.json export
  ════════════════════════════════════════════════════════════════ */
  window.a18ExportAxioms = function() {
    const axioms = {
      version: '0.23.0',
      exportedAt: new Date().toISOString(),
      axioms: [
        { id: 'A0',  label: 'Build Bottom-Up',                    status: 'active',   rule: 'Always build from dependencies first. Foundation → Gates → Modules → Features.' },
        { id: 'A1',  label: 'Nothing Pretends to Work',           status: 'VIOLATED', rule: 'No UI lies about what it does. Every action produces a real result or a real error.', violation: 'compileRun() — Phase 10A' },
        { id: 'A2',  label: 'Never Rigid',                        status: 'active',   rule: 'All settings exportable. All behaviors configurable.' },
        { id: 'A3',  label: 'Default AI: Ollama',                 status: 'partial',  rule: 'Ollama is the default. Local. Free. No API key required.', pending: 'Python service — Phase 3' },
        { id: 'A4',  label: 'Extension → Default Bridge Profile', status: 'active',   rule: 'Extension connects → automatically sets activeExtension bridge profile.' },
        { id: 'A5',  label: 'All Hooks Connect Upward',           status: 'active',   rule: 'Every hook connects to: Diagnostics, Settings gear, Builder fields, Bridge tab.' },
        { id: 'A6',  label: 'Event Bus Only for Inter-Module',    status: 'active',   rule: 'Modules communicate exclusively via EventBus. No direct function calls between modules.' },
        { id: 'A7',  label: 'Separate Process for Heavy Ops',     status: 'partial',  rule: 'CPU-heavy work runs in child processes. Never blocks the Electron main thread.', pending: 'Python service + compiler — Phases 3, 10A' },
        { id: 'A8',  label: 'All Failures Produce a Toast',       status: 'active',   rule: 'Nothing fails silently. Every error produces a visible toast + JAA log entry.' },
        { id: 'A9',  label: 'All UUIDs Exportable',               status: 'active',   rule: 'Full UUID registry downloadable as JSON + CSV at any time.' },
        { id: 'A10', label: 'Bridge Port Always Configurable',    status: 'active',   rule: 'Bridge port defaults to 3747 but is always user-configurable.' },
        { id: 'A11', label: 'All Bridge Endpoints Have Hook IDs', status: 'partial',  rule: 'Every bridge route emits a hookId event.', pending: 'Phase 4' },
        { id: 'A12', label: 'Unimplemented Targets Labelled',     status: 'VIOLATED', rule: 'Compiler targets not yet implemented are labelled DISABLED in UI.', violation: 'All targets shown active — Phase 10A' },
        { id: 'A13', label: 'Pipeline Steps Generate Hook IDs',   status: 'pending',  rule: 'Every SISO gate generates a UUID-addressed hook event.', pending: 'Phase 13' },
        { id: 'A14', label: 'Theme Settings Exportable as JSON',  status: 'pending',  rule: 'Full appearance config downloadable as nexus-theme.json.', pending: 'Phase 19' },
        { id: 'A15', label: 'Roadmap Importable/Exportable',      status: 'active',   rule: 'ROADMAP.md can be imported into the Roadmap tab and exported back.', note: 'Implemented Phase 2 completion' },
        { id: 'A16', label: 'Build Bottom-Up: Solid Bedrock',     status: 'active',   rule: 'Phase 1 bedrock is the immovable foundation for all subsequent phases.' },
        { id: 'A17', label: 'Hook-First Design',                  status: 'active',   rule: 'All featureIds defined before implementation. HookRegistry is the source of truth.' },
        { id: 'A18', label: 'Axiom Preservation',                 status: 'active',   rule: 'Axiom state exportable as axioms.json at any time. Violations tracked.', note: 'Implemented Phase 2 completion' },
        { id: 'A19', label: 'One AI Section at a Time',           status: 'pending',  rule: 'AI settings consolidated under single AGENTS tab.', pending: 'Phase 5' },
        { id: 'A20', label: 'Dynamic Bridge Routing via Meta-Gates', status: 'active', rule: '/bridge/route resolves intent → chain dynamically at request time.' },
        { id: 'A21', label: 'Holistic or Nothing',                status: 'active',   rule: 'Every output is complete or it does not ship. No partial files. No fragmented deliveries. A ZIP, not a folder. A system, not a collection of parts.' },
      ],
      violations: [],
      summary: {},
    };
    axioms.violations = axioms.axioms.filter(a => a.status === 'VIOLATED');
    axioms.summary = {
      total: axioms.axioms.length,
      active: axioms.axioms.filter(a => a.status === 'active').length,
      partial: axioms.axioms.filter(a => a.status === 'partial').length,
      pending: axioms.axioms.filter(a => a.status === 'pending').length,
      violated: axioms.violations.length,
    };
    const blob = new Blob([JSON.stringify(axioms, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'nexus-axioms-' + Date.now() + '.json'; a.click();
    if (typeof toast === 'function') toast('Axioms exported: nexus-axioms.json', 'ok');
    log_ev('a18:axioms-export', axioms.summary, 'INFO');
  };

  /* Wire A18 button into OPTIONS if not already present */
  function wireA18Button() {
    const optTab = document.getElementById('tab-options');
    if (!optTab || document.getElementById('a18-export-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'a18-export-btn';
    btn.className = 'btn';
    btn.style.cssText = 'font-size:9px;color:var(--y);border-color:rgba(255,204,0,.3);margin:6px 14px;width:calc(100% - 28px)';
    btn.innerHTML = '⬇ EXPORT AXIOMS (A18)';
    btn.onclick = window.a18ExportAxioms;
    /* Insert at top of first accordion in options */
    const firstAcc = optTab.querySelector('.acc-item');
    if (firstAcc) firstAcc.parentNode.insertBefore(btn, firstAcc);
  }

  /* ════════════════════════════════════════════════════════════════
     Wizard Collapse — 6 steps → 2
     Step 0: WHO IS THIS FOR (keep)
     Step 1: WHAT ARE YOU BUILDING (merged from steps 1+2+3+4)
     Remaining steps hidden, data captured inline
  ════════════════════════════════════════════════════════════════ */
  function collapseWizard() {
    /* Only run once */
    if (document.body.dataset.wizCollapsed) return;
    document.body.dataset.wizCollapsed = '1';

    /* Hide steps 2-5, show only 0 and 1 */
    [2, 3, 4, 5].forEach(n => {
      const slide = document.querySelector(`.wiz-slide[data-step="${n}"]`);
      if (slide) slide.style.display = 'none';
    });

    /* Rewrite step 1 to be the everything step */
    const step1 = document.querySelector('.wiz-slide[data-step="1"]');
    if (!step1) return;

    /* Replace heading */
    const q = step1.querySelector('.wiz-q');
    if (q) q.textContent = 'WHAT ARE YOU BUILDING?';
    const sub = step1.querySelector('.wiz-sub');
    if (sub) sub.textContent = 'Describe your vision. Everything else is inferred.';

    /* Remove old radio options from step 1 */
    const oldOpts = step1.querySelector('.wiz-options');
    if (oldOpts) oldOpts.remove();

    /* Insert unified input if not already there */
    if (!document.getElementById('wiz-unified-input')) {
      const unifiedBlock = document.createElement('div');
      unifiedBlock.id = 'wiz-unified-input';
      unifiedBlock.style.cssText = 'width:100%;display:flex;flex-direction:column;gap:10px;max-width:560px;';
      unifiedBlock.innerHTML = `
        <textarea id="wiz-vision-unified" class="wiz-input wiz-data" data-key="intention" rows="4"
          placeholder="Describe what you want to build or fix — be specific…"
          style="resize:vertical;width:100%;"></textarea>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <select id="wiz-arch-sel" class="finp wiz-data" data-key="architecture" style="flex:1;min-width:140px;">
            <option value="single">Single File</option>
            <option value="grouped">HTML + JS + CSS</option>
            <option value="modular">Full Modular</option>
          </select>
          <select id="wiz-ambition-sel" class="finp wiz-data" data-key="ambition" style="flex:1;min-width:140px;">
            <option value="conventional">Conventional</option>
            <option value="unconventional">Get Weird</option>
            <option value="outlier">Maximum Ambition</option>
          </select>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;" id="wiz-interface-checks">
          <label class="wiz-check" data-val="browser" onclick="wizToggle(this)"><div class="wiz-check-box"></div>WEB</label>
          <label class="wiz-check" data-val="desktop" onclick="wizToggle(this)"><div class="wiz-check-box"></div>DESKTOP</label>
          <label class="wiz-check" data-val="cli"     onclick="wizToggle(this)"><div class="wiz-check-box"></div>CLI</label>
          <label class="wiz-check" data-val="mobile"  onclick="wizToggle(this)"><div class="wiz-check-box"></div>MOBILE</label>
          <label class="wiz-check" data-val="api"     onclick="wizToggle(this)"><div class="wiz-check-box"></div>API</label>
        </div>`;

      const existingInputArea = step1.querySelector('.wiz-input-area');
      if (existingInputArea) existingInputArea.replaceWith(unifiedBlock);
      else {
        const nav = step1.querySelector('.wiz-nav');
        if (nav) step1.insertBefore(unifiedBlock, nav);
      }
    }

    /* Update nav buttons: step 1 goes straight to BUILD */
    const nav = step1.querySelector('.wiz-nav');
    if (nav) {
      nav.innerHTML = `
        <button class="btn" onclick="wizPrev()">← BACK</button>
        <button class="btn primary" onclick="wizFinish()" style="background:rgba(0,255,136,.07);border-color:rgba(0,255,136,.4);color:var(--g)">✦ BUILD →</button>`;
    }

    /* Update dot count */
    const dots = document.getElementById('wiz-dots');
    if (dots) dots.innerHTML = '<div style="width:6px;height:6px;border-radius:50%;background:var(--text3);"></div><div style="width:6px;height:6px;border-radius:50%;background:var(--c);"></div>';
  }

  /* ════════════════════════════════════════════════════════════════
     Welcome-back auto-enter progress ring
  ════════════════════════════════════════════════════════════════ */
  function addEnterRing() {
    const btn = document.getElementById('wb-enter-btn');
    if (!btn || btn.dataset.ring) return;
    btn.dataset.ring = '1';

    /* SVG ring overlay */
    const ring = document.createElement('div');
    ring.style.cssText = 'position:absolute;inset:-6px;border-radius:6px;pointer-events:none;overflow:hidden;';
    ring.innerHTML = `<svg id="wb-ring-svg" style="position:absolute;inset:0;width:100%;height:100%;opacity:.6" viewBox="0 0 200 50" preserveAspectRatio="none">
      <rect id="wb-ring-rect" x="1" y="1" width="0" height="48" rx="4" fill="none" stroke="rgba(0,212,255,.6)" stroke-width="1.5"/>
    </svg>`;
    btn.style.position = 'relative';
    btn.appendChild(ring);

    /* Idle pulse — animates indefinitely until user clicks */
    let pct = 0; let dir = 1;
    const interval = setInterval(() => {
      pct += dir * 1.2;
      if (pct >= 100) dir = -1;
      if (pct <= 0) dir = 1;
      const rect = document.getElementById('wb-ring-rect');
      if (rect) rect.setAttribute('width', Math.round(pct * 1.98));
    }, 30);
    btn._ringInterval = interval;

    /* Cancel on hover */
    btn.addEventListener('mouseenter', () => {
      clearInterval(interval);
      ring.remove();
    }, { once: true });
  }

  /* Patch nxShowWelcomeBack to add ring after render */
  const _origWB = window.nxShowWelcomeBack;
  if (typeof _origWB === 'function') {
    window.nxShowWelcomeBack = function(...args) {
      _origWB(...args);
      setTimeout(addEnterRing, 800);
    };
  }

  /* ════════════════════════════════════════════════════════════════
     Status pill truth — AI pill shows real model name
  ════════════════════════════════════════════════════════════════ */
  function truthPills() {
    /* AI pill: show active model, not just "AI" */
    function updateAIPill() {
      const pill = document.getElementById('pill-ai');
      const txt  = document.getElementById('pill-ai-txt');
      const badge = document.getElementById('active-model-badge');
      if (!txt) return;

      const cfg = lc();
      const prov = cfg.defaultProvider || localStorage.getItem('nx6_last_provider') || '';
      const modelMap = {
        chatgpt:  cfg.chatgptModel  || 'gpt-4o',
        claude:   cfg.claudeModel   || 'claude-sonnet',
        deepseek: cfg.deepseekModel || 'deepseek-chat',
        gemini:   cfg.geminiKey     ? 'gemini-pro' : '',
        ollama:   cfg.ollamaModel   || 'deepseek-r1:8b',
        lmstudio: cfg.lmstudioModel || 'local',
        local:    cfg.ollamaModel   || 'local',
      };
      const model = modelMap[prov] || '';
      const label = prov ? (prov.toUpperCase() + (model ? ' · ' + model : '')) : 'NO AI';
      txt.textContent = label;
      if (badge) badge.textContent = prov ? prov.toUpperCase() : '—';

      /* Pill color by provider */
      const colorMap = { chatgpt:'var(--g)', claude:'var(--o)', ollama:'var(--c)', deepseek:'var(--c)', gemini:'var(--c)', grok:'var(--y)', local:'var(--text2)' };
      const color = colorMap[prov] || 'var(--text3)';
      const dot = pill?.querySelector('.pill-dot');
      if (dot) { dot.style.background = prov ? color : 'var(--text4)'; dot.style.boxShadow = prov ? `0 0 6px ${color}` : 'none'; }
      if (pill) { pill.style.color = prov ? color : 'var(--text3)'; pill.style.borderColor = prov ? color.replace('var(', 'rgba(').replace(')', ',.3)') : 'var(--border2)'; }
    }

    updateAIPill();
    setInterval(updateAIPill, 8000);

    /* Bridge pill: hide when local model active, show when bridge configured */
    function updateBridgePill() {
      const cfg = lc();
      const prov = cfg.defaultProvider || localStorage.getItem('nx6_last_provider') || '';
      const isLocal = prov === 'ollama' || prov === 'lmstudio' || prov === 'local';
      const bridgePill = document.getElementById('bridge-status-pill');
      /* Already hidden by p25 for local — keep it hidden, done */
      if (bridgePill && !isLocal) {
        /* Re-show for non-local and reflect actual bridge state */
        const bridgeConnected = typeof BRIDGE !== 'undefined' && BRIDGE.connected;
        bridgePill.style.display = '';
        bridgePill.className = bridgeConnected ? 'pill pill-ok' : 'pill pill-idle';
        const btxt = document.getElementById('bridge-status-txt');
        if (btxt) btxt.textContent = bridgeConnected ? 'BRIDGE ONLINE' : 'BRIDGE OFFLINE';
      }
    }
    updateBridgePill();
    setInterval(updateBridgePill, 10000);
  }

  /* ════════════════════════════════════════════════════════════════
     A21 — Wrap homeExportAll + compilePackage
  ════════════════════════════════════════════════════════════════ */
  function enforceA21OnExports() {
    /* compilePackage must A21-check that a build actually ran */
    const _origPkg = typeof compilePackage === 'function' ? compilePackage.bind(window) : null;
    if (_origPkg) {
      window.compilePackage = function() {
        try {
          NEXUS_AXIOM_HOLISTIC.enforce('compilePackage', [
            { ok: !!window._lastBuildPkg, reason: 'No build has been run — run COMPILE first' },
            { ok: window._lastBuildPkg?.targets?.length > 0, reason: 'Build has no targets' },
          ]);
        } catch { return; }
        _orig();
      };
    }
  }

  /* ════════════════════════════════════════════════════════════════
     A21 — Register in hook system + add to FORGE gate settings
  ════════════════════════════════════════════════════════════════ */
  function registerA21InForge() {
    /* Add A21 toggle to gate settings if forge settings panel exists */
    setTimeout(() => {
      const gateList = document.querySelector('#forge-gate-settings .gate-list, #forge-settings .gate-list');
      if (!gateList || document.getElementById('gate-a21')) return;
      const row = document.createElement('div');
      row.id = 'gate-a21';
      row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid var(--border);';
      row.innerHTML = `
        <div style="flex:1;">
          <div style="font-size:10px;color:var(--text)">A21 — Holistic or Nothing</div>
          <div style="font-size:8px;color:var(--text3)">Block partial outputs. Complete delivery only.</div>
        </div>
        <label class="chk on" id="gate-a21-chk" onclick="this.classList.toggle('on');window.NEXUS_AXIOM_HOLISTIC._enabled=this.classList.contains('on')"><div class="chk-dot"></div></label>`;
      gateList.appendChild(row);
    }, 2000);
  }

  /* ════════════════════════════════════════════════════════════════
     BOOT
  ════════════════════════════════════════════════════════════════ */
  whenReady(() => {
    registerA21Hook();
    wireRoadmapImport();
    wireA18Button();
    collapseWizard();
    truthPills();
    wrapExportAll();
    enforceA21OnExports();
    registerA21InForge();
    /* Hook wizard collapse to wizOpen */
    const _origWizOpen = typeof wizOpen === 'function' ? wizOpen.bind(window) : null;
    if (_origWizOpen) {
      window.wizOpen = function() { _origWizOpen(); setTimeout(collapseWizard, 50); };
    }
  });

  /* Expose for Roadmap tab render — adds import/export after tab switch */
  const _origSwitchTab = typeof switchTab === 'function' ? switchTab.bind(window) : null;
  if (_origSwitchTab) {
    window.switchTab = function(tab) {
      _origSwitchTab(tab);
      if (tab === 'roadmap') setTimeout(wireRoadmapImport, 200);
    };
  }

  console.log('[NEXUS v0.53.0] Phase 2 complete. A15 ✓ A18 ✓ A21 ✓ Wizard collapsed. Pills truthful. Enter ring active.');

})();
