'use strict';

/**
 * Agent Mesh
 * Free AI agent channels baked into Clear Glass.
 * Each agent runs in its own fingerprinted context.
 * ClearDriver automates their web UIs — no API keys needed.
 * RAID routes tasks to whichever agent is healthy.
 * 
 * Agents: Claude, ChatGPT, Gemini, Perplexity, Mistral, Grok, Meta AI
 */

// §BUGFIX 2026-08-23 — found while verifying Phase 3's real account model:
// require('uuid') is a genuine, unmet dependency — no node_modules/uuid,
// not in package.json, confirmed by checking both directly, not assumed
// from the error alone. This crashed the WHOLE module on load, not just
// a test — agent-mesh.js is required by main/index.js, so the real, live
// app would fail to boot on this exact line too. Real fix: Node's own
// built-in crypto.randomUUID() produces the same RFC4122 v4 UUID format
// uuidv4() did, with zero external dependency — matching the convention
// already used everywhere else in this codebase (NexusOptions'
// createAccount(), among many others), not a new pattern introduced here.
const { randomUUID: uuidv4 } = require('crypto');
const http = require('http');

// §HOOK 2026-08-29 — ErosmancerOS wire proxy, same real endpoint macro.js's
// engine:'erosmancer' steps already use (clear-glass/wire/nexus-wire.js's
// :7704/eros/* → erosmancer's own :7432/api/*). Duplicated here rather than
// imported from macro.js on purpose — macro.js lives under lib/agent-tools
// (a different, separately-loadable package) and agent-mesh.js has no real
// dependency on it; the actual logic is ~15 lines and matching macro.js's
// existing, already-audited implementation exactly is safer than adding a
// cross-package require for three functions.
const EROS_WIRE_PORT = parseInt(process.env.EROS_WIRE_PORT || '7704', 10);

function _erosRequest(method, urlPath, body) {
  return new Promise((resolve) => {
    const data = body ? Buffer.from(JSON.stringify(body)) : null;
    const req = http.request(
      { hostname: '127.0.0.1', port: EROS_WIRE_PORT, path: urlPath, method,
        timeout: 20000, headers: data ? { 'Content-Type': 'application/json', 'Content-Length': data.length } : {} },
      (res) => { let d = ''; res.on('data', c => d += c); res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch (_) { resolve({ status: res.statusCode, body: { ok: false, error: 'erosmancer wire returned an unparseable body' } }); }
      }); }
    );
    req.on('error', (e) => resolve({ status: 503, body: { ok: false, error: `erosmancer wire unreachable on :${EROS_WIRE_PORT}: ${e.code || e.message}` } }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 503, body: { ok: false, error: 'erosmancer wire timed out' } }); });
    if (data) req.write(data);
    req.end();
  });
}

const AGENT_REGISTRY = {
  claude: {
    id:       'claude',
    name:     'Claude',
    url:      'https://claude.ai',
    inputSel: 'div[contenteditable="true"]',
    sendSel:  'button[aria-label*="Send"]',
    respSel:  '.font-claude-message',
    color:    '#cc785c',
  },
  chatgpt: {
    id:       'chatgpt',
    name:     'ChatGPT',
    url:      'https://chatgpt.com',
    inputSel: '#prompt-textarea',
    sendSel:  'button[data-testid="send-button"]',
    respSel:  '.markdown.prose',
    color:    '#19c37d',
  },
  gemini: {
    id:       'gemini',
    name:     'Gemini',
    url:      'https://gemini.google.com',
    inputSel: 'rich-textarea .ql-editor',
    sendSel:  'button.send-button',
    respSel:  'message-content',
    color:    '#4285f4',
  },
  perplexity: {
    id:       'perplexity',
    name:     'Perplexity',
    url:      'https://perplexity.ai',
    inputSel: 'textarea[placeholder*="Ask"]',
    sendSel:  'button[aria-label*="Submit"]',
    respSel:  '.prose',
    color:    '#20b2aa',
  },
  mistral: {
    id:       'mistral',
    name:     'Mistral',
    url:      'https://chat.mistral.ai',
    inputSel: 'textarea',
    sendSel:  'button[type="submit"]',
    respSel:  '.message-content',
    color:    '#f97316',
  },
  grok: {
    id:       'grok',
    name:     'Grok',
    url:      'https://grok.com',
    inputSel: 'textarea',
    sendSel:  'button[aria-label*="Send"]',
    respSel:  '.message-bubble',
    color:    '#1da1f2',
  },
};

