'use strict';
// ── lib/component-descriptor.js — Phase 40 foundation ───────────────────────
// UUID: nexus-component-descriptor-v1-0000-4000-0000-000000000001
// Version: 1.0.0
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
// §1.1  Nothing exists until proven — validate() is real, tested against
//       real inputs, not a stub that always returns ok:true.
// §1.3  No placeholder projection — projectToComponentRegistry() produces
//       output that component-registry's own validate() actually accepts,
//       proven in tests/modules/component-descriptor.test.js, not assumed.
// §5.6  Structural self-similarity — a descriptor's capabilities[] shape
//       (verb/noun/input/output/axioms/params) mirrors component-registry's
//       own route/params shape, same mental model, no second vocabulary.

const BLUEPRINT_NAMESPACE_PATTERN = /^bp_\d{3}\.(comp|cli|ui|grammar|config|seam|doc|axiom)\.[a-z][a-z0-9_-]*$/;
const VALID_TYPES       = new Set(['organ', 'agent', 'tool', 'ui', 'cli', 'service']);
const VALID_TIERS       = new Set(['foundation', 'organ', 'registry', 'ui', 'integration']);
const VALID_RESOLUTION  = new Set(['L0', 'L1', 'L2', 'L3', 'L4', 'L5', null]);

// ── Descriptor schema ───────────────────────────────────────────────────────
// Required: uuid (blueprint-namespaced), componentId, type, capabilities[]
// (at least one), tier. Optional: aliases[], deps[], resolution.max_level.
const REQUIRED_FIELDS = ['uuid', 'componentId', 'type', 'capabilities', 'tier'];

function _validateCapability(cap, i) {
  const errors = [];
  if (!cap || typeof cap !== 'object') {
    return [`capabilities[${i}] must be an object`];
  }
  if (!cap.verb || typeof cap.verb !== 'string') errors.push(`capabilities[${i}].verb is required`);
  if (!cap.noun || typeof cap.noun !== 'string') errors.push(`capabilities[${i}].noun is required`);
  if (cap.params !== undefined && !Array.isArray(cap.params)) {
    errors.push(`capabilities[${i}].params must be an array if present`);
  }
  if (cap.axioms !== undefined && !Array.isArray(cap.axioms)) {
    errors.push(`capabilities[${i}].axioms must be an array if present`);
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
      description: cap.description || `${cap.verb} ${cap.noun} (projected from descriptor ${descriptor.uuid})`,
      params:      cap.params || [],
      tags:        [descriptor.tier, descriptor.type].filter(Boolean),
      comp_properties: {
        blueprintUuid: descriptor.uuid,
        descriptorCapabilityIndex: i,
        axioms: cap.axioms || [],
      },
      registeredBy: descriptor.uuid,
    };
  });

  return { ok: true, errors: [], projected };
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
  };
}

module.exports = {
  validateDescriptor,
  projectToComponentRegistry,
  getSchema,
  MODULE_ID: 'component-descriptor',
  VERSION:   '1.0.0',
};
