// ==UserScript==
// @name         Guardian — Perplexity v10.0
// @namespace    nexus.guardian.perplexity
// @version      10.0.0
// @description  Guardian v10 — Perplexity: protocol parity with Claude/ChatGPT/Gemini
//               v10 (NCP handshake, IndexedDB kernel, SHA-256 dedup, tab-claim, SEAM
//               jobs, intelligence injection, usage detection) built around
//               Perplexity's actual distinctive surface — citations, web grounding,
//               research — not a copy with selectors swapped.
// @author       James Brooks / Nexus
// @match        https://www.perplexity.ai/*
// @match        https://perplexity.ai/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      *
// @run-at       document-idle
// ==/UserScript==

(function () {
'use strict';

// ── Constants ─────────────────────────────────────────────────────────────────
const NCP_URL     = 'http://127.0.0.1:7820';
const NCP_CHANNEL = `${NCP_URL}/channel`;
const NCP_RESULT  = `${NCP_URL}/result`;
const NCP_HB      = `${NCP_URL}/heartbeat`;
const CORTEX_URL  = 'http://127.0.0.1:3748';
const ORCH_URL    = 'http://127.0.0.1:9000';
const BRIDGE_URL  = 'http://127.0.0.1:9999';
const PROVIDER    = 'perplexity';
const VERSION     = '10.0.0';
const RECONNECT_MS = 3000;
const HB_MS         = 8000;

// ── Tab identity ──────────────────────────────────────────────────────────────
const MY_TAB = sessionStorage.getItem('gd_perp_id') || (() => {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
  sessionStorage.setItem('gd_perp_id', id); return id;
})();
const TAB_KEY = 'guardian_claimed_tab_perplexity';

// ── Runtime state ─────────────────────────────────────────────────────────────
let _es = null, _hb = null, _reconnectTimer = null;
let connState = 'disconnected';
let currentJobId = null, jobActive = false;
let _watchTimer = null, _watchObs = null, _watchStart = 0;
let isClaimed = false;
let sessionStart = Date.now(), sessionTokens = 0, sessionJobs = 0;
let logEntries = [], currentGaps = [], artifactStore = [], _usageHistory = [];
let accountState = null;
let _settings = {};
let _intelligenceCtx = null;

// ── §ADAPTER-CONSISTENCY — provider fingerprint, checked by tests/userscript-adapter-consistency.test.js
const _FINGERPRINT = 'perplexity';

// ── IndexedDB Kernel — same contract as claude/chatgpt/gemini ────────────────
const IDB_NAME    = 'nexus_guardian_perplexity';
const IDB_VERSION = 1;
let _db = null;
function dbOpen() {
  return new Promise((res, rej) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('requests')) {
        const s = db.createObjectStore('requests', { keyPath: 'uuid' });
        s.createIndex('status', 'status'); s.createIndex('sessionId', 'sessionId');
      }
      if (!db.objectStoreNames.contains('sessions')) db.createObjectStore('sessions', { keyPath: 'sessionId' });
      if (!db.objectStoreNames.contains('artifacts')) {
        const a = db.createObjectStore('artifacts', { keyPath: 'hash' });
        a.createIndex('jobId', 'jobId'); a.createIndex('ts', 'ts');
      }
      // §ADAPTER — Perplexity-specific store: citations are first-class here,
      // not a field bolted onto the result payload. Indexed by jobId so a
      // job's sources survive independently of the text artifact.
      if (!db.objectStoreNames.contains('citations')) {
        const c = db.createObjectStore('citations', { keyPath: 'uuid' });
        c.createIndex('jobId', 'jobId');
      }
    };
    req.onsuccess = e => { _db = e.target.result; res(_db); };
    req.onerror   = e => rej(e.target.error);
  });
}
function dbPut(store, obj) {
  if (!_db) return Promise.resolve(null);
  return new Promise((res, rej) => {
    const req = _db.transaction(store, 'readwrite').objectStore(store).put(obj);
    req.onsuccess = () => res(req.result); req.onerror = e => rej(e.target.error);
  });
}
function dbGet(store, key) {
  if (!_db) return Promise.resolve(null);
  return new Promise((res, rej) => {
    const req = _db.transaction(store, 'readonly').objectStore(store).get(key);
    req.onsuccess = () => res(req.result || null); req.onerror = e => rej(e.target.error);
  });
}
function dbGetAll(store, indexName, value) {
  if (!_db) return Promise.resolve([]);
  return new Promise((res, rej) => {
    const s = _db.transaction(store, 'readonly').objectStore(store);
    const req = indexName ? s.index(indexName).getAll(value) : s.getAll();
    req.onsuccess = () => res(req.result || []); req.onerror = e => rej(e.target.error);
  });
}