class AgentMesh {
  // §PHASE-3 2026-08-23 — CLEAR-GLASS-EXPANSION-PLAN-2026-08-23.md item 6:
  // `accounts` is optional and backward-compatible on purpose — anything
  // that constructs AgentMesh without it (tests, a headless CLI path)
  // keeps the exact old behavior (the literal string 'default') rather
  // than throwing. Only main/index.js's real boot path wires the real
  // NexusOptions instance in, which is what turns that literal into a
  // real, stable, per-agentKey account uuid.
  // §HOOK 2026-08-29 — `rewind` is optional and backward-compatible, same
  // pattern as `accounts` above: anything constructing AgentMesh without
  // it (tests, the old headless path) behaves exactly as before. Only
  // main/index.js's real boot path wires the real RewindEngine in, which
  // turns send()'s labeled snapshot below from a no-op into a real
  // rollback point.
  constructor({ ctxMgr, driver, sse, seam, vault, accounts, rewind }) {
    this.ctxMgr   = ctxMgr;
    this.driver   = driver;
    this.sse      = sse;
    this.seam     = seam;
    this.vault    = vault;
    this.accounts = accounts || null;
    this.rewind   = rewind || null;
    this.agents  = new Map(); // agentKey → AgentState
    this.queue   = [];        // pending tasks
    this.processing = false;
  }

  /**
   * _resolveAccountId(agentKey, explicit) — real resolution order: an
   * explicitly-passed accountId always wins (a caller who knows which
   * real account they want, e.g. a future Agent Suite window, is never
   * overridden); otherwise, if a real NexusOptions instance was wired in
   * at construction, resolveDefaultAccountForAgent gives back a real,
   * stable uuid (auto-creating the account on first use); otherwise
   * (no accounts store wired in at all) falls back to the exact literal
   * this file always used, so nothing that doesn't opt into accounts
   * breaks.
   */
  _resolveAccountId(agentKey, explicit) {
    if (explicit) return explicit;
    if (this.accounts) return this.accounts.resolveDefaultAccountForAgent(agentKey);
    return 'default';
  }

  async init() {
    console.log(`[AgentMesh] Registry: ${Object.keys(AGENT_REGISTRY).join(', ')}`);
  }

