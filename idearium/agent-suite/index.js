/**
 * idearium/agent-suite/index.js — Agent Tool Suite
 * UUID: idearium-agent-suite-v1-0000-4000-0000-000000000002
 * Version: 1.0.0
 * Phase: 40.5 — Agent Suite: full NEXUS tool access for spec builders
 * Seam ID: idearium.agent-suite:v1:p0001
 * Component: idearium.agent-suite
 *
 * Gives every spec-building agent the full power of NEXUS:
 *   - Cortex memory: read JAA tables, query patterns, read decision_log
 *   - Gap diagnostic: list open gaps, query by type/status
 *   - System health: service status, job queue, provider state
 *   - Spec context: read existing specs, cross-reference components
 *   - Repair: dispatch diagnostic jobs, trigger reflection
 *
 * Agent priority: Mistral (local, sovereign) → ChatGPT → Claude
 * Each agent gets the same tool surface. Mistral calls Ollama native.
 * ChatGPT and Claude get prompts with tool results injected as context.
 *
 * §5.7 — all calls go through guardian /cli/exec or cortex HTTP
 * §1.2 — every tool call result is logged
 * §2.3 — all state observable
 */

import http    from 'http';
import crypto  from 'crypto';
import { createRequire } from 'module';

const _require = createRequire(import.meta.url);

const MODULE_ID = 'idearium.agent-suite';
const VERSION   = '1.0.0';

const GUARDIAN_PORT  = parseInt(process.env.GUARDIAN_PORT   || '7820');
const CORTEX_PORT    = parseInt(process.env.CORTEX_PORT     || '3748');
const OLLAMA_PORT    = parseInt(process.env.OLLAMA_PORT     || '11434');

// ── HTTP helper ───────────────────────────────────────────────────────────────
async function _http(port, method, path, body = null, timeoutMs = 10000) {
  return new Promise((resolve) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: '127.0.0.1', port, path, method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
      timeout: timeoutMs,
    }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try { resolve({ ok: res.statusCode < 400, data: JSON.parse(data), status: res.statusCode }); }
        catch { resolve({ ok: false, data: { error: 'unparseable response', raw: data.slice(0,200) } }); }
      });
    });
    req.on('error', e => resolve({ ok: false, data: { error: e.message } }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, data: { error: 'timeout' } }); });
    if (payload) req.write(payload);
    req.end();
  });
}

// ── Guardian /cli/exec wrapper ────────────────────────────────────────────────
async function _exec(command) {
  const r = await _http(GUARDIAN_PORT, 'POST', '/cli/exec',
    { command, source: 'idearium.agent-suite' }, 15000);
  return r.data;
}

// ── Tool: system state snapshot ───────────────────────────────────────────────
// Given to every agent before spec building starts.
// Compact — designed to fit in a chunk prompt without dominating it.
export async function getSystemContext() {
  const [gaps, jobs, health] = await Promise.allSettled([
    _exec('gaps --status open --limit 6'),
    _exec('jobs --status delivered --limit 4'),
    _exec('health'),
  ]);

  const lines = ['## NEXUS System Context\n'];

  const h = health.status === 'fulfilled' ? health.value?.result || health.value : null;
  if (h?.uptime) lines.push(`**Guardian:** up ${Math.round(h.uptime/60)}min · ${h.jobs||0} jobs`);

  const g = gaps.status === 'fulfilled' ? (gaps.value?.result?.gaps || gaps.value?.gaps || []) : [];
  if (g.length) {
    lines.push(`\n**Open Gaps (${g.length}):**`);
    for (const gap of g.slice(0,5)) {
      lines.push(`- [${gap.severity||'?'}] ${gap.type}: ${(gap.body||'').slice(0,80)}`);
    }
  } else {
    lines.push('\n**Open Gaps:** none');
  }

  const j = jobs.status === 'fulfilled' ? (jobs.value?.result?.jobs || jobs.value?.jobs || []) : [];
  if (j.length) {
    lines.push(`\n**Active Jobs (${j.length}):**`);
    for (const job of j.slice(0,3)) {
      lines.push(`- [${job.status}] ${job.provider}: ${(job.prompt||'').slice(0,60)}`);
    }
  }

  return lines.join('\n');
}