// ── SHA-256 dedup ──────────────────────────────────────────────────────────────
async function sha256(text) {
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('').slice(0,16);
  } catch(_) {
    let h = 0;
    for (let i = 0; i < text.length; i++) { h = Math.imul(31, h) + text.charCodeAt(i) | 0; }
    return Math.abs(h).toString(16).padStart(8,'0');
  }
}

// ── Session UUID chain ────────────────────────────────────────────────────────
let _sessionId = null;
async function getSessionId() {
  if (_sessionId) return _sessionId;
  const chatPath = location.pathname;
  const stored   = await dbGet('sessions', chatPath);
  if (stored) { _sessionId = stored.sessionId; return _sessionId; }
  _sessionId = `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
  await dbPut('sessions', { sessionId: _sessionId, chatPath, provider: PROVIDER, startedAt: Date.now() });
  return _sessionId;
}

async function replayPending() {
  const pending = await dbGetAll('requests', 'status', 'pending');
  if (!pending.length) return;
  _log('sys', `Replaying ${pending.length} pending request(s) from IDB`);
  for (const r of pending) {
    ncpPost(NCP_RESULT, { type: 'GUARDIAN_REPLAY', ...r }).catch(() => {});
    await dbPut('requests', { ...r, status: 'replayed', replayedAt: Date.now() });
  }
}

// ── Utils ─────────────────────────────────────────────────────────────────────
function uid()  { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
function estimateTokens(s) { return Math.max(1, Math.round((s||'').length / 4)); }

// ── §ADAPTER — chatId — §HONEST-NOTE: perplexity.ai's URL is /search/<slug>-<id>
// in current usage, but the exact slug/id boundary isn't a verified-stable
// contract — verify against what you actually see before relying on it.
function chatId() {
  const m = location.pathname.match(/\/search\/(.+)/);
  return m ? m[1].slice(0,80) : 'home';
}

// ── §ADAPTER — getAccount ──────────────────────────────────────────────────────
function getAccount() {
  if (accountState) return accountState;
  const sels = ['[aria-label*="@"]','[data-testid="user-menu"]','nav [title*="@"]','img[alt*="avatar" i]'];
  for (const sel of sels) {
    const el = document.querySelector(sel);
    if (el) {
      const t = (el.getAttribute('aria-label')||el.getAttribute('title')||el.getAttribute('alt')||el.textContent||'').trim();
      if (t.includes('@') || t.length > 3) { accountState = t.slice(0,60); return accountState; }
    }
  }
  return location.hostname;
}

// ── §ADAPTER — usage/quota-limit detection ────────────────────────────────────
// §HONEST-NOTE: same drift caveat as the other three — Perplexity's free-tier
// limiting is specifically around "Pro search" counts, different shape from
// a flat message cap, so the pattern list reflects that distinction.
let usageState = { limited: false, message: null, resetHint: null, detectedAt: null };
const USAGE_PATTERNS = [
  /pro search(es)?.*(left|remaining|used|limit)/i, /daily limit/i,
  /upgrade to pro/i, /reached (the|your) .*(limit|quota)/i,
  /try again (later|tomorrow)/i, /come back (later|in)/i,
];
const RESET_HINT_RE = /(reset|resets|try again|come back)[^.]{0,60}/i;
function _composerDisabled() {
  const ta = _getInput();
  const btn = _getSendBtn();
  return !!(ta?.disabled || ta?.getAttribute('aria-disabled')==='true' || btn?.disabled);
}
function detectUsageLimit() {
  try {
    const regions = [...document.querySelectorAll('[role="alert"], [role="status"], [aria-live="polite"], [aria-live="assertive"]')];
    const composer = _getInput();
    if (composer) { const c = composer.closest('form')?.parentElement || composer.parentElement?.parentElement; if (c) regions.push(c); }
    for (const el of regions) {
      const t = (el.textContent || '').trim();
      if (!t || t.length > 400) continue;
      if (USAGE_PATTERNS.some(re => re.test(t))) {
        const resetMatch = t.match(RESET_HINT_RE);
        usageState = { limited: true, message: t.slice(0,200), resetHint: resetMatch?.[0]||null, detectedAt: Date.now() };
        return usageState;
      }
    }
    if (_composerDisabled() && usageState.limited === false) {
      usageState = { limited: 'suspected', message: 'composer disabled, no matching banner text', resetHint: null, detectedAt: Date.now() };
      return usageState;
    }
    if (usageState.limited) usageState = { limited: false, message: null, resetHint: null, detectedAt: Date.now() };
    return usageState;
  } catch(e) { return usageState; }
}

// ── §ADAPTER — DOM selectors ───────────────────────────────────────────────────
// Real selectors carried forward from v1.0 — textarea-or-contenteditable
// detection and the Enter-key fallback when no submit button is enabled were
// already-considered choices, not guesses I'm introducing now.
function _getInput() {
  return document.querySelector('textarea[placeholder]') ||
         document.querySelector('div[contenteditable="true"]') ||
         document.querySelector('#ask-input') ||
         document.querySelector('[data-testid="ask-input"]');
}
function _getSendBtn() {
  return document.querySelector('button[aria-label*="Submit"]') ||
         document.querySelector('button[aria-label*="Ask"]') ||
         document.querySelector('button[type="submit"]') ||
         document.querySelector('[data-testid="submit-button"]');
}
function findResponseEl() {
  const answers = document.querySelectorAll('.prose, [data-testid="answer"], .answer-text, .result__content');
  return answers.length ? answers[answers.length - 1] : null;
}
function _isGenerating() {
  return !!document.querySelector('.loading-dots, .streaming, [data-testid="stop-button"], .stop-generating');
}

// ── §ADAPTER — Perplexity's actual distinctive surface: citations/grounding ──
// This is the part that's genuinely different from Claude/ChatGPT/Gemini, not
// boilerplate. Every other provider's "artifact" is code; Perplexity's is a
// source list, and dropping it silently (the way a generic text-only scanner
// would) throws away the one thing that makes this provider worth dispatching
// to in the first place — RAID picked it for 'grounded'/'citations', and the
// result without sources isn't actually that result.
function extractCitations(responseEl) {
  const links = document.querySelectorAll('.source-link, [data-testid="source"] a, .citation a');
  const seen = new Set();
  const out = [];
  for (const a of links) {
    const href = a.href; if (!href || seen.has(href)) continue;
    seen.add(href);
    out.push({ url: href, title: (a.textContent||a.getAttribute('title')||'').trim().slice(0,120) });
    if (out.length >= 12) break;
  }
  return out;
}
// Search-mode awareness — Perplexity has distinct Quick/Pro/Research/Deep
// Research modes that materially change what "complete" means (Deep
// Research jobs run for minutes, not seconds). Surfacing the active mode lets
// the watch loop and RAID both reason about expected latency correctly
// instead of assuming chatgpt/claude-style response times.
function detectSearchMode() {
  const el = document.querySelector('[aria-pressed="true"][data-testid*="mode"], .mode-selector .active, [data-selected="true"]');
  const t = (el?.textContent || '').trim().toLowerCase();
  if (t.includes('research')) return 'research';
  if (t.includes('pro')) return 'pro';
  return 'quick';
}

// ── Bus connections — identical contract to claude/chatgpt/gemini ───────────
function _toOrc(system, type, payload = {}) {
  fetch(`${ORCH_URL}/api/ledger`, { method:'POST', headers:{'Content-Type':'application/json'}, keepalive:true,
    body: JSON.stringify({ system, type, payload }) }).catch(()=>{});
}
function _toCortex(type, payload = {}) {
  fetch(`${CORTEX_URL}/api/event`, { method:'POST', headers:{'Content-Type':'application/json'}, keepalive:true,
    body: JSON.stringify({ type, payload: { ...payload, _account:getAccount(), _chatUrl:location.href },
      source:'userscript-perplexity', causedBy:currentJobId||null, ts:Date.now() }) }).catch(()=>{});
}
function _toBridge(type, payload = {}) {
  fetch(`${NCP_URL}/result`, { method:'POST', headers:{'Content-Type':'application/json'}, keepalive:true,
    body: JSON.stringify({ type, ...payload, ts:Date.now() }) }).catch(()=>{});
}

// ── Gate — §1.2 ───────────────────────────────────────────────────────────────
async function gate(name, fn, opts = {}) {
  const { jobId = null } = opts;
  const t0 = Date.now();
  try {
    const result = await fn();
    _log('ok', `✓ ${name}`, `${Date.now()-t0}ms`);
    return { ok: true, result };
  } catch (e) {
    const msg = `${name}: ${e.message}`;
    _log('err', `§1.2 GATE FAIL: ${name}`, e.message);
    toast(msg, 'error', 4000);
    if (jobId) send({ type:'GUARDIAN_ERROR', jobId, gate:name, error:msg, chatUrl:location.href, account:getAccount() });
    _toCortex('guardian.gate.failed', { gate:name, error:e.message });
    return { ok: false, error: msg };
  }
}

// ── Pre-prompt intelligence injection — identical contract, provider-agnostic ─
async function pullIntelligenceContext(intent, command) {
  try {
    const url = `${CORTEX_URL}/api/intelligence/context?intent=${encodeURIComponent((intent||'').slice(0,120))}&command=${encodeURIComponent(command||'')}&provider=${PROVIDER}`;
    const r = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!r.ok) return null;
    _intelligenceCtx = await r.json();
    return _intelligenceCtx;
  } catch(_) { return null; }
}
function buildContextHeader(ctx) {
  if (!ctx) return '';
  const parts = [];
  if (ctx.failureModes?.length) parts.push(`[KNOWN FAILURE MODES — account for these]\n` + ctx.failureModes.slice(0,3).map(f => `  - ${f.faultClass} (×${f.count}): ${f.note||''}`).join('\n'));
  if (ctx.reuse?.length) parts.push(`[REUSABLE ARTIFACTS — check before reimplementing]\n` + ctx.reuse.slice(0,2).map(r => `  - ${r.type} [${r.lang||'?'}] hash:${r.hash} — ${r.intent||''}`).join('\n'));
  if (ctx.patterns?.filter(p => p.actionable).length) parts.push(`[ACTIVE PATTERNS]\n` + ctx.patterns.filter(p => p.actionable).slice(0,2).map(p => `  - ${p.description}`).join('\n'));
  if (ctx.systemState?.criticalGaps > 0) parts.push(`[SYSTEM STATE] ${ctx.systemState.criticalGaps} critical gaps open — types: ${ctx.systemState.topGapTypes?.join(', ')||'?'}`);
  return parts.length ? `[NEXUS CONTEXT]\n${parts.join('\n')}\n\n` : '';
}

// ── NCP post helper ───────────────────────────────────────────────────────────
async function ncpPost(url, data) {
  try {
    const res = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, keepalive:true,
      body: JSON.stringify({ ...data, chatUrl: location.href, account: getAccount() }) });
    return res.ok ? await res.json() : null;
  } catch(_) { return null; }
}
function send(obj) { ncpPost(NCP_RESULT, obj).catch(()=>{}); }
function sendLedger(category, msg, meta={}) {
  send({ type:'GUARDIAN_LEDGER_EVENT', level:category, category, msg, meta, chatUrl:location.href, account:getAccount(), requestId:currentJobId });
}

// ── Log + toast ───────────────────────────────────────────────────────────────
function _log(type, msg, detail) { logEntries.push({ ts:Date.now(), type, msg, detail:detail||null }); if (logEntries.length>300) logEntries.shift(); console.log(`[guardian-perplexity] ${type}: ${msg}`, detail||''); }
function toast(msg, type='info', ms=3000) {
  const C = { success:'#34d399', error:'#f87171', warn:'#f59e0b', job:'#fbbf24', info:'#818cf8' };
  const el = document.createElement('div');
  el.style.cssText = `position:fixed;bottom:80px;right:20px;z-index:2147483647;background:rgba(8,8,14,.95);border:1px solid ${C[type]||C.info}44;color:${C[type]||C.info};padding:8px 14px;border-radius:6px;font:600 11px monospace;box-shadow:0 4px 20px rgba(0,0,0,.6);max-width:340px`;
  el.textContent = msg; document.body.appendChild(el); setTimeout(() => el.remove(), ms);
}

// ── Streaming to cortex ───────────────────────────────────────────────────────
let _streamBuf = '', _streamCnt = 0;
function _streamToCortex(jobId, delta, full) {
  _streamBuf += delta; _streamCnt++;
  if (_streamBuf.length < 400 && _streamCnt % 5 !== 0 && !/[.!?\n]$/.test(delta)) return;
  const batch = _streamBuf; _streamBuf = '';
  _toCortex('guardian.job.stream', { jobId, provider:PROVIDER, text:batch.slice(0,2000), chars:batch.length, fullLen:(full||'').length, chatUrl:location.href });
}

function recordUsage(jobId, text, ms) {
  const tokens = estimateTokens(text);
  sessionTokens += tokens; sessionJobs++;
  const u = { jobId, chatId:chatId(), chars:text.length, tokens, ms, ts:Date.now(), retried:false };
  _usageHistory.push(u); if (_usageHistory.length > 50) _usageHistory.shift();
  return u;
}

// ── Artifact + citation detection ─────────────────────────────────────────────
let _seenHashes = new Set();
async function scanArtifacts(jobId, responseEl) {
  const codeEls = document.querySelectorAll('pre code, .code-block code, [class*="CodeBlock"] code');
  for (const el of codeEls) {
    const content = (el.innerText || el.textContent || '').trim();
    if (content.length < 50) continue;
    const hash = await sha256(content);
    if (_seenHashes.has(hash)) continue;
    const existing = await dbGet('artifacts', hash);
    if (existing) { _seenHashes.add(hash); continue; }
    _seenHashes.add(hash);
    const cls = el.closest('pre')?.querySelector('[class*="language-"]')?.className?.match(/language-(\w+)/)?.[1] || 'text';
    const art = { hash, lang: cls, content: content.slice(0,4000), jobId, provider:PROVIDER, sessionId: await getSessionId(), ts: Date.now() };
    await dbPut('artifacts', art);
    artifactStore.push(art); if (artifactStore.length > 200) artifactStore.shift();
    send({ type:'GUARDIAN_ARTIFACT', jobId, content:art.content, lang:cls, hash, chatUrl:location.href, account:getAccount() });
    _toCortex('guardian.artifact', { jobId, hash, lang:cls, chars:content.length });
    _log('ok', `Artifact: ${cls} ${hash}`, `${content.length}ch`);
  }
  // §ADAPTER — Perplexity-specific: citations, persisted as their own IDB
  // record (not just attached to the result payload — so they survive even
  // if the GUARDIAN_COMPLETE post fails and gets replayed later).
  const citations = extractCitations(responseEl);
  if (citations.length) {
    await dbPut('citations', { uuid: uid(), jobId, citations, ts: Date.now() });
    send({ type:'GUARDIAN_ARTIFACT', jobId, kind:'citations', citations, chatUrl:location.href, account:getAccount() });
    _toCortex('guardian.artifact.citations', { jobId, count:citations.length });
    _log('ok', `Citations: ${citations.length}`, citations.slice(0,3).map(c=>c.title||c.url).join(', '));
  }
}

// ── Inject + submit ────────────────────────────────────────────────────────────
function injectText(text) {
  const inp = _getInput();
  if (!inp) return false;
  inp.focus();
  if (inp.tagName === 'TEXTAREA') {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
    if (setter) setter.call(inp, text); else inp.value = text;
    inp.dispatchEvent(new Event('input', { bubbles: true }));
  } else {
    document.execCommand('selectAll', false, null);
    document.execCommand('insertText', false, text);
    inp.dispatchEvent(new Event('input', { bubbles: true }));
  }
  return true;
}
function submit() {
  const btn = _getSendBtn();
  if (btn && !btn.disabled) { btn.click(); return; }
  const inp = _getInput();
  if (inp) inp.dispatchEvent(new KeyboardEvent('keydown', { key:'Enter', keyCode:13, bubbles:true, cancelable:true }));
}

// ── Gap / error detection — same contract, citations-aware addition ─────────
function detectResponseErrors(text, citationCount) {
  const issues = [];
  if (/\bcannot\s+assist|\bcannot\s+help|\bunable to\b/i.test(text)) issues.push({type:'refusal',score:0.9,reason:'refusal detected'});
  if (/\bsorry\b|\bapologize\b/i.test(text)&&text.length<200) issues.push({type:'short_apology',score:0.6,reason:'short apology'});
  if (text.length < 80 && jobActive) issues.push({type:'truncation',score:0.7,reason:'very short response'});
  if ((text.match(/```/g)||[]).length % 2 !== 0) issues.push({type:'unclosed_code_block',score:0.8,reason:'unclosed code block'});
  // §ADAPTER — Perplexity-specific gap: a "researched" answer with zero
  // citations is itself a quality signal worth surfacing, distinct from the
  // generic checks above — this provider's value proposition is grounding.
  if (citationCount === 0 && text.length > 200) issues.push({type:'no_citations',score:0.5,reason:'substantive answer with no sources found'});
  return issues;
}
function autoRetry(jobId, text, retryCount) {
  const issue = detectResponseErrors(text, 1)[0]; // citation count unknown mid-retry-decision; treat conservatively
  if (!issue || retryCount >= 2) return;
  const retryPrompts = {
    truncation: 'Your response was cut off. Please continue from exactly where you stopped.',
    refusal: 'Please reconsider and provide the requested research.',
    unclosed_code_block: 'Your last code block was not closed. Please complete it.',
    short_apology: 'Please provide a full response with sources rather than an apology.',
  };
  const retry = retryPrompts[issue.type] || `Issue detected (${issue.type}). Please revise your response.`;
  _log('gap', `Auto-retry: ${issue.type}`, `attempt ${retryCount+1}`);
  setTimeout(() => {
    if (!injectText(retry)) return;
    setTimeout(submit, 500);
    startWatch(jobId, retry, retryCount+1);
  }, 1000);
}

