'use strict';
/**
 * copilot/lib/self-model.js — co-pilot's identity, governance, and the NEXUS
 * model in cortex (§P5 who-am-I + §P6 governance/agent-switch foundation)
 * UUID: nexus-copilot-self-model-v1-0000-2026-0807-001
 *
 * James: "wire them in, then update registry, then spec addendums. NEXUS model in
 * cortex."
 *
 * Pure §8.6 composition of modules that ALREADY EXIST in lib/ — nothing new built:
 *   - lib/reflection.trackIdentityEvidence  → "who am I / what's my name" evidence
 *   - lib/constitutional-ai.getIdentityKernel/check → the mind's identity + the
 *       governance gate (what the mind may do)
 *   - lib/agent-router.routeAgent           → "switch to a different model/agent"
 *   - lib/intent-classifier.classify        → intent + RISK_LEVEL for governance
 *   - cortex self_model table               → the NEXUS model persisted in the brain
 *
 * §1.1 identity answered from real evidence, never invented. §1.2 every wire
 * guarded — a missing module degrades honestly, never throws to the request
 * thread. Cached where it reads (the failed-to-fetch lesson).
 */

function _try(mod) { try { return require(mod); } catch (_) { return null; } }

// ── P5: who am I ──────────────────────────────────────────────────────────────
/**
 * whoAmI(opts) — answer identity questions from real evidence: the user-model
 * hypotheses + reflection's identity evidence + constitutional-ai's identity
 * kernel. Never fabricates; if nothing is known, says so (and can ask back).
 */
function whoAmI(opts = {}) {
  const out = { hypotheses: [], identityKernel: null, known: false, text: null };

  // user-model hypotheses (what NEXUS has learned about the user).
  // §FIXED 2026-08-12 — found live-verifying P5 of nexus-live-mind-phasemap.spec:
  // getHypotheses(optsOrMinConf=0.3, limit=20) treats a bare number as
  // minConfidence, not limit. The old call here — getHypotheses(10) — set
  // minConfidence to 10 against a 0-1 confidence scale, so it ALWAYS
  // returned []  regardless of real data (confirmed: 3 real hypotheses
  // exist and are retrievable with the correct call; the old call returned
  // 0 every time). whoAmI() has been silently answering "I don't have
  // enough evidence" even when real evidence existed. Fixed to pass the
  // real default minConf (0.3) and 10 as the actual limit.
  try {
    const um = opts.userModel || require('./user-model');
    out.hypotheses = (um.getHypotheses ? um.getHypotheses(0.3, 10) : []) || [];
  } catch (_) {}

  // constitutional-ai identity kernel (the mind's own identity anchor).
  const cai = opts.constitutionalAi || _try('../../lib/constitutional-ai');
  try { if (cai && cai.getIdentityKernel) out.identityKernel = cai.getIdentityKernel(); } catch (_) {}

  out.known = out.hypotheses.length > 0;
  if (out.known) {
    const top = out.hypotheses.slice(0, 4).map(h => h.claim || h.text || h.hypothesis).filter(Boolean);
    out.text = top.length
      ? `Here's what I've learned about you so far: ${top.join('; ')}. These are hypotheses from our interactions, not certainties — tell me what's off.`
      : `I have ${out.hypotheses.length} hypotheses about you, but nothing confident enough to state yet.`;
  } else {
    // §user_wellbeing — don't fabricate identity. Ask back (the "dynamic" ask).
    out.text = `I don't have enough evidence yet to say who you are with confidence. What would you like me to know about you?`;
  }
  return out;
}

/**
 * recordIdentityEvidence(key, item) — when the user tells co-pilot something
 * about themselves, record it via reflection's identity-evidence tracker.
 */
function recordIdentityEvidence(key, item) {
  try {
    const refl = require('../../lib/reflection');
    if (refl.trackIdentityEvidence) { refl.trackIdentityEvidence(key, item); return { ok: true }; }
  } catch (e) { return { ok: false, reason: e.message }; }
  return { ok: false, reason: 'reflection.trackIdentityEvidence unavailable' };
}

// ── P6 (docs/copilot-full-capability-phasemap.spec) — co-pilot's OWN name ─────
// §CORRECTION 2026-08-12 — that phasemap's own P6 entry said "whoAmI() prefers
// customName when set." Wrong: whoAmI() above answers "what does NEXUS know
// about the USER" (hypotheses about the person talking to it), not "what is
// co-pilot's own name." Those are different axes and conflating them would
// have made whoAmI silently start answering a different question than every
// existing caller (server.js:1080) expects. Kept separate: getIdentityName/
// setIdentityName are co-pilot's own display name, a user DECISION (§1.1 —
// set data, not inferred — never fabricated the other way, same principle
// whoAmI already follows for the user axis). One row, cortex-persisted,
// survives a restart.
const IDENTITY_TABLE = 'copilot_identity';
const IDENTITY_ROW_ID = 'name';

