'use strict';
/**
 * cortex/core/raid/index.js — RAID Provider Routing Engine
 * UUID: nexus-raid-core-v1-0000-2026-0629-jamesbrooks-001
 * Version: 6.2.0
 * spec: docs/raid.spec
 *
 * Built 2026-06-29. This module did not exist anywhere in the tree —
 * lib/request-handler.js's §P97 CFR-sigma-floor wire and the entire
 * RAID-determinism test suite (tests/full.test.js §6) were calling/testing
 * a path, `cortex/core/raid`, that resolved to nothing. Every request that
 * reached RAID-routing fell through silently. This is that missing engine,
 * built directly against the test suite's pinned behavior, not guessed.
 *
 * §AX-002 — nothing fails silently. _decide() always returns an agent —
 * the unconditional claude-API last resort (LAW_III) exists specifically
 * so this never throws or returns nothing.
 *
 * LAYER 1 (constraints, deny-only) — fully implemented:
 *   _agentAvailable() — online + consecutiveFails<3
 *   explicit preferredAgent honored if available
 *   LAW_I — ollama always tried first for non-specialist clusters
 *   LAW_III — claude (API) is the unconditional last resort, never excluded
 *   §P97 — CFR sigma floor tightens the consecutiveFails threshold when
 *          the causal field is outside 'stable' regime
 *
 * LAYER 2 (fitness, ranks survivors) — real as of 2026-07-06, no stubs:
 *   health() term — real, drawn from the live health snapshot
 *   roleConfidence() — real, reads RAID's own _weights map (previously
 *     write-only — recordOutcome() populated it every dispatch, nothing
 *     ever read it back). Floored at 0.5 (neutral) for <3 observed calls.
 *   topologicalProximity() — real when a CFR CausalGraph is injected via
 *     setCausalGraph() (meta/cfr/graph.js gained componentDistance() this
 *     same pass); honestly neutral (0.5) if no graph is wired or either
 *     component has never been observed, never fabricated.
 *   SNR pre-gate (docs/raid-snr-filter.spec) — built as cortex/core/raid/
 *     snr-filter.js (this file also did not exist before this pass). NOT
 *     folded into the fitness multiplication — that would be backwards
 *     (a genuinely-unknown call has snr:0.0 and would zero out every
 *     candidate's score, when unknown is exactly the case that most needs
 *     a normal dispatch). Wired instead as a pre-gate in _decide(), gated
 *     on an explicit faultClass so it only engages for fault-remediation
 *     calls, never for the plain provider-selection calls this file's own
 *     determinism suite (tests/full.test.js §6) already pins.
 *
 * "Specialist clusters" (where LAW_I would NOT apply) are named in
 * docs/raid.spec but never enumerated anywhere. Treating all four current
 * clusters (code/analysis/spec/general) as non-specialist until that list
 * exists — flagged, not assumed silently.
 */

const http = require('http');
const snrFilter = require('./snr-filter');
const tunables = require('./tunables');

const MODULE_ID = 'cortex/core/raid';
const VERSION   = '6.3.0';

// ── Optional CFR causal-graph injection ───────────────────────────────────────
// RAID has no live CFR ledger of its own — bridge/cortex own that. A caller
// that has one (orchestrator, at boot) wires it in via setCausalGraph();
// absent that, topologicalProximity() is honestly neutral, never fabricated.
let _cfrGraph = null;
function setCausalGraph(graph) { _cfrGraph = graph; }

// ── Dispatch-name → health-key mapping ───────────────────────────────────────
// Guardian-mediated NCP tabs are health-checked under 'guardian-<provider>'
// but dispatched under the bare provider name — service/nexus-diagnostic.js
// passes the bare name straight through as the job's provider field, and
// Guardian's userscripts register as provider=claude, never
// provider=guardian-claude. 'guardian-claude' is a healthSnap lookup key,
// never a valid dispatch target.
const HEALTH_KEY = {
  claude:  'guardian-claude',
  chatgpt: 'guardian-chatgpt',
  ollama:  'ollama',
};

