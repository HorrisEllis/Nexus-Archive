'use strict';
/**
 * orchestrator/lib/versionium-auto-commit.js — Sigma-gated auto-commit
 * UUID: nexus-versionium-auto-commit-v1-0000-2026-0828-001
 * Version: 1.0.0
 *
 * §VERSIONIUM STEP 4 — docs/versionium.spec's own words: "CFR sigma
 * crossing a threshold triggers an automatic snapshot via the mechanism
 * above, tagged with the sigma event that caused it (causedBy, same
 * pattern as this session's other causal chaining work) — proposed, not
 * built, no existing analog found."
 *
 * The threshold-crossing detection already existed — orchestrator/lib/
 * sigma-writer.js's _writeComposite() already emits 'sigma.composite.
 * warning' (>=0.50) and 'sigma.composite.halt_risk' (>=0.70) on the real
 * bus. This module is the one piece that didn't exist: something
 * listening for those and actually triggering a real commit.
 *
 * "the mechanism above" = idearium's SnapshotGate (docs/versionium.spec's
 * commit_graph section, this session's step 1) — the real commit-graph
 * system with branch/parentId/message, not cortex/snapshot's cross-system
 * state coordination (a different, lower-level mechanism, not framed
 * around commits/branches/messages the way Versionium's whole framing is).
 *
 * causedBy: SnapshotGate already fully supported this field before this
 * module existed (destructured, persisted on the snap object) — the one
 * real gap was idearium/api/index.js's HTTP handler not forwarding it
 * from the request body, fixed alongside this file, not by this file.
 */

const http = require('http');

const MODULE_ID = 'versionium-auto-commit';
const VERSION   = '1.0.0';

const IDEARIUM_HOST = process.env.IDEARIUM_HOST || '127.0.0.1';
const IDEARIUM_PORT = parseInt(process.env.IDEARIUM_PORT || '4800', 10);

// §REAL DESIGN DECISION — _writeComposite() runs on a fixed interval
// (COMPOSITE_WRITE_INTERVAL) and re-emits its threshold event EVERY tick
// composite sigma remains above the line, not just once on the initial
// crossing. Without a cooldown, sustained high sigma would auto-commit
// once per interval indefinitely — a real commit-spam risk, not a
// hypothetical one, for exactly the "system under real, sustained stress"
// case this feature exists to capture. 5 minutes is a real, deliberate
// choice: frequent enough that a genuine, sustained deviation is captured
// promptly, not so frequent that a single stress episode fills the commit
// history with near-duplicate snapshots.
const COOLDOWN_MS = parseInt(process.env.VERSIONIUM_AUTOCOMMIT_COOLDOWN_MS || '300000', 10);

let _lastAutoCommitAt = 0;
let _subscribed = false;
let _bus = null;

function _getBus() {
  if (_bus) return _bus;
  try { _bus = require('../../nexus-bus'); } catch (_) {}
  return _bus;
}

/**
 * _pushSnapshot({message, causedBy}) — the one real HTTP call this module
 * makes. POST /api/snapshots on idearium (confirmed real, existing route:
 * idearium/api/index.js's ROUTES table maps this exact path+method to
 * action 'snapshot.push', requiring CAPS.ADMIN — but that file's own
 * comment confirms "internal API, no auth, no remote surface": idearium
 * only accepts traffic from trusted internal callers like this one, no
 * token needed). Fire-and-forget by design, same reasoning as every other
 * cross-process notification this session added: a failed auto-commit
 * attempt should never be allowed to affect anything else orchestrator is
 * doing, it should just be logged honestly.
 */
function _pushSnapshot({ message, causedBy }) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({ message, branch: 'main', author: 'versionium-auto-commit', causedBy });
    const req = http.request({
      hostname: IDEARIUM_HOST, port: IDEARIUM_PORT,
      path: '/api/snapshots', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
      timeout: 5000,
    }, (res) => {
      let body = '';
      res.on('data', (d) => { body += d; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`[${MODULE_ID}] auto-commit succeeded: ${message}`);
          resolve({ ok: true });
        } else {
          console.warn(`[${MODULE_ID}] auto-commit request reached idearium but was rejected (HTTP ${res.statusCode}): ${body.slice(0, 200)}`);
          resolve({ ok: false, error: `HTTP ${res.statusCode}` });
        }
      });
    });
    req.on('error', (err) => {
      console.warn(`[${MODULE_ID}] auto-commit request could not reach idearium :${IDEARIUM_PORT} (${err.code || err.message}) — sigma stayed high with no commit made to show for it`);
      resolve({ ok: false, error: err.code || err.message });
    });
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'timeout' }); });
    req.write(payload);
    req.end();
  });
}

async function _onThresholdEvent(level, event) {
  const now = Date.now();
  const sinceLastMs = now - _lastAutoCommitAt;
  if (sinceLastMs < COOLDOWN_MS) {
    console.log(`[${MODULE_ID}] sigma ${level} (${event?.sigma?.toFixed?.(3)}) — within cooldown (${Math.round((COOLDOWN_MS - sinceLastMs) / 1000)}s remaining), not auto-committing again`);
    return;
  }
  _lastAutoCommitAt = now;
  const message = `auto-commit: sigma composite ${level === 'halt_risk' ? 'HALT RISK' : 'warning'} — sigma=${event?.sigma?.toFixed?.(3) ?? '?'} (${event?.count ?? '?'} samples)`;
  await _pushSnapshot({ message, causedBy: event?.uuid || null });
}

function init() {
  if (_subscribed) return;
  const bus = _getBus();
  if (!bus) { console.warn(`[${MODULE_ID}] bus unavailable — sigma-gated auto-commit inactive`); return; }

  bus.on('sigma.composite.warning',  (event) => _onThresholdEvent('warning',   event));
  bus.on('sigma.composite.halt_risk', (event) => _onThresholdEvent('halt_risk', event));

  _subscribed = true;
  console.log(`[${MODULE_ID}] v${VERSION} — listening for sigma.composite.warning/halt_risk, cooldown=${COOLDOWN_MS}ms`);
}

module.exports = { init, MODULE_ID, VERSION, COOLDOWN_MS };