// ── Watch / stream loop ───────────────────────────────────────────────────────
// §ADAPTER — Perplexity-specific: timeout scales with search mode. Deep
// Research jobs genuinely run for minutes; treating that as a stalled job
// the way a 120s chatgpt/claude timeout would is a false failure, not a real one.
function stopWatch() {
  if (_watchObs) { _watchObs.disconnect(); _watchObs = null; }
  if (_watchTimer) { clearTimeout(_watchTimer); _watchTimer = null; }
  currentJobId = null; jobActive = false;
}
function startWatch(jobId, prompt, retryCount = 0) {
  stopWatch();
  currentJobId = jobId; jobActive = true; _watchStart = Date.now();
  const mode = detectSearchMode();
  const maxMs = mode === 'research' ? 600000 : 180000; // 10min research, 3min quick/pro
  let lastText = '', stableCount = 0, _lastChunkLen = 0;

  function checkStable() {
    if (!currentJobId || currentJobId !== jobId) return;
    if (Date.now() - _watchStart > maxMs) { _log('err', `Watch timeout (${mode})`, `${jobId.slice(0,8)}`); stopWatch(); send({ type:'GUARDIAN_ERROR', jobId, gate:'watch', error:`timeout after ${Math.round(maxMs/1000)}s (mode:${mode})` }); return; }
    const el = findResponseEl();
    if (!el) { _watchTimer = setTimeout(checkStable, 600); return; }
    const text = (el.innerText || el.textContent || '').trim();
    if (text === lastText && !_isGenerating()) {
      stableCount++;
      if (stableCount >= 3) { const ms = Date.now() - _watchStart; _onJobComplete(jobId, text, el, ms, prompt, retryCount, mode); return; }
    } else {
      if (text.length > _lastChunkLen) {
        const delta = text.slice(_lastChunkLen); _lastChunkLen = text.length;
        if (delta.length > 10 || /[.!?\n]/.test(delta)) {
          send({ type:'GUARDIAN_CHUNK', jobId, text:delta, full:text, provider:PROVIDER, chatUrl:location.href, ts:Date.now() });
          _streamToCortex(jobId, delta, text);
        }
      }
      lastText = text; stableCount = 0;
    }
    _watchTimer = setTimeout(checkStable, 300);
  }
  const target = document.querySelector('main') || document.body;
  _watchObs = new MutationObserver(() => {
    stableCount = 0;
    if (_watchTimer) { clearTimeout(_watchTimer); _watchTimer = null; }
    _watchTimer = setTimeout(checkStable, 300);
  });
  _watchObs.observe(target, { childList:true, subtree:true, characterData:true });
  _watchTimer = setTimeout(checkStable, 1500);
}

