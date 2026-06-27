'use strict';
/**
 * cos/src/foundation/index.js — Compartment OS Foundation
 * UUID: cos-foundation-v1-0000-0000-000000000013
 * Phase: 0 — IMMUTABLE after v1.0.0
 *
 * §COS-0.1 Nothing exists until proven. foundation/ is the proof floor.
 * §COS-0.2 Nothing silently fails. Every error surfaces.
 * §COS-0.3 Bottom-up only. No layer references a layer above it.
 * §COS-0.4 Everything has a UUID and a type.
 * §COS-0.5 The host bus is SISO. Every event is typed. Gates own behavior.
 */

const crypto = require('crypto');

// ── UUID ──────────────────────────────────────────────────────────────────
const uid = () => crypto.randomUUID();

// ── Compartment types ─────────────────────────────────────────────────────
const COMPARTMENT_TYPES = Object.freeze({
  BROWSER:    'browser',      // Clear Glass window + ClearDriver + fingerprint
  NODE:       'node',         // Node.js process sandbox
  PYTHON:     'python',       // Python process sandbox
  ELECTRON:   'electron',     // Electron app sandbox
  HTML:       'html',         // Static HTML serve
  SHELL:      'shell',        // CLI REPL sandbox
  CDP:        'cdp',          // ErosmancerOS CDP session
  COMPOSITE:  'composite',    // Multiple compartment types, coordinated
});

// ── Compartment states ────────────────────────────────────────────────────
const COMPARTMENT_STATES = Object.freeze({
  PENDING:    'pending',      // declared, not yet started
  STARTING:   'starting',     // boot sequence in progress
  RUNNING:    'running',      // active, healthy
  PAUSED:     'paused',       // suspended, state preserved
  ERROR:      'error',        // boot or runtime failure
  STOPPING:   'stopping',     // shutdown in progress
  STOPPED:    'stopped',      // clean stop, state may persist
  DESTROYED:  'destroyed',    // state wiped, UUID retired
});

// ── COS Axioms (enforced constants) ──────────────────────────────────────
const AXIOMS = Object.freeze({
  'COS-1.1': 'Nothing exists until proven — compartment is not running until health confirms it',
  'COS-1.2': 'Nothing silently fails — every error is an event on the host bus',
  'COS-2.1': 'Compartment state is the single source of truth — never infer, always read',
  'COS-3.1': 'Bottom-up only — foundation exists before kernel, kernel before CLI, CLI before UI',
  'COS-4.1': 'Every compartment has a UUID, a type, a state, and a creation timestamp',
  'COS-4.2': 'Every event on the host bus has a UUID, type, compartmentId, and ts',
  'COS-5.1': 'The host bus is SISO — events flow, gates transform, pending is residue',
  'COS-5.2': 'Compartments do not call each other directly — they emit on the host bus',
  'COS-6.1': 'A compartment can be snapshotted. A snapshot can be replayed.',
  'COS-7.1': 'Hot-swap means: new compartment starts, old stays running, traffic shifts, old stops',
});

// ── Event contracts — every host bus event type, typed ───────────────────
const EVENT_CONTRACTS = Object.freeze({
  // Compartment lifecycle
  'compartment.create':    { required: ['type', 'config'],             description: 'Declare a new compartment' },
  'compartment.start':     { required: ['compartmentId'],              description: 'Boot a declared compartment' },
  'compartment.started':   { required: ['compartmentId', 'type'],      description: 'Compartment is running' },
  'compartment.stop':      { required: ['compartmentId'],              description: 'Request graceful stop' },
  'compartment.stopped':   { required: ['compartmentId'],              description: 'Compartment stopped cleanly' },
  'compartment.destroy':   { required: ['compartmentId'],              description: 'Wipe compartment state' },
  'compartment.destroyed': { required: ['compartmentId'],              description: 'Compartment wiped' },
  'compartment.error':     { required: ['compartmentId', 'error'],     description: 'Compartment error — §COS-1.2' },
  'compartment.status':    { required: ['compartmentId', 'state'],     description: 'Status response' },
  'compartment.list':      { required: [],                             description: 'Request compartment list' },
  'compartment.listed':    { required: ['compartments'],               description: 'Compartment list response' },
  'compartment.snapshot':  { required: ['compartmentId'],              description: 'Request snapshot' },
  'compartment.snapshotted': { required: ['compartmentId', 'snapshot'], description: 'Snapshot taken' },
  'compartment.swap':      { required: ['fromId', 'toId'],             description: 'Hot-swap §COS-7.1' },
  'compartment.swapped':   { required: ['fromId', 'toId'],             description: 'Hot-swap complete' },

  // Browser compartment (Clear Glass)
  'browser.navigate':      { required: ['compartmentId', 'url'],       description: 'Navigate browser compartment' },
  'browser.driver.exec':   { required: ['compartmentId', 'action'],    description: 'Execute ClearDriver action in compartment' },
  'browser.dom.query':     { required: ['compartmentId', 'selector'],  description: 'Query DOM in browser compartment' },
  'browser.copilot':       { required: ['compartmentId', 'message'],   description: 'Send co-pilot message in browser context' },

  // CDP compartment (ErosmancerOS)
  'cdp.cmd':               { required: ['compartmentId', 'action'],    description: 'Execute CDP command in compartment' },
  'cdp.node.register':     { required: ['compartmentId', 'nodeData'],  description: 'Register node in compartment registry' },
  'cdp.hostile.detected':  { required: ['compartmentId', 'level'],     description: 'Threat detected in compartment' },

  // Process compartments
  'process.exec':          { required: ['compartmentId', 'cmd'],       description: 'Execute command in process compartment' },
  'process.output':        { required: ['compartmentId', 'output'],    description: 'Process stdout/stderr' },
  'process.exit':          { required: ['compartmentId', 'code'],      description: 'Process exited' },

  // Host system
  'host.status':           { required: [],                             description: 'Request host status' },
  'host.status.response':  { required: ['compartments', 'busStats'],   description: 'Host status response' },
  'host.nexus.status':     { required: ['connected'],                  description: 'NEXUS bus probe result' },
  'host.seam.register':    { required: ['moduleId', 'uuid'],           description: 'SEAM registration event' },
});

// ── Compartment schema validator ──────────────────────────────────────────
function validateCompartmentConfig(config) {
  const errors = [];
  if (!config)                                        errors.push('config required');
  if (!COMPARTMENT_TYPES[config?.type?.toUpperCase()]) errors.push(`invalid type: ${config?.type}. Valid: ${Object.values(COMPARTMENT_TYPES).join(', ')}`);
  if (!config?.name || typeof config.name !== 'string') errors.push('name required (string)');
  if (config?.name?.length > 64)                      errors.push('name max 64 chars');
  return { ok: errors.length === 0, errors };
}

// ── Event validator ───────────────────────────────────────────────────────
function validateEvent(type, data) {
  const contract = EVENT_CONTRACTS[type];
  if (!contract) return { ok: true }; // Unknown events pass through (open system)
  const missing = contract.required.filter(f => data[f] === undefined);
  if (missing.length) return { ok: false, errors: [`missing required fields: ${missing.join(', ')}`] };
  return { ok: true };
}

module.exports = {
  uid,
  COMPARTMENT_TYPES,
  COMPARTMENT_STATES,
  AXIOMS,
  EVENT_CONTRACTS,
  validateCompartmentConfig,
  validateEvent,
};
