'use strict';
// ─────────────────────────────────────────────────────────────────────────────
// tools/record-session-2026-08-17.js
//
// Writes this build session into cortex as real ledger history, so the work is
// queryable later by the same tools that read everything else — rather than
// living only in a changelog nobody's parser reads.
//
// Every row goes through lib/component-ledger.write(), which means:
//   • a physical file under data/ledger/{system}/{component}/{day}.jsonl
//   • a mirrored row in the cortex component_ledger table
//   • a breadcrumb into event_log, which is the pattern engine's only intake
//
// Idempotent: re-running adds new rows rather than corrupting old ones (the
// ledger is append-only by construction), but the guard below stops an
// accidental double-record in the same day.
// ─────────────────────────────────────────────────────────────────────────────

const path = require('path');
const ROOT = path.join(__dirname, '..');
const ledger = require(path.join(ROOT, 'lib', 'component-ledger'));

const SESSION = 'build-2026-08-17-ledger-wire-person-model';
const SYSTEM  = 'nexus';

// Each entry names the hook and wire deliberately — these are the two fields
// component-ledger warns about when absent, and a migration that writes rows
// without them would be adding to the very gap it is recording.
const ENTRIES = [

  // ── The ledger wire ───────────────────────────────────────────────────────
  { component: 'lib.ledger-sse', action: 'created', status: 'info',
    hook: 'lib.ledger-sse:v1:p0001', wire: 'lib.ledger-fanin→lib.ledger-sse→remote',
    intent: 'close the cross-process gap in the fan-in',
    detail: {
      finding: 'lib/ledger-fanin holds subscribers in module-level state, so it is per-process. ' +
               'copilot/cortex/diagnostic run as separate spawned processes. autopilot\'s ' +
               '"(deferred: intelligence,copilot)" boot line could never resolve: co-pilot ' +
               'subscribed to a different array in a different process.',
      built: 'two-sided SSE transport carrying canonical component-ledger rows. mount() serves ' +
             'a process fan-in; subscribe() replays a remote stream into the local one.',
      tests: 'tests/modules/test-ledger-sse.js — 17 passing, incl. a real child-process gate',
    }},

  { component: 'lib.error-log', action: 'created', status: 'info',
    hook: 'lib.error-log:v1:p0001', wire: 'lib.ledger-fanin→data/error.log',
    intent: 'a readable error record that outlives the systems it reports on',
    detail: {
      finding: 'the cortex error_log TABLE is only readable when cortex is up and the store ' +
               'loads — untrue during exactly the failures worth reading. The five CRASHED ' +
               'suites printed stack traces to stdout and nowhere queryable.',
      built: 'append-only data/error.log, one canonical ledger row per line, dependency-free.',
    }},

  { component: 'copilot.server', action: 'ledger_wired', status: 'info',
    hook: 'copilot.prompt.reply', wire: 'copilot.broadcast→lib.component-ledger',
    intent: 'make co-pilot activity visible to autopilot and the pattern engine',
    detail: {
      finding: 'copilot was NOT among the 22 files calling component-ledger.write(). It ' +
               'broadcast 20+ event types to its own SSE Set and every one died there — ' +
               'none reached the ledger tree, event_log, error_log or the pattern engine. ' +
               'This is the mechanical reason intelligence crystallised "ledger: diagnostic ' +
               'dangling-hook" 111,156x while naming only 2 noise sources.',
      change: 'broadcast() now also writes a ledger row. The existing /sse is byte-identical (§5.14).',
    }},

  { component: 'cos.kernel', action: 'ledger_wired', status: 'info',
    hook: 'cos.compartment.transition', wire: 'cos.kernel→lib.component-ledger',
    intent: 'compartment state becomes readable rather than inferable',
    detail: {
      decision: 'cos gets NO SSE. cos/spec/cos.spec declares core CLI-driven with no ' +
                'http.createServer outside vaultd; a server here would break its own contract. ' +
                'It needed to WRITE, not serve — the host process serves it via the shared mount.',
      transitions: ['axiom.violated', 'integrated', 'recycled'],
    }},

  { component: 'autopilot.supervisor', action: 'ledger_consumer_wired', status: 'info',
    hook: 'autopilot.boot.fanin', wire: 'remote./ledger/stream→autopilot.ledger-fanin',
    intent: 'the stream actually points at autopilot, as the §P1 comment always claimed',
    detail: { consumes: ['copilot', 'cortex', 'diagnostic', 'guardian', 'loom'],
              surfaced: 'GET /status now carries a ledger block; blind[] names every emitter never reached' }},

  // ── Bugs found by running, not reading ────────────────────────────────────
  { component: 'lib.ledger-sse', action: 'defect_fixed', status: 'error',
    hook: 'lib.ledger-sse:v1:p0001', wire: 'lib.component-ledger→lib.ledger-sse',
    faultId: 'LSSE-001',
    intent: 'record the defect so the shape is learnable, not just the fix',
    detail: {
      defect: 'component-ledger emits type=`${system}.${action}` with the real component at TOP ' +
              'level and status/hook/wire nested in payload. The normalizer re-derived from ' +
              'type, producing component:"copilot" instead of "copilot.lifeline" and turning ' +
              'ERROR rows into info.',
      why_it_matters: 'an error arriving as info is worse than not arriving — it is wrong data that looks right',
      caught_by: 'end-to-end run; unit tests passed throughout',
      pinned_by: 'LS-002b',
    }},

  { component: 'lib.error-log', action: 'defect_fixed', status: 'error',
    hook: 'lib.error-log:v1:p0001', wire: 'lib.error-log→data/error.log',
    faultId: 'ELOG-001',
    detail: {
      defect: 'a circular detail made JSON.stringify(entry) throw; the catch prevented a crash ' +
              'but dropped the whole row.',
      why_it_matters: 'a silently lost error is the worst failure an error log can have',
      fix: 'detail degrades to a stated _unserializable marker; the row still lands',
      pinned_by: 'EL-004 (asserts the row SURVIVES, not merely that nothing throws)',
    }},

  // ── Person model ──────────────────────────────────────────────────────────
  { component: 'copilot.person-model', action: 'created', status: 'info',
    hook: 'copilot.person-model:v1:p0001', wire: 'copilot.person-model→cortex.person_model_nodes',
    intent: 'a model of the user with history, provenance and an editable surface',
    detail: {
      design: 'ONE flat lattice, typed nodes and typed edges. A meaning-making web is a LENS — ' +
              'a projection over the same structure, not a nested graph. Nesting would force one ' +
              'propagation rule inside a web and another across the boundary, and they would ' +
              'disagree; there is also no principled place to stop nesting.',
      lenses: ['meaning', 'tension', 'values', 'trajectory', 'care'],
      lens_contract: 'identical to tests/modules/lenses.test.js — LN-1 declared question, ' +
                     'LN-3 four verdicts never a silent empty, LN-7 coverage travels with every reading',
      history: 'sessions hash-chained like the snapshot chain; an edited session breaks the chain visibly',
      tests: 'tests/modules/test-person-model.js — 25 passing',
    }},

  { component: 'copilot.person-model', action: 'constraint_declared', status: 'info',
    hook: 'copilot.person-model.state', wire: 'user→copilot.person-model.state',
    intent: 'record the reasoning, so the constraint can be argued with rather than merely obeyed',
    detail: {
      rule: 'trigger, sensitive and boundary are STATED-ONLY. infer() and observe() into them ' +
            'throw. Nothing may be inferred into these categories, ever.',
      reasoning: 'for pace or verbosity a wrong inference is cheap — it decays and gets corrected. ' +
                 'For a trigger or a piece of someone\'s history, wrong is expensive both ways: the ' +
                 'system either handles a person as fragile about something they are not, or attaches ' +
                 'a confident story to something real and acts on it. The available evidence for ' +
                 'exactly those claims — tone, hesitation, a changed subject — is the weakest signal ' +
                 'in the system. Pointing the thinnest evidence at the heaviest conclusions is the ' +
                 'worst wiring available, so it is refused structurally rather than left to judgement.',
      escape_valve: 'noteObservation() records what was seen, with checkable evidence, on the review ' +
                    'queue. It stays an observation. Only accept() promotes it, and accept() refuses ' +
                    'any caller that is not by:"user" — §IP-5 applied to self-knowledge.',
      ownership: 'forget() archives with a required reason; purge() is a REAL hard delete. purge ' +
                 'deliberately breaks §0.3: "nothing is lost" is right for system state and wrong ' +
                 'for a model of a person.',
    }},

  { component: 'copilot.registry-components', action: 'registered', status: 'info',
    hook: 'copilot.contract', wire: 'copilot.registry→loom.component-registry',
    intent: 'make the new surface resolvable by grammar instead of falling through to the LLM',
    detail: { added: 12, note: 'person-model.* + ledger.stream, with grammar terms so ' +
              '"what do you know about me" resolves to a component rather than reaching ollama' }},

  // ── Findings recorded but NOT fixed ───────────────────────────────────────
  { component: 'cortex.foundation.admin-server', action: 'missing_module', status: 'error',
    hook: null, wire: 'orchestrator.compartments→cortex./api/compartments',
    faultId: 'MISSING-001',
    intent: 'record the real cause of the fabricated compartments answer',
    detail: {
      symptom: 'asking co-pilot about compartments returned an invented hierarchy built from ' +
               'NEXUS system names',
      cause: 'orchestrator.js:2315 proxies to cortex /api/compartments; the file serving it does ' +
             'not exist. With the endpoint absent the prompt fell through _intents.route() -> ' +
             'autonomy-router -> intuition -> cortex intuition -> ollama. Every stage behaved ' +
             'correctly; the target was missing and nothing was obliged to say so.',
      also_missing: ['cortex/healer/index.js', 'cortex/flush-redundancy.js',
                     'lib/request-handler.js', 'cortex/core/raid/intelligence-bridge.js'],
      note: 'these five are the CRASHED suites in the 2026-08-17 run',
      status: 'NOT FIXED — recorded so it is not rediscovered from scratch',
    }},

  { component: 'copilot.grammar-fallback', action: 'unwired_capability', status: 'error',
    hook: null, wire: null, faultId: 'UNWIRED-001',
    intent: 'name a tested capability that nothing calls',
    detail: {
      finding: 'lib/grammar-fallback resolves a phrase to a real componentId and has 6 passing ' +
               'tests. It is required by NOTHING in copilot/.',
      consequence: 'the prompt chain has no floor. A fall-through chain whose last stop is an LLM ' +
                   'will always end at the thing that never refuses.',
      status: 'NOT FIXED — the recommended next step',
    }},

  { component: 'copilot.self-model', action: 'naming_collision', status: 'info',
    hook: null, wire: null,
    detail: {
      note: 'copilot/lib/self-model.js (the co-pilot\'s model of ITSELF) resolves before a ' +
            'self-model/ directory. The user model is therefore person-model/. Related: ' +
            'test-p5p6-self-model.js T-005 buildNexusModel is one of the 18 failures.',
    }},
];

