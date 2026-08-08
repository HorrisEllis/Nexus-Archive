'use strict';
/**
 * lib/autopilot-intelligence.js — wire + verify the intelligence substrate at boot
 * UUID: nexus-autopilot-intelligence-v1-0000-2026-0808-001
 *
 * James: "completely update the entire autopilot. Check lib, the intelligence
 * system, RFR2, emergence, CFR, sigmas, baseline behavior — make sure they're all
 * wired in."
 *
 * Autopilot is the boot entry. Today it wires the fan-in (P1) but the broader
 * intelligence substrate is wired piecemeal (intelligence.init lives in cortex
 * boot; CFR/baseline/RFR2 aren't verified as a coherent bundle). This module is
 * the ONE place autopilot calls to wire AND VERIFY the whole faculty:
 *
 *   intelligence   — the learner (init/observe pattern+failure scanning)
 *   RFR2           — relational-field: conditions behind friction
 *   CFR            — the field + regime (meta/cfr)
 *   baseline       — baseline behavior + sigma (lib/baseline)
 *   sigmas         — sigma detection feeding snapshot-on-sigma (P2)
 *   emergence      — intelligence's pattern/emergence detection over the stream
 *
 * §1.1 declared≠real — this VERIFIES each is actually reachable, returns a wired/
 * missing report, not a claim. §8.6 composes existing modules; starts nothing
 * that's already running (idempotent — won't double-init intelligence). §1.2 a
 * missing faculty degrades honestly; the boot never dies on a wiring gap.
 */

function _try(p) { try { return require(p); } catch (_) { return null; } }

/**
 * wireIntelligence(opts) — wire + verify the whole substrate against the live
 * fan-in. Returns { wired:[], missing:[], report } — the truth of what's connected.
 */
function wireIntelligence(opts = {}) {
  const fanin = opts.fanin || _try('./ledger-fanin');
  const wired = [];
  const missing = [];

  // 1) Intelligence — the learner. Start it if not already running (idempotent).
  const intel = opts.intelligence || _try('../cortex/intelligence');
  if (intel) {
    try {
      if (typeof intel.getState === 'function' && intel.getState()?.running) wired.push('intelligence (already running)');
      else if (typeof intel.init === 'function') { intel.init(opts.intelConfig || {}); wired.push('intelligence (started)'); }
      else wired.push('intelligence (present, no init)');
      // subscribe it to the live stream if it exposes an intake.
      if (fanin && fanin.subscribe && (intel.observe || intel.ingestEvent)) {
        fanin.subscribe('intelligence-live', (row) => { try { (intel.observe || intel.ingestEvent)(row); } catch (_) {} });
        wired.push('intelligence←fanin');
      }
    } catch (e) { missing.push(['intelligence', e.message]); }
  } else missing.push(['intelligence', 'module not found']);

  // 2) RFR2 — relational-field (conditions behind friction).
  const rfr2 = opts.relationalField || _try('../cortex/intelligence/relational-field');
  if (rfr2 && rfr2.readFieldForFriction) wired.push('RFR2 (relational-field)');
  else missing.push(['RFR2', 'relational-field not reachable']);

  // 3) CFR — the field + regime.
  const cfr = opts.cfr || _try('../meta/cfr');
  if (cfr && (cfr.createCFRLedger || cfr.field)) wired.push('CFR (field/regime)');
  else missing.push(['CFR', 'meta/cfr not reachable']);

  // 4) baseline behavior + sigma.
  const baseline = opts.baseline || _try('./baseline');
  if (baseline && baseline.sigma && baseline.createBaseline) wired.push('baseline+sigma');
  else missing.push(['baseline', 'lib/baseline not reachable']);

  // 5) sigmas → snapshot-on-sigma (P2) — is the snapshot trigger on the stream?
  const snap = opts.snapshotTrigger || _try('./snapshot-trigger');
  if (snap && snap.attach) {
    if (fanin && !opts.snapshotAlreadyAttached) { try { snap.attach(fanin, opts.snapshotOpts || {}); wired.push('sigma→snapshot'); } catch (e) { missing.push(['sigma→snapshot', e.message]); } }
    else wired.push('sigma→snapshot (present)');
  } else missing.push(['sigma→snapshot', 'snapshot-trigger not reachable']);

  // 6) emergence — intelligence's pattern/emergence detection. It's a PROPERTY of
  //    intelligence scanning the stream, not a separate module: verify the scan path.
  if (intel && (intel.getState || intel._scanPatterns || intel.observe)) wired.push('emergence (intelligence pattern scan)');
  else missing.push(['emergence', 'no intelligence scan path']);

  const report = `intelligence substrate: ${wired.length} wired [${wired.join(', ')}]` +
    (missing.length ? ` · ${missing.length} MISSING [${missing.map(m => m[0]).join(', ')}]` : ' · all connected');

  return { wired, missing, ok: missing.length === 0, report };
}

module.exports = { wireIntelligence, MODULE_ID: 'autopilot-intelligence', VERSION: '1.0.0' };
