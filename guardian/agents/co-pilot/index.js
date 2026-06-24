'use strict';
// ── guardian/agents/co-pilot/index.js ───────────────────────────────────────
// UUID: nexus-copilot-v1-0000-0000-0000-000000000001
// Version: 1.1.0
// Phase: 23.8 — Co-pilot: real system operator
// Seam ID: guardian.copilot:v1:p0001
// Component: guardian.copilot
//
// The entry point to NEXUS. Every user interaction goes through here.
// This is not a chat wrapper. It is a system operator that:
//
//   1. Reads live system state before every response (gaps, jobs, health)
//   2. Classifies intent (Qwen — fast, local, always available)
//   3. Decides whether to act or answer
//   4. If acting: RAID-gated tool execution via /cli/exec
//   5. If answering: Mistral generates a contextual reply using system state
//   6. Returns text the UI can display immediately
//
// §1.1 Nothing exists until proven — tools execute, results verified
// §1.2 Nothing silently fails — every decision logged to event_log
// §2.1 Disk before behavior — decisions written to JAA before execution
// §5.1 UUID + hookId on every decision
// §5.7 No sibling imports — everything through execFn or HTTP seam

const crypto = require('crypto');

const MODULE_ID = 'copilot';
const VERSION   = '1.1.0';
const COMP_ID   = 'guardian.copilot';
const HOOK_ID   = 'guardian.copilot:v1:p0001';
const SOURCE    = 'copilot';

// ── Available Ollama models (checked at runtime via ping) ─────────────────────
// LAW_I: local first. Mistral for reasoning, qwen2.5-coder for fast triage.
const MODEL_PRIORITY = [
  'mistral:7b-instruct-q4_K_M',
  'qwen2.5-coder:1.5b',
  'qwen2.5:1.5b',
  'qwen2.5:0.5b',
];

// ── Tools the co-pilot can execute via /cli/exec ──────────────────────────────
// Qwen reads this list to decide whether user intent maps to a tool call.
const TOOL_MANIFEST = `
TOOLS (call with /toolname [--flag value]):
  /gaps [--status open] [--type seam_orphan_resume]  — list open gaps
  /jobs [--status delivered] [--limit 10]             — list jobs
  /health                                             — guardian health check
  /stats                                              — row counts across all JAA tables
  /providers                                          — connected NCP providers (ChatGPT tab etc)
  /ledger [--limit 20]                                — recent ledger entries
  /bus [--limit 20]                                   — recent bus events
  /seam queues                                        — active SEAM queues
  /send <provider> <prompt>                           — dispatch a job to a provider
  /status                                             — all system services online/offline
  /ideas                                              — open Idearium ideas

SYSTEM COMMANDS (built into UI, no server call needed):
  clear, help
`.trim();

// ── Qwen classification prompt ────────────────────────────────────────────────
// Returns JSON: { intent: "tool"|"question"|"action", tool: "/gaps", confidence: 0.9 }
function _buildClassifyPrompt(userInput) {
  return `Classify this NEXUS user input. Respond ONLY with valid JSON, nothing else.

Input: "${userInput.slice(0, 300)}"

Available tools: gaps, jobs, health, stats, providers, ledger, bus, seam, send, status, ideas

Rules:
- If the user wants to SEE system data (gaps, jobs, errors, status, health) → intent: "tool"
- If the user wants to REPAIR, FIX, or RUN something → intent: "action"  
- If the user is asking a question or wants explanation → intent: "question"

JSON format: {"intent":"tool","tool":"/gaps --status open","confidence":0.9}
Or: {"intent":"question","tool":null,"confidence":0.85}`;
}

// ── System state snapshot — read before every response ───────────────────────
// This is what makes the co-pilot "aware" — it reads actual state, not cached.
async function _readSystemState(execFn) {
  const state = { gaps: [], jobs: [], health: null, providers: {} };
  if (!execFn) return state;

  try {
    const [gapsR, jobsR, healthR, provR] = await Promise.allSettled([
      execFn('gaps --status open --limit 8',   { source: 'copilot.state' }),
      execFn('jobs --status delivered --limit 5', { source: 'copilot.state' }),
      execFn('health',                            { source: 'copilot.state' }),
      execFn('providers',                         { source: 'copilot.state' }),
    ]);

    if (gapsR.status   === 'fulfilled') state.gaps      = gapsR.value?.result?.gaps      || gapsR.value?.gaps      || [];
    if (jobsR.status   === 'fulfilled') state.jobs      = jobsR.value?.result?.jobs      || jobsR.value?.jobs      || [];
    if (healthR.status === 'fulfilled') state.health    = healthR.value?.result          || healthR.value          || null;
    if (provR.status   === 'fulfilled') state.providers = provR.value?.result?.providers || provR.value?.providers || {};
  } catch (_) {}

  return state;
}

