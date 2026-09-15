/* ═══════════════════════════════════════════════════════════════════════
   nexus-guardian.js — NEXUS Guardian Integration v0.53.0
   Guardian v3 protocol: guardian-{uuid} instanceId, handshake+token,
   pulse presence registry, agent-callto hook mirror.
   Dynamic AI: selected = default. Fallback probes all. Toast failures.
   ═══════════════════════════════════════════════════════════════════════ */

'use strict';

/* ── § 1 CONSTANTS & STATE ──────────────────────────────────────────── */

const GUARDIAN = {
  BRIDGE_URL:     'http://127.0.0.1:3747',
  BC_CHANNEL:     'guardian-bridge',
  PING_SAMPLES:   12,
  FIDELITY_ROUNDS: 6,
  RTT_HISTORY_CAP: 40,
  PULSE_INTERVAL:  1500,
  TOKEN_TTL:       55000,

  connected:      false,
  sessions:       0,
  lastHB:         null,
  urckSeq:        0,
  calltos:        [],
  rttHistory:     [],
  hooks:          [],
  discoveredNodes: [],

  instanceId:     null,
  sessionToken:   null,
  tokenIssuedAt:  null,
  handshakeOk:    false,
  pulseCount:     0,

  _bc:            null,
  _hbTimer:       null,
  _pollTimer:     null,
  _pulseTimer:    null,
  _tokenTimer:    null,
};

/* ── § 2 INSTANCE ID ────────────────────────────────────────────────── */

function _guardianInstanceId() {
  const stored = localStorage.getItem('nx6_guardian_instanceId');
  if (stored && stored.startsWith('guardian-')) return stored;
  const raw = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
  const id = 'guardian-' + raw;
  localStorage.setItem('nx6_guardian_instanceId', id);
  return id;
}

function _guardianShortId(instanceId) {
  if (!instanceId) return '?';
  const raw = instanceId.startsWith('guardian-') ? instanceId.slice(9) : instanceId;
  return raw.slice(0, 8);
}

/* ── § 3 BRIDGE FETCH ───────────────────────────────────────────────── */

async function _guardianFetch(path, method, body, timeout) {
  method  = method  || 'GET';
  timeout = timeout || 4000;
  const ctrl = new AbortController();
  const tid  = setTimeout(function() { ctrl.abort(); }, timeout);
  try {
    const opts = {
      method:  method,
      signal:  ctrl.signal,
      headers: { 'Content-Type': 'application/json' },
    };
    if (GUARDIAN.sessionToken) opts.headers['X-Guardian-Token'] = GUARDIAN.sessionToken;
    if (body) opts.body = JSON.stringify(body);
    const r = await fetch(GUARDIAN.BRIDGE_URL + path, opts);
    clearTimeout(tid);
    if (r.status === 401) {
      GUARDIAN.sessionToken = null;
      GUARDIAN.handshakeOk  = false;
      setTimeout(guardianHandshake, 500);
      return null;
    }
    if (!r.ok) return null;
    return await r.json();
  } catch(e) {
    clearTimeout(tid);
    return null;
  }
}

/* ── § 4 HANDSHAKE ──────────────────────────────────────────────────── */

async function guardianHandshake() {
  if (!GUARDIAN.instanceId) GUARDIAN.instanceId = _guardianInstanceId();
  const challenge = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID() : Date.now().toString(36);

  const result = await _guardianFetch('/guardian/handshake', 'POST', {
    instanceId:   GUARDIAN.instanceId,
    logicalId:    'guardian',
    challenge:    challenge,
    capabilities: ['callto','listener','pulse','agent-hooks','bc'],
    version:      '3.4.0',
  }, 5000);

  if (result && result.ok && result.token) {
    GUARDIAN.sessionToken  = result.token;
    GUARDIAN.tokenIssuedAt = Date.now();
    GUARDIAN.handshakeOk   = true;
    GUARDIAN.discoveredNodes = result.nodes || [];

    clearTimeout(GUARDIAN._tokenTimer);
    GUARDIAN._tokenTimer = setTimeout(guardianHandshake, GUARDIAN.TOKEN_TTL);

    _guardianUpdateStatusUI();
    _guardianLogDiag('✓ Handshake OK · token issued', 'var(--g)');
    // Only toast on first successful connect, not every re-handshake
    if (!GUARDIAN._everConnected) {
      GUARDIAN._everConnected = true;
      if (typeof toast === 'function') toast('✓ Guardian connected · bridge v' + (result.version || '?'), 'ok', 3000);
    }

    var el = document.getElementById('guardian-instance-id');
    if (el) el.textContent = GUARDIAN.instanceId;
    var shortEl = document.getElementById('guardian-short-id');
    if (shortEl) shortEl.textContent = _guardianShortId(GUARDIAN.instanceId);
    return true;
  }
  GUARDIAN.handshakeOk = false;
  _guardianLogDiag('✗ Handshake failed — bridge offline?', 'var(--r)');
  if (typeof toast === 'function') {
    toast('⚠ Guardian: bridge not responding at ' + GUARDIAN.BRIDGE_URL + ' — start the bridge first', 'err', 6000);
  }
  return false;
}
window.guardianHandshake = guardianHandshake;

/* ── § 5 PULSE ──────────────────────────────────────────────────────── */

async function guardianEmitPulse() {
  var result = await _guardianFetch('/pulse', 'POST', {
    type:         'guardian:pulse',
    logicalId:    'guardian',
    instanceId:   GUARDIAN.instanceId,
    ts:           Date.now(),
    port:         3747,
    capabilities: ['callto','listener','pulse','agent-hooks','bc'],
    version:      '3.4.0',
  }, 1200);

  if (result && result.ok) {
    GUARDIAN.pulseCount++;
    GUARDIAN.discoveredNodes = result.nodes || [];
    var el = document.getElementById('guardian-pulse-count');
    if (el) el.textContent = GUARDIAN.pulseCount + ' pulses';
    var nEl = document.getElementById('guardian-node-count');
    if (nEl) nEl.textContent = GUARDIAN.discoveredNodes.length + ' node(s)';
  }
}

function guardianPulseStart() {
  if (GUARDIAN._pulseTimer) return;
  guardianEmitPulse();
  GUARDIAN._pulseTimer = setInterval(guardianEmitPulse, GUARDIAN.PULSE_INTERVAL);
}

function guardianPulseStop() {
  clearInterval(GUARDIAN._pulseTimer);
  GUARDIAN._pulseTimer = null;
}

/* ── § 6 BROADCAST CHANNEL ──────────────────────────────────────────── */

function _guardianInitBC() {
  if (GUARDIAN._bc) return;
  try {
    GUARDIAN._bc = new BroadcastChannel(GUARDIAN.BC_CHANNEL);
    GUARDIAN._bc.onmessage = function(e) { _guardianHandleBC(e.data); };
  } catch(err) {
    console.warn('[Guardian] BroadcastChannel unavailable:', err.message);
  }
}

function _guardianHandleBC(msg) {
  if (!msg || !msg.type) return;
  if (msg.type === 'HEARTBEAT') {
    GUARDIAN.connected = !!msg.alive;
    GUARDIAN.sessions  = msg.sessions || 0;
    GUARDIAN.lastHB    = Date.now();
    _guardianUpdateStatusUI();
  } else if (msg.type === 'CALLTO_ADDED') {
    var ct = msg.callto;
    if (ct && !GUARDIAN.calltos.find(function(c) { return c.id === ct.id; })) {
      GUARDIAN.calltos.unshift(ct);
      if (GUARDIAN.calltos.length > 200) GUARDIAN.calltos.pop();
    }
    _guardianRenderCalltoList();
    _guardianRenderCaptureFeed();
    guardianUpdateCalltoCount();
    // If wizard is active it intercepts via _gwzHookBC — nothing extra needed here
  } else if (msg.type === 'CAPTURE_DONE') {
    _guardianLogDiag('⊕ Capture: ' + msg.calltoId + ' · ' + msg.selector + ' · ' + msg.url);
  } else if (msg.type === 'GUARDIAN_OPEN_PICK') {
    // Echo from self (wizard sends, extension receives) — log only
    _guardianLogDiag('→ Pick request sent: ' + (msg.agentId || '?') + ' · ' + (msg.pickMode || 'input'));
  }
}

/* ── § 7 STATUS UI ──────────────────────────────────────────────────── */

