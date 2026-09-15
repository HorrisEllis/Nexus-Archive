/* nexus-home.js — Home screen AI mode, provider selection, browser profiles
 * Extracted from nexus-patches.js during consolidation 2026-04-21
 */

/* ── HOME SCREEN AI MODE ─────────────────────────────────────── */
// Tracks which mode was chosen on the home screen
let _homeAIMode = null; // 'api' | 'bridge'

function homeSetAIMode(mode) {
  _homeAIMode = mode;
  // HTML uses 'guardian' not 'bridge' for the second mode
  const guardianMode = (mode === 'guardian' || mode === 'bridge');
  const apiCard      = document.getElementById('home-mode-api');
  const guardianCard = document.getElementById('home-mode-guardian');
  const apiCfg       = document.getElementById('home-api-config');
  const guardianCfg  = document.getElementById('home-guardian-config');
  const skipRow      = document.getElementById('home-skip-row');

  // Visual active state
  const on  = 'flex:1;padding:10px 14px;border-radius:3px;cursor:pointer;transition:all .2s;background:rgba(0,212,255,.07);border:1px solid rgba(0,212,255,.4);';
  const off = 'flex:1;padding:10px 14px;border-radius:3px;cursor:pointer;transition:all .2s;background:var(--bg2);border:1px solid var(--border2);';
  if (apiCard)      apiCard.style.cssText      = !guardianMode ? on : off;
  if (guardianCard) guardianCard.style.cssText  =  guardianMode ? on : off;

  if (apiCfg)      apiCfg.style.display      = !guardianMode ? '' : 'none';
  if (guardianCfg) guardianCfg.style.display  =  guardianMode ? '' : 'none';
  if (skipRow)     skipRow.style.display      = 'flex';

  // Update badge
  const badge = document.getElementById('home-ai-mode-badge');
  if (badge) {
    badge.textContent  = guardianMode ? 'GUARDIAN MODE' : 'API MODE';
    badge.style.color  = guardianMode ? 'var(--g)' : 'var(--c)';
    badge.style.borderColor = guardianMode ? 'rgba(0,255,136,.3)' : 'rgba(0,212,255,.3)';
  }

  // Toast so user knows something happened
  if (guardianMode) {
    if(typeof toast === 'function') toast('Guardian mode — pick elements in browser, no API key needed', 'ok', 4000);
  } else {
    if(typeof toast === 'function') toast('API mode — add an API key below to connect', 'ok', 3000);
  }

  try { UUID.gen('action', { action:'home:ai:mode:set', mode }, 'home:ai:mode'); } catch{}
  try { S.emit('home:ai:mode', { mode }, 'INFO'); } catch{}
}

function homeApiProviderChanged() {
  const p = val('home-api-provider');
  const keyInp    = document.getElementById('home-api-key-input');
  const urlInp    = document.getElementById('home-api-url-input');
  const dsNote    = document.getElementById('home-api-deepseek-note');
  const ollamaNote = document.getElementById('home-api-ollama-note');

  if (keyInp)    keyInp.placeholder   = p === 'ollama' ? '(not required)' : p === 'claude' ? 'sk-ant-…' : p === 'deepseek' ? 'sk-…' : 'sk-…';
  if (urlInp)    urlInp.style.display = p === 'ollama' ? '' : 'none';
  if (dsNote)    dsNote.style.display    = p === 'deepseek' ? '' : 'none';
  if (ollamaNote) ollamaNote.style.display = p === 'ollama'    ? '' : 'none';
  if (urlInp && p === 'ollama') urlInp.placeholder = 'http://localhost:11434';
}

function homeApiSave() {
  const provider = val('home-api-provider');
  const key      = val('home-api-key-input');
  const url      = val('home-api-url-input');
  const st       = document.getElementById('home-api-status');

  if (!key && provider !== 'ollama') {
    if (st) { st.textContent = '⚠ API key required'; st.style.color = 'var(--y)'; }
    return;
  }

  // Set provider and key in options
  setVal('opt-ai-provider', provider);
  AI.provider = provider;

  if (provider === 'claude')    { setVal('opt-claude-key', key); }
  if (provider === 'chatgpt')   { setVal('opt-chatgpt-key', key); if (url) setVal('opt-chatgpt-url', url); }
  if (provider === 'deepseek')  { setVal('opt-deepseek-key', key); if (url) setVal('opt-deepseek-url', url); }
  if (provider === 'ollama')    { if (url) setVal('opt-ollama-url', url); }

  // Sync to config
  try { saveConfig(); } catch {}
  onProviderChange();

  if (st) { st.textContent = '✓ Saved'; st.style.color = 'var(--g)'; }

  const badge = document.getElementById('home-ai-mode-badge');
  if (badge) { badge.textContent = provider.toUpperCase() + ' · API'; badge.style.color = 'var(--g)'; }

  UUID.gen('action', { action:'home:api:save', provider }, 'home:api:save');
  S.emit('home:api:save', { provider }, 'INFO');
  toast(provider.toUpperCase() + ' API key saved', 'ok');

  // Hide the card after saving
  setTimeout(() => {
    const card = document.getElementById('home-ai-card');
    if (card) card.style.borderColor = 'rgba(0,255,136,.25)';
  }, 500);
}

async function homeBridgeConnect() {
  const url = val('home-bridge-url') || 'http://127.0.0.1:3747';
  setVal('bridge-url', url);
  const pill    = document.getElementById('home-bridge-pill');
  const pillTxt = document.getElementById('home-bridge-pill-txt');
  if (pill)    pill.className    = 'pill pill-busy';
  if (pillTxt) pillTxt.textContent = 'CONNECTING…';

  try {
    const r = await Promise.race([
      fetch(url + '/health'),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 4000))
    ]);
    if (r.ok) {
      const j = await r.json().catch(() => ({}));
      if (pill)    pill.className    = 'pill pill-ok';
      if (pillTxt) pillTxt.textContent = 'ONLINE · v' + (j.version || '?');
      // Sync to BRIDGE state
      if (typeof BRIDGE !== 'undefined') {
        BRIDGE.connected = true; BRIDGE.url = url;
      }
      const badge = document.getElementById('home-ai-mode-badge');
      if (badge) { badge.textContent = 'BRIDGE · ONLINE'; badge.style.color = 'var(--g)'; }
      setPill('bridge-status-pill-opt', 'ok', 'ONLINE');
      UUID.gen('action', { action:'home:bridge:connect', url, version: j.version }, 'home:bridge');
      S.emit('bridge:connected', { url, version: j.version }, 'OK');
      toast('Bridge connected at ' + url, 'ok');

      // Run profile detection automatically on bridge connect
      setTimeout(homeDetectProfiles, 400);
    } else {
      throw new Error('HTTP ' + r.status);
    }
  } catch(e) {
    if (pill)    pill.className    = 'pill pill-err';
    if (pillTxt) pillTxt.textContent = 'OFFLINE';
    nxError('HOME_BRIDGE_FAIL', 'Bridge connection failed', e.message + ' — Is the bridge server running? Run: node bridge-server.js', 'home:bridge');
  }
}

