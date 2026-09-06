'use strict';
// lib/node-schemas/idea.js — real schema for the .idea node type.
// UUID: nexus-node-schema-idea-v1-0000-2026-0903-001
//
// §BUILT 2026-09-03 — James: "make that node type" (.idea), named this
// same session as the missing first link in idea -> spec compiler ->
// compartment/repo -> chunks -> dispatch -> versionium. Its own file
// from the start, per James's own standing instruction ("each schema is
// it's own file") — see hat.js's header for the split rationale hat/
// component/node were supposed to follow.
//
// Grounded in idearium/index.js's real IdeaCreateGate.transform() — the
// actual object every real idea is, not a guess at what one might
// contain.

module.exports = {
  status: 'REAL',
  source: 'idearium/index.js — IdeaCreateGate.transform()\'s real idea object (idearium.idea.create), the only real construction site',
  fields: {
    uuid:          { type: 'string', required: true,  description: 'real uuid, assigned at creation' },
    slug:          { type: 'string', required: true,  description: 'real, derived from text — lowercase, punctuation stripped, 50 chars max' },
    text:          { type: 'string', required: true,  description: 'the real idea text, trimmed' },
    tags:          { type: 'array',  required: false, description: 'real, user-supplied — the same field this whole schema/export system\'s own tagged-query support reads from' },
    phase:         { type: 'string', required: true,  description: "real phase — starts 'seed', per idearium.spec's real phases:[seed,expanding,tensioned,specced,building,complete]" },
    tension:       { type: 'number', required: true,  description: 'real, starts 0, updated by the real tension engine' },
    parentIdea:    { type: 'any',    required: false, description: 'real uuid of the idea this one branched from, null if none' },
    linkedSpec:    { type: 'any',    required: false, description: 'real spec-engine spec uuid once this idea reaches the spec-compiler phase, null until then' },
    resonanceWith: { type: 'array',  required: false, description: 'real uuids — the associative-lattice edges (_latticeAdd), not the causal graph' },
    tensionWith:   { type: 'array',  required: false, description: 'real uuids — ideas in real tension with this one' },
    compartment:   { type: 'any',    required: false, description: 'real compartment id once one exists for this idea, null until then' },
    source:        { type: 'string', required: true,  description: "real origin — 'cli' default, or whatever the real caller passed" },
    causedBy:      { type: 'any',    required: false, description: 'real uuid of the event/idea that caused this one to exist, null if none — the causal-graph edge' },
    createdAt:     { type: 'number', required: true,  description: 'real timestamp' },
    updatedAt:     { type: 'number', required: true,  description: 'real timestamp' },
  },
};
