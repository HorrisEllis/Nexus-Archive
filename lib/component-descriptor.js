'use strict';
// ── lib/component-descriptor.js — Phase 40 foundation ───────────────────────
// UUID: nexus-component-descriptor-v1-0000-4000-0000-000000000001
// Version: 1.1.0
// Phase: 40 — Component Descriptor: The Atomic Unit of Reality (FOUNDATION ONLY)
//
// ── WHAT THIS IS, AND ISN'T (read before assuming scope) ───────────────────
// Phase 40's full description in the roadmap includes a T0/T1/T1.5/T2
// compiler pipeline — spec → descriptors → TypeScript scaffold → all-view
// projection → LLM-filled implementations. That pipeline is not built here
// and isn't claimed to be. Per §3.1 (bottom-up, foundation before modules,
// a phase doesn't begin until the phase below it has passing tests) this
// file IS that foundation: the descriptor schema itself, real validation,
// and a real projection from a descriptor into the component-registry
// shape that already exists and is already live (lib/component-registry.js
// — required by orchestrator.js, has its own validate()/register(), already
// enforces a non-empty `grammar` array per component). This file does not
// duplicate that registry — it generates valid input for it, which is
// exactly what "capabilities project into commands" (Phase 40.5) needs
// to exist before it can be built. The LLM-driven T2 compiler stage is
// real, separate, much larger work and is explicitly not started here —
// stating that plainly per §1.1/§1.3 rather than stubbing a fake compiler
// that would silently do nothing.
//
// ── v1.1.0 additions — hooks, wires, intent (this pass) ─────────────────────
// hook_type/hook_id name a capability's ENDPOINTS — api, event_bus, cli,
// file_watch, sse, websocket, queue. Deliberately NOT called `hooks` on the
// capability object even though that's the requested vocabulary, because
// component-registry.js ALREADY has a `hooks[]` field with a completely
// different meaning — lifecycle triggers (`on: success/failure/always`,
// `trigger`), checked directly at lib/component-registry.js lines 40/132-138.
// Same word, two real and different things, exact same collision §RAID-
// INTEGRATION already hit with "contract" vs "compartment." Resolved the
// same way: this lives under capability.endpoints[], each entry carrying
// hook_type + hook_id, so the requested ID scheme exists without colliding
// with the field name that's already taken.
//
// wire_type/wire_id name a capability's CONNECTIONS to other components —
// pipeline, data_flow, handshake, interaction_contract. No existing
// `wire`/`wireType` field anywhere in the codebase (checked, zero hits) —
// genuinely new, capability.wires[].
//
// intent is now required at the capability level (the "component" in
// "every component, hook and wire") and at every hook/wire entry — plain-
// language reason the thing exists. Also the literal field name
// lib/compartment-engine.js's own spawn() already requires: `spawn({intent,
// ...})` throws without `intent.uuid` (checked directly, line ~199). This
// isn't a new convention bolted on — it's the existing convention,
// extended one level down. toCompartmentIntent() below bridges a
// descriptor capability into the {uuid, verb, domain} shape spawn()
// actually demands, so the parent/child build layer can spawn one real
// compartment per chunk without hand-translating the shape each time.
//
// §1.1  Nothing exists until proven — validate() is real, tested against
//       real inputs, not a stub that always returns ok:true.
// §1.3  No placeholder projection — projectToComponentRegistry() produces
//       output that component-registry's own validate() actually accepts,
//       proven in tests/modules/component-descriptor.test.js, not assumed.
// §5.6  Structural self-similarity — a descriptor's capabilities[] shape
//       (verb/noun/input/output/axioms/params) mirrors component-registry's
//       own route/params shape, same mental model, no second vocabulary.

const { randomUUID } = require('crypto');

const BLUEPRINT_NAMESPACE_PATTERN = /^bp_\d{3}\.(comp|cli|ui|grammar|config|seam|doc|axiom)\.[a-z][a-z0-9_-]*$/;
const VALID_TYPES       = new Set(['organ', 'agent', 'tool', 'ui', 'cli', 'service']);
const VALID_TIERS       = new Set(['foundation', 'organ', 'registry', 'ui', 'integration']);
const VALID_RESOLUTION  = new Set(['L0', 'L1', 'L2', 'L3', 'L4', 'L5', null]);
const VALID_HOOK_TYPES  = new Set(['api', 'event_bus', 'cli', 'file_watch', 'sse', 'websocket', 'queue']);
const VALID_WIRE_TYPES  = new Set(['pipeline', 'data_flow', 'handshake', 'interaction_contract']);

