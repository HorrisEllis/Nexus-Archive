'use strict';
/**
 * tests/home-ui-asreply.test.js
 * UUID: test-home-ui-asreply-v1-0000-0000-0000-000000000001
 *
 * Tests the actual asAwaitReply() function extracted live from
 * ui/home/index.html — not a reimplementation of it. If someone edits the
 * real function, this either still passes (behavior preserved) or fails
 * loudly (behavior changed) — it can't silently drift from what's shipped.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

let passed = 0, failed = 0;
function test(label, fn) {
  try { fn(); console.log(`  ✓ ${label}`); passed++; }
  catch (e) { console.error(`  ✗ ${label}\n    ${e.stack}`); failed++; }
}
async function testAsync(label, fn) {
  try { await fn(); console.log(`  ✓ ${label}`); passed++; }
  catch (e) { console.error(`  ✗ ${label}\n    ${e.stack}`); failed++; }
}

const HTML = fs.readFileSync(path.join(__dirname, '../ui/home/index.html'), 'utf8');
const scriptMatch = [...HTML.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)];
const SRC = scriptMatch.map(m => m[1]).join('\n');

assert.ok(SRC.includes('async function asAwaitReply'), 'asAwaitReply must exist in the real file — extraction failed if this trips');
assert.ok(SRC.includes('async function get('), 'get() must exist — extraction failed if this trips');

function extractFunction(src, name) {
  const startMarker = `async function ${name}(`;
  const start = src.indexOf(startMarker);
  if (start === -1) throw new Error(`function ${name} not found in source`);
  const braceOpen = src.indexOf('{', start);
  let depth = 0, i = braceOpen;
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) break; }
  }
  return src.slice(start, i + 1);
}

function makeSandbox(fetchImpl, fastTimers = true) {
  const calls = [];
  const sandbox = {
    fetch: (...args) => { calls.push(args); return fetchImpl(...args); },
    AbortSignal: { timeout: () => undefined },
    console,
    setTimeout: fastTimers ? ((fn) => fn()) : setTimeout,    // fire immediately, don't actually wait in tests
    Date: { now: () => sandbox.__now },
    __now: 0,
    B: { orch: 'http://127.0.0.1:9000' }, // §FIX — missing this caused every poll to throw and loop forever, not a bug in the function under test
  };
  sandbox.global = sandbox;
  vm.createContext(sandbox);
  // Only need get() and asAwaitReply — extracting the whole 2000+ line
  // script would drag in DOM calls this test doesn't stub. Pull just the
  // two functions out by name using the same source text, not retyped.
  const getFn = extractFunction(SRC, 'get');
  const awaitReplyFn = extractFunction(SRC, 'asAwaitReply');
  vm.runInContext(`${getFn}\n${awaitReplyFn}`, sandbox);
  return { sandbox, calls };
}

async function run() {
  await testAsync('asAwaitReply shows the real responseText once status flips to complete', async () => {
    let callCount = 0;
    const { sandbox } = makeSandbox(async () => {
      callCount++;
      const body = callCount === 1
        ? { jobs: [{ jobId: 'job-abc', status: 'running' }] }
        : { jobs: [{ jobId: 'job-abc', status: 'complete', responseText: 'the real agent reply text' }] };
      return { json: async () => body };
    });
    const out = { textContent: 'placeholder' };
    sandbox.out = out;
    await sandbox.asAwaitReply(out, 'job-abc', 'chatgpt');
    assert.strictEqual(out.textContent, 'the real agent reply text');
    assert.ok(callCount >= 2, 'must have polled more than once to see the status change');
  });

  await testAsync('asAwaitReply surfaces a real failure reason, not a generic error', async () => {
    const { sandbox } = makeSandbox(async () => ({
      json: async () => ({ jobs: [{ jobId: 'job-x', status: 'failed', error: 'model unavailable' }] }),
    }));
    const out = { textContent: '' };
    await sandbox.asAwaitReply(out, 'job-x', 'ollama');
    assert.ok(out.textContent.includes('model unavailable'), `expected the real error in output, got: ${out.textContent}`);
    assert.ok(out.textContent.includes('ollama'));
  });

  await testAsync('asAwaitReply times out honestly after the deadline, does not hang forever silently', async () => {
    // setTimeout fires immediately in this sandbox, so Date.now() never
    // advances on its own — drive the clock forward manually each poll to
    // simulate real elapsed time without actually waiting in the test.
    const { sandbox } = makeSandbox(async () => {
      sandbox.__now += 1500;
      return { json: async () => ({ jobs: [{ jobId: 'job-y', status: 'running' }] }) };
    });
    const out = { textContent: '' };
    await sandbox.asAwaitReply(out, 'job-y', 'claude');
    assert.ok(out.textContent.includes("hasn't replied"), `expected an honest timeout message, got: ${out.textContent}`);
    assert.ok(out.textContent.includes('claude'));
  });

  await testAsync('asAwaitReply matches by either jobId or id field — real API responses are not guaranteed one shape', async () => {
    const { sandbox } = makeSandbox(async () => ({
      json: async () => ({ jobs: [{ id: 'job-z', status: 'complete', responseText: 'matched by id field' }] }),
    }));
    const out = { textContent: '' };
    await sandbox.asAwaitReply(out, 'job-z', 'chatgpt');
    assert.strictEqual(out.textContent, 'matched by id field');
  });

  console.log(`\n  home-ui-asreply: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

run();