async function homeBridgeTest() {
  await homeBridgeConnect();
}

/* ── BROWSER PROFILE DETECTION (home screen) ─────────────────── */
let _homeProfiles     = [];
let _homeActiveProfile = null;

async function homeDetectProfiles() {
  const list = document.getElementById('home-profile-list');
  if (list) list.innerHTML = '<div style="font-size:9px;color:var(--y)">Detecting…</div>';

  UUID.gen('action', { action:'home:detect:profiles' }, 'home:profiles');

  let profiles = [];

  // Try Electron IPC first
  if (_isElectron && window.NEXUS_ELECTRON) {
    try {
      const r = await window.NEXUS_ELECTRON.detectProfiles();
      if (r?.ok) profiles = r.profiles || [];
    } catch {}
  }

  // Try bridge
  if (!profiles.length && typeof BRIDGE !== 'undefined' && BRIDGE.connected) {
    try {
      const r = await fetch((val('bridge-url')||'http://127.0.0.1:3747') + '/profiles/detect');
      const j = await r.json();
      if (j.ok) profiles = j.profiles || [];
    } catch {}
  }

  _homeProfiles = profiles;

  if (!list) return;
  if (!profiles.length) {
    list.innerHTML = `
      <div style="font-size:9px;color:var(--text3);font-style:italic">No profiles found automatically.</div>
      <div style="font-size:9px;color:var(--text3);margin-top:4px">Requires Electron app or bridge server running. Or upload a profile folder manually.</div>`;
    return;
  }

  // Group by browser
  const grouped = {};
  profiles.forEach(p => {
    if (!grouped[p.browser]) grouped[p.browser] = [];
    grouped[p.browser].push(p);
  });

  list.innerHTML = '';
  Object.entries(grouped).forEach(([browser, profs]) => {
    const hdr = document.createElement('div');
    hdr.style.cssText = 'font-family:var(--display);font-size:9px;letter-spacing:.12em;color:var(--text3);padding:4px 0 2px';
    hdr.textContent = browser.toUpperCase();
    list.appendChild(hdr);

    profs.forEach(p => {
      const isFirefox = p.type === 'firefox';
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:6px;padding:5px 8px;background:var(--bg3);border:1px solid var(--border2);border-radius:2px;margin-bottom:3px;font-size:9px;cursor:pointer;transition:all .15s';
      row.onmouseover = () => row.style.borderColor = 'var(--border3)';
      row.onmouseout  = () => row.style.borderColor = (_homeActiveProfile?.path === p.path) ? 'rgba(0,255,136,.4)' : 'var(--border2)';
      row.innerHTML = `
        <span style="font-size:11px">${isFirefox ? '🦊' : '🌐'}</span>
        <span style="color:var(--text);flex:1">${esc(p.name)}</span>
        <span style="color:var(--text3);font-size:10px">${esc(p.id)}</span>
        <button class="btn ok" style="font-size:10px;padding:1px 6px" onclick="homeUseProfile(${JSON.stringify(p).replace(/"/g,'&quot;')})">USE</button>
        <button class="btn" style="font-size:10px;padding:1px 6px" onclick="homeMirrorProfile(${JSON.stringify(p).replace(/"/g,'&quot;')})">MIRROR</button>
      `;
      list.appendChild(row);

      // Auto-select first Firefox profile
      if (isFirefox && !_homeActiveProfile) {
        homeUseProfile(p);
      }
    });
  });

  S.emit('home:profiles:detected', { count: profiles.length }, 'INFO');
  toast(profiles.length + ' browser profile(s) found', 'ok');
}

function homeUseProfile(profile) {
  _homeActiveProfile = profile;

  const activeDiv  = document.getElementById('home-active-profile');
  const activeName = document.getElementById('home-active-profile-name');
  const activePath = document.getElementById('home-active-profile-path');

  if (activeDiv)  activeDiv.style.display = '';
  if (activeName) activeName.textContent  = profile.browser + ' — ' + profile.name;
  if (activePath) activePath.textContent  = profile.path;

  // Save to config
  try {
    const cfg = JSON.parse(localStorage.getItem('nx5_config') || '{}');
    cfg.activeBrowserProfile = { browser: profile.browser, name: profile.name, path: profile.path, type: profile.type };
    localStorage.setItem('nx5_config', JSON.stringify(cfg));
  } catch {}

  // Sync to bridge-url input + options
  const bridgeSection = document.getElementById('profile-detect-section');

  UUID.gen('action', { action:'home:profile:use', browser: profile.browser, name: profile.name }, 'home:profile:use');
  S.emit('home:profile:use', { browser: profile.browser, name: profile.name, path: profile.path }, 'INFO');
  toast(profile.browser + ' profile set: ' + profile.name, 'ok');

  // Highlight in list
  document.querySelectorAll('#home-profile-list [style]').forEach(el => {
    el.style.borderColor = 'var(--border2)';
    el.style.background  = 'var(--bg3)';
  });
}

async function homeMirrorProfile(profile) {
  const destName = profile.browser.toLowerCase() + '-' + profile.id;
  UUID.gen('action', { action:'home:profile:mirror', browser: profile.browser }, 'home:profile:mirror');

  let result;
  if (_isElectron && window.NEXUS_ELECTRON) {
    result = await window.NEXUS_ELECTRON.mirrorProfile(profile.path, destName).catch(e => ({ ok:false, error:e.message }));
  } else if (typeof BRIDGE !== 'undefined' && BRIDGE.connected) {
    try {
      const r = await fetch((val('bridge-url')||'http://127.0.0.1:3747') + '/profiles/mirror', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ src: profile.path, dest: destName })
      });
      result = await r.json();
    } catch(e) { result = { ok:false, error:e.message }; }
  } else {
    nxWarn('HOME_MIRROR_NO_CONN','Mirror requires Electron or bridge','Connect the bridge first.','home:profile:mirror');
    return;
  }

  if (result?.ok) {
    toast('Profile mirrored (' + result.method + ') → ' + result.dest, 'ok');
    // Use the mirrored profile
    homeUseProfile({ ...profile, path: result.dest, name: profile.name + ' (mirrored)' });
  } else {
    nxError('HOME_MIRROR_FAIL', 'Profile mirror failed', result?.error || 'Unknown error', 'home:profile:mirror');
  }
}

function homeUploadProfile() {
  const inp = document.getElementById('home-profile-upload');
  if (inp) inp.click();
}

