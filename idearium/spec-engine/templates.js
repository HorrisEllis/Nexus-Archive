/**
 * idearium/spec-engine/templates.js — Spec Template Registry
 * UUID: nexus-idearium-templates-v1-0000-2026-0710-jamesbrooks-001
 * Version: 1.1.0
 *
 * §ADDENDUM 2026-07-11 — five new templates (architecture, schemas,
 * checklists, axioms, compartments) alongside the original four kind-
 * templates + genesis. Each seeds a different subset of SPEC_SECTIONS via
 * `## SECTION: <id>` markers (see spec-engine/index.js's
 * _seedSectionsFromTemplate) — pick several together (spec-engine.createSpec
 * now takes templateIds[], not just one) to compose a spec whose sections
 * come from more than one template at once. compartments.spec is designed
 * to be promoted to a repository the moment it's seeded, before any
 * component code exists — see its own header comment.
 *
 * §NEW — first-page template picker needs a real list to render, not a
 * hardcoded 4-string dropdown. Each entry maps to a `type` createSpec()
 * already accepts (it was free-text before, this is what constrains it),
 * plus an optional seedFile — a real .spec/.md file whose content is
 * used to deterministically pre-fill whichever chunks it can, so those
 * chunks skip the agent dispatch entirely (the actual token-reduction
 * lever — see spec-engine/index.js's `_seedChunksFromTemplate`).
 *
 * Templates with no seedFile behave exactly as before: every chunk goes
 * through normal agent dispatch. Nothing is removed, only added to.
 */

'use strict';

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname_ = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_ROOT = path.join(__dirname_, 'templates');

const TEMPLATES = Object.freeze([
  {
    id:          'system',
    kind:        'system',
    label:       'New System',
    description: 'A full sovereign system — kernel, engine, runtime, own ledger, own compartments.',
    seedFile:    null,
  },
  {
    id:          'codebase',
    kind:        'codebase',
    label:       'New Codebase',
    description: 'A standalone repo-scale project — not necessarily sovereign, but multi-module.',
    seedFile:    null,
  },
  {
    id:          'library',
    kind:        'library',
    label:       'New Library',
    description: 'A reusable, dependency-free package other systems import — like WARP itself.',
    seedFile:    null,
  },
  {
    id:          'module-component',
    kind:        'component',
    label:       'New Module / Component',
    description: 'The smallest unit — one file, one intent, dropped into an existing system.',
    seedFile:    null,
  },
  {
    id:          'genesis',
    kind:        'system',
    label:       'Genesis (sovereign, WARP-spined)',
    description: 'Scaffold a new sovereign system directly from genesis.spec — kernel-as-Stream, ' +
                 'schema-baseline axioms, seam/contract split, associative lattice, nerve, tv-ui, pulse.',
    seedFile:    'genesis.spec',
  },
  // §ARCHITECTURE TEMPLATES 2026-07-11 — expansion beyond the four "what kind
  // of thing is this" templates above. These seed structural determinism
  // (folder layout, build order, canonical schema/axiom/checklist shape)
  // rather than a project kind — pick one alongside a kind template, or
  // stand alone to draw the map before any component gets built.
  {
    id:          'architecture',
    kind:        'structure',
    label:       'Architecture / Structure Map',
    description: 'Deterministic folder layout + bottom-up build order (§3.1) — fixes "where does ' +
                 'this go" once, before component chunks are built.',
    seedFile:    'architecture.spec',
  },
  {
    id:          'schemas',
    kind:        'schema',
    label:       'Schema Baseline',
    description: 'Canonical data-schema shape — entity/uuid/fields/constraints/decay-tier — so every ' +
                 'spec\'s schema chunk seeds from the same fixed template instead of a freehand guess.',
    seedFile:    'schemas.spec',
  },
  {
    id:          'checklists',
    kind:        'checklist',
    label:       'Verification Checklists',
    description: 'Standing tests + failure-mode checklists (evidence tiers PARSES→CONTRACT) applied ' +
                 'to every spec the same way, deterministically.',
    seedFile:    'checklists.spec',
  },
  {
    id:          'axioms',
    kind:        'axioms',
    label:       'Axioms (AXIOMS-v1.0, canonical)',
    description: 'The full standing axiom set, restated once — every spec\'s "axioms" chunk seeds from ' +
                 'this instead of an agent re-deriving or forgetting the ruleset.',
    seedFile:    'axioms.spec',
  },
  {
    id:          'compartments',
    kind:        'system',
    label:       'Compartment Map (map first, into a repository)',
    description: 'Declares compartment/seam/gate boundaries and is meant to be promoted to a ' +
                 'repository immediately — the map drawn first, components filled in after.',
    seedFile:    'compartments.spec',
  },
]);

function listTemplates() {
  return TEMPLATES.map(({ id, kind, label, description, seedFile }) =>
    ({ id, kind, label, description, hasSeed: !!seedFile }));
}

function getTemplate(id) {
  return TEMPLATES.find(t => t.id === id) || null;
}

/**
 * readSeed — returns the raw text of a template's seed file, or null if
 * the template has none. Never throws on a missing template; the caller
 * (createSpec) treats a null seed as "dispatch every chunk normally."
 */
function readSeed(id) {
  const tpl = getTemplate(id);
  if (!tpl || !tpl.seedFile) return null;
  const p = path.join(TEMPLATES_ROOT, tpl.seedFile);
  try {
    return fs.readFileSync(p, 'utf8');
  } catch (e) {
    console.warn(`[idearium/templates] seed file unreadable for '${id}': ${e.message}`);
    return null;
  }
}

export { TEMPLATES, listTemplates, getTemplate, readSeed };