/**
 * getIdentityName() — co-pilot's own current display name. Returns the
 * default ('co-pilot') if never set — never fabricates a name that wasn't
 * actually chosen.
 */
function getIdentityName() {
  try {
    const { jaaDB } = require('../../cortex/memory/jaa-db');
    const row = jaaDB.query(IDENTITY_TABLE, r => r.id === IDENTITY_ROW_ID)[0];
    return { name: (row && row.name) || 'co-pilot', isCustom: !!(row && row.name), setAt: row ? row.ts : null };
  } catch (e) {
    return { name: 'co-pilot', isCustom: false, error: e.message };
  }
}

/**
 * setIdentityName(name) — set co-pilot's own display name. Persisted, not
 * in-memory — a rename survives a restart. Empty/null clears back to default.
 */
function setIdentityName(name) {
  const trimmed = (name || '').trim();
  try {
    const { jaaDB } = require('../../cortex/memory/jaa-db');
    if (!trimmed) {
      jaaDB.insert(IDENTITY_TABLE, { id: IDENTITY_ROW_ID, name: null, ts: Date.now(), cleared: true });
      return { ok: true, name: 'co-pilot', isCustom: false, cleared: true };
    }
    if (trimmed.length > 60) return { ok: false, reason: 'name too long (max 60 chars)' };
    jaaDB.insert(IDENTITY_TABLE, { id: IDENTITY_ROW_ID, name: trimmed, ts: Date.now() });
    return { ok: true, name: trimmed, isCustom: true };
  } catch (e) {
    return { ok: false, reason: e.message };
  }
}

// ── P6.5 (2026-08-13) — "co-pilot should be like a hat, not a static
// identity." getCurrentAgent/setCurrentAgent — WHICH provider copilot
// dispatches to by default, persisted, swappable on demand. Distinct from
// switchAgent (a one-off routing decision for a single request) and from
// identity naming (WHAT copilot is called, not WHICH model answers).
// §CORRECTED SCOPE — this is the missing piece lifeline.js's route() never
// had: it accepts a per-call opts.provider override but nothing persists
// one, so every message restarts the ollama-first cascade from scratch
// unless the caller re-specifies an override every single time. Same
// cortex row shape as identity (copilot_identity table), new row id
// 'agent'. Governed exactly like switchAgent — changing the hat is a real
// action, RAID sees it.
const AGENT_ROW_ID = 'agent';
const VALID_AGENTS = new Set(['ollama', 'claude', 'chatgpt', 'gemini', 'mistral', 'perplexity', 'auto']);

/**
 * getCurrentAgent() — the provider copilot currently defaults to. 'auto'
 * (the default when never set) means the normal ollama-first cascade with
 * confidence-based escalation — unchanged behavior for anyone who never
 * touches this.
 */
function getCurrentAgent() {
  try {
    const { jaaDB } = require('../../cortex/memory/jaa-db');
    const row = jaaDB.query(IDENTITY_TABLE, r => r.id === AGENT_ROW_ID)[0];
    return {
      agent: (row && row.agent) || 'auto',
      hatName: (row && row.hatName) || null,
      toolScope: (row && row.toolScope) || null,
      personaPrompt: (row && row.personaPrompt) || null,
      isCustom: !!(row && row.agent && row.agent !== 'auto'),
      // §WIRED 2026-08-14 — "switch to claude AND add a chat url to use."
      // The bound conversation travels with the hat: same row, same governance,
      // read by everyone who already reads the hat rather than a second store.
      chatUrl: (row && row.chatUrl) || null,
      chatId:  (row && row.chatId)  || null,
      setAt: row ? row.ts : null,
    };
  } catch (e) {
    return { agent: 'auto', isCustom: false, error: e.message };
  }
}

/**
 * setCurrentAgent(agent) — put on a new hat. RAID-governed (same as
 * switchAgent) — a persistent routing change for every future message is
 * exactly the kind of live-control action RAID exists to gate. 'auto'
 * (or empty) takes the hat off — back to the normal ollama-first cascade.
 * §EXTENDED 2026-08-13 (P8) — `agent` can now also be a forged hat's NAME
 * (lib/hat-forge.js), not just a raw base agent. Wearing a named hat sets
 * the underlying base agent AND remembers the hat's toolScope/personaPrompt
 * so route()/runViaAgent can apply them — same governance either way.
 */
