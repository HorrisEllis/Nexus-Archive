'use strict';
/**
 * lib/ncp-availability.js — live NCP connection state for agent routing
 * UUID: nexus-ncp-availability-v1-0000-2026-0814-jamesbrooks-001
 *
 * §WIRED 2026-08-14 — James: "change agent needs to connect to NCP."
 *
 * What was actually wrong, checked before writing a line:
 *
 *   lib/agent-router.js's routeAgent() takes an `available` parameter —
 *   "(agent)=>bool availability check" — and uses it to build the fallback
 *   chain (`chain = [agent, ...fallback].filter(isUp)`). When it isn't
 *   supplied it defaults to `() => true`. Grepped every caller in the repo:
 *   NOT ONE passes it. copilot/lib/self-model.js:289 forwards opts.available
 *   through, and its two real callers (lib/nexus-cli-interface.js:81,
 *   copilot/server.js:1159) both omit it. So the availability filter has
 *   always been a filter that passes everything — the fallback chain was
 *   decorative, and "switch to <agent>" happily switched to a provider with
 *   no NCP channel open.
 *
 *   Downstream that is not silent-but-harmless: guardian/server.js parks
 *   those jobs as `queued_waiting_for_provider` (server.js:3138) and waits.
 *
 * This module is the missing half — the real read of NCP's real state.
 * Source of truth is guardian's own GET /providers (guardian/server.js:2374),
 * which reports ncp.isConnected(p) per provider plus ncp.getProviders()
 * channel detail (tabId, lastHeartbeat, usage, claimed, recentDisconnects).
 * No new state, no second registry — one HTTP read of the thing that already
 * knows.
 *
 * Two deliberate design decisions, both about not pretending:
 *
 *   1. state() is honest and four-valued — 'direct' | 'connected' |
 *      'offline' | 'unknown'. If guardian is down we do not know whether
 *      claude's tab is open, and this says so rather than guessing 'offline'.
 *
 *   2. predicate() fails OPEN on 'unknown'. routeAgent()'s filter is a
 *      routing decision, not a report: if guardian is unreachable, filtering
 *      everything out would leave an empty fallback chain and break routing
 *      system-wide for a reason that has nothing to do with the agents. The
 *      degraded flag on the snapshot is how a caller finds out the filter is
 *      running blind — it is never hidden.
 *
 * ollama is 'direct', never gated: it is local HTTP on :3749 (copilot/
 * lifeline.js OL_URL) and reaches no browser tab. clear-glass/src/providers/
 * registry.js says the same thing — ollama is excluded from NCP providers by
 * spec because it needs no tab. Gating the sovereign local path on a
 * browser-tab protocol would be a real regression.
 *
 * Sync + async by design: routeAgent()'s `available` contract is a SYNCHRONOUS
 * predicate, and self-model.switchAgent() is a synchronous function with live
 * callers. So the network read is stale-while-revalidate — snapshot() answers
 * instantly from cache and kicks off a background refresh when stale, while
 * anything already async (the switch_agent tool) awaits refresh() for a
 * genuinely live read.
 */

const http = require('http');

const GUARDIAN_URL = process.env.GUARDIAN_URL || 'http://127.0.0.1:7820';

// How long a snapshot is considered fresh. Agent routing runs per message;
// this is short enough to notice a tab closing, long enough not to put an
// HTTP round-trip in front of every routing decision.
const TTL_MS      = 5_000;
const TIMEOUT_MS  = 2_000;

// Agents that do not ride NCP at all. Never gated on channel state.
const DIRECT_AGENTS = new Set(['ollama', 'auto']);

// ── Snapshot state ────────────────────────────────────────────────────────────

let _snap = {
  known:     false,   // have we ever completed a successful read?
  degraded:  true,    // is the current answer running blind?
  fetchedAt: 0,
  providers: {},      // name -> { connected, tabId, lastHeartbeat, usage, claimed, recentDisconnects }
  error:     null,
  source:    `${GUARDIAN_URL}/providers`,
};

