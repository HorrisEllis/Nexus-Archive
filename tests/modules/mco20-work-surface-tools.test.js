'use strict';

/**
 * tests/modules/mco20-work-surface-tools.test.js
 *
 * §MCO20 2026-09-13 — real tests for the create_work_surface /
 * get_work_surface_chunk copilot tools, against a real temp file.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const assert = require('assert');
const createTool = require('../../lib/agent-tools/tools/work-surface/create.js');
const getChunkTool = require('../../lib/agent-tools/tools/work-surface/get-chunk.js');

let pass = 0, fail = 0;
async function test(name, fn) {
  try { await fn(); pass++; console.log(`  ✓ ${name}`); }
  catch (e) { fail++; console.log(`  ✗ ${name}\n    ${e.stack}`); }
}

function makeBigFile(lineCount) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ws-tool-test-'));
  const p = path.join(dir, 'big.js');
  const lines = Array.from({ length: lineCount }, (_, i) => `// real line ${i + 1}`);
  fs.writeFileSync(p, lines.join('\n'));
  return p;
}

async function main() {
  await test('TOOL-WS-001: create_work_surface refuses a missing path', async () => {
    const r = await createTool.execute({});
    assert.ok(r.error);
  });

  await test('TOOL-WS-002: create_work_surface builds a real operating table for a 1000-line file', async () => {
    const p = makeBigFile(1000);
    const r = await createTool.execute({ path: p, chunkLines: 150 });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.lineCount, 1000);
    assert.strictEqual(r.chunkCount, 7); // 6*150 + 1*100
    assert.strictEqual(r.chunks[r.chunks.length - 1].endLine, 1000);
  });

  await test('TOOL-WS-003: get_work_surface_chunk returns the exact real content for a chunk', async () => {
    const p = makeBigFile(20);
    const chunk = await getChunkTool.execute({ path: p, chunkIndex: 0, chunkLines: 5 });
    assert.strictEqual(chunk.ok, true);
    assert.strictEqual(chunk.content, '// real line 1\n// real line 2\n// real line 3\n// real line 4\n// real line 5');
  });

  await test('TOOL-WS-004: get_work_surface_chunk refuses an out-of-range index with a real reason', async () => {
    const p = makeBigFile(5);
    const chunk = await getChunkTool.execute({ path: p, chunkIndex: 50, chunkLines: 5 });
    assert.ok(chunk.error);
  });

  await test('TOOL-WS-005: end to end — create_work_surface\'s chunk plan matches get_work_surface_chunk\'s real content for every chunk', async () => {
    const p = makeBigFile(347);
    const ws = await createTool.execute({ path: p, chunkLines: 100 });
    assert.strictEqual(ws.ok, true);
    let reassembled = '';
    for (const c of ws.chunks) {
      const chunk = await getChunkTool.execute({ path: p, chunkIndex: c.index, chunkLines: 100 });
      assert.strictEqual(chunk.ok, true);
      reassembled += (reassembled ? '\n' : '') + chunk.content;
    }
    const original = fs.readFileSync(p, 'utf8');
    assert.strictEqual(reassembled, original, 'reassembling every chunk must reproduce the exact real file, no gaps or drops');
  });

  console.log(`\n  mco20-work-surface-tools: ${pass} passed, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
}

main();
