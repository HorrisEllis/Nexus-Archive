'use strict';
/**
 * tests/modules/run-all.js — Module Test Runner
 * UUID: test-modules-runner-v1-0000-4000-0000-000000000001
 *
 * Runs every per-module fractal adversarial test suite.
 * Each module test lives at tests/modules/<module>.test.js
 *
 * §12.1 Every runtime file has a brutal recursive test suite.
 * §12.2 Tests are verification, not coverage.
 *
 * Run: node tests/modules/run-all.js
 */

const path = require('path');
const fs   = require('fs');

const MODULES_DIR = __dirname;

const SUITES = [
  'jaa-db.test.js',
  'test-p1-fanin-live.js',
  'test-p2-snapshot-sigma.js',
  'test-p3-diagnostic-causal.js',
  'test-p4-capabilities.js',
  'test-p4-awareness.js',
  'test-p5-grammar-router.js',
  'test-p5p6-self-model.js',
  'test-p1-agent-contracts.js',
  'test-p2-injection.js',
  'test-agnostic-lib-tools.js',
  'test-ap1-agent-pull.js',
  'test-activity-log.js',
  'test-ledger-fanin.js',
  'test-gemini-toolbox.js',
  'jaa-store-multiprocess.test.js',
  'test-jaa-flush-lock.js',
  'spec-container.test.js',
  'queue.test.js',
  'baseline.test.js',
  'intelligence.test.js',
  'ollama-runtime.test.js',
  'flush-redundancy.test.js',
  'admin-server-routes.test.js',
  'orchestrator-cli.test.js',
  'interaction-contract.test.js',
  'uid.test.js',
  'alk.test.js',
  'healer.test.js',
  'constitutional-ai.test.js',
  'reflection.test.js',
  'user-model.test.js',
  'snapshot-integrity.test.js',
  'compartment-engine.test.js',
  'adversary-suite.test.js',
  'crystal-lattice.test.js',
  'case-library.test.js',
  'autonomous-loop.test.js',
  // FIX (James, 2026-06-19): these six suites existed, passed standalone,
  // and were never registered here — `node tests/modules/run-all.js` was
  // silently skipping all of them. Found while wiring tests for this pass,
  // not something I broke.
  'test-component-registry.js',
  'test-grammar-engine.js',
  'test-grammar-fallback.js',
  'test-mutation-contract.js',
  'test-intelligence-bridge.js',
  'test-liminal-space.js',
  'test-fault-taxonomy.js',
  'test-escalation.js',
  'test-self-heal.js',
  'test-gap-finder.js',
  'test-raid-decision-record.js',
  'test-raid-constitution-gate.js',
  'test-raid-isolation-verify.js',
  'test-raid-drift-score.js',
  'test-raid-compare-gate.js',
  'test-raid-rewind.js',
  'test-raid-verify-fused.js',
  'test-schema-registry.js',
  'test-schema-observe-write.js',
  'test-user-model-schema.js',
  'test-user-model-everywhere.js',
  'test-user-model-capture.js',
  'test-user-model-editable.js',
  'test-copilot-tool-runtime.js',
  'test-guardian-tool-runtime.js',
  'test-faculty-tools.js',
  'test-call-system.js',
  'test-ui-tools.js',
  'test-relevance-classify.js',
  'test-assist-loop.js',
  'test-repair-on-prompt.js',
  'test-copilot-window.js',
  'test-cli-consolidation.js',
  'test-lifeline-ask.js',
  'test-system-status.js',
  'test-tool-guide.js',
  'test-capability-extend.js',
  'test-agent-routing.js',
  'test-account-registry.js',
  'test-diagnostics.js',
  'test-diagnostic-sweep.js',
  'test-movement-map.js',
  'test-tablet-homepage.js',
  'test-intelligence-layer.js',
  'test-map3d.js',
  'test-observability-map.js',
  'test-relational-field.js',
  'test-shared-stream.js',
  'test-self-register.js',
  'test-registration-shape.js',
  'test-causal-hygiene.js',
  'test-adversarial-causal-wire.js',
  'test-orion.js',
  'test-raid-orion-wiring.js',
  'test-user-model-radiate.js',
  'test-boot-phases.js',
  'test-sigma-compaction.js',
  'test-hook-ownership.js',
  'test-jaa-selective-load.js',
  'test-rfr2-cjs.js',
  'test-clear-glass-idle-vs-open.js',
  'test-clear-glass-single-instance.js',
  'test-idearium-cjs-under-esm.js',
  'test-cortex-heartbeat.js',
  'test-tablet-ledger-api.js',
  'test-tablet-container-api.js',
  'test-config-governance.js',
  'test-bus-subscriptions.js',
  'test-tablet-graph-api.js',
  'test-autopilot-boot-gates.js',
  'test-diagnostic-heal-path.js',
  'test-contract-queue-hardening.js',
  'test-intelligence-core-wired.js',
  'test-alk-lattice-live.js',
  'test-ledger-schema.js',
  'test-health-authority.js',
  'test-intelligence-causal.js',
  'test-sentinel-cli.js',
  'test-adversarial-sim.js',
  'test-boot-log-fixes.js',
  'test-autopilot-warp-spine.js',
  'test-guardian-cfr-consolidation.js',
  'test-ico-ledger-writethrough.js',
  'test-consumer-registry.js',
  'test-spawn-guard.js',
  'test-capability-registry.js',
  'test-raid-router.js',
  'test-snr-filter.js',
  'test-ui-registry.js',
  // Added 2026-07-06 — built alongside cortex/core/raid/snr-filter.js and
  // the real roleConfidence/topologicalProximity fitness terms this pass.
  'cfr-graph-component-distance.test.js',
  'raid-fitness-real-terms.test.js',
  'raid-tunables.test.js',
  'system-lattice.test.js',
  'intuition-upgrade.test.js',
  'mastermind-upgrade.test.js',
  'adversarial.test.js',
  'copilot-adversarial-wire.test.js',
  'copilot-adversarial-consolidation.test.js',
  'idearium-warp-dispatch.test.mjs',
  'lifeline-fluid-routing.test.js',
  'run-command-tool.test.js',
  'tutorial-engine.test.js',
];

