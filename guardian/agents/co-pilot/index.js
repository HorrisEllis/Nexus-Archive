'use strict';
// ── guardian/agents/co-pilot/index.js ───────────────────────────────────────
// UUID: nexus-copilot-v2-1-0000-0000-0000-000000000001
// Version: 2.1.0
// Phase: 24.1 — Co-pilot: navigating agent with user model
//
// v2.1 over v2.0:
//   - Navigation commands: "go to guardian", "open cortex" → tuneById() in UI
//   - Channel diagnosis: reads the live state of whatever page you're on
//   - Error logging: detects and records errors found during page diagnosis
//   - Note-taking: "note: X" saves to Idearium + user_notes JAA table
//   - User model: tracks channels, intents, topics, errors across all sessions
//   - Associative lattice: links topics by co-occurrence, surfaces related context
//   - Remember: "remember X" saves explicitly to user model
//   - User context injected into every Mistral system prompt
//
// §1.1 Nothing exists until proven
// §1.2 Nothing silently fails
// §2.1 Disk before behavior
// §5.7 No sibling imports — HTTP seam only for cross-service calls

const crypto = require('crypto');

const MODULE_ID = 'copilot';
const VERSION   = '2.1.0';
const COMP_ID   = 'guardian.copilot';
const SOURCE    = 'copilot';

const MODEL_PRIORITY = [
  'mistral:7b-instruct-q4_K_M',
  'qwen2.5-coder:1.5b',
  'qwen2.5:1.5b',
  'qwen2.5:0.5b',
];

// ── TV channel map — must stay in sync with CH_META in ui/home/index.html ────
const CHANNEL_MAP = {
  // Natural language → channel id
  'overview':       'ch-overview',
  'home':           'ch-overview',
  'nexus':          'ch-overview',
  'guardian':       'ch-guardian',
  'cortex':         'ch-cortex',
  'memory':         'ch-cortex',
  'idearium':       'ch-idearium',
  'ideas':          'ch-idearium',
  'bridge':         'ch-bridge',
  'relay':          'ch-bridge',
  'log':            'ch-log',
  'events':         'ch-log',
  'event log':      'ch-log',
  'diagnose':       'ch-diagnose',
  'diagnostics':    'ch-diagnose',
  'health':         'ch-diagnose',
  'blueprint':      'ch-blueprint',
  'phase map':      'ch-blueprint',
  'orchestrator':   'ch-orch-full',
  'orch':           'ch-orch-full',
  'guardian full':  'ch-gd-full',
  'cortex full':    'ch-cx-full',
  'idearium full':  'ch-idr-full',
  'bridge full':    'ch-br-full',
  'chatgpt':        'ch-chatgpt-agent',
  'claude':         'ch-chatgpt-agent',
  'agents':         'ch-chatgpt-agent',
};

// ── Channel diagnostic probes — what to check when on a given channel ────────
const CHANNEL_PROBES = {
  'ch-guardian': async (GD) => {
    const [h, jobs, gaps] = await Promise.allSettled([
      _fetch(`${GD}/health`),
      _fetch(`${GD}/jobs?limit=5`),
      _fetch(`${GD}/gaps?status=open&limit=5`),
    ]);
    const health = h.status==='fulfilled' ? h.value : null;
    const jobList = (jobs.status==='fulfilled' ? jobs.value?.jobs : null) || [];
    const gapList = (gaps.status==='fulfilled' ? gaps.value?.gaps : null) || [];
    return [
      `Guardian :7820 ${health?.ok ? '✓ online' : '✗ offline'}`,
      health ? `  uptime: ${Math.round((health.uptime||0)/60)}min · jobs: ${health.jobs||0}` : '',
      jobList.length ? `  recent jobs: ${jobList.slice(0,3).map(j=>`[${j.status}]${j.provider}`).join(' ')}` : '  no recent jobs',
      gapList.length ? `  open gaps: ${gapList.slice(0,3).map(g=>`[${g.severity}]${g.type}`).join(' ')}` : '  no open gaps ✓',
    ].filter(Boolean).join('\n');
  },
  'ch-cortex': async (_, CX) => {
    const h = await _fetch(`${CX}/health`);
    const ok = h?.status==='ok' || h?.ok===true;
    const stats = await _fetch(`${CX}/api/stats`);
    return [
      `Cortex :3748 ${ok ? '✓ online' : '✗ offline'}`,
      stats ? `  tables: ${JSON.stringify(stats).slice(0,100)}` : '  stats unavailable',
    ].join('\n');
  },
  'ch-diagnose': async (GD) => {
    const gaps = await _fetch(`${GD}/gaps?status=open&limit=12`);
    const gapList = gaps?.gaps || [];
    if (!gapList.length) return 'No open gaps ✓';
    const high = gapList.filter(g=>g.severity==='high');
    const med  = gapList.filter(g=>g.severity==='medium');
    return [
      `${gapList.length} open gaps — ${high.length} high · ${med.length} medium`,
      ...high.slice(0,3).map(g => `  🔴 [high] ${g.type}: ${(g.body||'').slice(0,60)}`),
      ...med.slice(0,2).map(g => `  🟡 [med]  ${g.type}: ${(g.body||'').slice(0,60)}`),
    ].join('\n');
  },
  'ch-causal': async (GD, CX) => {
    const nodes = await _fetch(`${CX}/cfr/nodes`);
    const nl = nodes?.nodes || [];
    const maxSig = nl.reduce((m,n)=>Math.max(m,n.sigma||0),0);
    const top = nl.sort((a,b)=>(b.sigma||0)-(a.sigma||0)).slice(0,5);
    return [
      `Causal graph: ${nl.length} nodes`,
      `Max sigma: ${maxSig.toFixed(3)}`,
      top.length ? `Top nodes: ${top.map(n=>`${n.label}(σ${(n.sigma||0).toFixed(2)})`).join(', ')}` : '',
    ].filter(Boolean).join('\n');
  },
  'ch-conversations': async (GD, CX, OR) => {
    const d = await _fetch(`${OR}/api/memory?table=chat_log&limit=5`);
    const rows = (d?.rows || d?.result || []).sort((a,b)=>(b.ts||0)-(a.ts||0));
    if (!rows.length) return 'No conversations logged yet.';
    return `Last ${rows.length} exchanges:\n` +
      rows.map(r=>`  [${r.provider||'?'}] ${(r.prompt||'').slice(0,50)}`).join('\n');
  },
  'ch-canvas': async () => {
    return 'ERAVOS canvas — organisms visible via window.NEXUS_UI_STATE.canvasOrganisms()';
  },
  'ch-overview': async (GD, CX, OR) => {
    const [gd, cx, or_] = await Promise.allSettled([
      _fetch(`${GD}/health`), _fetch(`${CX}/health`), _fetch(`${OR}/health`),
    ]);
    const gdOk = gd.status==='fulfilled' && gd.value?.ok;
    const cxOk = cx.status==='fulfilled' && (cx.value?.status==='ok'||cx.value?.ok);
    const orOk = or_.status==='fulfilled' && or_.value?.ok;
    return [
      `System overview:`,
      `  Guardian :7820 ${gdOk?'✓':'✗'}`,
      `  Cortex   :3748 ${cxOk?'✓':'✗'}`,
      `  Orch     :9000 ${orOk?'✓':'✗'}`,
    ].join('\n');
  },
};

