/**
 * idearium/spec-engine/templates.js — Spec Template Registry
 * UUID: nexus-idearium-templates-v1-0000-2026-0710-jamesbrooks-001
 * Version: 1.0.0
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