let totalPassed = 0;
let totalFailed = 0;
const results = [];

async function runSuite(file) {
  return new Promise((resolve) => {
    const { spawn } = require('child_process');
    const proc = spawn('node', [path.join(MODULES_DIR, file)], {
      cwd: path.join(__dirname, '../..'),
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let out = '';
    proc.stdout.on('data', d => { out += d; process.stdout.write(d); });
    proc.stderr.on('data', d => { process.stderr.write(d); });

    proc.on('close', (code) => {
      // FIX (James, 2026-06-19): two test-file naming conventions in this
      // codebase use two different summary formats —
      //   *.test.js    : "16 passed  0 failed"   (whitespace-separated)
      //   test-*.js    : "16 passed, 0 failed"    (comma-separated)
      // The old regex only matched the first, so every test-*.js suite
      // silently reported 0/0 here even though it ran and passed for real.
      const match = out.match(/(\d+)\s*passed,?\s+(\d+)\s*failed/);
      const p = match ? parseInt(match[1]) : 0;
      const f = match ? parseInt(match[2]) : 0;
      totalPassed += p;
      totalFailed += f;
      results.push({ file, passed: p, failed: f, code });
      resolve();
    });
  });
}

async function main() {
  console.log('\n══ NEXUS MODULE TESTS — Fractal Adversarial Suite ══\n');

  // §TABLET T2 2026-07-24 — --filter=<substring> runs only matching suites
  // (used by autopilot's /run-tests/:system container route; the tablet
  // invokes THE REAL runner, never a parallel copy — the spec's own
  // failure-mode list names 'per-container tests defined separately from
  // run-all.js' as guaranteed two-truths drift).
  const _filterArg = process.argv.find(a => a.startsWith('--filter='));
  const _filter = _filterArg ? _filterArg.slice(9).toLowerCase() : null;
  const _active = _filter ? SUITES.filter(s => s.toLowerCase().includes(_filter)) : SUITES;
  if (_filter) console.log(`[run-all] filter '${_filter}' — ${_active.length} of ${SUITES.length} suites`);
  for (const suite of _active) {
    const fp = path.join(MODULES_DIR, suite);
    if (!fs.existsSync(fp)) {
      console.log(`  SKIP (not found): ${suite}`);
      continue;
    }
    await runSuite(suite);
  }

  console.log('\n══ MODULE TEST RESULTS ══════════════════════════════');
  for (const r of results) {
    const status = r.failed === 0 ? '✓' : '✗';
    console.log(`  ${status} ${r.file.padEnd(40)} ${r.passed} passed  ${r.failed} failed`);
  }
  console.log('─'.repeat(55));
  console.log(`  TOTAL: ${totalPassed} passed  ${totalFailed} failed`);

  if (totalFailed > 0) process.exitCode = 1;
}

main().catch(e => { console.error(e); process.exitCode = 1; });
