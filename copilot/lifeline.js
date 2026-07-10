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
// A heuristic — real logprob confidence isn't always available. §IMPROVED
// 2026-07-10 to fix two real failure modes the length/keyword-only version
// had: (1) it couldn't tell a grounded answer (one that used tools /
// retrieved real data) from a guess, so a confident hallucination scored
// HIGH and a correct tool-backed answer got no credit; (2) it docked 0.2
// for the word "error"/"failed", which wrongly penalized *correct* answers
// that explain an error — extremely common in a dev assistant — and forced
// needless Guardian escalation. Now: a grounded answer gets a real floor,
// and error-explanation is distinguished from self-reported failure.
function _estimateConfidence(text = '', prompt = '', opts = {}) {
  if (!text || text.length < 10) return 0.1;

  let score = 0.6; // base

  // §GROUNDING — the one real signal. If the answer was produced by the
  // tool loop (read a real file, ran a real command, queried real
  // intelligence), it's verifiable, not guessed. That earns a floor no
  // amount of hedging language should drop below — a tool-grounded "I
  // read the file and it says X" is MORE trustworthy when it's measured,
  // not less. This is what actually fixes the confidence problem.
  if (opts.grounded) score = Math.max(score, 0.8);

  // Longer, more detailed responses tend to be more confident
  if (text.length > 200) score += 0.1;
  if (text.length > 500) score += 0.05;

  // Hedging language = lower confidence (but never below a grounded floor)
  const hedges = ['i think', 'i believe', 'might be', 'not sure', 'unclear', "i don't know", 'uncertain'];
  const hedgeCount = hedges.filter(h => text.toLowerCase().includes(h)).length;
  score -= hedgeCount * 0.08;

  // Direct statements = higher confidence
  const direct = ['the answer is', 'this is', 'specifically', 'in summary', 'the key point'];
  const directCount = direct.filter(d => text.toLowerCase().includes(d)).length;
  score += directCount * 0.05;

  // §FIXED — only penalize SELF-REPORTED failure ("I couldn't", "I failed
  // to", "unable to"), not the mere presence of "error"/"failed", which
  // appear constantly in correct technical explanations ("this fixes the
  // error", "the failed test was..."). The old blanket -0.2 made copilot
  // escalate correct debugging answers.
  const selfFailure = ['i could not', "i couldn't", 'i failed to', 'i was unable', 'i am unable', "i can't determine", 'cannot answer'];
  if (selfFailure.some(f => text.toLowerCase().includes(f))) score -= 0.25;

  const floor = opts.grounded ? 0.7 : 0.1;
  return Math.max(floor, Math.min(0.99, score));
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
    // §GAP PARTIALLY CLOSED 2026-07-07 — the comment here used to say
    // "RAID picks best available" while calling nothing. Now really
    // calls RAID's RoutingIR for the escalation target. Honest about
    // what this does and doesn't fix: RAID's decision is now real; the
    // endpoint it's handed to (/api/copilot/prompt) still doesn't exist
    // on Guardian's side, confirmed directly, and the one real
    // synchronous alternative found (/chatgpt-mode/query) also 503s —
    // its own required file (guardian/agents/chatgpt-mode.js) doesn't
    // exist either. Both dead ends are on Guardian's receiving side, not
    // fixable from here. This wiring is correct and ready the moment
    // either endpoint is real.
    let ragProvider = opts.provider;
    if (!ragProvider) {
      // §SOVEREIGNTY 2026-07-09 — was require('../cortex/core/raid/routing-ir.js'),
      // a hardwire across a system boundary that I introduced. Cortex exposes
      // POST /api/raid/decide; copilot asks for it now. Unreachable cortex
      // falls back to 'auto', which guardian resolves on its own side —
      // degraded, never crashed.
      try {
        const nx = require('../lib/nexus-client');
        const d = await nx.post('cortex', '/api/raid/decide', { prompt }, { timeout: 3000 });
        ragProvider = d?.agent || 'auto';
      } catch (_) { ragProvider = 'auto'; }
    }

    // §MERGED 2026-07-09 — client-side early-out from the 07-07 branch.
    // guardian/ask.js already fail-fasts authoritatively, so this is an
    // optimization, not a second source of truth. Two conditions that look
    // similar but are not, and were conflated in my first version:
    //   - /providers answered, and the provider is not positively connected
    //     -> FAIL CLOSED. We have real evidence; don't dispatch on a hope.
    //     (An unlisted provider is not connected, not "unknown".)
    //   - /providers itself is unreachable -> FAIL OPEN. We have no
    //     evidence at all; proceed and let the server decide, rather than
    //     blocking on a check that may itself be the broken thing.
    if (ragProvider && ragProvider !== 'auto') {
      const provCheck = await _get(`${GD_URL}/providers`, 3000).catch(() => null);
      if (provCheck?.providers && provCheck.providers[ragProvider]?.connected !== true) {
        return null; // real evidence of not-connected — fall through to the cascade
      }
    } else if (ragProvider === 'auto') {
      // §REGRESSION FIXED 2026-07-09 — introduced by the sovereignty refactor
      // in this same pass. When cortex's /api/raid/decide is unreachable we
      // fall back to 'auto', and the branch above skipped the connectivity
      // check entirely, dispatching blindly to a guardian that has nobody to
      // ask. Unresolved does not mean unchecked: if /providers answers and
      // NOT ONE provider is connected, nothing can possibly answer — return
      // null and let the cascade handle it. Same fail-closed-on-evidence,
      // fail-open-on-no-evidence rule as above.
      const provCheck = await _get(`${GD_URL}/providers`, 3000).catch(() => null);
      if (provCheck?.providers && !Object.values(provCheck.providers).some(p => p?.connected === true)) {
        return null;
      }
    }

    // Use the NEXUS co-pilot proxy on Guardian
    const result = await _post(`${GD_URL}/api/copilot/prompt`, {
      prompt,
      provider:   ragProvider,
      requestId:  opts.requestId,
      sessionId:  opts.sessionId,
      channel:    'lifeline',
      channelName: 'Lifeline',
    }, GUARDIAN_TIMEOUT_MS);

    if (!result?.text) return null;
    const confidence = _estimateConfidence(result.text, prompt);
    // §BUG FIXED 2026-07-09 — this fell back to the literal string
    // 'guardian' when the response didn't name a model, which HIDES which
    // agent actually answered (guardian is the router, never the answerer).
    // The 07-07 branch reported the dispatched agent and was right to.
    // ragProvider is always known here, so there is never a reason to
    // report a placeholder.
    return { ok: true, text: result.text, confidence, provider: result.modelUsed || result.provider || ragProvider, fromGuardian: true };
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
// §MERGED 2026-07-09 from the parallel 07-07 branch (nexus-wired-v6).
// Fluid routing: when a person names an agent ("talk to chatgpt", "use
// claude"), skip the Ollama-first cascade and dispatch straight to them.
// If that explicit dispatch fails (agent not connected), fall through to
// the normal cascade rather than dead-ending — they asked for a specific
// agent, but they should still get an answer.
const KNOWN_AGENTS = ['chatgpt', 'claude', 'mistral', 'gemini', 'ollama'];
const EXPLICIT_AGENT_RE = new RegExp(
  `\\b(?:talk to|use|switch to|route (?:this|it)? ?to|ask)\\s+(${KNOWN_AGENTS.join('|')})\\b`, 'i'
);

function extractExplicitAgent(prompt) {
  const m = EXPLICIT_AGENT_RE.exec(String(prompt || ''));
  return m ? m[1].toLowerCase() : null;
}

async function route(prompt, opts = {}) {
  const requestId = opts.requestId || crypto.randomUUID();

  // Explicit agent request short-circuits the cascade. Note this composes
  // with my RAID wiring rather than bypassing it: _tryGuardian only asks
  // RoutingIR to pick a provider when none was supplied, so an explicit
  // agent is honored exactly as named.
  const explicitAgent = (opts.provider && opts.provider !== 'auto') ? opts.provider : extractExplicitAgent(prompt);
  if (explicitAgent && explicitAgent !== 'ollama') {
    const guardianResult = await _tryGuardian(prompt, { ...opts, provider: explicitAgent, requestId });
    if (guardianResult?.ok) {
      const result = {
        ok: true, text: guardianResult.text, confidence: guardianResult.confidence,
        provider_used: guardianResult.provider, escalated: true,
        explicit_agent_request: true, requestId,
      };
      _persist({ ...opts, prompt, requestId }, result, 'explicit_agent_request');
      return result;
    }
    // Explicit request failed — fall through to the normal cascade.
  }

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

module.exports = { route, health, MODULE_ID, VERSION, CONFIDENCE_THRESHOLD, extractExplicitAgent, _estimateConfidence };
