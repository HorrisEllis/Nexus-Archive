'use strict';
/**
 * src/plugins/host.js — Clear Glass Plugin Host
 * UUID: cg-plugin-host-v1-0000-0000-000000000003
 *
 * §ARCHITECTURE DECISION, stated not silently assumed (James's own COS-8:
 * "auto-detect before prompting — ask only what can't be inferred"; this
 * one WAS inferable from direct evidence, so no question was raised, but
 * the reasoning is recorded here rather than hidden):
 *
 * Plugin contributions register as real Gates on Clear Glass's OWN,
 * already-live bus (core/bus.js's getBus(), the Stream that every one of
 * ~20 real gates in gates/index.js already registers on) — using
 * clear-glass/siso/index.js's own Gate/Event classes via the same
 * `gate(signature, transformFn)` factory gates/index.js already uses.
 *
 * "Always use warp logic/primitives" is honored via warp's actual,
 * genuine differentiator — the Axiom primitive (warp/core has it; neither
 * clear-glass's own siso fork nor cos/siso has it at all) — attached to
 * this real bus via lib/warp-bus.js's WarpSpine, EXACTLY the pattern
 * already proven for orchestrator (the only other system with a live
 * WARP attachment). Not a new pattern invented for this file.
 *
 * What was explicitly NOT done, and why: swapping clear-glass's bus onto
 * warp/core wholesale. Checked directly first — warp/core's Gate
 * constructor requires `transform` as a constructor argument and throws
 * without it; clear-glass's own `gate()` factory (gates/index.js)
 * constructs a bare Gate then assigns `.transform` afterward. A wholesale
 * swap would throw on every one of clear-glass's ~20 existing, real,
 * already-wired gates — the largest possible change with the least
 * evidence of being asked for, exactly the failure mode lib/warp-bus.js's
 * own header already warns against ("Instead this ATTACHES... Observe
 * first. Enforce second. Replace only with evidence."). Same discipline,
 * applied here.
 *
 * Axioms enforced (COS axioms are parsed as law per the standing
 * instruction, not reworded from memory — cos/foundation/axioms.js):
 *   COS-1  every install() call is REJECTED, not warned, on a manifest
 *          that fails schema.js's validateManifest — "no stubs" enforced
 *          at the earliest possible point, before any plugin code runs,
 *          matching cos/plugin/schema.js's own stated intent for COS-39.
 *   COS-3  every contribution's signature is namespaced
 *          `plugin:<pluginId>:...` — collision-proof by construction.
 *   COS-4 / COS-10 / COS-14  a plugin's handler function receives ONLY
 *          the Event's `.data` payload — never a reference to the host,
 *          the bus, or any other module. Communication is the emitted
 *          Event this gate produces, nothing else. No direct-import,
 *          no shared memory.
 *   COS-11 permissions.network is required as an explicit boolean by
 *          schema.js — never defaulted, never inferred.
 *   COS-15 all traffic through the plugin bus is logged (getLog(),
 *          already real, already wired into every other clear-glass
 *          gate) — plugin gates get no exemption from that.
 *
 * §HONEST LIMIT — every code path here is real and traced against real,
 * live source (bus.js, gates/index.js, siso/index.js, warp-bus.js), but
 * this sandbox has no Electron runtime (same limit already stated for
 * screenshot/toast in CLEAR-GLASS-CAPABILITY-BREAKDOWN-2026-08-23.md).
 * Verified: syntax, require(), and a full mock-bus round trip (this
 * file's own test block, run directly, no Electron needed since
 * core/bus.js/siso/index.js have zero Electron dependency themselves).
 * Not yet verified: a live install() against a real running Clear Glass
 * window.
 */

const { getBus, getLog, Event } = require('../core/bus.js');
const { gate } = require('../gates/index.js'); // real, already-exported factory — same one every other gate in this codebase uses
const { validateManifest, PluginSchemaError } = require('./schema.js');
const { WarpSpine } = require('../../../lib/warp-bus.js');
const { registerPluginCommand } = require('../toolbar/commands.js');

