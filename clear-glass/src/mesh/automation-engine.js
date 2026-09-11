'use strict';
/**
 * clear-glass/src/mesh/automation-engine.js — real workflow scheduler.
 * docs/2026-09-11-brainos-external-concept-mapping.spec named this the
 * ONE genuine gap: NEXUS had real dependency graphs (RAID) and real
 * retry state machines (lib/seam/queue.js, agent-mesh's drainer) but no
 * real trigger/schedule-driven multi-step workflow engine anywhere.
 *
 * §HONEST SCOPE — deliberately smaller than the uploaded external
 * reference's 9-step-type schema (trigger/condition/agent/delay/
 * schedule/command/notification/http/branch). This ships 3 real step
 * types (trigger, agent, delay) end to end, persisted, tested, actually
 * running — not a wider schema with most types stubbed. condition/
 * branch/http/notification are real, wanted extensions, not built here;
 * adding one means adding one real case to _runStep(), same shape as
 * the three below, discoverable through this file's own contract
 * (ui/brainos-float/brainos-float-contract.json) without a client
 * rebuild — that IS the hotswap point, not a promise this file can't keep.
 *
 * Every step calls a REAL, already-existing mesh function — no second
 * dispatch path (§10.3): 'agent' steps go through the exact same
 * this.enqueue() the drainer and route-graph already use.
 */
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const WORKFLOWS_DIR = path.join(__dirname, '..', '..', '..', 'data', 'brainos', 'workflows');
const TICK_MS = 5000;

function _loadAll() {
  const out = [];
  try {
    if (!fs.existsSync(WORKFLOWS_DIR)) return out;
    for (const f of fs.readdirSync(WORKFLOWS_DIR)) {
      if (!f.endsWith('.workflow.json')) continue;
      try { out.push(JSON.parse(fs.readFileSync(path.join(WORKFLOWS_DIR, f), 'utf8'))); }
      catch (e) { console.warn(`[automation-engine] skipping unreadable ${f} (non-fatal): ${e.message}`); }
    }
  } catch (e) {
    console.warn(`[automation-engine] _loadAll failed (non-fatal, starting empty): ${e.message}`);
  }
  return out;
}

class AutomationEngine {
  constructor({ enqueueFn, busEmit } = {}) {
    this._enqueue = typeof enqueueFn === 'function' ? enqueueFn : () => {};
    this._busEmit = typeof busEmit === 'function' ? busEmit : () => {};
    this._workflows = _loadAll();
    this._log = []; // in-memory only, capped — real persistence is the workflow's own lastRun/runCount
    this._tickTimer = null;
  }

  start() {
    if (this._tickTimer) return;
    this._tickTimer = setInterval(() => this.tick(), TICK_MS);
    // §BUILT-FIX — unref() so this background poller never keeps the
    // process alive on its own (matches the expectation every other
    // real timer in this codebase already gets) — a test or a clean
    // shutdown that constructs an AgentMesh should exit normally, not
    // hang on this interval forever.
    if (typeof this._tickTimer.unref === 'function') this._tickTimer.unref();
  }
  stop() {
    if (this._tickTimer) { clearInterval(this._tickTimer); this._tickTimer = null; }
  }

  list() { return this._workflows.slice(); }
  get(id) { return this._workflows.find(w => w.id === id) || null; }

  _persist(wf) {
    try {
      fs.mkdirSync(WORKFLOWS_DIR, { recursive: true });
      fs.writeFileSync(path.join(WORKFLOWS_DIR, `${wf.id}.workflow.json`), JSON.stringify(wf, null, 2), 'utf8');
    } catch (e) {
      console.warn(`[automation-engine] failed to persist ${wf.id} (non-fatal): ${e.message}`);
    }
  }

  create({ name, status, steps }) {
    const wf = {
      id: randomUUID(), name: name || 'Untitled Workflow', status: status || 'draft',
      steps: Array.isArray(steps) ? steps : [], lastRun: null, runCount: 0, createdAt: Date.now(),
    };
    this._workflows.push(wf);
    this._persist(wf);
    this._busEmit('automation.workflow.created', { id: wf.id, name: wf.name });
    return { ok: true, workflow: wf };
  }

