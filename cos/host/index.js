/**
 * host/index.js
 * COMPARTMENT OS — Host Shell Bootstrap
 *
 * Author: James Brooks (Erosmancer)
 * Status: pre-release
 *
 * createHost() boots the host in dependency order:
 *   1. StateStore
 *   2. EventBus (SISO Stream + StreamLog)
 *   3. SystemMap
 *   4. Gate registration — compartment lifecycle + process lifecycle
 *      to process spawn when a compartment has an entryFile
 *
 * Gate pipeline for cos start <name>:
 *   CLI emit('host:compartment:start')
 *     → StartCompartmentGate  → emit('host:compartment:started')
 *     → ProcessSpawnGate      → spawnProcess() → async events
 *
 * Gate pipeline for cos stop <name>:
 *   CLI emit('host:compartment:stop')
 *     → StopCompartmentGate   → emit('host:compartment:stopped')
 *     → ProcessKillGate       → SIGTERM → async comp:process:exited
 */

'use strict';

const { StateStore }     = require('./state-store.js');
const { createEventBus } = require('./event-bus.js');
const { SystemMap }      = require('./system-map.js');
const { Event }          = require('../siso/Event.js');
const { HOST, COMP, VAULT } = require('../foundation/event-contracts.js');
const { COS_VERSION }    = require('../foundation/constants.js');

const {
  CreateCompartmentGate,
  StartCompartmentGate,
  StopCompartmentGate,
  DestroyCompartmentGate,
} = require('./gates/compartment.js');

const {
  ProcessSpawnGate,
  ProcessKillGate,
  ProcessStdinGate,
} = require('./gates/process.js');

const {
  ArchetypeAssignGate,
  ArchetypeImportGate,
  ArchetypeDetectGate,
} = require('./gates/archetype.js');

const {
  BlueprintCreateGate,
  BlueprintImportGate,
  BlueprintDestroyGate,
} = require('./gates/blueprint.js');

const {
  PluginInstallGate,
  PluginEnableGate,
  PluginDisableGate,
  PluginRemoveGate,
} = require('./gates/plugin.js');

const {
  PlaygroundCreateGate,
  PlaygroundDestroyGate,
  PlaygroundPromoteGate,
  PlaygroundStatusGate,
} = require('./gates/playgrounds.js');

const {
  VaultSetGate, VaultGetGate, VaultDeleteGate, VaultGrantGate, VaultRevokeGate, VaultExportGate, VaultImportGate,
} = require('./gates/vault.js');
const { getInjectionEnvVars } = require('../vault/index.js');
const { startMonitoring, stopMonitoring } = require('../watchdog/monitor.js');

// ─── createHost ───────────────────────────────────────────────────────────────

