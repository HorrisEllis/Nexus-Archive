/**
 * foundation/types.js
 * COMPARTMENT OS — Base Type Definitions
 * IMMUTABLE after v1.0.0 (COS-5)
 *
 * Author: James Brooks (Erosmancer)
 * Status: pre-release
 *
 * These are structural contracts, not runtime validators.
 * Use validateHook() in hook-schema.js for runtime validation.
 * Every shape defined here maps 1:1 to the spec §3.
 */

'use strict';

const { DEFAULT_RING_CAP } = require('./constants.js');

// ─── Primitive Aliases ────────────────────────────────────────────────────────
// Documented here for spec traceability. All are strings or numbers at runtime.

// CompartmentID  = String  (UUID v4)
// HookID         = String  (UUID v4)
// EventType      = String  ("{layer}:{noun}:{verb}")
// RuntimeID      = String  ("node" | "python" | "electron" | "html" | "deno" | ...)
// CompilerID     = String  ("esbuild" | "tsc" | "pyinstaller" | ...)

// ─── Default Shapes ───────────────────────────────────────────────────────────
// Used as templates and for Object.assign defaults.

const DEFAULT_NETWORK_CONFIG = Object.freeze({
  isolated:     true,
  level:        0,        // IsolationLevel — 0 = full isolation, loopback only
  proxyPort:    null,
  allowedHosts: [],
  deniedHosts:  [],
  dnsOverride:  {},
  logAllTraffic: false,
});

const DEFAULT_FS_CONFIG = Object.freeze({
  root:            '',
  writable:        [],
  readonly:        [],
  mounts:          [],
  watchEnabled:    true,
  dropZoneEnabled: false,
});

const DEFAULT_COMPILER_CONFIG = Object.freeze({
  id:      null,
  target:  null,
  flags:   [],
  outDir:  'dist',
  watch:   false,
});

const DEFAULT_WATCHDOG_CONFIG = Object.freeze({
  enabled:           false,   // COS: Watchdog off by default
  memoryLimitMB:     0,
  cpuLimitPct:       0,
  stallTimeoutMs:    0,
  crashLoopLimit:    3,
  crashLoopWindowMs: 60000,
  fsPolicy:          'log',
  netPolicy:         'log',
  onAnomaly:         'snapshot',
  httpHealthCheck:   null,
  customRules:       [],
  alertWebhook:      null,
});

// ─── Resource Config (spec §59.2) ─────────────────────────────────────────────

const DEFAULT_RESOURCE_CONFIG = Object.freeze({
  ramLimitMB:      0,         // 0 = unlimited
  ramReservedMB:   0,
  ramAlertPercent: 90,
  cpuLimitPercent: 0,         // 0 = unlimited
  cpuPriority:     'normal',
  cpuAffinityMask: null,
  ioThrottle:      'none',
  governorPolicy:  'fair',
  maxThreads:      0,         // 0 = unlimited
  minThreads:      0,
});

// ─── Nexus Config (spec §59.2) ────────────────────────────────────────────────

const DEFAULT_NEXUS_CONFIG = Object.freeze({
  ringCap:          DEFAULT_RING_CAP,
  snapshotTriggers: [],
  walEnabled:       true,
  retentionDays:    30,
});

// ─── Git Config (spec §59.2) ──────────────────────────────────────────────────

const DEFAULT_GIT_CONFIG = Object.freeze({
  enabled:      false,
  repoPath:     '',
  remote:       null,
  branch:       'main',
  autoCommitOn: [],
  sshKeyPath:   null,
});

// ─── SSH Config (spec §59.2) ──────────────────────────────────────────────────

const DEFAULT_SSH_CONFIG = Object.freeze({
  enabled:        false,
  keyPath:        null,
  knownHostsPath: null,
  agentForward:   false,
  authorizedKeys: [],
  tunnels:        [],
});

