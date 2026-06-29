#!/usr/bin/env node
'use strict';
/**
 * tests/error-log.test.js — lib/error-log.js
 * UUID: nexus-error-log-test-v1-0000-4000-000000000001
 *
 * Run: node tests/error-log.test.js
 */

const fs   = require('fs');
const path = require('path');
const os   = require('os');
const assert = require('assert');
const { createErrorLog } = require('../lib/error-log');

const C = { reset:'\x1b[0m', green:'\x1b[32m', red:'\x1b[31m', dim:'\x1b[90m' };
const ok   = s => console.log(`${C.green}✓${C.reset} ${s}`);
const fail = (s, e) => { console.log(`${C.red}✗ ${s}${C.reset}\n${C.dim}${e?.stack || e}${C.reset}`); process.exitCode = 1; };

async function run() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'errlog-test-'));
  const log = createErrorLog({ logDir: tmp, systemId: 'test-system' });
  log.open();

  try {
    // 1. record() writes a row with file:line of the call site, not of
    //    error-log.js itself.
    function thisFunctionThrows() { throw new Error('boom'); }
    let row;
    try { thisFunctionThrows(); } catch (e) { row = log.record(e); }
    assert.ok(row.file && row.file.includes('error-log.test.js'), `expected file to point at this test, got ${row.file}`);
    assert.strictEqual(row.message, 'boom');
    assert.strictEqual(row.severity, 'error');
    ok('record() captures file:line of the throw site');
  } catch (e) { fail('record() captures file:line of the throw site', e); }

  try {
    // 2. tail() reads back what was written, survives process restart
    //    (re-open against the same dir).
    const log2 = createErrorLog({ logDir: tmp, systemId: 'test-system' });
    const rows = log2.tail(5);
    assert.ok(rows.length >= 1, 'expected at least one row on reopen');
    ok('tail() reads back rows after reopening against the same dir');
  } catch (e) { fail('tail() reads back rows after reopening', e); }

  try {
    // 3. causedBy links an error back to an event-ledger row.
    const row = log.record(new Error('linked'), { causedBy: 'evt-123', context: { foo: 'bar' } });
    assert.strictEqual(row.causedBy, 'evt-123');
    assert.deepStrictEqual(row.context, { foo: 'bar' });
    ok('causedBy + context round-trip onto the row');
  } catch (e) { fail('causedBy + context round-trip onto the row', e); }

  try {
    // 4. wrap() logs+rethrows on rejection, doesn't swallow it.
    const wrapped = log.wrap(async () => { throw new Error('wrapped-fail'); }, 'unit-test');
    let threw = false;
    try { await wrapped(); } catch (_) { threw = true; }
    assert.ok(threw, 'wrap() must rethrow after logging');
    const tail = log.tail(10);
    assert.ok(tail.some(r => r.message === 'wrapped-fail'), 'wrap() must record before rethrowing');
    ok('wrap() logs then rethrows — never swallows the error');
  } catch (e) { fail('wrap() logs then rethrows', e); }

  try {
    // 5. a non-Error value (string) is still recorded safely.
    const row = log.record('plain string error');
    assert.strictEqual(row.message, 'plain string error');
    ok('record() handles non-Error inputs without throwing');
  } catch (e) { fail('record() handles non-Error inputs', e); }

  log.close();
  fs.rmSync(tmp, { recursive: true, force: true });

  if (process.exitCode) {
    console.log(`${C.red}FAILED${C.reset}`);
  } else {
    console.log(`${C.green}All error-log tests passed${C.reset}`);
  }
}

run();
