/**
 * foundation/axioms.js
 * COMPARTMENT OS — Enforced Axioms
 * IMMUTABLE after v1.0.0 (COS-5)
 *
 * Author: James Brooks (Erosmancer)
 * Status: pre-release
 *
 * Axioms are not guidelines. Violation throws a CosAxiomError.
 * Every axiom has: id, description, enforce(ctx) function.
 * enforce() throws if violated, returns void if satisfied.
 */

'use strict';

// ─── CosAxiomError ────────────────────────────────────────────────────────────

class CosAxiomError extends Error {
  constructor(axiomId, message, context = {}) {
    super(`[${axiomId}] ${message}`);
    this.name       = 'CosAxiomError';
    this.axiomId    = axiomId;
    this.context    = context;
  }
}

// ─── Axiom Registry ───────────────────────────────────────────────────────────

const AXIOMS = Object.freeze([

  {
    id:          'COS-1',
    description: 'Nothing exists until proven — no stubs, no silently failing code.',
    addedIn:     '1.0.0',
    category:    'architecture',
    // Enforced at schema validation time: COS-1 is checked by schema-engine,
    // not as a runtime guard here. The axiom is declared for documentation
    // and system map inclusion.
    enforce: (_ctx) => { /* structural axiom — enforced by schema-engine */ },
  },

  {
    id:          'COS-2',
    description: 'CLI first — if it can\'t be done in CLI it doesn\'t exist yet.',
    addedIn:     '1.0.0',
    category:    'architecture',
    enforce: (_ctx) => { /* architectural axiom — enforced by build order */ },
  },

  {
    id:          'COS-3',
    description: 'Every hook has UUID + contract + version.',
    addedIn:     '1.0.0',
    category:    'architecture',
    /**
     * @param {{ hook: object }} ctx
     */
    enforce: (ctx) => {
      const { hook } = ctx;
      if (!hook) throw new CosAxiomError('COS-3', 'hook is required', ctx);
      if (!hook.id)               throw new CosAxiomError('COS-3', 'hook.id (UUID) is required', { hook });
      if (!hook.version)          throw new CosAxiomError('COS-3', 'hook.version is required',   { hook });
      if (!hook.contract)         throw new CosAxiomError('COS-3', 'hook.contract is required',  { hook });
      if (!hook.bindings?.event)  throw new CosAxiomError('COS-3', 'hook.bindings.event is required', { hook });
    },
  },

  {
    id:          'COS-4',
    description: 'Compartments never share memory — events only.',
    addedIn:     '1.0.0',
    category:    'architecture',
    /**
     * @param {{ sourceId: string, targetId: string, method: string }} ctx
     */
    enforce: (ctx) => {
      const { method } = ctx;
      if (method === 'direct-import' || method === 'shared-memory') {
        throw new CosAxiomError('COS-4',
          `Cross-compartment communication via '${method}' is forbidden. Use events or pipes.`,
          ctx
        );
      }
    },
  },

  {
    id:          'COS-5',
    description: 'Foundation never changes after v1.0.0.',
    addedIn:     '1.0.0',
    category:    'architecture',
    enforce: (_ctx) => { /* build-time axiom — enforced by version check */ },
  },

  {
    id:          'COS-6',
    description: 'UI is disposable — schema survives any UI swap.',
    addedIn:     '1.0.0',
    category:    'architecture',
    enforce: (_ctx) => { /* architectural axiom */ },
  },

  {
    id:          'COS-7',
    description: 'System map is always current — update on every mutation.',
    addedIn:     '1.0.0',
    category:    'data',
    /**
     * @param {{ mapUpdated: boolean }} ctx
     */
    enforce: (ctx) => {
      if (ctx.mapUpdated === false) {
        throw new CosAxiomError('COS-7',
          'A mutation occurred without updating the system map.',
          ctx
        );
      }
    },
  },

  {
    id:          'COS-8',
    description: 'Auto-detect before prompting — ask only what can\'t be inferred.',
    addedIn:     '1.0.0',
    category:    'architecture',
    enforce: (_ctx) => { /* behavioral axiom — enforced by auto-detect module */ },
  },

  {
    id:          'COS-9',
    description: 'Every variable is declared in the system map.',
    addedIn:     '1.0.0',
    category:    'data',
    enforce: (_ctx) => { /* enforced by schema-engine variable registry */ },
  },

  {
    id:          'COS-10',
    description: 'All inter-compartment communication via host event bus.',
    addedIn:     '1.0.0',
    category:    'architecture',
    /**
     * @param {{ method: string }} ctx
     */
    enforce: (ctx) => {
      const ALLOWED = ['event-bus', 'pipe', 'api'];
      if (!ALLOWED.includes(ctx.method)) {
        throw new CosAxiomError('COS-10',
          `Inter-compartment communication via '${ctx.method}' is not allowed.`,
          ctx
        );
      }
    },
  },

  {
    id:          'COS-11',
    description: 'Network isolation is default-on — opt-in to open.',
    addedIn:     '1.0.0',
    category:    'network',
    /**
     * @param {{ networkConfig: object }} ctx
     */
    enforce: (ctx) => {
      const { networkConfig } = ctx;
      // isolated must be explicitly set to false to allow open network
      // if networkConfig is missing, isolation must be assumed (pass)
      if (networkConfig && networkConfig.isolated === undefined) {
        throw new CosAxiomError('COS-11',
          'NetworkConfig.isolated must be explicitly set.',
          ctx
        );
      }
    },
  },

  {
    id:          'COS-12',
    description: 'Drag-drop is a first-class input — not a UI feature.',
    addedIn:     '1.0.0',
    category:    'architecture',
    enforce: (_ctx) => { /* UI/API contract axiom */ },
  },

  {
    id:          'COS-13',
    description: 'Host service is the authority — UI is a client, never the host.',
    addedIn:     '1.0.0',
    category:    'architecture',
    enforce: (_ctx) => { /* architectural axiom */ },
  },

  {
    id:          'COS-14',
    description: 'Compartment-to-compartment communication via API only — no shared memory, no direct event bus cross-wiring.',
    addedIn:     '1.0.0',
    category:    'architecture',
    /**
     * @param {{ method: string, isCrossCompartment: boolean }} ctx
     */
    enforce: (ctx) => {
      if (ctx.isCrossCompartment && ctx.method !== 'api') {
        throw new CosAxiomError('COS-14',
          `Cross-compartment messages must use the API. Got: '${ctx.method}'`,
          ctx
        );
      }
    },
  },

  {
    id:          'COS-15',
    description: 'All pipe traffic is logged to the master kernel (audit by default).',
    addedIn:     '1.0.0',
    category:    'data',
    /**
     * @param {{ pipe: object }} ctx
     */
    enforce: (ctx) => {
      const { pipe } = ctx;
      if (pipe && pipe.eventLog === false) {
        throw new CosAxiomError('COS-15',
          'Pipe eventLog cannot be disabled. All pipe traffic must be audited.',
          ctx
        );
      }
    },
  },

  {
    id:          'COS-16',
    description: 'OS metrics are kernel events — not a separate monitoring system.',
    addedIn:     '1.0.0',
    category:    'architecture',
    enforce: (_ctx) => { /* architectural axiom */ },
  },

  {
    id:          'COS-17',
    description: 'Service config is the single source of truth for all paths and ports.',
    addedIn:     '1.0.0',
    category:    'architecture',
    enforce: (_ctx) => { /* architectural axiom */ },
  },

  // ── COS-18 – COS-38 ──────────────────────────────────────────────────────
  // GAP — not fabricated. Version history (docs/cos.spec, spec §74/§80)
  // confirms v1.1.0–v1.5.0 added axioms through COS-38 ("COS-30–38" landed
  // in v1.5.0 alone), but no document available to this build contains their
  // statements. Searched the full repo for "COS-18" through "COS-38" —
  // zero hits outside this comment. Do not fill this range with invented
  // text. If the v1.1–v1.5 spec sections exist somewhere, paste them in and
  // this gap closes; until then COS-18–38 are referenced by number only and
  // unenforceable.

  {
    id:          'COS-39',
    description: 'Plugin manifests are validated against the JSON Schema before any code runs.',
    addedIn:     '1.6.0',
    category:    'plugin',
    enforce: (_ctx) => { /* enforced by plugin-manager/validator.js, not yet built */ },
  },

  {
    id:          'COS-40',
    description: 'Plugin sandbox compartments are first-class compartments — they appear in the system map.',
    addedIn:     '1.6.0',
    category:    'plugin',
    enforce: (_ctx) => { /* architectural axiom — plugin manager not yet built */ },
  },

  {
    id:          'COS-41',
    description: 'TPM binding is irreversible on a machine — document clearly, no silent migration.',
    addedIn:     '1.6.0',
    category:    'security',
    enforce: (_ctx) => { /* documentary axiom — TPM integration not yet built */ },
  },

  {
    id:          'COS-42',
    description: 'vaultd state is visible in SystemMap whether running or not (VaultdState = null if not running).',
    addedIn:     '1.6.0',
    category:    'data',
    /**
     * @param {{ systemMap: object }} ctx
     */
    enforce: (ctx) => {
      const { systemMap } = ctx;
      if (systemMap && !('vaultdState' in systemMap)) {
        throw new CosAxiomError('COS-42',
          'SystemMap.vaultdState must be present (null if vaultd is not running).',
          ctx
        );
      }
    },
  },

  {
    id:          'COS-43',
    description: 'Playground compartments cannot communicate with production compartments — ever.',
    addedIn:     '1.6.0',
    category:    'safety',
    /**
     * @param {{ sourcePlaygroundId: string|null, targetPlaygroundId: string|null }} ctx
     */
    enforce: (ctx) => {
      const { sourcePlaygroundId, targetPlaygroundId } = ctx;
      if (sourcePlaygroundId !== undefined && targetPlaygroundId !== undefined &&
          sourcePlaygroundId !== targetPlaygroundId) {
        throw new CosAxiomError('COS-43',
          'A playground compartment cannot communicate with a compartment outside its own playground.',
          ctx
        );
      }
    },
  },

  {
    id:          'COS-44',
    description: 'Torture Chamber always runs in a Playground by default — --no-playground requires explicit confirmation.',
    addedIn:     '1.6.0',
    category:    'testing',
    /**
     * @param {{ runInPlayground: boolean, confirmed: boolean }} ctx
     */
    enforce: (ctx) => {
      if (ctx.runInPlayground === false && ctx.confirmed !== true) {
        throw new CosAxiomError('COS-44',
          'Running a Torture Chamber plan outside a Playground requires explicit confirmation.',
          ctx
        );
      }
    },
  },

  {
    id:          'COS-45',
    description: 'TortureResult is a first-class object — stored in master nexus, visible in system map.',
    addedIn:     '1.6.0',
    category:    'testing',
    enforce: (_ctx) => { /* architectural axiom — torture chamber not yet built */ },
  },

  {
    id:          'COS-46',
    description: 'The folder watcher is part of the host service, not the UI — plugins install even when UI is closed.',
    addedIn:     '1.6.0',
    category:    'plugin',
    enforce: (_ctx) => { /* architectural axiom — plugin watchdog not yet built */ },
  },

  {
    id:          'COS-47',
    description: 'All JSON Schemas in this spec are published at cos.dev/schemas/ — external validators can use them.',
    addedIn:     '1.6.0',
    category:    'architecture',
    enforce: (_ctx) => { /* documentary axiom */ },
  },

  {
    id:          'COS-48',
    description: 'SystemMap is always a valid snapshot of reality — if a subsystem is absent, its field is empty array or null, never omitted.',
    addedIn:     '1.6.0',
    category:    'data',
    /**
     * @param {{ systemMap: object, requiredFields: string[] }} ctx
     */
    enforce: (ctx) => {
      const { systemMap, requiredFields } = ctx;
      if (!systemMap || !Array.isArray(requiredFields)) return;
      for (const field of requiredFields) {
        if (!(field in systemMap)) {
          throw new CosAxiomError('COS-48',
            `SystemMap is missing required field '${field}' — must be empty array/null, never omitted.`,
            ctx
          );
        }
      }
    },
  },

  {
    id:          'COS-49',
    description: 'Archetype and Blueprint JSON files are first-class importable objects — no plugin required.',
    addedIn:     '1.7.0',
    category:    'architecture',
    enforce: (_ctx) => { /* enforced by archetype/blueprint import commands */ },
  },

  {
    id:          'COS-50',
    description: 'The Plugin Host API is the ONLY channel between plugin code and the COS host — no side-door IPC.',
    addedIn:     '1.7.0',
    category:    'plugin',
    enforce: (_ctx) => { /* architectural axiom — plugin manager not yet built */ },
  },

  {
    id:          'COS-51',
    description: 'All 126 named hooks are registered at startup — plugins may add hooks but may not replace built-in hooks.',
    addedIn:     '1.7.0',
    category:    'architecture',
    /**
     * @param {{ hookId: string, isBuiltIn: boolean, isReplace: boolean }} ctx
     */
    enforce: (ctx) => {
      if (ctx.isBuiltIn && ctx.isReplace) {
        throw new CosAxiomError('COS-51',
          `Built-in hook '${ctx.hookId}' cannot be replaced by a plugin.`,
          ctx
        );
      }
    },
  },

  {
    id:          'COS-52',
    description: 'SnapshotFull is on-disk only — SystemMap carries only SnapshotIndexEntry (lightweight).',
    addedIn:     '1.7.0',
    category:    'data',
    enforce: (_ctx) => { /* architectural axiom */ },
  },

  {
    id:          'COS-53',
    description: 'Webhooks are first-class objects — registered, stored, and visible in SystemMap.',
    addedIn:     '1.7.0',
    category:    'architecture',
    enforce: (_ctx) => { /* architectural axiom — webhook registry not yet built */ },
  },

  {
    id:          'COS-54',
    description: 'The Plugin Authoring Guide (§77) is part of the spec — it ships in the COS help system.',
    addedIn:     '1.7.0',
    category:    'plugin',
    enforce: (_ctx) => { /* documentary axiom */ },
  },

]);