// ── UI instruction builder ──────────────────────────────────────────────────
// Co-pilot returns ui:{} objects that the home UI executes.
// Spotlight, steps, tension overrides — never theme changes.
// This maps intent + context → what to light up.

const UI_BUILDER = {

  // "how do I open guardian?" → spotlight the tile + guide step
  forNavQuery(target, channelId) {
    const TILE_MAP = {
      'ch-guardian':   'guardian',
      'ch-cortex':     'cortex',
      'ch-idearium':   'idearium',
      'ch-diagnose':   'diagnostic',
      'ch-bridge':     'bridge',
      'ch-blueprint':  'blueprint',
      'ch-orch-full':  'orchestrator',
    };
    const tileName = TILE_MAP[channelId] || null;
    if (!tileName) return null;
    return {
      spotlight: tileName,
      spotlightTtl: 6000,
      steps: [{ target: tileName, text: `Click to open ${target}` }],
    };
  },

  // "what should I do about these gaps?" → spotlight the diagnose tile
  forGapQuery(gapCount, severity) {
    if (gapCount === 0) return null;
    const tension = severity === 'high' ? 0.8 : severity === 'medium' ? 0.5 : 0.25;
    return {
      spotlight: 'diagnostic',
      spotlightTtl: 5000,
      tensionOverride: { 'diagnostic': tension },
    };
  },

  // "how do I use the assistant?" → step-by-step guide
  forAssistantHelp() {
    return {
      steps: [
        { target: 'assistant', text: 'Type a question here — anything about the system' },
        { target: 'send',      text: 'Press Enter or click to send' },
        { target: 'inspect',   text: 'Or tap ⊕ INSPECT to see what the current channel knows' },
      ],
    };
  },

  // "how do I check system health?" → spotlight overview tiles + steps
  forHealthQuery() {
    return {
      spotlight: ['guardian', 'cortex', 'orchestrator'],
      spotlightTtl: 6000,
      steps: [
        { target: 'guardian',   text: 'Guardian :7820 — jobs, gaps, NCP routing' },
        { target: 'cortex',     text: 'Cortex :3748 — memory, patterns, CFR field' },
        { target: 'rail-diagnose', text: 'Switch to Diagnose channel for full health scan' },
      ],
    };
  },

  // When a specific system is offline — tension override + spotlight
  forOfflineSystem(systemName) {
    return {
      spotlight: systemName,
      spotlightColor: '#ff3355',
      spotlightIntensity: 0.6,
      spotlightTtl: 8000,
      tensionOverride: { [systemName]: 0.9 },
    };
  },

  // "how do I send to claude?" → step sequence
  forAgentSend(provider) {
    return {
      steps: [
        { target: 'menu',  text: `Open the menu (top left ⬡)` },
        { target: 'agent', text: `Click the Agents tile to open the ${provider} console` },
      ],
    };
  },
};

function _buildUIInstructions(prompt, classification, snapshotText, channel) {
  const lower = prompt.toLowerCase();

  // Navigation query: "how do I get to X" / "where is X"
  if (/(how.*open|where.*find|how.*get.*to|where.*is)/i.test(prompt) && classification.intent === 'navigate') {
    return UI_BUILDER.forNavQuery(classification.target || '', classification.channelId || '');
  }

  // Health query
  if (/(health|status|online|offline|all.*systems|system.*status)/i.test(lower)) {
    return UI_BUILDER.forHealthQuery();
  }

  // Gap query with high severity
  if (/(gaps?|errors?|problems?|what.*wrong|broken)/i.test(lower)) {
    const highGap = /high.*gap|critical/.test(snapshotText || '');
    return UI_BUILDER.forGapQuery(1, highGap ? 'high' : 'medium');
  }

  // Assistant usage help
  if (/(how.*use|what.*can.*you|how.*do.*i|help)/i.test(lower) && lower.length < 40) {
    return UI_BUILDER.forAssistantHelp();
  }

  // Agent console query
  if (/(claude|chatgpt|gemini|mistral|agent.*console|send.*to)/i.test(lower)) {
    const provider = /claude/i.test(lower) ? 'Claude' : /chatgpt/i.test(lower) ? 'ChatGPT' : 'agent';
    return UI_BUILDER.forAgentSend(provider);
  }

  return null; // no UI instruction needed
}