let _inflight = null;   // single-flight guard — no thundering herd on refresh

// ── HTTP ──────────────────────────────────────────────────────────────────────

function _getJSON(url, timeoutMs = TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname,
      port:     u.port || 80,
      path:     u.pathname + u.search,
      method:   'GET',
      timeout:  timeoutMs,
    }, r => {
      let d = '';
      r.on('data', c => { d += c; });
      r.on('end', () => {
        if (r.statusCode < 200 || r.statusCode >= 300) {
          return reject(new Error(`HTTP ${r.statusCode} from ${url}`));
        }
        try { resolve(JSON.parse(d)); }
        catch (e) { reject(new Error(`bad JSON from ${url}: ${e.message}`)); }
      });
    });
    req.on('timeout', () => { req.destroy(new Error(`timeout after ${timeoutMs}ms`)); });
    req.on('error', reject);
    req.end();
  });
}

/**
 * _parse(body) — guardian's /providers shape into our provider map.
 *
 * Guardian answers { ok, providers: { claude:'connected'|'null', ... },
 * channels: { claude: { tabId, lastHeartbeat, usage, claimed, ... } } }.
 * Note 'null' there is the STRING 'null', not null — server.js:2375 seeds the
 * map with it. Both halves are read: `providers` is the authoritative
 * connected/not flag, `channels` carries the detail worth reporting back.
 */
