'use strict';
/**
 * living-glass/src/diagnostic-fire-engine.js
 * UUID: living-glass-fire-v1-0000-0000-000000000003
 *
 * THE FIRE ENGINE.
 *
 * When a gap opens or a system goes offline, this runs:
 *   1. All 12 diagnostic engines against current field state
 *   2. Causal trace from Bridge (root cause walk)
 *   3. Component sigma from field (which component is bleeding)
 *   4. Diagnostic contract created in JAA (tracked, tagged, queued)
 *   5. Heal loop engaged for auto-severity gaps
 *   6. All findings pushed to Living Glass SSE + ledger
 *
 * A "fire" is an active diagnostic contract with live diagnosis data attached.
 * Fires are what the co-pilot and human operators see and act on.
 *
 * Fire lifecycle:
 *   opened → diagnosing → diagnosed → dispatched → resolved | escalated | no_action
 *
 * Component registry hook:
 *   When a component registers, Living Glass records it as a node in the
 *   causal field. When it generates an error or gap, Living Glass can
 *   immediately identify which component it is, what its sigma is, and
 *   what caused it — because the component declaration is already in the field.
 */

const http  = require('http');
const path  = require('path');
const fs    = require('fs');
const { randomUUID } = require('crypto');

const DIAGNOSTIC_PORT = 7825;
const BRIDGE_PORT     = 9999;
const CORTEX_PORT     = 3748;
const GUARDIAN_PORT   = 7820;
const HEAL_PORT       = 9000; // heal loop is on orchestrator: POST /api/nexus/heal

// Severity thresholds for auto-dispatch
const AUTO_DISPATCH_SEVERITY = new Set(['low', 'medium']);
const ESCALATE_SEVERITY      = new Set(['high', 'critical']);

// Max concurrent fires before new gaps queue
const MAX_ACTIVE_FIRES = 10;

class DiagnosticFireEngine {
  constructor({ dataDir, field, ledger, onFire, onResolved }) {
    this._dataDir   = path.join(dataDir, 'fires');
    this._field     = field;
    this._ledger    = ledger;
    this._onFire    = onFire    || (() => {});
    this._onResolved= onResolved || (() => {});

    this._fires      = new Map(); // fireId → fire object
    this._queue      = [];         // gap queue when MAX_ACTIVE_FIRES reached
    this._diagEngines = null;      // lazy-loaded lib/diagnostic-engines.js
  }

  async start() {
    fs.mkdirSync(this._dataDir, { recursive: true });
    console.log('[LivingGlass/Fire] engine started');
  }

  // ── Called by FieldMonitor when a gap opens ─────────────────────────────
  async onGapOpen(gap) {
    if (this._fires.size >= MAX_ACTIVE_FIRES) {
      this._queue.push(gap);
      console.log(`[LivingGlass/Fire] queue: ${this._queue.length} gaps waiting (max fires reached)`);
      return;
    }
    await this._openFire(gap);
  }

  // ── Called by FieldMonitor when a system goes offline ─────────────────
  async onSystemOffline(systemName) {
    const gap = {
      id:          randomUUID(),
      type:        'system_offline',
      severity:    'high',
      system:      systemName,
      description: `System ${systemName} went offline`,
      ts:          Date.now(),
    };
    await this.onGapOpen(gap);
  }

  // ── Manual repair dispatch ─────────────────────────────────────────────
  async dispatchRepair(fireId, provider = 'claude') {
    const fire = this._fires.get(fireId);
    if (!fire) throw new Error(`fire not found: ${fireId}`);
    return this._dispatchRepair(fire, provider);
  }

  activeFires() {
    return [...this._fires.values()].filter(f =>
      f.status !== 'resolved' && f.status !== 'no_action'
    );
  }

  getFire(id) {
    return this._fires.get(id) || null;
  }

  // ── Core fire cycle ────────────────────────────────────────────────────
  async _openFire(gap) {
    const fireId = randomUUID();
    const fire = {
      id:        fireId,
      gapId:     gap.id || gap.uuid,
      gap,
      status:    'diagnosing',
      severity:  gap.severity || 'medium',
      system:    gap.system || gap.source || 'unknown',
      openedAt:  Date.now(),
      diagnosis: null,
      causalTrace: null,
      affectedComponents: [],
      repairSpec:  null,
      contractId:  null,
      resolvedAt:  null,
    };

    this._fires.set(fireId, fire);
    this._onFire(fire);
    this._ledger?.record({ type: 'living-glass.fire.opened', data: { fireId, gapId: fire.gapId, system: fire.system } });

    console.log(`[LivingGlass/Fire] 🔥 fire opened: ${fireId} — gap:${fire.gapId} system:${fire.system} sev:${fire.severity}`);

    // Run diagnosis async — don't block caller
    this._diagnose(fire).catch(e => {
      console.error(`[LivingGlass/Fire] diagnosis failed for ${fireId}:`, e.message);
      fire.status    = 'diagnosis_error';
      fire.diagError = e.message;
      this._ledger?.recordError(e, { file: 'living-glass/src/diagnostic-fire-engine.js', context: { fireId } });
    });
  }