// ── Deps (injected via init()) ────────────────────────────────────────────────
let _jaa=null, _bus=null, _raid=null, _execFn=null;
let _listening=false, _pollTimer=null, _lastSeenSeq=-1;
const _eventBuffer=[];
const EVENT_BUFFER_MAX=500;
const POLL_MS=800;

// Runtime state shared with UI (set by the UI calling window.copilot.setContext)
let _currentChannel = 'ch-overview';
let _currentChannelName = 'Overview';

const GD_URL = 'http://127.0.0.1:7820';
const CX_URL = 'http://127.0.0.1:3748';
const OR_URL = 'http://127.0.0.1:9000';

async function _fetch(url, ms=2000) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(ms) });
    return r.ok ? r.json() : null;
  } catch(_) { return null; }
}

function safeRequire(p) {
  try { return require(p); } catch(e) { return null; }
}

function init(opts={}) {
  _jaa    = opts.jaaDB  !== undefined ? opts.jaaDB  : null;
  _bus    = opts.bus    !== undefined ? opts.bus    : null;
  _raid   = opts.raid   !== undefined ? opts.raid   : safeRequire('../../../cortex/core/raid');
  _execFn = opts.execFn !== undefined ? opts.execFn : null;

  // Initialize user model
  const um = safeRequire('../../../lib/user-model');
  if (um?.init && _jaa) um.init(_jaa);

  if (_bus?.sample && !_listening) {
    _pollTimer = setInterval(_pollBus, POLL_MS);
    if (_pollTimer.unref) _pollTimer.unref();
    _listening = true;
  }

  try {
    const reg = safeRequire('../../../lib/component-registry');
    if (reg?.register) reg.register({
      id: COMP_ID, namespace: 'guardian', name: 'Co-pilot',
      version: VERSION,
      description: 'Navigating agent. 7-layer awareness. User model + associative lattice. Channel diagnosis. Note-taking.',
      grammar: ['copilot','ask nexus','diagnose','go to','open','note','remember'],
      route: '/api/guardian/copilot/prompt',
      comp_type: 'interface',
      registeredBy: MODULE_ID,
    });
  } catch(_) {}

  console.log(`[${MODULE_ID}] v${VERSION} — RAID:${!!_raid?._approveTool} exec:${!!_execFn}`);
  return { ok:true, listening:_listening };
}

function _pollBus() {
  if (!_bus?.sample) return;
  try {
    const { entries } = _bus.sample(50);
    for (const e of entries) {
      if (e.seq <= _lastSeenSeq) continue;
      _lastSeenSeq = e.seq;
      _eventBuffer.push({ type:e.type, ts:Date.now(), seq:e.seq });
      if (_eventBuffer.length > EVENT_BUFFER_MAX) _eventBuffer.shift();
    }
  } catch(_) {}
}

function recentEvents(n=30) { return _eventBuffer.slice(-n); }

// ── Ollama ────────────────────────────────────────────────────────────────────
async function _generate(system, prompt, preferSmall=false) {
  const runtime = safeRequire('../../../ollama-runtime');
  if (!runtime) throw new Error('ollama-runtime not available');
  const models = preferSmall
    ? ['qwen2.5-coder:1.5b','qwen2.5:0.5b','mistral:7b-instruct-q4_K_M']
    : MODEL_PRIORITY;
  for (const model of models) {
    try {
      const text = await new Promise((resolve, reject) => {
        let buf='';
        const t = setTimeout(()=>reject(new Error(`${model} timeout`)), 90000);
        runtime.streamGenerate({ model, prompt, system },
          tok => { buf+=tok; try{if(_bus?.emit)_bus.emit('copilot.token',{token:tok,model});}catch(_){} },
          ()  => { clearTimeout(t); resolve(buf.trim()); },
          err => { clearTimeout(t); reject(err instanceof Error?err:new Error(String(err))); }
        );
      });
      if (text) return { text, model };
    } catch(_) {}
  }
  throw new Error('No Ollama model available');
}

// ── Navigation intent detection ───────────────────────────────────────────────
function _parseNavIntent(prompt) {
  const p = prompt.toLowerCase().trim();
  // "go to X", "open X", "show me X", "take me to X", "navigate to X"
  const navMatch = p.match(/^(?:go\s+to|open|show\s+(?:me\s+)?|take\s+me\s+to|navigate\s+to|switch\s+to)\s+(.+)/);
  if (navMatch) {
    const target = navMatch[1].trim();
    const channelId = CHANNEL_MAP[target] || CHANNEL_MAP[target.split(/\s+/)[0]];
    if (channelId) return { nav: true, channelId, target };
  }
  return null;
}

// ── Note intent detection ─────────────────────────────────────────────────────
function _parseNoteIntent(prompt) {
  const p = prompt.trim();
  if (/^(?:note|save|remember|log):\s*/i.test(p)) {
    return { note: true, text: p.replace(/^(?:note|save|remember|log):\s*/i,'').trim() };
  }
  if (/^remember\s+(?:that\s+)?/i.test(p)) {
    return { note: true, text: p.replace(/^remember\s+(?:that\s+)?/i,'').trim() };
  }
  return null;
}

// ── Diagnose current page ─────────────────────────────────────────────────────
async function _diagnosePage(channelId) {
  const probe = CHANNEL_PROBES[channelId] || CHANNEL_PROBES['ch-overview'];
  try {
    const result = await probe(GD_URL, CX_URL, OR_URL);
    return result;
  } catch(e) {
    return `Diagnosis error: ${e.message}`;
  }
}

