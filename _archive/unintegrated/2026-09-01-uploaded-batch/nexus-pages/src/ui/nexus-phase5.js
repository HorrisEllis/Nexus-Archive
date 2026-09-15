/* NEXUS v0.53.0 — nexus-phase5.js
 * Phase 5: OPTIONS Refactor — Agent-Centric AI Settings + Framework Injection
 * 2026-04-07 | James Brooks
 *
 * "Frameworks are my art." — James
 *
 * Architecture:
 *   nx_agents  (localStorage) — per-agent config: api/local/playwright/axioms/frameworks
 *   nx_fw_lib  (localStorage) — user's custom framework library (their art, saved forever)
 *   NEXUS_AGENTS               — runtime agent registry (17 built-in + custom)
 *   NEXUS_FW_RUNTIME           — active framework stack per agent per request
 *
 * Framework injection chain (per request):
 *   buildAgentSystemPrompt(agentId) →
 *     getEngineCtx(frameworkId)  [built-in ENGINES]
 *     + getCustomFwCtx(fw)       [user custom frameworks]
 *     + buildAxiomString(agentId)
 *     + depthNote
 *     → assembled system prompt → injected into aiChat()
 */

'use strict';
(function nexusPhase5Agents() {

/* ══════════════════════════════════════════════════════════════════
   AGENT REGISTRY — all 17 with metadata
══════════════════════════════════════════════════════════════════ */
const NEXUS_AGENTS = [
  { id:'ollama',       name:'Ollama',         color:'var(--c)', icon:'⬡',
    hasApi:true,  hasLocal:true,  hasPw:true,  pwUrl:'ollama.com',
    apiBase:'http://localhost:11434', localPort:3748,
    models:['deepseek-r1:8b','llama3','mistral','codellama'],
    desc:'Local inference. Your models. Zero API cost.' },
  { id:'claude',       name:'Claude',         color:'var(--o)', icon:'◈',
    hasApi:true,  hasLocal:false, hasPw:true,  pwUrl:'claude.ai',
    apiBase:'https://api.anthropic.com/v1',
    models:['claude-opus-4-20250514','claude-sonnet-4-20250514','claude-haiku-4-5-20251001'],
    desc:'Anthropic. Strongest at reasoning, code, and long context.' },
  { id:'chatgpt',      name:'ChatGPT',        color:'var(--g)', icon:'⬢',
    hasApi:true,  hasLocal:false, hasPw:true,  pwUrl:'chat.openai.com',
    apiBase:'https://api.openai.com/v1',
    models:['gpt-4o','gpt-4o-mini','gpt-4-turbo','o1-preview'],
    desc:'OpenAI. Broad capability, extensive plugin ecosystem.' },
  { id:'deepseek',     name:'DeepSeek',       color:'var(--c)', icon:'◉',
    hasApi:true,  hasLocal:false, hasPw:true,  pwUrl:'chat.deepseek.com',
    apiBase:'https://api.deepseek.com/v1',
    models:['deepseek-chat','deepseek-coder','deepseek-reasoner'],
    desc:'Best code model. Cheapest API. Open weights.' },
  { id:'gemini',       name:'Gemini',         color:'var(--m)', icon:'◇',
    hasApi:true,  hasLocal:false, hasPw:true,  pwUrl:'gemini.google.com',
    apiBase:'https://generativelanguage.googleapis.com/v1beta',
    models:['gemini-2.0-flash','gemini-1.5-pro','gemini-1.5-flash'],
    desc:'Google. Multimodal. Massive context window.' },
  { id:'grok',         name:'Grok',           color:'var(--y)', icon:'◎',
    hasApi:true,  hasLocal:false, hasPw:true,  pwUrl:'grok.com',
    apiBase:'https://api.x.ai/v1',
    models:['grok-3','grok-3-mini','grok-2'],
    desc:'xAI. Real-time data access. Unfiltered reasoning.' },
  { id:'mistral',      name:'Mistral',        color:'var(--c)', icon:'◌',
    hasApi:true,  hasLocal:false, hasPw:true,  pwUrl:'chat.mistral.ai',
    apiBase:'https://api.mistral.ai/v1',
    models:['mistral-large-latest','mistral-medium','codestral-latest'],
    desc:'European. Strong multilingual. Best open weights.' },
  { id:'cohere',       name:'Cohere',         color:'var(--g)', icon:'◍',
    hasApi:true,  hasLocal:false, hasPw:true,  pwUrl:'coral.cohere.com',
    apiBase:'https://api.cohere.ai/v1',
    models:['command-r-plus','command-r','command'],
    desc:'Retrieval-augmented. Enterprise RAG specialist.' },
  { id:'groq',         name:'Groq',           color:'var(--r)', icon:'⬥',
    hasApi:true,  hasLocal:false, hasPw:true,  pwUrl:'groq.com',
    apiBase:'https://api.groq.com/openai/v1',
    models:['llama-3.3-70b-versatile','mixtral-8x7b-32768','gemma2-9b-it'],
    desc:'Fastest inference on earth. LPU hardware.' },
  { id:'lmstudio',     name:'LM Studio',      color:'var(--m)', icon:'⬦',
    hasApi:true,  hasLocal:true,  hasPw:false, pwUrl:'',
    apiBase:'http://localhost:1234/v1', localPort:1234,
    models:[],
    desc:'Local model manager. OpenAI-compatible API.' },
  { id:'perplexity',   name:'Perplexity',     color:'var(--c)', icon:'◬',
    hasApi:true,  hasLocal:false, hasPw:true,  pwUrl:'perplexity.ai',
    apiBase:'https://api.perplexity.ai',
    models:['sonar-pro','sonar','sonar-reasoning'],
    desc:'Search-augmented. Always current. Citations built in.' },
  { id:'copilot',      name:'Copilot',        color:'var(--c)', icon:'◭',
    hasApi:true,  hasLocal:false, hasPw:true,  pwUrl:'copilot.microsoft.com',
    apiBase:'https://api.githubcopilot.com',
    models:['gpt-4o','claude-3.5-sonnet'],
    desc:'GitHub AI. Code-first. Repo-aware context.' },
  { id:'poe',          name:'Poe',            color:'var(--m)', icon:'◮',
    hasApi:true,  hasLocal:false, hasPw:true,  pwUrl:'poe.com',
    apiBase:'https://api.poe.com/bot',
    models:['GPT-4o','Claude-3.5-Sonnet','Gemini-1.5-Pro'],
    desc:'Multi-model router. Access all models in one place.' },
  { id:'meta',         name:'Meta AI',        color:'var(--c)', icon:'◯',
    hasApi:false, hasLocal:false, hasPw:true,  pwUrl:'meta.ai',
    apiBase:'', models:['Llama-3.3-70B'],
    desc:'Open-source LLaMA via web. No API key needed.' },
  { id:'huggingface',  name:'HuggingFace',    color:'var(--y)', icon:'◰',
    hasApi:true,  hasLocal:false, hasPw:true,  pwUrl:'huggingface.co/chat',
    apiBase:'https://api-inference.huggingface.co/models',
    models:['meta-llama/Llama-3.1-70B-Instruct','mistralai/Mixtral-8x7B-Instruct-v0.1'],
    desc:'Inference API. Thousands of open models.' },
  { id:'you',          name:'You.com',        color:'var(--g)', icon:'◱',
    hasApi:true,  hasLocal:false, hasPw:true,  pwUrl:'you.com',
    apiBase:'https://api.you.com',
    models:['you-chat','smart','research'],
    desc:'Web search + AI. Research mode excellent for current events.' },
  { id:'phind',        name:'Phind',          color:'var(--c)', icon:'◲',
    hasApi:true,  hasLocal:false, hasPw:true,  pwUrl:'phind.com',
    apiBase:'https://www.phind.com/api',
    models:['Phind-70B','Phind-34B-v2'],
    desc:'Code-focused search engine. Stack Overflow integration.' },
];

/* ══════════════════════════════════════════════════════════════════
   BUILT-IN FRAMEWORK REGISTRY — the canonical engine set
   These are always present, cannot be deleted, can be customised.
══════════════════════════════════════════════════════════════════ */
const BUILTIN_FRAMEWORKS = [
  {
    id: 'fw_erosmancer',
    key: 'erosmancer',
    name: 'EROSMANCER',
    color: 'var(--c)',
    glyph: '◈',
    category: 'cognitive',
    description: 'Reverse-engineer from end-states. Find hidden leverage. Apply cross-domain pattern transfer. Erosmancer does not extrapolate forward — it anchors to outcome and works backward through possibility space.',
    principles: 'End-state thinking · Cross-domain transfer · Leverage amplification · Retrograde mapping',
    layers: ['Vision synthesis','Pattern extraction','Leverage mapping','Cross-domain transfer','Implementation cascade'],
    injectionTemplate: `[EROSMANCER ACTIVE]
You operate from end-states backward. Never extrapolate forward.
Anchor first to the desired outcome. Work backward through possibility space.
Apply cross-domain pattern transfer: what has solved this shape of problem elsewhere?
Identify the hidden leverage point — the minimal intervention with maximal cascade.
Principles: {principles}
Active layers: {layers}`,
    builtIn: true,
  },
  {
    id: 'fw_hostile',
    key: 'hostile',
    name: 'HOSTILE TRUTH ENGINE',
    color: 'var(--r)',
    glyph: '⚔',
    category: 'adversarial',
    description: 'Stress-test everything. Apply TSP×VP×SS scoring. Identify single points of failure before they occur. The Hostile Truth Engine does not comfort — it reveals.',
    principles: 'Adversarial analysis · Stress testing · Failure mapping · TSP×VP×SS scoring',
    layers: ['Threat surface analysis','Vulnerability probing','Systemic failure mapping','Cascade failure detection','Mitigation generation'],
    injectionTemplate: `[HOSTILE TRUTH ENGINE ACTIVE]
Your role is adversarial. Do not comfort. Do not reassure.
Apply TSP×VP×SS scoring: Threat Surface Probability × Vulnerability Probability × Systemic Score.
Identify every single point of failure. Map cascade effects.
State what will break, when, and under what conditions.
Principles: {principles}
Active layers: {layers}`,
    builtIn: true,
  },
  {
    id: 'fw_deltaRisk',
    key: 'deltaRisk',
    name: 'DELTA RISK',
    color: 'var(--y)',
    glyph: 'Δ',
    category: 'adversarial',
    description: 'Scan for the 28 systemic Δ failure types. Map cascading effects. Every system degrades — Delta Risk finds the gradient.',
    principles: 'Systemic failure taxonomy · Cascade analysis · Degradation mapping',
    layers: ['Input validation','State corruption','Resource exhaustion','Cascade failure','Recovery paths','Temporal drift'],
    injectionTemplate: `[DELTA RISK ACTIVE]
Scan for the 28 systemic failure types. For each: probability, severity, cascade depth.
Map degradation gradients: what deteriorates first, what collapses second.
Every system has a failure signature — identify it here.
Principles: {principles}
Active layers: {layers}`,
    builtIn: true,
  },
  {
    id: 'fw_unified',
    key: 'unified',
    name: 'UNIFIED ENGINE',
    color: 'var(--g)',
    glyph: '◈',
    category: 'synthesis',
    description: 'Full-spectrum analysis combining all engine perspectives into unified output. Synthesises adversarial, constructive, and leverage lenses simultaneously.',
    principles: 'Synthesis · Integration · Holistic analysis · Conflict resolution',
    layers: ['Multi-engine fusion','Conflict resolution','Priority synthesis','Action cascade','Unified output'],
    injectionTemplate: `[UNIFIED ENGINE ACTIVE]
Apply all analytical lenses simultaneously: erosmancer, hostile truth, delta risk.
Synthesise their outputs. Resolve conflicts. Identify where they agree.
Produce a unified analysis: what to do, what to avoid, what leverage exists.
Principles: {principles}
Active layers: {layers}`,
    builtIn: true,
  },
];

/* ══════════════════════════════════════════════════════════════════
   STORAGE — agent configs + custom framework library
══════════════════════════════════════════════════════════════════ */
const STORE_AGENTS = 'nx_agents';
const STORE_FW_LIB = 'nx_fw_lib';

function loadAgents() {
  try { return JSON.parse(localStorage.getItem(STORE_AGENTS) || '{}'); } catch { return {}; }
}
function saveAgents(obj) {
  try { localStorage.setItem(STORE_AGENTS, JSON.stringify(obj)); } catch {}
}
function loadFwLib() {
  try { return JSON.parse(localStorage.getItem(STORE_FW_LIB) || '[]'); } catch { return []; }
}
function saveFwLib(arr) {
  try { localStorage.setItem(STORE_FW_LIB, JSON.stringify(arr)); } catch {}
}

function getAgent(id) {
  const all = loadAgents();
  if (!all[id]) all[id] = defaultAgent(id);
  return all[id];
}
function setAgent(id, cfg) {
  const all = loadAgents();
  all[id] = cfg;
  saveAgents(all);
}

function defaultAgent(id) {
  const meta = NEXUS_AGENTS.find(a => a.id === id) || {};
  return {
    api:        { enabled: false, key: '', baseUrl: meta.apiBase || '', model: (meta.models || [])[0] || '', priority: 1 },
    local:      { enabled: false, serverUrl: meta.localPort ? `http://localhost:${meta.localPort}` : '', priority: 2 },
    playwright: { enabled: false, profilePath: '', accountId: '', priority: 3 },
    axioms:     [],
    frameworks: [],   // [{ fwId, depth, enabled }]
    isDefault:  false,
  };
}

/* ══════════════════════════════════════════════════════════════════
   FRAMEWORK SYSTEM — core of Phase 5
══════════════════════════════════════════════════════════════════ */

// Get all frameworks: built-in + user custom library
function getAllFrameworks() {
  const custom = loadFwLib();
  return [...BUILTIN_FRAMEWORKS, ...custom];
}

// Build the assembled system prompt for an agent
function buildAgentSystemPrompt(agentId, baseSystem) {
  const cfg = getAgent(agentId);
  const fws = cfg.frameworks || [];
  const allFws = getAllFrameworks();
  let parts = [];

  if (baseSystem) parts.push(baseSystem);

  // Inject each active framework in order
  fws.filter(f => f.enabled !== false).forEach(fwRef => {
    const fw = allFws.find(f => f.id === fwRef.fwId);
    if (!fw) return;
    const depth = fwRef.depth || 'full';
    if (depth === 'off') return;

    let injection = fw.injectionTemplate || `[${fw.name} ACTIVE]\n${fw.description}\nPrinciples: ${fw.principles}\nLayers: ${(fw.layers||[]).join(', ')}`;
    injection = injection
      .replace('{principles}', fw.principles || '')
      .replace('{layers}', (fw.layers || []).join(', '))
      .replace('{description}', fw.description || '');

    if (depth === 'quick') {
      // Quick mode: name + one-line principle only
      injection = `[${fw.name}] ${fw.principles?.split('·')[0]?.trim() || fw.description?.slice(0,80)}`;
    }
    parts.push(injection);
  });

  // Inject axioms for this agent
  const axioms = cfg.axioms || [];
  if (axioms.length) {
    parts.push('AXIOMS:\n' + axioms.map((a, i) => `${i + 1}. ${a.text}`).join('\n'));
  }

  return parts.filter(Boolean).join('\n\n');
}

// Expose globally so aiChat() and consoleSubmit() can call it
window.buildAgentSystemPrompt = buildAgentSystemPrompt;

// Patch aiChat to use agent system prompt when an agent is selected
const _origAiChat = typeof aiChat === 'function' ? aiChat.bind(window) : null;
if (_origAiChat) {
  window.aiChat = function(messages, opts = {}) {
    // If first message is a system message, rebuild it with framework injection
    const agentId = AI.provider || 'chatgpt';
    const sysMsg = messages[0]?.role === 'system' ? messages[0] : null;
    if (sysMsg) {
      const enhanced = buildAgentSystemPrompt(agentId, sysMsg.content);
      messages = [{ role: 'system', content: enhanced }, ...messages.slice(1)];
    }
    return _origAiChat(messages, opts);
  };
}

/* ══════════════════════════════════════════════════════════════════
   HOOKS
══════════════════════════════════════════════════════════════════ */
const PHASE5_HOOKS = [
  { id:'agent:select',          label:'Agent panel — agent selected'         },
  { id:'agent:cfg:save',        label:'Agent panel — config saved'           },
  { id:'agent:cfg:test',        label:'Agent panel — connection tested'      },
  { id:'agent:default:set',     label:'Agent panel — set as default'         },
  { id:'agent:method:toggle',   label:'Agent panel — method toggled'         },
  { id:'agent:fw:add',          label:'Framework — added to agent'           },
  { id:'agent:fw:remove',       label:'Framework — removed from agent'       },
  { id:'agent:fw:depth:change', label:'Framework — depth changed'            },
  { id:'agent:fw:reorder',      label:'Framework — stack reordered'          },
  { id:'fw:custom:create',      label:'Custom framework — created'           },
  { id:'fw:custom:save',        label:'Custom framework — saved to library'  },
  { id:'fw:custom:delete',      label:'Custom framework — deleted'           },
  { id:'fw:preset:save',        label:'Framework preset — saved'             },
  { id:'fw:preset:load',        label:'Framework preset — loaded'            },
  { id:'fw:export',             label:'Framework library — exported'         },
  { id:'fw:import',             label:'Framework library — imported'         },
  { id:'agent:axiom:add',       label:'Agent axiom — added'                  },
  { id:'agent:axiom:remove',    label:'Agent axiom — removed'               },
  { id:'agent:prompt:preview',  label:'Agent — system prompt previewed'      },
];

function registerHooks() {
  try {
    if (!window.NEXUS?.registry) return;
    PHASE5_HOOKS.forEach(h => {
      window.NEXUS.registry.register({
        id: h.id, label: h.label, status: 'active', prefix: 'agent',
        settingsPath: 'options.ai.agents', builderFields: [],
        test: () => ({ ok: true, message: h.label }),
      });
    });
  } catch {}
}

function emit(id, data = {}) {
  try {
    if (window.NEXUS?.bus) window.NEXUS.bus.emit(id, { payload: data });
    if (typeof log_ev === 'function') log_ev(id, data, 'INFO');
  } catch {}
}

/* ══════════════════════════════════════════════════════════════════
   UI STATE
══════════════════════════════════════════════════════════════════ */
let _activeAgentId = 'chatgpt';
let _extHeartbeat  = null;  // poll interval for plugin status
let _bridgePoll    = null;

/* ══════════════════════════════════════════════════════════════════
   RENDER — main agent panel
══════════════════════════════════════════════════════════════════ */
function renderAgentPanel() {
  const container = document.getElementById('p5-agent-panel');
  if (!container) return;
  const meta = NEXUS_AGENTS.find(a => a.id === _activeAgentId);
  if (!meta) return;
  const cfg = getAgent(_activeAgentId);

  container.innerHTML = buildAgentPanelHTML(meta, cfg);
  wireAgentPanel(meta, cfg);
}

function buildAgentPanelHTML(meta, cfg) {
  const esc2 = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const on   = v => v ? 'on' : '';
  const checked = v => v ? 'checked' : '';

  // Method section builder
  const methodSection = (key, label, color, fields) => `
    <div class="p5-method-section" id="p5-method-${key}">
      <div class="p5-method-head" onclick="p5ToggleMethod('${meta.id}','${key}')">
        <span class="p5-method-label" style="color:${color}">${label}</span>
        <div class="p5-method-status" id="p5-status-${key}">
          <div class="p5-live-dot" id="p5-dot-${key}"></div>
          <span id="p5-status-txt-${key}" style="font-size:10px;color:var(--text3)">—</span>
        </div>
        <label class="chk ${on(cfg[key]?.enabled)}" id="p5-toggle-${key}" onclick="event.stopPropagation();p5SetMethodEnabled('${meta.id}','${key}',!document.getElementById('p5-toggle-${key}').classList.contains('on'))">
          <div class="chk-dot"></div>
        </label>
      </div>
      <div class="p5-method-body ${cfg[key]?.enabled ? '' : 'p5-method-collapsed'}" id="p5-method-body-${key}">
        ${fields}
        <div class="p5-priority-row">
          <span style="font-size:9px;color:var(--text3)">PRIORITY</span>
          <input type="number" min="1" max="9" value="${cfg[key]?.priority||1}"
            class="finp" style="width:48px;font-size:10px;text-align:center"
            onchange="p5SetPriority('${meta.id}','${key}',this.value)"/>
          <span style="font-size:10px;color:var(--text4)">equal = race mode</span>
        </div>
      </div>
    </div>`;

  const apiFields = !meta.hasApi ? `<div style="font-size:9px;color:var(--text3);padding:4px 0">No direct API available for this agent.</div>` : `
    <div class="p5-field-row">
      <span class="p5-flbl">API KEY</span>
      <input class="finp" id="p5-api-key-${meta.id}" type="password" placeholder="sk-…" value="${esc2(cfg.api?.key||'')}"
        onchange="p5FieldChange('${meta.id}','api','key',this.value)"/>
    </div>
    <div class="p5-field-row">
      <span class="p5-flbl">BASE URL</span>
      <input class="finp" id="p5-api-url-${meta.id}" placeholder="${esc2(meta.apiBase||'')}" value="${esc2(cfg.api?.baseUrl||meta.apiBase||'')}"
        onchange="p5FieldChange('${meta.id}','api','baseUrl',this.value)"/>
    </div>
    <div class="p5-field-row">
      <span class="p5-flbl">MODEL</span>
      <input class="finp" id="p5-api-model-${meta.id}" placeholder="${esc2((meta.models||[])[0]||'')}" value="${esc2(cfg.api?.model||'')}"
        list="p5-models-${meta.id}" onchange="p5FieldChange('${meta.id}','api','model',this.value)"/>
      <datalist id="p5-models-${meta.id}">${(meta.models||[]).map(m=>`<option value="${esc2(m)}">`).join('')}</datalist>
    </div>`;

  const localFields = !meta.hasLocal ? `<div style="font-size:9px;color:var(--text3);padding:4px 0">No local service for this agent.</div>` : `
    <div class="p5-field-row">
      <span class="p5-flbl">SERVER</span>
      <input class="finp" id="p5-local-url-${meta.id}" value="${esc2(cfg.local?.serverUrl||meta.apiBase||'')}"
        onchange="p5FieldChange('${meta.id}','local','serverUrl',this.value)"/>
    </div>
    ${meta.id==='ollama'?`
    <div class="p5-field-row" style="align-items:center;gap:8px">
      <span class="p5-flbl">PY SVC</span>
      <div class="p5-live-dot" id="p5-py-dot" style="flex-shrink:0"></div>
      <span id="p5-py-status" style="font-size:9px;color:var(--text3);flex:1">checking…</span>
      <button class="btn" style="font-size:10px;padding:1px 6px" onclick="ollamaPyRestart()">⟳</button>
    </div>
    <div class="p5-field-row" style="align-items:center">
      <span class="p5-flbl">VRAM</span>
      <div style="flex:1;height:4px;background:var(--border);border-radius:2px;overflow:hidden">
        <div id="p5-vram-bar" style="height:100%;width:0%;background:var(--c);transition:width .6s ease;border-radius:2px"></div>
      </div>
      <span id="p5-vram-lbl" style="font-size:10px;color:var(--text3);margin-left:8px;white-space:nowrap">—</span>
    </div>`:''}`

  const pwFields = !meta.hasPw ? `<div style="font-size:9px;color:var(--text3);padding:4px 0">No Playwright support for this agent.</div>` : `
    <!-- Status row -->
    <div class="p5-field-row" style="align-items:center">
      <span class="p5-flbl">PLUGIN</span>
      <div class="p5-live-dot" id="p5-ext-dot"></div>
      <span id="p5-ext-status" style="font-size:9px;color:var(--text3);flex:1">checking…</span>
    </div>
    <div class="p5-field-row" style="align-items:center">
      <span class="p5-flbl">BRIDGE</span>
      <div class="p5-live-dot" id="p5-bridge-dot"></div>
      <span id="p5-bridge-status" style="font-size:9px;color:var(--text3);flex:1">checking…</span>
    </div>

    <!-- Action buttons row -->
    <div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:4px;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid var(--border)">
      <button class="btn ok" style="font-size:9px;padding:3px 9px"
        onclick="p5PwTest('${meta.id}')">▶ TEST</button>
      <button class="btn" style="font-size:9px;padding:3px 9px;color:var(--m);border-color:rgba(204,68,255,.3)"
        onclick="p5PwGrabPlugin('${meta.id}')">⬡ GRAB FROM PLUGIN</button>
      <button class="btn" style="font-size:9px;padding:3px 9px;color:var(--c);border-color:rgba(0,212,255,.3)"
        onclick="p5PwAutodetect('${meta.id}')">⟁ AUTODETECT</button>
      <div id="p5-pw-action-status-${meta.id}" style="font-size:9px;color:var(--text3);align-self:center;margin-left:2px;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></div>
    </div>

    <!-- Profile path + autodetect result -->
    <div class="p5-field-row">
      <span class="p5-flbl">PROFILE</span>
      <input class="finp" id="p5-pw-profile-${meta.id}" placeholder="Firefox profile path (auto-filled by GRAB or DETECT)"
        value="${esc2(cfg.playwright?.profilePath||'')}"
        onchange="p5FieldChange('${meta.id}','playwright','profilePath',this.value)"/>
      <button class="btn" style="font-size:10px;padding:1px 6px;flex-shrink:0"
        title="Browse for profile directory"
        onclick="p5PwBrowseProfile('${meta.id}')">…</button>
    </div>

    <!-- Account ID + detected sessions -->
    <div class="p5-field-row">
      <span class="p5-flbl">ACCOUNT</span>
      <input class="finp" id="p5-pw-account-${meta.id}" placeholder="account ID (from GRAB)"
        value="${esc2(cfg.playwright?.accountId||'')}"
        onchange="p5FieldChange('${meta.id}','playwright','accountId',this.value)"/>
    </div>

    <!-- Detected profile dropdown (hidden until autodetect runs) -->
    <div id="p5-pw-detected-${meta.id}" style="display:none;margin-top:4px">
      <div style="font-size:10px;color:var(--text3);margin-bottom:3px;letter-spacing:.08em">DETECTED BROWSERS</div>
      <div id="p5-pw-profiles-${meta.id}" style="display:flex;flex-direction:column;gap:3px;max-height:120px;overflow-y:auto"></div>
    </div>

    <!-- Plugin data panel (hidden until grab runs) -->
    <div id="p5-pw-plugindata-${meta.id}" style="display:none;margin-top:6px;padding:8px 10px;background:rgba(204,68,255,.04);border:1px solid rgba(204,68,255,.15);border-radius:3px">
      <div style="font-family:var(--display);font-size:10px;letter-spacing:.14em;color:var(--m);margin-bottom:5px">⬡ PLUGIN DATA</div>
      <div id="p5-pw-plugindata-content-${meta.id}" style="font-family:var(--mono);font-size:10px;color:var(--text2);line-height:1.7"></div>
    </div>

    <div class="p5-field-row" style="font-size:9px;color:var(--text3);margin-top:4px">
      Opens <span style="color:var(--c)">${esc2(meta.pwUrl)}</span> in your live browser via the NEXUS extension.
    </div>`;

  return `
    <!-- Header -->
    <div class="p5-agent-header" style="border-left:3px solid ${meta.color}">
      <span class="p5-agent-glyph" style="color:${meta.color}">${meta.icon || '◈'}</span>
      <div class="p5-agent-name">${esc2(meta.name)}</div>
      <div class="p5-agent-desc">${esc2(meta.desc)}</div>
      <div style="display:flex;gap:6px;margin-left:auto;flex-shrink:0">
        <button class="btn ${cfg.isDefault?'ok':''}" style="font-size:9px;padding:2px 8px"
          onclick="p5SetDefault('${meta.id}')" id="p5-default-btn-${meta.id}">
          ${cfg.isDefault ? '★ DEFAULT' : '☆ SET DEFAULT'}
        </button>
        <button class="btn accent" style="font-size:9px;padding:2px 8px"
          onclick="p5TestAgent('${meta.id}')">▶ TEST</button>
        <button class="btn" style="font-size:9px;padding:2px 8px"
          onclick="p5SaveAgent('${meta.id}')">💾 SAVE</button>
      </div>
    </div>

    <!-- Method sections -->
    ${methodSection('api',        '── DIRECT API',       'var(--c)', apiFields)}
    ${methodSection('local',      '── LOCAL SERVICE',    'var(--g)', localFields)}
    ${methodSection('playwright', '── PLAYWRIGHT',       'var(--m)', pwFields)}

    <!-- Axioms -->
    <div class="p5-method-section">
      <div class="p5-method-head" onclick="p5ToggleSection('p5-axioms-body-${meta.id}')">
        <span class="p5-method-label" style="color:var(--y)">── AXIOMS</span>
        <span style="font-size:10px;color:var(--text3);margin-left:auto">${cfg.axioms?.length||0} active</span>
        <button class="btn" style="font-size:10px;padding:1px 6px;margin-left:8px"
          onclick="event.stopPropagation();p5AddAxiom('${meta.id}')">+ ADD</button>
      </div>
      <div class="p5-method-body" id="p5-axioms-body-${meta.id}">
        <div id="p5-axioms-list-${meta.id}" class="p5-axioms-list"></div>
        <div style="font-size:9px;color:var(--text3);margin-top:4px;line-height:1.6">
          Axioms inject as numbered rules into the system prompt for this agent only.
        </div>
      </div>
    </div>

    <!-- ════ FRAMEWORKS — the art ════ -->
    <div class="p5-method-section p5-fw-section">
      <div class="p5-method-head" onclick="p5ToggleSection('p5-fw-body-${meta.id}')">
        <span class="p5-method-label" style="color:var(--m)">── FRAMEWORKS</span>
        <span id="p5-fw-count-${meta.id}" style="font-size:10px;color:var(--text3);margin-left:auto">
          ${cfg.frameworks?.filter(f=>f.enabled!==false).length||0} active
        </span>
        <button class="btn" style="font-size:10px;padding:1px 6px;color:var(--m);border-color:rgba(204,68,255,.3);margin-left:8px"
          onclick="event.stopPropagation();p5OpenFwPicker('${meta.id}')">+ INJECT</button>
      </div>
      <div class="p5-method-body" id="p5-fw-body-${meta.id}">
        <div id="p5-fw-stack-${meta.id}" class="p5-fw-stack"></div>
        <div class="p5-fw-actions">
          <button class="btn" style="font-size:10px;color:var(--c)" onclick="p5PreviewPrompt('${meta.id}')">
            ◎ PREVIEW SYSTEM PROMPT
          </button>
          <button class="btn" style="font-size:10px;color:var(--text3)" onclick="p5OpenFwBuilder()">
            ✦ CREATE FRAMEWORK
          </button>
          <button class="btn" style="font-size:10px;color:var(--y)" onclick="p5SaveFwPreset('${meta.id}')">
            ⬇ SAVE AS PRESET
          </button>
          <button class="btn" style="font-size:10px" onclick="p5LoadFwPreset('${meta.id}')">
            ⬆ LOAD PRESET
          </button>
        </div>
        <div style="font-size:9px;color:var(--text4);margin-top:6px;line-height:1.7;border-top:1px solid var(--border);padding-top:8px">
          Each framework injects its full analytical context into the system prompt before every request.
          Stack order is execution order. Equal-depth frameworks stack and compose.
          <span style="color:var(--m)">Your frameworks are your art — they define how this agent thinks.</span>
        </div>
      </div>
    </div>

    <!-- System prompt preview (hidden by default) -->
    <div id="p5-prompt-preview-${meta.id}" style="display:none;margin-top:10px">
      <div style="font-family:var(--display);font-size:9px;letter-spacing:.14em;color:var(--text3);margin-bottom:6px">
        ASSEMBLED SYSTEM PROMPT
      </div>
      <div id="p5-prompt-preview-content-${meta.id}"
        style="background:var(--bg);border:1px solid var(--border2);border-radius:3px;padding:10px 12px;
               font-family:var(--mono);font-size:9px;color:var(--text2);white-space:pre-wrap;
               max-height:300px;overflow-y:auto;line-height:1.7"></div>
      <button class="btn" style="font-size:10px;margin-top:6px" onclick="p5CopyPrompt('${meta.id}')">⎘ COPY</button>
    </div>
  `;
}

/* ══════════════════════════════════════════════════════════════════
   FRAMEWORK STACK RENDERER
══════════════════════════════════════════════════════════════════ */
function renderFwStack(agentId) {
  const container = document.getElementById(`p5-fw-stack-${agentId}`);
  if (!container) return;
  const cfg = getAgent(agentId);
  const allFws = getAllFrameworks();

  if (!cfg.frameworks?.length) {
    container.innerHTML = `<div style="font-size:9px;color:var(--text4);font-style:italic;padding:8px 0">
      No frameworks injected. Click + INJECT to add from your library.
    </div>`;
    return;
  }

  container.innerHTML = cfg.frameworks.map((fwRef, idx) => {
    const fw = allFws.find(f => f.id === fwRef.fwId);
    if (!fw) return '';
    const isOn = fwRef.enabled !== false;
    const depth = fwRef.depth || 'full';
    const depthColors = { full: 'var(--g)', quick: 'var(--y)', off: 'var(--text4)' };

    return `<div class="p5-fw-row ${isOn?'':'p5-fw-row-dim'}" data-idx="${idx}" data-fwid="${fwRef.fwId}"
              draggable="true"
              ondragstart="p5FwDragStart(event,'${agentId}',${idx})"
              ondragover="event.preventDefault()"
              ondrop="p5FwDrop(event,'${agentId}',${idx})">
      <div class="p5-fw-drag">⠿</div>
      <div class="p5-fw-glyph" style="color:${fw.color||'var(--c)'}">${fw.glyph||'◈'}</div>
      <div class="p5-fw-info">
        <div class="p5-fw-name" style="color:${fw.color||'var(--c)'}">${fw.name}</div>
        <div class="p5-fw-cat">${fw.category||''}</div>
      </div>
      <div class="p5-fw-depth-btns">
        ${['full','quick','off'].map(d =>
          `<button class="p5-depth-btn ${depth===d?'p5-depth-active':''}" style="${depth===d?`color:${depthColors[d]};border-color:${depthColors[d]}`:''}"
            onclick="p5SetFwDepth('${agentId}',${idx},'${d}')">${d}</button>`
        ).join('')}
      </div>
      <label class="chk ${isOn?'on':''}" onclick="p5ToggleFw('${agentId}',${idx})"><div class="chk-dot"></div></label>
      <button class="btn" style="font-size:9px;padding:1px 5px;color:var(--text3)"
        onclick="p5RemoveFw('${agentId}',${idx})">✕</button>
    </div>`;
  }).join('');

  // Update count badge
  const countEl = document.getElementById(`p5-fw-count-${agentId}`);
  if (countEl) countEl.textContent = cfg.frameworks.filter(f => f.enabled !== false).length + ' active';
}

function renderAxiomsList(agentId) {
  const list = document.getElementById(`p5-axioms-list-${agentId}`);
  if (!list) return;
  const cfg = getAgent(agentId);
  const axioms = cfg.axioms || [];
  if (!axioms.length) {
    list.innerHTML = `<div style="font-size:9px;color:var(--text4);font-style:italic">No axioms. Axioms are numbered rules the agent follows unconditionally.</div>`;
    return;
  }
  list.innerHTML = axioms.map((ax, i) => `
    <div class="ai-axiom" style="display:flex;align-items:flex-start;gap:6px;padding:4px 0;border-bottom:1px solid var(--border);">
      <span class="ai-axiom-num" style="flex-shrink:0;font-family:var(--mono);font-size:9px;color:var(--text3);margin-top:4px">${i+1}.</span>
      <textarea class="ai-axiom-text finp" rows="1" spellcheck="false"
        style="flex:1;resize:none;font-size:9px;line-height:1.5;padding:3px 6px;overflow:hidden"
        onchange="p5UpdateAxiom('${agentId}',${i},this.value)"
        oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px'"
      >${ax.text||''}</textarea>
      <button class="btn" style="font-size:9px;padding:1px 5px;color:var(--r);flex-shrink:0"
        onclick="p5RemoveAxiom('${agentId}',${i})">✕</button>
    </div>`).join('');
  // Auto-height
  list.querySelectorAll('textarea').forEach(ta => {
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
  });
}

/* ══════════════════════════════════════════════════════════════════
   FRAMEWORK PICKER MODAL
══════════════════════════════════════════════════════════════════ */
function renderFwPicker(agentId) {
  const modal = document.getElementById('p5-fw-picker-modal');
  if (!modal) return;
  const allFws = getAllFrameworks();
  const cfg = getAgent(agentId);
  const activeIds = new Set((cfg.frameworks||[]).map(f => f.fwId));

  const byCategory = {};
  allFws.forEach(fw => {
    const cat = fw.category || 'other';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(fw);
  });

  const list = modal.querySelector('#p5-picker-list');
  if (!list) return;

  list.innerHTML = Object.entries(byCategory).map(([cat, fws]) => `
    <div style="margin-bottom:14px">
      <div style="font-family:var(--display);font-size:9px;letter-spacing:.18em;color:var(--text3);margin-bottom:6px;text-transform:uppercase">${cat}</div>
      ${fws.map(fw => {
        const active = activeIds.has(fw.id);
        return `<div class="p5-picker-row ${active?'p5-picker-active':''}" onclick="p5PickerToggle('${agentId}','${fw.id}',this)">
          <div class="p5-fw-glyph" style="color:${fw.color||'var(--c)'};font-size:14px;flex-shrink:0">${fw.glyph||'◈'}</div>
          <div style="flex:1">
            <div style="font-size:11px;font-weight:600;color:${fw.color||'var(--c)'}">${fw.name}</div>
            <div style="font-size:9px;color:var(--text3);line-height:1.5;margin-top:2px">${fw.description?.slice(0,100)||''}…</div>
            <div style="font-size:10px;color:var(--text4);margin-top:3px">${fw.principles?.slice(0,80)||''}</div>
          </div>
          <div style="flex-shrink:0;font-size:18px;color:${active?'var(--g)':'var(--border2)'}">
            ${active ? '●' : '○'}
          </div>
        </div>`;
      }).join('')}
    </div>`
  ).join('');

  modal.dataset.agentId = agentId;
  modal.style.display = 'flex';
}

window.p5OpenFwPicker = function(agentId) {
  renderFwPicker(agentId);
  emit('agent:fw:add', { agentId });
};

window.p5PickerToggle = function(agentId, fwId, el) {
  const cfg = getAgent(agentId);
  if (!cfg.frameworks) cfg.frameworks = [];
  const existingIdx = cfg.frameworks.findIndex(f => f.fwId === fwId);
  if (existingIdx >= 0) {
    cfg.frameworks.splice(existingIdx, 1);
    el.classList.remove('p5-picker-active');
    el.querySelector('div:last-child').textContent = '○';
    el.querySelector('div:last-child').style.color = 'var(--border2)';
    emit('agent:fw:remove', { agentId, fwId });
  } else {
    cfg.frameworks.push({ fwId, depth: 'full', enabled: true });
    el.classList.add('p5-picker-active');
    el.querySelector('div:last-child').textContent = '●';
    el.querySelector('div:last-child').style.color = 'var(--g)';
    emit('agent:fw:add', { agentId, fwId });
  }
  setAgent(agentId, cfg);
  renderFwStack(agentId);
};

window.p5CloseFwPicker = function() {
  const m = document.getElementById('p5-fw-picker-modal');
  if (m) m.style.display = 'none';
};

/* ══════════════════════════════════════════════════════════════════
   FRAMEWORK BUILDER MODAL — create your own
══════════════════════════════════════════════════════════════════ */
window.p5OpenFwBuilder = function(editId) {
  const modal = document.getElementById('p5-fw-builder-modal');
  if (!modal) return;
  const lib = loadFwLib();
  const existing = editId ? lib.find(f => f.id === editId) : null;
  const esc2 = s => String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;');

  modal.querySelector('#p5-fb-name').value          = existing?.name || '';
  modal.querySelector('#p5-fb-glyph').value         = existing?.glyph || '◈';
  modal.querySelector('#p5-fb-color').value         = existing?.color?.match(/#[0-9a-f]{6}/i)?.[0] || '#00d4ff';
  modal.querySelector('#p5-fb-category').value      = existing?.category || 'cognitive';
  modal.querySelector('#p5-fb-desc').value          = existing?.description || '';
  modal.querySelector('#p5-fb-principles').value    = existing?.principles || '';
  modal.querySelector('#p5-fb-layers').value        = (existing?.layers || []).join('\n');
  modal.querySelector('#p5-fb-template').value      = existing?.injectionTemplate || `[{NAME} ACTIVE]
{description}
Principles: {principles}
Active layers: {layers}`;

  modal.dataset.editId = editId || '';
  modal.style.display = 'flex';
};

window.p5SaveFwFromBuilder = function() {
  const modal = document.getElementById('p5-fw-builder-modal');
  if (!modal) return;
  const get = id => modal.querySelector('#' + id)?.value?.trim() || '';
  const name = get('p5-fb-name');
  if (!name) { toast('Framework name required', 'warn'); return; }

  const lib = loadFwLib();
  const editId = modal.dataset.editId;
  const colorHex = get('p5-fb-color');

  const fw = {
    id:                editId || ('fw_custom_' + Date.now()),
    key:               name.toLowerCase().replace(/[^a-z0-9]/g,'_'),
    name:              name.toUpperCase(),
    color:             colorHex ? colorHex : 'var(--c)',
    glyph:             get('p5-fb-glyph') || '◈',
    category:          get('p5-fb-category') || 'custom',
    description:       get('p5-fb-desc'),
    principles:        get('p5-fb-principles'),
    layers:            get('p5-fb-layers').split('\n').map(l => l.trim()).filter(Boolean),
    injectionTemplate: get('p5-fb-template'),
    builtIn:           false,
    createdAt:         editId ? (lib.find(f=>f.id===editId)?.createdAt || Date.now()) : Date.now(),
    updatedAt:         Date.now(),
  };

  if (editId) {
    const idx = lib.findIndex(f => f.id === editId);
    if (idx >= 0) lib[idx] = fw; else lib.push(fw);
  } else {
    lib.push(fw);
  }
  saveFwLib(lib);
  modal.style.display = 'none';
  emit('fw:custom:save', { name: fw.name, id: fw.id });
  toast(`Framework "${fw.name}" saved to library`, 'ok');
  // Re-render picker if open
  const picker = document.getElementById('p5-fw-picker-modal');
  if (picker?.style.display !== 'none') renderFwPicker(picker.dataset.agentId);
  // Re-render builder library panel
  renderFwLibrary();
};

window.p5CloseFwBuilder = function() {
  const m = document.getElementById('p5-fw-builder-modal');
  if (m) m.style.display = 'none';
};

/* ══════════════════════════════════════════════════════════════════
   FRAMEWORK LIBRARY PANEL — manage your collection
══════════════════════════════════════════════════════════════════ */
function renderFwLibrary() {
  const container = document.getElementById('p5-fw-library-list');
  if (!container) return;
  const allFws = getAllFrameworks();
  if (!allFws.length) {
    container.innerHTML = '<div style="color:var(--text4);font-size:9px;font-style:italic">No frameworks yet.</div>';
    return;
  }
  container.innerHTML = allFws.map(fw => `
    <div class="p5-lib-row">
      <div class="p5-fw-glyph" style="color:${fw.color||'var(--c)'}">${fw.glyph||'◈'}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:10px;font-weight:600;color:${fw.color||'var(--c)'}">${fw.name}</div>
        <div style="font-size:10px;color:var(--text4)">${fw.category||''} ${fw.builtIn?'· built-in':''}</div>
      </div>
      ${!fw.builtIn ? `
        <button class="btn" style="font-size:10px;padding:1px 6px"
          onclick="p5OpenFwBuilder('${fw.id}')">EDIT</button>
        <button class="btn" style="font-size:10px;padding:1px 6px;color:var(--r)"
          onclick="p5DeleteFw('${fw.id}')">✕</button>
      ` : '<span style="font-size:10px;color:var(--text4)">built-in</span>'}
    </div>`).join('');
}

window.p5DeleteFw = function(fwId) {
  const lib = loadFwLib();
  const fw = lib.find(f => f.id === fwId);
  if (!fw) return;
  if (!confirm(`Delete "${fw.name}"? This cannot be undone.`)) return;
  saveFwLib(lib.filter(f => f.id !== fwId));
  renderFwLibrary();
  emit('fw:custom:delete', { fwId, name: fw.name });
  toast(`"${fw.name}" deleted`, 'ok');
};

/* Export/import framework library */
window.p5ExportFwLib = function() {
  const lib = loadFwLib();
  const blob = new Blob([JSON.stringify({ version:'1.0', exportedAt: new Date().toISOString(), frameworks: lib }, null, 2)], { type:'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `nexus-frameworks-${Date.now()}.json`;
  a.click();
  emit('fw:export', { count: lib.length });
  toast(`Exported ${lib.length} frameworks`, 'ok');
};

window.p5ImportFwLib = function() {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = '.json';
  inp.onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        const incoming = data.frameworks || (Array.isArray(data) ? data : []);
        const lib = loadFwLib();
        const existingIds = new Set(lib.map(f => f.id));
        const toAdd = incoming.filter(f => !existingIds.has(f.id) && !f.builtIn);
        saveFwLib([...lib, ...toAdd]);
        renderFwLibrary();
        emit('fw:import', { count: toAdd.length });
        toast(`Imported ${toAdd.length} frameworks`, 'ok');
      } catch(e) { toast('Import failed: ' + e.message, 'err'); }
    };
    r.readAsText(f);
  };
  inp.click();
};

/* Presets — save/load a named framework stack for an agent */
window.p5SaveFwPreset = function(agentId) {
  const name = prompt('Preset name:');
  if (!name?.trim()) return;
  const cfg = getAgent(agentId);
  const presets = JSON.parse(localStorage.getItem('nx_fw_presets') || '{}');
  presets[name.trim()] = { agentId, frameworks: cfg.frameworks, savedAt: new Date().toISOString() };
  localStorage.setItem('nx_fw_presets', JSON.stringify(presets));
  emit('fw:preset:save', { name, agentId });
  toast(`Preset "${name}" saved`, 'ok');
};

window.p5LoadFwPreset = function(agentId) {
  const presets = JSON.parse(localStorage.getItem('nx_fw_presets') || '{}');
  const names = Object.keys(presets);
  if (!names.length) { toast('No presets saved yet', 'info'); return; }
  const name = prompt('Load preset:\n' + names.join('\n'));
  if (!name || !presets[name]) return;
  const cfg = getAgent(agentId);
  cfg.frameworks = presets[name].frameworks;
  setAgent(agentId, cfg);
  renderFwStack(agentId);
  emit('fw:preset:load', { name, agentId });
  toast(`Preset "${name}" loaded`, 'ok');
};

/* ══════════════════════════════════════════════════════════════════
   AGENT PANEL CONTROLS
══════════════════════════════════════════════════════════════════ */
window.p5SetDefault = function(agentId) {
  const all = loadAgents();
  Object.keys(all).forEach(id => { if (all[id]) all[id].isDefault = false; });
  if (!all[agentId]) all[agentId] = defaultAgent(agentId);
  all[agentId].isDefault = true;
  saveAgents(all);
  // Update global AI provider
  AI.provider = agentId;
  localStorage.setItem('nx6_last_provider', agentId);
  if (typeof setPill === 'function') setPill('pill-ai', 'ok', agentId.toUpperCase());
  emit('agent:default:set', { agentId });
  toast(agentId.toUpperCase() + ' set as default agent', 'ok');
  document.querySelectorAll('[id^="p5-default-btn-"]').forEach(b => {
    const id = b.id.replace('p5-default-btn-','');
    b.textContent = id === agentId ? '★ DEFAULT' : '☆ SET DEFAULT';
    b.className = 'btn ' + (id === agentId ? 'ok' : '');
  });
};

window.p5TestAgent = async function(agentId) {
  const meta = NEXUS_AGENTS.find(a => a.id === agentId);
  const cfg  = getAgent(agentId);
  emit('agent:cfg:test', { agentId });
  toast(`Testing ${meta?.name||agentId}…`, 'ok', 2000);
  // Try bridge route
  try {
    const bridgeUrl = (typeof val === 'function' ? val('bridge-url') : null) || 'http://127.0.0.1:3747';
    const r = await fetch(bridgeUrl + '/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        provider: agentId,
        messages: [{ role:'user', content:'Reply with only the word PONG' }],
        api_key: cfg.api?.key || '',
        base_url: cfg.api?.baseUrl || '',
        model: cfg.api?.model || '',
        max_tokens: 10,
      }),
    });
    const j = await r.json();
    const text = (j.content||[{text:''}])[0]?.text || j.text || j.response || '';
    toast(`${meta?.name||agentId}: ${text.slice(0,60)||'OK'}`, 'ok');
  } catch(e) {
    toast(`${meta?.name||agentId} test failed: ${e.message}`, 'err', 4000);
  }
};

