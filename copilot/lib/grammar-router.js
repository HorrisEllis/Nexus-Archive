'use strict';
/**
 * copilot/lib/grammar-router.js — the dynamic grammar engine, in the mind (§P5)
 * UUID: nexus-copilot-grammar-router-v1-0000-2026-0807-001
 *
 * James: "expand P5 exponentially — dynamic grammar engine." There already IS one
 * (lib/grammar-engine.js): it reads the component registry grammar tree, builds a
 * trie, and resolves natural language → { componentId, params, confidence }. It
 * live-rebuilds on component.registered, so it GROWS as capabilities are added.
 * co-pilot's CLI uses it — but co-pilot's CONVERSATIONAL path does not. That's the
 * gap this closes.
 *
 * THE EXPONENTIAL PART: co-pilot's chat currently understands ~7 hand-written
 * regex intercepts. Wired to the grammar engine, it understands ALL 239
 * capabilities — and every future one — with zero new regex, because the grammar
 * is generated FROM loom's registry, not hand-maintained. Adding a component adds
 * a phrase co-pilot understands, automatically.
 *
 * §8.6 composes lib/grammar-engine (the trie) + copilot/lib/capabilities (to
 * describe what resolved). §1.1 confidence-gated: a high-confidence resolution
 * routes to the real capability; a low-confidence one falls through to the LLM
 * rather than mis-firing (the grammar-misfire-tracker exists precisely because a
 * confident wrong match is worse than a miss). §1.2 never throws to the caller.
 */

let _engine = null;
let _loaded = false;

function _getEngine() {
  if (!_engine) { try { _engine = require('../../lib/grammar-engine'); } catch (_) { _engine = null; } }
  return _engine;
}

/**
 * ensureLoaded(opts) — make sure the grammar trie is built (fetched from the
 * registry). Idempotent; safe to call before each resolve. Non-blocking-friendly:
 * if the registry isn't reachable, the engine stays not-ready and route() returns
 * null (fall through to LLM), never hangs.
 */
async function ensureLoaded(opts = {}) {
  const eng = _getEngine();
  if (!eng) return false;
  if (_loaded && eng._ready) return true;
  try {
    if (typeof eng.load === 'function') { await eng.load(opts.orchestratorUrl); _loaded = true; }
    else if (typeof eng.rebuild === 'function') { await eng.rebuild(); _loaded = true; }
    return !!eng._ready;
  } catch (_) { return false; }
}

/**
 * route(prompt, opts) — resolve a natural-language prompt to a real capability via
 * the grammar trie. Returns null if the grammar can't confidently resolve it (→
 * the caller falls through to the LLM / other intercepts).
 * @returns { componentId, params, confidence, capability } | null
 */
async function route(prompt, opts = {}) {
  const eng = _getEngine();
  if (!eng || typeof eng.resolve !== 'function') return null;

  // Make sure the trie is built; if it isn't and can't be, don't block — miss.
  if (!eng._ready) { const ok = await ensureLoaded(opts); if (!ok) return null; }

  let res;
  try { res = eng.resolve(prompt); } catch (_) { return null; }
  if (!res || !res.componentId) return null;

  // §1.1 confidence gate. A confident wrong match is worse than a miss (that's
  // why the misfire-tracker exists). Only route above the floor; else fall
  // through to the LLM. Default floor 0.6 — aliases/full matches are 0.95,
  // partials scale down toward 0.3.
  const floor = opts.confidenceFloor != null ? opts.confidenceFloor : 0.6;
  if ((res.confidence || 0) < floor) return { ...res, belowFloor: true, routed: false };

  // Describe what it resolved to, from the real capability registry.
  let capability = null;
  try {
    const caps = opts.capabilities || require('./capabilities');
    const all = caps.whatCanIDo();
    for (const sys of Object.values(all.systems || {})) {
      const hit = sys.find(c => c.id === res.componentId);
      if (hit) { capability = hit; break; }
    }
  } catch (_) { /* description is a bonus, not required */ }

  return { componentId: res.componentId, params: res.params || [], confidence: res.confidence, matched: res.matched, capability, routed: true };
}

/**
 * describeGrammar() — how many phrases co-pilot understands right now (grows with
 * the registry). For "how do you understand me" / introspection.
 */
function describeGrammar() {
  const eng = _getEngine();
  if (!eng) return { ready: false, reason: 'grammar engine unavailable' };
  try {
    const st = eng.status ? eng.status() : {};
    const aliases = eng.getAliases ? eng.getAliases() : {};
    return { ready: !!eng._ready, aliases: Object.keys(aliases).length, ...st,
      text: `Grammar engine ${eng._ready ? 'ready' : 'not loaded'} — resolves natural language to real capabilities via the registry trie${eng._ready ? `, ${Object.keys(aliases).length} aliases` : ''}. Grows automatically as components register.` };
  } catch (e) { return { ready: false, reason: e.message }; }
}

function _reset() { _engine = null; _loaded = false; }
module.exports = { route, ensureLoaded, describeGrammar, _reset, MODULE_ID: 'copilot-grammar-router', VERSION: '1.0.0' };