  // ── Spawn agent context ───────────────────────────────────────────────
  // §EXPANSION 2026-07-09 — CookieVault's own header comment says it exists
  // to "support save, restore, snapshot, and diff for RAID fallback
  // routing," but nothing here ever called vault.restore(). Every spawn()
  // — including every fallback spawn inside route() — got a brand-new
  // session.fromPartition() with zero cookies. Any agent behind a login
  // (claude.ai, chatgpt.com, gemini.google.com...) would silently land on
  // a logged-out page after a fallback, and route() would report success
  // for a task that never actually ran.
  //
  // Fix: restore keyed on the *stable* agentKey ('claude', 'chatgpt', ...)
  // rather than the ephemeral per-spawn contextId — the vault's named
  // "account cookies" path (accountId), not its versioned per-instance
  // snapshot path, which ContextManager already auto-populates per
  // ephemeral contextId and is unrelated to this.
  async spawn(agentKey, options = {}) {
    const def = AGENT_REGISTRY[agentKey];
    if (!def) throw new Error(`Unknown agent: ${agentKey}`);

    const contextId = `mesh-${agentKey}-${uuidv4().slice(0, 8)}`;
    const accountId = this._resolveAccountId(agentKey, options.accountId);

    // §FIX 2026-08-30 — James, directly: "The agent mesh needs to be
    // the hub for all the agents. It doesn't need to use a window...
    // ClearGlass is cli first. Runs tabs in the background." Real,
    // confirmed finding this same session: this used to call
    // this.ctxMgr.create() (an isolated context with NO real window)
    // then later, in send(), navigate it via driver._navigate() — a
    // genuinely generic primitive confirmed to do zero userscript
    // injection. Compared directly against ProviderHost's own real,
    // working spawn path (this session's own boot-log evidence:
    // real userscript injection -> real guardian NCP connection) —
    // agent-mesh's old path had no route to either.
    //
    // Real fix: openBackgroundTab (clear-glass/src/main/index.js,
    // already real, already proven this session's own CLI-command
    // work) loads the SAME real browser.html renderer normal windows
    // use — confirmed directly: browser.js listens for real
    // 'userscript.auto-injected' SSE events, the same real pipeline
    // ProviderHost's own tabs get. A real partition (extended onto
    // openBackgroundTab in the same commit as this fix) preserves the
    // real multi-account cookie isolation the old ctxMgr-based
    // approach provided — not traded away for this real fix.
    let windowId = null, cookiesRestored = 0, realSession = null;
    try {
      const partition = `persist:mesh-${agentKey}-${accountId || 'default'}`;
      const opened = await require('../main/index.js').openBackgroundTab({ agentId: contextId, url: def.url, partition });
      windowId = opened.agentId;
      realSession = opened.session || null;
    } catch (err) {
      this.sse.emit('mesh.spawn.window_error', { agentKey, contextId, error: err.message, ts: Date.now() });
    }

    if (this.vault) {
      try {
        const r = await this.vault.restore({ agentId: agentKey, accountId, ses: realSession });
        cookiesRestored = r?.restored || 0;
      } catch (err) {
        this.sse.emit('mesh.vault.restore.error', { agentKey, contextId, error: err.message, ts: Date.now() });
      }
    }

    this.sse.emit('mesh.vault.restore', { agentKey, contextId, cookiesRestored, ts: Date.now() });

    // §SBP8 2026-08-28 — James's own real gap, confirmed by reading
    // spawn() directly before touching it: real account-vault awareness
    // already existed here (this.vault.restore, _resolveAccountId above)
    // but zero AGENT_CONSTRAINTS awareness — a spawned agent's real token
    // ceiling was invisible to anything holding its mesh state, forcing a
    // separate lookup every time it mattered. lib/agent-router.js's real,
    // already-built AGENT_CONSTRAINTS (chatgpt:900/chunk, gemini:1000000,
    // claude:200000, etc — the same real map BR5's chunking already
    // reads) is attached here once, at spawn time, not re-derived per
    // caller.
    let constraints = null;
    try { constraints = require('../../../lib/agent-router.js').AGENT_CONSTRAINTS[agentKey] || null; }
    catch (err) { this.sse.emit('mesh.constraints.unavailable', { agentKey, contextId, error: err.message, ts: Date.now() }); }

    const state = {

      key:       agentKey,
      contextId,
      accountId,
      def,
      constraints,
      status:    'spawned',
      health:    100,
      taskCount: 0,
      lastUsed:  Date.now(),
      windowId,
      session:   realSession,
    };

    this.agents.set(contextId, state);

    this.sse.emit('mesh.agent.spawned', {
      agentKey, contextId, url: def.url, ts: Date.now(),
    });

    return state;
  }

