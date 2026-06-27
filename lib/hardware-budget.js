'use strict';
// ── lib/hardware-budget.js ──────────────────────────────────────────────────
// UUID: nexus-hardware-budget-v1-0000-2026-0627-jamesbrooks-001
// Version: 1.0.0
//
// THE GAP THIS CLOSES: ollama-runtime.js's bestFor() picked the
// highest-fitness model for a task with zero awareness of whether the
// machine could actually run it. fitness scores reward bigger models —
// deepseek-coder-v2:16b (14GB) scores highest of all seven catalog entries.
// On a real, confirmed 16GB-RAM machine (Ryzen 7 3700x, no discrete GPU,
// 5GB free SSD) already running 10+ NEXUS Node processes plus browser tabs
// before a model even loads, that's not a slow answer — it's very likely a
// freeze or an OOM kill. bestFor() itself has no callers yet (checked,
// not assumed) but it's clearly the designated selection path for whenever
// real automatic dispatch gets wired to it — fixing it now, not after.
//
// Implements BrainOS's formal hardware-constraint model directly:
//   Memory(M) ≤ RAM_available × λ,  λ ∈ (0.6, 0.85)
// using λ=0.6 (the conservative end) as the default, because the actual
// measured situation here is already tight before any model loads.
//
// §1.2 — nothing silently fails: if nothing in the catalog fits, this
// returns null with a real reason, never a dangerous fallback.

const os = require('os');
const fs = require('fs');

const MODULE_ID = 'hardware-budget';
const VERSION   = '1.0.0';

const DEFAULT_LAMBDA       = 0.6;   // conservative end of BrainOS's (0.6, 0.85)
const MIN_DISK_HEADROOM_GB = 2;     // kept free regardless of model size — below
                                     // this, Windows itself degrades, separate
                                     // from any LLM concern

function availableRAMGB() { return os.freemem() / 1e9; }
function totalRAMGB()     { return os.totalmem() / 1e9; }

// safeModelBudgetGB(λ) — how much memory is safe to commit to a model right
// now, given everything else already running. Re-measured every call —
// RAM availability is the whole point, a stale number defeats the purpose.
function safeModelBudgetGB(lambda = DEFAULT_LAMBDA) {
  return availableRAMGB() * lambda;
}

function availableDiskGB(path = process.cwd()) {
  try {
    const s = fs.statfsSync(path);
    return (s.bsize * s.bavail) / 1e9;
  } catch (e) {
    return null; // unknown — caller decides how to handle, never assume "fine"
  }
}

/**
 * pickSafeModel(catalog, task, opts) — same intent as ollama-runtime.js's
 * bestFor(task), except candidates are filtered by real available RAM
 * BEFORE sorting by fitness. Never returns something the machine can't
 * actually run; returns a real reason instead of guessing.
 *
 * @param {Array}  catalog - same shape as ollama-runtime.js's MODEL_CATALOG
 * @param {string} task
 * @param {object} opts    - { lambda }
 * @returns {{ model: object|null, reason: string|null, budget: number, freeRAM: number }}
 */
function pickSafeModel(catalog, task, opts = {}) {
  const lambda = opts.lambda ?? DEFAULT_LAMBDA;
  const budget = safeModelBudgetGB(lambda);
  const freeRAM = availableRAMGB();
  const candidates = catalog.filter(m => m.best.some(b => b.includes(task)));
  const safe = candidates.filter(m => m.vram <= budget);

  if (safe.length === 0) {
    return {
      model: null,
      reason: `no model for task "${task}" fits within the ${budget.toFixed(1)}GB safe budget `
             + `(${freeRAM.toFixed(1)}GB free × λ=${lambda}) — smallest candidate needs `
             + `${Math.min(...candidates.map(m => m.vram), Infinity).toFixed(1)}GB`,
      budget, freeRAM,
    };
  }
  const chosen = safe.sort((a, b) => b.fitness - a.fitness)[0];
  return { model: chosen, reason: null, budget, freeRAM };
}

/**
 * canPullModel(estimatedSizeGB, path) — disk-space guard before any model
 * download. Requires the model's own size PLUS a fixed headroom buffer,
 * not just "more than zero bytes free."
 */
function canPullModel(estimatedSizeGB, path = process.cwd()) {
  const free = availableDiskGB(path);
  if (free === null) return { ok: false, reason: 'could not determine free disk space — refusing rather than assuming it is fine', free: null, required: null };
  const required = estimatedSizeGB + MIN_DISK_HEADROOM_GB;
  if (free < required) {
    return { ok: false, reason: `need ${required.toFixed(1)}GB (${estimatedSizeGB}GB model + ${MIN_DISK_HEADROOM_GB}GB headroom kept free), only ${free.toFixed(1)}GB available`, free, required };
  }
  return { ok: true, reason: null, free, required };
}

module.exports = {
  MODULE_ID, VERSION, DEFAULT_LAMBDA, MIN_DISK_HEADROOM_GB,
  availableRAMGB, totalRAMGB, safeModelBudgetGB, availableDiskGB,
  pickSafeModel, canPullModel,
};