function createHost(opts = {}) {
  // 1. State store
  const store = new StateStore(opts.stateFile);
  store.load();

  const vaultOpts = { storeFile: opts.vaultStoreFile, keyFile: opts.vaultKeyFile, auditLogFile: opts.vaultAuditLogFile };

  // 2. Event bus (SISO Stream + StreamLog)
  const bus = createEventBus({
    ringCap:  opts.ringCap,
    logLevel: opts.logLevel || 'EVENTS',
  });

  // 3. System map
  const sysmap = new SystemMap({ mapFile: opts.mapFile, eventBus: bus });
  sysmap.load();

  for (const comp of store.listCompartments()) {
    sysmap.upsertCompartment(comp);
  }

  // 4. Register gates
  //    Compartment lifecycle
  bus.register(new CreateCompartmentGate());
  bus.register(new StartCompartmentGate());
  bus.register(new StopCompartmentGate());
  bus.register(new DestroyCompartmentGate());

  //    Process lifecycle
  bus.register(new ProcessSpawnGate());
  bus.register(new ProcessKillGate());
  bus.register(new ProcessStdinGate());

  //    Archetype operations (Phase 21)
  bus.register(new ArchetypeAssignGate());
  bus.register(new ArchetypeImportGate());
  bus.register(new ArchetypeDetectGate());

  //    Blueprint operations (Phase 22)
  bus.register(new BlueprintCreateGate());
  bus.register(new BlueprintImportGate());
  bus.register(new BlueprintDestroyGate());

  //    Plugin operations (Phase 29)
  bus.register(new PluginInstallGate());
  bus.register(new PluginEnableGate());
  bus.register(new PluginDisableGate());
  bus.register(new PluginRemoveGate());

  //    Playground operations (Phase 30)
  bus.register(new PlaygroundCreateGate());
  bus.register(new PlaygroundDestroyGate());
  bus.register(new PlaygroundPromoteGate());
  bus.register(new PlaygroundStatusGate());

  //    Vault operations (Phase 28)
  bus.register(new VaultSetGate());
  bus.register(new VaultGetGate());
  bus.register(new VaultDeleteGate());
  bus.register(new VaultGrantGate());
  bus.register(new VaultRevokeGate());
  bus.register(new VaultExportGate());
  bus.register(new VaultImportGate());

  //    When a compartment transitions to 'running', check if it has an entryFile.
  //    If so, emit the spawn command into the gate pipeline.
  //    This keeps StartCompartmentGate (state) separate from ProcessSpawnGate (process).
  bus.on(HOST.COMPARTMENT_STARTED, (ev) => {
    const comp = ev.payload.compartment;
    if (!comp) return;
    if (!comp.entryFile || !comp.runtimeId) return;  // no spawn without entry + runtime

    const vaultEnv = getInjectionEnvVars({ sysmap, vaultOpts }, comp);
    for (const key of Object.keys(vaultEnv)) {
      bus.emit(VAULT.INJECTED, { compartmentId: comp.id, key }); // value never logged
    }

    bus.emit('comp:process:spawn', {
      compartmentId: comp.id,
      name:          comp.name,
      runtimeId:     comp.runtimeId,
      entryFile:     comp.entryFile,
      entryArgs:     comp.entryArgs || [],
      cwd:           comp.fs && comp.fs.root ? comp.fs.root : process.cwd(),
      env:           Object.assign({}, vaultEnv, comp.envVars || {}), // compartment's own envVars win on conflict
      bus,
      store,
      sysmap,
    });
  });

  //    When a compartment transitions to 'stopped', kill its process if running.
  bus.on(HOST.COMPARTMENT_STOPPED, (ev) => {
    const comp = ev.payload.compartment;
    if (!comp) return;

    bus.emit('comp:process:kill', {
      compartmentId: comp.id,
      name:          comp.name,
    });
  });

  const host = {
    store,
    bus,
    sysmap,
    version: COS_VERSION,
    vaultOpts,
  };

  //    Vault audit trail — persisted because each CLI invocation is a
  //    fresh process; the in-memory bus alone can't survive between
  //    `cos vault set` and a later `cos vault audit` call.
  bus.onAny((ev) => {
    if (ev.type.startsWith('vault:')) {
      const { appendAuditEntry } = require('../vault/audit-log.js');
      appendAuditEntry(ev, vaultOpts.auditLogFile);
    }
  });

  //    Watchdog monitor lifecycle — tied to the actual process, not the
  //    compartment's logical state (a compartment can be 'started' a
  //    moment before its process actually spawns).
  bus.on(COMP.PROCESS_STARTED, (ev) => {
    const comp = store.getCompartment(ev.payload.compartmentId);
    if (comp) startMonitoring({ store, sysmap, bus }, comp);
  });
  bus.on(COMP.PROCESS_EXITED, (ev) => stopMonitoring(ev.payload.compartmentId));
  bus.on(COMP.PROCESS_CRASHED, (ev) => stopMonitoring(ev.payload.compartmentId));

  bus.emit(HOST.MAP_UPDATED, { source: 'boot', version: COS_VERSION });

  return host;
}

module.exports = { createHost };