function _guardianUpdateStatusUI() {
  var live  = GUARDIAN.connected || GUARDIAN.handshakeOk;
  var badge = document.getElementById('guardian-ext-badge');
  var conn  = document.getElementById('guardian-conn-val');
  var sess  = document.getElementById('guardian-sessions-val');
  var hb    = document.getElementById('guardian-hb-val');
  var hs    = document.getElementById('guardian-handshake-val');
  var dot   = document.getElementById('nxhd2-guardian');
  var dval  = document.getElementById('diag-guardian-status');
  var hdot  = document.getElementById('home-guardian-dot');

  if (badge) {
    badge.textContent = live ? 'CONNECTED' : 'DISCONNECTED';
    badge.style.color = live ? 'var(--g)' : 'var(--r)';
    badge.style.borderColor = live ? 'rgba(0,255,136,.3)' : 'rgba(255,45,85,.3)';
  }
  if (conn)  { conn.textContent = live ? '● LIVE' : '○ OFFLINE'; conn.style.color = live ? 'var(--g)' : 'var(--r)'; }
  if (sess)  sess.textContent = GUARDIAN.sessions + ' active';
  if (hb && GUARDIAN.lastHB) {
    var ago = Math.round((Date.now() - GUARDIAN.lastHB) / 1000);
    hb.textContent = ago + 's ago';
    hb.style.color = ago < 10 ? 'var(--g)' : ago < 30 ? 'var(--y)' : 'var(--r)';
  }
  if (hs) { hs.textContent = GUARDIAN.handshakeOk ? '✓ OK' : '✗ NONE'; hs.style.color = GUARDIAN.handshakeOk ? 'var(--g)' : 'var(--r)'; }
  if (dot)  { dot.style.background = live ? 'var(--g)' : 'var(--text4)'; dot.style.boxShadow = live ? '0 0 6px rgba(0,255,136,.6)' : 'none'; }
  if (dval) { dval.textContent = live ? 'LIVE' : 'OFFLINE'; dval.className = 'mcard-val ' + (live ? 'ok' : 'danger'); }
  if (hdot) { hdot.style.background = live ? 'var(--g)' : 'var(--text4)'; hdot.style.boxShadow = live ? '0 0 6px rgba(0,255,136,.6)' : 'none'; }
}

function guardianUpdateCalltoCount() {
  var badge   = document.getElementById('callto-count-badge');
  var countEl = document.getElementById('callto-index-count');
  var hookSel = document.getElementById('hook-callto-select');
  var n = GUARDIAN.calltos.length;
  if (badge)   { badge.textContent = n; badge.style.display = n > 0 ? '' : 'none'; }
  if (countEl) countEl.textContent = n;
  if (hookSel) {
    var cur = hookSel.value;
    hookSel.innerHTML = '<option value="">— none —</option>' +
      GUARDIAN.calltos.map(function(c) {
        return '<option value="' + c.id + '">' + (c.label || c.id) + ' · ' + (c.selector || '') + '</option>';
      }).join('');
    hookSel.value = cur;
  }
}
window.guardianUpdateCalltoCount = guardianUpdateCalltoCount;

/* ── § 8 AGENT HOOK MIRROR ──────────────────────────────────────────── */

async function guardianMirrorAgentHook(agentId, calltoId, intent) {
  var result = await _guardianFetch('/guardian/agent-hook', 'POST', {
    agentId:  agentId,
    calltoId: calltoId || '',
    intent:   intent   || 'chat',
  }, 4000);

  var mirrorEl = document.getElementById('p5g-mirror-' + agentId);
  if (!mirrorEl) return;

  if (!calltoId) { mirrorEl.innerHTML = ''; mirrorEl.style.display = 'none'; return; }

  var callto = (result && result.callto)
    ? result.callto
    : GUARDIAN.calltos.find(function(c) { return c.id === calltoId; });
  var ok = !!(result && result.ok);

  mirrorEl.style.display = 'block';
  mirrorEl.innerHTML =
    '<div style="background:rgba(0,255,136,.06);border:1px solid rgba(0,255,136,.2);border-left:3px solid var(--g);border-radius:2px;padding:6px 10px;margin-top:6px;font-size:9px;line-height:1.6;position:relative;">' +
    '<button onclick="this.parentElement.parentElement.style.display=\'none\'" style="position:absolute;top:4px;right:6px;background:none;border:none;color:var(--text3);cursor:pointer;font-size:11px;">×</button>' +
    '<div style="color:var(--g);font-family:var(--display);font-size:10px;letter-spacing:.12em;margin-bottom:4px;">' +
    (ok ? '✓ HOOK MIRRORED TO BRIDGE' : '⚠ SAVED LOCALLY — BRIDGE OFFLINE') + '</div>' +
    '<div style="display:flex;flex-direction:column;gap:2px;color:var(--text2);">' +
    '<div><span style="color:var(--text3);width:60px;display:inline-block">AGENT</span>' + agentId.toUpperCase() + '</div>' +
    '<div><span style="color:var(--text3);width:60px;display:inline-block">CALLTO</span><span style="color:var(--c);font-family:var(--mono)">' + calltoId + '</span></div>' +
    '<div><span style="color:var(--text3);width:60px;display:inline-block">INTENT</span>' + (intent || 'chat') + '</div>' +
    (callto ? '<div><span style="color:var(--text3);width:60px;display:inline-block">SELECTOR</span>' + (callto.selector || '—') + '</div>' : '') +
    '</div></div>';

  _guardianLogDiag(ok ? '✓ Hook mirrored: ' + agentId + ' → ' + calltoId : '⚠ Hook saved locally: ' + agentId, ok ? 'var(--g)' : 'var(--y)');
}
window.guardianMirrorAgentHook = guardianMirrorAgentHook;

/* ── § 9 DYNAMIC AI PROBE ───────────────────────────────────────────── */

async function aiProbeAll() {
  var cfg = {};
  try { cfg = JSON.parse(localStorage.getItem('nx6_cfg') || localStorage.getItem('nx5_config') || '{}'); } catch(e) {}

  var probes = [
    { id: 'chatgpt',  hasKey: !!cfg.chatgptKey,  test: async function() {
        if (!cfg.chatgptKey) return { ok:false, reason:'No API key' };
        var r = await fetch('https://api.openai.com/v1/models', { headers:{ Authorization:'Bearer '+cfg.chatgptKey }, signal: AbortSignal.timeout(4000) });
        if (!r.ok) throw new Error('HTTP ' + r.status); return { ok:true };
    }},
    { id: 'claude',   hasKey: !!cfg.claudeKey,   test: async function() {
        if (!cfg.claudeKey) return { ok:false, reason:'No API key' };
        var r = await fetch('https://api.anthropic.com/v1/messages', { method:'POST',
          headers:{ 'Content-Type':'application/json', 'x-api-key':cfg.claudeKey, 'anthropic-version':'2023-06-01', 'anthropic-dangerous-direct-browser-access':'true' },
          body: JSON.stringify({ model: cfg.claudeModel || 'claude-haiku-4-5-20251001', max_tokens:5, messages:[{role:'user',content:'ping'}] }),
          signal: AbortSignal.timeout(6000) });
        if (!r.ok) throw new Error('HTTP ' + r.status); return { ok:true };
    }},
    { id: 'ollama',   hasKey: true,              test: async function() {
        var url = cfg.ollamaUrl || 'http://localhost:11434';
        var r = await fetch(url + '/api/tags', { signal: AbortSignal.timeout(2000) });
        if (!r.ok) throw new Error('HTTP ' + r.status); return { ok:true };
    }},
    { id: 'deepseek', hasKey: !!cfg.deepseekKey, test: async function() {
        if (!cfg.deepseekKey) return { ok:false, reason:'No API key' };
        var r = await fetch('https://api.deepseek.com/v1/models', { headers:{ Authorization:'Bearer '+cfg.deepseekKey }, signal: AbortSignal.timeout(4000) });
        if (!r.ok) throw new Error('HTTP ' + r.status); return { ok:true };
    }},
    { id: 'gemini',   hasKey: !!cfg.geminiKey,   test: async function() {
        if (!cfg.geminiKey) return { ok:false, reason:'No API key' };
        var r = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key='+cfg.geminiKey, { signal: AbortSignal.timeout(4000) });
        if (!r.ok) throw new Error('HTTP ' + r.status); return { ok:true };
    }},
  ];

  var firstLive = null;
  for (var i = 0; i < probes.length; i++) {
    var p = probes[i];
    try {
      var result = await p.test();
      if (result.ok) {
        if (!firstLive) firstLive = p.id;
      } else if (result.reason !== 'No API key' && p.hasKey) {
        if (typeof toast === 'function') toast('AI probe: ' + p.id.toUpperCase() + ' — ' + result.reason, 'warn', 4000);
      }
    } catch(e) {
      if (p.hasKey) {
        if (typeof toast === 'function') toast('AI probe: ' + p.id.toUpperCase() + ' failed — ' + (e.message||'?').slice(0,40), 'warn', 4000);
      }
    }
  }

  var saved = localStorage.getItem('nx6_last_provider');
  if (!saved && firstLive) {
    localStorage.setItem('nx6_last_provider', firstLive);
    if (typeof AI !== 'undefined') AI.provider = firstLive;
    if (typeof setPill === 'function') setPill('pill-ai', 'ok', firstLive.toUpperCase());
    if (typeof toast === 'function') toast('AI: ' + firstLive.toUpperCase() + ' auto-selected (first live)', 'ok', 3000);
    _guardianLogDiag('✓ AI auto-selected: ' + firstLive, 'var(--g)');
  }
  return firstLive;
}
window.aiProbeAll = aiProbeAll;

