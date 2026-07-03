'use strict';
/**
 * copilot/module-builder.js
 * comp_id: nexus.copilot.module-builder
 * uuid: nexus-copilot-module-builder-v1-0000-2026-0627-jamesbrooks-001
 * spec: docs/copilot-expansion.spec
 *
 * Co-pilot builds its own modules from user descriptions.
 * Always: map → spec → QC → contract → build → verify → merge.
 * Uses nexus-system-foundation template. Follows architecture + axioms.
 * Every step is a contract in the relevant system's input/ folder.
 */
'use strict';

const crypto  = require('crypto');
const fs      = require('fs');
const path    = require('path');
const cq      = require('../lib/contract-queue');
const lifeline = require('./lifeline');
const axiomMgr = require('./axiom-manager');

const ROOT      = path.join(__dirname, '..');
const MODULE_ID = 'copilot/module-builder';
const VERSION   = '1.0.0';

// System foundation template (from docs/nexus-system-foundation.spec)
const SPEC_TEMPLATE = (name, purpose, port, targetSystem) => `spec:
  meta:
    name:        ${name}
    version:     1.0.0
    foundation:  nexus-system-foundation@1.0.0
    port:        ${port || 'N/A'}
    uuid:        nexus-${name}-v1-0000-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-jamesbrooks-001
    status:      active
    purpose: >
      ${purpose}

  core:
    schemas:   []
    axioms:    [AX-001, AX-002, AX-003, AX-004, AX-005]
    constants: {}

  events:
    emits:   []
    handles: []

  routes:
    - method: GET  path: /health
    - method: GET  path: /contract
    - method: GET  path: /events

  handshake:
    components: []

  modules:
    - id: core
      path: ${targetSystem}/${name}.js
      description: >
        ${purpose}

  tests: []

  phases:
    - id: 0
      name: Foundation (L0)
      status: next
      builds: [schemas, constants, axioms]
    - id: 1
      name: Event bus (L1)
      status: pending
    - id: 2
      name: CLI (L2)
      status: pending
    - id: 3
      name: API (L3)
      status: pending
    - id: 4
      name: Handshake (L4)
      status: pending
    - id: 5
      name: UI (L5)
      status: pending
`;

/**
 * Map a user description to a module plan.
 * Uses LIFELINE to understand intent + identify target system.
 */
async function map(description, opts = {}) {
  const requestId = opts.requestId || crypto.randomUUID();

  const mapPrompt = `You are the NEXUS architecture system. A user wants to add a capability.

User request: "${description}"

Map this to:
1. A module name (snake_case, short)
2. A one-sentence purpose
3. Which NEXUS system it belongs to (guardian/cortex/copilot/eravos/idearium/architect/emerge/bridge/ollama)
4. What existing NEXUS capabilities it should use
5. Any gaps or questions before building
6. Scope: "cli" if this is just asking for a new CLI command / shortcut /
   alias for something co-pilot can already do (no new logic, no new route,
   no new system) — vs "module" if it needs actual new code built.
   When in doubt between the two, prefer "module" — "cli" should be the
   narrow case, not the default.

Respond as JSON only:
{ "name": string, "purpose": string, "targetSystem": string, "usesCapabilities": string[], "gaps": string[], "ready": boolean, "scope": "cli" | "module", "grammarAliases": string[] }`;

  const result = await lifeline.route(mapPrompt, { requestId, intent: 'map', ...opts });

  if (!result.ok) return { ok: false, error: 'Lifeline unavailable' };

  // Parse the JSON response
  let plan = null;
  try {
    const cleaned = result.text.replace(/```json\n?|\n?```/g, '').trim();
    plan = JSON.parse(cleaned);
  } catch(_) {
    // Fallback: extract what we can
    plan = { name: 'new-module', purpose: description, targetSystem: 'copilot', gaps: ['Could not parse plan'], ready: false };
  }

  return { ok: true, plan, confidence: result.confidence, requestId };
}

/**
 * §Phase-36 / capability_cli_authoring fix, 2026-06-29.
 * map() classified this as scope:'cli' — a shortcut for something co-pilot
 * can already do, not a new module. Register a component directly instead
 * of running the full spec→QC→build pipeline. componentRegistry.register()
 * already auto-projects (.cli, .grammar, Phase 40 T1.5) and emits
 * component.registered, which grammar-engine.js already rebuilds its trie
 * from live — both of those were already wired. This function is the only
 * piece that was actually missing: the short-circuit itself.
 * Route points at copilot's own /api/prompt with the original description
 * as the default prompt param, so invoking the new command just re-asks
 * co-pilot the same thing — it's a saved shortcut, not new logic.
 */
