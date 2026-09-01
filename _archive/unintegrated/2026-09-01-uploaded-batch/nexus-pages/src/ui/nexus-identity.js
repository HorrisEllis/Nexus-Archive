/* ═══════════════════════════════════════════════════════════════════════
   nexus-identity.js — NEXUS Identity Suite v1.0.0
   James Brooks | SISO-compliant | Guardian-wired | Persistent

   LAW: Nothing exists until proven. Nothing pretends to work. Fail loudly.
   LAW: Persistence is the golden rule. localStorage is source of truth.
   LAW: Everything has a UUID. Everything is event-bus driven.
   LAW: All wire/test buttons execute against the specific identity they belong to.
   LAW: Every phase increases the version by 0.1 → this = v0.53.0

   Architecture:
     NX_IDENTITY_CONFIG (localStorage: nx_identity_config)
       identities[]  — user's list: built-in + custom, with calltos wired per identity
       intents[]     — user's intent assignments: type + identities + config
       firstRunDone  — boolean, triggers setup wizard on first open

     Events emitted on window (event bus):
       identity:added, identity:removed, identity:wired, identity:tested
       intent:added, intent:removed, intent:updated
       identity:config:saved

   Guardian integration:
     GWZ_AGENT_META is generated FROM NX_IDENTITY_CONFIG — single source of truth.
     Wire buttons call guardianWireWizardOpen(identityId) with full meta.
     Test buttons call nxIdentityTest(identityId) — real bridge POST, fail loudly.

   ═══════════════════════════════════════════════════════════════════════ */

'use strict';

/* ── § 1  CONSTANTS ─────────────────────────────────────────────────── */

const NXI_STORE         = 'nx_identity_config';
const NXI_VERSION       = '0.53.0';
const NXI_BRIDGE_URL    = 'http://127.0.0.1:3747';

/* Built-in identity catalogue — mirrors NEXUS_AGENTS exactly */
const NXI_BUILTIN = [
  { id:'chatgpt',     name:'ChatGPT',     icon:'⬢', color:'var(--g)', url:'https://chat.openai.com',          hint:'Click the message input at the bottom of the chat.' },
  { id:'claude',      name:'Claude',      icon:'◈', color:'var(--o)', url:'https://claude.ai',                hint:'Click the text area where you type your message.' },
  { id:'ollama',      name:'Ollama',      icon:'⬡', color:'var(--c)', url:'http://localhost:11434',            hint:'Click the prompt field in your Ollama UI (Open WebUI or similar).' },
  { id:'deepseek',    name:'DeepSeek',    icon:'◉', color:'var(--c)', url:'https://chat.deepseek.com',        hint:'Click the chat input field at the bottom.' },
  { id:'gemini',      name:'Gemini',      icon:'◇', color:'var(--m)', url:'https://gemini.google.com',        hint:'Click the message input at the bottom of the page.' },
  { id:'grok',        name:'Grok',        icon:'◎', color:'var(--y)', url:'https://grok.com',                 hint:'Click the message input in the Grok chat.' },
  { id:'mistral',     name:'Mistral',     icon:'◌', color:'var(--c)', url:'https://chat.mistral.ai',          hint:'Click the chat input box.' },
  { id:'cohere',      name:'Cohere',      icon:'◍', color:'var(--g)', url:'https://coral.cohere.com',         hint:'Click the Coral chat input field.' },
  { id:'groq',        name:'Groq',        icon:'⬥', color:'var(--r)', url:'https://groq.com',                 hint:'Click the prompt input field.' },
  { id:'lmstudio',    name:'LM Studio',   icon:'⬦', color:'var(--m)', url:'http://localhost:1234',            hint:'Click the chat input in LM Studio.' },
  { id:'perplexity',  name:'Perplexity',  icon:'◬', color:'var(--c)', url:'https://perplexity.ai',            hint:'Click the search/ask input.' },
  { id:'copilot',     name:'Copilot',     icon:'◭', color:'var(--c)', url:'https://copilot.microsoft.com',    hint:'Click the chat input field.' },
  { id:'poe',         name:'Poe',         icon:'◮', color:'var(--m)', url:'https://poe.com',                  hint:'Click the message box at the bottom.' },
  { id:'meta',        name:'Meta AI',     icon:'◯', color:'var(--c)', url:'https://meta.ai',                  hint:'Click the chat input field.' },
  { id:'huggingface', name:'HuggingFace', icon:'◰', color:'var(--y)', url:'https://huggingface.co/chat',      hint:'Click the chat prompt area.' },
  { id:'you',         name:'You.com',     icon:'◱', color:'var(--g)', url:'https://you.com',                  hint:'Click the search/ask input.' },
  { id:'phind',       name:'Phind',       icon:'◲', color:'var(--c)', url:'https://phind.com',                hint:'Click the question input box.' },
];

/* Intent type definitions */
const NXI_INTENT_TYPES = [
  {
    id: 'code',
    name: 'Code',
    icon: '⟁',
    color: 'var(--g)',
    desc: 'Outbound input callto → identity. Inbound callback captures response. Logged to causal-nexus.',
    fields: ['inputCallto', 'outputCallto', 'logEnabled'],
  },
  {
    id: 'chat',
    name: 'Chat',
    icon: '◈',
    color: 'var(--c)',
    desc: 'Optimised for back-and-forth human conversations. ACK-based flow.',
    fields: ['inputCallto', 'outputCallto'],
  },
  {
    id: 'ideas',
    name: 'Ideas',
    icon: '◉',
    color: 'var(--m)',
    desc: 'Listens to identity chat windows passively. Optionally scoped to a specific URL pattern.',
    fields: ['outputCallto', 'urlPattern'],
  },
  {
    id: 'research',
    name: 'Research',
    icon: '◬',
    color: 'var(--y)',
    desc: 'Deep retrieval mode. Input → identity → structured output captured and stored.',
    fields: ['inputCallto', 'outputCallto', 'logEnabled'],
  },
  {
    id: 'loop',
    name: 'Feedback Loop',
    icon: '⟳',
    color: 'var(--r)',
    desc: 'Feed one identity output into another (or itself). Creates autonomous reasoning chains.',
    fields: ['inputCallto', 'outputCallto', 'loopTarget', 'maxCycles'],
  },
];

/* ── § 2  PERSISTENCE ───────────────────────────────────────────────── */