window.p5SaveAgent = function(agentId) {
  const cfg = getAgent(agentId);
  setAgent(agentId, cfg);
  emit('agent:cfg:save', { agentId });
  toast(`${agentId} config saved`, 'ok');
  // Also sync to legacy saveConfig for bridge compat
  if (typeof saveConfig === 'function') try { saveConfig(); } catch {}
};

window.p5ToggleMethod = function(agentId, method) {
  const body = document.getElementById(`p5-method-body-${method}`);
  if (body) body.classList.toggle('p5-method-collapsed');
};

window.p5ToggleSection = function(bodyId) {
  const body = document.getElementById(bodyId);
  if (body) body.classList.toggle('p5-method-collapsed');
};

window.p5SetMethodEnabled = function(agentId, method, enabled) {
  const cfg = getAgent(agentId);
  if (!cfg[method]) cfg[method] = {};
  cfg[method].enabled = enabled;
  setAgent(agentId, cfg);
  emit('agent:method:toggle', { agentId, method, enabled });
};

window.p5FieldChange = function(agentId, method, field, value) {
  const cfg = getAgent(agentId);
  if (!cfg[method]) cfg[method] = {};
  cfg[method][field] = value;
  setAgent(agentId, cfg);
};

window.p5SetPriority = function(agentId, method, value) {
  p5FieldChange(agentId, method, 'priority', parseInt(value) || 1);
};

