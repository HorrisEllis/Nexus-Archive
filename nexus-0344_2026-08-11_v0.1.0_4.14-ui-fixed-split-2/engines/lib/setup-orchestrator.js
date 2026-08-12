'use strict';
/**
 * engines/lib/setup-orchestrator.js — first-run / drift-recovery orchestration
 * ─────────────────────────────────────────────────────────────────────────────
 * §3.4 raw logic before interfaces. This module knows nothing about HTTP,
 * IPC, or which real engine does what — it takes a `steps` array (each with
 * an injected `run()` function) and a persisted `state` object, and decides:
 *   - which steps to skip (already succeeded for the current IP, not forced)
 *   - what order to run the rest in
 *   - how to record partial failure so a crash mid-run is resumable
 * setup.js (the real engine) is a thin shell that injects real step runners
 * calling glue/firewall/tls/ddns. Everything here is testable with fakes.
 *
 * Idempotency rule (§ setup spec Phase 2): a step is skipped if
 * state.lastSuccessfulRun.ip === currentIp AND that step succeeded last time
 * AND force !== true. Otherwise it runs.
 *
 * Resumability: state.currentStep is set BEFORE a step starts and cleared
 * only after the whole run finishes (success or exhausted failure) — so a
 * crash mid-run leaves an accurate marker of where to resume, and
 * `runFrom(currentStep)` picks up there instead of re-running completed
 * steps.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * @param {Array<{key:string, run: () => Promise<{ok:boolean, detail?:string}>}>} steps
 * @param {object} state - persisted setup state (lastSuccessfulRun, currentStep, ...)
 * @param {object} opts - { currentIp, force, startFrom }
 * @param {(state:object)=>void} persist - called after every step to save progress immediately
 */
async function runSteps(steps, state, opts, persist) {
  const { currentIp, force = false, startFrom = null } = opts;
  const results = {};
  let startIdx = 0;
  if (startFrom) {
    const idx = steps.findIndex(s => s.key === startFrom);
    if (idx >= 0) startIdx = idx;
  }

  const prevRun = state.lastSuccessfulRun;
  const sameIp = prevRun && prevRun.ip === currentIp;

  for (let i = startIdx; i < steps.length; i++) {
    const step = steps[i];

    if (!force && sameIp && prevRun.steps && prevRun.steps[step.key]?.ok === true) {
      results[step.key] = { ok: true, skipped: true, detail: 'already succeeded for this IP' };
      continue;
    }

    state.currentStep = step.key;
    persist(state);

    let r;
    try {
      r = await step.run();
    } catch (e) {
      r = { ok: false, detail: e.message };
    }
    results[step.key] = r;

    if (!r.ok) {
      // Stop here — don't cascade failures forward (e.g. don't attempt TLS
      // if glue delegation just failed; it'll only fail too and muddy the
      // failure reason). currentStep stays pointed at the failed step so a
      // resume picks up exactly here, not from the start.
      state.lastSuccessfulRun = {
        ip: currentIp, timestamp: Date.now(),
        steps: { ...(sameIp ? prevRun.steps : {}), ...results },
        ok: false, failedAt: step.key, error: r.detail,
      };
      persist(state);
      return { ok: false, failedAt: step.key, results, state };
    }
  }

  state.currentStep = null;
  state.lastSuccessfulRun = {
    ip: currentIp, timestamp: Date.now(),
    steps: { ...(sameIp ? prevRun.steps : {}), ...results },
    ok: true,
  };
  state.lastKnownIp = currentIp;
  state.firstRunComplete = true;
  persist(state);
  return { ok: true, results, state };
}

/**
 * Debounce for IP-flap protection. Not a generic utility — specifically
 * models "wait until the IP has been stable for `stableMs` before acting."
 * Pure and clock-injectable so it's testable without real wall-clock waits.
 */
function createIpDebouncer(stableMs, onSettled, setTimeoutFn = setTimeout, clearTimeoutFn = clearTimeout) {
  let timer = null;
  let pendingIp = null;
  return {
    notify(ip) {
      pendingIp = ip;
      if (timer) clearTimeoutFn(timer);
      timer = setTimeoutFn(() => {
        timer = null;
        onSettled(pendingIp);
      }, stableMs);
    },
    cancel() {
      if (timer) clearTimeoutFn(timer);
      timer = null;
    },
  };
}

module.exports = { runSteps, createIpDebouncer };