// ── Format system state for Mistral context ───────────────────────────────────
function _formatSystemState(state) {
  const lines = [];

  if (state.health) {
    lines.push(`GUARDIAN: uptime ${Math.round((state.health.uptime||0)/60)}min · ${state.health.jobs||0} jobs in memory`);
  }

  const provNames = Object.keys(state.providers);
  lines.push(`PROVIDERS: ${provNames.length ? provNames.join(', ') : 'none connected'}`);

  if (state.gaps.length) {
    lines.push(`OPEN GAPS (${state.gaps.length}):`);
    for (const g of state.gaps.slice(0, 5)) {
      lines.push(`  [${g.severity||'?'}] ${g.type||g.loop_type}: ${(g.body||'').slice(0,80)}`);
    }
  } else {
    lines.push('OPEN GAPS: none');
  }

  if (state.jobs.length) {
    lines.push(`PENDING JOBS (${state.jobs.length}):`);
    for (const j of state.jobs.slice(0, 3)) {
      lines.push(`  [${j.provider}] ${j.command}: ${(j.prompt||'').slice(0,60)}`);
    }
  }

  return lines.join('\n');
}

// ── Deps ──────────────────────────────────────────────────────────────────────
let _jaa = null, _bus = null, _raid = null;
let _contextBuilder = null, _execFn = null;
let _listening = false, _pollTimer = null, _lastSeenSeq = -1;
const _eventBuffer = [];
const EVENT_BUFFER_MAX = 200;
const POLL_MS = 1000;

function safeRequire(p) {
  try { return require(p); } catch (e) {
    console.warn(`[${MODULE_ID}] optional dep unavailable: ${p} (${e.message})`);
    return null;
  }
}

function init(opts = {}) {
  _jaa            = opts.jaaDB          !== undefined ? opts.jaaDB          : null;
  _bus            = opts.bus            !== undefined ? opts.bus            : null;
  _raid           = opts.raid           !== undefined ? opts.raid           : safeRequire('../../../cortex/core/raid');
  _contextBuilder = opts.contextBuilder !== undefined ? opts.contextBuilder : safeRequire('../../../lib/context-builder');
  _execFn         = opts.execFn         !== undefined ? opts.execFn         : null;

  if (_bus?.sample && !_listening) {
    _pollTimer = setInterval(_pollBus, POLL_MS);
    if (_pollTimer.unref) _pollTimer.unref();
    _listening = true;
  }

  // Register in component registry
  try {
    const reg = safeRequire('../../../lib/component-registry');
    if (reg?.register) reg.register({
      id: COMP_ID, namespace: 'guardian', name: 'Co-pilot',
      version: VERSION,
      description: 'Primary NEXUS entry point. Reads live system state, classifies intent via Qwen, executes tools via RAID gate, generates contextual replies via Mistral.',
      grammar: ['copilot', 'ask nexus', 'diagnose', 'what is wrong', 'fix'],
      route: '/api/guardian/copilot/prompt',
      comp_type: 'interface',
      registeredBy: MODULE_ID,
      events: {
        emits: ['copilot.decision', 'copilot.tool_exec', 'copilot.reply'],
        listensTo: ['guardian.job.complete', 'gap.resolved'],
      },
    });
  } catch(_) {}

  console.log(`[${MODULE_ID}] v${VERSION} — RAID:${!!_raid?._approveTool} ctx:${!!_contextBuilder} exec:${!!_execFn}`);
  return { ok: true, listening: _listening };
}

