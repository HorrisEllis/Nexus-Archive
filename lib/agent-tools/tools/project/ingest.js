'use strict';
/**
 * lib/agent-tools/tools/project/ingest.js
 *
 * §NEW 2026-09-15 — James: "I want nexus to be able to do what you do
 * when I upload a project... the work surface is for working on any
 * codebase, system, component, any project." Wraps lib/project-
 * ingest.js the same real way create_work_surface wraps lib/work-
 * surface.js — usable by copilot, agent-mesh, and BrainOS alike (all
 * three reach the same real lib/agent-tools catalog, not three separate
 * implementations — same convention already established there).
 *
 * §REAL GAP THIS CLOSES, confirmed by direct comparison, not assumed:
 * lib/agent-tools/tools/query/file-tree.js's own PROJECT_ROOT is
 * hardcoded to NEXUS's own codebase, with a containment check that
 * REJECTS any path outside it — it cannot look at an externally
 * uploaded project at all. lib/repo-manifest.js tracks which
 * compartments touched an Idearium repo over time, not a codebase's
 * shape. Neither does git history. This tool is the first one in the
 * real catalog that can be pointed at an arbitrary external directory.
 *
 * Deliberately thin: this tool does NOT decide what's relevant or
 * summarize the project — that's Copilot/Cortex's real dual-cognition
 * job, dispatched separately. This gives an agent the same first-five-
 * minutes inventory a human investigator builds by hand: real file
 * tree, real git history, and a real per-file chunk plan (via lib/
 * work-surface.js, not a second chunker) — nothing more, nothing
 * fabricated about what the project actually does.
 */
const { ingest } = require('../../../project-ingest.js');

module.exports = {
  name: 'ingest_project',
  description:
    'Build a real, whole-project inventory for an arbitrary external directory — NOT limited to this ' +
    'NEXUS codebase (unlike file_tree, which is scoped to it). Returns the real file tree by extension, ' +
    'real git history (commit count, author breakdown, date range) if the directory is a git repo, and a ' +
    'real per-file chunk plan (via the same work-surface mechanism as create_work_surface) for every ' +
    'chunkable file, so a massive or unfamiliar project can be paged through safely instead of read ' +
    'whole. Each chunked file includes absPath — pass THAT (not relPath) to get_work_surface_chunk to ' +
    'fetch real content, no path reconstruction needed. ' +
    'chunkable file, so a massive or unfamiliar project can be paged through safely instead of read whole. ' +
    'Use this FIRST when asked to work on an uploaded or externally-referenced project; use get_work_surface_chunk ' +
    'afterward to read one specific file\'s content, one chunk at a time.',
  parameters: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'real, absolute path to the project root directory' },
      chunk: { type: 'boolean', description: 'whether to build a chunk plan for every chunkable file (default true); set false for a fast, chunk-free first pass on a very large tree' },
      chunkLines: { type: 'number', description: 'lines per chunk, default 150 (same default as create_work_surface)' },
    },
    required: ['path'],
  },
  execute: async (a) => {
    if (!a.path) return { error: 'path required' };
    try {
      const result = ingest(a.path, { chunk: a.chunk !== false, chunkLines: a.chunkLines });
      return { ok: true, ...result };
    } catch (e) {
      // §HONEST — a real, named failure (path doesn't exist, tree too
      // large per MAX_FILES) is returned as data, not thrown past the
      // caller, matching every other real tool in this catalog.
      return { ok: false, error: e.message };
    }
  },
};