async function _onJobComplete(jobId, text, responseEl, ms, prompt, retryCount, mode) {
  stopWatch();
  send({ type:'GUARDIAN_LEDGER_WRITE', jobId, category:'UPGRADE', msg:`Complete · ${text.length}ch · ${Math.round(ms/1000)}s`,
    meta:{ jobId, chars:text.length, ms, provider:PROVIDER, mode, ts:Date.now() } });
  _log('ok', `Complete · ${text.length}ch`, `${Math.round(ms/1000)}s · #${jobId.slice(0,8)} · ${mode}`);
  toast(`Done: ${text.length}ch in ${Math.round(ms/1000)}s`, 'success', 3500);

  const usage = recordUsage(jobId, text, ms);
  await scanArtifacts(jobId, responseEl);
  await dbPut('requests', { uuid:jobId, status:'fulfilled', completedAt:Date.now(), sessionId:await getSessionId() });

  const citations = extractCitations(responseEl);
  const issues = detectResponseErrors(text, citations.length);
  if (issues.length) {
    currentGaps = [...issues, ...currentGaps].slice(0,100);
    if (retryCount === 0 && issues.some(i=>i.type!=='no_citations')) autoRetry(jobId, text, retryCount); // don't auto-retry on missing citations alone — that's a quality flag, not a failure
    send({ type:'GUARDIAN_GAPS', jobId, gaps:issues, chatUrl:location.href, account:getAccount() });
    _toCortex('cortex.gap.found', { jobId, gaps:issues, source:'userscript-detector' });
  }

  send({ type:'GUARDIAN_COMPLETE', jobId, text, citations, mode, chatUrl:location.href, account:getAccount(), requestId:jobId });
  _toCortex('guardian.job.complete', { jobId, chars:text.length, ms, usage, citationCount:citations.length, mode });
  _toBridge('guardian.job.complete', { jobId, chars:text.length, ms, provider:PROVIDER });
  sendLedger('UPGRADE', `Job complete · #${jobId.slice(0,8)}`, { jobId, chars:text.length, ms, citations:citations.length });
}