// ── Descriptor schema ───────────────────────────────────────────────────────
// Required: uuid (blueprint-namespaced), componentId, type, capabilities[]
// (at least one), tier. Optional: aliases[], deps[], resolution.max_level.
const REQUIRED_FIELDS = ['uuid', 'componentId', 'type', 'capabilities', 'tier'];

function _validateEndpoint(ep, ci, ei) {
  const errors = [];
  if (!ep || typeof ep !== 'object') {
    return [`capabilities[${ci}].endpoints[${ei}] must be an object`];
  }
  if (!ep.hook_type || !VALID_HOOK_TYPES.has(ep.hook_type)) {
    errors.push(`capabilities[${ci}].endpoints[${ei}].hook_type must be one of ${[...VALID_HOOK_TYPES].join(',')}, got "${ep.hook_type}"`);
  }
  if (!ep.hook_id || typeof ep.hook_id !== 'string') {
    errors.push(`capabilities[${ci}].endpoints[${ei}].hook_id is required`);
  }
  if (!ep.intent || typeof ep.intent !== 'string') {
    errors.push(`capabilities[${ci}].endpoints[${ei}].intent is required`);
  }
  return errors;
}

function _validateWire(w, ci, wi) {
  const errors = [];
  if (!w || typeof w !== 'object') {
    return [`capabilities[${ci}].wires[${wi}] must be an object`];
  }
  if (!w.wire_type || !VALID_WIRE_TYPES.has(w.wire_type)) {
    errors.push(`capabilities[${ci}].wires[${wi}].wire_type must be one of ${[...VALID_WIRE_TYPES].join(',')}, got "${w.wire_type}"`);
  }
  if (!w.wire_id || typeof w.wire_id !== 'string') {
    errors.push(`capabilities[${ci}].wires[${wi}].wire_id is required`);
  }
  if (!w.intent || typeof w.intent !== 'string') {
    errors.push(`capabilities[${ci}].wires[${wi}].intent is required`);
  }
  if (!w.from || typeof w.from !== 'string') {
    errors.push(`capabilities[${ci}].wires[${wi}].from (source componentId or hook_id) is required`);
  }
  if (!w.to || typeof w.to !== 'string') {
    errors.push(`capabilities[${ci}].wires[${wi}].to (target componentId or hook_id) is required`);
  }
  return errors;
}

function _validateCapability(cap, i) {
  const errors = [];
  if (!cap || typeof cap !== 'object') {
    return [`capabilities[${i}] must be an object`];
  }
  if (!cap.verb || typeof cap.verb !== 'string') errors.push(`capabilities[${i}].verb is required`);
  if (!cap.noun || typeof cap.noun !== 'string') errors.push(`capabilities[${i}].noun is required`);
  if (!cap.intent || typeof cap.intent !== 'string') errors.push(`capabilities[${i}].intent is required`);
  if (cap.params !== undefined && !Array.isArray(cap.params)) {
    errors.push(`capabilities[${i}].params must be an array if present`);
  }
  if (cap.axioms !== undefined && !Array.isArray(cap.axioms)) {
    errors.push(`capabilities[${i}].axioms must be an array if present`);
  }
  if (cap.endpoints !== undefined) {
    if (!Array.isArray(cap.endpoints)) {
      errors.push(`capabilities[${i}].endpoints must be an array if present`);
    } else {
      cap.endpoints.forEach((ep, ei) => errors.push(..._validateEndpoint(ep, i, ei)));
    }
  }
  if (cap.wires !== undefined) {
    if (!Array.isArray(cap.wires)) {
      errors.push(`capabilities[${i}].wires must be an array if present`);
    } else {
      cap.wires.forEach((w, wi) => errors.push(..._validateWire(w, i, wi)));
    }
  }
  return errors;
}