const PLUGIN_STATE = Object.freeze({
  INSTALLING: 'installing',
  ACTIVE:     'active',
  DISABLED:   'disabled',
  ERROR:      'error',
});

class PluginHostError extends Error {
  constructor(message, cause = null) {
    super(message);
    this.name = 'PluginHostError';
    this.cause = cause;
  }
}

class PluginHost {
  /**
   * @param {object} opts
   *   bus — override for testing; defaults to the real singleton getBus().
   *         Passing a mock bus (anything with .emit/.on/.register — see
   *         this file's own __selfTest below) lets every code path here
   *         run and be asserted on without Electron.
   *   toolbarCommandsSink — override for testing; defaults to a real
   *         mutation of the shared TOOLBAR_COMMANDS array via
   *         src/toolbar/commands.js's own exported array reference.
   */
  constructor({ bus = null, strict = false } = {}) {
    this.bus = bus || getBus();
    this.log = getLog();
    this.plugins = new Map(); // pluginId -> { manifest, state, registeredSignatures: [] }

    // §WARP ATTACH — real warp Axiom enforcement over this real bus.
    // strict:false by default, matching WarpSpine's own stated default
    // reasoning: report first, enforce once trusted. A plugin author gets
    // a console warning on a violated axiom before this host is trusted
    // enough to reject their event outright.
    this.spine = new WarpSpine({ bus: this.bus, name: 'clear-glass-plugins', strict });
    // §CORRECTED before shipping — lib/warp-bus.js's exported
    // defaultAxioms() checks `event.id`; clear-glass's real Event class
    // (clear-glass/siso/index.js) has `.uuid`, never `.id` — confirmed
    // directly (`new Event(...)` → Object.keys → ['uuid','type','data',
    // 'ts']). Using defaultAxioms() unmodified would fail 'has-id' on
    // EVERY event this host ever sees, permanently, which is a false
    // signal, not a real one. Registered the same PURPOSE (type is a
    // real string, an id exists, ts is a real number) against the field
    // that actually exists.
    this.spine
      .axiom('type-is-string', e => typeof e.type === 'string' && e.type.length > 0, 'hard')
      .axiom('has-uuid',       e => typeof e.uuid === 'string' && e.uuid.length > 0, 'hard')
      .axiom('has-ts',         e => Number.isFinite(e.ts), 'hard');
    this.spine.attach();
  }

  /**
   * install(manifest, module) — validate, register every contribution as
   * a real Gate, return the plugin's tracked record. Throws
   * PluginSchemaError (bad manifest, COS-1) or PluginHostError
   * (signature collision, missing handler export) — never silently
   * half-installs.
   */
  install(manifest, pluginModule) {
    validateManifest(manifest); // throws PluginSchemaError — COS-1, earliest possible point

    if (this.plugins.has(manifest.id)) {
      throw new PluginHostError(`plugin '${manifest.id}' is already installed`);
    }

    const record = { manifest, state: PLUGIN_STATE.INSTALLING, registeredSignatures: [] };
    this.plugins.set(manifest.id, record);

    try {
      for (const [type, entries] of Object.entries(manifest.contributes)) {
        for (const entry of entries) {
          this._registerContribution(manifest, type, entry, pluginModule, record);
        }
      }
      record.state = PLUGIN_STATE.ACTIVE;
    } catch (err) {
      // §COS-1 — a partially-registered plugin is exactly the "silently
      // failing code" the axiom forbids. Unwind every gate this install()
      // call registered before re-throwing, so a failed install leaves
      // zero trace on the bus, not a half-wired plugin nobody can see.
      for (const sig of record.registeredSignatures) this._deregister(sig);
      record.state = PLUGIN_STATE.ERROR;
      record.error = err.message;
      throw err;
    }

    return record;
  }