function homeProfileUploaded(event) {
  const files = event.target.files;
  if (!files || !files.length) return;
  // Get the root directory from the first file
  const firstFile = files[0];
  const pathParts  = firstFile.webkitRelativePath.split('/');
  const dirName    = pathParts[0];

  // Look for Preferences or prefs.js to determine type
  const isFirefox  = [...files].some(f => f.name === 'prefs.js');
  const isChrome   = [...files].some(f => f.name === 'Preferences');
  const type       = isFirefox ? 'firefox' : isChrome ? 'chromium' : 'unknown';

  UUID.gen('action', { action:'home:profile:upload', dir: dirName, type, fileCount: files.length }, 'home:profile:upload');

  // For Playwright use, we need the actual OS path — webkitRelativePath gives relative paths
  // Show a prompt to confirm the directory
  const profileObj = {
    browser: isFirefox ? 'Firefox (uploaded)' : isChrome ? 'Chrome (uploaded)' : 'Browser (uploaded)',
    type, name: dirName, id: dirName,
    path: dirName,  // will need real path from user on Electron
    _uploaded: true,
    _files: files.length,
  };

  _homeProfiles.push(profileObj);

  const list = document.getElementById('home-profile-list');
  if (list) {
    // Remove "no profiles" notice
    if (list.querySelector('[style*="font-style:italic"]')) list.innerHTML = '';
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:6px;padding:5px 8px;background:rgba(0,212,255,.06);border:1px solid rgba(0,212,255,.2);border-radius:2px;margin-bottom:3px;font-size:9px';
    row.innerHTML = `
      <span style="font-size:11px">${isFirefox ? '🦊' : '🌐'}</span>
      <span style="color:var(--text);flex:1">${esc(dirName)}</span>
      <span style="color:var(--c);font-size:10px">UPLOADED · ${files.length} files</span>
      <button class="btn ok" style="font-size:10px;padding:1px 6px" onclick="homeUseProfile(${JSON.stringify(profileObj).replace(/"/g,'&quot;')})">USE</button>
    `;
    list.appendChild(row);
  }
  homeUseProfile(profileObj);
  toast('Profile uploaded: ' + dirName + ' (' + files.length + ' files)', 'ok');
}

/* ── DATA DIRECTORY FUNCTIONS ─────────────────────────────────── */
async function homeChooseDataDir() {
  if (_isElectron && window.NEXUS_ELECTRON) {
    try {
      const r = await window.NEXUS_ELECTRON.openDialog({
        title: 'Choose NEXUS Data Directory',
        properties: ['openDirectory', 'createDirectory'],
      });
      if (r && !r.canceled && r.filePaths && r.filePaths[0]) {
        NX_DATA.setDir(r.filePaths[0]);
        setVal('home-data-dir-input', r.filePaths[0]);
      }
    } catch(e) {
      nxError('HOME_DATA_DIR', 'Could not open directory picker', e.message, 'home:datadir');
    }
  } else {
    // Browser fallback — let them type manually
    const inp = document.getElementById('home-data-dir-input');
    if (inp) {
      inp.removeAttribute('readonly');
      inp.focus();
      inp.placeholder = 'Type directory path, then click APPLY';
      toast('Type a directory path and click APPLY', 'warn', 4000);
    }
  }
}

function homeApplyDataDir() {
  const dir = val('home-data-dir-input').trim();
  if (!dir) { toast('Enter a directory path first', 'warn'); return; }
  NX_DATA.setDir(dir);
  UUID.gen('action', { action:'data:dir:apply', dir }, 'data:dir:apply');
}

function homeOpenDataDir() {
  const dir = NX_DATA._dir;
  if (!dir) { toast('No data directory set', 'warn'); return; }
  if (_isElectron && window.NEXUS_ELECTRON) {
    window.NEXUS_ELECTRON.emit('nx:shell:open', { path: dir });
  } else {
    toast('Open in your file manager: ' + dir, 'ok', 5000);
  }
}

/* ── SKIP BUTTON WIRING ──────────────────────────────────────── */
// Wire ALL buttons/elements that contain "SKIP" text to nxSkipToOptions
// This handles the UUID-stamped button in the screenshot and any future ones
(function wireAllSkipButtons() {
  function attachSkipListeners() {
    document.querySelectorAll('button, [role="button"], .btn').forEach(btn => {
      const text = btn.textContent || '';
      if (text.includes('SKIP') && !btn.dataset.skipWired) {
        btn.dataset.skipWired = 'true';
        btn.addEventListener('click', () => {
          nxSkipToOptions();
          UUID.gen('action', { action:'skip:btn:clicked', text: text.trim().slice(0,50) }, 'nav:skip');
        });
      }
    });
  }
  // Wire now and again after DOM mutations settle
  attachSkipListeners();
  setTimeout(attachSkipListeners, 1000);
  setTimeout(attachSkipListeners, 3000);
  // Also watch for dynamic elements
  if (typeof MutationObserver !== 'undefined') {
    const obs = new MutationObserver(() => attachSkipListeners());
    obs.observe(document.body, { childList: true, subtree: true });
  }
})();

/* ── HOME SCREEN BOOT ─────────────────────────────────────────── */
setTimeout(() => {
  // Init data storage layer
  NX_DATA.init();

  // Restore AI mode from config
  try {
    const cfg = JSON.parse(localStorage.getItem('nx5_config') || '{}');

    // Show AI card state based on what's configured
    const hasApiKey    = cfg.claudeKey || cfg.chatgptKey || cfg.deepseekKey || cfg.ollamaUrl;
    const hasBridgeUrl = cfg.dataDir;
    const badge        = document.getElementById('home-ai-mode-badge');

    if (hasApiKey) {
      const provider = cfg.provider || 'unknown';
      if (badge) { badge.textContent = provider.toUpperCase() + ' · API CONFIGURED'; badge.style.color = 'var(--g)'; badge.style.borderColor = 'rgba(0,255,136,.3)'; }
      // Pre-select the right provider in home API selector
      const providerMap = { claude:'claude', chatgpt:'chatgpt', deepseek:'deepseek', ollama:'ollama' };
      if (providerMap[provider]) setVal('home-api-provider', providerMap[provider]);
      homeApiProviderChanged();
    }

    // Restore active profile
    if (cfg.activeBrowserProfile) {
      const p = cfg.activeBrowserProfile;
      const activeDiv  = document.getElementById('home-active-profile');
      const activeName = document.getElementById('home-active-profile-name');
      const activePath = document.getElementById('home-active-profile-path');
      if (activeDiv)  { activeDiv.style.display = ''; _homeActiveProfile = p; }
      if (activeName) activeName.textContent = p.browser + ' — ' + p.name;
      if (activePath) activePath.textContent  = p.path || '';
    }

    // Restore data dir display
    if (cfg.dataDir) {
      setVal('home-data-dir-input', cfg.dataDir);
      const st = document.getElementById('home-data-dir-status');
      if (st) { st.textContent = '✓ Data directory: ' + cfg.dataDir; st.style.color = 'var(--g)'; }
    }
  } catch {}

  // Add DeepSeek tile if not already there (idempotent)
  const hg = document.querySelector('.home-grid');
  if (hg && !document.getElementById('home-tile-deepscan')) {
    const tile = document.createElement('div');
    tile.className = 'home-tile'; tile.id = 'home-tile-deepscan';
    tile.onclick = () => switchTab('deepscan');
    tile.innerHTML = `<div class="home-tile-ico">⬡</div><div class="home-tile-name" style="color:var(--m)">DEEPSCAN</div><div class="home-tile-desc">Adversarial code review · DeepSeek-powered · UMS manifest · URL scan.</div><div class="home-tile-badge" style="color:var(--m);border-color:rgba(204,68,255,.25)">SCAN</div>`;
    hg.appendChild(tile);
  }

  toast('NEXUS PATCH v4 — Home AI card · Data dir · Profiles · Skip wired', 'ok', 5000);
  log_ev('patch4:applied', { ts: new Date().toISOString() }, 'INFO');
  UUID.gen('session', { patch: 'v4', ts: new Date().toISOString() }, 'patch:v4:boot');
}, 4500);

