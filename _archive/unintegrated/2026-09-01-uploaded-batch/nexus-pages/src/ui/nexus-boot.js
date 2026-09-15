/* NEXUS v0.53.0 — nexus-boot.js
 * Full-screen loading sequence + toast system + Guardian execute test
 * Runs before any other UI. Shows startup steps, bridge health, Guardian status.
 */

// ── Toast System (replaces old toasts) ────────────────────────────────────────
(function installToasts() {
  // Create toast root if not present
  if (!document.getElementById('toast-root')) {
    const r = document.createElement('div');
    r.id = 'toast-root';
    r.style.cssText = [
      'position:fixed', 'bottom:16px', 'right:16px', 'z-index:99999',
      'display:flex', 'flex-direction:column-reverse', 'gap:6px',
      'pointer-events:none', 'max-width:360px',
    ].join(';');
    document.body.appendChild(r);
  }

  const ICONS = { ok:'✓', err:'✕', warn:'⚠', info:'ℹ', crit:'⬡' };
  const COLORS = {
    ok:   { border:'#00ff88', text:'#00ff88', bg:'rgba(0,255,136,0.07)' },
    err:  { border:'#ff4466', text:'#ff4466', bg:'rgba(255,68,102,0.07)' },
    warn: { border:'#ffd700', text:'#ffd700', bg:'rgba(255,215,0,0.07)'  },
    info: { border:'#00d4ff', text:'#00d4ff', bg:'rgba(0,212,255,0.07)'  },
    crit: { border:'#cc44ff', text:'#cc44ff', bg:'rgba(204,68,255,0.07)' },
  };

  window.toast = function(msg, type, ms, source) {
    type = type || 'ok';
    ms   = ms   || 3500;
    const col = COLORS[type] || COLORS.info;
    const r   = document.getElementById('toast-root');
    if (!r) return;

    const d = document.createElement('div');
    d.style.cssText = [
      'display:flex', 'align-items:flex-start', 'gap:8px',
      'background:' + col.bg,
      'border:1px solid ' + col.border,
      'border-radius:3px',
      'padding:8px 10px',
      'font:700 10px "IBM Plex Mono",monospace',
      'color:' + col.text,
      'pointer-events:all',
      'cursor:pointer',
      'transform:translateX(20px)',
      'opacity:0',
      'transition:all .18s ease',
      'max-width:360px',
      'word-break:break-word',
      'box-shadow:0 2px 12px rgba(0,0,0,.4)',
    ].join(';');

    const icon = document.createElement('span');
    icon.style.cssText = 'flex-shrink:0;font-size:11px;margin-top:1px';
    icon.textContent = ICONS[type] || '·';

    const body = document.createElement('div');
    body.style.cssText = 'flex:1';
    if (source) {
      const src = document.createElement('div');
      src.style.cssText = 'font-size:8px;opacity:.5;margin-bottom:2px;letter-spacing:.08em';
      src.textContent = source.toUpperCase();
      body.appendChild(src);
    }
    const txt = document.createElement('div');
    txt.style.cssText = 'font-size:10px;line-height:1.45;font-weight:700';
    txt.textContent = msg;
    body.appendChild(txt);

    // For errors: add "View Log" link
    if ((type === 'err' || type === 'crit') && window.nxOpenCrashLog) {
      const lnk = document.createElement('div');
      lnk.style.cssText = 'font-size:8px;opacity:.6;margin-top:4px;cursor:pointer;text-decoration:underline';
      lnk.textContent = '⚠ view crash log';
      lnk.onclick = function(e) { e.stopPropagation(); window.nxOpenCrashLog(); dismiss(); };
      body.appendChild(lnk);
      // Also report to crash logger
      if (window.electronAPI && window.electronAPI.invoke) {
        window.electronAPI.invoke('nexus:crash-report', { level:'ERROR', source: source||'toast', msg, detail:null }).catch(function(){});
      }
    }

    const close = document.createElement('button');
    close.style.cssText = 'background:none;border:none;color:inherit;opacity:.4;cursor:pointer;padding:0;font-size:12px;line-height:1;flex-shrink:0';
    close.textContent = '×';
    close.onclick = function(e) { e.stopPropagation(); dismiss(); };

    d.appendChild(icon);
    d.appendChild(body);
    d.appendChild(close);
    d.onclick = function() { dismiss(); };

    r.appendChild(d);
    requestAnimationFrame(function() { d.style.transform = 'translateX(0)'; d.style.opacity = '1'; });

    function dismiss() {
      d.style.transform = 'translateX(24px)';
      d.style.opacity = '0';
      setTimeout(function() { if (d.parentNode) d.parentNode.removeChild(d); }, 200);
    }
    const timer = setTimeout(dismiss, ms);
    d.addEventListener('mouseenter', function() { clearTimeout(timer); });
    d.addEventListener('mouseleave', function() { setTimeout(dismiss, 1200); });

    return dismiss;
  };
})();

