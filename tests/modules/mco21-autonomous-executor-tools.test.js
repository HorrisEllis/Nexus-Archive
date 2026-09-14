'use strict';

/**
 * tests/modules/mco21-autonomous-executor-tools.test.js
 *
 * §MCO21 2026-09-13 — James: "copilot's autonomous mode... get this
 * system building projects of any size... highest leverage, find it."
 * Real test for guardian/routes/autonomous-loop.js's _makeExecutor():
 * the executor now runs a genuine multi-turn tool-calling loop (via
 * lib/agent-tools.runToolLoop + copilot/tool-runtime.js's
 * makeNcpCallModel, with guardian's own askSync as the real dispatch),
 * not a single-shot prompt/response.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const assert = require('assert');

let pass = 0, fail = 0;
async function test(name, fn) {
  try { await fn(); pass++; console.log(`  ✓ ${name}`); }
  catch (e) { fail++; console.log(`  ✗ ${name}\n    ${e.stack}`); }
}

function makeFile(lines) {
  const p = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'exec-tool-test-')), 'big.js');
  fs.writeFileSync(p, lines.join('\n'));
  return p;
}

async function main() {
  await test('EXEC-001: the executor actually calls create_work_surface when the fake agent requests it via a real tool block, then returns a real final answer', async () => {
    const bigFile = makeFile(Array.from({ length: 300 }, (_, i) => `line ${i}`));

    let callCount = 0;
    require.cache[require.resolve('../../guardian/ask.js')] = {
      id: 'guardian-ask-fake', filename: 'guardian-ask-fake', loaded: true,
      exports: {
        askSync: async (prompt) => {
          callCount++;
          if (callCount === 1) {
            return {
              ok: true,
              text: '```tool\n' + JSON.stringify({ name: 'create_work_surface', arguments: { path: bigFile, chunkLines: 100 } }) + '\n```',
            };
          }
          assert.ok(prompt.includes('create_work_surface'), 'the second real call must see the first tool result in its context');
          return { ok: true, text: 'Work surface built — 3 real chunks, ready to proceed.' };
        },
      },
    };
    delete require.cache[require.resolve('../../guardian/routes/autonomous-loop.js')];
    const route = require('../../guardian/routes/autonomous-loop.js');

    const executor = route._makeExecutor({
      goalText: 'build the massive file', provider: 'claude', timeoutMs: 5000,
      jobs: new Map(), createJob: () => {}, dispatchJob: () => {}, ncp: { isConnected: () => true },
    });

    const result = await executor({}, { compartment_id: 'test-compartment', axioms: [], boundary: {} });
    assert.strictEqual(callCount, 2, 'the real loop must make exactly 2 real calls: one tool request, one final answer');
    assert.ok(result.text.includes('Work surface built'));
    assert.ok(Array.isArray(result.toolCallLog));
    assert.strictEqual(result.toolCallLog.length, 1);
    assert.strictEqual(result.toolCallLog[0].name, 'create_work_surface');
    assert.strictEqual(result.toolCallLog[0].result.ok, true, 'the tool call must have actually run for real, not been faked');
    assert.strictEqual(result.toolCallLog[0].result.lineCount, 300, 'the real tool result must reflect the real 300-line file');

    delete require.cache[require.resolve('../../guardian/ask.js')];
    delete require.cache[require.resolve('../../guardian/routes/autonomous-loop.js')];
  });

  await test('EXEC-002: if the tool-loop wiring itself fails, the executor honestly falls back to the original single-shot askSync path', async () => {
    require.cache[require.resolve('../../guardian/ask.js')] = {
      id: 'guardian-ask-fake2', filename: 'guardian-ask-fake2', loaded: true,
      exports: { askSync: async () => ({ ok: true, text: 'fallback real answer', provider: 'claude', jobId: 'job-1' }) },
    };
    const realAgentToolsPath = require.resolve('../../lib/agent-tools/index.js');
    const realAgentToolsExports = require.cache[realAgentToolsPath];
    require.cache[realAgentToolsPath] = {
      id: realAgentToolsPath, filename: realAgentToolsPath, loaded: true,
      exports: { runToolLoop: async () => { throw new Error('forced failure for test'); } },
    };
    delete require.cache[require.resolve('../../guardian/routes/autonomous-loop.js')];
    const route = require('../../guardian/routes/autonomous-loop.js');

    const executor = route._makeExecutor({
      goalText: 'goal', provider: 'claude', timeoutMs: 5000,
      jobs: new Map(), createJob: () => {}, dispatchJob: () => {}, ncp: { isConnected: () => true },
    });
    const result = await executor({}, { compartment_id: 'c', axioms: [], boundary: {} });
    assert.strictEqual(result.text, 'fallback real answer');

    require.cache[realAgentToolsPath] = realAgentToolsExports;
    delete require.cache[require.resolve('../../guardian/ask.js')];
    delete require.cache[require.resolve('../../guardian/routes/autonomous-loop.js')];
  });

  console.log(`\n  mco21-autonomous-executor-tools: ${pass} passed, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
}

main();