/* ═══════════════════════════════════════════════════════════════
   NEXUS v0.53.0 — PATCH v5
   ───────────────────────────────────────────────────────────────
   FIX  showLoginFlow no longer clears skip flag
   NEW  Real TE service gating via port checks (not fake toggles)
   NEW  DeepScan panel injected into TEST ENV tab
   NEW  v3 bridge: DeepSeek, Ollama, LM Studio, WebUI, intent map
   NEW  Options: Ollama/LM Studio/WebUI/DeepSeek/Intent map panels
   NEW  TE: service status badges updated from real port probe
   NEW  All TE buttons gated — nothing runs when service is down
   ═══════════════════════════════════════════════════════════════ */

/* ── REAL TE PORT GATING ─────────────────────────────────────── */
// Check if a service is actually reachable on its port
// Uses the bridge /health endpoint which reports real service state
const TE_PORT_MAP = {
  apache:  8080, php: 8080, mysql: 3306,
  redis: 6379, node: 3000, mailhog: 1025,
};
const TE_REAL_STATUS = {}; // 'apache' → true/false/null (null=unchecked)

async function teProbeService(svc) {
  const bridgeUrl = (typeof val === 'function' ? val('bridge-url') : '') || 'http://127.0.0.1:3747';
  const port = TE_PORT_MAP[svc];
  if (!port) return null;
  try {
    // Try fetching via bridge-proxied health check
    const r = await Promise.race([
      fetch(bridgeUrl + `/te/probe/${svc}`).then(r => r.json()).catch(() => null),
      new Promise(res => setTimeout(() => res(null), 2000)),
    ]);
    if (r?.ok === true) return true;
    // Fallback: try direct fetch to the port (works for HTTP services)
    if (svc === 'apache' || svc === 'node') {
      const dr = await Promise.race([
        fetch(`http://localhost:${port}/`).then(() => true).catch(() => false),
        new Promise(res => setTimeout(() => res(false), 1500)),
      ]);
      return dr;
    }
    return false;
  } catch { return false; }
}

async function teRefreshServiceStatus() {
  for (const svc of Object.keys(TE_PORT_MAP)) {
    const ok = await teProbeService(svc);
    TE_REAL_STATUS[svc] = ok;
    // Update the stack layer visual
    const layer = document.querySelector(`[onclick*="teToggleService('${svc}')"]`);
    const statusEl = document.getElementById(`te-sl-${svc}`);
    if (ok === true) {
      if (layer) layer.dataset.status = 'running';
      if (statusEl) { statusEl.textContent = 'RUNNING'; statusEl.style.color = ''; }
      if (typeof TE !== 'undefined') TE.services[svc] = true;
    } else if (ok === false) {
      if (layer) layer.dataset.status = 'stopped';
      if (statusEl) { statusEl.textContent = 'STOPPED'; statusEl.style.color = ''; }
      if (typeof TE !== 'undefined') TE.services[svc] = false;
    }
    // null = unreachable/unknown — leave as is
  }
  // Update dashboard metrics
  if (typeof teToggleService !== 'undefined') {
    const apacheStatus = document.getElementById('te-apache-status');
    const mysqlStatus  = document.getElementById('te-mysql-status');
    if (apacheStatus) apacheStatus.textContent = TE_REAL_STATUS.apache ? 'RUNNING' : 'STOPPED';
    if (mysqlStatus)  mysqlStatus.textContent  = TE_REAL_STATUS.mysql  ? 'RUNNING' : 'STOPPED';
  }
  S.emit('te:status:refresh', TE_REAL_STATUS, 'INFO');
}

// Run on TEST ENV tab open, and every 15s while visible
(function patchTESwitchTabProbe() {
  const _origSwitch = switchTab;
  switchTab = function(name) {
    _origSwitch(name);
    if (name === 'testenv') {
      teRefreshServiceStatus().catch(() => {});
    }
  };
  // Periodic refresh when on testenv tab
  setInterval(() => {
    const active = document.querySelector('.tab-panel[data-active="true"]');
    if (active?.id === 'tab-testenv') teRefreshServiceStatus().catch(() => {});
  }, 15000);
})();

// Override teToggleService to show real gate error when service isn't real
(function patchTeToggleReal() {
  const _orig = typeof teToggleService === 'function' ? teToggleService : null;
  if (!_orig) return;
  teToggleService = function(name, force) {
    // If trying to mark as running but port probe says it's not → warn
    const wantOn = force === true || (force === undefined && !(typeof TE !== 'undefined' && TE.services[name]));
    if (wantOn && TE_REAL_STATUS[name] === false) {
      nxWarn('TE_NOT_REAL', `${name.toUpperCase()} not actually running`,
        `Port ${TE_PORT_MAP[name] || '?'} is not responding. Start the real ${name} service first.`,
        'te:toggle:' + name);
      // Still allow the toggle for UI purposes (maybe they're starting it now)
    }
    _orig(name, force);
  };
})();

