'use strict';
/**
 * lib/project-import.config.js — every tunable for the "Upload Project"
 * pipeline (lib/project-container.js + lib/zip-ingest.js + the
 * ui/import-project screen), in one place.
 *
 * James: "make this fully configurable in a config file." Nothing in
 * project-container.js or the import-archive route should hardcode a
 * bound, a git identity, or the example-intent copy shown in the
 * prompt — it all reads from here, so changing behavior is an edit to
 * this file, not a code change hunted across three modules.
 *
 * All values are overridable via env var (matches this codebase's
 * existing convention — see intent-classifier.js's
 * NEXUS_INTENT_CONFIDENCE_FLOOR) so a deploy can tune bounds without a
 * code edit either.
 */

const path = require('path');

const num = (envVal, fallback) => {
  const n = Number(envVal);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

// §MCO-F 2026-09-15 — James: "limit 500 for chunks needs to change. have
// that as an option in the configuration file in idearium." The real,
// live-adjustable value now lives in idearium/lib/config.js's
// idearium.config.chunk_cap (table 'idearium_config', copilot-writable,
// bounds 1-5000 — see that file). This CJS module can't `import` that
// ESM file directly (idearium/ is type:module, lib/ isn't), so it reads
// the exact same persisted row straight off cortex's shared store — one
// real value, two entry points, never two copies that can drift. Falls
// through to the env var, then the 500 default, only when no row has
// been written yet (fresh install, config.set() never called).
const ENV_MAX_FILES_FALLBACK = num(process.env.NEXUS_PROJECT_IMPORT_MAX_FILES, 500);
function liveChunkCap() {
  try {
    const { jaaDB } = require('../cortex/memory/jaa-db');
    const row = jaaDB.getById('idearium_config', 'idearium-config-singleton');
    const v = row && row.values && row.values.chunk_cap;
    return num(v, ENV_MAX_FILES_FALLBACK);
  } catch (_) {
    // cortex store not reachable (e.g. this module loaded standalone,
    // outside a running NEXUS process) — env/default fallback, never a throw.
    return ENV_MAX_FILES_FALLBACK;
  }
}

module.exports = {
  // ── Compartment spawned for the lifetime of the upload flow ──────────
  // budget/boundary shape must match compartment-engine.js's
  // _assembleConstraintFrame() expectations exactly (budget.tokens/
  // timeMs/irreversibleOpsAllowed, boundary.description/paths/systems)
  // — this is real frame content, not decoration.
  COMPARTMENT: {
    budget: {
      tokens: num(process.env.NEXUS_PROJECT_IMPORT_TOKEN_BUDGET, null),
      timeMs: num(process.env.NEXUS_PROJECT_IMPORT_TIME_BUDGET_MS, 30 * 60 * 1000), // 30 min to go from prompt -> drop -> import
      irreversibleOpsAllowed: false, // a project import never needs delete/rollback/overwrite of anything outside its own new repo dir
    },
    boundary: {
      description: 'idearium project-import: may create a new repo directory and its manifest/project.json/.git; touches nothing else',
      paths: ['idearium/data/projects/*'],
      systems: ['idearium'],
    },
    // A container left AWAITING_UPLOAD this long (browser tab closed
    // mid-flow, network died on the way to /import) auto-cancels via
    // sweepStale() — see project-container.js's own header for why this
    // isn't wired to a timer inside that module.
    staleAfterMs: num(process.env.NEXUS_PROJECT_IMPORT_STALE_MS, 20 * 60 * 1000),
  },

  // ── where an imported project's repo directory physically lives ──────
  // James: "i want it to create the compartment in idearium's repo
  // folder" — idearium/repo/repos/<repoUuid>, inside this module's own
  // directory, rather than RepoLayer's own default (idearium/data/
  // projects/<repoUuid>, still used by every other ingest path — drop/
  // promote/fork — unaffected by this). __dirname here is lib/, so
  // '..' is this repo's root (nexus/nexus/) — idearium/repo/repos sits
  // beside idearium/repo/index.js, the module that owns this directory.
  REPO_STORAGE: {
    dir: process.env.NEXUS_PROJECT_IMPORT_REPO_DIR || path.join(__dirname, '..', 'idearium', 'repo', 'repos'),
  },

  // ── manifest.json written into the repo dir at finalize ──────────────
  MANIFEST: {
    version: '1.0.0',
    layer: 'idearium',
  },

  // ── project.json written into the repo dir at finalize ───────────────
  PROJECT_JSON: {
    version: '1.0.0',
  },

  // ── real `git init` + first commit ────────────────────────────────────
  GIT: {
    binary: process.env.NEXUS_GIT_BINARY || 'git',
    defaultBranch: process.env.NEXUS_PROJECT_IMPORT_GIT_BRANCH || 'main',
    authorName:  process.env.NEXUS_PROJECT_IMPORT_GIT_AUTHOR_NAME  || 'NEXUS Idearium',
    authorEmail: process.env.NEXUS_PROJECT_IMPORT_GIT_AUTHOR_EMAIL || 'idearium@nexus.local',
    commitMessage: (name) => `Import: ${name}`,
  },

  // ── zip extraction bounds (lib/zip-ingest.js) ─────────────────────────
  // §SHARED — these are the one real set of bounds for turning an
  // uploaded zip into repo files. idearium/api/index.js's
  // repo.import-archive route and project-container's "Import
  // Repository" step both read these, rather than each hardcoding its
  // own copy (which is exactly the drift zip-ingest.js's own header
  // calls out as the thing being fixed).
  ZIP: {
    // maxFiles is a live getter, not a baked-in number — every read (each
    // zip-ingest.js call gets its own fresh module.exports.ZIP.maxFiles
    // access) reflects whatever idearium.config.chunk_cap currently is,
    // so raising the cap through the config API takes effect on the next
    // import with no restart. §MCO-F gate: "chunk_cap changes the real
    // 500-cap live."
    get maxFiles() { return liveChunkCap(); },
    maxBytesPerFile:  num(process.env.NEXUS_PROJECT_IMPORT_MAX_BYTES_PER_FILE, 200 * 1024),   // 200 KB/file
    maxTotalBytes:    num(process.env.NEXUS_PROJECT_IMPORT_MAX_TOTAL_BYTES, 20 * 1024 * 1024), // 20 MB/import
    skipDirs: ['node_modules', '.git', '.svn', 'dist', 'build', '__pycache__', '.next'],
    textExt:  ['.js', '.ts', '.jsx', '.tsx', '.json', '.md', '.txt', '.py', '.html', '.css', '.yml', '.yaml', '.spec', '.sh'],
  },

  // ── files the "Upload Project" prompt shows as example end-state goals ──
  // Not decorative copy — every example here is written to actually hit a
  // real DOMAIN_PATTERNS/VERB_PATTERNS regex in lib/intent-classifier.js
  // (build/write/fix.../analyze/explain/validate), so classify() gives a
  // real, non-fallback intent for whichever one the user reuses verbatim,
  // rather than shipping an example that would silently classify as a
  // last-resort default.
  INTENT_EXAMPLES: [
    'Fix and validate the broken build pipeline',
    'Refactor the API layer for clarity',
    'Document how this module actually works',
    'Analyze the codebase for technical debt',
    'Build out the missing test coverage',
    'Diagnose why the import keeps failing',
  ],
};
