---
chunk_uuid: 3cbb6994-25a5-48a3-a752-d7171684e0b2
spec_uuid: 47e02ad5-207d-47a0-9d30-835d85b3510b
section: nexus-guardian-userscript-gemini-js
title: nexus/guardian/userscript-gemini.js
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:47e02ad5:nexus-guardian-userscript-gemini-js
contract_id: spec-contract:47e02ad5:nexus-guardian-userscript-gemini-js:3cbb6994
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-15T20:07:44.131Z
---

// ==UserScript==
// @name         Guardian — Gemini v10.0
// @namespace    nexus.guardian.gemini
// @version      10.1.0
// @description  Guardian v10 — Gemini: protocol parity with Claude/ChatGPT v10 (NCP
//               handshake, IndexedDB kernel, SHA-256 dedup, tab-claim, SEAM jobs,
//               intelligence injection, usage detection) built around Gemini's actual
//               distinctive surface — vision, image understanding, image generation,
//               multimodal — not a copy with selectors swapped.
// @author       James Brooks / Nexus
// @match        https://gemini.google.com/*
// @match        https://aistudio.google.com/*
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
const PROVIDER    = 'gemini';
const VERSION     = '10.0.0';
// §P113: exponential backoff 3s→30s — eliminates SSE flood on disconnect
const RECONNECT_MIN_MS = 3000;
const RECONNECT_MAX_MS = 30000;
let _reconnectAttempts = 0;
// §BUGFIX 2026-08-27 — same root cause and same fix as guardian/userscript-chatgpt.js:
// `const NEXUS` was declared inside _es.onopen's closure, but injectText()
// (module-scope, every job dispatch runs through it) references the bare
// name `NEXUS` — never in scope there. ReferenceError on every call. Hoisted
// to real module scope; onopen below now assigns it instead of shadowing it.
let NEXUS = null;
const HB_MS         = 8000;

// ── Tab identity ──────────────────────────────────────────────────────────────
const MY_TAB = sessionStorage.getItem('gd_gemini_id') || (() => {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
  sessionStorage.setItem('gd_gemini_id', id); return id;
})();
const TAB_KEY = 'guardian_claimed_tab_gemini';

// ── Runtime state ─────────────────────────────────────────────────────────────
let _es = null, _hb = null, _reconnectTimer = null;
let connState = 'disconnected';
let currentJobId = null, jobActive = false;
let _watchTimer = null, _watchObs = null, _watchStart = 0;
let isClaimed = true; // §FIX 2026-06-20: passive mode removed — every connected tab executes jobs, no single-tab claim gate
let sessionStart = Date.now(), sessionTokens = 0, sessionJobs = 0;
let logEntries = [], currentGaps = [], artifactStore = [], _usageHistory = [];
let accountState = null;
let _settings = {};
let _intelligenceCtx = null;

// ── §ADAPTER-CONSISTENCY — provider fingerprint, checked by tests/userscript-adapter-consistency.test.js
const _FINGERPRINT = 'gemini';

// ── IndexedDB Kernel — same contract as claude/chatgpt: requests/sessions/artifacts ──
const IDB_NAME    = 'nexus_guardian_gemini';
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