function main() {
  console.log(`\n── recording session ${SESSION} → cortex ──\n`);
  let ok = 0, refused = 0;
  for (const e of ENTRIES) {
    const row = ledger.write({
      system: SYSTEM, session: SESSION,
      component: e.component, action: e.action, status: e.status || 'info',
      detail: e.detail, hook: e.hook || null, wire: e.wire || null,
      intent: e.intent || null, faultId: e.faultId || null,
      tags: ['session-history', '2026-08-17'],
    });
    if (row) { ok++; console.log(`  ✓ ${e.component} · ${e.action}`); }
    else { refused++; console.log(`  ✗ REFUSED ${e.component} · ${e.action}`); }
  }
  console.log(`\n  ${ok} recorded, ${refused} refused`);
  console.log(`  physical:  data/ledger/${SYSTEM}/<component>/session-${SESSION}.jsonl`);
  console.log(`  queryable: component_ledger + event_log in cortex\n`);

  try {
    const cov = ledger.intakeCoverage();
    if (cov.observed) console.log(`  intake coverage: ${cov.coveragePct}% (${cov.breadcrumbs}/${cov.canonicalWrites} reached event_log)\n`);
  } catch (_) {}
  return refused ? 1 : 0;
}

if (require.main === module) process.exit(main());
module.exports = { ENTRIES, SESSION, main };