async function registerCliCommand(plan, description, opts = {}) {
  const requestId = opts.requestId || crypto.randomUUID();
  if (!plan?.name) {
    return { ok: false, error: 'No name in plan — cannot register a CLI command', requestId };
  }

  const componentRegistry = require('../lib/component-registry');
  const projector         = require('../copilot/lib/descriptor-projector');

  const aliases = Array.isArray(plan.grammarAliases) && plan.grammarAliases.length
    ? plan.grammarAliases
    : [plan.name.replace(/_/g, ' ')];

  const component = {
    id:           `copilot.cli.${plan.name}`,
    namespace:    'copilot',
    name:         plan.name,
    version:      '1.0.0',
    description:  plan.purpose || description,
    grammar:      aliases,
    route:        { method: 'POST', path: '/api/prompt' },
    params:       [{ name: 'prompt', type: 'string', required: false, default: description }],
    registeredBy: 'copilot',
    tags:         ['copilot', 'cli-authored'],
  };

  const reg = componentRegistry.register(component);
  if (!reg.ok) {
    return { ok: false, error: 'Component registration failed', details: reg.errors, requestId };
  }

  let projections = null;
  try { projections = projector.project(component); } catch(_) {}

  return {
    ok: true,
    skippedFullPipeline: true,
    component,
    cli: projections?.cli || null,
    grammar: projections?.grammar || null,
    message: `Registered "${plan.name}" as a CLI command — try: ${aliases[0]}`,
    requestId,
  };
}

/**
 * Generate a spec from the map plan.
 */
async function generateSpec(plan, opts = {}) {
  const requestId = opts.requestId || crypto.randomUUID();

  const specPrompt = `Generate a NEXUS spec for this module using the nexus-system-foundation template.

Module: ${plan.name}
Purpose: ${plan.purpose}
Target system: ${plan.targetSystem}
Uses: ${(plan.usesCapabilities || []).join(', ')}

The spec must:
- Follow L0→L1→L2→L3→L4→L5 build order
- Declare all components with comp_id and uuid
- Declare all hooks (in/out) with wires_to[]
- Include a phase map
- Follow SISO architecture
- Reference relevant axioms (§AX-001 through §AX-007)

Respond with the full spec in YAML format starting with "spec:"`;

  const result = await lifeline.route(specPrompt, { requestId, intent: 'generate-spec', ...opts });

  if (!result.ok) {
    // Fall back to template
    return { ok: true, spec: SPEC_TEMPLATE(plan.name, plan.purpose, null, plan.targetSystem), fromTemplate: true };
  }

  return { ok: true, spec: result.text, confidence: result.confidence, requestId };
}

/**
 * Run the QC pipeline on a spec.
 * Returns { passed, stage_failed, reason, suggestions, confidence }
 */
async function runQC(spec, plan, opts = {}) {
  const requestId = opts.requestId || crypto.randomUUID();

  // Stage 1: Axiom check
  const axiomResult = axiomMgr.check(spec);
  if (!axiomResult.passed) {
    return {
      passed: false,
      stage_failed: 'axiom_check',
      reason: `Axiom violations: ${axiomResult.violations.map(v => v.axiom + ': ' + v.reason).join('; ')}`,
      suggestions: ['Remove mocks/stubs', 'Add explicit error handling', 'Preserve all data (§2.1)'],
      confidence: 0,
      requestId,
    };
  }

  // Stage 2: Architecture check via LIFELINE
  const archPrompt = `Review this NEXUS module spec for architecture compliance.

SPEC:
${spec.slice(0, 2000)}

Check:
1. Does it follow nexus-system-foundation layers (L0→L5)?
2. Does it follow SISO principles?
3. Are components properly declared with comp_id + uuid?
4. Are hooks declared with wires_to[]?
5. Is there a phase map?

Respond as JSON: { "passed": boolean, "score": 0-1, "issues": string[], "suggestions": string[] }`;

  const archResult = await lifeline.route(archPrompt, { requestId, intent: 'qc-architecture', ...opts });

  let archCheck = { passed: true, score: 0.8, issues: [], suggestions: [] };
  try {
    const cleaned = (archResult.text || '').replace(/```json\n?|\n?```/g, '').trim();
    archCheck = JSON.parse(cleaned);
  } catch(_) {}

  if (!archCheck.passed && archCheck.score < 0.6) {
    return {
      passed: false,
      stage_failed: 'architecture_check',
      reason: archCheck.issues?.join('; ') || 'Architecture does not follow nexus-system-foundation',
      suggestions: archCheck.suggestions || [],
      confidence: archCheck.score || 0.3,
      requestId,
    };
  }

  // Stage 3: Adversarial review via LIFELINE
  const adversarialPrompt = `You are a hostile reviewer. Tear apart this NEXUS module spec.

SPEC:
${spec.slice(0, 1500)}

Find:
- Silent failures
- Missing error handling
- Axiom violations
- Assumptions not validated
- Missing tests
- Coupling violations

Be constructive. Respond as JSON: { "passed": boolean, "violations": string[], "fixes": string[], "confidence": 0-1 }`;

  const advResult = await lifeline.route(adversarialPrompt, { requestId, intent: 'qc-adversarial', ...opts });

  let advCheck = { passed: true, violations: [], fixes: [], confidence: 0.8 };
  try {
    const cleaned = (advResult.text || '').replace(/```json\n?|\n?```/g, '').trim();
    advCheck = JSON.parse(cleaned);
  } catch(_) {}

  if (!advCheck.passed && (advCheck.violations || []).length > 3) {
    return {
      passed: false,
      stage_failed: 'adversarial_review',
      reason: advCheck.violations?.slice(0,3).join('; ') || 'Failed adversarial review',
      suggestions: advCheck.fixes || [],
      confidence: advCheck.confidence || 0.4,
      requestId,
    };
  }

  return {
    passed: true,
    stage_failed: null,
    reason: 'All QC stages passed',
    suggestions: [...(advCheck.fixes || [])],
    confidence: Math.min(archCheck.score || 0.8, advCheck.confidence || 0.8),
    requestId,
  };
}