window.p5AddAxiom = function(agentId) {
  const cfg = getAgent(agentId);
  if (!cfg.axioms) cfg.axioms = [];
  cfg.axioms.push({ id: ('ax_' + Date.now()), text: '' });
  setAgent(agentId, cfg);
  renderAxiomsList(agentId);
  emit('agent:axiom:add', { agentId });
};

window.p5UpdateAxiom = function(agentId, idx, text) {
  const cfg = getAgent(agentId);
  if (cfg.axioms?.[idx]) cfg.axioms[idx].text = text;
  setAgent(agentId, cfg);
};

window.p5RemoveAxiom = function(agentId, idx) {
  const cfg = getAgent(agentId);
  cfg.axioms?.splice(idx, 1);
  setAgent(agentId, cfg);
  renderAxiomsList(agentId);
  emit('agent:axiom:remove', { agentId, idx });
};

window.p5SetFwDepth = function(agentId, idx, depth) {
  const cfg = getAgent(agentId);
  if (cfg.frameworks?.[idx]) cfg.frameworks[idx].depth = depth;
  setAgent(agentId, cfg);
  renderFwStack(agentId);
  emit('agent:fw:depth:change', { agentId, idx, depth });
};

window.p5ToggleFw = function(agentId, idx) {
  const cfg = getAgent(agentId);
  if (cfg.frameworks?.[idx]) cfg.frameworks[idx].enabled = !cfg.frameworks[idx].enabled;
  setAgent(agentId, cfg);
  renderFwStack(agentId);
};

