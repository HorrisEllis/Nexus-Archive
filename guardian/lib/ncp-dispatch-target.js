'use strict';

/**
 * guardian/lib/ncp-dispatch-target.js
 *
 * §MCO-NCP-FANOUT 2026-09-13 — real bug traced from a live log: guardian
 * created a job, dispatched it "via NCP (3 clients)", got THREE real
 * job.dispatched acks back from chatgpt, and the job still ended in
 * copilot's own "[NCP dispatch failed — no response]". Root cause,
 * confirmed by reading the real code, not guessed: guardian/lib/
 * dispatcher.js dispatched a job's real content via ncp.push(provider,
 * ...) — guardian/lib/ncp.js's own push() broadcasts to EVERY connected
 * client for that provider, not to one. Three real, live browser tabs
 * each independently received and tried to answer the SAME job — a
 * genuine race with no single real result the job's completion write
 * could reliably land on before askSync's timeout. The ping gate
 * (_pingProvider, built the same day) had the identical bug: it broadcasts
 * GUARDIAN_PING to all clients and clears on the FIRST pong from ANY of
 * them, proving nothing about which specific tab will receive the actual
 * job content moments later.
 *
 * This module is the real fix's decision: given every real, connected
 * client for a provider, resolve to exactly ONE tabId. dispatcher.js then
 * pings and dispatches to that one tab only (ncp.pushTab), never
 * broadcasting the real job content again.
 */

/**
 * selectDispatchTarget(clients) — pure.
 *
 * @param {Array<{tabId, claimed, lastHeartbeat, connectedAt, chatId}>} clients
 *   Every real, non-stale client for one provider — guardian/lib/ncp.js's
 *   new listClientsForProvider(provider).
 * @returns {{ok:true, tabId, ambiguous?, candidateCount?, reason} | {ok:false, reason}}
 *
 * Selection order:
 *   1. Exactly one claimed client -> that one. `claimed` is the real,
 *      already-tracked signal (guardian/lib/ncp.js's own client.claimed,
 *      set via GUARDIAN_REGISTER/GUARDIAN_CLAIM_ACK) that a human or the
 *      system explicitly marked THIS tab as the one to use — the
 *      strongest real evidence available, used first.
 *   2. More than one claimed client (a real, otherwise-invisible
 *      conflict — two tabs both marked claimed for the same provider) ->
 *      the most recently active one (freshest lastHeartbeat), flagged
 *      `ambiguous:'multiple_claimed'` so this gets logged and is
 *      diagnosable, not silently resolved as if it were normal.
 *   3. No claimed clients, exactly one connected -> that one (the
 *      single-tab case this whole codebase was implicitly built around
 *      before multi-tab use ever happened — unchanged real behavior).
 *   4. No claimed clients, more than one connected -> the most recently
 *      active, flagged `ambiguous:'multiple_unclaimed'`.
 *   5. Zero real clients -> {ok:false} — the caller's existing
 *      isConnected()-gated queue/requeue path already handles this case,
 *      this function adds nothing new there.
 */
function selectDispatchTarget(clients) {
  const real = Array.isArray(clients) ? clients.filter(c => c && c.tabId) : [];
  if (!real.length) return { ok: false, reason: 'no real connected clients for this provider' };

  const pickFreshest = (list) => list.slice().sort((a, b) => (b.lastHeartbeat || 0) - (a.lastHeartbeat || 0))[0];
  const claimed = real.filter(c => c.claimed === true);

  if (claimed.length === 1) {
    return { ok: true, tabId: claimed[0].tabId, reason: 'single claimed client' };
  }
  if (claimed.length > 1) {
    const picked = pickFreshest(claimed);
    return {
      ok: true, tabId: picked.tabId, ambiguous: 'multiple_claimed', candidateCount: claimed.length,
      reason: `${claimed.length} claimed clients for this provider — picked the most recently active (tabId ${picked.tabId})`,
    };
  }
  if (real.length === 1) {
    return { ok: true, tabId: real[0].tabId, reason: 'single connected client, none claimed' };
  }
  const picked = pickFreshest(real);
  return {
    ok: true, tabId: picked.tabId, ambiguous: 'multiple_unclaimed', candidateCount: real.length,
    reason: `${real.length} unclaimed clients for this provider — picked the most recently active (tabId ${picked.tabId}), rather than broadcasting the job to all ${real.length} and racing them`,
  };
}

module.exports = { selectDispatchTarget };