// ── Qwen intent classification ────────────────────────────────────────────────
function _buildClassifyPrompt(input) {
  return `You classify NEXUS co-pilot inputs. Reply ONLY with JSON. No other text.

Input: "${input.slice(0,200)}"

Intent rules (pick exactly one):
  "tool"     — wants data: gaps/jobs/health/status/providers/ledger/patterns/cfr/artifacts
  "navigate" — go to X / open X / show me X / take me to X
  "note"     — note:/remember:/save: something
  "diagnose" — single word "diagnose" or "inspect" only
  "question" — everything else including greetings, explanations, analysis

CRITICAL: greetings (hi/hello/hey), thanks, short phrases → ALWAYS "question"
CRITICAL: "diagnose" only if input IS literally "diagnose" or "inspect"
CRITICAL: never pick "diagnose" for a greeting or general question

Examples:
  "hello"              → {"intent":"question","confidence":1.0}
  "hi there"           → {"intent":"question","confidence":1.0}
  "what's going on"    → {"intent":"question","confidence":0.9}
  "/gaps"              → {"intent":"tool","tool":"/gaps","confidence":1.0}
  "show gaps"          → {"intent":"tool","tool":"/gaps","confidence":0.85}
  "go to guardian"     → {"intent":"navigate","confidence":0.95}
  "diagnose"           → {"intent":"diagnose","confidence":1.0}
  "what is cfr"        → {"intent":"question","confidence":0.9}

Reply format: {"intent":"question","confidence":0.9}`;
}

// ── Grammar engine resolution ─────────────────────────────────────────────────
// Fetches grammar tree from orchestrator component registry.
// Called once on init, refreshed every 5 minutes.
let _grammarEngine = null;
let _grammarLastFetch = 0;
const GRAMMAR_REFRESH_MS = 5 * 60 * 1000;

async function _ensureGrammar() {
  if (!_grammarEngine) {
    try { _grammarEngine = safeRequire('../../../lib/grammar-engine'); } catch(_) { return null; }
  }
  if (!_grammarEngine) return null;
  const now = Date.now();
  if (!_grammarEngine._ready && now - _grammarLastFetch > GRAMMAR_REFRESH_MS) {
    _grammarLastFetch = now;
    try { await _grammarEngine.fetch('http://127.0.0.1:9000'); } catch(_) {}
  }
  return _grammarEngine;
}