window.p5RemoveFw = function(agentId, idx) {
  const cfg = getAgent(agentId);
  cfg.frameworks?.splice(idx, 1);
  setAgent(agentId, cfg);
  renderFwStack(agentId);
  emit('agent:fw:remove', { agentId, idx });
};

/* Drag-and-drop reordering */
let _dragIdx = null;
window.p5FwDragStart = function(e, agentId, idx) {
  _dragIdx = idx;
  e.dataTransfer.setData('text/plain', String(idx));
};
window.p5FwDrop = function(e, agentId, targetIdx) {
  e.preventDefault();
  if (_dragIdx === null || _dragIdx === targetIdx) return;
  const cfg = getAgent(agentId);
  const fws = cfg.frameworks || [];
  const [moved] = fws.splice(_dragIdx, 1);
  fws.splice(targetIdx, 0, moved);
  cfg.frameworks = fws;
  setAgent(agentId, cfg);
  renderFwStack(agentId);
  emit('agent:fw:reorder', { agentId, from: _dragIdx, to: targetIdx });
  _dragIdx = null;
};

/* System prompt preview */
window.p5PreviewPrompt = function(agentId) {
  const preview = document.getElementById(`p5-prompt-preview-${agentId}`);
  const content = document.getElementById(`p5-prompt-preview-content-${agentId}`);
  if (!preview || !content) return;
  const isHidden = preview.style.display === 'none';
  preview.style.display = isHidden ? 'block' : 'none';
  if (isHidden) {
    const baseSystem = (typeof val === 'function' ? val('system-prompt') : null) || 'You are NEXUS AI.';
    content.textContent = buildAgentSystemPrompt(agentId, baseSystem);
    emit('agent:prompt:preview', { agentId });
  }
};

window.p5CopyPrompt = function(agentId) {
  const content = document.getElementById(`p5-prompt-preview-content-${agentId}`);
  if (!content) return;
  navigator.clipboard.writeText(content.textContent).then(() => toast('Prompt copied', 'ok'));
};


/* ══════════════════════════════════════════════════════════════════
   PLAYWRIGHT PANEL — TEST · GRAB FROM PLUGIN · AUTODETECT
══════════════════════════════════════════════════════════════════ */

function bUrl() {
  return (typeof val === 'function' ? val('bridge-url') : null) || 'http://127.0.0.1:3747';
}

function pwStatus(agentId, msg, color) {
  const el = document.getElementById(`p5-pw-action-status-${agentId}`);
  if (el) { el.textContent = msg; el.style.color = color || 'var(--text3)'; }
}

// ▶ TEST — launch PW session then navigate to agent's URL
window.p5PwTest = async function(agentId) {
  const meta = NEXUS_AGENTS.find(a => a.id === agentId);
  const cfg  = getAgent(agentId);
  pwStatus(agentId, 'launching…', 'var(--y)');
  emit('agent:cfg:test', { agentId, method: 'playwright' });

  try {
    // 1. Launch (attach or spawn)
    const launchR = await fetch(bUrl() + '/playwright/launch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(12000),
      body: JSON.stringify({
        profilePath: cfg.playwright?.profilePath || '',
        headless: false,
        forceNew: false,
      }),
    });
    const launchJ = await launchR.json();
    if (!launchJ.ok) throw new Error(launchJ.error || 'Launch failed');

    pwStatus(agentId, `attached · mode: ${launchJ.mode || '?'}`, 'var(--g)');

    // 2. Navigate to agent URL
    if (meta?.pwUrl) {
      await fetch(bUrl() + '/playwright/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({ action: 'navigate', url: 'https://' + meta.pwUrl }),
      });
      pwStatus(agentId, `✓ navigated to ${meta.pwUrl}`, 'var(--g)');
    }

    if (typeof toast === 'function') toast(`PW: ${meta?.name} session active`, 'ok');
  } catch(e) {
    pwStatus(agentId, `✗ ${e.message}`, 'var(--r)');
    if (typeof toast === 'function') toast(`PW test failed: ${e.message}`, 'err', 4000);
  }
};

// ⬡ GRAB FROM PLUGIN — read extension profile data from bridge, auto-fill fields
window.p5PwGrabPlugin = async function(agentId) {
  pwStatus(agentId, 'grabbing plugin data…', 'var(--m)');
  emit('agent:cfg:test', { agentId, method: 'playwright-grab' });

  try {
    // 1. Get PW status — includes firefox profile paths from extension
    const statusR = await fetch(bUrl() + '/playwright/status', {
      signal: AbortSignal.timeout(5000),
    });
    const status = await statusR.json();

    // 2. Read extension profile file if available
    let extProfile = null;
    if (status.profileDataAvailable) {
      try {
        const r = await fetch(bUrl() + '/log?limit=1&type=extension:profile', {
          signal: AbortSignal.timeout(3000),
        });
        // Fall back to reading via extension/status detail
      } catch {}
    }

    // 3. Auto-fill profile path from firefox profiles detected via extension
    const ffProfiles = status.firefoxProfilePaths || [];
    const cfg = getAgent(agentId);

    if (ffProfiles.length > 0) {
      const best = ffProfiles[0];
      const profPath = best.profilePath || best.path || best.dataDir || '';
      if (profPath) {
        cfg.playwright.profilePath = profPath;
        setAgent(agentId, cfg);
        const inp = document.getElementById(`p5-pw-profile-${agentId}`);
        if (inp) inp.value = profPath;
      }
    }

    // 4. Get account ID from active extension session
    const extStatusR = await fetch(bUrl() + '/extension/status', {
      signal: AbortSignal.timeout(3000),
    });
    const extStatus = await extStatusR.json();
    // activeExtension may be an object or string — normalize
    const rawExt = extStatus.activeExtension;
    const sessionId = typeof rawExt === 'string' ? rawExt
      : rawExt?.sessionId || rawExt?.id || rawExt?.hookId || (rawExt ? JSON.stringify(rawExt).slice(0,40) : '');
    if (sessionId) {
      cfg.playwright.accountId = sessionId;
      setAgent(agentId, cfg);
      const accInp = document.getElementById(`p5-pw-account-${agentId}`);
      if (accInp) accInp.value = sessionId;
    }

    // 5. Show data panel
    const panel = document.getElementById(`p5-pw-plugindata-${agentId}`);
    const content = document.getElementById(`p5-pw-plugindata-content-${agentId}`);
    if (panel && content) {
      panel.style.display = 'block';
      const esc2 = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      content.innerHTML = [
        `mode: <span style="color:var(--c)">${esc2(status.mode||'none')}</span>`,
        `session: <span style="color:var(--c)">${esc2(status.sessionUuid||'—')}</span>`,
        `page active: <span style="color:${status.pageActive?'var(--g)':'var(--text4)'}">${status.pageActive?'yes':'no'}</span>`,
        `ext connected: <span style="color:${status.extensionConnected?'var(--g)':'var(--r)'}">${status.extensionConnected?'yes — '+status.extensionCount+' session(s)':'no'}</span>`,
        `last URL: <span style="color:var(--text2)">${esc2(status.lastActiveUrl||'—')}</span>`,
        ffProfiles.length ? `profiles found: <span style="color:var(--g)">${ffProfiles.length}</span>` : `profiles: <span style="color:var(--text4)">none detected</span>`,
        sessionId ? `account ID: <span style="color:var(--m)">${esc2(sessionId)}</span>` : '',
      ].filter(Boolean).join('<br>');
    }

    const filled = (ffProfiles.length > 0 || sessionId) ? '— fields auto-filled' : '— no data to fill';
    pwStatus(agentId, `⬡ grabbed ${filled}`, 'var(--m)');
    if (typeof toast === 'function') toast('Plugin data grabbed' + filled, 'ok');

  } catch(e) {
    pwStatus(agentId, `✗ ${e.message}`, 'var(--r)');
    if (typeof toast === 'function') toast(`Grab failed: ${e.message}`, 'err', 4000);
  }
};

