/**
 * host/system-map.js
 * COMPARTMENT OS — Live System Map
 *
 * Author: James Brooks (Erosmancer)
 * Status: pre-release
 *
 * The system map is always current (COS-7).
 * Updated on every mutation — not batched, not deferred.
 * Persisted to system-map.json after every update.
 * Readable at any time via get() → deep clone.
 *
 * Spec §10: Every variable in the system is listed here.
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { makeSystemMap }                  = require('../foundation/types.js');
const { getAxiomDefs }                   = require('../foundation/axioms.js');
const { RUNTIMES }                       = require('../foundation/runtime-enum.js');
const { COMPILERS }                      = require('../foundation/compiler-enum.js');
const { ARCHETYPES }                     = require('../archetype/registry.js');
const { BLUEPRINTS }                     = require('../blueprint/registry.js');
const { builtInPluginRecords }           = require('../plugin/index.js');
const { COS_MAP_FILE, COS_STATE_DIR, COS_VERSION } = require('../foundation/constants.js');

// ─── SystemMap ────────────────────────────────────────────────────────────────

class SystemMap {
  /**
   * @param {{ mapFile?: string, eventBus?: object }} opts
   */
  constructor({ mapFile = COS_MAP_FILE, eventBus = null } = {}) {
    this._file     = mapFile;
    this._bus      = eventBus;
    this._map      = makeSystemMap({
      version:   COS_VERSION,
      axioms:    getAxiomDefs(),
      runtimes:  RUNTIMES.map(({ id, displayName, minVersion }) => ({ id, displayName, minVersion })),
      compilers: COMPILERS.map(({ id, displayName, configFile }) => ({ id, displayName, configFile })),
      archetypes: [...ARCHETYPES],
      blueprintDefs: [...BLUEPRINTS],
      plugins: builtInPluginRecords(),
    });
    this._loaded   = false;
  }

  // ── Bootstrap ──────────────────────────────────────────────────────────────

  /**
   * Load from disk if file exists, otherwise write empty map.
   * Must be called once before mutations.
   */
  load() {
    const dir = path.dirname(this._file);
    fs.mkdirSync(dir, { recursive: true });

    if (fs.existsSync(this._file)) {
      try {
        const raw = fs.readFileSync(this._file, 'utf8');
        const parsed = JSON.parse(raw);
        // Merge persisted compartments/hooks/pipes into the live map.
        // Runtimes, compilers, axioms are always regenerated from foundation.
        // Archetypes: built-ins are always regenerated fresh; any persisted
        // archetype with builtIn:false (imported via §77) is merged back in.
        const persistedCustomArchetypes = (parsed.archetypes || []).filter(a => a && a.builtIn === false);
        const persistedCustomBlueprints = (parsed.blueprintDefs || []).filter(b => b && b.builtIn === false);
        const persistedCustomPlugins    = (parsed.plugins || []).filter(p => p && p.builtIn === false);
        this._map = makeSystemMap({
          ...this._map,
          compartments: parsed.compartments || [],
          hooks:        parsed.hooks        || [],
          pipes:        parsed.pipes        || [],
          files:        parsed.files        || [],
          variables:    parsed.variables    || [],
          archetypes:   [...ARCHETYPES, ...persistedCustomArchetypes],
          blueprintDefs: [...BLUEPRINTS, ...persistedCustomBlueprints],
          blueprintInstances: parsed.blueprintInstances || [],
          plugins: [...builtInPluginRecords(), ...persistedCustomPlugins],
          playgrounds: parsed.playgrounds || [],
          vaultKeys: parsed.vaultKeys || [],
        });
      } catch (_) {
        // Corrupted map file — regenerate from foundation defaults
      }
    }

    this._loaded = true;
    this._persist();
    return this;
  }

  // ── Read ──────────────────────────────────────────────────────────────────

  /**
   * Return a deep clone of the current system map.
   * @returns {object}
   */
  get() {
    return JSON.parse(JSON.stringify({ ...this._map, generatedAt: Date.now() }));
  }

  // ── Compartments ──────────────────────────────────────────────────────────

  /** @param {object} compartment */
  upsertCompartment(compartment) {
    const idx = this._map.compartments.findIndex(c => c.id === compartment.id);
    const clone = JSON.parse(JSON.stringify(compartment));
    if (idx >= 0) {
      this._map.compartments[idx] = clone;
    } else {
      this._map.compartments.push(clone);
    }
    this._touch();
  }

  /** @param {string} id */
  removeCompartment(id) {
    this._map.compartments = this._map.compartments.filter(c => c.id !== id);
    this._touch();
  }

  // ── Hooks ─────────────────────────────────────────────────────────────────

  /** @param {object} hook */
  upsertHook(hook) {
    const idx = this._map.hooks.findIndex(h => h.id === hook.id);
    const clone = JSON.parse(JSON.stringify(hook));
    if (idx >= 0) {
      this._map.hooks[idx] = clone;
    } else {
      this._map.hooks.push(clone);
    }
    this._touch();
  }

  /** @param {string} id */
  removeHook(id) {
    this._map.hooks = this._map.hooks.filter(h => h.id !== id);
    this._touch();
  }

  // ── Pipes ─────────────────────────────────────────────────────────────────

  /** @param {object} pipe */
  upsertPipe(pipe) {
    const idx = this._map.pipes.findIndex(p => p.id === pipe.id);
    const clone = JSON.parse(JSON.stringify(pipe));
    if (idx >= 0) {
      this._map.pipes[idx] = clone;
    } else {
      this._map.pipes.push(clone);
    }
    this._touch();
  }

  /** @param {string} id */
  removePipe(id) {
    this._map.pipes = this._map.pipes.filter(p => p.id !== id);
    this._touch();
  }

  // ── Archetypes (Phase 21) ─────────────────────────────────────────────────

  /**
   * Add or update a CUSTOM (non-built-in) archetype. Built-ins are always
   * regenerated fresh from foundation/../archetype/registry.js — they are
   * never mutated here, mirroring how runtimes/compilers/axioms work.
   * @param {object} archetype
   */
  upsertArchetype(archetype) {
    if (archetype.builtIn) {
      throw new Error(`Cannot upsert built-in archetype '${archetype.name}' — built-ins are foundation-managed.`);
    }
    const builtInCollision = this._map.archetypes.find(a => a.id === archetype.id && a.builtIn === true);
    if (builtInCollision) {
      throw new Error(`Archetype id '${archetype.id}' collides with built-in '${builtInCollision.name}' — custom archetypes must mint their own id.`);
    }
    const idx = this._map.archetypes.findIndex(a => a.id === archetype.id);
    const clone = JSON.parse(JSON.stringify(archetype));
    if (idx >= 0) {
      this._map.archetypes[idx] = clone;
    } else {
      this._map.archetypes.push(clone);
    }
    this._touch();
  }

  /** @param {string} id */
  removeArchetype(id) {
    const target = this._map.archetypes.find(a => a.id === id);
    if (target && target.builtIn) {
      throw new Error(`Cannot remove built-in archetype '${target.name}'.`);
    }
    this._map.archetypes = this._map.archetypes.filter(a => a.id !== id);
    this._touch();
  }

  // ── Blueprints (Phase 22) ─────────────────────────────────────────────────

  /**
   * Add or update a CUSTOM (non-built-in) blueprint definition. Same
   * built-in protection as upsertArchetype.
   * @param {object} blueprint
   */
  upsertBlueprintDef(blueprint) {
    if (blueprint.builtIn) {
      throw new Error(`Cannot upsert built-in blueprint '${blueprint.name}' — built-ins are foundation-managed.`);
    }
    const builtInCollision = this._map.blueprintDefs.find(b => b.id === blueprint.id && b.builtIn === true);
    if (builtInCollision) {
      throw new Error(`Blueprint id '${blueprint.id}' collides with built-in '${builtInCollision.name}' — custom blueprints must mint their own id.`);
    }
    const idx = this._map.blueprintDefs.findIndex(b => b.id === blueprint.id);
    const clone = JSON.parse(JSON.stringify(blueprint));
    if (idx >= 0) {
      this._map.blueprintDefs[idx] = clone;
    } else {
      this._map.blueprintDefs.push(clone);
    }
    this._touch();
  }

  /** @param {string} id */
  removeBlueprintDef(id) {
    const target = this._map.blueprintDefs.find(b => b.id === id);
    if (target && target.builtIn) {
      throw new Error(`Cannot remove built-in blueprint '${target.name}'.`);
    }
    this._map.blueprintDefs = this._map.blueprintDefs.filter(b => b.id !== id);
    this._touch();
  }

  /** @param {object} instance  BlueprintInstance */
  upsertBlueprintInstance(instance) {
    const idx = this._map.blueprintInstances.findIndex(i => i.id === instance.id);
    const clone = JSON.parse(JSON.stringify(instance));
    if (idx >= 0) {
      this._map.blueprintInstances[idx] = clone;
    } else {
      this._map.blueprintInstances.push(clone);
    }
    this._touch();
  }

  /** @param {string} id */
  removeBlueprintInstance(id) {
    this._map.blueprintInstances = this._map.blueprintInstances.filter(i => i.id !== id);
    this._touch();
  }

  // ── Plugins (Phase 29) ────────────────────────────────────────────────────

  /**
   * Add or update a CUSTOM (non-built-in) plugin record. Built-ins are
   * always regenerated fresh — never mutated here.
   * @param {object} plugin  PluginRecord
   */
  upsertPlugin(plugin) {
    if (plugin.builtIn) {
      throw new Error(`Cannot upsert built-in plugin '${plugin.manifest.name}' — built-ins are foundation-managed.`);
    }
    const builtInCollision = this._map.plugins.find(p => p.id === plugin.id && p.builtIn === true);
    if (builtInCollision) {
      throw new Error(`Plugin id '${plugin.id}' collides with built-in '${builtInCollision.manifest.name}'.`);
    }
    const idx = this._map.plugins.findIndex(p => p.id === plugin.id);
    const clone = JSON.parse(JSON.stringify(plugin));
    if (idx >= 0) {
      this._map.plugins[idx] = clone;
    } else {
      this._map.plugins.push(clone);
    }
    this._touch();
  }

  /** @param {string} id */
  removePlugin(id) {
    const target = this._map.plugins.find(p => p.id === id);
    if (target && target.builtIn) {
      throw new Error(`Cannot remove built-in plugin '${target.manifest.name}'.`);
    }
    this._map.plugins = this._map.plugins.filter(p => p.id !== id);
    this._touch();
  }

  // ── Playgrounds (Phase 30) ────────────────────────────────────────────────

  /** @param {object} playground */
  upsertPlayground(playground) {
    const idx = this._map.playgrounds.findIndex(p => p.id === playground.id);
    const clone = JSON.parse(JSON.stringify(playground));
    if (idx >= 0) {
      this._map.playgrounds[idx] = clone;
    } else {
      this._map.playgrounds.push(clone);
    }
    this._touch();
  }

  /** @param {string} id */
  removePlayground(id) {
    this._map.playgrounds = this._map.playgrounds.filter(p => p.id !== id);
    this._touch();
  }

  // ── Vault Keys (Phase 28) — metadata only, values never touch this file ────

  /** @param {object} vaultKeyRecord */
  upsertVaultKey(vaultKeyRecord) {
    const idx = this._map.vaultKeys.findIndex(v => v.id === vaultKeyRecord.id);
    const clone = JSON.parse(JSON.stringify(vaultKeyRecord));
    if (idx >= 0) {
      this._map.vaultKeys[idx] = clone;
    } else {
      this._map.vaultKeys.push(clone);
    }
    this._touch();
  }

  /** @param {string} id */
  removeVaultKey(id) {
    this._map.vaultKeys = this._map.vaultKeys.filter(v => v.id !== id);
    this._touch();
  }

  // ── vaultd (spec sect 66) ────────────────────────────────────────────────

  /**
   * @param {object|null} state  VaultdState shape, or null when not running
   *        (COS-42: field is always present, null only when genuinely
   *        not running, never omitted)
   */
  setVaultdState(state) {
    this._map.vaultdState = state ? JSON.parse(JSON.stringify(state)) : null;
    this._touch();
  }

  // ── Variables ─────────────────────────────────────────────────────────────

  /** @param {object} variable */
  upsertVariable(variable) {    const idx = this._map.variables.findIndex(v => v.id === variable.id);
    const clone = JSON.parse(JSON.stringify(variable));
    if (idx >= 0) {
      this._map.variables[idx] = clone;
    } else {
      this._map.variables.push(clone);
    }
    // Variables are considered "metadata" — no touch() to avoid
    // spam-persisting on every variable registration at boot.
  }

  // ── Internal ──────────────────────────────────────────────────────────────

  _touch() {
    this._map.generatedAt = Date.now();
    this._persist();
    if (this._bus) {
      this._bus.emit('host:map:updated', { generatedAt: this._map.generatedAt });
    }
  }

  _persist() {
    try {
      const json = JSON.stringify({ ...this._map, generatedAt: Date.now() }, null, 2);
      const tmp  = this._file + '.tmp';
      fs.writeFileSync(tmp, json, 'utf8');
      fs.renameSync(tmp, this._file);
    } catch (err) {
      console.error('[system-map] persist failed:', err.message);
    }
  }
}

module.exports = { SystemMap };
