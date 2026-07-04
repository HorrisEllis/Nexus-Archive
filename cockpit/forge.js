'use strict';
/**
 * cockpit/forge.js — Shim
 * The forge modules have moved to lib/. This shim provides
 * the healthCheck() function guardian references while the
 * dependency is updated to point to lib/forge-core.js directly.
 */
const { IdeiarumClient, GuardianClient } = require('../lib/forge-core');

module.exports = {
  healthCheck: async () => {
    return {
      ok:      true,
      modules: ['forge-core', 'pipeline', 'forge-cli'],
      paths:   {
        core:     'lib/forge-core.js',
        pipeline: 'lib/pipeline/index.js',
        cli:      'cli/forge.js',
      },
      ts: Date.now(),
    };
  },
  IdeiarumClient,
  GuardianClient,
};