// ─── Axiom Lookup ─────────────────────────────────────────────────────────────

/** @type {Map<string, object>} */
const AXIOM_MAP = new Map(AXIOMS.map(a => [a.id, a]));

/**
 * Enforce a specific axiom by ID.
 * Throws CosAxiomError if violated.
 * @param {string} axiomId  e.g. 'COS-3'
 * @param {object} ctx      context data for the axiom's enforce() function
 */
function enforce(axiomId, ctx = {}) {
  const axiom = AXIOM_MAP.get(axiomId);
  if (!axiom) {
    throw new CosAxiomError(axiomId, `Unknown axiom: '${axiomId}'`, ctx);
  }
  axiom.enforce(ctx);
}

/**
 * Returns axiom definitions as plain objects for system map inclusion.
 * Shape matches spec §75.3 (Axiom type): id, statement, addedIn, category —
 * plus the original `description` field (= statement) kept for backward
 * compatibility with existing callers.
 * @returns {Array<{ id: string, description: string, statement: string, addedIn: string, category: string }>}
 */
function getAxiomDefs() {
  return AXIOMS.map(({ id, description, addedIn, category }) => ({
    id,
    description,
    statement: description,
    addedIn:   addedIn ?? null,
    category:  category ?? null,
  }));
}

module.exports = {
  CosAxiomError,
  AXIOMS,
  AXIOM_MAP,
  enforce,
  getAxiomDefs,
};
