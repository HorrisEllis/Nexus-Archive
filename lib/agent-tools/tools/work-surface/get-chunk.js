'use strict';
/**
 * lib/agent-tools/tools/work-surface/get-chunk.js
 *
 * §MCO20 2026-09-13 — real counterpart to create_work_surface: fetches
 * one chunk's real content, re-derived from the file on disk (never a
 * cached/stale copy), so an agent can work through a massive file
 * section by section without ever needing the whole thing in context.
 */
const { getChunkContent } = require('../../../work-surface.js');

module.exports = {
  name: 'get_work_surface_chunk',
  description:
    'Get one chunk\'s real content from a file\'s work surface, by chunk index (from ' +
    'create_work_surface\'s chunks array). Re-reads the real file — always current, never a stale ' +
    'cached copy — so if the file changed since the work surface was created, the content you get ' +
    'back reflects that.',
  parameters: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'the same real file path used with create_work_surface' },
      chunkIndex: { type: 'number', description: 'which chunk to fetch, 0-indexed' },
      chunkLines: { type: 'number', description: 'must match the chunkLines used to create the work surface, default 150' },
    },
    required: ['path', 'chunkIndex'],
  },
  execute: async (a) => {
    if (!a.path) return { error: 'path required' };
    if (typeof a.chunkIndex !== 'number') return { error: 'chunkIndex required' };
    const chunk = getChunkContent(a.path, a.chunkIndex, { chunkLines: a.chunkLines });
    if (!chunk.ok) return { error: chunk.reason };
    return chunk;
  },
};
