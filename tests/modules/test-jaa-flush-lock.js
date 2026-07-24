'use strict';
/**
 * tests/modules/test-jaa-flush-lock.js — pins the MP-001 root-cause fix
 * (2026-07-24): a cross-process O_EXCL lock around _flush's whole
 * read-merge-write cycle.
 *
 * History of this bug class (§17.7 — third occurrence promoted it to
 * architecture): 2026-07-15 atomic tmp+rename (fixed torn reads);
 * 2026-07-18 pre-flush merge (fixed the debounce-window overwrite);
 * 2026-07-24 THIS — the residual cross-process interleaving both prior
 * fixes left open, proven deterministically before fixing: process B
 * reads disk → process A's entire flush lands → B writes → A's whole
 * batch destroyed. Strictly wider blast radius than the old comment's
 * "same id, same instant" claim.
 *
 * The deterministic technique: two JaaStore instances on one directory
 * (what two processes ARE, to the filesystem), a one-shot readFileSync
 * hook freezing the exact losing interleaving. Instrumentation of a test,
 * not a mock of production code (§1.3 concerns shipped paths).
 */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { JaaStore } = require('../../guardian/jaa-store.js');
let passed = 0, failed = 0;
function test(id, desc, fn) {
  try { fn(); console.log(`  ✓ ${id} ${desc}`); passed++; }
  catch (e) { console.error(`  ✗ ${id} ${desc}\n    ${e.message}`); failed++; }
}
async function testAsync(id, desc, fn) {
  try { await fn(); console.log(`  ✓ ${id} ${desc}`); passed++; }
  catch (e) { console.error(`  ✗ ${id} ${desc}\n    ${e.message}`); failed++; }
}

// Silence [jaa] boot chatter so run-all.js's summary parsing stays clean.
const _origLog = console.log;
console.log = (...a) => { if (!String(a[0] ?? '').startsWith('[jaa]')) _origLog(...a); };

(async () => {

  await testAsync('JFL-001', 'THE PROVEN RACE: frozen B-reads→A-writes→B-writes interleaving no longer loses A\'s batch — lock refuses the racing write, retry converges to all rows', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'jfl-race-'));
    const A = new JaaStore(dir);
    const B = new JaaStore(dir);
    A.insert('t', { id: 'a1' }); A.insert('t', { id: 'a2' });
    B.insert('t', { id: 'b1' }); B.insert('t', { id: 'b2' });
    fs.writeFileSync(path.join(dir, 't.json'), '[]', 'utf8');

    let aRefused = false;
    const realRead = fs.readFileSync;
    let armed = true;
    fs.readFileSync = function (p, ...rest) {
      const result = realRead.call(fs, p, ...rest);
      if (armed && String(p).endsWith(path.join(dir, 't.json'))) {
        armed = false;
        fs.readFileSync = realRead;
        const before = JSON.parse(realRead.call(fs, path.join(dir, 't.json'), 'utf8')).length;
        A._flush('t'); // B holds the lock right now — this must be refused
        const after = JSON.parse(realRead.call(fs, path.join(dir, 't.json'), 'utf8')).length;
        aRefused = (before === after);
      }
      return result;
    };
    B._flush('t');
    fs.readFileSync = realRead;

    assert.ok(aRefused, "A's flush must have been refused (wrote nothing) while B held the lock — proceeding unlocked is the exact pre-fix data-loss path");

    // A's refused flush re-scheduled itself (250ms). Wait, then verify convergence.
    await new Promise(r => setTimeout(r, 800));
    const ids = JSON.parse(realRead.call(fs, path.join(dir, 't.json'), 'utf8')).map(r => r.id).sort();
    assert.deepStrictEqual(ids, ['a1', 'a2', 'b1', 'b2'],
      `all 4 rows must survive — pre-fix, this exact interleaving destroyed A's entire batch (got ${JSON.stringify(ids)})`);
  });

  test('JFL-002', 'stale lock (crashed holder) is broken LOUDLY, flush proceeds, lock released', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'jfl-stale-'));
    const s = new JaaStore(dir);
    s.insert('t', { id: 'x1' });
    const lockPath = path.join(dir, 't.json.lock');
    fs.writeFileSync(lockPath, '99999');
    const past = new Date(Date.now() - 60000);
    fs.utimesSync(lockPath, past, past);

    let brokeLoudly = false;
    const origErr = console.error;
    console.error = (...a) => { if (String(a[0] ?? '').includes('BREAKING STALE FLUSH LOCK')) brokeLoudly = true; };
    try { s._flush('t'); } finally { console.error = origErr; }

    assert.ok(brokeLoudly, 'stale-lock break must be logged loudly (§1.2), never silent');
    const rows = JSON.parse(fs.readFileSync(path.join(dir, 't.json'), 'utf8'));
    assert.strictEqual(rows.length, 1, 'flush must succeed after breaking the stale lock');
    assert.ok(!fs.existsSync(lockPath), 'lock must be released after the flush completes');
  });

  test('JFL-003', 'a FRESH (non-stale) held lock is respected — flush defers, data stays dirty and in memory, nothing written unlocked', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'jfl-fresh-'));
    const s = new JaaStore(dir);
    s.insert('t', { id: 'y1' });
    const lockPath = path.join(dir, 't.json.lock');
    fs.writeFileSync(lockPath, String(process.pid)); // fresh mtime — legitimately held

    s._flush('t');

    assert.ok(!fs.existsSync(path.join(dir, 't.json')), 'must NOT have written the table while a fresh lock is held — that would be the pre-fix unlocked write');
    assert.ok(s._dirty.has('t'), 'table must remain flagged dirty so the re-scheduled flush retries it');
    assert.ok(s._tables.get('t').has('y1'), 'the row must still be safe in memory');
    fs.unlinkSync(lockPath); // cleanup so the deferred retry (if it fires) succeeds harmlessly
  });

  test('JFL-004', 'single-process flush is unaffected — lock acquired and released invisibly, zero behavior change (§5.14)', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'jfl-single-'));
    const s = new JaaStore(dir);
    s.insert('t', { id: 'z1' });
    s.insert('t', { id: 'z2' });
    s._flush('t');
    const rows = JSON.parse(fs.readFileSync(path.join(dir, 't.json'), 'utf8'));
    assert.strictEqual(rows.length, 2);
    assert.ok(!fs.existsSync(path.join(dir, 't.json.lock')), 'no lock file left behind');
  });

  test('JFL-005', 'the lock file is per-table — flushing table A never blocks table B', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'jfl-pertable-'));
    const s = new JaaStore(dir);
    s.insert('a', { id: 'r1' });
    s.insert('b', { id: 'r2' });
    // Hold a's lock; b must flush fine.
    fs.writeFileSync(path.join(dir, 'a.json.lock'), String(process.pid));
    s._flush('b');
    assert.ok(fs.existsSync(path.join(dir, 'b.json')), 'b must flush while a is locked');
    assert.ok(!fs.existsSync(path.join(dir, 'a.json')), 'a must have deferred');
    fs.unlinkSync(path.join(dir, 'a.json.lock'));
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
