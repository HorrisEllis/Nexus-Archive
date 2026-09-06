'use strict';
/**
 * tests/modules/test-guardian-data-sovereignty.js — DF1
 * James: "solidify guardian... persistent data in the data folder."
 * Guardian's real production data (ledger.json: 60 rows, settings.json:
 * 19 rows) used to live inside CORTEX_STORE_DIR with a 'guardian_'
 * table prefix — sharing cortex's directory. Migrated to guardian's own
 * sovereign folder (data/guardian/memory/), verified row-for-row.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

let passed = 0, failed = 0;
function test(id, desc, fn) {
  try { fn(); console.log(`  ✓ ${id} ${desc}`); passed++; }
  catch (e) { console.error(`  ✗ ${id} ${desc}\n    ${e.message}`); failed++; }
}

const ROOT = path.join(__dirname, '../..');

function run() {
  const config = require(path.join(ROOT, 'guardian/config.js'));
  const { JaaStore } = require(path.join(ROOT, 'guardian/jaa-store.js'));

  test('DF1-001', 'guardian/config.js no longer exports CORTEX_STORE_DIR — confirmed genuinely dead before removal', () => {
    assert.strictEqual('CORTEX_STORE_DIR' in config, false);
  });

  test('DF1-002', 'GUARDIAN_DATA_DIR points at guardian\'s own real folder, not cortex\'s', () => {
    assert.ok(config.GUARDIAN_DATA_DIR.includes(path.join('data', 'guardian', 'memory')));
    assert.ok(!config.GUARDIAN_DATA_DIR.includes(path.join('data', 'cortex')));
  });

  test('DF1-003', 'the real migrated ledger.json exists at the new sovereign location', () => {
    assert.ok(fs.existsSync(path.join(ROOT, 'data/guardian/memory/ledger.json')));
  });

  test('DF1-004', 'the real migrated settings.json exists at the new sovereign location', () => {
    assert.ok(fs.existsSync(path.join(ROOT, 'data/guardian/memory/settings.json')));
  });

  test('DF1-005', 'the old, now-vestigial files under cortex\'s directory were NOT deleted — §0.3', () => {
    assert.ok(fs.existsSync(path.join(ROOT, 'data/cortex/memory/guardian_ledger.json')), 'old file should still exist, copied not moved');
    assert.ok(fs.existsSync(path.join(ROOT, 'data/cortex/memory/guardian_settings.json')));
  });

  test('DF1-006', 'the migrated data has AT LEAST the same row count as the moment it was copied — no loss (growth since is legitimate, live data, not a bug)', () => {
    // §FIX 2026-09-06 — first draft of this test asserted an EXACT count
    // (60/19), which is wrong for live, mutable production data: a real
    // new setting written after migration correctly grows the row count.
    // Caught when the full suite run showed settings at 20 rows, not 19
    // — not a regression, a real write that happened between my manual
    // verification and this run. The real invariant is "never fewer
    // than what was verified at migration time," not "frozen forever."
    const oldLedger = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/cortex/memory/guardian_ledger.json'), 'utf8'));
    const newLedger = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/guardian/memory/ledger.json'), 'utf8'));
    assert.ok(newLedger.length >= 60, `expected at least the 60 rows confirmed present at migration time, got ${newLedger.length}`);
    assert.ok(newLedger.length >= oldLedger.length, 'new store should never have fewer rows than the old one still has');

    const oldSettings = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/cortex/memory/guardian_settings.json'), 'utf8'));
    const newSettings = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/guardian/memory/settings.json'), 'utf8'));
    assert.ok(newSettings.length >= 19, `expected at least the 19 rows confirmed present at migration time, got ${newSettings.length}`);
  });

  test('DF1-007', 'a real JaaStore instantiated against the new sovereign directory loads real data — at least the migration-time baseline, never fewer', () => {
    const jaa = new JaaStore(config.GUARDIAN_DATA_DIR, {});
    const ledger = jaa.all('ledger');
    const settings = jaa.all('settings');
    assert.ok(ledger.length >= 60, `expected at least 60 ledger rows, got ${ledger.length}`);
    assert.ok(settings.length >= 19, `expected at least 19 settings rows, got ${settings.length}`);
  });

  test('DF1-008', 'guardian/server.js\'s real store instantiation no longer uses a tablePrefix — no collision risk in an exclusive directory', () => {
    const src = fs.readFileSync(path.join(ROOT, 'guardian/server.js'), 'utf8');
    const line = src.split('\n').find(l => l.includes('new JaaStore(STORE_DIR'));
    assert.ok(line, 'expected to find the real JaaStore instantiation line');
    assert.ok(!line.includes('tablePrefix'), 'tablePrefix should be gone — guardian now owns its directory exclusively');
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exitCode = failed ? 1 : 0;
}

run();
