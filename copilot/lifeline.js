'use strict';
/**
 * copilot/lifeline.js
 * comp_id: nexus.copilot.lifeline
 * uuid: nexus-copilot-lifeline-v1-0000-2026-0627-jamesbrooks-001
 * spec: docs/copilot-expansion.spec
 *
 * Model router — Ollama primary, Guardian NCP fallback.
 *
 * Priority:
 *   1. Ollama Bridge :3749  — local, zero cost, sovereign
 *   2. Guardian NCP :7820   — claude/chatgpt/mistral/gemini via browser tab
 *   3. Error with context   — never silent (§1.2)
 *
 * When Ollama's confidence is below CONFIDENCE_THRESHOLD (0.75),
 * the lifeline escalates to Guardian. Ollama "asks for help" rather
 * than returning a low-quality answer silently.
 *
 * All results tagged: { provider_used, confidence, escalated, requestId }
 * All results written to Cortex chat_log via cortex-write.
 */
'use strict';

const http   = require('http');
const crypto = require('crypto');

const OL_URL  = process.env.OLLAMA_URL    || 'http://127.0.0.1:3749';
const GD_URL  = process.env.GUARDIAN_URL  || 'http://127.0.0.1:7820';
const CX_URL  = process.env.CORTEX_URL    || 'http://127.0.0.1:3748';

const CONFIDENCE_THRESHOLD = parseFloat(process.env.LIFELINE_CONF || '0.75');
const OLLAMA_POLL_MAX      = 35;    // seconds to poll for Ollama result
const GUARDIAN_TIMEOUT_MS  = 45000;

const MODULE_ID = 'copilot/lifeline';
const VERSION   = '1.0.0';

let _cortexWrite = null;
function _getCW(systemId = 'copilot') {
  if (!_cortexWrite) {
    try { _cortexWrite = require('../lib/cortex-write')(systemId); } catch(_) {}
  }
  return _cortexWrite;
}

// ── Simple HTTP helpers ───────────────────────────────────────────────────────
async function _post(url, body, timeoutMs = 10000) {
  return new Promise((res, rej) => {
    const b   = JSON.stringify(body);
    const u   = new URL(url);
    const req = http.request({
      hostname: u.hostname, port: u.port || 80, path: u.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(b) },
      timeout: timeoutMs,
    }, r => {
      let d = ''; r.on('data', c => d += c);
      r.on('end', () => { try { res(JSON.parse(d)); } catch(_) { res({ ok: false, raw: d }); } });
    });
    req.on('error', rej);
    req.on('timeout', () => { req.destroy(); rej(new Error('timeout')); });
    req.write(b); req.end();
  });
}

async function _get(url, timeoutMs = 5000) {
  return new Promise(res => {
    http.get(url, { timeout: timeoutMs }, r => {
      let d = ''; r.on('data', c => d += c);
      r.on('end', () => { try { res(JSON.parse(d)); } catch(_) { res(null); } });
    }).on('error', () => res(null)).on('timeout', () => res(null));
  });
}

// ── Estimate confidence from Ollama response ──────────────────────────────────
// A simple heuristic — real confidence would come from Ollama logprobs
// but those aren't always available. We use response characteristics.
function _estimateConfidence(text = '', prompt = '') {
  if (!text || text.length < 10) return 0.1;

  let score = 0.6; // base

  // Longer, more detailed responses tend to be more confident
  if (text.length > 200) score += 0.1;
  if (text.length > 500) score += 0.05;

  // Hedging language = lower confidence
  const hedges = ['i think', 'i believe', 'might be', 'not sure', 'unclear', "i don't know", 'uncertain'];
  const hedgeCount = hedges.filter(h => text.toLowerCase().includes(h)).length;
  score -= hedgeCount * 0.08;

  // Direct statements = higher confidence
  const direct = ['the answer is', 'this is', 'specifically', 'in summary', 'the key point'];
  const directCount = direct.filter(d => text.toLowerCase().includes(d)).length;
  score += directCount * 0.05;

  // Error/failure language = low confidence
  if (text.toLowerCase().includes('error') || text.toLowerCase().includes('failed')) score -= 0.2;

  return Math.max(0.1, Math.min(0.99, score));
}

// ── Route to Ollama ───────────────────────────────────────────────────────────
async function _tryOllama(prompt, opts = {}) {
  try {
    // Submit job
    const job = await _post(`${OL_URL}/api/jobs`, {
      prompt,
      // §BUGFIX 2026-07-04: was hardcoded to 'mistral:7b' — ollama-bridge's
      // own FALLBACK_MODEL, not its DEFAULT_MODEL (qwen2.5-coder:7b, the
      // one the CLI's own onboarding tells users to `ollama pull`). If a
      // user only pulled the documented default, every co-pilot job ever
      // submitted requested a model that was never installed and failed
      // silently — _tryOllama() catches everything and returns null, so
      // this always looked like "falling through to Guardian," never like
      // an error. Omitting model here lets ollama-bridge apply its own
      // real default/fallback chain instead of a copy of one string here
      // permanently frozen out of sync with the other.
      ...(opts.model ? { model: opts.model } : {}),
      intent:      opts.intent || 'ask',
      componentId: 'copilot.lifeline',
      hookId:      'copilot.lifeline.ollama',
      requestId:   opts.requestId,
      sessionId:   opts.sessionId,
      maxTokens:   opts.maxTokens || 1024,
      timeoutMs:   opts.timeoutMs || 30000,
    });

    if (!job?.jobId) return null;

    // Poll for result
    for (let i = 0; i < OLLAMA_POLL_MAX; i++) {
      await new Promise(r => setTimeout(r, 1000));
      const status = await _get(`${OL_URL}/api/jobs/${job.jobId}`);
      if (status?.job?.status === 'complete') {
        const text       = status.job.result || '';
        const confidence = _estimateConfidence(text, prompt);
        return { ok: true, text, confidence, jobId: job.jobId, provider: 'ollama' };
      }
      if (status?.job?.status === 'failed') return null;
    }
    return null; // timeout
  } catch(_) { return null; }
}