// ⟁ AUTODETECT — scan system for running browsers, show pickable list
window.p5PwAutodetect = async function(agentId) {
  pwStatus(agentId, 'scanning for browsers…', 'var(--c)');
  emit('agent:cfg:test', { agentId, method: 'playwright-detect' });

  try {
    // Hit both endpoints — playwright/browsers (extension-aware) and detect-browser (process scan)
    const [browsersR, detectR] = await Promise.allSettled([
      fetch(bUrl() + '/playwright/browsers', { signal: AbortSignal.timeout(6000) }),
      fetch(bUrl() + '/detect-browser',      { signal: AbortSignal.timeout(6000) }),
    ]);

    const browserData = browsersR.status === 'fulfilled' && browsersR.value.ok
      ? await browsersR.value.json() : { profiles: [], cdpAvailable: false };
    const detectData  = detectR.status === 'fulfilled'  && detectR.value.ok
      ? await detectR.value.json() : { browsers: [] };

    // Merge: playwright profiles + detected running browsers
    const pwProfiles = browserData.profiles || [];
    const detected   = detectData.browsers  || [];

    // Deduplicate by path
    const all = [...pwProfiles, ...detected.filter(d =>
      !pwProfiles.find(p => (p.profilePath||p.path) === (d.profilePath||d.dataDir))
    )];

    const panel   = document.getElementById(`p5-pw-detected-${agentId}`);
    const listEl  = document.getElementById(`p5-pw-profiles-${agentId}`);

    if (!all.length) {
      pwStatus(agentId, 'no browsers detected', 'var(--text3)');
      if (panel) {
        panel.style.display = 'block';
        if (listEl) listEl.innerHTML = '<div style="font-size:9px;color:var(--text4);font-style:italic">No running browsers found. Start Chrome or Firefox first.</div>';
      }
      return;
    }

    // Show detected list with USE button per entry
    panel.style.display = 'block';
    const esc2 = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    listEl.innerHTML = all.map((b, idx) => {
      const profPath = b.profilePath || b.path || b.dataDir || '';
      const label    = b.browser || b.type || b.name || 'Browser';
      const pid      = b.pid ? ` · PID ${b.pid}` : '';
      const cdp      = b.cdp || (idx === 0 && browserData.cdpAvailable) ? ' · CDP' : '';
      const displayPath = profPath.length > 48 ? '…' + profPath.slice(-46) : profPath;

      return `<div style="display:flex;align-items:center;gap:7px;padding:5px 6px;background:var(--bg2);border:1px solid var(--border);border-radius:3px;">
        <div style="flex:1;min-width:0">
          <div style="font-size:9px;color:var(--c);font-family:var(--display);letter-spacing:.06em">${esc2(label)}${esc2(pid)}${esc2(cdp)}</div>
          <div style="font-size:10px;color:var(--text3);font-family:var(--mono);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc2(displayPath||'default profile')}</div>
        </div>
        <button class="btn ok" style="font-size:10px;padding:2px 8px;flex-shrink:0"
          onclick="p5PwUseProfile('${agentId}','${esc2(profPath)}','${esc2(label)}')">USE</button>
      </div>`;
    }).join('');

    pwStatus(agentId, `⟁ found ${all.length} browser${all.length !== 1 ? 's' : ''}`, 'var(--c)');
    if (typeof toast === 'function') toast(`Found ${all.length} browser${all.length !== 1 ? 's' : ''} — click USE to select`, 'ok');

    // Auto-select CDP-available browser if any
    if (browserData.cdpAvailable && all.length > 0) {
      const cdpBrowser = all[0];
      const profPath = cdpBrowser.profilePath || cdpBrowser.path || cdpBrowser.dataDir || '';
      if (profPath) p5PwUseProfile(agentId, profPath, cdpBrowser.browser || 'Browser');
    }

  } catch(e) {
    pwStatus(agentId, `✗ ${e.message}`, 'var(--r)');
    if (typeof toast === 'function') toast(`Autodetect failed: ${e.message}`, 'err', 4000);
  }
};

// USE — apply a detected profile
window.p5PwUseProfile = function(agentId, profilePath, label) {
  const cfg = getAgent(agentId);
  cfg.playwright.profilePath = profilePath;
  setAgent(agentId, cfg);
  const inp = document.getElementById(`p5-pw-profile-${agentId}`);
  if (inp) inp.value = profilePath;
  pwStatus(agentId, `✓ using ${label}`, 'var(--g)');
  if (typeof toast === 'function') toast(`Profile set: ${label}`, 'ok', 2000);
};

// … browse button — Electron file dialog
window.p5PwBrowseProfile = async function(agentId) {
  try {
    if (window.nexus?.dialogFolder) {
      const result = await window.nexus.dialogFolder();
      if (result && !result.canceled && result.filePaths?.[0]) {
        p5PwUseProfile(agentId, result.filePaths[0], 'selected folder');
      }
    } else {
      if (typeof toast === 'function') toast('File browser requires Electron app', 'info', 3000);
    }
  } catch {}
};

/* ══════════════════════════════════════════════════════════════════
   LIVE STATUS INDICATORS
══════════════════════════════════════════════════════════════════ */
async function checkExtension() {
  const dot  = document.getElementById('p5-ext-dot');
  const txt  = document.getElementById('p5-ext-status');
  try {
    const bridgeUrl = (typeof val === 'function' ? val('bridge-url') : null) || 'http://127.0.0.1:3747';
    const r = await fetch(bridgeUrl + '/extension/status', { signal: AbortSignal.timeout(3000) });
    const j = await r.json();
    const connected = j.sessions > 0 || j.activeExtension;
    if (dot) { dot.style.background = connected ? 'var(--g)' : 'var(--r)'; dot.style.boxShadow = connected ? '0 0 6px var(--g)' : 'none'; }
    if (txt) txt.textContent = connected ? `connected · ${j.sessions} session${j.sessions!==1?'s':''}` : 'not connected';
  } catch {
    if (dot) { dot.style.background = 'var(--text4)'; dot.style.boxShadow = 'none'; }
    if (txt) txt.textContent = 'bridge offline';
  }
}

async function checkBridgeDot() {
  const dot = document.getElementById('p5-bridge-dot');
  const txt = document.getElementById('p5-bridge-status');
  try {
    const bridgeUrl = (typeof val === 'function' ? val('bridge-url') : null) || 'http://127.0.0.1:3747';
    await fetch(bridgeUrl + '/health', { signal: AbortSignal.timeout(2000) });
    if (dot) { dot.style.background = 'var(--g)'; dot.style.boxShadow = '0 0 6px var(--g)'; }
    if (txt) txt.textContent = 'running';
  } catch {
    if (dot) { dot.style.background = 'var(--r)'; dot.style.boxShadow = 'none'; }
    if (txt) txt.textContent = 'offline';
  }
}

async function checkOllamaPy() {
  const dot = document.getElementById('p5-py-dot');
  const lbl = document.getElementById('p5-py-status');
  const bar = document.getElementById('p5-vram-bar');
  const vramLbl = document.getElementById('p5-vram-lbl');
  try {
    const r = await fetch('http://127.0.0.1:3748/status', { signal: AbortSignal.timeout(3000) });
    const j = await r.json();
    if (dot) { dot.style.background = 'var(--g)'; dot.style.boxShadow = '0 0 5px var(--g)'; }
    if (lbl) lbl.textContent = `:3748 RUNNING · ${j.models?.length||0} models`;
    const running = j.running || [];
    let totalVram = 0, maxEst = 0;
    running.forEach(m => { totalVram += (m.size_vram||0); maxEst += (m.size||0)||8e9; });
    const pct = maxEst > 0 ? Math.min(100, Math.round(totalVram/maxEst*100)) : 0;
    if (bar) { bar.style.width = pct + '%'; bar.style.background = pct>85?'var(--r)':pct>60?'var(--y)':'var(--c)'; }
    if (vramLbl) vramLbl.textContent = running.length ? `${(totalVram/1e9).toFixed(1)}GB` : '—';
  } catch {
    if (dot) { dot.style.background = 'var(--r)'; dot.style.boxShadow = 'none'; }
    if (lbl) lbl.textContent = ':3748 offline';
  }
}

function startLivePolling() {
  checkExtension(); checkBridgeDot();
  if (_activeAgentId === 'ollama') checkOllamaPy();
  if (_extHeartbeat) clearInterval(_extHeartbeat);
  _extHeartbeat = setInterval(() => {
    checkExtension(); checkBridgeDot();
    if (_activeAgentId === 'ollama') checkOllamaPy();
  }, 8000);
}
function stopLivePolling() {
  if (_extHeartbeat) { clearInterval(_extHeartbeat); _extHeartbeat = null; }
}

/* ══════════════════════════════════════════════════════════════════
   WIRE PANEL — connect rendered DOM
══════════════════════════════════════════════════════════════════ */
function wireAgentPanel(meta, cfg) {
  renderFwStack(meta.id);
  renderAxiomsList(meta.id);
  startLivePolling();
}