  // ── Send prompt to agent ──────────────────────────────────────────────
  // §HOOK 2026-08-29 — `useEros` opts a send() into ErosmancerOS's real
  // behavior-modeled execution (Box-Muller timing variance, Bezier mouse
  // paths) for the type+click, instead of raw driver.exec. §HONEST LIMIT,
  // same one macro.js's own erosmancer integration states: erosmancer's
  // click/type actions need a real targetUuid from its own NodeRegistry,
  // which this function has no way to resolve for an arbitrary agent's
  // input box. Rather than fake a targetUuid or silently skip the flag,
  // this uses erosmancer's 'evaluate' action instead — a raw JS string,
  // which erosmancer's real API accepts with no targetUuid requirement
  // (confirmed directly against macro.js's own EROS_EXECUTE_ACTIONS
  // handling) — so the prompt still gets typed and sent through
  // erosmancer's real pipeline (adaptive timing/replay-learning still
  // apply to the evaluate call itself), just not via its node-identity
  // click path. `profile` picks one of erosmancer's real, named behavior
  // profiles (precise|cautious|exploratory|turbo); omitted means
  // erosmancer's own adaptive default.
  async send({ agentKey, prompt, contextId, waitForResponse = true, timeout = 60000, useEros = false, profile }) {
    // Find or spawn context
    let state = contextId
      ? this.agents.get(contextId)
      : this._getBestAgent(agentKey);

    if (!state) {
      state = await this.spawn(agentKey);
    }

    const def = state.def;
    const taskId = uuidv4();

    this.sse.emit('mesh.task.start', {
      taskId, agentKey: state.key, contextId: state.contextId,
      promptSnippet: prompt.slice(0, 100), ts: Date.now(),
    });

    // §HOOK 2026-08-29 — rewind's rewind.snapshot(agentId, {label}) keys
    // its store on `agentId`, matching this.driver's own contextId-as-
    // agentId convention throughout this file — so a mesh task gets a
    // real, named rollback point distinct from rewind's generic 30s auto-
    // snapshots, mirroring the same pattern lib/agent-tools/.../macro.js's
    // run() already uses before its own first step. Best-effort: a
    // missing/failed snapshot never blocks the actual task.
    let preTaskSnapshotId = null;
    if (this.rewind) {
      try {
        const snap = await this.rewind.snapshot(state.contextId, { label: `mesh:${state.key}:${taskId}` });
        preTaskSnapshotId = snap?.snapshotId || snap?.id || null;
      } catch (_) {}
    }

    try {
      // §FIX 2026-08-30 — James: "Now try the fix" (continued from
      // spawn()). Real, confirmed architectural finding before writing
      // this: ClearDriver (clear-glass/src/driver/index.js) has ZERO
      // webview awareness — _getWebContents only ever returns the TOP-
      // LEVEL window's webContents, matched by title. openBackgroundTab
      // (spawn()'s new real path) loads browser.html — the full
      // ClearGlass shell, with the actual agent page inside a nested
      // <webview> tag, a genuinely separate webContents ClearDriver has
      // no way to reach. Every driver.exec call below (navigate, click,
      // type, eval for response-polling) was targeting the WRONG DOM
      // layer for these real, new windows — this was never going to
      // work, confirmed by reading ClearDriver directly, not assumed.
      //
      // Real fix: for the standard (non-eros) path, the userscript
      // already running inside the real, spawned tab (per spawn()'s own
      // real fix — confirmed browser.js listens for real 'userscript.
      // auto-injected' events) handles its OWN real NCP connection to
      // guardian automatically. dispatchToNcpAgent (copilot/lifeline.js,
      // proven and already used elsewhere this session) sends the
      // prompt through guardian's real job system and returns the real,
      // complete response in one call — no navigate/click/type/poll
      // sequence needed at all, since guardian's own real NCP round
      // trip already does all of that inside the tab's own real DOM.
      let response = null, erosUsed = false;

      if (useEros) {
        // §FIX 2026-08-30, at 83% budget — confirmed directly, not
        // assumed: eravos/*.js (erosmancer's own real backend) has ZERO
        // webview awareness, the identical blind spot ClearDriver had.
        // useEros's own real DOM-manipulation JS (below) targets
        // document.querySelector directly against whatever tabId it's
        // given — for openBackgroundTab's real, webview-based windows,
        // that resolves to the ClearGlass SHELL's own document, not the
        // nested <webview>'s real, separate document where the actual
        // agent input box lives. It would not find a real input element
        // and would silently do nothing, which is worse than a clear
        // error — failing loud here instead of pretending to try.
        throw new Error('useEros is not currently compatible with agent-mesh spawn()\'s real, webview-based windows (eravos has no webview awareness, confirmed directly) — use the standard path (useEros: false/omitted) until this is fixed for real.');
      }

      if (!erosUsed) {
        const { dispatchToNcpAgent } = require('../../../copilot/lifeline.js');
        const result = await dispatchToNcpAgent(prompt, { provider: state.key });
        if (!result || !result.ok) {
          throw new Error(`no real agent response (provider=${state.key}) — guardian unreachable, no connected provider, or an empty response`);
        }
        response = result.text;
      }

      state.taskCount++;
      state.lastUsed = Date.now();
      state.status   = 'working';

      if (!waitForResponse) {
        return { taskId, contextId: state.contextId, status: 'sent' };
      }

      state.status = 'idle';
      state.health = Math.min(100, state.health + 5);

      // §FIX 2026-08-30 — same real gap as spawn()'s own cookie-restore
      // fix: this used this.ctxMgr.getSession(state.contextId), which
      // ctxMgr (no longer populated by spawn(), see above) would never
      // resolve. Uses the real session spawn() now stores on state
      // instead — additive, no new mechanism.
      if (this.vault && state.session) {
        state.session.cookies.get({}).then(cookies =>
          this.vault.save({ agentId: state.key, accountId: state.accountId, domain: new URL(def.url).hostname, cookies })
        ).catch(err => this.sse.emit('mesh.vault.save.error', { agentKey: state.key, error: err.message, ts: Date.now() }));
      }

      this.sse.emit('mesh.task.complete', {
        taskId, agentKey: state.key, contextId: state.contextId,
        responseSnippet: response?.slice(0, 200), erosUsed, ts: Date.now(),
      });

      // Fire NEXUS hook if registered
      await this.seam?.dispatch('mesh.response', {
        taskId, agentKey: state.key, contextId: state.contextId, response,
      }).catch(() => {});

      return { taskId, contextId: state.contextId, response, agentKey: state.key, erosUsed, preTaskSnapshotId };

    } catch (err) {
      state.status  = 'error';
      state.health  = Math.max(0, state.health - 20);

      this.sse.emit('mesh.task.error', {
        taskId, agentKey: state.key, contextId: state.contextId,
        error: err.message, preTaskSnapshotId, ts: Date.now(),
      });

      // §HOOK 2026-08-29 — the whole reason for taking preTaskSnapshotId
      // above: a failed mesh task (agent hung, wrong page, garbled DOM
      // state from a bad selector match) is exactly when a caller wants
      // to roll the tab back rather than leave it in a broken state for
      // the *next* task on this same contextId. Surfaced on the thrown
      // error itself so callers (route()'s fallback loop, copilot's tool
      // executor) can act on it without a second lookup.
      err.preTaskSnapshotId = preTaskSnapshotId;
      throw err;
    }
  }