function _parse(body) {
  const out    = {};
  const flags  = (body && body.providers) || {};
  const chans  = (body && body.channels)  || {};

  for (const [name, flag] of Object.entries(flags)) {
    const ch = chans[name] || null;
    out[name] = {
      connected:         flag === 'connected',
      tabId:             ch ? ch.tabId : null,
      lastHeartbeat:     ch ? ch.lastHeartbeat : null,
      claimed:           ch ? !!ch.claimed : false,
      usage:             ch ? ch.usage : null,
      recentDisconnects: ch ? (ch.recentDisconnects || 0) : 0,
      // §FIXED 2026-08-14 — chatId was dropped on the floor here. Guardian's
      // getProviders() has always returned it (guardian/lib/ncp.js, populated
      // from every heartbeat), and this parser simply did not copy it across.
      // Invisible until something asked which conversation a tab was in —
      // lib/chat-target's compare() then reported a confident 'unknown' for a
      // tab whose chat id guardian was sending on the same response.
      chatId:            ch ? (ch.chatId ?? null) : null,
    };
  }

  // A channel guardian reports but didn't seed a flag for still counts as
  // connected — the channel map is live NCP client state, not a fixed list.
  for (const [name, ch] of Object.entries(chans)) {
    if (out[name]) continue;
    out[name] = {
      connected:         true,
      tabId:             ch.tabId || null,
      lastHeartbeat:     ch.lastHeartbeat || null,
      claimed:           !!ch.claimed,
      usage:             ch.usage || null,
      recentDisconnects: ch.recentDisconnects || 0,
      chatId:            ch.chatId ?? null,
    };
  }

  return out;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * refresh() — read NCP state now. Never throws: a failure produces a degraded
 * snapshot with the reason attached, because "guardian is unreachable" is an
 * answer callers need, not an exception that kills a switch.
 */
async function refresh() {
  if (_inflight) return _inflight;

  _inflight = (async () => {
    try {
      const body = await _getJSON(`${GUARDIAN_URL}/providers`);
      _snap = {
        known:     true,
        degraded:  false,
        fetchedAt: Date.now(),
        providers: _parse(body),
        error:     null,
        source:    `${GUARDIAN_URL}/providers`,
      };
    } catch (e) {
      // Keep the last good provider map if we had one — a momentary blip
      // shouldn't erase what we knew a second ago — but mark it degraded so
      // nothing downstream reports stale data as current truth.
      _snap = {
        ..._snap,
        degraded: true,
        error:    e.message,
      };
    } finally {
      _inflight = null;
    }
    return _snap;
  })();

  return _inflight;
}

/**
 * snapshot({ maxAgeMs }) — the current view, synchronously. Triggers a
 * background refresh when stale (stale-while-revalidate); the caller is never
 * blocked on the network. `ageMs` and `degraded` are how a caller tells how
 * much to trust it.
 */
function snapshot({ maxAgeMs = TTL_MS } = {}) {
  const age = Date.now() - _snap.fetchedAt;
  if (!_snap.known || age > maxAgeMs) {
    refresh().catch(() => {});   // background; errors already folded into _snap
  }
  return { ..._snap, providers: { ..._snap.providers }, ageMs: _snap.fetchedAt ? age : null };
}

/**
 * state(agent) — honest per-agent channel state.
 *   'direct'    — doesn't use NCP (ollama, auto). Always reachable by its own path.
 *   'connected' — NCP channel open right now.
 *   'offline'   — guardian answered, and this agent has no channel.
 *   'unknown'   — we have never had a successful read. Not the same as offline.
 */
function state(agent) {
  const a = String(agent || '').trim().toLowerCase();
  if (DIRECT_AGENTS.has(a)) return 'direct';
  if (!_snap.known) return 'unknown';

  // §FIXED 2026-08-14 — caught in the first end-to-end run, not in review.
  // This used to fall through to the retained provider map while degraded,
  // which reported a confident 'offline' for every agent the moment guardian
  // died — dressing "I can't reach the thing that knows" up as "I asked and
  // the tab is closed." Those are different facts and only one of them is
  // true. A degraded read knows NOTHING current about any NCP agent, so it
  // says so. The stale map is still on snapshot().providers for diagnostics,
  // flagged by the same degraded bit.
  if (_snap.degraded) return 'unknown';

  const p = _snap.providers[a];
  return p && p.connected ? 'connected' : 'offline';
}

/** isConnected(agent) — strict: only true for a live NCP channel. */
function isConnected(agent) {
  return state(agent) === 'connected';
}

/** connected() — names of agents with a live NCP channel right now. */
function connected() {
  return Object.entries(_snap.providers)
    .filter(([, p]) => p.connected)
    .map(([name]) => name)
    .sort();
}

/**
 * predicate() — the (agent)=>bool routeAgent() has always accepted and never
 * been given. Fails open on 'unknown' (see header): a filter that empties the
 * fallback chain because guardian is down is worse than one that lets routing
 * proceed and reports itself degraded.
 */
function predicate() {
  return (agent) => {
    const s = state(agent);
    return s === 'connected' || s === 'direct' || s === 'unknown';
  };
}

/**
 * report(agent) — one compact, honest block for a tool or UI to hand back.
 * Deliberately does not decide anything; it describes.
 */
function report(agent) {
  const snap = snapshot();
  const s    = state(agent);
  return {
    agent,
    state:     s,
    connected: s === 'connected' || s === 'direct',
    live:      !snap.degraded,
    degraded:  snap.degraded,
    reason:    snap.degraded ? (snap.error || 'no successful NCP read yet') : null,
    connectedAgents: connected(),
    checkedAt: snap.fetchedAt || null,
    ageMs:     snap.ageMs,
    source:    snap.source,
  };
}

/** _reset() — test seam. Clears the cache so a test can start from cold. */
function _reset() {
  _snap = {
    known: false, degraded: true, fetchedAt: 0, providers: {},
    error: null, source: `${GUARDIAN_URL}/providers`,
  };
  _inflight = null;
}

module.exports = {
  refresh, snapshot, state, isConnected, connected, predicate, report,
  DIRECT_AGENTS, TTL_MS, _reset,
  MODULE_ID: 'lib/ncp-availability',
  VERSION: '1.0.0',
};