function setCurrentAgent(agent, opts = {}) {
  const raw = (agent || 'auto').trim().toLowerCase();

  // A forged hat's name takes priority if one exists with that exact name —
  // validate() already refused any forged hat from colliding with a real
  // base agent name, so there's no ambiguity between the two namespaces.
  let forgedHat = null;
  if (!VALID_AGENTS.has(raw)) {
    try { forgedHat = require('../../lib/hat-forge').get(raw); } catch (_) {}
    if (!forgedHat) return { ok: false, reason: `unknown agent "${agent}" — one of: ${[...VALID_AGENTS].join(', ')}, or a forged hat name` };
  }
  const normalized = forgedHat ? forgedHat.baseAgent : raw;

  const gov = governAction({ action: 'switch_agent', target: normalized }, {});
  if (gov.allowed === false) {
    return { ok: false, reason: `denied by governance: ${gov.reason || 'no reason given'}`, governance: gov };
  }

  // §WIRED 2026-08-14 — opts.chatUrl binds a specific conversation to this
  // hat. Validated against the agent BEFORE the row is written, so "switch to
  // claude and use <a chatgpt url>" is refused at bind time instead of
  // silently persisting a contradiction. opts.chatUrl === null explicitly
  // clears the binding; omitting it entirely preserves whatever is bound,
  // because re-wearing the same hat should not silently drop the chat.
  let chatTarget = null;
  const prior = getCurrentAgent();
  if (opts.chatUrl !== undefined && opts.chatUrl !== null) {
    try {
      const ct = require('../../lib/chat-target');
      chatTarget = ct.validate(opts.chatUrl, normalized);
      if (!chatTarget.ok) return { ok: false, reason: chatTarget.reason, chatUrl: opts.chatUrl };
    } catch (e) {
      return { ok: false, reason: `chat-target unavailable: ${e.message}` };
    }
  }
  const clearing  = opts.chatUrl === null;
  const keepPrior = opts.chatUrl === undefined && prior.agent === normalized;
  const chatUrl = chatTarget ? chatTarget.url    : (clearing ? null : (keepPrior ? prior.chatUrl : null));
  const chatId  = chatTarget ? chatTarget.chatId : (clearing ? null : (keepPrior ? prior.chatId  : null));

  try {
    const { jaaDB } = require('../../cortex/memory/jaa-db');
    jaaDB.insert(IDENTITY_TABLE, {
      id: AGENT_ROW_ID, agent: normalized,
      hatName: forgedHat ? forgedHat.name : null,
      toolScope: forgedHat ? forgedHat.toolScope : null,
      personaPrompt: forgedHat ? forgedHat.personaPrompt : null,
      chatUrl, chatId,
      ts: Date.now(),
    });
    // §WIRED 2026-08-14 — "change agent needs to connect to NCP." The switch
    // itself is unchanged and still succeeds: this reports whether the agent
    // just put on actually has a live NCP channel, instead of leaving the
    // caller to find out when guardian silently parks the next job as
    // queued_waiting_for_provider. Reporting only — it does not block, and a
    // failure to read NCP cannot fail a switch.
    let ncp = null;
    try { ncp = require('../../lib/ncp-availability').report(normalized); } catch (_) {}

    return { ok: true, agent: normalized, hatName: forgedHat ? forgedHat.name : null, isCustom: normalized !== 'auto', governance: gov, ncp, chatUrl, chatId };
  } catch (e) {
    return { ok: false, reason: e.message };
  }
}

// ── P6 foundation: governance + agent switching ──────────────────────────────
/**
 * governAction(req, ctx) — the governance gate (RAID-adjacent): classify intent +
 * risk, then run the constitutional check. Returns whether an action is permitted
 * and why. This is what a programmable/automated co-pilot action passes through.
 */