// ── §ADAPTER — chatId — §HONEST-NOTE: gemini.google.com's conversation URL
// structure (currently /app/<id> on the consumer product, project/chat ids on
// aistudio.google.com) isn't pinned to a verified-current pattern the way
// claude's /chat/<id> and chatgpt's /c/<id> are. This is a best-effort capture,
// not a confirmed-stable contract — verify against what you actually see.
function chatId() {
  const m = location.pathname.match(/\/(?:app|chat)\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : 'home';
}

// ── §ADAPTER — getAccount ──────────────────────────────────────────────────────
function getAccount() {
  if (accountState) return accountState;
  const sels = ['[aria-label*="Google Account"]','[data-email]','a[href*="myaccount.google.com"]','[aria-label*="@"]'];
  for (const sel of sels) {
    const el = document.querySelector(sel);
    if (el) {
      const t = (el.getAttribute('aria-label')||el.getAttribute('data-email')||el.textContent||'').trim();
      if (t.includes('@') || t.length > 3) { accountState = t.slice(0,60); return accountState; }
    }
  }
  return location.hostname;
}

// ── §ADAPTER — usage/quota-limit detection ────────────────────────────────────
// §HONEST-NOTE: same caveat as claude.js/chatgpt.js — copy/markup drifts,
// this is a layered, drift-tolerant net (alert/live-region markup first,
// composer container second, disabled-composer corroboration third).
let usageState = { limited: false, message: null, resetHint: null, detectedAt: null };
const USAGE_PATTERNS = [
  /reached (the|your) .*(limit|quota)/i, /usage limit/i, /daily limit/i,
  /try again (later|tomorrow|in)/i, /upgrade to .*(advanced|pro)/i,
  /rate limit/i, /come back (later|in)/i,
];
const RESET_HINT_RE = /(reset|try again|come back)[^.]{0,60}/i;
function _composerDisabled() {
  const ta = _getInput();
  const btn = _getSendBtn();
  return !!(ta?.getAttribute('aria-disabled')==='true' || btn?.disabled);
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
// Real selectors carried forward from the v1.0 script, not invented fresh —
// these were already considered (rich-text editor + AI Studio fallback).
function _getInput() {
  return document.querySelector('div[contenteditable="true"][aria-label]') ||
         document.querySelector('.ql-editor') ||
         document.querySelector('[data-placeholder]');
}
function _getSendBtn() {
  return document.querySelector('button[aria-label*="Send"]') ||
         document.querySelector('button[aria-label*="send"]') ||
         document.querySelector('mat-icon[fonticon="send"]')?.closest('button');
}
function findResponseEl() {
  const msgs = document.querySelectorAll('.model-response-text, .response-content, [data-testid="response"]');
  if (msgs.length) return msgs[msgs.length - 1];
  return document.querySelector('ms-chunk, .output-content'); // AI Studio
}
function _isGenerating() {
  return !!document.querySelector('.loading-indicator, .streaming-indicator, [aria-label*="Stop generating"], [aria-label*="Stop"]');
}

// ── §ADAPTER — Gemini's actual distinctive surface: vision/multimodal ────────
// This is the part that's genuinely different from Claude/ChatGPT, not boilerplate.
// extractMedia(): Gemini can both understand attached images and *generate* new
// ones (image generation in gemini.google.com and aistudio). Detect generated
// images in the response so artifacts/jobs accurately reflect non-text output —
// a text-only artifact scanner (like claude/chatgpt's scanArtifacts) would
// silently drop this for Gemini specifically.
function extractMedia(responseEl) {
  if (!responseEl) return [];
  const imgs = responseEl.querySelectorAll('img[src^="data:"], img[src*="googleusercontent"], [data-generated-image] img');
  return [...imgs].slice(0,5).map(img => ({
    type: 'image', src: img.src?.slice(0,200), alt: img.alt || null, generated: !!img.closest('[data-generated-image]'),
  }));
}
// Did the user attach an image/file to this prompt? Gemini's vision intake —
// matters for RAID: a vision-bearing job should never silently route to a
// text-only fallback provider on retry.
function hasAttachedMedia() {
  return !!document.querySelector('[data-attachment], [aria-label*="attached file"], .file-preview, .image-preview');
}

// ── Bus connections — identical contract to claude/chatgpt ───────────────────
function _toOrc(system, type, payload = {}) {
  _gmFetch(`${ORCH_URL}/api/ledger`, { method:'POST', headers:{'Content-Type':'application/json'}, keepalive:true,
    body: JSON.stringify({ system, type, payload }) }).catch(()=>{});
}
function _toCortex(type, payload = {}) {
  _gmFetch(`${CORTEX_URL}/api/event`, { method:'POST', headers:{'Content-Type':'application/json'}, keepalive:true,
    body: JSON.stringify({ type, payload: { ...payload, _account:getAccount(), _chatUrl:location.href },
      source:'userscript-gemini', causedBy:currentJobId||null, ts:Date.now() }) }).catch(()=>{});
}
function _toBridge(type, payload = {}) {
  _gmFetch(`${NCP_URL}/result`, { method:'POST', headers:{'Content-Type':'application/json'}, keepalive:true,
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
    const r = await _gmFetch(url, { timeoutMs: 3000 });
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
    const res = await _gmFetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, keepalive:true,
      body: JSON.stringify({ ...data, chatUrl: location.href, account: getAccount() }) });
    return res.ok ? await res.json() : null;
  } catch(_) { return null; }
}
function send(obj) { ncpPost(NCP_RESULT, obj).catch(()=>{}); }
function sendLedger(category, msg, meta={}) {
  send({ type:'GUARDIAN_LEDGER_EVENT', level:category, category, msg, meta, chatUrl:location.href, account:getAccount(), requestId:currentJobId });
}

// ── Log + toast ───────────────────────────────────────────────────────────────
function _log(type, msg, detail) { logEntries.push({ ts:Date.now(), type, msg, detail:detail||null }); if (logEntries.length>300) logEntries.shift(); console.log(`[guardian-gemini] ${type}: ${msg}`, detail||''); }
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

// ── Artifact detection — text (dedup) + media (Gemini-specific) ──────────────
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
  // §ADAPTER — Gemini-specific: media artifacts (generated images)
  const media = extractMedia(responseEl);
  if (media.length) {
    send({ type:'GUARDIAN_ARTIFACT', jobId, kind:'media', media, chatUrl:location.href, account:getAccount() });
    _toCortex('guardian.artifact.media', { jobId, count:media.length, generated:media.some(m=>m.generated) });
    _log('ok', `Media artifact(s): ${media.length}`, media.some(m=>m.generated) ? 'generated' : 'attached');
  }
}