  update(id, patch) {
    const wf = this.get(id);
    if (!wf) return { ok: false, error: 'no such workflow' };
    if (patch.name !== undefined) wf.name = patch.name;
    if (patch.status !== undefined) wf.status = patch.status;
    if (patch.steps !== undefined) wf.steps = patch.steps;
    this._persist(wf);
    return { ok: true, workflow: wf };
  }

  remove(id) {
    const idx = this._workflows.findIndex(w => w.id === id);
    if (idx === -1) return { ok: false, error: 'no such workflow' };
    const [wf] = this._workflows.splice(idx, 1);
    try { fs.unlinkSync(path.join(WORKFLOWS_DIR, `${wf.id}.workflow.json`)); } catch (_) {}
    this._busEmit('automation.workflow.removed', { id: wf.id });
    return { ok: true };
  }

  getLog(limit = 50) { return this._log.slice(0, limit); }

  _logEntry(wf, msg, status) {
    this._log.unshift({ ts: Date.now(), workflowId: wf.id, workflowName: wf.name, msg, status });
    if (this._log.length > 200) this._log.pop();
    this._busEmit('automation.log', { workflowId: wf.id, msg, status, ts: Date.now() });
  }

  /** tick() — checks every active workflow's interval trigger. Manual runs bypass this entirely via run(). */
  tick() {
    const now = Date.now();
    for (const wf of this._workflows) {
      if (wf.status !== 'active') continue;
      const trigger = wf.steps.find(s => s.type === 'trigger');
      if (!trigger) continue;
      const intervalMs = parseInt(trigger.config?.intervalMs, 10);
      if (!intervalMs || intervalMs <= 0) continue; // manual-only trigger — tick() never fires it
      if (!wf._nextRun) wf._nextRun = now + intervalMs; // first arm, not persisted (recomputed each boot)
      if (now >= wf._nextRun) {
        wf._nextRun = now + intervalMs;
        this.run(wf.id, 'interval').catch(() => {});
      }
    }
  }

  /**
   * run(id, reason) — executes every step in order. 'agent' steps
   * dispatch through the real this._enqueue (the same mesh.enqueue the
   * drainer already owns) — this function does not wait for the agent's
   * response; a workflow that needs to react to it should be wired via
   * route-graph (Phase 2), not by this engine polling for completion.
   */
  async run(id, reason = 'manual') {
    const wf = this.get(id);
    if (!wf) return { ok: false, error: 'no such workflow' };
    wf.lastRun = Date.now();
    wf.runCount = (wf.runCount || 0) + 1;
    this._persist(wf);
    this._logEntry(wf, `▶ start (${reason})`, 'running');
    this._busEmit('automation.run.start', { id: wf.id, reason, ts: Date.now() });

    for (const step of wf.steps) {
      if (step.type === 'trigger') continue; // real trigger check already happened in tick()/run() caller
      try {
        await this._runStep(step, wf);
        this._logEntry(wf, `✓ ${step.type} step`, 'ok');
      } catch (e) {
        this._logEntry(wf, `✕ ${step.type} step: ${e.message}`, 'error');
        this._busEmit('automation.run.error', { id: wf.id, step: step.type, error: e.message, ts: Date.now() });
        return { ok: false, error: e.message };
      }
    }

    this._logEntry(wf, '✓ complete', 'ok');
    this._busEmit('automation.run.complete', { id: wf.id, ts: Date.now() });
    return { ok: true };
  }

  async _runStep(step, wf) {
    const cfg = step.config || {};
    if (step.type === 'agent') {
      if (!cfg.agentKey || !cfg.prompt) throw new Error('agent step requires agentKey and prompt');
      this._enqueue({ agentKey: cfg.agentKey, prompt: cfg.prompt });
      return;
    }
    if (step.type === 'delay') {
      const ms = Math.min(parseInt(cfg.ms, 10) || 1000, 300000); // capped at 5m, same cap as the uploaded reference's own delay step
      await new Promise(r => setTimeout(r, ms));
      return;
    }
    throw new Error(`unknown or not-yet-built step type: "${step.type}" (condition/branch/http/notification are real, named, not-yet-built extensions — see this file's own header)`);
  }
}

module.exports = { AutomationEngine, WORKFLOWS_DIR, TICK_MS };