function governAction(req = {}, ctx = {}) {
  const out = { allowed: true, risk: null, reason: null, checks: {} };

  // §ADDED 2026-08-13 — same real precedent check as executeTool's, now
  // covering the OTHER universal chokepoint: every switchAgent, hat wear,
  // scheduled task, trigger, and chain step already goes through
  // governAction. Advisory, not blocking — real precedent attached for
  // whoever reads the governance result to weigh.
  try { out.faultHistory = require('../../lib/fault-log.js').checkFaultHistory(req.action || 'unknown', { intent: req.target || null, limit: 3 }); } catch (_) {}

  let classifiedIntent = ctx.intent || null;
  try {
    const ic = _try('../../lib/intent-classifier');
    if (ic && ic.classify) {
      const c = ic.classify(req);
      out.risk = c.risk || c.riskLevel || (c.RISK_LEVEL);
      out.checks.intent = c;
      // §FIXED 2026-08-13 — found alongside the v.allowed field-name bug:
      // this classification was computed and stored for the caller to see,
      // but never actually passed to the constitutional check below, which
      // requires ctx.intent to do anything but return its own "you called
      // me wrong" BLOCK. classify()'s real return shape nests the actual
      // intent object at c.intent (confirmed live) — that's what
      // constitutional-ai.check() expects as ctx.intent. Caller-supplied
      // ctx.intent (if any) still wins; this only fills the gap when
      // nothing was supplied, which was every real caller until now.
      if (!classifiedIntent && c && c.intent) classifiedIntent = c.intent;
    }
  } catch (_) {}
  try {
    const cai = _try('../../lib/constitutional-ai');
    // §FIXED 2026-08-13 — found live, verifying setCurrentAgent's own
    // governance result: constitutional-ai.check() returns {pass, reason,
    // axiom, severity, ...} — it NEVER returns a field called `allowed`.
    // The old check (`v.allowed === false`) tested a field that is always
    // undefined on the real return value, so this denial branch has never
    // fired once since this function was written — a real BLOCK-severity
    // constitutional violation was never actually enforced here, ever.
    // Every prior caller of governAction (switchAgent, this session's own
    // setCurrentAgent) believed it was gated when it was not. Corrected to
    // the same check cortex/core/raid/index.js's _approveTool already gets
    // right: pass === false AND severity === 'block' is a real denial;
    // pass === false with a lower severity (WARN/held) is NOT — that's
    // "held" territory by constitutional-ai's own design, not a hard stop.
    if (cai && cai.check) {
      const v = cai.check(req, { ...ctx, intent: classifiedIntent });
      out.checks.constitutional = v;
      if (v && v.pass === false && v.severity === 'block') {
        out.allowed = false;
        out.reason = `constitution denied — ${v.axiom}: ${v.reason || 'no reason given'}`;
      }
    }
  } catch (_) {}
  return out;
}

/**
 * switchAgent(intent, prompt, directed) — "switch to a different model/agent" via
 * the existing agent-router. Returns the chosen agent + its constraints.
 * §FIXED 2026-08-12 — closes P6 of nexus-live-mind-phasemap.spec's gate
 * ("'switch to <agent>' routes through the agent-mesh; all governed by
 * RAID"). governAction and switchAgent were both real, both exported, but
 * NOTHING called governAction before a switch — confirmed by grep across
 * self-model.js and copilot/server.js's real handler. A directed agent
 * switch is exactly the kind of live-control action RAID exists to gate;
 * wired here so every caller (not just server.js's one regex handler) gets
 * governed, not just the one call site this session happened to check.
 */
function switchAgent(opts = {}) {
  const gov = governAction({ action: 'switch_agent', target: opts.directed || opts.intent }, {});
  if (gov.allowed === false) {
    return { ok: false, reason: `denied by governance: ${gov.reason || 'no reason given'}`, governance: gov };
  }
  try {
    const ar = require('../../lib/agent-router');
    if (ar.routeAgent) {
      // §WIRED 2026-08-14 — routeAgent has always accepted an `available`
      // predicate and used it to build the fallback chain, and NO caller in
      // the repo has ever supplied one (grepped: this line forwards it, both
      // real callers omit it). It therefore defaulted to () => true and the
      // chain skipped nothing. This defaults it to live NCP channel state, so
      // the fallback chain is built out of agents that can actually be
      // reached. An explicitly-passed opts.available still wins — callers who
      // know better are not overridden.
      let available = opts.available;
      if (typeof available !== 'function') {
        try { available = require('../../lib/ncp-availability').predicate(); } catch (_) { available = undefined; }
      }
      const r = ar.routeAgent({ intent: opts.intent, prompt: opts.prompt, directed: opts.directed, config: opts.config, available });
      return { ok: true, agent: r.agent || r.route || r, constraints: (ar.AGENT_CONSTRAINTS && r.agent) ? ar.AGENT_CONSTRAINTS[r.agent] : null, detail: r, governance: gov };
    }
  } catch (e) { return { ok: false, reason: e.message }; }
  return { ok: false, reason: 'agent-router unavailable' };
}