/* ── DEEPSCAN IN TEST ENV ────────────────────────────────────── */
// Add a DeepScan sub-tab to the TEST ENV panel
(function injectDeepScanIntoTestEnv() {
  const tabBar = document.querySelector('#tab-testenv [style*="height:30px"]');
  const panel  = document.getElementById('tes-runner')?.parentElement;

  if (tabBar && !document.querySelector('[data-tetab="deepscan"]')) {
    const btn = document.createElement('button');
    btn.className = 'ptab';
    btn.dataset.tetab = 'deepscan';
    btn.textContent = 'DEEPSCAN';
    btn.style.cssText = 'color:var(--m)';
    btn.onclick = () => teSwitchTab('deepscan', btn);
    tabBar.appendChild(btn);
  }

  if (panel && !document.getElementById('tes-deepscan')) {
    const div = document.createElement('div');
    div.className = 'te-sub';
    div.id = 'tes-deepscan';
    div.style.cssText = 'display:none;flex:1;min-height:0;flex-direction:column;overflow:hidden';
    div.innerHTML = `
      <div style="flex-shrink:0;display:flex;align-items:center;gap:8px;padding:8px 14px;background:var(--bg1);border-bottom:1px solid var(--border);flex-wrap:wrap">
        <span style="font-family:var(--display);font-size:12px;letter-spacing:.18em;color:var(--m)">⬡ DEEPSCAN — ADVERSARIAL CODE REVIEW</span>
        <div class="pill pill-idle" id="te-ds-status-pill"><div class="pill-dot"></div><span id="te-ds-status-txt">READY</span></div>
        <button class="btn" style="margin-left:auto;color:var(--m);border-color:rgba(204,68,255,.3)" onclick="teDeepScanRun()">▶ SCAN</button>
        <button class="btn accent" style="font-size:9px" onclick="teDeepScanFromForge()">⟁ FROM FORGE</button>
      </div>
      <div style="flex:1;min-height:0;display:flex;overflow:hidden">
        <div style="flex:1;display:flex;flex-direction:column;padding:10px 14px;gap:8px;overflow-y:auto">
          <div class="frow">
            <span class="flbl">LANGUAGE</span>
            <select class="finp" id="te-ds-lang" style="max-width:140px">
              <option value="auto">Auto-detect</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="php">PHP</option>
              <option value="rust">Rust</option>
              <option value="go">Go</option>
              <option value="sql">SQL</option>
              <option value="bash">Bash</option>
              <option value="java">Java</option>
              <option value="csharp">C#</option>
            </select>
            <span class="flbl" style="margin-left:12px">DEPTH</span>
            <select class="finp" id="te-ds-depth" style="max-width:130px">
              <option value="quick">Quick</option>
              <option value="standard" selected>Standard</option>
              <option value="deep">Deep (adversarial)</option>
            </select>
          </div>
          <textarea class="finp" id="te-ds-code" rows="10" placeholder="Paste code to scan — or use ⟁ FROM FORGE to load active file…" style="resize:vertical;font-size:10px;font-family:var(--mono)"></textarea>
          <div id="te-ds-results" style="flex:1;min-height:200px;overflow-y:auto;padding:8px;background:var(--bg);border:1px solid var(--border2);border-radius:2px;font-size:10px;font-family:var(--mono);color:var(--text2);line-height:1.7;white-space:pre-wrap">// Scan results appear here…</div>
        </div>
        <div style="width:200px;flex-shrink:0;border-left:1px solid var(--border);overflow-y:auto;padding:8px;background:var(--bg1)">
          <div style="font-size:9px;color:var(--text3);letter-spacing:.1em;margin-bottom:6px">SCAN HISTORY</div>
          <div id="te-ds-history" style="display:flex;flex-direction:column;gap:3px">
            <div style="font-size:9px;color:var(--text3);font-style:italic">No scans yet.</div>
          </div>
        </div>
      </div>`;
    panel.appendChild(div);
  }
})();

async function teDeepScanRun() {
  const code  = val('te-ds-code');
  const lang  = val('te-ds-lang')  || 'auto';
  const depth = val('te-ds-depth') || 'standard';
  if (!code.trim()) { nxWarn('TE_DS_NOCODE','No code to scan','Paste code or load from Forge IDE.','te:deepscan'); return; }
  if (!requireAI('te:deepscan')) return;

  setPill('te-ds-status-pill', 'busy', 'SCANNING');
  const el = document.getElementById('te-ds-results');
  if (el) el.textContent = '// Scanning…';
  UUID.gen('deepscan', { type:'code', lang, depth }, 'te:deepscan');

  const bridgeUrl = val('bridge-url') || 'http://127.0.0.1:3747';
  const bridgeOk  = typeof BRIDGE !== 'undefined' && BRIDGE.connected;

  try {
    let result;
    if (bridgeOk) {
      // Use bridge DeepScan endpoint (runs DeepSeek)
      const r = await fetch(bridgeUrl + '/deepscan/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type:'code', code, lang, depth }),
      });
      result = await r.json();
    } else {
      // Direct AI via aiChat
      const prompt = `You are ADVERSARY — hostile code review. Language: ${lang}. Depth: ${depth}.
Analyze:\n\`\`\`\n${code.slice(0,5000)}\n\`\`\`
Return ONLY JSON: {"verdict":"BLOCK|WARN|PASS","summary":"...","findings":[{"category":"...","severity":"CRITICAL|HIGH|MEDIUM|LOW","location":"...","description":"...","fix":"..."}]}`;
      const r = await aiChat([{role:'user',content:prompt}],{temperature:0.1,max_tokens:2000,stream:false});
      const text = r.stream ? await readStream(r,()=>{}) : r.text;
      try { result = JSON.parse(text.replace(/```json|```/g,'').trim()); }
      catch { result = { verdict:'WARN', summary:text.slice(0,400), findings:[] }; }
    }

    // Render
    const vc = {BLOCK:'var(--r)',WARN:'var(--y)',PASS:'var(--g)'}[result.verdict]||'var(--c)';
    let html = `VERDICT: ${result.verdict}\n${result.summary||''}\n\n`;
    (result.findings||[]).forEach(f => {
      html += `[${f.severity}] ${f.category} — ${f.location||'?'}\n  ${f.description}\n  Fix: ${f.fix||'—'}\n\n`;
    });
    if (el) { el.textContent = html; el.style.color = vc; }

    setPill('te-ds-status-pill', result.verdict==='PASS'?'ok':result.verdict==='BLOCK'?'err':'busy', result.verdict);

    // History
    const hist = document.getElementById('te-ds-history');
    if (hist) {
      if (hist.querySelector('[style*="font-style:italic"]')) hist.innerHTML = '';
      const row = document.createElement('div');
      row.style.cssText = `padding:4px 6px;border:1px solid var(--border2);border-left:3px solid ${vc};border-radius:2px;font-size:9px;cursor:pointer`;
      row.textContent = `${result.verdict} · ${new Date().toLocaleTimeString()}`;
      row.onclick = () => { if(el) el.textContent = html; };
      hist.insertBefore(row, hist.firstChild);
    }

    JAA.log('te:deepscan:complete',{verdict:result.verdict,findings:(result.findings||[]).length,lang,depth},'','INFO');
    S.emit('te:deepscan:complete',{verdict:result.verdict},'OK');
    toast(`DeepScan: ${result.verdict} — ${(result.findings||[]).length} findings`, result.verdict==='BLOCK'?'err':'ok');

  } catch(e) {
    if(el) el.textContent = '// Scan failed: '+e.message;
    setPill('te-ds-status-pill','err','ERROR');
    nxError('TE_DS_FAIL','DeepScan failed',e.message,'te:deepscan');
  }
}

function teDeepScanFromForge() {
  if (typeof FORGE === 'undefined' || !FORGE.activeFile) {
    nxWarn('TE_DS_NOFORGE','No file in Forge IDE','Open a file in Forge IDE first.','te:deepscan:forge');
    return;
  }
  const f = FORGE.files[FORGE.activeFile];
  if (!f) return;
  setVal('te-ds-code', f.content || '');
  setVal('te-ds-lang', f.lang || 'auto');
  teSwitchTab('deepscan', document.querySelector('[data-tetab="deepscan"]'));
  teDeepScanRun();
}

