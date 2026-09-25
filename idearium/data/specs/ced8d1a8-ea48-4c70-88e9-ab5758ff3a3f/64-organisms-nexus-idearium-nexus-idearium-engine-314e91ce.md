---
chunk_uuid: 314e91ce-4bbf-447e-b8ad-abb2a370e67a
spec_uuid: ced8d1a8-ea48-4c70-88e9-ab5758ff3a3f
section: organisms-nexus-idearium-nexus-idearium-engine
title: organisms/nexus-idearium/nexus-idearium.engine.js
comp_id: idearium.spec-engine
seam_id: idearium.spec-engine:v1:chunk:ced8d1a8:organisms-nexus-idearium-nexus-idearium-engine
contract_id: spec-contract:ced8d1a8:organisms-nexus-idearium-nexus-idearium-engine:314e91ce
agent: ingest
model: ingest:drop
status: complete
completed_at: 2026-09-25T20:17:11.374Z
---

/* ═══════════════════════════════════════════════════════════
   ORGANISM: IDEARIUM  v1.0.0
   id: eravos.nexus-idearium

   Thin per-system wrapper around NexusNodeCore. All polling,
   diagnose, snapshot, and idearium logic lives in the shared
   core (organisms/nexus-shared/nexus-node-core.js) -- this file
   only supplies this node's identity and endpoint.
   ═══════════════════════════════════════════════════════════ */

window.NexusIdeariumEngine = (() => {
'use strict';

function mount(instanceId, sBus, audio, config = {}) {
  return NexusNodeCore.mount(instanceId, sBus, {
    key: 'idearium',
    label: 'IDEARIUM',
    icon: '💡',
    accent: '#ffaa00',
    base: 'http://127.0.0.1:4800',
    statusPath: '/api/status',
    snapshotsPath: '/snapshots',
    orchestratorBase: 'http://127.0.0.1:9000',
    diagnosePath: '/diagnose',
    idLink: 'http://127.0.0.1:4800',
    isOrchestrator: false,
    ...config,
  });
}

return { mount };
})();