/* ── § 10 CALLTO RENDERING ──────────────────────────────────────────── */

function _guardianRenderCalltoList() {
  var list = document.getElementById('guardian-callto-list');
  if (!list) return;
  if (!GUARDIAN.calltos.length) {
    list.innerHTML = '<div style="color:var(--text3);font-size:9px;padding:8px 0;text-align:center">No calltos yet — use the Firefox extension to pick elements</div>';
    return;
  }
  list.innerHTML = GUARDIAN.calltos.slice(0, 30).map(function(c) {
    return '<div style="padding:5px 8px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:6px;cursor:pointer" onclick="guardianHookToConsole(\'' + c.id + '\')">' +
      '<div style="width:5px;height:5px;border-radius:50%;background:var(--g);flex-shrink:0;box-shadow:0 0 4px rgba(0,255,136,.5)"></div>' +
      '<span style="font-family:var(--mono);font-size:9px;color:var(--c);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (c.selector || c.id) + '</span>' +
      '<span style="font-size:8px;color:var(--text3)">' + (c.action || 'click') + '</span></div>';
  }).join('');
}

function _guardianRenderCaptureFeed() {
  var feed = document.getElementById('guardian-captures-feed');
  if (!feed) return;
  feed.innerHTML = GUARDIAN.calltos.slice(0, 5).map(function(c) {
    return '<div style="display:flex;align-items:center;gap:5px;padding:2px 0;font-size:9px">' +
      '<div style="width:4px;height:4px;border-radius:50%;background:var(--c);flex-shrink:0"></div>' +
      '<span style="color:var(--c);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;font-family:var(--mono)">' + (c.selector || c.id) + '</span></div>';
  }).join('');
}

async function guardianCalltoRefresh() {
  var r = await _guardianFetch('/userscript/callto');
  if (r && r.calltos) {
    GUARDIAN.calltos = r.calltos;
    _guardianRenderCalltoList();
    _guardianRenderCaptureFeed();
    guardianUpdateCalltoCount();
  }
}
window.guardianCalltoRefresh = guardianCalltoRefresh;

function guardianCalltoExport() {
  var a = document.createElement('a');
  a.href = 'data:application/json,' + encodeURIComponent(JSON.stringify(GUARDIAN.calltos, null, 2));
  a.download = 'nexus-calltos-' + Date.now() + '.json';
  a.click();
}
window.guardianCalltoExport = guardianCalltoExport;

function guardianHookToConsole(calltoId) {
  var ct = GUARDIAN.calltos.find(function(c) { return c.id === calltoId; });
  if (!ct) { if (typeof toast === 'function') toast('Callto not found: ' + calltoId, 'warn'); return; }
  var msg = 'Execute callto: ' + (ct.label || ct.id) + '\nSelector: ' + ct.selector + '\nAction: ' + ct.action + '\nURL: ' + ct.url;
  var inp = document.getElementById('console-input') || document.getElementById('chat-input');
  if (inp) { inp.value = msg; inp.dispatchEvent(new Event('input')); }
}
window.guardianHookToConsole = guardianHookToConsole;

/* ── § 11 DIAGNOSTICS ───────────────────────────────────────────────── */

async function guardianDiagRun(testName) {
  var el = document.getElementById('gtest-' + testName) || document.getElementById('gdtst-' + testName);
  function setR(cls, msg) {
    if (el) { el.textContent = msg; el.style.color = cls==='ok'?'var(--g)':cls==='warn'?'var(--y)':'var(--r)'; }
    _guardianLogDiag('[' + testName.toUpperCase() + '] ' + msg, cls==='ok'?'var(--g)':cls==='warn'?'var(--y)':'var(--r)');
    return { cls:cls, msg:msg };
  }
  if (el) { el.textContent = '…'; el.style.color = 'var(--y)'; }

  try {
    // ── bridge ── independent: direct fetch, no token needed
    if (testName === 'bridge') {
      var t0 = performance.now();
      var r = await _guardianFetch('/health', 'GET', null, 3000);
      var ms = Math.round(performance.now()-t0);
      return r ? setR('ok','PASS · '+ms+'ms · v'+(r.version||'?')) : setR('danger','OFFLINE');
    }

    // ── handshake ── independent: always runs fresh
    if (testName === 'handshake') {
      GUARDIAN.sessionToken = null; // force fresh
      var ok = await guardianHandshake();
      return ok ? setR('ok','PASS · token issued') : setR('danger','FAIL · bridge offline?');
    }

    // ── token ── independent: runs its own handshake if no token
    if (testName === 'token') {
      if (!GUARDIAN.sessionToken) {
        var hsOk = await guardianHandshake();
        if (!hsOk) return setR('danger','NO TOKEN — handshake failed');
      }
      var r2 = await _guardianFetch('/guardian/heartbeat','POST',{token:GUARDIAN.sessionToken});
      return r2&&r2.ok ? setR('ok','VALID · TTL refreshed') : setR('danger','INVALID / EXPIRED');
    }

    // ── pulse ── independent: sends its own pulse
    if (testName === 'pulse') {
      var t1=performance.now();
      var r3=await _guardianFetch('/pulse','POST',{
        type:'guardian:pulse', instanceId:GUARDIAN.instanceId,
        logicalId:'guardian', ts:Date.now(),
        capabilities:['callto'], version:'3.4.0'
      });
      var ms2=Math.round(performance.now()-t1);
      if (r3&&r3.ok) {
        GUARDIAN.discoveredNodes=r3.nodes||[];
        return setR('ok','PASS · '+(r3.nodes||[]).length+' node(s) · '+ms2+'ms');
      }
      return setR('danger','FAIL');
    }

    // ── bc ── independent: checks BroadcastChannel state
    if (testName === 'bc') {
      var stale = !GUARDIAN.lastHB || (Date.now()-GUARDIAN.lastHB)>30000;
      if (GUARDIAN._bc && !stale) return setR('ok','LIVE · '+Math.round((Date.now()-GUARDIAN.lastHB)/1000)+'s ago');
      if (GUARDIAN._bc) return setR('warn','OPEN — no recent msg');
      return setR('warn','BC N/A in Electron — using pulse registry');
    }

    // ── callto ── independent
    if (testName === 'callto') {
      var r4=await _guardianFetch('/userscript/callto');
      if (r4&&r4.calltos) {
        GUARDIAN.calltos=r4.calltos;
        guardianUpdateCalltoCount();
        return setR('ok','PASS · '+r4.calltos.length+' callto(s)');
      }
      return setR('warn','BRIDGE OFFLINE');
    }

    // ── hooks ── independent
    if (testName === 'hooks') {
      var r5=await _guardianFetch('/guardian/agent-hooks');
      if (r5&&r5.hooks) return setR('ok','PASS · '+Object.keys(r5.hooks).length+' hook(s)');
      return setR('warn','NO HOOKS');
    }

    // ── bus ── independent
    if (testName === 'bus') {
      var r6=await _guardianFetch('/bus/emit','POST',{
        type:'nexus.diag.guardian.ping', ts:Date.now(), instanceId:GUARDIAN.instanceId
      });
      return r6!==null ? setR('ok','PASS') : setR('danger','FAIL');
    }

    // ── version ── independent: checks actual running bridge version
    if (testName === 'version') {
      var r7=await _guardianFetch('/health');
      if (!r7) return setR('danger','BRIDGE OFFLINE');
      // Accept any 3.x version — don't hardcode
      var major = parseInt((r7.version||'').split('.')[0]);
      return major >= 3 ? setR('ok','PASS · v'+r7.version) : setR('warn','OLD · v'+r7.version);
    }

    // ── instance ── independent: local check only
    if (testName === 'instance') {
      var id=GUARDIAN.instanceId;
      var valid=id && /^guardian-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      return valid ? setR('ok','VALID · '+_guardianShortId(id)) : setR('danger','INVALID: '+(id||'null'));
    }

    // ── jitter ── integrated from standalone function
    if (testName === 'jitter') {
      var rtts=[];
      for (var ji=0; ji<GUARDIAN.PING_SAMPLES; ji++) {
        var jt0=performance.now(), jr=await _guardianFetch('/health','GET',null,2000);
        if (jr) rtts.push(Math.round(performance.now()-jt0));
        await new Promise(function(res){ setTimeout(res,50); });
      }
      if (!rtts.length) return setR('danger','NO RESPONSE');
      var avg=Math.round(rtts.reduce(function(a,b){return a+b;},0)/rtts.length);
      var jit=Math.round(Math.sqrt(rtts.map(function(r){return Math.pow(r-avg,2);}).reduce(function(a,b){return a+b;},0)/rtts.length));
      GUARDIAN.rttHistory=(GUARDIAN.rttHistory||[]).concat(rtts).slice(-GUARDIAN.RTT_HISTORY_CAP);
      _guardianDrawSparkline();
      return jit<30 ? setR('ok','PASS · jitter='+jit+'ms avg='+avg+'ms') : setR('warn','HIGH · jitter='+jit+'ms avg='+avg+'ms');
    }

    // ── fidelity ── integrated from standalone function
    if (testName === 'fidelity') {
      var passed=0, sentinel='nx-echo-'+Date.now();
      for (var fi=0; fi<GUARDIAN.FIDELITY_ROUNDS; fi++) {
        var fr=await _guardianFetch('/bus/emit','POST',{type:'nexus.diag.echo',sentinel:sentinel+'-'+fi,ts:Date.now()});
        if (fr!==null) passed++;
        await new Promise(function(res){ setTimeout(res,40); });
      }
      var score=Math.round((passed/GUARDIAN.FIDELITY_ROUNDS)*100);
      return score>=90 ? setR('ok','PASS · '+score+'% ('+passed+'/'+GUARDIAN.FIDELITY_ROUNDS+')') : setR('warn',score+'% ('+passed+'/'+GUARDIAN.FIDELITY_ROUNDS+')');
    }

    return setR('warn','UNKNOWN TEST: '+testName);
  } catch(e) {
    return setR('danger','ERR: '+(e.message||'?').slice(0,40));
  }
}
window.guardianDiagRun = guardianDiagRun;