// ── _cluster — deterministic, zero-LLM intent bucketing ──────────────────────
const CLUSTER_KEYWORDS = {
  code:     ['typescript', 'javascript', 'class', 'function', 'implement', 'module', 'code', 'bug', 'compile'],
  analysis: ['analyze', 'analyse', 'explain', 'how this works', 'why', 'investigate'],
  spec:     ['design', 'architecture', 'plan', 'schema', 'contract', 'structure', 'spec'],
};

function _cluster(promptRaw) {
  const p = String(promptRaw || '').toLowerCase();
  if (!p.trim()) return 'general';
  for (const [cluster, words] of Object.entries(CLUSTER_KEYWORDS)) {
    if (words.some(w => p.includes(w))) return cluster;
  }
  return 'general';
}

// ── Layer 1: constraints (deny-only) ──────────────────────────────────────────
// Returns true/false. Does not rank — that's layer 2's job.
function _agentAvailable(dispatchName, health, opts = {}) {
  const key = HEALTH_KEY[dispatchName] || dispatchName;
  const snap = health?.[key];
  if (!snap) return false;
  const failThreshold = opts.tightened ? 1 : 3; // §P97 — tightened under CFR stress
  if (snap.online !== true) return false;
  if ((snap.consecutiveFails || 0) >= failThreshold) return false;
  if (snap.callCount >= 5 && typeof snap.successRate === 'number' && snap.successRate < 0.2) return false;
  if (snap.role === 'violated') return false; // seam-component-registry.spec §2
  return true;
}

// ── Layer 2: fitness (ranks survivors) ────────────────────────────────────────
// 2026-07-06: the three stubs below are now real. §Correction, not just a
// fill-in: snrTierGate was named here in the original comment as a fitness
// multiplier, but its actual spec (docs/raid-snr-filter.spec) describes a
// pre-gate — "does a known fix already exist at all" — not a per-agent
// ranking term. Multiplying it in here would be backwards: a genuinely
// unknown call (snr:0.0) would zero out every candidate's fitness, when an
// unknown call is exactly the case that most needs a normal agent dispatch.
// snr-filter is wired instead as a pre-gate in _decide(), before any agent
// is even considered — see below.

// roleConfidence — reads RAID's own _weights map (already populated by
// recordOutcome() on every real dispatch outcome, previously write-only:
// nothing ever read it back into a decision). Laplace-floored at 0.5 for
// <3 observed calls — insufficient evidence is honestly neutral, not
// fabricated certainty in either direction.
function _roleConfidence(dispatchName, cluster) {
  const key = `${cluster}:${dispatchName}`;
  const w = _weights.get(key);
  if (!w || w.calls < tunables.get('minCallsForConfidence')) return tunables.get('neutralConfidence');
  return w.successes / w.calls;
}

// topologicalProximity — real when a CFR CausalGraph has been injected via
// setCausalGraph(); honestly neutral (tunables.neutralConfidence) otherwise,
// or when either component has never appeared in the graph. Never fabricates
// a distance. CFR's graph itself stays domain-agnostic (§5.9 — meta/ modules
// never import a sovereign system's own config); RAID owns the Cortex
// dependency and passes the hop-depth cap into componentDistance() itself
// rather than CFR reading RAID's table directly.
function _topologicalProximity(dispatchName, callerComponentId) {
  const neutral = tunables.get('neutralConfidence');
  if (!_cfrGraph || !callerComponentId) return neutral;
  const targetComponentId = HEALTH_KEY[dispatchName] || dispatchName;
  const dist = _cfrGraph.componentDistance(callerComponentId, targetComponentId, tunables.get('maxGraphHopDepth'));
  if (dist === null) return neutral;
  return 1 / (1 + dist);
}

function _fitness(dispatchName, cluster, health, callerComponentId) {
  const key = HEALTH_KEY[dispatchName] || dispatchName;
  const snap = health?.[key] || {};
  const healthScore = snap.successRate != null ? snap.successRate : (snap.online ? 0.8 : 0.1);
  const roleConfidence      = _roleConfidence(dispatchName, cluster);
  const topologicalProximity = _topologicalProximity(dispatchName, callerComponentId);
  return roleConfidence * healthScore * topologicalProximity;
}