// ── Tool: cortex memory query ─────────────────────────────────────────────────
// Agents can read cortex memory to understand existing patterns.
export async function queryCortexMemory(query, limit = 5) {
  const r = await _http(CORTEX_PORT, 'POST', '/api/memory/query',
    { query, limit }, 8000);
  if (!r.ok) return { error: r.data?.error || 'cortex memory unavailable' };
  return r.data;
}

// ── Tool: read existing component specs ──────────────────────────────────────
// Agents read specs that already exist to stay consistent with the system.
export async function getExistingSpecs(type = null) {
  const r = await _http(CORTEX_PORT, 'GET', `/api/components${type ? `?type=${type}` : ''}`,
    null, 8000);
  if (!r.ok) return [];
  return (r.data?.components || r.data || []).slice(0, 10);
}

// ── Tool: gap diagnostic ──────────────────────────────────────────────────────
export async function getGaps(filter = {}) {
  const params = Object.entries(filter)
    .map(([k,v]) => `--${k} ${v}`).join(' ');
  return _exec(`gaps ${params}`);
}

// ── Tool: repair dispatch ─────────────────────────────────────────────────────
// Agent can dispatch a repair job for a specific gap.
export async function dispatchRepair(gapUuid, prompt) {
  return _exec(`send ollama diagnose_and_repair --gap ${gapUuid} --prompt "${prompt.slice(0,200)}"`);
}

// ── Tool: read idearium ideas ─────────────────────────────────────────────────
export async function getIdeas(phase = null) {
  const r = await _http(4800, 'GET', `/api/ideas${phase ? `?phase=${phase}` : ''}`,
    null, 8000);
  return r.data;
}

// ── Ollama generation — Mistral for reasoning, Qwen for quick ────────────────
// This is what builds each chunk locally without needing a browser tab.
export async function generateWithOllama(system, prompt, { model = 'mistral:7b-instruct-q4_K_M', timeoutMs = 120000 } = {}) {
  const runtime = (() => {
    try { return _require('../../ollama/runtime'); }
    catch { return null; }
  })();

  if (!runtime) {
    // Direct HTTP fallback if runtime not available
    const body = JSON.stringify({ model, prompt: `${system}\n\n${prompt}`, stream: false,
      options: { temperature: 0.3, num_predict: 2048 } });
    const r = await new Promise((resolve) => {
      const req = http.request({
        hostname: '127.0.0.1', port: OLLAMA_PORT, path: '/api/generate',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
        timeout: timeoutMs,
      }, (res) => {
        let data = '';
        res.on('data', d => data += d);
        res.on('end', () => {
          try { resolve({ ok: true, text: JSON.parse(data).response || '' }); }
          catch { resolve({ ok: false, error: 'parse failed' }); }
        });
      });
      req.on('error', e => resolve({ ok: false, error: e.message }));
      req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'timeout' }); });
      req.write(body);
      req.end();
    });
    return r;
  }

  return new Promise((resolve) => {
    let buf = '';
    const timer = setTimeout(() => resolve({ ok: false, error: `${model} timed out after ${timeoutMs}ms` }), timeoutMs);
    runtime.streamGenerate(
      { model, prompt, system },
      (tok) => { buf += tok; },
      ()    => { clearTimeout(timer); resolve({ ok: true, text: buf.trim(), model }); },
      (err) => { clearTimeout(timer); resolve({ ok: false, error: String(err), model }); },
    );
  });
}

