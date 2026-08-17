'use strict';
/**
 * lib/agent-tools/tools/identity/switch-agent.js — switch_agent tool
 * UUID: nexus-tool-switch-agent-v1-0000-2026-0814-jamesbrooks-001
 *
 * §WIRED 2026-08-14 — James: "I want the switch agent to work." Checked
 * first: it already does — copilot/lib/self-model.js's setCurrentAgent/
 * getCurrentAgent are real, JAA-backed, governance-checked (governAction
 * refuses if disallowed), and hat_forge's "wear" action already calls
 * setCurrentAgent under the hood. Nothing was broken. The real gap: hat_
 * forge's own tool description leads with hats (name, baseAgent, toolScope,
 * personaPrompt, responsibilities) — "just switch to gemini" is buried
 * inside a tool shaped around something bigger. This is that same real
 * function, alone, named what it does.
 *
 * §WIRED 2026-08-14 (later, same day) — James: "change agent needs to
 * connect to NCP." It didn't. The switch wrote a JAA row and stopped there:
 * this tool never touched the protocol the agent it was switching to
 * actually lives on. Consequence, traced end to end rather than assumed —
 * copilot/lifeline.js route() reads getCurrentAgent() and dispatches to that
 * provider, guardian/server.js:643 checks ncp.isConnected(job.provider), and
 * with no channel open the job is parked as queued_waiting_for_provider
 * (server.js:3138). Switching to an agent whose tab is closed therefore
 * succeeded loudly and then went quiet.
 *
 * Both actions now do a live read of guardian's real NCP state
 * (lib/ncp-availability.js -> GET /providers) and report it. Deliberately
 * REPORTS, does not refuse: the switch still lands, and the answer says
 * plainly whether the channel is up, who is up instead, and — when guardian
 * itself can't be reached — that it doesn't know. An offline agent is a fact
 * worth stating, not grounds for this tool to overrule the person.
 */
const sm  = require('../../../../copilot/lib/self-model.js');
const ncp = require('../../../../lib/ncp-availability.js');
const ct  = require('../../../../lib/chat-target.js');

/**
 * _chatNote(agent, chatUrl, chatId, snapshot) — whether the live tab is
 * actually in the bound conversation. Guardian has always known this (every
 * heartbeat carries chatId, /providers exposes it under `channels`); nothing
 * was asking. Returns null when there is nothing worth saying.
 */
function _chatNote(agent, chatUrl, snapshot) {
  if (!chatUrl) return null;
  const target = ct.parse(chatUrl);
  if (!target.ok) return `bound chat url no longer parses: ${target.reason}`;
  const live = snapshot && snapshot.providers && snapshot.providers[agent]
    ? snapshot.providers[agent].chatId : null;
  return ct.describe(target, live);
}

/**
 * _note(agent, ncpReport) — the one line a caller most needs and would
 * otherwise have to infer from a state string. Null when there's nothing
 * worth saying (agent is up, or doesn't use NCP at all).
 */
// §FIXED 2026-08-14 — caught end-to-end, not in review: this took no verb,
// so the read-only "current" action reported "Switched to chatgpt..." for an
// agent it had merely looked at. A tool that misdescribes what it just did is
// worse than one that says nothing.
function _note(agent, r, verb) {
  if (!r) return null;
  if (r.degraded) {
    return `${verb} ${agent}, but NCP could not be read (${r.reason}) — whether ` +
           `${agent}'s channel is open is unknown. Guardian may not be running.`;
  }
  if (r.state === 'offline') {
    const up = r.connectedAgents.length ? r.connectedAgents.join(', ') : 'none';
    return `${verb} ${agent}, but it has NO open NCP channel — jobs will queue as ` +
           `queued_waiting_for_provider until its tab connects. Connected now: ${up}.`;
  }
  return null;
}

const ACTIONS = {
  switch: async (a) => {
    if (!a.agent) return { error: 'switch needs agent — ollama/claude/chatgpt/gemini/mistral/perplexity/auto, or a forged hat name' };

    // Live read BEFORE reporting, not the stale cache — this action is async,
    // so there is no reason to answer from a snapshot that could be 5s old.
    const snap = await ncp.refresh();

    // §WIRED 2026-08-14 — chatUrl is validated inside setCurrentAgent, before
    // the row is written, so a claude switch carrying a chatgpt URL is refused
    // here rather than persisted as a contradiction nobody notices until a job
    // lands in the wrong place.
    const res = sm.setCurrentAgent(a.agent, { chatUrl: a.chatUrl });
    if (!res || res.ok === false) return res;

    // setCurrentAgent resolves forged hat names to their base agent, so read
    // the report off what it actually landed on, not what was asked for.
    const landed = res.agent;
    const r      = res.ncp || ncp.report(landed);
    return { ...res, ncp: r, note: _note(landed, r, 'Switched to'), chatNote: _chatNote(landed, res.chatUrl, snap) };
  },

  current: async () => {
    const snap = await ncp.refresh();
    const cur  = sm.getCurrentAgent();
    const r    = ncp.report(cur.agent);
    return { ok: true, ...cur, ncp: r, note: _note(cur.agent, r, 'Active agent is'), chatNote: _chatNote(cur.agent, cur.chatUrl, snap) };
  },

  // Read-only view of the protocol itself — who can be switched TO right now.
  // Same single source of truth as the other two actions.
  channels: async () => {
    const snap = await ncp.refresh();
    return {
      ok: true,
      connected: ncp.connected(),
      degraded:  snap.degraded,
      reason:    snap.degraded ? (snap.error || 'no successful NCP read yet') : null,
      providers: snap.providers,
      source:    snap.source,
      checkedAt: snap.fetchedAt || null,
    };
  },
};

module.exports = {
  name: 'switch_agent',
  description:
    'Switch which agent handles the conversation, check which one is active, or list which agents ' +
    'are reachable on NCP right now. Actions: "switch" (needs agent — ollama/claude/chatgpt/gemini/' +
    'mistral/perplexity/auto, or the name of a forged hat), "current" (no args — reports the active ' +
    'agent and, if it was set via a hat, that hat\'s name), "channels" (no args — live NCP channel ' +
    'state per provider). "switch" and "current" both report whether that agent has a live NCP ' +
    'channel; a switch to an offline agent still succeeds and says so, since its jobs will queue ' +
    'until its tab connects.',
  parameters: {
    type: 'object',
    properties: {
      action:  { type: 'string', enum: Object.keys(ACTIONS) },
      agent:   { type: 'string', description: 'for "switch"' },
      chatUrl: { type: 'string', description: 'for "switch", optional — a specific conversation URL on that provider (e.g. https://claude.ai/chat/<id>). Must belong to the agent being switched to. Pass null to clear an existing binding.' },
    },
    required: ['action'],
  },
  async execute(args = {}) {
    const fn = ACTIONS[args.action];
    if (!fn) return { error: `unknown action "${args.action}" — one of: ${Object.keys(ACTIONS).join(', ')}` };
    try { return await fn(args); }
    catch (e) { return { error: `switch_agent ${args.action} failed: ${e.message}` }; }
  },
};