// ── Inject + submit ────────────────────────────────────────────────────────────
function injectText(text) {
  // §NEXUS-WAKE 2026-08-18 — one-line hook (HOOKUP.md §3): if the outgoing
  // turn earned the agent hint (per-provider hintMode), append it here, right
  // before injection, same as every other provider script.
  text = NEXUS ? NEXUS.decorate(text) : text;
  const inp = _getInput();
  if (!inp) return false;
  inp.focus();
  document.execCommand('selectAll', false, null);
  document.execCommand('insertText', false, text);
  inp.dispatchEvent(new Event('input', { bubbles: true }));
  inp.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}
function submit() {
  const btn = _getSendBtn();
  if (btn && !btn.disabled) { btn.click(); return; }
  const inp = _getInput();
  if (inp) inp.dispatchEvent(new KeyboardEvent('keydown', { key:'Enter', keyCode:13, bubbles:true, cancelable:true }));
}

// ── Gap / error detection — same contract as claude/chatgpt ──────────────────
function detectResponseErrors(text) {
  const issues = [];
  if (/\bcannot\s+assist|\bcannot\s+help|\bunable to\b/i.test(text)) issues.push({type:'refusal',score:0.9,reason:'refusal detected'});
  if (/\bcontext window\b|\btoken limit\b|\btoo long\b/i.test(text)) issues.push({type:'context_limit',score:0.9,reason:'context limit'});
  if (/\bsorry\b|\bapologize\b/i.test(text)&&text.length<200) issues.push({type:'short_apology',score:0.6,reason:'short apology'});
  if (text.length < 80 && jobActive) issues.push({type:'truncation',score:0.7,reason:'very short response'});
  if ((text.match(/```/g)||[]).length % 2 !== 0) issues.push({type:'unclosed_code_block',score:0.8,reason:'unclosed code block'});
  return issues;
}
function autoRetry(jobId, text, retryCount) {
  const issue = detectResponseErrors(text)[0];
  if (!issue || retryCount >= 2) return;
  const retryPrompts = {
    context_limit: 'The previous response hit a context limit. Please summarise what was completed and list exactly what remains.',
    truncation: 'Your response was cut off. Please continue from exactly where you stopped.',
    refusal: 'Please reconsider and provide the technical assistance requested.',
    unclosed_code_block: 'Your last code block was not closed. Please complete it.',
    short_apology: 'Please provide a full technical response rather than an apology.',
  };
  const retry = retryPrompts[issue.type] || `Issue detected (${issue.type}). Please revise your response.`;
  _log('gap', `Auto-retry: ${issue.type}`, `attempt ${retryCount+1}`);
  setTimeout(() => {
    if (!injectText(retry)) return;
    setTimeout(submit, 500);
    startWatch(jobId, retry, retryCount+1);
  }, 1000);
}

// ── Watch / stream loop — same MutationObserver contract as claude/chatgpt ───
function stopWatch() {
  if (_watchObs) { _watchObs.disconnect(); _watchObs = null; }
  if (_watchTimer) { clearTimeout(_watchTimer); _watchTimer = null; }
  currentJobId = null; jobActive = false;
}
function startWatch(jobId, prompt, retryCount = 0) {
  stopWatch();
  currentJobId = jobId; jobActive = true; _watchStart = Date.now();
  let lastText = '', stableCount = 0, _lastChunkLen = 0;

  function checkStable() {
    if (!currentJobId || currentJobId !== jobId) return;
    const el = findResponseEl();
    if (!el) { _watchTimer = setTimeout(checkStable, 600); return; }
    const text = (el.innerText || el.textContent || '').trim();
    if (text === lastText && !_isGenerating()) {
      stableCount++;
      if (stableCount >= 3) { const ms = Date.now() - _watchStart; _onJobComplete(jobId, text, el, ms, prompt, retryCount); return; }
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

async function _onJobComplete(jobId, text, responseEl, ms, prompt, retryCount) {
  if (_toolCallCounts.has(jobId)) {
    const call = _parseToolCall(text);
    const count = _toolCallCounts.get(jobId);
    const MAX_TOOL_CALLS = 5;
    if (call.found && count < MAX_TOOL_CALLS) {
      _toolCallCounts.set(jobId, count + 1);
      _log('job', `Tool call: ${call.name}`, `#${jobId.slice(0,8)} (${count + 1}/${MAX_TOOL_CALLS})`);
      toast(`🔧 ${call.name}`, 'job', 2500);
      const result = await _runToolCall(call);
      const followUp = _formatToolResult(call.name, result);
      stopWatch();
      if (!injectText(followUp)) {
        _log('err', 'Tool follow-up inject failed', `#${jobId.slice(0,8)}`);
      } else {
        setTimeout(() => { submit(); startWatch(jobId, followUp, retryCount); }, 500);
      }
      return;
    }
    if (call.found && count >= MAX_TOOL_CALLS) {
      _log('err', 'Tool call cap reached', `#${jobId.slice(0,8)} — completing anyway`);
    }
    _toolCallCounts.delete(jobId);
  }

  stopWatch();
  send({ type:'GUARDIAN_LEDGER_WRITE', jobId, category:'UPGRADE', msg:`Complete · ${text.length}ch · ${Math.round(ms/1000)}s`,
    meta:{ jobId, chars:text.length, ms, provider:PROVIDER, ts:Date.now() } });
  _log('ok', `Complete · ${text.length}ch`, `${Math.round(ms/1000)}s · #${jobId.slice(0,8)}`);
  toast(`Done: ${text.length}ch in ${Math.round(ms/1000)}s`, 'success', 3500);

  const usage = recordUsage(jobId, text, ms);
  await scanArtifacts(jobId, responseEl);
  await dbPut('requests', { uuid:jobId, status:'fulfilled', completedAt:Date.now(), sessionId:await getSessionId() });

  const issues = detectResponseErrors(text);
  if (issues.length) {
    currentGaps = [...issues, ...currentGaps].slice(0,100);
    if (retryCount === 0) autoRetry(jobId, text, retryCount);
    send({ type:'GUARDIAN_GAPS', jobId, gaps:issues, chatUrl:location.href, account:getAccount() });
    _toCortex('cortex.gap.found', { jobId, gaps:issues, source:'userscript-detector' });
  }

  const media = extractMedia(responseEl);
  send({ type:'GUARDIAN_COMPLETE', jobId, text, media, chatUrl:location.href, account:getAccount(), requestId:jobId });
  _toCortex('guardian.job.complete', { jobId, chars:text.length, ms, usage, mediaCount:media.length });
  _toBridge('guardian.job.complete', { jobId, chars:text.length, ms, provider:PROVIDER });
  sendLedger('UPGRADE', `Job complete · #${jobId.slice(0,8)}`, { jobId, chars:text.length, ms });
}

// ── Job handler ───────────────────────────────────────────────────────────────
// §BUILT 2026-08-31, James live, phase 2 of 2 — real tool-call detection
// for a browser-typed reply. Guardian's userscripts are standalone
// Tampermonkey-style scripts with no require() at all (confirmed directly
// — checked for any require() call anywhere in this file, found none), so
// this is a deliberate, minimal duplicate of lib/agent-tool-call.js's real
// regex — same syntax, same shape, kept here because the browser has no
// other way to run it. If that file's real syntax ever changes, this must
// change with it (not a shared module, same real tradeoff this codebase
// already accepts for config.js-style per-system files).
const AGENT_TOOL_CALL_RE = /\[\[TOOL:\s*([\w-]+)\s*(\{[\s\S]*?\})?\s*\]\]/;
const _toolCallCounts = new Map(); // jobId -> count, real per-job safety cap

function _parseToolCall(text) {
  if (typeof text !== 'string' || !text) return { found: false };
  const m = AGENT_TOOL_CALL_RE.exec(text);
  if (!m) return { found: false };
  let args = {};
  if (m[2]) {
    try { args = JSON.parse(m[2]); }
    catch (e) { return { found: true, name: m[1], args: null, raw: m[0], argsError: e.message }; }
  }
  return { found: true, name: m[1], args, raw: m[0] };
}

function _formatToolResult(name, result) {
  if (result && result.error) return `[Tool "${name}" failed: ${result.error}]`;
  const body = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
  return `[Tool "${name}" result]\n${body}`;
}

// §ACK-INJECTION-FIX 2026-09-02 — see guardian/userscript-chatgpt.js's own
// header comment for the full real root-cause writeup (same bug, same
// fix, applied identically across every provider userscript — leaving
// the other three with the same known over-injection would be exactly
// the "silent bug in a sibling copy" pattern this codebase treats as a
// real, separate failure, not a style choice).
function _buildHatHeader(hat) {
  if (!hat || !hat.personaPrompt) return '';
  return `[${hat.name}] ${hat.personaPrompt}\n\n`;
}

function _scopedTools(tools, hat) {
  if (!hat || !Array.isArray(hat.toolScope) || !hat.toolScope.length) return tools;
  if (!Array.isArray(tools) || !tools.length) return tools;
  const scoped = tools.filter(t => hat.toolScope.includes(t.name));
  return scoped.length ? scoped : tools;
}

function _buildToolsHeader(tools) {
  if (!Array.isArray(tools) || !tools.length) return '';
  const lines = tools.map(t => `- ${t.name}${t.description ? `: ${t.description}` : ''}`).join('\n');
  return `You have real tools available. To use one, reply with EXACTLY this ` +
    `syntax on its own line: [[TOOL: tool_name {"param": "value"}]] — the ` +
    `result will be sent back to you as a follow-up message. Available tools:\n${lines}\n\n`;
}

async function _runToolCall(call) {
  if (call.argsError) return { error: `tool call args are not valid JSON: ${call.argsError}` };
  try {
    const r = await _gmFetch(`${NCP_URL}/api/tools/${encodeURIComponent(call.name)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(call.args || {}),
      timeoutMs: 20000,
    });
    const d = await r.json();
    if (!d.ok) return { error: d.error || `tool "${call.name}" failed` };
    return d.result;
  } catch (e) {
    return { error: `real tool execution request failed: ${e.message}` };
  }
}

async function handleJob(msg) {
  const { jobId, prompt='', content='', command='', tools=null, hat=null } = msg;
  const text = content ? (prompt ? `${prompt}\n\n${content}` : content) : prompt;
  if (!text.trim()) { _log('err','Empty job','skipping'); return; }

  const sessionId = await getSessionId();
  await dbPut('requests', { uuid:jobId, status:'pending', command, promptLen:text.length, sessionId, provider:PROVIDER, createdAt:Date.now() });
  send({ type:'GUARDIAN_LEDGER_WRITE', jobId, category:'INPUT', msg:`Job: ${command} #${jobId.slice(0,8)}`,
    meta:{ jobId, command, chars:text.length, provider:PROVIDER, chatUrl:location.href, ts:Date.now() } });
  _log('job', `Job: ${command}`, `${text.length}ch · #${jobId.slice(0,8)}`);
  toast(`⚡ ${command} · #${jobId.slice(0,8)}`, 'job', 3000);
  _toCortex('agent.call.start', { jobId, provider:PROVIDER, command, promptLen:text.length, hasMedia: hasAttachedMedia() });
  _toBridge('guardian.job.dispatched', { jobId, command, provider:PROVIDER });

  // §ACK-INJECTION-FIX — moved inside gate(), keyed off scopedTools.

  await gate('handleJob', async () => {
    // §ACK-INJECTION-FIX — see chatgpt userscript for full writeup.
    let intelHdr = '';
    const hatHdr = _buildHatHeader(hat);
    if (!hatHdr) {
      const intel = await pullIntelligenceContext(text, command);
      intelHdr = buildContextHeader(intel);
    }
    const scopedTools = _scopedTools(tools, hat);
    if (Array.isArray(scopedTools) && scopedTools.length) _toolCallCounts.set(jobId, 0);
    const toolsHdr = _buildToolsHeader(scopedTools);

    const finalText = toolsHdr + (hatHdr || intelHdr) + text;
    if (!injectText(finalText)) throw new Error('Input not found — Gemini composer not detected');
    send({ type:'GUARDIAN_DELIVERED', jobId, chatUrl:location.href, account:getAccount(), requestId:jobId });
    await dbPut('requests', { uuid:jobId, status:'dispatched', sessionId, dispatchedAt:Date.now() });
    setTimeout(() => { submit(); startWatch(jobId, text, 0); }, 800);
    return true;
  }, { jobId });
}

// ── Tab claim ─────────────────────────────────────────────────────────────────
function amIClaimed() { return GM_getValue(TAB_KEY,'') === MY_TAB; }
function claimTab()   { GM_setValue(TAB_KEY, MY_TAB); isClaimed = true; updatePill(); }
function releaseTab() { /* no-op — passive mode removed, tabs stay active */ }
function autoClaimIfFree() {
  const ex = GM_getValue(TAB_KEY,'');
  if (!ex) { claimTab(); return; }
  const last = GM_getValue('gd_hb_'+ex, 0);
  if (Date.now() - last > 15000) { GM_setValue(TAB_KEY,''); claimTab(); }
}
setInterval(() => GM_setValue('gd_hb_'+MY_TAB, Date.now()), 5000);

// ── §FIXED 2026-09-02 — real root cause of "Guardian: DISCONNECTED" +
// "not hearing hey nexus," found together, not two separate bugs.
// James, live, in a real standalone browser (not clear-glass's Electron
// shell — confirmed by his own screenshot): "the userscript isn't
// connecting. make sure you account for cors and user policy so i
// don't have to use header editor or cors." Traced directly: every
// local endpoint this file talks to (NCP_URL/CORTEX_URL/ORCH_URL) is
// plain http://127.0.0.1:<port>, while claude.ai/chatgpt.com serve over
// https:// — a real, standard MIXED-CONTENT block every modern browser
// enforces by default, with no code-level workaround from inside a
// normal page context. GM_xmlhttpRequest is genuinely different — a
// Tampermonkey-privileged API that bypasses mixed-content/CORS/same-
// origin entirely (this file's own existing calls, e.g. _nexusLogMessage
// above, already rely on exactly this for other endpoints) — but two
// real gaps meant it wasn't actually protecting everything: (1) 12 real
// call sites in this file still used plain _gmFetch() (confirmed by grep,
// not assumed — including the ENTIRE tool-calling loop, _runToolCall),
// each one silently failing in a real standalone browser; (2) NCP's own
// live connection used a native EventSource, which has no privileged
// equivalent AT ALL by default — and since wake-word arming
// (window.NexusWake.install(...)) only ever happens inside _es.onopen,
// a blocked EventSource meant the wake word was never armed, not
// separately broken.
//
// Two real, generic, drop-in replacements below close both gaps:
// _gmFetch() (fetch-compatible, wraps every plain _gmFetch() call in this
// file) and _gmEventSource() (EventSource-compatible, replicates a live
// SSE stream via GM_xmlhttpRequest's own real onprogress callback,
// which fires as new bytes arrive on a still-open connection — genuine
// incremental delivery, not polling dressed up as streaming).

function _gmFetch(url, opts = {}) {
  return new Promise((resolve, reject) => {
    if (typeof GM_xmlhttpRequest !== 'function') { reject(new Error('GM_xmlhttpRequest unavailable — @grant GM_xmlhttpRequest missing')); return; }
    const method = (opts.method || 'GET').toUpperCase();
    GM_xmlhttpRequest({
      method,
      url,
      headers: opts.headers || {},
      data: opts.body,
      timeout: opts.timeoutMs || 15000,
      onload: (res) => {
        // §FETCH-COMPATIBLE — the real, minimal Response shape every
        // real call site in this file actually uses (r.ok, r.json(),
        // r.status) — not a full Response polyfill, just what's real
        // and needed, so every existing `await _gmFetch(...)` call site
        // becomes `await _gmFetch(...)` with zero other changes.
        resolve({
          ok: res.status >= 200 && res.status < 300,
          status: res.status,
          json: async () => JSON.parse(res.responseText),
          text: async () => res.responseText,
        });
      },
      onerror: () => reject(new Error(`GM_xmlhttpRequest network error — ${method} ${url}`)),
      ontimeout: () => reject(new Error(`GM_xmlhttpRequest timeout — ${method} ${url}`)),
    });
  });
}

function _gmEventSource(url) {
  // §REAL SSE OVER GM_xmlhttpRequest — a genuine, incremental stream,
  // not a _gmFetch()-once-and-pretend. GM_xmlhttpRequest keeps the
  // underlying connection open for a real text/event-stream response
  // (server never closes it — confirmed against guardian/server.js's
  // own real NCP channel handler, a standard chunked SSE response) and
  // fires onprogress as each new chunk arrives; response.responseText
  // is the FULL text received so far, so new frames are found by
  // diffing against what was already parsed, not by assuming each
  // onprogress call carries exactly one new frame.
  const es = { onopen: null, onmessage: null, onerror: null };
  let _parsedLen = 0;
  let _closed = false;
  let _req = null;

  function _parseNewFrames(fullText) {
    const unparsed = fullText.slice(_parsedLen);
    // Real SSE framing: events separated by a blank line, each
    // containing one or more "data: ..." lines. Only advance
    // _parsedLen past a frame boundary we've actually found — a
    // partial frame at the tail (still arriving) is left for the next
    // onprogress call, not parsed early and lost.
    const frames = unparsed.split('\n\n');
    if (frames.length < 2) return; // no complete frame yet
    const complete = frames.slice(0, -1);
    const consumed = complete.join('\n\n').length + (complete.length * 2);
    _parsedLen += consumed;
    for (const frame of complete) {
      const dataLines = frame.split('\n').filter(l => l.startsWith('data:')).map(l => l.slice(5).trim());
      if (!dataLines.length) continue;
      const data = dataLines.join('\n');
      if (es.onmessage) { try { es.onmessage({ data }); } catch (_) {} }
    }
  }

  if (typeof GM_xmlhttpRequest !== 'function') {
    setTimeout(() => { if (es.onerror) es.onerror(new Error('GM_xmlhttpRequest unavailable')); }, 0);
    es.close = () => {};
    return es;
  }

  _req = GM_xmlhttpRequest({
    method: 'GET',
    url,
    headers: { Accept: 'text/event-stream' },
    timeout: 0, // real, deliberately unbounded — this IS the live connection, not a single request
    onreadystatechange: (res) => {
      // Some GM implementations report the real, live connection open
      // via readyState 3 (HEADERS_RECEIVED/LOADING) before any body
      // arrives — fired once, matching real EventSource.onopen timing.
      if (res.readyState === 2 || res.readyState === 3) {
        if (es.onopen && !es._opened) { es._opened = true; es.onopen(); }
      }
    },
    onprogress: (res) => {
      if (_closed) return;
      if (es.onopen && !es._opened) { es._opened = true; es.onopen(); }
      _parseNewFrames(res.responseText || '');
    },
    onload: () => { if (!_closed && es.onerror) es.onerror(new Error('NCP stream ended')); },
    onerror: () => { if (!_closed && es.onerror) es.onerror(new Error('GM_xmlhttpRequest stream error')); },
    ontimeout: () => { if (!_closed && es.onerror) es.onerror(new Error('GM_xmlhttpRequest stream timeout')); },
  });

  es.close = () => { _closed = true; try { _req?.abort?.(); } catch (_) {} };
  return es;
}
// ── NCP connection ────────────────────────────────────────────────────────────
function connect() {
  if (_reconnectTimer) { clearTimeout(_reconnectTimer); _reconnectTimer = null; }
  _reconnectAttempts = 0; // §P113: reset backoff on successful connect
  if (_es) { try { _es.close(); } catch(_) {} }
  const params = `tabId=${MY_TAB}&provider=${PROVIDER}`;
  connState = 'connecting'; updatePill();
  _es = _gmEventSource(`${NCP_CHANNEL}?${params}`);
  _es.onmessage = e => { try { _handleServerMessage(JSON.parse(e.data)); } catch(err) { _log('err','NCP parse',err.message); } };
  _es.onopen = () => {
    connState = 'ready'; updatePill();
    _log('ok', `NCP connected · ${PROVIDER}`, NCP_CHANNEL);
    ncpPost(NCP_RESULT, { type:'GUARDIAN_REGISTER', provider:PROVIDER, host:location.hostname, tabId:MY_TAB, claimed:amIClaimed() });
    // §NEXUS-WAKE 2026-08-18 — arm "hey nexus" once per boot (HOOKUP.md §2).
    // window.NexusWake is the shared prelude ProviderHost injects before this
    // script; absent under node/tests or if the prelude failed to load, so
    // NEXUS stays null and decorate() below is a no-op rather than a crash.
    NEXUS = (typeof window !== 'undefined' && window.NexusWake)
      ? window.NexusWake.install({ provider: PROVIDER, tabId: MY_TAB, injectText, submit, log: (m) => console.log(m), ledgerWrite: (e) => send({ type:'GUARDIAN_LEDGER_WRITE', ...e }) })
      : null;
    // §FIXED 2026-09-02 — found while checking protocol parity across
    // all 4 provider userscripts (James: "get the userscripts done"):
    // claude/chatgpt both wire window.__nexusInjectAnswer, the real
    // page-side half of clear-glass/src/providers/host.js's
    // injectAnswer() — this file never did, meaning a real wake-word
    // answer for THIS provider would silently fail to render on-page
    // (injectAnswer()'s own real code degrades honestly — "page has not
    // loaded __nexusInjectAnswer yet" — but the real capability was
    // simply missing here, not just failing gracefully). Same real
    // wiring as claude/chatgpt now, not a second implementation.
    if (typeof window !== 'undefined') {
      window.__nexusWakeInstance__ = NEXUS;
      window.__nexusInjectAnswer = (text) => {
        if (!window.__nexusWakeInstance__) return { ok: false, reason: 'wake module not installed on this tab' };
        return window.__nexusWakeInstance__.showAnswer(text);
      };
    }
    // §ADDED 2026-09-02 — same real cookie-vault round-trip added to
    // guardian/userscript-claude.js this session (see that file's own
    // header comment for the full design) — protocol parity, not a
    // second implementation; identical real logic, just present here too.
    if (typeof window !== 'undefined') {
      window.__nexusCookiePending = window.__nexusCookiePending || new Map();
      window.__nexusCookieResponse = (requestId, result) => {
        const resolve = window.__nexusCookiePending.get(requestId);
        if (resolve) { window.__nexusCookiePending.delete(requestId); resolve(result); }
      };
      window.nexusCookieCount = (url) => new Promise((resolve) => {
        if (typeof window.__cg?.send !== 'function') { resolve({ ok: false, error: 'no __cg bridge on this page — not running inside clear-glass, or webview-bridge.js failed to load' }); return; }
        const requestId = `cookie-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        window.__nexusCookiePending.set(requestId, resolve);
        setTimeout(() => {
          if (window.__nexusCookiePending.has(requestId)) {
            window.__nexusCookiePending.delete(requestId);
            resolve({ ok: false, error: 'cookie request timed out — no response from clear-glass main process within 5s' });
          }
        }, 5000);
        window.__cg.send('nexus:cookie-request', { requestId, op: 'count', url: url || location.href, agentId: PROVIDER });
      });
    }
    if (_hb) clearInterval(_hb);
    _hb = setInterval(() => ncpPost(NCP_HB, { type:'GUARDIAN_HEARTBEAT', provider:PROVIDER, tabId:MY_TAB, ts:Date.now(), usage:detectUsageLimit(), chatId:chatId(), claimed:isClaimed }), HB_MS);
    autoClaimIfFree();
    replayPending();
  };
  _es.onerror = () => {
    connState = 'disconnected'; updatePill();
    _reconnectAttempts++;
    const _delay = Math.min(RECONNECT_MIN_MS * Math.pow(2, _reconnectAttempts - 1), RECONNECT_MAX_MS);
    _log('err', `NCP error — retry ${_delay}ms (attempt ${_reconnectAttempts})`);
    _es.close(); clearInterval(_hb);
    _reconnectTimer = setTimeout(connect, _delay);
  };
}
function _handleServerMessage(msg) {
  switch(msg.type) {
    case 'NCP_READY': case 'GUARDIAN_READY': connState='ready'; updatePill(); toast('Guardian connected ✓','success',2000); break;
    case 'GUARDIAN_CLAIM':
      if (msg.tabId===MY_TAB||msg.tabId==='any') { claimTab(); ncpPost(NCP_RESULT,{type:'GUARDIAN_CLAIM_ACK',tabId:MY_TAB,provider:PROVIDER}); toast('Tab claimed — ACTIVE','success',2000); }
      break;
    // §BUILT 2026-09-13 — real ping/pong gate, same shape as GUARDIAN_CLAIM/GUARDIAN_CLAIM_ACK above.
    case 'GUARDIAN_PING': ncpPost(NCP_RESULT,{type:'GUARDIAN_PING_ACK',pingId:msg.pingId,tabId:MY_TAB,provider:PROVIDER}); break;
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
// (9-tab observability layer deferred per scope split — this is the
// equivalent of v1's status pill, upgraded to reflect claim/protocol state.)
let _pill = null;
function updatePill() {
  if (!_pill) return;
  const col = connState!=='ready' ? '#ff2d55' : '#00ff88';
  _pill.style.borderColor = col;
  _pill.textContent = `⬡ Gemini · ${connState} · ACTIVE`;
}
function _injectWidget() {
  _pill = document.createElement('div');
  _pill.style.cssText = 'position:fixed;bottom:12px;right:12px;z-index:2147483647;background:#05080f;border:1px solid #00ff88;border-radius:4px;padding:6px 10px;font:10px monospace;color:#e0e8ff;user-select:none;cursor:pointer;opacity:.85;display:none';
  // §FIXED 2026-09-03 — James: "remove headless flag and taskbar from the
  // main. not supposed to broadcast that." Was a real, visible, always-on
  // fixed-position badge on the real page — the exact "Guardian · Gemini
  // · ACTIVE" bottom-right corner overlay this whole system otherwise
  // works hard to not be detectable as. This script has no OPTIONS/
  // settings system (unlike chatgpt/claude's, lighter script by design)
  // so no toggle to wire — `display:none` baked into cssText above is
  // the real off-switch; updatePill() below still runs, keeps _pill's
  // internal state current, just never paints it.
  _pill.title = `Guardian NCP — Gemini v${VERSION}\nTab: ${MY_TAB}`;
  _pill.onclick = () => {}; // passive mode removed — nothing to toggle
  document.body.appendChild(_pill);
  updatePill();
}

// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  await dbOpen().catch(() => { _log('err','IDB failed — degraded mode'); });
  _injectWidget();
  connect();
  _log('sys', `Guardian v${VERSION} — Gemini`, `${PROVIDER} · ${location.hostname}`);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init().catch(e => console.error('[Guardian §1.2]', e));

})();