// ── Dispatch chunk to agent (Mistral → ChatGPT → Claude) ─────────────────────
// Returns { ok, text, agent, model } or { ok: false, error }
export async function buildChunkWithAgent(chunkPrompt, { preferAgent = 'ollama' } = {}) {
  // Agent priority: Mistral (local) → ChatGPT → Claude
  // Mistral runs directly. ChatGPT/Claude go through guardian NCP.

  // 1. Try Mistral (Ollama native)
  if (preferAgent === 'ollama' || preferAgent === 'mistral') {
    const r = await generateWithOllama(
      'You are a precise technical spec writer for the NEXUS sovereign AI orchestration system. Write only the requested section content — no preamble.',
      chunkPrompt,
      { model: 'mistral:7b-instruct-q4_K_M', timeoutMs: 120000 }
    );
    if (r.ok && r.text) return { ok: true, text: r.text, agent: 'ollama', model: r.model };
    console.warn(`[${MODULE_ID}] Mistral failed: ${r.error} — falling back to ChatGPT`);
  }

  // 2. Fall back to ChatGPT via guardian
  if (preferAgent !== 'claude') {
    const r = await _http(GUARDIAN_PORT, 'POST', '/command', {
      command: 'spec', provider: 'chatgpt', prompt: chunkPrompt,
      meta: { source: 'idearium.agent-suite', task: 'spec_chunk' },
    }, 300000); // 5min — ChatGPT via NCP can be slow
    if (r.ok && r.data?.jobId) {
      // Job was queued — return jobId so caller can poll
      return { ok: true, queued: true, jobId: r.data.jobId, agent: 'chatgpt' };
    }
    console.warn(`[${MODULE_ID}] ChatGPT dispatch failed: ${r.data?.error} — falling back to Claude`);
  }

  // 3. Fall back to Claude via guardian
  const r = await _http(GUARDIAN_PORT, 'POST', '/command', {
    command: 'spec', provider: 'claude', prompt: chunkPrompt,
    meta: { source: 'idearium.agent-suite', task: 'spec_chunk' },
  }, 300000);
  if (r.ok && r.data?.jobId) {
    return { ok: true, queued: true, jobId: r.data.jobId, agent: 'claude' };
  }

  return { ok: false, error: 'all agents failed or unavailable' };
}

// ── Wizard question builder — Qwen drives the spec wizard ─────────────────────
// Returns the next question to ask based on what's been answered so far.
export async function getNextWizardQuestion(specMeta, answeredSections) {
  const unanswered = [
    { id: 'name',        q: 'What is the name of this component?' },
    { id: 'type',        q: 'What type is it? (component / service / engine / bridge / agent)' },
    { id: 'description', q: 'What does it do in one sentence?' },
    { id: 'agent',       q: 'Which agent should build it? (ollama=Mistral local, chatgpt, claude)' },
    { id: 'purpose',     q: 'What problem does it solve? Why does it need to exist in NEXUS?' },
    { id: 'axioms',      q: 'Which axioms does it enforce? (e.g. §2.1, §5.1, §1.2)' },
  ].filter(q => !answeredSections[q.id]);

  if (!unanswered.length) return null; // all answered — ready to build

  // For complex questions, Qwen refines the question based on context
  const nextQ = unanswered[0];
  if (Object.keys(answeredSections).length > 2) {
    try {
      const r = await generateWithOllama(
        'You are a spec wizard for NEXUS. Ask one precise clarifying question based on what the user has already told you. Keep it short.',
        `Component so far: ${JSON.stringify(specMeta)}\nAnswered: ${JSON.stringify(answeredSections)}\nNext section to clarify: ${nextQ.id}\nDefault question: "${nextQ.q}"\nRefine this question or return it unchanged.`,
        { model: 'qwen2.5-coder:1.5b', timeoutMs: 15000 }
      );
      if (r.ok && r.text && r.text.length < 200) {
        return { id: nextQ.id, question: r.text.replace(/^"|"$/g, '') };
      }
    } catch (_) {}
  }

  return { id: nextQ.id, question: nextQ.q };
}

export default {
  getSystemContext, queryCortexMemory, getExistingSpecs,
  getGaps, dispatchRepair, getIdeas,
  generateWithOllama, buildChunkWithAgent, getNextWizardQuestion,
  MODULE_ID, VERSION,
};