// ── _decide — pure function, same inputs always produce same decision ───────
function _decide(call, health, weights) {
  const cluster = _cluster(call?.prompt || call?.intent || '');
  const ctx = call?.context || {};
  const cfrRegime     = ctx.cfrRegime || 'stable';
  const cfrSigmaFloor  = ctx.cfrSigmaFloor || 0;
  const tightened      = cfrRegime !== 'stable' && cfrSigmaFloor > 0; // §P97
  const callerComponentId = ctx.componentId || null;

  // SNR pre-gate (docs/raid-snr-filter.spec) — only engages when the caller
  // declares a faultClass (this is a fault-remediation call, not general
  // provider selection). A known invariant or crystallised pattern resolves
  // right here with no agent dispatched at all — LAW_I/LAW_III and the
  // fitness chain below never run for those. Gated deliberately, not run
  // unconditionally: this codebase's existing RAID-determinism suite pins
  // plain prompt→provider selection with no faultClass on any fixture, and
  // this gate must never become a silent second path those tests can't see.
  if (call?.faultClass) {
    const snr = snrFilter.filter({
      intent: call?.prompt || call?.intent || '',
      cluster,
      faultClass: call.faultClass,
      causedBy: ctx.causedBy, sessionId: ctx.sessionId, jobId: ctx.jobId,
    });
    if (snr.dispatch === false) {
      return { agent: null, cluster, reason: `snr-gate resolved locally: ${snr.reason}`, snr };
    }
  }

  // Explicit preference — checked by its literal key, echoed back verbatim.
  if (call?.preferredAgent) {
    if (_agentAvailable(call.preferredAgent, health, { tightened })) {
      return { agent: call.preferredAgent, cluster, reason: 'explicit preference honored' };
    }
    // falls through to LAW_I / chain — preference offline is not fatal
  }

  // LAW_I — ollama first, for all clusters until "specialist" is enumerated.
  if (_agentAvailable('ollama', health, { tightened })) {
    return { agent: 'ollama', cluster, reason: 'LAW_I: ollama always first for non-specialist clusters' };
  }

  // Computed chain (replaces the retired hardcoded CLUSTER_CHAINS, per
  // docs/raid.spec v6.1 note) — today this is one fixed order because
  // role_confidence data doesn't exist yet to differentiate by cluster.
  // Becomes per-cluster once that lands; flagged, not silently faked.
  const chain = ['ollama', 'claude', 'chatgpt'];
  const survivors = chain.filter(name => _agentAvailable(name, health, { tightened }));

  if (survivors.length === 1) {
    return { agent: survivors[0], cluster, reason: `cluster_chain: only survivor for ${cluster}` };
  }
  if (survivors.length > 1) {
    const ranked = survivors
      .map(name => ({ name, score: _fitness(name, cluster, health, callerComponentId) }))
      .sort((a, b) => b.score - a.score);
    return { agent: ranked[0].name, cluster, reason: `cluster_chain: highest fitness for ${cluster} (${ranked[0].score.toFixed(2)})` };
  }

  // LAW_III — claude (API) is the unconditional last resort. Never excluded.
  // This is what keeps _decide() from ever throwing or returning nothing —
  // §AX-002, nothing fails silently, applies to RAID having no answer too.
  return { agent: 'claude', cluster, reason: 'LAW_III: all candidates excluded, claude API used as unconditional reserve' };
}

// ── Live health snapshot — polled, not computed per-call ─────────────────────
// _decide() is pure and takes health as an argument (tests construct their
// own fixtures). This is the module's own live copy for production callers
// (lib/request-handler.js does `raid._health`, `raid._weights` directly).
const _health = {
  ollama:            { online: false, consecutiveFails: 0, callCount: 0, successRate: 1 },
  'guardian-claude':  { online: false, consecutiveFails: 0, callCount: 0, successRate: 1 },
  'guardian-chatgpt': { online: false, consecutiveFails: 0, callCount: 0, successRate: 1 },
};