async function guardianRunTests() {
  var log = document.getElementById('guardian-adv-diag-log');
  if (log) log.innerHTML = '';
  _guardianLogDiag('▶ Guardian diagnostic suite started…', 'var(--c)');
  var tests = ['bridge','handshake','token','pulse','bc','callto','hooks','bus','version','instance','jitter','fidelity'];
  var pass=0, fail=0;
  for (var i=0; i<tests.length; i++) {
    var r = await guardianDiagRun(tests[i]);
    await new Promise(function(res){ setTimeout(res,80); });
    if (r.cls==='ok') pass++; else if (r.cls==='danger') fail++;
  }
  _guardianLogDiag('✓ Suite complete: '+pass+' pass / '+fail+' fail', fail===0?'var(--g)':'var(--y)');
  var badge = document.getElementById('guardian-diag-badge');
  if (badge) { badge.textContent = pass+'/'+tests.length; badge.style.color = fail===0?'var(--g)':'var(--y)'; }
  return { pass:pass, fail:fail, total:tests.length };
}
window.guardianRunTests = guardianRunTests;

/* ── § 12 JITTER + FIDELITY ─────────────────────────────────────────── */

async function guardianDiagJitter() {
  var rtts=[];
  for (var i=0; i<GUARDIAN.PING_SAMPLES; i++) {
    var t0=performance.now(), r=await _guardianFetch('/health','GET',null,2000);
    if (r) rtts.push(Math.round(performance.now()-t0));
    await new Promise(function(res){ setTimeout(res,50); });
  }
  if (!rtts.length) { _guardianLogDiag('✗ Jitter: no responses','var(--r)'); return; }
  var avg=Math.round(rtts.reduce(function(a,b){return a+b;},0)/rtts.length);
  var jit=Math.round(Math.sqrt(rtts.map(function(r){return Math.pow(r-avg,2);}).reduce(function(a,b){return a+b;},0)/rtts.length));
  GUARDIAN.rttHistory = GUARDIAN.rttHistory.concat(rtts).slice(-GUARDIAN.RTT_HISTORY_CAP);
  var jEl=document.getElementById('gdiag-jitter'), rEl=document.getElementById('gdiag-rtt-avg');
  if (jEl) { jEl.textContent=jit+'ms'; jEl.style.color=jit<10?'var(--g)':jit<30?'var(--y)':'var(--r)'; }
  if (rEl) { rEl.textContent=avg+'ms'; rEl.style.color=avg<50?'var(--g)':avg<150?'var(--y)':'var(--r)'; }
  _guardianLogDiag('✓ Jitter: '+jit+'ms · avg RTT: '+avg+'ms ('+rtts.length+' samples)','var(--g)');
  _guardianDrawSparkline();
}
window.guardianDiagJitter = guardianDiagJitter;

async function guardianDiagFidelity() {
  var passed=0, sentinel='nx-echo-'+Date.now();
  for (var i=0; i<GUARDIAN.FIDELITY_ROUNDS; i++) {
    var r=await _guardianFetch('/bus/emit','POST',{type:'nexus.diag.echo',sentinel:sentinel+'-'+i,ts:Date.now()});
    if (r!==null) passed++;
    await new Promise(function(res){ setTimeout(res,40); });
  }
  var score=Math.round((passed/GUARDIAN.FIDELITY_ROUNDS)*100);
  var fEl=document.getElementById('gdiag-fidelity');
  if (fEl) { fEl.textContent=score+'%'; fEl.style.color=score>=90?'var(--g)':score>=60?'var(--y)':'var(--r)'; }
  _guardianLogDiag('✓ Fidelity: '+score+'% ('+passed+'/'+GUARDIAN.FIDELITY_ROUNDS+' rounds)', score>=90?'var(--g)':'var(--y)');
}
window.guardianDiagFidelity = guardianDiagFidelity;

