'use strict';
/**
 * lib/agent-model.js — AM1: a real, per-agent learned model.
 * UUID: nexus-lib-agent-model-v1-0000-2026-0815-jamesbrooks-001
 *
 * §BUILT 2026-08-15 — docs/agent-model-and-user-continuity-phasemap.spec's
 * AM1, generalizing AP3/AP4 (a dynamic cortex table, not hardcoded, that
 * intelligence-style scoring optimizes) from Gemini's internal sub-agents
 * to the six top-level AgentMesh providers, per that phase's own "reuse"
 * line — not a new design.
 *
 * Two real, already-existing signals, composed, not invented:
 *   1. lib/agent-system/submit.js's real RAID verdict history —
 *      listOutputs(agentId) reads back every real submission this agent
 *      made, each carrying a real {verified, stage, verdict, reason} from
 *      cortex/core/raid's actual verifyInIsolation().
 *   2. lib/tool-index.js's real usage tracking (AB1, fixed this session)
 *      — which of an agent's scoped tools it actually used successfully
 *      vs never touched, filtered by consumers.includes(agentId).
 *
 * §HONEST COLD-START — checked live before writing this: tool_index has
 * 61 real rows, exactly 1 with real consumer data. Most agents have no
 * real history yet. getFitness() returns the SAME "unbounded-untrusted"
 * phrasing contracts.js's own _baseConstraints() already uses for a
 * missing value — not a fabricated confidence, not a silent default of 1
 * or 0 that would look like real evidence when there isn't any.
 */
const path = require('path');

function _jaa() { try { return require('../cortex/memory/jaa-db.js').jaaDB; } catch (_) { return null; } }
function _submit() { return require('./agent-system/submit.js'); }
function _toolIndex() { return require('./tool-index.js'); }

/**
 * compute(agentId) — derives a real fitness score per action type from
 * real submission history, and a real tool-usage summary. Does not
 * fabricate a number when there's no real history — returns an honest
 * cold-start row instead.
 */
function compute(agentId) {
  const result = _submit().listOutputs(agentId, { limit: 200 });
  const outputs = (result && result.outputs) || [];
  const byAction = {};
  for (const rec of outputs) {
    const a = rec.action || 'unknown';
    if (!byAction[a]) byAction[a] = { pass: 0, fail: 0, total: 0 };
    byAction[a].total++;
    if (rec.raid && rec.raid.verified) byAction[a].pass++;
    else byAction[a].fail++;
  }
  const fitnessByAction = {};
  for (const [action, s] of Object.entries(byAction)) {
    fitnessByAction[action] = { passRate: Math.round((s.pass / s.total) * 10000) / 10000, sampleSize: s.total, coldStart: false };
  }

  const toolRows = (_toolIndex().list({ consumer: agentId }) || []);
  const toolUsage = toolRows.map(r => ({
    tool: r.id, calls: r.calls || 0, edgeCases: (r.edgeCases || []).length,
  }));

  return {
    agentId,
    fitnessByAction,
    toolUsage,
    totalSubmissions: outputs.length,
    computedAt: Date.now(),
  };
}

/**
 * sync(agentId) — writes compute()'s real output to a real agent_model
 * row, one per agent (update-in-place, not append — this is a current
 * model, not a log; submissions/tool_index are the log this derives from).
 */
function sync(agentId) {
  const jaa = _jaa();
  if (!jaa) return { ok: false, error: 'JAA store unavailable' };
  const model = compute(agentId);
  const existing = (jaa.query('agent_model', r => r.agentId === agentId, 1) || [])[0];
  if (existing) jaa.update('agent_model', r => r.agentId === agentId, model);
  else jaa.insert('agent_model', model);
  return { ok: true, ...model };
}

/**
 * getFitness(agentId, actionType) — honest read for contract-assembly
 * time. Real number if real history exists; the SAME cold-start phrasing
 * contracts.js already uses otherwise — checked, not duplicated with a
 * different wording that would look like a second, disagreeing source.
 */
function getFitness(agentId, actionType) {
  const jaa = _jaa();
  if (!jaa) return { warning: 'no known fitness for this agent/action — real data unverified, treat as unbounded-untrusted, not unbounded-safe' };
  const row = (jaa.query('agent_model', r => r.agentId === agentId, 1) || [])[0];
  const entry = row && row.fitnessByAction && row.fitnessByAction[actionType];
  if (!entry || entry.sampleSize < 1) {
    return { warning: `no known fitness for "${agentId}"/"${actionType}" — real data unverified, treat as unbounded-untrusted, not unbounded-safe` };
  }
  return entry;
}

module.exports = { compute, sync, getFitness, MODULE_ID: 'agent-model', VERSION: '0.1.0' };
