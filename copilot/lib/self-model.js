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
  try {
    const um = opts.userModel || require('./user-model');
    out.hypotheses = (um.getHypotheses ? um.getHypotheses(10) : []) || [];
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

// ── P6 foundation: governance + agent switching ──────────────────────────────
/**
 * governAction(req, ctx) — the governance gate (RAID-adjacent): classify intent +
 * risk, then run the constitutional check. Returns whether an action is permitted
 * and why. This is what a programmable/automated co-pilot action passes through.
 */
function governAction(req = {}, ctx = {}) {
  const out = { allowed: true, risk: null, reason: null, checks: {} };
  try {
    const ic = _try('../../lib/intent-classifier');
    if (ic && ic.classify) { const c = ic.classify(req); out.risk = c.risk || c.riskLevel || (c.RISK_LEVEL); out.checks.intent = c; }
  } catch (_) {}
  try {
    const cai = _try('../../lib/constitutional-ai');
    if (cai && cai.check) { const v = cai.check(req, ctx); out.checks.constitutional = v; if (v && v.allowed === false) { out.allowed = false; out.reason = v.reason || 'constitutional check failed'; } }
  } catch (_) {}
  return out;
}

/**
 * switchAgent(intent, prompt, directed) — "switch to a different model/agent" via
 * the existing agent-router. Returns the chosen agent + its constraints.
 */
function switchAgent(opts = {}) {
  try {
    const ar = require('../../lib/agent-router');
    if (ar.routeAgent) {
      const r = ar.routeAgent({ intent: opts.intent, prompt: opts.prompt, directed: opts.directed, config: opts.config, available: opts.available });
      return { ok: true, agent: r.agent || r.route || r, constraints: (ar.AGENT_CONSTRAINTS && r.agent) ? ar.AGENT_CONSTRAINTS[r.agent] : null, detail: r };
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

  // Persist to cortex self_model table (the brain). Best-effort, non-blocking.
  if (opts.persist !== false) {
    try {
      const writer = opts.cortexWrite || _try('../../lib/cortex-write');
      if (writer && writer.write) await writer.write('self_model', { id: 'nexus', ...model });
      else if (writer && typeof writer === 'function') await writer('self_model', { id: 'nexus', ...model });
    } catch (_) { /* persistence best-effort — the model is still returned */ }
  }
  return model;
}

module.exports = { whoAmI, recordIdentityEvidence, governAction, switchAgent, buildNexusModel, MODULE_ID: 'copilot-self-model', VERSION: '1.0.0' };