// ─── UI Config (spec §59.2) ───────────────────────────────────────────────────

const DEFAULT_UI_CONFIG = Object.freeze({
  theme:     'default',
  layout:    'default',
  customCss: null,
  favicon:   null,
});

const DEFAULT_COMPARTMENT = Object.freeze({
  id:          null,
  name:        '',
  purpose:     '',
  icon:        '',
  color:       '',
  runtimeId:   null,
  runtimeVersion: '',
  archetypeId: null,
  blueprintId:    null,
  blueprintRole:  null,
  entryFile:   null,
  entryArgs:   [],
  uiFile:      null,
  envVars:     {},
  workingDir:  '',
  state:       'created',
  priority:    'normal',     // CpuPriority
  network:     DEFAULT_NETWORK_CONFIG,
  fs:          DEFAULT_FS_CONFIG,
  compiler:    DEFAULT_COMPILER_CONFIG,
  watchdog:    DEFAULT_WATCHDOG_CONFIG,
  resources:   DEFAULT_RESOURCE_CONFIG,
  nexus:       DEFAULT_NEXUS_CONFIG,
  git:         DEFAULT_GIT_CONFIG,
  ssh:         DEFAULT_SSH_CONFIG,
  ui:          DEFAULT_UI_CONFIG,
  hooks:       [],
  pipeIds:     [],
  playgroundId: null,
  sandboxed:    false,
  tags:        [],
  createdAt:   null,
  updatedAt:   null,
  snapshotAt:  null,
  lastStartAt: null,
  lastStopAt:  null,
  cosVersion:  null,
  slug:        '',
  createdBy:   null,
});

const DEFAULT_HOOK = Object.freeze({
  id:            null,
  name:          '',
  version:       '1.0.0',
  compartmentId: 'host',
  contract: Object.freeze({
    inputs:      [],
    outputs:     [],
    sideEffects: [],
    axioms:      [],
  }),
  bindings: Object.freeze({
    ui:    null,
    cli:   null,
    event: null,
  }),
  meta: Object.freeze({
    description:  '',
    autoDetected: false,
    sourceFile:   null,
    createdAt:    null,
    updatedAt:    null,
  }),
});

const DEFAULT_SYSTEM_MAP = Object.freeze({
  version:      '1.0.0',
  generatedAt:  null,
  compartments: [],
  hooks:        [],
  events:       [],
  files:        [],
  axioms:       [],
  runtimes:     [],
  compilers:    [],
  plugins:      [],
  variables:    [],
  pipes:        [],

  // §70 final SystemMap — subsystems not yet built still get their slot.
  // COS-48: a subsystem being absent is empty array / null, never omitted.
  archetypes:         [],   // Phase 21
  blueprintDefs:      [],   // Phase 22
  blueprintInstances: [],   // Phase 22
  conductorRules:     [],   // Phase 27 (not yet built)
  conductorRunLogs:   [],   // Phase 27 (not yet built)
  vaultKeys:          [],   // Phase 28 (not yet built) — names only, never values
  viewerSessions:     [],   // Phase 25 (not yet built)
  lenses:             [],   // Phase 26 (not yet built)
  playgrounds:        [],   // Phase 30 (current playground/ predates this field)
  torturePlans:       [],   // Phase 31 (not yet built)
  tpmState:           'not-present',   // Phase 32 (not yet built)
  vaultdState:        null,            // Phase 33 (not yet built) — null when not running
  nodes:              [],   // local + remote nexus nodes (not yet built)
  snapshotIndex:      [],   // lightweight snapshot index (not yet built)
});

const DEFAULT_PIPE = Object.freeze({
  id:        null,
  name:      '',
  sourceId:  null,
  targetId:  null,
  hookId:    null,
  transform: null,
  filter:    null,
  state:     'active',
  createdAt: null,
  eventLog:  true,
});