function validateDescriptor(descriptor) {
  const errors = [];
  if (!descriptor || typeof descriptor !== 'object') {
    return { ok: false, errors: ['descriptor must be an object'] };
  }

  for (const f of REQUIRED_FIELDS) {
    if (descriptor[f] === undefined || descriptor[f] === null || descriptor[f] === '') {
      errors.push(`${f} is required`);
    }
  }

  if (descriptor.uuid && !BLUEPRINT_NAMESPACE_PATTERN.test(descriptor.uuid)) {
    errors.push(
      `uuid must be blueprint-namespaced: bp_NNN.<comp|cli|ui|grammar|config|seam|doc|axiom>.<name>, got "${descriptor.uuid}"`
    );
  }

  if (descriptor.componentId && !/^[a-z][a-z0-9]*(\.[a-z][a-z0-9_]*)+$/.test(descriptor.componentId)) {
    errors.push(`componentId must be namespace.name format, got "${descriptor.componentId}"`);
  }

  if (descriptor.type && !VALID_TYPES.has(descriptor.type)) {
    errors.push(`type must be one of ${[...VALID_TYPES].join(',')}, got "${descriptor.type}"`);
  }

  if (descriptor.tier && !VALID_TIERS.has(descriptor.tier)) {
    errors.push(`tier must be one of ${[...VALID_TIERS].join(',')}, got "${descriptor.tier}"`);
  }

  if (descriptor.capabilities !== undefined) {
    if (!Array.isArray(descriptor.capabilities) || descriptor.capabilities.length < 1) {
      errors.push('capabilities must be a non-empty array');
    } else {
      descriptor.capabilities.forEach((cap, i) => errors.push(..._validateCapability(cap, i)));
    }
  }

  if (descriptor.aliases !== undefined && !Array.isArray(descriptor.aliases)) {
    errors.push('aliases must be an array if present');
  }

  if (descriptor.deps !== undefined && !Array.isArray(descriptor.deps)) {
    errors.push('deps must be an array if present');
  }

  const maxLevel = descriptor.resolution?.max_level;
  if (maxLevel !== undefined && !VALID_RESOLUTION.has(maxLevel)) {
    errors.push(`resolution.max_level must be one of L0-L5 or null, got "${maxLevel}"`);
  }

  return { ok: errors.length === 0, errors };
}

// ── Projection: descriptor → component-registry shape ──────────────────────
// Phase 40.5's actual prerequisite: a real componentId + grammar array that
// component-registry.validate() accepts as-is. One descriptor capability
// becomes one component-registry entry — a descriptor with N capabilities
// projects to N registry entries, each carrying the descriptor's uuid as
// its registeredBy/blueprint trace, not silently flattened into one.
function projectToComponentRegistry(descriptor) {
  const { ok, errors } = validateDescriptor(descriptor);
  if (!ok) {
    return { ok: false, errors, projected: [] };
  }

  const [namespace] = descriptor.componentId.split('.');
  const projected = descriptor.capabilities.map((cap, i) => {
    const id = descriptor.capabilities.length > 1
      ? `${descriptor.componentId}.${cap.verb}`
      : descriptor.componentId;
    return {
      id,
      namespace,
      name:        cap.noun,
      version:     descriptor.version || '1.0.0',
      grammar:     [`${cap.verb} ${cap.noun}`, ...(descriptor.aliases || [])],
      route:       cap.route || { method: 'POST', path: `/api/${namespace}/${cap.verb}-${cap.noun}` },
      description: cap.description || cap.intent,
      params:      cap.params || [],
      tags:        [descriptor.tier, descriptor.type].filter(Boolean),
      comp_properties: {
        blueprintUuid: descriptor.uuid,
        descriptorCapabilityIndex: i,
        intent: cap.intent,
        axioms: cap.axioms || [],
        endpoints: (cap.endpoints || []).map(ep => ({ hook_type: ep.hook_type, hook_id: ep.hook_id, intent: ep.intent })),
        wires:     (cap.wires     || []).map(w  => ({ wire_type: w.wire_type,  wire_id: w.wire_id,   intent: w.intent, from: w.from, to: w.to })),
      },
      registeredBy: descriptor.uuid,
    };
  });

  return { ok: true, errors: [], projected };
}