  async _diagnose(fire) {
    // ── Step 1: Pull causal trace from Bridge ──────────────────────────
    if (fire.gap.causalEventId) {
      try {
        const trace = await _httpGet(BRIDGE_PORT, `/bridge/trace/${fire.gap.causalEventId}`, 4000);
        fire.causalTrace = trace;
        // Walk back to root cause
        const root = trace.ancestors?.[0] || trace.event;
        if (root) {
          fire.rootCause = {
            eventId:  root.uuid,
            action:   root.action || root.type,
            source:   root.source || root.system,
            ts:       root.ts,
          };
        }
      } catch (_) {}
    }

    // ── Step 2: Identify affected components from field ─────────────────
    const sysName = fire.system;
    const sysComponents = this._field?.allComponents({ system: sysName }) || [];
    fire.affectedComponents = sysComponents.map(c => ({
      id:    c.id,
      name:  c.name,
      sigma: c._sigma || this._field?.sigmaField()[c.id] || null,
    }));

    // High sigma = this component has been generating failures
    const bleedingComponents = fire.affectedComponents
      .filter(c => c.sigma > 0.6)
      .sort((a, b) => b.sigma - a.sigma);

    if (bleedingComponents.length) {
      fire.bleedingComponent = bleedingComponents[0];
    }

    // ── Step 3: Run 12-engine diagnostic suite ──────────────────────────
    const fieldSnapshot = this._field?.snapshot() || {};
    const events = this._ledger?.tail(200) || [];
    const systemStates = Object.fromEntries(
      (Object.keys(fieldSnapshot.systems || {})).map(s => [
        s, fieldSnapshot.systems[s] || {}
      ])
    );

    try {
      const engines = this._getEngines();
      if (engines) {
        const result = engines.runAllEngines({ events, systemStates });
        fire.diagnosis = {
          healthScore:  result.healthScore,
          alertCount:   result.alertCount,
          alerts:       result.alerts || [],
          engines:      result.engines || {},
          regime:       _worstRegime(result.engines),
        };

        // Extract the most actionable recommendation
        const topAlert = (result.alerts || []).sort((a, b) => (b.score || 0) - (a.score || 0))[0];
        if (topAlert) fire.topAlert = topAlert;
      }
    } catch (e) {
      fire.diagEngineError = e.message;
    }

    // ── Step 4: Pull diagnostic service gaps for context ────────────────
    try {
      const diagData = await _httpGet(DIAGNOSTIC_PORT, `/gaps`, 3000);
      const diagGaps = (diagData.gaps || []).filter(g =>
        g.system === fire.system || g.system === sysName
      );
      fire.relatedGaps = diagGaps.slice(0, 10);
    } catch (_) {}

    // ── Step 5: Pull CFR sigma for this system from Cortex ──────────────
    try {
      const cfrData = await _httpGet(CORTEX_PORT, `/cfr/state`, 3000);
      const sysField = cfrData?.fields?.[sysName];
      if (sysField) {
        fire.sigmaField = sysField;
        fire.sigma = sysField.sigma;
      }
    } catch (_) {}

    // ── Step 6: Create diagnostic contract in JAA ───────────────────────
    fire.contractId = await this._createContract(fire);

    // Mark diagnosed
    fire.status      = 'diagnosed';
    fire.diagnosedAt = Date.now();

    this._ledger?.record({ type: 'living-glass.fire.diagnosed', data: {
      fireId: fire.id, gapId: fire.gapId, healthScore: fire.diagnosis?.healthScore,
      regime: fire.diagnosis?.regime, sigma: fire.sigma,
      bleedingComponent: fire.bleedingComponent?.id || null,
    }});

    console.log(`[LivingGlass/Fire] ✓ diagnosed: ${fire.id} — score:${fire.diagnosis?.healthScore?.toFixed(2)} regime:${fire.diagnosis?.regime}`);

    // ── Step 7: Auto-dispatch if severity allows ─────────────────────────
    if (AUTO_DISPATCH_SEVERITY.has(fire.severity)) {
      await this._dispatchRepair(fire, 'claude');
    } else if (ESCALATE_SEVERITY.has(fire.severity)) {
      fire.status = 'escalated';
      this._ledger?.record({ type: 'living-glass.fire.escalated', data: { fireId: fire.id, severity: fire.severity } });
      console.log(`[LivingGlass/Fire] ↑ escalated: ${fire.id} severity=${fire.severity} — human required`);
    }

    // Drain queue if space available
    if (this._queue.length && this._fires.size < MAX_ACTIVE_FIRES) {
      const next = this._queue.shift();
      this._openFire(next).catch(() => {});
    }
  }