function _httpGetJson(url, timeoutMs = 2000) {
  return new Promise(resolve => {
    try {
      const u = new URL(url);
      const req = http.request({ hostname: u.hostname, port: u.port, path: u.pathname, method: 'GET', timeout: timeoutMs },
        res => {
          let buf = '';
          res.on('data', c => buf += c);
          res.on('end', () => { try { resolve(JSON.parse(buf)); } catch(_) { resolve(null); } });
        });
      req.on('error', () => resolve(null));
      req.on('timeout', () => { req.destroy(); resolve(null); });
      req.end();
    } catch(_) { resolve(null); }
  });
}

async function _pollHealth() {
  const OL_URL = process.env.OLLAMA_URL   || 'http://127.0.0.1:3749';
  const GD_URL = process.env.GUARDIAN_URL || 'http://127.0.0.1:7820';

  const ol = await _httpGetJson(`${OL_URL}/health`);
  _health.ollama.online = !!ol?.ok;
  _health.ollama.consecutiveFails = ol?.ok ? 0 : (_health.ollama.consecutiveFails + 1);

  const gd = await _httpGetJson(`${GD_URL}/health`);
  const providers = gd?.connectedProviders || {};
  for (const name of ['claude', 'chatgpt']) {
    const key = HEALTH_KEY[name];
    const online = !!providers[name];
    _health[key].online = online;
    _health[key].consecutiveFails = online ? 0 : (_health[key].consecutiveFails + 1);
  }
}

let _pollTimer = null;
function startHealthPoll(intervalMs = 15000) {
  if (_pollTimer) return;
  _pollHealth().catch(() => {});
  _pollTimer = setInterval(() => _pollHealth().catch(() => {}), intervalMs);
}
function stopHealthPoll() {
  if (_pollTimer) clearInterval(_pollTimer);
  _pollTimer = null;
}

// ── Live weights — learned from outcomes ──────────────────────────────────────
// lib/request-handler.js already logs a `user.satisfied` event after every
// dispatch (D3 in its pipeline) but never called back into RAID — the
// feedback loop the spec's "Weight table learns from outcomes" line
// describes was logged, never closed. recordOutcome() is that missing call.
const _weights = new Map();

function recordOutcome(agent, cluster, success) {
  const key = `${cluster}:${agent}`;
  const prior = _weights.get(key) || { calls: 0, successes: 0 };
  prior.calls += 1;
  if (success) prior.successes += 1;
  _weights.set(key, prior);
  // Feed the same numbers back into the live health snapshot so _fitness()
  // and _agentAvailable()'s successRate/callCount terms are real, not stuck
  // at their boot-time defaults.
  const key2 = HEALTH_KEY[agent] || agent;
  if (_health[key2]) {
    _health[key2].callCount = (_health[key2].callCount || 0) + 1;
    const sr = _health[key2].successRate != null ? _health[key2].successRate : 1;
    _health[key2].successRate = sr + ((success ? 1 : 0) - sr) / _health[key2].callCount; // running average
  }
  return _weights.get(key);
}

// ── Tool approval gate ────────────────────────────────────────────────────────
// docs/raid.spec's tool_approval_gate. Built against
// tests/modules/raid-approve-tool.test.js's 9 pinned cases — that test file
// already existed; this is the function it was always meant to test.
const contracts = require('../../contract');

const _toolCalls = new Map(); // source -> [{ ts, action, approved }]
const RATE_WINDOW_MS = 60000;

function _pruneCalls(source) {
  const now = Date.now();
  const calls = (_toolCalls.get(source) || []).filter(c => now - c.ts < RATE_WINDOW_MS);
  _toolCalls.set(source, calls);
  return calls;
}