// ── Job handler ───────────────────────────────────────────────────────────────
async function handleJob(msg) {
  if (!isClaimed) { _log('info','Job ignored — PASSIVE', msg.jobId?.slice(0,8)); toast('Job ignored — tab not claimed', 'warn', 3000); return; }
  const { jobId, prompt='', content='', command='' } = msg;
  const text = content ? (prompt ? `${prompt}\n\n${content}` : content) : prompt;
  if (!text.trim()) { _log('err','Empty job','skipping'); return; }

  const sessionId = await getSessionId();
  await dbPut('requests', { uuid:jobId, status:'pending', command, promptLen:text.length, sessionId, provider:PROVIDER, createdAt:Date.now() });
  send({ type:'GUARDIAN_LEDGER_WRITE', jobId, category:'INPUT', msg:`Job: ${command} #${jobId.slice(0,8)}`,
    meta:{ jobId, command, chars:text.length, provider:PROVIDER, chatUrl:location.href, ts:Date.now() } });
  _log('job', `Job: ${command}`, `${text.length}ch · #${jobId.slice(0,8)}`);
  toast(`⚡ ${command} · #${jobId.slice(0,8)}`, 'job', 3000);
  _toCortex('agent.call.start', { jobId, provider:PROVIDER, command, promptLen:text.length, mode: detectSearchMode() });
  _toBridge('guardian.job.dispatched', { jobId, command, provider:PROVIDER });

  await gate('handleJob', async () => {
    const intel    = await pullIntelligenceContext(text, command);
    const intelHdr = buildContextHeader(intel);
    const finalText = intelHdr + text;
    if (!injectText(finalText)) throw new Error('Input not found — Perplexity composer not detected');
    send({ type:'GUARDIAN_DELIVERED', jobId, chatUrl:location.href, account:getAccount(), requestId:jobId });
    await dbPut('requests', { uuid:jobId, status:'dispatched', sessionId, dispatchedAt:Date.now() });
    setTimeout(() => { submit(); startWatch(jobId, text, 0); }, 600);
    return true;
  }, { jobId });
}