function _guardianDrawSparkline() {
  var canvas=document.getElementById('gdiag-sparkline');
  if (!canvas||!GUARDIAN.rttHistory.length) return;
  var ctx=canvas.getContext('2d'), W=canvas.width, H=canvas.height;
  ctx.clearRect(0,0,W,H);
  var data=GUARDIAN.rttHistory.slice(-40), max=Math.max.apply(null,data.concat([1]));
  ctx.strokeStyle='rgba(0,212,255,.8)'; ctx.lineWidth=1.5; ctx.beginPath();
  data.forEach(function(v,i){ var x=(i/(data.length-1))*W, y=H-(v/max)*(H-4)-2; i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
  ctx.stroke();
}

/* ── § 13 HOOK GENERATOR ────────────────────────────────────────────── */

function guardianGenerateHook() {
  var agentId  = (document.getElementById('hook-agent-select')||{}).value   || 'chatgpt';
  var calltoId = (document.getElementById('hook-callto-select')||{}).value  || '';
  var intent   = (document.getElementById('hook-intent-select')||{}).value  || 'chat';
  var label    = ((document.getElementById('hook-label-input')||{}).value||'').trim();
  if (!calltoId) { if (typeof toast==='function') toast('Select a callto first','warn'); return; }
  var hookId = 'hook:'+agentId+':'+Date.now().toString(36);
  var hook   = { hookId:hookId, agentId:agentId, calltoId:calltoId, intent:intent, label:label, ts:Date.now() };
  GUARDIAN.hooks.unshift(hook);
  if (GUARDIAN.hooks.length>100) GUARDIAN.hooks.pop();
  localStorage.setItem('nx_guardian_hooks', JSON.stringify(GUARDIAN.hooks));
  guardianMirrorAgentHook(agentId, calltoId, intent);
  var out=document.getElementById('hook-output');
  if (out) { out.textContent=JSON.stringify(hook,null,2); out.style.display='block'; }
  if (typeof toast==='function') toast('Hook generated: '+hookId,'ok');
}
window.guardianGenerateHook = guardianGenerateHook;

/* ── § 14 DIAG LOG ──────────────────────────────────────────────────── */

function _guardianLogDiag(msg, color) {
  color = color || 'var(--text2)';
  var log = document.getElementById('guardian-adv-diag-log');
  if (!log) return;
  var ts = new Date().toTimeString().slice(0,8);
  var line = document.createElement('div');
  line.style.color = color;
  line.textContent = '['+ts+'] '+msg;
  log.appendChild(line);
  log.scrollTop = log.scrollHeight;
}

/* ── § 15 INIT ──────────────────────────────────────────────────────── */

async function guardianInit() {
  GUARDIAN.instanceId = _guardianInstanceId();
  _guardianInitBC();
  await guardianHandshake();
  await guardianCalltoRefresh();
  guardianPulseStart();

  GUARDIAN._pollTimer = setInterval(async function() {
    var r = await _guardianFetch('/guardian/status');
    if (r) {
      GUARDIAN.connected = r.connected;
      GUARDIAN.sessions  = r.sessions || 0;
      GUARDIAN.lastHB    = Date.now();
      if (r.nodes) GUARDIAN.discoveredNodes = r.nodes;
      _guardianUpdateStatusUI();
    }
  }, 8000);

  setTimeout(aiProbeAll, 2000);
  _guardianUpdateStatusUI();
  _guardianLogDiag('Guardian v3.4.0 init · id: '+_guardianShortId(GUARDIAN.instanceId), 'var(--c)');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', guardianInit);
} else {
  setTimeout(guardianInit, 100);
}


/* ── § 16 ALIASES ─────────────────────────────────────────────────────── */

function guardianSaveAgentHook(agentId, calltoId, intent) {
  var hooks = {};
  try { hooks = JSON.parse(localStorage.getItem('nx_guardian_agent_hooks') || '{}'); } catch(e) {}
  hooks[agentId] = { calltoId: calltoId||'', intent: intent||'chat', ts: Date.now() };
  localStorage.setItem('nx_guardian_agent_hooks', JSON.stringify(hooks));
  guardianMirrorAgentHook(agentId, calltoId, intent);
}
window.guardianSaveAgentHook = guardianSaveAgentHook;
window.guardianRunTests     = guardianDiagRun;
window.guardianRunTest      = guardianDiagRun;

/* ── § 17 NSM SERVICE STATUS ──────────────────────────────────────────── */

function nxServiceStatus() {
  _guardianFetch('/service-status').then(function(d) {
    if (!d) return;
    var el = document.getElementById('nx-svc-badge');
    if (!el) return;
    el.textContent = d.installed
      ? (d.running ? 'SERVICE · running' : 'SERVICE · stopped · start it')
      : 'IN-PROCESS · up ' + Math.round(d.uptimeMs/1000) + 's';
    el.style.color = d.running ? 'var(--g)' : d.installed ? 'var(--y)' : 'var(--c)';
  }).catch(function(){});
}
window.nxServiceStatus = nxServiceStatus;

/* ── § 18 CONSOLE + BUILDER WIRING ───────────────────────────────────── */

var _consoleWiring = (function() {
  try { return JSON.parse(localStorage.getItem('nx_console_wiring') || '{}'); } catch { return {}; }
})();
var _builderWiring = (function() {
  try { return JSON.parse(localStorage.getItem('nx_builder_wiring') || '{}'); } catch { return {}; }
})();

function _populateCalltoSelect(selectId, currentVal) {
  var sel = document.getElementById(selectId);
  if (!sel) return;
  var calltos = (typeof GUARDIAN !== 'undefined' ? GUARDIAN.calltos : []) || [];
  var prev = currentVal || sel.value;
  sel.innerHTML = '<option value="">— select callto —</option>' +
    calltos.map(function(ct) {
      var host = '';
      try { host = new URL(ct.url || '').hostname; } catch {}
      var label = (ct.label || ct.id) + (host ? ' · ' + host : '');
      return '<option value="' + ct.id + '"' + (ct.id === prev ? ' selected' : '') + '>' + label + '</option>';
    }).join('');
}

function _populateAgentStatus(statusId, agentId) {
  var el = document.getElementById(statusId);
  if (!el) return;
  var hooks = {};
  try { hooks = JSON.parse(localStorage.getItem('nx_guardian_agent_hooks') || '{}'); } catch {}
  var hook = hooks[agentId];
  if (hook && hook.calltoId) {
    el.textContent = '⟁ hooked · ' + hook.calltoId.slice(0, 10) + '…';
    el.style.color = 'var(--g)';
  } else {
    el.textContent = 'no hook — assign in AI AGENTS';
    el.style.color = 'var(--text4)';
  }
}

window.consoleWiringModeChange = function(mode) {
  var gf = document.getElementById('opt-console-guardian-fields');
  var of = document.getElementById('opt-console-ollama-fields');
  var af = document.getElementById('opt-console-api-fields');
  if (gf) gf.style.display = mode === 'guardian' ? '' : 'none';
  if (of) of.style.display = mode === 'ollama'   ? '' : 'none';
  if (af) af.style.display = mode === 'api'       ? '' : 'none';
  _consoleWiring.mode = mode;
  localStorage.setItem('nx_console_wiring', JSON.stringify(_consoleWiring));
};

window.consoleAgentChange = function(agentId) {
  _consoleWiring.agentId = agentId;
  _populateAgentStatus('opt-console-agent-status', agentId);
};

window.consoleWiringRefreshCalltos = function() {
  guardianCalltoRefresh().then(function() {
    _populateCalltoSelect('opt-console-input-callto', _consoleWiring.inputCalltoId);
    _populateCalltoSelect('opt-console-output-callto', _consoleWiring.outputCalltoId);
    if (typeof toast === 'function') toast('Calltos refreshed · ' + (GUARDIAN.calltos.length) + ' available', 'ok');
  });
};

window.consoleWiringSave = function() {
  var agent  = (document.getElementById('opt-console-agent') || {}).value || '';
  var input  = (document.getElementById('opt-console-input-callto') || {}).value || '';
  var output = (document.getElementById('opt-console-output-callto') || {}).value || '';
  var intent = (document.getElementById('opt-console-intent') || {}).value || 'chat';
  var mode   = (document.getElementById('opt-console-mode') || {}).value || 'guardian';
  if (mode === 'guardian' && !input) { if (typeof toast === 'function') toast('Select an input callto first', 'warn'); return; }
  _consoleWiring = { mode, agentId: agent, inputCalltoId: input, outputCalltoId: output, intent };
  localStorage.setItem('nx_console_wiring', JSON.stringify(_consoleWiring));
  if (agent && input) guardianMirrorAgentHook(agent, input, intent);
  var prev = document.getElementById('opt-console-wiring-preview');
  var det  = document.getElementById('opt-console-wiring-detail');
  var stat = document.getElementById('opt-console-wiring-status');
  if (prev) prev.style.display = '';
  if (det) det.innerHTML = '<div>MODE: <span style="color:var(--g)">' + mode + '</span></div>'
    + (agent  ? '<div>AGENT: <span style="color:var(--c)">' + agent + '</span></div>' : '')
    + (input  ? '<div>INPUT: <span style="color:var(--y)">' + input.slice(0,20) + '…</span></div>' : '')
    + (output ? '<div>OUTPUT: <span style="color:var(--m)">' + output.slice(0,20) + '…</span></div>' : '')
    + '<div>INTENT: <span style="color:var(--text2)">' + intent + '</span></div>';
  if (stat) { stat.textContent = '✓ saved'; stat.style.color = 'var(--g)'; setTimeout(function(){ stat.textContent=''; }, 3000); }
  if (typeof toast === 'function') toast('Console wiring saved — ' + (mode === 'guardian' ? 'Guardian via ' + agent : mode), 'ok');
  _updateConsoleGuardianStrip();
};

window.builderAgentChange = function(agentId) { _builderWiring.agentId = agentId; _populateAgentStatus('opt-builder-agent-status', agentId); };
window.builderWiringRefreshCalltos = function() { guardianCalltoRefresh().then(function() { _populateCalltoSelect('opt-builder-input-callto', _builderWiring.inputCalltoId); _populateCalltoSelect('opt-builder-output-callto', _builderWiring.outputCalltoId); }); };
window.builderWiringSave = function() {
  var agent  = (document.getElementById('opt-builder-agent') || {}).value || '';
  var input  = (document.getElementById('opt-builder-input-callto') || {}).value || '';
  var output = (document.getElementById('opt-builder-output-callto') || {}).value || '';
  _builderWiring = { agentId: agent, inputCalltoId: input, outputCalltoId: output };
  localStorage.setItem('nx_builder_wiring', JSON.stringify(_builderWiring));
  if (agent && input) guardianMirrorAgentHook(agent, input, 'code');
  var stat = document.getElementById('opt-builder-wiring-status');
  if (stat) { stat.textContent = '✓ saved'; stat.style.color = 'var(--g)'; setTimeout(function(){ stat.textContent=''; }, 3000); }
  if (typeof toast === 'function') toast('Builder wiring saved', 'ok');
};
window.getConsoleWiring = function() { return _consoleWiring; };
window.getBuilderWiring = function() { return _builderWiring; };

/* ── § 19 THINKING BAR ────────────────────────────────────────────────── */

(function() {
  var _thinkingTimer = null;
  var _thinkingStart = 0;
  function showThinkingBar(provider) {
    var bar  = document.getElementById('console-thinking-bar');
    var text = document.getElementById('console-thinking-text');
    var prov = document.getElementById('console-thinking-provider');
    var dots = document.getElementById('console-thinking-dots');
    var elps = document.getElementById('console-thinking-elapsed');
    if (!bar) return;
    bar.style.display = 'flex';
    _thinkingStart = Date.now();
    if (prov) prov.textContent = provider ? '· ' + provider.toUpperCase() : '';
    var dotStates = ['⟡', '⟡ ⟡', '⟡ ⟡ ⟡', '⟡ ⟡'];
    var dotIdx = 0;
    clearInterval(_thinkingTimer);
    _thinkingTimer = setInterval(function() {
      if (dots) dots.textContent = dotStates[dotIdx % dotStates.length];
      dotIdx++;
      var s = Math.floor((Date.now() - _thinkingStart) / 1000);
      if (elps) elps.textContent = s + 's';
      if (text) text.textContent = s > 30 ? 'Still working… (' + s + 's)' : s > 10 ? 'Processing…' : 'Thinking…';
    }, 400);
  }
  function hideThinkingBar() {
    clearInterval(_thinkingTimer);
    var bar = document.getElementById('console-thinking-bar');
    if (bar) bar.style.display = 'none';
  }
  var _obs = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      if (m.type === 'attributes' && m.attributeName === 'data-loading') {
        var loading = document.body.dataset.loading === 'true';
        if (loading) showThinkingBar((typeof AI !== 'undefined' ? AI.provider : '') || '');
        else hideThinkingBar();
      }
    });
  });
  _obs.observe(document.body, { attributes: true, attributeFilter: ['data-loading'] });
  window._showThinkingBar = showThinkingBar;
  window._hideThinkingBar = hideThinkingBar;
})();

