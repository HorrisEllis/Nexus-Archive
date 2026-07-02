'use strict';
/**
 * meta/rfr2/index.js — RFR2 Causal Toolkit entry point
 * UUID: nexus-rfr2-index-v1-0000-2026-0702-jamesbrooks-001
 */
module.exports = {
  get observer()       { return require('./observer/index.js'); },
  get delta()          { return require('./delta/index.js'); },
  get clip()           { return require('./clip/index.js'); },
  get enforcement()    { return require('./enforcement/index.js'); },
  get context()        { return require('./context/index.js'); },
  get compress()       { return require('./compress/index.js'); },
  get query()          { return require('./query/index.js'); },
  get time()           { return require('./time/index.js'); },
  get identity()       { return require('./identity/index.js'); },
  get adapterSandbox() { return require('./adapter-sandbox/index.js'); },
  get versionGate()    { return require('./version-gate/index.js'); },
};
