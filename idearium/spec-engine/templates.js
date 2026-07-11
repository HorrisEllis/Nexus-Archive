/**
 * idearium/spec-engine/templates.js — Spec Template Registry
 * UUID: nexus-idearium-templates-v1-0000-2026-0710-jamesbrooks-001
 * Version: 1.1.0
 *
 * §NEW — first-page template picker needs a real list to render, not a
 * hardcoded 4-string dropdown. Each entry maps to a `type` createSpec()
 * already accepts (it was free-text before, this is what constrains it),
 * plus an optional seedFile — a real .spec/.md file whose content is
 * used to deterministically pre-fill whichever chunks it can, so those
 * chunks skip the agent dispatch entirely (the actual token-reduction
 * lever — see spec-engine/index.js's `_seedFromTemplate`).
 *
 * §EXPANDED 2026-07-11 — "utilize templates of different architectures."
 * Added the named-architecture set from the wizard scoping conversation:
 * Minimal Kernel / API Service / Event System / Plugin Runtime / AI Agent
 * System / Custom (Full Nexus was already covered by 'genesis' below —
 * renamed its label so it's addressable by that name too, not duplicated).
 *
 * Every new seedFile is a REAL excerpt copied verbatim from an already-
 * authored, already-uploaded spec — never fabricated. Per SYSTEM_SPEC_v1_0_0's
 * own axiom #1 ("nothing pretends to work — no stubs, no mocks"), inventing
 * plausible-looking architecture content for a template would be exactly
 * that. Each seed file's header comment records its exact source (file +
 * line range) so the provenance is auditable, not asserted.
 *
 * `seedSection` — which SPEC_SECTIONS id the seed's content fills. Defaults
 * to 'meta' (genesis's existing behavior, unchanged). The new templates
 * seed a section whose content actually matches what was extracted, instead
 * of forcing everything through 'meta' the way a single-seed system would.
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
    seedSection: 'meta',
  },
  {
    id:          'codebase',
    kind:        'codebase',
    label:       'New Codebase',
    description: 'A standalone repo-scale project — not necessarily sovereign, but multi-module.',
    seedFile:    null,
    seedSection: 'meta',
  },
  {
    id:          'library',
    kind:        'library',
    label:       'New Library',
    description: 'A reusable, dependency-free package other systems import — like WARP itself.',
    seedFile:    null,
    seedSection: 'meta',
  },
  {
    id:          'module-component',
    kind:        'component',
    label:       'New Module / Component',
    description: 'The smallest unit — one file, one intent, dropped into an existing system.',
    seedFile:    null,
    seedSection: 'meta',
  },
  {
    id:          'genesis',
    kind:        'system',
    label:       'Full Nexus (genesis, sovereign, WARP-spined)',
    description: 'Scaffold a new sovereign system directly from genesis.spec — kernel-as-Stream, ' +
                 'schema-baseline axioms, seam/contract split, associative lattice, nerve, tv-ui, pulse.',
    seedFile:    'genesis.spec',
    seedSection: 'meta',
  },
  {
    id:          'minimal-kernel',
    kind:        'system',
    label:       'Minimal Kernel',
    description: 'The smallest sovereign core — kernel-as-Stream, spine primitives, root types and ' +
                 'axioms, zero domains attached yet. Start here and add compartments later.',
    seedFile:    'minimal-kernel.spec',
    seedSection: 'meta',
  },
  {
    id:          'api-service',
    kind:        'component',
    label:       'API Service',
    description: 'A service defined by its external/internal interface contracts — auth, SLA, ' +
                 'failure contract, consumers, mock availability.',
    seedFile:    'api-service.spec',
    seedSection: 'api',
  },
  {
    id:          'event-system',
    kind:        'component',
    label:       'Event System',
    description: 'A pure event-driven core — ring-buffered stream, typed event schemas, delivery ' +
                 'guarantees, idempotency, dead-lettering.',
    seedFile:    'event-system.spec',
    seedSection: 'events',
  },
  {
    id:          'plugin-runtime',
    kind:        'system',
    label:       'Plugin Runtime',
    description: 'A host with structurally isolated plugins — bus-only communication, load/unload ' +
                 'contract, hot-swap, no direct kernel or database access.',
    seedFile:    'plugin-runtime.md',
    seedSection: 'schema',
  },
  {
    id:          'ai-agent-system',
    kind:        'system',
    label:       'AI Agent System',
    description: 'An agent/self-modification engine with a model routing ladder (local-first, ' +
                 'remote fallback, fail-loud) and explicit entry points.',
    seedFile:    'ai-agent-system.spec',
    seedSection: 'integration',
  },
  {
    id:          'custom',
    kind:        'custom',
    label:       'Custom',
    description: 'No architectural pattern imposed — every chunk dispatches normally, shaped ' +
                 'entirely by what you write in the wizard.',
    seedFile:    null,
    seedSection: null,
  },
]);

function listTemplates() {
  return TEMPLATES.map(({ id, kind, label, description, seedFile, seedSection }) =>
    ({ id, kind, label, description, hasSeed: !!seedFile, seedSection }));
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
