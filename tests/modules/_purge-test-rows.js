'use strict';
/**
 * tests/modules/_purge-test-rows.js — cleanup helper for tests that write
 * through lib/component-ledger.js.
 *
 * §ROOT CAUSE 2026-07-24. Several suites correctly removed their
 * data/ledger/<system>/ directories in a finally block and still leaked,
 * because component-ledger.write() lands in THREE places: the physical day
 * file, the JAA `component_ledger` mirror, and an `event_log` breadcrumb.
 * Deleting the directory removed one of the three. The other two accumulated
 * in the live store, and eventually surfaced as phantom systems — literally
 * visible as nodes in the alk-lattice brain view, which is how they were
 * found.
 *
 * That is worth stating plainly: a test polluted the instrument used to
 * observe the system. The view was right; the test was wrong.
 *
 * Tests must use collision-proof system names (a timestamp suffix) and call
 * purgeTestRows(name) in a finally block. Matching is EXACT-PREFIX on the
 * system/source/component field so a real system can never be caught by it —
 * a cleanup helper that could delete real rows would be far worse than the
 * pollution it fixes.
 */
const fs = require('fs');
const path = require('path');

const STORE = path.join(__dirname, '../../data/cortex/memory');
const TABLES = ['event_log', 'component_ledger'];

/**
 * Remove every row whose system/source/component starts with `prefix`.
 * @param {string} prefix a collision-proof test system name
 * @returns {object} { [table]: removedCount }
 */
function purgeTestRows(prefix) {
  if (!prefix || typeof prefix !== 'string' || prefix.length < 6) {
    throw new Error(`purgeTestRows: refusing an unsafe prefix "${prefix}" — must be a collision-proof test name`);
  }
  const out = {};
  for (const t of TABLES) {
    const f = path.join(STORE, `${t}.json`);
    if (!fs.existsSync(f)) continue;
    let rows;
    try { rows = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (_) { continue; }
    if (!Array.isArray(rows)) continue;
    const keep = rows.filter(r => {
      const owner = String(r.system || r.source || r.systemId || r.component || '');
      return !owner.startsWith(prefix);
    });
    out[t] = rows.length - keep.length;
    if (out[t] > 0) {
      // Atomic — the live store is read by other processes while tests run.
      const tmp = `${f}.${process.pid}.purge.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(keep), 'utf8');
      fs.renameSync(tmp, f);
    }
  }
  return out;
}

module.exports = { purgeTestRows };