/* ── § 20 STARTUP TOASTS ──────────────────────────────────────────────── */

setTimeout(function() {
  // Dynamic version from Electron
  try {
    if (window.electronAPI && window.electronAPI.invoke) {
      window.electronAPI.invoke('nexus:version').then(function(v) {
        if (!v) return;
        var nxver = document.querySelector('#top-bar .nxver');
        if (nxver) nxver.textContent = 'v' + v;
        var heroSub = document.querySelector('.home-hero-sub');
        if (heroSub) heroSub.textContent = 'v' + v + ' · UNIVERSAL UUID TRACKING · RECURSIVE AUTONOMOUS DEVELOPMENT ENGINE';
      }).catch(function(){});
    }
  } catch(e) {}

  // Ollama toast if selected but not running
  var provider = localStorage.getItem('nx6_last_provider') || '';
  if (provider !== 'ollama') return;
  fetch('http://localhost:11434/api/tags', { signal: AbortSignal.timeout(2000) })
    .then(function(r) {
      if (!r.ok) throw new Error('not ok');
      return r.json();
    })
    .then(function(d) {
      if (!(d.models || []).length && typeof toast === 'function')
        toast('⚠ Ollama running but no models — run: ollama pull deepseek-r1:8b', 'warn', 8000);
    })
    .catch(function() {
      if (typeof toast === 'function')
        toast('⚠ Ollama not running · Start: ollama serve · Or use Guardian mode', 'err', 8000);
    });
}, 4000);

/* ── § 21 CONSOLE GUARDIAN STRIP ─────────────────────────────────────── */

function _updateConsoleGuardianStrip() {
  var strip  = document.getElementById('console-guardian-strip');
  var label  = document.getElementById('console-guardian-agent-label');
  var status = document.getElementById('console-guardian-status');
  if (!strip) return;
  var wiring = {};
  try { wiring = JSON.parse(localStorage.getItem('nx_console_wiring') || '{}'); } catch {}
  var isGuardianMode = wiring.mode === 'guardian';
  strip.style.display = isGuardianMode ? 'flex' : 'none';
  if (isGuardianMode && wiring.agentId && label)
    label.textContent = wiring.agentId.toUpperCase() + (wiring.inputCalltoId ? ' · ' + wiring.inputCalltoId.slice(0, 12) + '…' : ' · no callto');
}

window.guardianConsoleTest = async function() {
  var status = document.getElementById('console-guardian-status');
  var wiring = {};
  try { wiring = JSON.parse(localStorage.getItem('nx_console_wiring') || '{}'); } catch {}
  if (!wiring.inputCalltoId) { if (typeof toast === 'function') toast('⚠ No input callto wired', 'warn', 5000); return; }
  if (status) { status.textContent = 'testing…'; status.style.color = 'var(--y)'; }
  try {
    var r = await fetch('http://127.0.0.1:3747/v1/messages', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ provider:'guardian', agentId: wiring.agentId || 'chatgpt', messages:[{role:'user',content:'Hello. Reply: GUARDIAN TEST OK'}], intent: wiring.intent||'chat' }),
      signal: AbortSignal.timeout(8000),
    });
    var d = await r.json();
    if (r.status === 202) {
      if (status) { status.textContent = '✓ dispatched → ' + (wiring.agentId||'agent'); status.style.color = 'var(--g)'; }
      if (typeof toast === 'function') toast('✓ Test dispatched to Guardian → ' + (wiring.agentId||'chatgpt'), 'ok', 4000);
    } else {
      if (status) { status.textContent = '✗ ' + (d.error||r.status); status.style.color = 'var(--r)'; }
      if (typeof toast === 'function') toast('✗ ' + (d.hint||d.error||r.status), 'err', 6000);
    }
  } catch(e) {
    if (status) { status.textContent = '✗ ' + e.message.slice(0,30); status.style.color = 'var(--r)'; }
  }
  setTimeout(function() { if (status) status.textContent = ''; }, 4000);
};

window.guardianConsoleTestEcho = async function() {
  var status = document.getElementById('console-guardian-status');
  if (status) { status.textContent = 'echo…'; status.style.color = 'var(--c)'; }
  try {
    var r = await fetch('http://127.0.0.1:3747/health', { signal: AbortSignal.timeout(3000) });
    var d = await r.json();
    if (d.ok) {
      if (status) { status.textContent = '✓ bridge v' + d.version; status.style.color = 'var(--g)'; }
      if (typeof toast === 'function') toast('✓ Bridge v' + d.version + ' · Guardian callto pipeline ready', 'ok', 3000);
    }
  } catch(e) {
    if (status) { status.textContent = '✗ bridge offline'; status.style.color = 'var(--r)'; }
  }
  setTimeout(function() { if (status) status.textContent = ''; }, 3000);
};

window.guardianConsoleRefreshCalltos = function() {
  if (typeof consoleWiringRefreshCalltos === 'function') consoleWiringRefreshCalltos();
  _updateConsoleGuardianStrip();
};

/* ── § 22 GUARDIAN OUTPUT SSE CALLBACK ───────────────────────────────── */

(function() {
  var _sseConn = null, _sseRetryTimer = null;
  function _connectSSE() {
    if (_sseConn) return;
    var bridgeUrl = (typeof GUARDIAN !== 'undefined' ? GUARDIAN.BRIDGE_URL : null) || 'http://127.0.0.1:3747';
    try {
      _sseConn = new EventSource(bridgeUrl + '/events');
      _sseConn.addEventListener('message', function(e) {
        try {
          var d = JSON.parse(e.data);
          if (d.type === 'guardian.link.event' || d.type === 'guardian:ai:response') {
            var text = d.text || d.response || d.payload?.text || (d.event && (d.event.text || d.event.value));
            if (!text) return;
            if (typeof appendMsg === 'function') appendMsg('assistant', '[Guardian] ' + text);
            if (typeof _guardianLogDiag === 'function') _guardianLogDiag('↩ ' + text.slice(0,60), 'var(--g)');
            if (typeof toast === 'function') toast('⟁ Response: ' + text.slice(0,50), 'ok', 4000);
          }
        } catch(_) {}
      });
      _sseConn.onerror = function() { _sseConn = null; clearTimeout(_sseRetryTimer); _sseRetryTimer = setTimeout(_connectSSE, 8000); };
    } catch(_) {}
  }
  window.addEventListener('beforeunload', function() { if (_sseConn) { _sseConn.close(); _sseConn = null; } });
  window._guardianSSEConnect = _connectSSE;
  setTimeout(_connectSSE, 4000);
})();

/* ── § 23 DIAG AGENT EXEC + OPEN TAB ─────────────────────────────────── */

var AGENT_URLS = { chatgpt:'https://chat.openai.com', claude:'https://claude.ai', deepseek:'https://chat.deepseek.com', gemini:'https://gemini.google.com', grok:'https://x.com/i/grok', ollama:'http://localhost:11434', perplexity:'https://www.perplexity.ai' };

window.diagTestAgentExec = async function() {
  var agentId = (document.getElementById('diag-agent-select') || {}).value || 'chatgpt';
  var resEl   = document.getElementById('diag-agent-result');
  if (resEl) { resEl.textContent = 'testing…'; resEl.style.color = 'var(--y)'; }
  if (typeof _guardianLogDiag === 'function') _guardianLogDiag('Testing agent exec: ' + agentId, 'var(--c)');
  var hooks = {};
  try { hooks = JSON.parse(localStorage.getItem('nx_guardian_agent_hooks') || '{}'); } catch {}
  var hook = hooks[agentId];
  if (!hook || !hook.calltoId) {
    if (resEl) { resEl.textContent = '⚠ no callto hook'; resEl.style.color = 'var(--y)'; }
    if (typeof toast === 'function') toast('⚠ No callto hook for ' + agentId + ' — use ⟁ WIRE INPUT in AI SETTINGS', 'warn', 5000);
    return;
  }
  try {
    var r = await fetch('http://127.0.0.1:3747/v1/messages', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ provider:'guardian', agentId, messages:[{role:'user',content:'NEXUS EXEC TEST — reply: OK'}], intent: hook.intent||'chat' }),
      signal: AbortSignal.timeout(10000),
    });
    var d = await r.json();
    if (r.status === 202) {
      if (resEl) { resEl.textContent = '✓ dispatched'; resEl.style.color = 'var(--g)'; }
      if (typeof _guardianLogDiag === 'function') _guardianLogDiag('['+agentId+'] Exec dispatched · '+hook.calltoId.slice(0,14), 'var(--g)');
      if (typeof toast === 'function') toast('✓ ' + agentId + ' exec dispatched', 'ok', 4000);
    } else {
      if (resEl) { resEl.textContent = '✗ ' + (d.error||r.status).toString().slice(0,35); resEl.style.color = 'var(--r)'; }
      if (typeof toast === 'function') toast('✗ ' + (d.hint||d.error||r.status), 'err', 5000);
    }
  } catch(e) {
    if (resEl) { resEl.textContent = '✗ ' + e.message.slice(0,30); resEl.style.color = 'var(--r)'; }
  }
  setTimeout(function() { if (resEl) resEl.textContent = ''; }, 6000);
};