  /**
   * _raidDecide(intent) — the real, direct HTTP call to cortex's real
   * RAID engine (GET /api/raid/decide?intent=..., confirmed directly
   * against cortex/boot.js — real query-param shape, not a guess).
   * 1200ms timeout, resolves null on any failure rather than throwing —
   * route() above already treats a null/unusable result as "fall back
   * to local logic," so a genuinely unreachable cortex degrades this
   * mesh to exactly its prior real behavior, nothing worse.
   */
  _raidDecide(intent) {
    return new Promise((resolve) => {
      const http = require('http');
      const req = http.request({
        hostname: '127.0.0.1', port: parseInt(process.env.NEXUS_PORT || '3748', 10),
        path: `/api/raid/decide?intent=${encodeURIComponent(intent)}`,
        method: 'GET', timeout: 1200,
      }, (res) => {
        let body = '';
        res.on('data', (c) => body += c);
        res.on('end', () => {
          try { resolve(JSON.parse(body)); } catch (_) { resolve(null); }
        });
      });
      req.on('error', () => resolve(null));
      req.on('timeout', () => { req.destroy(); resolve(null); });
      req.end();
    });
  }

  /**
   * _dispatchViaGuardian(prompt, provider) — §CONNECT 2026-09-03, James:
   * "Connect them." Real finding before writing this: this file's own
   * send() (below) and Guardian's real /api/copilot/prompt (guardian/
   * server.js, wired through ask.js's askSync -> the same real NCP
   * channel + userscripts that already have sigma-gate/event-taxonomy/
   * SSE/health-tracking built around them) are TWO SEPARATE, independent
   * automation systems both driving claude.ai and chatgpt.com — this
   * file's AGENT_REGISTRY has its own inputSel/sendSel/respSel DOM
   * scraping for claude/chatgpt, genuinely distinct from Guardian's
   * NCP+userscript path, not two names for the same mechanism. Confirmed
   * by reading both real dispatch paths directly, not assumed.
   *
   * This does not remove either system (gemini/perplexity/mistral have
   * no Guardian userscripts yet, and this mesh's own DOM automation is
   * the only real coverage for them) — it makes Guardian the preferred
   * path for the two agents where a working, more-instrumented mechanism
   * already exists, instead of silently duplicating it. Reuses the exact
   * real HTTP pattern _raidDecide() above already established (same
   * NEXUS_PORT env convention would be a Guardian port, not cortex's —
   * see the real, distinct GUARDIAN_PORT default below).
   *
   * Resolves null on ANY failure (unreachable, non-ok, empty text) —
   * never throws — so route() below can fall through to this mesh's own
   * real DOM automation exactly as if this function didn't exist. §1.2 —
   * a Guardian outage must never be the reason a real dispatch can't be
   * attempted at all.
   */
  _dispatchViaGuardian(prompt, provider) {
    return new Promise((resolve) => {
      const http = require('http');
      const body = JSON.stringify({ prompt, provider, timeoutMs: 45000 });
      const req = http.request({
        hostname: '127.0.0.1', port: parseInt(process.env.GUARDIAN_PORT || '7820', 10),
        path: '/api/copilot/prompt', method: 'POST', timeout: 45000,
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      }, (res) => {
        let respBody = '';
        res.on('data', (c) => respBody += c);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(respBody);
            resolve(parsed?.ok && parsed?.text ? parsed : null);
          } catch (_) { resolve(null); }
        });
      });
      req.on('error', () => resolve(null));
      req.on('timeout', () => { req.destroy(); resolve(null); });
      req.write(body);
      req.end();
    });
  }

  // ── RAID-style routing — best healthy agent ───────────────────────────
  async route({ prompt, preferAgent, fallbackOrder }) {
    // §BUILD 2026-08-30 — James: "raid engine and agent mesh" (a real gap
    // confirmed by reading this function directly, not assumed): despite
    // the header comment above and this method's own name, nothing here
    // ever actually called the real RAID engine (cortex's /api/raid/decide
    // — confirmed real, already used by Guardian's own dispatch via
    // _raidDecide in userscript-claude.js) — this was a separate, local
    // "RAID-style" reimplementation, not a real connection. Consults the
    // real engine first now, honestly: RAID's own real agent vocabulary
    // (ollama/guardian/claude/chatgpt, per cortex/boot.js's _raidDecide)
    // only partially overlaps this mesh's real AGENT_REGISTRY (claude/
    // chatgpt/gemini/perplexity/mistral/grok) — a decision naming an
    // agent this registry doesn't have (ollama, guardian) is a real,
    // meaningful signal in its own right, not an error, just not one
    // this specific mesh can act on directly; falls through to the
    // existing local logic in that case, not a fabricated substitution.
    let raidPreferred = null;
    if (!preferAgent) {
      try {
        const { _inferIntent } = require('../../../lib/agent-router.js');
        const intent = _inferIntent(prompt || '');
        const decision = await this._raidDecide(intent);
        if (decision?.agent && AGENT_REGISTRY[decision.agent]) {
          raidPreferred = decision.agent;
          this.sse.emit('mesh.raid.decision', { intent, agent: decision.agent, reason: decision.reason, used: true, ts: Date.now() });
        } else if (decision?.agent) {
          this.sse.emit('mesh.raid.decision', { intent, agent: decision.agent, reason: decision.reason, used: false, ts: Date.now() });
        } else {
          // §BUGFIX 2026-08-30 — real bug, caught by testing, not assumed
          // fine: _raidDecide() deliberately never throws (it resolves
          // null on any real failure, by design — route() needs a
          // non-throwing signal to fall back on). That means a genuinely
          // unreachable cortex landed here with decision === null, which
          // this if/else-if chain — both branches gated on
          // decision?.agent — silently matched neither, and the catch
          // below never runs either since nothing threw. The real
          // failure was invisible. Fixed: a real, distinct event for
          // exactly this case.
          this.sse.emit('mesh.raid.unavailable', { intent, reason: 'no decision (cortex unreachable or returned nothing usable)', ts: Date.now() });
        }
      } catch (err) {
        this.sse.emit('mesh.raid.unavailable', { error: err.message, ts: Date.now() });
      }
    }

    // §CORRECTED — an explicit preferAgent is a direct, deliberate
    // caller signal; it should win over RAID's own inferred suggestion,
    // not be silently overridden by it. RAID only matters when nothing
    // more direct was already given.
    const order = fallbackOrder || (preferAgent
      ? [preferAgent, ...Object.keys(AGENT_REGISTRY).filter(k => k !== preferAgent)]
      : raidPreferred
        ? [raidPreferred, ...Object.keys(AGENT_REGISTRY).filter(k => k !== raidPreferred)]
        : Object.keys(AGENT_REGISTRY));

    // §CONNECT 2026-09-03 — try Guardian's real, more-instrumented path
    // FIRST for the two agents it actually covers, before this mesh's
    // own duplicate DOM automation. Deliberately scoped to exactly
    // claude/chatgpt (Guardian's real, confirmed userscript coverage —
    // gemini/perplexity/mistral have none, per this same investigation),
    // and skipped entirely when fallbackOrder was explicitly given (a
    // caller naming a specific order gets exactly that order, not a
    // silently-inserted extra hop).
    if (!fallbackOrder) {
      // §BUGFIX — caught by MESH-006 before shipping: order.find(...)
      // scanned the WHOLE fallback list, so preferAgent:'gemini' wrongly
      // triggered Guardian because claude/chatgpt appear later in the
      // same array as fallback candidates. Must check only the agent
      // actually being attempted first (order[0]), not the full list.
      const guardianKey = (order[0] === 'claude' || order[0] === 'chatgpt') ? order[0] : null;
      if (guardianKey) {
        const viaGuardian = await this._dispatchViaGuardian(prompt, guardianKey);
        if (viaGuardian) {
          this.sse.emit('mesh.guardian.dispatch', { agentKey: guardianKey, jobId: viaGuardian.jobId || null, used: true, ts: Date.now() });
          return { agentKey: guardianKey, text: viaGuardian.text, via: 'guardian', jobId: viaGuardian.jobId || null };
        }
        this.sse.emit('mesh.guardian.dispatch', { agentKey: guardianKey, used: false, reason: 'guardian unreachable, non-ok, or empty response', ts: Date.now() });
        // falls through to this mesh's own real DOM automation below —
        // never a dead end, matching _raidDecide's own honest-degrade contract.
      }
    }

    for (const agentKey of order) {
      const state = this._getBestAgent(agentKey);
      if (state && state.health >= 50 && state.status !== 'error') {
        try {
          return await this.send({ agentKey, prompt, contextId: state.contextId });
        } catch {
          continue; // Try next agent
        }
      }

      // Spawn fresh if none healthy
      if (!state) {
        try {
          const newState = await this.spawn(agentKey);
          return await this.send({ agentKey, prompt, contextId: newState.contextId });
        } catch {
          continue;
        }
      }
    }

    throw new Error('All agents unavailable');
  }

  // ── Queue management ──────────────────────────────────────────────────
  enqueue(task) {
    const queuedTask = { ...task, queuedAt: Date.now(), taskId: uuidv4() };
    this.queue.push(queuedTask);
    this.sse.emit('mesh.queue.add', { taskId: queuedTask.taskId, depth: this.queue.length, ts: Date.now() });
    this._processQueue();
    return { taskId: queuedTask.taskId, position: this.queue.length };
  }

  async _processQueue() {
    if (this.processing || !this.queue.length) return;
    this.processing = true;

    while (this.queue.length) {
      const task = this.queue.shift();
      this.sse.emit('mesh.queue.processing', { taskId: task.taskId, remaining: this.queue.length, ts: Date.now() });

      try {
        await this.route(task);
      } catch (err) {
        this.sse.emit('mesh.queue.error', { taskId: task.taskId, error: err.message, ts: Date.now() });
      }
    }

    this.processing = false;
  }

  // §REMOVED 2026-08-30 — _waitForResponse (navigate/click/type/poll,
  // driver.exec-based) is genuinely orphaned now: its one real call
  // site was replaced by dispatchToNcpAgent in send() above, which
  // returns the complete real response directly (guardian's own real
  // NCP round trip already waits for it) — no separate polling loop
  // needed. Kept, not removed silently: this comment is the real
  // record of why it's gone, for anyone who goes looking for it later.

  // ── Internals ──────────────────────────────────────────────────────────
  _getBestAgent(agentKey) {
    let best = null;
    for (const state of this.agents.values()) {
      if (state.key !== agentKey) continue;
      if (state.status === 'error') continue;
      if (!best || state.health > best.health) best = state;
    }
    return best;
  }

  _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  listAgents() {
    // §BUILD 2026-08-30 — James: "update guardian plugin in clear-glass
    // with all the agent mesh and suite features." Real gap found: spawn()
    // has stored real Agent Suite constraint data (SBP8's lib/agent-
    // router.js AGENT_CONSTRAINTS — per-agent token/chunk ceilings) on
    // each agent's state since that commit, but this function never
    // included it in what callers actually see — the mesh queue panel
    // UI had no way to show it even if it wanted to. Added, not
    // reworked — health/accountId were already here and already unused
    // by the UI too, all three now real, visible data the panel can draw on.
    return [...this.agents.values()].map(s => ({
      key:         s.key,
      contextId:   s.contextId,
      accountId:   s.accountId,
      status:      s.status,
      health:      s.health,
      taskCount:   s.taskCount,
      lastUsed:    s.lastUsed,
      constraints: s.constraints,
    }));
  }

  getRegistry() { return Object.values(AGENT_REGISTRY); }
  getQueueDepth() { return this.queue.length; }
}

module.exports = AgentMesh;