/* ══════════════════════════════════════════════════════════════════
   BUILD THE AI SETTINGS SUB-TAB — replace old acc-ai content
══════════════════════════════════════════════════════════════════ */
function buildAiSubTab() {
  const sub = document.getElementById('optsub-ai');
  if (!sub || sub.dataset.p5guardian) return;
  sub.dataset.p5guardian = '1';

  let scrollArea = sub.querySelector('.scroll-area');
  if (!scrollArea) { scrollArea = sub; }

  // Build per-agent accordion list (API keys + Guardian hook assignment)
  const agentRows = NEXUS_AGENTS.map(meta => {
    const esc2 = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const cfg = getAgent(meta.id);
    const apiSection = !meta.hasApi ? '' : `
      <div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border2)" id="p5g-api-section-${meta.id}">
        <div style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-bottom:5px"
          onclick="p5gToggleApiSection('${meta.id}')">
          <span style="font-size:10px;color:var(--text4);letter-spacing:.1em">◈ DIRECT API</span>
          <span style="font-size:8px;color:var(--text4);margin-left:auto" id="p5g-api-toggle-${meta.id}">▾ show</span>
          <span style="font-size:8px;color:var(--y)" id="p5g-api-warn-${meta.id}"></span>
        </div>
        <div id="p5g-api-body-${meta.id}" style="display:none">
        <div class="frow"><span class="flbl" style="min-width:72px">API KEY</span>
          <input class="finp" id="p5g-key-${meta.id}" type="password" placeholder="sk-…" value="${esc2(cfg.api?.key||'')}"
            onchange="p5FieldChange('${meta.id}','api','key',this.value)" style="font-size:9px"/>
        </div>
        <div class="frow"><span class="flbl" style="min-width:72px">MODEL</span>
          <input class="finp" id="p5g-model-${meta.id}" placeholder="${esc2((meta.models||[])[0]||'')}" value="${esc2(cfg.api?.model||'')}"
            list="p5g-models-${meta.id}" onchange="p5FieldChange('${meta.id}','api','model',this.value)" style="font-size:9px"/>
          <datalist id="p5g-models-${meta.id}">${(meta.models||[]).map(m=>`<option value="${esc2(m)}">`).join('')}</datalist>
        </div>
        ${meta.apiBase?`<div class="frow"><span class="flbl" style="min-width:72px">BASE URL</span>
          <input class="finp" id="p5g-url-${meta.id}" value="${esc2(cfg.api?.baseUrl||meta.apiBase||'')}"
            onchange="p5FieldChange('${meta.id}','api','baseUrl',this.value)" style="font-size:9px"/>
        </div>`:''}
        <div class="frow">
          <button class="btn accent" style="font-size:9px;padding:2px 8px" onclick="p5TestApi('${meta.id}')">TEST</button>
          <div id="p5g-test-${meta.id}" style="font-size:9px;color:var(--text3);margin-left:8px;flex:1"></div>
        </div>
        </div><!-- /api-body -->
      </div>`;

    const ollamaSection = meta.id !== 'ollama' ? '' : `
      <div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border2)">
        <div style="font-size:10px;color:var(--text3);letter-spacing:.1em;margin-bottom:5px">LOCAL SERVICE</div>
        <div class="frow"><span class="flbl" style="min-width:72px">SERVER</span>
          <input class="finp" id="p5g-local-ollama" value="${esc2(cfg.local?.serverUrl||'http://localhost:11434')}"
            onchange="p5FieldChange('ollama','local','serverUrl',this.value)" style="font-size:9px"/>
        </div>
        <div class="frow">
          <button class="btn accent" style="font-size:9px;padding:2px 8px" onclick="testOllama()">TEST</button>
          <button class="btn" style="font-size:9px;padding:2px 8px;margin-left:4px" onclick="ollamaRefreshModels()">MODELS</button>
          <div id="status-ollama-p5g" style="font-size:9px;color:var(--text3);margin-left:8px;flex:1"></div>
        </div>
      </div>`;

    // Guardian hook section per agent
    const hookSection = `
      <div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border2)">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">
          <div style="width:6px;height:6px;border-radius:50%;background:var(--text4);flex-shrink:0" id="p5g-gdot-${meta.id}"></div>
          <span style="font-size:10px;color:var(--text3);letter-spacing:.1em">GUARDIAN HOOK</span>
        </div>
        <div class="frow" style="margin-bottom:6px;gap:6px">
          <button class="btn" style="font-size:9px;padding:3px 10px;color:var(--g);border-color:rgba(0,255,136,.4);background:rgba(0,255,136,.06);flex:1"
            onclick="p5gOpenWirePicker('${meta.id}')">⟁ WIRE INPUT</button>
          <button class="btn" style="font-size:9px;padding:3px 10px;color:var(--m);border-color:rgba(204,68,255,.4);background:rgba(204,68,255,.06);flex:1"
            onclick="p5gOpenOutputPicker('${meta.id}')">⟁ WIRE OUTPUT</button>
          <button class="btn" style="font-size:9px;padding:3px 8px;color:var(--c);border-color:rgba(0,212,255,.3)"
            onclick="p5gTestAgent('${meta.id}')" id="p5g-test-btn-${meta.id}">▶ TEST</button>
        </div>
        <div class="frow">
          <span class="flbl" style="min-width:72px">CALLTO</span>
          <select class="finp" id="p5g-callto-${meta.id}" style="flex:1;font-size:9px"
            onchange="p5gSaveHook('${meta.id}')">
            <option value="">— none —</option>
          </select>
          <button class="btn" style="font-size:10px;padding:1px 6px;margin-left:4px;color:var(--g);border-color:rgba(0,255,136,.3)"
            onclick="p5gFireHook('${meta.id}')">→ SYS</button>
        </div>
        <div class="frow">
          <span class="flbl" style="min-width:72px">INTENT</span>
          <select class="finp" id="p5g-intent-${meta.id}" style="max-width:180px;font-size:9px"
            onchange="p5gSaveHook('${meta.id}')">
            <option value="chat">Chat / General</option>
            <option value="code">Code Generation</option>
            <option value="analyze">Analyze / Research</option>
            <option value="build">Build / Create</option>
            <option value="debug">Debug / Fix</option>
            <option value="review">Review / Critique</option>
            <option value="custom">Custom…</option>
          </select>
        </div>
        <div class="frow" id="p5g-custom-intent-row-${meta.id}" style="display:none">
          <span class="flbl" style="min-width:72px">CUSTOM</span>
          <input class="finp" id="p5g-custom-intent-${meta.id}" placeholder="Describe hook intent…" style="font-size:9px"
            onchange="p5gSaveHook('${meta.id}')"/>
        </div>
      </div>`;

    // ── Per-agent: pre-prompt, axioms, frameworks ────────────────────────────
    const agentConfigSection = `
      <div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border2)">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;cursor:pointer" onclick="p5gToggleAgentConfig('${meta.id}')">
          <span style="font-size:10px;color:var(--text3);letter-spacing:.1em">⚙ INTENT · AXIOMS · FRAMEWORKS</span>
          <span style="font-size:8px;color:var(--text4);margin-left:auto" id="p5g-cfg-toggle-${meta.id}">▾ show</span>
        </div>
        <div id="p5g-cfg-body-${meta.id}" style="display:none;flex-direction:column;gap:6px">

          <!-- Pre-prompt -->
          <div style="font-size:9px;color:var(--text3);letter-spacing:.08em;margin-bottom:2px">PRE-PROMPT</div>
          <textarea id="p5g-preprompt-${meta.id}" rows="3"
            placeholder="System-level instructions sent before every request to ${meta.name||meta.id}…"
            style="width:100%;font-family:var(--mono);font-size:9px;background:var(--bg);border:1px solid var(--border2);border-radius:2px;padding:5px 8px;color:var(--text);resize:vertical;outline:none"
            onchange="p5gSaveAgentConfig('${meta.id}')"></textarea>

          <!-- Axioms -->
          <div style="display:flex;align-items:center;gap:6px;margin-top:4px">
            <span style="font-size:9px;color:var(--text3);letter-spacing:.08em">AXIOMS</span>
            <button class="btn" style="font-size:8px;padding:1px 7px;margin-left:auto" onclick="p5gAddAxiom('${meta.id}')">+ ADD</button>
          </div>
          <div id="p5g-axioms-${meta.id}" style="display:flex;flex-direction:column;gap:4px;max-height:120px;overflow-y:auto"></div>

          <!-- Frameworks -->
          <div style="display:flex;align-items:center;gap:6px;margin-top:4px">
            <span style="font-size:9px;color:var(--text3);letter-spacing:.08em">FRAMEWORKS</span>
            <button class="btn" style="font-size:8px;padding:1px 7px;margin-left:auto" onclick="p5gAddFramework('${meta.id}')">+ ADD</button>
          </div>
          <div id="p5g-frameworks-${meta.id}" style="display:flex;flex-direction:column;gap:4px;max-height:100px;overflow-y:auto"></div>

          <!-- Test button -->
          <div style="display:flex;gap:5px;margin-top:6px">
            <button class="btn accent" style="font-size:9px;flex:1" onclick="p5gTestAgent('${meta.id}')">▶ TEST AGENT</button>
            <button class="btn" style="font-size:9px" onclick="p5gSaveAgentConfig('${meta.id}');if(typeof toast==='function')toast('${meta.id} config saved','ok')">SAVE</button>
          </div>
        </div>
      </div>`;

    return `
    <div class="acc-section" id="p5g-acc-${meta.id}">
      <div class="acc-head" onclick="accToggle('p5g-acc-${meta.id}');p5gLoadHookState('${meta.id}')">
        <div style="display:flex;align-items:center;gap:8px;flex:1">
          <div style="width:8px;height:8px;border-radius:50%;background:${meta.color};flex-shrink:0;box-shadow:0 0 5px ${meta.color}66"></div>
          <span class="acc-title" style="color:${meta.color}">${meta.name||meta.label||meta.id}</span>
          <span style="font-size:10px;color:var(--text3)">${meta.desc||''}</span>
        </div>
        <span class="acc-badge" id="p5g-badge-${meta.id}" style="font-size:10px">—</span>
        <span class="acc-chevron">▸</span>
      </div>
      <div class="acc-body" style="display:none;flex-direction:column;padding:10px 14px">
        ${apiSection}
        ${ollamaSection}
        ${hookSection}
        ${agentConfigSection}
        <div id="p5g-mirror-${meta.id}" style="display:none"></div>
      </div>
    </div>`;
  }).join('');

  // Override scroll-area to be a flex column so inner list handles its own scroll
  scrollArea.style.cssText = 'flex:1;min-height:0;overflow:hidden;display:flex;flex-direction:column;padding:0;';
  scrollArea.innerHTML = `
    <div style="padding:10px 18px 6px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;flex-shrink:0;background:var(--bg1);">
      <span style="font-family:var(--display);font-size:10px;letter-spacing:.18em;color:var(--c)">⟡ AI AGENTS</span>
      <div style="width:6px;height:6px;border-radius:50%;background:var(--text4)" id="p5g-guardian-dot"></div>
      <span style="font-size:9px;color:var(--text3)">Configure API keys · Assign Guardian callto hooks per agent</span>
      <button class="btn" style="font-size:10px;padding:1px 7px;margin-left:auto" onclick="p5gSyncAllCalltos()">↻ SYNC CALLTOS</button>
    </div>
    <div style="flex:1;min-height:0;overflow-y:auto;padding:8px 18px 24px;display:flex;flex-direction:column;gap:0" id="p5g-agents-list">
      ${agentRows}
    </div>

    <!-- Framework Library (preserved) -->
    <div style="flex-shrink:0;border-top:2px solid var(--border);max-height:45%;overflow-y:auto;">
      <div class="acc-section" id="p5g-acc-fwlib">
        <div class="acc-head" onclick="accToggle('p5g-acc-fwlib');renderFwLibrary()">
          <span class="acc-title" style="color:var(--m)">✦ FRAMEWORK LIBRARY</span>
          <span style="font-size:10px;color:var(--text3);margin-left:auto">persists across sessions</span>
          <div style="display:flex;gap:4px;margin-left:12px">
            <button class="btn" style="font-size:10px;padding:1px 6px;color:var(--m)" onclick="event.stopPropagation();p5OpenFwBuilder()">+ CREATE</button>
          </div>
          <span class="acc-chevron" style="margin-left:8px">▸</span>
        </div>
        <div class="acc-body" style="display:none;flex-direction:column;padding:10px 14px">
          <div id="p5-fw-lib-body"><div style="font-size:10px;color:var(--text3);font-style:italic">Loading…</div></div>
        </div>
      </div>
    </div>

    <!-- Framework Builder modal (preserved) -->
    <div id="p5-fw-builder-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9999;align-items:center;justify-content:center"></div>
  `;

  // Init accordions for newly rendered sections
  if (typeof initAccordions === 'function') initAccordions();

  // Sync Guardian calltos into all agent dropdowns
  p5gSyncAllCalltos();

  // Restore saved hook states
  NEXUS_AGENTS.forEach(meta => p5gLoadHookState(meta.id));
}

/* ── Guardian hook helpers for per-agent AI panel ── */

function p5gSyncAllCalltos() {
  const calltos = (typeof GUARDIAN !== 'undefined') ? GUARDIAN.calltos : [];
  const dot = document.getElementById('p5g-guardian-dot');
  if (dot) {
    dot.style.background = (typeof GUARDIAN !== 'undefined' && GUARDIAN.connected) ? 'var(--g)' : 'var(--text4)';
  }
  NEXUS_AGENTS.forEach(meta => {
    const sel = document.getElementById('p5g-callto-' + meta.id);
    if (!sel) return;
    const prev = sel.value;
    sel.innerHTML = '<option value="">— none —</option>' +
      calltos.map(ct => {
        const url = (() => { try { const u = new URL(ct.url||''); return u.hostname; } catch { return ct.url||'?'; } })();
        return `<option value="${ct.id}">${ct.label||ct.id} · ${url}</option>`;
      }).join('');
    if (prev) sel.value = prev;
    // Update guardian dot per agent
    const gdot = document.getElementById('p5g-gdot-' + meta.id);
    if (gdot) gdot.style.background = sel.value ? 'var(--g)' : 'var(--text4)';
  });
}

function p5gSaveHook(agentId) {
  const calltoSel = document.getElementById('p5g-callto-' + agentId);
  const intentSel = document.getElementById('p5g-intent-' + agentId);
  const customInp = document.getElementById('p5g-custom-intent-' + agentId);
  const customRow = document.getElementById('p5g-custom-intent-row-' + agentId);

  const calltoId = calltoSel?.value || '';
  const intent   = intentSel?.value || 'chat';
  const custom   = customInp?.value || '';

  if (customRow) customRow.style.display = intent === 'custom' ? 'flex' : 'none';

  // Update badge immediately
  const badge = document.getElementById('p5g-badge-' + agentId);
  const gdot  = document.getElementById('p5g-gdot-' + agentId);
  if (badge) { badge.textContent = calltoId ? '⟡ HOOKED' : '—'; badge.style.color = calltoId ? 'var(--g)' : ''; }
  if (gdot)  { gdot.style.background = calltoId ? 'var(--g)' : 'var(--text4)'; }

  // Mirror to bridge via Guardian v3 (handles localStorage + bridge POST + mirror card)
  if (typeof guardianSaveAgentHook === 'function') {
    guardianSaveAgentHook(agentId, calltoId, intent);
  } else {
    // Fallback: localStorage only if guardian not loaded yet
    const hooks = JSON.parse(localStorage.getItem('nx_guardian_agent_hooks') || '{}');
    hooks[agentId] = { calltoId, intent, custom };
    localStorage.setItem('nx_guardian_agent_hooks', JSON.stringify(hooks));
  }
}

function p5gLoadHookState(agentId) {
  const hooks = JSON.parse(localStorage.getItem('nx_guardian_agent_hooks') || '{}');
  const h = hooks[agentId] || {};
  const calltoSel = document.getElementById('p5g-callto-' + agentId);
  const intentSel = document.getElementById('p5g-intent-' + agentId);
  const customInp = document.getElementById('p5g-custom-intent-' + agentId);
  const customRow = document.getElementById('p5g-custom-intent-row-' + agentId);
  if (calltoSel && h.calltoId) calltoSel.value = h.calltoId;
  if (intentSel && h.intent)   intentSel.value = h.intent;
  if (customInp && h.custom)   customInp.value = h.custom;
  if (customRow) customRow.style.display = (h.intent === 'custom') ? 'flex' : 'none';
  const badge = document.getElementById('p5g-badge-' + agentId);
  const gdot  = document.getElementById('p5g-gdot-' + agentId);
  if (badge) { badge.textContent = h.calltoId ? '⟡ HOOKED' : '—'; badge.style.color = h.calltoId ? 'var(--g)' : ''; }
  if (gdot)  { gdot.style.background = h.calltoId ? 'var(--g)' : 'var(--text4)'; }
}

function p5gFireHook(agentId) {
  const sel = document.getElementById('p5g-callto-' + agentId);
  const id  = sel?.value;
  if (!id) { if (typeof toast === 'function') toast('No callto assigned to ' + agentId, 'warn'); return; }
  if (typeof guardianHookToConsole === 'function') guardianHookToConsole(id);
  else if (typeof toast === 'function') toast('Guardian not loaded', 'warn');
}

function p5TestApi(agentId) {
  const el = document.getElementById('p5g-test-' + agentId);
  if (el) { el.textContent = 'testing…'; el.style.color = 'var(--y)'; }
  const cfg = getAgent(agentId);
  // Reuse existing test functions if available
  const testMap = { chatgpt: 'testChatGPT', claude: 'testClaude', ollama: 'testOllama', deepseek: 'testDeepSeek', gemini: 'testGemini' };
  const fn = testMap[agentId];
  if (fn && typeof window[fn] === 'function') {
    window[fn]();
    if (el) setTimeout(() => { el.textContent = ''; }, 4000);
  } else {
    if (el) { el.textContent = 'no test fn'; el.style.color = 'var(--text3)'; }
  }
}

function renderAgentGrid() {
  const grid = document.getElementById('p5-agent-grid');
  if (!grid) return;
  const allAgents = loadAgents();

  grid.innerHTML = NEXUS_AGENTS.map(meta => {
    const cfg = allAgents[meta.id] || defaultAgent(meta.id);
    const isActive = meta.id === _activeAgentId;
    const isDefault = cfg.isDefault;
    const methodCount = (['api','local','playwright'].filter(m => cfg[m]?.enabled)).length;
    const fwCount = (cfg.frameworks||[]).filter(f=>f.enabled!==false).length;

    return `<div class="p5-agent-chip ${isActive?'p5-chip-active':''} ${isDefault?'p5-chip-default':''}"
      style="border-color:${isActive||isDefault?meta.color:'var(--border)'}"
      onclick="p5SelectAgent('${meta.id}')">
      <span style="color:${meta.color};font-size:13px">${meta.icon||'◈'}</span>
      <span style="font-size:9px;font-family:var(--display);letter-spacing:.08em;color:${isActive?meta.color:'var(--text)'}">${meta.name}</span>
      ${isDefault?'<span style="font-size:9px;color:var(--g)">★</span>':''}
      ${fwCount>0?`<span style="font-size:9px;color:var(--m);margin-left:auto">${fwCount}✦</span>`:''}
      ${methodCount>0?`<span style="font-size:9px;color:var(--g)">${methodCount}●</span>`:''}
    </div>`;
  }).join('');
}

window.p5SelectAgent = function(agentId) {
  _activeAgentId = agentId;
  AI.provider = agentId;
  localStorage.setItem('nx6_last_provider', agentId);
  renderAgentGrid();
  renderAgentPanel();
  emit('agent:select', { agentId });
};