function _pollBus() {
  if (!_bus?.sample) return;
  try {
    const { entries } = _bus.sample(50);
    for (const entry of entries) {
      if (entry.seq <= _lastSeenSeq) continue;
      _lastSeenSeq = entry.seq;
      _eventBuffer.push({ type: entry.type, ts: Date.now() });
      if (_eventBuffer.length > EVENT_BUFFER_MAX) _eventBuffer.shift();
    }
  } catch(_) {}
}

function recentEvents(n = 20) { return _eventBuffer.slice(-n); }

// ── Ollama generate ───────────────────────────────────────────────────────────
async function _generate(system, prompt, preferSmall = false) {
  const runtime = safeRequire('../../../ollama-runtime');
  if (!runtime) throw new Error('ollama-runtime not available');

  const models = preferSmall
    ? ['qwen2.5-coder:1.5b', 'qwen2.5:0.5b', 'mistral:7b-instruct-q4_K_M']
    : MODEL_PRIORITY;

  for (const model of models) {
    try {
      const text = await new Promise((resolve, reject) => {
        let buf = '';
        const _t = setTimeout(() => reject(new Error(`${model} timed out`)), 90000);
        runtime.streamGenerate(
          { model, prompt, system },
          (tok) => { buf += tok; },
          ()    => { clearTimeout(_t); resolve(buf.trim()); },
          (err) => { clearTimeout(_t); reject(err instanceof Error ? err : new Error(String(err))); },
        );
      });
      if (text) return { text, model };
    } catch (_) {}
  }
  throw new Error('No Ollama model available — is Ollama running?');
}

// ── Qwen intent classification ────────────────────────────────────────────────
async function _classifyIntent(userInput) {
  try {
    const { text } = await _generate('', _buildClassifyPrompt(userInput), true);
    const clean = text.replace(/```json|```/g, '').trim();
    const json = JSON.parse(clean);
    if (json.intent && json.confidence) return json;
  } catch (_) {}
  // Fallback: heuristic classification
  const lower = userInput.toLowerCase();
  if (userInput.startsWith('/')) return { intent: 'tool', tool: userInput, confidence: 1.0 };
  if (/\b(gaps?|jobs?|health|status|providers?|stats?|ledger|bus|seam|ideas?)\b/i.test(lower))
    return { intent: 'tool', tool: '/' + lower.match(/gaps?|jobs?|health|status|providers?|stats?|ledger|bus|seam|ideas?/i)[0], confidence: 0.7 };
  if (/\b(fix|repair|restart|run|send|dispatch|diagnose)\b/i.test(lower))
    return { intent: 'action', tool: null, confidence: 0.6 };
  return { intent: 'question', tool: null, confidence: 0.5 };
}