// ── Route to Guardian NCP ─────────────────────────────────────────────────────
async function _tryGuardian(prompt, opts = {}) {
  try {
    // Use the NEXUS co-pilot proxy on Guardian
    const result = await _post(`${GD_URL}/api/copilot/prompt`, {
      prompt,
      provider:   opts.provider || 'auto',   // RAID picks best available
      requestId:  opts.requestId,
      sessionId:  opts.sessionId,
      channel:    'lifeline',
      channelName: 'Lifeline',
    }, GUARDIAN_TIMEOUT_MS);

    if (!result?.text) return null;
    const confidence = _estimateConfidence(result.text, prompt);
    return { ok: true, text: result.text, confidence, provider: result.modelUsed || 'guardian', fromGuardian: true };
  } catch(_) { return null; }
}

// ── Persist result to Cortex ──────────────────────────────────────────────────
function _persist(opts, result) {
  const cw = _getCW();
  if (!cw) return;
  cw.insert('chat_log', {
    uuid:         crypto.randomUUID(),
    requestId:    opts.requestId,
    sessionId:    opts.sessionId,
    prompt:       (opts.prompt || '').slice(0, 500),
    response:     (result.text || '').slice(0, 2000),
    modelUsed:    result.provider || 'unknown',
    confidence:   result.confidence,
    escalated:    result.escalated || false,
    channel:      opts.channel || 'lifeline',
    componentId:  'copilot.lifeline',
    hookId:       'copilot.lifeline.complete',
    intent:       opts.intent || 'ask',
    ts:           Date.now(),
    source:       'lifeline',
  });
}

/**
 * Main entry point — route prompt through priority chain.
 *
 * @param {string} prompt
 * @param {object} opts — { requestId, sessionId, intent, model, maxTokens, channel }
 * @returns {object} { ok, text, confidence, provider_used, escalated, requestId }
 */
async function route(prompt, opts = {}) {
  const requestId = opts.requestId || crypto.randomUUID();

  // ── 1. Try Ollama ──────────────────────────────────────────────────────────
  const ollamaResult = await _tryOllama(prompt, { ...opts, requestId });

  if (ollamaResult?.ok) {
    if (ollamaResult.confidence >= CONFIDENCE_THRESHOLD) {
      // High confidence — return Ollama result
      const result = {
        ok: true, text: ollamaResult.text,
        confidence: ollamaResult.confidence,
        provider_used: 'ollama', escalated: false, requestId,
      };
      _persist({ ...opts, prompt, requestId }, result);
      return result;
    }

    // ── 2. Ollama confidence low — escalate to Guardian (lifeline) ──────────
    console.log(`[lifeline] Ollama confidence ${ollamaResult.confidence.toFixed(2)} < ${CONFIDENCE_THRESHOLD} — escalating to Guardian`);

    const guardianResult = await _tryGuardian(prompt, { ...opts, requestId });

    if (guardianResult?.ok) {
      const result = {
        ok: true,
        text: guardianResult.text,
        confidence: guardianResult.confidence,
        provider_used: guardianResult.provider,
        escalated: true,
        ollama_confidence: ollamaResult.confidence,
        requestId,
      };
      _persist({ ...opts, prompt, requestId }, result);
      return result;
    }

    // Guardian failed — return Ollama's low-confidence result with warning
    const result = {
      ok: true,
      text: `[CONFIDENCE: ${Math.round(ollamaResult.confidence * 100)}%] ${ollamaResult.text}`,
      confidence: ollamaResult.confidence,
      provider_used: 'ollama',
      escalated: false,
      escalation_failed: true,
      requestId,
    };
    _persist({ ...opts, prompt, requestId }, result);
    return result;
  }

  // ── 3. Ollama unavailable — go straight to Guardian ────────────────────────
  console.log('[lifeline] Ollama unavailable — routing directly to Guardian');
  const guardianResult = await _tryGuardian(prompt, { ...opts, requestId });

  if (guardianResult?.ok) {
    const result = {
      ok: true, text: guardianResult.text,
      confidence: guardianResult.confidence,
      provider_used: guardianResult.provider,
      escalated: true, ollama_offline: true, requestId,
    };
    _persist({ ...opts, prompt, requestId }, result);
    return result;
  }

  // ── 4. Both unavailable ───────────────────────────────────────────────────
  return {
    ok: false,
    text: null,
    error: 'Both Ollama and Guardian are unavailable. Check system health.',
    provider_used: 'none',
    escalated: false,
    requestId,
  };
}

/**
 * Quick health check — which providers are available?
 */
async function health() {
  const [ollamaH, guardianH] = await Promise.allSettled([
    _get(`${OL_URL}/health`),
    _get(`${GD_URL}/health`),
  ]);
  return {
    ollama:     { online: !!ollamaH.value?.ok, url: OL_URL },
    guardian:   { online: !!guardianH.value?.ok, url: GD_URL },
    threshold:  CONFIDENCE_THRESHOLD,
    priority:   ['ollama', 'guardian'],
    version:    VERSION,
  };
}

module.exports = { route, health, MODULE_ID, VERSION, CONFIDENCE_THRESHOLD };