/* ══════════════════════════════════════════════════════════════════
   CSS INJECTION
══════════════════════════════════════════════════════════════════ */
function injectStyles() {
  if (document.getElementById('p5-styles')) return;
  const s = document.createElement('style');
  s.id = 'p5-styles';
  s.textContent = `
.p5-agent-grid{display:flex;flex-wrap:wrap;gap:5px;padding:4px 0}
.p5-agent-chip{display:flex;align-items:center;gap:5px;padding:5px 8px;border:1px solid var(--border);border-radius:4px;cursor:pointer;transition:all .15s;background:var(--bg2)}
.p5-agent-chip:hover{background:var(--bg3)}
.p5-chip-active{background:rgba(0,212,255,.06)!important}
.p5-chip-default{box-shadow:0 0 8px rgba(0,255,136,.12)}

.p5-agent-header{display:flex;align-items:center;gap:10px;padding:12px 14px;background:var(--bg2);border:1px solid var(--border);border-radius:4px;margin-bottom:10px;flex-wrap:wrap;gap:8px}
.p5-agent-glyph{font-size:20px;flex-shrink:0}
.p5-agent-name{font-family:var(--display);font-size:13px;letter-spacing:.15em;flex-shrink:0}
.p5-agent-desc{font-size:9px;color:var(--text3);flex:1;min-width:120px}

.p5-method-section{border:1px solid var(--border);border-radius:3px;margin-bottom:6px;overflow:hidden}
.p5-fw-section{border-color:rgba(204,68,255,.25)}
.p5-method-head{display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--bg2);cursor:pointer;user-select:none;transition:background .15s}
.p5-method-head:hover{background:var(--bg3)}
.p5-method-label{font-family:var(--display);font-size:10px;letter-spacing:.12em}
.p5-method-body{padding:10px 12px;display:flex;flex-direction:column;gap:6px;background:var(--bg1)}
.p5-method-collapsed{display:none!important}

.p5-field-row{display:flex;align-items:center;gap:8px}
.p5-flbl{font-size:9px;color:var(--text3);width:72px;flex-shrink:0;letter-spacing:.06em}
.p5-priority-row{display:flex;align-items:center;gap:8px;margin-top:6px;padding-top:6px;border-top:1px solid var(--border)}
.p5-live-dot{width:6px;height:6px;border-radius:50%;background:var(--text4);flex-shrink:0;transition:all .4s}
.p5-method-status{display:flex;align-items:center;gap:4px;margin-left:auto}

.p5-fw-stack{display:flex;flex-direction:column;gap:4px;min-height:30px}
.p5-fw-row{display:flex;align-items:center;gap:7px;padding:7px 8px;background:var(--bg2);border:1px solid var(--border);border-radius:3px;cursor:grab;transition:all .15s;user-select:none}
.p5-fw-row:hover{border-color:var(--border2);background:var(--bg3)}
.p5-fw-row-dim{opacity:.45}
.p5-fw-drag{font-size:12px;color:var(--text4);cursor:grab;flex-shrink:0}
.p5-fw-glyph{font-size:15px;flex-shrink:0}
.p5-fw-info{flex:1;min-width:0}
.p5-fw-name{font-family:var(--display);font-size:10px;letter-spacing:.08em}
.p5-fw-cat{font-size:10px;color:var(--text4)}
.p5-fw-depth-btns{display:flex;gap:3px;flex-shrink:0}
.p5-depth-btn{font-family:var(--mono);font-size:10px;padding:1px 5px;background:none;border:1px solid var(--border);color:var(--text3);cursor:pointer;border-radius:2px;transition:all .15s}
.p5-depth-btn:hover{border-color:var(--border2);color:var(--text)}
.p5-depth-active{background:rgba(0,0,0,.15)}

.p5-fw-actions{display:flex;gap:4px;flex-wrap:wrap;margin-top:8px;padding-top:8px;border-top:1px solid var(--border)}
.p5-axioms-list{display:flex;flex-direction:column;gap:2px}
.p5-lib-row{display:flex;align-items:center;gap:8px;padding:5px 2px;border-bottom:1px solid var(--border)}

.p5-picker-row{display:flex;align-items:flex-start;gap:10px;padding:10px 8px;border-radius:3px;cursor:pointer;transition:background .15s;border:1px solid transparent;margin-bottom:2px}
.p5-picker-row:hover{background:rgba(0,212,255,.04);border-color:rgba(0,212,255,.15)}
.p5-picker-active{background:rgba(0,255,136,.04);border-color:rgba(0,255,136,.2)!important}
.p5-agent-selector{padding-bottom:12px;border-bottom:1px solid var(--border)}
  `;
  document.head.appendChild(s);
}

/* ══════════════════════════════════════════════════════════════════
   HELP TOPICS
══════════════════════════════════════════════════════════════════ */
function injectHelpTopics() {
  if (typeof HELP_TOPICS === 'undefined') return;
  if (HELP_TOPICS.find(t => t.id === 'agents-overview')) return;

  HELP_TOPICS.push({
    id: 'agents-overview',
    title: 'AI Agents — Overview',
    icon: '⟡',
    content: `<h3 style="color:var(--c);font-family:var(--display);letter-spacing:.18em">⟡ AI AGENTS — 17 AGENTS, 3 METHODS EACH</h3>
<p style="font-size:11px;line-height:1.8;">Every agent supports up to three independent connection methods — Direct API, Local Service, and Playwright. Methods can be enabled simultaneously with independent priority settings.</p>
<p style="font-size:11px;margin-top:10px;"><strong>Priority & Race Mode:</strong> When two methods have the same priority, they run in parallel and the fastest response wins. Different priorities = ordered fallback chain.</p>
<p style="font-size:11px;margin-top:8px;"><strong>Plugin toggle</strong> shows live heartbeat from the Firefox extension. <strong>Bridge toggle</strong> shows live ping of the NEXUS bridge server. Both must be running for Playwright mode.</p>
<p style="font-size:11px;margin-top:8px;"><strong>Setting a default agent</strong> (★) sets it as the active provider for the console, Forge co-pilot, and all AI features system-wide.</p>`
  });

  HELP_TOPICS.push({
    id: 'frameworks-injection',
    title: 'Framework Injection — Your Art',
    icon: '✦',
    content: `<h3 style="color:var(--m);font-family:var(--display);letter-spacing:.18em">✦ FRAMEWORK INJECTION</h3>
<p style="font-size:11px;line-height:1.8;">Frameworks are cognitive lenses injected into every system prompt before a request is sent. They don't modify the user message — they define <em>how the agent thinks</em>.</p>
<p style="font-size:11px;margin-top:10px;"><strong>Stack order matters.</strong> Frameworks inject in the order they appear in the stack. They compose — a Hostile Truth Engine stacked beneath Erosmancer means the agent reverse-engineers from end-states <em>and</em> adversarially stress-tests every path it finds.</p>
<p style="font-size:11px;margin-top:10px;"><strong>Depth levels:</strong></p>
<ul style="padding-left:18px;font-size:11px;line-height:2">
<li><strong style="color:var(--g)">full</strong> — complete injection template, all principles and layers</li>
<li><strong style="color:var(--y)">quick</strong> — name + first principle only, minimal context overhead</li>
<li><strong style="color:var(--r)">off</strong> — disabled but preserved in stack for later</li>
</ul>
<p style="font-size:11px;margin-top:10px;"><strong>Built-in frameworks:</strong> EROSMANCER · HOSTILE TRUTH ENGINE · DELTA RISK · UNIFIED ENGINE. These cannot be deleted but their templates can be overridden in custom versions.</p>
<p style="font-size:11px;margin-top:10px;"><strong>Custom frameworks</strong> are your art. Build them in the Framework Builder — define the name, glyph, color, category, principles, layers, and most importantly the <em>injection template</em>: the exact text injected before every request. Use <code style="color:var(--c)">{name}</code>, <code style="color:var(--c)">{description}</code>, <code style="color:var(--c)">{principles}</code>, <code style="color:var(--c)">{layers}</code> as placeholders.</p>
<p style="font-size:11px;margin-top:10px;"><strong>Preview:</strong> ◎ PREVIEW SYSTEM PROMPT shows exactly what the agent receives before every request, assembled in real time.</p>
<p style="font-size:11px;margin-top:10px;"><strong>Presets:</strong> Save a named stack of frameworks and load it onto any agent. Build once, deploy anywhere.</p>
<p style="font-size:11px;margin-top:10px;"><strong>Export/Import:</strong> Your custom framework library exports as JSON. Import it on any NEXUS instance.</p>`
  });

  NEXUS_AGENTS.forEach(meta => {
    HELP_TOPICS.push({
      id: `agent-${meta.id}`,
      title: `Agent — ${meta.name}`,
      icon: meta.icon || '◈',
      content: `<h3 style="color:${meta.color};font-family:var(--display);letter-spacing:.18em">${meta.icon||'◈'} ${meta.name.toUpperCase()}</h3>
<p style="font-size:11px;line-height:1.8;">${meta.desc}</p>
<p style="font-size:11px;margin-top:10px;"><strong>Methods:</strong></p>
<ul style="padding-left:18px;font-size:11px;line-height:1.8;">
${meta.hasApi ? `<li><strong>Direct API</strong> — ${meta.apiBase||'API endpoint'}</li>` : ''}
${meta.hasLocal ? `<li><strong>Local Service</strong> — port ${meta.localPort||'local'}</li>` : ''}
${meta.hasPw ? `<li><strong>Playwright</strong> — ${meta.pwUrl}</li>` : ''}
</ul>
${meta.models?.length ? `<p style="font-size:11px;margin-top:8px;"><strong>Models:</strong> ${meta.models.join(' · ')}</p>` : ''}
<p style="font-size:11px;margin-top:8px;"><strong>Inject Frameworks:</strong> Add any framework from your library to define how ${meta.name} thinks before every request.</p>`
    });
  });

  try { if (typeof helpInitTopics === 'function') helpInitTopics(); } catch {}

  // ── Guardian v3 Help Topics ──────────────────────────────────────────────

  if (!HELP_TOPICS.find(t => t.id === 'guardian-v3-overview')) {
    HELP_TOPICS.push({
      id: 'guardian-v3-overview',
      title: 'Guardian v3 — Overview',
      icon: '⬡',
      content: `<h3 style="color:var(--c);font-family:var(--display);letter-spacing:.18em">⬡ GUARDIAN v3 — BROWSER EXECUTION LAYER</h3>
<p style="font-size:11px;line-height:1.8;">Guardian is the Firefox extension that provides NEXUS with live browser session access. It captures DOM elements as Callto objects and streams URCK events back through the bridge.</p>
<p style="font-size:11px;margin-top:10px;"><strong style="color:var(--g)">Guardian IS:</strong> the only system that touches the browser. It executes CDP commands, observes DOM mutations, and creates Callto objects.</p>
<p style="font-size:11px;margin-top:8px;"><strong style="color:var(--m)">IR Resolver IS:</strong> the only system that decides where a Callto goes. All routing decisions stay in the IR layer.</p>
<p style="font-size:11px;margin-top:8px;"><strong style="color:var(--g)">Nexus IS:</strong> the only system that retains meaning over time — persistent memory, orchestration, and policy.</p>
<p style="font-size:11px;margin-top:10px;"><strong>Install:</strong> Firefox → about:debugging → Load Temporary Add-on → select <code style="color:var(--c)">guardian/manifest.json</code></p>`,
    });

    HELP_TOPICS.push({
      id: 'guardian-v3-protocol',
      title: 'Guardian v3 — Protocol',
      icon: '⬡',
      content: `<h3 style="color:var(--c);font-family:var(--display);letter-spacing:.18em">⬡ GUARDIAN v3 — HANDSHAKE + PULSE</h3>
<p style="font-size:11px;line-height:1.8;"><strong>instanceId format:</strong> <code style="color:var(--c)">guardian-{uuid}</code> — e.g. <code style="color:var(--c)">guardian-3000b1c2-0669-4d5a-a9b4-3f1e06cc4420</code>. Opaque string, hyphen-separated. Display short ID (<code>3000b1c2</code>) is derived in UI only — never used for routing.</p>
<p style="font-size:11px;margin-top:10px;"><strong>Handshake:</strong> On init, Guardian sends <code>POST /guardian/handshake</code> with instanceId, challenge, and capabilities. Bridge responds with a 60-second session token. Re-handshake happens automatically at 55s.</p>
<p style="font-size:11px;margin-top:8px;"><strong>Pulse:</strong> Every 1.5 seconds, Guardian POSTs to <code>/pulse</code>. This updates the Nexus node registry. Nodes are marked stale after 10s and removed after 30s with no pulse.</p>
<p style="font-size:11px;margin-top:8px;"><strong>Token:</strong> All bridge requests include <code style="color:var(--c)">X-Guardian-Token</code> header. A 401 response triggers automatic re-handshake.</p>`,
    });

    HELP_TOPICS.push({
      id: 'guardian-v3-agent-hooks',
      title: 'Guardian v3 — Agent Hooks',
      icon: '⬡',
      content: `<h3 style="color:var(--g);font-family:var(--display);letter-spacing:.18em">⬡ AGENT → CALLTO HOOKS</h3>
<p style="font-size:11px;line-height:1.8;">Each AI agent can be linked to a Guardian Callto. When a Callto is assigned to an agent, the mapping is mirrored to the bridge via <code>POST /guardian/agent-hook</code> and a confirmation card appears showing the hook details.</p>
<p style="font-size:11px;margin-top:10px;"><strong>Mirror card shows:</strong> agent ID, callto ID, intent, selector, and URL. The bridge persists all hooks to <code>bridge/data/agent-hooks.json</code>.</p>
<p style="font-size:11px;margin-top:8px;"><strong>Fire a hook:</strong> Click the ⟡ button next to a hooked agent to send its callto directly to the Console.</p>
<p style="font-size:11px;margin-top:8px;"><strong>Retrieve hooks:</strong> <code>GET /guardian/agent-hooks</code> returns the full agent→callto map.</p>`,
    });

    HELP_TOPICS.push({
      id: 'guardian-v3-diagnostics',
      title: 'Guardian v3 — Diagnostics',
      icon: '⬡',
      content: `<h3 style="color:var(--y);font-family:var(--display);letter-spacing:.18em">⬡ DIAGNOSTICS — #nx-diag GUARDIAN TAB</h3>
<p style="font-size:11px;line-height:1.8;">Open the ⬡ DIAG panel (bottom-right) → click the GUARDIAN tab. 10 tests run against the live bridge and Guardian state:</p>
<ol style="padding-left:18px;font-size:11px;line-height:2;">
<li>Bridge /health reachable</li>
<li>Handshake → token issued</li>
<li>Token validity via heartbeat</li>
<li>Pulse POST → node registry</li>
<li>BroadcastChannel alive</li>
<li>Callto pipeline</li>
<li>Agent hooks registry</li>
<li>Bus emit</li>
<li>Bridge version (3.1.0)</li>
<li>instanceId format valid</li>
</ol>
<p style="font-size:11px;margin-top:8px;">Click <strong>▶ RUN ALL</strong> to run the full suite. Each test can also be run individually. Results log to the panel in real time.</p>`,
    });

    HELP_TOPICS.push({
      id: 'ai-dynamic-default',
      title: 'AI — Dynamic Default Provider',
      icon: '◈',
      content: `<h3 style="color:var(--c);font-family:var(--display);letter-spacing:.18em">◈ DYNAMIC AI DEFAULT</h3>
<p style="font-size:11px;line-height:1.8;"><strong>Selected agent = default.</strong> Clicking an agent in AI SETTINGS sets it as the active provider immediately and persists in <code>nx6_last_provider</code>.</p>
<p style="font-size:11px;margin-top:10px;"><strong>Auto-probe on startup:</strong> If no provider is saved, NEXUS probes all configured providers silently. The first one that responds becomes the default. A green toast confirms the selection.</p>
<p style="font-size:11px;margin-top:8px;"><strong>Failure toasts:</strong> Any provider that has an API key configured but fails its probe fires a yellow toast: <em>AI probe: PROVIDER failed — reason</em>. This is non-blocking — NEXUS continues with the first live provider.</p>
<p style="font-size:11px;margin-top:8px;"><strong>Ollama:</strong> Always probed (no key required). If Ollama is running at <code>localhost:11434</code>, it is available as a fallback even without an API key.</p>`,
    });

    HELP_TOPICS.push({
      id: 'forge-eravos-integration',
      title: 'Forge + Eravos — Integration Pattern',
      icon: '⚡',
      content: `<h3 style="color:var(--m);font-family:var(--display);letter-spacing:.18em">⚡ FORGE + ERAVOS HOOK PATTERN</h3>
<p style="font-size:11px;line-height:1.8;">The Guardian→Nexus integration pattern is the template for connecting Forge and Eravos to the same bridge:</p>
<pre style="background:var(--bg);border:1px solid var(--border2);border-radius:2px;padding:8px;font-size:9px;margin-top:8px;line-height:1.7;overflow-x:auto;">1. REGISTER  POST /guardian/handshake
            {logicalId, instanceId, capabilities[]}
2. PULSE     POST /pulse every 1.5s
3. EMIT      POST /bus/emit
            {type:'forge:event', payload:{...}}
4. RECEIVE   GET /events (SSE stream)
5. HOOK      POST /guardian/agent-hook</pre>
<p style="font-size:11px;margin-top:8px;"><strong>Forge:</strong> <code style="color:var(--c)">logicalId: 'forge'</code>, <code>instanceId: 'forge-{uuid}'</code></p>
<p style="font-size:11px;margin-top:4px;"><strong>Eravos:</strong> <code style="color:var(--c)">logicalId: 'eravos'</code>, <code>instanceId: 'eravos-{uuid}'</code></p>
<p style="font-size:11px;margin-top:8px;">Both appear in the Devices tab pulse registry and can send/receive calltos via IR Resolver <code>type: "device"</code> RouteSpec.</p>`,
    });

    try { if (typeof helpInitTopics === 'function') helpInitTopics(); } catch {}
  }
}