window.diagOpenAgentTab = function() {
  var agentId = (document.getElementById('diag-agent-select') || {}).value || 'chatgpt';
  var url = AGENT_URLS[agentId];
  if (!url) { if (typeof toast === 'function') toast('No URL for ' + agentId, 'warn'); return; }
  if (window.electronAPI && window.electronAPI.openExternal) window.electronAPI.openExternal(url);
  else window.open(url, '_blank', 'noopener');
  if (typeof toast === 'function') toast('⬡ Opening ' + agentId + ': ' + url, 'ok', 3000);
  if (typeof _guardianLogDiag === 'function') _guardianLogDiag('Opening ' + agentId + ' → ' + url, 'var(--c)');
};

/* ── § 24 CONSOLE BAR ─────────────────────────────────────────────────── */

(function() {
  function gcRefreshCalltos() {
    var sel = document.getElementById('gc-callto-select');
    if (!sel) return;
    var calltos = (typeof GUARDIAN !== 'undefined' ? GUARDIAN.calltos : []) || [];
    var prev = sel.value;
    sel.innerHTML = '<option value="">— none —</option>' + calltos.map(function(ct) {
      var host = ''; try { host = new URL(ct.url||'').hostname; } catch(_) {}
      return '<option value="'+ct.id+'"'+(ct.id===prev?' selected':'')+'>'+(ct.label||ct.id).slice(0,20)+(host?' · '+host:'')+'</option>';
    }).join('');
  }
  function gcUpdateDot() {
    var dot = document.getElementById('gc-dot');
    var connected = typeof GUARDIAN !== 'undefined' && GUARDIAN.connected;
    if (dot) { dot.style.background = connected ? 'var(--g)' : 'var(--text4)'; dot.style.boxShadow = connected ? '0 0 6px var(--g)' : 'none'; }
  }
  window.gcInjectCalltoToSystemPrompt = function() {
    var ctId = (document.getElementById('gc-callto-select')||{}).value;
    if (!ctId) { if (typeof toast === 'function') toast('Select a callto first', 'warn'); return; }
    var ct = ((typeof GUARDIAN !== 'undefined' ? GUARDIAN.calltos : [])||[]).find(function(c){return c.id===ctId;});
    if (!ct) return;
    var sysEl = document.getElementById('opt-console-system-prompt') || document.getElementById('console-system-prompt');
    if (sysEl) { sysEl.value = (sysEl.value||'') + '\n[Guardian callto: '+ct.selector+' · '+(ct.url||'')+']'; if (typeof toast==='function') toast('Callto injected into system prompt','ok'); }
  };
  window.gcOpenChatTarget = function() {
    var target = (document.getElementById('gc-api-target')||{}).value;
    var customUrl = (document.getElementById('gc-custom-url')||{}).value;
    var url = customUrl || AGENT_URLS[target] || 'https://chatgpt.com';
    if (window.electronAPI && window.electronAPI.openExternal) window.electronAPI.openExternal(url);
    else window.open(url,'_blank','noopener');
    if (typeof toast==='function') toast('⬡ Opening: '+url,'ok',3000);
  };
  window.gcSendToChat = async function() {
    var input = document.getElementById('console-input');
    var text = input ? input.value.trim() : '';
    if (!text) { if (typeof toast==='function') toast('Type a message first','warn'); return; }
    var target = (document.getElementById('gc-api-target')||{}).value || '';
    var ctId = (document.getElementById('gc-callto-select')||{}).value || '';
    var status = document.getElementById('gc-status');
    if (ctId) {
      if (status) { status.textContent='sending…'; status.style.color='var(--y)'; }
      try {
        var wiring = {}; try { wiring = JSON.parse(localStorage.getItem('nx_console_wiring')||'{}'); } catch{}
        var r = await fetch('http://127.0.0.1:3747/v1/messages',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({provider:'guardian',agentId:target||wiring.agentId||'chatgpt',messages:[{role:'user',content:text}],intent:'chat'}), signal:AbortSignal.timeout(8000) });
        var d = await r.json();
        if (r.status===202) { if (status){status.textContent='✓ sent';status.style.color='var(--g)';} if (typeof toast==='function') toast('✓ Sent via Guardian','ok',3000); if (input) input.value=''; }
        else { if (status){status.textContent='✗ '+(d.error||r.status);status.style.color='var(--r)';} if (typeof toast==='function') toast('✗ '+(d.hint||d.error||r.status),'err',5000); }
      } catch(e) { if (status){status.textContent='✗ '+e.message.slice(0,20);status.style.color='var(--r)';} }
      setTimeout(function(){if(status)status.textContent='';},3000);
    } else {
      gcOpenChatTarget();
      try { await navigator.clipboard.writeText(text); if (typeof toast==='function') toast('Text copied — paste into the AI tab','ok',4000); } catch(_) {}
    }
  };
  window.gcApiTargetChange = function(value) {
    var ci = document.getElementById('gc-custom-url'); if(ci) ci.style.display=value==='custom'?'block':'none';
  };
  setInterval(function(){gcRefreshCalltos();gcUpdateDot();},3000);
  setTimeout(function(){gcRefreshCalltos();gcUpdateDot();},1500);
})();

/* ── SINGLE TAB SWITCH HANDLER (replaces all IIFE wraps) ──────────────── */
/* All tab switch side-effects are in ONE place. No more chain-wrapping.    */

(function() {
  var _coreSwitch = window.switchTab;
  var _coreOptSwitch = window.optSwitchTab;

  window.switchTab = function(name) {
    if (typeof _coreSwitch === 'function') _coreSwitch(name);
    // Guardian side-effects on main tab switch
    if (name === 'console') setTimeout(_updateConsoleGuardianStrip, 300);
  };

  window.optSwitchTab = function(tab, btn) {
    if (typeof _coreOptSwitch === 'function') _coreOptSwitch(tab, btn);

    // Bridge tab — check service status
    if (tab === 'bridge') setTimeout(nxServiceStatus, 300);

    // Console/Builder — populate callto selects + restore wiring state
    if (tab === 'console' || tab === 'builder') {
      setTimeout(function() {
        _populateCalltoSelect('opt-console-input-callto',  _consoleWiring.inputCalltoId);
        _populateCalltoSelect('opt-console-output-callto', _consoleWiring.outputCalltoId);
        _populateCalltoSelect('opt-builder-input-callto',  _builderWiring.inputCalltoId);
        _populateCalltoSelect('opt-builder-output-callto', _builderWiring.outputCalltoId);
        var cm = document.getElementById('opt-console-mode');
        if (cm && _consoleWiring.mode) { cm.value = _consoleWiring.mode; consoleWiringModeChange(_consoleWiring.mode); }
        var ca = document.getElementById('opt-console-agent');
        if (ca && _consoleWiring.agentId) { ca.value = _consoleWiring.agentId; _populateAgentStatus('opt-console-agent-status', _consoleWiring.agentId); }
        var ba = document.getElementById('opt-builder-agent');
        if (ba && _builderWiring.agentId) { ba.value = _builderWiring.agentId; _populateAgentStatus('opt-builder-agent-status', _builderWiring.agentId); }
        if (tab === 'console') _updateConsoleGuardianStrip();
      }, 200);
    }

    // Hooks — render hook index
    if (tab === 'hooks') setTimeout(function() { if (typeof nxtRenderHooks==='function') nxtRenderHooks(); }, 100);

    // Diagnose — refresh stats
    if (tab === 'diagnose') setTimeout(function() { if (typeof nxDiagRefreshStats==='function') nxDiagRefreshStats(); }, 100);
  };
})();


/* -- Crash log viewer ---------------------------------------------------- */
window.nxLoadCrashLog = async function() {
  const out  = document.getElementById('nx-crash-log-output');
  const file = document.getElementById('nx-crash-log-file');
  if (!out) return;
  if (!window.electronAPI?.getCrashLog) {
    out.textContent = 'Crash log not available (non-Electron build).\nCheck browser console for errors.';
    return;
  }
  try {
    const data = await window.electronAPI.getCrashLog();
    if (file) file.textContent = data.file || '';
    if (!data.ring || !data.ring.length) {
      out.textContent = 'No crashes recorded.';
      return;
    }
    out.textContent = data.ring.map(function(e) {
      const time = e.ts ? new Date(e.ts).toISOString().slice(11, 23) : '?';
      const badge = e.level === 'CRITICAL' ? '[CRIT]' : e.level === 'ERROR' ? '[ERR] ' : '[INFO]';
      return badge + ' ' + time + ' ' + (e.source || '?') + ': ' + e.msg +
        (e.detail ? '\n       ' + (e.detail||'').split('\n')[0] : '');
    }).join('\n');
    out.scrollTop = out.scrollHeight;
  } catch(e) {
    out.textContent = 'Error loading crash log: ' + e.message;
  }
};