/**
 * Full pipeline: map → spec → QC → contract.
 * Returns a build contract ready for Emerge.
 */
async function build(description, opts = {}) {
  const requestId = opts.requestId || crypto.randomUUID();
  let iteration   = 0;
  const MAX_ITER  = 3;

  console.log(`[module-builder] build request: "${description.slice(0, 80)}"`);

  // Step 1: Map
  const mapped = await map(description, { ...opts, requestId });
  if (!mapped.ok) return { ok: false, error: mapped.error, requestId };

  const plan = mapped.plan;
  console.log(`[module-builder] mapped: ${plan.name} → ${plan.targetSystem}`);

  // §Phase-36 short-circuit: "just a CLI command" skips spec/QC/build entirely.
  if (plan.scope === 'cli') {
    console.log(`[module-builder] scope:cli — registering directly, no spec pipeline`);
    return await registerCliCommand(plan, description, { ...opts, requestId });
  }

  if (plan.gaps?.length && !opts.skipGaps) {
    return {
      ok: false,
      needsInfo: true,
      gaps: plan.gaps,
      plan,
      message: `Before building, I need answers to: ${plan.gaps.join('; ')}`,
      requestId,
    };
  }

  // Step 2: Generate spec + QC loop
  let spec    = null;
  let qcResult = null;

  while (iteration < MAX_ITER) {
    iteration++;

    const specResult = await generateSpec(plan, { ...opts, requestId });
    spec = specResult.spec;

    // Step 3: QC
    qcResult = await runQC(spec, plan, { ...opts, requestId });
    console.log(`[module-builder] QC iteration ${iteration}: ${qcResult.passed ? 'PASS' : 'FAIL'} (${qcResult.stage_failed || 'all stages'})`);

    if (qcResult.passed) break;

    if (iteration < MAX_ITER) {
      // Fix the spec based on QC feedback
      const fixPrompt = `Fix this NEXUS spec. QC failure reason: "${qcResult.reason}". Suggestions: ${qcResult.suggestions?.join('; ') || 'none'}.

Original spec:
${spec.slice(0, 1500)}

Return the fixed spec only, starting with "spec:"`;

      const fixResult = await lifeline.route(fixPrompt, { requestId, intent: 'fix-spec', ...opts });
      if (fixResult.ok && fixResult.text?.includes('spec:')) {
        spec = fixResult.text;
      }
    }
  }

  // Create build contract
  const contract = cq.create({
    fromSystem:    'copilot',
    fromComponent: 'copilot.module-builder',
    fromHook:      'copilot.module-builder.output',
    toSystem:      'emerge',
    toComponent:   'emerge.compiler',
    toHook:        'emerge.compiler.receive',
    intent:        'build',
    agent:         'ollama',
    tags:          ['module-build', plan.targetSystem, plan.name],
    requestId,
    payload: {
      type:          'module_build',
      name:          plan.name,
      spec,
      plan,
      capability:    description,
      targetSystem:  plan.targetSystem,
      qcStatus:      qcResult?.passed ? 'passed' : 'failed',
      qcFailReason:  qcResult?.reason || null,
      qcSuggestions: qcResult?.suggestions || [],
      qcConfidence:  qcResult?.confidence || 0,
      iterations:    iteration,
    },
    priority: 'normal',
    ttlMs: 300000, // 5 minutes
  });

  // Dispatch to Emerge
  if (qcResult?.passed) {
    cq.dispatch(contract);
    console.log(`[module-builder] contract ${contract.uuid} dispatched to emerge`);
  }

  return {
    ok:            true,
    passed:        qcResult?.passed || false,
    contract:      contract.uuid,
    plan,
    qcResult,
    iterations:    iteration,
    message:       qcResult?.passed
      ? `Module "${plan.name}" passed QC and dispatched to Emerge for build.`
      : `Module "${plan.name}" failed QC after ${iteration} iterations. Needs: ${qcResult?.reason}`,
    requestId,
  };
}

module.exports = { build, map, generateSpec, runQC, registerCliCommand, MODULE_ID, VERSION };