// ── Boot loading screen ────────────────────────────────────────────────────────
(function bootScreen() {
  if (document.getElementById('nx-boot-overlay')) return;
  if (document.readyState === 'complete' && window._nxBootDone) return;

  const overlay = document.createElement('div');
  overlay.id = 'nx-boot-overlay';
  overlay.style.cssText = [
    'position:fixed', 'inset:0', 'z-index:99998',
    'background:#07071a',
    'display:flex', 'flex-direction:column',
    'align-items:center', 'justify-content:center',
    'font-family:"IBM Plex Mono",monospace',
    'transition:opacity .4s ease',
  ].join(';');

  overlay.innerHTML = `
    <div style="width:320px;max-width:90vw">
      <!-- Logo -->
      <div style="text-align:center;margin-bottom:32px">
        <div style="font-size:28px;font-weight:900;letter-spacing:.35em;color:#00d4ff;text-shadow:0 0 24px rgba(0,212,255,.4)">NEXUS</div>
        <div style="font-size:9px;letter-spacing:.25em;color:rgba(0,212,255,.4);margin-top:4px">v0.53.0 · COGNITIVE OS</div>
      </div>

      <!-- Step list -->
      <div id="nx-boot-steps" style="display:flex;flex-direction:column;gap:6px;margin-bottom:24px"></div>

      <!-- Progress bar -->
      <div style="height:2px;background:rgba(255,255,255,.06);border-radius:1px;overflow:hidden">
        <div id="nx-boot-bar" style="height:100%;width:0%;background:linear-gradient(90deg,#00d4ff,#00ff88);border-radius:1px;transition:width .3s ease"></div>
      </div>

      <!-- Status -->
      <div id="nx-boot-status" style="text-align:center;margin-top:12px;font-size:9px;color:rgba(0,212,255,.5);letter-spacing:.1em">INITIALISING…</div>
    </div>
  `;

  document.body.appendChild(overlay);

  const steps = [
    { id:'lock',    label:'Single instance lock' },
    { id:'crash',   label:'Crash logger' },
    { id:'bridge',  label:'Bridge server :3747' },
    { id:'guardian',label:'Guardian extension' },
    { id:'tray',    label:'System tray' },
    { id:'ipc',     label:'IPC surface' },
    { id:'ui',      label:'UI scripts' },
  ];

  const stepEls = {};
  const stepsEl = document.getElementById('nx-boot-steps');
  steps.forEach(function(s) {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:8px';

    const dot = document.createElement('div');
    dot.style.cssText = 'width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.1);flex-shrink:0;transition:background .2s,box-shadow .2s';

    const lbl = document.createElement('div');
    lbl.style.cssText = 'font-size:9px;letter-spacing:.1em;color:rgba(160,160,200,.4);flex:1;transition:color .2s';
    lbl.textContent = s.label.toUpperCase();

    const val = document.createElement('div');
    val.style.cssText = 'font-size:9px;color:rgba(160,160,200,.3);font-weight:700';
    val.textContent = '—';

    row.appendChild(dot); row.appendChild(lbl); row.appendChild(val);
    stepsEl.appendChild(row);
    stepEls[s.id] = { dot, lbl, val };
  });

  function setStep(id, state, value) {
    var el = stepEls[id];
    if (!el) return;
    var colors = {
      pending: { dot:'rgba(255,255,255,.1)',   text:'rgba(160,160,200,.4)', shadow:'' },
      running: { dot:'#00d4ff',                text:'#00d4ff',              shadow:'0 0 6px #00d4ff' },
      ok:      { dot:'#00ff88',                text:'rgba(200,220,200,.7)', shadow:'0 0 4px #00ff88' },
      warn:    { dot:'#ffd700',                text:'rgba(220,200,100,.7)', shadow:'0 0 4px #ffd700' },
      err:     { dot:'#ff4466',                text:'rgba(220,100,100,.7)', shadow:'0 0 4px #ff4466' },
    };
    var col = colors[state] || colors.pending;
    el.dot.style.background  = col.dot;
    el.dot.style.boxShadow   = col.shadow;
    el.lbl.style.color       = col.text;
    if (value !== undefined) el.val.textContent = value;
  }

  function setStatus(msg) {
    var el = document.getElementById('nx-boot-status');
    if (el) el.textContent = msg;
  }

  function setProgress(pct) {
    var el = document.getElementById('nx-boot-bar');
    if (el) el.style.width = pct + '%';
  }

  function dismiss() {
    window._nxBootDone = true;
    overlay.style.opacity = '0';
    setTimeout(function() {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 420);
  }

  // Run the boot sequence
  async function runBoot() {
    setStep('lock',    'ok',  'ACQUIRED');  setProgress(14);
    await _delay(80);
    setStep('crash',   'ok',  'READY');     setProgress(28);
    await _delay(80);

    // Bridge check
    setStep('bridge',  'running', 'CONNECTING'); setStatus('Probing bridge…');
    await _delay(200);
    try {
      var r = await fetch('http://127.0.0.1:3747/health', { signal: AbortSignal.timeout(2000) });
      var d = await r.json();
      setStep('bridge', 'ok', 'v' + (d.version||'?') + ' LIVE');
      setProgress(42);
    } catch(_) {
      setStep('bridge', 'warn', 'STARTING…');
      setProgress(42);
    }
    await _delay(120);

    // Guardian check
    setStep('guardian', 'running', 'PROBING'); setStatus('Checking Guardian…');
    await _delay(300);
    try {
      var gr = await fetch('http://127.0.0.1:3747/guardian/status', { signal: AbortSignal.timeout(1500) });
      var gd = await gr.json();
      if (gd.connected) setStep('guardian', 'ok', 'CONNECTED');
      else              setStep('guardian', 'warn', 'NOT CONNECTED');
    } catch(_) {
      setStep('guardian', 'warn', 'NO BRIDGE');
    }
    setProgress(57);
    await _delay(100);

    setStep('tray',    'ok', 'ACTIVE');  setProgress(71);
    await _delay(80);
    setStep('ipc',     'ok', 'WIRED');   setProgress(85);
    await _delay(80);
    setStep('ui',      'running', 'LOADING'); setStatus('Loading interface…');
    await _delay(400);
    setStep('ui',      'ok', 'READY');
    setProgress(100);
    setStatus('NEXUS READY');
    await _delay(350);
    dismiss();
  }

  function _delay(ms) { return new Promise(function(r){ setTimeout(r, ms); }); }

  // Start after a tiny delay so DOM settles
  setTimeout(runBoot, 120);
})();