window.nxClearCrashLog = async function() {
  if (!window.electronAPI?.clearCrashLog) return;
  await window.electronAPI.clearCrashLog();
  const out = document.getElementById('nx-crash-log-output');
  if (out) out.textContent = 'Cleared.';
  if (typeof toast === 'function') toast('Crash log cleared', 'ok', 2000);
};

/* -- Full system diagnostic runner ------------------------------------- */
window.nxRunFullDiag = async function() {
  var btn = document.getElementById('nx-full-diag-btn');
  var out = document.getElementById('nx-crash-log-output');
  var bar = document.getElementById('nx-diag-progress');
  if (!out) return;
  if (btn) { btn.textContent = '⟡ running…'; btn.disabled = true; }
  if (bar) { bar.style.display = 'block'; bar.style.width = '0%'; }
  out.textContent = 'Running full diagnostic…';
  out.style.color = 'var(--c)';

  if (!window.electronAPI?.runFullDiag) {
    out.textContent = 'Full diagnostic requires Electron.\nIn browser mode, check DevTools Console for errors.';
    if (btn) { btn.textContent = '▶ RUN FULL DIAG'; btn.disabled = false; }
    return;
  }

  try {
    var report = await window.electronAPI.runFullDiag();
    if (bar) { bar.style.width = '100%'; setTimeout(function(){ bar.style.display='none'; }, 800); }
    _nxRenderDiagReport(report);
  } catch(e) {
    out.textContent = 'Diagnostic error: ' + e.message;
    out.style.color = 'var(--r)';
  }
  if (btn) { btn.textContent = '▶ RUN FULL DIAG'; btn.disabled = false; }
};

function _nxRenderDiagReport(report) {
  var out = document.getElementById('nx-crash-log-output');
  var badge = document.getElementById('nx-diag-score');
  if (!out) return;

  if (badge) {
    badge.textContent = report.score + ' · ' + report.duration + 'ms';
    badge.style.color = report.fail === 0 ? 'var(--g)' : report.fail <= 2 ? 'var(--y)' : 'var(--r)';
  }

  // Group by category
  var cats = {};
  (report.results || []).forEach(function(r) {
    if (!cats[r.category]) cats[r.category] = [];
    cats[r.category].push(r);
  });

  var lines = [
    '=== NEXUS DIAGNOSTIC REPORT ===',
    'Time: ' + (report.iso || new Date().toISOString()),
    'Score: ' + report.score + ' (' + report.duration + 'ms)',
    'Log: ' + (report.logFile || '?'),
    '',
  ];

  Object.keys(cats).forEach(function(cat) {
    lines.push('── ' + cat.toUpperCase() + ' ──');
    cats[cat].forEach(function(r) {
      var icon = r.status === 'PASS' ? '✓' : '✗';
      var val  = r.status === 'PASS' ? (r.value || '') : ('FAIL: ' + (r.error || '?'));
      lines.push('  ' + icon + ' ' + r.name.padEnd(28) + val.slice(0, 60));
    });
    lines.push('');
  });

  if (report.ring && report.ring.length) {
    lines.push('── RECENT LOG ENTRIES ──');
    report.ring.slice(-10).forEach(function(e) {
      var t = e.iso ? e.iso.slice(11,23) : '?';
      lines.push('  [' + e.level + '] ' + t + ' ' + e.source + ': ' + e.msg.slice(0,70));
    });
  }

  out.textContent = lines.join('\n');
  out.style.color = report.fail === 0 ? 'var(--g)' : 'var(--text2)';

  // Also log to guardian diag
  if (typeof _guardianLogDiag === 'function') {
    _guardianLogDiag('Full diag: ' + report.score + (report.fail ? ' — ' + report.fail + ' failures' : ' — all pass'), report.fail ? 'var(--r)' : 'var(--g)');
  }
}

/* -- Performance metrics panel ------------------------------------------- */
(function() {
  var _metricsHistory = [];  // {ts, heapUsed, rss} — last 60 samples
  var _metricsTimer   = null;
  var _metricsUrl     = null;

  function getBridgeUrl() {
    if (_metricsUrl) return _metricsUrl;
    // Try to get from bridge state
    if (typeof STATE !== 'undefined' && STATE.bridgeUrl) return (_metricsUrl = STATE.bridgeUrl);
    if (typeof GUARDIAN !== 'undefined' && GUARDIAN.bridgeUrl) return (_metricsUrl = GUARDIAN.bridgeUrl);
    return 'http://127.0.0.1:3747';
  }

  window.nxLoadMetrics = async function() {
    var btn = document.getElementById('nx-metrics-btn');
    if (btn) btn.textContent = '⟡';
    try {
      var r = await fetch(getBridgeUrl() + '/metrics', { signal: AbortSignal.timeout(3000) });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      var d = await r.json();
      _updateMetricsUI(d);
    } catch(e) {
      // Bridge not running — get Electron process stats instead
      if (window.electronAPI) {
        try {
          var ni = await window.electronAPI.getNetworkInfo();
          _updateMetricsUI({ process: { pid: ni.pid, uptime: '-' }, _electron: true });
        } catch(_) {}
      }
    } finally {
      if (btn) btn.textContent = '↻ REFRESH';
    }
  };

  function _updateMetricsUI(d) {
    var proc   = d.process || {};
    var bridge = d.bridge  || {};
    var now    = Date.now();

    // Record history sample
    if (proc.heapUsed) {
      _metricsHistory.push({ ts: now, heapUsed: proc.heapUsed, rss: proc.rss || 0 });
      if (_metricsHistory.length > 60) _metricsHistory.shift();
    }

    function set(id, val, warnAbove) {
      var el = document.getElementById(id);
      if (!el) return;
      el.textContent = val === undefined || val === null ? '—' : String(val);
      if (warnAbove !== undefined && typeof val === 'number') {
        el.style.color = val > warnAbove ? 'var(--r)' : val > warnAbove * 0.7 ? 'var(--y)' : 'var(--g)';
      }
    }

    set('nx-m-heap',       proc.heapUsed  ? proc.heapUsed  + ' MB' : '—', 400);
    set('nx-m-heap-total', proc.heapTotal ? proc.heapTotal + ' MB' : '—');
    set('nx-m-rss',        proc.rss       ? proc.rss       + ' MB' : '—', 600);
    set('nx-m-events',     bridge.events  !== undefined ? bridge.events : '—');
    set('nx-m-listeners',  bridge.busListeners !== undefined ? bridge.busListeners : '—',
        bridge.busListeners > 50 ? bridge.busListeners : undefined);
    set('nx-m-uptime',     proc.uptime ? _fmtUptime(proc.uptime) : '—');

    _drawSparkline();
  }

  function _fmtUptime(s) {
    if (s < 60)   return s + 's';
    if (s < 3600) return Math.floor(s/60) + 'm ' + (s%60) + 's';
    return Math.floor(s/3600) + 'h ' + Math.floor((s%3600)/60) + 'm';
  }

  function _drawSparkline() {
    var canvas = document.getElementById('nx-m-sparkline');
    if (!canvas || _metricsHistory.length < 2) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.offsetWidth || 280;
    var H = canvas.offsetHeight || 32;
    canvas.width  = W;
    canvas.height = H;
    ctx.clearRect(0, 0, W, H);

    var vals  = _metricsHistory.map(function(m) { return m.heapUsed; });
    var max   = Math.max.apply(null, vals) || 1;
    var min   = Math.min.apply(null, vals);
    var range = max - min || 1;

    // Draw fill
    ctx.beginPath();
    ctx.moveTo(0, H);
    vals.forEach(function(v, i) {
      var x = (i / (vals.length - 1)) * W;
      var y = H - ((v - min) / range) * (H - 4) - 2;
      if (i === 0) ctx.lineTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0,212,255,0.08)';
    ctx.fill();

    // Draw line
    ctx.beginPath();
    vals.forEach(function(v, i) {
      var x = (i / (vals.length - 1)) * W;
      var y = H - ((v - min) / range) * (H - 4) - 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = max > 400 ? '#ff4466' : max > 200 ? '#ffd700' : '#00d4ff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Max label
    ctx.font = '8px monospace';
    ctx.fillStyle = 'rgba(160,160,192,0.6)';
    ctx.fillText(max + 'MB', 2, 10);
  }

  window.nxMetricsAutoToggle = function(on) {
    if (_metricsTimer) { clearInterval(_metricsTimer); _metricsTimer = null; }
    if (on) {
      nxLoadMetrics();
      _metricsTimer = setInterval(nxLoadMetrics, 5000);
    }
  };

  // Also expose metrics refresh to SSE events from bridge
  if (typeof _guardianOnBusEvent === 'function') {
    // already wired
  }
})();