  async _createContract(fire) {
    // Create diagnostic contract via Cortex JAA (same as lib/diagnostic-contract.js)
    try {
      const contract = {
        uuid:        randomUUID(),
        gapUuid:     fire.gapId || null,
        gapType:     fire.gap?.type || 'living_glass_fire',
        system:      fire.system,
        tags:        ['living-glass', fire.system, fire.severity].filter(Boolean),
        status:      'queued',
        detail:      `Fire ${fire.id}: ${fire.gap?.description || fire.gap?.type || 'unknown gap'}`,
        fireId:      fire.id,
        bleedingComponent: fire.bleedingComponent?.id || null,
        rootCause:   fire.rootCause || null,
        createdAt:   Date.now(),
        updatedAt:   Date.now(),
      };

      // Write to Cortex JAA via its event endpoint
      await _httpPost(CORTEX_PORT, '/api/event', {
        type:    'living-glass.contract.queued',
        payload: contract,
        source:  'living-glass',
        ts:      Date.now(),
      });

      return contract.uuid;
    } catch (_) {
      return null;
    }
  }

  async _dispatchRepair(fire, provider = 'claude') {
    const repairSpec = _buildRepairSpec(fire);
    fire.repairSpec  = repairSpec;
    fire.status      = 'dispatched';
    fire.dispatchedAt = Date.now();

    this._ledger?.record({ type: 'living-glass.fire.dispatched', data: {
      fireId: fire.id, provider, repairSpec: repairSpec.name
    }});

    try {
      // Route through orchestrator heal loop
      const result = await _httpPost(HEAL_PORT, '/api/nexus/heal', {
        gap:        fire.gap,
        repairSpec,
        provider,
        fireId:     fire.id,
        contractId: fire.contractId,
        source:     'living-glass',
      });

      if (result?.ok) {
        fire.status     = 'resolved';
        fire.resolvedAt = Date.now();
        this._onResolved(fire);
        this._ledger?.record({ type: 'living-glass.fire.resolved', data: { fireId: fire.id } });
        console.log(`[LivingGlass/Fire] ✓ resolved: ${fire.id}`);
      } else {
        fire.status      = 'no_action';
        fire.noActionReason = result?.error || 'heal loop returned not ok';
      }
      return result;
    } catch (e) {
      fire.status      = 'dispatch_error';
      fire.dispatchError = e.message;
      this._ledger?.recordError(e, {
        file: 'living-glass/src/diagnostic-fire-engine.js',
        context: { fireId: fire.id, action: '_dispatchRepair' }
      });
      throw e;
    }
  }

  _getEngines() {
    if (this._diagEngines !== null) return this._diagEngines;
    try {
      this._diagEngines = require('../../lib/diagnostic-engines');
    } catch (_) {
      this._diagEngines = false;
    }
    return this._diagEngines || null;
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function _worstRegime(engines) {
  if (!engines) return 'unknown';
  const regimes = Object.values(engines).map(e => e.regime).filter(Boolean);
  if (regimes.includes('critical')) return 'critical';
  if (regimes.includes('degraded')) return 'degraded';
  if (regimes.includes('warning'))  return 'warning';
  return regimes[0] || 'unknown';
}

function _buildRepairSpec(fire) {
  const gap  = fire.gap || {};
  const comp = fire.bleedingComponent;
  return {
    name:    `living-glass auto-repair: ${gap.type || 'gap'} in ${fire.system}`,
    intent:  gap.description || gap.type || `system ${fire.system} gap`,
    system:  fire.system,
    fireId:  fire.id,
    gapId:   fire.gapId,
    gaps:    [{ id: gap.id, description: gap.description, severity: gap.severity }],
    component: comp ? { id: comp.id, sigma: comp.sigma } : null,
    rootCause: fire.rootCause || null,
    diagnosis: fire.diagnosis ? {
      healthScore: fire.diagnosis.healthScore,
      regime:      fire.diagnosis.regime,
      topAlert:    fire.topAlert?.description || null,
    } : null,
    action:  _repairAction(gap),
  };
}

function _repairAction(gap) {
  const t = gap.type || '';
  if (t === 'missing_file')      return `scaffold ${gap.path || gap.file || 'missing file'}`;
  if (t === 'import_error')      return `fix require path in ${gap.path || 'module'}`;
  if (t === 'stale_module')      return `update module signature in ${gap.path || 'module'}`;
  if (t === 'stuck_call')        return `add timeout + retry to ${gap.path || 'call site'}`;
  if (t === 'recurring_failure') return `add error handling in ${gap.path || 'component'}`;
  if (t === 'system_offline')    return `restart ${gap.system || 'system'} or diagnose boot failure`;
  return `review and fix ${gap.path || gap.description || gap.type || 'unknown gap'}`;
}

function _httpGet(port, path, timeout = 3000) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1', port, path, method: 'GET',
      headers: { Connection: 'keep-alive' },
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve({}); } });
    });
    req.setTimeout(timeout, () => { req.destroy(); reject(new Error(`timeout: ${port}${path}`)); });
    req.on('error', reject);
    req.end();
  });
}

function _httpPost(port, path, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = http.request({
      hostname: '127.0.0.1', port, path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload), Connection: 'keep-alive' },
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve({}); } });
    });
    req.setTimeout(8000, () => { req.destroy(); reject(new Error(`timeout: ${port}${path}`)); });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

module.exports = { DiagnosticFireEngine };