// ── Intent fast-path table ────────────────────────────────────────────────────
// Checked BEFORE grammar and BEFORE Qwen. Zero tokens spent.
// Explicit patterns that should never fall through to LLM classification.
const GREETING_RE = /^(hi|hey|hello|yo|sup|greetings|hiya|howdy|good\s*(morning|afternoon|evening|day))[\s!?.]*$/i;
const CONVERSATIONAL_RE = /^(what('s| is) (up|good|happening)|how (are|r) (you|u)|thanks?|thank you|cool|ok(ay)?|got it|nice|great|awesome|sounds good|perfect)[\s!?.]*$/i;
const PURE_QUESTION_RE = /^(what|why|how|when|where|who|can you|could you|tell me|explain|describe|what does|what is|what are)/i;

async function _classify(input) {
  const trimmed = input.trim();

  // ── Tier 0: Zero-token fast paths ────────────────────────────────────────
  // Greetings and conversational filler — never diagnose, never tool
  if (GREETING_RE.test(trimmed) || CONVERSATIONAL_RE.test(trimmed)) {
    return { intent:'question', subtype:'greeting', confidence:1.0, skipLLM: false };
  }

  const navIntent = _parseNavIntent(trimmed);
  if (navIntent) return { intent:'navigate', ...navIntent, confidence:1.0 };
  const noteIntent = _parseNoteIntent(trimmed);
  if (noteIntent) return { intent:'note', ...noteIntent, confidence:1.0 };
  if (trimmed.startsWith('/')) return { intent:'tool', tool:trimmed, confidence:1.0 };

  // Diagnose — explicit, not inferred
  if (/^\s*(diagnose|inspect)\s*$/i.test(trimmed))
    return { intent:'diagnose', confidence:1.0 };

  // Pure question preamble — skip grammar/Qwen, go straight to conversational
  if (PURE_QUESTION_RE.test(trimmed) && trimmed.split(' ').length <= 6) {
    return { intent:'question', confidence:0.85, skipLLM: false };
  }

  // Slash-prefixed tool names without /
  const TOOL_WORDS = /^(gaps?|jobs?|health|status|providers?|stats?|ledger|bus|seam|ideas?|patterns?|cfr|artifacts?)\s*$/i;
  if (TOOL_WORDS.test(trimmed)) {
    return { intent:'tool', tool:'/'+trimmed.toLowerCase().replace(/\s+/g,''), confidence:1.0 };
  }

  // Build intent — "build X" / "compile X" / "generate X from spec"
  const BUILD_RE = /^(?:build|compile|generate|create|make)\s+(?:me\s+)?(?:a\s+)?(.+?)(?:\s+from\s+spec)?$/i;
  const buildMatch = trimmed.match(BUILD_RE);
  if (buildMatch) {
    return { intent:'build', target: buildMatch[1].trim(), confidence:0.9 };
  }

  // Grammar engine resolution — component-aware routing via registry trie
  try {
    const ge = await _ensureGrammar();
    if (ge?._ready) {
      const resolved = ge.resolve(input);
      if (resolved?.componentId && resolved.confidence >= 0.6) {
        // Grammar matched a registered component — route as tool
        const comp = resolved.componentId;
        const route = resolved.route || comp;
        return {
          intent: 'tool',
          tool: route.startsWith('/') ? route : '/' + comp.split('.').pop(),
          componentId: comp,
          confidence: resolved.confidence,
          fromGrammar: true,
        };
      }
    }
  } catch(_) {}

  if (/\b(diagnose|inspect|what.*wrong.*here|check.*this.*page|this channel|current page)\b/i.test(input))
    return { intent:'diagnose', confidence:0.9 };
  try {
    const { text } = await _generate('', _buildClassifyPrompt(input), true);
    const json = JSON.parse(text.replace(/```json|```/g,'').trim());
    if (json.intent) return json;
  } catch(_) {}
  // Heuristic fallback
  const lower = input.toLowerCase();
  if (/\b(gaps?|jobs?|health|status|providers?|stats?|ledger|bus|seam|ideas?|patterns?|cfr|artifacts?)\b/i.test(lower))
    return { intent:'tool', tool:'/'+lower.match(/gaps?|jobs?|health|status|providers?|stats?|ledger|bus|seam|ideas?|patterns?|cfr|artifacts?/i)[0], confidence:0.7 };
  if (/\b(fix|repair|restart|run|send|dispatch)\b/i.test(lower)) return { intent:'action', confidence:0.6 };
  return { intent:'question', confidence:0.5 };
}

function _logEvent(type, payload) {
  if (!_jaa) return;
  try { _jaa.insert('event_log', { uuid:crypto.randomUUID(), type, source:MODULE_ID, ts:Date.now(), payload }); } catch(_) {}
}

// ── Main entry point ──────────────────────────────────────────────────────────
// ── Token-first data answer ───────────────────────────────────────────────────
// Attempts to answer common questions from live API data, with zero Ollama tokens.
// Returns a string if it can answer, null if Ollama is needed.
//
// Covers: system status, gap count, job count, pattern summaries,
//         CFR regime, provider list, greetings, help.
// Does NOT cover: synthesis, causal reasoning, novel questions, open-ended chat.

async function _tryDataAnswer(prompt, classification, channel, uiState) {
  const p = prompt.toLowerCase().trim();

  // Greeting — zero-token, zero-fetch
  if (GREETING_RE.test(prompt.trim())) {
    const greetings = [
      'Hey. What do you need?',
      'Hi. Ask me anything or use /gaps, /jobs, /status.',
      'Hello. I can read the system, navigate channels, take notes, or answer questions.',
      "Hey. Type /status for a quick overview, or just ask what's going on.",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  if (CONVERSATIONAL_RE.test(prompt.trim())) {
    return 'Got it. What else do you need?';
  }

  // "what are you" / "what can you do" — zero tokens
  if (/what (are|can) you|your (purpose|job|role)|what do you do/i.test(p)) {
    return [
      'I am the NEXUS co-pilot. I work to save tokens.',
      '',
      'I try to answer everything from live data first. Only Mistral if I have to.',
      '',
      'Zero-token commands:',
      '  /gaps /jobs /health /status /providers /patterns /cfr /artifacts',
      '  go to <channel>   note: <text>   diagnose   remember <text>',
      '',
      'When Ollama is needed: synthesis, causal reasoning, open questions.',
      `Ollama model: ${MODEL_PRIORITY[0]}`,
    ].join('\n');
  }

  // "how many gaps" / "gap count" / "are there gaps"
  if (/(how many|count|number of|any).{0,20}gaps?|gaps?.{0,20}(open|count|how many)/i.test(p)) {
    const d = await _fetch(`${GD_URL}/gaps?status=open&limit=5`);
    const gaps = d?.gaps || [];
    if (!gaps.length) return 'No open gaps ✓';
    const high = gaps.filter(g=>g.severity==='high').length;
    const med  = gaps.filter(g=>g.severity==='medium').length;
    return `${gaps.length} open gap${gaps.length===1?'':'s'} — ${high} high · ${med} medium. Type /gaps for detail.`;
  }

  // "what's the status" / "system status" / "is everything ok"
  if (/(status|everything (ok|fine|good|up)|all (systems|services)|system health)/i.test(p)) {
    const [gd, cx, or_] = await Promise.allSettled([
      _fetch(`${GD_URL}/health`), _fetch(`${CX_URL}/health`), _fetch(`${OR_URL}/health`),
    ]);
    const gdOk = gd.status==='fulfilled' && gd.value?.ok;
    const cxOk = cx.status==='fulfilled' && (cx.value?.status==='ok'||cx.value?.ok);
    const orOk = or_.status==='fulfilled' && or_.value?.ok;
    const lines = [
      `Guardian :7820 ${gdOk?'✓':'✗'}`,
      `Cortex   :3748 ${cxOk?'✓':'✗'}`,
      `Orch     :9000 ${orOk?'✓':'✗'}`,
    ];
    if (uiState?.health) {
      const offline = Object.entries(uiState.health).filter(([,v])=>!v).map(([k])=>k);
      if (offline.length) lines.push(`UI shows offline: ${offline.join(', ')}`);
    }
    const allOk = gdOk && cxOk && orOk;
    return (allOk ? 'All core services online\n' : 'Some services offline\n') + lines.join('\n');
  }

  // "what's the cfr" / "cfr state" / "sigma" / "regime"
  if (/(cfr|sigma|regime|coherence|entropy|friction)/i.test(p)) {
    const d = await _fetch(`${CX_URL}/cfr/health`);
    if (!d) return 'CFR unavailable — is Cortex online?';
    const ok = d.status==='ok'||d.ok;
    const f = d.field || d;
    const sigma = typeof f.sigma==='number' ? f.sigma : (f.sigma?.score ?? 0);
    const regime = d.regime || f.regime || '?';
    const lines = [
      `CFR field ${ok?'✓':'✗'}`,
      `Regime: ${regime}`,
      `Sigma: ${sigma.toFixed(3)}`,
    ];
    if (f.coherence !== undefined) lines.push(`Coherence: ${f.coherence.toFixed(3)}`);
    if (f.friction  !== undefined) lines.push(`Friction:  ${f.friction.toFixed(3)}`);
    if (f.entropy   !== undefined) lines.push(`Entropy:   ${f.entropy.toFixed(3)}`);
    const qual = sigma < 0.35 ? 'stable' : sigma < 0.7 ? 'elevated' : 'critical';
    lines.push(`Field: ${qual}`);
    return lines.join('\n');
  }

  // "what patterns" / "any patterns" / "patterns"
  if (/(patterns?|crystallised|crystal)/i.test(p) && !/how|why|explain/i.test(p)) {
    const d = await _fetch(`${CX_URL}/api/intelligence/patterns?limit=8`);
    const pats = (d?.patterns||[]).filter(p=>p.crystallised).slice(0,6);
    if (!pats.length) return 'No patterns crystallised yet.';
    return `${pats.length} crystallised patterns:
` +
      pats.map(pt => `  ${pt.description?.slice(0,80)||pt.signature}`).join('\n');
  }

  // "what providers" / "connected tabs" / "which agents"
  if (/(providers?|connected|tabs?|ncp|agents?)/i.test(p) && !/explain|what is/i.test(p)) {
    const d = await _fetch(`${GD_URL}/providers`);
    const chs = Object.entries(d?.channels||{});
    if (!chs.length) return 'No NCP providers connected. Open a userscript tab.';
    return `${chs.length} provider${chs.length===1?'':'s'} connected:
` +
      chs.map(([name,ch]) => {
        const hb = ch.lastHeartbeat ? Math.round((Date.now()-ch.lastHeartbeat)/1000) : null;
        return `  ${name}: tab ${ch.tabId?.slice(0,10)||'?'} ${hb!==null ? (hb<15?'♥ live':`stale ${hb}s`) : ''}`;
      }).join('\n');
  }

  // "what's on this page" / "what am I looking at" / "current channel"
  if (/(this page|this channel|looking at|on screen|what('s| is) (here|this|on))/i.test(p)) {
    const chName = _currentChannelName;
    const chId   = _currentChannel;
    const probe  = CHANNEL_PROBES[chId] || CHANNEL_PROBES['ch-overview'];
    try {
      const diagnosis = await probe(GD_URL, CX_URL, OR_URL);
      return `You are on: ${chName}
${diagnosis}`;
    } catch(_) {
      return `You are on: ${chName} (${chId})`;
    }
  }

  // "recent notes" / "my notes" / "what did i save"
  if (/(notes?|saved|remember|what did i)/i.test(p)) {
    const um = safeRequire('../../../lib/user-model');
    const notes = um?.recentNotes ? um.recentNotes(5) : [];
    if (!notes.length) return 'No notes saved yet. Use "note: <text>" to save one.';
    return `Your last ${notes.length} notes:
` +
      notes.map(n=>`  "${n.text.slice(0,80)}" (${n.channel||'?'})`).join('\n');
  }

  // "rca" / "root cause" / "why is cortex crashing" / "what's broken"
  if (/(rca|root cause|why.{0,20}(cortex|guardian|crash|offline)|what('s| is) (broken|wrong with the system))/i.test(p)) {
    const d = await _fetch(`${CX_URL}/api/intelligence/rca?limit=3`);
    const findings = d?.findings || [];
    if (!findings.length) return 'No RCA findings yet. Wait for the intelligence engine to crystallise patterns (2+ min uptime).';
    return findings.map(f =>
      `[${f.severity}] ${f.name}
  ${f.rootCause?.slice(0,120)}
  Fix: ${f.fix?.slice(0,80)}`
    ).join('\n\n');
  }

  // Can't answer from data — return null to let Ollama handle it
  return null;
}

async function handlePrompt(prompt, opts={}) {
  if (!prompt || typeof prompt !== 'string') return { ok:false, error:'prompt required' };
  const uiState = opts.uiState || null;  // live UI snapshot from the browser

  const requestId = crypto.randomUUID();
  const now = Date.now();

  // Session context from UI (channel co-pilot is currently on)
  const channel = opts.channel || _currentChannel;
  const channelName = opts.channelName || _currentChannelName;

  if (_jaa) {
    try { _jaa.insert('event_log', { uuid:crypto.randomUUID(), type:'copilot.prompt', source:MODULE_ID, ts:now,
      payload:{ requestId, prompt:prompt.slice(0,500), channel } }); } catch(_) {}
  }

  // ── User model: record intent ─────────────────────────────────────────────
  const um = safeRequire('../../../lib/user-model');
  if (um?.recordIntent) um.recordIntent('question', prompt, channel);

  // ── Step 1: Classify ──────────────────────────────────────────────────────
  const classification = await _classify(prompt);

  // ── Step 2: Navigate ──────────────────────────────────────────────────────
  if (classification.intent === 'navigate' && classification.channelId) {
    if (um?.recordChannelVisit) um.recordChannelVisit(classification.channelId, classification.target);
    _logEvent('copilot.navigate', { requestId, channelId:classification.channelId });
    const navUi = { command:'tuneById', arg: classification.channelId };
    // Also spotlight the destination tile on arrival
    const destTile = {
      'ch-guardian':'guardian','ch-cortex':'cortex','ch-idearium':'idearium',
      'ch-diagnose':'diagnostic','ch-bridge':'bridge','ch-blueprint':'blueprint',
      'ch-orch-full':'orchestrator',
    }[classification.channelId];
    if (destTile) { navUi.spotlight = destTile; navUi.spotlightTtl = 3000; }
    return {
      ok:true, requestId, classification,
      action: 'navigate',
      channelId: classification.channelId,
      text: `Going to ${classification.target}…`,
      ui: navUi,
    };
  }

  // ── Step 3: Note-taking ───────────────────────────────────────────────────
  if (classification.intent === 'note' && classification.text) {
    const noteText = classification.text;
    // Save to JAA user_notes
    let noteId = null;
    if (um?.saveNote) noteId = um.saveNote(noteText, channel, ['copilot','user']);
    // Save to Idearium
    try {
      await fetch('http://127.0.0.1:4800/api/ideas', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ text: noteText, tags:['copilot','note','user'], compartment:'copilot-notes' }),
        signal: AbortSignal.timeout(2000),
      });
    } catch(_) {}
    _logEvent('copilot.note', { requestId, noteId, channel });
    return {
      ok:true, requestId, classification, modelUsed:'data-only', channel,
      text: `Saved: "${noteText.slice(0,60)}${noteText.length>60?'…':''}"`,
      noteId,
    };
  }

  // ── Step 3.5: Build dispatch ─────────────────────────────────────────────────
  // "build X" → POST /build → T2 gate → Ollama → files
  // This is the primary NEXUS capability. The loop closes here.
  if (classification.intent === 'build') {
    const target = classification.target || prompt.replace(/^(build|compile|generate|create|make)\s+/i, '').trim();

    // Check if there's a matching spec in Idearium
    let specPath = null;
    let specText = null;
    try {
      const d = await _fetch(`${IDR_URL}/api/ideas?q=${encodeURIComponent(target)}&limit=1`);
      const idea = (d?.ideas || d?.rows || [])[0];
      if (idea?.body?.trim().startsWith('spec:')) {
        specText = idea.body;
      }
    } catch(_) {}

    // Build a minimal spec from the target name if nothing found
    if (!specText && !specPath) {
      specText = [
        `spec:`,
        `  meta:`,
        `    name: ${target.replace(/\s+/g, '-').toLowerCase()}`,
        `    version: 0.1.0`,
        `    purpose: ${target}`,
        `  intent: ${target}`,
        `  modules:`,
        `    - name: ${target.replace(/\s+/g, '-').toLowerCase()}`,
        `      intent: ${target}`,
        `      tier: T2`,
        `      generationReadiness: 0.9`,
      ].join('\n');
    }

    try {
      const r = await _post(`${GD_URL}/build`, {
        specText, name: target.replace(/\s+/g,'-').toLowerCase(),
        provider: 'ollama', proof: { source:'copilot', session:requestId },
      });
      const text = r?.ok
        ? `Building: ${target}\n${r.summary || 'Dispatched to Ollama via SEAM queue.'}`
        : `Build failed: ${r?.error || r?.summary || 'unknown error'}`;
      return { ok:true, requestId, classification, text, modelUsed:'build-pipeline', channel };
    } catch(e) {
      return { ok:true, requestId, classification, modelUsed:'data-only', channel,
        text: `Build dispatch failed: ${e.message}. Is Guardian running?` };
    }
  }

  // ── Step 4: Page diagnosis ────────────────────────────────────────────────
  if (classification.intent === 'diagnose') {
    const diagnosis = await _diagnosePage(channel);
    // Log errors found to user model
    if (um?.recordError && /✗|error|offline|failed|timeout/i.test(diagnosis)) {
      um.recordError(diagnosis, channel, 'medium');
    }
    _logEvent('copilot.diagnose', { requestId, channel });
    return {
      ok:true, requestId, classification, modelUsed:'data-only', channel,
      text: `[Diagnosing ${channelName}]\n${diagnosis}`,
    };
  }

  // ── Step 5: Tool execution ────────────────────────────────────────────────
  if (classification.intent === 'tool' && classification.tool) {
    const cmd = classification.tool.startsWith('/')
      ? classification.tool.slice(1).trim() : classification.tool.trim();
    const isReadOnly = /^(gaps|jobs|health|stats|providers|ledger|bus|seam|sessions|ideas|status|version|patterns|cfr|artifacts)/.test(cmd);
    if (!isReadOnly && _raid?._approveTool) {
      const approval = _raid._approveTool(SOURCE, cmd, { action:'tool', proof:opts.proof });
      if (!approval.approved) return { ok:false, requestId, denied:true, reason:approval.reason, text:`RAID denied: ${approval.reason}` };
    }
    if (!_execFn) return { ok:false, requestId, text:'Tool execution not available — execFn not wired.' };
    let toolResult = null;
    try { toolResult = await _execFn(cmd, { source:SOURCE, requestId }); }
    catch(e) { toolResult = { ok:false, error:e.message }; }
    const rd = toolResult?.result ?? toolResult;
    let text;
    if (rd?.gaps) {
      const g=rd.gaps; text=g.length?`${g.length} gap${g.length===1?'':'s'}:\n`+g.slice(0,10).map(x=>`  [${x.severity||'?'}] ${x.type}: ${(x.body||'').slice(0,80)}`).join('\n'):'No gaps ✓';
    } else if (rd?.jobs) {
      const j=rd.jobs; text=j.length?`${j.length} job${j.length===1?'':'s'}:\n`+j.slice(0,10).map(x=>`  [${x.status}] ${x.provider}: ${(x.prompt||'').slice(0,70)}`).join('\n'):'No jobs.';
    } else { text=JSON.stringify(rd,null,2).slice(0,1200); }
    if (um?.recordIntent) um.recordIntent('tool', cmd, channel);
    _logEvent('copilot.tool_exec', { requestId, cmd });
    return { ok:true, requestId, text, toolResult, classification, modelUsed:'data-only', channel };
  }

  // ── Step 6: Token-efficient answer strategy ──────────────────────────────
  // §TOKEN-FIRST: Co-pilot tries to answer from live data before calling Ollama.
  // Ollama is expensive (45s+ for Mistral). Most questions about system state
  // can be answered by reading APIs directly and composing a plain-English reply.
  // Only fall through to Mistral for reasoning, synthesis, or open questions.

  // Try data-only answer first
  const dataAnswer = await _tryDataAnswer(prompt, classification, channel, uiState);
  if (dataAnswer) {
    // We answered without Ollama — log and return
    if (_jaa) {
      try {
        _jaa.insert('chat_log', {
          uuid: crypto.randomUUID(), jobId: requestId, provider: 'copilot',
          prompt: prompt.slice(0,2000), response: dataAnswer.slice(0,5000),
          intent: classification.intent, tool: null, channel,
          modelUsed: 'data-only', fromGrammar: false, contextLayers: 1,
          ts: now, source: 'copilot',
        });
      } catch(_) {}
    }
    if (um?.recordIntent) um.recordIntent('question', prompt, channel);
    const uiInstructions = _buildUIInstructions(prompt, classification, dataAnswer, channel);
    return { ok:true, requestId, text: dataAnswer, modelUsed:'data-only',
      classification, channel, tokensUsed:0,
      ...(uiInstructions ? { ui: uiInstructions } : {}) };
  }

  // Build 7-layer snapshot for Ollama context
  let snapshotText = '';
  try {
    const ctx = safeRequire('../../../lib/copilot-context');
    if (ctx?.assemble) {
      const snap = await ctx.assemble({ eventBuffer:recentEvents(50), intent:prompt, timeoutMs:2500 });
      snapshotText = snap?.text || '';
    }
  } catch(e) { console.warn(`[${MODULE_ID}] context: ${e.message}`); }

  // User model context
  let userCtx = '';
  try { if (um?.buildUserContext) userCtx = um.buildUserContext(); } catch(_) {}

  // Recent notes
  let notesCtx = '';
  try {
    const notes = um?.recentNotes ? um.recentNotes(3) : [];
    if (notes.length) notesCtx = '\nRECENT NOTES:\n' + notes.map(n=>`  "${n.text.slice(0,60)}"`).join('\n');
  } catch(_) {}

  // Related topics from lattice
  let related = [];
  try { if (um?.getRelated) related = um.getRelated(prompt.split(' ')[0]?.toLowerCase(), 5); } catch(_) {}

  // Build UI state section for system prompt
  let uiSection = '';
  if (uiState) {
    const lines = [`UI STATE (live from browser):`];
    if (uiState.health && Object.keys(uiState.health).length) {
      const up = Object.entries(uiState.health).filter(([,v])=>v).map(([k])=>k);
      const dn = Object.entries(uiState.health).filter(([,v])=>!v).map(([k])=>k);
      if (up.length) lines.push(`  online: ${up.join(', ')}`);
      if (dn.length) lines.push(`  OFFLINE: ${dn.join(', ')}`);
    }
    if (uiState.causal?.topNodes?.length) {
      lines.push(`  causal graph: ${uiState.causal.nodeCount} nodes · σ_max ${uiState.causal.maxSigma}`);
      lines.push(`  top nodes: ${uiState.causal.topNodes.map(n=>`${n.label}(σ${n.sigma})`).join(', ')}`);
    }
    if (uiState.organisms?.length) {
      lines.push(`  canvas organisms: ${uiState.organisms.map(o=>o.label+(o.online?'✓':'✗')).join(', ')}`);
    }
    uiSection = lines.join('\n');
  }

  const systemPrompt = [
    `You are the NEXUS co-pilot. You live in the floating menu of the TV-channel UI.`,
    `You know every channel: guardian, cortex, idearium, bridge, diagnostics, blueprint, causal graph, conversations, canvas.`,
    `You can navigate, diagnose pages, take notes, answer questions, and read what's on the current screen.`,
    `Current channel: ${channelName} (${channel}).`,
    `Ground every answer in live system data. Never fabricate state.`,
    '',
    snapshotText ? `LIVE SYSTEM STATE:\n${snapshotText}` : '[live state unavailable]',
    uiSection ? `\n${uiSection}` : '',
    '',
    userCtx ? userCtx : '',
    notesCtx || '',
    related.length ? `\nLATTICE — topics this user associates with: ${related.join(', ')}` : '',
    '',
    `CHANNELS: overview, guardian, cortex, idearium, bridge, log, diagnose, blueprint`,
    `TOOLS: /gaps /jobs /health /providers /status /patterns /cfr /artifacts`,
    `COMMANDS: note:<text> · diagnose · go to <channel>`,
  ].filter(Boolean).join('\n');

  let text, modelUsed;
  try {
    const result = await _generate(systemPrompt, prompt, false);
    text = result.text; modelUsed = result.model;
  } catch(e) {
    text = [`Ollama offline (${e.message}).`, '', snapshotText||'System state unavailable.', '', 'Run: ollama serve'].join('\n');
    modelUsed = null;
  }

  if (um?.recordIntent) um.recordIntent('question', prompt, channel);
  _logEvent('copilot.reply', { requestId, modelUsed, channel });

  // §LAW II — log co-pilot conversation turn to chat_log
  if (_jaa) {
    try {
      _jaa.insert('chat_log', {
        uuid:      crypto.randomUUID(),
        jobId:     requestId,
        provider:  'copilot',
        prompt:    prompt.slice(0, 2000),
        response:  text.slice(0, 5000),
        intent:    classification.intent,
        tool:      classification.tool || null,
        channel,
        modelUsed: modelUsed || 'none',
        fromGrammar: classification.fromGrammar || false,
        componentId: classification.componentId || null,
        contextLayers: snapshotText ? 7 : 0,
        ts: now,
        source: 'copilot',
      });
    } catch(_) {}
  }

  // Build UI instructions — spotlight, steps, tension — based on what the user asked
  const uiInstructions = _buildUIInstructions(prompt, classification, snapshotText, channel);

  return { ok:true, requestId, text, modelUsed, classification, channel,
    ...(uiInstructions ? { ui: uiInstructions } : {}) };
}

// ── Called by UI when user changes channel ────────────────────────────────────
function setCurrentChannel(channelId, channelName) {
  _currentChannel = channelId;
  _currentChannelName = channelName;
  const um = safeRequire('../../../lib/user-model');
  if (um?.recordChannelVisit) um.recordChannelVisit(channelId, channelName);
}

function status() {
  return { version:VERSION, listening:_listening, eventBufferSize:_eventBuffer.length,
    currentChannel:_currentChannel, raidAvailable:!!_raid?._approveTool, models:MODEL_PRIORITY };
}

function stop() {
  if (_pollTimer) { clearInterval(_pollTimer); _pollTimer=null; }
  _listening=false;
}

module.exports = { init, stop, handlePrompt, setCurrentChannel, recentEvents, status, MODULE_ID, VERSION };