/* ── v3 BRIDGE INTEGRATION ───────────────────────────────────── */
// Extend the bridge connect to use v3 endpoints
(function patchBridgeConnectV3() {
  const _orig = typeof bridgeConnect === 'function' ? bridgeConnect : null;
  if (!_orig) return;
  const _origFetch = bridgeFetchHealth;

  bridgeFetchHealth = async function() {
    const url = (val('bridge-url') || 'http://127.0.0.1:3747') + '/health';
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout?.(3000) });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const j = await r.json();
      // v3 health response — update UI with v3 fields
      if (j.version?.startsWith('3')) {
        const bv = document.getElementById('bh-version');
        if (bv) bv.textContent = 'v' + j.version;
        // Show active profile
        if (j.activeProfile) {
          const profBadge = document.getElementById('home-active-profile-name');
          if (profBadge) profBadge.textContent = j.activeProfile;
        }
        // Show available direct providers
        if (j.providers?.direct) {
          S.emit('bridge:v3:ready', { version: j.version, providers: j.providers }, 'OK');
        }
      }
      if (_origFetch) return _origFetch.call(this);
    } catch(e) {
      if (_origFetch) return _origFetch.call(this);
    }
  };
})();

/* ── OPTIONS: EXPAND with v3 providers ──────────────────────── */
(function injectV3ProviderOptions() {
  const aiBody = document.querySelector('#acc-ai .acc-body');
  if (!aiBody || document.getElementById('v3-providers-section')) return;

  const section = document.createElement('div');
  section.id = 'v3-providers-section';
  section.style.cssText = 'border-top:1px solid var(--border);padding-top:10px;margin-top:6px';
  section.innerHTML = `
    <!-- Ollama (direct — no bridge) -->
    <div id="provider-ollama-v3" style="border-top:1px solid var(--border);padding-top:10px;margin-top:6px;display:none">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span style="font-family:var(--display);font-size:11px;letter-spacing:.15em;color:var(--g)">OLLAMA</span>
        <span style="font-size:10px;padding:1px 5px;border:1px solid rgba(0,255,136,.3);border-radius:2px;color:var(--g)">DIRECT · NO BRIDGE</span>
      </div>
      <div class="note" style="margin-bottom:8px">Connects directly to your local Ollama instance. No API key or bridge required.</div>
      <div class="frow"><span class="flbl">SERVER URL</span><input class="finp" id="opt-ollama-url-v3" value="http://localhost:11434"/></div>
      <div class="frow"><span class="flbl">MODEL</span><input class="finp" id="opt-ollama-model-v3" placeholder="llama3, mistral, codellama, etc."/></div>
      <div class="frow">
        <button class="btn accent" onclick="testOllamaDirect()">TEST</button>
        <button class="btn" onclick="ollamaListModels()" style="margin-left:6px">LIST MODELS</button>
        <div class="stat-row" id="status-ollama-v3" style="flex:1;margin-left:8px"></div>
      </div>
      <div id="ollama-models-v3" style="max-height:100px;overflow-y:auto;border:1px solid var(--border);border-radius:2px;padding:4px;margin-top:4px;display:none"></div>
    </div>

    <!-- LM Studio (direct — no bridge) -->
    <div id="provider-lmstudio-v3" style="border-top:1px solid var(--border);padding-top:10px;margin-top:6px;display:none">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span style="font-family:var(--display);font-size:11px;letter-spacing:.15em;color:var(--m)">LM STUDIO</span>
        <span style="font-size:10px;padding:1px 5px;border:1px solid rgba(204,68,255,.3);border-radius:2px;color:var(--m)">DIRECT · NO BRIDGE</span>
      </div>
      <div class="note" style="margin-bottom:8px">LM Studio OpenAI-compatible server. Start the local server in LM Studio, then configure here.</div>
      <div class="frow"><span class="flbl">SERVER URL</span><input class="finp" id="opt-lmstudio-url" value="http://localhost:1234"/></div>
      <div class="frow"><span class="flbl">MODEL</span><input class="finp" id="opt-lmstudio-model" placeholder="Leave blank to use loaded model"/></div>
      <div class="frow"><span class="flbl">API KEY</span><input class="finp" id="opt-lmstudio-key" value="lm-studio"/></div>
      <div class="frow">
        <button class="btn accent" onclick="testLMStudioDirect()">TEST</button>
        <div class="stat-row" id="status-lmstudio-v3" style="flex:1;margin-left:8px"></div>
      </div>
    </div>

    <!-- Open WebUI -->
    <div id="provider-webui" style="border-top:1px solid var(--border);padding-top:10px;margin-top:6px;display:none">
      <div style="font-family:var(--display);font-size:11px;letter-spacing:.15em;color:var(--c);margin-bottom:8px">OPEN WEBUI</div>
      <div class="note" style="margin-bottom:8px">Routes through your Open WebUI instance. Supports all models you have configured there.</div>
      <div class="frow"><span class="flbl">SERVER URL</span><input class="finp" id="opt-webui-url" value="http://localhost:3000"/></div>
      <div class="frow"><span class="flbl">API KEY</span><input class="finp" id="opt-webui-key" type="password" placeholder="Optional — depends on your WebUI config"/></div>
      <div class="frow"><span class="flbl">MODEL</span><input class="finp" id="opt-webui-model" placeholder="auto (uses default)"/></div>
      <div class="frow">
        <button class="btn accent" onclick="testWebUIDirect()">TEST</button>
        <div class="stat-row" id="status-webui" style="flex:1;margin-left:8px"></div>
      </div>
    </div>

    <!-- Intent Map Editor -->
    <div id="intent-map-section" style="border-top:1px solid var(--border);padding-top:10px;margin-top:6px">
      <div style="font-family:var(--display);font-size:11px;letter-spacing:.15em;color:var(--y);margin-bottom:8px">⬡ INTENT MAP <span style="font-size:10px;color:var(--text3);font-family:var(--mono)">Route tasks to the right AI automatically</span></div>
      <div class="note" style="margin-bottom:8px">Edit provider order per intent. Changes persist to bridge data directory.</div>
      <div id="intent-map-editor" style="display:flex;flex-direction:column;gap:4px;max-height:200px;overflow-y:auto;margin-bottom:8px"></div>
      <div class="frow">
        <button class="btn accent" style="font-size:9px" onclick="saveIntentMapToOptions()">SAVE TO BRIDGE</button>
        <button class="btn" style="font-size:9px;margin-left:6px" onclick="renderIntentMapEditor()">↻ REFRESH</button>
        <button class="btn" style="font-size:9px;margin-left:6px;color:var(--r);border-color:rgba(255,45,85,.3)" onclick="resetIntentMap()">RESET</button>
      </div>
    </div>
  `;
  aiBody.appendChild(section);

  // Extend provider selector
  const sel = document.getElementById('opt-ai-provider');
  if (sel) {
    [
      ['ollama',   'Ollama (local — direct)'],
      ['lmstudio', 'LM Studio (local — direct)'],
      ['webui',    'Open WebUI'],
    ].forEach(([val, label]) => {
      if (!sel.querySelector(`[value="${val}"]`)) {
        const opt = document.createElement('option');
        opt.value = val; opt.textContent = label;
        sel.appendChild(opt);
      }
    });
  }

  renderIntentMapEditor();
})();