// ── Tab claim ─────────────────────────────────────────────────────────────────
function amIClaimed() { return GM_getValue(TAB_KEY,'') === MY_TAB; }
function claimTab()   { GM_setValue(TAB_KEY, MY_TAB); isClaimed = true; updatePill(); }
function releaseTab() { if (amIClaimed()) GM_setValue(TAB_KEY,''); isClaimed = false; updatePill(); }
function autoClaimIfFree() {
  const ex = GM_getValue(TAB_KEY,'');
  if (!ex) { claimTab(); return; }
  const last = GM_getValue('gd_hb_'+ex, 0);
  if (Date.now() - last > 15000) { GM_setValue(TAB_KEY,''); claimTab(); }
}
setInterval(() => GM_setValue('gd_hb_'+MY_TAB, Date.now()), 5000);

// ── NCP connection ────────────────────────────────────────────────────────────
function connect() {
  if (_reconnectTimer) { clearTimeout(_reconnectTimer); _reconnectTimer = null; }
  if (_es) { try { _es.close(); } catch(_) {} }
  const params = `tabId=${MY_TAB}&provider=${PROVIDER}`;
  connState = 'connecting'; updatePill();
  _es = new EventSource(`${NCP_CHANNEL}?${params}`);
  _es.onmessage = e => { try { _handleServerMessage(JSON.parse(e.data)); } catch(err) { _log('err','NCP parse',err.message); } };
  _es.onopen = () => {
    connState = 'ready'; updatePill();
    _log('ok', `NCP connected · ${PROVIDER}`, NCP_CHANNEL);
    ncpPost(NCP_RESULT, { type:'GUARDIAN_REGISTER', provider:PROVIDER, host:location.hostname, tabId:MY_TAB, claimed:amIClaimed() });
    if (_hb) clearInterval(_hb);
    _hb = setInterval(() => ncpPost(NCP_HB, { type:'GUARDIAN_HEARTBEAT', provider:PROVIDER, tabId:MY_TAB, ts:Date.now(), usage:detectUsageLimit() }), HB_MS);
    autoClaimIfFree();
    replayPending();
  };
  _es.onerror = () => {
    connState = 'disconnected'; updatePill();
    _log('err', `NCP error — retry ${RECONNECT_MS}ms`);
    _es.close(); clearInterval(_hb);
    _reconnectTimer = setTimeout(connect, RECONNECT_MS);
  };
}
function _handleServerMessage(msg) {
  switch(msg.type) {
    case 'NCP_READY': case 'GUARDIAN_READY': connState='ready'; updatePill(); toast('Guardian connected ✓','success',2000); break;
    case 'GUARDIAN_CLAIM':
      if (msg.tabId===MY_TAB||msg.tabId==='any') { claimTab(); ncpPost(NCP_RESULT,{type:'GUARDIAN_CLAIM_ACK',tabId:MY_TAB,provider:PROVIDER}); toast('Tab claimed — ACTIVE','success',2000); }
      break;
    case 'GUARDIAN_RELEASE': releaseTab(); break;
    case 'GUARDIAN_JOB': currentJobId = msg.jobId; handleJob(msg); break;
    case 'NEXUS_CONTEXT_RESPONSE': if (msg.context) _intelligenceCtx = msg.context; break;
    default: _log('debug', `NCP: ${msg.type}`);
  }
}