// ── The NEXUS model in cortex ─────────────────────────────────────────────────
/**
 * buildNexusModel(opts) — assemble the model of NEXUS (capabilities, systems,
 * versions, self-model health) and persist it to cortex's self_model table, so
 * "the model of nexus it uses for nexus questions" lives in the brain, not
 * recomputed each time. Returns the model; persistence is best-effort (§1.2).
 */
async function buildNexusModel(opts = {}) {
  let model = { ts: Date.now() };
  try {
    const na = opts.awareness || require('./nexus-awareness');
    const rundown = na.systemRundown(opts);
    model = { ...model, capabilities: rundown.capabilities, versions: rundown.versions, selfModel: rundown.selfModel, live: rundown.live, summary: rundown.text };
  } catch (e) { model.error = e.message; }

  // §2026-08-09 — the model of NEXUS now includes where NEXUS is uncertain
  // about itself, not just what it declares/serves. lib/gap-field.js is the
  // unified system + user-model gap pipeline (James: "gap field... this is
  // also for modeling me"). Same honest-degrade discipline as the rest of
  // this function — a missing gap-field doesn't fail the whole model.
  try {
    const gf = opts.gapField || require('../../lib/gap-field');
    const system = gf.openGaps({ domain: 'system', limit: 500 });
    const userModel = gf.openGaps({ domain: 'user-model', limit: 500 });
    model.gaps = {
      systemOpen: system.length,
      userModelOpen: userModel.length,
      topSystem: system.slice(0, 5).map(g => ({ type: g.type, source: g.source, occurrences: g.occurrences })),
      topUserModel: userModel.slice(0, 5).map(g => ({ type: g.type, source: g.source, occurrences: g.occurrences })),
    };
  } catch (e) { model.gaps = { error: e.message }; }

  // §2026-08-09 — "it needs to update the models of me and itself... each
  // system needs a model? Baysesian updating?" (James). This is the "itself"
  // half: co-pilot's own confidence in its conversational pattern-matching,
  // per pattern, Bayesian-updated on every confirm/reject (copilot/lib/
  // intent-learning.js). A model of NEXUS that only lists what it CAN do
  // without also carrying how SURE it is about understanding requests isn't
  // actually self-aware about its own limits.
  try {
    const il = opts.intentLearning || require('./intent-learning');
    const patterns = il.allPatterns();
    model.intentConfidence = {
      trackedPatterns: patterns.length,
      lowConfidence: patterns.filter(p => p.confidence < 0.4).map(p => ({ patternId: p.patternId, confidence: p.confidence, confirmations: p.confirmations, rejections: p.rejections })),
      highConfidence: patterns.filter(p => p.confidence >= 0.8).map(p => p.patternId),
    };
  } catch (e) { model.intentConfidence = { error: e.message }; }

  // Persist to cortex self_model table (the brain). Best-effort, non-blocking.
  // §FIXED 2026-08-12 — root cause of self_model having 0 rows, found by
  // actually running this function live (not assumed from "never called"):
  // lib/cortex-write.js exports a FACTORY — cortexWrite('systemName') →
  // {insert, ...} — not a bare .write(table, row). The old code's `_try(
  // '../../lib/cortex-write')` got the raw factory function back, its own
  // `writer.write` check correctly failed, then its `typeof writer ===
  // 'function'` check was ALSO true (a factory IS a function) and called
  // `writer('self_model', {...model})` — which invokes the factory with
  // 'self_model' as a systemName and the model object as an unused second
  // arg. No error, no row, nothing — silently wrong, caught only by
  // actually running it and checking the table afterward. Fixed to write
  // in-process via jaaDB directly, same proven pattern this session's other
  // tools already use (schedule-task.js, raid-snr.js, etc.) rather than
  // trust cortex-write's HTTP path, which needs a live cortex server this
  // environment doesn't have to verify against.
  if (opts.persist !== false) {
    try {
      const { jaaDB } = opts.jaaDB ? { jaaDB: opts.jaaDB } : require('../../cortex/memory/jaa-db');
      jaaDB.insert('self_model', { id: 'nexus', ...model });
    } catch (_) { /* persistence best-effort — the model is still returned */ }
  }
  return model;
}

module.exports = { whoAmI, recordIdentityEvidence, governAction, switchAgent, buildNexusModel, getIdentityName, setIdentityName, getCurrentAgent, setCurrentAgent, MODULE_ID: 'copilot-self-model', VERSION: '1.2.0' };