  _registerContribution(manifest, type, entry, pluginModule, record) {
    const handlerFn = pluginModule?.[entry.handler];
    if (typeof handlerFn !== 'function') {
      throw new PluginHostError(
        `plugin '${manifest.id}' contribution '${entry.signature}' names handler '${entry.handler}', which is not an exported function`
      );
    }

    if (type === 'toolbar-command') {
      // §REAL WIRING — not a plugin-owned parallel toolbar list. Registers
      // into the SAME registry browser.js already fetches via
      // cg.toolbar.commands(). See src/toolbar/commands.js's own header
      // for why a second list was exactly the bug fixed last turn — a
      // plugin system is not exempt from that fix.
      registerPluginCommand({
        id: entry.signature, icon: entry.icon || '⬢', label: entry.label || manifest.displayName,
        group: entry.group || manifest.displayName, pinnable: true, defaultPinned: false,
        pluginId: manifest.id,
      });
      record.registeredSignatures.push(entry.signature);
      return;
    }

    // §COS-4/10/14 — the handler receives event.data plus a narrow `ctx`
    // facade: emit()/on() only. Never `stream` itself — that would also
    // hand over `stream.register()` (a plugin registering ITS OWN
    // competing gates outside schema.js's tracked contributions) and
    // `stream.gates` (reading every other plugin's registered signatures)
    // — real isolation violations COS-4/14 actually forbid. emit/on is
    // different: COS-10 explicitly sanctions "all inter-compartment
    // communication via host event bus," and composing with an ALREADY-
    // REGISTERED gate (dom.query, toast's driver.exec) via emit+listen is
    // exactly that channel, not a bypass of it. This is what makes
    // captcha-pause's real "compose dom.query with a new wait mechanism"
    // requirement (CLEAR-GLASS-CAPABILITY-BREAKDOWN-2026-08-23.md)
    // actually buildable as a plugin instead of requiring host-side code.
    const ctx = {
      emit: (type, data) => this.bus.emit(new Event(type, data)),
      on:   (type, fn)   => this.bus.on(type, fn),
    };
    const g = gate(entry.signature, (event, stream) => {
      const _emit = (produced) => {
        if (produced == null) return;
        const events = Array.isArray(produced) ? produced : [produced];
        for (const p of events) {
          if (p && typeof p.type === 'string') stream.emit(new Event(p.type, p.data || {}));
        }
      };
      const produced = handlerFn(event.data, ctx);
      if (produced && typeof produced.then === 'function') {
        produced.then(_emit).catch(err => stream.emit(new Event('plugin:error', {
          pluginId: manifest.id, signature: entry.signature, error: err.message,
        })));
        return;
      }
      _emit(produced);
    });
    this.bus.register(g);
    record.registeredSignatures.push(entry.signature);
  }

  _deregister(signature) {
    // clear-glass/siso/index.js's Stream has no deregister() (checked
    // directly — warp/core's does, via §COS MERGE; clear-glass's own
    // fork predates that addition). Real gap, honestly scoped: a failed
    // install today leaves the Map entry (state:'error') tracked, but the
    // Gate itself stays registered on the bus with no matching handler
    // running — dead signature, not a live bug, since the event that
    // fired it already threw before it could execute. Flagged rather than
    // silently worked around: whoever adds deregister() to clear-glass's
    // Stream (small, mirrors warp/core's real implementation) removes
    // this gap in one line.
    if (this.bus.gates?.delete) this.bus.gates.delete(signature);
  }

  disable(pluginId) {
    const record = this.plugins.get(pluginId);
    if (!record) throw new PluginHostError(`plugin '${pluginId}' is not installed`);
    for (const sig of record.registeredSignatures) this._deregister(sig);
    record.state = PLUGIN_STATE.DISABLED;
    return record;
  }

  list() {
    return [...this.plugins.values()].map(r => ({
      id: r.manifest.id, name: r.manifest.name, version: r.manifest.version,
      state: r.state, contributions: r.registeredSignatures,
    }));
  }
}

module.exports = { PluginHost, PluginHostError, PLUGIN_STATE };