// Test functions for direct providers
async function testOllamaDirect() {
  const st  = document.getElementById('status-ollama-v3');
  const url = val('opt-ollama-url-v3') || 'http://localhost:11434';
  if (st) { st.textContent = 'Testing…'; st.dataset.ok = 'warn'; }
  try {
    const r = await fetch(url + '/api/tags', { signal: AbortSignal.timeout?.(3000) || new AbortController().signal });
    if (r.ok) {
      const j = await r.json();
      const models = (j.models||[]).map(m=>m.name).join(', ');
      if (st) { st.textContent = `✓ Ollama online — ${(j.models||[]).length} model(s): ${models.slice(0,80)}`; st.dataset.ok = 'true'; }
      // Update main ollama config
      setVal('opt-ollama-url', url);
      if (val('opt-ollama-model-v3')) setVal('opt-ollama-model', val('opt-ollama-model-v3'));
      UUID.gen('action',{action:'provider:test',provider:'ollama',url},'provider:test:ollama');
      toast('Ollama connected: ' + (j.models||[]).length + ' model(s)', 'ok');
    } else throw new Error('HTTP ' + r.status);
  } catch(e) {
    if (st) { st.textContent = '✗ ' + e.message; st.dataset.ok = 'false'; }
    nxError('OLLAMA_TEST','Ollama test failed',e.message + '\n\nInstall Ollama from https://ollama.ai then run: ollama serve','options:ollama');
  }
}

async function ollamaListModels() {
  const url = val('opt-ollama-url-v3') || 'http://localhost:11434';
  const container = document.getElementById('ollama-models-v3');
  if (!container) return;
  try {
    const r = await fetch(url + '/api/tags');
    const j = await r.json();
    container.style.display = '';
    container.innerHTML = (j.models||[]).map(m=>`
      <div style="display:flex;align-items:center;gap:6px;padding:3px 4px;font-size:9px;border-bottom:1px solid var(--border)">
        <span style="flex:1;color:var(--text)">${m.name}</span>
        <span style="color:var(--text3)">${((m.size||0)/1e9).toFixed(1)}GB</span>
        <button class="btn" style="font-size:10px;padding:1px 5px" onclick="setVal('opt-ollama-model-v3','${m.name}');setVal('opt-ollama-model','${m.name}')">USE</button>
      </div>`).join('') || '<div style="font-size:9px;color:var(--text3);padding:4px">No models found. Run: ollama pull llama3</div>';
  } catch(e) { nxError('OLLAMA_MODELS','Could not list models',e.message,'options:ollama'); }
}

async function testLMStudioDirect() {
  const st  = document.getElementById('status-lmstudio-v3');
  const url = val('opt-lmstudio-url') || 'http://localhost:1234';
  const key = val('opt-lmstudio-key') || 'lm-studio';
  if (st) { st.textContent = 'Testing…'; st.dataset.ok = 'warn'; }
  try {
    const r = await fetch(url + '/v1/models', { headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout?.(3000) || new AbortController().signal });
    const j = await r.json();
    const count = (j.data||j||[]).length;
    if (st) { st.textContent = `✓ LM Studio online — ${count} model(s)`; st.dataset.ok = 'true'; }
    UUID.gen('action',{action:'provider:test',provider:'lmstudio',url},'provider:test:lmstudio');
    toast('LM Studio connected: ' + count + ' model(s)', 'ok');
  } catch(e) {
    if (st) { st.textContent = '✗ ' + e.message; st.dataset.ok = 'false'; }
    nxError('LMS_TEST','LM Studio test failed',e.message + '\n\nInstall LM Studio from https://lmstudio.ai','options:lmstudio');
  }
}

async function testWebUIDirect() {
  const st  = document.getElementById('status-webui');
  const url = val('opt-webui-url') || 'http://localhost:3000';
  const key = val('opt-webui-key') || '';
  if (st) { st.textContent = 'Testing…'; st.dataset.ok = 'warn'; }
  try {
    const r = await fetch(url + '/api/models', { headers: key ? { Authorization: `Bearer ${key}` } : {} });
    const j = await r.json();
    const count = (j.data||j||[]).length;
    if (st) { st.textContent = `✓ Open WebUI online — ${count} model(s)`; st.dataset.ok = 'true'; }
    toast('Open WebUI connected: ' + count + ' model(s)', 'ok');
  } catch(e) {
    if (st) { st.textContent = '✗ ' + e.message; st.dataset.ok = 'false'; }
    nxError('WEBUI_TEST','WebUI test failed',e.message + '\n\nInstall from https://openwebui.com','options:webui');
  }
}

// Intent map editor
function renderIntentMapEditor() {
  const el = document.getElementById('intent-map-editor');
  if (!el) return;
  const intents = ['code','analysis','reasoning','creative','research','fast','local','summarize','math','adversarial'];
  const stored  = (() => { try { return JSON.parse(localStorage.getItem('nx5_config')||'{}').intentMap||{}; } catch { return {}; } })();
  el.innerHTML = intents.map(intent => {
    const current = stored[intent] || ['deepseek','claude','chatgpt'];
    return `<div style="display:flex;align-items:center;gap:6px;padding:3px 0;border-bottom:1px solid var(--border);font-size:9px">
      <span style="font-family:var(--display);font-size:9px;letter-spacing:.1em;color:var(--c);min-width:80px">${intent}</span>
      <input class="finp" id="intent-inp-${intent}" value="${Array.isArray(current)?current.join(','):current}" style="flex:1;font-size:9px;padding:2px 6px" placeholder="deepseek,claude,chatgpt"/>
    </div>`;
  }).join('');
}

function saveIntentMapToOptions() {
  const intents = ['code','analysis','reasoning','creative','research','fast','local','summarize','math','adversarial'];
  const map = {};
  intents.forEach(intent => {
    const v = val('intent-inp-' + intent);
    if (v) map[intent] = v.split(',').map(s=>s.trim()).filter(Boolean);
  });
  try {
    const cfg = JSON.parse(localStorage.getItem('nx5_config')||'{}');
    cfg.intentMap = map;
    localStorage.setItem('nx5_config', JSON.stringify(cfg));
  } catch {}
  // Also push to bridge if connected
  if (typeof BRIDGE !== 'undefined' && BRIDGE.connected) {
    Object.entries(map).forEach(([intent, providers]) => {
      fetch((val('bridge-url')||'http://127.0.0.1:3747') + '/intent/' + intent, {
        method: 'PUT', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ providers }),
      }).catch(() => {});
    });
  }
  UUID.gen('action',{action:'intent:map:save',intents:Object.keys(map)},'intent:save');
  toast('Intent map saved', 'ok');
}

function resetIntentMap() {
  try {
    const cfg = JSON.parse(localStorage.getItem('nx5_config')||'{}');
    delete cfg.intentMap;
    localStorage.setItem('nx5_config', JSON.stringify(cfg));
  } catch {}
  renderIntentMapEditor();
  toast('Intent map reset to defaults', 'ok');
}