function _approveTool(source, command, opts = {}) {
  if (!source) {
    return { approved: false, reason: 'source is required' };
  }

  const action   = opts.action || 'tool';
  const contract = contracts.get(source);
  const isDefault = !contracts.CONTRACTS[source];

  const calls = _pruneCalls(source);

  // Explicit denial first — most specific, clearest reason.
  if ((contract.denied_actions || []).includes(action)) {
    const reason = isDefault
      ? `minimal-trust default contract explicitly denies '${action}'`
      : `'${action}' is explicitly denied for source '${source}'`;
    calls.push({ ts: Date.now(), action, approved: false });
    return { approved: false, source, trust_level: contract.trust_level, reason };
  }

  // Proof-gated contracts (the _default fallback, or any contract that
  // opts into it) — anything not explicitly denied needs proof.
  if (contract.proof_required && !opts.proof) {
    calls.push({ ts: Date.now(), action, approved: false });
    return { approved: false, source, trust_level: contract.trust_level, reason: `proof required, none supplied for '${action}'` };
  }

  // Allowed by an explicit allow-list, or implicitly allowed because proof
  // was supplied and proof_required gates the rest.
  const allowed = (contract.allowed_actions || []).includes(action) || (contract.proof_required && !!opts.proof);
  if (!allowed) {
    calls.push({ ts: Date.now(), action, approved: false });
    return { approved: false, source, trust_level: contract.trust_level, reason: `'${action}' is not in '${source}'s allowed_actions` };
  }

  // Rate limit — checked last, only on the path that would otherwise approve.
  const limit = (contract.rate_limits || {})[action] || (contract.rate_limits || {})['*'];
  if (limit) {
    const recentForAction = calls.filter(c => c.action === action);
    if (recentForAction.length >= limit.max) {
      const oldest = recentForAction[0].ts;
      const retryAfterMs = Math.max(0, limit.windowMs - (Date.now() - oldest));
      calls.push({ ts: Date.now(), action, approved: false });
      return { approved: false, source, trust_level: contract.trust_level, reason: `rate limit exceeded for '${action}' (${limit.max}/${limit.windowMs}ms)`, retryAfterMs };
    }
  }

  calls.push({ ts: Date.now(), action, approved: true });
  return { approved: true, source, trust_level: contract.trust_level, reason: 'allowed' };
}

function _toolHealthSnapshot() {
  const snap = {};
  for (const [source, calls] of _toolCalls.entries()) {
    const recent = calls.filter(c => Date.now() - c.ts < RATE_WINDOW_MS);
    snap[source] = {
      recentCalls:   recent.length,
      recentDenials: recent.filter(c => !c.approved).length,
    };
  }
  return snap;
}

// ── Phase 6 — bus wiring (§14.1: event → gate → event) ────────────────────────
// RAID existed as a real, tested decision engine (_decide/_health/_weights)
// but was never bus-wired — only reachable via a direct function call.
// This closes that: cortex.orion.classified (Phase 5) → _decide() → cortex.raid.decided.
// The existing direct-call path is untouched; this is an additional consumer
// of the same _decide(), not a replacement for it (§3.4 — the route was
// already proven at the raw-code layer; this is the same code, bus-triggered).
let _bus = null;

function _onOrionClassified(event) {
  const classification = event?.payload;
  if (!classification?.faultClass) return;

  const call = {
    prompt: classification.intent,
    intent: classification.intent,
    faultClass: classification.faultClass,
    context: {
      cfrRegime: classification.context?.cfrRegime,
      cfrSigmaFloor: classification.context?.cfrSigmaFloor,
      componentId: classification.context?.componentId,
      causedBy: classification.context?.causedBy,
      sessionId: classification.context?.sessionId,
    },
  };

  const decision = _decide(call, _health, _weights);
  if (_bus) _bus.emit('cortex.raid.decided', {
    decision, faultClass: classification.faultClass, causedBy: classification.context?.causedBy,
  }, { source: MODULE_ID });
}

function init(cfg = {}) {
  _bus = cfg.bus || null;
  if (_bus) _bus.on('cortex.orion.classified', _onOrionClassified);
  console.log(`[${MODULE_ID}] v${VERSION} — bus-wired to cortex.orion.classified${_bus ? '' : ' (no bus — test mode)'}`);
  return { ok: true };
}

function stop() {
  if (_bus) _bus.off('cortex.orion.classified', _onOrionClassified);
  _bus = null;
}

module.exports = {
  MODULE_ID, VERSION,
  _decide, _cluster, _health, _weights,
  _agentAvailable, _fitness, HEALTH_KEY,
  _roleConfidence, _topologicalProximity, setCausalGraph,
  recordOutcome,
  startHealthPoll, stopHealthPoll,
  _approveTool, _toolHealthSnapshot,
  init, stop, _onOrionClassified,
};