const DEFAULT_SERVICE_CONFIG = Object.freeze({
  snapshotPath:    '',
  masterRingCap:   10_000_000,
  apiPort:         3748,
  ssePort:         3749,
  metricsInterval: 5000,
  logLevel:        'info',
  autoStart:       true,
});

// ─── Factory Functions ────────────────────────────────────────────────────────
// Produce new instances with defaults merged in. Spec §3.

/**
 * Create a new Compartment object.
 * @param {Partial<typeof DEFAULT_COMPARTMENT>} overrides
 * @returns {object}
 */
function makeCompartment(overrides = {}) {
  return Object.assign({}, DEFAULT_COMPARTMENT, overrides, {
    network:   Object.assign({}, DEFAULT_NETWORK_CONFIG,  overrides.network   ?? {}),
    fs:        Object.assign({}, DEFAULT_FS_CONFIG,       overrides.fs        ?? {}),
    compiler:  Object.assign({}, DEFAULT_COMPILER_CONFIG, overrides.compiler  ?? {}),
    watchdog:  Object.assign({}, DEFAULT_WATCHDOG_CONFIG, overrides.watchdog  ?? {}),
    resources: Object.assign({}, DEFAULT_RESOURCE_CONFIG, overrides.resources ?? {}),
    nexus:     Object.assign({}, DEFAULT_NEXUS_CONFIG,    overrides.nexus     ?? {}),
    git:       Object.assign({}, DEFAULT_GIT_CONFIG,      overrides.git       ?? {}),
    ssh:       Object.assign({}, DEFAULT_SSH_CONFIG,      overrides.ssh       ?? {}),
    ui:        Object.assign({}, DEFAULT_UI_CONFIG,       overrides.ui        ?? {}),
    hooks:     [...(overrides.hooks   ?? [])],
    tags:      [...(overrides.tags    ?? [])],
    entryArgs: [...(overrides.entryArgs ?? [])],
    pipeIds:   [...(overrides.pipeIds ?? [])],
    envVars:   Object.assign({}, overrides.envVars ?? {}),
  });
}

/**
 * Create a new Hook object.
 * @param {Partial<typeof DEFAULT_HOOK>} overrides
 * @returns {object}
 */
function makeHook(overrides = {}) {
  return Object.assign({}, DEFAULT_HOOK, overrides, {
    contract: Object.assign({}, DEFAULT_HOOK.contract, overrides.contract ?? {}),
    bindings: Object.assign({}, DEFAULT_HOOK.bindings, overrides.bindings ?? {}),
    meta:     Object.assign({}, DEFAULT_HOOK.meta,     overrides.meta     ?? {}),
  });
}

/**
 * Create a new SystemMap object.
 * @param {Partial<typeof DEFAULT_SYSTEM_MAP>} overrides
 * @returns {object}
 */
function makeSystemMap(overrides = {}) {
  return Object.assign({}, DEFAULT_SYSTEM_MAP, overrides, {
    generatedAt:  overrides.generatedAt ?? Date.now(),
    compartments: [...(overrides.compartments ?? [])],
    hooks:        [...(overrides.hooks        ?? [])],
    events:       [...(overrides.events       ?? [])],
    files:        [...(overrides.files        ?? [])],
    axioms:       [...(overrides.axioms       ?? [])],
    runtimes:     [...(overrides.runtimes     ?? [])],
    compilers:    [...(overrides.compilers    ?? [])],
    plugins:      [...(overrides.plugins      ?? [])],
    variables:    [...(overrides.variables    ?? [])],
    pipes:        [...(overrides.pipes        ?? [])],

    archetypes:         [...(overrides.archetypes         ?? [])],
    blueprintDefs:      [...(overrides.blueprintDefs      ?? [])],
    blueprintInstances: [...(overrides.blueprintInstances ?? [])],
    conductorRules:     [...(overrides.conductorRules     ?? [])],
    conductorRunLogs:   [...(overrides.conductorRunLogs   ?? [])],
    vaultKeys:          [...(overrides.vaultKeys          ?? [])],
    viewerSessions:     [...(overrides.viewerSessions     ?? [])],
    lenses:             [...(overrides.lenses             ?? [])],
    playgrounds:        [...(overrides.playgrounds        ?? [])],
    torturePlans:       [...(overrides.torturePlans       ?? [])],
    tpmState:           overrides.tpmState  ?? DEFAULT_SYSTEM_MAP.tpmState,
    vaultdState:        overrides.vaultdState ?? null,
    nodes:              [...(overrides.nodes         ?? [])],
    snapshotIndex:      [...(overrides.snapshotIndex ?? [])],
  });
}

