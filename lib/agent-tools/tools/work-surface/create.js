'use strict';
/**
 * lib/agent-tools/tools/work-surface/create.js
 *
 * §MCO20 2026-09-13 — James: "cos type or template for a Work surface
 * query or operating table... build everything you can to get [nexus]
 * coding massive repos autonomously." Real tool wrapper around
 * lib/work-surface.js's createWorkSurface() — usable by copilot, agent-
 * mesh, and BrainOS alike (all three reach the same real lib/agent-tools
 * catalog, not three separate implementations).
 */
const { createWorkSurface, exportWorkSurface } = require('../../../work-surface.js');
const path = require('path');

module.exports = {
  name: 'create_work_surface',
  description:
    'Build a real operating table for a large file — its real line count, byte count, and non-' +
    'overlapping chunk boundaries covering the WHOLE file (never truncated). Use this before working ' +
    'on a file too large to read in one pass, then call get_work_surface_chunk for each chunk\'s real ' +
    'content in turn. Persists a real .worksurface node (metadata only, no file content stored) so the ' +
    'chunk plan survives across calls.',
  parameters: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'real, absolute or resolvable path to the file' },
      chunkLines: { type: 'number', description: 'lines per chunk, default 150' },
    },
    required: ['path'],
  },
  execute: async (a) => {
    if (!a.path) return { error: 'path required' };
    const ws = createWorkSurface(a.path, { chunkLines: a.chunkLines });
    if (!ws.ok) return { error: ws.reason };
    try {
      const dataDir = path.join(__dirname, '..', '..', '..', '..', 'data', 'nodes', 'worksurface');
      exportWorkSurface(ws, dataDir, { system: 'copilot' });
    } catch (e) {
      // §HONEST — the node write is a durability convenience, not the
      // real answer this tool exists to give; a failed write here must
      // not hide the real, already-computed work surface from the caller.
      return { ok: true, ...ws, nodeWriteWarning: e.message };
    }
    return { ok: true, uuid: ws.uuid, path: ws.path, lineCount: ws.lineCount, byteCount: ws.byteCount, chunkCount: ws.chunkCount, chunks: ws.chunks.map(c => ({ index: c.index, startLine: c.startLine, endLine: c.endLine, lineCount: c.lineCount })) };
  },
};
