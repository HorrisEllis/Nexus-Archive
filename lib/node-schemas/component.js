'use strict';
// lib/node-schemas/component.js — real schema for the .component node type.
// UUID: nexus-node-schema-component-v1-0000-2026-0903-001
// §SPLIT 2026-09-03 — see hat.js's header for the split rationale.

const { COMPONENT_SCHEMA } = require('../../loom/schema/definitions.js');

module.exports = {
  status: 'REAL',
  source: 'loom/schema/definitions.js — COMPONENT_SCHEMA (real, enforced by componentDeclareGate)',
  fields: {
    id:        { type: 'string', required: true,  description: COMPONENT_SCHEMA.types.id },
    namespace: { type: 'string', required: true,  description: 'component namespace' },
    name:      { type: 'string', required: true,  description: 'component display/file name' },
    version:   { type: 'string', required: true,  description: 'semver-ish version string' },
    dir:       { type: 'string', required: false, description: 'optional real filesystem path, added by SB1' },
    uuid:      { type: 'string', required: true,  description: 'enforced by the loom.uuid-present Axiom, not this schema' },
  },
};
