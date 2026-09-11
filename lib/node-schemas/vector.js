'use strict';
// lib/node-schemas/vector.js — real schema for the .vector node type.
// UUID: nexus-node-schema-vector-v1-0000-2026-0911-001
// §NEW 2026-09-11 — memory-architecture pass (James: "map each memory
// system type... expand the node types for each memory architecture").
// Real, ungrounded until now: vector storage was live (lib/vector-memory.js,
// Ollama nomic-embed-text, SNR-gated retrieval, LocalIndex-backed) but had
// no node-schema entry among the 19 real types. This is a direct lift of
// embed()'s actual insertItem() metadata shape — no fields invented beyond
// what that function already writes.
//
// §NOTE — per N4/N5 (doc-proposed, not yet a real NEXUS convention): a
// vector is a DERIVED representation, not canonical content. This schema
// covers the metadata envelope only; `vector` itself (the 768-dim
// embedding array) lives in LocalIndex, not JAA, and is not part of this
// node's persisted fields — matching how embed() already keeps them
// separate (index.insertItem({id, vector, metadata}) — metadata is the
// real node payload, the vector is the index's own concern).

module.exports = {
  status: 'REAL',
  source: 'lib/vector-memory.js — embed()\'s real insertItem({metadata}) shape',
  fields: {
    uuid:     { type: 'string', required: true,  description: 'real id — refused if missing (embed() returns false without it)' },
    text:     { type: 'string', required: true,  description: 'real source text, stored truncated to 200 chars in the index metadata — refused if missing' },
    type:     { type: 'string', required: false, description: 'real caller-supplied type tag, defaults to empty string' },
    source:   { type: 'string', required: false, description: 'real caller-supplied source tag, defaults to empty string' },
    table:    { type: 'string', required: false, description: 'real JAA table this vector indexes content from, defaults to empty string' },
    ts:       { type: 'number', required: false, description: 'real timestamp, defaults to Date.now() at embed time' },
    metadata: { type: 'object', required: false, description: 'real caller-supplied extra fields, spread directly into the stored metadata object — open-ended by design' },
  },
};