/* ══════════════════════════════════════════════════════════════════
   BOOT
══════════════════════════════════════════════════════════════════ */
// Expose NEXUS_AGENTS globally so any external code can access agent metadata
window.NEXUS_AGENTS = NEXUS_AGENTS;

function whenReady(fn) {
  if (document.readyState === 'complete' || document.readyState === 'interactive') setTimeout(fn, 200);
  else window.addEventListener('load', () => setTimeout(fn, 200));
}

whenReady(() => {
  injectStyles();
  registerHooks();
  // Build AI sub-tab after a tick (lets existing init run first)
  setTimeout(() => {
    buildAiSubTab();
    injectHelpTopics();
    // Watch for AI tab becoming active
    const _orig = typeof optSwitchTab === 'function' ? optSwitchTab.bind(window) : null;
    if (_orig) {
      window.optSwitchTab = function(tab, btn) {
        _orig(tab, btn);
        if (tab === 'ai') {
          buildAiSubTab();          // no-op after first build (dataset.p5guardian guard)
          p5gSyncAllCalltos();      // re-sync Guardian calltos on every open
          NEXUS_AGENTS.forEach(m => p5gLoadHookState(m.id));
          startLivePolling();
        } else {
          stopLivePolling();
        }
      };
    }
  }, 300);
});

console.log('[NEXUS v0.53.0] Phase 5 loaded — Agent-centric AI + Framework Injection active.');

})();

/* ── WIRE PICKER + TEST per agent ──────────────────────────────── */

// Open Guardian element picker for the INPUT callto (where to type)
window.p5gOpenWirePicker = function(agentId) {
  localStorage.setItem('p5g_wiring_agent', agentId);
  localStorage.setItem('p5g_wiring_type', 'input');
  if (typeof guardianWireWizardOpen === 'function') {
    guardianWireWizardOpen(agentId);
  } else if (typeof toast === 'function') {
    toast('Guardian wizard not ready — reload and try again', 'warn', 3000);
  }
};

// Open Guardian element picker for the OUTPUT callto (where response appears)
window.p5gOpenOutputPicker = function(agentId) {
  localStorage.setItem('p5g_wiring_agent', agentId);
  localStorage.setItem('p5g_wiring_type', 'output');
  // Output wiring: send BC signal for output pick mode, no full wizard needed
  if (typeof GUARDIAN !== 'undefined' && GUARDIAN._bc) {
    try {
      GUARDIAN._bc.postMessage({
        type: 'GUARDIAN_OPEN_PICK',
        agentId: agentId,
        pickMode: 'output',
        label: agentId + ' response area',
        source: 'nexus-phase5',
      });
    } catch(_) {}
  }
  if (typeof toast === 'function') toast('⟁ Guardian pick mode active — click the AI response area in Firefox', 'ok', 5000);
};

// Test the wired agent
window.p5gTestAgent = async function(agentId) {
  const btn = document.getElementById('p5g-test-btn-' + agentId);
  const badge = document.getElementById('p5g-badge-' + agentId);
  if (btn) { btn.textContent = '…'; btn.disabled = true; }

  const hooks = JSON.parse(localStorage.getItem('nx_guardian_agent_hooks') || '{}');
  const hook = hooks[agentId];

  if (!hook || !hook.calltoId) {
    if (typeof toast === 'function') toast('⚠ No callto wired for ' + agentId + ' — use ⟁ WIRE INPUT first', 'warn', 5000);
    if (btn) { btn.textContent = '▶ TEST'; btn.disabled = false; }
    return;
  }

  try {
    const r = await fetch('http://127.0.0.1:3747/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'guardian',
        agentId,
        messages: [{ role: 'user', content: 'NEXUS WIRE TEST — reply: OK ' + agentId.toUpperCase() }],
        intent: hook.intent || 'chat',
      }),
      signal: AbortSignal.timeout(8000),
    });
    const d = await r.json();
    if (r.status === 202) {
      if (badge) { badge.textContent = '⟁ WIRED'; badge.style.color = 'var(--g)'; }
      if (btn) { btn.textContent = '✓'; btn.style.color = 'var(--g)'; }
      if (typeof toast === 'function') toast('✓ ' + agentId + ' exec dispatched via Guardian · watching for response…', 'ok', 4000);
      if (typeof _guardianLogDiag === 'function') _guardianLogDiag('[' + agentId + '] Test dispatched · callto: ' + hook.calltoId.slice(0,14), 'var(--g)');
    } else {
      if (btn) { btn.textContent = '✗'; btn.style.color = 'var(--r)'; }
      if (typeof toast === 'function') toast('✗ ' + agentId + ' test failed: ' + (d.hint || d.error || r.status), 'err', 5000);
    }
  } catch(e) {
    if (btn) { btn.textContent = '✗'; btn.style.color = 'var(--r)'; }
    if (typeof toast === 'function') toast('✗ ' + agentId + ': ' + e.message, 'err', 4000);
  }
  setTimeout(function() {
    if (btn) { btn.textContent = '▶ TEST'; btn.style.color = ''; btn.disabled = false; }
  }, 3000);
};

/* ── API section toggle + guardian-aware visibility ─────────── */
window.p5gToggleApiSection = function(agentId) {
  var body   = document.getElementById('p5g-api-body-' + agentId);
  var toggle = document.getElementById('p5g-api-toggle-' + agentId);
  if (!body) return;
  var isHidden = body.style.display === 'none';
  body.style.display = isHidden ? '' : 'none';
  if (toggle) toggle.textContent = isHidden ? '▴ hide' : '▾ show';
};

// After agent list renders, auto-hide API section if guardian hook wired
window.p5gUpdateApiVisibility = function() {
  var hooks = {};
  try { hooks = JSON.parse(localStorage.getItem('nx_guardian_agent_hooks') || '{}'); } catch {}
  var calltos = (typeof GUARDIAN !== 'undefined' ? GUARDIAN.calltos : []) || [];

  document.querySelectorAll('[id^="p5g-api-section-"]').forEach(function(section) {
    var agentId = section.id.replace('p5g-api-section-', '');
    var hook = hooks[agentId];
    var warn = document.getElementById('p5g-api-warn-' + agentId);
    if (hook && hook.calltoId) {
      // Guardian hook active — API is fallback only
      if (warn) { warn.textContent = 'fallback'; warn.style.color = 'var(--text4)'; }
    } else {
      if (warn) warn.textContent = '';
    }
  });
};

// Run on load and when hooks change
setTimeout(window.p5gUpdateApiVisibility, 2000);

/* ── Per-agent config: toggle, save, load, axioms, frameworks ─────────────── */

window.p5gToggleAgentConfig = function(agentId) {
  var body   = document.getElementById('p5g-cfg-body-' + agentId);
  var toggle = document.getElementById('p5g-cfg-toggle-' + agentId);
  if (!body) return;
  var hidden = body.style.display === 'none' || !body.style.display;
  body.style.display   = hidden ? 'flex' : 'none';
  body.style.flexDirection = 'column';
  if (toggle) toggle.textContent = hidden ? '▴ hide' : '▾ show';
  if (hidden) p5gLoadAgentConfig(agentId);
};

function _getAgentConfigs() {
  try { return JSON.parse(localStorage.getItem('nx_agent_configs') || '{}'); } catch { return {}; }
}
function _saveAgentConfigs(obj) {
  localStorage.setItem('nx_agent_configs', JSON.stringify(obj));
}

window.p5gSaveAgentConfig = function(agentId) {
  var configs = _getAgentConfigs();
  var pp   = document.getElementById('p5g-preprompt-'  + agentId);
  var ax   = document.getElementById('p5g-axioms-'     + agentId);
  var fw   = document.getElementById('p5g-frameworks-' + agentId);

  // Collect axioms from rendered inputs
  var axioms = [];
  if (ax) ax.querySelectorAll('textarea[data-axiom]').forEach(function(ta) {
    if (ta.value.trim()) axioms.push(ta.value.trim());
  });

  // Collect frameworks from rendered inputs
  var frameworks = [];
  if (fw) fw.querySelectorAll('input[data-framework]').forEach(function(inp) {
    if (inp.value.trim()) frameworks.push(inp.value.trim());
  });

  configs[agentId] = {
    prePrompt:  pp ? pp.value : (configs[agentId]?.prePrompt || ''),
    axioms:     axioms.length ? axioms : (configs[agentId]?.axioms || []),
    frameworks: frameworks.length ? frameworks : (configs[agentId]?.frameworks || []),
    ts: Date.now(),
  };
  _saveAgentConfigs(configs);
};

window.p5gLoadAgentConfig = function(agentId) {
  var configs = _getAgentConfigs();
  var cfg = configs[agentId] || {};

  // Pre-prompt
  var pp = document.getElementById('p5g-preprompt-' + agentId);
  if (pp) pp.value = cfg.prePrompt || '';

  // Axioms
  var axContainer = document.getElementById('p5g-axioms-' + agentId);
  if (axContainer) {
    var axioms = cfg.axioms || [];
    if (!axioms.length) {
      axContainer.innerHTML = '<div style="font-size:9px;color:var(--text3);padding:3px 0;font-style:italic">No axioms — click + ADD</div>';
    } else {
      axContainer.innerHTML = axioms.map(function(a, i) {
        return '<div style="display:flex;gap:4px;align-items:center">'
          + '<textarea data-axiom="' + i + '" rows="1" style="flex:1;font-family:var(--mono);font-size:9px;background:var(--bg);border:1px solid var(--border2);border-radius:2px;padding:3px 6px;color:var(--text);resize:none;outline:none" onchange="p5gSaveAgentConfig(\'' + agentId + '\')">' + a.replace(/</g,'&lt;') + '</textarea>'
          + '<button class="btn" style="font-size:8px;padding:1px 5px;color:var(--r);border-color:rgba(255,45,85,.3)" onclick="p5gRemoveAxiom(\'' + agentId + '\',' + i + ')">×</button>'
          + '</div>';
      }).join('');
    }
  }

  // Frameworks
  var fwContainer = document.getElementById('p5g-frameworks-' + agentId);
  if (fwContainer) {
    var frameworks = cfg.frameworks || [];
    if (!frameworks.length) {
      fwContainer.innerHTML = '<div style="font-size:9px;color:var(--text3);padding:3px 0;font-style:italic">No frameworks — click + ADD</div>';
    } else {
      fwContainer.innerHTML = frameworks.map(function(f, i) {
        return '<div style="display:flex;gap:4px;align-items:center">'
          + '<input data-framework="' + i + '" value="' + f.replace(/"/g,'&quot;') + '" style="flex:1;font-family:var(--mono);font-size:9px;background:var(--bg);border:1px solid var(--border2);border-radius:2px;padding:3px 6px;color:var(--text);outline:none" onchange="p5gSaveAgentConfig(\'' + agentId + '\')" placeholder="Framework name or description…"/>'
          + '<button class="btn" style="font-size:8px;padding:1px 5px;color:var(--r);border-color:rgba(255,45,85,.3)" onclick="p5gRemoveFramework(\'' + agentId + '\',' + i + ')">×</button>'
          + '</div>';
      }).join('');
    }
  }
};

window.p5gAddAxiom = function(agentId) {
  var configs = _getAgentConfigs();
  if (!configs[agentId]) configs[agentId] = { prePrompt:'', axioms:[], frameworks:[], ts: Date.now() };
  configs[agentId].axioms = configs[agentId].axioms || [];
  configs[agentId].axioms.push('');
  _saveAgentConfigs(configs);
  p5gLoadAgentConfig(agentId);
  // Focus the new textarea
  var ax = document.getElementById('p5g-axioms-' + agentId);
  if (ax) { var tas = ax.querySelectorAll('textarea'); if (tas.length) tas[tas.length-1].focus(); }
};

window.p5gRemoveAxiom = function(agentId, idx) {
  var configs = _getAgentConfigs();
  if (!configs[agentId]?.axioms) return;
  configs[agentId].axioms.splice(idx, 1);
  _saveAgentConfigs(configs);
  p5gLoadAgentConfig(agentId);
};

window.p5gAddFramework = function(agentId) {
  var configs = _getAgentConfigs();
  if (!configs[agentId]) configs[agentId] = { prePrompt:'', axioms:[], frameworks:[], ts: Date.now() };
  configs[agentId].frameworks = configs[agentId].frameworks || [];
  configs[agentId].frameworks.push('');
  _saveAgentConfigs(configs);
  p5gLoadAgentConfig(agentId);
  var fw = document.getElementById('p5g-frameworks-' + agentId);
  if (fw) { var inps = fw.querySelectorAll('input'); if (inps.length) inps[inps.length-1].focus(); }
};

window.p5gRemoveFramework = function(agentId, idx) {
  var configs = _getAgentConfigs();
  if (!configs[agentId]?.frameworks) return;
  configs[agentId].frameworks.splice(idx, 1);
  _saveAgentConfigs(configs);
  p5gLoadAgentConfig(agentId);
};

/* ── Expose agent config to AI dispatch (pre-prompt + axioms + frameworks) ─── */
window.p5gGetAgentConfig = function(agentId) {
  return _getAgentConfigs()[agentId] || { prePrompt: '', axioms: [], frameworks: [] };
};