// ── Bridge: descriptor capability → compartment-engine's required intent ───
// lib/compartment-engine.js's spawn({intent, ...}) throws without
// intent.uuid (line ~199: "spawn() requires a frozen intent with a uuid
// (Phase 45 output)"), and its constraint-frame assembly reads
// intent.verb/intent.domain for adversary-suite's cross-domain check and
// crystal-lattice's pattern signature (checked directly in spawn()'s body).
// This is the one real translation point between the descriptor system and
// the parent/child build layer — every chunk gets spawned through here, not
// hand-assembled per call site.
function toCompartmentIntent(descriptor, capabilityIndex = 0) {
  const cap = descriptor.capabilities?.[capabilityIndex];
  if (!cap) {
    throw new Error(`[component-descriptor] no capability at index ${capabilityIndex} on ${descriptor?.uuid || '(no uuid)'}`);
  }
  return {
    uuid:        randomUUID(),
    verb:        cap.verb,
    domain:      cap.noun,
    description: cap.intent,
    source:      descriptor.uuid,
  };
}

// ── Bridge: a fixed sections[] model → a valid descriptor ──────────────────
// idearium/index.js already has a real, working, fixed spec model —
// SECTION_IDS = ['intent','api_callto','module_hooks','cli_spec','schemas',
// 'gap_contract','failure_modes','tests','phase_map'] — feeding a real
// compile pipeline (idearium/api/index.js's spec.build case →
// compileIdeariumSpec() → emerge/compiler T0/T1, already wired, already
// working). That's a different, narrower shape than this file's own
// capabilities[] (verb/noun/intent/endpoints/wires) — checked directly
// before building anything, not assumed compatible. Rather than invent a
// second, competing spec format, each fixed section becomes one
// capability here: verb 'write', noun = the section id, intent = a plain
// description of what that section is for. One compartment per section.
// On PASS, the caller (idearium/api/index.js, which already has `os` in
// scope) writes the built content back into that exact section via the
// existing idearium.spec.update event — the compile pipeline keeps working
// unmodified, now fed by compartment-built content instead of only
// hand-typed form content.
const SECTION_INTENTS = {
  intent:        'state what this component/capability is for and why it exists',
  api_callto:    'declare how other components call into this one',
  module_hooks:  'declare lifecycle hooks this module responds to',
  cli_spec:      'declare the CLI surface this component exposes',
  schemas:       'declare the data shapes this component reads and writes',
  gap_contract:  'declare what gap types this component can open or close',
  failure_modes: 'enumerate how this component can fail and what happens then',
  tests:         'declare what proves this component actually works',
  phase_map:     'declare where this component sits in the build order',
};

function descriptorFromSections(sections, meta) {
  if (!Array.isArray(sections) || sections.length === 0) {
    throw new Error('[component-descriptor] descriptorFromSections requires a non-empty sections array');
  }
  return {
    uuid:        meta.uuid,
    componentId: meta.componentId,
    type:        meta.type || 'tool',
    tier:        meta.tier || 'registry',
    version:     meta.version,
    capabilities: sections.map(s => ({
      verb:  'write',
      noun:  s.id,
      intent: SECTION_INTENTS[s.id] || `write the ${s.id} section of this spec`,
    })),
  };
}

function getSchema() {
  return {
    id: 'SCHEMA-COMPONENT-DESCRIPTOR',
    name: 'ComponentDescriptor',
    requiredFields: REQUIRED_FIELDS,
    blueprintNamespacePattern: BLUEPRINT_NAMESPACE_PATTERN.toString(),
    validTypes: [...VALID_TYPES],
    validTiers: [...VALID_TIERS],
    validResolutionLevels: [...VALID_RESOLUTION].filter(Boolean),
    validHookTypes: [...VALID_HOOK_TYPES],
    validWireTypes: [...VALID_WIRE_TYPES],
  };
}

module.exports = {
  validateDescriptor,
  projectToComponentRegistry,
  toCompartmentIntent,
  descriptorFromSections,
  getSchema,
  MODULE_ID: 'component-descriptor',
  VERSION:   '1.1.0',
};
