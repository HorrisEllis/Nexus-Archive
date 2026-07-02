'use strict';
/**
 * cortex/memory/jaa-db.js — Cortex memory bridge
 * UUID: nexus-cortex-jaa-db-v1-0000-2026-0628-001
 *
 * Re-exports a shared JaaStore instance pointed at the cortex data dir.
 * All modules that do `require('./cortex/memory/jaa-db')` get the same
 * live store — single writer, multiple readers, zero duplication.
 *
 * API surface (mirrors what callers expect):
 *   jaaDB.insert(table, row)           → row
 *   jaaDB.get(table, where)            → row | null
 *   jaaDB.getById(table, id)           → row | null
 *   jaaDB.query(table, where?, opts?)  → row[]
 *   jaaDB.tail(table, n)               → row[]
 *   jaaDB.update(table, where, values) → count
 *   jaaDB.delete(table, where)         → count
 *   jaaDB.uid()                        → uuid string
 *   uid()                              → uuid string (named export compat)
 */

const path = require('path');
const { JaaStore } = require('../../guardian/jaa-store');

const DATA_DIR = path.join(__dirname, '../../data/cortex/memory');

// Singleton — one store for the whole process
let _store = null;
function _getStore() {
  if (!_store) _store = new JaaStore(DATA_DIR);
  return _store;
}

// Thin adapter — exposes the jaaDB call shape used across the codebase
const jaaDB = {
  insert(table, row)             { return _getStore().insert(table, row); },
  get(table, where)              { return _getStore().get(table, where); },
  getById(table, id)             { return _getStore().get(table, { id }); },
  query(table, where, opts)      { return _getStore().all(table, where, opts); },
  tail(table, n)                 { return _getStore().all(table, {}, { orderBy: 'id', order: 'DESC', limit: n || 10 }); },
  update(table, where, values)   { return _getStore().update(table, where, values); },
  delete(table, where)           { return _getStore().delete(table, where); },
  count(table, where)            { return _getStore().count(table, where); },
  uid()                          { return _uid(); },
  // raw store access for modules that need it
  _store()                       { return _getStore(); },
};

function _uid() {
  return require('crypto').randomUUID();
}

module.exports = { jaaDB, uid: _uid };