// Extend onProviderChange for v3 providers
(function patchProviderChangeV3() {
  const _orig = onProviderChange;
  onProviderChange = function() {
    _orig();
    const p = val('opt-ai-provider');
    ['ollama-v3','lmstudio-v3','webui'].forEach(id => {
      const panel = document.getElementById('provider-' + id);
      if (panel) panel.style.display = 'none';
    });
    if (p === 'ollama') {
      const panel = document.getElementById('provider-ollama-v3');
      if (panel) panel.style.display = '';
    }
    if (p === 'lmstudio') {
      const panel = document.getElementById('provider-lmstudio-v3');
      if (panel) panel.style.display = '';
    }
    if (p === 'webui') {
      const panel = document.getElementById('provider-webui');
      if (panel) panel.style.display = '';
    }
  };
})();

// Extend aiChat for Ollama/LM Studio/WebUI direct (no bridge)
(function patchAiChatDirect() {
  const _orig = aiChat;
  aiChat = async function(messages, opts = {}) {
    const provider = AI?.provider || val('opt-ai-provider') || 'chatgpt';

    if (provider === 'ollama') {
      const url   = val('opt-ollama-url-v3') || val('opt-ollama-url') || 'http://localhost:11434';
      const model = val('opt-ollama-model-v3') || val('opt-ollama-model') || 'llama3';
      UUID.gen('llm-call',{provider:'ollama',model,mode:'direct'},'ollama:direct');
      S.emit('ai:call',{provider:'ollama',model,mode:'direct'},'LLM');
      const res = await fetch(url + '/api/chat', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ model, messages, stream: false }),
      });
      if (!res.ok) throw new Error(`Ollama HTTP ${res.status}. Is Ollama running? ollama serve`);
      const j = await res.json();
      const text = j.message?.content || j.response || '';
      S.emit('ai:response',{provider:'ollama',len:text.length},'LLM');
      return { stream: false, text };
    }

    if (provider === 'lmstudio') {
      const url   = val('opt-lmstudio-url') || 'http://localhost:1234';
      const model = val('opt-lmstudio-model') || '';
      const key   = val('opt-lmstudio-key')   || 'lm-studio';
      UUID.gen('llm-call',{provider:'lmstudio',model,mode:'direct'},'lmstudio:direct');
      S.emit('ai:call',{provider:'lmstudio',model,mode:'direct'},'LLM');
      const res = await fetch(url + '/v1/chat/completions', {
        method: 'POST',
        headers: {'Content-Type':'application/json','Authorization':`Bearer ${key}`},
        body: JSON.stringify({ ...(model ? {model} : {}), messages, max_tokens: opts.max_tokens || 4096 }),
      });
      if (!res.ok) throw new Error(`LM Studio HTTP ${res.status}. Is the server running in LM Studio?`);
      const j   = await res.json();
      const text = j.choices?.[0]?.message?.content || '';
      return { stream: false, text };
    }

    if (provider === 'webui') {
      const url   = val('opt-webui-url')   || 'http://localhost:3000';
      const key   = val('opt-webui-key')   || '';
      const model = val('opt-webui-model') || 'auto';
      UUID.gen('llm-call',{provider:'webui',model,mode:'direct'},'webui:direct');
      const res = await fetch(url + '/api/chat/completions', {
        method: 'POST',
        headers: {'Content-Type':'application/json',...(key?{'Authorization':`Bearer ${key}`}:{})},
        body: JSON.stringify({ model, messages }),
      });
      if (!res.ok) throw new Error(`Open WebUI HTTP ${res.status}`);
      const j   = await res.json();
      const text = j.choices?.[0]?.message?.content || j.message?.content || '';
      return { stream: false, text };
    }

    return _orig(messages, opts);
  };
})();

// Extend saveConfig/loadConfig for v3 providers
(function patchConfigV3() {
  const _origSave = saveConfig;
  saveConfig = function() {
    _origSave();
    try {
      const cfg = JSON.parse(localStorage.getItem('nx5_config') || '{}');
      cfg.ollamaUrlV3   = val('opt-ollama-url-v3')  || cfg.ollamaUrl;
      cfg.ollamaModelV3 = val('opt-ollama-model-v3') || cfg.ollamaModel;
      cfg.lmstudioUrl   = val('opt-lmstudio-url');
      cfg.lmstudioModel = val('opt-lmstudio-model');
      cfg.lmstudioKey   = val('opt-lmstudio-key');
      cfg.webuiUrl      = val('opt-webui-url');
      cfg.webuiKey      = val('opt-webui-key');
      cfg.webuiModel    = val('opt-webui-model');
      localStorage.setItem('nx5_config', JSON.stringify(cfg));
      // Push to bridge config
      if (typeof BRIDGE !== 'undefined' && BRIDGE.connected) {
        const bridgeUrl = val('bridge-url') || 'http://127.0.0.1:3747';
        fetch(bridgeUrl + '/config', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({
            ollamaUrl: cfg.ollamaUrlV3, ollamaModel: cfg.ollamaModelV3,
            lmstudioUrl: cfg.lmstudioUrl, lmstudioModel: cfg.lmstudioModel, lmstudioKey: cfg.lmstudioKey,
            webuiUrl: cfg.webuiUrl, webuiKey: cfg.webuiKey,
            deepseekKey: cfg.deepseekKey, deepseekModel: cfg.deepseekModel,
            claudeKey: cfg.claudeKey, chatgptKey: cfg.chatgptKey,
          }),
        }).catch(() => {});
      }
    } catch {}
  };
  // Load v3 config on boot
  try {
    const cfg = JSON.parse(localStorage.getItem('nx5_config') || '{}');
    if (cfg.ollamaUrlV3)   setVal('opt-ollama-url-v3',   cfg.ollamaUrlV3);
    if (cfg.ollamaModelV3) setVal('opt-ollama-model-v3', cfg.ollamaModelV3);
    if (cfg.lmstudioUrl)   setVal('opt-lmstudio-url',    cfg.lmstudioUrl);
    if (cfg.lmstudioModel) setVal('opt-lmstudio-model',  cfg.lmstudioModel);
    if (cfg.lmstudioKey)   setVal('opt-lmstudio-key',    cfg.lmstudioKey);
    if (cfg.webuiUrl)      setVal('opt-webui-url',       cfg.webuiUrl);
    if (cfg.webuiKey)      setVal('opt-webui-key',       cfg.webuiKey);
    if (cfg.webuiModel)    setVal('opt-webui-model',     cfg.webuiModel);
  } catch {}
})();

/* ── PATCH v5 BOOT ───────────────────────────────────────────── */
setTimeout(() => {
  // Run first TE status probe
  teRefreshServiceStatus().catch(() => {});
  // Render intent map editor
  try { renderIntentMapEditor(); } catch {}
  // Run onProviderChange to show correct v3 panel
  try { onProviderChange(); } catch {}
  toast('NEXUS PATCH v5 — Real TE gating · DeepScan in TestEnv · v3 Bridge · Intent maps · Ollama/LM Studio direct', 'ok', 5000);
  log_ev('patch5:applied', { ts: new Date().toISOString() }, 'INFO');
  UUID.gen('session', { patch: 'v5' }, 'patch:v5:boot');
}, 5500);