// Navigation tracking
let _lastPath = location.pathname;
setInterval(() => {
  if (location.pathname !== _lastPath) {
    _lastPath = location.pathname; _sessionId = null;
    if (currentJobId) stopWatch();
    _log('sys', `Nav → ${chatId()}`);
  }
}, 1000);

// ── Minimal status widget — protocol-state visibility, not the full debug panel ─
let _pill = null;
function updatePill() {
  if (!_pill) return;
  const col = connState!=='ready' ? '#ff2d55' : isClaimed ? '#00ff88' : '#818cf8';
  _pill.style.borderColor = col;
  _pill.textContent = `⬡ Perplexity · ${connState}${isClaimed ? ' · ACTIVE' : ' · passive'}`;
}
function _injectWidget() {
  _pill = document.createElement('div');
  _pill.style.cssText = 'position:fixed;bottom:12px;right:12px;z-index:2147483647;background:#05080f;border:1px solid #818cf8;border-radius:4px;padding:6px 10px;font:10px monospace;color:#e0e8ff;user-select:none;cursor:pointer;opacity:.85';
  _pill.title = `Guardian NCP — Perplexity v${VERSION}\nTab: ${MY_TAB}`;
  _pill.onclick = () => { if (amIClaimed()) releaseTab(); else claimTab(); };
  document.body.appendChild(_pill);
  updatePill();
}

// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  await dbOpen().catch(() => { _log('err','IDB failed — degraded mode'); });
  _injectWidget();
  connect();
  _log('sys', `Guardian v${VERSION} — Perplexity`, `${PROVIDER} · ${location.hostname}`);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init().catch(e => console.error('[Guardian §1.2]', e));

})();