function nxiLoad() {
  try {
    const raw = localStorage.getItem(NXI_STORE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch(e) {
    console.error('[NXI] Config parse error — corrupt? Resetting.', e);
    return null;
  }
}

function nxiSave(cfg) {
  cfg.version = NXI_VERSION;
  cfg.updatedAt = Date.now();
  try {
    localStorage.setItem(NXI_STORE, JSON.stringify(cfg));
    _nxiEmit('identity:config:saved', { ts: cfg.updatedAt });
  } catch(e) {
    console.error('[NXI] SAVE FAILED — localStorage full or blocked:', e);
    if (typeof toast === 'function') toast('⚠ Identity config save failed: ' + e.message, 'err', 6000);
  }
}

function nxiDefault() {
  return {
    version:      NXI_VERSION,
    firstRunDone: false,
    identities:   NXI_BUILTIN.map(b => ({
      id:        b.id,
      name:      b.name,
      icon:      b.icon,
      color:     b.color,
      url:       b.url,
      hint:      b.hint,
      builtIn:   true,
      enabled:   ['chatgpt','claude','ollama'].includes(b.id), // only 3 enabled by default
      inputCalltoId:  '',
      outputCalltoId: '',
      wiredAt:   null,
    })),
    intents: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function nxiGetConfig() {
  let cfg = nxiLoad();
  if (!cfg) {
    cfg = nxiDefault();
    nxiSave(cfg);
  }
  // Migration: ensure all builtins present
  NXI_BUILTIN.forEach(b => {
    if (!cfg.identities.find(i => i.id === b.id)) {
      cfg.identities.push({
        id: b.id, name: b.name, icon: b.icon, color: b.color,
        url: b.url, hint: b.hint, builtIn: true, enabled: false,
        inputCalltoId: '', outputCalltoId: '', wiredAt: null,
      });
    }
  });
  return cfg;
}

/* ── § 3  EVENT BUS ─────────────────────────────────────────────────── */

function _nxiEmit(type, detail) {
  window.dispatchEvent(new CustomEvent('nxi:' + type, { detail: detail || {} }));
  // Also route through NEXUS event bus if available
  if (typeof emit === 'function') {
    try { emit(type, detail); } catch(_) {}
  }
}

/* ── § 4  IDENTITY CRUD ─────────────────────────────────────────────── */

function nxiAddIdentity(name, url) {
  if (!name || !url) {
    if (typeof toast === 'function') toast('Name and URL are required', 'warn');
    return null;
  }
  const cfg = nxiGetConfig();
  const id = 'identity-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
  const host = (() => { try { return new URL(url).hostname; } catch { return url; } })();
  const identity = {
    id, name, icon: '◈', color: 'var(--c)',
    url: url.startsWith('http') ? url : 'https://' + url,
    hint: 'Click the chat input field on ' + host,
    builtIn: false, enabled: true,
    inputCalltoId: '', outputCalltoId: '', wiredAt: null,
    createdAt: Date.now(),
    uuid: typeof UUID !== 'undefined' && UUID.gen
      ? UUID.gen('identity', { name, url }, 'identity:' + id)
      : id,
  };
  cfg.identities.push(identity);
  nxiSave(cfg);
  _nxiEmit('identity:added', { identity });
  // Sync to GWZ meta so wizard can wire it immediately
  _nxiSyncToGWZ();
  return identity;
}
window.nxiAddIdentity = nxiAddIdentity;

function nxiRemoveIdentity(id) {
  const cfg = nxiGetConfig();
  const idx = cfg.identities.findIndex(i => i.id === id);
  if (idx < 0) return;
  if (cfg.identities[idx].builtIn) {
    // Built-ins: just disable, don't delete
    cfg.identities[idx].enabled = false;
    nxiSave(cfg);
    _nxiEmit('identity:removed', { id, soft: true });
    nxiRenderSuite();
    return;
  }
  cfg.identities.splice(idx, 1);
  nxiSave(cfg);
  _nxiEmit('identity:removed', { id });
  nxiRenderSuite();
}
window.nxiRemoveIdentity = nxiRemoveIdentity;

function nxiToggleIdentity(id) {
  const cfg = nxiGetConfig();
  const identity = cfg.identities.find(i => i.id === id);
  if (!identity) return;
  identity.enabled = !identity.enabled;
  nxiSave(cfg);
  _nxiEmit('identity:toggled', { id, enabled: identity.enabled });
  nxiRenderSuite();
}
window.nxiToggleIdentity = nxiToggleIdentity;

function nxiUpdateUrl(id, url) {
  const cfg = nxiGetConfig();
  const identity = cfg.identities.find(i => i.id === id);
  if (!identity) return;
  identity.url = url;
  nxiSave(cfg);
  _nxiSyncToGWZ();
}
window.nxiUpdateUrl = nxiUpdateUrl;

/* ── § 5  WIRE CALLTO (identity-relative) ───────────────────────────── */

function nxiWireInput(identityId) {
  const cfg = nxiGetConfig();
  const identity = cfg.identities.find(i => i.id === identityId);
  if (!identity) {
    if (typeof toast === 'function') toast('Unknown identity: ' + identityId, 'err');
    return;
  }
  // Store which identity is being wired — wizard reads this
  localStorage.setItem('nxi_wiring_id', identityId);
  localStorage.setItem('nxi_wiring_type', 'input');
  // Sync GWZ meta so wizard has the right URL and hint
  _nxiSyncToGWZ();
  if (typeof guardianWireWizardOpen === 'function') {
    guardianWireWizardOpen(identityId);
  } else {
    if (typeof toast === 'function') toast('Guardian wizard not ready — reload NEXUS', 'err', 4000);
  }
}
window.nxiWireInput = nxiWireInput;

function nxiWireOutput(identityId) {
  const cfg = nxiGetConfig();
  const identity = cfg.identities.find(i => i.id === identityId);
  if (!identity) return;
  localStorage.setItem('nxi_wiring_id', identityId);
  localStorage.setItem('nxi_wiring_type', 'output');
  _nxiSyncToGWZ();
  // Output: send BC signal, short toast (no full wizard needed for listener)
  if (typeof GUARDIAN !== 'undefined' && GUARDIAN._bc) {
    try {
      GUARDIAN._bc.postMessage({
        type: 'GUARDIAN_OPEN_PICK',
        agentId: identityId,
        pickMode: 'output',
        url: identity.url,
        label: identity.name + ' response area',
        source: 'nexus-identity',
      });
    } catch(_) {}
  }
  if (typeof toast === 'function') toast('⟁ Guardian pick mode active — click the response area in Firefox for ' + identity.name, 'ok', 5000);
}
window.nxiWireOutput = nxiWireOutput;

/* Called by BC handler when CALLTO_ADDED arrives during a wiring session */
function nxiOnCalltoWired(callto, pickType) {
  const wiringId = localStorage.getItem('nxi_wiring_id');
  if (!wiringId) return;
  const cfg = nxiGetConfig();
  const identity = cfg.identities.find(i => i.id === wiringId);
  if (!identity) return;
  if (pickType === 'output') {
    identity.outputCalltoId = callto.id;
  } else {
    identity.inputCalltoId = callto.id;
  }
  identity.wiredAt = Date.now();
  nxiSave(cfg);
  _nxiEmit('identity:wired', { identityId: wiringId, calltoId: callto.id, pickType });
  // Also mirror to guardian agent hooks so existing code stays in sync
  if (typeof guardianSaveAgentHook === 'function') {
    guardianSaveAgentHook(wiringId, callto.id, 'chat');
  }
  nxiRenderSuite();
  localStorage.removeItem('nxi_wiring_id');
  localStorage.removeItem('nxi_wiring_type');
}
window.nxiOnCalltoWired = nxiOnCalltoWired;

/* ── § 6  TEST (identity-relative, fail loudly) ─────────────────────── */

async function nxiTest(identityId) {
  const cfg = nxiGetConfig();
  const identity = cfg.identities.find(i => i.id === identityId);
  if (!identity) {
    if (typeof toast === 'function') toast('Unknown identity: ' + identityId, 'err');
    return;
  }
  if (!identity.inputCalltoId) {
    if (typeof toast === 'function') toast('⚠ ' + identity.name + ' has no INPUT callto — wire it first', 'warn', 5000);
    _nxiSetTestState(identityId, 'nowire');
    return;
  }

  _nxiSetTestState(identityId, 'running');

  try {
    const r = await fetch(NXI_BRIDGE_URL + '/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider:  'guardian',
        agentId:   identityId,
        messages:  [{ role: 'user', content: 'NEXUS IDENTITY TEST — reply: OK ' + identityId.toUpperCase() }],
        calltoId:  identity.inputCalltoId,
        intent:    'chat',
        source:    'nexus-identity-suite',
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (r.status === 202) {
      _nxiSetTestState(identityId, 'ok');
      if (typeof toast === 'function') toast('✓ ' + identity.name + ' test dispatched — watching for response', 'ok', 4000);
      if (typeof _guardianLogDiag === 'function') _guardianLogDiag('[NXI] ' + identity.name + ' test dispatched · callto: ' + identity.inputCalltoId.slice(0, 14), 'var(--g)');
      // Log to delta
      if (typeof log_ev === 'function') log_ev('identity:test:ok', { identityId, calltoId: identity.inputCalltoId }, 'INFO');
    } else {
      const d = await r.json().catch(() => ({}));
      _nxiSetTestState(identityId, 'fail');
      const msg = d.hint || d.error || ('HTTP ' + r.status);
      if (typeof toast === 'function') toast('✗ ' + identity.name + ' test failed: ' + msg, 'err', 6000);
      if (typeof log_ev === 'function') log_ev('identity:test:fail', { identityId, error: msg }, 'ERROR');
    }
  } catch(e) {
    _nxiSetTestState(identityId, 'fail');
    if (typeof toast === 'function') toast('✗ ' + identity.name + ': ' + (e.message || 'bridge unreachable'), 'err', 5000);
    if (typeof log_ev === 'function') log_ev('identity:test:error', { identityId, error: e.message }, 'ERROR');
  }
}
window.nxiTest = nxiTest;

function _nxiSetTestState(identityId, state) {
  const btn = document.getElementById('nxi-test-' + identityId);
  if (!btn) return;
  const map = {
    running: ['…', 'var(--y)', true],
    ok:      ['✓ OK', 'var(--g)', false],
    fail:    ['✗ FAIL', 'var(--r)', false],
    nowire:  ['NO WIRE', 'var(--text3)', false],
  };
  const [label, color, disabled] = map[state] || ['▶ TEST', '', false];
  btn.textContent = label;
  btn.style.color = color;
  btn.disabled    = disabled;
  if (state !== 'running') {
    setTimeout(() => {
      btn.textContent = '▶ TEST';
      btn.style.color = '';
      btn.disabled    = false;
    }, 3500);
  }
}

/* ── § 7  INTENT CRUD ───────────────────────────────────────────────── */

function nxiAddIntent(typeId, identityIds, extraConfig) {
  const typedef = NXI_INTENT_TYPES.find(t => t.id === typeId);
  if (!typedef) {
    if (typeof toast === 'function') toast('Unknown intent type: ' + typeId, 'err');
    return null;
  }
  const cfg = nxiGetConfig();
  const id  = 'intent-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
  const intent = {
    id,
    typeId,
    name:        typedef.name,
    icon:        typedef.icon,
    color:       typedef.color,
    identityIds: identityIds || [],
    enabled:     true,
    logEnabled:  true,
    urlPattern:  '',
    loopTarget:  '',
    maxCycles:   3,
    createdAt:   Date.now(),
    uuid:        typeof UUID !== 'undefined' && UUID.gen
      ? UUID.gen('intent', { typeId, identityIds }, 'intent:' + id)
      : id,
    ...(extraConfig || {}),
  };
  cfg.intents.push(intent);
  nxiSave(cfg);
  _nxiEmit('intent:added', { intent });
  nxiRenderSuite();
  return intent;
}
window.nxiAddIntent = nxiAddIntent;

function nxiRemoveIntent(id) {
  const cfg = nxiGetConfig();
  const idx = cfg.intents.findIndex(i => i.id === id);
  if (idx < 0) return;
  cfg.intents.splice(idx, 1);
  nxiSave(cfg);
  _nxiEmit('intent:removed', { id });
  nxiRenderSuite();
}
window.nxiRemoveIntent = nxiRemoveIntent;

function nxiSaveIntent(id) {
  const cfg = nxiGetConfig();
  const intent = cfg.intents.find(i => i.id === id);
  if (!intent) return;
  // Read values from DOM
  const ids = [...document.querySelectorAll('[data-intent-identity="' + id + '"]:checked')].map(c => c.value);
  if (ids.length) intent.identityIds = ids;
  const urlEl = document.getElementById('nxi-intent-url-' + id);
  if (urlEl) intent.urlPattern = urlEl.value;
  const loopEl = document.getElementById('nxi-intent-loop-' + id);
  if (loopEl) intent.loopTarget = loopEl.value;
  const cycleEl = document.getElementById('nxi-intent-cycles-' + id);
  if (cycleEl) intent.maxCycles = parseInt(cycleEl.value) || 3;
  intent.updatedAt = Date.now();
  nxiSave(cfg);
  _nxiEmit('intent:updated', { intent });
  if (typeof toast === 'function') toast('Intent saved', 'ok', 2000);
}
window.nxiSaveIntent = nxiSaveIntent;

/* ── § 8  GWZ SYNC — single source of truth ─────────────────────────── */

function _nxiSyncToGWZ() {
  /* Rebuild GWZ_AGENT_META from NXI config so the wizard always has
     current URL + hint for all identities, including custom ones. */
  if (typeof window.GWZ_AGENT_META === 'undefined') return;
  const cfg = nxiGetConfig();
  cfg.identities.forEach(identity => {
    window.GWZ_AGENT_META[identity.id] = {
      name:  identity.name,
      color: identity.color,
      icon:  identity.icon,
      url:   identity.url,
      hint:  identity.hint || ('Click the chat input on ' + identity.name),
    };
  });
}
window.nxiSyncToGWZ = _nxiSyncToGWZ;

/* ── § 9  FIRST RUN WIZARD ──────────────────────────────────────────── */

function nxiCheckFirstRun() {
  const cfg = nxiGetConfig();
  if (!cfg.firstRunDone) {
    // Show first-run overlay after a tick (let the rest of the app settle)
    setTimeout(nxiShowFirstRun, 800);
  }
}

function nxiShowFirstRun() {
  // Don't show if user is mid-other-overlay
  if (document.querySelector('.modal-overlay.open')) return;

  _nxiEnsureOverlay();
  const o = document.getElementById('nxi-firstrun-overlay');
  if (!o) return;
  o.style.display = 'flex';
  requestAnimationFrame(() => { o.style.opacity = '1'; });
}
window.nxiShowFirstRun = nxiShowFirstRun;

function nxiFirstRunComplete() {
  const cfg = nxiGetConfig();
  cfg.firstRunDone = true;
  nxiSave(cfg);
  const o = document.getElementById('nxi-firstrun-overlay');
  if (o) { o.style.opacity = '0'; setTimeout(() => { o.style.display = 'none'; }, 300); }
  // Open OPTIONS → AI SETTINGS → Identity Suite
  if (typeof switchTab === 'function') switchTab('options');
  setTimeout(() => {
    if (typeof optSwitchTab === 'function') optSwitchTab('ai', null);
  }, 200);
}
window.nxiFirstRunComplete = nxiFirstRunComplete;

/* ── § 9A  FIRST-RUN STATE ─────────────────────────────────────────── */

const NXI_FR = {
  step: 1,       // 1 = identity pick, 2 = intent config
  selected: [],  // identity ids picked in step 1
};

/* ── § 9B  OVERLAY SHELL ─────────────────────────────────────────────── */

function _nxiEnsureOverlay() {
  if (document.getElementById('nxi-firstrun-overlay')) return;
  const div = document.createElement('div');
  div.id = 'nxi-firstrun-overlay';
  div.style.cssText = [
    'position:fixed;inset:0;z-index:3000',
    'background:rgba(3,4,10,.96)',
    'display:none;flex-direction:column;align-items:center;justify-content:center',
    'opacity:0;transition:opacity .25s',
  ].join(';');
  div.innerHTML = `
    <div id="nxi-fr-card" style="
      max-width:580px;width:94%;
      background:var(--bg1);border:1px solid var(--border2);border-radius:6px;
      overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,.8);
      display:flex;flex-direction:column;">

      <!-- Header -->
      <div id="nxi-fr-header" style="
        padding:18px 22px 14px;
        background:var(--bg2);border-bottom:1px solid var(--border);
        display:flex;align-items:center;gap:10px;">
        <span style="font-size:16px;color:var(--c)">⟁</span>
        <div>
          <div style="font-family:var(--display);font-size:15px;letter-spacing:.2em;color:var(--c)">IDENTITY SETUP</div>
          <div style="font-size:9px;color:var(--text3);margin-top:2px;line-height:1.5">
            Configure your AI identities — the browsers Guardian will wire into NEXUS.<br>
            You can add more at any time in OPTIONS → AI SETTINGS → IDENTITY SUITE.
          </div>
        </div>
        <button onclick="nxiFirstRunComplete()" title="Close"
          style="margin-left:auto;background:none;border:none;color:var(--text4);cursor:pointer;font-size:15px;padding:0 4px;line-height:1">×</button>
      </div>

      <!-- Step 1: Identity pick -->
      <div id="nxi-fr-step1" style="padding:18px 22px 16px">
        <div style="font-size:8px;color:var(--text4);letter-spacing:.14em;margin-bottom:12px">
          SELECT YOUR AI IDENTITIES
        </div>
        <div id="nxi-fr-grid" style="
          display:grid;grid-template-columns:repeat(3,1fr);gap:6px;
          margin-bottom:16px">
        </div>
        <!-- Footer -->
        <div style="display:flex;gap:8px;justify-content:flex-end;padding-top:10px;border-top:1px solid var(--border)">
          <button class="btn" style="font-size:9px" onclick="nxiFirstRunComplete()">SKIP FOR NOW</button>
          <button id="nxi-fr-next" class="btn accent"
            style="font-size:9px;background:rgba(0,212,255,.1);border-color:rgba(0,212,255,.4);color:var(--c)"
            onclick="nxiFrNext()">NEXT →</button>
        </div>
      </div>

      <!-- Step 2: Intent config (hidden initially) -->
      <div id="nxi-fr-step2" style="display:none;padding:18px 22px 16px">
        <div style="font-size:8px;color:var(--text4);letter-spacing:.14em;margin-bottom:14px">
          ROUTING MODE
        </div>

        <!-- Unified -->
        <label id="nxi-fr-mode-unified-row" onclick="nxiFrSetMode('unified')"
          style="display:flex;align-items:flex-start;gap:10px;padding:10px 12px;
                 border:1px solid var(--border2);border-radius:3px;cursor:pointer;
                 margin-bottom:6px;transition:all .15s">
          <div id="nxi-fr-dot-unified"
            style="width:14px;height:14px;border-radius:50%;border:2px solid var(--border2);
                   flex-shrink:0;margin-top:1px;transition:all .15s;background:transparent"></div>
          <div>
            <div style="font-family:var(--display);font-size:10px;letter-spacing:.12em;color:var(--c)">UNIFIED</div>
            <div style="font-size:9px;color:var(--text3);margin-top:3px;line-height:1.6">
              One identity used everywhere across NEXUS — Console, Scripter, Builder, all tabs.
              One wire. One callto. One source of truth.
            </div>
          </div>
        </label>

        <!-- Agentic -->
        <label id="nxi-fr-mode-agentic-row" onclick="nxiFrSetMode('agentic')"
          style="display:flex;align-items:flex-start;gap:10px;padding:10px 12px;
                 border:1px solid var(--border2);border-radius:3px;cursor:pointer;
                 margin-bottom:6px;transition:all .15s">
          <div id="nxi-fr-dot-agentic"
            style="width:14px;height:14px;border-radius:50%;border:2px solid var(--border2);
                   flex-shrink:0;margin-top:1px;transition:all .15s;background:transparent"></div>
          <div>
            <div style="font-family:var(--display);font-size:10px;letter-spacing:.12em;color:var(--g)">AGENTIC <span style="font-size:8px;color:var(--text4);font-family:var(--mono)">via Ollama</span></div>
            <div style="font-size:9px;color:var(--text3);margin-top:3px;line-height:1.6">
              Routes calltos through Ollama which dispatches per intent — Code, Chat, Ideas,
              Research, Loop. Ollama decides the routing.
            </div>
            <!-- Ollama sub-config, shown when selected -->
            <div id="nxi-fr-agentic-cfg" style="display:none;margin-top:10px;padding-top:8px;border-top:1px solid var(--border)">
              <div style="font-size:8px;color:var(--text4);letter-spacing:.1em;margin-bottom:6px">OLLAMA SERVER</div>
              <div style="display:flex;gap:6px;align-items:center">
                <input id="nxi-fr-ollama-url" class="finp" value="http://localhost:11434"
                  style="flex:1;font-size:9px"/>
                <button class="btn" style="font-size:9px" onclick="event.stopPropagation();nxiFrTestOllama()">TEST</button>
                <span id="nxi-fr-ollama-status" style="font-size:9px;color:var(--text3)"></span>
              </div>
            </div>
          </div>
        </label>

        <!-- Manual -->
        <label id="nxi-fr-mode-manual-row" onclick="nxiFrSetMode('manual')"
          style="display:flex;align-items:flex-start;gap:10px;padding:10px 12px;
                 border:1px solid var(--border2);border-radius:3px;cursor:pointer;
                 margin-bottom:6px;transition:all .15s">
          <div id="nxi-fr-dot-manual"
            style="width:14px;height:14px;border-radius:50%;border:2px solid var(--border2);
                   flex-shrink:0;margin-top:1px;transition:all .15s;background:transparent"></div>
          <div style="flex:1;min-width:0">
            <div style="font-family:var(--display);font-size:10px;letter-spacing:.12em;color:var(--m)">MANUAL</div>
            <div style="font-size:9px;color:var(--text3);margin-top:3px;line-height:1.6;margin-bottom:8px">
              Assign calltos and callbacks explicitly. Wire each signal to a hook from the hook index.
            </div>
            <!-- Manual sub-config, shown when selected -->
            <div id="nxi-fr-manual-cfg" style="display:none;padding-top:8px;border-top:1px solid var(--border)">
              <!-- Callto (input) -->
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
                <span style="font-size:8px;color:var(--text4);letter-spacing:.08em;width:72px;flex-shrink:0">CALLTO</span>
                <select id="nxi-fr-callto" class="finp" style="flex:1;font-size:9px"
                  onclick="event.stopPropagation()">
                  <option value="">— select input callto —</option>
                </select>
              </div>
              <!-- Callback (output) -->
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
                <span style="font-size:8px;color:var(--text4);letter-spacing:.08em;width:72px;flex-shrink:0">CALLBACK</span>
                <select id="nxi-fr-callback" class="finp" style="flex:1;font-size:9px"
                  onclick="event.stopPropagation()">
                  <option value="">— select output callback —</option>
                </select>
              </div>
              <!-- Custom toggle -->
              <div style="margin-bottom:8px">
                <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:9px;color:var(--text3)"
                  onclick="event.stopPropagation()">
                  <input type="checkbox" id="nxi-fr-custom-toggle"
                    onchange="nxiFrToggleCustomHook(this.checked)"
                    style="accent-color:var(--m)"/>
                  USE CUSTOM HOOK
                </label>
              </div>
              <!-- Hook selector (hidden until custom checked) -->
              <div id="nxi-fr-hook-row" style="display:none;flex-direction:column;gap:6px;
                padding:8px 10px;background:rgba(204,68,255,.05);
                border:1px solid rgba(204,68,255,.2);border-radius:2px">
                <div style="font-size:8px;color:var(--text4);letter-spacing:.1em">HOOK INDEX</div>
                <select id="nxi-fr-hook" class="finp" style="font-size:9px"
                  onclick="event.stopPropagation()">
                  <option value="">— select hook —</option>
                </select>
                <div id="nxi-fr-hook-detail" style="font-size:8px;color:var(--text4);font-family:var(--mono);display:none"></div>
              </div>
            </div>
          </div>
        </label>

        <!-- Footer -->
        <div style="display:flex;gap:8px;justify-content:space-between;padding-top:12px;border-top:1px solid var(--border)">
          <button class="btn" style="font-size:9px" onclick="nxiFrBack()">← BACK</button>
          <div style="display:flex;gap:8px">
            <button class="btn" style="font-size:9px" onclick="nxiFirstRunComplete()">SKIP FOR NOW</button>
            <button class="btn accent"
              style="font-size:9px;background:rgba(0,212,255,.1);border-color:rgba(0,212,255,.4);color:var(--c)"
              onclick="nxiFrSaveAndContinue()">SAVE &amp; OPEN SUITE →</button>
          </div>
        </div>
      </div>

    </div>`;
  document.body.appendChild(div);
  _nxiFrRenderGrid();
}

/* ── § 9C  STEP 1: IDENTITY GRID ────────────────────────────────────── */

function _nxiFrRenderGrid() {
  const grid = document.getElementById('nxi-fr-grid');
  if (!grid) return;
  const cfg = nxiGetConfig();
  const topPick = ['chatgpt','claude','ollama','deepseek','gemini','grok','mistral','perplexity','groq'];
  grid.innerHTML = topPick.map(id => {
    const b = NXI_BUILTIN.find(x => x.id === id);
    if (!b) return '';
    const isOn = NXI_FR.selected.includes(id);
    return `<div
      onclick="nxiFrChipToggle('${id}', this)"
      style="
        border:1px solid ${isOn ? b.color : 'var(--border2)'};
        background:${isOn ? 'rgba(0,0,0,.25)' : 'var(--bg2)'};
        border-radius:3px;padding:9px 11px;cursor:pointer;
        transition:border-color .15s,background .15s;
        display:flex;align-items:center;gap:7px"
      data-id="${id}">
      <span style="color:${b.color};font-size:15px;flex-shrink:0">${b.icon}</span>
      <span style="font-family:var(--display);font-size:9px;letter-spacing:.1em;
                   color:${isOn ? b.color : 'var(--text3)'}">
        ${b.name.toUpperCase()}
      </span>
      <span style="margin-left:auto;font-size:11px;
                   color:${isOn ? 'var(--g)' : 'transparent'}">✓</span>
    </div>`;
  }).join('');
}

window.nxiFrChipToggle = function(id, el) {
  const idx = NXI_FR.selected.indexOf(id);
  if (idx >= 0) {
    NXI_FR.selected.splice(idx, 1);
  } else {
    NXI_FR.selected.push(id);
  }
  _nxiFrRenderGrid();
};

window.nxiFrNext = function() {
  if (NXI_FR.selected.length === 0) {
    if (typeof toast === 'function') toast('Select at least one identity', 'warn', 2500);
    return;
  }
  // Apply selections to config
  const cfg = nxiGetConfig();
  cfg.identities.forEach(i => {
    if (NXI_BUILTIN.find(b => b.id === i.id)) {
      i.enabled = NXI_FR.selected.includes(i.id);
    }
  });
  nxiSave(cfg);

  // Transition to step 2
  const s1 = document.getElementById('nxi-fr-step1');
  const s2 = document.getElementById('nxi-fr-step2');
  if (s1) s1.style.display = 'none';
  if (s2) s2.style.display = 'block';

  // Populate callto/callback dropdowns from GUARDIAN.calltos
  _nxiFrPopulateCalltos();
  // Populate hook dropdown from NEXUS hook registry
  _nxiFrPopulateHooks();
};
window.nxiFrNext = window.nxiFrNext;

window.nxiFrBack = function() {
  const s1 = document.getElementById('nxi-fr-step1');
  const s2 = document.getElementById('nxi-fr-step2');
  if (s1) s1.style.display = 'block';
  if (s2) s2.style.display = 'none';
};

/* ── § 9D  STEP 2: MODE SELECT ──────────────────────────────────────── */

window.nxiFrSetMode = function(mode) {
  const MODES = ['unified','agentic','manual'];
  const COLORS = { unified:'var(--c)', agentic:'var(--g)', manual:'var(--m)' };

  MODES.forEach(m => {
    const row = document.getElementById('nxi-fr-mode-' + m + '-row');
    const dot = document.getElementById('nxi-fr-dot-' + m);
    const active = m === mode;
    if (row) {
      row.style.borderColor = active ? COLORS[m] : 'var(--border2)';
      row.style.background  = active ? 'rgba(0,0,0,.15)' : '';
    }
    if (dot) {
      dot.style.borderColor  = active ? COLORS[m] : 'var(--border2)';
      dot.style.background   = active ? COLORS[m] : 'transparent';
      dot.style.boxShadow    = active ? ('0 0 6px ' + COLORS[m]) : 'none';
    }
  });

  // Show/hide sub-configs
  const agCfg  = document.getElementById('nxi-fr-agentic-cfg');
  const manCfg = document.getElementById('nxi-fr-manual-cfg');
  if (agCfg)  agCfg.style.display  = mode === 'agentic' ? 'block' : 'none';
  if (manCfg) manCfg.style.display = mode === 'manual'  ? 'block' : 'none';

  NXI_FR.mode = mode;
};

window.nxiFrToggleCustomHook = function(checked) {
  const row = document.getElementById('nxi-fr-hook-row');
  if (row) row.style.display = checked ? 'flex' : 'none';
};

function _nxiFrPopulateCalltos() {
  const calltos = (typeof GUARDIAN !== 'undefined') ? (GUARDIAN.calltos || []) : [];
  const opts = '<option value="">— none —</option>' + calltos.map(c =>
    `<option value="${c.id}">${_esc(c.label || c.id)} · ${_esc(c.selector || '')}</option>`
  ).join('');
  const inSel  = document.getElementById('nxi-fr-callto');
  const outSel = document.getElementById('nxi-fr-callback');
  if (inSel)  inSel.innerHTML  = opts;
  if (outSel) outSel.innerHTML = opts;
}

function _nxiFrPopulateHooks() {
  const sel = document.getElementById('nxi-fr-hook');
  if (!sel) return;

  // Pull from NEXUS registry (live) or HOOK_NAMESPACE (static catalogue)
  let hooks = [];
  if (typeof NEXUS !== 'undefined' && typeof NEXUS.allHooks === 'function') {
    hooks = NEXUS.allHooks().map(h => ({ id: h.hookId, label: h.label, prefix: h.prefix, status: h.status }));
  }
  // Fall back to static namespace if registry is empty
  if (hooks.length === 0 && typeof NEXUS_HOOK_NAMESPACE !== 'undefined') {
    hooks = Object.entries(NEXUS_HOOK_NAMESPACE).map(([id, spec]) => ({
      id, label: spec.label, prefix: spec.prefix, status: spec.status,
    }));
  }

  // Group by prefix
  const groups = {};
  hooks.forEach(h => {
    const g = h.prefix || 'other';
    if (!groups[g]) groups[g] = [];
    groups[g].push(h);
  });

  sel.innerHTML = '<option value="">— select hook —</option>' +
    Object.entries(groups).map(([prefix, items]) =>
      `<optgroup label="${prefix.toUpperCase()}">${
        items.map(h =>
          `<option value="${_esc(h.id)}" data-status="${h.status}">${_esc(h.label)} ${h.status !== 'active' ? '(' + h.status + ')' : ''}</option>`
        ).join('')
      }</optgroup>`
    ).join('');

  // On change show detail
  sel.onchange = function() {
    const detail = document.getElementById('nxi-fr-hook-detail');
    if (!detail) return;
    if (!this.value) { detail.style.display = 'none'; return; }
    detail.textContent = this.value;
    detail.style.display = 'block';
  };
}

/* ── § 9E  OLLAMA TEST ──────────────────────────────────────────────── */

window.nxiFrTestOllama = async function() {
  const urlEl  = document.getElementById('nxi-fr-ollama-url');
  const status = document.getElementById('nxi-fr-ollama-status');
  const url    = urlEl?.value || 'http://localhost:11434';
  if (status) { status.textContent = 'testing…'; status.style.color = 'var(--y)'; }
  try {
    const r = await fetch(url + '/api/tags', { signal: AbortSignal.timeout(3000) });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json();
    const n = (j.models || []).length;
    if (status) { status.textContent = '✓ ' + n + ' model' + (n !== 1 ? 's' : ''); status.style.color = 'var(--g)'; }
    nxiUpdateUrl('ollama', url);
  } catch(e) {
    if (status) { status.textContent = '✗ offline'; status.style.color = 'var(--r)'; }
  }
};

/* ── § 9F  SAVE & CONTINUE ──────────────────────────────────────────── */

window.nxiFrSaveAndContinue = function() {
  const cfg = nxiGetConfig();
  const mode = NXI_FR.mode || 'unified';

  cfg.routingMode = mode;

  if (mode === 'agentic') {
    const ollamaUrl = document.getElementById('nxi-fr-ollama-url')?.value;
    if (ollamaUrl) { nxiUpdateUrl('ollama', ollamaUrl); cfg.agenticOllamaUrl = ollamaUrl; }
    cfg.agenticEnabled = true;
  }

  if (mode === 'manual') {
    cfg.manualCalltoId  = document.getElementById('nxi-fr-callto')?.value  || '';
    cfg.manualCallbackId = document.getElementById('nxi-fr-callback')?.value || '';
    const useCustom = document.getElementById('nxi-fr-custom-toggle')?.checked;
    cfg.manualHookId = useCustom ? (document.getElementById('nxi-fr-hook')?.value || '') : '';

    // Wire first enabled identity with the selected callto
    if (cfg.manualCalltoId) {
      const firstEnabled = cfg.identities.find(i => NXI_FR.selected.includes(i.id));
      if (firstEnabled) {
        firstEnabled.inputCalltoId  = cfg.manualCalltoId;
        firstEnabled.outputCalltoId = cfg.manualCallbackId;
        firstEnabled.wiredAt = Date.now();
        // Mirror to guardian agent hooks
        if (typeof guardianSaveAgentHook === 'function') {
          guardianSaveAgentHook(firstEnabled.id, cfg.manualCalltoId, 'chat');
        }
      }
    }
  }

  if (mode === 'unified') {
    cfg.unifiedIdentityId = NXI_FR.selected[0] || '';
  }

  nxiSave(cfg);
  _nxiEmit('identity:routing:configured', { mode, selected: NXI_FR.selected });
  if (typeof log_ev === 'function') log_ev('identity:setup:complete', { mode, identities: NXI_FR.selected }, 'INFO');

  nxiFirstRunComplete();
};

/* ── § 10  IDENTITY SUITE RENDER ────────────────────────────────────── */

function nxiRenderSuite() {
  const container = document.getElementById('nxi-suite-root');
  if (!container) return;

  const cfg = nxiGetConfig();
  const calltos = (typeof GUARDIAN !== 'undefined') ? (GUARDIAN.calltos || []) : [];
  const enabled  = cfg.identities.filter(i => i.enabled);
  const disabled = cfg.identities.filter(i => !i.enabled);

  container.innerHTML = '';

  /* ── Status bar ── */
  const bar = document.createElement('div');
  bar.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 0;margin-bottom:10px;border-bottom:1px solid var(--border);flex-wrap:wrap';
  const guardianLive = typeof GUARDIAN !== 'undefined' && (GUARDIAN.connected || GUARDIAN.handshakeOk);
  bar.innerHTML = `
    <div style="width:7px;height:7px;border-radius:50%;background:${guardianLive ? 'var(--g)' : 'var(--text4)'};box-shadow:${guardianLive ? '0 0 6px var(--g)' : 'none'}"></div>
    <span style="font-size:9px;color:${guardianLive ? 'var(--g)' : 'var(--text3)'}">GUARDIAN ${guardianLive ? 'CONNECTED' : 'OFFLINE'}</span>
    <span style="font-size:9px;color:var(--text4)">·</span>
    <span style="font-size:9px;color:var(--text3)">${calltos.length} callto${calltos.length !== 1 ? 's' : ''} indexed</span>
    <span style="font-size:9px;color:var(--text4)">·</span>
    <span style="font-size:9px;color:var(--text3)">${enabled.length} identit${enabled.length !== 1 ? 'ies' : 'y'} active</span>
    <button class="btn" style="font-size:9px;margin-left:auto" onclick="p5gSyncAllCalltos();nxiRenderSuite()">↻ SYNC</button>
    <button class="btn" style="font-size:9px" onclick="nxiShowFirstRun()">⚙ SETUP</button>`;
  container.appendChild(bar);

  /* ── Active identities grid ── */
  if (enabled.length === 0) {
    const empty = document.createElement('div');
    empty.style.cssText = 'text-align:center;padding:24px;color:var(--text4);font-size:10px;border:1px dashed var(--border2);border-radius:3px;margin-bottom:10px';
    empty.innerHTML = 'No identities active.<br><span style="color:var(--c);cursor:pointer" onclick="nxiShowFirstRun()">Run setup →</span>';
    container.appendChild(empty);
  } else {
    enabled.forEach(identity => {
      container.appendChild(_nxiIdentityCard(identity, calltos, cfg));
    });
  }

  /* ── Add identity row ── */
  const addRow = document.createElement('div');
  addRow.style.cssText = 'display:flex;gap:6px;align-items:center;margin-bottom:12px;padding-top:6px;border-top:1px solid var(--border)';
  addRow.innerHTML = `
    <input id="nxi-add-name" class="finp" placeholder="Identity name" style="flex:1;font-size:9px"/>
    <input id="nxi-add-url"  class="finp" placeholder="URL" style="flex:2;font-size:9px"/>
    <button class="btn accent" style="font-size:9px" onclick="nxiSuiteAdd()">+ ADD</button>`;
  container.appendChild(addRow);

  /* ── Disabled / available identities (collapsed) ── */
  if (disabled.length) {
    const disc = document.createElement('div');
    disc.style.cssText = 'border:1px solid var(--border);border-radius:3px;overflow:hidden;margin-bottom:12px';
    disc.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;padding:7px 10px;background:var(--bg2);cursor:pointer;user-select:none" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'':'none'">
        <span style="font-size:9px;color:var(--text3);letter-spacing:.1em">AVAILABLE IDENTITIES</span>
        <span style="font-size:9px;color:var(--text4);margin-left:auto">${disabled.length} inactive ▾</span>
      </div>
      <div style="display:none;padding:8px;display:flex;flex-wrap:wrap;gap:5px">
        ${disabled.map(id => `
          <div style="display:flex;align-items:center;gap:6px;padding:5px 8px;border:1px solid var(--border2);border-radius:3px;cursor:pointer;background:var(--bg2)" onclick="nxiToggleIdentity('${id.id}')">
            <span style="color:${id.color};font-size:12px">${id.icon}</span>
            <span style="font-size:9px;color:var(--text3);font-family:var(--display);letter-spacing:.08em">${_esc(id.name)}</span>
            <span style="font-size:9px;color:var(--text4)">+ enable</span>
          </div>`).join('')}
      </div>`;
    // Fix: set initial display
    const body = disc.querySelector('div:nth-child(2)');
    if (body) body.style.display = 'none';
    container.appendChild(disc);
  }

  /* ── Intent section ── */
  container.appendChild(_nxiRenderIntentSection(cfg));
}
window.nxiRenderSuite = nxiRenderSuite;

window.nxiSuiteAdd = function() {
  const name = (document.getElementById('nxi-add-name')?.value || '').trim();
  const url  = (document.getElementById('nxi-add-url')?.value || '').trim();
  if (!name || !url) { if (typeof toast === 'function') toast('Name and URL required', 'warn'); return; }
  nxiAddIdentity(name, url);
  const nameEl = document.getElementById('nxi-add-name');
  const urlEl  = document.getElementById('nxi-add-url');
  if (nameEl) nameEl.value = '';
  if (urlEl)  urlEl.value  = '';
};

/* ── § 11  IDENTITY CARD ────────────────────────────────────────────── */

function _nxiIdentityCard(identity, calltos, cfg) {
  const div = document.createElement('div');
  div.id = 'nxi-card-' + identity.id;
  const wiredIn  = !!identity.inputCalltoId;
  const wiredOut = !!identity.outputCalltoId;
  const inputCallto  = calltos.find(c => c.id === identity.inputCalltoId);
  const outputCallto = calltos.find(c => c.id === identity.outputCalltoId);

  div.style.cssText = 'border:1px solid ' + (wiredIn ? identity.color + '66' : 'var(--border)') + ';border-radius:3px;margin-bottom:6px;overflow:hidden;background:var(--bg1)';

  div.innerHTML = `
    <!-- Card header -->
    <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--bg2);cursor:pointer"
         onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display===''?'none':''">
      <span style="font-size:16px;color:${identity.color}">${identity.icon}</span>
      <span style="font-family:var(--display);font-size:10px;letter-spacing:.12em;color:${identity.color}">${_esc(identity.name)}</span>
      <span style="font-size:9px;color:var(--text4);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${_esc(identity.url)}</span>
      <div style="display:flex;align-items:center;gap:4px">
        <div style="width:5px;height:5px;border-radius:50%;background:${wiredIn ? 'var(--g)' : 'var(--text4)'}" title="${wiredIn ? 'Input wired' : 'No input'}"></div>
        <div style="width:5px;height:5px;border-radius:50%;background:${wiredOut ? 'var(--m)' : 'var(--text4)'}" title="${wiredOut ? 'Output wired' : 'No output'}"></div>
        <span style="font-size:8px;color:${wiredIn ? 'var(--g)' : 'var(--text4)'};margin-left:2px">${wiredIn ? '⟡ WIRED' : '○'}</span>
      </div>
      <button onclick="event.stopPropagation();nxiRemoveIdentity('${identity.id}')"
        style="background:none;border:none;color:var(--text4);cursor:pointer;font-size:11px;padding:0 2px;line-height:1" title="${identity.builtIn ? 'Disable' : 'Remove'}">×</button>
    </div>
    <!-- Card body -->
    <div style="padding:10px;display:flex;flex-direction:column;gap:6px">
      <!-- URL edit -->
      <div style="display:flex;align-items:center;gap:6px">
        <span style="font-size:8px;color:var(--text4);letter-spacing:.08em;flex-shrink:0;width:50px">URL</span>
        <input class="finp" value="${_esc(identity.url)}" style="flex:1;font-size:9px"
          onchange="nxiUpdateUrl('${identity.id}',this.value)"/>
      </div>
      <!-- Wire row -->
      <div style="display:flex;gap:5px;align-items:center">
        <button class="btn" style="font-size:9px;flex:1;color:var(--g);border-color:${wiredIn ? 'rgba(0,255,136,.4)' : 'var(--border2)'};background:${wiredIn ? 'rgba(0,255,136,.08)' : ''}"
          onclick="nxiWireInput('${identity.id}')">⟁ WIRE INPUT</button>
        <button class="btn" style="font-size:9px;flex:1;color:var(--m);border-color:${wiredOut ? 'rgba(204,68,255,.4)' : 'var(--border2)'};background:${wiredOut ? 'rgba(204,68,255,.08)' : ''}"
          onclick="nxiWireOutput('${identity.id}')">⟁ WIRE OUTPUT</button>
        <button class="btn" id="nxi-test-${identity.id}" style="font-size:9px;color:var(--c);border-color:rgba(0,212,255,.3)"
          onclick="nxiTest('${identity.id}')">▶ TEST</button>
      </div>
      <!-- Callto status -->
      ${wiredIn ? `
      <div style="background:rgba(0,255,136,.04);border:1px solid rgba(0,255,136,.15);border-radius:2px;padding:5px 8px;font-size:8px;display:flex;align-items:center;gap:6px">
        <span style="color:var(--text4)">IN</span>
        <span style="font-family:var(--mono);color:var(--g);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${inputCallto ? _esc(inputCallto.selector || inputCallto.id) : _esc(identity.inputCalltoId.slice(0,24) + '…')}</span>
        <button style="background:none;border:none;color:var(--text4);cursor:pointer;font-size:10px;padding:0" onclick="nxiClearInput('${identity.id}')">×</button>
      </div>` : ''}
      ${wiredOut ? `
      <div style="background:rgba(204,68,255,.04);border:1px solid rgba(204,68,255,.15);border-radius:2px;padding:5px 8px;font-size:8px;display:flex;align-items:center;gap:6px">
        <span style="color:var(--text4)">OUT</span>
        <span style="font-family:var(--mono);color:var(--m);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${outputCallto ? _esc(outputCallto.selector || outputCallto.id) : _esc(identity.outputCalltoId.slice(0,24) + '…')}</span>
        <button style="background:none;border:none;color:var(--text4);cursor:pointer;font-size:10px;padding:0" onclick="nxiClearOutput('${identity.id}')">×</button>
      </div>` : ''}
    </div>`;

  return div;
}

window.nxiClearInput = function(id) {
  const cfg = nxiGetConfig(); const i = cfg.identities.find(x => x.id === id);
  if (i) { i.inputCalltoId = ''; i.wiredAt = null; nxiSave(cfg); nxiRenderSuite(); }
};
window.nxiClearOutput = function(id) {
  const cfg = nxiGetConfig(); const i = cfg.identities.find(x => x.id === id);
  if (i) { i.outputCalltoId = ''; nxiSave(cfg); nxiRenderSuite(); }
};

/* ── § 12  INTENT SECTION ───────────────────────────────────────────── */

function _nxiRenderIntentSection(cfg) {
  const section = document.createElement('div');
  section.style.cssText = 'border-top:1px solid var(--border);padding-top:12px;margin-top:4px';

  const header = document.createElement('div');
  header.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:10px';
  header.innerHTML = `
    <span style="font-family:var(--display);font-size:10px;letter-spacing:.15em;color:var(--c)">INTENT</span>
    <span style="font-size:9px;color:var(--text4)">— define what each identity does</span>`;
  section.appendChild(header);

  // Only show Intent section if at least 1 identity is wired
  const hasWired = cfg.identities.some(i => i.enabled && i.inputCalltoId);
  if (!hasWired) {
    const msg = document.createElement('div');
    msg.style.cssText = 'font-size:9px;color:var(--text4);padding:8px;border:1px dashed var(--border2);border-radius:3px;text-align:center';
    msg.textContent = 'Wire at least one identity input to add intents';
    section.appendChild(msg);
    return section;
  }

  // Intent type picker
  const typeRow = document.createElement('div');
  typeRow.style.cssText = 'display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px';
  NXI_INTENT_TYPES.forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.style.cssText = `font-size:9px;color:${t.color};border-color:${t.color}44`;
    btn.innerHTML = t.icon + ' ' + t.name;
    btn.title = t.desc;
    btn.onclick = () => _nxiShowAddIntent(t.id, cfg);
    typeRow.appendChild(btn);
  });
  // Add custom intent type button
  const customBtn = document.createElement('button');
  customBtn.className = 'btn';
  customBtn.style.cssText = 'font-size:9px;color:var(--text3)';
  customBtn.textContent = '+ Custom';
  customBtn.onclick = () => _nxiShowAddIntent('chat', cfg); // default to chat, user can relabel
  typeRow.appendChild(customBtn);
  section.appendChild(typeRow);

  // Existing intents
  if (cfg.intents.length === 0) {
    const empty = document.createElement('div');
    empty.style.cssText = 'font-size:9px;color:var(--text4);padding:6px 0';
    empty.textContent = 'No intents configured. Pick a type above to add one.';
    section.appendChild(empty);
  } else {
    cfg.intents.forEach(intent => {
      section.appendChild(_nxiIntentCard(intent, cfg));
    });
  }

  return section;
}

function _nxiShowAddIntent(typeId, cfg) {
  const typedef = NXI_INTENT_TYPES.find(t => t.id === typeId);
  if (!typedef) return;
  const enabledIds = cfg.identities.filter(i => i.enabled && i.inputCalltoId).map(i => i.id);
  if (enabledIds.length === 0) {
    if (typeof toast === 'function') toast('Wire at least one identity input first', 'warn');
    return;
  }
  // Add intent with first wired identity pre-selected
  nxiAddIntent(typeId, [enabledIds[0]]);
}

function _nxiIntentCard(intent, cfg) {
  const typedef = NXI_INTENT_TYPES.find(t => t.id === intent.typeId) || {};
  const wiredIdentities = cfg.identities.filter(i => i.enabled && i.inputCalltoId);
  const div = document.createElement('div');
  div.style.cssText = 'border:1px solid ' + (intent.color || 'var(--border)') + '33;border-radius:3px;margin-bottom:6px;overflow:hidden';
  div.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;padding:7px 10px;background:var(--bg2)">
      <span style="color:${intent.color || 'var(--c)'};font-size:13px">${intent.icon || '◈'}</span>
      <span style="font-family:var(--display);font-size:9px;letter-spacing:.1em;color:${intent.color || 'var(--c)'}">${_esc(intent.name)}</span>
      <span style="font-size:8px;color:var(--text4);flex:1">${typedef.desc || ''}</span>
      <button onclick="nxiRemoveIntent('${intent.id}')"
        style="background:none;border:none;color:var(--text4);cursor:pointer;font-size:11px;padding:0 2px">×</button>
    </div>
    <div style="padding:8px 10px;display:flex;flex-direction:column;gap:6px">
      <!-- Identity selector -->
      <div style="font-size:8px;color:var(--text4);letter-spacing:.08em;margin-bottom:3px">IDENTITIES</div>
      <div style="display:flex;flex-wrap:wrap;gap:4px">
        ${wiredIdentities.map(id => {
          const sel = intent.identityIds.includes(id.id);
          return `<label style="display:flex;align-items:center;gap:4px;padding:3px 7px;border:1px solid ${sel ? id.color : 'var(--border2)'};border-radius:2px;cursor:pointer;font-size:9px;color:${sel ? id.color : 'var(--text3)'}">
            <input type="checkbox" data-intent-identity="${intent.id}" value="${id.id}" ${sel ? 'checked' : ''}
              onchange="nxiSaveIntent('${intent.id}')" style="margin:0;accent-color:${id.color}"/>
            ${id.icon} ${_esc(id.name)}
          </label>`;
        }).join('')}
      </div>
      <!-- Intent-type specific fields -->
      ${(intent.typeId === 'ideas' || intent.typeId === 'research') ? `
      <div style="display:flex;align-items:center;gap:6px">
        <span style="font-size:8px;color:var(--text4);width:60px">URL PATTERN</span>
        <input id="nxi-intent-url-${intent.id}" class="finp" placeholder="e.g. chat.openai.com/*" value="${_esc(intent.urlPattern || '')}"
          style="flex:1;font-size:9px" onchange="nxiSaveIntent('${intent.id}')"/>
      </div>` : ''}
      ${intent.typeId === 'loop' ? `
      <div style="display:flex;gap:6px;align-items:center">
        <span style="font-size:8px;color:var(--text4);width:60px">LOOP TARGET</span>
        <select id="nxi-intent-loop-${intent.id}" class="finp" style="flex:1;font-size:9px" onchange="nxiSaveIntent('${intent.id}')">
          ${wiredIdentities.map(id => `<option value="${id.id}" ${intent.loopTarget === id.id ? 'selected' : ''}>${_esc(id.name)}</option>`).join('')}
        </select>
        <span style="font-size:8px;color:var(--text4)">MAX</span>
        <input id="nxi-intent-cycles-${intent.id}" class="finp" type="number" min="1" max="20" value="${intent.maxCycles || 3}"
          style="width:50px;font-size:9px" onchange="nxiSaveIntent('${intent.id}')"/>
        <span style="font-size:8px;color:var(--text4)">cycles</span>
      </div>` : ''}
      <!-- Save -->
      <div style="display:flex;justify-content:flex-end">
        <button class="btn accent" style="font-size:9px" onclick="nxiSaveIntent('${intent.id}')">SAVE</button>
      </div>
    </div>`;
  return div;
}

/* ── § 13  INJECT IDENTITY SUITE INTO OPTIONS TAB ───────────────────── */

function nxiBuildOptionsSection() {
  /* Replace the Ollama-only banner in acc-ai with a neutral header.
     Keep all DOM IDs that existing JS depends on (opt-ollama-url, etc.)
     — just move them into the identity card instead of the banner. */
  const accAiBody = document.querySelector('#acc-ai .acc-body');
  if (accAiBody && !accAiBody.dataset.nxiPatched) {
    accAiBody.dataset.nxiPatched = '1';

    // Kill the "LOCAL AI ONLY" banner — it's wrong and confusing
    const banner = accAiBody.querySelector('[style*="LOCAL AI ONLY"], [style*="local-first"]');
    if (banner) banner.remove();

    // Also remove the hardcoded "PRIMARY / OLLAMA" row — phase5 builds the real one
    const primRow = accAiBody.querySelector('.frow');
    if (primRow && primRow.textContent.includes('PRIMARY')) primRow.remove();
  }

  // Inject Identity Suite accordion into optsub-ai if not already there
  const optsub = document.getElementById('optsub-ai');
  if (!optsub || document.getElementById('nxi-suite-acc')) return;

  const scrollArea = optsub.querySelector('.scroll-area') || optsub;

  // Insert IDENTITY SUITE as the first accordion (above Delta Log and Tests)
  const deltaAcc = document.getElementById('acc-delta');
  const suiteAcc = document.createElement('div');
  suiteAcc.className = 'acc-section open';
  suiteAcc.id = 'nxi-suite-acc';
  suiteAcc.innerHTML = `
    <div class="acc-head" onclick="accToggle('nxi-suite-acc')">
      <span class="acc-title" style="color:var(--c)">⟁ IDENTITY SUITE</span>
      <span class="acc-badge" id="nxi-suite-badge" style="color:var(--g)">—</span>
      <span class="acc-chevron">▾</span>
    </div>
    <div class="acc-body" id="nxi-suite-body">
      <div id="nxi-suite-root"></div>
    </div>`;

  if (deltaAcc) {
    scrollArea.insertBefore(suiteAcc, deltaAcc);
  } else {
    scrollArea.appendChild(suiteAcc);
  }

  // First render
  nxiRenderSuite();
  _nxiUpdateBadge();
}
window.nxiBuildOptionsSection = nxiBuildOptionsSection;

function _nxiUpdateBadge() {
  const badge = document.getElementById('nxi-suite-badge');
  if (!badge) return;
  const cfg = nxiGetConfig();
  const wired = cfg.identities.filter(i => i.enabled && i.inputCalltoId).length;
  const total = cfg.identities.filter(i => i.enabled).length;
  badge.textContent = wired + '/' + total + ' wired';
  badge.style.color = wired === total && total > 0 ? 'var(--g)' : wired > 0 ? 'var(--y)' : 'var(--text4)';
}

/* ── § 14  UTIL ─────────────────────────────────────────────────────── */

function _esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── § 15  BC HOOK: callto → identity wiring ────────────────────────── */

function _nxiHookBC() {
  /* Listen for CALLTO_ADDED events from Guardian. If a wiring session is active
     (nxi_wiring_id in localStorage), route the callto to nxiOnCalltoWired. */
  window.addEventListener('nxi:callto_arrived', (e) => {
    const { callto, pickType } = e.detail;
    if (localStorage.getItem('nxi_wiring_id')) nxiOnCalltoWired(callto, pickType || 'input');
  });

  // Also patch GUARDIAN BC if available
  function tryHook() {
    if (typeof GUARDIAN === 'undefined' || !GUARDIAN._bc) return;
    const orig = GUARDIAN._bc.onmessage;
    GUARDIAN._bc.onmessage = function(e) {
      if (orig) orig.call(this, e);
      if (e.data && e.data.type === 'CALLTO_ADDED' && localStorage.getItem('nxi_wiring_id')) {
        const pickType = localStorage.getItem('nxi_wiring_type') || 'input';
        nxiOnCalltoWired(e.data.callto, pickType);
      }
    };
  }
  // Guardian may not be ready immediately
  if (typeof GUARDIAN !== 'undefined' && GUARDIAN._bc) {
    tryHook();
  } else {
    window.addEventListener('guardian:ready', tryHook, { once: true });
    setTimeout(tryHook, 2000);
  }
}

/* ── § 16  GLOBAL WINDOW EXPOSURE ───────────────────────────────────── */

// Ensure all functions reachable from inline onclick handlers
window.nxiRenderSuite        = nxiRenderSuite;
window.nxiBuildOptionsSection = nxiBuildOptionsSection;
window.nxiCheckFirstRun      = nxiCheckFirstRun;
window.nxiShowFirstRun       = nxiShowFirstRun;
window.nxiFirstRunComplete   = nxiFirstRunComplete;
window.nxiAddIdentity        = nxiAddIdentity;
window.nxiRemoveIdentity     = nxiRemoveIdentity;
window.nxiToggleIdentity     = nxiToggleIdentity;
window.nxiUpdateUrl          = nxiUpdateUrl;
window.nxiWireInput          = nxiWireInput;
window.nxiWireOutput         = nxiWireOutput;
window.nxiOnCalltoWired      = nxiOnCalltoWired;
window.nxiTest               = nxiTest;
window.nxiAddIntent          = nxiAddIntent;
window.nxiRemoveIntent       = nxiRemoveIntent;
window.nxiSaveIntent         = nxiSaveIntent;
window.nxiSyncToGWZ          = _nxiSyncToGWZ;
window.nxiGetConfig          = nxiGetConfig;

/* ── § 17  BOOT ─────────────────────────────────────────────────────── */

(function nxiInit() {
  function ready(fn) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') setTimeout(fn, 0);
    else window.addEventListener('DOMContentLoaded', fn, { once: true });
  }

  ready(function() {
    // Sync GWZ meta immediately so wizard has all 17 identities
    setTimeout(_nxiSyncToGWZ, 400);

    // Hook BC
    _nxiHookBC();

    // Patch optSwitchTab to build Identity Suite when AI tab opens
    const _origSwitch = typeof window.optSwitchTab === 'function' ? window.optSwitchTab : null;
    function _nxiOptSwitch(tab, btn) {
      if (_origSwitch) _origSwitch(tab, btn);
      if (tab === 'ai') {
        setTimeout(() => {
          nxiBuildOptionsSection();
          nxiRenderSuite();
          _nxiUpdateBadge();
        }, 100);
      }
    }
    // Chain — don't overwrite if phase5 already patched it
    const existing = window.optSwitchTab;
    if (existing && existing !== _nxiOptSwitch) {
      window.optSwitchTab = function(tab, btn) {
        existing(tab, btn);
        if (tab === 'ai') {
          setTimeout(() => { nxiBuildOptionsSection(); nxiRenderSuite(); _nxiUpdateBadge(); }, 150);
        }
      };
    } else {
      window.optSwitchTab = _nxiOptSwitch;
    }

    // First run check — after 1.5s so app is fully settled
    setTimeout(nxiCheckFirstRun, 1500);

    // Expose phase5 globals that were missing window.* exposure
    if (typeof p5gSaveHook       !== 'undefined') window.p5gSaveHook       = p5gSaveHook;
    if (typeof p5gFireHook       !== 'undefined') window.p5gFireHook       = p5gFireHook;
    if (typeof p5gLoadHookState  !== 'undefined') window.p5gLoadHookState  = p5gLoadHookState;
    if (typeof p5gSyncAllCalltos !== 'undefined') window.p5gSyncAllCalltos = p5gSyncAllCalltos;
    if (typeof p5TestApi         !== 'undefined') window.p5TestApi         = p5TestApi;
    if (typeof buildAiSubTab     !== 'undefined') window.buildAiSubTab     = buildAiSubTab;
    if (typeof renderAgentGrid   !== 'undefined') window.renderAgentGrid   = renderAgentGrid;
    window.p5gSyncCalltos = window.p5gSyncAllCalltos; // alias

    console.log('[NXI v0.53.0] Identity Suite loaded. ' + NXI_BUILTIN.length + ' builtin identities, ' + NXI_INTENT_TYPES.length + ' intent types.');
  });
})();