/**
 * Create a new Pipe object.
 * @param {Partial<typeof DEFAULT_PIPE>} overrides
 * @returns {object}
 */
function makePipe(overrides = {}) {
  return Object.assign({}, DEFAULT_PIPE, overrides);
}

/**
 * Create a new ServiceConfig object.
 * @param {Partial<typeof DEFAULT_SERVICE_CONFIG>} overrides
 * @returns {object}
 */
function makeServiceConfig(overrides = {}) {
  return Object.assign({}, DEFAULT_SERVICE_CONFIG, overrides);
}

// ─── Compartment State Machine ────────────────────────────────────────────────
// Valid states and transitions. Used by schema-engine to enforce COS-1.

// NOTE: spec §59.1 lists 7 CompartmentState values but no document provided
// gives a transition table for 'sandboxed' / 'replaying'. The rules below are
// an inferred, conservative extension — not lifted from spec text — flagged
// for confirmation rather than treated as given:
//   running     ⇄ sandboxed   (enter/exit a Playground, §67)
//   stopped     → replaying   (enter Nexus replay mode, §69 REPLAY events)
//   snapshotted → replaying   (replay from a snapshot)
//   replaying   → stopped     (exit replay mode)
const COMPARTMENT_STATES = Object.freeze([
  'created', 'running', 'stopped', 'error', 'snapshotted', 'sandboxed', 'replaying',
]);

const COMPARTMENT_TRANSITIONS = Object.freeze({
  created:     ['running', 'error', 'snapshotted'],
  running:     ['stopped', 'error', 'snapshotted', 'sandboxed'],
  stopped:     ['running', 'snapshotted', 'replaying'],
  error:       ['running', 'stopped', 'snapshotted'],
  snapshotted: ['running', 'stopped', 'replaying'],
  sandboxed:   ['running', 'stopped', 'error'],
  replaying:   ['stopped'],
});

/**
 * Returns true if the transition from `from` to `to` is valid.
 * @param {string} from
 * @param {string} to
 * @returns {boolean}
 */
function isValidTransition(from, to) {
  const allowed = COMPARTMENT_TRANSITIONS[from];
  return Array.isArray(allowed) && allowed.includes(to);
}

module.exports = {
  // Defaults (read-only references — do not mutate)
  DEFAULT_NETWORK_CONFIG,
  DEFAULT_FS_CONFIG,
  DEFAULT_COMPILER_CONFIG,
  DEFAULT_WATCHDOG_CONFIG,
  DEFAULT_RESOURCE_CONFIG,
  DEFAULT_NEXUS_CONFIG,
  DEFAULT_GIT_CONFIG,
  DEFAULT_SSH_CONFIG,
  DEFAULT_UI_CONFIG,
  DEFAULT_COMPARTMENT,
  DEFAULT_HOOK,
  DEFAULT_SYSTEM_MAP,
  DEFAULT_PIPE,
  DEFAULT_SERVICE_CONFIG,

  // Factories
  makeCompartment,
  makeHook,
  makeSystemMap,
  makePipe,
  makeServiceConfig,

  // State machine
  COMPARTMENT_STATES,
  COMPARTMENT_TRANSITIONS,
  isValidTransition,
};