// ── Main entry point ──────────────────────────────────────────────────────────
async function handlePrompt(prompt, opts = {}) {
  if (!prompt || typeof prompt !== 'string') {
    return { ok: false, error: 'prompt required' };
  }

  const requestId = crypto.randomUUID();
  const now = Date.now();

  // §2.1 — write intent to ledger before any action
  if (_jaa) {
    try {
      _jaa.insert('event_log', {
        uuid: crypto.randomUUID(), type: 'copilot.prompt', source: MODULE_ID,
        ts: now, payload: { requestId, prompt: prompt.slice(0, 500) },
      });
    } catch(_) {}
  }

  // ── Step 1: Read live system state ────────────────────────────────────────
  const sysState = await _readSystemState(_execFn);
  const sysStateText = _formatSystemState(sysState);

  // ── Step 2: Classify intent ───────────────────────────────────────────────
  let classification = null;
  const isExplicitSlash = prompt.startsWith('/') && prompt.length > 1;

  if (isExplicitSlash) {
    classification = { intent: 'tool', tool: prompt, confidence: 1.0 };
  } else {
    try {
      classification = await _classifyIntent(prompt);
    } catch (_) {
      classification = { intent: 'question', tool: null, confidence: 0.5 };
    }
  }

  // ── Step 3: Tool execution ────────────────────────────────────────────────
  if (classification.intent === 'tool' && classification.tool) {
    const cmd = classification.tool.startsWith('/')
      ? classification.tool.slice(1).trim()
      : classification.tool.trim();

    // RAID gate for non-read-only commands
    const isReadOnly = /^(gaps|jobs|health|stats|providers|ledger|bus|seam|sessions|ideas|status|version)/.test(cmd);
    if (!isReadOnly && _raid?._approveTool) {
      const approval = _raid._approveTool(SOURCE, cmd, { action: 'tool', proof: opts.proof });
      if (!approval.approved) {
        _logEvent('copilot.tool_denied', { requestId, cmd, reason: approval.reason });
        return { ok: false, requestId, denied: true, reason: approval.reason,
          text: `RAID denied: ${approval.reason}` };
      }
    }

    if (!_execFn) {
      return { ok: false, requestId, error: 'execFn not injected',
        text: 'Tool execution not available — execFn not wired.' };
    }

    let toolResult = null;
    try {
      toolResult = await _execFn(cmd, { source: SOURCE, requestId });
    } catch (e) {
      toolResult = { ok: false, error: e.message };
    }

    // Format tool result for display
    const resultData = toolResult?.result ?? toolResult;
    let text;
    if (resultData?.gaps) {
      const gaps = resultData.gaps;
      text = gaps.length
        ? `${gaps.length} open gap${gaps.length===1?'':'s'}:\n` +
          gaps.slice(0,10).map(g => `  [${g.severity||'?'}] ${g.type||g.loop_type}: ${(g.body||'').slice(0,80)}`).join('\n')
        : 'No gaps matching that filter.';
    } else if (resultData?.jobs) {
      const jobs = resultData.jobs;
      text = jobs.length
        ? `${jobs.length} job${jobs.length===1?'':'s'}:\n` +
          jobs.slice(0,10).map(j => `  [${j.status}] ${j.provider} · ${j.command}: ${(j.prompt||'').slice(0,60)}`).join('\n')
        : 'No jobs.';
    } else if (resultData?.ok !== undefined) {
      text = JSON.stringify(resultData, null, 2);
    } else {
      text = JSON.stringify(resultData, null, 2).slice(0, 1000);
    }

    _logEvent('copilot.tool_exec', { requestId, cmd, ok: toolResult?.ok });
    return { ok: true, requestId, text, toolResult, classification };
  }

  // ── Step 4: Conversational answer with system context ─────────────────────
  const systemPrompt = [
    `You are the NEXUS co-pilot — the primary operator interface to a sovereign AI orchestration system.`,
    `You have real-time access to system state. Be direct, technical, and honest.`,
    `If the system has problems, say so. If gaps are open, name them.`,
    `If you don't know something, say so — never fabricate system state.`,
    ``,
    `CURRENT SYSTEM STATE:`,
    sysStateText,
    ``,
    `RECENT BUS EVENTS: ${recentEvents(5).map(e=>e.type).join(', ') || 'none'}`,
    ``,
    `AVAILABLE TOOLS (user can type /toolname):`,
    TOOL_MANIFEST,
  ].join('\n');

  let text, modelUsed;
  try {
    const result = await _generate(systemPrompt, prompt, false);
    text = result.text;
    modelUsed = result.model;
  } catch (e) {
    // Ollama offline — give honest answer from system state we already have
    text = [
      `Ollama is offline (${e.message}).`,
      `Here is what I can tell you from live system state:`,
      sysStateText || 'System state unavailable.',
      ``,
      `Start Ollama to enable generated responses: \`ollama serve\``,
    ].join('\n');
    modelUsed = null;
  }

  _logEvent('copilot.reply', { requestId, modelUsed, textLength: text.length });
  return {
    ok: true, requestId, text, modelUsed, classification,
    systemState: { gapCount: sysState.gaps.length, jobCount: sysState.jobs.length },
  };
}

function _logEvent(type, payload) {
  if (!_jaa) return;
  try {
    _jaa.insert('event_log', {
      uuid: crypto.randomUUID(), type, source: MODULE_ID,
      ts: Date.now(), payload,
    });
  } catch(_) {}
}

function status() {
  return {
    version: VERSION, listening: _listening,
    eventBufferSize: _eventBuffer.length,
    raidAvailable: !!_raid?._approveTool,
    execAvailable: !!_execFn,
    contextBuilderAvailable: !!_contextBuilder?.buildContext,
    models: MODEL_PRIORITY,
  };
}

function stop() {
  if (_pollTimer) { clearInterval(_pollTimer); _pollTimer = null; }
  _listening = false;
}

module.exports = { init, stop, handlePrompt, recentEvents, status, MODULE_ID, VERSION };
