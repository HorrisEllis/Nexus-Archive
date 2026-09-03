'use strict';
/**
 * cortex/core/raid/contract-boundary.js — real boundary registry + resolver
 * comp_id: cortex.raid.contract-boundary
 * uuid: nexus-cortex-raid-contract-boundary-v1-0000-2026-0902-jamesbrooks-001
 * Version: 0.1.0
 *
 * §BUILT 2026-09-02 — docs/contracts/synthesis-contract.spec's `boundary`
 * block (primitive + invariants[] + principles[]) and docs/contracts/
 * context-synthesis-pipeline.spec's `real_rows` (stage_2_schema_registry),
 * made real: a lookup keyed `${source}:${intention}` — NOT `${system}:...`,
 * corrected against contract-intake.js's own real submitContract() call
 * sites, none of which ever set opts.system (grep-checked, all 5).
 *
 * §HONEST SCOPE — exactly the 4 real (source, intention) pairs that exist
 * in this codebase today (self-heal:heal, idearium:build, agent-mesh:build,
 * copilot:build — every real submitContract() call site, confirmed by
 * grep, not a partial sample). No speculative rows added ahead of real
 * traffic, per IC3_intention_taxonomy_per_system's own sequencing rule
 * (docs/2026-08-30-interaction-contract-context-phasemap.spec).
 *
 * §PRIMITIVE FIELD — per synthesis-contract.spec's corrected boundary.
 * primitive note: 2 of these 4 (self-heal, agent-mesh) have no HTTP
 * route and are NOT loom-registered — confirmed by direct read of
 * lib/component-registry.js's register(), which hard-requires
 * route:{method,path} in validate(), not defaultable. Fabricating a
 * route for a non-routed internal module would violate §1.1 ("nothing
 * pretends to work"). primitive below is a confirmed-real module/
 * function path in every row, never a loom id these two don't have.
 */

const REGISTRY = {
  'self-heal:heal': {
    primitive:  'cortex/self-heal (MODULE_ID)',
    invariants: [],
    principles: ['§1.2'],
  },
  'idearium:build': {
    primitive:  'idearium.spec-engine (MODULE_ID)',
    invariants: [],
    principles: ['§2.2', '§3.1'],
  },
  'agent-mesh:build': {
    primitive:  'cortex/core/raid/contract-intake.js#submitBuildPhaseContract',
    invariants: [],
    principles: ['§3.1'],
  },
  // §BUGFIX 2026-09-03 — found while investigating "RAID keeps failing
  // contracts": officiator.js (2026-09-02) submits with source
  // 'officiator-synthesis-tool' and 'officiator-synthesis-tool' (see
  // synthesizeFromContext) but was never added here, so every real
  // synthesized contract logged "no registered boundary" on every
  // submission — not a hard failure (§1.2's own design: unregistered
  // is real, inspectable information, not a swallowed gap), but a real,
  // easy-to-close gap directly adjacent to the SEAM VERDICT fix in the
  // same file this session, added while already here for it.
  'officiator:build': {
    primitive:  'cortex/core/raid/officiator.js#officiate',
    invariants: [],
    principles: ['§3.1'],
  },
  'officiator-synthesis-tool:build': {
    primitive:  'cortex/core/raid/officiator.js#synthesizeFromContext',
    invariants: [],
    principles: ['§3.1'],
  },
  'copilot:build': {
    primitive:  'copilot/server.js /build handler',
    invariants: [],
    principles: ['§1.2'],
  },
};

function resolveBoundary(source, intention) {
  if (!source || !intention) return null;
  const key = `${source}:${intention}`;
  const row = REGISTRY[key];
  return row ? { key, ...row } : null;
}

function listBoundaries() {
  return Object.entries(REGISTRY).map(([key, row]) => ({ key, ...row }));
}

module.exports = { resolveBoundary, listBoundaries, REGISTRY };
